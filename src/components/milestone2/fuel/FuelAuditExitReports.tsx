"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateMockHash } from "@/lib/crypto";
import Operational6040Workspace from "@/components/audit/Operational6040Workspace";
import AuditPresentationHeader from "./AuditPresentationHeader";

type ReportId = "tce" | "cge" | "mp" | "fe-publica" | "galao";

const REPORTS: { id: ReportId; label: string; desc: string }[] = [
  { id: "tce", label: "1. RELATÓRIO TCE", desc: "Legalidade e conformidade contábil da frota." },
  { id: "cge", label: "2. RELATÓRIO CGE / CGM", desc: "Auditoria interna estadual/municipal." },
  { id: "mp", label: "3. RELATÓRIO MP", desc: "Inteligência para fraude e improbidade." },
  { id: "fe-publica", label: "4. RELATÓRIO FÉ PÚBLICA (AP-04)", desc: "Documento mestre da cadeia SHA-256." },
  { id: "galao", label: "5. RELATÓRIO FISCALIZAÇÃO DE GALÃO", desc: "Evidência crítica com GPS e horário." },
];

export default function FuelAuditExitReports() {
  const [selected, setSelected] = useState<ReportId>("tce");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [hash, setHash] = useState<string | null>(null);

  const generate = async () => {
    setGenerating(true);
    setGenerated(false);
    setHash(null);
    await new Promise((r) => window.setTimeout(r, 1200));
    setHash(generateMockHash());
    setGenerating(false);
    setGenerated(true);
  };

  return (
    <Operational6040Workspace
      variant="frota"
      title="MÓDULO DE SAÍDA E AUDITORIA FINAL"
      subtitle="Emissão dos 5 relatórios oficiais com blindagem criptográfica"
      goldSealActive={generated}
      footerSlot={
        <button
          type="button"
          onClick={() => void generate()}
          className="fuel-neon-action-btn w-full rounded-xl border border-cyan-400/40 bg-cyan-600/70 px-4 py-3 text-xs font-bold uppercase tracking-wide text-white"
        >
          {generating ? "Gerando relatório..." : "Gerar relatório selecionado"}
        </button>
      }
    >
      <AuditPresentationHeader
        hashState={generated ? "locked" : "spinning"}
        lockedHash={hash ?? undefined}
        custodyFirstCheck={generated}
        accentRgb="16, 185, 129"
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-2">
          {REPORTS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelected(r.id)}
              className={`w-full rounded-xl border px-3 py-3 text-left ${
                selected === r.id
                  ? "border-emerald-400/55 bg-emerald-500/15 text-emerald-100"
                  : "border-white/12 bg-white/5 text-white/75"
              }`}
            >
              <p className="text-xs font-mono font-semibold tracking-wider">{r.label}</p>
              <p className="mt-1 text-[11px] leading-snug text-white/55">{r.desc}</p>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-xl border border-white/15 bg-slate-700/50 p-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-white/45">
              Segurança ativa
            </p>
            <p className="mt-2 text-xs text-white/65">
              Marca d'água, hash SHA-256 no rodapé e QR Code de validação.
            </p>
            <div className="mt-3 rounded-lg border border-white/10 bg-slate-950/80 p-2">
              <p className="break-all font-mono text-[10px] text-emerald-300/85">
                {generateMockHash()} {generateMockHash().slice(0, 18)}
              </p>
            </div>
            <motion.div
              className="pointer-events-none absolute left-0 right-0 h-[0.28%] bg-cyan-300"
              animate={
                generating
                  ? { top: ["12%", "90%", "12%"], opacity: [0.7, 1, 0.7] }
                  : { top: "12%", opacity: 0 }
              }
              transition={generating ? { duration: 1.25, repeat: Infinity } : { duration: 0.2 }}
              style={{ boxShadow: "0 0 18px rgba(34,211,238,0.95)" }}
            />
          </div>

          <div className="rounded-xl border border-white/15 bg-slate-700/45 p-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-white/45">
              Pré-visualização oficial
            </p>
            <div className="mt-2 grid grid-cols-[1fr_auto] gap-3">
              <div className="rounded border border-white/10 bg-white/5 p-2 text-[11px] text-white/70">
                <p className="font-semibold text-white/85">{REPORTS.find((r) => r.id === selected)?.label}</p>
                <p className="mt-1">{REPORTS.find((r) => r.id === selected)?.desc}</p>
                <p className="mt-3 text-[10px] font-mono text-white/45">Rodapé hash: {hash ?? "pendente"}</p>
              </div>
              <div className="flex h-[12vh] min-h-[8%] w-[12vh] min-w-[8%] items-center justify-center rounded border border-emerald-400/40 bg-emerald-500/10 text-[min(1.1vmin,1.1vw)] font-mono text-emerald-200">
                QR
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {generated && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-emerald-500/35 bg-emerald-950/35 px-3 py-2 text-xs text-emerald-100"
          >
            Documento pericial emitido com sucesso. Pronto para TCE/CGE-CGM/MP.
          </motion.p>
        )}
      </AnimatePresence>
    </Operational6040Workspace>
  );
}

