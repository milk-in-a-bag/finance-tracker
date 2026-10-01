"use client";

import { useState, useEffect } from "react";

interface DeltaBadgeProps {
  current: number;
  prev: number | undefined;
  unit?: "ksh" | "count";
}

const DISPLAY_MS = 30000; // how long each value is shown
const FADE_MS = 600; // crossfade duration

export function DeltaBadge({ current, prev, unit }: DeltaBadgeProps) {
  // which value is "active" (0 = pct, 1 = abs)
  const [active, setActive] = useState(0);
  // opacity of the active slot (drives the fade)
  const [opacity, setOpacity] = useState(1);

  const hasPrev = prev != null && prev > 0;
  const diff = prev != null ? current - prev : current;
  const pct = hasPrev ? ((current - prev!) / prev!) * 100 : null;

  // Only run the cycle when we have both values to show
  useEffect(() => {
    if (pct === null) return;

    const cycle = setInterval(() => {
      // Fade out
      setOpacity(0);
      setTimeout(() => {
        // Swap value while invisible
        setActive((v) => (v === 0 ? 1 : 0));
        // Fade back in
        setOpacity(1);
      }, FADE_MS);
    }, DISPLAY_MS);

    return () => clearInterval(cycle);
  }, [pct]);

  const isNeutral = diff === 0;
  const isGood = diff < 0;
  const colorClass = isNeutral
    ? "text-muted-foreground"
    : isGood
      ? "text-emerald-400"
      : "text-rose-400";

  const absLabel =
    unit === "ksh"
      ? `Ksh ${Math.abs(diff).toFixed(2)}`
      : String(Math.abs(diff));

  const label =
    pct !== null && active === 0 ? `${Math.abs(pct).toFixed(1)}%` : absLabel;

  const Arrow = () => {
    if (isNeutral) return null;
    return isGood ? (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 shrink-0">
        <path d="M8,12 L2,5 L14,5 Z" />
      </svg>
    ) : (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 shrink-0">
        <path d="M8,4 L14,11 L2,11 Z" />
      </svg>
    );
  };

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums ${colorClass}`}
      style={{
        opacity,
        transition: `opacity ${FADE_MS}ms ease-in-out`,
      }}
    >
      <Arrow />
      {label}
    </span>
  );
}
