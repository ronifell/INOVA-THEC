"use client";

import ModulePageShell from "@/components/ModulePageShell";
import { FAITH_TEXT_FROTA } from "@/lib/faithTexts";

/** Vista alternativa com fé pública (mesma casca que a Home); o fluxo principal usa `HomeShellLayout` em `page.tsx`. */
export default function SigFrota() {
  return (
    <ModulePageShell
      variant="frota"
      color="#10B981"
      faithText={FAITH_TEXT_FROTA}
      moduleId="frota"
    />
  );
}
