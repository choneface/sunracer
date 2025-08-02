export default function Cell({
  revealed,
  isBomb,
  adjacent,
  onReveal,
}: {
  revealed: boolean;
  isBomb: boolean;
  adjacent: number;
  onReveal: () => void;
}) {
  const content = revealed
    ? isBomb
      ? "💣"
      : adjacent === 0
        ? ""
        : String(adjacent)
    : "";

  return (
    <button
      type="button"
      className={`ms-cell ${revealed ? "revealed" : ""}`}
      onClick={onReveal}
      disabled={revealed}
      aria-label={
        revealed ? (isBomb ? "Bomb" : `Revealed ${adjacent}`) : "Hidden cell"
      }
    >
      {content}
    </button>
  );
}
