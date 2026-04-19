"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TechnicalBlueprintPanel from "./TechnicalBlueprintPanel";
import InovaFlowLogoKnot from "./InovaFlowLogoKnot";
import { AUDIT_THEME, GOLD_SEAL, type AuditVariant } from "./auditThemes";

type Props = {
  variant: AuditVariant;
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

function FlowRibbonDesktop({
  variant,
  pulse,
  goldSeal,
}: {
  variant: AuditVariant;
  pulse: number;
  goldSeal: boolean;
}) {
  const t = AUDIT_THEME[variant];
  const strokeRgb = goldSeal ? GOLD_SEAL.rgb : t.rgb;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[5] hidden lg:block"
      aria-hidden
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full opacity-[0.92]"
      >
        <defs>
          <linearGradient id={`flow-ribbon-${variant}`} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor={`rgba(${strokeRgb},0)`} />
            <stop offset="28%" stopColor={`rgba(${strokeRgb},0.92)`} />
            <stop offset="50%" stopColor={`rgba(${strokeRgb},1)`} />
            <stop offset="72%" stopColor={`rgba(${strokeRgb},0.85)`} />
            <stop offset="100%" stopColor={`rgba(${strokeRgb},0.15)`} />
          </linearGradient>
          <filter id={`flow-glow-${variant}`}>
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Operação (~0–52%) → nó logo (~52%) → blueprint (~62–100%) */}
        <motion.path
          key={`desk-${pulse}-${goldSeal}`}
          d="M 3 54 Q 38 14, 52 48 Q 58 62, 97 46"
          fill="none"
          stroke={`url(#flow-ribbon-${variant})`}
          strokeWidth="0.85"
          strokeLinecap="round"
          filter={`url(#flow-glow-${variant})`}
          initial={{ pathLength: 0, opacity: 0.35 }}
          animate={{
            pathLength: pulse > 0 || goldSeal ? 1 : 0.08,
            opacity: goldSeal ? 1 : pulse > 0 ? 1 : 0.35,
          }}
          transition={{ duration: goldSeal ? 1.15 : 0.88, ease: [0.22, 1, 0.36, 1] }}
        />
        {(pulse > 0 || goldSeal) && (
          <g key={`desk-dot-${pulse}-${goldSeal}`}>
            <circle r="1.35" fill={goldSeal ? GOLD_SEAL.hex : `rgb(${t.rgb})`} opacity={0.88}>
              <animateMotion
                dur={goldSeal ? "1.15s" : "0.95s"}
                repeatCount="1"
                path="M 3 54 Q 38 14, 52 48 Q 58 62, 97 46"
                fill="freeze"
              />
            </circle>
          </g>
        )}
      </svg>
    </div>
  );
}

function FlowRibbonMobile({
  variant,
  pulse,
  goldSeal,
}: {
  variant: AuditVariant;
  pulse: number;
  goldSeal: boolean;
}) {
  const t = AUDIT_THEME[variant];
  const strokeRgb = goldSeal ? GOLD_SEAL.rgb : t.rgb;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[5] lg:hidden"
      aria-hidden
    >
      <svg viewBox="0 0 40 100" preserveAspectRatio="none" className="h-full w-full opacity-90">
        <defs>
          <linearGradient id={`flow-m-${variant}`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor={`rgba(${strokeRgb},0)`} />
            <stop offset="42%" stopColor={`rgba(${strokeRgb},0.9)`} />
            <stop offset="100%" stopColor={`rgba(${strokeRgb},0.2)`} />
          </linearGradient>
        </defs>
        <motion.path
          key={`mob-${pulse}-${goldSeal}`}
          d="M 20 6 Q 32 46, 20 52 Q 8 58, 20 94"
          fill="none"
          stroke={`url(#flow-m-${variant})`}
          strokeWidth="1.8"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: pulse > 0 || goldSeal ? 1 : 0 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
    </div>
  );
}

/**
 * Passo 3 — Operação 60/40: comandos · nó INOVA THEC · blueprint.
 * Luz curva pela marca; selo mestre banha o conjunto em dourado.
 */
