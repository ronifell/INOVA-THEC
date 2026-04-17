"use client";

import { useCallback, useRef } from "react";
import { useStore } from "@/store/useStore";

function pickSolemnPtBrVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  const voices = synth.getVoices();
  if (!voices.length) return null;

  const pt = voices.filter((v) => v.lang.startsWith("pt"));
  const score = (v: SpeechSynthesisVoice) => {
    const n = v.name.toLowerCase();
    let s = 0;
    if (n.includes("maria")) s += 4;
    if (n.includes("helena")) s += 4;
    if (n.includes("francisca")) s += 3;
    if (n.includes("luciana")) s += 2;
    if (n.includes("google")) s += 2;
    if (n.includes("microsoft")) s += 1;
    if (n.includes("neural")) s += 2;
    if (n.includes("premium")) s += 1;
    if (/female|feminina|mulher/.test(n)) s += 2;
    return s;
  };

  const ranked = [...pt].sort((a, b) => score(b) - score(a));
  return ranked[0] ?? voices[0] ?? null;
}

/**
 * Narração solene (contralto aproximado via pitch baixo + ritmo controlado).
 */
export function useFaithNarration() {
  const audioEnabled = useStore((s) => s.audioEnabled);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!audioEnabled) {
        onEnd?.();
        return;
      }
      if (typeof window === "undefined") {
        onEnd?.();
        return;
      }

      if (!synthRef.current) synthRef.current = window.speechSynthesis;
      const synth = synthRef.current;
      synth.cancel();

      const run = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "pt-BR";
        utterance.rate = 0.86;
        utterance.pitch = 0.88;
        utterance.volume = 0.92;

        const v = pickSolemnPtBrVoice(synth);
        if (v) utterance.voice = v;

        utterance.onend = () => onEnd?.();
        utterance.onerror = () => onEnd?.();

        synth.speak(utterance);
      };

      const voices = synth.getVoices();
      if (voices.length) run();
      else {
        const once = () => {
          synth.removeEventListener("voiceschanged", once);
          run();
        };
        synth.addEventListener("voiceschanged", once);
        window.setTimeout(() => {
          synth.removeEventListener("voiceschanged", once);
          run();
        }, 400);
      }
    },
    [audioEnabled]
  );

  const stop = useCallback(() => {
    if (synthRef.current) synthRef.current.cancel();
  }, []);

  return { speak, stop };
}
