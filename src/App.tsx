import { Routes, Route, useNavigate } from "react-router-dom";
import StartMenu from "./components/StartMenu";
import PlaceholderScene from "./scenes/PlaceHolderScene";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StartMenuWrapper />} />
      <Route path="/game" element={<PlaceholderScene onDone={() => {}} />} />
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
      onSettings={() => alert("Settings not implemented")}
    />
  );
}
