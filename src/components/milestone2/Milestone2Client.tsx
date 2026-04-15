"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PortalModuleCard from "@/components/PortalModuleCard";
import { MODULES } from "@/lib/modules";
import { useStore } from "@/store/useStore";
import {
  buildIntegrityRows,
  fetchDemoMotor,
  getMapDistanceMeters,
} from "@/lib/milestone1/data";
import type { DemoData, IntegrityRow } from "@/lib/milestone1/types";

const easeOut = [0.22, 1, 0.36, 1] as const;

const FROTA = MODULES[0]!;
const PAT = MODULES[1]!;

type MenuKind = "frota" | "patrimonio";

type MilestoneTile = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

const FROTA_MENU_TILES: MilestoneTile[] = [
  {
    id: "homologacao",
    title: "PAINEL DE HOMOLOGAÇÃO DO ORDENADOR",
    description: "Validação oficial de abastecimentos e conformidade fiscal.",
    icon: "🏦",
  },
  {
    id: "vetoracao",
    title: "VETORAÇÃO GEOGRÁFICA — Tela 1",
    description: "Correlação geográfica de rotas e eventos operacionais.",
    icon: "🌐",
  },
  {
    id: "pericia",
    title: "PERÍCIA DE IMAGEM — Tela 2",
    description: "Análise técnica de evidências visuais e metadados.",
    icon: "📷",
  },
  {
    id: "trilha",
    title: "TRILHA DE AUDITORIA — Tela 3",
    description: "Registro cronológico de ações e verificações do processo.",
    icon: "📄",
  },
  {
    id: "tribunal",
    title: "TRIBUNAL DE GLOSAS — Tela 4",
    description: "Classificação de glosas e deliberações de auditoria.",
    icon: "🛡️",
  },
  {
    id: "economicidade",
    title: "ANÁLISE DE ECONOMICIDADE — Tela 5",
    description: "Indicadores de eficiência e economia na operação.",
    icon: "📈",
  },
  {
    id: "certificacao",
    title: "CERTIFICAÇÃO DE FÉ PÚBLICA — Tela 6",
    description: "Emissão de prova técnica com integridade documental.",
    icon: "✅",
  },
];

const PATRIMONIO_MENU_TILES: MilestoneTile[] = [
  {
    id: "central",
    title: "CENTRAL DE FISCALIZAÇÃO TJ / CGE",
    description: "Consolidação das fiscalizações e governança de ativos.",
    icon: "🧭",
  },
  {
    id: "registro",
    title: "REGISTRO DE FÉ PÚBLICA — Tela 1",
    description: "Formalização oficial de achados e certificações.",
    icon: "📝",
  },
  {
    id: "cautelas",
    title: "ACERVO DE CAUTELAS — Tela 2",
    description: "Gestão de cautelas e responsabilidade dos bens.",
    icon: "👥",
  },
  {
    id: "custodia",
    title: "CADEIA DE CUSTÓDIA — Tela 3",
    description: "Histórico de guarda e transferência dos ativos.",
    icon: "🕓",
  },
  {
    id: "residual",
    title: "AVALIAÇÃO RESIDUAL — Tela 4",
    description: "Cálculo técnico do valor residual patrimonial.",
    icon: "🧮",
  },
  {
    id: "georef",
    title: "GEORREFERENCIAMENTO — Tela 5",
    description: "Mapeamento espacial e perícia territorial dos bens.",
    icon: "🗺️",
  },
  {
    id: "extrator",
    title: "EXTRATOR DE PROVA — Tela 6",
    description: "Extração de evidências para auditoria e conformidade.",
    icon: "🔬",
  },
];

