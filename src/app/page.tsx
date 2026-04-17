  "use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import Header from "@/components/Header";
import GlitchOverlay from "@/components/GlitchOverlay";
import CursorTrail from "@/components/CursorTrail";
import Dashboard from "@/components/Dashboard";
import BackButton from "@/components/BackButton";
import ReportModal from "@/components/ReportModal";
import { getModuleById } from "@/lib/modules";
import { appShellContainer, appShellFadeUp } from "@/lib/motionVariants";
import BootScreen from "@/components/BootScreen";

const SKIP_BOOT_ONCE_KEY = "skip-home-boot-once";
const APP_STAGE_WIDTH = 1920;
const APP_STAGE_HEIGHT = 1080;

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
  const [stageScale, setStageScale] = useState(1);
  /** Painel montado ao atingir 100% (cartões); overlay do boot some por cima com fade. */
  const [appRevealed, setAppRevealed] = useState(false);
  const [bootOverlay, setBootOverlay] = useState(true);

  const handleRevealMain = useCallback(() => {
    setAppRevealed(true);
  }, []);

  const handleBootExitComplete = useCallback(() => {
    setBootOverlay(false);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const shouldSkipBoot = sessionStorage.getItem(SKIP_BOOT_ONCE_KEY) === "1";
      if (shouldSkipBoot) {
        sessionStorage.removeItem(SKIP_BOOT_ONCE_KEY);
        setAppRevealed(true);
        setBootOverlay(false);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    const updateStageScale = () => {
      const widthScale = window.innerWidth / APP_STAGE_WIDTH;
      const heightScale = window.innerHeight / APP_STAGE_HEIGHT;
      setStageScale(Math.min(widthScale, heightScale));
    };

    updateStageScale();
    window.addEventListener("resize", updateStageScale);
    return () => window.removeEventListener("resize", updateStageScale);
  }, []);

  if (!mounted) {
    return (
      <div className="h-screen bg-[#0F172A] flex items-center justify-center">
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
    <div className={`fixed inset-0 overflow-hidden ${isGlitching ? "glitch-active" : ""}`}>
      <div className="absolute left-1/2 top-1/2" style={{ transform: `translate(-50%, -50%) scale(${stageScale})`, transformOrigin: "center center", width: APP_STAGE_WIDTH, height: APP_STAGE_HEIGHT }}>
        <ThemeColorUpdater />

        <Background3D />

        {bootOverlay && (
          <BootScreen
            onRevealMain={handleRevealMain}
            onExitComplete={handleBootExitComplete}
          />
        )}

        {appRevealed && (
          <motion.div
            className="relative z-20 flex h-full min-h-0 flex-col"
            variants={appShellContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="pointer-events-none" variants={appShellFadeUp}>
              <CursorTrail />
              <GlitchOverlay />
            </motion.div>

            <Header />

            <main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden pt-24 sm:pt-28">
              <AnimatePresence mode="wait">
                {activeModule ? (
                  <motion.div
                    key={activeModule}
                    className="min-h-0 flex-1 overflow-hidden"
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
                    className="flex h-full min-h-0 flex-1 flex-col"
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Dashboard />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            <motion.div variants={appShellFadeUp}>
              <BackButton />
            </motion.div>

            <ReportModal />
          </motion.div>
        )}
      </div>
    </div>
  );
}
