"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Plus,
  Compass,
  Search,
  Library,
  ChevronRight,
  ShieldAlert,
  Brain,
  Globe,
  Monitor,
  Layout,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Loader2,
  Settings,
  Bell,
  Terminal,
  Database,
  ShieldCheck,
  Activity,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { FinalReport, Constraints, AgentThought, IndustryKiller } from "@/lib/shared/schemas";
import ReportView from "@/components/ReportView";

export default function Home() {
  const [query, setQuery] = useState("");
  const [step, setStep] = useState(1);
  const [constraints, setConstraints] = useState<Partial<Constraints>>({
    location_tier: 'Tier 1',
    tech_stack: [],
    budget_inr: '',
    founder_background: '',
    time_to_mvp: '3 months'
  });
  
  const [phase, setPhase] = useState<'INPUT' | 'PROCESSING' | 'CONSULTATION' | 'REPORT'>('INPUT');
  const [thoughts, setThoughts] = useState<AgentThought[]>([]);
  const [report, setReport] = useState<FinalReport | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thoughts]);

  const startAnalysis = async () => {
    if (!query.trim() || !constraints.budget_inr) return;

    setIsProcessing(true);
    setPhase('PROCESSING');
    setError(null);
    setThoughts([{ agent: 'System', thought: 'Initializing India 2026 Strategic Pipeline...', timestamp: new Date().toISOString() }]);

    try {
      // 1. Refine Problem with full context
      setThoughts(prev => [...prev, { agent: 'Refiner', thought: 'Injecting founder context and geographic weights...', timestamp: new Date().toISOString() }]);
      
      const refineRes = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, answers: { ...constraints } }),
      });
      const refineData = await refineRes.json();
      if (!refineRes.ok) throw new Error(JSON.stringify(refineData));

      // 2. Full Agentic Pipeline
      setThoughts(prev => [...prev, { agent: 'StrategyEngine', thought: 'Orchestrating 6-agent deep research...', timestamp: new Date().toISOString() }]);
      
      const analysisRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: refineData.refined_query }),
      });
      const analysisData = await analysisRes.json();
      if (!analysisRes.ok) throw new Error(JSON.stringify(analysisData));

      setReport(analysisData);
      setThoughts(prev => analysisData.agent_thoughts ? [...prev, ...analysisData.agent_thoughts] : prev);
      setPhase('REPORT');
    } catch (err: any) {
      console.error(err);
      setPhase('INPUT');
      try {
        const errorData = JSON.parse(err.message);
        setError(errorData.details || errorData.error || "Analysis failed.");
      } catch {
        setError(err.message || "Network Error: System offline.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-[#e1e1e1] overflow-hidden">
      <div className="scanline" />
      
      {/* SIDEBAR - COMMAND CENTER NAVIGATION */}
      <aside className="w-16 border-r border-white/5 flex flex-col items-center py-6 space-y-8 bg-[#0a0a0a]">
         <div className="w-8 h-8 bg-accent/20 border border-accent/40 rounded flex items-center justify-center">
            <Terminal className="w-4 h-4 text-accent" />
         </div>
         <nav className="flex flex-col gap-6">
            <Plus className="w-5 h-5 text-zinc-600 hover:text-accent cursor-pointer transition-colors" />
            <Activity className="w-5 h-5 text-zinc-600 hover:text-accent cursor-pointer transition-colors" />
            <Database className="w-5 h-5 text-zinc-600 hover:text-accent cursor-pointer transition-colors" />
            <ShieldCheck className="w-5 h-5 text-zinc-600 hover:text-accent cursor-pointer transition-colors" />
            <History className="w-5 h-5 text-zinc-600 hover:text-accent cursor-pointer transition-colors" />
         </nav>
         <div className="flex-1" />
         <Settings className="w-5 h-5 text-zinc-700 hover:text-white cursor-pointer" />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
         {/* STATUS HEADER */}
         <header className="h-10 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0a]">
            <div className="flex items-center gap-4 terminal-text uppercase tracking-widest font-bold">
               <span className="text-accent flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                  System Live
               </span>
               <span className="text-zinc-600">|</span>
               <span>Venture Intelligence OS v2.0</span>
               <span className="text-zinc-600">|</span>
               <span>Region: India-West-1</span>
            </div>
            <div className="flex items-center gap-4">
               <span className="terminal-text text-[10px]">AUTH_TOKEN: 9670...4210</span>
               <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center text-[10px] font-bold">AS</div>
            </div>
         </header>

         <div className="flex-1 flex overflow-hidden">
            {/* MAIN WORKSPACE */}
            <main className="flex-1 overflow-y-auto p-8 relative scrollbar-hide">
               <AnimatePresence mode="wait">
                  {phase === 'INPUT' && (
                    <motion.div 
                      key="wizard"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="max-w-2xl mx-auto space-y-12 py-12"
                    >
                      <div className="space-y-2">
                         <h1 className="text-2xl font-bold tracking-tight text-white/90 uppercase">Venture Intake Protocol</h1>
                         <p className="terminal-text">Step {step} of 4: Initialization of Founder Context</p>
                      </div>

                      <div className="space-y-8 bg-[#0a0a0a] border border-white/5 p-8 rounded-lg shadow-2xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 terminal-text opacity-20">0xINTAKE_{step}</div>
                         
                         {step === 1 && (
                            <div className="space-y-6">
                               <div className="space-y-2">
                                  <label className="terminal-text uppercase block text-xs">Core Mission / Venture Idea</label>
                                  <textarea 
                                    autoFocus
                                    className="command-input min-h-[140px] text-lg" 
                                    placeholder="Describe your vision..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                  />
                               </div>
                            </div>
                         )}

                         {step === 2 && (
                            <div className="space-y-6">
                               <div className="space-y-4">
                                  <label className="terminal-text uppercase block text-xs">Geography & Scale Focus</label>
                                  <div className="grid grid-cols-3 gap-3">
                                     {['Tier 1', 'Tier 2', 'Tier 3'].map(t => (
                                        <div 
                                          key={t}
                                          onClick={() => setConstraints(prev => ({ ...prev, location_tier: t as any }))}
                                          className={`p-4 border text-center cursor-pointer transition-all ${constraints.location_tier === t ? 'border-accent text-accent bg-accent/5' : 'border-white/5 text-zinc-500 hover:border-white/20'}`}
                                        >
                                           <div className="font-bold text-sm uppercase">{t}</div>
                                           <div className="text-[10px] opacity-60">Cities</div>
                                        </div>
                                     ))}
                                  </div>
                               </div>
                            </div>
                         )}

                         {step === 3 && (
                            <div className="space-y-6">
                               <div className="grid grid-cols-1 gap-6">
                                  <div className="space-y-2">
                                     <label className="terminal-text uppercase block text-xs">Planned Capital Expenditure (INR)</label>
                                     <input 
                                       className="command-input" 
                                       placeholder="e.g. ₹20 Lakhs" 
                                       value={constraints.budget_inr}
                                       onChange={(e) => setConstraints(prev => ({ ...prev, budget_inr: e.target.value }))}
                                     />
                                  </div>
                                  <div className="space-y-2">
                                     <label className="terminal-text uppercase block text-xs">Primary Tech Stack</label>
                                     <input 
                                       className="command-input" 
                                       placeholder="e.g. React Native, AWS, Python" 
                                       onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                             const val = (e.currentTarget as HTMLInputElement).value;
                                             if (val) {
                                                setConstraints(prev => ({ ...prev, tech_stack: [...(prev.tech_stack || []), val] }));
                                                (e.currentTarget as HTMLInputElement).value = '';
                                             }
                                          }
                                       }}
                                     />
                                     <div className="flex flex-wrap gap-2 mt-2">
                                        {constraints.tech_stack?.map(tag => (
                                           <span key={tag} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-zinc-400">{tag}</span>
                                        ))}
                                     </div>
                                  </div>
                               </div>
                            </div>
                         )}

                         {step === 4 && (
                            <div className="space-y-6">
                               <div className="space-y-4">
                                  <label className="terminal-text uppercase block text-xs">Founder Background & DPDP Awareness</label>
                                  <textarea 
                                    className="command-input min-h-[100px]" 
                                    placeholder="Briefly state your industry experience..."
                                    value={constraints.founder_background}
                                    onChange={(e) => setConstraints(prev => ({ ...prev, founder_background: e.target.value }))}
                                  />
                               </div>
                            </div>
                         )}

                         <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            <button 
                              onClick={() => setStep(prev => Math.max(1, prev - 1))}
                              className="terminal-text hover:text-white uppercase disabled:opacity-30 px-4 py-2"
                              disabled={step === 1}
                            >
                               Previous
                            </button>
                            {step < 4 ? (
                               <button 
                                 onClick={() => setStep(prev => prev + 1)}
                                 className="px-6 py-2 bg-white/5 border border-white/10 hover:border-accent hover:text-accent transition-all uppercase text-xs font-bold"
                               >
                                  Continue
                               </button>
                            ) : (
                               <button 
                                 onClick={startAnalysis}
                                 className="px-8 py-3 bg-accent text-black font-black uppercase text-xs hover:bg-accent/90 transition-all shadow-xl shadow-accent/10 flex items-center gap-2"
                               >
                                  Trigger Audit Engine <ArrowRight className="w-4 h-4" />
                               </button>
                            )}
                         </div>
                      </div>

                      {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded flex items-start gap-3">
                           <ShieldAlert className="w-5 h-5 text-red-500" />
                           <div className="flex flex-col gap-1">
                              <span className="text-xs font-bold text-red-200 uppercase tracking-widest">Protocol Failure</span>
                              <span className="text-[10px] text-red-400 font-mono leading-relaxed">{error}</span>
                           </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {phase === 'PROCESSING' && (
                    <motion.div 
                      key="processing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1 flex flex-col items-center justify-center space-y-8 h-full"
                    >
                       <div className="relative">
                          <div className="w-24 h-24 border border-accent/20 rounded-full" />
                          <div className="w-24 h-24 border-t border-accent rounded-full animate-spin absolute top-0" />
                          <Brain className="w-8 h-8 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                       </div>
                       <div className="text-center space-y-3">
                          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-accent">Orchestrating Audit</h2>
                          <p className="terminal-text max-w-xs mx-auto">Cross-referencing MCA, Startup India, and consumer behavior datasets...</p>
                       </div>
                    </motion.div>
                  )}

                  {phase === 'REPORT' && report && (
                    <motion.div 
                      key="report"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full h-full"
                    >
                       <ReportView report={report} query={query} onReset={() => setPhase('INPUT')} />
                    </motion.div>
                  )}
               </AnimatePresence>
            </main>

            {/* LIVE REASONING SIDEBAR (Lateral thought streaming) */}
            <aside className="w-80 bg-[#0a0a0a] border-l border-white/5 flex flex-col min-w-0">
               <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2">
                  <Activity className="w-3 h-3 text-accent" />
                  <span className="terminal-text text-[9px] font-black uppercase tracking-widest">Late-ral Reasoning Log</span>
               </div>
               <div ref={scrollRef} className="flex-1 overflow-y-auto reasoning-stream scroll-smooth">
                  {thoughts.map((t, i) => (
                    <div key={i} className="mb-6 opacity-0 animate-in fade-in slide-in-from-right-2 duration-500 fill-mode-forwards">
                       <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-bold text-accent uppercase tracking-tighter">{t.agent}</span>
                          <span className="text-[8px] text-zinc-700">{new Date(t.timestamp).toLocaleTimeString()}</span>
                       </div>
                       <p className="border-l border-white/10 pl-3 py-1">{t.thought}</p>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex items-center gap-2 mt-4 text-[9px] text-accent/50 animate-pulse uppercase tracking-[0.2em] font-black">
                       <div className="w-1 h-1 bg-accent rounded-full" />
                       Awaiting Packet...
                    </div>
                  )}
                  {thoughts.length === 0 && !isProcessing && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 text-center gap-4 px-8">
                       <Layout className="w-8 h-8" />
                       <span className="text-[10px] uppercase font-bold tracking-widest leading-relaxed">System Idle. Awaiting initialization of Venture Intake Protocol.</span>
                    </div>
                  )}
               </div>
            </aside>
         </div>

         {/* TERMINAL FOOTER */}
         <footer className="h-8 border-t border-white/5 bg-[#050505] flex items-center justify-between px-6 terminal-text text-[9px] font-bold">
            <div className="flex items-center gap-6 uppercase tracking-widest">
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-accent rounded" /> DB_STATUS: Connected</span>
               <span>GRID_LATENCY: 14ms</span>
               <span>CRYPTO_MODE: SHA-256</span>
            </div>
            <div className="flex items-center gap-4">
               <span>INTEL_PROVIDER: VENTURE_ENG_V2</span>
               <span>© 2026 INDIA SPEC</span>
            </div>
         </footer>
      </div>
    </div>
  );
}
