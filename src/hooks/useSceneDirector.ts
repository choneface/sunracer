import { useCallback, useReducer } from "react";
import type { SceneStep, SceneState, GameResult } from "./../components/scenes/SceneTypes";

type Action =
  | { type: "ADVANCE" }
  | { type: "GOTO"; next: number }
  | { type: "SET_RESULT"; result: GameResult };

function reduce(script: SceneStep[]) {
  return (state: SceneState, action: Action): SceneState => {
    const cur = script[state.idx] ?? { kind: "end" } as SceneStep;

    switch (action.type) {
      case "ADVANCE": {
        // default linear flow: go to next index
        return { ...state, idx: state.idx + 1 };
      }
      case "GOTO":
        return { ...state, idx: action.next };
      case "SET_RESULT":
        return { ...state, vars: { ...state.vars, lastResult: action.result } };
      default:
        return state;
    }
  };
}

export function useSceneDirector(script: SceneStep[], startIdx = 0) {
  const [state, dispatch] = useReducer(reduce(script), { idx: startIdx, vars: {} });

  const current = script[state.idx] ?? { kind: "end" } as SceneStep;

  const advance = useCallback(() => dispatch({ type: "ADVANCE" }), []);
  const goto = useCallback((next: number) => dispatch({ type: "GOTO", next }), []);
  const setResult = useCallback((result: GameResult) => dispatch({ type: "SET_RESULT", result }), []);

  // helper: if at a branch step, compute next idx immediately
  const maybeAutoAdvance = useCallback(() => {
    const step = script[state.idx];
    if (!step) return;

    if (step.kind === "branchOnResult") {
      const res = state.vars[step.var];
      const next = (res && step.nextByResult[res]) ?? state.idx + 1;
      dispatch({ type: "GOTO", next: next! });
    }
  }, [script, state.idx, state.vars]);

  return { state, current, advance, goto, setResult, maybeAutoAdvance };
}
