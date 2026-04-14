"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import Header from "@/components/Header";
import ScanLine from "@/components/ScanLine";
import GlitchOverlay from "@/components/GlitchOverlay";
import CursorTrail from "@/components/CursorTrail";
import LiquidTransition from "@/components/LiquidTransition";
import Dashboard from "@/components/Dashboard";
import BackButton from "@/components/BackButton";
import ReportModal from "@/components/ReportModal";
import { getModuleById } from "@/lib/modules";
import { appShellContainer, appShellFadeUp } from "@/lib/motionVariants";

const Background3D = dynamic(() => import("@/components/Background3D"), {
  ssr: false,
});

const SigFrota = dynamic(() => import("@/components/SigFrota"), {
  ssr: false,
});

const SigPatrimonio = dynamic(() => import("@/components/SigPatrimonio"), {
  ssr: false,
});

const ModulePlaceholder = dynamic(
  () => import("@/components/ModulePlaceholder"),
  { ssr: false }
);

const BootScreen = dynamic(() => import("@/components/BootScreen"), {
  ssr: false,
});

function ActiveModuleView() {
  const activeModule = useStore((s) => s.activeModule);

  const module = useMemo(
    () => (activeModule ? getModuleById(activeModule) : null),
    [activeModule]
  );

  if (!module) return null;

  if (module.id === "frota") return <SigFrota />;
  if (module.id === "patrimonio") return <SigPatrimonio />;
  return <ModulePlaceholder />;
}

function ThemeColorUpdater() {
  const themeColor = useStore((s) => s.themeColor);
  const themeColorRgb = useStore((s) => s.themeColorRgb);

  useEffect(() => {
    document.documentElement.style.setProperty("--theme-color", themeColor);
    document.documentElement.style.setProperty("--theme-rgb", themeColorRgb);
  }, [themeColor, themeColorRgb]);

  return null;
}

export default function Home() {
  const activeModule = useStore((s) => s.activeModule);
  const isGlitching = useStore((s) => s.isGlitching);
  const [mounted, setMounted] = useState(false);
  const [bootDone, setBootDone] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
            <span className="text-white font-bold text-lg">IT</span>
          </div>
          <p className="text-[10px] font-mono tracking-[0.3em] text-white/30">
            INICIALIZANDO SISTEMA
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full overflow-y-auto ${isGlitching ? "glitch-active" : ""}`}>
      <ThemeColorUpdater />

      <Background3D />

      {!bootDone && (
        <BootScreen onComplete={() => setBootDone(true)} />
      )}

      {bootDone && (
        <motion.div
          className="flex min-h-full flex-col"
          variants={appShellContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="pointer-events-none" variants={appShellFadeUp}>
            <ScanLine />
            <CursorTrail />
            <LiquidTransition />
            <GlitchOverlay />
          </motion.div>

          <Header />

          <motion.main
            className="relative z-10 min-h-full flex-1"
            variants={appShellFadeUp}
          >
            <AnimatePresence mode="wait">
              {activeModule ? (
                <motion.div
                  key={activeModule}
                  initial={{ opacity: 0, x: 36 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -28 }}
                  transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ActiveModuleView />
                </motion.div>
              ) : (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Dashboard />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.main>

          <motion.div variants={appShellFadeUp}>
            <BackButton />
          </motion.div>

          <ReportModal />
        </motion.div>
      )}
    </div>
  );
}
