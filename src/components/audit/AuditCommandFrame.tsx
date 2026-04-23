"use client";

import type { CSSProperties, ReactNode } from "react";
import { AUDIT_THEME, type AuditVariant } from "./auditThemes";

function VerticalRailCluster({
  side,
  rgb,
}: {
  side: "left" | "right";
  rgb: string;
}) {
  const edge = side === "left" ? "left-0" : "right-0";

  return (
    <div
      className={`pointer-events-none absolute inset-y-[3%] z-0 flex ${edge} w-[clamp(11px,2.6vmin,20px)] justify-center gap-[4px]`}
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <div
          key={`${side}-${i}`}
          className="audit-rail-line h-full w-[2px] rounded-full sm:w-[2.5px]"
          style={
            {
              background: `linear-gradient(
                180deg,
                transparent 0%,
                rgba(${rgb}, 0.12) 8%,
                rgba(${rgb}, 0.92) 48%,
                rgba(${rgb}, 0.92) 52%,
                rgba(${rgb}, 0.12) 92%,
                transparent 100%
              )`,
              boxShadow: `
                0 0 12px rgba(${rgb}, 0.45),
                0 0 26px rgba(${rgb}, 0.22),
                0 0 42px rgba(${rgb}, 0.08)
              `,
              animationDelay: `${i * 0.22}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

type Props = {
  variant: AuditVariant;
  children: ReactNode;
  /** Extra classes on the outer wrapper */
  className?: string;
  /**
   * When true, children span the full width inside the frame (no extra max-width / horizontal inset).
   * Use for 7-card hubs that must match the homepage `Dashboard` grid cell size.
   */
  contentFullWidth?: boolean;
};

/**
 * Moldura do Menu (nível 2): três tubos verticais de néon em cada lateral,
 * mesma linguagem das cápsulas — pulsação 6s aceso / 4s “respira” (10s ciclo).
 */
export default function AuditCommandFrame({
  variant,
  children,
  className = "",
  contentFullWidth = false,
}: Props) {
  const t = AUDIT_THEME[variant];

  const innerClass = contentFullWidth
    ? "relative z-[1] mx-auto min-h-0 h-full w-full min-w-0 max-w-full px-0"
    : "relative z-[1] mx-auto min-h-0 h-full w-full max-w-[min(100%,calc(100%-clamp(2.75rem,7.5vmin,5.5rem)))] px-[clamp(0.6rem,2vmin,1.35rem)]";

  return (
    <div
      className={`relative isolate min-h-0 w-full min-w-0 flex-1 ${className}`}
    >
      <VerticalRailCluster side="left" rgb={t.rgb} />
      <VerticalRailCluster side="right" rgb={t.rgb} />

      <div className={innerClass}>
        {children}
      </div>
    </div>
  );
}
