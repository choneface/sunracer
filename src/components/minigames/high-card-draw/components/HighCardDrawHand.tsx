import HighCardDrawCard, {
  type Face,
} from "./HighCardDrawCard.tsx";

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
            return <HighCardDrawCard key={i} face={card} />;
          }
          if (!card && spinning) {
            return <HighCardDrawCard key={i} face={spinning} spinning />;
          }
          // blank slot
          return <HighCardDrawCard key={i} blank />;
        })}
      </div>
    </div>
  );
}
