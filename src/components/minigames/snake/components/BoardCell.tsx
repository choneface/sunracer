import React from "react";

export default function BoardCell({
  isSnake,
  isHead,
  isFood,
}: {
  isSnake: boolean;
  isHead: boolean;
  isFood: boolean;
}) {
  return (
    <div
      className={`sn-cell ${isSnake ? "sn-snake" : ""} ${isHead ? "sn-head" : ""}`}
    >
      {isFood && <span className="sn-food" aria-label="food" />}
    </div>
  );
}
