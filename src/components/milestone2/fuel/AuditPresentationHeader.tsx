"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { generateMockHash } from "@/lib/crypto";

export type HashBarState = "spinning" | "locked" | "error";

type Props = {
  hashState: HashBarState;
  /** Quando locked, mostra este hash (64 hex). */
  lockedHash?: string;
  /** Primeiro elo da cadeia com check verde (ex.: sucesso Botão 2). */
  custodyFirstCheck?: boolean;
  /** Cor temática RGB "r, g, b" */
  accentRgb: string;
};

function spinningFragment(): string {
  return generateMockHash().slice(0, 24);
}

/**
 * Faixa superior: SHA-256 reativo + primeiro check da cadeia de custódia.
 */
export default function AuditPresentationHeader({
  hashState,
  lockedHash,
  custodyFirstCheck = false,
  accentRgb,
}: Props) {
  const [spin, setSpin] = useState(spinningFragment);

  useEffect(() => {
    if (hashState !== "spinning") return;
    const id = window.setInterval(() => {
      setSpin(spinningFragment());
    }, 45);
    return () => window.clearInterval(id);
  }, [hashState]);

  const display = useMemo(() => {
    if (hashState === "locked" && lockedHash) return lockedHash;
    if (hashState === "error" && lockedHash) return lockedHash;
    if (hashState === "spinning") return spin + "…";
    return generateMockHash();
  }, [hashState, lockedHash, spin]);

  const colorClass =
    hashState === "error"
      ? "text-red-400"
      : hashState === "locked"
        ? "text-emerald-300"
        : "text-white/85";

  return (
    <div
      className="mb-5 w-full rounded-xl border border-white/[0.08] bg-black/25 px-4 py-3.5 backdrop-blur-sm sm:px-5"
      style={{
        boxShadow: `0 0 20px rgba(${accentRgb},0.08)`,
      }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/45 sm:text-[11px]">
            SHA-256 · memorial AP-04
          </p>
          <motion.p
            key={hashState + (lockedHash ?? "")}
            className={`mt-1.5 break-all font-mono text-[11px] leading-snug tracking-tight sm:text-[12px] ${colorClass}`}
            animate={
              hashState === "spinning"
                ? { opacity: [0.92, 1, 0.92] }
                : { opacity: 1 }
            }
            transition={
              hashState === "spinning"
                ? { duration: 0.35, repeat: Infinity }
                : { duration: 0.2 }
            }
          >
            {display}
          </motion.p>
        </div>
        <div className="flex shrink-0 items-center gap-2.5 border-t border-white/[0.06] pt-2.5 sm:border-t-0 sm:pt-0">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 sm:text-[11px]">
            Cadeia de custódia
          </span>
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold ${
              custodyFirstCheck
                ? "border-emerald-400/70 bg-emerald-500/20 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.45)]"
                : hashState === "error"
                  ? "border-red-500/50 bg-red-950/40 text-red-300"
                  : "border-white/15 bg-white/5 text-white/35"
            }`}
            aria-label={custodyFirstCheck ? "Primeiro elo verificado" : "Elo pendente"}
          >
            {custodyFirstCheck ? "✓" : "○"}
          </span>
        </div>
      </div>
    </div>
  );
}
