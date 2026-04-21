"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

type Flow = "geo" | "misto";
type Result = "idle" | "scanning" | "green" | "red";

function TypewriterGeo({
  lines,
  active,
  ok,
}: {
  lines: string[];
  active: boolean;
  ok: boolean;
}) {
  const [idx, setIdx] = useState(0);
  const [char, setChar] = useState(0);

  useEffect(() => {
    if (!active) {
      setIdx(0);
      setChar(0);
      return;
    }
    const full = lines[idx] ?? "";
    if (char < full.length) {
      const t = window.setTimeout(() => setChar((c) => c + 1), 18);
      return () => window.clearTimeout(t);
    }
    if (idx < lines.length - 1) {
      const t = window.setTimeout(() => {
        setIdx((i) => i + 1);
        setChar(0);
      }, 240);
      return () => window.clearTimeout(t);
    }
  }, [active, char, idx, lines]);

  const shown = lines.slice(0, idx + 1).map((line, i) =>
    i < idx ? line : line.slice(0, char)
  );

  return (
    <div
      className={`min-h-[130px] rounded-xl border border-white/10 bg-black/35 px-3 py-3 font-mono text-[11px] leading-relaxed sm:text-xs ${
        ok ? "text-emerald-200" : "text-red-300"
      }`}
    >
      {shown.map((line, i) => (
        <p key={i} className={i > 0 ? "mt-2" : ""}>
          {line}
        </p>
      ))}
    </div>
  );
}

/**
 * Botão 4 — Identidade geográfica e cruzamento de insumo (+ protocolo combinado 04.B).
 */
