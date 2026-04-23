"use client";

import dynamic from "next/dynamic";

const Background3D = dynamic(() => import("@/components/Background3D"), {
  ssr: false,
});

/**
 * Single global background: pure black, green world-continent lines, 3D snow/grid (transparent canvas).
 * Used in root layout so every route matches the homepage.
 */
export default function GlobalBackgroundStack() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 isolate"
      aria-hidden
    >
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 z-[1] flex items-center justify-center p-[min(2.5vmin,2.5vh)] opacity-[0.48]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/world-continents-outline.svg"
          alt=""
          className="h-full w-full max-h-full max-w-full object-contain"
          draggable={false}
        />
      </div>
      <div className="absolute inset-0 z-[2] h-full w-full min-h-0">
        <Background3D />
      </div>
    </div>
  );
}
