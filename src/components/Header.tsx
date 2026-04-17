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

/** Estação / local / coordenadas em verde; últimos dígitos das coordenadas em micro-oscilação. */
function CustodyStationLine() {
  const [latEnd, setLatEnd] = useState(7);
  const [lonEnd, setLonEnd] = useState(1);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLatEnd(6 + Math.floor(Math.random() * 3));
      setLonEnd(Math.floor(Math.random() * 4));
    }, 780);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <div className="header-custody-track mt-1 min-h-[1.75rem] font-mono text-[9px] leading-relaxed text-emerald-300/95 md:text-[10px]">
        <span className="header-custody-glitch relative inline">
          ESTAÇÃO: AUDIT-ACRE // LOCAL: RIO BRANCO // COORD:{" "}
        </span>
        <span className="text-emerald-200/95">
          -9.9
          <motion.span
            className="inline-block tabular-nums"
            key={latEnd}
            initial={{ opacity: 0.35, y: 1 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
          >
            {latEnd}
          </motion.span>
          , -67.8
          <motion.span
            className="inline-block tabular-nums"
            key={lonEnd}
            initial={{ opacity: 0.35, y: -1 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
          >
            {lonEnd}
          </motion.span>
        </span>
      </div>
      <p className="header-custody-subline mt-1 text-[9px] font-medium leading-snug tracking-[0.06em] text-white md:text-[10px]">
        CUSTÓDIA INVIOLÁVEL DOS DADOS
      </p>
    </>
  );
}

export default function Header() {
  const {
    themeColor,
    themeColorRgb,
    integrityCount,
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
          "text-emerald-300 drop-shadow-[0_0_12px_rgba(16,185,129,0.75)] [text-shadow:0_0_10px_rgba(16,185,129,0.65)]",
      };
    }
    if (hashDisplayPhase === "validated") {
      return { text: "[HASH VALIDADO — AP-04]", className: "text-emerald-300" };
    }
    return {
      text: `${hashStr}${hashMain}`,
      className: "text-emerald-300 [text-shadow:0_0_8px_rgba(16,185,129,0.45)]",
    };
  }, [hashDisplayPhase, hashStr, hashMain]);

  return (
    <motion.header
      className="header-ap04-shell fixed top-0 left-0 right-0 z-40 w-full antialiased"
      variants={appShellHeader}
    >
      <div
        className="mx-auto grid w-full max-w-[100vw] grid-cols-1 gap-3 px-3 pb-2 pt-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)] md:gap-4 md:px-8 md:pb-2.5 md:pt-2.5 lg:gap-6"
      >
        {/* Esquerda — Cadeia de custódia (azul néon) */}
        <div className="order-2 flex min-w-0 flex-col justify-start md:order-1 md:pt-1">
          <h2 className="text-[11px] font-semibold tracking-[0.16em] text-white/92 md:text-xs">
            CADEIA DE CUSTÓDIA
          </h2>
          <CustodyStationLine />
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
        <div className="order-1 flex min-w-0 flex-col items-center justify-start text-center md:order-2 md:pt-0.5">
          <motion.button
            type="button"
            onClick={() => {
              triggerHashValidation();
              goHome();
            }}
            className="header-center-sweep-group relative flex flex-col items-center overflow-hidden rounded-md px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="relative inline-flex items-center justify-center px-2">
              <span className="relative z-[1] bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-2xl font-black tracking-tight text-transparent drop-shadow-[0_0_24px_rgba(52,211,153,0.35)] md:text-[2.05rem]">
                INOVA THEC
              </span>
            </div>
            <p className="relative mt-2 max-w-xl px-1 text-sm font-medium leading-snug text-white md:text-base">
              A Terceira Via da Fé Pública Digital
            </p>
            <p className="relative mt-1.5 max-w-lg px-2 text-xs font-medium leading-snug text-white md:text-sm">
              A Verdade Digital que o Tempo Não Apaga
            </p>
          </motion.button>
        </div>

        {/* Direita — Protocolo AP-04 / SHA (esmeralda + branco) */}
        <div className="order-3 flex min-w-0 flex-col items-stretch md:items-end md:pt-1">
          <h2 className="text-right text-[11px] font-semibold tracking-[0.16em] text-white/92 md:text-xs">
            PROTOCOLO AP-04
          </h2>
          <div className="relative mt-1.5 w-full max-w-[min(100%,21rem)] md:ml-auto">
            <div className="relative z-[1] rounded-md bg-black/10 backdrop-blur-[2px]">
              <div className="relative overflow-hidden px-2 py-1.5 md:px-2.5 md:py-2">
                <ProtocolGreenStream />
                <motion.span
                  className={`relative z-[1] block break-all text-right font-mono text-[9px] font-semibold leading-snug tracking-tight md:text-[10px] ${hashVisual.className}`}
                  animate={
                    hashDisplayPhase === "flash"
                      ? { scale: [1, 1.02, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.2 }}
                >
                  {hashVisual.text}
                </motion.span>
              </div>
              <div className="flex flex-wrap items-baseline justify-end gap-1.5 border-t border-white/[0.08] px-2 py-1.5 md:px-2.5 md:py-2">
                <span className="font-mono text-[9px] text-white md:text-[10px]">
                  SHA-256
                </span>
                <span className="font-mono text-[9px] tabular-nums text-white md:text-[10px] [font-variant-numeric:tabular-nums]">
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
