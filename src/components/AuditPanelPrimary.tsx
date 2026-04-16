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
      <div className="audit-panel-stack-tight min-h-0 text-left">
        <h3 className="font-bold uppercase tracking-[0.18em] text-white [font-size:min(1.35vmin,1.05vw)] md:[font-size:min(1.55vmin,1.12vw)]">
          Simulador de Fé Pública
        </h3>
        <p className="audit-body-copy">
          Demonstração técnica do selo SHA-256 e da cadeia de custódia.
        </p>
        <div className="flex flex-wrap [gap:min(3%,2.5vmin)]">
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
              className="min-h-0 max-h-[min(22vh,35%)] overflow-hidden rounded-xl border-2 border-white/12 bg-white/[0.02] [padding:min(3%,2.6vmin)] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_min(0.5vmin,5px)_min(1.8vmin,16px)_rgba(0,0,0,0.2)]"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0 }}
            >
              <p className="line-clamp-4 break-all font-mono leading-relaxed text-emerald-300 [font-size:min(1.28vmin,0.98vw)] md:[font-size:min(1.35vmin,1.02vw)]">
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
        <p className="audit-body-copy">
          Saúde do sistema e processos auditados em tempo real.
        </p>
        <div className="flex flex-col items-center [gap:min(3.8%,3.3vmin)]">
          <div className="flex items-center [gap:min(2.8%,2.3vmin)]">
            <span
              className="animate-pulse rounded-full bg-emerald-400 shadow-[0_0_min(12px,1.6vmin)_rgba(52,211,153,0.85)] [height:min(1.45vmin,1.15vw)] [width:min(1.45vmin,1.15vw)]"
              aria-hidden
            />
            <span className="font-semibold tracking-wide text-white [font-size:min(1.42vmin,1.1vw)] md:[font-size:min(1.52vmin,1.14vw)]">
              Sistema operacional
            </span>
          </div>
          <div className="audit-card-inner space-y-[min(2.2%,2vmin)] rounded-xl border-2 border-white/12 bg-white/[0.04]">
            <div className="flex justify-between text-white/85 [font-size:min(1.32vmin,1.02vw)] md:[font-size:min(1.4vmin,1.08vw)]">
              <span className="font-mono uppercase tracking-wider">Processos auditados</span>
              <span className="font-mono tabular-nums font-semibold text-white">{auditedFmt}</span>
            </div>
            <div className="flex justify-between text-white/85 [font-size:min(1.32vmin,1.02vw)] md:[font-size:min(1.4vmin,1.08vw)]">
              <span className="font-mono uppercase tracking-wider">Índice de saúde</span>
              <span className="font-mono tabular-nums font-semibold text-emerald-200">
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
        <p className="audit-body-copy">
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
            <p className="text-left leading-snug text-white/92 [font-size:min(1.28vmin,0.98vw)] md:[font-size:min(1.35vmin,1.02vw)] lg:text-right">
              {validationMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
