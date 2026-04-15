import { BOOT_HANDOFF_EASE, BOOT_HANDOFF_S } from "@/lib/bootTransition";

const easeOut = [0.22, 1, 0.36, 1] as const;

/** Opacidade do painel vem só do container (sync com fade do boot). Filhos só deslizam levemente. */
export const appShellContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: BOOT_HANDOFF_S,
      ease: BOOT_HANDOFF_EASE,
      staggerChildren: 0,
      delayChildren: 0,
    },
  },
};

export const appShellFadeUp = {
  hidden: { opacity: 1, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOut },
  },
};

export const appShellHeader = {
  hidden: { opacity: 1, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOut },
  },
};
