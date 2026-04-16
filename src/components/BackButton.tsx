"use client";

import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";

export default function BackButton() {
  const { activeModule, goHome, themeColor, triggerHashValidation } = useStore();

  if (!activeModule) return null;

  return (
    <motion.button
      className="fixed left-4 z-[60] flex cursor-pointer items-center gap-2 rounded-full glass px-5 py-2.5 sm:left-6"
      style={{
        /* Acima do ticker/rodapé fixo dos módulos — evita sobrepor outros botões */
        bottom: "max(9rem, calc(6.5rem + env(safe-area-inset-bottom, 0px)))",
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{
        scale: 1.05,
        boxShadow: `0 0 20px ${themeColor}30`,
      }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        triggerHashValidation();
        goHome();
      }}
    >
      <motion.span
        className="text-sm"
        animate={{ x: [0, -3, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        ←
      </motion.span>
      <span className="text-xs font-mono tracking-wider text-white/60">
        PAINEL
      </span>
    </motion.button>
  );
}
