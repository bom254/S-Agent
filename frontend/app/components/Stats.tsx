"use client";

import { motion } from "framer-motion";
import { useInView } from "../hooks/useInView";

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "50M+", label: "API Requests" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "150+", label: "Integrations" },
];

export default function Stats() {
  const { ref, isInView } = useInView({ threshold: 0.3 });

  return (
    <section
      id="stats"
      ref={ref}
      className="relative py-32 px-6 z-30 pointer-events-none"
    >
      <div className="max-w-6xl mx-auto pointer-events-auto">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
            >
              <p className="font-[family-name:var(--font-mono)] text-4xl md:text-5xl font-bold text-white">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-white/40 font-[family-name:var(--font-mono)] uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}