"use client";

import { useCallback, useRef, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useVoice } from "@/hooks/useVoice";

export type PortalModuleCardProps = {
  /** Theme: hex e.g. #10B981 */
  color: string;
  /** Comma-separated RGB e.g. "16, 185, 129" */
  colorRgb: string;
  icon: string;
  title: string;
  description: string;
  /** Index for drop animation stagger and float phase (0|1|2) */
  index: number;
  /** OPERACIONAL vs HOMOLOGAÇÃO dot */
  isFullModule?: boolean;
  /** Narration on hover (optional) */
  voiceText?: string;
  /** Click handler; if omitted and `interactive` is false, renders as static panel */
  onClick?: () => void;
  /** When false, renders styled `div` (no button semantics) */
  interactive?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
};

/**
 * Same visuals as {@link ModuleCard}: glass sphere, neon border blink, icon wave ring, tilt parallax.
 * Use for Milestone hubs and any portal tile that must match the main dashboard cards.
 */
export default function PortalModuleCard({
  color,
  colorRgb,
  icon,
  title,
  description,
  index,
  isFullModule = true,
  voiceText,
  onClick,
  interactive = true,
  type = "button",
  disabled = false,
  className = "",
}: PortalModuleCardProps) {
  const { speak } = useVoice();
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const iconX = useMotionValue(0);
  const iconY = useMotionValue(0);
  const iconXSpring = useSpring(iconX, { stiffness: 130, damping: 22, mass: 0.55 });
  const iconYSpring = useSpring(iconY, { stiffness: 130, damping: 22, mass: 0.55 });
  const rotateXSpring = useSpring(rotateX, { stiffness: 115, damping: 22, mass: 0.55 });
  const rotateYSpring = useSpring(rotateY, { stiffness: 115, damping: 22, mass: 0.55 });

  const handleHover = useCallback(() => {
    if (!voiceText) return;
    hoverTimeout.current = setTimeout(() => {
      speak(voiceText);
    }, 400);
  }, [speak, voiceText]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = (x / rect.width - 0.5) * 2;
      const py = (y / rect.height - 0.5) * 2;
      rotateX.set(-py * 7);
      rotateY.set(px * 7);
      iconX.set(px * 14);
      iconY.set(py * 10);
    },
    [iconX, iconY, rotateX, rotateY]
  );

  const resetParallax = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    iconX.set(0);
    iconY.set(0);
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
  }, [iconX, iconY, rotateX, rotateY]);

  const dropOffset = -200;
  const dropDelay = index * 0.11;
  const dropDuration = 1.08;
  const impactY = 12;
  const easeFall: [number, number, number, number] = [0.55, 0, 1, 0.45];
  const easeSettle: [number, number, number, number] = [0.33, 1.15, 0.56, 1];

  const cardInner = (
    <>
      <div
        className={`relative flex h-full min-h-0 w-full flex-col rounded-[8%] p-[5%] text-[100%] transition-all duration-500 module-card-float-${index % 3}`}
        style={
          {
            "--card-rgb": colorRgb,
            background: `rgba(255, 255, 255, 0.04)`,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: `1px solid rgba(${colorRgb}, 0.15)`,
          } as CSSProperties
        }
      >
        <div
          className="module-card-border-blink pointer-events-none absolute inset-0 z-[1] rounded-[8%]"
          style={{ "--card-rgb": colorRgb } as CSSProperties}
          aria-hidden
        />

        <div
          className="absolute inset-0 rounded-[8%] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            boxShadow: `inset 0 0 30px rgba(${colorRgb}, 0.1), 0 0 40px rgba(${colorRgb}, 0.15), 0 0 80px rgba(${colorRgb}, 0.05)`,
          }}
        />

        <div
          className="absolute left-1/2 top-0 h-[1%] w-1/2 -translate-x-1/2 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            boxShadow: `0 0 10px ${color}`,
          }}
        />

        <motion.div
          className="relative z-[2] mx-auto mb-[5%] flex aspect-square w-[34%] max-w-[42%] items-center justify-center rounded-full"
          style={{ x: iconXSpring, y: iconYSpring }}
        >
          <span
            className="module-icon-wave-ring z-0"
            style={{
              borderColor: `rgba(${colorRgb}, 0.55)`,
              boxShadow: `0 0 14px rgba(${colorRgb}, 0.35), inset 0 0 10px rgba(${colorRgb}, 0.12)`,
            }}
            aria-hidden
          />
          <div
            className="absolute inset-0 rounded-full transition-all duration-500 z-[1]"
            style={{
              background: `radial-gradient(circle, rgba(${colorRgb}, 0.22) 0%, transparent 70%)`,
              boxShadow: `0 0 15px rgba(${colorRgb}, 0.2)`,
            }}
          />
          <div
            className="absolute inset-[5%] rounded-full opacity-0 transition-all duration-500 group-hover:opacity-100 z-[1]"
            style={{
              background: `radial-gradient(circle, rgba(${colorRgb}, 0.4) 0%, transparent 70%)`,
              boxShadow: `0 0 30px rgba(${colorRgb}, 0.4)`,
            }}
          />
          <motion.span
            className="relative z-10 text-[220%] leading-none"
            style={{ textShadow: `0 0 20px rgba(${colorRgb},0.45)` }}
          >
            {icon}
          </motion.span>
        </motion.div>

        <h3
          className="text-center text-[130%] font-bold uppercase tracking-wide transition-colors duration-500 group-hover:text-white"
          style={{ color: `rgba(${colorRgb}, 0.9)` }}
        >
          {title}
        </h3>

        <p className="mt-[4%] min-h-0 flex-1 text-center text-[102%] uppercase leading-relaxed text-white transition-colors duration-500 group-hover:text-white">
          {description}
        </p>

        <div className="mt-[6%] flex shrink-0 items-center justify-center gap-[3.5%]">
          <div
            className="module-card-status-dot aspect-square w-[5.5%] min-w-[0.4em] rounded-full"
            style={{
              background: `rgba(${colorRgb}, 0.92)`,
              boxShadow: `0 0 6px rgba(${colorRgb}, 0.55), 0 0 12px rgba(${colorRgb}, 0.3)`,
            }}
          />
          <span className="text-[86%] font-mono uppercase tracking-wider text-white/45">
            {isFullModule ? "OPERACIONAL" : "HOMOLOGAÇÃO"}
          </span>
        </div>
      </div>
    </>
  );

  const motionProps = {
    className: `relative z-[2] h-full min-h-0 w-full group [transform-style:preserve-3d] will-change-transform ${interactive ? "cursor-pointer" : "cursor-default"} ${className}`,
    initial: { opacity: 1, y: dropOffset, scale: 0.9 },
    animate: {
      opacity: 1,
      y: [dropOffset, impactY, 0],
      scale: [0.9, 1.035, 1],
    },
    style: {
      rotateX: rotateXSpring,
      rotateY: rotateYSpring,
      transformPerspective: 700,
      transformOrigin: "center bottom",
    },
    transition: {
      delay: dropDelay,
      duration: dropDuration,
      times: [0, 0.73, 1],
      ease: [easeFall, easeSettle],
    },
    whileTap: interactive && !disabled ? { scale: 0.98 } : undefined,
    onHoverStart: interactive ? handleHover : undefined,
    onHoverEnd: interactive ? resetParallax : undefined,
    onMouseMove: interactive ? handleMouseMove : undefined,
    onMouseLeave: interactive ? resetParallax : undefined,
  };

  if (!interactive) {
    return (
      <motion.div {...motionProps}>
        {cardInner}
      </motion.div>
    );
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      {...motionProps}
    >
      {cardInner}
    </motion.button>
  );
}
