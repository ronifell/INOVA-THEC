"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";

export default function CursorTrail() {
  const themeColor = useStore((s) => s.themeColor);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 180, damping: 22, mass: 0.2 });
  const sy = useSpring(y, { stiffness: 180, damping: 22, mass: 0.2 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [x, y]);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-25 hidden md:block"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
    >
      <div
        className="w-24 h-24 rounded-full"
        style={{
          background: `radial-gradient(circle, ${themeColor}55 0%, ${themeColor}20 45%, transparent 75%)`,
          filter: "blur(6px)",
          mixBlendMode: "screen",
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `1px solid ${themeColor}55`,
          boxShadow: `0 0 20px ${themeColor}60`,
          opacity: 0.55,
        }}
      />
    </motion.div>
  );
}
