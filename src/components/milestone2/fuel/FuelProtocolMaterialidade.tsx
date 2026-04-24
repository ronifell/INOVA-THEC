"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateSHA256 } from "@/lib/crypto";
import { validatePericialImageFile, MATERIALIDADE_REJECT_MSG } from "@/lib/pericialImageGate";
import Operational6040Workspace from "@/components/audit/Operational6040Workspace";
import AuditPresentationHeader from "./AuditPresentationHeader";
import TruckBlueprintHD from "./TruckBlueprintHD";
import GeoprocessingRadarMap from "./GeoprocessingRadarMap";
import type { FuelEvidenceSlot } from "./Milestone2FuelContext";
import { useMilestone2Fuel } from "./Milestone2FuelContext";

const SLOTS: { id: FuelEvidenceSlot; label: string; short: string }[] = [
  { id: "vedacao", label: "Evidência de Vedação (Captura do Lacre/Tanque)", short: "Vedação" },
  { id: "placa", label: "Identificação de Ativo (Captura da Placa)", short: "Placa" },
  { id: "hodometro", label: "Métrica de Desempenho (Captura do Hodômetro)", short: "Hodômetro" },
  { id: "bomba", label: "Validação de Insumo (Captura da Bomba do Posto)", short: "Bomba" },
];

/**
 * Botão 1 — Protocolo de materialidade pericial (tanque, vedação, insumo).
 */
export default function FuelProtocolMaterialidade() {
  const { setSlotPreview, setMaterialidadeTxnReady } = useMilestone2Fuel();
  const [lit, setLit] = useState<[boolean, boolean, boolean, boolean]>([
    false, false, false, false,
  ]);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [faithSeal, setFaithSeal] = useState(false);
  const [lockedHash, setLockedHash] = useState<string | null>(null);
  const [txnId, setTxnId] = useState<string | null>(null);
  const inputsRef = useRef<Record<FuelEvidenceSlot, HTMLInputElement | null>>({
    vedacao: null,
    placa: null,
    hodometro: null,
    bomba: null,
  });

  const allLit = lit.every(Boolean);

  const onFile = useCallback(
    async (slot: FuelEvidenceSlot, index: number, file: File | undefined) => {
      if (!file) return;
      setAlertMsg(null);
      const gate = await validatePericialImageFile(file);
      if (!gate.ok) {
        setAlertMsg(gate.message ?? MATERIALIDADE_REJECT_MSG);
        return;
      }
      const url = URL.createObjectURL(file);
      setSlotPreview(slot, url);
      setLit((prev) => {
        const n = [...prev] as [boolean, boolean, boolean, boolean];
        n[index] = true;
        return n;
      });
    },
    [setSlotPreview]
  );

  const commitFaith = useCallback(async () => {
    if (!allLit || faithSeal) return;
    const h = await generateSHA256(`MATERIALIDADE-TXN-${Date.now()}`);
    setLockedHash(h);
    setTxnId(`TXN-${h.slice(0, 8).toUpperCase()}`);
    setFaithSeal(true);
    setMaterialidadeTxnReady(true);
  }, [allLit, faithSeal, setMaterialidadeTxnReady]);

  const blueprint = useMemo(
    () => (
      <TruckBlueprintHD
        mode={{ kind: "materialidade", litZones: lit }}
      />
    ),
    [lit]
  );

  const mapBelow = useMemo(
    () => <GeoprocessingRadarMap variant={faithSeal ? "success" : "idle"} />,
    [faithSeal]
  );

  const footerSlot = (
    <div className="w-full space-y-2">
      {!allLit && (
        <p className="text-center text-[10px] font-mono text-amber-200/80">
          TXN bloqueada: complete as quatro evidências com nitidez pericial. A iluminação do vetor
          segue o protocolo.
        </p>
      )}
      {txnId && (
        <p className="text-center font-mono text-[10px] text-emerald-300/90">
          {txnId} · fé pública digital constituída
        </p>
      )}
      <button
        type="button"
        disabled={!allLit || faithSeal}
        onClick={commitFaith}
        className={`relative w-full rounded-xl border-2 px-3 py-3 text-center text-[10px] font-mono uppercase tracking-[0.16em] transition-all sm:px-4 sm:py-3.5 sm:text-[11px] ${
          faithSeal
            ? "cursor-default border-amber-400/50 bg-amber-500/15 text-amber-100"
            : allLit
              ? "master-faith-metallic border-amber-300/40"
              : "cursor-not-allowed border-slate-500/35 bg-slate-600/45 text-slate-200/80"
        }`}
      >
        {faithSeal
          ? "Fé pública digital — protocolo materialidade selado"
          : "Constituir fé pública digital — selo mestre AP-04"}
      </button>
    </div>
  );

  return (
    <Operational6040Workspace
      variant="frota"
      title="PROTOCOLO DE MATERIALIDADE PERICIAL"
      subtitle="Reservatório, vedação e insumo"
      blueprintCustom={blueprint}
      blueprintBelow={mapBelow}
      footerSlot={footerSlot}
      goldSealActive={faithSeal}
    >
      <AuditPresentationHeader
        hashState={faithSeal ? "locked" : "spinning"}
        lockedHash={lockedHash ?? undefined}
        custodyFirstCheck={false}
        accentRgb="16, 185, 129"
      />

      <div className="flex w-full flex-col gap-2">
        <p className="text-center text-[10px] leading-snug text-white/65 sm:text-[11px]">
          Quatro capturas obrigatórias. Sem nitidez, sem transação e sem iluminação do reservatório
          auditável.
        </p>

        <div className="mx-auto grid w-full max-w-2xl grid-cols-2 gap-2 sm:gap-2.5">
          {SLOTS.map((s, i) => (
            <div key={s.id} className="relative min-w-0">
              <input
                ref={(el) => {
                  inputsRef.current[s.id] = el;
                }}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => onFile(s.id, i, e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => inputsRef.current[s.id]?.click()}
                className={`fuel-neon-action-btn flex min-h-[4.25rem] w-full flex-col justify-center rounded-lg border border-emerald-400/35 px-2.5 py-2 text-left text-[10px] font-semibold leading-snug text-white shadow-md transition hover:brightness-110 sm:min-h-[4.5rem] sm:px-3 sm:py-2.5 sm:text-[11px] ${
                  lit[i] ? "ring-2 ring-emerald-300/80" : ""
                }`}
                style={{ background: "#059669" }}
              >
                <span className="block font-mono text-[9px] uppercase tracking-wider text-white/95 sm:text-[10px]">
                  {s.short}
                </span>
                <span className="mt-0.5 block line-clamp-2 text-[9px] sm:text-[10px]">{s.label}</span>
              </button>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {alertMsg && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-lg border border-red-500/40 bg-red-950/50 px-3 py-2 text-center text-xs text-red-100"
            >
              {alertMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Operational6040Workspace>
  );
}
