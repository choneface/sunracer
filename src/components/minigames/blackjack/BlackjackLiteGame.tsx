import { useCallback, useEffect, useMemo, useState } from "react";
import CenteredOverlay from "../dice-game/components/CenteredOverlay";
import StartButtonInfoModal from "../shared/StartButtonInfoModal";
import type { Face } from "./components/BlackjackCard";
import BlackjackHand from "./components/BlackjackHand";
import BlackjackControls from "./components/BlackjackControls";
import "./BlackjackLiteGame.css";

type Phase = "READY" | "DEALER" | "PLAYER" | "RESOLVE" | "WIN" | "LOSE";

const SPIN_MS = 1500;
const BETWEEN_DEALS_MS = 400;

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

function handValue(cards: Card[]) {
  let total = cards.reduce((s, c) => s + cardValue(c), 0);
  let aces = cards.filter((c) => c.rank === "A").length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

export default function BlackjackLiteGame() {
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>("READY");

  const [dealer, setDealer] = useState<Card[]>([]);
  const [player, setPlayer] = useState<Card[]>([]);

  const [spinner, setSpinner] = useState<{
    to: "dealer" | "player";
    face: Face;
  } | null>(null);

  const [bust, setBust] = useState<"" | "dealer" | "player">("");

  const dealerTotal = useMemo(() => handValue(dealer), [dealer]);
  const playerTotal = useMemo(() => handValue(player), [player]);

  const dealTo = useCallback(async (to: "dealer" | "player"): Promise<Face> => {
    setSpinner({ to, face: randFace() });
    const tick = window.setInterval(() => {
      setSpinner((s) => (s ? { ...s, face: randFace() } : s));
    }, 120);

    await new Promise((res) => setTimeout(res, SPIN_MS));
    window.clearInterval(tick);

    const final = drawCard();
    setSpinner(null);
    if (to === "dealer") setDealer((prev) => [...prev, final]);
    else setPlayer((prev) => [...prev, final]);
    return final;
  }, []);

  const startGame = useCallback(async () => {
    if (phase !== "READY") return;
    setDealer([]);
    setPlayer([]);
    setBust("");
    setPhase("DEALER");

    const localDealer: Face[] = [];
    while (true) {
      if (localDealer.length >= 3) break;
      const card = await dealTo("dealer");
      localDealer.push(card);
      const val = handValue(localDealer as Card[]);
      if (val > 21) {
        setBust("dealer");
        await new Promise((r) => setTimeout(r, SPIN_MS));
        setPhase("WIN");
        return;
      }
      if (val <= 16 && localDealer.length < 3) {
        await new Promise((r) => setTimeout(r, BETWEEN_DEALS_MS));
        continue;
      }
      break;
    }

    setPhase("PLAYER");
    await dealTo("player");
  }, [phase, dealTo]);

  const onHit = useCallback(async () => {
    if (phase !== "PLAYER") return;
    if (player.length >= 3) return;
    await dealTo("player");
  }, [phase, player.length, dealTo]);

  const resolveOutcome = useCallback(() => {
    setPhase("RESOLVE");
    const d = handValue(dealer);
    const p = handValue(player);

    if (p > 21) {
      setPhase("LOSE");
      return;
    }
    if (d > 21) {
      setPhase("WIN");
      return;
    }
    if (p > d) setPhase("WIN");
    else setPhase("LOSE");
  }, [dealer, player]);

  const onStand = useCallback(() => {
    if (phase !== "PLAYER") return;
    resolveOutcome();
  }, [phase, resolveOutcome]);

  useEffect(() => {
    if (phase !== "PLAYER") return;

    const total = handValue(player);
    if (total > 21) {
      setBust("player");
      (async () => {
        await new Promise((r) => setTimeout(r, SPIN_MS));
        setPhase("LOSE");
      })();
      return;
    }

    if (player.length >= 3) {
      resolveOutcome();
    }
  }, [player, phase, resolveOutcome]);

  const resetGame = useCallback(() => {
    setPhase("READY");
    setDealer([]);
    setPlayer([]);
    setSpinner(null);
    setBust("");
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

  const dealingDealer = phase === "DEALER";
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

      {/* Header */}
      <div className="panel" style={{ margin: 0, marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <strong>Dealer:</strong> {dealer.length ? dealerTotal : "-"}
          </div>
          <div>
            <strong>You:</strong> {player.length ? playerTotal : "-"}
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

      {/* Table */}
      {isActive && (
        <>
          <div className="panel bj-table">
            <BlackjackHand
              title="Dealer"
              cards={dealer}
              spinning={spinner?.to === "dealer" ? spinner.face : null}
              bustFlash={bust === "dealer"}
              top
            />

            <div className="bj-divider" />

            <BlackjackHand
              title="You"
              cards={player}
              spinning={spinner?.to === "player" ? spinner.face : null}
              bustFlash={bust === "player"}
            />
          </div>

          {/* Controls */}
          <div className="panel" style={{ marginTop: 0, textAlign: "center" }}>
            {dealingDealer && (
              <div className="bj-status">Dealing cards to the dealer…</div>
            )}

            {phase === "PLAYER" && (
              <BlackjackControls
                canHit={player.length < 3}
                onHit={onHit}
                onStand={onStand}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
