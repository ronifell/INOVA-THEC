"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { generateMockHash } from "@/lib/crypto";

interface Asset {
  id: string;
  tombo: string;
  name: string;
  lastInspection: string;
  hash: string;
  category: string;
  situation: string;
  gradient: string;
}

const MOCK_ASSETS: Asset[] = [
  {
    id: "1",
    tombo: "PAT-2024-001847",
    name: "Veículo Hilux SW4 2023",
    lastInspection: "12/03/2026",
    hash: generateMockHash(),
    category: "VEÍCULOS",
    situation: "ATIVO",
    gradient: "from-blue-900/40 to-blue-800/20",
  },
  {
    id: "2",
    tombo: "PAT-2024-003291",
    name: "Servidor Dell PowerEdge R750",
    lastInspection: "08/02/2026",
    hash: generateMockHash(),
    category: "INFORMÁTICA",
    situation: "ATIVO",
    gradient: "from-indigo-900/40 to-indigo-800/20",
  },
  {
    id: "3",
    tombo: "PAT-2024-005643",
    name: "Mesa de Reunião 12 Lugares",
    lastInspection: "20/01/2026",
    hash: generateMockHash(),
    category: "MOBILIÁRIO",
    situation: "ATIVO",
    gradient: "from-slate-800/40 to-slate-700/20",
  },
  {
    id: "4",
    tombo: "PAT-2024-007812",
    name: "Ar Condicionado Split 60k BTU",
    lastInspection: "15/03/2026",
    hash: generateMockHash(),
    category: "CLIMATIZAÇÃO",
    situation: "ATIVO",
    gradient: "from-cyan-900/40 to-cyan-800/20",
  },
  {
    id: "5",
    tombo: "PAT-2023-012458",
    name: "Impressora Multifuncional HP",
    lastInspection: "28/02/2026",
    hash: generateMockHash(),
    category: "INFORMÁTICA",
    situation: "BAIXA",
    gradient: "from-gray-900/40 to-gray-800/20",
  },
  {
    id: "6",
    tombo: "PAT-2024-009384",
    name: "Gerador de Energia 150kVA",
    lastInspection: "05/03/2026",
    hash: generateMockHash(),
    category: "EQUIPAMENTO",
    situation: "ATIVO",
    gradient: "from-amber-900/40 to-amber-800/20",
  },
];

export default function SigPatrimonio() {
  const openReport = useStore((s) => s.openReport);
  const [mousePos, setMousePos] = useState<{
    x: number;
    y: number;
    cardId: string | null;
  }>({ x: 0, y: 0, cardId: null });
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleMouseMove = useCallback(
    (e: React.MouseEvent, assetId: string) => {
      const card = cardRefs.current.get(assetId);
      if (!card) return;
      const rect = card.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        cardId: assetId,
      });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0, cardId: null });
  }, []);

  const handleOpenReport = useCallback(() => {
    openReport("patrimonio");
  }, [openReport]);

  const setCardRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) cardRefs.current.set(id, el);
      else cardRefs.current.delete(id);
    },
    []
  );

  return (
    <motion.div
      className="min-h-full px-4 md:px-8 py-24 cursor-crosshair"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: "#3B82F6",
              boxShadow: "0 0 6px #3B82F6",
            }}
          />
          <span className="text-xs font-mono tracking-wider text-blue-400/70">
            GALERIA DE PATRIMÔNIO — INSPEÇÃO RAIO-X
          </span>
        </div>
        <motion.button
          className="glass rounded-lg px-4 py-1.5 text-[10px] font-mono tracking-wider text-blue-400/70 cursor-pointer"
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 15px rgba(59, 130, 246, 0.2)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenReport}
        >
          📄 LAUDO CONSERVAÇÃO
        </motion.button>
      </div>

      {/* Asset Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
        {MOCK_ASSETS.map((asset, i) => (
          <motion.div
            key={asset.id}
            ref={setCardRef(asset.id)}
            className="relative overflow-hidden rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            onMouseMove={(e) => handleMouseMove(e, asset.id)}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className={`glass rounded-2xl p-5 h-full bg-gradient-to-br ${asset.gradient} relative`}
            >
              {/* Simulated photo area */}
              <div className="relative h-36 rounded-xl overflow-hidden mb-4 bg-black/30">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl opacity-20">
                    {asset.category === "VEÍCULOS"
                      ? "🚗"
                      : asset.category === "INFORMÁTICA"
                        ? "💻"
                        : asset.category === "MOBILIÁRIO"
                          ? "🪑"
                          : asset.category === "CLIMATIZAÇÃO"
                            ? "❄️"
                            : asset.category === "EQUIPAMENTO"
                              ? "⚡"
                              : "📦"}
                  </div>
                </div>

                {/* X-Ray inspection overlay */}
                {mousePos.cardId === asset.id && (
                  <div
                    className="absolute pointer-events-none z-10"
                    style={{
                      left: mousePos.x - 70,
                      top: mousePos.y - 70,
                      width: 140,
                      height: 140,
                    }}
                  >
                    <div
                      className="w-full h-full rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
                        border: "1px solid rgba(59, 130, 246, 0.4)",
                        boxShadow:
                          "0 0 20px rgba(59, 130, 246, 0.2), inset 0 0 20px rgba(59, 130, 246, 0.1)",
                      }}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
                        <span className="text-[8px] font-mono text-blue-300/80 tracking-wider">
                          {asset.tombo}
                        </span>
                        <span className="text-[7px] font-mono text-blue-300/50 mt-1">
                          Vistoria: {asset.lastInspection}
                        </span>
                        <span className="text-[6px] font-mono text-blue-300/40 mt-1 break-all leading-tight">
                          {asset.hash.substring(0, 24)}...
                        </span>
                      </div>
                    </div>
                    {/* Crosshair lines */}
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-blue-400/20" />
                    <div className="absolute left-1/2 top-0 h-full w-[1px] bg-blue-400/20" />
                  </div>
                )}

                {/* Scan lines */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(59, 130, 246, 0.03) 2px, rgba(59, 130, 246, 0.03) 4px)",
                  }}
                />
              </div>

              {/* Asset Info */}
              <h3 className="text-sm font-bold text-white/80 mb-1">
                {asset.name}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-blue-400/50">
                  {asset.tombo}
                </span>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                    asset.situation === "ATIVO"
                      ? "bg-green-500/10 text-green-400/60"
                      : "bg-red-500/10 text-red-400/60"
                  }`}
                >
                  {asset.situation}
                </span>
              </div>
              <div className="mt-2 text-[8px] font-mono text-white/15 break-all">
                SHA-256: {asset.hash.substring(0, 32)}...
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
