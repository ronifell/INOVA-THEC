"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import CursorTrail from "@/components/CursorTrail";

const Background3D = dynamic(() => import("@/components/Background3D"), {
  ssr: false,
});
const SKIP_BOOT_ONCE_KEY = "skip-home-boot-once";

type Props = {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
};

export default function MilestoneShell({
  eyebrow = "Portal Inova Thec — Protocolo AP-04",
  title,
  children,
}: Props) {
  return (
    <div className="relative flex h-full min-h-[100dvh] w-full flex-col overflow-hidden">
      {/* Same stack as the company home: 3D background + cursor trail (no extra opaque layer). */}
      <Background3D />
      <div className="pointer-events-none">
        <CursorTrail />
      </div>

      <header className="fixed top-0 left-0 right-0 z-40 glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link
            href="/"
            onClick={() => {
              if (typeof window !== "undefined") {
                sessionStorage.setItem(SKIP_BOOT_ONCE_KEY, "1");
              }
            }}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-[11px] font-mono tracking-wider text-white/75 transition-colors hover:border-emerald-500/40 hover:text-white pointer-events-auto"
          >
            ← Painel principal
          </Link>
          <div className="flex items-center gap-2">
            <div className="max-w-[min(100%,14rem)] text-right max-sm:hidden">
              <p className="text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase">
                {eyebrow}
              </p>
              <p className="text-xs font-semibold tracking-wide text-white/90">
                {title}
              </p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/90 to-cyan-600/80 text-xs font-bold text-white shadow-[0_0_16px_rgba(16,185,129,0.35)]">
              IT
            </div>
          </div>
        </div>
      </header>

      <div className="pointer-events-auto relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden pt-[4.5rem]">
        {children}
      </div>
    </div>
  );
}
