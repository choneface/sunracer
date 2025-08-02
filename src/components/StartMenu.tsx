import "./StartMenu.css";

export interface StartMenuProps {
  onNewGame: () => void;
  onContinue: () => void;
  onMinigames: () => void;
  onSettings: () => void;
}

/* ASCII “block” title generated with cfonts (font: block) */
const TITLE = String.raw`
███████╗██╗   ██╗███╗   ██╗██████╗  █████╗  ██████╗███████╗██████╗ 
██╔════╝██║   ██║████╗  ██║██╔══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗
███████╗██║   ██║██╔██╗ ██║██████╔╝███████║██║     █████╗  ██████╔╝
╚════██║██║   ██║██║╚██╗██║██╔══██╗██╔══██║██║     ██╔══╝  ██╔══██╗
███████║╚██████╔╝██║ ╚████║██║  ██║██║  ██║╚██████╗███████╗██║  ██║
╚══════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚══════╝╚═╝  ╚═╝
`;

export default function StartMenu({
  onNewGame,
  onContinue,
  onMinigames,
  onSettings,
}: StartMenuProps) {
  return (
    <div className="start-menu">
      <pre className="title">{TITLE}</pre>

      <nav className="menu">
        <button className="menu-item" onClick={onNewGame}>
          New Game
        </button>
        <button className="menu-item" onClick={onContinue}>
          Continue Game
        </button>
        <button className="menu-item" onClick={onMinigames}>
          Minigames
        </button>
        <button className="menu-item" onClick={onSettings}>
          Settings & Credits
        </button>
      </nav>
    </div>
  );
}
