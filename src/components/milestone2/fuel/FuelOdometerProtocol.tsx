"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const [capturedName, setCapturedName] = useState<string | null>(null);
  const refCapture = useRef<HTMLInputElement>(null);

  const assessImageQuality = useCallback(async (file: File) => {
    const src = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = () => reject(new Error("image-load-failed"));
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

  const handleCapture = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;
      setCapturedName(file.name);
      const ok = await assessImageQuality(file);
      if (!ok) {
        setState("warn");
        setLocked(false);
        setHash(staticWarnHash());
        return;
      }
      startProcessing();
    },
    [assessImageQuality, startProcessing]
  );

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
      title="PROTOCOLO DE MOVIMENTAÇÃO: Auditoria de Hodômetro e Métrica de Desempenho"
      subtitle="Validação da materialidade da rodagem com trilha pericial AP-04"
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
          <input
            ref={(el) => {
              refCapture.current = el;
            }}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => void handleCapture(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => refCapture.current?.click()}
            className="rounded-lg border border-emerald-500/45 bg-emerald-500/10 px-3 py-2 text-[11px] font-mono text-emerald-100"
          >
            Capturar hodômetro {capturedName ? `· ${capturedName.slice(0, 16)}` : ""}
          </button>
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
              setLocked(false);
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
              setLocked(false);
              setHash("aa0000" + generateMockHash().slice(8));
            }}
            className="rounded-lg border border-red-500/40 px-3 py-2 text-[11px] font-mono text-red-200"
          >
            4 · Vermelho (fraude)
          </button>
        </div>

        <div className="grid min-h-0 gap-[clamp(0.5rem,2vh,1rem)] lg:grid-cols-2 lg:items-stretch">
          <div
            className={`relative flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-black/50 ${
              state === "critical" ? "fuel-glitch-img" : ""
            }`}
          >
            <div className="relative flex min-h-0 w-full flex-1 flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-black p-[clamp(0.5rem,3%,1rem)]">
              <span className="font-mono text-3xl text-emerald-400/90">48372</span>
              {(state === "processing" || state === "success") && (
                <motion.div
                  className="pointer-events-none absolute inset-x-[10%] top-[15%] h-[12%] bg-emerald-400/35"
                  style={{ boxShadow: "0 0 16px rgba(0,255,65,0.75)" }}
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

          <div className="flex min-h-0 min-w-0 flex-col">
            {state === "processing" && (
              <TypewriterLines
                key="p"
                active
                lines={["> EXECUTANDO PROTOCOLO AP-04..."]}
                tone="green"
              />
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
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-amber-300"
                  style={{ left: `${30 + i * 18}%`, top: `${18 + i * 8}%` }}
                  animate={{ opacity: [0, 1, 0], y: [0, -8, -14] }}
                  transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
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
