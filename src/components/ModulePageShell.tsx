"use client";

import HomeShellLayout from "@/components/HomeShellLayout";
import FaithPublicPresentation from "@/components/FaithPublicPresentation";
import ModuleInteriorCardGrid from "@/components/ModuleInteriorCardGrid";

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
  return (
    <HomeShellLayout
      topBand={<ModuleInteriorCardGrid moduleId={moduleId} />}
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
