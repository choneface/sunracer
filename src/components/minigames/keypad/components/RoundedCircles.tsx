export default function RoundCircles({
  total,
  filled,
}: {
  total: number;
  filled: number;
}) {
  return (
    <div className="kp-circles" aria-label={`Rounds ${filled} of ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const isFilled = i < filled;
        return (
          <span
            key={i}
            className={`kp-circle ${isFilled ? "filled" : "empty"}`}
          />
        );
      })}
    </div>
  );
}
