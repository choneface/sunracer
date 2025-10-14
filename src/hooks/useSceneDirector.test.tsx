import { renderHook, act } from "@testing-library/react";
import { useSceneDirector } from "./useSceneDirector";
import type { SceneStep } from "./../components/scenes/SceneTypes";
import {
  directorScript,
  endOnlyScript,
} from "../../test/fixtures/directorScripts";
import { expectAtStep, stepKind } from "../../test/utils/directorAsserts";

describe("useSceneDirector - state machine basics", () => {
  it("initializes at provided start index with empty vars", () => {
    const { result } = renderHook(() => useSceneDirector(directorScript, 0));
    expect(result.current.state.idx).toBe(0);
    expect(result.current.state.vars).toEqual({});
    expect(result.current.current).toEqual<SceneStep>(directorScript[0]);
  });

  it("advance moves linearly through steps", () => {
    const { result } = renderHook(() => useSceneDirector(directorScript, 0));
    act(() => result.current.advance()); // -> 1
    expect(result.current.state.idx).toBe(1);
    expect(result.current.current).toEqual<SceneStep>(directorScript[1]);

    act(() => result.current.advance()); // -> 2
    expect(result.current.state.idx).toBe(2);
    expect(result.current.current).toEqual<SceneStep>(directorScript[2]);
  });

  it("goto jumps to an arbitrary index", () => {
    const { result } = renderHook(() => useSceneDirector(directorScript, 0));
    act(() => result.current.goto(10));
    expect(result.current.state.idx).toBe(10);
    expect(result.current.current).toEqual<SceneStep>(directorScript[10]);
  });

  it("out-of-range goto still exposes synthetic 'end' step via current", () => {
    const { result } = renderHook(() => useSceneDirector(directorScript, 0));
    act(() => result.current.goto(999)); // out of range
    expect(result.current.state.idx).toBe(999);
    // current clamps to 'end' behavior
    expect(stepKind(result.current.current)).toBe("end");
  });

  it("end-only script remains at end; advance is idempotent on current", () => {
    const { result } = renderHook(() => useSceneDirector(endOnlyScript, 0));
    expect(stepKind(result.current.current)).toBe("end");

    act(() => result.current.advance());
    expect(stepKind(result.current.current)).toBe("end");
    // idx may increment, but current remains 'end'
    expect(result.current.state.idx).toBe(1);
  });
});

describe("useSceneDirector - variables & branching", () => {
  it("stores lastResult via setResult", () => {
    const { result } = renderHook(() => useSceneDirector(directorScript, 0));
    act(() => result.current.setResult("win"));
    expect(result.current.state.vars.lastResult).toBe("win");
  });

  it("Blackjack path: win -> branches to 'You won at Blackjack.'", () => {
    const { result } = renderHook(() => useSceneDirector(directorScript, 0));
    // startGame -> await -> branch
    act(() => result.current.goto(2)); // startGame (2)
    act(() => result.current.advance()); // -> await (3)
    act(() => result.current.advance()); // -> branch (4)

    act(() => result.current.setResult("win"));
    act(() => result.current.maybeAutoAdvance()); // resolve branch

    expect(result.current.state.idx).toBe(5); // reducer sets via goto; idx is whatever branch logic chooses
    // After maybeAutoAdvance, we expect to jump to index 5 (win path)
    expect(result.current.current).toEqual<SceneStep>(directorScript[5]);
  });

  it("Blackjack path: lose -> branches to 'You lost at Blackjack.'", () => {
    const { result } = renderHook(() => useSceneDirector(directorScript, 0));
    act(() => result.current.goto(2));
    act(() => result.current.advance()); // -> 3
    act(() => result.current.advance()); // -> 4 (branch)

    act(() => result.current.setResult("lose"));
    act(() => result.current.maybeAutoAdvance());

    expect(result.current.current).toEqual<SceneStep>(directorScript[6]);
  });

  it("Blackjack path: draw -> branches to 'A draw? Boring.'", () => {
    const { result } = renderHook(() => useSceneDirector(directorScript, 0));
    act(() => result.current.goto(2));
    act(() => result.current.advance()); // -> 3
    act(() => result.current.advance()); // -> 4 (branch)

    act(() => result.current.setResult("draw"));
    act(() => result.current.maybeAutoAdvance());

    expect(result.current.current).toEqual<SceneStep>(directorScript[8]);
  });

  it("branchOnResult without matching key falls through to next index", () => {
    const { result } = renderHook(() => useSceneDirector(directorScript, 0));
    act(() => result.current.goto(2));
    act(() => result.current.advance()); // 3
    act(() => result.current.advance()); // 4 branch

    act(() => result.current.setResult("completed")); // not mapped in blackj. branch
    act(() => result.current.maybeAutoAdvance());

    // should fall through to 5 (idx + 1 after branch step)
    expectAtStep(result.current.current, directorScript, 5);
  });

  it("idempotence: maybeAutoAdvance can be called multiple times safely", () => {
    const { result } = renderHook(() => useSceneDirector(directorScript, 0));
    act(() => result.current.goto(2));
    act(() => result.current.advance()); // 3
    act(() => result.current.advance()); // 4 (branch)

    act(() => result.current.setResult("win"));
    act(() => result.current.maybeAutoAdvance());
    const idxAfterFirst = result.current.state.idx;
    const stepAfterFirst = result.current.current;

    // call again—shouldn't jump elsewhere or error
    act(() => result.current.maybeAutoAdvance());
    expect(result.current.state.idx).toBe(idxAfterFirst);
    expect(result.current.current).toEqual(stepAfterFirst);
  });
});

describe("useSceneDirector - choice flow sanity", () => {
  it("navigates via choice by goto(next)", () => {
    const { result } = renderHook(() => useSceneDirector(directorScript, 0));

    // move to choice at index 1
    act(() => result.current.advance());
    expectAtStep(result.current.current, directorScript, 1);

    // choose Shots -> 6
    act(() => result.current.goto(6));
    expectAtStep(result.current.current, directorScript, 6);

    // then goto to shots start (10) later to simulate flow
    act(() => result.current.goto(10));
    expectAtStep(result.current.current, directorScript, 10);
  });

  it("Shots path completes to 'Done with shots.'", () => {
    const { result } = renderHook(() => useSceneDirector(directorScript, 10));
    // at 10: startGame (Shots)
    act(() => result.current.advance()); // 11 await
    act(() => result.current.advance()); // 12 branchOnResult

    act(() => result.current.setResult("completed"));
    act(() => result.current.maybeAutoAdvance());

    expectAtStep(result.current.current, directorScript, 13);
  });
});
