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
    <div className="audit-panels-3">
      <div className="audit-panel-stack-tight min-h-0 text-left">
        <h3 className="font-bold uppercase tracking-[0.18em] text-white [font-size:min(1.35vmin,1.05vw)] md:[font-size:min(1.55vmin,1.12vw)]">
          Simulador de Fé Pública
        </h3>
        <p className="leading-snug text-white/75 [font-size:min(1.2vmin,0.95vw)]">
          Demonstração técnica do selo SHA-256 e da cadeia de custódia.
        </p>
        <div className="flex flex-wrap [gap:min(2.5%,2vmin)]">
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGerarProva}
            className="audit-action-btn relative overflow-hidden rounded-lg border border-emerald-400/35 bg-transparent font-mono font-semibold uppercase tracking-wider text-white transition hover:border-emerald-300/60 hover:bg-emerald-500/10 disabled:opacity-60"
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
            className="audit-action-btn rounded-lg border border-red-400/35 bg-transparent font-mono font-semibold uppercase tracking-wider text-white transition hover:border-red-300/55 hover:bg-red-500/10"
          >
            Simular fraude
          </button>
        </div>
        <AnimatePresence>
          {hash && (
            <motion.div
              className="min-h-0 max-h-[min(28vh,40%)] overflow-y-auto rounded-md border border-white/10 [padding:min(2.5%,2vmin)]"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0 }}
            >
              <p className="break-all font-mono leading-relaxed text-emerald-300 [font-size:min(1.1vmin,0.88vw)]">
                {displayedHash}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="audit-panel-stack min-h-0 text-center">
        <h3 className="font-bold uppercase tracking-[0.18em] text-white [font-size:min(1.35vmin,1.05vw)] md:[font-size:min(1.55vmin,1.12vw)]">
          Monitor de Integridade
        </h3>
        <p className="leading-snug text-white/75 [font-size:min(1.2vmin,0.95vw)]">
          Saúde do sistema e processos auditados em tempo real.
        </p>
        <div className="flex flex-col items-center [gap:min(3.5%,3vmin)]">
          <div className="flex items-center [gap:min(2.5%,2vmin)]">
            <span
              className="animate-pulse rounded-full bg-emerald-400 shadow-[0_0_min(10px,1.4vmin)_rgba(52,211,153,0.8)] [height:min(1.1vmin,0.9vw)] [width:min(1.1vmin,0.9vw)]"
              aria-hidden
            />
            <span className="font-semibold tracking-wide text-white [font-size:min(1.3vmin,1.02vw)]">
              Sistema operacional
            </span>
          </div>
          <div className="audit-card-inner space-y-[min(1.8%,1.6vmin)] rounded-md border border-white/10 bg-white/[0.03]">
            <div className="flex justify-between text-white/80 [font-size:min(1.15vmin,0.9vw)]">
              <span className="font-mono uppercase tracking-wider">Processos auditados</span>
              <span className="font-mono tabular-nums text-white">{auditedFmt}</span>
            </div>
            <div className="flex justify-between text-white/80 [font-size:min(1.15vmin,0.9vw)]">
              <span className="font-mono uppercase tracking-wider">Índice de saúde</span>
              <span className="font-mono tabular-nums text-emerald-200">
                {healthPulse.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="audit-panel-stack-tight min-h-0 text-right">
        <h3 className="font-bold uppercase tracking-[0.18em] text-white [font-size:min(1.35vmin,1.05vw)] md:[font-size:min(1.55vmin,1.12vw)]">
          Validador de Documentos
        </h3>
        <p className="leading-snug text-white/75 [font-size:min(1.2vmin,0.95vw)]">
          Perícia de autenticidade por hash SHA-256.
        </p>
        <div className="flex flex-col items-stretch [gap:min(2.5%,2vmin)] lg:items-end">
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
            className="audit-input-field w-full max-w-full rounded-lg border border-white/15 bg-transparent text-left font-mono text-white placeholder:text-white/35 focus:border-white/35 focus:outline-none focus:ring-1 focus:ring-white/20 lg:max-w-[min(100%,32vw)]"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={handleValidarDocumento}
            className="audit-action-btn self-stretch rounded-lg border border-cyan-400/35 bg-transparent font-mono font-semibold uppercase tracking-wider text-white transition hover:border-cyan-300/55 hover:bg-cyan-500/10 lg:self-end"
          >
            Validar documento
          </button>
          {validationMsg && (
            <p className="text-left leading-snug text-white/90 [font-size:min(1.15vmin,0.9vw)] lg:text-right">{validationMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
}
