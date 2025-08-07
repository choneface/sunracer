export default function Numpad({
  onDigit,
  onBackspace,
  onClear,
}: {
  onDigit: (d: number) => void;
  onBackspace: () => void;
  onClear: () => void;
}) {
  const rows = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ["CLR", 0, "⌫"],
  ] as const;

  return (
    <div className="kp-pad" role="group" aria-label="numeric keypad">
      {rows.map((row, i) => (
        <div key={i} className="kp-row">
          {row.map((cell, j) => {
            if (cell === "CLR") {
              return (
                <button
                  key={j}
                  type="button"
                  className="kp-key"
                  onClick={onClear}
                >
                  CLR
                </button>
              );
            }
            if (cell === "⌫") {
              return (
                <button
                  key={j}
                  type="button"
                  className="kp-key"
                  onClick={onBackspace}
                >
                  ⌫
                </button>
              );
            }
            return (
              <button
                key={j}
                type="button"
                className="kp-key"
                onClick={() => onDigit(cell as number)}
              >
                {cell}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
