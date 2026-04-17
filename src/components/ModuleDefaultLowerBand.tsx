"use client";

import { getModuleById } from "@/lib/modules";

/**
 * Faixa inferior (zona do carrossel) para módulos sem hub Milestone dedicado:
 * mesmo tipo de moldura que o conteúdo central da Home (vidro + borda suave).
 */
export default function ModuleDefaultLowerBand({ moduleId }: { moduleId: string }) {
  const mod = getModuleById(moduleId);
  if (!mod) return null;

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center overflow-hidden rounded-md border border-white/[0.08] bg-black/10 px-[min(3%,2.5vmin)] py-[min(2%,1.5vmin)] text-center backdrop-blur-[2px]">
      <span className="mb-[min(1.5%,1.2vmin)] text-[clamp(1.75rem,5vmin,2.75rem)] leading-none">
        {mod.icon}
      </span>
      <p className="font-mono text-[clamp(0.62rem,1.35vmin,0.75rem)] uppercase tracking-[0.28em] text-white/45">
        {mod.name}
      </p>
      <p className="mx-auto mt-[min(1.8%,1.4vmin)] max-w-[min(42rem,92%)] text-[clamp(0.68rem,1.45vmin,0.82rem)] leading-relaxed text-white/60">
        {mod.description}
      </p>
      <p className="mt-[min(2.5%,2vmin)] font-mono text-[clamp(0.55rem,1.15vmin,0.65rem)] text-white/30">
        Homologação pericial — área reservada para operação AP-04
      </p>
    </div>
  );
}
