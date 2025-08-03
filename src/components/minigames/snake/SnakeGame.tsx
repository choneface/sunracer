import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CenteredOverlay from "../dice-game/components/CenteredOverlay";
import StartButtonInfoModal from "../shared/StartButtonInfoModal";
import BoardCell from "./components/BoardCell";
import "./SnakeGame.css";

type Phase = "READY" | "PLAY" | "WIN" | "LOSE";
type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Pos = { r: number; c: number };

const SIZE = 5;
const GOAL = 5; // collect 5 foods
const TICK_MS = 300;

function wrap(n: number) {
  return (n + SIZE) % SIZE;
}

function eq(a: Pos, b: Pos) {
  return a.r === b.r && a.c === b.c;
}

function randEmpty(snake: Pos[]): Pos {
  const taken = new Set(snake.map((p) => `${p.r},${p.c}`));
  const free: Pos[] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const key = `${r},${c}`;
      if (!taken.has(key)) free.push({ r, c });
    }
  }
  return free.length
    ? free[Math.floor(Math.random() * free.length)]
    : { r: 0, c: 0 };
}

export default function SnakeGame() {
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>("READY");
  const [snake, setSnake] = useState<Pos[]>(() => [
    { r: Math.floor(SIZE / 2), c: Math.floor(SIZE / 2) },
  ]); // head first
  const [dir, setDir] = useState<Dir>("RIGHT");
  const [food, setFood] = useState<Pos>(() =>
    randEmpty([{ r: Math.floor(SIZE / 2), c: Math.floor(SIZE / 2) }]),
  );

  // Derived
  const collected = useMemo(() => Math.max(0, snake.length - 1), [snake]);
  const remaining = GOAL - collected;

  // Refs to avoid stale closures inside interval
  const dirRef = useRef(dir);
  const phaseRef = useRef(phase);
  const foodRef = useRef(food);
  useEffect(() => {
    dirRef.current = dir;
  }, [dir]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  const resetGame = useCallback(() => {
    const startPos = { r: Math.floor(SIZE / 2), c: Math.floor(SIZE / 2) };
    setSnake([startPos]);
    setDir("RIGHT");
    setFood(randEmpty([startPos]));
    setPhase("READY");
    setStarted(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();

      // reset on overlays
      if (
        (phaseRef.current === "WIN" || phaseRef.current === "LOSE") &&
        k === "r"
      ) {
        resetGame();
        return;
      }
      if (phaseRef.current !== "PLAY") return;

      const d = dirRef.current;
      if (k === "w" && d !== "DOWN") setDir("UP");
      else if (k === "s" && d !== "UP") setDir("DOWN");
      else if (k === "a" && d !== "RIGHT") setDir("LEFT");
      else if (k === "d" && d !== "LEFT") setDir("RIGHT");
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resetGame]);

  // Game loop
  useEffect(() => {
    if (!started || phase !== "PLAY") return;
    const id = window.setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        const d = dirRef.current;

        let nr = head.r,
          nc = head.c;
        if (d === "UP") nr = wrap(head.r - 1);
        else if (d === "DOWN") nr = wrap(head.r + 1);
        else if (d === "LEFT") nc = wrap(head.c - 1);
        else if (d === "RIGHT") nc = wrap(head.c + 1);

        const newHead: Pos = { r: nr, c: nc };
        const willEat = eq(newHead, foodRef.current);

        const next = [newHead, ...prev];
        if (!willEat) next.pop();

        // Self collision
        for (let i = 1; i < next.length; i++) {
          if (eq(newHead, next[i])) {
            setPhase("LOSE");
            return prev;
          }
        }

        if (willEat) {
          const nf = randEmpty(next);
          setFood(nf);
          const grew = next.length - 1;
          if (grew >= GOAL) {
            setPhase("WIN");
          }
        }

        return next;
      });
    }, TICK_MS);

    return () => window.clearInterval(id);
  }, [phase, started]);

  // Start via modal
  const begin = useCallback(() => {
    if (phase !== "READY") return;
    setStarted(true);
    setPhase("PLAY");
  }, [phase]);

  const isPlaying = started && phase !== "WIN" && phase !== "LOSE";

  // Render helpers
  const isSnakeAt = useCallback(
    (r: number, c: number) => snake.some((s) => s.r === r && s.c === c),
    [snake],
  );
  const isHeadAt = useCallback(
    (r: number, c: number) =>
      snake.length > 0 && snake[0].r === r && snake[0].c === c,
    [snake],
  );

  const instructions = (
    <>
      <p>Control the snake with W/A/S/D. The board wraps around edges.</p>
      <ul>
        <li>Collect {GOAL} white circles (food); snake grows after each.</li>
        <li>Avoid hitting yourself—collision ends the game.</li>
        <li>
          Win by collecting all {GOAL} foods. Press R after win/lose to retry.
        </li>
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
      {!started && (
        <StartButtonInfoModal
          title="Snake"
          instructions={instructions}
          onStart={begin}
        />
      )}

      {/* Header: progress */}
      <div className="panel" style={{ margin: 0, marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <strong>Goal:</strong> {GOAL} foods
          </div>
          <div>
            <strong>Remaining:</strong> {remaining}
          </div>
          <div style={{ width: "4ch" }} />
        </div>
      </div>

      {/* Overlays */}
      {phase === "LOSE" && (
        <CenteredOverlay title="You Lose!" subtitle="Retry with R" />
      )}
      {phase === "WIN" && (
        <CenteredOverlay title="You Win!" subtitle="Retry with R" />
      )}

      {/* Board + hint */}
      {isPlaying && (
        <>
          <div
            className="panel"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="sn-grid" role="grid" aria-label="Snake 5 by 5">
              {Array.from({ length: SIZE * SIZE }, (_, idx) => {
                const r = Math.floor(idx / SIZE);
                const c = idx % SIZE;
                const snakeHere = isSnakeAt(r, c);
                const headHere = isHeadAt(r, c);
                const foodHere = eq({ r, c }, food);

                return (
                  <BoardCell
                    key={idx}
                    isSnake={snakeHere}
                    isHead={headHere}
                    isFood={foodHere}
                  />
                );
              })}
            </div>
          </div>

          <div className="panel" style={{ marginTop: 0 }}>
            <div style={{ textAlign: "center", opacity: 0.9 }}>
              Use <strong>W/A/S/D</strong> to move. Collect {GOAL} circles.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
