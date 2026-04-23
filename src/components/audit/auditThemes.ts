export type AuditVariant = "frota" | "patrimonio";

export type AuditThemeEntry = {
  rgb: string;
  hex: string;
  /** Traços / brilho “matrix” mais saturados que a cor de marca */
  glowRgb: string;
  glowHex: string;
  label: string;
};

export const AUDIT_THEME: Record<AuditVariant, AuditThemeEntry> = {
  frota: {
    rgb: "16, 185, 129",
    hex: "#10B981",
    glowRgb: "57, 255, 20",
    glowHex: "#39FF14",
    label: "SIG-FROTA",
  },
  patrimonio: {
    rgb: "59, 130, 246",
    hex: "#3B82F6",
    glowRgb: "56, 189, 248",
    glowHex: "#38BDF8",
    label: "SIG-PATRIMÔNIO",
  },
};

/** Selo final — banho dourado do botão mestre (fé pública premium) */
export const GOLD_SEAL = {
  rgb: "212, 175, 55",
  hex: "#D4AF37",
} as const;
