"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/store/useStore";

export default function LiquidTransition() {
  const liquid = useStore((s) => s.liquidTransition);

  return (
    <AnimatePresence>
      {liquid.active && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-[35]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
        >
          <motion.div
            className="absolute rounded-full"
            style={{
              left: liquid.x,
              top: liquid.y,
              width: 28,
              height: 28,
              translateX: "-50%",
              translateY: "-50%",
              background: `radial-gradient(circle, ${liquid.color}D0 0%, ${liquid.color}90 40%, ${liquid.color}10 80%, transparent 100%)`,
              filter: "blur(2px)",
              mixBlendMode: "screen",
            }}
            initial={{ scale: 0, opacity: 0.95 }}
            animate={{ scale: 42, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.19, 1, 0.22, 1] }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              left: liquid.x,
              top: liquid.y,
              width: 22,
              height: 22,
              translateX: "-50%",
              translateY: "-50%",
              border: `2px solid ${liquid.color}A0`,
              boxShadow: `0 0 25px ${liquid.color}`,
              filter: "blur(0.5px)",
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 18, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
