import type { SceneStep } from "../../src/components/scenes/SceneTypes";

export const directorScript: SceneStep[] = [
  { kind: "say", speaker: "Ivan", text: "Pick a game." }, // 0
  {
    kind: "choice",                                       // 1
    prompt: "Choose:",
    options: [
      { label: "Blackjack", next: 2 },
      { label: "Shots",     next: 6 },
    ],
  },
  { kind: "startGame", game: "Blackjack" },               // 2
  { kind: "awaitGameResult", toVar: "lastResult" },       // 3
  { kind: "branchOnResult", var: "lastResult", nextByResult: { win: 5, lose: 6, draw: 8 } }, // 4 // 4
  { kind: "say", speaker: "Ivan", text: "You won at Blackjack." }, // 5
  { kind: "say", speaker: "Ivan", text: "You lost at Blackjack." },// 6
  { kind: "goto", next: 9 },                               // 7
  { kind: "say", speaker: "Ivan", text: "A draw? Boring." },       // 8
  { kind: "say", speaker: "Ivan", text: "Shots time." },           // 9
  { kind: "startGame", game: "Shots" },                            // 10
  { kind: "awaitGameResult", toVar: "lastResult" },                 // 11
  { kind: "branchOnResult", var: "lastResult", nextByResult: { completed: 13 } }, // 12
  { kind: "say", speaker: "Ivan", text: "Done with shots." },      // 13
  { kind: "end" },                                                 // 14
];

/**
 * A tiny script to test boundary / end behavior.
 */
export const endOnlyScript: SceneStep[] = [
  { kind: "end" }, // 0
];