export default function Milestone2Client() {
  const triggerHashValidation = useStore((s) => s.triggerHashValidation);
  const [activeMenu, setActiveMenu] = useState<MenuKind | null>(null);
  const [activeTile, setActiveTile] = useState<MilestoneTile | null>(null);
  const [demoData, setDemoData] = useState<DemoData | null>(null);
  const [integrityRows, setIntegrityRows] = useState<IntegrityRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const openMenu = useCallback((menu: MenuKind) => {
    triggerHashValidation();
    setActiveMenu(menu);
    setActiveTile(null);
  }, [triggerHashValidation]);

  const goPortal = useCallback(() => {
    setActiveMenu(null);
    setActiveTile(null);
  }, []);

  const openTile = useCallback(
    (tile: MilestoneTile) => {
      triggerHashValidation();
      setActiveTile(tile);
    },
    [triggerHashValidation]
  );

  const goBackToMenu = useCallback(() => {
    setActiveTile(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingData(true);
      const data = await fetchDemoMotor();
      const rows = await buildIntegrityRows(data);
      if (cancelled) return;
      setDemoData(data);
      setIntegrityRows(rows);
      setLoadingData(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const submenuTiles = activeMenu === "frota" ? FROTA_MENU_TILES : PATRIMONIO_MENU_TILES;
  const menuTheme = activeMenu === "frota" ? FROTA : PAT;
  const menuTitle =
    activeMenu === "frota"
      ? "SIG-FROTA — GESTÃO DE COMBUSTÍVEL"
      : "SIG-PATRIMÔNIO — GESTÃO DE ATIVOS";
  const firstFuel = demoData?.resultados_motor_glosa?.[0];
  const patrimonyAssets = demoData?.bens_patrimonio ?? [];
  const totalPatrimony = demoData?.resumo_patrimonio?.valor_patrimonial_total ?? 0;
  const avgConservation =
    patrimonyAssets.length > 0
      ? patrimonyAssets.reduce((sum, item) => sum + item.conservacaoPercent, 0) /
        patrimonyAssets.length
      : 0;
  const economicityPct = useMemo(() => {
    const gross = demoData?.resumo_dashboard?.valor_total_transacoes ?? 0;
    const net = (demoData?.resumo_dashboard?.valor_glosado ?? 0) + gross;
    if (net <= 0) return 0;
    return (gross / net) * 100;
  }, [demoData]);

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
              {/* Two equal cards: stacked on small screens, left/right anchored on desktop. */}
              <div className="mx-auto grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-8">
                <div className="flex min-h-0 min-w-0 w-full max-w-md flex-col gap-3 justify-self-center sm:justify-self-start">
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
                <div className="flex min-h-0 min-w-0 w-full max-w-md flex-col gap-3 justify-self-center sm:justify-self-end">
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
        ) : activeTile ? (
          <motion.div
            key={`screen-${activeMenu}-${activeTile.id}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: easeOut }}
          >
            <div className="mb-8 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goBackToMenu}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-[11px] font-mono tracking-wider text-white/75 transition-colors hover:border-emerald-500/40 hover:text-white"
              >
                ← Voltar ao cardápio
              </button>
            </div>

            <motion.div
              className="mb-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOut }}
            >
              <h2 className="text-2xl font-bold tracking-wider text-white/90 md:text-3xl">
                {activeTile.title}
              </h2>
              <p className="mt-2 text-xs font-mono tracking-[0.25em] text-white/25 uppercase">
                {menuTitle} · tela operacional
              </p>
            </motion.div>

            <div className="glass mx-auto max-w-5xl rounded-2xl border border-white/10 p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl"
                  style={{ backgroundColor: `rgba(${menuTheme.colorRgb}, 0.14)` }}
                  aria-hidden
                >
                  {activeTile.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-wide text-white/90">
                    {activeTile.title}
                  </p>
                  <p className="text-xs text-white/55">{activeTile.description}</p>
                </div>
              </div>

              {loadingData ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center text-sm text-white/70">
                  Carregando dados operacionais...
                </div>
              ) : (
                <>
                  {activeTile.id === "homologacao" && (
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">Frota homologada</p>
                        <p className="mt-2 text-xl font-semibold text-white">{demoData?.resumo_dashboard.total_transacoes ?? 0}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">Valor auditado</p>
                        <p className="mt-2 text-xl font-semibold text-white">R$ {(demoData?.resumo_dashboard.valor_total_transacoes ?? 0).toLocaleString("pt-BR")}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">Economia gerada</p>
                        <p className="mt-2 text-xl font-semibold text-emerald-300">R$ {(demoData?.resumo_dashboard.economia_gerada ?? 0).toLocaleString("pt-BR")}</p>
                      </div>
                    </div>
                  )}

                  {activeTile.id === "vetoracao" && (
                    <div className="space-y-3">
                      {demoData?.resultados_motor_glosa.slice(0, 6).map((row) => (
                        <div key={row.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-white">{row.placa} · {row.transacaoId}</p>
                            <p className="text-xs text-white/60">{Math.round(getMapDistanceMeters(row))} m do posto</p>
                          </div>
                          <p className="mt-2 text-xs text-white/70">{row.observacao || "Rota vetorizada para perícia geográfica."}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTile.id === "pericia" && firstFuel && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm font-semibold text-white">Registro pericial ativo: {firstFuel.placa}</p>
                      <p className="mt-2 text-xs text-white/70">Transação {firstFuel.transacaoId} · {new Date(firstFuel.transacaoTimestamp).toLocaleString("pt-BR")}</p>
                      <p className="mt-2 break-all text-[11px] text-white/60">Hash: {firstFuel.integrityHash}</p>
                    </div>
                  )}

                  {activeTile.id === "trilha" && (
                    <div className="space-y-2">
                      {integrityRows.slice(0, 7).map((row) => (
                        <div key={row.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/75">
                          <span className="font-semibold text-white">{row.plate}</span> · {row.date} · {row.department}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTile.id === "tribunal" && (
                    <div className="space-y-2">
                      {demoData?.resultados_motor_glosa.slice(0, 7).map((row) => (
                        <div key={row.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/80">
                          {row.transacaoId} · status: <span className="font-semibold text-white">{row.glosaStatus}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTile.id === "economicidade" && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">Índice de economicidade</p>
                        <p className="mt-2 text-2xl font-semibold text-emerald-300">{economicityPct.toFixed(2)}%</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">Valor glosado</p>
                        <p className="mt-2 text-2xl font-semibold text-white">R$ {(demoData?.resumo_dashboard.valor_glosado ?? 0).toLocaleString("pt-BR")}</p>
                      </div>
                    </div>
                  )}

                  {activeTile.id === "certificacao" && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs text-white/70">Certificado de fé pública emitido com assinatura SHA-256.</p>
                      <p className="mt-2 break-all text-[11px] text-white/60">{firstFuel?.integrityHash ?? "Sem hash disponível"}</p>
                    </div>
                  )}

                  {activeTile.id === "central" && (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <p className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">Bens catalogados</p>
                          <p className="mt-2 text-xl font-semibold text-white">{patrimonyAssets.length}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <p className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">Valor patrimonial</p>
                          <p className="mt-2 text-xl font-semibold text-white">R$ {totalPatrimony.toLocaleString("pt-BR")}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <p className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">Conservação média</p>
                          <p className="mt-2 text-xl font-semibold text-blue-300">{avgConservation.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTile.id === "registro" && (
                    <div className="space-y-2">
                      {patrimonyAssets.slice(0, 6).map((asset) => (
                        <div key={asset.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/75">
                          <span className="font-semibold text-white">{asset.tombo}</span> · INPI {asset.categoria} · registro SHA ativo
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTile.id === "cautelas" && (
                    <div className="space-y-2">
                      {patrimonyAssets.slice(0, 6).map((asset) => (
                        <div key={asset.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/75">
                          <span className="font-semibold text-white">{asset.responsavel}</span> · cautela do bem {asset.tombo} · {asset.situacao}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTile.id === "custodia" && (
                    <div className="space-y-2">
                      {patrimonyAssets.slice(0, 6).map((asset) => (
                        <div key={asset.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/75">
                          Cadeia de custódia · <span className="font-semibold text-white">{asset.tombo}</span> · hash {asset.integrityHash.slice(0, 20)}...
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTile.id === "residual" && (
                    <div className="grid gap-4 md:grid-cols-3">
                      {patrimonyAssets.slice(0, 3).map((asset) => {
                        const residual = asset.valorPatrimonial * (asset.conservacaoPercent / 100);
                        return (
                          <div key={asset.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                            <p className="text-xs font-semibold text-white">{asset.tombo}</p>
                            <p className="mt-2 text-[11px] text-white/60">{asset.descricao}</p>
                            <p className="mt-3 text-sm text-blue-200">Residual: R$ {residual.toLocaleString("pt-BR")}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {activeTile.id === "georef" && (
                    <div className="space-y-2">
                      {patrimonyAssets.slice(0, 6).map((asset) => (
                        <div key={asset.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/75">
                          <span className="font-semibold text-white">{asset.tombo}</span> · lat {asset.lat.toFixed(4)} · lng {asset.lng.toFixed(4)}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTile.id === "extrator" && (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <p className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">Bens catalogados</p>
                          <p className="mt-2 text-xl font-semibold text-white">{patrimonyAssets.length}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <p className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">Valor patrimonial</p>
                          <p className="mt-2 text-xl font-semibold text-white">R$ {totalPatrimony.toLocaleString("pt-BR")}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <p className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">Conservação média</p>
                          <p className="mt-2 text-xl font-semibold text-blue-300">{avgConservation.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {patrimonyAssets.slice(0, 5).map((asset) => (
                          <div key={asset.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/75">
                            <span className="font-semibold text-white">{asset.tombo}</span> · {asset.descricao} · pacote de prova extraído
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
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
                  onClick={() => openTile(tile)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
