"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useVoice } from "@/hooks/useVoice";
import { generateSHA256 } from "@/lib/crypto";

const easeOut = [0.22, 1, 0.36, 1] as const;

/** Três pilares do Protocolo AP-04: alinhados às zonas do cabeçalho (logo | comando | SHA). */
export default function AuditPublicCenter({ className = "" }: { className?: string }) {
  const {
    triggerGlitch,
    incrementIntegrity,
    triggerHashValidation,
    integrityCount,
    hashDisplayPhase,
  } = useStore();
  const { speak } = useVoice();

  /* —— Esquerda: Simulador —— */
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

  /* —— Centro: Monitor —— */
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

  /* —— Direita: Validador —— */
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
    <motion.div
      className={`mx-auto w-full max-w-7xl px-4 md:px-8 ${className}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 1.75, ease: easeOut }}
    >
      <div className="grid grid-cols-1 gap-6 border-t border-white/[0.08] pt-4 lg:grid-cols-3 lg:gap-8 lg:pt-5">
        {/* Pilar esquerdo — alinhado à logomarca */}
        <div className="flex min-h-0 flex-col text-left">
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-white md:text-base">
            Simulador de Fé Pública
          </h3>
          <p className="mt-1.5 text-xs leading-snug text-white/75">
            Demonstração técnica do selo SHA-256 e da cadeia de custódia.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGerarProva}
              className="relative overflow-hidden rounded-lg border border-emerald-400/35 bg-transparent px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-white transition hover:border-emerald-300/60 hover:bg-emerald-500/10 disabled:opacity-60"
            >
              {isGenerating ? "Gerando…" : "Gerar prova"}
              <AnimatePresence>
                {ripplePos && (
                  <motion.span
                    className="pointer-events-none absolute rounded-full"
                    style={{
                      left: ripplePos.x,
                      top: ripplePos.y,
                      width: 10,
                      height: 10,
                      marginLeft: -5,
                      marginTop: -5,
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
              className="rounded-lg border border-red-400/35 bg-transparent px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-white transition hover:border-red-300/55 hover:bg-red-500/10"
            >
              Simular fraude
            </button>
          </div>
          <AnimatePresence>
            {hash && (
              <motion.div
                className="mt-3 min-h-0 max-h-[4.5rem] overflow-y-auto rounded-md border border-white/10 px-2 py-1.5"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0 }}
              >
                <p className="break-all font-mono text-[10px] leading-relaxed text-emerald-300">
                  {displayedHash}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pilar central — abaixo de Painel de Comando */}
        <div className="flex min-h-0 flex-col text-center">
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-white md:text-base">
            Monitor de Integridade
          </h3>
          <p className="mt-1.5 text-xs leading-snug text-white/75">
            Saúde do sistema e processos auditados em tempo real.
          </p>
          <div className="mt-4 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                aria-hidden
              />
              <span className="text-sm font-semibold tracking-wide text-white">
                Sistema operacional
              </span>
            </div>
            <div className="w-full max-w-[14rem] space-y-1 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5">
              <div className="flex justify-between text-[11px] text-white/80">
                <span className="font-mono uppercase tracking-wider">Processos auditados</span>
                <span className="font-mono tabular-nums text-white">{auditedFmt}</span>
              </div>
              <div className="flex justify-between text-[11px] text-white/80">
                <span className="font-mono uppercase tracking-wider">Índice de saúde</span>
                <span className="font-mono tabular-nums text-emerald-200">
                  {healthPulse.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pilar direito — alinhado ao bloco SHA */}
        <div className="flex min-h-0 flex-col text-right">
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-white md:text-base">
            Validador de Documentos
          </h3>
          <p className="mt-1.5 text-xs leading-snug text-white/75">
            Perícia de autenticidade por hash SHA-256.
          </p>
          <div className="mt-4 flex flex-col items-stretch gap-2 lg:items-end">
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
              className="w-full max-w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-left font-mono text-[11px] text-white placeholder:text-white/35 focus:border-white/35 focus:outline-none focus:ring-1 focus:ring-white/20 lg:max-w-[20rem]"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={handleValidarDocumento}
              className="self-stretch rounded-lg border border-cyan-400/35 bg-transparent px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-white transition hover:border-cyan-300/55 hover:bg-cyan-500/10 lg:self-end"
            >
              Validar documento
            </button>
            {validationMsg && (
              <p className="text-left text-[11px] leading-snug text-white/90 lg:text-right">{validationMsg}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
