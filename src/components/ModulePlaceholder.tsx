"use client";

import { useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { getModuleById } from "@/lib/modules";
import { useStore } from "@/store/useStore";

function AnimatedGraph({ color, rgb }: { color: string; rgb: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const offsetRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 300;

    const draw = () => {
      offsetRef.current += 0.5;
      ctx.fillStyle = "rgba(10, 15, 30, 0.15)";
      ctx.fillRect(0, 0, 600, 300);

      for (let line = 0; line < 3; line++) {
        ctx.beginPath();
        const yBase = 100 + line * 60;
        for (let x = 0; x < 600; x++) {
          const y =
            yBase +
            Math.sin((x + offsetRef.current * (1 + line * 0.3)) / (30 + line * 10)) * 30 +
            Math.sin((x + offsetRef.current * 0.5) / (60 + line * 20)) * 15;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${rgb}, ${0.4 - line * 0.1})`;
        ctx.lineWidth = 2 - line * 0.5;
        ctx.stroke();
      }

      ctx.strokeStyle = `rgba(${rgb}, 0.05)`;
      ctx.lineWidth = 1;
      for (let x = 0; x < 600; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 300);
        ctx.stroke();
      }
      for (let y = 0; y < 300; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(600, y);
        ctx.stroke();
      }

      for (let i = 0; i < 5; i++) {
        const px = ((offsetRef.current * 0.3 + i * 120) % 600);
        const py = 150 + Math.sin(px / 40) * 40;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, 0.6)`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, 0.1)`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [color, rgb]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-xl"
      style={{ aspectRatio: "2/1" }}
    />
  );
}

export default function ModulePlaceholder() {
  const activeModule = useStore((s) => s.activeModule);
  const mod = useMemo(
    () => (activeModule ? getModuleById(activeModule) : null),
    [activeModule]
  );

  if (!mod) return null;

  return (
    <motion.div
      className="min-h-full flex flex-col items-center justify-center px-4 md:px-8 py-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-3xl w-full">
        {/* Module Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-5xl mb-4 block">{mod.icon}</span>
          <h2
            className="text-2xl font-bold tracking-wider mb-2"
            style={{ color: mod.color }}
          >
            {mod.name}
          </h2>
          <p className="text-sm text-white/40">{mod.description}</p>
        </motion.div>

        {/* Graph */}
        <motion.div
          className="glass rounded-2xl p-6 mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                background: mod.color,
                boxShadow: `0 0 6px ${mod.color}`,
              }}
            />
            <span className="text-[10px] font-mono tracking-wider text-white/30">
              ANÁLISE TELEMETRIA — PREVIEW TÉCNICO
            </span>
          </div>
          <AnimatedGraph color={mod.color} rgb={mod.colorRgb} />
        </motion.div>

        {/* Homologation Notice */}
        <motion.div
          className="glass rounded-2xl p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{
              background: `rgba(${mod.colorRgb}, 0.1)`,
              border: `1px solid rgba(${mod.colorRgb}, 0.2)`,
            }}
          >
            <motion.div
              className="text-2xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              🔧
            </motion.div>
          </div>
          <p
            className="text-sm font-mono tracking-wider font-bold mb-2"
            style={{ color: mod.color }}
          >
            Módulo em fase de homologação pericial
          </p>
          <p className="text-xs text-white/30 font-mono tracking-wider">
            Padrão AP-04
          </p>
          <div
            className="mt-4 h-[1px] w-32 mx-auto"
            style={{
              background: `linear-gradient(90deg, transparent, ${mod.color}40, transparent)`,
            }}
          />
          <p className="mt-4 text-[10px] text-white/20 leading-relaxed max-w-md mx-auto">
            Este módulo está sendo preparado com os mais altos padrões de
            auditoria e controle. Em breve, estará operacional com
            rastreabilidade total e cadeia de custódia SHA-256.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
