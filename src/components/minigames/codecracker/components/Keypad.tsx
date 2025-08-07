export default function Keypad({
  onDigit,
  onClear,
  onEnter,
  disabled = false,
}: {
  onDigit: (d: string) => void;
  onClear: () => void;
  onEnter: () => void;
  disabled?: boolean;
}) {
  const digits = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["Clear", "0", "Enter"],
  ];
  return (
    <div className="cc-pad">
      {digits.map((row, ri) => (
        <div key={ri} className="cc-row">
          {row.map((cell) => {
            if (cell === "Clear")
              return (
                <button
                  key={cell}
                  className="cc-key"
                  onClick={onClear}
                  disabled={disabled}
                >
                  CLR
                </button>
              );
            if (cell === "Enter")
              return (
                <button
                  key={cell}
                  className="cc-key"
                  onClick={onEnter}
                  disabled={disabled}
                >
                  ↵
                </button>
              );
            return (
              <button
                key={cell}
                className="cc-key"
                onClick={() => onDigit(cell)}
                disabled={disabled}
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
