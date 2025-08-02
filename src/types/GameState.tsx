export type Morale = "High" | "Steady" | "Low";

export interface GameState {
  supplies: number;
  fuel: number;
  morale: Morale;
}
