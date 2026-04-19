"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import PortalModuleCard from "@/components/PortalModuleCard";
import { MODULES } from "@/lib/modules";
import { useStore } from "@/store/useStore";
import {
  buildIntegrityRows,
  fetchDemoMotor,
  getMapDistanceMeters,
} from "@/lib/milestone1/data";
import type { DemoData, IntegrityRow, MotorResult } from "@/lib/milestone1/types";
import { openFuelAuditPdf } from "@/components/milestone1/milestone1Pdf";
import AuditCommandFrame from "@/components/audit/AuditCommandFrame";
import Operational6040Workspace from "@/components/audit/Operational6040Workspace";

const easeOut = [0.22, 1, 0.36, 1] as const;
const MilestoneMap = dynamic(() => import("@/components/milestone1/Milestone1Map"), {
  ssr: false,
});

const FROTA = MODULES[0]!;
const PAT = MODULES[1]!;

type MenuKind = "frota" | "patrimonio";

type MilestoneTile = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

/** Nível 2 — Combustível: sete botões (organograma cliente). IDs preservam telas já construídas. */
const FROTA_MENU_TILES: MilestoneTile[] = [
  {
    id: "homologacao",
    title: "TANQUE",
    description: "Volume, lacre e homologação do reservatório auditável.",
    icon: "🛢️",
  },
  {
    id: "vetoracao",
    title: "PLACA · VEÍCULO",
    description: "Identificação da frota e correlação geográfica.",
    icon: "🔖",
  },
  {
    id: "pericia",
    title: "HODÔMETRO",
    description: "Perícia de quilometragem e imagem de evidência.",
    icon: "📟",
  },
  {
    id: "trilha",
    title: "ABASTECIMENTO · TRILHA",
    description: "Registro cronológico de abastecimentos e validações.",
    icon: "⛽",
  },
  {
    id: "tribunal",
    title: "NOTA FISCAL · GLOSAS",
    description: "Documento fiscal e deliberação de glosas.",
    icon: "🧾",
  },
  {
    id: "economicidade",
    title: "GPS · ROTA · ECONOMICIDADE",
    description: "Trajeto, consumo observado e indicadores de eficiência.",
    icon: "🛰️",
  },
  {
    id: "certificacao",
    title: "SELO · FÉ PÚBLICA",
    description: "Certificação com integridade documental e AP-04.",
    icon: "✅",
  },
];

