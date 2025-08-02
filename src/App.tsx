import { Routes, Route, useNavigate } from "react-router-dom";
import StartMenu from "./components/StartMenu";
import PlaceholderScene from "./scenes/PlaceHolderScene";
import MinigamesMenu from "./components/MinigamesMenu";
import { GuessNumber } from "./components/minigames/GuessNumber";
import type { MinigameSpec } from "./components/MinigamesMenu";

const minigames: MinigameSpec[] = [
  {
    id: "guess-number",
    title: "Guess Number",
    description: "Guess a number between 1 and 10",
    Component: GuessNumber,
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
