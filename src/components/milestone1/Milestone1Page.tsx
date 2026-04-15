"use client";

import dynamic from "next/dynamic";
import MilestoneShell from "@/components/milestone/MilestoneShell";

const Milestone1Client = dynamic(() => import("./Milestone1Client"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-pulse rounded-xl border border-emerald-500/30 bg-emerald-500/10" />
      <p className="text-[10px] font-mono tracking-[0.3em] text-white/40">
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
      <div className="px-4 pb-8 pt-4 md:px-10">
        <Milestone1Client />
      </div>
    </MilestoneShell>
  );
}
