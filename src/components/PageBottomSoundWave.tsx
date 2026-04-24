"use client";

import { useEffect, useRef } from "react";

type Variant = "frota" | "patrimonio";

/** Estilo referência: fundo preto, baseline central, “spikes” finos néon com brilho (osciloscópio). */
const PALETTE: Record<Variant, { primary: string; primaryDim: string; glow: string }> = {
  frota: {
    primary: "#00FF41",
    primaryDim: "rgba(0, 255, 65, 0.88)",
    glow: "rgba(0, 255, 65, 0.95)",
  },
  patrimonio: {
    primary: "#22D3EE",
    primaryDim: "rgba(34, 211, 238, 0.88)",
    glow: "rgba(34, 211, 238, 0.95)",
  },
};

const BAR_JITTER = 72;
const DPR_CAP = 2;

export default function PageBottomSoundWave({
  variant = "frota",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heightsRef = useRef<number[]>([]);
  const targetsRef = useRef<number[]>([]);
  const specksRef = useRef<{ x: number; y: number; p: number; w: number }[]>([]);

  useEffect(() => {
    const pal = PALETTE[variant];
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let wCss = 0;
    let hCss = 140;
    let dpr = 1;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      wCss = Math.max(1, Math.floor(rect.width));
      dpr = Math.min(DPR_CAP, window.devicePixelRatio || 1);
      canvas.width = Math.floor(wCss * dpr);
      canvas.height = Math.floor(hCss * dpr);
      canvas.style.width = `${wCss}px`;
      canvas.style.height = `${hCss}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const n = Math.max(64, Math.min(220, Math.floor(wCss / 1.65)));
      heightsRef.current = Array.from({ length: n }, () => 4);
      targetsRef.current = Array.from({ length: n }, () => 4);
      specksRef.current = Array.from({ length: 90 }, () => ({
        x: Math.random(),
        y: Math.random(),
        p: Math.random() * Math.PI * 2,
        w: 0.35 + Math.random() * 0.65,
      }));
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    const tick = (now: number) => {
      const W = wCss;
      const H = hCss;
      const mid = H * 0.5;
      const maxHalf = (H * 0.42) | 0;
      const t = now * 0.001 * 0.3;

      const heights = heightsRef.current;
      const targets = targetsRef.current;
      const n = heights.length;
      if (n === 0) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const pitch = W / n;
      const barW = Math.max(0.28, pitch * 0.34);

      for (let i = 0; i < n; i++) {
        const u = i / Math.max(1, n - 1);
        const edgeFade = Math.pow(Math.sin(u * Math.PI), 0.82);
        const packets =
          0.14 +
          0.86 *
            Math.pow(
              Math.abs(Math.sin(u * Math.PI * 1.53 - t * 1.55 + Math.sin(t * 0.35) * 0.4)),
              0.58,
            );
        const subRipple =
          0.55 + 0.45 * Math.abs(Math.sin(u * Math.PI * 3.67 + t * 3.1));
        const burst =
          0.32 +
          0.68 * Math.abs(Math.sin(t * 15 + u * 14.67 + Math.sin(u * 6.33)));
        const micro = 0.48 + 0.52 * Math.sin(BAR_JITTER * t + i * 1.91);
        const rnd = Math.pow(Math.random(), 0.5);
        const amp =
          packets *
          subRipple *
          burst *
          (0.42 + 0.58 * micro) *
          (0.22 + 0.78 * rnd) *
          (0.28 + 0.72 * edgeFade);
        targets[i] = Math.max(1.2, Math.min(maxHalf, amp * maxHalf * 10));
      }

      for (let i = 0; i < n; i++) {
        heights[i] += (targets[i] - heights[i]) * 0.52;
      }

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);

      const specks = specksRef.current;
      for (let s = 0; s < specks.length; s++) {
        const sk = specks[s];
        const flick =
          (0.035 + 0.09 * Math.sin(now * 0.0033 + sk.p + s)) * (0.55 + 0.45 * sk.w);
        if (variant === "frota") {
          const g = 210 + Math.floor(35 * sk.w);
          ctx.fillStyle = `rgba(${g}, ${g + 12}, ${g + 18}, ${flick})`;
        } else {
          const b = 228 + Math.floor(22 * sk.w);
          ctx.fillStyle = `rgba(${180 + Math.floor(40 * sk.w)}, ${230 + Math.floor(20 * sk.w)}, ${b}, ${flick})`;
        }
        const px = sk.x * W;
        const py = sk.y * H;
        ctx.fillRect(px, py, 1, 1);
      }

      ctx.strokeStyle = pal.primary;
      ctx.lineWidth = 1.45;
      ctx.shadowColor = pal.glow;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(W, mid);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = pal.primaryDim;
      ctx.shadowColor = pal.glow;
      ctx.shadowBlur = 4;
      for (let i = 0; i < n; i++) {
        const h = heights[i];
        const x = i * pitch + (pitch - barW) * 0.5;
        const y0 = mid - h * 0.5;
        ctx.fillRect(x, y0, barW, h);
      }
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [variant]);

  return (
    <div
      ref={wrapRef}
      className={`pointer-events-none z-[20] w-full px-[min(3vw,1.25rem)] ${className}`}
      aria-hidden
    >
      <canvas ref={canvasRef} className="mx-auto block w-full max-w-[min(96%,56rem)]" />
    </div>
  );
}
