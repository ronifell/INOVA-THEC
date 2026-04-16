"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import AuditPanelPrimary from "./AuditPanelPrimary";
import AuditPanelExtension from "./AuditPanelExtension";

const easeOut = [0.22, 1, 0.36, 1] as const;

/**
 * Carrossel de Auditoria — dois painéis 3×3, alinhados à faixa SIG-FROTA … SIG-AMBIENTAL.
 * Espaçamento via classes globais (% / vmin), sem âncoras fix em px na barra de navegação.
 */
export default function AuditCarousel({ className = "" }: { className?: string }) {
  const { themeColor, triggerHashValidation } = useStore();
  const [slide, setSlide] = useState(0);

  const goPrev = useCallback(() => {
    triggerHashValidation();
    setSlide((s) => (s <= 0 ? 1 : 0));
  }, [triggerHashValidation]);

  const goNext = useCallback(() => {
    triggerHashValidation();
    setSlide((s) => (s >= 1 ? 0 : 1));
  }, [triggerHashValidation]);

  const goTo = useCallback(
    (i: number) => {
      triggerHashValidation();
      setSlide(i);
    },
    [triggerHashValidation]
  );

  return (
    <motion.div
      className={`audit-carousel-root flex min-h-0 flex-1 flex-col ${className}`}
      initial={{ opacity: 0, y: "1.2vmin" }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 1.75, ease: easeOut }}
    >
      <div className="audit-carousel-top flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="audit-carousel-track flex min-h-0 flex-1 flex-col">
          <motion.div
            className="flex h-full min-h-0"
            style={{ width: "200%" }}
            initial={false}
            animate={{ x: slide === 0 ? "0%" : "-50%" }}
            transition={{ duration: 0.48, ease: easeOut }}
          >
            <div className="flex h-full min-h-0 min-w-0 w-1/2 shrink-0 flex-col overflow-hidden">
              <AuditPanelPrimary />
            </div>
            <div className="flex h-full min-h-0 min-w-0 w-1/2 shrink-0 flex-col overflow-hidden">
              <AuditPanelExtension />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="audit-carousel-controls" aria-label="Navegação do carrossel de auditoria">
        <div className="audit-carousel-nav-left flex shrink-0 justify-start">
          <motion.button
            type="button"
            aria-label="Painel anterior de ferramentas"
            className="audit-carousel-nav-btn glass cursor-pointer text-white/85 shadow-lg"
            initial={{ opacity: 0, x: "-1.2vmin" }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2, duration: 0.4, ease: easeOut }}
            whileHover={{
              scale: 1.05,
              boxShadow: `0 0 min(20px, 3vmin) ${themeColor}30`,
            }}
            whileTap={{ scale: 0.95 }}
            onClick={goPrev}
          >
            <motion.span
              className="inline-block"
              style={{ fontSize: "min(1.35vmin, 1vw)" }}
              animate={{ x: [0, "-0.35vmin", 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ←
            </motion.span>
            <span className="audit-carousel-nav-label font-mono tracking-wider text-white/60">PAINEL 1</span>
          </motion.button>
        </div>

        <div className="audit-carousel-dots flex justify-center gap-[min(2.5%,2vmin)]">
          <button
            type="button"
            aria-label="Ferramentas principais"
            aria-current={slide === 0 ? "true" : undefined}
            onClick={() => goTo(0)}
            className={`audit-carousel-dot transition ${
              slide === 0
                ? "bg-white/90 shadow-[0_0_0.55vmin_rgba(255,255,255,0.45)]"
                : "bg-white/25 hover:bg-white/45"
            }`}
          />
          <button
            type="button"
            aria-label="Extensão de auditoria"
            aria-current={slide === 1 ? "true" : undefined}
            onClick={() => goTo(1)}
            className={`audit-carousel-dot transition ${
              slide === 1
                ? "bg-white/90 shadow-[0_0_0.55vmin_rgba(255,255,255,0.45)]"
                : "bg-white/25 hover:bg-white/45"
            }`}
          />
        </div>

        <div className="audit-carousel-nav-right flex shrink-0 justify-end">
          <motion.button
            type="button"
            aria-label="Próximo painel de ferramentas"
            className="audit-carousel-nav-btn glass cursor-pointer text-white/85 shadow-lg"
            initial={{ opacity: 0, x: "1.2vmin" }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2, duration: 0.4, ease: easeOut }}
            whileHover={{
              scale: 1.05,
              boxShadow: `0 0 min(20px, 3vmin) ${themeColor}30`,
            }}
            whileTap={{ scale: 0.95 }}
            onClick={goNext}
          >
            <span className="audit-carousel-nav-label font-mono tracking-wider text-white/60">PAINEL 2</span>
            <motion.span
              className="inline-block"
              style={{ fontSize: "min(1.35vmin, 1vw)" }}
              animate={{ x: [0, "0.35vmin", 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
