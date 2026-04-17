"use client";

import type { ReactNode } from "react";
import FooterMarquee from "@/components/FooterMarquee";

/**
 * Mesmo enquadramento horizontal da Home (padding + max-width) e ticker inferior,
 * sem faixa de cartões no topo — para Milestone e outros módulos embutidos no `main`.
 */
export default function AppMainWithFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-x-hidden px-[2.5%] pb-[0.6vh] pt-[0.8vh]">
      <div className="mx-auto mt-[min(2vh,2vmin)] flex min-h-0 w-full max-w-[98%] flex-1 flex-col overflow-x-hidden overflow-y-visible">
        {children}
      </div>
      <div className="mx-auto mt-auto w-full max-w-[98%] shrink-0 pb-0 pt-[min(1.2%,1vh)]">
        <FooterMarquee />
      </div>
    </div>
  );
}
