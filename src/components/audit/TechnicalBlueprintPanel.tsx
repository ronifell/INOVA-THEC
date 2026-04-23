"use client";

import { useMemo, type ReactNode } from "react";
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
  /** Substitui o SVG padrão (vetor técnico HD, etc.). */
  customBlueprint?: ReactNode;
  /** Conteúdo abaixo do desenho (mapa radar, miniaturas). */
  belowBlueprint?: ReactNode;
};

export default function TechnicalBlueprintPanel({
  variant,
  pulseKey,
  goldSeal,
  title,
  subtitle,
  customBlueprint,
  belowBlueprint,
}: Props) {
  const t = AUDIT_THEME[variant];
  const strokeRgb = goldSeal ? GOLD_SEAL.rgb : t.glowRgb;
  const strokeHex = goldSeal ? GOLD_SEAL.hex : t.glowHex;

  const blueprint = useMemo(() => {
    if (customBlueprint) {
      return customBlueprint;
    }
    if (variant === "frota") {
      const S = `rgba(${strokeRgb}`;
      return (
        <svg
          viewBox="0 0 420 280"
          className="h-full w-full max-h-[min(54vh,440px)]"
          aria-hidden
        >
          <defs>
            <pattern id="bp-frota-eng-grid" width="14" height="14" patternUnits="userSpaceOnUse">
              <path
                d="M 14 0 L 0 0 0 14"
                fill="none"
                stroke={`${S},0.11)`}
                strokeWidth="0.45"
              />
            </pattern>
            <linearGradient id="bp-frota-tank" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={`${S},0.38)`} />
              <stop offset="35%" stopColor={`${S},0.06)`} />
              <stop offset="70%" stopColor={`${S},0.12)`} />
              <stop offset="100%" stopColor={`${S},0.34)`} />
            </linearGradient>
            <linearGradient id="bp-frota-cab" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={`${S},0.2)`} />
              <stop offset="100%" stopColor={`${S},0.45)`} />
            </linearGradient>
            <linearGradient id="bp-frota-road" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={`${S},0.25)`} />
              <stop offset="100%" stopColor={`${S},0.06)`} />
            </linearGradient>
            <filter id="bp-frota-glow" x="-8%" y="-8%" width="116%" height="116%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect x="8" y="8" width="404" height="264" rx="14" fill="url(#bp-frota-eng-grid)" opacity="0.9" />
          <rect
            x="8"
            y="8"
            width="404"
            height="264"
            rx="14"
            fill="none"
            stroke={`${S},0.45)`}
            strokeWidth="1.15"
          />

          <g filter="url(#bp-frota-glow)">
            {/* Chassis */}
            <path
              d="M 52 198 L 368 198 L 368 206 L 52 206 Z"
              fill={`${S},0.12)`}
              stroke={`${S},0.55)`}
              strokeWidth="1.4"
            />
            <path
              d="M 58 198 L 58 188 M 118 198 L 118 188 M 198 198 L 198 188 M 278 198 L 278 188 M 338 198 L 338 188"
              stroke={`${S},0.35)`}
              strokeWidth="1"
            />

            {/* Cabine */}
            <path
              d="M 56 188 L 56 128 L 118 118 L 132 118 L 132 188 Z"
              fill="url(#bp-frota-cab)"
              stroke={`${S},0.72)`}
              strokeWidth="1.6"
            />
            <path d="M 66 128 L 122 122" stroke={`${S},0.35)`} strokeWidth="0.9" />
            <rect x="68" y="134" width="38" height="28" rx="3" fill="none" stroke={`${S},0.5)`} strokeWidth="1" />
            <path d="M 108 138 L 124 136" stroke={`${S},0.4)`} strokeWidth="1" />
            <rect x="72" y="168" width="44" height="18" rx="2" fill="none" stroke={`${S},0.42)`} strokeWidth="0.9" />

            {/* Tanque cilíndrico + domos */}
            <ellipse cx="228" cy="152" rx="92" ry="38" fill="url(#bp-frota-tank)" stroke={`${S},0.65)`} strokeWidth="1.5" />
            <ellipse cx="142" cy="152" rx="10" ry="36" fill="none" stroke={`${S},0.55)`} strokeWidth="1.2" />
            <ellipse cx="314" cy="152" rx="10" ry="36" fill="none" stroke={`${S},0.55)`} strokeWidth="1.2" />
            <path
              d="M 150 124 L 306 124 M 150 180 L 306 180"
              stroke={`${S},0.4)`}
              strokeWidth="0.85"
              strokeDasharray="5 4"
            />
            {/* Anéis de reforço */}
            <ellipse cx="188" cy="152" rx="4" ry="34" fill="none" stroke={`${S},0.38)`} strokeWidth="0.8" />
            <ellipse cx="228" cy="152" rx="4" ry="34" fill="none" stroke={`${S},0.38)`} strokeWidth="0.8" />
            <ellipse cx="268" cy="152" rx="4" ry="34" fill="none" stroke={`${S},0.38)`} strokeWidth="0.8" />
            {/* Escotilha / bocal */}
            <rect x="212" y="108" width="36" height="14" rx="3" fill={`${S},0.15)`} stroke={`${S},0.55)`} strokeWidth="1" />
            <circle cx="230" cy="115" r="4" fill="none" stroke={`${S},0.5)`} strokeWidth="0.9" />
            {/* Mangueira / braço */}
            <path
              d="M 318 140 Q 352 96 378 108 Q 392 114 388 132"
              fill="none"
              stroke={`${S},0.5)`}
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <circle cx="386" cy="130" r="6" fill={`${S},0.1)`} stroke={`${S},0.55)`} strokeWidth="1" />

            {/* Rodas */}
            {[
              [92, 206],
              [152, 206],
              [218, 206],
              [288, 206],
              [338, 206],
            ].map(([cx, cy], i) => (
              <g key={`w-${i}`}>
                <circle cx={cx} cy={cy} r="19" fill={`${S},0.08)`} stroke={`${S},0.55)`} strokeWidth="1.4" />
                <circle cx={cx} cy={cy} r="11" fill="none" stroke={`${S},0.35)`} strokeWidth="0.9" />
                <circle cx={cx} cy={cy} r="4" fill={`${S},0.2)`} stroke={`${S},0.45)`} strokeWidth="0.6" />
              </g>
            ))}

            {/* Placa (traseira) */}
            <rect x="322" y="168" width="72" height="26" rx="4" fill={`${S},0.12)`} stroke={`${S},0.62)`} strokeWidth="1.2" />
            <text
              x="358"
              y="185"
              textAnchor="middle"
              fill={`${S},0.85)`}
              fontSize="11"
              fontFamily="ui-monospace"
              fontWeight="600"
              letterSpacing="0.14em"
            >
              ABC-1D34
            </text>
            <path d="M 358 158 L 358 148" stroke={`${S},0.45)`} strokeWidth="0.9" />
            <path d="M 340 148 L 376 148" stroke={`${S},0.45)`} strokeWidth="0.9" />

            {/* Vetor GPS — arco tracejado */}
            <path
              d="M 96 72 Q 210 28 340 56"
              fill="none"
              stroke={`${S},0.45)`}
              strokeWidth="1.1"
              strokeDasharray="6 5"
              strokeLinecap="round"
            />
            <circle cx="340" cy="56" r="5" fill={`${S},0.15)`} stroke={`${S},0.6)`} strokeWidth="1" />
            <path d="M 336 52 L 344 60 M 344 52 L 336 60" stroke={`${S},0.55)`} strokeWidth="0.8" />

            {/* Cotas */}
            <path d="M 140 220 L 316 220" stroke={`${S},0.35)`} strokeWidth="0.75" />
            <path d="M 140 216 L 140 224 M 316 216 L 316 224" stroke={`${S},0.35)`} strokeWidth="0.75" />
            <text x="228" y="234" textAnchor="middle" fill={`${S},0.5)`} fontSize="9" fontFamily="ui-monospace">
              eixo tanque · 1760 mm (não escala)
            </text>

            {/* Pista */}
            <rect x="24" y="214" width="372" height="22" rx="4" fill="url(#bp-frota-road)" stroke={`${S},0.25)`} strokeWidth="0.8" />
          </g>

          <text
            x="210"
            y="34"
            textAnchor="middle"
            fill={`${S},0.88)`}
            fontSize="12"
            fontFamily="ui-monospace"
            fontWeight="600"
            letterSpacing="0.12em"
          >
            VETOR · TANQUE · PLACA
          </text>
          <text
            x="210"
            y="50"
            textAnchor="middle"
            fill={`${S},0.45)`}
            fontSize="8.5"
            fontFamily="ui-monospace"
            letterSpacing="0.18em"
          >
            AP-04 · VISTA LATERAL ESQUEMÁTICA · AUDITORIA DE COMBUSTÍVEL
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
            <stop offset="0%" stopColor={`rgba(${strokeRgb},0.12)`} />
            <stop offset="100%" stopColor={`rgba(${strokeRgb},0.24)`} />
          </linearGradient>
        </defs>
        <rect
          x="48"
          y="36"
          width="140"
          height="168"
          rx="8"
          fill="none"
          stroke={`rgba(${strokeRgb},0.72)`}
          strokeWidth="2"
        />
        <rect
          x="200"
          y="72"
          width="72"
          height="96"
          rx="6"
          fill="url(#bp-pat-grid)"
          stroke={`rgba(${strokeRgb},0.58)`}
          strokeWidth="1.2"
        />
        <line x1="56" y1="80" x2="180" y2="80" stroke={`rgba(${strokeRgb},0.42)`} strokeWidth="1" />
        <line x1="56" y1="112" x2="180" y2="112" stroke={`rgba(${strokeRgb},0.42)`} strokeWidth="1" />
        <line x1="56" y1="144" x2="180" y2="144" stroke={`rgba(${strokeRgb},0.42)`} strokeWidth="1" />
        <circle cx="118" cy="178" r="8" fill="none" stroke={`rgba(${strokeRgb},0.65)`} strokeWidth="1.5" />
        <text x="160" y="28" textAnchor="middle" fill={`rgba(${strokeRgb},0.78)`} fontSize="11" fontFamily="ui-monospace">
          PLAQUETA · LOCAL · CONSERVAÇÃO
        </text>
      </svg>
    );
  }, [customBlueprint, strokeRgb, variant]);

  return (
    <div
      className="milestone-detail-blueprint-shell relative flex h-full min-h-[260px] w-full max-w-[520px] flex-col items-center overflow-hidden rounded-2xl border border-white/[0.08] bg-[#030a0c]/92 p-4 text-center shadow-[inset_0_0_60px_rgba(0,0,0,0.55)] backdrop-blur-md lg:min-h-0 lg:max-w-none lg:self-stretch"
      style={{
        boxShadow: goldSeal
          ? `inset 0 0 0 1px rgba(${GOLD_SEAL.rgb},0.35), 0 0 36px rgba(${GOLD_SEAL.rgb},0.18)`
          : `inset 0 0 0 1px rgba(${t.glowRgb},0.45), 0 0 24px rgba(${t.glowRgb},0.28), 0 0 52px rgba(${t.glowRgb},0.12)`,
      }}
    >
      <div className="mb-2 w-full shrink-0">
        <p
          className="text-[10px] font-mono tracking-[0.28em] text-white/55"
          style={{ textShadow: `0 0 10px rgba(${strokeRgb},0.4)` }}
        >
          VISUAL TÉCNICO · MARCO 1
        </p>
        <h3
          className="mt-1 text-sm font-semibold tracking-wide text-white/95"
          style={{ textShadow: `0 0 14px rgba(${strokeRgb},0.48), 0 0 28px rgba(${strokeRgb},0.2)` }}
        >
          {title ?? "Desenho reativo"}
        </h3>
        {subtitle && (
          <p
            className="mt-0.5 text-xs leading-snug text-white/65"
            style={{ textShadow: `0 0 8px rgba(${strokeRgb},0.28)` }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <motion.div
        key={`${pulseKey}-${goldSeal ? "g" : "n"}`}
        className="relative flex min-h-0 w-full flex-1 items-center justify-center"
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

      {belowBlueprint && (
        <div className="mt-3 w-full shrink-0">{belowBlueprint}</div>
      )}

      <p className="mt-2 shrink-0 text-center text-[10px] font-mono tracking-wider text-white/30">
        {goldSeal
          ? "Camada dourada — integridade reforçada para o trâmite judicial."
          : "Operação nos 60% · luz pela marca · preenchimento técnico nos 40%."}
      </p>
    </div>
  );
}
