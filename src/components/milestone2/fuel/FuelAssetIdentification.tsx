"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
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
      className={`flex h-full min-h-0 flex-col overflow-hidden rounded-sm border border-white/15 bg-slate-700/40 px-[clamp(0.45rem,2.2%,0.75rem)] py-[clamp(0.45rem,2.2%,0.75rem)] font-mono text-[clamp(9px,2vmin,11px)] leading-snug ${className ?? ""}`}
    >
      {text.map((line, i) => (
        <p key={i} className={i > 0 ? "mt-1.5" : ""}>
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
          : "cursor-not-allowed border-slate-500/35 bg-slate-600/45 text-slate-200/75"
      }`}
    >
      {scenario === "fail"
        ? "Pagamento bloqueado — botão mestre inativo"
        : scenario === "success" && goldSeal
          ? "Botão mestre de pagamento liberado"
          : "Botão mestre de pagamento — aguardando integridade"}
    </button>
  );

  const scanCellClass =
    "relative aspect-square w-full min-h-0 max-w-[min(100%,22rem)] justify-self-center overflow-hidden rounded-sm border border-emerald-500/35 bg-slate-900/50 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.12)] lg:max-w-none";

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

      <div className="flex min-h-0 w-full flex-1 flex-col gap-[clamp(0.45rem,1.6vh,0.75rem)]">
        <div className="flex shrink-0 flex-wrap justify-center gap-2">
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

        <div className="grid min-h-0 w-full flex-1 grid-cols-1 items-stretch gap-2 sm:gap-3 lg:grid-cols-2">
          <div
            className={`${scanCellClass} ${scenario === "fail" ? "ring-2 ring-red-500/55" : ""}`}
          >
            <Image
              src="/images/biometric-scan-face.png"
              alt="Varredura biométrica facial em rede"
              fill
              className="object-cover object-[center_22%]"
              sizes="(max-width: 1024px) 90vw, 28vw"
              priority
            />
            {scenario === "fail" && (
              <div
                className="pointer-events-none absolute inset-0 z-[2] bg-red-600/25 mix-blend-overlay"
                aria-hidden
              />
            )}
            <motion.div
              className={`pointer-events-none absolute inset-x-0 top-0 z-[3] h-[26%] bg-gradient-to-b from-emerald-400/30 via-emerald-300/45 to-transparent ${scannerColor}`}
              animate={
                scenario === "fail"
                  ? { top: ["0%", "68%", "68%"], opacity: [1, 1, 0.85] }
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
                className="pointer-events-none absolute inset-x-[18%] bottom-[20%] top-[50%] z-[3] rounded border-2 border-red-500"
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ duration: 0.28, repeat: Infinity }}
              />
            )}
          </div>

          <div
            className={`flex aspect-square w-full min-h-0 max-w-[min(100%,22rem)] flex-col justify-self-center overflow-hidden rounded-sm border border-white/15 bg-slate-700/35 p-[clamp(0.5rem,2.5%,0.85rem)] lg:max-w-none`}
          >
            {scenario === "success" && (
              <TypewriterBlock
                key="pos"
                active
                lines={linesPos}
                className="min-h-0 flex-1 text-emerald-200"
              />
            )}
            {scenario === "fail" && (
              <TypewriterBlock
                key="neg"
                active
                lines={linesNeg}
                className="min-h-0 flex-1 text-red-300"
              />
            )}
            {scenario === "idle" && (
              <div className="flex h-full min-h-0 flex-1 items-center justify-center text-center">
                <p className="text-[clamp(10px,2.2vmin,12px)] leading-snug text-white/55">
                  Escolha um cenário de demonstração.
                </p>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {scenario === "success" && goldSeal && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto flex h-[clamp(5.5rem,16vmin,7rem)] w-[clamp(5.5rem,16vmin,7rem)] shrink-0 items-center justify-center rounded-full border-4 border-amber-400/80 bg-gradient-to-br from-amber-700/40 to-amber-950/60 text-center text-[clamp(8px,1.6vmin,10px)] font-bold uppercase leading-tight text-amber-100 shadow-[0_0_40px_rgba(212,175,55,0.45)]"
            >
              INTEGRIDADE VEICULAR VALIDADA
            </motion.div>
          )}
          {scenario === "fail" && (
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto shrink-0 rounded-lg border border-red-500/50 bg-red-950/60 px-[clamp(1rem,4%,1.5rem)] py-[clamp(0.5rem,2%,0.75rem)] text-center text-[clamp(0.7rem,2.4vmin,0.875rem)] font-bold uppercase tracking-wider text-red-200"
            >
              REJEITADO · AUDITORIA NECESSÁRIA
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Operational6040Workspace>
  );
}
