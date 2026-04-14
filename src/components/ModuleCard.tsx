"use client";

import { useCallback, useRef, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Module } from "@/lib/modules";
import { useStore } from "@/store/useStore";
import { useVoice } from "@/hooks/useVoice";

interface ModuleCardProps {
  module: Module;
  index: number;
}

export default function ModuleCard({ module, index }: ModuleCardProps) {
  const setActiveModule = useStore((s) => s.setActiveModule);
  const triggerLiquidTransition = useStore((s) => s.triggerLiquidTransition);
  const triggerHashValidation = useStore((s) => s.triggerHashValidation);
  const { speak } = useVoice();
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLButtonElement | null>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const iconX = useMotionValue(0);
  const iconY = useMotionValue(0);
  /* Atraso ~100ms no tilt: mola mais “pesada” */
  const iconXSpring = useSpring(iconX, { stiffness: 130, damping: 22, mass: 0.55 });
  const iconYSpring = useSpring(iconY, { stiffness: 130, damping: 22, mass: 0.55 });
  const rotateXSpring = useSpring(rotateX, { stiffness: 115, damping: 22, mass: 0.55 });
  const rotateYSpring = useSpring(rotateY, { stiffness: 115, damping: 22, mass: 0.55 });

  const handleHover = useCallback(() => {
    hoverTimeout.current = setTimeout(() => {
      speak(module.voiceText);
    }, 400);
  }, [speak, module.voiceText]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    triggerHashValidation();
    triggerLiquidTransition(e.clientX, e.clientY, module.color);
    setActiveModule(module.id, module.color, module.colorRgb);
    speak(module.voiceText);
  }, [setActiveModule, module, speak, triggerHashValidation, triggerLiquidTransition]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width - 0.5) * 2;
    const py = (y / rect.height - 0.5) * 2;
    rotateX.set(-py * 7);
    rotateY.set(px * 7);
    iconX.set(px * 14);
    iconY.set(py * 10);
  }, [iconX, iconY, rotateX, rotateY]);

  const resetParallax = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    iconX.set(0);
    iconY.set(0);
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
  }, [iconX, iconY, rotateX, rotateY]);

  return (
    <motion.button
      ref={cardRef}
      className="relative group cursor-pointer [transform-style:preserve-3d]"
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      style={{ rotateX: rotateXSpring, rotateY: rotateYSpring, transformPerspective: 700 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ scale: 1.06, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={handleHover}
      onHoverEnd={resetParallax}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetParallax}
      onClick={handleClick}
    >
      <div
        className={`relative rounded-2xl p-6 h-full transition-all duration-500 module-card-float-${index % 3}`}
        style={
          {
            "--card-rgb": module.colorRgb,
            background: `rgba(255, 255, 255, 0.04)`,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: `1px solid rgba(${module.colorRgb}, 0.15)`,
          } as CSSProperties
        }
      >
        {/* Blinking neon border glow (module color) — --card-rgb repeated here so animation always resolves */}
        <div
          className="module-card-border-blink absolute inset-0 rounded-2xl pointer-events-none z-[1]"
          style={{ "--card-rgb": module.colorRgb } as CSSProperties}
          aria-hidden
        />

        {/* Neon glow core */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            boxShadow: `inset 0 0 30px rgba(${module.colorRgb}, 0.1), 0 0 40px rgba(${module.colorRgb}, 0.15), 0 0 80px rgba(${module.colorRgb}, 0.05)`,
          }}
        />

        {/* Top glow bar */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(90deg, transparent, ${module.color}, transparent)`,
            boxShadow: `0 0 10px ${module.color}`,
          }}
        />

        {/* Icon sphere + outward color waves */}
        <motion.div
          className="relative mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center z-[2]"
          style={{ x: iconXSpring, y: iconYSpring }}
        >
          {/* Single expanding ring; next wave after ~3s idle (see globals.css) */}
          <span
            className="module-icon-wave-ring z-0"
            style={{
              borderColor: `rgba(${module.colorRgb}, 0.55)`,
              boxShadow: `0 0 14px rgba(${module.colorRgb}, 0.35), inset 0 0 10px rgba(${module.colorRgb}, 0.12)`,
            }}
            aria-hidden
          />
          <div
            className="absolute inset-0 rounded-full transition-all duration-500 z-[1]"
            style={{
              background: `radial-gradient(circle, rgba(${module.colorRgb}, 0.22) 0%, transparent 70%)`,
              boxShadow: `0 0 15px rgba(${module.colorRgb}, 0.2)`,
            }}
          />
          <div
            className="absolute inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 z-[1]"
            style={{
              background: `radial-gradient(circle, rgba(${module.colorRgb}, 0.4) 0%, transparent 70%)`,
              boxShadow: `0 0 30px rgba(${module.colorRgb}, 0.4)`,
            }}
          />
          <motion.span
            className="relative text-2xl z-10"
            style={{ textShadow: `0 0 20px rgba(${module.colorRgb},0.45)` }}
          >
            {module.icon}
          </motion.span>
        </motion.div>

        {/* Title */}
        <h3
          className="text-sm font-bold tracking-wider text-center transition-colors duration-500 group-hover:text-white"
          style={{ color: `rgba(${module.colorRgb}, 0.9)` }}
        >
          {module.name}
        </h3>

        {/* Description */}
        <p className="mt-2 text-[11px] text-white/30 text-center leading-relaxed group-hover:text-white/50 transition-colors duration-500">
          {module.description}
        </p>

        {/* Status */}
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: module.isFullModule ? module.color : "#FCD34D",
              boxShadow: `0 0 4px ${module.isFullModule ? module.color : "#FCD34D"}`,
            }}
          />
          <span className="text-[9px] font-mono tracking-wider text-white/25">
            {module.isFullModule ? "OPERACIONAL" : "HOMOLOGAÇÃO"}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
