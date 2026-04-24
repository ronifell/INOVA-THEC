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
  const mapTwinkles = [
    { left: "23.5%", top: "33.5%", delay: "0s", duration: "9.2s", size: 2.2 },
    { left: "29.8%", top: "37.4%", delay: "1.7s", duration: "8.6s", size: 2.8 },
    { left: "40.6%", top: "33.8%", delay: "0.8s", duration: "10.1s", size: 2.1 },
    { left: "47.2%", top: "36.2%", delay: "2.1s", duration: "8.9s", size: 3.1 },
    { left: "53.5%", top: "34.7%", delay: "3.4s", duration: "9.7s", size: 2.4 },
    { left: "60.9%", top: "38.8%", delay: "1.1s", duration: "10.8s", size: 2.7 },
    { left: "69.1%", top: "32.6%", delay: "2.8s", duration: "9.4s", size: 2.3 },
    { left: "72.4%", top: "41.6%", delay: "4.3s", duration: "10.3s", size: 2.9 },
    { left: "36.7%", top: "46.2%", delay: "5.2s", duration: "8.8s", size: 2.5 },
    { left: "57.8%", top: "47.6%", delay: "6.4s", duration: "9.9s", size: 2.2 },
  ];

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
      <div className="absolute inset-0 z-[2] flex items-center justify-center p-[min(2.5vmin,2.5vh)]">
        <div className="map-twinkle-field relative h-full w-full max-h-full max-w-full">
          {mapTwinkles.map((spark, idx) => (
            <span
              key={`map-twinkle-${idx}`}
              className="map-twinkle-star"
              style={{
                left: spark.left,
                top: spark.top,
                width: `${spark.size}px`,
                height: `${spark.size}px`,
                animationDelay: spark.delay,
                animationDuration: spark.duration,
              }}
            />
          ))}
        </div>
      </div>
      <div className="absolute inset-0 z-[3] h-full w-full min-h-0">
        <Background3D />
      </div>
    </div>
  );
}
