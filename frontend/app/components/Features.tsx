"use client";

import { motion } from "framer-motion";
import { Newspaper, BrainCircuit, Zap, TrendingUp, Bell, Shield } from "lucide-react";
import { useInView } from "../hooks/useInView";

const capabilities = [
  {
    icon: Newspaper,
    stat: "100+",
    title: "News Sources",
    subtitle: "Aggregated Daily",
  },
  {
    icon: BrainCircuit,
    stat: "Qwen3.5",
    title: "AI Analysis",
    subtitle: "GPU Accelerated",
  },
  {
    icon: Zap,
    stat: "24/7",
    title: "Autonomous",
    subtitle: "Zero Manual Input",
  },
  {
    icon: TrendingUp,
    stat: "Real-time",
    title: "Signal Gen",
    subtitle: "Pattern Detection",
  },
  {
    icon: Bell,
    stat: "Custom",
    title: "Alerts",
    subtitle: "Rule-based Triggers",
  },
  {
    icon: Shield,
    stat: "Zero-Trust",
    title: "Security",
    subtitle: "Encrypted Storage",
  },
];

export default function Features() {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section
      id="features"
      ref={ref}
      className="relative min-h-screen flex items-center justify-center py-32 px-6 z-30 pointer-events-none"
    >
      <div className="w-full max-w-6xl pointer-events-auto">
        <motion.div
          className="mb-12 flex items-center gap-4"
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="w-12 h-[1px] bg-white/20" />
          <span className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-brand-orange">
            Core Capabilities
          </span>
        </motion.div>

        <motion.h2
          className="font-[family-name:var(--font-orbitron)] text-4xl md:text-5xl lg:text-6xl font-light uppercase leading-tight"
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="text-white/20">Built for </span>
          <span className="text-white">Intelligent Trading</span>
        </motion.h2>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {capabilities.map((cap, index) => (
            <motion.div
              key={cap.title}
              className="rounded-2xl border border-white/6 bg-white/2 p-5 hover:bg-white/[0.04] transition-all"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4">
                <cap.icon size={20} className="text-brand-orange" />
              </div>
              <p className="font-[family-name:var(--font-mono)] text-2xl font-semibold text-white">
                {cap.stat}
              </p>
              <p className="mt-1 text-sm text-white/80 font-[family-name:var(--font-mono)]">
                {cap.title}
              </p>
              <p className="text-xs text-white/40 font-[family-name:var(--font-mono)]">
                {cap.subtitle}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}