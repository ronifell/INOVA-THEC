"use client";

import { useId } from "react";
import { motion } from "framer-motion";

/**
 * Ilustração estilizada de rosto em varredura biométrica (sem dependência de asset externo).
 */
export default function PlateScannerFaceIllustration({
  className = "",
}: {
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const gidSkin = `plate-face-skin-${uid}`;
  const gidScan = `plate-face-scan-${uid}`;
  const gidClip = `plate-face-clip-${uid}`;

  return (
    <svg
      viewBox="0 0 100 118"
      className={`select-none ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={gidSkin} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#64748b" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={gidScan} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(52,211,153,0)" />
          <stop offset="45%" stopColor="rgba(52,211,153,0.55)" />
          <stop offset="100%" stopColor="rgba(52,211,153,0)" />
        </linearGradient>
        <clipPath id={gidClip}>
          <ellipse cx="50" cy="58" rx="32" ry="40" />
        </clipPath>
      </defs>
      <ellipse
        cx="50"
        cy="58"
        rx="32"
        ry="40"
        fill={`url(#${gidSkin})`}
        stroke="rgba(52,211,153,0.45)"
        strokeWidth="1.25"
      />
      <ellipse cx="38" cy="52" rx="5" ry="6" fill="rgba(15,23,42,0.35)" />
      <ellipse cx="62" cy="52" rx="5" ry="6" fill="rgba(15,23,42,0.35)" />
      <path
        d="M 46 64 Q 50 68 54 64"
        fill="none"
        stroke="rgba(15,23,42,0.25)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <g clipPath={`url(#${gidClip})`}>
        <motion.rect
          x="14"
          width="72"
          height="10"
          fill={`url(#${gidScan})`}
          initial={{ y: 22 }}
          animate={{ y: [22, 96, 22] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ mixBlendMode: "screen" }}
        />
      </g>
      <rect
        x="12"
        y="14"
        width="76"
        height="90"
        rx="10"
        fill="none"
        stroke="rgba(52,211,153,0.25)"
        strokeWidth="0.75"
        strokeDasharray="4 3"
      />
    </svg>
  );
}
