"use client";

import dynamic from "next/dynamic";
import MilestoneShell from "@/components/milestone/MilestoneShell";

const Milestone1Client = dynamic(() => import("./Milestone1Client"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-[1vh]">
      <div className="h-[6vh] w-[6vh] max-h-14 max-w-14 animate-pulse rounded-xl border border-emerald-500/30 bg-emerald-500/10" />
      <p className="text-[1vh] font-mono tracking-[0.3em] text-white/40">
        CARREGANDO MÓDULO…
      </p>
    </div>
  ),
});

export default function Milestone1Page() {
  return (
    <MilestoneShell
      title="Centro de Governança — Milestone 1"
      eyebrow="SIG-FROTA · SIG-PATRIMÔNIO · Auditoria AP-04"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-[2.5%] pb-[1vh] pt-[0.8vh] md:px-[3%]">
        <Milestone1Client />
      </div>
    </MilestoneShell>
  );
}
