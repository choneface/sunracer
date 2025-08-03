import { useCallback, useEffect, useMemo, useState } from "react";
import CenteredOverlay from "../dice-game/components/CenteredOverlay";
import StartButtonInfoModal from "../shared/StartButtonInfoModal";
import "./lightsOut.css";

type Phase = "READY" | "PLAY" | "END";
const SIZE = 5;
const START_TIME = 60; // seconds

// helpers
const cloneGrid = (g: boolean[][]) => g.map((r) => [...r]);
const allOff = (g: boolean[][]) => g.every((r) => r.every((v) => !v));

// generate solvable starting board: start from all-off and apply random toggles
function makeStartingBoard(): boolean[][] {
  const grid: boolean[][] = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => false),
  );
  const randomToggles = 10;
  for (let i = 0; i < randomToggles; i++) {
    const r = Math.floor(Math.random() * SIZE);
    const c = Math.floor(Math.random() * SIZE);
    toggleAt(grid, r, c);
  }
  return grid;
}

// toggle cell and orthogonal neighbors
function toggleAt(grid: boolean[][], r: number, c: number) {
  const flip = (rr: number, cc: number) => {
    if (rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE) {
      grid[rr][cc] = !grid[rr][cc];
    }
  };
  flip(r, c);
  flip(r - 1, c);
  flip(r + 1, c);
  flip(r, c - 1);
  flip(r, c + 1);
}

export default function LightsOutGame() {
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>("READY");
  const [grid, setGrid] = useState<boolean[][]>(() => makeStartingBoard());
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(START_TIME);
  const [hovered, setHovered] = useState<{ r: number; c: number } | null>(null);

  // Timer
  useEffect(() => {
    if (phase !== "PLAY") return;
    if (timeLeft <= 0) {
      setPhase("END");
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [phase, timeLeft]);

  // End early if all off
  useEffect(() => {
    if (phase === "PLAY" && allOff(grid)) {
      setPhase("END");
    }
  }, [grid, phase]);

  const startGame = useCallback(() => {
    setGrid(makeStartingBoard());
    setMoves(0);
    setTimeLeft(START_TIME);
    setPhase("PLAY");
    setHovered(null);
    setStarted(true);
  }, []);

  const resetGame = useCallback(() => {
    setGrid(makeStartingBoard());
    setMoves(0);
    setTimeLeft(START_TIME);
    setPhase("READY");
    setHovered(null);
    setStarted(false);
  }, []);

  // Toggle handler
  const handleToggle = useCallback(
    (r: number, c: number) => {
      if (phase !== "PLAY") return;
      setGrid((prev) => {
        const next = cloneGrid(prev);
        toggleAt(next, r, c);
        return next;
      });
      setMoves((m) => m + 1);
    },
    [phase],
  );

  const neighborCells = useMemo(() => {
    if (!hovered) return new Set<string>();
    const s = new Set<string>();
    const { r, c } = hovered;
    const add = (rr: number, cc: number) => {
      if (rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE) s.add(`${rr},${cc}`);
    };
    add(r - 1, c);
    add(r + 1, c);
    add(r, c - 1);
    add(r, c + 1);
    return s;
  }, [hovered]);

  // final score: number of off cells * 10
  const offCount = useMemo(() => {
    let count = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!grid[r][c]) count++;
      }
    }
    return count;
  }, [grid]);
  const finalScore = offCount * 10;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === "END" && (e.key === "r" || e.key === "R")) {
        resetGame();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, resetGame]);

  const instructions = (
    <>
      <p>
        Toggle a cell to flip it and its orthogonal neighbors. Your goal is to
        turn off as many lights as possible in 60 seconds.
      </p>
      <ul>
        <li>Each toggle counts as a move.</li>
        <li>Hover or focus to preview which neighbors will be affected.</li>
        <li>
          Score is number of lights off × 10 when time expires or all are off.
        </li>
        <li>Press R after the final score to retry.</li>
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
          title="Lights Out"
          instructions={instructions}
          onStart={startGame}
        />
      )}

      {/* Top bar */}
      {(phase === "PLAY" || phase === "READY") && (
        <div className="panel" style={{ margin: 0, marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <strong>Moves:</strong> {moves}
            </div>
            <div>
              <strong>Time:</strong> {timeLeft}s
            </div>
            <div style={{ width: "4ch" }} />
          </div>
        </div>
      )}

      {/* Grid */}
      {phase === "PLAY" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div className="lo-wrapper">
            <div className="lo-grid" aria-label="Lights Out grid">
              {grid.map((row, r) =>
                row.map((on, c) => {
                  const isNeighbor = neighborCells.has(`${r},${c}`);
                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      className={`lo-cell ${on ? "on" : "off"} ${
                        hovered && hovered.r === r && hovered.c === c
                          ? "hovered"
                          : ""
                      } ${isNeighbor ? "neighbor" : ""}`}
                      onClick={() => handleToggle(r, c)}
                      onMouseEnter={() => setHovered({ r, c })}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered({ r, c })}
                      onBlur={() => setHovered(null)}
                      aria-label={`Cell ${r + 1},${c + 1} is ${on ? "on" : "off"}`}
                    />
                  );
                }),
              )}
            </div>
          </div>
        </div>
      )}

      {/* Final overlay */}
      {phase === "END" && (
        <CenteredOverlay
          title={`Final Score: ${finalScore}`}
          subtitle="Retry with R"
        />
      )}
    </div>
  );
}
