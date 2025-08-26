import { useCallback, useEffect, useState } from "react";
import CenteredOverlay from "../dice-game/components/CenteredOverlay";
import StartButtonInfoModal from "../shared/StartButtonInfoModal";
import type { Face } from "../blackjack/components/BlackjackCard";
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

export default function HighCardDraw() {
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>("READY");

  const [cards, setCards] = useState<Card[]>([]);

  const [spinner, setSpinner] = useState<Face[] | null>(null);

  const deal = useCallback(async (): Promise<void> => {
    setSpinner([randFace(), randFace()]);
    const tick = window.setInterval(() => {
      setSpinner([randFace(), randFace()]);
    }, 120);

    await new Promise((res) => setTimeout(res, SPIN_MS));
    window.clearInterval(tick);

    const opponent= drawCard();
    let player = drawCard();
    while(player == opponent) {
      player = drawCard();
    }
    setSpinner(null);
    setCards([opponent, player]);
  }, []);

  const resolveOutcome = useCallback(() => {
    setPhase("RESOLVE");
    const d = cardValue(cards[0]);
    const p = cardValue(cards[1]);

    if (p > d) setPhase("WIN");
    else setPhase("LOSE");
  }, [cards]);

  const startGame = useCallback(async () => {
    if (phase !== "READY") return;
    setPhase("DEALING")
    setCards([])
    await deal()
    resolveOutcome()
  }, [phase, deal, resolveOutcome]);

  const resetGame = useCallback(() => {
    setPhase("READY");
    setCards([])
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
        Blackjack Lite: one player vs dealer. Dealer hits on 16 or less, up to 3
        cards.
      </p>
      <ul>
        <li>Dealer is dealt first (with animation), then you get one card.</li>
        <li>You can Hit up to 3 cards or Stand to resolve.</li>
        <li>Busting loses immediately; if dealer busts you win.</li>
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
          title="Blackjack Lite"
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
              title= "Dealer"
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
