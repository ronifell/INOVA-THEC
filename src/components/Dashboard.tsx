"use client";

import { motion } from "framer-motion";
import { MODULES } from "@/lib/modules";
import ModuleCard from "./ModuleCard";
import FaithButtons from "./FaithButtons";
import FooterMarquee from "./FooterMarquee";
import { useVoice } from "@/hooks/useVoice";

export default function Dashboard() {
  const { speak } = useVoice();
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 md:px-8 py-24">
      {/* Title Section */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
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
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <FaithButtons />
      </motion.div>

      <motion.div
        className="w-full max-w-3xl mt-6 glass rounded-2xl p-4 md:p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-mono tracking-[0.2em] text-white/35 uppercase">
              Vitrine de Demonstração
            </p>
            <p className="text-xs text-white/55 mt-1">
              Acesso restrito leva da Vitrine para o Sistema Operacional de Auditoria.
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <a
              href="/acesso-restrito"
              onMouseEnter={() => speak("Acesso restrito ao sistema operacional de auditoria.")}
              className="flex-1 md:flex-none text-center px-4 py-2 rounded-xl border border-cyan-400/30 text-cyan-300 text-xs font-mono tracking-wider hover:bg-cyan-400/10 transition-colors"
            >
              ACESSO RESTRITO
            </a>
            <a
              href="/login"
              onMouseEnter={() => speak("Login da fábrica de dados e protocolo de fé pública.")}
              className="flex-1 md:flex-none text-center px-4 py-2 rounded-xl border border-emerald-400/30 text-emerald-300 text-xs font-mono tracking-wider hover:bg-emerald-400/10 transition-colors"
            >
              LOGIN OPERACIONAL
            </a>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="mt-10 w-full max-w-7xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.52, ease: [0.22, 1, 0.36, 1] }}
      >
        <FooterMarquee />
      </motion.div>

      {/* Bottom Tech Info */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-[9px] font-mono tracking-widest text-white/15">
          INOVA THEC © {new Date().getFullYear()} — CRIPTOGRAFIA SHA-256 |
          CADEIA DE CUSTÓDIA IMUTÁVEL | FÉ PÚBLICA DIGITAL
        </p>
      </motion.div>
    </div>
  );
}
