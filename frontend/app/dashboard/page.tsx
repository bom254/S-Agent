"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Square, Loader2, Activity, TrendingUp, FileText, RefreshCw } from "lucide-react";

interface AgentStatus {
  isRunning: boolean;
  isConfigured: boolean;
  lastAnalysis: string | null;
  articlesAnalyzed: number;
  model: string;
  provider: string;
}

interface Insight {
  id: number;
  articleId: number;
  summary: string;
  sentiment: string;
  tags: string[];
  keyPoints: string[];
  createdAt: string;
}

export default function Dashboard() {
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL) + "/api";

  useEffect(() => {
    fetchStatus();
    fetchInsights();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/agent/status`, { 
        cache: 'no-cache'
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch status:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await fetch(`${API_BASE}/insights?limit=20`, {
        cache: 'no-cache'
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setInsights(data.data.slice(0, 20));
      }
    } catch (err) {
      console.error("Failed to fetch insights:", err);
    }
  };

  const toggleAgent = async () => {
    setRunning(true);
    try {
      const endpoint = status?.isRunning ? "/agent/stop" : "/agent/start";
      await fetch(`${API_BASE}${endpoint}`, { 
        mode: 'cors',
        credentials: 'include',
        method: "POST" 
      });
      await fetchStatus();
    } catch (err) {
      console.error("Failed to toggle agent:", err);
    } finally {
      setRunning(false);
    }
  };

  const runAgent = async () => {
    setAnalyzing(true);
    try {
      await fetch(`${API_BASE}/agent/run?userId=default&limit=5`, { 
        method: "POST" 
      });
      await fetchStatus();
      await fetchInsights();
    } catch (err) {
      console.error("Failed to run agent:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const syncArticles = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/articles/sync`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        console.log(`Synced ${data.count} articles`);
      }
    } catch (err) {
      console.error("Failed to sync articles:", err);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-orange" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <motion.div
        className="fixed top-0 left-0 right-0 h-[1px] bg-white/40 z-50 origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5 }}
      />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="font-[family-name:var(--font-orbitron)] text-xl font-bold uppercase tracking-[0.3em]">
            S-Agent
          </a>
          <a
            href="/"
            className="text-xs font-[family-name:var(--font-mono)] text-white/50 hover:text-white uppercase tracking-wider"
          >
            Back to Home
          </a>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <motion.h1
          className="font-[family-name:var(--font-orbitron)] text-4xl md:text-5xl font-extralight uppercase"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Agent <span className="text-brand-orange">Dashboard</span>
        </motion.h1>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            className="p-6 border border-white/10 bg-white/5 rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-3 h-3 rounded-full ${status?.isRunning ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
              <span className="text-sm font-[family-name:var(--font-mono)] text-white/60 uppercase tracking-wider">
                Agent Status
              </span>
            </div>
            <p className="text-2xl font-[family-name:var(--font-mono)] font-bold">
              {status?.isRunning ? "Running" : "Stopped"}
            </p>
            <p className="text-sm text-white/50 mt-2 font-[family-name:var(--font-space)]">
              {status?.provider} • {status?.model}
            </p>
          </motion.div>

          <motion.div
            className="p-6 border border-white/10 bg-white/5 rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Activity size={20} className="text-brand-orange" />
              <span className="text-sm font-[family-name:var(--font-mono)] text-white/60 uppercase tracking-wider">
                Articles Analyzed
              </span>
            </div>
            <p className="text-2xl font-[family-name:var(--font-mono)] font-bold">
              {status?.articlesAnalyzed || 0}
            </p>
            <p className="text-sm text-white/50 mt-2 font-[family-name:var(--font-space)]">
              {status?.lastAnalysis ? `Last: ${new Date(status.lastAnalysis).toLocaleString()}` : "No analysis yet"}
            </p>
          </motion.div>

          <motion.div
            className="p-6 border border-white/10 bg-white/5 rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp size={20} className="text-brand-orange" />
              <span className="text-sm font-[family-name:var(--font-mono)] text-white/60 uppercase tracking-wider">
                Insights Generated
              </span>
            </div>
            <p className="text-2xl font-[family-name:var(--font-mono)] font-bold">{insights.length}</p>
            <p className="text-sm text-white/50 mt-2 font-[family-name:var(--font-space)]">
              Latest market insights
            </p>
          </motion.div>
        </div>

        <motion.div
          className="mt-8 flex flex-wrap gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={syncArticles}
            disabled={syncing}
            className="px-6 py-3 border border-white/20 text-white font-[family-name:var(--font-mono)] text-sm uppercase tracking-wider rounded-full hover:bg-white/5 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
            {syncing ? "Syncing..." : "Sync Articles"}
          </button>
          <button
            onClick={toggleAgent}
            disabled={running}
            className="px-6 py-3 bg-brand-orange text-black font-[family-name:var(--font-mono)] text-sm uppercase tracking-wider rounded-full hover:bg-brand-orange/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? <Loader2 className="animate-spin" size={16} /> : status?.isRunning ? <Square size={16} /> : <Play size={16} />}
            {status?.isRunning ? "Stop Agent" : "Start Agent"}
          </button>
          <button
            onClick={runAgent}
            disabled={analyzing}
            className="px-6 py-3 border border-white/20 text-white font-[family-name:var(--font-mono)] text-sm uppercase tracking-wider rounded-full hover:bg-white/5 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
            {analyzing ? "Analyzing..." : "Run Analysis"}
          </button>
        </motion.div>

        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="font-[family-name:var(--font-orbitron)] text-2xl font-light uppercase mb-6">
            Recent Insights
          </h2>

          {insights.length === 0 ? (
            <div className="p-8 border border-white/10 bg-white/5 rounded-2xl text-center">
              <FileText size={32} className="text-white/30 mx-auto mb-4" />
              <p className="text-white/50 font-[family-name:var(--font-space)]">
                No insights yet. Start the agent and run analysis to generate insights.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-6 border border-white/10 bg-white/5 rounded-2xl hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`px-2 py-1 text-xs font-[family-name:var(--font-mono)] uppercase rounded ${
                        insight.sentiment === "bullish"
                          ? "bg-green-500/20 text-green-400"
                          : insight.sentiment === "bearish"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {insight.sentiment}
                    </span>
                    {insight.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs font-[family-name:var(--font-mono)] text-white/50 bg-white/5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-white/80 font-[family-name:var(--font-space)] mb-3">
                    {insight.summary}
                  </p>
                  {insight.keyPoints.length > 0 && (
                    <ul className="text-xs text-white/50 font-[family-name:var(--font-mono)] space-y-1">
                      {insight.keyPoints.slice(0, 3).map((point, i) => (
                        <li key={i}>• {point}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
