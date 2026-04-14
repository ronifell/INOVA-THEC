"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/store/useStore";

/** Radial fill 0.8s — cubic-bezier(0.4, 0, 0.2, 1) — escala até cobrir viewport */
export default function LiquidTransition() {
  const liquid = useStore((s) => s.liquidTransition);
  const [coverScale, setCoverScale] = useState(120);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const diag = Math.hypot(w, h);
      /* círculo ~56px de diâmetro → escala para cobrir diagonal + margem */
      setCoverScale((diag / 28) * 1.15);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <AnimatePresence>
      {liquid.active && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-[35] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="absolute rounded-full antialiased"
            style={{
              left: liquid.x,
              top: liquid.y,
              width: 56,
              height: 56,
              marginLeft: -28,
              marginTop: -28,
              background: liquid.color,
              willChange: "transform",
              boxShadow: `0 0 60px ${liquid.color}`,
            }}
            initial={{ scale: 0, opacity: 0.95 }}
            animate={{ scale: coverScale, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
