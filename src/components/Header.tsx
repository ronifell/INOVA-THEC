"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { appShellHeader } from "@/lib/motionVariants";

function randomHex(len: number) {
  const h = "0123456789ABCDEF";
  let s = "";
  for (let i = 0; i < len; i++) s += h[Math.floor(Math.random() * 16)];
  return s;
}

/** Faixa verde de processamento (hex rápido) por detrás do hash */
function ProtocolGreenStream() {
  const [lineA, setLineA] = useState(() => randomHex(96));
  const [lineB, setLineB] = useState(() => randomHex(72));
  useEffect(() => {
    const id = window.setInterval(() => {
      setLineA(randomHex(96));
      setLineB(randomHex(72));
    }, 48);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.38]"
      aria-hidden
    >
      <motion.div
        className="whitespace-pre font-mono text-[9px] leading-snug text-emerald-400 md:text-[10px]"
        animate={{ x: [0, -120] }}
        transition={{ duration: 1.85, repeat: Infinity, ease: "linear" }}
      >
        {lineA}
        {lineA}
      </motion.div>
      <motion.div
        className="absolute left-0 top-4 whitespace-pre font-mono text-[8px] leading-snug text-emerald-500/90 md:text-[9px]"
        animate={{ x: [-80, 40] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
      >
        {lineB}
        {lineB}
      </motion.div>
    </div>
  );
}

type HeaderProps = {
  dashboardHero?: boolean;
};

export default function Header({ dashboardHero: _dashboardHero }: HeaderProps) {
  const {
    themeColor,
    themeColorRgb,
    integrityCount,
    audioEnabled,
    toggleAudio,
    goHome,
    activeModule,
    hashDisplayPhase,
    triggerHashValidation,
  } = useStore();
  const [liveCount, setLiveCount] = useState(integrityCount);
  const [hashStr, setHashStr] = useState(() => randomHex(16));
  const [hashMain, setHashMain] = useState(() => randomHex(48));

  useEffect(() => {
    setLiveCount((prev) => Math.max(prev, integrityCount));
  }, [integrityCount]);

  useEffect(() => {
    if (hashDisplayPhase !== "idle") return;
    const id = window.setInterval(() => {
      setLiveCount((c) => c + Math.floor(Math.random() * 3) + 1);
    }, 420);
    return () => window.clearInterval(id);
  }, [hashDisplayPhase]);

  useEffect(() => {
    if (hashDisplayPhase !== "idle") return;
    const id = window.setInterval(() => {
      setHashStr(randomHex(16));
      setHashMain((prev) => prev.slice(8) + randomHex(8));
    }, 55);
    return () => window.clearInterval(id);
  }, [hashDisplayPhase]);

  const formatted = useMemo(
    () => liveCount.toLocaleString("pt-BR"),
    [liveCount]
  );

  const hashVisual = useMemo(() => {
    if (hashDisplayPhase === "flash") {
      return {
        text: hashStr + hashMain,
        className:
          "text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] [text-shadow:0_0_10px_#fff]",
      };
    }
    if (hashDisplayPhase === "validated") {
      return { text: "[HASH VALIDADO — AP-04]", className: "text-emerald-300" };
    }
    return {
      text: `${hashStr}${hashMain}`,
      className: "text-white [text-shadow:0_0_8px_rgba(255,255,255,0.35)]",
    };
  }, [hashDisplayPhase, hashStr, hashMain]);

  return (
    <motion.header
      className="header-ap04-shell fixed top-0 left-0 right-0 z-40 w-full antialiased"
      variants={appShellHeader}
    >
      <motion.button
        type="button"
        onClick={() => {
          triggerHashValidation();
          toggleAudio();
        }}
        className="absolute right-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06] text-lg text-white backdrop-blur-sm transition hover:bg-white/10 md:right-6 md:top-4 md:h-11 md:w-11"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-label={audioEnabled ? "Desativar áudio" : "Ativar áudio"}
      >
        {audioEnabled ? "🔊" : "🔇"}
      </motion.button>

      <div className="mx-auto grid w-full max-w-[100vw] grid-cols-1 gap-6 px-3 pb-5 pt-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)] md:gap-8 md:px-8 md:pb-6 md:pt-5 lg:gap-10">
        {/* Esquerda — Cadeia de custódia (azul néon) */}
        <div className="order-2 flex min-w-0 flex-col justify-start md:order-1">
          <h2 className="text-sm font-bold tracking-[0.2em] text-white md:text-base">
            CADEIA DE CUSTÓDIA
          </h2>
          <div className="header-custody-track mt-2 min-h-[2.75rem] font-mono text-[11px] leading-relaxed text-cyan-300 md:text-xs">
            <span className="header-custody-glitch relative inline text-cyan-200 [text-shadow:0_0_12px_rgba(34,211,238,0.55)]">
              ESTAÇÃO: AUDIT-ACRE // LOCAL: RIO BRANCO // COORD: -9.97, -67.81
            </span>
            <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-cyan-400 align-middle [box-shadow:0_0_8px_#22d3ee]" />
          </div>
          {activeModule && (
            <p className="mt-3 flex items-center gap-2 text-[11px] font-mono text-white/70 md:text-xs">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{
                  background: themeColor,
                  boxShadow: `0 0 8px ${themeColor}`,
                }}
              />
              Módulo ativo
            </p>
          )}
        </div>

        {/* Centro — Identidade Inova Thec */}
        <div className="order-1 flex min-w-0 flex-col items-center justify-start text-center md:order-2">
          <motion.button
            type="button"
            onClick={() => {
              triggerHashValidation();
              goHome();
            }}
            className="flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <motion.div
                className="logo-sweep-cross relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl text-base font-bold text-white md:h-14 md:w-14 md:text-lg"
                style={{
                  background: `linear-gradient(135deg, ${themeColor}, ${themeColor}88)`,
                }}
                animate={{
                  boxShadow: [
                    `0 0 6px rgba(${themeColorRgb}, 0.5)`,
                    `0 0 22px rgba(${themeColorRgb}, 0.95)`,
                    `0 0 6px rgba(${themeColorRgb}, 0.5)`,
                  ],
                }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              >
                IT
              </motion.div>
              <span className="text-2xl font-bold tracking-[0.12em] text-white md:text-3xl">
                INOVA THEC
              </span>
            </div>
            <p className="mt-3 max-w-xl px-1 text-sm font-medium leading-snug text-white md:text-base">
              A Terceira Via da Fé Pública Digital
            </p>
            <p className="header-truth-subline mt-2 max-w-lg px-2 text-xs font-medium leading-snug text-white md:text-sm">
              A Verdade Digital que o Tempo Não Apaga
            </p>
          </motion.button>
        </div>

        {/* Direita — Protocolo AP-04 / SHA (esmeralda + branco) */}
        <div className="order-3 flex min-w-0 flex-col items-stretch md:items-end">
          <h2 className="text-right text-sm font-bold tracking-[0.2em] text-white md:text-base">
            PROTOCOLO AP-04
          </h2>
          <div className="relative mt-3 w-full max-w-[min(100%,24rem)] md:ml-auto">
            <ProtocolGreenStream />
            <div className="relative z-[1] rounded-md bg-black/10 px-2 py-2 backdrop-blur-[2px] md:px-3 md:py-2.5">
              <motion.span
                className={`block break-all text-right font-mono text-[11px] font-semibold leading-relaxed tracking-tight md:text-sm ${hashVisual.className}`}
                animate={
                  hashDisplayPhase === "flash"
                    ? { scale: [1, 1.02, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.2 }}
              >
                {hashVisual.text}
              </motion.span>
              <div className="mt-2 flex flex-wrap items-baseline justify-end gap-2 border-t border-white/[0.08] pt-2">
                <span className="font-mono text-[11px] text-emerald-400/90 md:text-xs">
                  SHA-256
                </span>
                <span className="font-mono text-[11px] tabular-nums text-emerald-300 md:text-xs [font-variant-numeric:tabular-nums]">
                  SEQ {formatted}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
