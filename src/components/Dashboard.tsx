"use client";

import { motion } from "framer-motion";
import { MODULES } from "@/lib/modules";
import ModuleCard from "./ModuleCard";
import FooterMarquee from "./FooterMarquee";
import AuditPublicCenter from "./AuditPublicCenter";

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function Dashboard() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-x-hidden overflow-y-auto px-[2.5%] pb-[1vh] pt-[4.5vh]">
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Título — alinhado à faixa central do cabeçalho (Painel de Comando) */}
        <motion.div
          className="mx-auto flex w-full max-w-[72%] shrink-0 flex-col items-center justify-center py-1 text-center md:max-w-7xl"
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
            className="mb-[0.6vh] text-[clamp(1rem,2.2vh,1.35rem)] font-bold tracking-[0.18em] text-white"
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
            className="text-[clamp(0.65rem,1.05vh,0.85rem)] font-mono tracking-[0.22em] text-white/85 uppercase"
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
            className="mx-auto mt-[0.9vh] h-[0.12vh] min-h-[1px] w-[24%] max-w-xs bg-gradient-to-r from-transparent via-white/25 to-transparent"
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

        {/* Cápsulas — altura fixa em % */}
        <div className="mx-auto grid h-[40.8%] w-full max-w-[96%] shrink-0 auto-rows-fr grid-cols-2 items-stretch gap-[1.1vh] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {MODULES.map((mod, i) => (
            <ModuleCard key={mod.id} module={mod} index={i} />
          ))}
        </div>

        {/* Centro de Auditoria e Fé Pública — três pilares */}
        <AuditPublicCenter className="mt-[1vh] min-h-0 shrink-0" />
      </div>

      {/* Texto em fluxo — rodapé da vista, abaixo dos três pilares */}
      <div className="mx-auto mt-auto w-full max-w-[96%] shrink-0 pb-0 pt-2">
        <FooterMarquee />
      </div>
    </div>
  );
}
