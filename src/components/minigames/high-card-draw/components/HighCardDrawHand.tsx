import BlackjackCard, { type Face } from "../../blackjack/components/BlackjackCard";

export default function HighCardDrawHand({
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
  const slots = [0];
  return (
    <div className={`hcd-hand ${top ? "hcd-hand-top" : ""}`}>
      <div className="hcd-title">{title}</div>

      {bustFlash && <div className="hcd-bust">Bust!</div>}

      <div className="hcd-cards">
        {slots.map((i) => {
          const card = cards[i];
          if (card) {
            return <BlackjackCard key={i} face={card} />;
          }
          if (!card && spinning) {
            return <BlackjackCard key={i} face={spinning} spinning />;
          }
          // blank slot
          return <BlackjackCard key={i} blank />;
        })}
      </div>
    </div>
  );
}
