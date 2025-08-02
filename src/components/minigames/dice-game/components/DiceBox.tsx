import React from "react";

export default function DiceBox({
  label,
  value,
  rolling,
}: {
  label: string;
  value: number | null;
  rolling: boolean;
}) {
  return (
    <div className="dice-box">
      <div className="dice-label">{label}</div>
      <div className={`dice-value ${rolling ? "dice-rolling" : ""}`}>
        {value ?? "—"}
      </div>
    </div>
  );
}
