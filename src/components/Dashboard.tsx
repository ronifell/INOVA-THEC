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
    <div className="h-full w-full overflow-hidden px-[2.5%] pb-[2.5vh] pt-[10vh]">
      {/* Título — cascata suave linha a linha */}
      <motion.div
        className="mx-auto flex h-[13%] w-full max-w-[72%] shrink-0 flex-col items-center justify-center text-center"
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
          className="mb-[0.9vh] text-[2.35vh] font-bold tracking-[0.18em] text-white/90"
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
          className="text-[1.1vh] font-mono tracking-[0.24em] text-white/25 uppercase"
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
          className="mx-auto mt-[1.1vh] h-[0.15vh] w-[24%] bg-gradient-to-r from-transparent via-white/20 to-transparent"
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
      <div className="mx-auto grid h-[34%] w-full max-w-[96%] shrink-0 auto-rows-fr grid-cols-2 gap-[1.1vh] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {MODULES.map((mod, i) => (
          <ModuleCard key={mod.id} module={mod} index={i} />
        ))}
      </div>

      <motion.div
        className="mx-auto mt-[2vh] w-full max-w-[60%] shrink-0"
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
        className="mx-auto mt-[2vh] w-full max-w-[60%] shrink-0 rounded-[1.2vw] glass p-[1.6vh]"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.65,
          delay: AFTER_CARDS + 0.22,
          ease: easeOut,
        }}
      >
        <div className="flex items-start justify-between gap-[1.1vh] md:items-center">
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.55,
              delay: AFTER_CARDS + 0.32,
              ease: easeOut,
            }}
          >
            <p className="text-[1vh] font-mono tracking-[0.2em] text-white/35 uppercase">
              Vitrine de Demonstração
            </p>
            <p className="mt-[0.45vh] text-[1.15vh] text-white/55">
              Acesso restrito leva da Vitrine para o Sistema Operacional de Auditoria.
            </p>
          </motion.div>
          <div className="flex w-[47%] gap-[0.55vw]">
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
                className="block w-full cursor-not-allowed select-none rounded-[0.7vw] border border-cyan-500/20 px-[0.9vw] py-[0.85vh] text-center font-mono text-[1.05vh] tracking-[0.16em] text-cyan-300/45 opacity-70"
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
                className="block w-full cursor-not-allowed select-none rounded-[0.7vw] border border-emerald-500/20 px-[0.9vw] py-[0.85vh] text-center font-mono text-[1.05vh] tracking-[0.16em] text-emerald-300/45 opacity-70"
              >
                LOGIN OPERACIONAL
              </button>
            </motion.div>
          </div>
        </div>
        <div className="mt-[1.2vh] grid grid-cols-2 gap-[0.55vw]">
          <Link
            href="/milestone1"
            className="block w-[70%] justify-self-center rounded-[0.7vw] border border-cyan-400/40 bg-cyan-500/10 px-[0.9vw] py-[0.85vh] text-center font-mono text-[1.05vh] tracking-[0.16em] text-cyan-200 transition-all hover:border-cyan-300/70 hover:bg-cyan-500/15"
          >
            IR PARA MILESTONE 1
          </Link>
          <Link
            href="/milestone2"
            className="block rounded-[0.7vw] border border-emerald-400/40 bg-emerald-500/10 px-[0.9vw] py-[0.85vh] text-center font-mono text-[1.05vh] tracking-[0.16em] text-emerald-200 transition-all hover:border-emerald-300/70 hover:bg-emerald-500/15"
          >
            IR PARA MILESTONE 2
          </Link>
        </div>
      </motion.div>

      <motion.div
        className="mx-auto mt-[2vh] w-full max-w-[96%] shrink-0"
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
        className="mx-auto mt-[1.4vh] max-w-[72%] text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.6,
          delay: AFTER_CARDS + 0.88,
          ease: easeOut,
        }}
      >
        <p className="text-[0.92vh] font-mono tracking-[0.26em] text-white/15">
          INOVA THEC © {new Date().getFullYear()} — CRIPTOGRAFIA SHA-256 |
          CADEIA DE CUSTÓDIA IMUTÁVEL | FÉ PÚBLICA DIGITAL
        </p>
      </motion.div>
    </div>
  );
}
