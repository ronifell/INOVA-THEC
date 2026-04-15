"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PortalModuleCard from "@/components/PortalModuleCard";
import { MODULES } from "@/lib/modules";
import { useStore } from "@/store/useStore";

const easeOut = [0.22, 1, 0.36, 1] as const;

const FROTA = MODULES[0]!;
const PAT = MODULES[1]!;

type MenuKind = "frota" | "patrimonio";

type MilestoneTile = {
  title: string;
  description: string;
  icon: string;
};

const FROTA_MENU_TILES: MilestoneTile[] = [
  {
    title: "PAINEL DE HOMOLOGAÇÃO DO ORDENADOR",
    description: "Validação oficial de abastecimentos e conformidade fiscal.",
    icon: "🏦",
  },
  {
    title: "VETORAÇÃO GEOGRÁFICA — Tela 1",
    description: "Correlação geográfica de rotas e eventos operacionais.",
    icon: "🌐",
  },
  {
    title: "PERÍCIA DE IMAGEM — Tela 2",
    description: "Análise técnica de evidências visuais e metadados.",
    icon: "📷",
  },
  {
    title: "TRILHA DE AUDITORIA — Tela 3",
    description: "Registro cronológico de ações e verificações do processo.",
    icon: "📄",
  },
  {
    title: "TRIBUNAL DE GLOSAS — Tela 4",
    description: "Classificação de glosas e deliberações de auditoria.",
    icon: "🛡️",
  },
  {
    title: "ANÁLISE DE ECONOMICIDADE — Tela 5",
    description: "Indicadores de eficiência e economia na operação.",
    icon: "📈",
  },
  {
    title: "CERTIFICAÇÃO DE FÉ PÚBLICA — Tela 6",
    description: "Emissão de prova técnica com integridade documental.",
    icon: "✅",
  },
];

const PATRIMONIO_MENU_TILES: MilestoneTile[] = [
  {
    title: "CENTRAL DE FISCALIZAÇÃO TJ / CGE",
    description: "Consolidação das fiscalizações e governança de ativos.",
    icon: "🧭",
  },
  {
    title: "REGISTRO DE FÉ PÚBLICA — Tela 1",
    description: "Formalização oficial de achados e certificações.",
    icon: "🪪",
  },
  {
    title: "ACERVO DE CAUTELAS — Tela 2",
    description: "Gestão de cautelas e responsabilidade dos bens.",
    icon: "👥",
  },
  {
    title: "CADEIA DE CUSTÓDIA — Tela 3",
    description: "Histórico de guarda e transferência dos ativos.",
    icon: "🕓",
  },
  {
    title: "AVALIAÇÃO RESIDUAL — Tela 4",
    description: "Cálculo técnico do valor residual patrimonial.",
    icon: "🧮",
  },
  {
    title: "GEORREFERENCIAMENTO — Tela 5",
    description: "Mapeamento espacial e perícia territorial dos bens.",
    icon: "🗺️",
  },
  {
    title: "EXTRATOR DE PROVA — Tela 6",
    description: "Extração de evidências para auditoria e conformidade.",
    icon: "🔬",
  },
];

