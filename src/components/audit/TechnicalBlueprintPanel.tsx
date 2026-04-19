"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { AUDIT_THEME, GOLD_SEAL, type AuditVariant } from "./auditThemes";

type Props = {
  variant: AuditVariant;
  /** Incrementa quando o painel operacional dispara feedback → desenho “acende”. */
  pulseKey: number;
  /** Selo mestre — traços e halo em dourado */
  goldSeal?: boolean;
  title?: string;
  subtitle?: string;
};

export default function TechnicalBlueprintPanel({
  variant,
  pulseKey,
  goldSeal,
  title,
  subtitle,
}: Props) {
  const t = AUDIT_THEME[variant];
  const strokeRgb = goldSeal ? GOLD_SEAL.rgb : t.rgb;
  const strokeHex = goldSeal ? GOLD_SEAL.hex : t.hex;

  const blueprint = useMemo(() => {
    if (variant === "frota") {
      return (
        <svg
          viewBox="0 0 320 240"
          className="h-full w-full max-h-[min(52vh,420px)]"
          aria-hidden
        >
          <defs>
            <linearGradient id="bp-fuel-grid" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={`rgba(${strokeRgb},0.06)`} />
              <stop offset="100%" stopColor={`rgba(${strokeRgb},0.14)`} />
            </linearGradient>
          </defs>
          <rect
            x="24"
            y="40"
            width="272"
            height="160"
            rx="12"
            fill="url(#bp-fuel-grid)"
            stroke={`rgba(${strokeRgb},0.35)`}
            strokeWidth="1.2"
          />
          {/* Caminhão esquemático */}
          <rect
            x="52"
            y="88"
            width="168"
            height="64"
            rx="6"
            fill="none"
            stroke={`rgba(${strokeRgb},0.55)`}
            strokeWidth="2"
          />
          <rect
            x="214"
            y="96"
            width="56"
            height="48"
            rx="8"
            fill="none"
            stroke={`rgba(${strokeRgb},0.45)`}
            strokeWidth="1.5"
          />
          <circle cx="78" cy="168" r="14" fill="none" stroke={`rgba(${strokeRgb},0.5)`} strokeWidth="2" />
          <circle cx="162" cy="168" r="14" fill="none" stroke={`rgba(${strokeRgb},0.5)`} strokeWidth="2" />
          <line x1="110" y1="112" x2="140" y2="112" stroke={`rgba(${strokeRgb},0.35)`} strokeWidth="1" strokeDasharray="4 6" />
          <text x="160" y="62" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="11" fontFamily="ui-monospace">
            VETOR · TANQUE · PLACA
          </text>
        </svg>
      );
    }

    return (
      <svg
        viewBox="0 0 320 240"
        className="h-full w-full max-h-[min(52vh,420px)]"
        aria-hidden
      >
        <defs>
          <linearGradient id="bp-pat-grid" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={`rgba(${strokeRgb},0.08)`} />
            <stop offset="100%" stopColor={`rgba(${strokeRgb},0.16)`} />
          </linearGradient>
        </defs>
        <rect
          x="48"
          y="36"
          width="140"
          height="168"
          rx="8"
          fill="none"
          stroke={`rgba(${strokeRgb},0.5)`}
          strokeWidth="2"
        />
        <rect
          x="200"
          y="72"
          width="72"
          height="96"
          rx="6"
          fill="url(#bp-pat-grid)"
          stroke={`rgba(${strokeRgb},0.4)`}
          strokeWidth="1.2"
        />
        <line x1="56" y1="80" x2="180" y2="80" stroke={`rgba(${strokeRgb},0.25)`} strokeWidth="1" />
        <line x1="56" y1="112" x2="180" y2="112" stroke={`rgba(${strokeRgb},0.25)`} strokeWidth="1" />
        <line x1="56" y1="144" x2="180" y2="144" stroke={`rgba(${strokeRgb},0.25)`} strokeWidth="1" />
        <circle cx="118" cy="178" r="8" fill="none" stroke={`rgba(${strokeRgb},0.45)`} strokeWidth="1.5" />
        <text x="160" y="28" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="11" fontFamily="ui-monospace">
          PLAQUETA · LOCAL · CONSERVAÇÃO
        </text>
      </svg>
    );
  }, [strokeRgb, variant]);

  return (
    <div
      className="relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#060d18]/85 p-4 shadow-[inset_0_0_60px_rgba(0,0,0,0.45)] backdrop-blur-md lg:min-h-0"
      style={{
        boxShadow: goldSeal
          ? `inset 0 0 0 1px rgba(${GOLD_SEAL.rgb},0.35), 0 0 36px rgba(${GOLD_SEAL.rgb},0.18)`
          : `inset 0 0 0 1px rgba(${t.rgb},0.12)`,
      }}
    >
      <div className="mb-2 shrink-0">
        <p className="text-[10px] font-mono tracking-[0.28em] text-white/40">
          VISUAL TÉCNICO · MARCO 1
        </p>
        <h3 className="mt-1 text-sm font-semibold tracking-wide text-white/90">
          {title ?? "Desenho reativo"}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-xs leading-snug text-white/45">{subtitle}</p>
        )}
      </div>

      <motion.div
        key={`${pulseKey}-${goldSeal ? "g" : "n"}`}
        className="relative flex min-h-0 flex-1 items-center justify-center"
        initial={{ opacity: 0.75, filter: "brightness(0.85)" }}
        animate={{
          opacity: [0.85, 1, 1],
          filter: goldSeal
            ? [
                "brightness(0.95)",
                `drop-shadow(0 0 26px ${GOLD_SEAL.hex})`,
                "brightness(1.08)",
              ]
            : [
                "brightness(0.9)",
                `drop-shadow(0 0 18px ${strokeHex})`,
                "brightness(1.05)",
              ],
        }}
        transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: goldSeal
              ? `radial-gradient(circle at 50% 45%, rgba(${GOLD_SEAL.rgb},0.35) 0%, transparent 62%)`
              : `radial-gradient(circle at 50% 45%, rgba(${t.rgb},0.2) 0%, transparent 62%)`,
          }}
        />
        <div className="relative z-[1] w-full">{blueprint}</div>
      </motion.div>

      <p className="mt-2 shrink-0 text-center text-[10px] font-mono tracking-wider text-white/30">
        {goldSeal
          ? "Camada dourada — integridade reforçada para o trâmite judicial."
          : "Operação nos 60% · luz pela marca · preenchimento técnico nos 40%."}
      </p>
    </div>
  );
}
