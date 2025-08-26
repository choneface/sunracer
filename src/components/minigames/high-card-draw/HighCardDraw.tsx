import { useCallback, useEffect, useState } from "react";
import CenteredOverlay from "../dice-game/components/CenteredOverlay";
import StartButtonInfoModal from "../shared/StartButtonInfoModal";
import type { Face } from "./components/HighCardDrawCard.tsx";
import HighCardDrawHand from "./components/HighCardDrawHand.tsx";
import "./HighCardDraw.css";

type Phase = "READY" | "DEALING" | "RESOLVE" | "WIN" | "LOSE";

const SPIN_MS = 1500;

const RANKS = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
] as const;
const SUITS = ["♠", "♥", "♦", "♣"] as const;

type Card = { rank: (typeof RANKS)[number]; suit: (typeof SUITS)[number] };

function randFace(): Face {
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  return { rank, suit };
}
function drawCard(): Card {
  return randFace();
}

function cardValue(c: Card): number {
  if (c.rank === "A") return 11;
  if (["K", "Q", "J"].includes(c.rank)) return 10;
  return Number(c.rank);
}

export function HighCardDraw() {
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>("READY");

  const [cards, setCards] = useState<Card[]>([]);

  const [spinner, setSpinner] = useState<Face[] | null>(null);

  const deal = useCallback(async (): Promise<[Card, Card]> => {
    setSpinner([randFace(), randFace()]);
    const tick = window.setInterval(() => {
      setSpinner([randFace(), randFace()]);
    }, 120);

    await new Promise((res) => setTimeout(res, SPIN_MS));
    window.clearInterval(tick);

    const opponent = drawCard();
    const player = drawCard();
    setSpinner(null);
    setCards([opponent, player]);
    return [opponent, player]
  }, []);

  const resolveOutcome = useCallback(async (hand: [Card, Card]) => {
    setPhase("RESOLVE");

    await new Promise((res) => setTimeout(res, SPIN_MS));

    const d = cardValue(hand[0]);
    const p = cardValue(hand[1]);

    if (p > d) setPhase("WIN");
    else setPhase("LOSE");
  }, []);

  const startGame = useCallback(async () => {
    if (phase !== "READY") return;
    setPhase("DEALING");
    const hand = await deal();
    await resolveOutcome(hand);
  }, [phase, deal, resolveOutcome]);

  const resetGame = useCallback(() => {
    setPhase("READY");
    setCards([]);
    setSpinner(null);
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

  const isActive = started && phase !== "WIN" && phase !== "LOSE";

  const instructions = (
    <>
      <p>
        High Card Draw: one player vs dealer. Both players draw cards and the high man wins
      </p>
      <ul>
        <li>Cards will be dealt as soon as you press start</li>
        <li>Only one card will be drawn for each player</li>
        <li>Standard 1-11 scoring</li>
        <li>Ties go to dealer. Press R after win/lose to retry.</li>
      </ul>
    </>
  );

  const begin = useCallback(() => {
    if (started) return;
    setStarted(true);
    startGame();
  }, [started, startGame]);

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
          title="High Card Draw"
          instructions={instructions}
          onStart={begin}
        />
      )}

      {/* Overlays */}
      {phase === "LOSE" && (
        <CenteredOverlay title="You Lose!" subtitle="Retry with R" />
      )}
      {phase === "WIN" && (
        <CenteredOverlay title="You Win!" subtitle="Reset with R" />
      )}

      {/* Table */}
      {isActive && (
        <>
          <div className="panel hcd-table">
            <HighCardDrawHand
              title="Dealer"
              cards={[cards[0]]}
              spinning={spinner ? spinner[0] : null}
              bustFlash={false}
              top
            />

            <div className="hcd-divider" />

            <HighCardDrawHand
              title="You"
              cards={[cards[1]]}
              spinning={spinner ? spinner[1] : null}
              bustFlash={false}
            />
          </div>
        </>
      )}
    </div>
  );
}
