"use client";

import { useCallback } from "react";
import PortalModuleCard from "@/components/PortalModuleCard";
import { getModuleById } from "@/lib/modules";
import { getModuleInteriorTiles } from "@/lib/moduleInteriorTiles";
import { useStore } from "@/store/useStore";

type Props = {
  moduleId: string;
};

/**
 * Grelha de 7 cartões com as mesmas classes da Home (`Dashboard`):
 * `grid` responsivo + cada célula `h-full w-[90%] justify-self-center` + `PortalModuleCard`.
 */
export default function ModuleInteriorCardGrid({ moduleId }: Props) {
  const mod = getModuleById(moduleId);
  const triggerHashValidation = useStore((s) => s.triggerHashValidation);
  const tiles = getModuleInteriorTiles(moduleId);

  const onTileClick = useCallback(() => {
    triggerHashValidation();
  }, [triggerHashValidation]);

  if (!mod) return null;

  return (
    <div className="grid h-full min-h-0 w-full auto-rows-fr grid-cols-2 items-stretch gap-[1vh] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {tiles.map((t, i) => (
        <div key={`${moduleId}-${t.title}-${i}`} className="h-full w-[90%] justify-self-center">
          <PortalModuleCard
            index={i}
            color={mod.color}
            colorRgb={mod.colorRgb}
            icon={t.icon}
            title={t.title}
            description={t.description}
            isFullModule={mod.isFullModule}
            voiceText={t.voiceText}
            onClick={onTileClick}
          />
        </div>
      ))}
    </div>
  );
}
