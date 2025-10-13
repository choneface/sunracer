// sceneTypes.ts
export type Speaker = "Ivan" | "Player" | "Narrator";
export type GameId = "Blackjack" | "Shots";

export type GameResult = "win" | "lose" | "draw" | "completed";

export type SceneStep =
  | { kind: "say"; speaker: Speaker; text: string }
  | { kind: "choice"; prompt: string; options: { label: string; next: number }[] }
  | { kind: "startGame"; game: GameId }                 // render game in middle, then go to next
  | { kind: "awaitGameResult"; toVar: "lastResult" }    // wait for onFinish(...) from the game
  | { kind: "branchOnResult"; var: "lastResult"; nextByResult: Partial<Record<GameResult, number>> }
  | { kind: "goto"; next: number }
  | { kind: "end" };

export interface SceneVars {
  lastResult?: GameResult;
}

export interface SceneState {
  idx: number;      // index into script
  vars: SceneVars;  // scratch variables
}
