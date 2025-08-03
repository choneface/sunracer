import { useCallback, useEffect, useMemo, useState } from "react";
import "./DiceGame.css";
import DiceBox from "./components/DiceBox";
import CenteredOverlay from "./components/CenteredOverlay";
import BetSummary from "./components/BetSummary";
import StartButtonInfoModal from "../shared/StartButtonInfoModal";

/** Game constants */
const ROUND_ROLL_DURATION_MS = 1500;
const FEEDBACK_DURATION_MS = 500;
const START_TIME_SEC = 60;
const WIN_SCORE = 100;

type BetDir = "OVER" | "UNDER";
type Phase = "READY" | "ROLLING" | "RESULT" | "WIN" | "LOSE";

export default function DiceGame() {
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(START_TIME_SEC);
  const [phase, setPhase] = useState<Phase>("READY");

  const [threshold, setThreshold] = useState<number | "">(7);
  const [betDir, setBetDir] = useState<BetDir | null>(null);

  const [die1, setDie1] = useState<number | null>(null);
  const [die2, setDie2] = useState<number | null>(null);
  const [sum, setSum] = useState<number | null>(null);

  const [feedback, setFeedback] = useState<"Correct!" | "Wrong!" | "">("");

  // Timer (paused until start)
  useEffect(() => {
    if (!started || phase === "WIN" || phase === "LOSE") return;
    if (timeLeft <= 0) {
      setPhase("LOSE");
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, phase, started]);

  // Can start a round?
  const canStart = useMemo(() => {
    const n = typeof threshold === "number" ? threshold : NaN;
    return (
      phase === "READY" &&
      betDir !== null &&
      Number.isInteger(n) &&
      n >= 1 &&
      n <= 12
    );
  }, [phase, betDir, threshold]);

  const rollDie = () => Math.floor(Math.random() * 6) + 1;
  const isWin = (s: number, dir: BetDir, n: number) =>
    dir === "OVER" ? s > n : s < n;

  // Side sizes (inclusive with threshold as per your example)
  const sideSizes = (dir: BetDir, n: number) => {
    const your = dir === "OVER" ? 13 - n : n;
    const other = 12 - your;
    return { your, other };
  };

  // Main round
  const startRound = useCallback(() => {
    if (!canStart) return;
    const n = threshold as number;

    setPhase("ROLLING");
    setFeedback("");
    setDie1(null);
    setDie2(null);
    setSum(null);

    const start = performance.now();
    let animId = 0;

    const animate = (t: number) => {
      if (t - start < ROUND_ROLL_DURATION_MS) {
        setDie1(rollDie());
        setDie2(rollDie());
        animId = window.setTimeout(() => animate(performance.now()), 100);
      } else {
        const final1 = rollDie();
        const final2 = rollDie();
        const s = final1 + final2;
        setDie1(final1);
        setDie2(final2);
        setSum(s);

        const win = isWin(s, betDir!, n);
        const { your, other } = sideSizes(betDir!, n);
        const delta = win ? other * 10 : your * 10 * -1;

        setScore((prev) => {
          const next = prev + delta;
          setFeedback(win ? "Correct!" : "Wrong!");
          setPhase("RESULT");

          setTimeout(() => {
            setFeedback("");
            if (next >= WIN_SCORE) setPhase("WIN");
            else if (timeLeft <= 0) setPhase("LOSE");
            else setPhase("READY");
          }, FEEDBACK_DURATION_MS);

          return next;
        });
      }
    };

    animate(performance.now());
    return () => clearTimeout(animId);
  }, [betDir, canStart, threshold, timeLeft]);

  const resetGame = useCallback(() => {
    setScore(0);
    setTimeLeft(START_TIME_SEC);
    setPhase("READY");
    setThreshold(7);
    setBetDir(null);
    setDie1(null);
    setDie2(null);
    setSum(null);
    setFeedback("");
    setStarted(false);
  }, []);

  // R to reset after win/lose
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

  const inputsDisabled =
    phase === "ROLLING" ||
    phase === "RESULT" ||
    phase === "WIN" ||
    phase === "LOSE" ||
    !started;

  // Instructions for the modal
  const instructions = (
    <>
      <p>Pick a number between 1 and 12 and choose Over or Under.</p>
      <p>
        Two dice will roll. If your bet is correct you gain (other side size) ×
        10 points; if wrong you lose (your side size) × 10. The goal is to reach{" "}
        <strong>{WIN_SCORE}</strong> points within {START_TIME_SEC} seconds.
      </p>
      <p>Use the form below to place bets. Pressing Roll starts each round.</p>
      <p>Press R after win/lose to reset.</p>
    </>
  );

  return (
    <div
      className="panel"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {!started && (
        <StartButtonInfoModal
          title="Dice Game"
          instructions={instructions}
          onStart={() => setStarted(true)}
        />
      )}

      {/* Score / Timer */}
      <div className="panel" style={{ margin: 0, marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <strong>Score:</strong> {score}
          </div>
          <div>
            <strong>Time:</strong> {timeLeft}s
          </div>
          <div>
            <strong>Goal:</strong> {WIN_SCORE}
          </div>
        </div>
      </div>

      {/* End states */}
      {phase === "LOSE" && (
        <CenteredOverlay title="You Lose!" subtitle="Retry with R" />
      )}
      {phase === "WIN" && (
        <CenteredOverlay title="You Win!" subtitle="Reset with R" />
      )}

      {/* Live game */}
      {phase !== "WIN" && phase !== "LOSE" && (
        <>
          {/* Feedback */}
          <div
            style={{
              minHeight: "1.5rem",
              textAlign: "center",
              marginBottom: "0.25rem",
            }}
          >
            {feedback && <span style={{ fontWeight: 700 }}>{feedback}</span>}
          </div>

          {/* Dice view */}
          <div className="panel" style={{ flex: "0 0 auto" }}>
            <div className="dice-grid">
              <DiceBox
                label="DIE 1"
                value={die1}
                rolling={phase === "ROLLING"}
              />
              <DiceBox
                label="DIE 2"
                value={die2}
                rolling={phase === "ROLLING"}
              />
              <DiceBox label="Sum" value={sum} rolling={false} />
            </div>
          </div>

          {/* Inputs */}
          <div className="panel" style={{ marginTop: "0.75rem" }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                startRound();
              }}
              style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                Number (1–12):
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={threshold === "" ? "" : threshold}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "") setThreshold("");
                    else setThreshold(Math.max(1, Math.min(12, Number(v))));
                  }}
                  disabled={inputsDisabled}
                  className="dg-input"
                />
              </label>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="choice"
                  disabled={inputsDisabled}
                  onClick={() => setBetDir("UNDER")}
                  aria-pressed={betDir === "UNDER"}
                >
                  Under
                </button>
                <button
                  type="button"
                  className="choice"
                  disabled={inputsDisabled}
                  onClick={() => setBetDir("OVER")}
                  aria-pressed={betDir === "OVER"}
                >
                  Over
                </button>
              </div>

              <button
                type="submit"
                className="choice"
                disabled={!canStart || !started}
                title={
                  !canStart ? "Pick a number 1–12 and Over/Under" : "Roll!"
                }
              >
                Roll
              </button>
            </form>

            <BetSummary betDir={betDir} threshold={threshold} />
          </div>
        </>
      )}
    </div>
  );
}
