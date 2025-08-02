import { useState } from "react";

export function GuessNumber() {
  const [secret] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [guess, setGuess] = useState("");
  const [msg, setMsg] = useState("Pick 1-10");
  return (
    <div>
      <p>{msg}</p>
      <input
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        className="choice"
        style={{
          background: "transparent",
          border: "1px solid #fff",
          color: "#fff",
          fontFamily: "inherit",
        }}
      />
      <button
        className="choice"
        onClick={() => {
          const n = Number(guess);
          if (Number.isNaN(n)) return setMsg("Enter a number 1-10");
          setMsg(
            n === secret ? "Correct!" : n < secret ? "Too low" : "Too high",
          );
        }}
      >
        Guess
      </button>
    </div>
  );
}
