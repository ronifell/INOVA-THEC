"use client";

import { motion } from "framer-motion";
import { MODULES } from "@/lib/modules";
import ModuleCard from "./ModuleCard";
import FaithButtons from "./FaithButtons";

export default function Dashboard() {
  return (
    <motion.div
      className="min-h-full flex flex-col items-center justify-center px-4 md:px-8 py-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6 }}
    >
      {/* Title Section */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-white/90 mb-2">
          PAINEL DE COMANDO
        </h2>
        <p className="text-xs font-mono tracking-[0.25em] text-white/25 uppercase">
          Sistema Integrado de Gestão — Protocolo AP-04
        </p>
        <div className="mt-4 h-[1px] w-32 mx-auto bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </motion.div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 md:gap-4 w-full max-w-7xl mb-12">
        {MODULES.map((mod, i) => (
          <ModuleCard key={mod.id} module={mod} index={i} />
        ))}
      </div>

      {/* Faith Buttons Section */}
      <motion.div
        className="w-full max-w-3xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <FaithButtons />
      </motion.div>

      {/* Bottom Tech Info */}
      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <p className="text-[9px] font-mono tracking-widest text-white/15">
          INOVA THEC © {new Date().getFullYear()} — CRIPTOGRAFIA SHA-256 |
          CADEIA DE CUSTÓDIA IMUTÁVEL | FÉ PÚBLICA DIGITAL
        </p>
      </motion.div>
    </motion.div>
  );
}
