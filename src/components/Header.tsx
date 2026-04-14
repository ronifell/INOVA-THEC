"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";

function OdometerDigit({ digit, color }: { digit: string; color: string }) {
  const target = Number.isNaN(Number(digit)) ? 0 : Number(digit);
  return (
    <span className="relative inline-flex h-4 w-[10px] overflow-hidden font-mono">
      <motion.span
        className="absolute left-0 top-0 flex flex-col leading-4"
        style={{ color }}
        animate={{ y: `-${target * 16}px` }}
        transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="h-4">
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  );
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
  } = useStore();
  const [liveCount, setLiveCount] = useState(integrityCount);

  useEffect(() => {
    setLiveCount((prev) => Math.max(prev, integrityCount));
  }, [integrityCount]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLiveCount((prev) => prev + Math.floor(Math.random() * 3 + 1));
    }, 420);
    return () => window.clearInterval(id);
  }, []);

  const formatted = useMemo(() => liveCount.toLocaleString("pt-BR"), [liveCount]);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 h-16">
        {/* Logo */}
        <motion.button
          onClick={goHome}
          className="flex items-center gap-3 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm"
            style={{
              background: `linear-gradient(135deg, ${themeColor}, ${themeColor}80)`,
              boxShadow: `0 0 20px ${themeColor}40`,
            }}
            animate={{
              boxShadow: [
                `0 0 10px rgba(${themeColorRgb}, 0.3)`,
                `0 0 25px rgba(${themeColorRgb}, 0.6)`,
                `0 0 10px rgba(${themeColorRgb}, 0.3)`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
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

        {/* Center - Active Module */}
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

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Integrity Counter */}
          <motion.div
            className="glass rounded-lg px-3 py-1.5 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#10B981",
                boxShadow: "0 0 6px #10B981",
              }}
            />
            <span className="text-[10px] font-mono text-white/50 hidden sm:inline">
              INTEGRIDADE
            </span>
            <motion.span
              className="text-sm font-mono font-bold inline-flex gap-[1px]"
              style={{ color: themeColor }}
              initial={{ scale: 1.2, color: "#fff" }}
              animate={{ scale: 1, color: themeColor }}
              transition={{ duration: 0.3 }}
            >
              {formatted.split("").map((ch, idx) =>
                ch === "." || ch === "," ? (
                  <span key={`${ch}-${idx}`} className="w-[4px] text-white/70">
                    {ch}
                  </span>
                ) : (
                  <OdometerDigit key={`${ch}-${idx}`} digit={ch} color={themeColor} />
                )
              )}
            </motion.span>
          </motion.div>

          {/* Audio Toggle */}
          <motion.button
            onClick={toggleAudio}
            className="glass rounded-lg w-9 h-9 flex items-center justify-center cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-base">
              {audioEnabled ? "🔊" : "🔇"}
            </span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
