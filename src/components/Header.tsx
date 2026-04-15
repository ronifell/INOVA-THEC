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
      /* Nunca usar themeColor base (#0F172A) no texto — fica ilegível no vidro escuro */
      className:
        "text-emerald-400 [text-shadow:0_0_10px_rgba(52,211,153,0.45)]",
    };
  }, [hashDisplayPhase, hashStr]);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-40 overflow-hidden glass antialiased"
      variants={appShellHeader}
    >
      <div className="mx-auto grid h-[8.5vh] w-full max-w-7xl grid-cols-3 items-center gap-[1.2vw] overflow-hidden px-[1.6vw]">
        <motion.div
          className="col-start-2 flex translate-y-[1.5vh] justify-center"
          initial={{ opacity: 0, y: -34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex w-full max-w-[26vw] flex-col items-center justify-center">
            <h2 className="text-[1.35vh] font-bold tracking-[0.34em] text-white">
              COMMAND PANEL
            </h2>
            <div className="mt-[0.65vh] w-[200%] max-w-none overflow-hidden border-y border-white/35 py-[0.18vh]">
              <div className="protocol-scroll-track text-[0.96vh] font-mono tracking-[0.22em] text-white">
                <span className="inline-block pr-[3.2vw]">
                  INTEGRATED MANAGEMENT SYSTEM - AP-04 PROTOCOL
                </span>
                <span className="inline-block pr-[3.2vw]" aria-hidden>
                  INTEGRATED MANAGEMENT SYSTEM - AP-04 PROTOCOL
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.button
          onClick={() => {
            triggerHashValidation();
            goHome();
          }}
          className="col-start-1 flex -translate-y-[5vh] items-center justify-start gap-[0.7vw] cursor-pointer justify-self-start"
          initial={{ opacity: 0, x: -48 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.95, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <motion.div
            className="logo-sweep-cross relative flex h-[4.9vh] w-[4.9vh] items-center justify-center overflow-hidden rounded-[0.65vw] font-bold text-[1.45vh] text-white will-change-[box-shadow]"
            style={{
              background: `linear-gradient(135deg, ${themeColor}, ${themeColor}80)`,
            }}
            animate={{
              boxShadow: [
                `0 0 7px rgba(${themeColorRgb}, 0.55)`,
                `0 0 24px rgba(${themeColorRgb}, 0.95)`,
                `0 0 7px rgba(${themeColorRgb}, 0.55)`,
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            IT
          </motion.div>
          <div className="hidden sm:block">
            <h1 className="text-[1.34vh] font-bold tracking-[0.12em] text-white leading-none">
              INOVA THEC
            </h1>
            <p className="mt-[0.28vh] text-[0.92vh] tracking-[0.2em] text-white uppercase">
              Gestão Pública Inteligente
            </p>
          </div>
        </motion.button>

        <motion.div
          className="col-start-3 flex -translate-y-[5vh] items-center justify-end gap-[0.8vw] justify-self-end"
          initial={{ opacity: 0, x: 42 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.62, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeModule && (
            <div className="hidden xl:flex items-center gap-[0.45vw]">
              <div
                className="h-[0.7vh] w-[0.7vh] rounded-full"
                style={{
                  background: themeColor,
                  boxShadow: `0 0 8px ${themeColor}`,
                }}
              />
              <span className="text-[0.92vh] font-mono tracking-[0.14em] text-white">
                MÓDULO ATIVO
              </span>
            </div>
          )}

          <motion.div
            className="glass flex max-w-[min(32vw,25rem)] flex-col gap-[0.2vh] rounded-[0.65vw] px-[0.78vw] py-[0.58vh]"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-[0.45vw]">
              <div className="h-[0.55vh] w-[0.55vh] shrink-0 rounded-full bg-white shadow-[0_0_8px_#fff]" />
              <span className="text-[0.86vh] font-mono tracking-[0.13em] text-white whitespace-nowrap">
                INTEGRITY / SHA-256
              </span>
            </div>
            <div className="flex items-center gap-[0.55vw]">
              <motion.span
                className={`text-[1.16vh] font-mono font-bold tracking-tight ${hashVisual.className}`}
                animate={
                  hashDisplayPhase === "flash"
                    ? { scale: [1, 1.08, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.2 }}
              >
                {hashVisual.text}
              </motion.span>
              <span className="text-[0.9vh] font-mono text-white tabular-nums whitespace-nowrap [font-variant-numeric:tabular-nums]">
                SEQ {formatted}
              </span>
            </div>
          </motion.div>

          <motion.button
            onClick={() => {
              triggerHashValidation();
              toggleAudio();
            }}
            className="glass flex h-[4.2vh] w-[4.2vh] items-center justify-center rounded-[0.65vw] cursor-pointer"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-[1.7vh]">{audioEnabled ? "🔊" : "🔇"}</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.header>
  );
}
