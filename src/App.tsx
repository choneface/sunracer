import { Routes, Route, useNavigate } from "react-router-dom";
import StartMenu from "./components/StartMenu";
import PlaceholderScene from "./scenes/PlaceHolderScene";
import MinigamesMenu from "./components/MinigamesMenu";
import { GuessNumber } from "./components/minigames/GuessNumber";
import type { MinigameSpec } from "./components/MinigamesMenu";
import DiceGame from "./components/minigames/dice-game/DiceGame";

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
