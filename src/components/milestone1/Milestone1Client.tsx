"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import type {
  DemoData,
  IntegrityRow,
  MilestoneHubView,
  MotorResult,
  PatrimonyChainRow,
  PatrimonyTimelineEvent,
} from "@/lib/milestone1/types";
import {
  buildDefaultTimeline,
  buildIntegrityRows,
  EMPTY_DEMO_MOTOR_DATA,
  fetchDemoMotor,
  getMapDistanceMeters,
  isAutomaticDeduction,
  mockDepartment,
} from "@/lib/milestone1/data";
import AuditCommandFrame from "@/components/audit/AuditCommandFrame";
import Operational6040Workspace from "@/components/audit/Operational6040Workspace";
import PortalModuleCard from "@/components/PortalModuleCard";
import { MODULES } from "@/lib/modules";
import { useStore } from "@/store/useStore";
import { openFuelAuditPdf, openPatrimonyPdf } from "./milestone1Pdf";

const Milestone1Map = dynamic(() => import("./Milestone1Map"), {
  ssr: false,
  loading: () => (
    <div
      className="h-[min(56vh,520px)] w-full animate-pulse rounded-xl border border-white/10 bg-white/5"
      aria-hidden
    />
  ),
});

/** Same accent tokens as dashboard SIG-FROTA / SIG-PATRIMÔNIO cards */
const M1_FROTA = MODULES[0]!;

/** Nível 2 — apenas SIG-FROTA (Combustível): sete botões por organograma cliente. */
type HubTileDef = {
  hubKey: string;
  view: MilestoneHubView;
  title: string;
  description: string;
  icon: string;
  voiceText: string;
};

const MILESTONE1_MENU_COMBUSTIVEL: HubTileDef[] = [
  {
    hubKey: "comb-tanque",
    view: "fuel-reserve",
    title: "TANQUE",
    description: "Volume, litragem e lacre — prova pericial do reservatório.",
    icon: "🛢️",
    voiceText: "Auditoria de tanque e volume de combustível.",
  },
  {
    hubKey: "comb-placa",
    view: "fuel-map",
    title: "PLACA",
    description: "Identificação do veículo e correlação com frota cadastrada.",
    icon: "🔖",
    voiceText: "Verificação de placa e vínculo com o ativo.",
  },
  {
    hubKey: "comb-hodometro",
    view: "governance",
    title: "HODÔMETRO",
    description: "Quilometragem e consistência com rotas e consumo.",
    icon: "📟",
    voiceText: "Leitura de hodômetro e coerência operacional.",
  },
  {
    hubKey: "comb-abastecimento",
    view: "fuel-reserve",
    title: "ABASTECIMENTO",
    description: "Litros, posto e captura com GPS — fé pública.",
    icon: "⛽",
    voiceText: "Registro de abastecimento georreferenciado.",
  },
  {
    hubKey: "comb-nota",
    view: "fuel-integrity",
    title: "NOTA FISCAL",
    description: "Cupom, NF-e e vínculo com transação auditada.",
    icon: "🧾",
    voiceText: "Conferência documental e trilha fiscal.",
  },
  {
    hubKey: "comb-gps",
    view: "fuel-map",
    title: "GPS · ROTA",
    description: "Trajeto, perímetro e validação veículo–posto.",
    icon: "🛰️",
    voiceText: "Georreferenciamento e malha operacional.",
  },
  {
    hubKey: "comb-selo",
    view: "fuel-integrity",
    title: "TRILHA · SELO",
    description: "SHA-256, exportação oficial e selo AP-04.",
    icon: "🔗",
    voiceText: "Trilha de integridade e selo de auditoria.",
  },
];

/** Sete cartões na grelha — só combustível (portal Patrimônio usa Milestone 2). */
const MILESTONE1_HUB_SEVEN = MILESTONE1_MENU_COMBUSTIVEL.map((item) => ({
  item,
  palette: "frota" as const,
}));

function moduleTitleLine(v: MilestoneHubView): string {
  switch (v) {
    case "governance":
      return "HODÔMETRO · Inteligência operacional";
    case "fuel-map":
      return "PLACA · GPS · Georreferenciamento";
    case "fuel-reserve":
      return "TANQUE · ABASTECIMENTO";
    case "fuel-integrity":
      return "NOTA FISCAL · TRILHA E SELO";
    case "assets-map":
      return "LOCALIZAÇÃO · Vistoria em campo";
    case "assets-report":
      return "PLAQUETA · Inventário e tombo";
    case "assets-timeline":
      return "ESTADO · Timeline pericial";
    default:
      return "";
  }
}

function moduleSubtitle(
  v: MilestoneHubView,
  isFuelModule: boolean,
  isAssetsModule: boolean
): string {
  if (v === "fuel-integrity") {
    return "Fecho jurídico para o auditor — relatório, QR de validação e SHA-256 com fé pública.";
  }
  if (v === "fuel-reserve") {
    return "Combustível extra em galões para trechos sem posto — mesma prova pericial com foto e GPS.";
  }
  if (isFuelModule) {
    return "Auditoria, feixe de integridade e SHA-256 para imutabilidade dos dados.";
  }
  if (v === "assets-report") {
    return "SIG-PATRIMÔNIO — inventário, tombamento e trilha de integridade documental.";
  }
  if (v === "assets-timeline") {
    return "Histórico imutável do bem — INPI, AP04 distinto e cadeia SHA-256 auditável.";
  }
  if (isAssetsModule) {
    return "SIG-PATRIMÔNIO — vistoria, censo e georreferenciamento para prova técnica.";
  }
  return "Centro de governança — Inovathec Soluções Ltda.";
}

function scrambleHex(len: number, seed: number, tick: number): string {
  const chars = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[(seed * (i + 13) + tick * 7 + i) % 16]!;
  }
  return out;
}

export type Milestone1ClientProps = {
  /**
   * Na app principal: não duplicar cabeçalho “INOVA THEC” nem o rodapé fixo com ticker
   * (usa-se o `Header` da página e o `FooterMarquee` comum).
   */
  embeddedInAppShell?: boolean;
};

