"use client";

import { MODULES } from "@/lib/modules";
import ModuleCard from "./ModuleCard";
import FooterMarquee from "./FooterMarquee";
import AuditCarousel from "./AuditCarousel";

export default function Dashboard() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden px-[2.5%] pb-[0.6vh] pt-[0.8vh]">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Repartição flex (~53% / ~47%): sem scroll vertical no ecrã */}
        <div className="mx-auto mt-[2.5vh] flex min-h-0 w-full max-w-[98%] flex-1 flex-col gap-[min(1%,1vh)] overflow-hidden">
          <div className="grid min-h-0 w-full min-w-0 flex-[1.12] auto-rows-fr grid-cols-2 items-stretch gap-[1vh] overflow-hidden sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {MODULES.map((mod, i) => (
              <ModuleCard key={mod.id} module={mod} index={i} />
            ))}
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <AuditCarousel />
          </div>
        </div>
      </div>

      {/* Texto em fluxo — rodapé da vista, abaixo dos três pilares */}
      <div className="mx-auto mt-auto w-full max-w-[96%] shrink-0 pb-0 pt-[min(1.2%,1vh)]">
        <FooterMarquee />
      </div>
    </div>
  );
}
