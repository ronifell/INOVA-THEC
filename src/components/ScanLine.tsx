"use client";

import { useStore } from "@/store/useStore";

export default function ScanLine() {
  const themeColor = useStore((s) => s.themeColor);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      <div
        className="scan-line absolute left-0 w-full h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${themeColor} 20%, white 50%, ${themeColor} 80%, transparent 100%)`,
          boxShadow: `0 0 20px ${themeColor}, 0 0 60px ${themeColor}40`,
        }}
      />
    </div>
  );
}
