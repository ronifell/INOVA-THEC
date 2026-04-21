"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateSHA256 } from "@/lib/crypto";
import Operational6040Workspace from "@/components/audit/Operational6040Workspace";
import AuditPresentationHeader from "./AuditPresentationHeader";
import TruckBlueprintHD from "./TruckBlueprintHD";
import { playAlertFail } from "@/lib/sfx";

type Scenario = "idle" | "success" | "fail";

function TypewriterBlock({
  lines,
  active,
  className,
}: {
  lines: string[];
  active: boolean;
  className?: string;
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
      const t = window.setTimeout(() => setChar((c) => c + 1), 22);
      return () => window.clearTimeout(t);
    }
    if (idx < lines.length - 1) {
      const t = window.setTimeout(() => {
        setIdx((i) => i + 1);
        setChar(0);
      }, 280);
      return () => window.clearTimeout(t);
    }
  }, [active, char, idx, lines]);

  const text = lines.slice(0, idx + 1).map((line, i) =>
    i < idx ? line : line.slice(0, char)
  );

  return (
    <div
      className={`min-h-[120px] rounded-xl border border-white/10 bg-black/30 px-3 py-3 font-mono text-[11px] leading-relaxed sm:text-xs ${className ?? ""}`}
    >
      {text.map((line, i) => (
        <p key={i} className={i > 0 ? "mt-2" : ""}>
          {line}
          {i === text.length - 1 && char < (lines[idx]?.length ?? 0) && (
            <span className="ml-0.5 inline-block h-[1em] w-1.5 animate-pulse bg-current align-[-0.15em] opacity-70" />
          )}
        </p>
      ))}
    </div>
  );
}

/**
 * Botão 2 — Identificação de ativo e correlação de frota (cenário positivo e negativo).
 */
