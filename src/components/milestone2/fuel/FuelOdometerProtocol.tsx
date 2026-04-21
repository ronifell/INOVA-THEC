"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateSHA256, generateMockHash } from "@/lib/crypto";
import Operational6040Workspace from "@/components/audit/Operational6040Workspace";
import AuditPresentationHeader from "./AuditPresentationHeader";
import TruckBlueprintHD from "./TruckBlueprintHD";

type OdoState = "idle" | "processing" | "success" | "warn" | "critical";

function TypewriterLines({
  lines,
  active,
  tone,
}: {
  lines: string[];
  active: boolean;
  tone: "green" | "yellow" | "red";
}) {
  const [idx, setIdx] = useState(0);
  const [char, setChar] = useState(0);
  const cls =
    tone === "green"
      ? "text-emerald-200"
      : tone === "yellow"
        ? "text-amber-200"
        : "text-red-400";

  useEffect(() => {
    if (!active) {
      setIdx(0);
      setChar(0);
      return;
    }
    const full = lines[idx] ?? "";
    if (char < full.length) {
      const t = window.setTimeout(() => setChar((c) => c + 1), 20);
      return () => window.clearTimeout(t);
    }
    if (idx < lines.length - 1) {
      const t = window.setTimeout(() => {
        setIdx((i) => i + 1);
        setChar(0);
      }, 260);
      return () => window.clearTimeout(t);
    }
  }, [active, char, idx, lines]);

  const shown = lines.slice(0, idx + 1).map((line, i) =>
    i < idx ? line : line.slice(0, char)
  );

  return (
    <div
      className={`min-h-[140px] rounded-xl border border-white/10 bg-black/35 px-3 py-3 font-mono text-[11px] leading-relaxed sm:text-xs ${cls}`}
    >
      {shown.map((line, i) => (
        <p
          key={i}
          className={
            tone === "yellow" && i === idx ? "animate-pulse" : ""
          }
        >
          {line}
        </p>
      ))}
    </div>
  );
}

/**
 * Botão 3 — Hodômetro / protocolo de movimentação (AP-04).
 */
