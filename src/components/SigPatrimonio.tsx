"use client";

import ModulePageShell from "@/components/ModulePageShell";
import { FAITH_TEXT_PATRIMONIO } from "@/lib/faithTexts";

/** Vista alternativa com fé pública (mesma casca que a Home); o fluxo principal usa `HomeShellLayout` em `page.tsx`. */
export default function SigPatrimonio() {
  return (
    <ModulePageShell
      variant="patrimonio"
      color="#3B82F6"
      faithText={FAITH_TEXT_PATRIMONIO}
      moduleId="patrimonio"
    />
  );
}
