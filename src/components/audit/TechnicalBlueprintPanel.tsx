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

            {/* Cabine — perfil lateral moderno (defletor, vidros, espelho, grelha) */}
            <path
              d="M 56 188 L 56 134 L 62 122 L 72 114 L 92 108 L 118 106 L 132 108 L 132 188 Z"
              fill="url(#bp-frota-cab)"
              stroke={`${S},0.72)`}
              strokeWidth="1.6"
            />
            {/* Defletor aerodinâmico / spoiler de teto */}
            <path
              d="M 70 112 L 118 104 L 128 108 L 128 114 L 74 120 Z"
              fill={`${S},0.12)`}
              stroke={`${S},0.4)`}
              strokeWidth="0.85"
            />
            {/* Para-brisa + coluna A */}
            <path
              d="M 60 128 L 60 148 Q 62 168 78 176 L 118 182"
              fill="none"
              stroke={`${S},0.45)`}
              strokeWidth="1"
            />
            <path
              d="M 60 128 L 88 118 L 118 114 L 118 168 L 72 162 Q 60 154 60 140 Z"
              fill={`${S},0.06)`}
              stroke={`${S},0.5)`}
              strokeWidth="0.9"
            />
            <path d="M 78 124 L 78 166" stroke={`${S},0.28)`} strokeWidth="0.65" strokeDasharray="3 2" />
            {/* Janela lateral + vão de porta */}
            <rect x="88" y="132" width="34" height="26" rx="2.5" fill={`${S},0.05)`} stroke={`${S},0.48)`} strokeWidth="0.95" />
            <path d="M 105 132 L 105 158" stroke={`${S},0.3)`} strokeWidth="0.55" />
            {/* Espelho retrovisor */}
            <path d="M 128 138 L 142 132" stroke={`${S},0.5)`} strokeWidth="1" />
            <ellipse cx="146" cy="130" rx="5" ry="3.5" fill={`${S},0.08)`} stroke={`${S},0.55)`} strokeWidth="0.85" transform="rotate(-18 146 130)" />
            {/* Grelha frontal + faróis */}
            <path d="M 58 172 L 58 184 M 62 174 L 62 186" stroke={`${S},0.35)`} strokeWidth="0.7" />
            <path
              d="M 56 176 L 72 174 L 72 188 L 56 188 Z"
              fill={`${S},0.08)`}
              stroke={`${S},0.42)`}
              strokeWidth="0.8"
            />
            <circle cx="64" cy="180" r="2.2" fill={`${S},0.25)`} stroke={`${S},0.55)`} strokeWidth="0.5" />
            <circle cx="64" cy="186" r="2.2" fill={`${S},0.25)`} stroke={`${S},0.55)`} strokeWidth="0.5" />
            {/* Degrau + para-choque */}
            <path d="M 72 188 L 128 188 L 128 194 L 70 194 Z" fill={`${S},0.1)`} stroke={`${S},0.38)`} strokeWidth="0.75" />
            <path d="M 68 194 L 132 194" stroke={`${S},0.35)`} strokeWidth="1.1" />
            <rect x="72" y="168" width="48" height="14" rx="2" fill="none" stroke={`${S},0.38)`} strokeWidth="0.75" />

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

    const P = `rgba(${strokeRgb}`;
    return (
      <svg
        viewBox="0 0 420 280"
        className="h-full w-full max-h-[min(54vh,440px)]"
        aria-hidden
      >
        <defs>
          <pattern id="bp-pat-eng-grid" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M 12 0 L 0 0 0 12" fill="none" stroke={`${P},0.1)`} strokeWidth="0.4" />
          </pattern>
          <linearGradient id="bp-pat-plaque" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`${P},0.22)`} />
            <stop offset="50%" stopColor={`${P},0.06)`} />
            <stop offset="100%" stopColor={`${P},0.2)`} />
          </linearGradient>
          <linearGradient id="bp-pat-map" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`${P},0.14)`} />
            <stop offset="100%" stopColor={`${P},0.05)`} />
          </linearGradient>
          <filter id="bp-pat-soft" x="-6%" y="-6%" width="112%" height="112%">
            <feGaussianBlur stdDeviation="0.9" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="bp-pat-arr" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M 0 0 L 5 2.5 L 0 5 Z" fill={`${P},0.45)`} />
          </marker>
        </defs>

        <rect x="10" y="10" width="400" height="260" rx="14" fill="url(#bp-pat-eng-grid)" opacity="0.92" />
        <rect x="10" y="10" width="400" height="260" rx="14" fill="none" stroke={`${P},0.42)`} strokeWidth="1.1" />

        <g filter="url(#bp-pat-soft)">
          {/* — PLAQUETA: chapa metálica + rebites + QR + código de barras */}
          <rect x="28" y="58" width="118" height="168" rx="10" fill="url(#bp-pat-plaque)" stroke={`${P},0.62)`} strokeWidth="1.35" />
          <circle cx="40" cy="72" r="2.2" fill="none" stroke={`${P},0.45)`} strokeWidth="0.7" />
          <circle cx="134" cy="72" r="2.2" fill="none" stroke={`${P},0.45)`} strokeWidth="0.7" />
          <circle cx="40" cy="210" r="2.2" fill="none" stroke={`${P},0.45)`} strokeWidth="0.7" />
          <circle cx="134" cy="210" r="2.2" fill="none" stroke={`${P},0.45)`} strokeWidth="0.7" />
          <rect x="44" y="78" width="86" height="22" rx="3" fill={`${P},0.08)`} stroke={`${P},0.4)`} strokeWidth="0.75" />
          <text x="87" y="93" textAnchor="middle" fill={`${P},0.75)`} fontSize="9" fontFamily="ui-monospace" fontWeight="600" letterSpacing="0.14em">
            SIG-PAT / SHA-256
          </text>
          <rect x="48" y="108" width="34" height="34" rx="3" fill={`${P},0.06)`} stroke={`${P},0.48)`} strokeWidth="0.85" />
          {[0, 1, 2, 3, 4].flatMap((row) =>
            [0, 1, 2, 3, 4].map((col) => (
              <rect
                key={`qr-${row}-${col}`}
                x={50 + col * 6}
                y={110 + row * 6}
                width="4"
                height="4"
                rx="0.5"
                fill={((row + col) % 3 === 0) || (row === 2 && col === 2) ? `${P},0.35)` : `${P},0.08)`}
              />
            ))
          )}
          <rect x="90" y="108" width="48" height="34" rx="2" fill={`${P},0.05)`} stroke={`${P},0.35)`} strokeWidth="0.65" />
          {Array.from({ length: 18 }).map((_, i) => (
            <line
              key={`bar-${i}`}
              x1={92 + i * 2.5}
              y1="114"
              x2={92 + i * 2.5}
              y2={118 + (i % 5) * 3.2}
              stroke={`${P},0.55)`}
              strokeWidth="1.1"
            />
          ))}
          <path d="M 44 152 L 130 152" stroke={`${P},0.35)`} strokeWidth="0.6" strokeDasharray="4 3" />
          <text x="87" y="172" textAnchor="middle" fill={`${P},0.5)`} fontSize="7.5" fontFamily="ui-monospace">
            TOMBO · INPI · CADEIA
          </text>
          <rect x="44" y="182" width="86" height="36" rx="4" fill={`${P},0.06)`} stroke={`${P},0.38)`} strokeWidth="0.7" />
          <path d="M 52 198 L 122 198 M 52 204 L 108 204 M 52 210 L 116 210" stroke={`${P},0.32)`} strokeWidth="0.8" />

          {/* — LOCAL: grelha WGS + alfinete + cerca */}
          <rect x="162" y="58" width="118" height="168" rx="10" fill="url(#bp-pat-map)" stroke={`${P},0.55)`} strokeWidth="1.2" />
          <path d="M 170 88 L 272 88 M 170 118 L 272 118 M 170 148 L 272 148 M 170 178 L 272 178" stroke={`${P},0.22)`} strokeWidth="0.55" />
          <path d="M 188 70 L 188 210 M 218 70 L 218 210 M 248 70 L 248 210" stroke={`${P},0.22)`} strokeWidth="0.55" />
          <circle cx="221" cy="138" r="34" fill="none" stroke={`${P},0.28)`} strokeWidth="0.85" strokeDasharray="5 4" />
          <path
            d="M 221 118 L 228 132 L 242 134 L 232 144 L 235 158 L 221 150 L 207 158 L 210 144 L 200 134 L 214 132 Z"
            fill={`${P},0.12)`}
            stroke={`${P},0.65)`}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <circle cx="221" cy="138" r="4" fill={`${P},0.25)`} stroke={`${P},0.55)`} strokeWidth="0.8" />
          <text x="221" y="196" textAnchor="middle" fill={`${P},0.48)`} fontSize="7.5" fontFamily="ui-monospace">
            SIRGAS2000 · UTM 22S
          </text>

          {/* — CONSERVAÇÃO: indicador semicircular */}
          <rect x="296" y="58" width="96" height="168" rx="10" fill={`${P},0.06)`} stroke={`${P},0.52)`} strokeWidth="1.15" />
          <path
            d="M 318 198 A 46 46 0 1 1 370 198"
            fill="none"
            stroke={`${P},0.35)`}
            strokeWidth="1.1"
          />
          <path
            d="M 318 198 A 46 46 0 0 1 352 142"
            fill="none"
            stroke={`${P},0.55)`}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {[0, 30, 60, 90, 120].map((deg) => {
            const rad = ((deg - 90) * Math.PI) / 180;
            const cx = 344 + Math.cos(rad) * 40;
            const cy = 198 + Math.sin(rad) * 40;
            return (
              <line
                key={deg}
                x1={344 + Math.cos(rad) * 34}
                y1={198 + Math.sin(rad) * 34}
                x2={cx}
                y2={cy}
                stroke={`${P},0.4)`}
                strokeWidth="0.7"
              />
            );
          })}
          <line x1="344" y1="198" x2="368" y2="160" stroke={`${P},0.65)`} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="344" cy="198" r="5" fill={`${P},0.15)`} stroke={`${P},0.55)`} strokeWidth="1" />
          <text x="344" y="228" textAnchor="middle" fill={`${P},0.52)`} fontSize="8" fontFamily="ui-monospace">
            índice 87%
          </text>

          {/* Ligações entre blocos */}
          <path d="M 146 142 L 162 142" fill="none" stroke={`${P},0.35)`} strokeWidth="0.9" markerEnd="url(#bp-pat-arr)" />
          <path d="M 280 142 L 296 142" fill="none" stroke={`${P},0.35)`} strokeWidth="0.9" markerEnd="url(#bp-pat-arr)" />
        </g>

        <text
          x="210"
          y="34"
          textAnchor="middle"
          fill={`${P},0.88)`}
          fontSize="12"
          fontFamily="ui-monospace"
          fontWeight="600"
          letterSpacing="0.1em"
        >
          PLAQUETA · LOCAL · CONSERVAÇÃO
        </text>
        <text
          x="210"
          y="50"
          textAnchor="middle"
          fill={`${P},0.42)`}
          fontSize="8.5"
          fontFamily="ui-monospace"
          letterSpacing="0.16em"
        >
          TRÍADE PATRIMONIAL · CADASTRO · GEO · ESTADO DO BEM
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