export default function FuelAssetIdentification() {
  const [scenario, setScenario] = useState<Scenario>("idle");
  const [hash, setHash] = useState<string | null>(null);
  const [hashLocked, setHashLocked] = useState(false);
  const [goldSeal, setGoldSeal] = useState(false);

  const linesPos = useMemo(
    () => [
      "> PLACA IDENTIFICADA: ABC-1234",
      "> VÍNCULO: SECRETARIA DE SAÚDE - LOTE 01",
      "> STATUS: ATIVO EM CONFORMIDADE",
    ],
    []
  );

  const linesNeg = useMemo(
    () => [
      "> ALERTA: PLACA XYZ-9999 NÃO LOCALIZADA",
      "> STATUS: TENTATIVA DE ABASTECIMENTO EXTERNO",
      "> AÇÃO: BLOQUEIO IMEDIATO DA TRANSAÇÃO",
    ],
    []
  );

  const runSuccess = useCallback(async () => {
    setScenario("success");
    setGoldSeal(false);
    setHashLocked(false);
    const h = await generateSHA256("PLACA-OK");
    let step = 0;
    const spin = window.setInterval(async () => {
      step++;
      setHash(await generateSHA256(`spin-${step}-${Date.now()}`));
      if (step > 18) {
        window.clearInterval(spin);
        setHash(h);
        setHashLocked(true);
        setGoldSeal(true);
      }
    }, 55);
  }, []);

  const runFail = useCallback(async () => {
    setScenario("fail");
    setGoldSeal(false);
    setHashLocked(true);
    playAlertFail();
    setHash("ff0000deadbeefcafe00" + (await generateSHA256("FAIL")).slice(0, 26));
  }, []);

  const reset = useCallback(() => {
    setScenario("idle");
    setHash(null);
    setHashLocked(false);
    setGoldSeal(false);
  }, []);

  const scannerColor =
    scenario === "fail" ? "shadow-[0_0_20px_rgba(239,68,68,0.9)]" : "shadow-[0_0_20px_rgba(16,185,129,0.85)]";

  const blueprint = useMemo(
    () => (
      <TruckBlueprintHD
        mode={
          scenario === "success"
            ? { kind: "asset", positive: true }
            : scenario === "fail"
              ? { kind: "asset", positive: false, plateErrorPulse: true }
              : { kind: "asset", positive: false }
        }
      />
    ),
    [scenario]
  );

  const footerSlot = (
    <button
      type="button"
      disabled={scenario !== "success" || !goldSeal}
      className={`w-full rounded-xl border-2 px-4 py-4 text-center text-[11px] font-mono uppercase tracking-[0.18em] sm:py-5 sm:text-xs ${
        scenario === "success" && goldSeal
          ? "master-faith-metallic border-amber-400/40"
          : "cursor-not-allowed border-white/10 bg-zinc-900 text-zinc-500"
      }`}
    >
      {scenario === "fail"
        ? "Pagamento bloqueado — botão mestre inativo"
        : scenario === "success" && goldSeal
          ? "Botão mestre de pagamento liberado"
          : "Botão mestre de pagamento — aguardando integridade"}
    </button>
  );

  return (
    <Operational6040Workspace
      variant="frota"
      title="IDENTIFICAÇÃO DE ATIVO E CORRELAÇÃO DE FROTA"
      subtitle="Cruzamento da identidade do veículo com o contrato administrativo"
      blueprintCustom={blueprint}
      footerSlot={footerSlot}
      goldSealActive={scenario === "success" && goldSeal}
    >
      <AuditPresentationHeader
        hashState={
          scenario === "fail" ? "error" : hashLocked ? "locked" : "spinning"
        }
        lockedHash={hash ?? undefined}
        custodyFirstCheck={scenario === "success" && hashLocked}
        accentRgb="16, 185, 129"
      />

      <div className="space-y-4">
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={runSuccess}
            className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 text-[11px] font-mono uppercase tracking-wider text-emerald-200"
          >
            Demonstrar fé pública (OK)
          </button>
          <button
            type="button"
            onClick={runFail}
            className="rounded-lg border border-red-500/40 bg-red-500/15 px-4 py-2 text-[11px] font-mono uppercase tracking-wider text-red-200"
          >
            Demonstrar bloqueio (fraude)
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-white/15 px-4 py-2 text-[11px] font-mono text-white/70"
          >
            Reiniciar
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
            <div
              className={`relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 ${
                scenario === "fail" ? "ring-2 ring-red-500/60" : ""
              }`}
            >
              <p className="font-mono text-sm tracking-[0.4em] text-white/80">
                {scenario === "fail" ? "XYZ-9999" : "ABC-1234"}
              </p>
              <motion.div
                className={`fuel-scanner-line pointer-events-none absolute inset-x-0 top-0 h-[28%] bg-gradient-to-b from-emerald-400/25 via-emerald-300/50 to-transparent ${scannerColor}`}
                animate={
                  scenario === "fail"
                    ? { top: ["0%", "72%", "72%"], opacity: [1, 1, 0.85] }
                    : { top: ["0%", "100%", "0%"] }
                }
                transition={
                  scenario === "fail"
                    ? { duration: 2.4, times: [0, 0.7, 1], repeat: Infinity }
                    : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
                }
                style={{ mixBlendMode: "screen" }}
              />
              {scenario === "fail" && (
                <motion.div
                  className="pointer-events-none absolute inset-x-[18%] bottom-[22%] top-[52%] rounded border-2 border-red-500"
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 0.28, repeat: Infinity }}
                />
              )}
            </div>
            <p className="px-2 py-2 text-center text-[10px] font-mono text-white/45">
              Scanner neon · linha sobre a placa
            </p>
          </div>

          <div className="space-y-3">
            {scenario === "success" && (
              <TypewriterBlock
                key="pos"
                active
                lines={linesPos}
                className="text-emerald-200"
              />
            )}
            {scenario === "fail" && (
              <TypewriterBlock
                key="neg"
                active
                lines={linesNeg}
                className="text-red-300"
              />
            )}
            {scenario === "idle" && (
              <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-xs text-white/50">
                Escolha um cenário de demonstração.
              </p>
            )}
          </div>
        </div>

        <AnimatePresence>
          {scenario === "success" && goldSeal && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 border-amber-400/80 bg-gradient-to-br from-amber-700/40 to-amber-950/60 text-center text-[10px] font-bold uppercase leading-tight text-amber-100 shadow-[0_0_40px_rgba(212,175,55,0.45)]"
            >
              INTEGRIDADE VEICULAR VALIDADA
            </motion.div>
          )}
          {scenario === "fail" && (
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto rounded-lg border border-red-500/50 bg-red-950/60 px-6 py-3 text-center text-sm font-bold uppercase tracking-wider text-red-200"
            >
              REJEITADO · AUDITORIA NECESSÁRIA
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Operational6040Workspace>
  );
}
