"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, Target, Settings2, ArrowRight, Sparkles, Brain } from "lucide-react";
import { ReportView } from "@/components/ReportView";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { FinalReport, Constraints } from "@/lib/shared/schemas";

export default function Home() {
  const [query, setQuery] = useState("");
  const [constraints, setConstraints] = useState<Constraints>({
    budget: "",
    time: "",
    skills: []
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<FinalReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(0);

  const loadingMessages = [
    "Expanding context & identifying assumptions...",
    "Scanning market trends & competitor reality...",
    "Executing 4-pillar weighted analysis matrix...",
    "Developing strategic roadmap & action plan...",
    "Executing Critic Agent 'Harsh Truth' pass...",
    "Synthesizing hybrid intelligence report..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setLoadingPhase((prev) => (prev < 5 ? prev + 1 : prev));
      }, 5000); 
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsAnalyzing(true);
    setReport(null);
    setError(null);
    setLoadingPhase(0);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, constraints }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      setReport(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen text-white font-sans p-6 sm:p-12 md:px-24 max-w-7xl mx-auto flex flex-col items-center">
      
      {/* Enterprise Hybrid Header */}
      <header className="w-full flex justify-between items-center mb-16 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg shadow-accent-primary/20">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-xl leading-none tracking-tight uppercase">AI Decision Engine</span>
            <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-accent-secondary/80">Enterprise Hybrid v2</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-bold text-text-muted">
           <Sparkles className="w-3 h-3 text-accent-primary" /> Multi-Agent Orchestration
        </div>
      </header>

      {/* Main Experience */}
      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          <LoadingOverlay key="loading" isVisible={true} message={loadingMessages[loadingPhase]} />
        ) : report ? (
          <ReportView 
            key="report"
            report={report} 
            query={query} 
            onReset={() => {
              setReport(null);
              setQuery("");
            }} 
          />
        ) : (
          <motion.div 
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl space-y-12 text-center mt-12 md:mt-24"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-black tracking-widest text-accent-primary animate-pulse">
                <Brain className="w-3 h-3" /> Research-Grade Intelligence
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">
                Deep Intelligence.<br/>Brutal Reality
              </h1>
              <p className="text-text-muted max-w-xl mx-auto text-lg md:text-xl font-light leading-relaxed">
                Professional decision analysis powered by a 6-agent system. We find the market reality so you don't repeat the world's mistakes.
              </p>
            </div>

            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="relative group w-full max-w-3xl mx-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-accent-primary/30 to-accent-secondary/30 rounded-[20px] blur opacity-20 group-hover:opacity-50 transition duration-700"></div>
                <div className="relative flex items-center bg-glass-surface backdrop-blur-xl border border-glass-border rounded-[20px] p-2 pr-4 transition-all shadow-2xl">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter your strategic decision or startup idea..."
                    className="flex-1 bg-transparent border-none outline-none px-6 py-5 text-lg md:text-xl text-text-main placeholder-white/20"
                    disabled={isAnalyzing}
                  />
                  <button
                    type="submit"
                    disabled={!query.trim() || isAnalyzing}
                    className="bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl px-10 py-5 font-bold uppercase text-xs tracking-[0.2em] transition-all flex items-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xl active:scale-95"
                  >
                    <span>Analyze</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>

              <div className="flex flex-col items-center gap-6">
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.3em] text-text-muted hover:text-white transition-colors"
                >
                  <Settings2 className="w-3 h-3" /> {showAdvanced ? "Basic Analysis" : "Add Deep Context (Recommended)"}
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="w-full max-w-3xl overflow-hidden"
                    >
                      <div className="bg-white/[0.03] border border-white/5 rounded-[24px] p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 text-left">
                          <label className="text-[10px] uppercase font-black tracking-widest text-text-muted ml-1">Est. Budget ($)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. $25,000"
                            className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 text-sm focus:border-accent-primary outline-none transition-all placeholder-white/10"
                            value={constraints.budget}
                            onChange={(e) => setConstraints({...constraints, budget: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2 text-left">
                          <label className="text-[10px] uppercase font-black tracking-widest text-text-muted ml-1">Time Horizon</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 1 year"
                            className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 text-sm focus:border-accent-primary outline-none transition-all placeholder-white/10"
                            value={constraints.time}
                            onChange={(e) => setConstraints({...constraints, time: e.target.value})}
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2 text-left">
                          <label className="text-[10px] uppercase font-black tracking-widest text-text-muted ml-1">Team Skills / Resources (comma separated)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Web Dev, Marketing, B2B Sales"
                            className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 text-sm focus:border-accent-primary outline-none transition-all placeholder-white/10"
                            value={constraints.skills?.join(", ")}
                            onChange={(e) => setConstraints({...constraints, skills: e.target.value.split(",").map(s => s.trim())})}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-5 rounded-2xl text-center backdrop-blur-md max-w-3xl mx-auto"
              >
                {error}
              </motion.div>
            )}

            <div className="pt-12 text-[9px] uppercase tracking-[0.5em] font-black text-white/5 select-none md:flex gap-12 justify-center hidden">
              <span>Scientific Analysis</span>
              <span>Brutal Reality</span>
              <span>Strategic Roadmap</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
