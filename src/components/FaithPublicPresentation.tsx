"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFaithNarration } from "@/hooks/useFaithNarration";

type GlowKind = "terceira" | "ap04";

type PhraseRange = { start: number; end: number; kind: GlowKind };

const TERCEIRA_PHRASES = [
  "Terceira Via da Confiança Pública",
  "Terceira Via da Fé Pública",
  "terceira via para a confiança pública",
  "The Third Way of Public Trust",
] as const;

const AP04 = "AP-04";

function collectPhraseRanges(text: string): PhraseRange[] {
  const ranges: PhraseRange[] = [];
  for (const phrase of TERCEIRA_PHRASES) {
    let i = 0;
    while (true) {
      const j = text.indexOf(phrase, i);
      if (j === -1) break;
      ranges.push({ start: j, end: j + phrase.length, kind: "terceira" });
      i = j + phrase.length;
    }
  }
  let k = 0;
  while (true) {
    const j = text.indexOf(AP04, k);
    if (j === -1) break;
    ranges.push({ start: j, end: j + AP04.length, kind: "ap04" });
    k = j + AP04.length;
  }
  return ranges.sort((a, b) => a.start - b.start);
}

function rangeAt(ranges: PhraseRange[], index: number): PhraseRange | null {
  for (const r of ranges) {
    if (index >= r.start && index < r.end) return r;
  }
  return null;
}

const CHARS_PER_SEC = 13;

export default function FaithPublicPresentation({
  text,
  accentHex,
  variant,
}: {
  text: string;
  accentHex: string;
  variant: "frota" | "patrimonio";
}) {
  const { speak, stop } = useFaithNarration();
  const [revealed, setRevealed] = useState(0);
  const [strongKind, setStrongKind] = useState<GlowKind | null>(null);
  const started = useRef(false);
  const raf = useRef<number>(0);
  const t0 = useRef<number>(0);

  const ranges = useMemo(() => collectPhraseRanges(text), [text]);

  useEffect(() => {
    started.current = false;
    setRevealed(0);
    setStrongKind(null);
    stop();

    const id = window.setTimeout(() => {
      if (started.current) return;
      started.current = true;
      t0.current = performance.now();

      speak(text, () => {
        setRevealed(text.length);
        cancelAnimationFrame(raf.current);
      });

      const tick = (now: number) => {
        const elapsed = (now - t0.current) / 1000;
        const next = Math.min(text.length, Math.floor(elapsed * CHARS_PER_SEC));
        setRevealed(next);

        let hi: GlowKind | null = null;
        for (const r of ranges) {
          const estStart = r.start / CHARS_PER_SEC;
          const estEnd = r.end / CHARS_PER_SEC;
          if (elapsed >= estStart - 0.05 && elapsed <= estEnd + 0.4) {
            hi = r.kind;
            break;
          }
        }
        setStrongKind(hi);

        if (next < text.length) {
          raf.current = requestAnimationFrame(tick);
        }
      };
      raf.current = requestAnimationFrame(tick);
    }, 320);

    return () => {
      clearTimeout(id);
      cancelAnimationFrame(raf.current);
      stop();
    };
  }, [speak, stop, text, ranges]);

  const terceiraExtra =
    variant === "frota"
      ? "text-emerald-200 [text-shadow:0_0_22px_rgba(16,185,129,0.95),0_0_40px_rgba(52,211,153,0.5)]"
      : "text-sky-200 [text-shadow:0_0_22px_rgba(59,130,246,0.95),0_0_40px_rgba(96,165,250,0.5)]";

  const ap04Extra =
    variant === "frota"
      ? "text-emerald-100 [text-shadow:0_0_26px_rgba(16,185,129,1),0_0_52px_rgba(52,211,153,0.55)]"
      : "text-sky-100 [text-shadow:0_0_26px_rgba(59,130,246,1),0_0_52px_rgba(96,165,250,0.55)]";

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-md border border-white/[0.08] bg-black/10 px-[min(3.5%,3vmin)] py-[min(2.5%,2vmin)] backdrop-blur-[2px]">
      <div className="mb-[min(1.8%,1.5vmin)] flex items-center gap-2 border-b border-white/[0.08] pb-[min(1.2%,1vmin)]">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{
            background: accentHex,
            boxShadow: `0 0 10px ${accentHex}`,
          }}
        />
        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-white/55 md:text-[10px]">
          Apresentação de fé pública
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <p className="text-left font-mono text-[clamp(0.62rem,1.35vmin,0.78rem)] leading-relaxed tracking-tight text-white/90 md:text-[clamp(0.68rem,1.45vmin,0.82rem)]">
          {Array.from({ length: revealed }, (_, i) => {
            const ch = text[i]!;
            const r = rangeAt(ranges, i);
            if (!r) {
              return (
                <span key={i} className="text-white/90">
                  {ch}
                </span>
              );
            }

            const base =
              r.kind === "terceira"
                ? variant === "frota"
                  ? "text-emerald-300/95 [text-shadow:0_0_10px_rgba(16,185,129,0.55)]"
                  : "text-sky-300/95 [text-shadow:0_0_10px_rgba(59,130,246,0.55)]"
                : variant === "frota"
                  ? "text-emerald-300 [text-shadow:0_0_8px_rgba(16,185,129,0.45)]"
                  : "text-sky-300 [text-shadow:0_0_8px_rgba(59,130,246,0.45)]";

            const extra =
              strongKind === r.kind
                ? r.kind === "terceira"
                  ? terceiraExtra
                  : ap04Extra
                : "";

            return (
              <span key={i} className={`${base} ${extra}`}>
                {ch}
              </span>
            );
          })}
          {revealed < text.length && (
            <span
              className={`ml-0.5 inline-block h-[1em] w-[2px] animate-pulse align-[-0.15em] ${
                variant === "frota" ? "bg-emerald-400/85" : "bg-sky-400/85"
              }`}
            />
          )}
        </p>
      </div>
    </div>
  );
}
