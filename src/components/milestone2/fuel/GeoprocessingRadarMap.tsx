"use client";

import { motion } from "framer-motion";

type Props = {
  /** Raio em metros para o círculo (visual). */
  radiusM?: number;
  variant?: "idle" | "success" | "error";
  /** Distância de erro em metros (modo vermelho). */
  errorDistanceM?: number;
  className?: string;
};

/**
 * Mapa verde estilo geoprocessamento: grade radar + setas neon vermelhas (perícia).
 */
export default function GeoprocessingRadarMap({
  radiusM = 500,
  variant = "idle",
  errorDistanceM = 800,
  className = "",
}: Props) {
  const ringColor =
    variant === "success"
      ? "rgba(16,185,129,0.95)"
      : variant === "error"
        ? "rgba(239,68,68,0.95)"
        : "rgba(52,211,153,0.55)";

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-emerald-500/25 bg-[#021208]/90 ${className}`}
      style={{
        boxShadow:
          variant === "success"
            ? "0 0 28px rgba(16,185,129,0.25), inset 0 0 40px rgba(16,185,129,0.08)"
            : variant === "error"
              ? "0 0 28px rgba(239,68,68,0.3), inset 0 0 40px rgba(239,68,68,0.1)"
              : "inset 0 0 30px rgba(0,0,0,0.5)",
      }}
    >
      <svg
        viewBox="0 0 200 200"
        className="h-[min(200px,28vh)] w-full"
        aria-hidden
      >
        <defs>
          <pattern id="radar-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="rgba(52,211,153,0.12)"
              strokeWidth="0.5"
            />
          </pattern>
          <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(16,185,129,0.15)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <filter id="geo-radar-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="200" height="200" fill="url(#radar-grid)" />
        <rect width="200" height="200" fill="url(#radar-glow)" />
        <circle
          cx="100"
          cy="100"
          r="78"
          fill="none"
          stroke="rgba(52,211,153,0.2)"
          strokeWidth="0.6"
        />
        <motion.circle
          cx="100"
          cy="100"
          r="62"
          fill="none"
          stroke={ringColor}
          strokeWidth={variant === "error" ? 2.2 : 1.4}
          initial={false}
          animate={{
            opacity: variant === "idle" ? [0.4, 0.85, 0.4] : 1,
            strokeWidth: variant === "error" ? [2, 3.2, 2] : 1.4,
          }}
          transition={{
            duration: variant === "idle" ? 4 : 1,
            repeat: variant === "idle" ? Infinity : 2,
          }}
        />
        {/* Ponto perícia */}
        <circle cx="100" cy="88" r="5" fill="#10b981" filter="url(#geo-radar-glow)" />
        {/* Posto */}
        <circle cx="128" cy="118" r="4" fill="#f87171" opacity={0.95} />
        {/* Seta neon vermelha */}
        <motion.path
          d="M 100 88 L 122 112"
          fill="none"
          stroke="#ff0033"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1, opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          style={{
            filter: "drop-shadow(0 0 6px rgba(255,0,51,0.9))",
          }}
        />
        <polygon points="122,112 118,108 124,106" fill="#ff0033" opacity={0.95} />
      </svg>
      <div className="absolute bottom-1 left-0 right-0 px-2 pb-2 text-center">
        <p className="font-mono text-[9px] uppercase tracking-wider text-emerald-400/80">
          Grade radar · {radiusM}m
          {variant === "error" && (
            <span className="ml-2 text-red-400">
              Δ {errorDistanceM}m fora do perímetro
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
