import type { SceneStep } from "../../src/components/scenes/SceneTypes";

export function expectAtStep(
  current: SceneStep,
  script: SceneStep[],
  index: number,
) {
  // When index is out of range, current should be the synthetic "end" step
  if (index < 0 || index >= script.length) {
    expect(current.kind).toBe("end");
    return;
  }
  expect(current).toEqual(script[index]);
}

export function stepKind(step: SceneStep) {
  return step.kind;
}
