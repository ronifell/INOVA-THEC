"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoice } from "@/hooks/useVoice";
import { generateSHA256, generateMockHash } from "@/lib/crypto";
import Operational6040Workspace from "@/components/audit/Operational6040Workspace";
import AuditPresentationHeader from "./AuditPresentationHeader";

type Verdict = "idle" | "scanning" | "valid" | "invalid";

type Analogy = {
  id: "odo" | "tank" | "gallon" | "fiscal";
  label: string;
  ok: boolean | null;
};

export default function FuelSentenceLiquidation() {
  const { speak } = useVoice();
  const [verdict, setVerdict] = useState<Verdict>("idle");
  const [hash, setHash] = useState<string | null>(null);
  const [scanLine, setScanLine] = useState(0);
  const [analogies, setAnalogies] = useState<Analogy[]>([
    { id: "odo", label: "HODÔMETRO DIGITAL", ok: null },
    { id: "tank", label: "FLUXO DE TANQUE", ok: null },
    { id: "gallon", label: "VETOR DE GALÃO", ok: null },
    { id: "fiscal", label: "SELO FISCAL", ok: null },
  ]);

  const allValid = analogies.every((a) => a.ok === true);
  const hasInvalid = analogies.some((a) => a.ok === false);

  const startScan = async (targetValid: boolean) => {
    setVerdict("scanning");
    setScanLine(0);
    setAnalogies((prev) => prev.map((a) => ({ ...a, ok: null })));
    speak(
      "Iniciando escaneamento de integridade. A inteligência Inova Thec está processando as evidências fotográficas e coordenadas de GPS."
    );
    for (let i = 0; i <= 100; i += 4) {
      await new Promise((r) => window.setTimeout(r, 42));
      setScanLine(i);
    }
    setAnalogies([
      { id: "odo", label: "HODÔMETRO DIGITAL", ok: targetValid ? true : false },
      { id: "tank", label: "FLUXO DE TANQUE", ok: targetValid ? true : true },
      { id: "gallon", label: "VETOR DE GALÃO", ok: targetValid ? true : false },
      { id: "fiscal", label: "SELO FISCAL", ok: targetValid ? true : true },
    ]);
    const nextHash = await generateSHA256(
      `${targetValid ? "M5-VALID" : "M5-INVALID"}-${Date.now()}`
    );
    setHash(nextHash);
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
        <rect x="12" y="12" width="336" height="196" rx="10" fill="none" stroke="rgba(148,163,184,0.35)" />
        {analogies.map((a, i) => {
          const x = 30 + i * 82;
          const color =
            a.ok === null ? "rgba(148,163,184,0.5)" : a.ok ? "#10b981" : "#b91c1c";
          return (
            <g key={a.id} transform={`translate(${x},60)`}>
              <circle cx="36" cy="26" r="24" fill="rgba(15,23,42,0.65)" stroke={color} strokeWidth="2.2" filter="url(#m5-glow)" />
              <text x="36" y="31" textAnchor="middle" fill={color} fontSize="13" fontFamily="ui-monospace">
                {a.id === "odo" ? "KM" : a.id === "tank" ? "TQ" : a.id === "gallon" ? "GL" : "NF"}
              </text>
              <text x="36" y="68" textAnchor="middle" fill="rgba(226,232,240,0.7)" fontSize="8">
                {a.label}
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
      title="CENTRAL DE SENTENÇA E LIQUIDAÇÃO"
      subtitle="Scanner pericial e decisão final de liquidação"
      blueprintCustom={blueprint}
      goldSealActive={allValid}
      footerSlot={
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={!allValid}
            className={`rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wide ${
              allValid
                ? "fuel-neon-action-btn border border-emerald-400/45 bg-emerald-600 text-white"
                : "cursor-not-allowed border border-white/10 bg-zinc-900 text-zinc-500"
            }`}
          >
            ✅ Autorizar e liquidar pagamento
          </button>
          <button
            type="button"
            className={`rounded-xl border px-4 py-3 text-xs font-bold uppercase tracking-wide ${
              hasInvalid
                ? "border-red-500 bg-red-950/60 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                : "border-red-500/40 bg-red-950/30 text-red-300"
            }`}
          >
            🛑 Rejeitar e efetivar glosa
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
          <div className="relative mt-2 grid gap-2 sm:grid-cols-5">
            {["Placa", "KM", "Bomba", "Galão", "Nota"].map((k, i) => (
              <div key={k} className="relative overflow-hidden rounded-md border border-white/10 bg-slate-950/80 p-2">
                <p className="text-center text-[10px] text-white/55">{k}</p>
                <p className="mt-1 break-all font-mono text-[9px] text-emerald-300/80">
                  {generateMockHash().slice(i * 4, i * 4 + 12)}…
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
              ALERTA: divergência entre evidências fotográficas/GPS. Glosa recomendada.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </Operational6040Workspace>
  );
}

