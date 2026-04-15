"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MODULES } from "@/lib/modules";
import ModuleCard from "./ModuleCard";
import FaithButtons from "./FaithButtons";
import FooterMarquee from "./FooterMarquee";

const easeOut = [0.22, 1, 0.36, 1] as const;

/** Após última carta + mola — evita texto/botões antes do fim da cascata */
const AFTER_CARDS = 1.82;

export default function Dashboard() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 md:px-8 py-24 overflow-visible">
      {/* Título — cascata suave linha a linha */}
      <motion.div
        className="text-center mb-10 w-full max-w-2xl"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.12, delayChildren: 0.04 },
          },
        }}
      >
        <motion.h2
          className="text-2xl md:text-3xl font-bold tracking-wider text-white/90 mb-2"
          variants={{
            hidden: { opacity: 0, y: -10, filter: "blur(6px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.65, ease: easeOut },
            },
          }}
        >
          PAINEL DE COMANDO
        </motion.h2>
        <motion.p
          className="text-xs font-mono tracking-[0.25em] text-white/25 uppercase"
          variants={{
            hidden: { opacity: 0, y: 6 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.55, ease: easeOut },
            },
          }}
        >
          Sistema Integrado de Gestão — Protocolo AP-04
        </motion.p>
        <motion.div
          className="mt-4 h-[1px] w-32 mx-auto bg-gradient-to-r from-transparent via-white/20 to-transparent"
          variants={{
            hidden: { opacity: 0, scaleX: 0.3 },
            visible: {
              opacity: 1,
              scaleX: 1,
              transition: { duration: 0.6, ease: easeOut },
            },
          }}
        />
      </motion.div>

      {/* Cartões — queda visível (overflow visível evita clip da transformação) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 md:gap-4 w-full max-w-7xl mb-12 overflow-visible">
        {MODULES.map((mod, i) => (
          <ModuleCard key={mod.id} module={mod} index={i} />
        ))}
      </div>

      <motion.div
        className="w-full max-w-3xl"
        initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{
          duration: 0.75,
          delay: AFTER_CARDS,
          ease: easeOut,
        }}
      >
        <FaithButtons />
      </motion.div>

      <motion.div
        className="w-full max-w-3xl mt-6 glass rounded-2xl p-4 md:p-5"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.65,
          delay: AFTER_CARDS + 0.22,
          ease: easeOut,
        }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.55,
              delay: AFTER_CARDS + 0.32,
              ease: easeOut,
            }}
          >
            <p className="text-[10px] font-mono tracking-[0.2em] text-white/35 uppercase">
              Vitrine de Demonstração
            </p>
            <p className="text-xs text-white/55 mt-1">
              Acesso restrito leva da Vitrine para o Sistema Operacional de Auditoria.
            </p>
          </motion.div>
          <div className="flex gap-2 w-full md:w-auto">
            <motion.div
              className="flex-1 md:flex-none"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: AFTER_CARDS + 0.42,
                ease: easeOut,
              }}
            >
              <button
                type="button"
                aria-disabled
                className="block w-full text-center px-4 py-2 rounded-xl border border-cyan-500/20 text-cyan-300/45 text-xs font-mono tracking-wider cursor-not-allowed select-none opacity-70"
              >
                ACESSO RESTRITO
              </button>
            </motion.div>
            <motion.div
              className="flex-1 md:flex-none"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: AFTER_CARDS + 0.54,
                ease: easeOut,
              }}
            >
              <button
                type="button"
                aria-disabled
                className="block w-full text-center px-4 py-2 rounded-xl border border-emerald-500/20 text-emerald-300/45 text-xs font-mono tracking-wider cursor-not-allowed select-none opacity-70"
              >
                LOGIN OPERACIONAL
              </button>
            </motion.div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
          <Link
            href="/milestone1"
            className="block text-center rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-xs font-mono tracking-wider text-cyan-200 transition-all hover:border-cyan-300/70 hover:bg-cyan-500/15"
          >
            IR PARA MILESTONE 1
          </Link>
          <Link
            href="/milestone2"
            className="block text-center rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-mono tracking-wider text-emerald-200 transition-all hover:border-emerald-300/70 hover:bg-emerald-500/15"
          >
            IR PARA MILESTONE 2
          </Link>
        </div>
      </motion.div>

      <motion.div
        className="mt-10 w-full max-w-7xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.55,
          delay: AFTER_CARDS + 0.72,
          ease: easeOut,
        }}
      >
        <FooterMarquee />
      </motion.div>

      <motion.div
        className="mt-6 text-center max-w-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.6,
          delay: AFTER_CARDS + 0.88,
          ease: easeOut,
        }}
      >
        <p className="text-[9px] font-mono tracking-widest text-white/15">
          INOVA THEC © {new Date().getFullYear()} — CRIPTOGRAFIA SHA-256 |
          CADEIA DE CUSTÓDIA IMUTÁVEL | FÉ PÚBLICA DIGITAL
        </p>
      </motion.div>
    </div>
  );
}
