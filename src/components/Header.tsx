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

export default function Header() {
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
      className="fixed top-0 left-0 right-0 z-40 glass antialiased"
      variants={appShellHeader}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 h-16">
        <motion.button
          onClick={() => {
            triggerHashValidation();
            goHome();
          }}
          className="flex items-center gap-3 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm will-change-[box-shadow]"
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
          <div className="hidden sm:block">
            <h1 className="text-base font-bold tracking-wide text-white leading-none">
              INOVA THEC
            </h1>
            <p className="text-[10px] tracking-[0.2em] text-white/40 uppercase">
              Gestão Pública Inteligente
            </p>
          </div>
        </motion.button>

        {activeModule && (
          <motion.div
            className="hidden md:flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: themeColor,
                boxShadow: `0 0 8px ${themeColor}`,
              }}
            />
            <span className="text-xs font-mono tracking-wider text-white/60">
              MÓDULO ATIVO
            </span>
          </motion.div>
        )}

        <div className="flex items-center gap-4">
          <motion.div
            className="glass rounded-lg px-3 py-1.5 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 max-w-[min(100vw-8rem,22rem)]"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 shrink-0">
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{
                  background: "#10B981",
                  boxShadow: "0 0 6px #10B981",
                }}
              />
              <span className="text-[10px] font-mono text-white/50 hidden sm:inline whitespace-nowrap">
                INTEGRIDADE / SHA-256
              </span>
            </div>
            <motion.span
              className={`text-xs font-mono font-bold tracking-tight break-all sm:break-normal ${hashVisual.className}`}
              animate={
                hashDisplayPhase === "flash"
                  ? { scale: [1, 1.08, 1] }
                  : { scale: 1 }
              }
              transition={{ duration: 0.2 }}
            >
              {hashVisual.text}
            </motion.span>
            <span className="text-[9px] font-mono text-emerald-200/75 hidden md:inline tabular-nums whitespace-nowrap [font-variant-numeric:tabular-nums]">
              SEQ {formatted}
            </span>
          </motion.div>

          <motion.button
            onClick={() => {
              triggerHashValidation();
              toggleAudio();
            }}
            className="glass rounded-lg w-9 h-9 flex items-center justify-center cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-base">{audioEnabled ? "🔊" : "🔇"}</span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
