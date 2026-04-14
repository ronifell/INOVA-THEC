/** Entrada pós-boot: cascata suave (sem “pop” simultâneo) */
const easeOut = [0.22, 1, 0.36, 1] as const;

export const appShellContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.22,
    },
  },
};

export const appShellFadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: easeOut },
  },
};

export const appShellHeader = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: easeOut },
  },
};
