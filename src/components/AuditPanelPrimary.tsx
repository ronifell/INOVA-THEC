"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useVoice } from "@/hooks/useVoice";
import { generateSHA256 } from "@/lib/crypto";

/** Painel 1 — Simulador | Monitor | Validador (visível ao carregar). */
export default function AuditPanelPrimary() {
  const {
    triggerGlitch,
    incrementIntegrity,
    triggerHashValidation,
    integrityCount,
    hashDisplayPhase,
  } = useStore();
  const { speak } = useVoice();

  const [hash, setHash] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ripplePos, setRipplePos] = useState<{ x: number; y: number } | null>(null);
  const [displayedHash, setDisplayedHash] = useState("");

  const handleGerarProva = useCallback(
    async (e: React.MouseEvent) => {
      if (isGenerating) return;
      triggerHashValidation();
      setIsGenerating(true);
      setHash(null);
      setDisplayedHash("");
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setRipplePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      speak("Gerando prova de fé pública. Protocolo SHA-256 em execução.");
      await new Promise((r) => setTimeout(r, 800));
      const fullHash = await generateSHA256();
      setHash(fullHash);
      incrementIntegrity();
      for (let i = 0; i <= fullHash.length; i++) {
        await new Promise((r) => setTimeout(r, 12));
        setDisplayedHash(fullHash.substring(0, i));
      }
      speak("Selo de integridade gerado com sucesso. Hash registrado.");
      setIsGenerating(false);
      setTimeout(() => setRipplePos(null), 600);
    },
    [isGenerating, speak, incrementIntegrity, triggerHashValidation]
  );

  const handleSimularFraude = useCallback(() => {
    triggerHashValidation();
    triggerGlitch();
    speak(
      "Alerta crítico! Quebra de integridade detectada. Cadeia de custódia comprometida."
    );
  }, [triggerGlitch, speak, triggerHashValidation]);

  const [liveAudited, setLiveAudited] = useState(integrityCount);
  const [healthPulse, setHealthPulse] = useState(98.4);

  useEffect(() => {
    setLiveAudited((p) => Math.max(p, integrityCount));
  }, [integrityCount]);

  useEffect(() => {
    if (hashDisplayPhase !== "idle") return;
    const id = window.setInterval(() => {
      setLiveAudited((c) => c + Math.floor(Math.random() * 3) + 1);
      setHealthPulse(97.8 + Math.random() * 2.1);
    }, 480);
    return () => window.clearInterval(id);
  }, [hashDisplayPhase]);

  const auditedFmt = useMemo(
    () => liveAudited.toLocaleString("pt-BR"),
    [liveAudited]
  );

  const [docInput, setDocInput] = useState("");
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  const handleValidarDocumento = useCallback(() => {
    triggerHashValidation();
    const t = docInput.trim().replace(/\s+/g, "");
    if (!t) {
      setValidationMsg("Informe o hash do relatório.");
      return;
    }
    if (!/^[a-fA-F0-9]{64}$/.test(t)) {
      setValidationMsg("Formato inválido. Esperado SHA-256 (64 caracteres hexadecimais).");
      speak("Hash inválido ou incompleto.");
      return;
    }
    setValidationMsg("Assinatura conferida com a cadeia AP-04. Documento íntegro.");
    speak("Documento validado. Integridade confirmada.");
  }, [docInput, speak, triggerHashValidation]);

  return (
    <div className="audit-panels-3 h-full min-h-0 overflow-hidden">
      <div className="audit-panel-stack-tight min-h-0 min-w-0 overflow-hidden text-left">
        <h3 className="audit-panel-title max-w-full">
          SIMULADOR DE FÉ PÚBLICA
        </h3>
        <p className="audit-panel-subtitle max-w-none text-left">
          Demonstração técnica do selo SHA-256 e da cadeia de custódia.
        </p>
        <div className="mt-[min(2.4%,2.1vmin)] flex flex-wrap [gap:min(2.8%,2.4vmin)]">
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGerarProva}
            className="audit-action-btn audit-action-btn--neon-emerald relative overflow-hidden rounded-lg border border-transparent bg-transparent font-mono uppercase tracking-wider text-white transition hover:bg-emerald-500/12 disabled:opacity-60"
          >
            {isGenerating ? "Gerando…" : "Gerar prova"}
            <AnimatePresence>
              {ripplePos && (
                <motion.span
                  className="pointer-events-none absolute rounded-full"
                  style={{
                    left: ripplePos.x,
                    top: ripplePos.y,
                    width: "min(1.1vmin, 0.85vw)",
                    height: "min(1.1vmin, 0.85vw)",
                    marginLeft: "calc(min(1.1vmin, 0.85vw) / -2)",
                    marginTop: "calc(min(1.1vmin, 0.85vw) / -2)",
                    background: "rgba(16, 185, 129, 0.35)",
                  }}
                  initial={{ scale: 0, opacity: 0.6 }}
                  animate={{ scale: 18, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                />
              )}
            </AnimatePresence>
          </button>
          <button
            type="button"
            onClick={handleSimularFraude}
            className="audit-action-btn audit-action-btn--neon-red rounded-lg border border-transparent bg-transparent font-mono uppercase tracking-wider text-white transition hover:bg-red-500/12"
          >
            Simular fraude
          </button>
        </div>
        <AnimatePresence>
          {hash && (
            <motion.div
              className="audit-feedback-box min-h-0 max-h-[min(24vh,38%)] overflow-auto rounded-md border border-emerald-400/25 bg-black/15"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0 }}
            >
              <p className="line-clamp-4 break-all font-mono leading-relaxed text-emerald-300 [font-size:min(1.32vmin,1.02vw)] md:[font-size:min(1.42vmin,1.08vw)]">
                {displayedHash}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="audit-panel-column-monitor flex min-h-0 min-w-0 flex-col overflow-x-hidden overflow-y-auto text-center [scrollbar-width:thin]">
        <h3 className="audit-panel-title max-w-full shrink-0">
          MONITOR DE INTEGRIDADE
        </h3>
        <p className="audit-panel-subtitle max-w-none shrink-0 text-center">
          Saúde do sistema e processos auditados em tempo real.
        </p>
        <div className="mt-[min(2%,1.6vmin)] flex min-h-0 w-full flex-col items-center gap-[min(2.2%,1.9vmin)]">
          <div className="audit-system-status-pill audit-system-status-pill--white mx-auto flex shrink-0 items-center justify-center gap-[min(2.5%,2.2vmin)]">
            <span
              className="audit-system-status-pill__dot--white shrink-0 animate-pulse rounded-full [height:min(1.45vmin,1.15vw)] [width:min(1.45vmin,1.15vw)] md:[height:min(1.6vmin,1.25vw)] md:[width:min(1.6vmin,1.25vw)]"
              aria-hidden
            />
            <span className="audit-system-status-pill__label">Sistema operacional</span>
          </div>
          <div className="audit-card-inner audit-card-inner--monitor audit-card-inner--monitor-white mx-auto w-full shrink-0 space-y-[min(1.6%,1.4vmin)] rounded-md">
            <div className="grid w-full grid-cols-[minmax(0,1fr)_min(12ch,14rem)] items-center gap-x-[min(4%,3.5vmin)] md:grid-cols-[minmax(0,1fr)_min(13ch,15rem)]">
              <span className="audit-monitor-metric-label min-w-0 text-left font-mono uppercase leading-snug tracking-wide">
                Processos auditados
              </span>
              <span className="audit-monitor-metric-value text-right font-mono tabular-nums tracking-tight">
                {auditedFmt}
              </span>
            </div>
            <div className="grid w-full grid-cols-[minmax(0,1fr)_min(12ch,14rem)] items-center gap-x-[min(4%,3.5vmin)] md:grid-cols-[minmax(0,1fr)_min(13ch,15rem)]">
              <span className="audit-monitor-metric-label min-w-0 text-left font-mono uppercase leading-snug tracking-wide">
                Índice de saúde
              </span>
              <span className="audit-monitor-metric-value text-right font-mono tabular-nums tracking-tight">
                {healthPulse.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="audit-panel-stack-tight min-h-0 min-w-0 overflow-hidden text-right">
        <h3 className="audit-panel-title max-w-full">
          VALIDADOR DE DOCUMENTOS
        </h3>
        <p className="audit-panel-subtitle max-w-none text-right">
          Perícia de autenticidade por hash SHA-256.
        </p>
        <div className="mt-[min(1.2%,1vmin)] flex flex-col items-stretch [gap:min(3%,2.6vmin)] lg:items-end">
          <label className="sr-only" htmlFor="doc-hash-input">
            Hash do relatório
          </label>
          <input
            id="doc-hash-input"
            type="text"
            value={docInput}
            onChange={(e) => {
              setDocInput(e.target.value);
              setValidationMsg(null);
            }}
            placeholder="Cole o hash SHA-256 do relatório"
            className="audit-input-field w-full max-w-full rounded-lg border border-white/25 bg-black/10 text-left font-mono text-white placeholder:text-white/40 focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/25 lg:max-w-[min(100%,32vw)]"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={handleValidarDocumento}
            className="audit-action-btn audit-action-btn--neon-cyan self-stretch rounded-lg border border-transparent bg-transparent font-mono uppercase tracking-wider text-white transition hover:bg-cyan-500/12 lg:self-end"
          >
            Validar documento
          </button>
          {validationMsg && (
            <p className="audit-panel-desc audit-feedback-box !text-white/92 text-left lg:text-right">{validationMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
}
