import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import StartButtonInfoModal from "../shared/StartButtonInfoModal.tsx";
import DitherImage from "../../dither/DitherImage.tsx";
import CenteredOverlay from "../dice-game/components/CenteredOverlay";
import "./Shots.css";

/* === CONFIG CONSTANTS === */
const FILL_DURATION_MS: number = 1000; // total fill time
const TICK_INTERVAL_MS: number = 200; // fill update cadence
const FLASH_EMPTY_MS: number = 1000; // how long to flash after drinking
const BLINK_INTERVAL_MS: number = 120; // how fast the empty glass blinks

const HALF_FULL_SHOT_GLASS_SRC = "src/assets/half_full_shot_glass.png";
const FULL_SHOT_GLASS_SRC = "src/assets/full_shot_glass.png";
const EMPTY_SHOT_GLASS_SRC = "src/assets/empty_shot_glass.png";

type Phase = "idle" | "filling" | "flashing" | "done";

export default function Shots() {
  const [started, setStarted] = useState(false);
  const [stage, setStage] = useState<0 | 1 | 2>(0); // 0 empty, 1 half, 2 full
  const [phase, setPhase] = useState<Phase>("idle");
  const [flashVisible, setFlashVisible] = useState(true);

  // Refs for timers
  const fillIntervalRef = useRef<number | null>(null);
  const flashTimeoutRef = useRef<number | null>(null);
  const blinkIntervalRef = useRef<number | null>(null);
  const tickRef = useRef(0);

  // Derived tick math
  const transitions = 2;
  const totalTicks = useMemo(
    () => Math.max(1, Math.round(FILL_DURATION_MS / TICK_INTERVAL_MS)),
    [],
  );
  const ticksPerStage = useMemo(
    () => Math.max(1, Math.floor(totalTicks / transitions)),
    [totalTicks],
  );

  // Helpers: clear timers
  const clearFillInterval = () => {
    if (fillIntervalRef.current) {
      window.clearInterval(fillIntervalRef.current);
      fillIntervalRef.current = null;
    }
  };
  const clearFlashTimers = () => {
    if (flashTimeoutRef.current) {
      window.clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = null;
    }
    if (blinkIntervalRef.current) {
      window.clearInterval(blinkIntervalRef.current);
      blinkIntervalRef.current = null;
    }
  };
  const clearAllTimers = () => {
    clearFillInterval();
    clearFlashTimers();
  };

  const start = () => {
    setStarted(true);
    setStage(0);
    setPhase("filling");
    tickRef.current = 0;
    clearAllTimers();
  };

  const reset = useCallback(() => {
    setStarted(false);
    setStage(0);
    setPhase("idle");
    tickRef.current = 0;
    setFlashVisible(true);

    // clear timers inline so we don't depend on outer helpers
    if (fillIntervalRef.current) {
      window.clearInterval(fillIntervalRef.current);
      fillIntervalRef.current = null;
    }
    if (flashTimeoutRef.current) {
      window.clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = null;
    }
    if (blinkIntervalRef.current) {
      window.clearInterval(blinkIntervalRef.current);
      blinkIntervalRef.current = null;
    }
  }, []);

  // Press R to reset
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "r") reset();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [reset]);

  // Handle fill progression (only clears the FILL INTERVAL on cleanup)
  useEffect(() => {
    if (phase !== "filling") return;
    clearFillInterval();

    fillIntervalRef.current = window.setInterval(() => {
      tickRef.current += 1;
      if (tickRef.current >= totalTicks) {
        setStage(2);
        clearFillInterval();
      } else {
        const newStage = Math.min(
          2,
          Math.floor(tickRef.current / ticksPerStage),
        ) as 0 | 1 | 2;
        setStage(newStage);
      }
    }, TICK_INTERVAL_MS);

    return clearFillInterval;
  }, [phase, totalTicks, ticksPerStage]);

  const onDrink = () => {
    // Stop filling and move into flashing phase
    clearFillInterval();
    clearFlashTimers(); // ensure clean start for flash/blink
    setStage(0); // show empty while flashing
    setFlashVisible(true);
    setPhase("flashing");

    // Blink (toggle visibility) while flashing
    blinkIntervalRef.current = window.setInterval(() => {
      setFlashVisible((v) => !v);
    }, BLINK_INTERVAL_MS);

    // After FLASH_EMPTY_MS, stop flashing and show "done"
    flashTimeoutRef.current = window.setTimeout(() => {
      clearFlashTimers();
      setPhase("done");
    }, FLASH_EMPTY_MS);
  };

  const instructions = (
    <>
      <p>Take a shot.</p>
      <ul>
        <li>Breathe out, then drink. Never in — don’t choke on the fumes.</li>
        <li>No chasers. Maybe bread, maybe pickle. Nothing sweet.</li>
        <li>
          Always drink to something. Otherwise it’s just fuel with no fire.
        </li>
        <li>Press R after to reset.</li>
      </ul>
    </>
  );

  const showImage =
    phase === "filling" ||
    phase === "flashing" ||
    (phase === "idle" && started);

  return (
    <div
      className="panel"
      style={{
        height: "50%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {!started && (
        <StartButtonInfoModal
          title="Shots"
          instructions={instructions}
          onStart={start}
        />
      )}

      {showImage && (
        <div
          style={{
            opacity: phase === "flashing" ? (flashVisible ? 1 : 0) : 1,
            transition: phase === "flashing" ? "opacity 80ms linear" : "none",
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          {stage === 0 && (
            <DitherImage
              src={EMPTY_SHOT_GLASS_SRC}
              dotColor="#FFFFFF"
              scale={0.1}
            />
          )}
          {stage === 1 && (
            <DitherImage
              src={HALF_FULL_SHOT_GLASS_SRC}
              dotColor="#FFFFFF"
              scale={0.1}
            />
          )}
          {stage === 2 && (
            <DitherImage
              src={FULL_SHOT_GLASS_SRC}
              dotColor="#FFFFFF"
              scale={0.1}
            />
          )}
        </div>
      )}

      {phase === "filling" && stage === 2 && (
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <button className="drink-btn" onClick={onDrink}>
            Drink
          </button>
        </div>
      )}

      {phase === "done" && (
        <CenteredOverlay
          title="That was rough..."
          subtitle="Have another with R"
        />
      )}
    </div>
  );
}
