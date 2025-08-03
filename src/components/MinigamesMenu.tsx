import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import "./Minigames.css";

/** Shape each minigame should implement */
export interface MinigameSpec {
  id: string;
  title: string;
  description?: string;
  Component: React.ComponentType; // simple: no props for now
}

interface MinigamesMenuProps {
  minigames: MinigameSpec[];
  initialId?: string;
  onClose?: () => void; // optional, if you want to exit back to main flow
}

export default function MinigamesMenu({
  minigames,
  initialId,
  onClose,
}: MinigamesMenuProps) {
  const hasGames = minigames.length > 0;
  const [selectedId, setSelectedId] = useState<string>(
    initialId && minigames.some((g) => g.id === initialId)
      ? initialId
      : hasGames
        ? minigames[0].id
        : "",
  );

  const selectedIndex = useMemo(
    () => minigames.findIndex((g) => g.id === selectedId),
    [minigames, selectedId],
  );

  const Selected = useMemo(
    () => (selectedIndex >= 0 ? minigames[selectedIndex].Component : null),
    [minigames, selectedIndex],
  );

  const listRef = useRef<HTMLUListElement>(null);

  // Keyboard navigation on the left pane
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!hasGames) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = Math.min(minigames.length - 1, selectedIndex + 1);
        setSelectedId(minigames[next].id);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = Math.max(0, selectedIndex - 1);
        setSelectedId(minigames[prev].id);
      } else if (e.key === "Enter") {
        // No-op here (selection is immediate), but you could trigger a “start”
      } else if (e.key.toLowerCase() === "q" && onClose) {
        onClose();
      }
    },
    [hasGames, minigames, selectedIndex, onClose],
  );

  // Keep the selected item visible while navigating
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLLIElement>(
      `[data-id="${selectedId}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedId]);

  return (
    <div className="minigames-grid">
      {/* Left list */}
      <aside
        className="minigames-col list-col scene-column"
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label="Minigames list"
      >
        <div className="panel header-panel">
          <h2 className="panel-title">Minigames</h2>
          <p className="panel-subtitle">
            {hasGames
              ? "Collection of minigames for testing purposes. Press q to exit."
              : "No games available."}
          </p>
        </div>

        <ul
          className="games-list"
          ref={listRef}
          role="listbox"
          aria-activedescendant={selectedId}
        >
          {minigames.map((g) => {
            const isActive = g.id === selectedId;
            return (
              <li
                key={g.id}
                data-id={g.id}
                id={g.id}
                role="option"
                aria-selected={isActive}
                className={`game-item ${isActive ? "active" : ""}`}
                onClick={() => setSelectedId(g.id)}
              >
                <button className="choice game-button" type="button">
                  <span className="game-title">{g.title}</span>
                  {g.description && (
                    <span className="game-desc">{g.description}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Right render area */}
      <main className="minigames-col play-col scene-column">
        <div className="panel play-header">
          <h2 className="panel-title">
            {selectedIndex >= 0
              ? minigames[selectedIndex].title
              : "No selection"}
          </h2>
        </div>

        <div className="play-surface">
          {Selected ? (
            <Selected />
          ) : (
            <div className="empty-state">Select a minigame from the left.</div>
          )}
        </div>
      </main>
    </div>
  );
}