export default function FuelOdometerProtocol() {
  const [state, setState] = useState<OdoState>("idle");
  const [hash, setHash] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (state !== "processing") return;
    const id = window.setInterval(() => {
      setHash(generateMockHash());
    }, 42);
    const end = window.setTimeout(() => {
      window.clearInterval(id);
      setState("success");
      setLocked(true);
      void (async () => setHash(await generateSHA256("ODO-OK")))();
    }, 2000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(end);
    };
  }, [state]);

  const startProcessing = useCallback(() => {
    setState("processing");
    setLocked(false);
    setHash(null);
  }, []);

  const linesSuccess = useMemo(
    () => [
      "> LEITURA DE KM: 48.372 KM",
      "> MÉDIA DE CONSUMO: 12.4 KM/L",
      "> STATUS: DENTRO DA MÉTRICA DE ECONOMICIDADE",
      "> FÉ PÚBLICA ESTABELECIDA.",
    ],
    []
  );

  const linesWarn = useMemo(
    () => [
      "> ERRO: NITIDEZ ABAIXO DO PADRÃO PERICIAL",
      "> CAUSA: FOCO INSUFICIENTE / REFLEXO NO PAINEL",
      "> AÇÃO: CAPTURA REJEITADA PARA EVITAR NULIDADE.",
    ],
    []
  );

  const linesCrit = useMemo(
    () => [
      "> ALERTA CRÍTICO: INCONSISTÊNCIA DE RODAGEM",
      "> DIAGNÓSTICO: CONSUMO IMPOSSÍVEL (1.2 KM/L)",
      "> STATUS: TENTATIVA DE DANO AO ERÁRIO DETECTADA",
      "> AÇÃO: PAGAMENTO GLOSADO E INCIDENTE REGISTRADO.",
    ],
    []
  );

  const blueprint = useMemo(
    () => (
      <TruckBlueprintHD
        mode={{
          kind: "odometer",
          visualState:
            state === "idle"
              ? "idle"
              : state === "processing"
                ? "processing"
                : state === "success"
                  ? "success"
                  : state === "warn"
                    ? "warn"
                    : "critical",
        }}
      />
    ),
    [state]
  );

  const consumptionPoints =
    state === "success"
      ? "0,140 40,132 80,128 120,120 160,112 200,108 240,104 280,100 320,96 360,92 400,88 400,200 0,200"
      : state === "warn"
        ? "0,160 400,160 400,200 0,200"
        : "0,145 80,140 160,148 240,130 320,138 400,125 400,200 0,200";

  const footerSlot = (
    <button
      type="button"
      disabled={state !== "success"}
      className={`w-full rounded-xl border-2 px-4 py-4 text-[11px] font-mono uppercase tracking-[0.18em] sm:py-5 sm:text-xs ${
        state === "success"
          ? "master-faith-metallic border-amber-400/45"
          : "cursor-not-allowed border-white/10 bg-zinc-900 text-zinc-500"
      }`}
    >
      {state === "critical"
        ? "Pagamento glosado — botão mestre inativo"
        : "Botão mestre — liberação após métrica conforme"}
    </button>
  );

  return (
    <Operational6040Workspace
      variant="frota"
      title="HODÔMETRO — PROTOCOLO DE MOVIMENTAÇÃO AP-04"
      subtitle="Quilometragem, consumo e economicidade"
      blueprintCustom={blueprint}
      footerSlot={footerSlot}
      goldSealActive={state === "success"}
    >
      <AuditPresentationHeader
        hashState={
          state === "critical"
            ? "error"
            : locked && state === "success"
              ? "locked"
              : "spinning"
        }
        lockedHash={hash ?? undefined}
        custodyFirstCheck={state === "success" && locked}
        accentRgb="16, 185, 129"
      />

      <div className="space-y-4">
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={startProcessing}
            className="rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-3 py-2 text-[11px] font-mono text-cyan-100"
          >
            1 · Processar captura (2s)
          </button>
          <button
            type="button"
            onClick={() => {
              setState("success");
              setLocked(true);
              void (async () => setHash(await generateSHA256("OK")))();
            }}
            className="rounded-lg border border-emerald-500/35 px-3 py-2 text-[11px] font-mono text-emerald-200"
          >
            2 · Verde (sucesso)
          </button>
          <button
            type="button"
            onClick={() => {
              setState("warn");
              setHash(staticWarnHash());
            }}
            className="rounded-lg border border-amber-500/35 px-3 py-2 text-[11px] font-mono text-amber-100"
          >
            3 · Amarelo (nitidez)
          </button>
          <button
            type="button"
            onClick={() => {
              setState("critical");
              setHash("aa0000" + generateMockHash().slice(8));
            }}
            className="rounded-lg border border-red-500/40 px-3 py-2 text-[11px] font-mono text-red-200"
          >
            4 · Vermelho (fraude)
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div
            className={`relative overflow-hidden rounded-xl border border-white/10 bg-black/50 ${
              state === "critical" ? "fuel-glitch-img" : ""
            }`}
          >
            <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-slate-900 to-black">
              <span className="font-mono text-3xl text-emerald-400/90">48372</span>
              {(state === "processing" || state === "success") && (
                <motion.div
                  className="pointer-events-none absolute inset-x-[10%] top-[15%] h-[12%] bg-emerald-400/35"
                  animate={{ top: state === "processing" ? ["15%", "75%", "15%"] : "40%" }}
                  transition={{ duration: state === "processing" ? 2 : 0.4, repeat: state === "processing" ? Infinity : 0 }}
                />
              )}
              {state === "warn" && (
                <motion.div
                  className="fuel-scanner-line pointer-events-none absolute inset-x-0 top-[30%] h-[20%] bg-amber-400/35"
                  animate={{ x: [-4, 4, -3, 5, 0] }}
                  transition={{ duration: 0.12, repeat: Infinity }}
                />
              )}
              {state === "warn" && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full border-2 border-amber-400/60 bg-black/50 p-4 text-4xl">
                    📷
                  </div>
                  <span className="absolute bottom-6 text-[10px] font-mono text-amber-200">
                    ↻ Repetir captura
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            {state === "processing" && (
              <p className="animate-pulse font-mono text-sm text-emerald-400">
                &gt; EXECUTANDO PROTOCOLO AP-04…
              </p>
            )}
            {state === "success" && (
              <TypewriterLines
                key="s"
                active
                lines={linesSuccess}
                tone="green"
              />
            )}
            {state === "warn" && (
              <TypewriterLines key="w" active lines={linesWarn} tone="yellow" />
            )}
            {state === "critical" && (
              <TypewriterLines key="c" active lines={linesCrit} tone="red" />
            )}
            {state === "idle" && (
              <p className="text-center text-xs text-white/45">
                Selecione um estado de demonstração acima.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">
            Curva de consumo observado
          </p>
          <svg className="mt-2 h-24 w-full" viewBox="0 0 400 200" preserveAspectRatio="none">
            <polyline
              fill="rgba(16,185,129,0.12)"
              stroke={state === "critical" ? "#ef4444" : "#10b981"}
              strokeWidth="3"
              points={consumptionPoints}
            />
          </svg>
        </div>

        <AnimatePresence>
          {state === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-amber-400/70 bg-amber-900/30 text-center text-[9px] font-bold uppercase leading-tight text-amber-100 shadow-[0_0_32px_rgba(251,191,36,0.35)]"
            >
              Fé pública
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {state === "critical" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-black/55"
            >
              <div className="-rotate-12 rounded border-2 border-red-600 bg-black px-8 py-3 font-mono text-sm font-bold uppercase tracking-[0.3em] text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                [ ACESSO BLOQUEADO - AUDITORIA REQUERIDA ]
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Operational6040Workspace>
  );
}

function staticWarnHash(): string {
  return "ff" + generateMockHash().slice(2);
}
