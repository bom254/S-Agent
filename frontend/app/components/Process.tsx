"use client";

import { motion } from "framer-motion";
import { Newspaper, BrainCircuit, TrendingUp, Bell } from "lucide-react";
import { useInView } from "../hooks/useInView";

const steps = [
  {
    icon: Newspaper,
    label: "01",
    title: "Ingest News",
    desc: "Pulls fresh articles from CryptoPanic — the leading crypto news aggregator",
    tags: ["100+ Sources", "Real-time"],
  },
  {
    icon: BrainCircuit,
    label: "02",
    title: "AI Analysis",
    desc: "Qwen3.5 reads, summarizes, and extracts sentiment + key takeaways",
    tags: ["Sentiment Score", "NLP"],
  },
  {
    icon: TrendingUp,
    label: "03",
    title: "Signal Generation",
    desc: "Detects patterns: sentiment spikes, catalysts, narrative shifts",
    tags: ["Pattern Detection", "High-Probability"],
  },
  {
    icon: Bell,
    label: "04",
    title: "Alert & Act",
    desc: "Custom alerts and trade-ready parameters for your approval",
    tags: ["Custom Rules", "Execution Ready"],
  },
];

export default function Process() {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section
      id="process"
      ref={ref}
      className="relative min-h-screen flex items-center py-32 px-6 z-30 pointer-events-none"
    >
      <div className="w-full max-w-4xl pointer-events-auto">
        <motion.div
          className="mb-12 flex items-center gap-4"
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-brand-orange">
            How It Works
          </span>
          <div className="w-12 h-[1px] bg-white/20" />
        </motion.div>

        <motion.h2
          className="font-[family-name:var(--font-orbitron)] text-4xl md:text-5xl lg:text-6xl font-light uppercase leading-tight"
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="text-white/20">From Signal </span>
          <span className="text-white">To Trade</span>
        </motion.h2>

        <div className="mt-16 relative">
          <div className="absolute left-5 top-0 bottom-0 w-[1px] bg-white/10" />

          {steps.map((step, index) => (
            <motion.div
              key={step.label}
              className="relative pl-16 pb-12 last:pb-0"
              initial={{ opacity: 0, x: -40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
            >
              <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-black border border-white/20 flex items-center justify-center">
                <step.icon size={18} className="text-brand-orange" />
              </div>

              <div className="pt-1">
                <span className="font-[family-name:var(--font-mono)] text-xs text-white/30">
                  {step.label}
                </span>
                <h3 className="mt-1 text-xl text-white font-[family-name:var(--font-orbitron)] font-light">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-white/50 font-[family-name:var(--font-space)]">
                  {step.desc}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {step.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-[family-name:var(--font-mono)] text-brand-orange border border-brand-orange/30 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}