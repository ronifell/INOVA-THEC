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
  const twinkleRegions = [
    { x0: 18, x1: 30, y0: 30, y1: 44, count: 14 }, // Americas
    { x0: 30, x1: 48, y0: 31, y1: 46, count: 14 }, // Atlantic/Europe
    { x0: 48, x1: 66, y0: 30, y1: 47, count: 16 }, // Africa/Middle East
    { x0: 64, x1: 80, y0: 31, y1: 45, count: 14 }, // Asia/Oceania
    { x0: 28, x1: 70, y0: 45, y1: 54, count: 12 }, // Southern band
  ];

  const mapTwinkles = twinkleRegions.flatMap((region, regionIdx) =>
    Array.from({ length: region.count }, (_, idx) => {
      const t = (idx + 1) / (region.count + 1);
      const jitter = (((idx * 17 + regionIdx * 13) % 11) - 5) * 0.22;
      const verticalJitter = (((idx * 19 + regionIdx * 7) % 9) - 4) * 0.2;
      const left = region.x0 + (region.x1 - region.x0) * t + jitter;
      const top = region.y0 + (region.y1 - region.y0) * t + verticalJitter;
      return {
        left: `${left}%`,
        top: `${top}%`,
        delay: `${((idx * 0.53 + regionIdx * 0.87) % 10).toFixed(2)}s`,
        duration: `${(7.2 + ((idx * 0.61 + regionIdx * 0.47) % 4.8)).toFixed(2)}s`,
        size: 5 + ((idx * 3 + regionIdx * 5) % 6) * 0.75,
      };
    })
  );

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
      <div className="absolute inset-0 z-[4] flex items-center justify-center p-[min(2.5vmin,2.5vh)]">
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
