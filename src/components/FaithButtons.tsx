"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useVoice } from "@/hooks/useVoice";
import { generateSHA256 } from "@/lib/crypto";

export default function FaithButtons() {
  const { triggerGlitch, incrementIntegrity, triggerHashValidation } = useStore();
  const { speak } = useVoice();
  const [hash, setHash] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [ripplePos, setRipplePos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [displayedHash, setDisplayedHash] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleGerarProva = useCallback(
    async (e: React.MouseEvent) => {
      if (isValidating) return;
      triggerHashValidation();
      setIsValidating(true);
      setHash(null);
      setDisplayedHash("");

      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setRipplePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });

      speak("Gerando prova de fé pública. Protocolo SHA-256 em execução.");

      await new Promise((r) => setTimeout(r, 800));

      const fullHash = await generateSHA256();
      setHash(fullHash);
      incrementIntegrity();

      for (let i = 0; i <= fullHash.length; i++) {
        await new Promise((r) => setTimeout(r, 15));
        setDisplayedHash(fullHash.substring(0, i));
      }

      speak("Selo de integridade gerado com sucesso. Hash registrado.");
      setIsValidating(false);
      setTimeout(() => setRipplePos(null), 600);
    },
    [isValidating, speak, incrementIntegrity, triggerHashValidation]
  );

  const handleSimularFraude = useCallback(() => {
    triggerHashValidation();
    triggerGlitch();
    speak(
      "Alerta crítico! Quebra de integridade detectada. Cadeia de custódia comprometida."
    );
  }, [triggerGlitch, speak, triggerHashValidation]);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-6">
      <h2 className="text-xs font-mono tracking-[0.3em] text-white/30 uppercase">
        Simulador de Fé Pública
      </h2>

      <div className="flex flex-wrap justify-center gap-4">
        {/* Gerar Prova Button */}
        <motion.button
          className={`relative overflow-hidden rounded-xl px-8 py-3.5 font-mono text-sm font-bold tracking-wider cursor-pointer ${isValidating ? "cursor-validating" : ""}`}
          style={{
            background:
              "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#10B981",
          }}
          whileHover={{
            boxShadow:
              "0 0 30px rgba(16, 185, 129, 0.3), inset 0 0 30px rgba(16, 185, 129, 0.05)",
            scale: 1.02,
          }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGerarProva}
          disabled={isValidating}
        >
          {isValidating ? "VALIDANDO..." : "⚡ GERAR PROVA"}

          {/* Ripple effect */}
          <AnimatePresence>
            {ripplePos && (
              <motion.span
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: ripplePos.x,
                  top: ripplePos.y,
                  width: 10,
                  height: 10,
                  marginLeft: -5,
                  marginTop: -5,
                  background: "rgba(16, 185, 129, 0.4)",
                }}
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 20, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>
        </motion.button>

        {/* Simular Fraude Button */}
        <motion.button
          className="relative overflow-hidden rounded-xl px-8 py-3.5 font-mono text-sm font-bold tracking-wider cursor-pointer"
          style={{
            background:
              "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#EF4444",
          }}
          whileHover={{
            boxShadow:
              "0 0 30px rgba(239, 68, 68, 0.3), inset 0 0 30px rgba(239, 68, 68, 0.05)",
            scale: 1.02,
          }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSimularFraude}
        >
          🔓 SIMULAR FRAUDE
        </motion.button>
      </div>

      {/* Hash Display */}
      <AnimatePresence>
        {hash && (
          <motion.div
            className="w-full max-w-2xl"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: "#10B981",
                    boxShadow: "0 0 6px #10B981",
                  }}
                />
                <span className="text-[10px] font-mono tracking-wider text-green-400/60">
                  SELO DE INTEGRIDADE AP-04
                </span>
              </div>
              <div
                className="font-mono text-xs break-all leading-relaxed"
                style={{
                  color: "#10B981",
                  textShadow: "0 0 10px rgba(16, 185, 129, 0.3)",
                }}
              >
                SHA-256: {displayedHash}
                <motion.span
                  className="inline-block w-[2px] h-[14px] ml-0.5 align-middle"
                  style={{ background: "#10B981" }}
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              </div>
              <div className="mt-2 text-[9px] font-mono text-white/20">
                Timestamp: {new Date().toISOString()} | Protocolo: AP-04 |
                Cadeia: GENESIS →{" "}
                {hash.substring(0, 8).toUpperCase()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
