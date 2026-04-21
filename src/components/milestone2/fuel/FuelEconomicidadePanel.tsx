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
      className={`w-full rounded-xl border-2 px-4 py-4 text-[11px] font-mono uppercase tracking-[0.16em] ${
        generated
          ? "master-faith-metallic border-amber-400/45"
          : "cursor-not-allowed border-white/10 bg-zinc-900 text-zinc-500"
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
        lockedHash={generateMockHash()}
        custodyFirstCheck={generated}
        accentRgb="16, 185, 129"
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setCrossKmLiters((v) => !v)}
            className={`w-full rounded-lg border px-3 py-2 text-left text-xs font-mono ${
              crossKmLiters
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-100"
                : "border-white/15 bg-white/5 text-white/70"
            }`}
          >
            KM percorrido vs. Litros consumidos
          </button>
          <button
            type="button"
            onClick={() => setCrossMonth((v) => !v)}
            className={`w-full rounded-lg border px-3 py-2 text-left text-xs font-mono ${
              crossMonth
                ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-100"
                : "border-white/15 bg-white/5 text-white/70"
            }`}
          >
            Gasto atual vs. média do mês anterior
          </button>
          <button
            type="button"
            onClick={() => setAlertDev((v) => !v)}
            className={`w-full rounded-lg border px-3 py-2 text-left text-xs font-mono ${
              alertDev
                ? "border-red-500/55 bg-red-950/55 text-red-200"
                : "border-white/15 bg-white/5 text-white/70"
            }`}
          >
            Desvio de consumo
          </button>
          <button
            type="button"
            onClick={() => setGenerated(true)}
            className="fuel-neon-action-btn w-full rounded-xl border border-emerald-500/45 bg-emerald-600 px-4 py-3 text-xs font-bold uppercase tracking-wide text-white"
          >
            Gerar gráfico de economicidade
          </button>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-black/35 p-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-white/45">
              Velocímetro de eficiência da frota
            </p>
            <div className="mt-3 h-28">
              <svg viewBox="0 0 240 120" className="h-full w-full" aria-hidden>
                <path d="M 20 110 A 100 100 0 0 1 220 110" fill="none" stroke="rgba(148,163,184,0.35)" strokeWidth="8" />
                <path d="M 20 110 A 100 100 0 0 1 220 110" fill="none" stroke={efficiency >= 65 ? "#10b981" : "#ef4444"} strokeWidth="8" strokeDasharray={`${(efficiency / 100) * 314} 400`} />
                <motion.line
                  x1="120"
                  y1="110"
                  x2={120 + 74 * Math.cos(Math.PI * (1 - efficiency / 100))}
                  y2={110 - 74 * Math.sin(Math.PI * (1 - efficiency / 100))}
                  stroke="#e2e8f0"
                  strokeWidth="3"
                />
              </svg>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/35 p-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-white/45">
              Painel de economia (R$)
            </p>
            <p className="mt-2 font-mono text-2xl text-emerald-300">
              R$ {savings.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/35 p-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-white/45">
              Tendência de despesas
            </p>
            <svg className="mt-2 h-20 w-full" viewBox="0 0 300 120" preserveAspectRatio="none">
              <motion.polyline
                fill="none"
                stroke={alertDev ? "#ef4444" : "#10b981"}
                strokeWidth="3"
                points={alertDev ? "0,36 55,38 110,52 165,58 220,63 300,78" : "0,72 55,65 110,58 165,52 220,45 300,38"}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 6, repeat: Infinity }}
              />
            </svg>
          </div>
        </div>
      </div>
    </Operational6040Workspace>
  );
}

