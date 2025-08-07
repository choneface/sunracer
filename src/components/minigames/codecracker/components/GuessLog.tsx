type Entry = {
  id: number;
  guess: string;
  feedback: string;
};

export default function GuessLog({
  entries,
  highlightId,
}: {
  entries: Entry[];
  highlightId: number | null;
}) {
  return (
    <div className="guess-log">
      {entries.map((e, idx) => (
        <div key={e.id} className="guess-row">
          <div className="guess-index">{idx + 1}.</div>
          <div className="guess-code">{e.guess}</div>
          <div className="guess-feedback">
            {Array.from(e.feedback).map((ch, i) => (
              <span
                key={i}
                className={`feedback-symbol ${ch === "+" ? "plus" : "question"} ${
                  highlightId === e.id ? "blink" : ""
                }`}
              >
                {ch}
              </span>
            ))}
          </div>
        </div>
      ))}
      {entries.length === 0 && (
        <div className="empty-log">Make a guess to start.</div>
      )}
    </div>
  );
}
