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
  const [hashStr, setHashStr] = useState(() => randomHex(10));

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
    const id = window.setInterval(() => setHashStr(randomHex(10)), 50);
    return () => window.clearInterval(id);
  }, [hashDisplayPhase]);

  const formatted = useMemo(
    () => liveCount.toLocaleString("pt-BR"),
    [liveCount]
  );

  const hashVisual = useMemo(() => {
    if (hashDisplayPhase === "flash") {
      return {
        text: hashStr,
        className:
          "text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.95)] [text-shadow:0_0_12px_#fff]",
      };
    }
    if (hashDisplayPhase === "validated") {
      return { text: "[HASH VALIDADO]", className: "text-emerald-300" };
    }
    return {
      text: hashStr,
      className:
        "text-emerald-400 [text-shadow:0_0_10px_rgba(52,211,153,0.45)]",
    };
  }, [hashDisplayPhase, hashStr]);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-40 overflow-hidden glass antialiased"
      variants={appShellHeader}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        {/* Logo do sistema — mesmo bloco visual da identidade operacional */}
        <motion.button
          type="button"
          onClick={() => {
            triggerHashValidation();
            goHome();
          }}
          className="flex shrink-0 cursor-pointer items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            className="logo-sweep-cross relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg text-sm font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${themeColor}, ${themeColor}80)`,
            }}
            animate={{
              boxShadow: [
                `0 0 5px rgba(${themeColorRgb}, 0.45)`,
                `0 0 20px rgba(${themeColorRgb}, 0.9)`,
                `0 0 5px rgba(${themeColorRgb}, 0.45)`,
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            IT
          </motion.div>
          <div className="hidden min-w-0 sm:block">
            <h1 className="text-base font-bold leading-none tracking-wide text-white">
              INOVA THEC
            </h1>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-white/40">
              Gestão Pública Inteligente
            </p>
          </div>
        </motion.button>

        {/* Centro — nome ao tamanho anterior; faixa de protocolo sem moldura */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 flex min-w-0 max-w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center text-center sm:max-w-[32rem]"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-base font-bold tracking-[0.28em] text-white md:text-lg">
            COMMAND PANEL
          </h2>
          <div className="mt-1 max-w-full overflow-hidden py-0.5 md:mt-1.5">
            <div className="protocol-scroll-track text-[10px] font-mono tracking-[0.22em] text-white md:text-[11px]">
              <span className="inline-block pr-8">
                INTEGRATED MANAGEMENT SYSTEM — AP-04 PROTOCOL
              </span>
              <span className="inline-block pr-8" aria-hidden>
                INTEGRATED MANAGEMENT SYSTEM — AP-04 PROTOCOL
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="flex shrink-0 items-center gap-3 md:gap-4"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeModule && (
            <div className="hidden items-center gap-2 lg:flex">
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  background: themeColor,
                  boxShadow: `0 0 8px ${themeColor}`,
                }}
              />
              <span className="text-xs font-mono tracking-wider text-white/70">
                MÓDULO ATIVO
              </span>
            </div>
          )}

          <motion.div
            className="glass flex max-w-[min(100vw-10rem,22rem)] flex-col gap-0.5 rounded-lg px-3.5 py-2 sm:px-4 sm:py-2.5"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-white shadow-[0_0_8px_#fff]" />
              <span className="whitespace-nowrap text-[11px] font-mono tracking-wide text-white sm:text-xs">
                INTEGRITY / SHA-256
              </span>
            </div>
            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
              <motion.span
                className={`break-all font-mono text-xs font-bold tracking-tight sm:text-sm ${hashVisual.className}`}
                animate={
                  hashDisplayPhase === "flash"
                    ? { scale: [1, 1.06, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.2 }}
              >
                {hashVisual.text}
              </motion.span>
              <span className="whitespace-nowrap font-mono text-[11px] text-white tabular-nums sm:text-xs [font-variant-numeric:tabular-nums]">
                SEQ {formatted}
              </span>
            </div>
          </motion.div>

          <motion.button
            type="button"
            onClick={() => {
              triggerHashValidation();
              toggleAudio();
            }}
            className="glass flex h-9 w-9 shrink-0 items-center justify-center rounded-lg cursor-pointer"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            <span className="text-base">{audioEnabled ? "🔊" : "🔇"}</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.header>
  );
}
