"use client";

import { motion } from "framer-motion";
import { Newspaper, BrainCircuit, Database, Cpu, Play, Activity, TrendingUp } from "lucide-react";
import { useInView } from "../hooks/useInView";

const features = [
  { icon: Newspaper, label: "Live News", desc: "Auto-ingests from CryptoPanic" },
  { icon: BrainCircuit, label: "AI Analysis", desc: "Qwen3.5 summarization" },
  { icon: Database, label: "Storage", desc: "NeonDB persistence" },
  { icon: Cpu, label: "GPU Power", desc: "Nosana decentralized" },
];

export default function Hero() {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section
      id="home"
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center z-10 pointer-events-none"
    >
      <div className="text-center pointer-events-auto max-w-4xl mx-auto px-6">
        <motion.div
          className="inline-flex items-center gap-2 px-3 py-1 mb-8 border border-white/10 rounded-full bg-white/5"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
          <span className="text-xs font-[family-name:var(--font-mono)] text-white/60 uppercase tracking-wider">
            Live Agent Running 24/7
          </span>
        </motion.div>

        <motion.h1
          className="font-[family-name:var(--font-orbitron)] text-5xl md:text-7xl lg:text-8xl font-extralight uppercase"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="text-white/20">S-Agent </span>
          <span className="text-white">*</span>
        </motion.h1>

        <motion.p
          className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-[family-name:var(--font-space)]"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Autonomous DeFi research agent. Reads crypto news, analyzes sentiment, generates trade signals — running 24/7 on decentralized GPUs.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-3 text-white/50">
              <f.icon size={18} className="text-brand-orange" />
              <span className="text-sm font-[family-name:var(--font-mono)]">{f.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="mt-12 flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <button className="px-6 py-3 bg-brand-orange text-black font-[family-name:var(--font-mono)] text-sm uppercase tracking-wider rounded-full hover:bg-brand-orange/90 transition-colors flex items-center gap-2">
            <Play size={16} />
            Run Agent
          </button>
          <button className="px-6 py-3 border border-white/20 text-white font-[family-name:var(--font-mono)] text-sm uppercase tracking-wider rounded-full hover:bg-white/5 transition-colors flex items-center gap-2">
            <Activity size={16} />
            View Signals
          </button>
        </motion.div>

        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="p-4 border border-white/6 bg-white/2 rounded-xl">
            <TrendingUp size={24} className="text-brand-orange mb-2" />
            <p className="text-2xl font-[family-name:var(--font-mono)] font-bold text-white">Sentiment Analysis</p>
            <p className="text-sm text-white/50 mt-1">AI extracts bullish/bearish signals from every article</p>
          </div>
          <div className="p-4 border border-white/6 bg-white/2 rounded-xl">
            <BrainCircuit size={24} className="text-brand-orange mb-2" />
            <p className="text-2xl font-[family-name:var(--font-mono)] font-bold text-white">Pattern Detection</p>
            <p className="text-sm text-white/50 mt-1">Spikes, catalysts, and narrative shifts auto-detected</p>
          </div>
          <div className="p-4 border border-white/6 bg-white/2 rounded-xl">
            <Activity size={24} className="text-brand-orange mb-2" />
            <p className="text-2xl font-[family-name:var(--font-mono)] font-bold text-white">Trade Signals</p>
            <p className="text-sm text-white/50 mt-1">High-probability setups ready for execution</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}