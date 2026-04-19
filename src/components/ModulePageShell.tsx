"use client";

import HomeShellLayout from "@/components/HomeShellLayout";
import FaithPublicPresentation from "@/components/FaithPublicPresentation";
import ModuleInteriorCardGrid from "@/components/ModuleInteriorCardGrid";
import AuditCommandFrame from "@/components/audit/AuditCommandFrame";

type Props = {
  variant: "frota" | "patrimonio";
  color: string;
  faithText: string;
  moduleId: "frota" | "patrimonio";
};

/**
 * Réplica da Home: mesma casca que `HomeShellLayout` + 7 cartões horizontais + faixa inferior (fé pública).
 */
export default function ModulePageShell({
  variant,
  color,
  faithText,
  moduleId,
}: Props) {
  const auditVariant = moduleId === "frota" ? "frota" : "patrimonio";

  return (
    <HomeShellLayout
      topBand={
        <AuditCommandFrame variant={auditVariant} className="min-h-0 h-full">
          <ModuleInteriorCardGrid moduleId={moduleId} />
        </AuditCommandFrame>
      }
      bottomBand={
        <FaithPublicPresentation
          text={faithText}
          accentHex={color}
          variant={variant}
        />
      }
    />
  );
}
