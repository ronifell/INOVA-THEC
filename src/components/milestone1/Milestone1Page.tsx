"use client";

import dynamic from "next/dynamic";
import MilestoneShell from "@/components/milestone/MilestoneShell";

const Milestone1Client = dynamic(() => import("./Milestone1Client"), {
  ssr: false,
  loading: () => (
    <div className="milestone1-app flex h-full min-h-0 flex-col items-center justify-center gap-3">
      <div className="h-14 w-14 max-h-16 max-w-16 animate-pulse rounded-xl border border-emerald-500/30 bg-emerald-500/10" />
      <p className="text-[var(--m1-text-mono-tight)] font-mono tracking-[0.3em] text-white/40">
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
