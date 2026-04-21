"use client";

import { motion } from "framer-motion";

export type TruckBlueprintMode =
  | {
      kind: "materialidade";
      /** Lacre/vedação, placa, hodômetro, bomba */
      litZones: [boolean, boolean, boolean, boolean];
    }
  | {
      kind: "asset";
      positive: boolean;
      plateErrorPulse?: boolean;
    }
  | {
      kind: "odometer";
      visualState: "idle" | "processing" | "success" | "warn" | "critical";
    }
  | {
      kind: "geo";
      nozzleLit: boolean;
      gallonLit?: boolean;
      outlineRedPulse?: boolean;
      shortCircuit?: boolean;
    };

type Props = {
  mode: TruckBlueprintMode;
  className?: string;
};

/**
 * Vetor técnico blueprint — caminhão em 4 zonas + variantes por módulo.
 */
export default function TruckBlueprintHD({ mode, className = "" }: Props) {
  const baseStroke = "rgba(148,163,184,0.45)";
  const neon = "rgba(16,185,129,0.95)";
  const neonSoft = "rgba(52,211,153,0.65)";

  const z = mode.kind === "materialidade" ? mode.litZones : [false, false, false, false];
  const [z0, z1, z2, z3] = mode.kind === "materialidade" ? z : [false, false, false, false];

  const assetPositive = mode.kind === "asset" && mode.positive;
  const plateErr = mode.kind === "asset" && mode.plateErrorPulse;

  const od = mode.kind === "odometer" ? mode.visualState : "idle";
  const geo = mode.kind === "geo" ? mode : null;

  return (
    <svg
      viewBox="0 0 400 220"
      className={`h-full w-full max-h-[min(48vh,400px)] ${className}`}
      aria-hidden
    >
      <defs>
        <pattern id="bp-dots" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.6" fill="rgba(52,211,153,0.08)" />
        </pattern>
        <linearGradient id="cab-front" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(15,23,42,0.9)" />
          <stop offset="100%" stopColor="rgba(30,41,59,0.95)" />
        </linearGradient>
        <filter id="neon-glow-a">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="red-glow">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="400" height="220" fill="url(#bp-dots)" opacity={0.9} />
      <rect
        x="8"
        y="8"
        width="384"
        height="204"
        rx="10"
        fill="none"
        stroke="rgba(52,211,153,0.25)"
        strokeWidth="1"
      />

      {/* Chassis */}
      <path
        d="M 52 148 L 52 132 Q 52 118 68 112 L 210 108 L 330 108 Q 352 108 358 122 L 362 148 Z"
        fill="rgba(15,23,42,0.5)"
        stroke={baseStroke}
        strokeWidth="1.2"
      />

      {/* Cabine — zona 1 frente (identificação placa) */}
      <motion.g
        animate={
          assetPositive
            ? { opacity: [0.85, 1, 0.85] }
            : od === "success"
              ? { opacity: [0.9, 1, 0.9] }
              : {}
        }
        transition={
          assetPositive
            ? { duration: 5, repeat: Infinity, ease: "easeInOut" }
            : od === "success"
              ? { duration: 6, repeat: Infinity, ease: "easeInOut" }
              : {}
        }
      >
        <rect
          x="58"
          y="72"
          width="112"
          height="56"
          rx="8"
          fill="url(#cab-front)"
          stroke={
            z1 || assetPositive
              ? neon
              : plateErr
                ? "#ef4444"
                : baseStroke
          }
          strokeWidth={z1 || assetPositive || plateErr ? 2.4 : 1.3}
          filter={z1 || assetPositive ? "url(#neon-glow-a)" : plateErr ? "url(#red-glow)" : undefined}
        />
        {/* Placa */}
        <rect
          x="88"
          y="108"
          width="52"
          height="14"
          rx="2"
          fill="rgba(15,23,42,0.95)"
          stroke={
            plateErr
              ? "#f87171"
              : z1 || assetPositive
                ? neon
                : "rgba(100,116,139,0.6)"
          }
          strokeWidth={plateErr ? 2 : 1}
        />
        {plateErr && (
          <motion.rect
            x="84"
            y="104"
            width="60"
            height="22"
            rx="3"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 0.35, repeat: Infinity }}
          />
        )}
      </motion.g>

      {/* Tanque / lacre — zona 0 */}
      <ellipse
        cx="268"
        cy="118"
        rx="56"
        ry="36"
        fill="rgba(15,23,42,0.55)"
        stroke={z0 ? neon : baseStroke}
        strokeWidth={z0 ? 2.5 : 1.2}
        filter={z0 ? "url(#neon-glow-a)" : undefined}
      />
      <circle
        cx="248"
        cy="108"
        r="8"
        fill="none"
        stroke={z0 ? neonSoft : baseStroke}
        strokeWidth="2"
      />

      {/* Painel hodômetro — zona 2 (janela cab) */}
      <rect
        x="72"
        y="82"
        width="36"
        height="22"
        rx="3"
        fill="rgba(0,0,0,0.35)"
        stroke={z2 ? neon : baseStroke}
        strokeWidth={z2 ? 2 : 1}
        filter={z2 ? "url(#neon-glow-a)" : undefined}
      />

      {/* Conexão bomba / bocal — zona 3 */}
      <path
        d="M 318 124 L 338 124 L 342 108 L 352 108 L 356 130 L 338 138 Z"
        fill="rgba(15,23,42,0.65)"
        stroke={z3 || geo?.nozzleLit ? neon : baseStroke}
        strokeWidth={z3 || geo?.nozzleLit ? 2.2 : 1.2}
        filter={z3 || geo?.nozzleLit ? "url(#neon-glow-a)" : undefined}
      />
      {geo?.shortCircuit && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.line
              key={i}
              x1={330 + i * 4}
              y1={118}
              x2={336 + i * 3}
              y2={108 + i * 5}
              stroke="#fca5a5"
              strokeWidth="1.2"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.25, repeat: Infinity, delay: i * 0.08 }}
            />
          ))}
        </>
      )}

      {/* Galão 04.B */}
      {geo && (
        <g transform="translate(195, 58)">
          <rect
            x="0"
            y="0"
            width="28"
            height="36"
            rx="4"
            fill="rgba(15,23,42,0.7)"
            stroke={geo.gallonLit ? "#86efac" : baseStroke}
            strokeWidth={geo.gallonLit ? 2 : 1}
            filter={geo.gallonLit ? "url(#neon-glow-a)" : undefined}
          />
          <path d="M 8 10 L 20 10" stroke="rgba(148,163,184,0.5)" strokeWidth="1" />
        </g>
      )}

      {/* Rodas */}
      <circle cx="92" cy="158" r="18" fill="rgba(15,23,42,0.8)" stroke={baseStroke} strokeWidth="2" />
      <circle cx="92" cy="158" r="8" fill="none" stroke="rgba(100,116,139,0.5)" />
      <circle cx="200" cy="158" r="18" fill="rgba(15,23,42,0.8)" stroke={baseStroke} strokeWidth="2" />
      <circle cx="310" cy="158" r="18" fill="rgba(15,23,42,0.8)" stroke={baseStroke} strokeWidth="2" />

      {od === "processing" && (
        <motion.rect
          x="56"
          y="78"
          width="120"
          height="48"
          rx="8"
          fill="none"
          stroke="rgba(52,211,153,0.45)"
          strokeWidth="1.5"
          animate={{ opacity: [0.35, 0.95, 0.35] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}

      {/* Pulso hodômetro — varredura */}
      {od === "success" && (
        <motion.rect
          x="58"
          y="70"
          width="4"
          height="64"
          fill="rgba(52,211,153,0.5)"
          initial={{ x: 58 }}
          animate={{ x: [58, 170, 58] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {od === "warn" && (
        <motion.rect
          x="56"
          y="68"
          width="120"
          height="68"
          rx="8"
          fill="none"
          stroke="rgba(234,179,8,0.7)"
          strokeWidth="2"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}

      {od === "critical" && (
        <motion.rect
          x="48"
          y="60"
          width="304"
          height="112"
          rx="10"
          fill="rgba(127,29,29,0.25)"
          stroke="#b91c1c"
          strokeWidth="3"
          animate={{ opacity: [1, 0.45, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}

      {geo?.outlineRedPulse && (
        <motion.rect
          x="44"
          y="56"
          width="312"
          height="120"
          rx="12"
          fill="none"
          stroke="#ef4444"
          strokeWidth="3"
          animate={{ opacity: [1, 0.35, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}

      <text
        x="200"
        y="28"
        textAnchor="middle"
        fill="rgba(148,163,184,0.55)"
        fontSize="11"
        fontFamily="ui-monospace, monospace"
      >
        VETOR TÉCNICO · BLUEPRINT AP-04
      </text>
    </svg>
  );
}
