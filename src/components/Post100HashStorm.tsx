"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

/** Comprimento aproximado de cada string (estilo hash). */
const HASH_CHAR_LEN = 30;

/** Cinza um pouco mais claro que o tema escuro padrão — legível sobre o mesh. */
const HASH_TEXT = "#b9c4d4";

function randomHex(len: number) {
  const h = "0123456789ABCDEF";
  let s = "";
  for (let i = 0; i < len; i++) s += h[Math.floor(Math.random() * 16)];
  return s;
}

type Layer = {
  id: number;
  z: number;
  scale: number;
  blur: number;
  opacity: number;
  /** Segundos para percorrer o trajeto, devagar. */
  duration: number;
  yPct: number;
  delay: number;
  fontPx: number;
  rotateX: number;
  /** Posição horizontal inicial (% da largura do contentor), única por faixa. */
  startXPct: number;
  /** Posição horizontal final (%) — à esquerda ou à direita do início. */
  endXPct: number;
};

function genLayers(n: number): Layer[] {
  return Array.from({ length: n }, (_, i) => {
    const depth = -1280 + Math.random() * 1220;
    const t = Math.min(1, Math.max(0, (depth + 1280) / 1220));
    const scale = 0.28 + t * 0.92;
    const blur = (1 - t) * 3.1;
    const opacity = 0.16 + t * 0.7;
    const duration = 26 - t * 11 + Math.random() * 4;
    /* Altura: quase toda a viewport (faixas + jitter) para espalhar mais no vertical. */
    const slot = n <= 1 ? 0.5 : i / (n - 1);
    const yPct = Math.min(
      99.5,
      Math.max(
        0.5,
        0.5 +
          slot * 98 +
          (Math.random() - 0.5) * Math.min(24, 104 / Math.max(8, n)) +
          (Math.random() - 0.5) * 9
      )
    );
    const delay = Math.random() * 5;
    const fontPx = 6.5 + t * 6.2;
    const rotateX = (1 - t) * 5.5 + (i % 7) * 0.15;

    /* Origens mais espalhadas na largura; trajetos longos o bastante para cruzar o campo visual. */
    const startXPct = -100 + Math.random() * 230;
    const toRight = Math.random() < 0.5;
    const span = 150 + Math.random() * 110;
    const endXPct = toRight ? startXPct + span : startXPct - span;

    return {
      id: i,
      z: depth,
      scale,
      blur,
      opacity,
      duration,
      yPct,
      delay,
      fontPx,
      rotateX,
      startXPct,
      endXPct,
    };
  });
}

/** Menos faixas, mais espaço entre elas (vertical + profundidade). */
const N = 42;

type Post100HashStormProps = {
  visible: boolean;
  /** 0–1; na reta final da interstitial esmaece junto com a home por baixo. */
  contentOpacity?: number;
};

/**
 * Interstitial pós-100%: conteúdo muda rápido (hex), deslocamento horizontal lento
 * (cada faixa com origem e sentido próprios), profundidade 3D; cor cinza clara fixa.
 */
export default function Post100HashStorm({
  visible,
  contentOpacity = 1,
}: Post100HashStormProps) {
  const layers = useMemo(() => genLayers(N), []);
  const [texts, setTexts] = useState<string[]>(() =>
    Array.from({ length: N }, () => randomHex(HASH_CHAR_LEN))
  );

  useEffect(() => {
    if (!visible) return;
    const id = window.setInterval(() => {
      setTexts(() =>
        Array.from({ length: N }, () => randomHex(HASH_CHAR_LEN))
      );
    }, 48);
    return () => clearInterval(id);
  }, [visible]);

  const layerOpacity = visible ? contentOpacity : 0;

  return (
    <div
      className="absolute inset-0 z-[54] pointer-events-none overflow-hidden"
      aria-hidden
      style={{
        opacity: layerOpacity,
        perspective: "1750px",
        perspectiveOrigin: "50% 42%",
      }}
    >
      <div
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d" }}
      >
        {layers.map((layer, i) => {
          const block = texts[i] ?? randomHex(HASH_CHAR_LEN);
          const seam = Array.from({ length: 6 }, () => block).join("  ");
          return (
            <div
              key={layer.id}
              className="absolute left-0 w-full overflow-visible will-change-transform"
              style={{
                top: `${layer.yPct}%`,
                transform: `translateZ(${layer.z}px) scale(${layer.scale}) rotateX(${layer.rotateX}deg)`,
                transformStyle: "preserve-3d",
                opacity: layer.opacity,
                filter:
                  layer.blur > 0.06 ? `blur(${layer.blur.toFixed(2)}px)` : undefined,
              }}
            >
              <motion.div
                className="inline-block max-w-none whitespace-pre font-mono font-semibold leading-tight tracking-tight"
                style={{
                  color: HASH_TEXT,
                  textShadow: "0 0 10px rgba(185, 196, 212, 0.45)",
                  fontSize: `${layer.fontPx}px`,
                }}
                initial={{ x: `${layer.startXPct}%` }}
                animate={{ x: `${layer.endXPct}%` }}
                transition={{
                  duration: layer.duration,
                  repeat: Infinity,
                  ease: "linear",
                  delay: layer.delay,
                }}
              >
                {seam}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