export default function Milestone2Client() {
  const triggerHashValidation = useStore((s) => s.triggerHashValidation);
  const [activeMenu, setActiveMenu] = useState<MenuKind | null>(null);

  const openMenu = useCallback((menu: MenuKind) => {
    triggerHashValidation();
    setActiveMenu(menu);
  }, [triggerHashValidation]);

  const goPortal = useCallback(() => {
    setActiveMenu(null);
  }, []);

  const submenuTiles = activeMenu === "frota" ? FROTA_MENU_TILES : PATRIMONIO_MENU_TILES;
  const menuTheme = activeMenu === "frota" ? FROTA : PAT;
  const menuTitle =
    activeMenu === "frota"
      ? "SIG-FROTA — GESTÃO DE COMBUSTÍVEL"
      : "SIG-PATRIMÔNIO — GESTÃO DE ATIVOS";

  return (
    <div className="mx-auto w-full max-w-7xl overflow-visible px-4 pb-16 pt-4 md:px-6">
      <AnimatePresence mode="wait">
        {!activeMenu ? (
          <motion.div
            key="portal"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: easeOut }}
          >
            <motion.div
              className="mb-10 text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOut }}
            >
              <h2 className="text-2xl font-bold tracking-wider text-white/90 md:text-3xl">
                PLATAFORMA INTEGRADA DE GOVERNANÇA
              </h2>
              <p className="mt-2 text-xs font-mono tracking-[0.25em] text-white/30">
                MILESTONE 2 · ACESSO OPERACIONAL
              </p>
              <div className="mx-auto mt-4 h-px w-32 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </motion.div>

            <section
              aria-labelledby="m2-portal-hub-heading"
              className="w-full overflow-visible"
            >
              <h2
                id="m2-portal-hub-heading"
                className="sr-only"
              >
                Acesso SIG-FROTA e SIG-PATRIMÔNIO
              </h2>
              {/* One horizontal row (two columns); gaps scale up with viewport; xl uses 7-col grid so tiles match dashboard width. */}
              <div className="mx-auto grid w-full grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:grid-cols-7 xl:gap-4">
                <div className="flex min-h-0 min-w-0 flex-col gap-3 xl:col-span-1">
                  <h3 className="text-center text-[11px] font-bold uppercase leading-snug tracking-wider text-emerald-400/90 sm:text-left sm:text-xs md:text-sm">
                    SIG-FROTA — GESTÃO DE COMBUSTÍVEL
                  </h3>
                  <PortalModuleCard
                    index={0}
                    color={FROTA.color}
                    colorRgb={FROTA.colorRgb}
                    icon={FROTA.icon}
                    title="Gestão e Perícia de Combustível"
                    description="Monitoramento, vetoração e trilha de auditoria do combustível estadual."
                    isFullModule
                    voiceText="Gestão e perícia de combustível. Protocolo SIG-FROTA operacional."
                    onClick={() => openMenu("frota")}
                  />
                </div>
                <div className="flex min-h-0 min-w-0 flex-col gap-3 xl:col-span-1">
                  <h3 className="text-center text-[11px] font-bold uppercase leading-snug tracking-wider text-blue-400/90 sm:text-left sm:text-xs md:text-sm">
                    SIG-PATRIMÔNIO — GESTÃO DE ATIVOS
                  </h3>
                  <PortalModuleCard
                    index={1}
                    color={PAT.color}
                    colorRgb={PAT.colorRgb}
                    icon={PAT.icon}
                    title="Imutabilidade e Rastreabilidade de Ativos"
                    description="Custódia digital, inventário e fiscalização patrimonial com fé pública."
                    isFullModule
                    voiceText="Imutabilidade e rastreabilidade de ativos. SIG-PATRIMÔNIO ativo."
                    onClick={() => openMenu("patrimonio")}
                  />
                </div>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key={`modules-${activeMenu}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: easeOut }}
          >
            <div className="mb-8 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goPortal}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-[11px] font-mono tracking-wider text-white/75 transition-colors hover:border-emerald-500/40 hover:text-white"
              >
                ← Portal Milestone 2
              </button>
            </div>

            <motion.div
              className="mb-10 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOut }}
            >
              <h2 className="text-2xl font-bold tracking-wider text-white/90 md:text-3xl">
                {menuTitle}
              </h2>
              <p className="mt-2 text-xs font-mono tracking-[0.25em] text-white/25 uppercase">
                Botões operacionais do frontend · Milestone 2
              </p>
              <div className="mx-auto mt-4 h-px w-32 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 md:gap-4 w-full mb-12 overflow-visible">
              {submenuTiles.map((tile, i) => (
                <PortalModuleCard
                  key={tile.title}
                  index={i}
                  color={menuTheme.color}
                  colorRgb={menuTheme.colorRgb}
                  icon={tile.icon}
                  title={tile.title}
                  description={tile.description}
                  isFullModule
                  onClick={triggerHashValidation}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
