"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type FuelEvidenceSlot = "vedacao" | "placa" | "hodometro" | "bomba";

type Previews = Record<FuelEvidenceSlot, string | null>;

type Milestone2FuelContextValue = {
  previews: Previews;
  setSlotPreview: (slot: FuelEvidenceSlot, objectUrl: string | null) => void;
  /** Transação só após protocolo de materialidade completo (Botão 1). */
  materialidadeTxnReady: boolean;
  setMaterialidadeTxnReady: (v: boolean) => void;
};

const Milestone2FuelContext = createContext<Milestone2FuelContextValue | null>(
  null
);

export function Milestone2FuelProvider({ children }: { children: ReactNode }) {
  const [previews, setPreviews] = useState<Previews>({
    vedacao: null,
    placa: null,
    hodometro: null,
    bomba: null,
  });
  const [materialidadeTxnReady, setMaterialidadeTxnReady] = useState(false);

  const setSlotPreview = useCallback(
    (slot: FuelEvidenceSlot, objectUrl: string | null) => {
      setPreviews((p) => {
        const prev = p[slot];
        if (prev && prev !== objectUrl) URL.revokeObjectURL(prev);
        return { ...p, [slot]: objectUrl };
      });
    },
    []
  );

  const value = useMemo(
    () => ({
      previews,
      setSlotPreview,
      materialidadeTxnReady,
      setMaterialidadeTxnReady,
    }),
    [previews, setSlotPreview, materialidadeTxnReady]
  );

  return (
    <Milestone2FuelContext.Provider value={value}>
      {children}
    </Milestone2FuelContext.Provider>
  );
}

export function useMilestone2Fuel(): Milestone2FuelContextValue {
  const c = useContext(Milestone2FuelContext);
  if (!c) {
    throw new Error("useMilestone2Fuel: fora do Milestone2FuelProvider");
  }
  return c;
}

export function useMilestone2FuelOptional(): Milestone2FuelContextValue | null {
  return useContext(Milestone2FuelContext);
}
