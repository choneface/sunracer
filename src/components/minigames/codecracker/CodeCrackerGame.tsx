import { useCallback, useEffect, useRef, useState } from "react";
import CenteredOverlay from "../dice-game/components/CenteredOverlay";
import StartButtonInfoModal from "../shared/StartButtonInfoModal";
import GuessLog from "./components/GuessLog";
import Keypad from "./components/Keypad";
import "./codeCracker.css";

const CODE_LENGTH = 4;
const MAX_ATTEMPTS = 8;

type GuessEntry = {
  id: number;
  guess: string;
  feedback: string; // e.g. "++??"
};

function generateSecret(): string {
  let s = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    s += Math.floor(Math.random() * 10).toString();
  }
  return s;
}

function computeFeedback(secret: string, guess: string): string {
  const secretArr = secret.split("");
  const guessArr = guess.split("");
  const exactMask = Array(CODE_LENGTH).fill(false);
  const usedSecret = Array(CODE_LENGTH).fill(false);
  let pluses = 0;
  let questions = 0;

  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guessArr[i] === secretArr[i]) {
      pluses++;
      exactMask[i] = true;
      usedSecret[i] = true;
    }
  }

  for (let i = 0; i < CODE_LENGTH; i++) {
    if (exactMask[i]) continue;
    for (let j = 0; j < CODE_LENGTH; j++) {
      if (usedSecret[j]) continue;
      if (i === j) continue;
      if (guessArr[i] === secretArr[j]) {
        questions++;
        usedSecret[j] = true;
        break;
      }
    }
  }

  return "+".repeat(pluses) + "?".repeat(questions);
}

export default function CodeCrackerGame() {
  const [started, setStarted] = useState(false);
  const [secret, setSecret] = useState<string>(() => generateSecret());
  const [guesses, setGuesses] = useState<GuessEntry[]>([]);
  const [current, setCurrent] = useState<string>(""); // typed / keypad
  const [status, setStatus] = useState<"PLAY" | "WIN" | "LOSE">("PLAY");
  const nextId = useRef(1);
  const [highlightId, setHighlightId] = useState<number | null>(null);

  const attemptsUsed = guesses.length;
  const isGameOver = status !== "PLAY";

  const reset = useCallback(() => {
    setSecret(generateSecret());
    setGuesses([]);
    setCurrent("");
    setStatus("PLAY");
    setHighlightId(null);
    setStarted(false);
  }, []);

  const submitGuess = useCallback(() => {
    if (status !== "PLAY") return;
    if (current.length !== CODE_LENGTH) return;
    if (attemptsUsed >= MAX_ATTEMPTS) return;

    const feedback = computeFeedback(secret, current);
    const id = nextId.current++;
    const entry: GuessEntry = { id, guess: current, feedback };
    setGuesses((prev) => [...prev, entry]);
    setHighlightId(id);
    setCurrent("");

    setTimeout(() => setHighlightId(null), 800);

    if (current === secret) {
      setStatus("WIN");
      return;
    }
    if (attemptsUsed + 1 >= MAX_ATTEMPTS) {
      setStatus("LOSE");
    }
  }, [current, secret, status, attemptsUsed]);

  // Keyboard input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isGameOver && (e.key === "r" || e.key === "R")) {
        reset();
        return;
      }
      if (status !== "PLAY") return;

      if (/^[0-9]$/.test(e.key)) {
        setCurrent((c) => (c.length < CODE_LENGTH ? c + e.key : c));
      } else if (e.key === "Backspace") {
        setCurrent((c) => c.slice(0, -1));
      } else if (e.key === "Enter") {
        submitGuess();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, isGameOver, reset, submitGuess]);

  const onDigit = useCallback(
    (d: string) => {
      if (status !== "PLAY") return;
      setCurrent((c) => (c.length < CODE_LENGTH ? c + d : c));
    },
    [status],
  );
  const onClear = useCallback(() => {
    if (status !== "PLAY") return;
    setCurrent("");
  }, [status]);
  const onEnter = useCallback(() => {
    submitGuess();
  }, [submitGuess]);

  const instructions = (
    <>
      <p>
        Guess the secret {CODE_LENGTH}-digit code within {MAX_ATTEMPTS}{" "}
        attempts.
      </p>
      <ul>
        <li>
          After each guess you get feedback: <strong>+</strong> is correct digit
          in correct position, <strong>?</strong> is correct digit wrong place.
        </li>
        <li>Use the keypad or type digits; press Enter to submit.</li>
        <li>
          Win by exact match. Lose if you exhaust attempts. Press R to retry.
        </li>
      </ul>
    </>
  );

  return (
    <div
      className="panel codecracker-panel"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {!started && (
        <StartButtonInfoModal
          title="Code Cracker"
          instructions={instructions}
          onStart={() => setStarted(true)}
        />
      )}

      {started && status === "PLAY" && (
        <div className="codecracker-grid" style={{ flex: 1 }}>
          {/* Left: log */}
          <div className="codecracker-col log-col scene-column">
            <div className="panel" style={{ marginBottom: "0.5rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div style={{ fontWeight: 700 }}>Code Cracker</div>
                <div className="attempts">
                  Attempts: {attemptsUsed}/{MAX_ATTEMPTS}
                </div>
              </div>
            </div>
            <div className="log-wrapper">
              <GuessLog entries={guesses} highlightId={highlightId} />
            </div>
          </div>

          {/* Right: input */}
          <div className="codecracker-col input-col scene-column">
            <div className="panel" style={{ marginBottom: "0.5rem" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
                Current
              </div>
              <div className="cc-input-boxes">
                {Array.from({ length: CODE_LENGTH }, (_, i) => (
                  <div key={i} className="cc-box">
                    {current[i] ?? ""}
                  </div>
                ))}
              </div>
            </div>
            <div className="panel" style={{ flex: 1 }}>
              <Keypad
                onDigit={onDigit}
                onClear={onClear}
                onEnter={onEnter}
                disabled={status !== "PLAY"}
              />
            </div>
          </div>
        </div>
      )}

      {/* Overlays */}
      {status === "WIN" && (
        <CenteredOverlay
          title="You Win!"
          subtitle={`Code: ${secret} · Retry with R`}
        />
      )}
      {status === "LOSE" && (
        <CenteredOverlay
          title="You Lose!"
          subtitle={`Secret: ${secret} · Retry with R`}
        />
      )}
    </div>
  );
}
