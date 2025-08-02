import useTypewriter from "../hooks/useTypewriter";
import StateColumn from "./StateColumn";
import type { GameState } from "../types/GameState";
import "./Scene.css";

export interface SceneProps {
  prompt: string;
  choices: string[];
  onChoice: (choice: string, index: number) => void;
  state: GameState; // ← new
  asciiArt?: string; // placeholder, will use later
  charDelay?: number;
}

export default function Scene({
  prompt,
  choices,
  onChoice,
  state,
  asciiArt,
  charDelay = 30,
}: SceneProps) {
  const [typed, done] = useTypewriter(prompt, charDelay);

  return (
    <div className="scene-grid">
      {/* Left column — ASCII art placeholder */}
      <div className="scene-column art-col">
        {asciiArt && <pre className="ascii-art">{asciiArt}</pre>}
      </div>

      {/* Middle column — prompt + choices */}
      <div className="scene-column main-col">
        <div className="prompt-box">
          <pre className="prompt-text">{typed}</pre>
        </div>

        {done && (
          <div className="choices-box">
            <ol className="choices">
              {choices.map((c, i) => (
                <li key={i}>
                  <button className="choice" onClick={() => onChoice(c, i)}>
                    {c}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Right column — game journal */}
      <div className="scene-column state-col">
        <StateColumn state={state} />
      </div>
    </div>
  );
}
