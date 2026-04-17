"use client";

import { MODULES } from "@/lib/modules";
import ModuleCard from "./ModuleCard";
import FooterMarquee from "./FooterMarquee";
import AuditCarousel from "./AuditCarousel";

export default function Dashboard() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-x-hidden px-[2.5%] pb-[0.25vh] pt-[0.8vh]">
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Cápsulas grandes: mais flex aqui; carrossel encostado ao letreiro (menos folga inferior) */}
        <div className="mx-auto mt-[min(2vh,2vmin)] flex min-h-0 w-full max-w-[98%] flex-1 flex-col gap-[min(0.9vmin,0.75vh)]">
          <div className="module-cards-glow-gutter min-h-0 w-full min-w-0 flex-[1.58]">
            <div className="grid h-full min-h-0 w-full auto-rows-fr grid-cols-2 items-stretch gap-[1vh] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
              {MODULES.map((mod, i) => (
                <ModuleCard key={mod.id} module={mod} index={i} />
              ))}
            </div>
          </div>

          <div className="flex min-h-0 min-w-0 flex-[0.92] flex-col overflow-hidden">
            <AuditCarousel />
          </div>
        </div>
      </div>

      {/* Letreiro — base visual: mínimo espaço entre carrossel e faixa */}
      <div className="mx-auto mt-auto w-full max-w-[96%] shrink-0 pb-0 pt-0">
        <FooterMarquee />
      </div>
    </div>
  );
}
