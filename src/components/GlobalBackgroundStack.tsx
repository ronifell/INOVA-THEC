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
    { left: "20.4%", top: "35.3%", delay: "0s", duration: "8.8s", size: 3.8 },
    { left: "24.6%", top: "41.5%", delay: "1.2s", duration: "9.3s", size: 4.2 },
    { left: "28.9%", top: "31.9%", delay: "2.4s", duration: "8.5s", size: 3.6 },
    { left: "33.8%", top: "44.7%", delay: "0.9s", duration: "10.4s", size: 4.5 },
    { left: "38.7%", top: "36.1%", delay: "3.1s", duration: "9.7s", size: 3.9 },
    { left: "43.5%", top: "32.8%", delay: "4.6s", duration: "8.9s", size: 4.1 },
    { left: "48.2%", top: "39.8%", delay: "1.8s", duration: "9.5s", size: 4.8 },
    { left: "52.9%", top: "34.1%", delay: "2.7s", duration: "8.7s", size: 3.7 },
    { left: "56.3%", top: "45.6%", delay: "5.1s", duration: "10.2s", size: 4.4 },
    { left: "61.8%", top: "30.7%", delay: "3.8s", duration: "9.1s", size: 3.8 },
    { left: "65.2%", top: "38.9%", delay: "6s", duration: "10.6s", size: 4.6 },
    { left: "69.6%", top: "33.4%", delay: "2s", duration: "9.8s", size: 4.1 },
    { left: "73.5%", top: "42.2%", delay: "4.1s", duration: "8.6s", size: 4.3 },
    { left: "76.9%", top: "36.5%", delay: "6.6s", duration: "10.1s", size: 3.9 },
    { left: "31.2%", top: "51.2%", delay: "7.1s", duration: "9.4s", size: 4.2 },
    { left: "45.7%", top: "48.1%", delay: "5.8s", duration: "8.9s", size: 3.7 },
    { left: "58.9%", top: "52.3%", delay: "3.6s", duration: "9.6s", size: 4.5 },
    { left: "67.7%", top: "48.9%", delay: "7.9s", duration: "10.3s", size: 4.1 },
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
