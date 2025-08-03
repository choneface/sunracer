export default function BlackjackControls({
  canHit,
  onHit,
  onStand,
}: {
  canHit: boolean;
  onHit: () => void;
  onStand: () => void;
}) {
  return (
    <div className="bj-controls">
      <button
        type="button"
        className="choice bj-btn"
        onClick={onHit}
        disabled={!canHit}
      >
        Hit
      </button>
      <button type="button" className="choice bj-btn" onClick={onStand}>
        Stand
      </button>
    </div>
  );
}
