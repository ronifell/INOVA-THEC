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

/** Estação e COORD em verde, próximos; lema abaixo com folga para permitir subir só as duas primeiras linhas. */
function CustodyStationLine() {
  return (
    <div className="mt-3 flex min-w-0 flex-col md:mt-4">
      <p className="w-full break-words text-left font-mono text-[9px] font-semibold leading-snug tracking-tight text-emerald-300 [text-shadow:0_0_8px_rgba(16,185,129,0.45)] md:text-[10px]">
        ESTAÇÃO: AUDIT-ACRE // LOCAL: RIO BRANCO
      </p>
      <div className="mt-0 flex min-w-0 w-full max-w-[min(100%,21rem)] flex-col gap-2">
        <p className="w-full break-words text-left font-mono text-[9px] font-semibold leading-snug tracking-tight tabular-nums text-emerald-300 [text-shadow:0_0_8px_rgba(16,185,129,0.45)] md:text-[10px]">
          COORD: -9.96970 / -67.88283
        </p>
        <p className="w-full border-t border-white/[0.08] pt-1 font-mono text-[9px] leading-snug text-white md:text-[10px]">
          CUSTÓDIA INVIOLÁVEL DOS DADOS
        </p>
      </div>
    </div>
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
      <div className="mx-auto grid w-full max-w-[98%] grid-cols-1 gap-2 px-[2.5%] pb-1.5 pt-1.5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.22fr)_minmax(0,1fr)] md:gap-x-6 md:gap-y-2 md:pb-2 md:pt-2 lg:gap-x-10">
        {/* Esquerda — Cadeia de custódia (espelho tipográfico do Protocolo) */}
        <div className="order-2 flex min-w-0 flex-col justify-start md:order-1 md:pt-0.5 md:pr-2 lg:pr-4">
          <h2 className="header-ap04-pillar-title translate-y-0.5 text-left">
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
        <div className="order-1 flex min-w-0 flex-col items-center justify-start px-1 text-center md:order-2 md:pt-0">
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
              <span className="relative z-[1] bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-xl font-black tracking-tight text-transparent drop-shadow-[0_0_20px_rgba(52,211,153,0.32)] md:text-[1.72rem]">
                INOVA THEC
              </span>
            </div>
            <p className="relative mt-1.5 max-w-xl px-1 text-xs font-medium leading-snug text-white md:text-[0.9375rem]">
              A Terceira Via da Fé Pública Digital
            </p>
            <p className="relative mt-1 max-w-lg px-2 text-[10px] font-medium leading-snug text-white md:text-xs">
              A Verdade Digital que o Tempo Não Apaga
            </p>
          </motion.button>
        </div>

        {/* Direita — Protocolo AP-04 / SHA (esmeralda + branco) */}
        <div className="order-3 flex min-w-0 flex-col items-stretch md:items-end md:pl-2 md:pt-0.5 lg:pl-4">
          <h2 className="header-ap04-pillar-title text-right">
            PROTOCOLO AP-04
          </h2>
          <div className="relative mt-1 w-full max-w-[min(100%,21rem)] md:ml-auto">
            <div className="relative z-[1] rounded-md bg-black/10 backdrop-blur-[2px]">
              <div className="relative overflow-hidden px-2 py-1 md:px-2.5 md:py-1.5">
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
              <div className="flex flex-wrap items-baseline justify-end gap-1.5 border-t border-white/[0.08] px-2 py-1 md:px-2.5 md:py-1.5">
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
