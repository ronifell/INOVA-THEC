"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function buildTickerSegment(): string {
  const y = new Date().getFullYear();
  return `INOVA THEC © ${y} • PROTOCOLO AP-04 • CADEIA IMUTÁVEL • FÉ PÚBLICA DIGITAL • CRIPTOGRAFIA SHA-256 • RASTREADOR DE CADEIA • CERTIFICADOR DE TIME STAMP • AUDITORIA DE BACKUP • MONITORAMENTO EM TEMPO REAL • `;
}

/**
 * Memorial: rodapé global, direita → esquerda, RAF; texto único em loop contínuo.
 */
export default function FooterMarquee() {
  const segment = useMemo(() => buildTickerSegment(), []);
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
    const speed = 72;
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
    <div className="w-full overflow-hidden border-y border-emerald-500/15 bg-black/20 py-2 select-none">
      <div
        className="flex whitespace-nowrap font-mono text-[10px] tracking-[0.12em] text-emerald-300 [text-shadow:0_0_12px_rgba(16,185,129,0.35)] will-change-transform antialiased"
        style={{ transform: `translate3d(${offset}px,0,0)` }}
      >
        <span ref={spanRef} className="inline-block shrink-0 pr-3">
          {segment}
        </span>
        <span className="inline-block shrink-0 pr-3" aria-hidden>
          {segment}
        </span>
        <span className="inline-block shrink-0 pr-3" aria-hidden>
          {segment}
        </span>
      </div>
    </div>
  );
}
