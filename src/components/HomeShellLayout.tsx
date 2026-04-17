"use client";

import type { ReactNode } from "react";
import FooterMarquee from "@/components/FooterMarquee";

type Props = {
  /** Conteúdo da faixa superior: normalmente a grelha de 7 cartões (mesmas classes que a Home). */
  topBand: ReactNode;
  /** Conteúdo da faixa inferior (zona do carrossel na Home). */
  bottomBand: ReactNode;
};

/**
 * Mesma casca que a primeira página: paddings, max-width, proporções flex,
 * `module-cards-glow-gutter` na faixa de cima e ticker no fundo.
 */
export default function HomeShellLayout({ topBand, bottomBand }: Props) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-x-hidden px-[2.5%] pb-[0.6vh] pt-[0.8vh]">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto mt-[min(2vh,2vmin)] flex min-h-0 w-full max-w-[98%] flex-1 flex-col gap-[min(3.2vmin,2.8vh)]">
          <div className="module-cards-glow-gutter min-h-0 w-full min-w-0 flex-[1.22]">
            {topBand}
          </div>

          <div className="flex min-h-0 min-w-0 flex-[0.96] flex-col overflow-hidden">
            {bottomBand}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-auto w-full max-w-[98%] shrink-0 pb-0 pt-[min(1.2%,1vh)]">
        <FooterMarquee />
      </div>
    </div>
  );
}
