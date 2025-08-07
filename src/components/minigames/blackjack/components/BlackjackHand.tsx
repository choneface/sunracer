import BlackjackCard, { type Face } from "./BlackjackCard";

export default function BlackjackHand({
  title,
  cards,
  spinning,
  bustFlash,
  top,
}: {
  title: string;
  cards: Face[];
  spinning: Face | null;
  bustFlash?: boolean;
  top?: boolean; // styles top section slightly differently if needed
}) {
  // Show up to 3 slots; initial blank when empty.
  const slots = [0, 1, 2];
  return (
    <div className={`bj-hand ${top ? "bj-hand-top" : ""}`}>
      <div className="bj-title">{title}</div>

      {bustFlash && <div className="bj-bust">Bust!</div>}

      <div className="bj-cards">
        {slots.map((i) => {
          const card = cards[i];
          if (card) {
            return <BlackjackCard key={i} face={card} />;
          }
          if (!card && i === cards.length && spinning) {
            return <BlackjackCard key={i} face={spinning} spinning />;
          }
          // blank slot
          return <BlackjackCard key={i} blank />;
        })}
      </div>
    </div>
  );
}
