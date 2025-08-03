import React from "react";
import "./StartButtonInfoModal.css";

export interface StartButtonInfoModalProps {
  title: string;
  instructions: React.ReactNode;
  onStart: () => void;
  startLabel?: string;
  className?: string;
}

export default function StartButtonInfoModal({
  title,
  instructions,
  onStart,
  startLabel = "Start",
  className = "",
}: StartButtonInfoModalProps) {
  return (
    <div className={`sbim-backdrop ${className}`}>
      <div className="sbim-box">
        <div className="sbim-header">
          <h2>{title}</h2>
        </div>
        <div className="sbim-content">{instructions}</div>
        <div className="sbim-actions">
          <button
            type="button"
            className="choice sbim-start-btn"
            onClick={onStart}
            autoFocus
          >
            {startLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
