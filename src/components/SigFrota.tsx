"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";

interface Vehicle {
  id: string;
  x: number;
  y: number;
  angle: number;
  speed: number;
  trail: { x: number; y: number }[];
  inGeofence: boolean;
}

interface Geofence {
  x: number;
  y: number;
  radius: number;
  label: string;
}

const GEOFENCES: Geofence[] = [
  { x: 200, y: 180, radius: 60, label: "SEDE CENTRAL" },
  { x: 500, y: 280, radius: 50, label: "POSTO 01" },
  { x: 350, y: 400, radius: 45, label: "GARAGEM" },
  { x: 650, y: 150, radius: 55, label: "ALMOXARIFADO" },
];

function generateGPSLog() {
  const lat = -9.97 + (Math.random() - 0.5) * 0.02;
  const lng = -67.81 + (Math.random() - 0.5) * 0.02;
  const speed = Math.floor(Math.random() * 80);
  const plates = ["ABC-1234", "DEF-5678", "GHI-9012", "JKL-3456", "MNO-7890"];
  return {
    time: new Date().toLocaleTimeString("pt-BR"),
    plate: plates[Math.floor(Math.random() * plates.length)],
    lat: lat.toFixed(6),
    lng: lng.toFixed(6),
    speed,
    id: Math.random().toString(36).substring(7),
  };
}

export default function SigFrota() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vehiclesRef = useRef<Vehicle[]>([]);
  const animRef = useRef<number>(0);
  const openReport = useStore((s) => s.openReport);
  const [logs, setLogs] = useState<ReturnType<typeof generateGPSLog>[]>([]);

  useEffect(() => {
    const vehicles: Vehicle[] = Array.from({ length: 6 }, (_, i) => ({
      id: `VEH-${String(i + 1).padStart(3, "0")}`,
      x: Math.random() * 700 + 50,
      y: Math.random() * 400 + 50,
      angle: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
      trail: [],
      inGeofence: true,
    }));
    vehiclesRef.current = vehicles;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => [generateGPSLog(), ...prev].slice(0, 20));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 800;
    const H = 500;
    canvas.width = W;
    canvas.height = H;

    const draw = () => {
      ctx.fillStyle = "#0a0f1e";
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "rgba(16, 185, 129, 0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      for (const gf of GEOFENCES) {
        const pulse = Math.sin(Date.now() / 500) * 0.15 + 0.35;
        ctx.beginPath();
        ctx.arc(gf.x, gf.y, gf.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(16, 185, 129, ${pulse})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(gf.x, gf.y, gf.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, 0.03)`;
        ctx.fill();

        ctx.fillStyle = "rgba(16, 185, 129, 0.3)";
        ctx.font = "9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(gf.label, gf.x, gf.y - gf.radius - 6);
      }

      for (const v of vehiclesRef.current) {
        v.angle += (Math.random() - 0.5) * 0.1;
        v.x += Math.cos(v.angle) * v.speed;
        v.y += Math.sin(v.angle) * v.speed;

        if (v.x < 20 || v.x > W - 20) v.angle = Math.PI - v.angle;
        if (v.y < 20 || v.y > H - 20) v.angle = -v.angle;
        v.x = Math.max(20, Math.min(W - 20, v.x));
        v.y = Math.max(20, Math.min(H - 20, v.y));

        v.trail.push({ x: v.x, y: v.y });
        if (v.trail.length > 30) v.trail.shift();

        let isInAnyGeofence = false;
        for (const gf of GEOFENCES) {
          const dx = v.x - gf.x;
          const dy = v.y - gf.y;
          if (Math.sqrt(dx * dx + dy * dy) < gf.radius) {
            isInAnyGeofence = true;
            break;
          }
        }
        v.inGeofence = isInAnyGeofence;

        if (v.trail.length > 1) {
          for (let i = 1; i < v.trail.length; i++) {
            const alpha = (i / v.trail.length) * 0.5;
            ctx.beginPath();
            ctx.moveTo(v.trail[i - 1].x, v.trail[i - 1].y);
            ctx.lineTo(v.trail[i].x, v.trail[i].y);
            ctx.strokeStyle = v.inGeofence
              ? `rgba(16, 185, 129, ${alpha})`
              : `rgba(239, 68, 68, ${alpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }

        ctx.save();
        ctx.translate(v.x, v.y);
        ctx.rotate(v.angle);

        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-6, -5);
        ctx.lineTo(-6, 5);
        ctx.closePath();

        const color = v.inGeofence ? "#10B981" : "#EF4444";
        ctx.fillStyle = color;
        ctx.fill();
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();

        if (!v.inGeofence) {
          ctx.setLineDash([4, 4]);
          const nearest = GEOFENCES.reduce(
            (best, gf) => {
              const d = Math.sqrt(
                (v.x - gf.x) ** 2 + (v.y - gf.y) ** 2
              );
              return d < best.d ? { gf, d } : best;
            },
            { gf: GEOFENCES[0], d: Infinity }
          );
          ctx.beginPath();
          ctx.moveTo(v.x, v.y);
          ctx.lineTo(nearest.gf.x, nearest.gf.y);
          ctx.strokeStyle = "rgba(239, 68, 68, 0.3)";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = "8px monospace";
        ctx.textAlign = "center";
        ctx.fillText(v.id, v.x, v.y - 12);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const handleOpenReport = useCallback(() => {
    openReport("frota");
  }, [openReport]);

  return (
    <motion.div
      className="min-h-full flex flex-col lg:flex-row gap-4 px-4 md:px-8 py-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Map Area */}
      <div className="flex-1">
        <div className="glass rounded-2xl p-4 h-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: "#10B981",
                  boxShadow: "0 0 6px #10B981",
                }}
              />
              <span className="text-xs font-mono tracking-wider text-green-400/70">
                MAPA DE RASTREAMENTO — TEMPO REAL
              </span>
            </div>
            <motion.button
              className="glass rounded-lg px-4 py-1.5 text-[10px] font-mono tracking-wider text-green-400/70 cursor-pointer"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 15px rgba(16, 185, 129, 0.2)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenReport}
            >
              📄 RELATÓRIO TRÁFEGO
            </motion.button>
          </div>
          <canvas
            ref={canvasRef}
            className="w-full rounded-xl"
            style={{ aspectRatio: "8/5" }}
          />
          <div className="mt-3 flex flex-wrap gap-4 text-[9px] font-mono text-white/30">
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />
              Dentro do geofence
            </span>
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />
              Fora do geofence
            </span>
            <span>Veículos ativos: {vehiclesRef.current.length}</span>
            <span>Geofences: {GEOFENCES.length}</span>
          </div>
        </div>
      </div>

      {/* GPS Log Sidebar */}
      <div className="w-full lg:w-80">
        <div className="glass rounded-2xl p-4 h-full max-h-[calc(100vh-8rem)] overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono tracking-wider text-green-400/50">
              LOGS GPS
            </span>
          </div>
          <div className="space-y-1.5 overflow-hidden">
            {logs.map((log, i) => (
              <motion.div
                key={log.id}
                className="glass rounded-lg px-3 py-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1 - i * 0.04, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-green-400/60">
                    {log.plate}
                  </span>
                  <span className="text-[9px] font-mono text-white/20">
                    {log.time}
                  </span>
                </div>
                <div className="text-[8px] font-mono text-white/20 mt-0.5">
                  {log.lat}, {log.lng} | {log.speed} km/h
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
