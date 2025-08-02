import { useCallback, useEffect, useRef, useState } from "react";
import CenteredOverlay from "../dice-game/components/CenteredOverlay";
import RoundCircles from "./components/RoundedCircles";
import DigitBoxes from "./components/DigitBoxes";
import Numpad from "./components/Numpad";
import LoadingDots from "./components/LoadingDots";
import "./Keypad.css";

type Phase = "READY" | "SPINNING" | "SHOWING" | "INPUT" | "WIN" | "LOSE";

const DIGITS = 5;
const ROUNDS_TO_WIN = 3;
const SPIN_MS = 2000;
const SHOW_MS = 750;

export default function KeypadGame() {
  const [phase, setPhase] = useState<Phase>("READY");
  const [round, setRound] = useState(0); // 0..3 filled
  const [target, setTarget] = useState<number[]>([]);
  const [displayDigits, setDisplayDigits] = useState<(number | null)[]>(
    Array(DIGITS).fill(null),
  );
  const [inputDigits, setInputDigits] = useState<number[]>([]);

  const spinTimerRef = useRef<number | null>(null);
  const spinTickRef = useRef<number | null>(null);
  const showTimerRef = useRef<number | null>(null);

  const canStart = phase === "READY";

  const startRound = useCallback(() => {
    if (!canStart) return;

    // Reset visuals for a fresh round
    setInputDigits([]);
    setTarget([]);
    setDisplayDigits(Array(DIGITS).fill(null));
    setPhase("SPINNING");

    // Spin: update boxes with random digits every 100ms for 2s
    const tick = () => {
      setDisplayDigits((prev) =>
        prev.map(() => Math.floor(Math.random() * 10)),
      );
      spinTickRef.current = window.setTimeout(tick, 100);
    };
    tick();

    spinTimerRef.current = window.setTimeout(() => {
      // Stop spin
      if (spinTickRef.current) {
        window.clearTimeout(spinTickRef.current);
        spinTickRef.current = null;
      }

      // Generate target, show it for SHOW_MS, then clear and go to INPUT
      const t = Array.from({ length: DIGITS }, () =>
        Math.floor(Math.random() * 10),
      );
      setTarget(t);
      setDisplayDigits(t);
      setPhase("SHOWING");

      showTimerRef.current = window.setTimeout(() => {
        setDisplayDigits(Array(DIGITS).fill(null));
        setPhase("INPUT");
      }, SHOW_MS);
    }, SPIN_MS);
  }, [canStart]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (spinTimerRef.current) window.clearTimeout(spinTimerRef.current);
      if (spinTickRef.current) window.clearTimeout(spinTickRef.current);
      if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
    };
  }, []);

  // Handle keypad clicks during INPUT phase
  const onDigit = useCallback(
    (d: number) => {
      if (phase !== "INPUT") return;
      setInputDigits((prev) => {
        if (prev.length >= DIGITS) return prev;
        const next = [...prev, d];
        setDisplayDigits((boxes) =>
          boxes.map((v, i) => (i < next.length ? next[i] : null)),
        );
        return next;
      });
    },
    [phase],
  );

  const onBackspace = useCallback(() => {
    if (phase !== "INPUT") return;
    setInputDigits((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.slice(0, -1);
      setDisplayDigits((boxes) =>
        boxes.map((v, i) => (i < next.length ? next[i] : null)),
      );
      return next;
    });
  }, [phase]);

  const onClear = useCallback(() => {
    if (phase !== "INPUT") return;
    setInputDigits([]);
    setDisplayDigits(Array(DIGITS).fill(null));
  }, [phase]);

  // Evaluate once 5 digits entered
  useEffect(() => {
    if (phase !== "INPUT") return;
    if (inputDigits.length !== DIGITS) return;

    const correct = inputDigits.every((d, i) => d === target[i]);
    if (!correct) {
      setPhase("LOSE");
      return;
    }

    // Correct: advance rounds
    setRound((r) => {
      const next = r + 1;
      if (next >= ROUNDS_TO_WIN) {
        setPhase("WIN");
      } else {
        // Prepare for next round
        setPhase("READY");
        setInputDigits([]);
        setDisplayDigits(Array(DIGITS).fill(null));
        setTarget([]);
      }
      return next;
    });
  }, [inputDigits, phase, target]);

  // R to reset after win/lose
  const resetGame = useCallback(() => {
    setPhase("READY");
    setRound(0);
    setTarget([]);
    setInputDigits([]);
    setDisplayDigits(Array(DIGITS).fill(null));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (phase === "WIN" || phase === "LOSE") &&
        (e.key === "r" || e.key === "R")
      ) {
        resetGame();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, resetGame]);

  return (
    <div
      className="panel"
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      {/* Top status: rounds */}
      <div className="panel" style={{ margin: 0, marginBottom: "0.75rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <strong>Round:</strong> {round} / {ROUNDS_TO_WIN}
          </div>
          <RoundCircles total={ROUNDS_TO_WIN} filled={round} />
          <div style={{ width: "4ch" }} />
        </div>
      </div>

      {/* End screens */}
      {phase === "LOSE" && (
        <CenteredOverlay title="You Lose!" subtitle="Retry with R" />
      )}
      {phase === "WIN" && (
        <CenteredOverlay title="You Win!" subtitle="Reset with R" />
      )}

      {/* Main content */}
      {phase !== "WIN" && phase !== "LOSE" && (
        <>
          {/* Digit boxes (spin/show/input) */}
          <div className="panel" style={{ marginBottom: "0.75rem" }}>
            <DigitBoxes
              values={displayDigits}
              highlight={phase === "SHOWING"}
            />
          </div>

          {/* Control area */}
          <div className="panel" style={{ marginTop: 0 }}>
            {phase === "READY" && (
              <button
                type="button"
                className="choice kp-start-btn"
                onClick={startRound}
              >
                Start
              </button>
            )}

            {phase === "SPINNING" && (
              <div className="kp-loading">
                Loading
                <LoadingDots intervalMs={350} />
              </div>
            )}

            {phase === "INPUT" && (
              <Numpad
                onDigit={onDigit}
                onBackspace={onBackspace}
                onClear={onClear}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
