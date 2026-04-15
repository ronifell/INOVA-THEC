"use client";

import { useEffect, useRef, useState } from "react";

const BASE =
  "INOVA THEC — PROTOCOLO AP-04 — FÉ PÚBLICA DIGITAL — SHA-256 — CADEIA IMUTÁVEL — ";

/**
 * Memorial: rodapé global 40px/s, direita → esquerda, RAF.
 */
export default function FooterMarquee() {
  const [offset, setOffset] = useState(0);
  const raf = useRef<number>(0);
  const last = useRef<number>(0);
  const spanRef = useRef<HTMLSpanElement>(null);
  const [cycleW, setCycleW] = useState(600);

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
  }, []);

  useEffect(() => {
    const speed = 40;
    last.current = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last.current) / 1000);
      last.current = now;
      setOffset((o) => {
        let n = o - speed * dt;
        const w = Math.max(1, cycleW);
        while (n <= -w) n += w;
        return n;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [cycleW]);

  return (
    <div className="w-full overflow-hidden border-y border-white/[0.06] bg-black/20 py-2 select-none">
      <div
        className="flex whitespace-nowrap font-mono text-[10px] tracking-wider text-white will-change-transform antialiased"
        style={{ transform: `translateX(${offset}px)` }}
      >
        <span ref={spanRef} className="inline-block pr-12">
          {BASE}
        </span>
        <span className="inline-block pr-12" aria-hidden>
          {BASE}
        </span>
        <span className="inline-block pr-12" aria-hidden>
          {BASE}
        </span>
      </div>
    </div>
  );
}
