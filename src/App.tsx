import { Routes, Route, useNavigate } from "react-router-dom";
import StartMenu from "./components/StartMenu";
import MinigamesMenu from "./components/MinigamesMenu";
import type { MinigameSpec } from "./components/MinigamesMenu";
import DiceGame from "./components/minigames/dice-game/DiceGame";
import MinesweeperGame from "./components/minigames/minesweeper/MinesweeperGame";
import KeypadGame from "./components/minigames/keypad/KeypadGame";
import SnakeGame from "./components/minigames/snake/SnakeGame";
import BlackjackLiteGame from "./components/minigames/blackjack/BlackjackLiteGame";
import CodeCrackerGame from "./components/minigames/codecracker/CodeCrackerGame.tsx";
import LightsOutGame from "./components/minigames/lights-out/LightsOutGame.tsx";
import SnowfallGame from "./components/minigames/snowfall/SnowfallGame.tsx";
import useMediaQuery from "./hooks/useMediaQuery.ts";
import SmallScreenFallback from "./components/SmallScreenFallback.tsx";

const minigames: MinigameSpec[] = [
  {
    id: "dice-game",
    title: "Dice Game",
    description: "Race to 100 points in 60s",
    Component: DiceGame,
  },
  {
    id: "minesweeper",
    title: "Minesweeper",
    description: "Find all the mines in 60s",
    Component: MinesweeperGame,
  },
  {
    id: "keypad",
    title: "Keypad",
    description: "Guess the number in 3 rounds",
    Component: KeypadGame,
  },
  {
    id: "snake",
    title: "Snake",
    description: "Eat the food and avoid the walls",
    Component: SnakeGame,
  },
  {
    id: "blackjack",
    title: "Blackjack Lite",
    description: "Three card black jack with simplified rules",
    Component: BlackjackLiteGame,
  },
  {
    id: "codecracker",
    title: "Code Cracker",
    description: "Guess the 4-digit code",
    Component: CodeCrackerGame,
  },
  {
    id: "lights-out",
    title: "Lights Out",
    description: "Shut out all the lights within 60s",
    Component: LightsOutGame,
  },
  {
    id: "snowfall",
    title: "Snowfall",
    description: "Type the falling letters before they hit the ground",
    Component: SnowfallGame,
  },
];

export default function App() {
  const navigate = useNavigate();
  const isSmall = useMediaQuery("(max-width: 768px)");

  return isSmall ? (
    <SmallScreenFallback />
  ) : (
    <Routes>
      <Route path="/" element={<StartMenuWrapper />} />
      <Route
        path="/minigames"
        element={
          <MinigamesMenu
            minigames={minigames}
            initialId="dice-game"
            onClose={() => navigate("/")}
          />
        }
      />
      {/* add more routes later if you like */}
    </Routes>
  );
}

/* helper so StartMenu can navigate */
function StartMenuWrapper() {
  const navigate = useNavigate();

  return (
    <StartMenu
      onNewGame={() => alert("Game not implemented")}
      onContinue={() => alert("Continue not implemented")}
      onMinigames={() => navigate("/minigames")}
      onSettings={() => alert("Settings not implemented")}
    />
  );
}
