"use client";

import { useCallback } from "react";
import { Module } from "@/lib/modules";
import { useStore } from "@/store/useStore";
import { useVoice } from "@/hooks/useVoice";
import PortalModuleCard from "@/components/PortalModuleCard";

interface ModuleCardProps {
  module: Module;
  index: number;
  /** Runs after module is activated (e.g. navigate away from a milestone hub). */
  afterActivate?: () => void;
}

export default function ModuleCard({
  module,
  index,
  afterActivate,
}: ModuleCardProps) {
  const setActiveModule = useStore((s) => s.setActiveModule);
  const triggerHashValidation = useStore((s) => s.triggerHashValidation);
  const { speak } = useVoice();

  const handleClick = useCallback(() => {
    triggerHashValidation();
    setActiveModule(module.id, module.color, module.colorRgb);
    speak(module.voiceText);
    afterActivate?.();
  }, [
    setActiveModule,
    module,
    speak,
    triggerHashValidation,
    afterActivate,
  ]);

  return (
    <PortalModuleCard
      index={index}
      color={module.color}
      colorRgb={module.colorRgb}
      icon={module.icon}
      title={module.name}
      description={module.description}
      isFullModule={module.isFullModule}
      voiceText={module.voiceText}
      onClick={handleClick}
    />
  );
}
