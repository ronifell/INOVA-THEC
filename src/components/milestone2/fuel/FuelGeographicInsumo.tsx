"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateSHA256, generateMockHash } from "@/lib/crypto";
import Operational6040Workspace from "@/components/audit/Operational6040Workspace";
import AuditPresentationHeader from "./AuditPresentationHeader";
import TruckBlueprintHD from "./TruckBlueprintHD";
import GeoprocessingRadarMap from "./GeoprocessingRadarMap";
import { useMilestone2FuelOptional } from "./Milestone2FuelContext";
import {
  playAlertFail,
  playEnergyCharge,
  playMetallicBeep,
  playSuccessChime,
} from "@/lib/sfx";

type Protocol = "4a" | "4b";
type Step = "pick" | "run";
type Result = "idle" | "scanning" | "green" | "yellow" | "red";
type MaterialKey = "seal" | "plate" | "odometer" | "pump";

type Tone = "ok" | "bad" | "warn";

function AuditLines({
  lines,
  active,
  tone,
}: {
  lines: string[];
  active: boolean;
  tone: Tone;
}) {
  const cls =
    tone === "ok"
      ? "text-emerald-200"
      : tone === "warn"
        ? "text-amber-200"
        : "text-red-300";

  if (!active || lines.length === 0) return null;

  return (
    <div
      className={`min-h-[100px] rounded-xl border border-white/15 bg-slate-700/45 px-3 py-3 font-mono text-[11px] leading-relaxed sm:text-xs ${cls}`}
    >
      {lines.map((line, i) => (
        <p
          key={i}
          className={`${i > 0 ? "mt-2" : ""} ${tone === "warn" ? "animate-pulse" : ""}`}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

/**
 * Módulo 04 — Comprovação de materialidade e lastro de insumo (4-A tanque / 4-B galão).
 */
export default function FuelGeographicInsumo() {
  const fuel = useMilestone2FuelOptional();
  const thumb =
    fuel?.previews.bomba ??
    fuel?.previews.vedacao ??
    fuel?.previews.placa ??
    null;

  const [step, setStep] = useState<Step>("pick");
  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [result, setResult] = useState<Result>("idle");
  const [hash, setHash] = useState<string | null>(null);
  const [gold, setGold] = useState(false);
  const [materialEvidence, setMaterialEvidence] = useState<Record<MaterialKey, boolean>>({
    seal: false,
    plate: false,
    odometer: false,
    pump: false,
  });
  const [materialLabels, setMaterialLabels] = useState<Record<MaterialKey, string | null>>({
    seal: null,
    plate: null,
    odometer: null,
    pump: null,
  });
  const [materialAlert, setMaterialAlert] = useState<string | null>(null);

  const refBomba = useRef<HTMLInputElement>(null);
  const [labelBomba, setLabelBomba] = useState<string | null>(null);
  const [assetValidated, setAssetValidated] = useState(false);
  const [assetDenied, setAssetDenied] = useState(false);

  const scanning = result === "scanning";
  const allMaterialValidated = Object.values(materialEvidence).every(Boolean);

  const assessImageQuality = useCallback(async (file: File) => {
    const src = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = () => reject(new Error("Falha ao abrir imagem"));
        i.src = src;
      });
      const canvas = document.createElement("canvas");
      const width = 140;
      const height = Math.max(80, Math.round((img.height / img.width) * width));
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return false;
      ctx.drawImage(img, 0, 0, width, height);
      const pixels = ctx.getImageData(0, 0, width, height).data;
      const gray: number[] = [];
      let sum = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const g = 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
        gray.push(g);
        sum += g;
      }
      const mean = sum / gray.length;
      let edgeEnergy = 0;
      let edgeCount = 0;
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;
          const lap =
            4 * gray[idx] - gray[idx - 1] - gray[idx + 1] - gray[idx - width] - gray[idx + width];
          edgeEnergy += lap * lap;
          edgeCount += 1;
        }
      }
      const sharpness = edgeEnergy / Math.max(1, edgeCount);
      return mean > 45 && sharpness > 120;
    } catch {
      return false;
    } finally {
      URL.revokeObjectURL(src);
    }
  }, []);

  const captureMaterialEvidence = useCallback(
    async (key: MaterialKey, file: File | null | undefined) => {
      if (!file) return;
      const approved = await assessImageQuality(file);
      if (!approved) {
        setMaterialAlert("Imagem sem nitidez. Repita a captura para validar a Materialidade.");
        playAlertFail();
        return;
      }
      setMaterialAlert(null);
      setMaterialEvidence((prev) => ({ ...prev, [key]: true }));
      setMaterialLabels((prev) => ({ ...prev, [key]: file.name }));
      playMetallicBeep();
    },
    [assessImageQuality]
  );

  const lines4aOk = useMemo(
    () => [
      "> LOCALIZAÇÃO: DENTRO DO RAIO (500M) — POSTO CONVENIADO",
      "> BOCAL TANQUE: MATERIALIDADE FOTOGRÁFICA CONFIRMADA",
      "> PROTOCOLO 4-A: ABASTECIMENTO DIRETO",
      "> STATUS: INTEGRIDADE DE INSUMO ESTABELECIDA.",
    ],
    []
  );

  const lines4aRed = useMemo(
    () => [
      "> ALERTA: VIOLAÇÃO DE PERÍMETRO OU CADEIA",
      "> GPS: FORA DOS 500M DO POSTO CREDENCIADO",
      "> AÇÃO: TRANSAÇÃO BLOQUEADA.",
    ],
    []
  );

  const lines4bOk = useMemo(
    () => [
      "> PILAR 1 (OCR): VALORES NUMÉRICOS LIDOS — OK",
      "> PILAR 2 (IA): RECIPIENTE (GALÃO) IDENTIFICADO — OK",
      "> PILAR 3 (GPS): COORDENADA DENTRO DE 500M — OK",
      "> PILAR 4 (VOLUMETRIA): LITRAGEM ≤ CAPACIDADE DO GALÃO — OK",
      "> INSUMO RASTREADO — CADEIA PRESERVADA.",
    ],
    []
  );

  const lines4bYellow = useMemo(
    () => [
      "> REPETIR CAPTURA: PADRÃO PERICIAL INSUFICIENTE.",
    ],
    []
  );

  const lines4bRed = useMemo(
    () => [
      "> ALERTA: QUEBRA DE CADEIA DE CUSTÓDIA. TRANSAÇÃO BLOQUEADA E REPORTADA AO TCE.",
    ],
    []
  );

  const run4a = useCallback(async () => {
    if (!allMaterialValidated) return;
    setResult("scanning");
    setGold(false);
    setHash(null);
    playEnergyCharge();
    await new Promise((r) => setTimeout(r, 700));
    playMetallicBeep();
    await new Promise((r) => setTimeout(r, 350));
    setResult("green");
    setHash(await generateSHA256("04A-MATERIALIDADE-OK"));
    playSuccessChime();
    setGold(true);
  }, [allMaterialValidated]);

  const run4aScenario = useCallback(async (outcome: "green" | "red") => {
    setResult("scanning");
    setGold(false);
    setHash(null);
    playEnergyCharge();
    await new Promise((r) => setTimeout(r, 520));
    if (outcome === "green") {
      setMaterialEvidence({ seal: true, plate: true, odometer: true, pump: true });
      setResult("green");
      setHash(await generateSHA256("04A-TERRITORIAL-OK"));
      setGold(true);
      playSuccessChime();
      return;
    }
    setResult("red");
    setHash("aa0000" + generateMockHash().slice(6));
    playAlertFail();
  }, []);

  const run4b = useCallback(
    async (outcome: Result) => {
      setResult("scanning");
      setGold(false);
      setHash(null);
      setAssetValidated(false);
      setAssetDenied(false);
      playEnergyCharge();
      await new Promise((r) => setTimeout(r, 800));
      playMetallicBeep();
      await new Promise((r) => setTimeout(r, 400));

      if (outcome === "green") {
        setHash(await generateSHA256("04B-IDENTIDADE-OK"));
        setAssetValidated(true);
        playSuccessChime();
        setResult("green");
        setGold(true);
      } else if (outcome === "yellow") {
        setResult("yellow");
        setHash(await generateSHA256("04B-SCANNING-WARN"));
      } else {
        setResult("red");
        setAssetDenied(true);
        setHash("bb0000" + generateMockHash().slice(6));
        playAlertFail();
      }
    },
    []
  );

  useEffect(() => {
    if (step !== "run" || !protocol) return;
    const onKey = (e: KeyboardEvent) => {
      if (protocol === "4a") {
        if (e.key.toLowerCase() === "g") void run4aScenario("green");
        if (e.key.toLowerCase() === "r") void run4aScenario("red");
      }
      if (protocol === "4b") {
        if (e.key.toLowerCase() === "g") void run4b("green");
        if (e.key.toLowerCase() === "y") void run4b("yellow");
        if (e.key.toLowerCase() === "r") void run4b("red");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [protocol, run4aScenario, run4b, step]);

  const blueprint = useMemo(() => {
    if (protocol === "4a") {
      return (
        <TruckBlueprintHD
          mode={{
            kind: "geo",
            protocolVariant: "4a",
            nozzleLit: result === "green" || result === "scanning",
            outlineRedPulse: result === "red",
            bloodRedPulse: result === "red",
          }}
        />
      );
    }
    if (protocol === "4b") {
      return (
        <TruckBlueprintHD
          mode={{
            kind: "asset",
            positive: assetValidated,
            plateErrorPulse: assetDenied || result === "red",
          }}
        />
      );
    }
    return (
      <TruckBlueprintHD
        mode={{
          kind: "geo",
          nozzleLit: false,
        }}
      />
    );
  }, [assetDenied, assetValidated, protocol, result]);

  const mapVariant =
    result === "green" ? "success" : result === "red" ? "error" : "idle";

  const belowMap = (
    <div className="grid gap-2">
      <GeoprocessingRadarMap variant={mapVariant} errorDistanceM={800} />
      {thumb && (
        <div className="relative overflow-hidden rounded-lg border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb}
            alt="Referência protocolo inicial"
            className="h-24 w-full object-cover opacity-90"
          />
          <span className="absolute bottom-1 left-1 rounded bg-slate-700/85 px-1.5 py-0.5 text-[9px] font-mono text-white/85">
            Lastro Botão 01
          </span>
        </div>
      )}
    </div>
  );

  const footerSlot = (
    <div className="space-y-2">
      <p className="text-center text-[9px] font-mono text-white/35">
        Botão de Fé Pública libera apenas com vetor 100% validado.
      </p>
      <button
        type="button"
        disabled={result !== "green" || !gold || (protocol === "4a" ? false : !allMaterialValidated)}
        className={`w-full rounded-xl border-2 px-4 py-4 text-[11px] font-mono uppercase tracking-[0.14em] sm:py-5 sm:text-xs ${
          result === "green" && gold && (protocol === "4a" ? true : allMaterialValidated)
            ? "master-faith-metallic border-amber-400/45"
            : "cursor-not-allowed border-slate-500/35 bg-slate-600/45 text-slate-200/75"
        }`}
      >
        {result === "green" && gold && (protocol === "4a" ? true : allMaterialValidated)
          ? "Fé Pública Pericial (liberado)"
          : "Fé Pública Pericial (bloqueado)"}
      </button>
    </div>
  );

  const hashState: "spinning" | "locked" | "error" =
    result === "red" || result === "yellow"
      ? result === "red"
        ? "error"
        : "spinning"
      : result === "green" && gold
        ? "locked"
        : "spinning";

  const pickScreen = (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-1">
      <p className="text-center text-xs leading-relaxed text-white/55">
        Escolha o protocolo técnico. Cada botão aplica travas de materialidade auditável.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            setProtocol("4a");
            setStep("run");
            setResult("idle");
            setGold(false);
            setHash(null);
            setMaterialAlert(null);
            setMaterialEvidence({ seal: false, plate: false, odometer: false, pump: false });
            setMaterialLabels({ seal: null, plate: null, odometer: null, pump: null });
          }}
          className="group rounded-2xl border border-emerald-500/35 bg-gradient-to-br from-emerald-950/80 to-slate-950/90 p-5 text-left shadow-[0_0_28px_rgba(16,185,129,0.12)] transition hover:border-emerald-400/55"
        >
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-emerald-300/90">
            Botão 4-A
          </p>
          <p className="mt-2 text-sm font-semibold text-white">
            Tanque do Veículo
          </p>
          <p className="mt-2 text-[11px] leading-snug text-white/45">
            MÓDULO 04-A: PROTOCOLO DE MATERIALIDADE TERRITORIAL
          </p>
        </button>
        <button
          type="button"
          onClick={() => {
            setProtocol("4b");
            setStep("run");
            setResult("idle");
            setGold(false);
            setHash(null);
            setLabelBomba(null);
            setAssetDenied(false);
            setAssetValidated(false);
          }}
          className="group rounded-2xl border border-teal-500/40 bg-gradient-to-br from-teal-950/80 to-slate-950/90 p-5 text-left shadow-[0_0_28px_rgba(45,212,191,0.14)] transition hover:border-teal-400/55"
        >
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-teal-300/90">
            Botão 4-B
          </p>
          <p className="mt-2 text-sm font-semibold text-white">
            Protocolo do Galão
          </p>
          <p className="mt-2 text-[11px] leading-snug text-white/45">
            PROTOCOLO DE ABASTECIMENTO EM CONTINGÊNCIA (GALÃO)
          </p>
        </button>
      </div>
    </div>
  );

  const workspaceBody =
    step === "pick" ? (
      pickScreen
    ) : protocol === "4a" ? (
      <div className="flex min-h-0 flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300/80">
            MÓDULO 04-A: PROTOCOLO DE MATERIALIDADE TERRITORIAL
          </span>
          <button
            type="button"
            onClick={() => {
              setStep("pick");
              setProtocol(null);
              setResult("idle");
              setGold(false);
              setHash(null);
            }}
            className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-mono text-white/60"
          >
            ← Trocar protocolo
          </button>
        </div>

        <div className="rounded-lg border border-emerald-400/35 bg-emerald-800/25 px-2.5 py-1.5 text-[9px] font-mono text-emerald-100/90 sm:text-[10px]">
          Atalhos de apresentação: <span className="text-lime-300">G = Cenário Verde</span> ·{" "}
          <span className="text-red-300">R = Cenário Vermelho</span>
        </div>
        <div className="grid min-h-0 gap-2 lg:grid-cols-[1.5fr_1fr] lg:items-stretch lg:gap-3">
          <div className="flex min-h-0 min-w-0 flex-col gap-2">
            <input
              ref={refBomba}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => captureMaterialEvidence("pump", e.target.files?.[0])}
            />
            <div className={`relative flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/15 bg-gradient-to-br from-slate-700/95 to-slate-600/90 ${result === "red" ? "fuel-glitch-img" : ""}`}>
              <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-1.5 p-2 sm:gap-2 sm:p-3">
                <span className="text-3xl sm:text-4xl">⛽</span>
                <p className="px-2 text-center text-[10px] text-white/65 sm:text-[11px]">
                  Câmera ativa no bocal do tanque (área de materialidade)
                </p>
                <button
                  type="button"
                  onClick={() => refBomba.current?.click()}
                  className="rounded-lg border border-emerald-500/45 bg-emerald-600/20 px-3 py-1.5 text-[10px] font-mono text-emerald-100"
                >
                  Capturar bocal do tanque
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => void run4aScenario("green")}
                disabled={scanning}
                className="rounded-lg border border-lime-400/55 bg-lime-800/40 py-1.5 text-[9px] font-mono uppercase text-lime-100 sm:py-2 sm:text-[10px]"
              >
                Cenário A · Verde
              </button>
              <button
                type="button"
                onClick={() => void run4aScenario("red")}
                disabled={scanning}
                className="rounded-lg border border-red-500/55 bg-red-900/40 py-1.5 text-[9px] font-mono uppercase text-red-100 sm:py-2 sm:text-[10px]"
              >
                Cenário B · Vermelho
              </button>
            </div>
            <button
              type="button"
              onClick={run4a}
              disabled={!allMaterialValidated || scanning}
              className="w-full rounded-lg border border-cyan-500/45 bg-cyan-800/35 py-2 text-[10px] font-mono uppercase tracking-wider text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40 sm:py-2.5 sm:text-[11px]"
            >
              Consolidar validação pericial
            </button>
          </div>
          <div className="flex min-h-0 min-w-0 flex-col gap-2">
            <div className="relative min-h-0 overflow-hidden rounded-xl border border-emerald-400/30 bg-emerald-950/35 p-1.5 sm:p-2">
              <GeoprocessingRadarMap variant="idle" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-emerald-400/55 bg-slate-700/75 p-1 shadow-[0_0_22px_rgba(16,185,129,0.35)] sm:h-28 sm:w-28">
                  <GeoprocessingRadarMap variant={mapVariant} errorDistanceM={2000} />
                </div>
              </div>
            </div>
            {result === "idle" && (
              <p className="text-xs text-white/45">
                Mapa ilustrativo + radar GPS em tempo real com vetor blueprint.
              </p>
            )}
            {materialAlert && (
              <AuditLines lines={[`> ${materialAlert}`]} active tone="warn" />
            )}
            {result === "green" && (
              <AuditLines lines={lines4aOk} active tone="ok" />
            )}
            {result === "red" && (
              <AuditLines
                lines={["> ALERTA: VIOLAÇÃO DE PERÍMETRO GEOGRÁFICO.", ...lines4aRed]}
                active
                tone="bad"
              />
            )}
            {!materialAlert && !allMaterialValidated && (
              <div className="mt-1 rounded-lg border border-white/15 bg-slate-700/40 p-2 font-mono text-[9px] text-white/75 sm:p-2.5 sm:text-[10px]">
                <p>BOMBA: {materialLabels.pump ?? "pendente"}</p>
                <p className="mt-1 text-emerald-300/80">CADEIA DE CUSTÓDIA: STREAM ATIVO</p>
              </div>
            )}
          </div>
        </div>
      </div>
    ) : (
      <div className="flex min-h-0 flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-teal-300/85">
            PROTOCOLO DE ABASTECIMENTO EM CONTINGÊNCIA (GALÃO)
          </span>
          <button
            type="button"
            onClick={() => {
              setStep("pick");
              setProtocol(null);
              setResult("idle");
              setGold(false);
              setHash(null);
            }}
            className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-mono text-white/60"
          >
            ← Trocar protocolo
          </button>
        </div>

        <div className="rounded-lg border border-emerald-400/35 bg-emerald-800/25 px-2.5 py-1.5 text-[9px] leading-snug text-emerald-100/90 sm:text-[10px]">
          Atalhos de apresentação: G = Verde · Y = Amarelo · R = Vermelho.
        </div>

        <div className="grid gap-2 lg:grid-cols-[1.1fr_0.9fr] lg:gap-3">
          <div className="flex flex-col gap-2">
            <div className="rounded-lg border border-white/15 bg-slate-700/40 p-2 sm:p-2.5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400/90">
                CÂMERA DE IDENTIFICAÇÃO · PLACA
              </p>
              <p className="mt-1 text-[11px] text-white/55">
                Captura em tempo real da placa para OCR e vínculo contratual.
              </p>
              <input
                ref={refBomba}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setLabelBomba(f ? f.name : null);
                }}
              />
              <div className="relative mt-2 overflow-hidden rounded-lg border border-emerald-400/40 bg-emerald-950/35 p-2 sm:p-2.5">
                <motion.div
                  className={`pointer-events-none absolute left-2 right-2 h-[2px] ${
                    assetDenied ? "bg-red-500" : "bg-[#00FF41]"
                  }`}
                  style={{
                    boxShadow: assetDenied
                      ? "0 0 10px rgba(239,68,68,0.85)"
                      : "0 0 12px rgba(0,255,65,0.9)",
                  }}
                  animate={{ y: assetValidated ? 26 : [0, 52, 0], opacity: [0.9, 1, 0.9] }}
                  transition={{
                    duration: assetValidated ? 0.5 : 2.2,
                    repeat: assetValidated ? 0 : Infinity,
                    ease: "easeInOut",
                  }}
                />
                <p className="text-[10px] font-mono text-emerald-100/80">
                  {labelBomba ? `ARQUIVO: ${labelBomba}` : "[SCANNING...]"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => refBomba.current?.click()}
                className="mt-2 w-full rounded-lg border border-emerald-500/40 bg-emerald-600/20 py-1.5 text-[11px] font-mono text-emerald-100 sm:py-2 sm:text-xs"
              >
                {labelBomba ? "Recapturar placa" : "Abrir câmera — captura ao vivo"}
              </button>
            </div>

            <motion.button
              type="button"
              onClick={() => run4b("green")}
              disabled={scanning}
              animate={{ opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              className="w-full rounded-lg border-2 border-lime-400/45 bg-gradient-to-r from-lime-800/45 to-emerald-800/45 py-2 text-[10px] font-bold uppercase tracking-wide text-white shadow-[0_0_22px_rgba(163,230,53,0.25)] sm:py-2.5 sm:text-xs"
            >
              Validar identidade cadastrada
            </motion.button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => run4b("yellow")}
                disabled={scanning}
                className="rounded-lg border border-amber-500/45 bg-amber-900/35 px-2 py-1.5 text-[9px] font-mono uppercase text-amber-100 sm:py-2 sm:text-[10px]"
              >
                Simular lock parcial
              </button>
              <button
                type="button"
                onClick={() => run4b("red")}
                disabled={scanning}
                className="rounded-lg border border-red-500/45 bg-red-900/40 px-2 py-1.5 text-[9px] font-mono uppercase text-red-200 sm:py-2 sm:text-[10px]"
              >
                Simular placa não cadastrada
              </button>
            </div>
            <div className="rounded-lg border border-white/15 bg-slate-700/40 p-2 font-mono text-[9px] text-white/80 sm:p-2.5 sm:text-[10px]">
              <p>PILAR 1 OCR: {labelBomba ? "MATCH" : "PENDENTE"}</p>
              <p>PILAR 2 GALÃO (IA): {result === "green" ? "MATCH" : "PENDENTE"}</p>
              <p>PILAR 3 GPS LOCK: {result === "red" ? "FALHA" : result === "green" ? "MATCH" : "PENDENTE"}</p>
              <p>PILAR 4 CADEIA SHA-256: {result === "green" ? "VINCULADA" : "NÃO VINCULADA"}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {result === "idle" && (
              <p className="text-[10px] text-white/50 sm:text-xs">
                Painel de inteligência aguardando leitura de placa.
              </p>
            )}
            {(result === "scanning" || result === "green" || result === "yellow" || result === "red") && (
              <div className="rounded-lg border border-white/15 bg-slate-700/45 px-2.5 py-2 font-mono text-[10px] leading-relaxed text-emerald-200 sm:px-3 sm:py-2.5 sm:text-[11px]">
                <p>[SCANNING...]</p>
                <p>PLACA DETECTADA: {labelBomba ? "ABC-1234" : "---"}</p>
                <p>VÍNCULO: SECRETARIA DE SAÚDE - LOTE 01</p>
                <p>STATUS: {result === "green" ? "ATIVO EM CONFORMIDADE" : result === "red" ? "BLOQUEIO CRÍTICO" : "EM PROCESSAMENTO"}</p>
              </div>
            )}
            {result === "green" && (
              <AuditLines lines={lines4bOk} active tone="ok" />
            )}
            {result === "yellow" && (
              <AuditLines lines={lines4bYellow} active tone="warn" />
            )}
            {result === "red" && (
              <AuditLines
                lines={[
                  ...lines4bRed,
                  "> BLOQUEIO: VEÍCULO NÃO CADASTRADO / TENTATIVA DE DANO AO ERÁRIO",
                ]}
                active
                tone="bad"
              />
            )}
          </div>
        </div>
      </div>
    );

  return (
    <Operational6040Workspace
      variant="frota"
      title="MÓDULOS 04-A / 04-B · MATERIALIDADE TERRITORIAL E CONTINGÊNCIA"
      subtitle="Unidade visual pericial com gatilhos Verde/Vermelho para apresentação TCE"
      blueprintCustom={blueprint}
      blueprintBelow={step === "run" ? belowMap : undefined}
      footerSlot={footerSlot}
      goldSealActive={result === "green" && gold}
    >
      <AuditPresentationHeader
        hashState={hashState}
        lockedHash={hash ?? undefined}
        custodyFirstCheck={result === "green"}
        accentRgb="16, 185, 129"
      />

      {workspaceBody}

      <AnimatePresence>
        {protocol === "4b" && result === "green" && gold && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mt-4 flex min-h-[5rem] min-w-[5rem] items-center justify-center rounded-full border-2 border-amber-400/85 bg-amber-950/55 px-4 text-center text-[10px] font-bold uppercase leading-tight text-amber-100 shadow-[0_0_40px_rgba(251,191,36,0.45)]"
          >
            IDENTIDADE VALIDADA
          </motion.div>
        )}
        {protocol === "4a" && result === "green" && gold && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mt-4 rounded-full border-2 border-emerald-400/70 bg-emerald-950/40 px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wide text-emerald-100 shadow-[0_0_32px_rgba(16,185,129,0.35)]"
          >
            Materialidade confirmada
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result === "red" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/55"
          >
            <div className="max-w-lg -rotate-6 rounded border-2 border-red-600 bg-red-950/85 px-6 py-3 text-center font-mono text-sm font-bold uppercase tracking-[0.2em] text-red-200 shadow-[0_0_40px_rgba(239,68,68,0.5)]">
              BLOQUEIO: VEÍCULO NÃO CADASTRADO / TENTATIVA DE DANO AO ERÁRIO
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Operational6040Workspace>
  );
}
