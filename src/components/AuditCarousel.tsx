"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import AuditPanelPrimary from "./AuditPanelPrimary";
import AuditPanelExtension from "./AuditPanelExtension";

const easeOut = [0.22, 1, 0.36, 1] as const;

/** Seta com ponta (triângulo) e cauda (haste) — aponta para a esquerda */
function ArrowLeftHeadIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M2 12L9 5.5 9 8.5H22v7H9v3L2 12z" />
    </svg>
  );
}

/** Seta com ponta e cauda — aponta para a direita */
function ArrowRightHeadIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12L15 5.5 15 8.5H2v7H15v3L22 12z" />
    </svg>
  );
}

/**
 * Carrossel de Auditoria — dois painéis 3×3, alinhados à faixa SIG-FROTA … SIG-AMBIENTAL.
 */
export default function AuditCarousel({ className = "" }: { className?: string }) {
  const { triggerHashValidation } = useStore();
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
      <div className="audit-carousel-top relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="audit-carousel-track flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
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

        <div className="audit-carousel-side-nav pointer-events-none absolute inset-0 z-20 flex items-center justify-between">
          <div className="pointer-events-auto flex shrink-0 items-center pl-[min(1.1%,1.1vmin)]">
            <motion.button
              type="button"
              aria-label="Painel anterior — ferramentas principais"
              className="glass flex items-center justify-center rounded-full px-[min(2.6%,2.4vmin)] py-[min(2.4%,2.1vmin)] text-white/90 shadow-none transition hover:bg-white/[0.08]"
              initial={{ opacity: 0, x: "-0.6vmin" }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2, duration: 0.4, ease: easeOut }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              onClick={goPrev}
            >
              <ArrowLeftHeadIcon className="h-[min(3.75vmin,3.2vw)] w-[min(3.75vmin,3.2vw)]" />
            </motion.button>
          </div>
          <div className="pointer-events-auto flex shrink-0 items-center pr-[min(1.1%,1.1vmin)]">
            <motion.button
              type="button"
              aria-label="Próximo painel — extensão de auditoria"
              className="glass flex items-center justify-center rounded-full px-[min(2.6%,2.4vmin)] py-[min(2.4%,2.1vmin)] text-white/90 shadow-none transition hover:bg-white/[0.08]"
              initial={{ opacity: 0, x: "0.6vmin" }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2, duration: 0.4, ease: easeOut }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              onClick={goNext}
            >
              <ArrowRightHeadIcon className="h-[min(3.75vmin,3.2vw)] w-[min(3.75vmin,3.2vw)]" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="audit-carousel-controls" aria-label="Navegação do carrossel de auditoria">
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
      </div>

    </motion.div>
  );
}
