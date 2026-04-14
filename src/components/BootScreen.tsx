"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const INTRO_S = 1.2;
const EXIT_MS = 400;
/** Preenchimento: 10% do campo por segundo → 10s até 100% */
const FILL_RATE = 0.1;

export default function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"intro" | "scan" | "exit">("intro");
  const [fill, setFill] = useState(0);
  const rafRef = useRef<number>(0);
  const t0Ref = useRef<number>(0);
  const exitDoneRef = useRef(false);

  useEffect(() => {
    const t = window.setTimeout(() => setPhase("scan"), INTRO_S * 1000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "scan") return;
    t0Ref.current = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - t0Ref.current) / 1000;
      const next = Math.min(1, elapsed * FILL_RATE);
      setFill(next);
      if (next < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPhase("exit");
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  const onExitComplete = useCallback(() => {
    if (exitDoneRef.current) return;
    exitDoneRef.current = true;
    onComplete();
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0a0f1e]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        {phase !== "exit" ? (
          <motion.div
            key="boot-main"
            className="relative flex flex-col items-center justify-center px-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: INTRO_S,
              ease: [0, 0, 0.2, 1],
            }}
          >
            <div
              className="relative overflow-hidden rounded-2xl border border-white/10 antialiased"
              style={{
                width: 200,
                height: 120,
                boxShadow: "0 0 40px rgba(16, 185, 129, 0.12)",
              }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center bg-[#0f172a]"
                style={{
                  clipPath: `inset(${100 - fill * 100}% 0 0 0)`,
                }}
              >
                <div className="text-center select-none">
                  <span className="text-3xl font-black tracking-tight text-emerald-400">
                    IT
                  </span>
                  <p className="text-[10px] font-mono tracking-[0.35em] text-white/45 mt-1">
                    INOVA THEC
                  </p>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.22]">
                <span className="text-3xl font-black text-white">IT</span>
              </div>
              {phase === "scan" && (
                <motion.div
                  className="absolute left-0 right-0 h-[2px] z-10 pointer-events-none will-change-transform"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, #6ee7b7, #34d399, #6ee7b7, transparent)",
                    boxShadow:
                      "0 0 10px #34d399, 0 0 22px rgba(52,211,153,0.45)",
                  }}
                  animate={{ top: ["0%", "calc(100% - 2px)", "0%"] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              )}
            </div>
            <p className="mt-6 text-[10px] font-mono tracking-[0.4em] text-white/30 uppercase">
              Protocolo AP-04 — boot pericial
            </p>
            {phase === "scan" && (
              <p className="mt-2 text-[9px] font-mono text-emerald-500/55 tabular-nums">
                {Math.round(fill * 100)}% — máscara de gradiente
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="boot-exit"
            className="fixed z-[61]"
            initial={{
              left: "calc(50% - 100px)",
              top: "calc(50% - 60px)",
              width: 200,
              height: 120,
              rotate: 0,
            }}
            animate={{
              left: 16,
              top: 16,
              width: 40,
              height: 40,
              rotate: [0, -6, 4, 0],
            }}
            transition={{
              duration: EXIT_MS / 1000,
              ease: [0.34, 1.56, 0.64, 1],
              rotate: { duration: EXIT_MS / 1000, ease: [0.34, 1.56, 0.64, 1] },
            }}
            onAnimationComplete={onExitComplete}
          >
            <div
              className="w-full h-full rounded-lg flex items-center justify-center font-bold text-[10px] text-white border border-emerald-500/35 antialiased"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                boxShadow: "0 0 18px rgba(16,185,129,0.4)",
              }}
            >
              IT
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
