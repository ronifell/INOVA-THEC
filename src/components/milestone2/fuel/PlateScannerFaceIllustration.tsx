"use client";

import { useId } from "react";
import { motion } from "framer-motion";

/**
 * Ilustração biométrica detalhada (malha, HUD, varredura) — vetorial, sem asset externo.
 */
export default function PlateScannerFaceIllustration({
  className = "",
}: {
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const gFace = `psf-face-${uid}`;
  const gGlow = `psf-glow-${uid}`;
  const gScan = `psf-scan-${uid}`;
  const cFace = `psf-clip-face-${uid}`;

  return (
    <svg
      viewBox="0 0 200 232"
      className={`select-none drop-shadow-[0_0_18px_rgba(52,211,153,0.22)] ${className}`}
      aria-hidden
    >
      <defs>
        <radialGradient id={gFace} cx="42%" cy="35%" r="68%">
          <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#94a3b8" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#475569" stopOpacity="0.75" />
        </radialGradient>
        <radialGradient id={gGlow} cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="rgba(52,211,153,0.35)" />
          <stop offset="70%" stopColor="rgba(52,211,153,0.06)" />
          <stop offset="100%" stopColor="rgba(52,211,153,0)" />
        </radialGradient>
        <linearGradient id={gScan} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(52,211,153,0)" />
          <stop offset="42%" stopColor="rgba(110,231,183,0.75)" />
          <stop offset="58%" stopColor="rgba(52,211,153,0.9)" />
          <stop offset="100%" stopColor="rgba(52,211,153,0)" />
        </linearGradient>
        <clipPath id={cFace}>
          <path d="M 100 36 C 62 36 38 58 36 92 C 34 118 42 142 52 168 C 58 186 72 198 100 202 C 128 198 142 186 148 168 C 158 142 166 118 164 92 C 162 58 138 36 100 36 Z" />
        </clipPath>
      </defs>

      {/* Aura externa */}
      <ellipse cx="100" cy="108" rx="88" ry="102" fill={`url(#${gGlow})`} opacity={0.9} />

      {/* Moldura HUD cantos */}
      <g stroke="rgba(52,211,153,0.55)" strokeWidth="1.2" fill="none" opacity={0.95}>
        <path d="M 22 28 L 22 48 M 22 28 L 42 28" />
        <path d="M 178 28 L 178 48 M 178 28 L 158 28" />
        <path d="M 22 188 L 22 168 M 22 188 L 42 188" />
        <path d="M 178 188 L 178 168 M 178 188 L 158 188" />
      </g>
      <text x="28" y="24" fill="rgba(52,211,153,0.85)" fontSize="8" fontFamily="ui-monospace, monospace" letterSpacing="0.14em">
        BIOMETRIC
      </text>
      <text x="118" y="24" fill="rgba(148,163,184,0.9)" fontSize="7" fontFamily="ui-monospace, monospace" textAnchor="end">
        LIVE · 60 FPS
      </text>

      {/* Contorno rosto + volume */}
      <path
        d="M 100 36 C 62 36 38 58 36 92 C 34 118 42 142 52 168 C 58 186 72 198 100 202 C 128 198 142 186 148 168 C 158 142 166 118 164 92 C 162 58 138 36 100 36 Z"
        fill={`url(#${gFace})`}
        stroke="rgba(52,211,153,0.5)"
        strokeWidth="1.35"
      />

      {/* Malha de triangulação (estilo depth / Face-ID) */}
      <g clipPath={`url(#${cFace})`} opacity={0.55}>
        <g stroke="rgba(52,211,153,0.35)" strokeWidth="0.55" fill="none">
          {[
            "M 70 78 L 100 62 L 130 78",
            "M 58 102 L 100 88 L 142 102",
            "M 52 128 L 100 112 L 148 128",
            "M 58 154 L 100 138 L 142 154",
            "M 100 62 L 100 202",
            "M 70 78 L 70 168",
            "M 130 78 L 130 168",
            "M 82 92 L 118 92",
            "M 76 118 L 124 118",
            "M 80 144 L 120 144",
          ].map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </g>

      {/* Landmarks */}
      <g fill="rgba(52,211,153,0.9)">
        <circle cx="78" cy="96" r="2.2" />
        <circle cx="122" cy="96" r="2.2" />
        <circle cx="100" cy="118" r="1.8" />
        <circle cx="86" cy="132" r="1.4" />
        <circle cx="114" cy="132" r="1.4" />
        <circle cx="100" cy="154" r="1.6" />
      </g>
      <g stroke="rgba(52,211,153,0.28)" strokeWidth="0.7" fill="none">
        <path d="M 78 96 L 100 118 L 122 96" />
        <path d="M 86 132 Q 100 142 114 132" />
      </g>

      {/* Olhos — anéis + íris */}
      <ellipse cx="78" cy="96" rx="14" ry="10" fill="none" stroke="rgba(15,23,42,0.35)" strokeWidth="1.2" />
      <ellipse cx="122" cy="96" rx="14" ry="10" fill="none" stroke="rgba(15,23,42,0.35)" strokeWidth="1.2" />
      <ellipse cx="78" cy="96" rx="7" ry="6" fill="rgba(15,23,42,0.55)" />
      <ellipse cx="122" cy="96" rx="7" ry="6" fill="rgba(15,23,42,0.55)" />
      <ellipse cx="79" cy="95" rx="2.8" ry="3.2" fill="rgba(52,211,153,0.55)" />
      <ellipse cx="123" cy="95" rx="2.8" ry="3.2" fill="rgba(52,211,153,0.55)" />
      <ellipse cx="80" cy="94" rx="1.1" ry="1.2" fill="rgba(255,255,255,0.75)" />

      {/* Boca + sombra */}
      <path
        d="M 88 156 Q 100 166 112 156"
        fill="none"
        stroke="rgba(30,41,59,0.45)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Faixa de varredura principal */}
      <g clipPath={`url(#${cFace})`}>
        <motion.rect
          x="34"
          width="132"
          height="22"
          fill={`url(#${gScan})`}
          initial={{ y: 48 }}
          animate={{ y: [48, 178, 48] }}
          transition={{ duration: 2.85, repeat: Infinity, ease: "easeInOut" }}
          style={{ mixBlendMode: "screen" }}
        />
        <motion.line
          x1="40"
          x2="160"
          stroke="rgba(167,243,208,0.85)"
          strokeWidth="1.2"
          strokeLinecap="round"
          initial={{ y1: 52, y2: 52 }}
          animate={{ y1: [52, 182, 52], y2: [52, 182, 52] }}
          transition={{ duration: 2.85, repeat: Infinity, ease: "easeInOut" }}
        />
      </g>

      {/* Retículo fino animado (parallax leve) */}
      <motion.g
        clipPath={`url(#${cFace})`}
        stroke="rgba(52,211,153,0.18)"
        strokeWidth="0.45"
        fill="none"
        initial={{ opacity: 0.35 }}
        animate={{ opacity: [0.22, 0.48, 0.22] }}
        transition={{ duration: 4.2, repeat: Infinity }}
      >
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`h${i}`} x1="40" y1={56 + i * 14} x2="160" y2={56 + i * 14} />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`v${i}`} x1={44 + i * 14} y1="52" x2={44 + i * 14} y2="188" />
        ))}
      </motion.g>

      {/* Barra de confiança */}
      <rect x="44" y="210" width="112" height="6" rx="2" fill="rgba(15,23,42,0.45)" stroke="rgba(52,211,153,0.35)" strokeWidth="0.6" />
      <motion.rect
        x="46"
        y="212"
        height="2"
        rx="1"
        fill="rgba(52,211,153,0.85)"
        initial={{ width: 70 }}
        animate={{ width: [70, 104, 82, 108] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <text x="100" y="228" textAnchor="middle" fill="rgba(148,163,184,0.95)" fontSize="7" fontFamily="ui-monospace, monospace">
        MATCH CONFIDENCE
      </text>
    </svg>
  );
}
