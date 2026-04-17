"use client";

import { MODULES } from "@/lib/modules";
import ModuleCard from "./ModuleCard";
import FooterMarquee from "./FooterMarquee";
import AuditCarousel from "./AuditCarousel";

export default function Dashboard() {
  return (
    <div className="box-border flex h-full min-h-0 w-full max-w-full flex-col overflow-hidden px-[2.5%] pb-[calc(min(0.9vh,1vmin)+env(safe-area-inset-bottom,0px))] pt-[min(0.6vh,0.65vmin)]">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Viewport único: proporções em flex + % — sem scroll de página */}
        <div className="mx-auto mt-[min(1.2vh,1.4vmin)] flex min-h-0 w-full min-w-0 max-w-[98%] flex-1 flex-col gap-[min(0.65vmin,0.55vh)] overflow-hidden">
          <div className="module-cards-glow-gutter min-h-0 w-full min-w-0 flex-[1.48] overflow-hidden">
            <div className="grid h-full min-h-0 w-full auto-rows-fr grid-cols-2 items-stretch gap-[1vh] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
              {MODULES.map((mod, i) => (
                <ModuleCard key={mod.id} module={mod} index={i} />
              ))}
            </div>
          </div>

          <div className="flex min-h-0 min-w-0 flex-[1.08] flex-col overflow-hidden">
            <AuditCarousel />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-[min(0.55vh,0.65vmin)] w-full min-w-0 max-w-[96%] shrink-0 overflow-x-hidden pb-0 pt-0">
        <FooterMarquee />
      </div>
    </div>
  );
}
