import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CenteredOverlay from "../dice-game/components/CenteredOverlay";
import StartButtonInfoModal from "../shared/StartButtonInfoModal";
import "./SnowfallGame.css";

const TYPED_LETTER_SCORE_INCREMENT = 10;
const INCORRECT_LETTER_DEDUCTION = 20;
const TICK_MS = 600; // how fast letters fall (ms)
const GAME_DURATION_SEC = 60;
const LETTER_SPAWN_CHANCE_PER_COLUMN = 0.35; // per tick, per column if top empty
const COLUMNS = 5;
const ROWS = 6; // visible rows (0..5)

const LETTERS = "abcdefghijklmnoprstuvwxyz"; // exclude 'q'

type FallingLetter = {
  id: number;
  letter: string;
  col: number; // 0..COLUMNS-1
  row: number; // 0..ROWS-1
};

type HeaderFlash = {
  delta: number; // negative for incorrect
  expiresAt: number; // timestamp ms when to clear
};

export default function SnowfallGame() {
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SEC);
  const [letters, setLetters] = useState<FallingLetter[]>([]);
  const [correctFlashes, setCorrectFlashes] = useState<
    Array<{ id: number; col: number; row: number; text: string }>
  >([]);
  const [headerFlash, setHeaderFlash] = useState<HeaderFlash | null>(null);
  const tickRef = useRef<number | null>(null);
  const nextLetterId = useRef(1);

  const gameOver = useMemo(() => started && timeLeft <= 0, [timeLeft, started]);

  // Start game
  const start = useCallback(() => {
    setStarted(true);
    setScore(0);
    setTimeLeft(GAME_DURATION_SEC);
    setLetters([]);
    setCorrectFlashes([]);
    setHeaderFlash(null);
    nextLetterId.current = 1;
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!started || gameOver) return;
    const interval = window.setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [started, gameOver]);

  // Falling tick
  useEffect(() => {
    if (!started || gameOver) return;

    const tick = () => {
      setLetters((prev) => {
        // move letters down
        const moved = prev
          .map((l) => ({ ...l, row: l.row + 1 }))
          .filter((l) => l.row < ROWS); // drop beyond bottom

        // spawn logic: per column, if no letter at row 0 in that column
        for (let col = 0; col < COLUMNS; col++) {
          const hasTop = moved.some((l) => l.col === col && l.row === 0);
          if (!hasTop && Math.random() < LETTER_SPAWN_CHANCE_PER_COLUMN) {
            moved.push({
              id: nextLetterId.current++,
              letter: LETTERS[Math.floor(Math.random() * LETTERS.length)],
              col,
              row: 0,
            });
          }
        }

        return moved;
      });
    };

    tickRef.current = window.setInterval(tick, TICK_MS);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [started, gameOver]);

  // Header flash clearing
  useEffect(() => {
    if (!headerFlash) return;
    const now = performance.now();
    const remaining = headerFlash.expiresAt - now;
    if (remaining <= 0) {
      setHeaderFlash(null);
      return;
    }
    const tm = window.setTimeout(() => setHeaderFlash(null), remaining);
    return () => clearTimeout(tm);
  }, [headerFlash]);

  // Key handling
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (!started) return;
      if (gameOver) {
        if (e.key.toLowerCase() === "r") {
          start();
        }
        return;
      }
      const k = e.key.toLowerCase();
      if (!/^[a-z]$/.test(k)) return;

      setLetters((prev) => {
        // find any letter matching k; choose the one closest to bottom
        const candidates = prev.filter((l) => l.letter === k);
        if (candidates.length === 0) {
          setScore((s) => s - INCORRECT_LETTER_DEDUCTION);
          setHeaderFlash({
            delta: -INCORRECT_LETTER_DEDUCTION,
            expiresAt: performance.now() + 500,
          });
          return prev;
        }

        const target = candidates.reduce((a, b) => (a.row >= b.row ? a : b));
        setScore((s) => s + TYPED_LETTER_SCORE_INCREMENT);
        setCorrectFlashes((cf) => [
          ...cf,
          {
            id: target.id,
            col: target.col,
            row: target.row,
            text: `+${TYPED_LETTER_SCORE_INCREMENT}`,
          },
        ]);
        return prev.filter((l) => l.id !== target.id);
      });
    },
    [gameOver, start, started],
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  // Clear individual correct flashes after brief time
  useEffect(() => {
    if (correctFlashes.length === 0) return;
    const timers = correctFlashes.map((f) =>
      window.setTimeout(() => {
        setCorrectFlashes((prev) => prev.filter((p) => p.id !== f.id));
      }, 100),
    );
    return () => timers.forEach((t) => clearTimeout(t));
  }, [correctFlashes]);

  // Reset from overlay (R)
  useEffect(() => {
    const onKeyR = (e: KeyboardEvent) => {
      if (gameOver && (e.key === "r" || e.key === "R")) {
        start();
      }
    };
    window.addEventListener("keydown", onKeyR);
    return () => window.removeEventListener("keydown", onKeyR);
  }, [gameOver, start]);

  // derived display score (header flash overrides temporarily)
  const displayScore = useMemo(() => {
    if (headerFlash) {
      return headerFlash.delta > 0
        ? `+${headerFlash.delta}`
        : `${headerFlash.delta}`;
    }
    return `${score}`;
  }, [score, headerFlash]);

  const instructions = (
    <>
      <p>
        Type letters that are currently visible before they fall off the bottom.
      </p>
      <ul>
        <li>Letters trickle down 5 columns; each tick they move one row.</li>
        <li>
          Type any lowercase letter; if it exists on screen you get +
          {TYPED_LETTER_SCORE_INCREMENT} (closest to bottom is consumed).
        </li>
        <li>
          If the letter isn't present you lose -{INCORRECT_LETTER_DEDUCTION} and
          the header briefly shows that deduction.
        </li>
        <li>
          Letters that pass the bottom disappear. Play for {GAME_DURATION_SEC}{" "}
          seconds.
        </li>
        <li>Press R after time is up to reset.</li>
      </ul>
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
      {/* Start modal */}
      {!started && (
        <StartButtonInfoModal
          title="Snowfall"
          instructions={instructions}
          onStart={start}
        />
      )}

      {!gameOver && (
        <>
          {/* Header */}
          <div className="panel" style={{ margin: 0, marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <strong>Score:</strong> {displayScore}
              </div>
              <div>
                <strong>Time:</strong> {started ? timeLeft : GAME_DURATION_SEC}s
              </div>
              <div style={{ width: "4ch" }} />
            </div>
          </div>

          {/* Centered grid view */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div className="sf-viewbox">
              <div className="sf-grid">
                {Array.from({ length: ROWS }).map((_, rowIdx) =>
                  Array.from({ length: COLUMNS }).map((_, colIdx) => {
                    const letterObj = letters.find(
                      (l) => l.col === colIdx && l.row === rowIdx,
                    );
                    const flashHere = correctFlashes.find(
                      (f) => f.col === colIdx && f.row === rowIdx,
                    );
                    return (
                      <div
                        key={`cell-${rowIdx}-${colIdx}`}
                        className="sf-cell"
                        aria-label={
                          letterObj
                            ? `Letter ${letterObj.letter} at column ${colIdx + 1}, row ${
                                rowIdx + 1
                              }`
                            : `Empty column ${colIdx + 1}, row ${rowIdx + 1}`
                        }
                      >
                        {letterObj && !flashHere && (
                          <div className="sf-letter">{letterObj.letter}</div>
                        )}
                        {flashHere && (
                          <div className="sf-letter flash">
                            {flashHere.text}
                          </div>
                        )}
                      </div>
                    );
                  }),
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Final overlay */}
      {gameOver && (
        <CenteredOverlay
          title={`Final Score: ${score}`}
          subtitle="Reset with R"
        />
      )}
    </div>
  );
}
