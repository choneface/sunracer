import React, { useEffect, useState } from "react";

export default function LoadingDots({
  intervalMs = 350,
}: {
  intervalMs?: number;
}) {
  const [n, setN] = useState(1);
  useEffect(() => {
    const id = window.setInterval(() => setN((v) => (v % 3) + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return <span>{".".repeat(n)}</span>;
}
