"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TechnicalBlueprintPanel from "./TechnicalBlueprintPanel";
import InovaFlowLogoKnot from "./InovaFlowLogoKnot";
import { AUDIT_THEME, GOLD_SEAL, type AuditVariant } from "./auditThemes";

type Props = {
  variant: AuditVariant;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  /** Substitui o desenho padrão do painel técnico (40%). */
  blueprintCustom?: ReactNode;
  /** Bloco opcional abaixo do blueprint (mapa, cruzamentos). */
  blueprintBelow?: ReactNode;
  /** Substitui o botão mestre da base (fé pública / protocolos). */
  footerSlot?: ReactNode;
  /**
   * Estado visual do selo dourado. Quando omitido, o botão mestre interno controla.
   * Use com `footerSlot` para protocolos com trava própria.
   */
  goldSealActive?: boolean;
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
  const strokeRgb = goldSeal ? GOLD_SEAL.rgb : t.glowRgb;

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
            <feGaussianBlur stdDeviation="1.85" result="blur" />
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
            <circle r="1.35" fill={goldSeal ? GOLD_SEAL.hex : `rgb(${t.glowRgb})`} opacity={0.92}>
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
  const strokeRgb = goldSeal ? GOLD_SEAL.rgb : t.glowRgb;

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
  blueprintCustom,
  blueprintBelow,
  footerSlot,
  goldSealActive: goldSealControlled,
}: Props) {
  const t = AUDIT_THEME[variant];
  const [pulse, setPulse] = useState(0);
  const [internalGoldSeal, setInternalGoldSeal] = useState(false);
  const goldSeal =
    goldSealControlled !== undefined ? goldSealControlled : internalGoldSeal;
  const last = useRef(0);

  const triggerPulse = useCallback(() => {
    if (goldSeal) return;
    const now = Date.now();
    if (now - last.current < 420) return;
    last.current = now;
    setPulse((p) => p + 1);
  }, [goldSeal]);

  const activateGoldSeal = useCallback(() => {
    if (goldSealControlled !== undefined) return;
    setInternalGoldSeal(true);
    setPulse((p) => p + 1);
  }, [goldSealControlled]);

  const prevGoldRef = useRef(false);
  useEffect(() => {
    if (goldSealControlled === undefined) {
      prevGoldRef.current = goldSeal;
      return;
    }
    if (goldSeal && !prevGoldRef.current) {
      setPulse((p) => p + 1);
    }
    prevGoldRef.current = goldSeal;
  }, [goldSeal, goldSealControlled]);

  return (
    <div
      className={`milestone-operational-root relative flex min-h-0 w-full flex-1 flex-col gap-[min(2.2vmin,2vh)] ${
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

      <div className="relative grid min-h-0 flex-1 grid-cols-1 gap-[min(2.2vmin,2vh)] lg:grid-cols-[minmax(0,3fr)_minmax(3.2%,4.2%)_minmax(0,2fr)] lg:gap-x-[min(1.4vmin,1.2vh)] lg:gap-y-0">
        <FlowRibbonDesktop variant={variant} pulse={pulse} goldSeal={goldSeal} />
        <FlowRibbonMobile variant={variant} pulse={pulse} goldSeal={goldSeal} />

        <motion.div
          layout
          className="milestone-detail-command-panel relative z-[12] flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#040810]/88 backdrop-blur-sm lg:order-1"
          style={{
            boxShadow: goldSeal
              ? `inset 0 0 0 1px rgba(${GOLD_SEAL.rgb},0.35), 0 0 40px rgba(${GOLD_SEAL.rgb},0.12)`
              : `inset 0 0 0 1px rgba(${t.glowRgb},0.42), 0 0 22px rgba(${t.glowRgb},0.28), 0 0 48px rgba(${t.glowRgb},0.12)`,
          }}
          onPointerDownCapture={triggerPulse}
        >
          {/* Centra blocos operacionais no “meio” dos 60%, sem colar à esquerda */}
          <div className="flex min-h-0 flex-1 justify-center overflow-hidden px-[min(2.2%,1.6vmin)] pb-[min(1.8%,1.4vmin)] pt-[min(2.4%,1.8vmin)] sm:px-[min(2.8%,2.2vmin)] sm:pb-[min(2.2%,1.8vmin)] sm:pt-[min(3%,2.4vmin)]">
            <div className="flex h-full w-full max-w-[99%] flex-col items-center gap-y-[min(3.2%,2.8vmin)] [&>*]:w-full">
              {children}
            </div>
          </div>

          <div className="milestone-detail-command-footer shrink-0 border-t border-white/[0.07] px-[min(2.6%,2vmin)] py-[min(2.6%,2vmin)] sm:px-[min(3%,2.4vmin)] sm:py-[min(2.4%,2vmin)]">
            {footerSlot ?? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  activateGoldSeal();
                }}
                disabled={goldSeal}
                className="w-full rounded-xl border px-5 py-4 text-center text-[12px] font-mono uppercase tracking-[0.2em] transition-all disabled:cursor-default sm:text-[13px]"
                style={{
                  borderColor: goldSeal ? `rgba(${GOLD_SEAL.rgb},0.55)` : `rgba(${t.glowRgb},0.55)`,
                  background: goldSeal
                    ? `linear-gradient(135deg, rgba(${GOLD_SEAL.rgb},0.22), rgba(212,175,55,0.08))`
                    : variant === "patrimonio"
                      ? `linear-gradient(135deg, rgba(${t.glowRgb},0.24), rgba(4,10,22,0.9))`
                      : `linear-gradient(135deg, rgba(${t.glowRgb},0.22), rgba(0,8,6,0.88))`,
                  color: goldSeal
                    ? "rgba(253,230,138,0.95)"
                    : variant === "patrimonio"
                      ? "rgba(224,242,254,0.92)"
                      : "rgba(220,255,235,0.92)",
                  boxShadow: goldSeal
                    ? `0 0 28px rgba(${GOLD_SEAL.rgb},0.35)`
                    : `0 0 20px rgba(${t.glowRgb},0.35), 0 0 40px rgba(${t.glowRgb},0.15), inset 0 0 0 1px rgba(${t.glowRgb},0.12)`,
                }}
              >
                {goldSeal
                  ? "Selo mestre emitido — camada dourada ativa"
                  : "Botão mestre — banho dourado · fé pública"}
              </button>
            )}
          </div>
        </motion.div>

        <div className="relative z-[14] flex min-h-[12%] items-stretch justify-center lg:order-2 lg:min-h-0">
          <InovaFlowLogoKnot variant={variant} pulse={pulse} goldSeal={goldSeal} />
        </div>

        <div className="relative z-[13] flex min-h-[28%] min-w-0 items-center justify-center lg:order-3 lg:min-h-0">
          <TechnicalBlueprintPanel
            variant={variant}
            pulseKey={pulse}
            goldSeal={goldSeal}
            title={title}
            subtitle={subtitle}
            customBlueprint={blueprintCustom}
            belowBlueprint={blueprintBelow}
          />
        </div>
      </div>
    </div>
  );
}
