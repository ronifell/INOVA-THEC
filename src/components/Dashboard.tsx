"use client";

import { MODULES } from "@/lib/modules";
import HomeShellLayout from "@/components/HomeShellLayout";
import ModuleCard from "./ModuleCard";
import AuditCarousel from "./AuditCarousel";
import GreenScanSweep from "@/components/GreenScanSweep";

export default function Dashboard() {
  return (
    <HomeShellLayout
      topBand={
        <div className="relative h-full min-h-0 w-full overflow-visible">
          <GreenScanSweep />
          <div className="grid h-full min-h-0 w-full auto-rows-fr grid-cols-2 items-stretch gap-[1vh] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {MODULES.map((mod, i) => (
              <div key={mod.id}>
                <ModuleCard module={mod} index={i} />
              </div>
            ))}
          </div>
        </div>
      }
      bottomBand={<AuditCarousel />}
    />
  );
}
