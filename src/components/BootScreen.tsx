"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { motion } from "framer-motion";
import {
  BOOT_BACKDROP_FADE_S,
  BOOT_EXIT_TOTAL_S,
} from "@/lib/bootTransition";

/** Fração do tanque por segundo (3x do ritmo anterior). */
const FILL_RATE = 0.4;

/** Segundos de ejeção contínua pelo orifício; depois fade do splash. */
const SPRAY_EJECT_S = 0.36;
const SPRAY_MS = SPRAY_EJECT_S * 1000;

/** Início do jato (~90% do reservatório). */
const SPRAY_START_FILL = 0.9;

const DROPLET_N = 192;

const TANK_W = 200;
const TANK_H = 120;
/** Centro do orifício superior direito (px no sistema do tanque) — alinhado ao anel visual. */
const TANK_HOLE_CX = TANK_W - 19;
const TANK_HOLE_CY = 15;
const BUBBLE_N = 20;

/** Lote inicial quase imediato ao atingir ~90% (resto escalonado no período de ejeção). */
const BUBBLE_IMMEDIATE_N = 106;

/** Últimos segundos: tanque esmaece quando a ejeção termina. */
const TANK_TAIL_FADE_S = 0.28;

function lerpRgb(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  t: number
): string {
  const u = Math.min(1, Math.max(0, t));
  const r = Math.round(a[0] + (b[0] - a[0]) * u);
  const g = Math.round(a[1] + (b[1] - a[1]) * u);
  const bl = Math.round(a[2] + (b[2] - a[2]) * u);
  return `rgb(${r},${g},${bl})`;
}

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

type BootPhase = "idle" | "spray" | "deepen";

type BurstBubbleSpec = {
  /** Ponto de nascimento dentro do tanque (água / sob a superfície). */
  ox: number;
  oy: number;
  tx: number;
  ty: number;
  size: number;
  dur: number;
  delay: number;
  /** Escala final (bolhas incham ao espalhar). */
  scaleEnd: number;
};

/** Microgotas pelo orifício superior direito; alvos variados (esq., centro, dir.) para cobrir a tela. */
function genBurstBubbles(
  rect: DOMRect,
  maxDist: number
): BurstBubbleSpec[] {
  const vw =
    typeof window !== "undefined" ? window.innerWidth : rect.width * 2;
  const vh =
    typeof window !== "undefined" ? window.innerHeight : rect.height * 3;
  const sx = rect.width / TANK_W;
  const sy = rect.height / TANK_H;

  const aimTargets: [number, number][] = [
    [vw * 0.14, vh * 0.48],
    [vw * 0.32, vh * 0.58],
    [vw * 0.46, vh * 0.38],
    [vw * 0.52, vh * 0.65],
    [vw * 0.68, vh * 0.42],
    [vw * 0.82, vh * 0.36],
    [vw * 0.88, vh * 0.52],
    [vw * 0.76, vh * 0.68],
  ];

  return Array.from({ length: DROPLET_N }, (_, i) => {
    const ox =
      rect.left +
      TANK_HOLE_CX * sx +
      (Math.random() - 0.5) * Math.min(6, rect.width * 0.04);
    const oy =
      rect.top +
      TANK_HOLE_CY * sy +
      (Math.random() - 0.5) * Math.min(5, rect.height * 0.05);

    const [txa, tya] =
      aimTargets[Math.floor(Math.random() * aimTargets.length)]!;
    let aimX = txa - ox;
    let aimY = tya - oy;
    if (Math.random() < 0.1) {
      const a = Math.random() * Math.PI * 2;
      aimX = Math.cos(a) * maxDist * 0.35;
      aimY = Math.sin(a) * maxDist * 0.35;
    }
    const baseAngle = Math.atan2(aimY, aimX);
    const angle =
      baseAngle +
      (Math.random() - 0.5) * (Math.PI * 0.68) +
      (Math.random() < 0.12 ? (Math.random() - 0.5) * Math.PI * 0.85 : 0);

    const dist = maxDist * (0.42 + Math.random() * 0.58);
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist + (Math.random() - 0.45) * 95;

    const dur = 5.2 + Math.random() * 4.8;
    const maxDelay = Math.max(0.12, SPRAY_EJECT_S - 2.2 - dur);
    let delay: number;
    if (i < BUBBLE_IMMEDIATE_N) {
      delay = Math.random() * 0.32;
    } else {
      const rest = DROPLET_N - BUBBLE_IMMEDIATE_N;
      const slot = i - BUBBLE_IMMEDIATE_N;
      delay =
        (slot / Math.max(1, rest)) * Math.min(maxDelay * 0.52, 5.5) +
        Math.random() * (maxDelay * 0.48);
      if (delay > maxDelay) delay = maxDelay;
    }

    return {
      ox,
      oy,
      tx,
      ty,
      size: 2.2 + Math.random() * 2.2,
      dur,
      delay,
      scaleEnd: 3.2 + Math.random() * 4.4,
    };
  });
}