export default function Operational6040Workspace({
  variant,
  title,
  subtitle,
  children,
}: Props) {
  const t = AUDIT_THEME[variant];
  const [pulse, setPulse] = useState(0);
  const [goldSeal, setGoldSeal] = useState(false);
  const last = useRef(0);

  const triggerPulse = useCallback(() => {
    if (goldSeal) return;
    const now = Date.now();
    if (now - last.current < 420) return;
    last.current = now;
    setPulse((p) => p + 1);
  }, [goldSeal]);

  const activateGoldSeal = useCallback(() => {
    setGoldSeal(true);
    setPulse((p) => p + 1);
  }, []);

  return (
    <div
      className={`relative flex min-h-0 w-full flex-1 flex-col gap-6 lg:min-h-[min(72vh,680px)] ${
        goldSeal ? "audit-flow-gold-ring" : ""
      }`}
    >
      <AnimatePresence>
        {goldSeal && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-[60] rounded-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              background: `
                radial-gradient(ellipse 90% 70% at 50% 45%,
                  rgba(212,175,55,0.22) 0%,
                  rgba(212,175,55,0.06) 42%,
                  transparent 72%)
              `,
              boxShadow: `inset 0 0 80px rgba(212,175,55,0.12)`,
            }}
          />
        )}
      </AnimatePresence>

      <div className="relative grid min-h-[min(68vh,620px)] flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(64px,80px)_minmax(0,2fr)] lg:gap-x-3 lg:gap-y-0">
        <FlowRibbonDesktop variant={variant} pulse={pulse} goldSeal={goldSeal} />
        <FlowRibbonMobile variant={variant} pulse={pulse} goldSeal={goldSeal} />

        <motion.div
          layout
          className="relative z-[12] flex min-h-0 min-w-0 flex-col rounded-2xl border border-white/[0.06] bg-[#050a14]/45 backdrop-blur-sm lg:order-1"
          style={{
            boxShadow: goldSeal
              ? `inset 0 0 0 1px rgba(${GOLD_SEAL.rgb},0.35), 0 0 40px rgba(${GOLD_SEAL.rgb},0.12)`
              : `inset 0 0 0 1px rgba(${t.rgb},0.08)`,
          }}
          onPointerDownCapture={triggerPulse}
        >
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-[clamp(0.65rem,1.6vmin,1rem)] sm:p-5">
            {children}
          </div>

          <div className="shrink-0 border-t border-white/[0.07] px-4 py-3 sm:px-5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                activateGoldSeal();
              }}
              disabled={goldSeal}
              className="w-full rounded-xl border px-4 py-3 text-center text-[11px] font-mono uppercase tracking-[0.2em] transition-all disabled:cursor-default sm:text-xs"
              style={{
                borderColor: goldSeal ? `rgba(${GOLD_SEAL.rgb},0.55)` : `rgba(${t.rgb},0.35)`,
                background: goldSeal
                  ? `linear-gradient(135deg, rgba(${GOLD_SEAL.rgb},0.22), rgba(212,175,55,0.08))`
                  : `linear-gradient(135deg, rgba(${t.rgb},0.15), rgba(15,23,42,0.5))`,
                color: goldSeal ? "rgba(253,230,138,0.95)" : "rgba(255,255,255,0.88)",
                boxShadow: goldSeal
                  ? `0 0 28px rgba(${GOLD_SEAL.rgb},0.35)`
                  : `0 0 16px rgba(${t.rgb},0.12)`,
              }}
            >
              {goldSeal
                ? "Selo mestre emitido — camada dourada ativa"
                : "Botão mestre — banho dourado · fé pública"}
            </button>
          </div>
        </motion.div>

        <div className="relative z-[14] flex min-h-[100px] items-stretch justify-center lg:order-2 lg:min-h-0">
          <InovaFlowLogoKnot variant={variant} pulse={pulse} goldSeal={goldSeal} />
        </div>

        <div className="relative z-[13] flex min-h-[240px] min-w-0 lg:order-3 lg:min-h-0">
          <TechnicalBlueprintPanel
            variant={variant}
            pulseKey={pulse}
            goldSeal={goldSeal}
            title={title}
            subtitle={subtitle}
          />
        </div>
      </div>
    </div>
  );
}
