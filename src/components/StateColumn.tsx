import type { GameState } from "../types/GameState";
import "./StateColumn.css";

interface Props {
  state: GameState;
}

export default function StateColumn({ state }: Props) {
  const { supplies, fuel, morale } = state;

  return (
    <div className="state-box">
      <header className="state-title">Journal</header>
      <dl className="state-list">
        <dt>Supplies</dt>
        <dd>{supplies}</dd>

        <dt>Fuel</dt>
        <dd>{fuel}</dd>

        <dt>Morale</dt>
        <dd>{morale}</dd>
      </dl>
    </div>
  );
}
