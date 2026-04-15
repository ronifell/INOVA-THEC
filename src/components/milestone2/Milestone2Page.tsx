"use client";

import dynamic from "next/dynamic";
import MilestoneShell from "@/components/milestone/MilestoneShell";

const Milestone2Client = dynamic(() => import("./Milestone2Client"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-[10px] font-mono tracking-[0.3em] text-white/40">
        CARREGANDO…
      </p>
    </div>
  ),
});

export default function Milestone2Page() {
  return (
    <MilestoneShell
      title="Milestone 2 — acesso operacional"
      eyebrow="Sistema integrado SEAGRI"
    >
      <Milestone2Client />
    </MilestoneShell>
  );
}
