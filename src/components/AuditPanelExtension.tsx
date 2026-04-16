"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useVoice } from "@/hooks/useVoice";

/** Painel 2 — Rastreador | Certificador | Auditoria de backup (segunda página do carrossel). */
export default function AuditPanelExtension() {
  const { triggerHashValidation, incrementIntegrity } = useStore();
  const { speak } = useVoice();

  /* —— Rastreador de Cadeia —— */
  const [chainScan, setChainScan] = useState(-1);
  const [scanning, setScanning] = useState(false);
  const chainBlocks = useMemo(
    () => [
      { id: "Gênesis", h: "e3b0c4…" },
      { id: "AP-04", h: "7f91a2…" },
      { id: "Custódia", h: "4c22d8…" },
      { id: "Selo", h: "9a01fe…" },
    ],
    []
  );

  const runChainScan = useCallback(async () => {
    if (scanning) return;
    triggerHashValidation();
    setScanning(true);
    speak("Varredura da cadeia de custódia em execução.");
    for (let i = 0; i < chainBlocks.length; i++) {
      setChainScan(i);
      await new Promise((r) => setTimeout(r, 420));
    }
    setScanning(false);
    incrementIntegrity();
    speak("Cadeia íntegra. Elos verificados com sucesso.");
  }, [chainBlocks.length, incrementIntegrity, scanning, speak, triggerHashValidation]);

  /* —— Certificador de Timestamp —— */
  const [stampIssued, setStampIssued] = useState<string | null>(null);
  const [utcNow, setUtcNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setUtcNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const issueStamp = useCallback(() => {
    triggerHashValidation();
    const iso = new Date().toISOString();
    setStampIssued(iso);
    speak("Carimbo de tempo emitido. Sincronização UTC confirmada.");
  }, [speak, triggerHashValidation]);

  /* —— Auditoria de Backup —— */
  const [backupPct, setBackupPct] = useState(100);
  const [verifying, setVerifying] = useState(false);

  const runBackupAudit = useCallback(() => {
    if (verifying) return;
    triggerHashValidation();
    setVerifying(true);
    setBackupPct(0);
    speak("Iniciando auditoria de réplicas e checksums de backup.");
    let p = 0;
    const id = window.setInterval(() => {
      p += 9;
      if (p >= 100) {
        setBackupPct(100);
        window.clearInterval(id);
        setVerifying(false);
        speak("Redundância de backup validada. Réplicas consistentes.");
      } else {
        setBackupPct(p);
      }
    }, 140);
  }, [speak, triggerHashValidation, verifying]);

  return (
    <div className="audit-panels-3 h-full min-h-0 overflow-hidden [&>div]:min-h-0">
      {/* Coluna esquerda: lista ocupa o espaço flexível; botão sempre visível (nunca cortado pelo overflow) */}
      <div className="flex min-h-0 w-full min-w-0 flex-col text-left [gap:min(2%,1.8vmin)]">
        <h3 className="shrink-0 font-bold uppercase tracking-[0.18em] text-white [font-size:min(1.35vmin,1.05vw)] md:[font-size:min(1.55vmin,1.12vw)]">
          Rastreador de Cadeia
        </h3>
        <p className="audit-body-copy shrink-0">
          Verificação sequencial dos elos da custódia AP-04.
        </p>
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col [gap:min(2%,1.8vmin)]">
          <div className="min-h-0 flex-1 overflow-hidden rounded-xl border-2 border-white/12 bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_min(0.6vmin,6px)_min(2vmin,18px)_rgba(0,0,0,0.22)]">
            <div className="flex h-full max-h-full flex-col [gap:min(1.8%,1.55vmin)] [padding:min(2.8%,2.4vmin)]">
              {chainBlocks.map((b, i) => (
                <div
                  key={b.id}
                  className={`flex min-h-0 shrink-0 items-center justify-between [gap:min(2%,1.8vmin)] border-b border-white/[0.06] font-mono [padding-bottom:min(1.6%,1.4vmin)] [font-size:min(1.22vmin,0.95vw)] md:[font-size:min(1.3vmin,1vw)] last:border-0 last:pb-0 ${
                    scanning && chainScan === i ? "text-amber-200" : "text-white/70"
                  } ${
                    !scanning && chainScan === chainBlocks.length - 1 && i === chainBlocks.length - 1
                      ? "text-emerald-300/90"
                      : ""
                  }`}
                >
                  <span className="min-w-0 truncate uppercase tracking-wider">{b.id}</span>
                  <span className="shrink-0 tabular-nums text-emerald-300/90">{b.h}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            disabled={scanning}
            onClick={runChainScan}
            className="audit-action-btn z-10 w-full shrink-0 rounded-lg border border-amber-400/35 bg-transparent font-mono font-semibold uppercase tracking-wider text-white transition hover:border-amber-300/55 hover:bg-amber-500/10 disabled:opacity-50 sm:w-max sm:max-w-full"
          >
            {scanning ? "Varrendo…" : "Varredura de elos"}
          </button>
        </div>
      </div>

      <div className="audit-panel-stack flex h-full min-h-0 min-w-0 flex-col text-center">
        <h3 className="font-bold uppercase tracking-[0.18em] text-white [font-size:min(1.35vmin,1.05vw)] md:[font-size:min(1.55vmin,1.12vw)]">
          Certificador de Timestamp
        </h3>
        <p className="audit-body-copy">
          Carimbo temporal alinhado a UTC e protocolo de auditoria.
        </p>
        <div className="flex flex-col items-center [gap:min(2.9%,2.4vmin)]">
          <div className="audit-card-inner rounded-xl border-2 border-white/12 bg-white/[0.04] text-left">
            <p className="font-mono uppercase tracking-wider text-white/60 [font-size:min(1.18vmin,0.92vw)] md:[font-size:min(1.25vmin,0.98vw)]">
              Relógio de referência
            </p>
            <p className="mt-[min(2%,1.75vmin)] font-mono tabular-nums text-white [font-size:min(1.32vmin,1.02vw)] md:[font-size:min(1.42vmin,1.08vw)]">
              {utcNow.toLocaleString("pt-BR", { timeZone: "UTC" })} UTC
            </p>
          </div>
          <button
            type="button"
            onClick={issueStamp}
            className="audit-action-btn rounded-lg border border-violet-400/35 bg-transparent font-mono font-semibold uppercase tracking-wider text-white transition hover:border-violet-300/55 hover:bg-violet-500/10"
          >
            Emitir carimbo
          </button>
          <AnimatePresence>
            {stampIssued && (
              <motion.p
                initial={{ opacity: 0, y: "0.45vmin" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-[min(100%,92%)] text-center font-mono leading-snug text-violet-200/92 [font-size:min(1.2vmin,0.94vw)] md:[font-size:min(1.28vmin,1vw)]"
              >
                Selo RFC 3161 (simulado): {stampIssued}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="audit-panel-stack-tight flex h-full min-h-0 min-w-0 flex-col text-right">
        <h3 className="font-bold uppercase tracking-[0.18em] text-white [font-size:min(1.35vmin,1.05vw)] md:[font-size:min(1.55vmin,1.12vw)]">
          Auditoria de Backup
        </h3>
        <p className="audit-body-copy">
          Conferência de redundância e integridade das réplicas.
        </p>
        <div className="flex flex-col items-stretch [gap:min(2.9%,2.4vmin)] lg:items-end">
          <div className="audit-card-inner w-full rounded-xl border-2 border-white/12 bg-white/[0.04] lg:ml-auto">
            <div className="flex justify-between font-mono uppercase tracking-wider text-white/65 [font-size:min(1.22vmin,0.95vw)] md:[font-size:min(1.3vmin,1.02vw)]">
              <span>Verificação</span>
              <span className="tabular-nums font-semibold text-emerald-200">{backupPct}%</span>
            </div>
            <div className="mt-[min(2.8%,2.4vmin)] overflow-hidden rounded-full bg-white/12 [height:min(0.65vmin,0.52vw)]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500/80 to-emerald-400/90"
                animate={{ width: `${backupPct}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
              />
            </div>
            <p className="mt-[min(2.8%,2.4vmin)] text-left font-mono text-white/55 [font-size:min(1.15vmin,0.9vw)] md:[font-size:min(1.22vmin,0.96vw)]">
              SHA-256 cruzado em nós secundários • AP-04
            </p>
          </div>
          <button
            type="button"
            disabled={verifying}
            onClick={runBackupAudit}
            className="audit-action-btn self-stretch rounded-lg border border-cyan-400/35 bg-transparent font-mono font-semibold uppercase tracking-wider text-white transition hover:border-cyan-300/55 hover:bg-cyan-500/10 disabled:opacity-50 lg:self-end"
          >
            {verifying ? "Auditando…" : "Verificar redundância"}
          </button>
        </div>
      </div>
    </div>
  );
}
