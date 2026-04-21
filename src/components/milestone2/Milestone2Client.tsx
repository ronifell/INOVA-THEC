"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PortalModuleCard from "@/components/PortalModuleCard";
import { MODULES } from "@/lib/modules";
import { useStore } from "@/store/useStore";
import { buildIntegrityRows, fetchDemoMotor } from "@/lib/milestone1/data";
import type { DemoData, IntegrityRow } from "@/lib/milestone1/types";
import { openFuelAuditPdf } from "@/components/milestone1/milestone1Pdf";
import AuditCommandFrame from "@/components/audit/AuditCommandFrame";
import Operational6040Workspace from "@/components/audit/Operational6040Workspace";
import { Milestone2FuelProvider } from "@/components/milestone2/fuel/Milestone2FuelContext";
import FuelProtocolMaterialidade from "@/components/milestone2/fuel/FuelProtocolMaterialidade";
import FuelAssetIdentification from "@/components/milestone2/fuel/FuelAssetIdentification";
import FuelOdometerProtocol from "@/components/milestone2/fuel/FuelOdometerProtocol";
import FuelGeographicInsumo from "@/components/milestone2/fuel/FuelGeographicInsumo";
import FuelSentenceLiquidation from "@/components/milestone2/fuel/FuelSentenceLiquidation";
import FuelEconomicidadePanel from "@/components/milestone2/fuel/FuelEconomicidadePanel";
import FuelAuditExitReports from "@/components/milestone2/fuel/FuelAuditExitReports";

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

