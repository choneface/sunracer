import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CenteredOverlay from "../dice-game/components/CenteredOverlay";
import BoardCell from "./components/BoardCell";
import "./SnakeGame.css";

type Phase = "READY" | "PLAY" | "WIN" | "LOSE";
type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Pos = { r: number; c: number };

const SIZE = 5;
const GOAL = 5; // collect 5 foods
const TICK_MS = 300;

function wrap(n: number) {
  // wrap index into [0, SIZE)
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
  // If somehow full, fallback to 0,0
  return free.length
    ? free[Math.floor(Math.random() * free.length)]
    : { r: 0, c: 0 };
}

export default function SnakeGame() {
  const [phase, setPhase] = useState<Phase>("READY");
  const [snake, setSnake] = useState<Pos[]>(() => [
    { r: Math.floor(SIZE / 2), c: Math.floor(SIZE / 2) },
  ]); // head first
  const [dir, setDir] = useState<Dir>("RIGHT");
  const [food, setFood] = useState<Pos>(() =>
    randEmpty([{ r: Math.floor(SIZE / 2), c: Math.floor(SIZE / 2) }]),
  );

  // Derived
  const collected = useMemo(() => Math.max(0, snake.length - 1), [snake]); // grew once per food
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

      // WASD controls
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
    if (phase !== "PLAY") return;
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

        // Will we eat?
        const willEat = eq(newHead, foodRef.current);

        // Compute next snake
        const next = [newHead, ...prev]; // add head
        if (!willEat) next.pop(); // move tail unless eating

        // Self collision check (head overlapping any other segment)
        for (let i = 1; i < next.length; i++) {
          if (eq(newHead, next[i])) {
            setPhase("LOSE");
            return prev; // keep old to avoid flicker
          }
        }

        // Eating
        if (willEat) {
          // place new food
          const nf = randEmpty(next);
          setFood(nf);

          // win check after growth
          const grew = next.length - 1; // foods eaten
          if (grew >= GOAL) {
            setPhase("WIN");
          }
        }

        return next;
      });
    }, TICK_MS);

    return () => window.clearInterval(id);
  }, [phase]);

  const start = useCallback(() => {
    if (phase !== "READY") return;
    setPhase("PLAY");
  }, [phase]);

  // Render grid cells
  const isSnakeAt = useCallback(
    (r: number, c: number) => snake.some((s) => s.r === r && s.c === c),
    [snake],
  );
  const isHeadAt = useCallback(
    (r: number, c: number) =>
      snake.length > 0 && snake[0].r === r && snake[0].c === c,
    [snake],
  );

  return (
    <div
      className="panel"
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
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
        <CenteredOverlay title="You Win!" subtitle="Reset with R" />
      )}

      {/* Board + controls */}
      {phase !== "WIN" && phase !== "LOSE" && (
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
            {phase === "READY" ? (
              <button
                type="button"
                className="choice sn-start-btn"
                onClick={start}
              >
                Start
              </button>
            ) : (
              <div style={{ textAlign: "center", opacity: 0.9 }}>
                Use <strong>W/A/S/D</strong> to move. Collect {GOAL} circles.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
