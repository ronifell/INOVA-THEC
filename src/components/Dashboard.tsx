"use client";

import { MODULES } from "@/lib/modules";
import ModuleCard from "./ModuleCard";
import FooterMarquee from "./FooterMarquee";
import AuditPublicCenter from "./AuditPublicCenter";

export default function Dashboard() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden px-[2.5%] pb-[0.6vh] pt-[0.8vh]">
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Mesma faixa horizontal da grelha (1ª carta → 7ª carta) para os três pilares abaixo */}
        <div className="mx-auto mt-[3vh] flex min-h-0 w-full max-w-[98%] flex-1 flex-col">
          <div className="grid h-[52.2%] w-full shrink-0 auto-rows-fr grid-cols-2 items-stretch gap-[1vh] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {MODULES.map((mod, i) => (
              <ModuleCard key={mod.id} module={mod} index={i} />
            ))}
          </div>

          <AuditPublicCenter className="-mt-[0.6vh] min-h-0 shrink-0" />
        </div>
      </div>

      {/* Texto em fluxo — rodapé da vista, abaixo dos três pilares */}
      <div className="mx-auto mt-auto w-full max-w-[96%] shrink-0 pb-0 pt-1">
        <FooterMarquee />
      </div>
    </div>
  );
}
