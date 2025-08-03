import { useCallback, useEffect, useMemo, useState } from "react";
import CenteredOverlay from "../dice-game/components/CenteredOverlay";
import StartButtonInfoModal from "../shared/StartButtonInfoModal";
import Cell from "./components/Cell";
import "./Minesweeper.css";

type Phase = "PLAY" | "WIN" | "LOSE";

type CellModel = {
  isBomb: boolean;
  revealed: boolean;
  adjacent: number; // 0..8
};

const SIZE = 5;
const BOMBS = 3;
const START_TIME_SEC = 60;

function inBounds(r: number, c: number) {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
}

function neighbors(r: number, c: number) {
  const deltas = [-1, 0, 1];
  const res: Array<[number, number]> = [];
  for (const dr of deltas) {
    for (const dc of deltas) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (inBounds(nr, nc)) res.push([nr, nc]);
    }
  }
  return res;
}

function generateBoard(): CellModel[][] {
  const spots = new Set<number>();
  while (spots.size < BOMBS) {
    spots.add(Math.floor(Math.random() * SIZE * SIZE));
  }
  const board: CellModel[][] = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => ({
      isBomb: false,
      revealed: false,
      adjacent: 0,
    })),
  );
  for (const n of spots) {
    const r = Math.floor(n / SIZE);
    const c = n % SIZE;
    board[r][c].isBomb = true;
  }
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c].isBomb) continue;
      let count = 0;
      for (const [nr, nc] of neighbors(r, c)) {
        if (board[nr][nc].isBomb) count++;
      }
      board[r][c].adjacent = count;
    }
  }
  return board;
}

export default function MinesweeperGame() {
  const [started, setStarted] = useState(false);
  const [board, setBoard] = useState<CellModel[][]>(() => generateBoard());
  const [phase, setPhase] = useState<Phase>("PLAY");
  const [timeLeft, setTimeLeft] = useState(START_TIME_SEC);
  const [revealedSafe, setRevealedSafe] = useState(0);

  const totalSafe = useMemo(() => SIZE * SIZE - BOMBS, []);
  const remainingSafe = totalSafe - revealedSafe;

  // Timer – counts down from 60s only when started
  useEffect(() => {
    if (!started || phase !== "PLAY") return;
    if (timeLeft <= 0) {
      setPhase("LOSE");
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [phase, timeLeft, started]);

  const reveal = useCallback(
    (r: number, c: number) => {
      if (!started || phase !== "PLAY") return;
      const cur = board[r][c];
      if (cur.revealed) return;

      const next = board.map((row) => row.slice());
      let newlyRevealed = 0;

      const flood = (sr: number, sc: number) => {
        const stack: Array<[number, number]> = [[sr, sc]];
        while (stack.length) {
          const [rr, cc] = stack.pop()!;
          const cell = next[rr][cc];
          if (cell.revealed) continue;
          cell.revealed = true;
          if (!cell.isBomb) newlyRevealed++;
          if (cell.adjacent === 0 && !cell.isBomb) {
            for (const [nr, nc] of neighbors(rr, cc)) {
              const ncx = next[nr][nc];
              if (!ncx.revealed && !ncx.isBomb) stack.push([nr, nc]);
            }
          }
        }
      };

      if (cur.isBomb) {
        next[r][c] = { ...cur, revealed: true };
        setBoard(next);
        setPhase("LOSE");
        return;
      } else {
        if (cur.adjacent === 0) flood(r, c);
        else {
          next[r][c] = { ...cur, revealed: true };
          newlyRevealed++;
        }
      }

      setBoard(next);
      setRevealedSafe((prev) => {
        const final = prev + newlyRevealed;
        if (final >= totalSafe) setPhase("WIN");
        return final;
      });
    },
    [board, phase, totalSafe, started],
  );

  const beginGame = useCallback(() => {
    setBoard(generateBoard());
    setPhase("PLAY");
    setTimeLeft(START_TIME_SEC);
    setRevealedSafe(0);
    setStarted(true);
  }, []);

  const resetGame = useCallback(() => {
    setBoard(generateBoard());
    setPhase("PLAY");
    setTimeLeft(START_TIME_SEC);
    setRevealedSafe(0);
    setStarted(false);
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

  const instructions = (
    <>
      <p>Reveal all safe tiles without hitting a bomb.</p>
      <ul>
        <li>Click a cell to reveal it.</li>
        <li>If you reveal a bomb, you lose immediately.</li>
        <li>Revealing a zero will flood-fill its neighbors.</li>
        <li>You have {START_TIME_SEC} seconds to clear the board.</li>
        <li>
          Win by revealing all non-bomb cells. Press R after win/lose to retry.
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
          title="Minesweeper"
          instructions={instructions}
          onStart={beginGame}
        />
      )}

      {/* Header: time + remaining safe */}
      <div className="panel" style={{ margin: 0, marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <strong>Time:</strong> {timeLeft}s
          </div>
          <div>
            <strong>Safe left:</strong> {remainingSafe}
          </div>
          <div>
            <strong>Bombs:</strong> {BOMBS}
          </div>
        </div>
      </div>

      {/* End states — reuse CenteredOverlay exactly like DiceGame */}
      {phase === "LOSE" && (
        <CenteredOverlay title="You Lose!" subtitle="Retry with R" />
      )}
      {phase === "WIN" && (
        <CenteredOverlay title="You Win!" subtitle="Retry with R" />
      )}

      {/* Board */}
      {phase !== "WIN" && phase !== "LOSE" && (
        <div
          className="panel"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="ms-grid" role="grid" aria-label="Minesweeper 5 by 5">
            {board.map((row, r) =>
              row.map((cell, c) => (
                <Cell
                  key={`${r}-${c}`}
                  revealed={cell.revealed}
                  isBomb={cell.isBomb}
                  adjacent={cell.adjacent}
                  onReveal={() => reveal(r, c)}
                />
              )),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
