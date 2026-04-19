export type AuditVariant = "frota" | "patrimonio";

export const AUDIT_THEME: Record<
  AuditVariant,
  { rgb: string; hex: string; label: string }
> = {
  frota: { rgb: "16, 185, 129", hex: "#10B981", label: "SIG-FROTA" },
  patrimonio: { rgb: "59, 130, 246", hex: "#3B82F6", label: "SIG-PATRIMÔNIO" },
};

/** Selo final — banho dourado do botão mestre (fé pública premium) */
export const GOLD_SEAL = {
  rgb: "212, 175, 55",
  hex: "#D4AF37",
} as const;
