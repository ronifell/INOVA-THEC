"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  GREEN_SCAN_BOX_SHADOW,
  GREEN_SCAN_DURATION_SECONDS,
  GREEN_SCAN_LINE_WIDTH_CLASS,
  GREEN_SCAN_REPEAT_DELAY_SECONDS,
  GREEN_SCAN_TAIL_BACKGROUND,
  GREEN_SCAN_TAIL_FILTER,
  GREEN_SCAN_TAIL_OVERFLOW_PX,
  GREEN_SCAN_TAIL_WIDTH_CLASS,
} from "@/lib/greenScanConfig";

type Props = {
  className?: string;
};

export default function GreenScanSweep({ className = "" }: Props) {
  const [bounds, setBounds] = useState({ startX: 0, endX: 240 });
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const updateBounds = () => {
      const host = overlayRef.current?.parentElement;
      if (!host) return;
      const hostRect = host.getBoundingClientRect();
      const startX = -hostRect.left;
      const endX = window.innerWidth - hostRect.left + GREEN_SCAN_TAIL_OVERFLOW_PX;
      setBounds({ startX, endX });
    };

    updateBounds();
    const raf1 = requestAnimationFrame(updateBounds);
    const raf2 = requestAnimationFrame(updateBounds);
    const ro = new ResizeObserver(updateBounds);
    const host = overlayRef.current?.parentElement;
    if (host) ro.observe(host);
    window.addEventListener("resize", updateBounds);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      ro.disconnect();
      window.removeEventListener("resize", updateBounds);
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className={`pointer-events-none absolute inset-0 z-[40] ${className}`}
    >
      <motion.div
        className={`absolute inset-y-0 left-0 rounded-full bg-emerald-200 ${GREEN_SCAN_LINE_WIDTH_CLASS}`}
        style={{ boxShadow: GREEN_SCAN_BOX_SHADOW }}
        initial={{ x: bounds.startX }}
        animate={{ x: [bounds.startX, bounds.endX] }}
        transition={{
          duration: GREEN_SCAN_DURATION_SECONDS,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: GREEN_SCAN_REPEAT_DELAY_SECONDS,
        }}
      >
        <span
          className={`absolute left-0 top-1/2 h-[96%] -translate-x-full -translate-y-1/2 ${GREEN_SCAN_TAIL_WIDTH_CLASS}`}
          style={{
            background: GREEN_SCAN_TAIL_BACKGROUND,
            filter: GREEN_SCAN_TAIL_FILTER,
          }}
          aria-hidden
        />
      </motion.div>
    </div>
  );
}
