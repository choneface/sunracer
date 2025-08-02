type BetDir = "OVER" | "UNDER";

export default function BetSummary({
  betDir,
  threshold,
}: {
  betDir: BetDir | null;
  threshold: number | "";
}) {
  if (betDir === null || threshold === "") return null;
  const n = threshold as number;

  const your = betDir === "OVER" ? 13 - n : n; // inclusive with threshold
  const other = 12 - your;

  return (
    <div style={{ marginTop: "0.5rem", opacity: 0.9 }}>
      <div>
        <strong>Bet:</strong> {betDir === "OVER" ? "Over" : "Under"} {n}
      </div>
      <div>
        <strong>Your side size:</strong> {your} &nbsp;|&nbsp;{" "}
        <strong>Other side size:</strong> {other}
      </div>
      <div>
        Win: +{other * 10} pts &nbsp;•&nbsp; Loss: -{your * 10} pts
      </div>
      <div style={{ fontSize: "0.85rem" }}>
        Note: equality counts as a loss.
      </div>
    </div>
  );
}
