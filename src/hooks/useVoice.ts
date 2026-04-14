"use client";

import { useCallback, useRef } from "react";
import { useStore } from "@/store/useStore";

export function useVoice() {
  const audioEnabled = useStore((s) => s.audioEnabled);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const speak = useCallback(
    (text: string) => {
      if (!audioEnabled) return;
      if (typeof window === "undefined") return;

      if (!synthRef.current) {
        synthRef.current = window.speechSynthesis;
      }
      const synth = synthRef.current;

      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 0.95;
      utterance.pitch = 1.1;
      utterance.volume = 0.4;

      const voices = synth.getVoices();
      const ptFemale = voices.find(
        (v) =>
          v.lang.startsWith("pt") &&
          (v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("feminino") ||
            v.name.includes("Google") ||
            v.name.includes("Microsoft") ||
            v.name.includes("Francisca") ||
            v.name.includes("Luciana"))
      );
      if (ptFemale) {
        utterance.voice = ptFemale;
      } else {
        const anyPt = voices.find((v) => v.lang.startsWith("pt"));
        if (anyPt) utterance.voice = anyPt;
      }

      synth.speak(utterance);
    },
    [audioEnabled]
  );

  const stop = useCallback(() => {
    if (synthRef.current) synthRef.current.cancel();
  }, []);

  return { speak, stop };
}
