"use client";

import { useEffect, useId, useMemo, useState } from "react";

type Props = {
  /** Comma-separated RGB, e.g. "16, 185, 129" — defaults to matrix green */
  colorRgb?: string;
  className?: string;
};

/**
 * Oscilograma estilo “matrix” na base do cartão — barras animadas continuamente.
 */
export default function CardBottomSoundWave({
  colorRgb = "57, 255, 20",
  className = "",
}: Props) {
  const uid = useId().replace(/:/g, "");
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setPhase((p) => p + 1), 72);
    return () => window.clearInterval(id);
  }, []);

  const bars = useMemo(() => {
    const n = 44;
    const cell = 100 / n;
    const t = phase * 0.11;
    return Array.from({ length: n }, (_, i) => {
      const x = i * cell + 0.04;
      const w = cell - 0.12;
      const env =
        0.52 +
        0.48 *
          Math.sin(t * 1.4 + i * 0.31) *
          Math.sin(t * 0.65 + i * 0.12 + Math.sin(i * 0.45));
      const spike = 0.18 + 0.82 * Math.abs(Math.sin(t * 2.1 + i * 0.52 + Math.cos(t + i * 0.08)));
      const amp = Math.min(1, env * spike);
      const h = 2 + amp * 42;
      return { x, w, h };
    });
  }, [phase]);

  const gid = `cbw-${uid}`;

  return (
    <div
      className={`pointer-events-none flex w-full justify-center px-[4%] pb-[2%] pt-[1%] ${className}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 100 16"
        className="h-[clamp(10px,1.8vmin,14px)] w-[min(92%,9.5rem)] overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id={gid} x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="0.35" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <line
          x1="0"
          x2="100"
          y1="8"
          y2="8"
          stroke={`rgba(${colorRgb},0.55)`}
          strokeWidth="0.35"
          vectorEffect="non-scaling-stroke"
        />
        {bars.map((b, i) => (
          <rect
            key={i}
            x={b.x}
            y={8 - b.h / 2}
            width={Math.max(0.12, b.w)}
            height={b.h}
            rx="0.15"
            fill={`rgba(${colorRgb},0.92)`}
            filter={`url(#${gid})`}
            opacity={0.75 + 0.2 * Math.sin(phase * 0.08 + i * 0.2)}
          />
        ))}
      </svg>
    </div>
  );
}
