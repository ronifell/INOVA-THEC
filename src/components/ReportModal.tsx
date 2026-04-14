"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { useStore } from "@/store/useStore";
import { generateMockHash } from "@/lib/crypto";

function HolographicSeal() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative inline-flex flex-col items-center cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
    >
      {/* Metallic seal outer */}
      <div
        className="relative w-24 h-24 rounded-full flex items-center justify-center"
        style={{
          background:
            "conic-gradient(from 0deg, #c0c0c0, #ffd700, #c0c0c0, #b8860b, #c0c0c0, #ffd700, #c0c0c0)",
          boxShadow: isHovered
            ? "0 0 30px rgba(255, 215, 0, 0.4), inset 0 0 15px rgba(255, 215, 0, 0.2)"
            : "0 0 10px rgba(192, 192, 192, 0.2)",
        }}
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-[8px] font-mono text-amber-300/70 tracking-wider">
              SELO
            </div>
            <div className="text-[10px] font-bold text-amber-200/90 tracking-widest">
              AP-04
            </div>
            <div className="text-[7px] font-mono text-amber-300/50">
              FÉ PÚBLICA
            </div>
          </div>
        </div>
      </div>

      {/* QR Code (visible on hover) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute -bottom-24 bg-white p-2 rounded-lg shadow-xl"
            initial={{ opacity: 0, y: -10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
          >
            <QRCodeSVG
              value={`https://inovathec.com.br/verify/${generateMockHash().substring(0, 16)}`}
              size={80}
              level="M"
            />
            <p className="text-[7px] text-center text-gray-500 mt-1 font-mono">
              VALIDAÇÃO
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RotatingWatermark({ org }: { org: string }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
      style={{ perspective: "800px" }}
    >
      <motion.div
        className="text-6xl font-bold tracking-[0.5em] select-none"
        style={{
          color: "rgba(0, 0, 0, 0.03)",
          transformStyle: "preserve-3d",
        }}
        animate={{
          rotateY: 360,
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {org}
      </motion.div>
    </div>
  );
}

export default function ReportModal() {
  const { showReport, reportType, closeReport } = useStore();

  const reportData = useMemo(() => {
    if (reportType === "frota") {
      return {
        title: "RELATÓRIO DE TRÁFEGO E CONSUMO",
        subtitle: "SIG-FROTA — Rastreamento Veicular",
        org: "TCE/AC",
        color: "#10B981",
        sections: [
          {
            title: "1. DADOS DO VEÍCULO",
            content: [
              "Placa: ABC-1234 | Modelo: Hilux SW4 2023",
              "Lotação: Secretaria de Administração",
              "Responsável: João Silva — Matrícula 12345",
            ],
          },
          {
            title: "2. CONSUMO DE COMBUSTÍVEL",
            content: [
              "Média Calculada (KSD): 8.2 km/L",
              "Referência Fabricante: 7.5 - 9.0 km/L",
              "Status: ✅ DENTRO DO PADRÃO",
              "Volume: 45L | Capacidade Tanque: 80L",
            ],
          },
          {
            title: "3. GEOLOCALIZAÇÃO",
            content: [
              "Coordenadas Posto: -9.974560, -67.810390",
              "Coordenadas Veículo: -9.974612, -67.810422",
              "Distância: 12.4m | Limite: 500m",
              "Status Geofencing: ✅ VALIDADO",
            ],
          },
          {
            title: "4. CADEIA DE CUSTÓDIA",
            content: [
              `Hash SHA-256: ${generateMockHash()}`,
              "Encadeamento: GENESIS → BLOCK_001 → BLOCK_002",
              "Timestamp Servidor: 2026-03-15T14:23:47.892-05:00",
              "Classificação: FÉ_PÚBLICA_AP04",
            ],
          },
        ],
      };
    }
    return {
      title: "LAUDO DE EXISTÊNCIA E CONSERVAÇÃO",
      subtitle: "SIG-PATRIMÔNIO — Inspeção Pericial",
      org: "CGM",
      color: "#3B82F6",
      sections: [
        {
          title: "1. IDENTIFICAÇÃO DO BEM",
          content: [
            "Tombo: PAT-2024-001847",
            "Descrição: Veículo Hilux SW4 2023",
            "Localização: Garagem Central — Bloco B",
            "Responsável: Maria Oliveira — Matrícula 67890",
          ],
        },
        {
          title: "2. ESTADO DE CONSERVAÇÃO",
          content: [
            "Avaliação: BOM",
            "Última Vistoria: 12/03/2026",
            "Próxima Vistoria: 12/06/2026",
            "Observações: Sem avarias visíveis",
          ],
        },
        {
          title: "3. MOVIMENTAÇÃO",
          content: [
            "Remetente: Secretaria de Obras",
            "Destinatário: Secretaria de Administração",
            "Data: 10/03/2026 14:30",
            "Motivo: Remanejamento por demanda operacional",
          ],
        },
        {
          title: "4. INTEGRIDADE DIGITAL",
          content: [
            `Hash SHA-256: ${generateMockHash()}`,
            "Foto Hash: VERIFICADO ✅",
            "Cadeia: Registro #247 → Encadeado",
            "Classificação: FÉ_PÚBLICA_AP04",
          ],
        },
      ],
    };
  }, [reportType]);

  return (
    <AnimatePresence>
      {showReport && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeReport}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Document */}
          <motion.div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl"
            initial={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="bg-white text-gray-900 p-8 md:p-12 relative overflow-hidden">
              <RotatingWatermark org={reportData.org} />

              {/* Close button */}
              <button
                onClick={closeReport}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors z-10 cursor-pointer"
              >
                ✕
              </button>

              {/* Header */}
              <div className="relative text-center mb-8 border-b-2 border-gray-100 pb-6">
                <div
                  className="inline-block px-4 py-1 rounded-full text-[10px] font-mono tracking-widest mb-3"
                  style={{
                    background: `${reportData.color}15`,
                    color: reportData.color,
                    border: `1px solid ${reportData.color}30`,
                  }}
                >
                  DOCUMENTO OFICIAL — PROTOCOLO AP-04
                </div>
                <h2 className="text-xl font-bold tracking-wide text-gray-800">
                  {reportData.title}
                </h2>
                <p className="text-xs text-gray-400 mt-1 font-mono">
                  {reportData.subtitle}
                </p>
              </div>

              {/* Content Sections */}
              <div className="relative space-y-6">
                {reportData.sections.map((section, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <h3
                      className="text-sm font-bold mb-2"
                      style={{ color: reportData.color }}
                    >
                      {section.title}
                    </h3>
                    <div className="space-y-1">
                      {section.content.map((line, j) => (
                        <p
                          key={j}
                          className="text-xs text-gray-600 font-mono leading-relaxed"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer with Holographic Seal */}
              <div className="relative mt-10 pt-6 border-t-2 border-gray-100">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] font-mono text-gray-300">
                      Gerado em: {new Date().toLocaleString("pt-BR")}
                    </p>
                    <p className="text-[9px] font-mono text-gray-300">
                      Validade: Permanente — Cadeia Imutável
                    </p>
                    <p className="text-[9px] font-mono text-gray-300">
                      Inova Thec — Sistema de Gestão Pública Inteligente
                    </p>
                  </div>
                  <HolographicSeal />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
