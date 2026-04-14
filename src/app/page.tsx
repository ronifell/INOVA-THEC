"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import Header from "@/components/Header";
import ScanLine from "@/components/ScanLine";
import GlitchOverlay from "@/components/GlitchOverlay";
import Dashboard from "@/components/Dashboard";
import BackButton from "@/components/BackButton";
import ReportModal from "@/components/ReportModal";
import { getModuleById } from "@/lib/modules";

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

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#0F172A] flex items-center justify-center z-50">
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center"
          animate={{
            boxShadow: [
              "0 0 10px rgba(16, 185, 129, 0.2)",
              "0 0 30px rgba(16, 185, 129, 0.4)",
              "0 0 10px rgba(16, 185, 129, 0.2)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-white font-bold text-lg">IT</span>
        </motion.div>
        <p className="text-[10px] font-mono tracking-[0.3em] text-white/30">
          INICIALIZANDO SISTEMA
        </p>
      </motion.div>
    </div>
  );
}

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

      <Suspense fallback={<LoadingScreen />}>
        <Background3D />
      </Suspense>

      <ScanLine />
      <GlitchOverlay />
      <Header />

      {/* Main Content */}
      <main className="relative z-20 min-h-full">
        <AnimatePresence mode="wait">
          {activeModule ? (
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <ActiveModuleView />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <Dashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BackButton />
      <ReportModal />
    </div>
  );
}
