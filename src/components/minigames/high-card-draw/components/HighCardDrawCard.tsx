export const RANKS = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
] as const;
export type Rank = (typeof RANKS)[number];
export const SUITS = ["♠", "♥", "♦", "♣"] as const;
export type Suit = (typeof SUITS)[number];

export type Face = { rank: Rank; suit: Suit };

export default function HighCardDrawCard({
  face,
  blank = false,
  spinning = false,
}: {
  face?: Face;
  blank?: boolean;
  spinning?: boolean;
}) {
  const content = blank ? null : (face ?? null);
  return (
    <div className={`hcd-card ${spinning ? "hcd-card-spin" : ""}`}>
      {!blank && content && (
        <div
          className={`hcd-corner ${content.suit === "♥" || content.suit === "♦" ? "red" : ""}`}
        >
          <div className="hcd-rank">{content.rank}</div>
          <div className="hcd-suit">{content.suit}</div>
        </div>
      )}
    </div>
  );
}