export default function Milestone1Client({
  embeddedInAppShell = false,
}: Milestone1ClientProps = {}) {
  const triggerHashValidation = useStore((s) => s.triggerHashValidation);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<MilestoneHubView>("hub");
  const [darkMode, setDarkMode] = useState(false);
  const [demoData, setDemoData] = useState<DemoData | null>(null);
  const [integrityRows, setIntegrityRows] = useState<IntegrityRow[]>([]);
  const [selectedMapRecord, setSelectedMapRecord] = useState<
    MotorResult | undefined
  >();
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [integrityFilterLoading, setIntegrityFilterLoading] = useState(false);
  const [integrityScanGen, setIntegrityScanGen] = useState(0);
  const [integrityLaserSweep, setIntegrityLaserSweep] = useState(false);
  const [dashboardChartsAnimated, setDashboardChartsAnimated] = useState(false);
  const [displayFleet, setDisplayFleet] = useState(0);
  const [displaySavings, setDisplaySavings] = useState(0);
  const [displayLiters, setDisplayLiters] = useState(0);
  const [displayGross, setDisplayGross] = useState(0);
  const [displayActual, setDisplayActual] = useState(0);
  const [displaySavingsPct, setDisplaySavingsPct] = useState(0);
  const [fuelProofPreviewUrl, setFuelProofPreviewUrl] = useState<string | null>(
    null
  );
  const [fuelShutterPulse, setFuelShutterPulse] = useState(false);
  const [pinDetailRecord, setPinDetailRecord] = useState<MotorResult | null>(
    null
  );
  const [modalConservation, setModalConservation] = useState(0);
  const [ap04ScannerOpen, setAp04ScannerOpen] = useState(false);
  const [ap04Scanning, setAp04Scanning] = useState(false);
  const [ap04PhotoCaptured, setAp04PhotoCaptured] = useState(false);
  const [ap04PhotoFlash, setAp04PhotoFlash] = useState(false);
  const [ap04Saving, setAp04Saving] = useState(false);
  const [ap04LiveGps, setAp04LiveGps] = useState("");
  const [ap04LiveTime, setAp04LiveTime] = useState("");
  const [timelineReveal, setTimelineReveal] = useState(false);
  const [timelineCompare, setTimelineCompare] = useState<"idle" | "ok" | "fail">(
    "idle"
  );
  const [timelineEvents, setTimelineEvents] = useState<PatrimonyTimelineEvent[]>(
    []
  );
  const [, setCompareFailRound] = useState(false);
  const [hubLiveHash, setHubLiveHash] = useState("");
  const [hubFixedHash, setHubFixedHash] = useState("");
  const [hubHashLocked, setHubHashLocked] = useState(false);
  const [assetsReportLoading, setAssetsReportLoading] = useState(true);
  const [assetsMapSkeleton, setAssetsMapSkeleton] = useState(true);
  const [integrityScrambleTick, setIntegrityScrambleTick] = useState(0);
  const [integrityShieldOk, setIntegrityShieldOk] = useState<
    Record<number, boolean>
  >({});
  const [mapMountKey, setMapMountKey] = useState(0);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const filterDebounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const hubHashTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined
  );
  const ap04StampRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined
  );
  const ap04ScanTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const integrityScrambleRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined
  );
  const kpiRafRef = useRef<number>(0);

  const tickHubHash = useCallback(() => {
    const hex = "0123456789abcdef";
    let s = "";
    for (let i = 0; i < 64; i++) {
      s += hex[Math.floor(Math.random() * 16)]!;
    }
    setHubLiveHash(s);
  }, []);

  useEffect(() => {
    if (activeView !== "hub" || hubHashLocked || loading) {
      if (hubHashTimerRef.current) {
        clearInterval(hubHashTimerRef.current);
        hubHashTimerRef.current = undefined;
      }
      return;
    }
    tickHubHash();
    hubHashTimerRef.current = setInterval(tickHubHash, 100);
    return () => {
      if (hubHashTimerRef.current) clearInterval(hubHashTimerRef.current);
    };
  }, [activeView, hubHashLocked, loading, tickHubHash]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchDemoMotor();
        if (cancelled) return;
        setDemoData(data);
        setSelectedMapRecord(data.resultados_motor_glosa[0]);

        const rows = await buildIntegrityRows(data);
        if (cancelled) return;
        setIntegrityRows(rows);
      } catch {
        if (!cancelled) {
          setDemoData(EMPTY_DEMO_MOTOR_DATA);
          setIntegrityRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isFuelModuleView =
    activeView === "governance" ||
    activeView === "fuel-map" ||
    activeView === "fuel-reserve" ||
    activeView === "fuel-integrity";

  const isAssetsModuleView =
    activeView === "assets-map" ||
    activeView === "assets-report" ||
    activeView === "assets-timeline";

  const isFuelGeoView =
    activeView === "fuel-map" || activeView === "fuel-reserve";

  const totalLiters = useMemo(
    () =>
      (demoData?.abastecimentos ?? []).reduce((a, x) => a + x.liters, 0),
    [demoData]
  );
  const grossSpending = demoData?.resumo_dashboard.valor_total_transacoes ?? 0;
  const totalSavings = demoData?.resumo_dashboard.economia_gerada ?? 0;
  const actualSpending = grossSpending - totalSavings;
  const savingsPercent = grossSpending
    ? (totalSavings / grossSpending) * 100
    : 0;

  const topIrregularities = useMemo(() => {
    const source = demoData?.resultados_motor_glosa ?? [];
    const byDepartment = new Map<string, number>();
    source.forEach((row, index) => {
      const key = mockDepartment(index);
      if (row.glosaStatus !== "APROVADO") {
        byDepartment.set(key, (byDepartment.get(key) ?? 0) + 1);
      }
    });
    return Array.from(byDepartment.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [demoData]);

  const filteredIntegrityRows = useMemo(
    () =>
      integrityRows.filter((row) => {
        const byDep =
          departmentFilter === "all" || row.department === departmentFilter;
        const byDate = !dateFilter || row.date.startsWith(dateFilter);
        return byDep && byDate;
      }),
    [integrityRows, departmentFilter, dateFilter]
  );

  const departments = useMemo(
    () => Array.from(new Set(integrityRows.map((r) => r.department))),
    [integrityRows]
  );

  const patrimonyChainRows: PatrimonyChainRow[] = useMemo(() => {
    const bens = demoData?.bens_patrimonio;
    if (bens?.length) {
      return bens.map((b) => ({
        tombo: b.tombo,
        descricao: b.descricao,
        inpiRegistro: b.inpiRegistro,
        integrityHash: b.integrityHash,
        situacao: b.situacao,
      }));
    }
    const rows = demoData?.resultados_motor_glosa ?? [];
    const labels = [
      "Imóvel histórico",
      "Monumento tombado",
      "Bem móvel catalogado",
      "Acervo museológico",
      "Patrimônio público",
    ];
    return rows.slice(0, 8).map((r, i) => ({
      tombo: r.placa,
      descricao: `${labels[i % labels.length]!} · ${r.transacaoId}`,
      inpiRegistro: `INPI-BR-2024-PAT-${(827400 + r.id).toString(36).toUpperCase()}`,
      integrityHash: r.integrityHash || `sim-${r.id}-${r.placa}`,
      situacao:
        r.glosaStatus === "APROVADO"
          ? "Sincronizado / válido"
          : "Em revisão pericial",
    }));
  }, [demoData]);

  const maxIrreg = Math.max(...topIrregularities.map((i) => i.value), 1);

  const queueKpiAnimation = useCallback(() => {
    const targetFleet = 3150;
    const targetS = totalSavings;
    const targetL = totalLiters;
    const targetG = grossSpending;
    const targetA = actualSpending;
    const targetP = savingsPercent;
    setDisplayFleet(0);
    setDisplaySavings(0);
    setDisplayLiters(0);
    setDisplayGross(0);
    setDisplayActual(0);
    setDisplaySavingsPct(0);
    if (kpiRafRef.current) cancelAnimationFrame(kpiRafRef.current);
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setDisplayFleet(targetFleet);
      setDisplaySavings(targetS);
      setDisplayLiters(targetL);
      setDisplayGross(targetG);
      setDisplayActual(targetA);
      setDisplaySavingsPct(targetP);
      return;
    }
    const duration = 1500;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const ease = 1 - (1 - t) ** 3;
      setDisplayFleet(Math.round(targetFleet * ease));
      setDisplaySavings(targetS * ease);
      setDisplayLiters(targetL * ease);
      setDisplayGross(targetG * ease);
      setDisplayActual(targetA * ease);
      setDisplaySavingsPct(targetP * ease);
      if (t < 1) {
        kpiRafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayFleet(targetFleet);
        setDisplaySavings(targetS);
        setDisplayLiters(targetL);
        setDisplayGross(targetG);
        setDisplayActual(targetA);
        setDisplaySavingsPct(targetP);
      }
    };
    kpiRafRef.current = requestAnimationFrame(tick);
  }, [
    totalSavings,
    totalLiters,
    grossSpending,
    actualSpending,
    savingsPercent,
  ]);

  useEffect(() => {
    if (activeView === "governance" && demoData) {
      queueKpiAnimation();
      const id = window.setTimeout(() => setDashboardChartsAnimated(true), 80);
      return () => clearTimeout(id);
    }
    setDashboardChartsAnimated(false);
  }, [activeView, demoData, queueKpiAnimation]);

  const goToHub = useCallback(() => {
    setActiveView("hub");
    setFuelProofPreviewUrl(null);
    setPinDetailRecord(null);
    setAp04ScannerOpen(false);
    setTimelineReveal(false);
    setTimelineCompare("idle");
    setHubHashLocked(false);
    setMapMountKey((k) => k + 1);
  }, []);

  const setView = useCallback(
    (view: MilestoneHubView) => {
      if (view !== "fuel-integrity") {
        if (integrityScrambleRef.current) {
          clearInterval(integrityScrambleRef.current);
          integrityScrambleRef.current = undefined;
        }
        setIntegrityScrambleTick(0);
        setIntegrityShieldOk({});
      }

      const wasHub = activeView === "hub";
      setActiveView(view);

      if (wasHub && view !== "hub") {
        setHubHashLocked(true);
        const fromData =
          demoData?.abastecimentos?.[0]?.integrityHash ??
          integrityRows[0]?.calculatedHash;
        setHubFixedHash(
          (fromData && String(fromData).replace(/\s/g, "")) ||
            hubLiveHash ||
            "0".repeat(64)
        );
      }

      if (view === "fuel-map" || view === "fuel-reserve" || view === "assets-map") {
        setAssetsMapSkeleton(true);
        setMapMountKey((k) => k + 1);
        window.setTimeout(() => setAssetsMapSkeleton(false), 700);
      }

      if (view === "governance" && demoData) {
        queueKpiAnimation();
        window.setTimeout(() => setDashboardChartsAnimated(true), 80);
      } else {
        setDashboardChartsAnimated(false);
      }

      if (view === "fuel-integrity") {
        setIntegrityScanGen((g) => g + 1);
        setIntegrityLaserSweep(true);
        window.setTimeout(() => setIntegrityLaserSweep(false), 3600);
        setIntegrityShieldOk({});
        let tick = 0;
        integrityScrambleRef.current = setInterval(() => {
          tick += 1;
          setIntegrityScrambleTick(tick);
          if (tick > 48 && integrityScrambleRef.current) {
            clearInterval(integrityScrambleRef.current);
            integrityScrambleRef.current = undefined;
          }
        }, 90);
        const rowsForShield = integrityRows.filter((row) => {
          const byDep =
            departmentFilter === "all" || row.department === departmentFilter;
          const byDate = !dateFilter || row.date.startsWith(dateFilter);
          return byDep && byDate;
        });
        rowsForShield.forEach((row, i) => {
          window.setTimeout(() => {
            setIntegrityShieldOk((prev) => ({ ...prev, [row.id]: true }));
          }, 480 + i * 100);
        });
      }

      if (view === "assets-report") {
        setAssetsReportLoading(true);
        window.setTimeout(() => setAssetsReportLoading(false), 650);
      }

      if (view === "assets-timeline") {
        const base = selectedMapRecord ?? demoData?.resultados_motor_glosa[0];
        const latestIso = new Date().toISOString();
        const cadeia = demoData?.cadeia_custodia_patrimonio;
        if (cadeia?.length) {
          setTimelineEvents(
            cadeia.map((ev) => ({
              id: `ev-${ev.id}`,
              kind:
                (ev.etapa as "tombamento" | "cautela" | "vistoria") ||
                "vistoria",
              title: ev.titulo,
              detail: ev.descricao,
              at: ev.data,
              integrityHash: ev.integrityHash,
              tampered: ev.tampered,
            }))
          );
        } else {
          setTimelineEvents(buildDefaultTimeline(base, latestIso));
        }
        setTimelineReveal(false);
        window.setTimeout(() => setTimelineReveal(true), 80);
      }
    },
    [
      activeView,
      demoData,
      hubLiveHash,
      integrityRows,
      queueKpiAnimation,
      selectedMapRecord,
      departmentFilter,
      dateFilter,
    ]
  );

  const onIntegrityFilter = () => {
    if (filterDebounceRef.current) clearTimeout(filterDebounceRef.current);
    setIntegrityFilterLoading(true);
    filterDebounceRef.current = setTimeout(() => {
      setIntegrityFilterLoading(false);
      setIntegrityScanGen((g) => g + 1);
      if (activeView === "fuel-integrity") {
        setIntegrityLaserSweep(true);
        window.setTimeout(() => setIntegrityLaserSweep(false), 3600);
      }
    }, 550);
  };

  const getHashDisplay = (row: IntegrityRow, index: number) => {
    const settleAt = 6 + index * 3;
    if (integrityScrambleTick >= settleAt || integrityScrambleTick > 48) {
      return row.calculatedHash;
    }
    return scrambleHex(
      row.calculatedHash.length,
      row.id + index + integrityScrambleTick,
      integrityScrambleTick
    );
  };

  const triggerFuelCamera = () => {
    setFuelShutterPulse(true);
    window.setTimeout(() => setFuelShutterPulse(false), 400);
    cameraInputRef.current?.click();
  };

  const onFuelCameraChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file?.type.startsWith("image/")) {
      ev.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const lat = selectedMapRecord?.postoLat ?? -15.601;
        const lng = selectedMapRecord?.postoLng ?? -56.097;
        const reserveTag =
          activeView === "fuel-reserve"
            ? " · Abastecimento reserva (galões)"
            : "";
        const stamp = `${new Date().toISOString()} · GPS ${lat.toFixed(5)}, ${lng.toFixed(5)} (WGS-84)${reserveTag}`;
        const barH = Math.max(40, Math.round(canvas.height * 0.08));
        ctx.fillStyle = "rgba(15, 23, 42, 0.72)";
        ctx.fillRect(0, canvas.height - barH, canvas.width, barH);
        ctx.fillStyle = "#ffffff";
        ctx.font = `${Math.max(11, Math.round(canvas.width * 0.018))}px system-ui, sans-serif`;
        ctx.fillText(stamp, 10, canvas.height - Math.round(barH / 3));
        setFuelProofPreviewUrl(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    ev.target.value = "";
  };

  const openAp04Scanner = (fromFab: boolean) => {
    if (ap04ScanTimerRef.current) clearTimeout(ap04ScanTimerRef.current);
    setAp04ScannerOpen(true);
    setAp04Scanning(true);
    if (fromFab) {
      setAp04PhotoFlash(false);
    }
    ap04ScanTimerRef.current = setTimeout(() => {
      setAp04Scanning(false);
      setAp04ScannerOpen(false);
      setAp04PhotoCaptured(true);
      setAp04PhotoFlash(true);
      window.setTimeout(() => setAp04PhotoFlash(false), 280);
      const lat = selectedMapRecord?.postoLat ?? -9.974;
      const lng = selectedMapRecord?.postoLng ?? -67.81;
      const tick = () => {
        const jitter = (Math.random() - 0.5) * 0.00002;
        setAp04LiveGps(
          `${(lat + jitter).toFixed(6)}, ${(lng + jitter).toFixed(6)} (WGS-84)`
        );
        setAp04LiveTime(new Date().toISOString());
      };
      tick();
      if (ap04StampRef.current) clearInterval(ap04StampRef.current);
      ap04StampRef.current = setInterval(tick, 400);
    }, 2800);
  };

  const confirmAp04 = () => {
    setAp04Saving(true);
    if (ap04StampRef.current) {
      clearInterval(ap04StampRef.current);
      ap04StampRef.current = undefined;
    }
    window.setTimeout(() => {
      setAp04Saving(false);
      setAp04PhotoCaptured(false);
    }, 900);
  };

  const compareTimelineHashes = () => {
    if (timelineCompare !== "idle") return;
    setCompareFailRound((prev) => {
      const nextFail = !prev;
      setTimelineCompare(nextFail ? "fail" : "ok");
      return nextFail;
    });
    window.setTimeout(() => setTimelineCompare("idle"), 3220);
  };

  const auditTickerHub = useMemo(() => {
    const parts: string[] = [
      "TORRE DE CONTROLE · Inovathec · Governança SEAGRI",
      "SIG-FROTA — combustível · SIG-PATRIMÔNIO · SHA-256 · tempo real",
    ];
    (demoData?.abastecimentos ?? []).forEach((s) => {
      parts.push(
        `[${s.license_plate}] R$ ${s.emission_value.toFixed(2)} · auditoria em curso`
      );
    });
    (demoData?.resultados_motor_glosa ?? []).slice(0, 5).forEach((r) => {
      parts.push(`[${r.placa}] Georef. validado · R$ ${r.valorTotal.toFixed(2)}`);
    });
    return parts.join("      ◆      ");
  }, [demoData]);

  const auditTickerFuel = useMemo(() => {
    const parts: string[] = [];
    (demoData?.abastecimentos ?? []).forEach((s) => {
      parts.push(
        `[${s.license_plate}] R$ ${s.emission_value.toFixed(2)} · ${s.liters} L · ${s.cidade}/${s.UF ?? "—"}`
      );
    });
    (demoData?.resultados_motor_glosa ?? []).forEach((r) => {
      parts.push(
        `[${r.placa}] Motor glosa: ${r.glosaStatus} · R$ ${r.valorTotal.toFixed(2)} · ${r.volumeLitros} L`
      );
    });
    filteredIntegrityRows.slice(0, 4).forEach((row) => {
      parts.push(
        `[${row.plate}] SHA-256 ${row.calculatedHash.slice(0, 8).toUpperCase()}… trilha ativa`
      );
    });
    return (
      parts.join("      ◆      ") ||
      "[SISTEMA] Aguardando registros de auditoria…"
    );
  }, [demoData, filteredIntegrityRows]);

  const auditTickerAssets = useMemo(() => {
    const labels = [
      "PREDIO-01",
      "MONUMENTO-05",
      "SITIO-03",
      "MUSEU-07",
      "CENTRO-12",
    ];
    const items = (demoData?.resultados_motor_glosa ?? []).slice(0, 6);
    const parts: string[] = [];
    items.forEach((r, i) => {
      const tag = labels[i % labels.length]!;
      parts.push(
        `[${tag}] Tombo ${r.placa} · R$ ${r.valorTotal.toFixed(2)} (referência patrimonial)`
      );
      parts.push(`[${tag}] Vistoria AO VIVO · conservação sincronizada · Acre`);
    });
    return (
      parts.join("      ◆      ") ||
      "[SIG-PATRIMÔNIO] Monitoramento em tempo real…"
    );
  }, [demoData]);

  const tickerText =
    activeView === "hub"
      ? auditTickerHub
      : activeView === "assets-map" ||
          activeView === "assets-report" ||
          activeView === "assets-timeline"
        ? auditTickerAssets
        : auditTickerFuel;

  /** No shell da Home o fundo é escuro — forçar texto claro; o toggle claro/escuro só aplica fora do embed. */
  const shellClass = embeddedInAppShell
    ? `flex h-full min-h-0 w-full flex-col ${
        activeView === "hub"
          ? "overflow-x-hidden overflow-y-visible"
          : "overflow-hidden"
      } text-slate-100`
    : `flex h-full min-h-0 w-full flex-col ${
        activeView === "hub"
          ? "overflow-x-hidden overflow-y-visible"
          : "overflow-hidden"
      } pb-[clamp(6.5rem,11vh,9.5rem)] ${darkMode ? "text-slate-100" : "text-slate-900"}`;

  if (loading || !demoData) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center gap-4 px-[2%]">
        <div className="h-16 w-16 max-h-20 max-w-20 animate-pulse rounded-xl border border-emerald-500/30 bg-emerald-500/10" />
        <p className="text-[var(--m1-text-mono-tight)] font-mono tracking-[0.3em] text-white/40">
          CARREGANDO DEMONSTRAÇÃO…
        </p>
      </div>
    );
  }

  return (
    <div className={`milestone1-app ${shellClass}`}>
      {activeView === "hub" && (
        <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-visible">
          {!embeddedInAppShell && (
            <header className="shrink-0 text-center">
              <div className="inline-flex flex-col items-center">
                <span className="bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-[var(--m1-text-hero)] font-black tracking-tight text-transparent drop-shadow-[0_0_24px_rgba(52,211,153,0.35)]">
                  INOVA THEC
                </span>
                <span className="text-[var(--m1-text-mono-tight)] font-mono tracking-[0.32em] text-white/55">
                  Soluções Ltda
                </span>
              </div>
              <p className="mt-[0.6vh] text-[var(--m1-text-ui)] font-mono tracking-[0.18em] text-white/45">
                Centro de Governança — identidade visual por módulo
              </p>
            </header>
          )}

          {/* Mesma repartição vertical que `HomeShellLayout` (1.22 cartões : 0.96 faixa inferior) para altura idêntica à Home */}
          <div
            className={`flex min-h-0 min-w-0 w-full flex-1 flex-col gap-[min(3.2vmin,2.8vh)] ${
              embeddedInAppShell ? "mt-0" : "mt-[1vh]"
            }`}
          >
            {!embeddedInAppShell && (
              <h2 className="shrink-0 text-center text-[var(--m1-text-ui)] font-mono tracking-[0.22em] text-white/55">
                SIG-FROTA (Combustível) — menu de comando · sete frentes
              </h2>
            )}

            <div className="relative z-[12] flex min-h-0 min-w-0 w-full flex-1 flex-col gap-[min(3.2vmin,2.8vh)]">
              <AuditCommandFrame
                variant="frota"
                className="module-cards-glow-gutter module-cards-glow-gutter--hub min-h-0 w-full min-w-0 flex-[1.22]"
              >
                <div className="grid h-full min-h-0 w-full auto-rows-fr grid-cols-2 items-stretch gap-[1vh] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
                  {MILESTONE1_HUB_SEVEN.map(({ item }, i) => (
                    <div
                      key={item.hubKey}
                      className="relative z-[1] h-full w-[90%] justify-self-center"
                    >
                      <PortalModuleCard
                        index={i}
                        color={M1_FROTA.color}
                        colorRgb={M1_FROTA.colorRgb}
                        icon={item.icon}
                        title={item.title}
                        description={item.description}
                        isFullModule
                        voiceText={item.voiceText}
                        onClick={() => {
                          triggerHashValidation();
                          setView(item.view);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </AuditCommandFrame>

              <div className="flex min-h-0 min-w-0 flex-[0.96] flex-col items-center justify-center overflow-x-hidden overflow-y-auto py-[0.5vh]">
                <button
                  type="button"
                  onClick={() => setDarkMode((d) => !d)}
                  className="glass rounded-full border border-white/15 px-[1.2vw] py-[0.6vh] text-[var(--m1-text-ui)] font-mono tracking-[0.15em] text-white/80 hover:border-white/30"
                >
                  {darkMode ? "☀ Modo claro" : "☾ Modo escuro"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView !== "hub" && (
        <div className="milestone-detail-neon flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="mx-auto mb-[1vh] flex max-w-[min(96%,72rem)] shrink-0 flex-wrap items-center justify-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={goToHub}
              className="glass inline-flex items-center gap-2 rounded-full border border-white/12 px-[1vw] py-[0.6vh] text-[var(--m1-text-ui)] font-mono tracking-[0.12em] text-white/80 hover:border-emerald-500/40"
            >
              ← Menu principal
            </button>
            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              className="glass rounded-full border border-white/12 px-[1vw] py-[0.6vh] text-[var(--m1-text-ui)] font-mono text-white/70"
            >
              {darkMode ? "☀ Modo claro" : "☾ Modo escuro"}
            </button>
          </div>

          <header className="mx-auto mb-[1vh] max-w-[min(96%,72rem)] shrink-0 text-center">
            <p className="text-[var(--m1-text-mono-tight)] font-mono tracking-[0.18em] text-white/50">
              {isFuelModuleView
                ? "SIG-FROTA — GESTÃO DE COMBUSTÍVEL"
                : "SIG-PATRIMÔNIO — GESTÃO DE ATIVOS"}
            </p>
            <h1 className="mt-[0.4vh] text-[var(--m1-text-title)] font-bold tracking-wide text-white/95">
              {moduleTitleLine(activeView)}
            </h1>
            <p className="mx-auto mt-[0.5vh] max-w-[min(96%,42rem)] text-[var(--m1-text-body)] leading-snug text-white/60">
              {moduleSubtitle(
                activeView,
                isFuelModuleView,
                isAssetsModuleView
              )}
            </p>
          </header>

          <Operational6040Workspace
            variant={isFuelModuleView ? "frota" : "patrimonio"}
            title={moduleTitleLine(activeView)}
            subtitle={moduleSubtitle(
              activeView,
              isFuelModuleView,
              isAssetsModuleView
            )}
          >
          {activeView === "governance" && (
            <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
              <div className="glass rounded-2xl border border-emerald-500/20 p-6">
                <h4 className="text-[var(--m1-text-caption)] font-mono uppercase tracking-wider text-white/45">
                  Frota total
                </h4>
                <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight text-emerald-300 sm:text-5xl">
                  {displayFleet.toLocaleString("pt-BR")}
                </p>
              </div>
              <div className="glass rounded-2xl border border-cyan-500/20 p-6">
                <h4 className="text-[var(--m1-text-caption)] font-mono uppercase tracking-wider text-white/45">
                  Total de litros auditados
                </h4>
                <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight text-cyan-200 sm:text-5xl">
                  {displayLiters.toLocaleString("pt-BR", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}{" "}
                  <span className="text-xl text-white/50">L</span>
                </p>
              </div>
              <div className="glass rounded-2xl border border-emerald-400/30 p-6 shadow-[0_0_24px_rgba(16,185,129,0.12)]">
                <h4 className="text-[var(--m1-text-caption)] font-mono uppercase tracking-wider text-white/45">
                  Economia total
                </h4>
                <p className="mt-2 text-4xl font-bold tracking-tight text-emerald-300 sm:text-5xl">
                  R${" "}
                  {displaySavings.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="glass md:col-span-2 rounded-2xl border border-white/10 p-7">
                <h4 className="text-[var(--m1-text-ui)] font-mono tracking-wider text-white/50">
                  Gráfico de ROI
                </h4>
                <div className="mt-4 space-y-3 text-[var(--m1-text-ui)]">
                  <div className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-white/55">Gasto bruto</span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-900 via-blue-600 to-cyan-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${dashboardChartsAnimated ? 100 : 0}%` }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <strong className="tabular-nums text-white/85">
                      R${" "}
                      {displayGross.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-white/55">Gasto real</span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-900 via-emerald-500 to-emerald-200"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${dashboardChartsAnimated ? (grossSpending ? (actualSpending / grossSpending) * 100 : 0) : 0}%`,
                        }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <strong className="tabular-nums text-emerald-300/95">
                      R${" "}
                      {displayActual.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                </div>
                <p className="mt-4 text-[var(--m1-text-body)] text-emerald-400/90">
                  Economia: {displaySavingsPct.toFixed(1)}%{" "}
                  <span className="text-white/35">meta 15%–25%</span>
                </p>
              </div>

              <div className="glass rounded-2xl border border-white/10 p-7">
                <h4 className="text-[var(--m1-text-ui)] font-mono text-white/55">
                  Principais irregularidades
                </h4>
                <div className="mt-4 space-y-2">
                  {topIrregularities.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-2 text-[var(--m1-text-ui)]"
                    >
                      <span className="flex-1 truncate text-white/70">
                        {item.name}
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full bg-amber-500/90"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${dashboardChartsAnimated ? (item.value / maxIrreg) * 100 : 0}%`,
                          }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      <strong className="text-white/80">{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(isFuelGeoView || activeView === "assets-map") && (
            <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1fr_min(400px,40vw)]">
              <div className="glass rounded-2xl border border-white/10 p-5">
                <h4 className="text-[var(--m1-text-ui)] font-mono tracking-wider text-white/55">
                  {activeView === "assets-map"
                    ? "Vistoria e Censo (Fé Pública)"
                    : activeView === "fuel-reserve"
                      ? "Abastecimento Reserva"
                      : "Georreferenciamento de Prova"}
                </h4>
                {isFuelGeoView &&
                  selectedMapRecord &&
                  isAutomaticDeduction(selectedMapRecord) && (
                    <div
                      className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[var(--m1-text-ui)] text-red-200"
                      role="alert"
                    >
                      Alerta: transação fora do raio — glosa / dedução automática
                      acionada
                    </div>
                  )}
                <div className="relative mt-3">
                  {activeView === "assets-map" && assetsMapSkeleton && (
                    <div className="absolute inset-0 z-[400] animate-pulse rounded-xl bg-slate-900/60" />
                  )}
                  <Milestone1Map
                    mapKey={`${mapMountKey}-${activeView}`}
                    mode={activeView === "assets-map" ? "assets" : "fuel"}
                    demoData={demoData}
                    selected={selectedMapRecord}
                    onSelect={(r) => setSelectedMapRecord(r)}
                    onMarkerClick={(r) => {
                      setPinDetailRecord(r);
                      const target = 65 + (r.id * 17) % 35;
                      setModalConservation(0);
                      window.requestAnimationFrame(() => {
                        let t0 = performance.now();
                        const dur = 900;
                        const step = (now: number) => {
                          const t = Math.min(1, (now - t0) / dur);
                          const ease = 1 - (1 - t) ** 2;
                          setModalConservation(target * ease);
                          if (t < 1) requestAnimationFrame(step);
                        };
                        requestAnimationFrame(step);
                      });
                    }}
                  />
                </div>
                <p className="mt-2 text-[var(--m1-text-caption)] text-white/35">
                  Área visível: {demoData.resultados_motor_glosa.length} registros
                </p>
              </div>

              <div className="glass flex flex-col gap-4 rounded-2xl border border-white/10 p-5">
                {selectedMapRecord && isFuelGeoView && (
                  <>
                    <h4 className="text-[var(--m1-text-ui)] font-mono text-white/55">
                      Painel lateral de auditoria
                    </h4>
                    <p className="text-[var(--m1-text-body)] text-white/75">
                      <strong>Placa:</strong> {selectedMapRecord.placa}
                    </p>
                    <p className="text-[var(--m1-text-body)] text-white/75">
                      <strong>Motorista:</strong>{" "}
                      {demoData.abastecimentos[0]?.driver_name ?? "—"}
                    </p>
                    <p className="text-[var(--m1-text-body)] text-white/75">
                      <strong>Litros:</strong> {selectedMapRecord.volumeLitros}
                    </p>
                    <p className="text-[var(--m1-text-body)] text-white/75">
                      <strong>Distância:</strong>{" "}
                      {Math.round(
                        getMapDistanceMeters(selectedMapRecord)
                      ).toLocaleString("pt-BR")}{" "}
                      m
                    </p>
                    <button
                      type="button"
                      onClick={triggerFuelCamera}
                      className={`mt-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-3 text-[var(--m1-text-ui)] font-mono text-emerald-200 ${fuelShutterPulse ? "scale-95" : ""}`}
                    >
                      Capturar imagem com marca d&apos;água
                    </button>
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={onFuelCameraChange}
                    />
                    {fuelProofPreviewUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={fuelProofPreviewUrl}
                        alt="Pré-visualização"
                        className="mt-2 rounded-lg border border-white/10"
                      />
                    )}
                  </>
                )}
                {activeView === "assets-map" && selectedMapRecord && (
                  <>
                    <h4 className="text-[var(--m1-text-ui)] font-mono text-white/55">
                      Painel de registro e conservação
                    </h4>
                    <p className="text-[var(--m1-text-body)]">
                      <strong>Nº de registro:</strong> {selectedMapRecord.placa}
                    </p>
                    <button
                      type="button"
                      onClick={() => openAp04Scanner(false)}
                      className="rounded-xl border border-blue-500/40 bg-blue-500/15 px-4 py-2 text-[var(--m1-text-ui)] text-blue-200"
                    >
                      Escanear código de tombamento
                    </button>
                  </>
                )}
                <div className="mt-auto flex max-h-56 flex-col gap-1.5 overflow-y-auto">
                  {demoData.resultados_motor_glosa.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedMapRecord(r)}
                      className={`rounded-lg px-3 py-2 text-left text-[var(--m1-text-ui)] font-mono leading-snug ${selectedMapRecord?.id === r.id ? "bg-white/15 text-white" : "text-white/55 hover:bg-white/5"}`}
                    >
                      {r.transacaoId} — {r.placa}
                    </button>
                  ))}
                </div>
              </div>

              {isFuelGeoView && (
                <button
                  type="button"
                  onClick={triggerFuelCamera}
                  className="fixed bottom-28 right-6 z-[500] flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-500/20 text-xl shadow-[0_0_24px_rgba(16,185,129,0.35)] md:hidden"
                  aria-label="Câmera"
                >
                  📷
                </button>
              )}
            </div>
          )}

          {activeView === "fuel-integrity" && (
            <div className="mx-auto max-w-6xl">
              <div className="glass relative overflow-hidden rounded-2xl border border-white/10 p-6 md:p-7">
                {integrityLaserSweep && (
                  <div className="pointer-events-none absolute inset-0 z-10 animate-pulse bg-gradient-to-b from-cyan-400/10 via-transparent to-transparent" />
                )}
                <h4 className="text-[var(--m1-text-body)] font-mono tracking-wider text-white/60">
                  Relatórios e Trilha de Auditoria
                </h4>
                <div className="mt-4 flex flex-wrap gap-3">
                  <label className="text-[var(--m1-text-ui)] text-white/45">
                    Data
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => {
                        setDateFilter(e.target.value);
                        onIntegrityFilter();
                      }}
                      className="ml-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[var(--m1-text-ui)] text-white"
                    />
                  </label>
                  <label className="text-[var(--m1-text-ui)] text-white/45">
                    Departamento
                    <select
                      value={departmentFilter}
                      onChange={(e) => {
                        setDepartmentFilter(e.target.value);
                        onIntegrityFilter();
                      }}
                      className="ml-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[var(--m1-text-ui)] text-white"
                    >
                      <option value="all">Todos</option>
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      openFuelAuditPdf({
                        filteredRows: filteredIntegrityRows,
                        grossSpending,
                        actualSpending,
                        savingsPercent,
                        origin:
                          typeof window !== "undefined"
                            ? window.location.origin
                            : "",
                      })
                    }
                    className="w-full rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-4 py-2 text-[var(--m1-text-ui)] font-mono text-cyan-200 sm:ml-auto sm:w-auto"
                  >
                    Exportar PDF oficial
                  </button>
                </div>

                {integrityFilterLoading && (
                  <p className="mt-6 text-[var(--m1-text-ui)] text-white/45">Consultando…</p>
                )}

                {!integrityFilterLoading && (
                  <>
                    <div className="mt-4 space-y-4 sm:hidden">
                      {filteredIntegrityRows.slice(0, 8).map((row, ri) => (
                        <div key={row.id} className="relative pl-9">
                          <div className="absolute left-[14px] top-0 h-full w-px bg-cyan-300/55" aria-hidden />
                          <div className="absolute left-0 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/70 bg-cyan-400/20">
                            <span className="absolute inline-flex h-7 w-7 rounded-full bg-cyan-300/30 animate-ping" />
                            <span className="relative h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.7)]" />
                          </div>
                          <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/75 p-4 text-slate-200 shadow-[0_10px_20px_rgba(2,6,23,0.32)] backdrop-blur">
                            <p className="text-[var(--m1-text-body)] font-semibold text-white">{row.department}</p>
                            <p className="mt-1 text-[var(--m1-text-ui)] text-slate-300/75">{row.date}</p>
                            <p className="mt-2 text-[var(--m1-text-body)] text-slate-200/90">
                              Placa {row.plate} — registro na trilha SHA-256 do SIG-FROTA.
                            </p>
                            <p className="mt-2 text-[var(--m1-text-ui)] font-semibold text-cyan-300">SHA-256</p>
                            <code className="mt-1 block break-all rounded-md border border-cyan-400/40 bg-slate-950/70 px-2 py-1 text-[var(--m1-text-caption)] text-cyan-200">
                              {getHashDisplay(row, ri)}
                            </code>
                            <p className="mt-2 text-[var(--m1-text-ui)] text-slate-300/80">
                              {row.verified ? "Verificado / imutável" : "Em revisão"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div
                      key={integrityScanGen}
                      className="mt-4 hidden overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-900/65 p-2 shadow-[0_10px_24px_rgba(2,6,23,0.35)] backdrop-blur sm:block"
                    >
                      <table className="w-full min-w-[720px] border-collapse text-left text-[var(--m1-text-ui)]">
                        <thead>
                          <tr className="border-b border-slate-600/70 bg-slate-950/55 text-slate-300/85">
                            <th className="px-3 py-2.5">Int.</th>
                            <th className="px-3 py-2.5">Data</th>
                            <th className="px-3 py-2.5">Depto</th>
                            <th className="px-3 py-2.5">Placa</th>
                            <th className="px-3 py-2.5">L</th>
                            <th className="px-3 py-2.5">Valor</th>
                            <th className="px-3 py-2.5">SHA-256</th>
                            <th className="px-3 py-2.5">Situação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredIntegrityRows.map((row, ri) => (
                            <tr
                              key={row.id}
                              className="border-b border-slate-700/55 text-slate-200/85 odd:bg-slate-900/35 even:bg-slate-950/25"
                            >
                              <td className="px-3 py-2.5">
                                {integrityShieldOk[row.id] ? "✓" : "…"}
                              </td>
                              <td className="px-3 py-2.5 whitespace-nowrap">{row.date}</td>
                              <td className="px-3 py-2.5">{row.department}</td>
                              <td className="px-3 py-2.5">{row.plate}</td>
                              <td className="px-3 py-2.5">{row.liters}</td>
                              <td className="px-3 py-2.5">
                                R$ {row.amount.toFixed(2)}
                              </td>
                              <td className="max-w-[200px] break-all px-3 py-2.5 font-mono text-[var(--m1-text-micro)] text-cyan-300/90">
                                {getHashDisplay(row, ri)}
                              </td>
                              <td className="px-3 py-2.5">
                                {row.verified
                                  ? "Verificado / imutável"
                                  : "Em revisão"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeView === "assets-report" && (
            <div className="mx-auto max-w-6xl">
              <div className="glass rounded-2xl border border-white/10 p-7">
                <h4 className="text-[var(--m1-text-body)] font-mono text-white/60">
                  Inventário e Tombamento
                </h4>
                {assetsReportLoading ? (
                  <div className="mt-6 h-24 animate-pulse rounded-xl bg-white/5" />
                ) : (
                  <>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-blue-500/20 p-4">
                        <p className="text-[var(--m1-text-caption)] text-white/45">
                          Bens catalogados
                        </p>
                        <p className="text-4xl font-bold tracking-tight text-blue-300 sm:text-5xl">
                          {(demoData.resumo_patrimonio?.total_bens_catalogados ??
                            demoData.resultados_motor_glosa.length
                          ).toString()}
                        </p>
                      </div>
                      <div className="rounded-xl border border-blue-500/20 p-4">
                        <p className="text-[var(--m1-text-caption)] text-white/45">
                          Registros auditados
                        </p>
                        <p className="text-4xl font-bold tracking-tight text-blue-200 sm:text-5xl">
                          {(demoData.resumo_patrimonio
                            ?.total_vistorias_realizadas ??
                            demoData.abastecimentos.length
                          ).toString()}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openPatrimonyPdf(patrimonyChainRows)}
                      className="mt-6 w-full rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-4 py-2 text-[var(--m1-text-ui)] text-cyan-200 sm:w-auto"
                    >
                      Exportar PDF oficial
                    </button>
                    <div className="mt-6 space-y-3 sm:hidden">
                      {patrimonyChainRows.map((row) => (
                        <div
                          key={`m1-assets-mobile-${row.tombo}-${row.integrityHash}`}
                          className="rounded-2xl border border-cyan-500/30 bg-slate-900/75 p-4 text-slate-200 shadow-[0_10px_20px_rgba(2,6,23,0.32)] backdrop-blur"
                        >
                          <p className="text-[var(--m1-text-ui)] text-slate-300/80">Tombamento</p>
                          <p className="text-[var(--m1-text-body)] font-semibold text-white">{row.tombo}</p>
                          <p className="mt-3 text-[var(--m1-text-ui)] text-slate-300/80">Descrição</p>
                          <p className="text-[var(--m1-text-body)] text-slate-200/90">{row.descricao}</p>
                          <p className="mt-3 text-[var(--m1-text-ui)] text-slate-300/80">INPI</p>
                          <code className="block rounded-md border border-cyan-400/35 bg-slate-950/70 px-2 py-1 text-[var(--m1-text-caption)] text-cyan-200">
                            {row.inpiRegistro}
                          </code>
                          <p className="mt-3 text-[var(--m1-text-ui)] text-slate-300/80">SHA-256</p>
                          <code className="block break-all rounded-md border border-cyan-400/35 bg-slate-950/70 px-2 py-1 text-[var(--m1-text-caption)] text-cyan-200">
                            {row.integrityHash}
                          </code>
                          <p className="mt-3 text-[var(--m1-text-ui)] text-slate-300/80">Situação</p>
                          <p className="text-[var(--m1-text-body)] text-slate-100">{row.situacao}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 hidden overflow-x-auto sm:block">
                      <table className="w-full min-w-[640px] text-left text-[var(--m1-text-ui)]">
                        <thead>
                          <tr className="text-white/45">
                            <th className="px-3 py-2.5">Tombamento</th>
                            <th className="px-3 py-2.5">Descrição</th>
                            <th className="px-3 py-2.5">INPI</th>
                            <th className="px-3 py-2.5">SHA-256</th>
                            <th className="px-3 py-2.5">Situação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {patrimonyChainRows.map((row) => (
                            <tr
                              key={row.tombo + row.integrityHash}
                              className="border-t border-white/5 text-white/75"
                            >
                              <td className="px-3 py-2.5">{row.tombo}</td>
                              <td className="px-3 py-2.5">{row.descricao}</td>
                              <td className="px-3 py-2.5 font-mono text-cyan-300">
                                {row.inpiRegistro}
                              </td>
                              <td className="max-w-[180px] break-all px-3 py-2.5 font-mono text-[var(--m1-text-micro)] text-cyan-200/90">
                                {row.integrityHash}
                              </td>
                              <td className="px-3 py-2.5">{row.situacao}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeView === "assets-timeline" && (
            <div className="mx-auto max-w-4xl">
              <div className="glass rounded-2xl border border-white/10 p-7">
                <h4 className="text-[var(--m1-text-body)] font-mono text-white/60">
                  Timeline de auditoria
                </h4>
                <button
                  type="button"
                  disabled={timelineCompare !== "idle"}
                  onClick={compareTimelineHashes}
                  className="mt-4 w-full rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 text-[var(--m1-text-ui)] text-emerald-200 disabled:opacity-40 sm:w-auto"
                >
                  Comparar Hashes
                </button>
                <div className="mt-8 space-y-4 sm:hidden">
                  {timelineEvents.map((ev, i) => {
                    const isLatest = i === timelineEvents.length - 1;
                    const compareClass =
                      timelineCompare !== "idle"
                        ? ev.tampered && timelineCompare === "fail"
                          ? "border-red-500/50 bg-red-500/10"
                          : "border-emerald-500/40 bg-emerald-500/10"
                        : "border-cyan-500/30 bg-slate-900/75";
                    return (
                      <motion.div
                        key={`mobile-${ev.id}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={
                          timelineReveal
                            ? { opacity: 1, x: 0 }
                            : { opacity: 0, x: -8 }
                        }
                        transition={{ delay: i * 0.12 }}
                        className="relative pl-9"
                      >
                        <div className="absolute left-[14px] top-0 h-full w-px bg-cyan-300/55" aria-hidden />
                        <div className="absolute left-0 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/70 bg-cyan-400/20">
                          {isLatest && (
                            <span className="absolute inline-flex h-7 w-7 rounded-full bg-cyan-300/30 animate-ping" />
                          )}
                          <span className="relative h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.7)]" />
                        </div>
                        <div className={`rounded-2xl border p-4 text-slate-200 shadow-[0_10px_20px_rgba(2,6,23,0.32)] backdrop-blur ${compareClass}`}>
                          <p className="text-[var(--m1-text-ui)] font-semibold text-cyan-200/90">{ev.title}</p>
                          <time className="mt-1 block text-[var(--m1-text-caption)] text-slate-300/75">{ev.at}</time>
                          <p className="mt-2 text-[var(--m1-text-body)] text-slate-200/90">{ev.detail}</p>
                          <p className="mt-2 text-[var(--m1-text-ui)] font-semibold text-cyan-300">SHA-256</p>
                          <code className="mt-1 block break-all rounded-md border border-cyan-400/35 bg-slate-950/70 px-2 py-1 text-[var(--m1-text-caption)] text-cyan-200">
                            {ev.integrityHash}
                          </code>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="relative mt-8 hidden space-y-6 border-l border-white/15 pl-6 sm:block">
                  {timelineEvents.map((ev, i) => (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={
                        timelineReveal
                          ? { opacity: 1, x: 0 }
                          : { opacity: 0, x: -8 }
                      }
                      transition={{ delay: i * 0.12 }}
                      className={`relative rounded-xl border p-4 ${
                        timelineCompare !== "idle"
                          ? ev.tampered && timelineCompare === "fail"
                            ? "border-red-500/50 bg-red-500/10"
                            : "border-emerald-500/40 bg-emerald-500/10"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      <span className="absolute -left-[29px] top-4 h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                      <p className="text-[var(--m1-text-ui)] font-semibold text-white/90">
                        {ev.title}
                      </p>
                      <time className="text-[var(--m1-text-caption)] text-white/40">{ev.at}</time>
                      <p className="mt-1 text-[var(--m1-text-body)] text-white/65">{ev.detail}</p>
                      <code className="mt-2 block break-all text-[var(--m1-text-micro)] text-cyan-300/80">
                        {ev.integrityHash}
                      </code>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
          </Operational6040Workspace>
        </div>
      )}

      {!embeddedInAppShell && (
        <footer
          id="m1-sha256-footer-anchor"
          className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[#0a1220]/95 py-2 backdrop-blur-md"
        >
          <div className="overflow-hidden whitespace-nowrap border-b border-white/5 py-1">
            <motion.div
              className="inline-block font-mono text-[var(--m1-text-micro)] text-emerald-500/70"
              animate={{ x: [0, -800] }}
              transition={{
                duration: 40,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              SHA-256 · TRILHA DE AUDITORIA E INTEGRIDADE DOCUMENTAL · FÉ PÚBLICA
              ·{" "}
            </motion.div>
          </div>
          {activeView === "hub" && (
            <div className="mx-auto max-w-6xl px-4 py-2 text-center">
              <span className="text-[var(--m1-text-micro)] text-white/35">Resto (SHA-256) </span>
              <code className="break-all text-[var(--m1-text-micro)] text-cyan-400/80">
                {hubHashLocked ? hubFixedHash : hubLiveHash}
              </code>
            </div>
          )}
          <div className="flex overflow-hidden py-2">
            <motion.div
              className="flex gap-16 whitespace-nowrap font-mono text-[var(--m1-text-micro)] text-white/40"
              animate={{ x: [0, -2400] }}
              transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
            >
              <span>{tickerText}</span>
              <span aria-hidden>{tickerText}</span>
            </motion.div>
          </div>
          <p className="pb-2 text-center text-[var(--m1-text-micro)] font-mono text-white/25">
            Metodologia apresentada ao TCE-AC
          </p>
        </footer>
      )}

      <AnimatePresence>
        {ap04ScannerOpen && (
          <motion.div
            className="fixed inset-0 z-[600] flex items-center justify-center bg-black/70 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="glass max-w-md rounded-2xl border border-white/15 p-6">
              <h3 className="text-[var(--m1-text-body)] font-semibold text-white">
                Leitor AP04 — câmera exclusiva
              </h3>
              <div className="relative mt-4 h-48 overflow-hidden rounded-xl bg-slate-900">
                {ap04Scanning && (
                  <div className="absolute inset-x-0 top-0 h-1 animate-pulse bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                )}
                <p className="absolute inset-0 flex items-center justify-center text-[var(--m1-text-ui)] text-white/45">
                  {ap04Scanning
                    ? "Linha laser em leitura…"
                    : "Fechando…"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (ap04ScanTimerRef.current)
                    clearTimeout(ap04ScanTimerRef.current);
                  setAp04ScannerOpen(false);
                  setAp04Scanning(false);
                }}
                className="mt-4 text-[var(--m1-text-ui)] text-white/50 underline"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {pinDetailRecord && (
        <div
          className="fixed inset-0 z-[550] flex items-center justify-center bg-black/65 p-4"
          role="dialog"
        >
          <div className="glass max-w-lg rounded-2xl border border-white/15 p-6">
            <h3 className="text-[var(--m1-text-body)] font-semibold text-white">
              {activeView === "assets-map"
                ? "Bem patrimonial"
                : "Ativo / equipamento"}
            </h3>
            <div className="mt-4 h-32 rounded-xl bg-white/5" />
            <p className="mt-2 text-[var(--m1-text-ui)] text-white/45">
              Localização validada por GPS — SHA-256
            </p>
            <div className="mt-4">
              <div className="flex justify-between text-[var(--m1-text-caption)] text-white/45">
                <span>Conservação</span>
                <span>{Math.round(modalConservation)}%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                  style={{ width: `${modalConservation}%` }}
                />
              </div>
            </div>
            <code className="mt-4 block break-all text-[var(--m1-text-micro)] text-cyan-300">
              {pinDetailRecord.integrityHash}
            </code>
            <button
              type="button"
              onClick={() => setPinDetailRecord(null)}
              className="mt-6 rounded-xl border border-white/20 px-4 py-2 text-[var(--m1-text-ui)] text-white/80"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {ap04PhotoCaptured && activeView === "assets-map" && (
        <div className="fixed bottom-24 left-4 right-4 z-[560] mx-auto max-w-md rounded-xl border border-blue-500/30 bg-slate-900/95 p-4 shadow-xl md:left-auto md:right-8">
          <p className="text-[var(--m1-text-caption)] text-white/55">Fé pública — metadados</p>
          <p className="text-[var(--m1-text-ui)] text-cyan-200">GPS {ap04LiveGps}</p>
          <p className="text-[var(--m1-text-caption)] text-white/45">{ap04LiveTime}</p>
          <button
            type="button"
            onClick={confirmAp04}
            disabled={ap04Saving}
            className="mt-3 rounded-lg border border-emerald-500/40 px-3 py-1.5 text-[var(--m1-text-ui)] text-emerald-200"
          >
            {ap04Saving ? "Gravando…" : "Confirmar e gravar fé pública"}
          </button>
        </div>
      )}
    </div>
  );
}