export default function FuelGeographicInsumo() {
  const fuel = useMilestone2FuelOptional();
  const thumb =
    fuel?.previews.bomba ??
    fuel?.previews.vedacao ??
    fuel?.previews.placa ??
    null;

  const [flow, setFlow] = useState<Flow>("geo");
  const [result, setResult] = useState<Result>("idle");
  const [hash, setHash] = useState<string | null>(null);
  const [gold, setGold] = useState(false);

  const linesGeoOk = useMemo(
    () => [
      "> LOCALIZAÇÃO: DENTRO DO PERÍMETRO (500M)",
      "> CORRELAÇÃO DE ATIVOS: 100% (BOTÃO 01 <> 04)",
      "> STATUS: MATERIALIDADE CONFIRMADA",
      "> FÉ PÚBLICA: ESTABELECIDA.",
    ],
    []
  );

  const linesGeoBad = useMemo(
    () => [
      "> ALERTA: VIOLAÇÃO DE PERÍMETRO GEOGRÁFICO",
      "> DISTÂNCIA DETECTADA: 800M (FORA DOS 500M)",
      "> STATUS: TENTATIVA DE ABASTECIMENTO FICTÍCIO",
      "> AÇÃO: TRANSAÇÃO ABORTADA E GLOSADA.",
    ],
    []
  );

  const linesMistoOk = useMemo(
    () => [
      "[INSUMO TANQUE]: 45.5L -> [OK]",
      "[INSUMO GALÃO]: 20L -> [OK]",
      "[SOMA]: 65.5L -> [CONFERE]",
      "> CADEIA DE CUSTÓDIA: PRESERVADA.",
    ],
    []
  );

  const linesMistoBad = useMemo(
    () => [
      "> BLOQUEIO: VIOLAÇÃO DE PROTOCOLO",
      "> CAUSA: DIVERGÊNCIA DE VOLUMETRIA OU LOCALIZAÇÃO",
      "> STATUS: TENTATIVA DE DANO AO ERÁRIO DETECTADA.",
    ],
    []
  );

  const runGeo = useCallback(
    async (ok: boolean) => {
      setResult("scanning");
      setGold(false);
      playEnergyCharge();
      await new Promise((r) => setTimeout(r, 900));
      playMetallicBeep();
      await new Promise((r) => setTimeout(r, 400));
      setResult(ok ? "green" : "red");
      if (ok) {
        setHash(await generateSHA256("GEO-OK"));
        playSuccessChime();
        setGold(true);
      } else {
        setHash("ee1111" + generateMockHash().slice(6));
        playAlertFail();
      }
    },
    []
  );

  const runMisto = useCallback(
    async (ok: boolean) => {
      setResult("scanning");
      setGold(false);
      playEnergyCharge();
      await new Promise((r) => setTimeout(r, 800));
      playMetallicBeep();
      await new Promise((r) => setTimeout(r, 350));
      setResult(ok ? "green" : "red");
      if (ok) {
        setHash(await generateSHA256("MISTO-OK"));
        playSuccessChime();
        setGold(true);
      } else {
        setHash("dd2222" + generateMockHash().slice(6));
        playAlertFail();
      }
    },
    []
  );

  const blueprint = useMemo(() => {
    if (flow === "misto") {
      return (
        <TruckBlueprintHD
          mode={{
            kind: "geo",
            nozzleLit: result === "green",
            gallonLit: result === "green",
            outlineRedPulse: result === "red",
            shortCircuit: result === "red",
          }}
        />
      );
    }
    return (
      <TruckBlueprintHD
        mode={{
          kind: "geo",
          nozzleLit: result === "green",
          outlineRedPulse: result === "red",
        }}
      />
    );
  }, [flow, result]);

  const mapVariant =
    result === "green" ? "success" : result === "red" ? "error" : "idle";

  const belowMap = (
    <div className="grid gap-2">
      <GeoprocessingRadarMap
        variant={mapVariant}
        errorDistanceM={800}
      />
      {thumb && (
        <div className="relative overflow-hidden rounded-lg border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb}
            alt="Cruzamento com evidência do protocolo inicial"
            className="h-24 w-full object-cover opacity-90"
          />
          <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-mono text-white/80">
            Ref. Botão 01
          </span>
        </div>
      )}
      {!thumb && (
        <p className="text-center text-[10px] text-amber-200/80">
          Capture o protocolo no Botão 1 para preencher o cruzamento pericial.
        </p>
      )}
    </div>
  );

  const footerSlot = (
    <button
      type="button"
      disabled={result !== "green" || !gold}
      className={`w-full rounded-xl border-2 px-4 py-4 text-[11px] font-mono uppercase tracking-[0.16em] sm:py-5 sm:text-xs ${
        result === "green" && gold
          ? "master-faith-metallic border-amber-400/45"
          : "cursor-not-allowed border-white/10 bg-zinc-900 text-zinc-500"
      }`}
    >
      {result === "red"
        ? "Transação glosada — fé pública bloqueada"
        : "Presença confirmada — carimbo AP-04"}
    </button>
  );

  const scanning = result === "scanning";

  return (
    <Operational6040Workspace
      variant="frota"
      title="IDENTIDADE GEOGRÁFICA E CRUZAMENTO DE INSUMO"
      subtitle="Correlação GPS, bomba e evidência do protocolo materialidade"
      blueprintCustom={blueprint}
      blueprintBelow={belowMap}
      footerSlot={footerSlot}
      goldSealActive={result === "green" && gold}
    >
      <AuditPresentationHeader
        hashState={
          result === "red"
            ? "error"
            : result === "green" && gold
              ? "locked"
              : "spinning"
        }
        lockedHash={hash ?? undefined}
        custodyFirstCheck={result === "green"}
        accentRgb="16, 185, 129"
      />

      <div className="mb-4 flex flex-wrap justify-center gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => {
            setFlow("geo");
            setResult("idle");
            setGold(false);
            setHash(null);
          }}
          className={`rounded-full px-4 py-1.5 text-[11px] font-mono uppercase tracking-wider ${
            flow === "geo"
              ? "bg-emerald-500/25 text-emerald-100"
              : "text-white/45"
          }`}
        >
          Perímetro 500m
        </button>
        <button
          type="button"
          onClick={() => {
            setFlow("misto");
            setResult("idle");
            setGold(false);
            setHash(null);
          }}
          className={`rounded-full px-4 py-1.5 text-[11px] font-mono uppercase tracking-wider ${
            flow === "misto"
              ? "bg-teal-500/25 text-teal-100"
              : "text-white/45"
          }`}
        >
          Insumo misto (04.B)
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="relative space-y-3">
          <div
            className={`relative overflow-hidden rounded-xl border border-white/12 bg-gradient-to-br from-slate-950 to-slate-900 ${
              scanning ? "ring-2 ring-cyan-400/50" : ""
            }`}
          >
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2">
              <span className="font-mono text-4xl">⛽</span>
              <p className="px-4 text-center text-[11px] text-white/55">
                Visor da bomba · litragem e valor (simulação ao vivo)
              </p>
            </div>
            {scanning && (
              <motion.div
                className="pointer-events-none absolute inset-0 bg-white/25"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.35, 0] }}
                transition={{ duration: 0.35, repeat: 2 }}
              />
            )}
            <LaserBridge active={scanning} />
          </div>

          {thumb && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-black/40 p-2">
              <div className="flex h-14 min-w-[5.5rem] flex-col items-center justify-center rounded border border-white/15 bg-slate-950/80 text-[9px] font-mono text-emerald-200/90">
                <span className="text-lg">⛽</span>
                <span className="text-white/50">Visor</span>
              </div>
              {scanning && (
                <motion.div
                  className="h-1 min-w-[40px] flex-1 rounded-full bg-gradient-to-r from-emerald-400 via-white to-amber-400"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.45, repeat: Infinity }}
                  style={{ boxShadow: "0 0 10px rgba(52,211,153,0.8)" }}
                />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumb}
                alt="Cruzamento com evidência do protocolo (Botão 01)"
                className="h-14 w-24 rounded border border-red-500/30 object-cover"
              />
            </div>
          )}

          {flow === "geo" ? (
            <button
              type="button"
              onClick={() => runGeo(true)}
              disabled={scanning}
              className="fuel-neon-action-btn w-full rounded-xl border border-orange-400/40 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-white sm:py-4"
              style={{
                background: "linear-gradient(135deg,#0d9488,#ea580c)",
              }}
            >
              REGISTRAR ABASTECIMENTO E LOCALIZAÇÃO
            </button>
          ) : (
            <motion.button
              type="button"
              onClick={() => runMisto(true)}
              disabled={scanning}
              animate={{ opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="w-full rounded-xl border-2 border-teal-400/50 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-white shadow-[0_0_24px_rgba(45,212,191,0.35)] sm:py-4"
              style={{
                background: "linear-gradient(90deg,#134e4a,#c2410c)",
              }}
            >
              VALIDAR INSUMO MISTO
            </motion.button>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => (flow === "geo" ? runGeo(false) : runMisto(false))}
              disabled={scanning}
              className="rounded-lg border border-red-500/35 px-3 py-2 text-[10px] font-mono uppercase text-red-200"
            >
              Simular glosa / fora do raio
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {result === "idle" && (
            <p className="text-center text-xs text-white/45">
              Painel de auditoria: aguardando validação no mapa tático.
            </p>
          )}
          {flow === "geo" && result === "green" && (
            <TypewriterGeo active lines={linesGeoOk} ok />
          )}
          {flow === "geo" && result === "red" && (
            <TypewriterGeo active lines={linesGeoBad} ok={false} />
          )}
          {flow === "misto" && result === "green" && (
            <TypewriterGeo active lines={linesMistoOk} ok />
          )}
          {flow === "misto" && result === "red" && (
            <TypewriterGeo active lines={linesMistoBad} ok={false} />
          )}
        </div>
      </div>

      <AnimatePresence>
        {result === "green" && gold && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mt-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-400/80 bg-amber-950/50 text-center text-[9px] font-bold uppercase leading-tight text-amber-100 shadow-[0_0_36px_rgba(251,191,36,0.4)]"
          >
            {flow === "misto" ? "Fé pública" : "Presença confirmada"}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result === "red" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center bg-black/50"
          >
            <div
              className={`max-w-lg -rotate-6 rounded border-2 bg-black px-6 py-3 text-center font-mono text-sm font-bold uppercase tracking-[0.25em] text-red-400 shadow-[0_0_40px_rgba(239,68,68,0.45)] ${
                flow === "misto" ? "border-red-500" : "border-red-600"
              }`}
            >
              {flow === "misto"
                ? "[ TRANSAÇÃO GLOSADA ]"
                : "[ TRANSAÇÃO ABORTADA ]"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Operational6040Workspace>
  );
}

function LaserBridge({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="absolute left-0 top-1/2 h-0.5 w-full origin-left bg-gradient-to-r from-emerald-400 via-cyan-300 to-red-400"
        style={{ boxShadow: "0 0 12px rgba(52,211,153,0.9)" }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </motion.div>
  );
}
