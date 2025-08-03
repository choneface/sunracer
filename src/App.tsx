import { Routes, Route, useNavigate } from "react-router-dom";
import StartMenu from "./components/StartMenu";
import PlaceholderScene from "./scenes/PlaceHolderScene";
import MinigamesMenu from "./components/MinigamesMenu";
import { GuessNumber } from "./components/minigames/GuessNumber";
import type { MinigameSpec } from "./components/MinigamesMenu";
import DiceGame from "./components/minigames/dice-game/DiceGame";
import MinesweeperGame from "./components/minigames/minesweeper/MinesweeperGame";
import KeypadGame from "./components/minigames/keypad/KeypadGame";
import SnakeGame from "./components/minigames/snake/SnakeGame";
import BlackjackLiteGame from "./components/minigames/blackjack/BlackjackLiteGame";

const minigames: MinigameSpec[] = [
  {
    id: "guess-number",
    title: "Guess Number",
    description: "Guess a number between 1 and 10",
    Component: GuessNumber,
  },
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
];

export default function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<StartMenuWrapper />} />
      <Route path="/game" element={<PlaceholderScene onDone={() => {}} />} />
      <Route
        path="/minigames"
        element={
          <MinigamesMenu
            minigames={minigames}
            initialId="guess-number"
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
      onNewGame={() => navigate("/game")}
      onContinue={() => alert("Continue not implemented")}
      onMinigames={() => navigate("/minigames")}
      onSettings={() => alert("Settings not implemented")}
    />
  );
}