export default function BootScreen({
  onRevealMain,
  onExitComplete,
}: BootScreenProps) {
  const [fill, setFill] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [phase, setPhase] = useState<BootPhase>("idle");
  const [burstBubbles, setBurstBubbles] = useState<BurstBubbleSpec[]>([]);
  const [sprayElapsed, setSprayElapsed] = useState(0);
  const tankRef = useRef<HTMLDivElement>(null);
  const rafFillRef = useRef<number>(0);
  const rafWaveRef = useRef<number>(0);
  const reachedRef = useRef(false);
  const sprayStartedRef = useRef(false);
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

      if (next >= SPRAY_START_FILL && !sprayStartedRef.current) {
        sprayStartedRef.current = true;
        const el = tankRef.current;
        if (el && typeof window !== "undefined") {
          const r = el.getBoundingClientRect();
          const maxDist =
            Math.hypot(window.innerWidth, window.innerHeight) * 0.62;
          flushSync(() => {
            setBurstBubbles(genBurstBubbles(r, maxDist));
            setPhase("spray");
          });
        } else {
          flushSync(() => {
            setPhase("spray");
          });
        }
      }

      if (next < 1) {
        rafFillRef.current = requestAnimationFrame(tick);
      } else if (!reachedRef.current) {
        reachedRef.current = true;
        setFill(1);
        fillRef.current = 1;
        flushSync(() => {
          onRevealRef.current();
        });
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

  useLayoutEffect(() => {
    if (phase !== "spray" || typeof window === "undefined") return;
    if (burstBubbles.length > 0) return;
    const el = tankRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const maxDist = Math.hypot(window.innerWidth, window.innerHeight) * 0.62;
    setBurstBubbles(genBurstBubbles(r, maxDist));
  }, [phase, burstBubbles.length]);

  useEffect(() => {
    if (phase !== "spray" || burstBubbles.length === 0) return;
    const id = window.setTimeout(() => setPhase("deepen"), SPRAY_MS);
    return () => window.clearTimeout(id);
  }, [phase, burstBubbles.length]);

  /* Transparência gradual do overlay assim que termina o spray (sem pausa escura). */
  useEffect(() => {
    if (phase !== "deepen") return;
    exitingRef.current = true;
    setExiting(true);
  }, [phase]);

  const exitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!exiting) return;
    const ms = Math.round(BOOT_EXIT_TOTAL_S * 1000) + 48;
    exitTimerRef.current = window.setTimeout(() => {
      if (exitCalledRef.current) return;
      exitCalledRef.current = true;
      onExitRef.current();
    }, ms);
    return () => {
      if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);
    };
  }, [exiting]);

  useEffect(() => {
    if (phase !== "spray") {
      setSprayElapsed(0);
      return;
    }
    const t0 = performance.now();
    let id = 0;
    const tick = (now: number) => {
      const sec = Math.min(SPRAY_EJECT_S, (now - t0) / 1000);
      setSprayElapsed(sec);
      if (sec < SPRAY_EJECT_S - 0.001) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [phase]);

  const itColor = itColorAt(fill);

  const sprayLighten =
    phase === "spray" ? Math.min(1, sprayElapsed / SPRAY_EJECT_S) : 0;

  const tankShellOpacity =
    phase === "idle"
      ? 1
      : phase === "spray"
        ? sprayElapsed < SPRAY_EJECT_S - TANK_TAIL_FADE_S
          ? 1
          : Math.max(
              0,
              1 -
                (sprayElapsed - (SPRAY_EJECT_S - TANK_TAIL_FADE_S)) /
                  TANK_TAIL_FADE_S
            )
        : 0;

  const tankBg = lerpRgb([15, 23, 42], [62, 82, 112], sprayLighten * 0.88);
  const tankBorder = `rgba(255,255,255,${0.1 + sprayLighten * 0.2})`;
  const tankShadow = `0 0 ${28 + sprayLighten * 22}px rgba(16, 185, 129, ${0.1 + sprayLighten * 0.14})`;
  const waterStop0 = lerpRgb([4, 120, 87], [34, 197, 158], sprayLighten * 0.75);
  const waterStop1 = lerpRgb([16, 185, 129], [94, 234, 212], sprayLighten * 0.7);
  const waterStop2 = lerpRgb([110, 231, 183], [204, 251, 241], sprayLighten * 0.55);
  const waterOp0 = 0.68 + sprayLighten * 0.12;
  const waterOp1 = 0.62 + sprayLighten * 0.1;
  const waterOp2 = 0.5 + sprayLighten * 0.12;

  const setBubbleRef =
    (i: number) => (el: SVGCircleElement | null) => {
      bubbleElRefs.current[i] = el;
    };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none [&_*]:pointer-events-none">
      {/* Fundo — clareia primeiro e mostra o painel por baixo */}
      <motion.div
        className="absolute inset-0 z-[50] bg-[#0a0f1e]"
        aria-hidden
        initial={{ opacity: 1 }}
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{
          duration: BOOT_BACKDROP_FADE_S,
          ease: [0.38, 0.06, 0.22, 1],
        }}
      />

      {/* Névoa — acompanha o fundo */}
      <motion.div
        className="absolute inset-0 z-[55] pointer-events-none"
        aria-hidden
        initial={false}
        animate={{
          opacity:
            exiting ? 0 : phase === "spray" || phase === "deepen" ? 0.52 : 0.14,
        }}
        transition={{
          duration: exiting ? BOOT_BACKDROP_FADE_S * 0.92 : 0.45,
          ease: exiting ? [0.38, 0.06, 0.22, 1] : "easeOut",
        }}
        style={{
          background:
            "radial-gradient(ellipse 95% 80% at 50% 38%, rgba(4, 120, 87, 0.22) 0%, rgba(2, 24, 20, 0.55) 42%, rgba(6, 12, 22, 0.75) 100%)",
        }}
      />

      {/* Bolhas — somem com o fundo; o tanque permanece visível um pouco mais */}
      <motion.div
        className="absolute inset-0 z-[65] overflow-visible pointer-events-none"
        initial={false}
        animate={{
          opacity:
            exiting
              ? 0
              : phase === "spray" || phase === "deepen"
                ? 1
                : 0,
        }}
        transition={{
          duration: exiting ? BOOT_BACKDROP_FADE_S * 0.88 : 0.3,
          ease: exiting ? [0.35, 0.08, 0.2, 1] : "easeOut",
        }}
      >
        {burstBubbles.map((b, i) => (
          <motion.div
            key={i}
            className="absolute left-0 top-0 will-change-transform"
            style={{
              width: b.size,
              height: b.size,
              marginLeft: -b.size / 2,
              marginTop: -b.size / 2,
              left: b.ox,
              top: b.oy,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 32% 30%, rgba(255,255,255,0.92) 0%, rgba(186,230,253,0.55) 14%, rgba(45,212,191,0.5) 38%, rgba(16,185,129,0.38) 62%, rgba(4,120,87,0.22) 82%, rgba(4,120,87,0.06) 100%)",
              boxShadow:
                "0 0 4px rgba(167,243,208,0.45), 0 0 10px rgba(52,211,153,0.22), inset 0 0 3px rgba(255,255,255,0.35)",
              border: "0.5px solid rgba(255,255,255,0.28)",
            }}
            initial={{
              x: 0,
              y: 0,
              opacity: 0,
              scale: 0.012,
              filter: "blur(2.6px)",
            }}
            animate={{
              x: [0, b.tx * 0.032, b.tx * 0.11, b.tx * 0.38, b.tx],
              y: [0, b.ty * 0.026, b.ty * 0.09, b.ty * 0.36, b.ty],
              opacity: [0, 0, 0.08, 0.42, 0.96, 0.72, 0],
              scale: [0.012, 0.05, 0.2, 0.78, 1.9, b.scaleEnd],
              filter: [
                "blur(2.6px)",
                "blur(1.4px)",
                "blur(0.45px)",
                "blur(0px)",
                "blur(0px)",
              ],
            }}
            transition={{
              duration: b.dur,
              delay: b.delay,
              x: {
                duration: b.dur,
                delay: b.delay,
                times: [0, 0.16, 0.34, 0.54, 1],
                ease: [0.05, 0.55, 0.22, 1],
              },
              y: {
                duration: b.dur,
                delay: b.delay,
                times: [0, 0.16, 0.34, 0.54, 1],
                ease: [0.05, 0.55, 0.22, 1],
              },
              opacity: {
                duration: b.dur,
                delay: b.delay,
                times: [0, 0.07, 0.2, 0.36, 0.58, 0.9, 1],
                ease: [0.25, 0.1, 0.2, 1],
              },
              scale: {
                duration: b.dur,
                delay: b.delay,
                times: [0, 0.1, 0.26, 0.48, 0.72, 1],
                ease: [0.08, 0.82, 0.18, 1],
              },
              filter: {
                duration: b.dur,
                delay: b.delay,
                times: [0, 0.14, 0.34, 0.5, 1],
                ease: "easeOut",
              },
            }}
          />
        ))}
      </motion.div>

      <div
        className="relative z-[58] flex flex-col items-center justify-center px-6"
        style={{ opacity: tankShellOpacity }}
      >
        <div
          ref={tankRef}
          className="relative overflow-hidden rounded-2xl border antialiased transition-colors duration-150"
          style={{
            width: TANK_W,
            height: TANK_H,
            backgroundColor: tankBg,
            borderColor: tankBorder,
            boxShadow: tankShadow,
          }}
        >
          {/* Orifício superior direito — ejeção das gotas */}
          <div
            className="absolute z-[3] rounded-full pointer-events-none"
            aria-hidden
            style={{
              width: 18,
              height: 18,
              right: 10,
              top: 6,
              background: `radial-gradient(circle at 32% 32%, rgba(255,255,255,${0.12 + sprayLighten * 0.18}) 0%, rgba(52,211,153,${0.25 + sprayLighten * 0.25}) 42%, ${tankBg} 78%)`,
              border: `1px solid rgba(167,243,208,${0.35 + sprayLighten * 0.25})`,
              boxShadow: `inset 0 0 12px rgba(4,120,87,${0.45 + sprayLighten * 0.15}), 0 0 8px rgba(52,211,153,${0.25 + sprayLighten * 0.2})`,
            }}
          />
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
                <stop
                  offset="0%"
                  stopColor={waterStop0}
                  stopOpacity={waterOp0}
                />
                <stop
                  offset="55%"
                  stopColor={waterStop1}
                  stopOpacity={waterOp1}
                />
                <stop
                  offset="100%"
                  stopColor={waterStop2}
                  stopOpacity={waterOp2}
                />
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
    </div>
  );
}
