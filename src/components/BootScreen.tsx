"use client";

import { useEffect, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { motion } from "framer-motion";
import { BOOT_HANDOFF_EASE, BOOT_HANDOFF_S } from "@/lib/bootTransition";

/** Fração do tanque por segundo (~0,033 ≈ 30 s até 100%) */
const FILL_RATE = 0.073;

const TANK_W = 200;
const TANK_H = 120;
const BUBBLE_N = 20;

/** “IT”: transparente no início; cor desloca para esmeralda e opacidade sobe com o nível da água. */
function itColorAt(fill: number): string {
  const t = Math.min(1, Math.max(0, fill));
  const r0 = 148;
  const g0 = 163;
  const b0 = 184;
  const r1 = 52;
  const g1 = 211;
  const b1 = 153;
  const r = Math.round(r0 + t * (r1 - r0));
  const g = Math.round(g0 + t * (g1 - g0));
  const b = Math.round(b0 + t * (b1 - b0));
  const a = Math.max(0, Math.min(1, Math.pow(t, 0.9)));
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
}

/** A 100%: água em retângulo completo — superfície plana horizontal. */
function buildWaterPath(fill: number, phase: number): string {
  const f = Math.max(0, Math.min(1, fill));
  if (f < 0.001) {
    return `M 0 ${TANK_H} L ${TANK_W} ${TANK_H} Z`;
  }
  if (f >= 1) {
    return `M 0 0 L ${TANK_W} 0 L ${TANK_W} ${TANK_H} L 0 ${TANK_H} Z`;
  }
  const meanY = TANK_H * (1 - f);
  const amp = 4.2 + 1.1 * Math.sin(phase * 0.7);
  const freq = 0.045;
  const steps = 28;
  let d = `M 0 ${TANK_H} L 0 ${meanY + amp * Math.sin(phase)}`;
  for (let i = 1; i <= steps; i++) {
    const x = (TANK_W * i) / steps;
    const y =
      meanY +
      amp * Math.sin(phase + x * freq) +
      1.8 * Math.sin(phase * 1.3 + x * freq * 2.1);
    d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  d += ` L ${TANK_W} ${TANK_H} Z`;
  return d;
}

type Bubble = {
  x: number;
  y: number;
  r: number;
  vy: number;
  wobble: number;
};

type BootScreenProps = {
  onRevealMain: () => void;
  onExitComplete: () => void;
};

function randomInWaterY(meanY: number, r: number): number {
  const top = meanY + r + 6;
  const bottom = TANK_H - 8;
  if (top >= bottom - 2) return bottom - 2;
  return top + Math.random() * (bottom - top);
}

function initBubbles(): Bubble[] {
  const meanY = TANK_H * (1 - 0.08);
  return Array.from({ length: BUBBLE_N }, () => {
    const r = 0.9 + Math.random() * 2.4;
    return {
      x: 14 + Math.random() * (TANK_W - 28),
      y: randomInWaterY(meanY, r),
      r,
      vy: 0.26 + Math.random() * 0.42,
      wobble: Math.random() * Math.PI * 2,
    };
  });
}

export default function BootScreen({
  onRevealMain,
  onExitComplete,
}: BootScreenProps) {
  const [fill, setFill] = useState(0);
  const [exiting, setExiting] = useState(false);
  const rafFillRef = useRef<number>(0);
  const rafWaveRef = useRef<number>(0);
  const reachedRef = useRef(false);
  const exitCalledRef = useRef(false);
  const exitingRef = useRef(false);
  const fillRef = useRef(0);
  const pathRef = useRef<SVGPathElement>(null);
  const clipPathRef = useRef<SVGPathElement>(null);
  const phaseRef = useRef(0);
  const bubblesRef = useRef<Bubble[]>(initBubbles());
  const bubbleElRefs = useRef<(SVGCircleElement | null)[]>([]);
  const onRevealRef = useRef(onRevealMain);
  const onExitRef = useRef(onExitComplete);
  onRevealRef.current = onRevealMain;
  onExitRef.current = onExitComplete;

  const gradId = useId().replace(/:/g, "");

  useEffect(() => {
    fillRef.current = fill;
  }, [fill]);

  useEffect(() => {
    const t0 = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - t0) / 1000;
      const next = Math.min(1, elapsed * FILL_RATE);
      setFill(next);
      fillRef.current = next;
      if (next < 1) {
        rafFillRef.current = requestAnimationFrame(tick);
      } else if (!reachedRef.current) {
        reachedRef.current = true;
        setFill(1);
        fillRef.current = 1;
        flushSync(() => {
          onRevealRef.current();
        });
        exitingRef.current = true;
        setExiting(true);
      }
    };
    rafFillRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafFillRef.current);
  }, []);

  useEffect(() => {
    const waveLoop = () => {
      phaseRef.current += 0.072;
      const f = fillRef.current;
      const d = buildWaterPath(f, phaseRef.current);
      pathRef.current?.setAttribute("d", d);
      clipPathRef.current?.setAttribute("d", d);

      const meanY = f >= 1 ? 0 : TANK_H * (1 - f);
      const surfaceY = f >= 1 ? 5 : meanY + 3;

      for (let i = 0; i < BUBBLE_N; i++) {
        const b = bubblesRef.current[i];
        const el = bubbleElRefs.current[i];
        if (!b || !el) continue;

        b.y -= b.vy;
        b.wobble += 0.085;
        b.x += Math.sin(b.wobble) * 0.38;
        b.x = Math.max(b.r + 4, Math.min(TANK_W - b.r - 4, b.x));

        if (b.y - b.r < surfaceY) {
          b.x = 14 + Math.random() * (TANK_W - 28);
          b.y = randomInWaterY(meanY, b.r);
          b.vy = 0.26 + Math.random() * 0.42;
        }

        el.setAttribute("cx", b.x.toFixed(2));
        el.setAttribute("cy", b.y.toFixed(2));
      }

      rafWaveRef.current = requestAnimationFrame(waveLoop);
    };
    rafWaveRef.current = requestAnimationFrame(waveLoop);
    return () => cancelAnimationFrame(rafWaveRef.current);
  }, []);

  const exitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!exiting) return;
    const ms = Math.round(BOOT_HANDOFF_S * 1000) + 32;
    exitTimerRef.current = window.setTimeout(() => {
      if (exitCalledRef.current) return;
      exitCalledRef.current = true;
      onExitRef.current();
    }, ms);
    return () => {
      if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);
    };
  }, [exiting]);

  const finishExitIfNeeded = () => {
    if (!exitingRef.current || exitCalledRef.current) return;
    exitCalledRef.current = true;
    if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);
    onExitRef.current();
  };

  const itColor = itColorAt(fill);

  const setBubbleRef =
    (i: number) => (el: SVGCircleElement | null) => {
      bubbleElRefs.current[i] = el;
    };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0a0f1e] pointer-events-none [&_*]:pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: BOOT_HANDOFF_S, ease: BOOT_HANDOFF_EASE }}
      onAnimationComplete={finishExitIfNeeded}
    >
      <div className="relative flex flex-col items-center justify-center px-6">
        <div
          className="relative overflow-hidden rounded-2xl border border-white/10 antialiased bg-[#0f172a]"
          style={{
            width: TANK_W,
            height: TANK_H,
            boxShadow: "0 0 40px rgba(16, 185, 129, 0.12)",
          }}
        >
          <svg
            className="absolute inset-0 size-full"
            viewBox={`0 0 ${TANK_W} ${TANK_H}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <clipPath id={`waterClip-${gradId}`} clipPathUnits="userSpaceOnUse">
                <path ref={clipPathRef} d={buildWaterPath(0, 0)} />
              </clipPath>
              <linearGradient
                id={`water-${gradId}`}
                x1="0"
                y1="1"
                x2="0"
                y2="0"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#047857" stopOpacity={0.68} />
                <stop offset="55%" stopColor="#10b981" stopOpacity={0.62} />
                <stop offset="100%" stopColor="#6ee7b7" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <path
              ref={pathRef}
              d={buildWaterPath(0, 0)}
              fill={`url(#water-${gradId})`}
              className="transition-none"
            />
            <g clipPath={`url(#waterClip-${gradId})`}>
              {Array.from({ length: BUBBLE_N }, (_, i) => {
                const b = bubblesRef.current[i];
                return (
                  <circle
                    key={i}
                    ref={setBubbleRef(i)}
                    cx={b?.x ?? 100}
                    cy={b?.y ?? 100}
                    r={b?.r ?? 1.5}
                    fill="rgba(255,255,255,0.26)"
                    stroke="rgba(167,243,208,0.4)"
                    strokeWidth={0.35}
                    style={{ pointerEvents: "none" }}
                  />
                );
              })}
            </g>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center z-[1]">
            <div className="text-center select-none flex flex-col items-center justify-center px-2">
              <span
                className="text-3xl font-black tracking-tight leading-none inline-block"
                style={{
                  color: itColor,
                  textShadow:
                    fill > 0.12
                      ? "0 1px 10px rgba(0,0,0,0.55)"
                      : "none",
                }}
              >
                IT
              </span>
              <p className="text-[10px] font-mono tracking-[0.35em] text-white/55 mt-2 drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
                INOVA THEC
              </p>
            </div>
          </div>
        </div>
        <p className="mt-6 text-[10px] font-mono tracking-[0.4em] text-white/30 uppercase">
          Protocolo AP-04 — boot pericial
        </p>
        <div
          className="mt-2 flex min-h-[1.35rem] w-full max-w-[min(100%,22rem)] items-center justify-center text-center"
          aria-live="polite"
        >
          <p className="text-[9px] font-mono text-emerald-500/55 tabular-nums">
            {Math.round(fill * 100)}% — nível do reservatório
          </p>
        </div>
      </div>
    </motion.div>
  );
}
