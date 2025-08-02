import { useEffect, useState } from "react";

/**
 * Types text out character‑by‑character.
 * @returns [currentText, isFinished]
 */
export default function useTypewriter(
  fullText: string,
  charDelay = 30, // ms between chars
) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0); // restart whenever text changes
    const timer = setInterval(() => {
      setIdx((i) => {
        if (i >= fullText.length) {
          clearInterval(timer);
          return i;
        }
        return i + 1;
      });
    }, charDelay);

    return () => clearInterval(timer); // cleanup on unmount/re‑render
  }, [fullText, charDelay]);

  return [fullText.slice(0, idx), idx >= fullText.length] as const;
}
