import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import earthOne from "./assets/earth-1.png";
import earthTwo from "./assets/earth-2.png";
import earthThree from "./assets/earth-3.png";
import earthFour from "./assets/earth-4.png";
import earthFive from "./assets/earth-5.png";
import earthSix from "./assets/earth-6.png";
import earthSeven from "./assets/earth-7.png";
import earthEight from "./assets/earth-8.png";
import earthNine from "./assets/earth-9.png";
import earthTen from "./assets/earth-10.png";
import earthEleven from "./assets/earth-11.png";
import earthTwelve from "./assets/earth-12.png";
import earthThirteen from "./assets/earth-13.png";
import earthFourteen from "./assets/earth-14.png";
import earthFifteen from "./assets/earth-15.png";
import earthSixteen from "./assets/earth-16.png";
import earthSeventeen from "./assets/earth-17.png";
import earthEighteen from "./assets/earth-18.png";
import earthNineteen from "./assets/earth-19.png";
import earthTwenty from "./assets/earth-20.png";
import earthTwentyOne from "./assets/earth-21.png";
import earthTwentyTwo from "./assets/earth-22.png";
import earthTwentyThree from "./assets/earth-23.png";
import earthTwentyFour from "./assets/earth-24.png";

import "./StartMenu.css";
import DitherImage from "../dither/DitherImage.tsx";

export interface StartMenuProps {
  onNewGame: () => void;
  onContinue: () => void;
  onMinigames: () => void;
  onSettings: () => void;
}

const TICK_SPEED_MS = 95;

/* ASCII “block” title generated with cfonts (font: block) */
const TITLE = String.raw`
███████╗██╗   ██╗███╗   ██╗██████╗  █████╗  ██████╗███████╗██████╗ 
██╔════╝██║   ██║████╗  ██║██╔══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗
███████╗██║   ██║██╔██╗ ██║██████╔╝███████║██║     █████╗  ██████╔╝
╚════██║██║   ██║██║╚██╗██║██╔══██╗██╔══██║██║     ██╔══╝  ██╔══██╗
███████║╚██████╔╝██║ ╚████║██║  ██║██║  ██║╚██████╗███████╗██║  ██║
╚══════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚══════╝╚═╝  ╚═╝
`;

type Item = {
  label: string;
  onSelect: () => void;
};

const earth = [
  earthOne,
  earthTwo,
  earthThree,
  earthFour,
  earthFive,
  earthSix,
  earthSeven,
  earthEight,
  earthNine,
  earthTen,
  earthEleven,
  earthTwelve,
  earthThirteen,
  earthFourteen,
  earthFifteen,
  earthSixteen,
  earthSeventeen,
  earthEighteen,
  earthNineteen,
  earthTwenty,
  earthTwentyOne,
  earthTwentyTwo,
  earthTwentyThree,
  earthTwentyFour,
];

export default function StartMenu({
  onNewGame,
  onContinue,
  onMinigames,
  onSettings,
}: StartMenuProps) {
  const items: Item[] = useMemo(
    () => [
      { label: "New Game", onSelect: onNewGame },
      { label: "Continue Game", onSelect: onContinue },
      { label: "Minigames", onSelect: onMinigames },
      { label: "Settings & Credits", onSelect: onSettings },
    ],
    [onNewGame, onContinue, onMinigames, onSettings],
  );

  const [selected, setSelected] = useState(0);

  const onKey = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        setSelected((s) => (s + 1) % items.length);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        setSelected((s) => (s - 1 + items.length) % items.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        items[selected].onSelect();
      }
    },
    [items, selected],
  );

  // keep selection in range if items change
  useEffect(() => {
    setSelected((s) => Math.min(s, items.length - 1));
  }, [items.length]);

  const frames = earth;
  const [frameIdx, setFrameIdx] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (frames.length === 0) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setFrameIdx((i) => (i + 1) % frames.length);
    }, TICK_SPEED_MS) as unknown as number;
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [frames]);

  return (
    <div
      className="start-menu tty-viewport"
      tabIndex={0}
      onKeyDown={onKey}
      aria-label="Start Menu"
      role="menu"
    >
      <pre className="title">{TITLE}</pre>
      <pre className="description">An original story by Jack Buchanan</pre>
      <DitherImage src={earth[frameIdx]} contrast={0.4} />
      <nav className="menu">
        {items.map((item, i) => (
          <button
            key={item.label}
            role="menuitem"
            className={`row ${i === selected ? "is-selected" : ""}`}
            onClick={item.onSelect}
            onMouseEnter={() => setSelected(i)}
          >
            <span className="content">{"     " + item.label}</span>
          </button>
        ))}
      </nav>
      <pre>
        {"< Hit arrow keys or j/k to move cursor. Hit enter to select >"}
      </pre>
    </div>
  );
}