/** Nível 2 — Combustível: sete botões (organograma cliente). IDs preservam telas já construídas. */
const FROTA_MENU_TILES: MilestoneTile[] = [
  {
    id: "homologacao",
    title:
      "PROTOCOLO DE MATERIALIDADE PERICIAL: Reservatório, Vedação e Insumo",
    description:
      "Reservatório auditável, lacre, hodômetro e bomba com validação pericial.",
    icon: "🛢️",
  },
  {
    id: "vetoracao",
    title: "IDENTIFICAÇÃO DE ATIVO E CORRELAÇÃO DE FROTA",
    description:
      "Cruzamento da placa com o contrato administrativo e vínculo orgânico.",
    icon: "🔖",
  },
  {
    id: "pericia",
    title: "HODÔMETRO — PROTOCOLO DE MOVIMENTAÇÃO AP-04",
    description:
      "Quilometragem, consumo, economicidade e estados de conformidade.",
    icon: "📟",
  },
  {
    id: "trilha",
    title: "COMPROVAÇÃO DE MATERIALIDADE E LASTRO DE INSUMO",
    description:
      "Protocolo 4-A (tanque direto) e 4-B (galão contingência) com triangulação pericial.",
    icon: "⛽",
  },
  {
    id: "tribunal",
    title: "CENTRAL DE SENTENÇA E LIQUIDAÇÃO",
    description: "Scanner pericial das evidências e comando final de autorizar/rejeitar.",
    icon: "🧾",
  },
  {
    id: "economicidade",
    title: "ECONOMICIDADE — CÉREBRO SIG-FROTA",
    description: "Cruzamento de KM, litros e valor pago com infográficos de economia.",
    icon: "🛰️",
  },
  {
    id: "certificacao",
    title: "MÓDULO DE SAÍDA E AUDITORIA FINAL",
    description: "Emissão dos 5 relatórios oficiais com blindagem criptográfica.",
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

  const fuelProtocolTile =
    activeTile &&
    (activeTile.id === "homologacao" ||
      activeTile.id === "vetoracao" ||
      activeTile.id === "pericia" ||
      activeTile.id === "trilha");
  const fuelAdvancedTile =
    activeMenu === "frota" &&
    activeTile &&
    (activeTile.id === "tribunal" ||
      activeTile.id === "economicidade" ||
      activeTile.id === "certificacao");

  return (
    <Milestone2FuelProvider>
    <div className="milestone1-app flex h-full min-h-0 w-full flex-col overflow-x-hidden overflow-y-auto lg:overflow-y-hidden">
      <AnimatePresence mode="wait">
        {!activeMenu ? (
          <motion.div
            key="portal"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: easeOut }}
            className="mx-auto w-full max-w-7xl px-4 pb-16 pt-4 md:px-6"
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
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          >
            <AuditCommandFrame variant={activeMenu}>
              <div className="pointer-events-none absolute left-0 right-0 top-0 z-[30] flex justify-start px-2 pt-1 sm:px-4 sm:pt-2">
                <button
                  type="button"
                  onClick={goBackToMenu}
                  className="pointer-events-auto inline-flex w-fit items-center gap-2 rounded-full border border-white/18 bg-black/35 px-3 py-1.5 text-[10px] font-mono tracking-wider text-white/80 transition-colors hover:border-emerald-500/45 hover:text-white sm:px-4 sm:py-2 sm:text-[11px]"
                >
                  ← Voltar ao cardápio
                </button>
              </div>

              <motion.div
                className="mb-4 pt-8 text-center sm:mb-6 sm:pt-10"
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
                {!fuelProtocolTile && (
                  <div className="mb-6 flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl"
                      style={{
                        backgroundColor: `rgba(${menuTheme.colorRgb}, 0.14)`,
                      }}
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
                )}

                {fuelProtocolTile ? (
                  <>
                    {activeTile.id === "homologacao" && <FuelProtocolMaterialidade />}
                    {activeTile.id === "vetoracao" && <FuelAssetIdentification />}
                    {activeTile.id === "pericia" && <FuelOdometerProtocol />}
                    {activeTile.id === "trilha" && <FuelGeographicInsumo />}
                  </>
                ) : fuelAdvancedTile ? (
                  <>
                    {activeTile?.id === "tribunal" && <FuelSentenceLiquidation />}
                    {activeTile?.id === "economicidade" && <FuelEconomicidadePanel />}
                    {activeTile?.id === "certificacao" && <FuelAuditExitReports />}
                  </>
                ) : loadingData ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center text-sm text-white/70">
                  Carregando dados operacionais...
                </div>
              ) : (
                <>
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

            <div className="mt-3 shrink-0 overflow-hidden rounded-xl border border-cyan-500/20 bg-[#071330]/80">
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
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-visible"
          >
            {/* Espelha o hub do Milestone 1 (embedded): proporção 1.22 cartões : 0.96 faixa inferior */}
            <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-[min(3.2vmin,2.8vh)]">
              <div className="flex shrink-0 flex-col items-center gap-[min(1.5vmin,1.2vh)] text-center">
                <button
                  type="button"
                  onClick={goPortal}
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 px-[1vw] py-[0.6vh] text-[11px] font-mono tracking-wider text-white/75 transition-colors hover:border-emerald-500/40 hover:text-white"
                >
                  ← Portal Milestone 2
                </button>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: easeOut }}
                >
                  <h2 className="text-[var(--m1-text-ui)] font-mono tracking-[0.22em] text-white/55 md:text-base">
                    {menuTitle}
                  </h2>
                  <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
                    Menu de comando · sete frentes de auditoria
                  </p>
                  <div className="mx-auto mt-3 h-px w-32 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </motion.div>
              </div>

              <div className="relative z-[12] flex min-h-0 min-w-0 w-full flex-1 flex-col gap-[min(3.2vmin,2.8vh)]">
                <AuditCommandFrame
                  variant={activeMenu}
                  className="module-cards-glow-gutter module-cards-glow-gutter--hub min-h-0 w-full min-w-0 flex-[1.22]"
                >
                  <div className="grid h-full min-h-0 w-full auto-rows-fr grid-cols-2 items-stretch gap-[1vh] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
                    {submenuTiles.map((tile, i) => (
                      <div
                        key={tile.id}
                        className="relative z-[1] h-full w-[90%] justify-self-center"
                      >
                        <PortalModuleCard
                          index={i}
                          color={menuTheme.color}
                          colorRgb={menuTheme.colorRgb}
                          icon={tile.icon}
                          title={tile.title}
                          description={tile.description}
                          isFullModule
                          voiceText={`${menuTitle}. ${tile.title}. ${tile.description}`}
                          onClick={() => openTile(tile)}
                        />
                      </div>
                    ))}
                  </div>
                </AuditCommandFrame>

                <div className="flex min-h-0 min-w-0 flex-[0.96] flex-col items-center justify-center overflow-x-hidden overflow-y-auto py-[0.5vh]">
                  {/* Reserva a mesma faixa inferior do hub M1 (botão modo claro/escuro) para alinhar proporção dos cartões */}
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-hidden
                    className="glass pointer-events-none invisible select-none rounded-full border border-white/15 px-[1.2vw] py-[0.6vh] text-[var(--m1-text-ui)] font-mono tracking-[0.15em] text-white/80"
                  >
                    ☾ Modo escuro
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </Milestone2FuelProvider>
  );
}
