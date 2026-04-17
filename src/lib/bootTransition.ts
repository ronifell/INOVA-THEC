/** Mesma curva/duração do fade do overlay de boot e da entrada do painel — evita “salto” visual. */
export const BOOT_HANDOFF_S = 0.4;
export const BOOT_HANDOFF_EASE: [number, number, number, number] = [
  0.33, 1, 0.36, 1,
];

/** Fundo escuro do boot — some primeiro. */
export const BOOT_BACKDROP_FADE_S = 0.36;

/** Tanque + texto: fade um pouco depois, mais longo (revela o painel por baixo). */
export const BOOT_TANK_FADE_DELAY_S = 0.04;
export const BOOT_TANK_FADE_S = 0.42;

/** Tempo até desmontar o overlay (alinhado ao fade mais longo). */
export const BOOT_EXIT_TOTAL_S =
  Math.max(
    BOOT_BACKDROP_FADE_S,
    BOOT_TANK_FADE_DELAY_S + BOOT_TANK_FADE_S
  ) + 0.1;

/** Duração total da interstitial de hashes (pós-100%). */
export const POST100_HASH_TOTAL_MS = 9000;
/** A partir daqui a home começa a surgir (fade ~HOME_SHELL_FADE_IN_S). Hashes seguem visíveis por cima. */
export const POST100_HOME_REVEAL_MS = 7000;
/** Fade-in do painel da home durante o cruzamento com os hashes (7–9 s). */
export const HOME_SHELL_FADE_IN_S = 2;

/** @deprecated use BOOT_BACKDROP_FADE_S */
export const BOOT_EXIT_FADE_S = BOOT_BACKDROP_FADE_S;
