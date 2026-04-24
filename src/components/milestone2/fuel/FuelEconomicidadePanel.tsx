"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Operational6040Workspace from "@/components/audit/Operational6040Workspace";
import AuditPresentationHeader from "./AuditPresentationHeader";
import { generateMockHash } from "@/lib/crypto";

export default function FuelEconomicidadePanel() {
  const [crossKmLiters, setCrossKmLiters] = useState(true);
  const [crossMonth, setCrossMonth] = useState(true);
  const [alertDev, setAlertDev] = useState(false);
  const [generated, setGenerated] = useState(false);

  const lockedHash = useMemo(() => generateMockHash(), []);

  const efficiency = useMemo(() => {
    let base = 74;
    if (crossKmLiters) base += 8;
    if (crossMonth) base += 7;
    if (alertDev) base -= 20;
    return Math.max(12, Math.min(96, base));
  }, [alertDev, crossKmLiters, crossMonth]);

  const savings = useMemo(() => {
    const base = 186420;
    const factor = efficiency / 100;
    return Math.round(base * factor);
  }, [efficiency]);

  const footerSlot = (
    <button
      type="button"
      disabled={!generated}
      className={`w-full rounded-lg border-2 px-3 py-2.5 text-[10px] font-mono uppercase tracking-[0.14em] sm:py-3 sm:text-[11px] ${
        generated
          ? "master-faith-metallic border-amber-400/45"
          : "cursor-not-allowed border-slate-500/35 bg-slate-600/45 text-slate-200/75"
      }`}
    >
      {generated ? "Relatório de economicidade consolidado" : "Aguardando geração"}
    </button>
  );

  return (
    <Operational6040Workspace
      variant="frota"
      title="ECONOMICIDADE — CÉREBRO SIG-FROTA"
      subtitle="Cruzamento de KM, litros e valor pago para prova de economia"
      footerSlot={footerSlot}
      goldSealActive={generated && !alertDev}
    >
      <AuditPresentationHeader
        hashState={generated ? "locked" : "spinning"}
        lockedHash={generated ? lockedHash : undefined}
        custodyFirstCheck={generated}
        accentRgb="16, 185, 129"
      />

      <div className="flex min-h-0 flex-col gap-2">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setCrossKmLiters((v) => !v)}
            className={`rounded-lg border px-2 py-1.5 text-left text-[9px] font-mono leading-snug sm:py-2 sm:text-[10px] ${
              crossKmLiters
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-100"
                : "border-white/15 bg-white/5 text-white/70"
            }`}
          >
            KM vs. litros
          </button>
          <button
            type="button"
            onClick={() => setCrossMonth((v) => !v)}
            className={`rounded-lg border px-2 py-1.5 text-left text-[9px] font-mono leading-snug sm:py-2 sm:text-[10px] ${
              crossMonth
                ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-100"
                : "border-white/15 bg-white/5 text-white/70"
            }`}
          >
            Gasto vs. mês ant.
          </button>
          <button
            type="button"
            onClick={() => setAlertDev((v) => !v)}
            className={`rounded-lg border px-2 py-1.5 text-left text-[9px] font-mono leading-snug sm:py-2 sm:text-[10px] ${
              alertDev
                ? "border-red-500/55 bg-red-900/40 text-red-200"
                : "border-white/15 bg-white/5 text-white/70"
            }`}
          >
            Desvio consumo
          </button>
          <button
            type="button"
            onClick={() => setGenerated(true)}
            className="fuel-neon-action-btn rounded-lg border border-emerald-500/45 bg-emerald-600 px-2 py-1.5 text-[9px] font-bold uppercase tracking-wide text-white sm:py-2 sm:text-[10px]"
          >
            Gerar gráfico
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <div className="rounded-lg border border-white/15 bg-slate-700/45 p-2">
            <p className="text-[8px] font-mono uppercase tracking-wider text-white/50 sm:text-[9px]">
              Eficiência
            </p>
            <div className="mt-1 h-16 w-full sm:h-[4.25rem]">
              <svg viewBox="0 0 240 120" className="h-full w-full" aria-hidden>
                <path
                  d="M 20 110 A 100 100 0 0 1 220 110"
                  fill="none"
                  stroke="rgba(148,163,184,0.35)"
                  strokeWidth="7"
                />
                <path
                  d="M 20 110 A 100 100 0 0 1 220 110"
                  fill="none"
                  stroke={efficiency >= 65 ? "#10b981" : "#ef4444"}
                  strokeWidth="7"
                  strokeDasharray={`${(efficiency / 100) * 314} 400`}
                />
                <motion.line
                  x1="120"
                  y1="110"
                  x2={120 + 70 * Math.cos(Math.PI * (1 - efficiency / 100))}
                  y2={110 - 70 * Math.sin(Math.PI * (1 - efficiency / 100))}
                  stroke="#e2e8f0"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </div>
          <div className="rounded-lg border border-white/15 bg-slate-700/45 p-2">
            <p className="text-[8px] font-mono uppercase tracking-wider text-white/50 sm:text-[9px]">
              Economia (R$)
            </p>
            <p className="mt-2 font-mono text-sm text-emerald-300 sm:text-base">
              R$ {savings.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="col-span-2 rounded-lg border border-white/15 bg-slate-700/45 p-2">
            <p className="text-[8px] font-mono uppercase tracking-wider text-white/50 sm:text-[9px]">
              Tendência
            </p>
            <svg className="mt-1 h-10 w-full sm:h-11" viewBox="0 0 300 120" preserveAspectRatio="none">
              <motion.polyline
                fill="none"
                stroke={alertDev ? "#ef4444" : "#10b981"}
                strokeWidth="2.5"
                points={
                  alertDev
                    ? "0,36 55,38 110,52 165,58 220,63 300,78"
                    : "0,72 55,65 110,58 165,52 220,45 300,38"
                }
                animate={{ opacity: [0.75, 1, 0.75] }}
                transition={{ duration: 6, repeat: Infinity }}
              />
            </svg>
          </div>
        </div>
      </div>
    </Operational6040Workspace>
  );
}
