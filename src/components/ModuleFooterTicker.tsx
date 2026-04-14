"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  speedPx: number;
  flicker?: boolean;
  className?: string;
};

/**
 * Memorial: RAF; hover → v ≈ 0 em transição suave (~300ms); retorno gradual.
 */
export default function ModuleFooterTicker({
  text,
  speedPx,
  flicker,
  className = "",
}: Props) {
  const [offset, setOffset] = useState(0);
  const raf = useRef<number>(0);
  const last = useRef<number>(0);
  const speedRef = useRef(speedPx);
  const spanRef = useRef<HTMLSpanElement>(null);
  const [cycleW, setCycleW] = useState(400);
  const hoverRef = useRef(false);
  const targetRef = useRef(speedPx);

  useEffect(() => {
    speedRef.current = speedPx;
    targetRef.current = hoverRef.current ? 0 : speedPx;
  }, [speedPx]);

  useEffect(() => {
    const measure = () => {
      if (spanRef.current) setCycleW(spanRef.current.offsetWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (spanRef.current) ro.observe(spanRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [text]);

  useEffect(() => {
    last.current = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.064, (now - last.current) / 1000);
      last.current = now;

      const target = targetRef.current;
      const cur = speedRef.current;
      speedRef.current += (target - cur) * (1 - Math.exp(-dt / 0.1));

      const w = Math.max(1, cycleW);
      setOffset((o) => {
        let n = o - speedRef.current * dt;
        while (n <= -w) n += w;
        return n;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [cycleW]);

  return (
    <div
      className={`overflow-hidden border border-white/10 rounded-lg bg-black/25 py-1.5 ${className}`}
      onMouseEnter={() => {
        hoverRef.current = true;
        targetRef.current = 0;
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
        targetRef.current = speedPx;
      }}
    >
      <div
        className={`flex whitespace-nowrap font-mono text-[9px] tracking-wide text-white/40 px-2 will-change-transform antialiased ${flicker ? "ticker-radar-flicker" : ""}`}
        style={{ transform: `translateX(${offset}px)` }}
      >
        <span ref={spanRef} className="inline-block pr-10">
          {text}
        </span>
        <span className="inline-block pr-10" aria-hidden>
          {text}
        </span>
        <span className="inline-block pr-10" aria-hidden>
          {text}
        </span>
      </div>
    </div>
  );
}