/** Nível 2 — Patrimônio: sete botões (organograma cliente). */
const PATRIMONIO_MENU_TILES: MilestoneTile[] = [
  {
    id: "central",
    title: "PLAQUETA",
    description: "Identificação física do bem e registro de tombo.",
    icon: "🏷️",
  },
  {
    id: "registro",
    title: "ESTADO DE CONSERVAÇÃO",
    description: "Registro pericial e formalização com fé pública.",
    icon: "🏛️",
  },
  {
    id: "cautelas",
    title: "LOCALIZAÇÃO · CAUTELAS",
    description: "Georreferenciamento e responsabilidade sobre o ativo.",
    icon: "📍",
  },
  {
    id: "custodia",
    title: "CADEIA DE CUSTÓDIA",
    description: "Histórico de guarda e transferência documentada.",
    icon: "🕓",
  },
  {
    id: "residual",
    title: "INVENTÁRIO · VALOR RESIDUAL",
    description: "Tombamento e avaliação patrimonial.",
    icon: "📋",
  },
  {
    id: "georef",
    title: "GEORREFERENCIAMENTO",
    description: "Mapeamento espacial e perímetro do bem.",
    icon: "🗺️",
  },
  {
    id: "extrator",
    title: "AUDITORIA · PROVA",
    description: "Extração de evidências, hash e exportação pericial.",
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
  const [selectedMapRecord, setSelectedMapRecord] = useState<MotorResult | undefined>();
  const [economicidadeAlert, setEconomicidadeAlert] = useState(false);
  const [uploadedEvidence, setUploadedEvidence] = useState<
    Record<string, { name: string; preview: string }>
  >({});

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

  const handleEvidenceUpload = useCallback(
    (tileId: string, file: File | undefined) => {
      if (!file) return;
      const preview = URL.createObjectURL(file);
      setUploadedEvidence((prev) => ({
        ...prev,
        [tileId]: { name: file.name, preview },
      }));
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingData(true);
      const data = await fetchDemoMotor();
      const rows = await buildIntegrityRows(data);
      if (cancelled) return;
      setDemoData(data);
      setIntegrityRows(rows);
      setSelectedMapRecord(data.resultados_motor_glosa[0]);
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
  const trailRows = integrityRows.slice(0, 12);

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col overflow-x-hidden overflow-y-auto px-4 pb-16 pt-4 md:px-6">
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

            <p className="mx-auto mb-8 max-w-xl text-center text-[11px] leading-relaxed text-white/40 md:text-xs">
              Para abrir a <strong className="text-white/70">operação 60/40</strong> (comandos + desenho técnico): escolha{" "}
              <span className="text-emerald-300/90">SIG-FROTA</span> ou{" "}
              <span className="text-blue-300/90">SIG-PATRIMÔNIO</span>, depois um dos sete botões do menu.
              Em ecrã largo o painel divide 60% / 40%.
            </p>

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
            className="flex min-h-0 min-w-0 flex-1 flex-col"
          >
            <AuditCommandFrame variant={activeMenu}>
              <div className="mb-6 flex flex-col items-center gap-4 sm:mb-8">
                <button
                  type="button"
                  onClick={goBackToMenu}
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-[11px] font-mono tracking-wider text-white/75 transition-colors hover:border-emerald-500/40 hover:text-white"
                >
                  ← Voltar ao cardápio
                </button>
              </div>

              <motion.div
                className="mb-6 text-center sm:mb-8"
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

              <Operational6040Workspace
                variant={activeMenu}
                title={activeTile.title}
                subtitle={activeTile.description}
              >
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
                    <div className="space-y-4">
                      {demoData && selectedMapRecord && (
                        <MilestoneMap
                          mode="fuel"
                          demoData={demoData}
                          selected={selectedMapRecord}
                          onSelect={setSelectedMapRecord}
                          onMarkerClick={setSelectedMapRecord}
                          mapKey={`m2-vetoracao-${activeTile.id}`}
                        />
                      )}
                      <div className="space-y-2">
                        {demoData?.resultados_motor_glosa.slice(0, 6).map((row) => (
                          <button
                            key={row.id}
                            type="button"
                            onClick={() => setSelectedMapRecord(row)}
                            className={`w-full rounded-xl border p-3 text-left text-xs transition-colors ${
                              selectedMapRecord?.id === row.id
                                ? "border-cyan-400/60 bg-cyan-500/10 text-white"
                                : "border-white/10 bg-white/5 text-white/75 hover:border-cyan-400/30"
                            }`}
                          >
                            <p className="font-semibold">{row.placa} · {row.transacaoId}</p>
                            <p className="mt-1 text-[11px] text-white/65">
                              Distância: {Math.round(getMapDistanceMeters(row))} m · {row.observacao || "Rota vetorizada para perícia geográfica."}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTile.id === "pericia" && firstFuel && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm font-semibold text-white">Registro pericial ativo: {firstFuel.placa}</p>
                        <p className="mt-2 text-xs text-white/70">Transação {firstFuel.transacaoId} · {new Date(firstFuel.transacaoTimestamp).toLocaleString("pt-BR")}</p>
                        <p className="mt-2 break-all text-[11px] text-white/60">Hash: {firstFuel.integrityHash}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/85">
                          📤 Enviar imagem pericial
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleEvidenceUpload(activeTile.id, e.target.files?.[0])
                            }
                          />
                        </label>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100">
                          📸 Abrir câmera
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) =>
                              handleEvidenceUpload(activeTile.id, e.target.files?.[0])
                            }
                          />
                        </label>
                      </div>
                      {uploadedEvidence[activeTile.id] && (
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <p className="text-xs text-white/70">
                            Arquivo: {uploadedEvidence[activeTile.id]?.name}
                          </p>
                          <img
                            src={uploadedEvidence[activeTile.id]?.preview}
                            alt="Prévia pericial"
                            className="mt-2 max-h-52 rounded-lg border border-white/10 object-contain"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {activeTile.id === "trilha" && (
                    <div className="space-y-4">
                      <div className="hidden items-center justify-between md:flex">
                        <p className="text-xs text-white/60">
                          Trilha de auditoria SHA-256 (SIG-FROTA)
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            openFuelAuditPdf({
                              filteredRows: trailRows,
                              grossSpending:
                                (demoData?.resumo_dashboard?.valor_total_transacoes ?? 0) +
                                (demoData?.resumo_dashboard?.valor_glosado ?? 0),
                              actualSpending:
                                demoData?.resumo_dashboard?.valor_total_transacoes ?? 0,
                              savingsPercent:
                                ((demoData?.resumo_dashboard?.economia_gerada ?? 0) /
                                  Math.max(
                                    (demoData?.resumo_dashboard?.valor_total_transacoes ?? 0) +
                                      (demoData?.resumo_dashboard?.valor_glosado ?? 0),
                                    1
                                  )) *
                                100,
                              origin:
                                typeof window !== "undefined"
                                  ? window.location.origin
                                  : "",
                            })
                          }
                          className="rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-4 py-2 text-xs font-mono text-cyan-200"
                        >
                          Extrair PDF (padrão timbrado)
                        </button>
                      </div>

                      {/* Mobile-first style: vertical timeline cards like the original milestone mobile UI */}
                      <div className="md:hidden">
                        <div className="mb-3 overflow-hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                          <div className="whitespace-nowrap text-[10px] text-white/65 [animation:milestone2Ticker_16s_linear_infinite]">
                            <span className="pr-6">
                              trânsito • [ABC1D23] TXN-00101 · APROVADO • [XYZ9K87] TXN-00102 ·
                            </span>
                            <span className="pr-6" aria-hidden>
                              trânsito • [ABC1D23] TXN-00101 · APROVADO • [XYZ9K87] TXN-00102 ·
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {trailRows.slice(0, 6).map((row, idx) => (
                            <div key={row.id} className="relative pl-9">
                              <div
                                className="absolute left-[14px] top-0 h-full w-px bg-cyan-300/55"
                                aria-hidden
                              />
                              <div className="absolute left-0 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/70 bg-cyan-400/20">
                                <span className="absolute inline-flex h-7 w-7 rounded-full bg-cyan-300/30 animate-ping" />
                                <span className="absolute inline-flex h-5 w-5 rounded-full border border-cyan-200/60 bg-cyan-300/20" />
                                <span className="relative h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.7)]" />
                              </div>
                              <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/75 p-4 text-slate-200 shadow-[0_10px_20px_rgba(2,6,23,0.32)] backdrop-blur">
                                <p className="text-sm font-semibold text-white">{row.department}</p>
                                <p className="mt-1 text-xs text-slate-300/75">{row.date}</p>
                                <p className="mt-2 text-sm text-slate-200/90">
                                  Placa {row.plate} — registro na trilha SHA-256 do SIG-FROTA.
                                </p>
                                <p className="mt-2 text-xs font-semibold text-cyan-300">SHA-256</p>
                                <code className="mt-1 block break-all rounded-md border border-cyan-400/40 bg-slate-950/70 px-2 py-1 text-[10px] text-cyan-200">
                                  {row.calculatedHash}
                                </code>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            openFuelAuditPdf({
                              filteredRows: trailRows,
                              grossSpending:
                                (demoData?.resumo_dashboard?.valor_total_transacoes ?? 0) +
                                (demoData?.resumo_dashboard?.valor_glosado ?? 0),
                              actualSpending:
                                demoData?.resumo_dashboard?.valor_total_transacoes ?? 0,
                              savingsPercent:
                                ((demoData?.resumo_dashboard?.economia_gerada ?? 0) /
                                  Math.max(
                                    (demoData?.resumo_dashboard?.valor_total_transacoes ?? 0) +
                                      (demoData?.resumo_dashboard?.valor_glosado ?? 0),
                                    1
                                  )) *
                                100,
                              origin:
                                typeof window !== "undefined"
                                  ? window.location.origin
                                  : "",
                            })
                          }
                          className="mt-5 w-full rounded-xl border border-slate-600/70 bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(2,6,23,0.35)]"
                        >
                          Extrair PDF (padrão timbrado)
                        </button>
                      </div>

                      <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[720px] border-collapse text-left text-[11px]">
                          <thead>
                            <tr className="border-b border-white/10 text-white/45">
                              <th className="p-2">Data</th>
                              <th className="p-2">Órgão</th>
                              <th className="p-2">Placa</th>
                              <th className="p-2">SHA-256</th>
                            </tr>
                          </thead>
                          <tbody>
                            {trailRows.map((row) => (
                              <tr
                                key={row.id}
                                className="border-b border-white/5 text-white/75"
                              >
                                <td className="p-2 whitespace-nowrap">{row.date}</td>
                                <td className="p-2">{row.department}</td>
                                <td className="p-2">{row.plate}</td>
                                <td className="max-w-[220px] break-all font-mono text-[9px] text-cyan-300/90">
                                  {row.calculatedHash}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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
                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={() => setEconomicidadeAlert((v) => !v)}
                        className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100"
                      >
                        Simular alerta de desvio
                      </button>
                      <div
                        className={`rounded-xl border p-4 ${
                          economicidadeAlert
                            ? "border-red-400/40 bg-red-500/10"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        <p className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">
                          Curva de consumo (meta x observado)
                        </p>
                        <svg
                          className="mt-3 h-[180px] w-full"
                          viewBox="0 0 480 210"
                          preserveAspectRatio="xMidYMid meet"
                          aria-hidden
                        >
                          <line x1="0" y1="88" x2="480" y2="88" stroke="rgba(125,211,252,0.45)" strokeDasharray="8 8" />
                          <polyline
                            fill={economicidadeAlert ? "rgba(239,68,68,0.18)" : "rgba(16,185,129,0.18)"}
                            stroke={economicidadeAlert ? "#ef4444" : "#10b981"}
                            strokeWidth="3"
                            points={economicidadeAlert ? "0,120 60,118 120,123 180,132 240,148 300,162 360,171 420,178 480,186 480,210 0,210" : "0,128 60,122 120,118 180,112 240,106 300,103 360,101 420,98 480,94 480,210 0,210"}
                          />
                        </svg>
                        {economicidadeAlert && (
                          <p className="mt-2 text-xs text-red-200">
                            Alerta: consumo observado acima da meta econômica.
                          </p>
                        )}
                      </div>
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
                    </div>
                  )}

                  {activeTile.id === "certificacao" && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs text-white/70">Certificado de fé pública emitido com assinatura SHA-256.</p>
                        <p className="mt-2 break-all text-[11px] text-white/60">{firstFuel?.integrityHash ?? "Sem hash disponível"}</p>
                      </div>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/85">
                        📷 Carregar imagem para certificação
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleEvidenceUpload(activeTile.id, e.target.files?.[0])
                          }
                        />
                      </label>
                    </div>
                  )}

                  {activeTile.id === "central" && (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <p className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">Bens sob custódia</p>
                          <p className="mt-2 text-xl font-semibold text-white">
                            {patrimonyAssets.length || 6}
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <p className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">Auditorias ativas</p>
                          <p className="mt-2 text-xl font-semibold text-white">4</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <p className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">Integridade</p>
                          <p className="mt-2 text-xl font-semibold text-blue-300">SHA-256</p>
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
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/85">
                        📤 Upload de prova (imagem)
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleEvidenceUpload(activeTile.id, e.target.files?.[0])
                          }
                        />
                      </label>
                      {uploadedEvidence[activeTile.id] && (
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <p className="text-xs text-white/70">
                            Prova anexada: {uploadedEvidence[activeTile.id]?.name}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              </Operational6040Workspace>

            <div className="mt-5 overflow-hidden rounded-xl border border-cyan-500/20 bg-[#071330]/80">
              <div className="whitespace-nowrap py-2 text-[11px] font-mono text-cyan-200/80 [animation:milestone2Ticker_20s_linear_infinite]">
                <span className="px-6">
                  SHA-256 · TRILHA DE AUDITORIA E INTEGRIDADE DOCUMENTAL · FÉ PÚBLICA ·
                  Vistoria AO VIVO · Conservação sincronizada · Acre ·
                </span>
                <span className="px-6" aria-hidden>
                  SHA-256 · TRILHA DE AUDITORIA E INTEGRIDADE DOCUMENTAL · FÉ PÚBLICA ·
                  Vistoria AO VIVO · Conservação sincronizada · Acre ·
                </span>
              </div>
            </div>
            </AuditCommandFrame>
          </motion.div>
        ) : (
          <motion.div
            key={`modules-${activeMenu}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: easeOut }}
            className="flex min-h-0 min-w-0 flex-1 flex-col"
          >
            <AuditCommandFrame variant={activeMenu}>
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
                  Menu de comando · sete frentes de auditoria
                </p>
                <div className="mx-auto mt-4 h-px w-32 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </motion.div>

              <div className="module-cards-glow-gutter module-cards-glow-gutter--hub mb-12 grid w-full grid-cols-2 gap-3 overflow-visible sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-7">
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
            </AuditCommandFrame>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
