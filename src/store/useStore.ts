import { create } from "zustand";

export type HashDisplayPhase = "idle" | "flash" | "validated";

interface AppState {
  activeModule: string | null;
  themeColor: string;
  themeColorRgb: string;
  isGlitching: boolean;
  showReport: boolean;
  reportType: "frota" | "patrimonio" | null;
  integrityCount: number;
  audioEnabled: boolean;
  hashDisplay: string | null;
  isValidating: boolean;
  /** Memorial AP-04: parada + flash + [HASH VALIDADO] */
  hashDisplayPhase: HashDisplayPhase;

  setActiveModule: (id: string | null, color?: string, rgb?: string) => void;
  triggerGlitch: () => void;
  openReport: (type: "frota" | "patrimonio") => void;
  closeReport: () => void;
  incrementIntegrity: () => void;
  toggleAudio: () => void;
  setHashDisplay: (hash: string | null) => void;
  setIsValidating: (v: boolean) => void;
  triggerHashValidation: () => void;
  goHome: () => void;
}

export const useStore = create<AppState>((set) => ({
  activeModule: null,
  themeColor: "#0F172A",
  themeColorRgb: "15, 23, 42",
  isGlitching: false,
  showReport: false,
  reportType: null,
  integrityCount: 2847,
  audioEnabled: true,
  hashDisplay: null,
  isValidating: false,
  hashDisplayPhase: "idle",

  setActiveModule: (id, color = "#0F172A", rgb = "15, 23, 42") =>
    set({ activeModule: id, themeColor: color, themeColorRgb: rgb }),

  triggerGlitch: () => {
    set({ isGlitching: true });
    setTimeout(() => set({ isGlitching: false }), 1500);
  },

  openReport: (type) => set({ showReport: true, reportType: type }),
  closeReport: () => set({ showReport: false, reportType: null }),

  incrementIntegrity: () =>
    set((s) => ({ integrityCount: s.integrityCount + 1 })),

  toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),

  setHashDisplay: (hash) => set({ hashDisplay: hash }),
  setIsValidating: (v) => set({ isValidating: v }),
  triggerHashValidation: () => {
    set({ hashDisplayPhase: "flash" });
    window.setTimeout(() => set({ hashDisplayPhase: "validated" }), 200);
    window.setTimeout(() => set({ hashDisplayPhase: "idle" }), 700);
  },

  goHome: () =>
    set({
      activeModule: null,
      themeColor: "#0F172A",
      themeColorRgb: "15, 23, 42",
    }),
}));
