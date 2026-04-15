"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";

type Props = {
  label: string;
  index: number;
  accent: string;
  accentRgb: string;
  /** Painéis sobre mesh 3D: fundo mais opaco e borda mais forte */
  highContrast?: boolean;
};

/** Memorial: cascata 100ms, slide da direita, hover +5% largura, ripple 0,5s */
export default function ModuleActionButton({
  label,
  index,
  accent,
  accentRgb,
  highContrast = false,
}: Props) {
  const triggerHashValidation = useStore((s) => s.triggerHashValidation);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      triggerHashValidation();
      const r = e.currentTarget.getBoundingClientRect();
      setRipple({ x: e.clientX - r.left, y: e.clientY - r.top });
      window.setTimeout(() => setRipple(null), 520);
    },
    [triggerHashValidation]
  );

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: 48 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ scaleX: 1.05, scaleY: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-lg px-3 py-2 text-left min-w-[7rem] border antialiased backdrop-blur-md"
      style={{
        borderColor: highContrast
          ? `rgba(${accentRgb}, 0.55)`
          : `rgba(${accentRgb}, 0.35)`,
        background: highContrast
          ? `linear-gradient(145deg, rgba(15, 23, 42, 0.94) 0%, rgba(${accentRgb}, 0.22) 55%, rgba(15, 23, 42, 0.92) 100%)`
          : `linear-gradient(135deg, rgba(${accentRgb}, 0.12), rgba(${accentRgb}, 0.03))`,
        boxShadow: highContrast
          ? "0 6px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)"
          : undefined,
        color: accent,
        willChange: "transform",
      }}
    >
      <span className="relative z-[1] text-[10px] font-mono tracking-wider font-bold">
        {label}
      </span>
      <AnimatePresence>
        {ripple && (
          <motion.span
            className="absolute rounded-full pointer-events-none z-0"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 8,
              height: 8,
              marginLeft: -4,
              marginTop: -4,
              background: `radial-gradient(circle, rgba(${accentRgb},0.45), transparent)`,
            }}
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: 14, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}
