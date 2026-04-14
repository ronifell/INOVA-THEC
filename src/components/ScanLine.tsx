"use client";

import { useStore } from "@/store/useStore";

export default function ScanLine() {
  const themeColor = useStore((s) => s.themeColor);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      <div
        className="scan-line absolute left-0 w-full h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${themeColor} 15%, white 50%, ${themeColor} 85%, transparent 100%)`,
          boxShadow: `0 0 30px ${themeColor}, 0 0 80px ${themeColor}60, 0 0 120px ${themeColor}20`,
        }}
      />
    </div>
  );
}
