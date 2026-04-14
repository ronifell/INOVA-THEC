"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";

export default function GlitchOverlay() {
  const isGlitching = useStore((s) => s.isGlitching);

  return (
    <AnimatePresence>
      {isGlitching && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          {/* Red channel offset */}
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(255, 0, 0, 0.08)",
              transform: "translate(3px, -2px)",
              mixBlendMode: "screen",
              animation: "glitch-1 0.3s ease-in-out infinite",
            }}
          />
          {/* Blue channel offset */}
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(0, 0, 255, 0.08)",
              transform: "translate(-3px, 2px)",
              mixBlendMode: "screen",
              animation: "glitch-2 0.3s ease-in-out infinite reverse",
            }}
          />
          {/* Random noise bars */}
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-0 right-0"
              style={{
                top: `${Math.random() * 100}%`,
                height: `${Math.random() * 3 + 1}px`,
                background: `rgba(255, ${Math.random() > 0.5 ? 0 : 255}, ${Math.random() > 0.5 ? 0 : 255}, 0.3)`,
                transform: `translateX(${(Math.random() - 0.5) * 20}px)`,
              }}
              animate={{
                opacity: [0, 1, 0],
                x: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10],
              }}
              transition={{
                duration: 0.15,
                repeat: Infinity,
                repeatType: "mirror",
                delay: Math.random() * 0.2,
              }}
            />
          ))}
          {/* Screen flash */}
          <motion.div
            className="absolute inset-0"
            style={{ background: "rgba(255, 0, 0, 0.15)" }}
            animate={{ opacity: [0.15, 0, 0.1, 0, 0.2, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
          />
          {/* Warning text */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ opacity: [0, 1, 0, 1, 0] }}
            transition={{ duration: 0.8, repeat: 1 }}
          >
            <span
              className="text-red-500 text-2xl md:text-4xl font-mono font-bold tracking-widest"
              style={{ textShadow: "0 0 20px rgba(255,0,0,0.8)" }}
            >
              ⚠ INTEGRIDADE COMPROMETIDA ⚠
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
