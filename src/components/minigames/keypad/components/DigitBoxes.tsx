import React from "react";

export default function DigitBoxes({
  values,
  highlight,
}: {
  values: (number | null)[];
  highlight?: boolean;
}) {
  return (
    <div className={`kp-digits ${highlight ? "kp-digits-highlight" : ""}`}>
      {values.map((v, i) => (
        <div key={i} className="kp-digit-box" aria-label={`digit ${i + 1}`}>
          {v === null ? "" : v}
        </div>
      ))}
    </div>
  );
}
