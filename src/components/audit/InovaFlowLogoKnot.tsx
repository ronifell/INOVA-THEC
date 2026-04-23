"use client";

import { motion } from "framer-motion";
import { AUDIT_THEME, type AuditVariant } from "./auditThemes";

type Props = {
  variant: AuditVariant;
  /** Pulso sincronizado com o ribbon de luz */
  pulse: number;
  goldSeal?: boolean;
};

/**
 * Nó central da marca (espelho do Header): a luz do operacional curva aqui antes de ir ao blueprint.
 */
export default function InovaFlowLogoKnot({
  variant,
  pulse,
  goldSeal,
}: Props) {
  const t = AUDIT_THEME[variant];

  return (
    <div className="relative flex h-full min-h-[100px] w-full flex-col items-center justify-center gap-1 px-1 lg:min-h-[min(360px,52vh)]">
      <motion.div
        key={`knot-${pulse}-${goldSeal}`}
        className="relative flex aspect-square w-[clamp(2.75rem,5.5vmin,3.75rem)] items-center justify-center rounded-full border border-white/10"
        style={{
          boxShadow: goldSeal
            ? "0 0 28px rgba(212,175,55,0.65), inset 0 0 20px rgba(212,175,55,0.25)"
            : `0 0 26px rgba(${t.glowRgb},0.55), 0 0 48px rgba(${t.glowRgb},0.2), inset 0 0 16px rgba(${t.glowRgb},0.18)`,
          borderColor: goldSeal ? "rgba(212,175,55,0.55)" : `rgba(${t.glowRgb},0.5)`,
        }}
        animate={
          goldSeal
            ? { scale: [1, 1.06, 1] }
            : pulse > 0
              ? { scale: [1, 1.08, 1] }
              : { scale: 1 }
        }
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        <span
          className={`relative z-[1] bg-clip-text text-[clamp(0.65rem,1.2vmin,0.85rem)] font-black tracking-tighter text-transparent ${
            goldSeal
              ? "bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-600"
              : variant === "patrimonio"
                ? "bg-gradient-to-br from-white via-blue-200 to-indigo-400"
                : "bg-gradient-to-br from-white via-emerald-200 to-cyan-300"
          }`}
        >
          IT
        </span>
        <span
          className="pointer-events-none absolute inset-0 rounded-full opacity-60 blur-md"
          style={{
            background: goldSeal
              ? "radial-gradient(circle, rgba(212,175,55,0.5) 0%, transparent 70%)"
              : `radial-gradient(circle, rgba(${t.glowRgb},0.42) 0%, transparent 72%)`,
          }}
        />
      </motion.div>
      <p className="max-w-[4.5rem] text-center text-[8px] font-mono leading-tight tracking-[0.12em] text-white/35">
        INOVA THEC
      </p>
    </div>
  );
}
