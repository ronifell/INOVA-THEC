"use client";

import { useCallback, useMemo, useRef, useState } from "react";
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
      className={`min-h-[100px] rounded-xl border border-white/10 bg-black/40 px-3 py-3 font-mono text-[11px] leading-relaxed sm:text-xs ${cls}`}
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
  const [pillars4b, setPillars4b] = useState({
    ocr: false,
    recipient: false,
    gps: false,
    volume: false,
  });

  const refBomba = useRef<HTMLInputElement>(null);
  const refRecipient = useRef<HTMLInputElement>(null);
  const [labelBomba, setLabelBomba] = useState<string | null>(null);
  const [labelRecipient, setLabelRecipient] = useState<string | null>(null);

  const scanning = result === "scanning";

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
      "> ERRO: CAPTURA ABAIXO DO PADRÃO PERICIAL. REPETIR FOTO PARA EVITAR NULIDADE JURÍDICA.",
    ],
    []
  );

  const lines4bRed = useMemo(
    () => [
      "> ALERTA: QUEBRA DE CADEIA DE CUSTÓDIA. TRANSAÇÃO BLOQUEADA E REPORTADA AO TCE.",
    ],
    []
  );

  const run4a = useCallback(
    async (outcome: Result) => {
      if (outcome !== "green" && outcome !== "red") return;
      setResult("scanning");
      setGold(false);
      setHash(null);
      playEnergyCharge();
      await new Promise((r) => setTimeout(r, 700));
      playMetallicBeep();
      await new Promise((r) => setTimeout(r, 350));
      setResult(outcome);
      if (outcome === "green") {
        setHash(await generateSHA256("04A-OK"));
        playSuccessChime();
        setGold(true);
      } else {
        setHash("ee1111" + generateMockHash().slice(6));
        playAlertFail();
      }
    },
    []
  );

  const run4b = useCallback(
    async (outcome: Result) => {
      setResult("scanning");
      setGold(false);
      setHash(null);
      setPillars4b({
        ocr: false,
        recipient: false,
        gps: false,
        volume: false,
      });
      playEnergyCharge();
      await new Promise((r) => setTimeout(r, 800));
      playMetallicBeep();
      await new Promise((r) => setTimeout(r, 400));

      if (outcome === "green") {
        setPillars4b({ ocr: true, recipient: true, gps: true, volume: true });
        setHash(await generateSHA256("04B-OK"));
        playSuccessChime();
        setResult("green");
        setGold(true);
      } else if (outcome === "yellow") {
        setResult("yellow");
        setHash(await generateSHA256("04B-WARN"));
      } else {
        setResult("red");
        setHash("bb0000" + generateMockHash().slice(6));
        playAlertFail();
      }
    },
    []
  );

  const blueprint = useMemo(() => {
    if (protocol === "4a") {
      const ok = result === "green";
      return (
        <TruckBlueprintHD
          mode={{
            kind: "geo",
            protocolVariant: "4a",
            nozzleLit: ok,
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
            kind: "geo",
            protocolVariant: "4b",
            nozzleLit: result === "scanning",
            nozzleMuted4b: result === "green",
            gallonLit: result === "scanning" || result === "idle",
            gallonLettuce: result === "green",
            gallonYellowShake: result === "yellow",
            outlineRedPulse: result === "red",
            shortCircuit: result === "red",
            bloodRedPulse: result === "red",
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
  }, [protocol, result]);

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
          <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-mono text-white/80">
            Lastro Botão 01
          </span>
        </div>
      )}
    </div>
  );

  const footerSlot = (
    <div className="space-y-2">
      <p className="text-center text-[9px] font-mono text-white/35">
        Botão 5 (Nota Fiscal) libera apenas com estado verde integral.
      </p>
      <button
        type="button"
        disabled={result !== "green" || !gold}
        className={`w-full rounded-xl border-2 px-4 py-4 text-[11px] font-mono uppercase tracking-[0.14em] sm:py-5 sm:text-xs ${
          result === "green" && gold
            ? "master-faith-metallic border-amber-400/45"
            : "cursor-not-allowed border-white/10 bg-zinc-900 text-zinc-500"
        }`}
      >
        {result === "green" && gold
          ? "Avançar — Botão 5 · Nota Fiscal (liberado)"
          : "Botão 5 · Nota Fiscal (bloqueado)"}
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
        Escolha o protocolo de auditoria física. Cada lastro tem regras distintas de captura e
        validação.
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
          }}
          className="group rounded-2xl border border-emerald-500/35 bg-gradient-to-br from-emerald-950/80 to-slate-950/90 p-5 text-left shadow-[0_0_28px_rgba(16,185,129,0.12)] transition hover:border-emerald-400/55"
        >
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-emerald-300/90">
            Botão 4-A
          </p>
          <p className="mt-2 text-sm font-semibold text-white">
            Protocolo de abastecimento direto (tanque)
          </p>
          <p className="mt-2 text-[11px] leading-snug text-white/45">
            Ênfase no bocal do veículo e vínculo com posto conveniado (500m).
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
            setLabelRecipient(null);
          }}
          className="group rounded-2xl border border-teal-500/40 bg-gradient-to-br from-teal-950/80 to-slate-950/90 p-5 text-left shadow-[0_0_28px_rgba(45,212,191,0.14)] transition hover:border-teal-400/55"
        >
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-teal-300/90">
            Botão 4-B
          </p>
          <p className="mt-2 text-sm font-semibold text-white">
            Protocolo de abastecimento em contingência (galão)
          </p>
          <p className="mt-2 text-[11px] leading-snug text-white/45">
            Captura em tempo real, sem galeria — triangulação pericial obrigatória.
          </p>
        </button>
      </div>
    </div>
  );

  const workspaceBody =
    step === "pick" ? (
      pickScreen
    ) : protocol === "4a" ? (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300/80">
            4-A · Abastecimento direto (tanque)
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

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <div
              className={`relative overflow-hidden rounded-xl border border-white/12 bg-gradient-to-br from-slate-950 to-slate-900 ${
                scanning ? "ring-2 ring-cyan-400/50" : ""
              }`}
            >
              <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2">
                <span className="text-4xl">⛽</span>
                <p className="px-4 text-center text-[11px] text-white/55">
                  Visor da bomba · litragem e valor (captura ao vivo)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => run4a("green")}
              disabled={scanning}
              className="fuel-neon-action-btn w-full rounded-xl border border-emerald-500/40 px-4 py-3 text-xs font-bold uppercase tracking-wide text-white"
              style={{ background: "#059669" }}
            >
              Validar protocolo 4-A (demonstração verde)
            </button>
            <button
              type="button"
              onClick={() => run4a("red")}
              disabled={scanning}
              className="w-full rounded-xl border border-red-500/40 bg-red-950/30 py-2.5 text-[11px] font-mono uppercase text-red-200"
            >
              Simular glosa (GPS / cadeia)
            </button>
          </div>
          <div>
            {result === "idle" && (
              <p className="text-xs text-white/45">
                Painel aguardando validação do perímetro e do bocal.
              </p>
            )}
            {result === "green" && (
              <AuditLines lines={lines4aOk} active tone="ok" />
            )}
            {result === "red" && (
              <AuditLines lines={lines4aRed} active tone="bad" />
            )}
          </div>
        </div>
      </div>
    ) : (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-teal-300/85">
            4-B · Contingência (galão) · triangulação pericial
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

        <div className="rounded-xl border border-amber-500/25 bg-amber-950/20 px-3 py-2 text-[10px] leading-snug text-amber-100/90">
          Sem acesso à galeria: use apenas captura em tempo real (câmera). Os pilares OCR, IA, GPS
          e volumetria são conferidos na validação.
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400/90">
                FOTO_BOMBA_VALOR
              </p>
              <p className="mt-1 text-[11px] text-white/55">
                Visor da bomba — litragem e preço unitário.
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
              <button
                type="button"
                onClick={() => refBomba.current?.click()}
                className="mt-3 w-full rounded-lg border border-emerald-500/40 bg-emerald-500/10 py-2 text-xs font-mono text-emerald-100"
              >
                {labelBomba ? `Capturado: ${labelBomba.slice(0, 28)}` : "Abrir câmera — captura ao vivo"}
              </button>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-400/90">
                FOTO_RECIPIENTE_CARGA
              </p>
              <p className="mt-1 text-[11px] text-white/55">
                Bico da bomba inserido no galão / reservatório portátil.
              </p>
              <input
                ref={refRecipient}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setLabelRecipient(f ? f.name : null);
                }}
              />
              <button
                type="button"
                onClick={() => refRecipient.current?.click()}
                className="mt-3 w-full rounded-lg border border-cyan-500/40 bg-cyan-500/10 py-2 text-xs font-mono text-cyan-100"
              >
                {labelRecipient
                  ? `Capturado: ${labelRecipient.slice(0, 28)}`
                  : "Abrir câmera — captura ao vivo"}
              </button>
            </div>

            <motion.button
              type="button"
              onClick={() => run4b("green")}
              disabled={scanning}
              animate={{ opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              className="w-full rounded-xl border-2 border-lime-400/45 bg-gradient-to-r from-lime-900/40 to-emerald-900/50 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-[0_0_22px_rgba(163,230,53,0.25)]"
            >
              Validar triangulação pericial (demonstração verde)
            </motion.button>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => run4b("yellow")}
                disabled={scanning}
                className="rounded-lg border border-amber-500/45 bg-amber-950/40 px-3 py-2 text-[10px] font-mono uppercase text-amber-100"
              >
                Simular amarelo (ilegível)
              </button>
              <button
                type="button"
                onClick={() => run4b("red")}
                disabled={scanning}
                className="rounded-lg border border-red-500/45 bg-red-950/40 px-3 py-2 text-[10px] font-mono uppercase text-red-200"
              >
                Simular vermelho (fraude / GPS)
              </button>
            </div>

            {protocol === "4b" && (result === "green" || scanning) && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 font-mono text-[10px] text-white/70">
                <p className="mb-2 text-[9px] uppercase tracking-wider text-white/40">
                  Os 4 pilares de conferência
                </p>
                <ul className="space-y-1">
                  <li>
                    PILAR 1 · OCR bomba:{" "}
                    {scanning ? "…" : pillars4b.ocr ? "OK" : "—"}
                  </li>
                  <li>
                    PILAR 2 · Recipiente (IA):{" "}
                    {scanning ? "…" : pillars4b.recipient ? "OK" : "—"}
                  </li>
                  <li>
                    PILAR 3 · GPS lock 500m:{" "}
                    {scanning ? "…" : pillars4b.gps ? "OK" : "—"}
                  </li>
                  <li>
                    PILAR 4 · Volumetria:{" "}
                    {scanning ? "…" : pillars4b.volume ? "OK" : "—"}
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {result === "idle" && (
              <p className="text-xs text-white/45">
                Painel de semântica V-A-V: aguardando triangulação.
              </p>
            )}
            {result === "green" && (
              <AuditLines lines={lines4bOk} active tone="ok" />
            )}
            {result === "yellow" && (
              <AuditLines lines={lines4bYellow} active tone="warn" />
            )}
            {result === "red" && (
              <AuditLines lines={lines4bRed} active tone="bad" />
            )}
          </div>
        </div>
      </div>
    );

  return (
    <Operational6040Workspace
      variant="frota"
      title="COMPROVAÇÃO DE MATERIALIDADE E LASTRO DE INSUMO"
      subtitle="Protocolos 4-A (tanque direto) e 4-B (galão contingência)"
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
            INSUMO RASTREADO
          </motion.div>
        )}
        {protocol === "4a" && result === "green" && gold && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mt-4 rounded-full border-2 border-emerald-400/70 bg-emerald-950/40 px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wide text-emerald-100 shadow-[0_0_32px_rgba(16,185,129,0.35)]"
          >
            Materialidade confirmada — 4-A
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result === "red" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center bg-black/45"
          >
            <div className="max-w-lg -rotate-6 rounded border-2 border-red-600 bg-black px-6 py-3 text-center font-mono text-sm font-bold uppercase tracking-[0.2em] text-red-400 shadow-[0_0_40px_rgba(239,68,68,0.5)]">
              TRANSAÇÃO BLOQUEADA
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Operational6040Workspace>
  );
}
