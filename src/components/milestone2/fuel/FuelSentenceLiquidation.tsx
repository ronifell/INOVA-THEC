"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoice } from "@/hooks/useVoice";
import { generateSHA256, generateMockHash } from "@/lib/crypto";
import Operational6040Workspace from "@/components/audit/Operational6040Workspace";
import AuditPresentationHeader from "./AuditPresentationHeader";
import { useMilestone2FuelOptional } from "./Milestone2FuelContext";

type Verdict = "idle" | "scanning" | "valid" | "invalid";

type Analogy = {
  id: "odo" | "tank" | "gallon" | "fiscal";
  label: string;
  subtitle: string;
  ok: boolean | null;
};

type EvidenceCard = {
  id: "plate" | "km" | "pump" | "gallon";
  label: string;
  preview: string | null;
};

export default function FuelSentenceLiquidation() {
  const { speak } = useVoice();
  const fuel = useMilestone2FuelOptional();
  const [verdict, setVerdict] = useState<Verdict>("idle");
  const [hash, setHash] = useState<string | null>(null);
  const [scanLine, setScanLine] = useState(0);
  const [scanHashes, setScanHashes] = useState<Record<string, string>>({});
  const [analogies, setAnalogies] = useState<Analogy[]>([
    {
      id: "odo",
      label: "HODÔMETRO (B2/B3)",
      subtitle: "Velocímetro em fios de luz (Validação de Rota)",
      ok: null,
    },
    {
      id: "tank",
      label: "TANQUE (B4A)",
      subtitle: "Vetor do bocal com preenchimento de luz (Abastecimento Direto)",
      ok: null,
    },
    {
      id: "gallon",
      label: "GALÃO (B4B)",
      subtitle: "Ícone industrial com pulso de GPS (Contingência)",
      ok: null,
    },
    {
      id: "fiscal",
      label: "SELO FISCAL (B5)",
      subtitle: "Brasão oficial com integração de QR-Code (Nota Fiscal)",
      ok: null,
    },
  ]);

  const evidences = useMemo<EvidenceCard[]>(
    () => [
      { id: "plate", label: "PLACA", preview: fuel?.previews.placa ?? null },
      { id: "km", label: "KM", preview: fuel?.previews.odometro ?? null },
      { id: "pump", label: "BOMBA", preview: fuel?.previews.bomba ?? null },
      { id: "gallon", label: "GALÃO", preview: fuel?.previews.vedacao ?? null },
    ],
    [fuel?.previews.bomba, fuel?.previews.odometro, fuel?.previews.placa, fuel?.previews.vedacao]
  );

  const allValid = analogies.every((a) => a.ok === true);
  const hasInvalid = analogies.some((a) => a.ok === false);

  const startScan = async (targetValid: boolean) => {
    setVerdict("scanning");
    setHash(null);
    setScanLine(0);
    setAnalogies((prev) => prev.map((a) => ({ ...a, ok: null })));
    setScanHashes(
      Object.fromEntries(evidences.map((e) => [e.id, generateMockHash().slice(0, 18)]))
    );
    speak(
      "Iniciando escaneamento de integridade. A inteligência Inova Thec está processando as evidências fotográficas e coordenadas de GPS."
    );
    for (let i = 0; i <= 100; i += 3) {
      await new Promise((r) => window.setTimeout(r, 48));
      setScanLine(i);
      setScanHashes(
        Object.fromEntries(evidences.map((e) => [e.id, generateMockHash().slice(0, 18)]))
      );
    }
    setAnalogies([
      {
        id: "odo",
        label: "HODÔMETRO (B2/B3)",
        subtitle: "Velocímetro em fios de luz (Validação de Rota)",
        ok: targetValid ? true : false,
      },
      {
        id: "tank",
        label: "TANQUE (B4A)",
        subtitle: "Vetor do bocal com preenchimento de luz (Abastecimento Direto)",
        ok: true,
      },
      {
        id: "gallon",
        label: "GALÃO (B4B)",
        subtitle: "Ícone industrial com pulso de GPS (Contingência)",
        ok: targetValid ? true : false,
      },
      {
        id: "fiscal",
        label: "SELO FISCAL (B5)",
        subtitle: "Brasão oficial com integração de QR-Code (Nota Fiscal)",
        ok: true,
      },
    ]);
    const nextHash = await generateSHA256(
      `${targetValid ? "M5-VALID" : "M5-INVALID"}-${Date.now()}`
    );
    setHash(nextHash);
    setScanHashes(
      Object.fromEntries(
        evidences.map((e, idx) => [e.id, `${nextHash.slice(idx * 8, idx * 8 + 18)}...`])
      )
    );
    setVerdict(targetValid ? "valid" : "invalid");
    speak(
      targetValid
        ? "As quatro analogias estão verdes. A materialidade está confirmada para liquidação."
        : "Sinalização em vermelho detectada. Houve divergência na perícia e a glosa é recomendada."
    );
  };

  useEffect(() => {
    if (verdict !== "idle") return;
    void startScan(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hashState =
    verdict === "invalid" ? "error" : verdict === "valid" ? "locked" : "spinning";

  const blueprint = useMemo(
    () => (
      <svg viewBox="0 0 360 220" className="h-full w-full" aria-hidden>
        <defs>
          <filter id="m5-glow">
            <feGaussianBlur stdDeviation="1.8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect
          x="12"
          y="12"
          width="336"
          height="196"
          rx="10"
          fill="none"
          stroke="rgba(148,163,184,0.35)"
        />
        {analogies.map((a, i) => {
          const x = 30 + i * 82;
          const color =
            a.ok === null ? "rgba(148,163,184,0.5)" : a.ok ? "#10b981" : "#b91c1c";
          return (
            <g key={a.id} transform={`translate(${x},60)`}>
              <circle
                cx="36"
                cy="26"
                r="24"
                fill="rgba(15,23,42,0.65)"
                stroke={color}
                strokeWidth="2.2"
                filter="url(#m5-glow)"
              />
              <text x="36" y="31" textAnchor="middle" fill={color} fontSize="13" fontFamily="ui-monospace">
                {a.id === "odo" ? "KM" : a.id === "tank" ? "TQ" : a.id === "gallon" ? "GL" : "NF"}
              </text>
              <text x="36" y="66" textAnchor="middle" fill="rgba(226,232,240,0.7)" fontSize="8">
                {a.label}
              </text>
              <text x="36" y="74" textAnchor="middle" fill="rgba(148,163,184,0.65)" fontSize="5.8">
                {a.subtitle.slice(0, 18)}...
              </text>
            </g>
          );
        })}
      </svg>
    ),
    [analogies]
  );

  return (
    <Operational6040Workspace
      variant="frota"
      title="MÓDULO 05: CENTRAL DE SENTENÇA E LIQUIDAÇÃO PERICIAL"
      subtitle="Scanner de integridade, painel blueprint e sentença final de pagamento"
      blueprintCustom={blueprint}
      goldSealActive={allValid}
      footerSlot={
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={!allValid}
            className={`rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wide ${
              allValid
                ? "fuel-neon-action-btn border border-emerald-400/45 bg-emerald-600 text-white shadow-[0_0_28px_rgba(16,185,129,0.45)]"
                : "cursor-not-allowed border border-white/10 bg-zinc-900 text-zinc-500"
            }`}
          >
            ✅ AUTORIZAR E LIQUIDAR
          </button>
          <button
            type="button"
            className={`rounded-xl border px-4 py-3 text-xs font-bold uppercase tracking-wide ${
              hasInvalid
                ? "border-red-500 bg-red-950/60 text-red-200 shadow-[0_0_24px_rgba(239,68,68,0.5)] animate-pulse"
                : "border-red-500/40 bg-red-950/30 text-red-300"
            }`}
          >
            🛑 REJEITAR E EFETIVAR GLOSA
          </button>
        </div>
      }
    >
      <AuditPresentationHeader
        hashState={hashState}
        lockedHash={hash ?? generateMockHash()}
        custodyFirstCheck={allValid}
        accentRgb="16, 185, 129"
      />

      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-black/35 p-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-white/45">
            Scanner de conferência pericial
          </p>
          <div className="relative mt-2 grid gap-2 sm:grid-cols-4">
            {evidences.map((ev) => (
              <div
                key={ev.id}
                className="relative overflow-hidden rounded-md border border-white/10 bg-slate-950/80 p-2"
              >
                {ev.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ev.preview}
                    alt={ev.label}
                    className="h-14 w-full rounded object-cover opacity-85"
                  />
                ) : (
                  <div className="flex h-14 items-center justify-center rounded bg-black/40 text-[10px] text-white/40">
                    SEM MINIATURA
                  </div>
                )}
                <p className="mt-1 text-center text-[10px] text-white/55">{ev.label}</p>
                <p className="mt-1 break-all font-mono text-[9px] text-emerald-300/80">
                  {scanHashes[ev.id] ?? generateMockHash().slice(0, 18)}
                </p>
              </div>
            ))}
            <motion.div
              className="pointer-events-none absolute left-0 right-0 h-[0.28%] bg-cyan-300"
              style={{ top: `${scanLine}%`, boxShadow: "0 0 16px rgba(34,211,238,0.95)" }}
              animate={verdict === "scanning" ? { opacity: [0.9, 1, 0.9] } : { opacity: 0 }}
              transition={{ duration: 0.25, repeat: Infinity }}
            />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => void startScan(true)}
            className="rounded-lg border border-emerald-500/35 bg-emerald-600/20 py-2 text-[11px] font-mono text-emerald-100"
          >
            Simular scanner válido
          </button>
          <button
            type="button"
            onClick={() => void startScan(false)}
            className="rounded-lg border border-red-500/35 bg-red-950/40 py-2 text-[11px] font-mono text-red-200"
          >
            Simular inconsistência
          </button>
        </div>

        <AnimatePresence>
          {verdict === "invalid" && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-red-500/45 bg-red-950/60 px-3 py-2 text-xs text-red-200"
            >
              ALERTA: divergência detectada entre GPS, foto e valor. O sistema bloqueou a liquidação.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </Operational6040Workspace>
  );
}

