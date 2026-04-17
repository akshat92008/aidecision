"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef } from "react";
import { 
  Plus,
  Brain,
  Activity,
  History,
  Settings,
  ArrowRight,
  Layout,
  FileText,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Database,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FinalReport, Constraints, AgentThought, Decision } from "@/lib/shared/schemas";
import ReportView from "@/components/ReportView";
import { FounderBrief } from "@/components/FounderBrief";
import { PortfolioView } from "@/components/PortfolioView";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Home() {
  const [phase, setPhase] = useState<'IDLE' | 'PORTFOLIO' | 'INTAKE' | 'PROCESSING' | 'REPORT'>('IDLE');
  const [query, setQuery] = useState("");
  const [constraints, setConstraints] = useState<Constraints | null>(null);
  const [thoughts, setThoughts] = useState<AgentThought[]>([]);
  const [report, setReport] = useState<FinalReport | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [credits, setCredits] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial Auth Check
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchDecisions();
        fetchCredits(user.id);
        setPhase('PORTFOLIO');
      } else {
        setPhase('IDLE');
      }
    };
    checkUser();
  }, []);

  const fetchCredits = async (userId: string) => {
    const { data: profile } = await supabase.from('profiles').select('credits').eq('id', userId).single();
    if (profile) setCredits(profile.credits);
  };

  const fetchDecisions = async () => {
    const { data } = await supabase
      .from('decisions')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (data) setDecisions(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPhase('IDLE');
  };

  const triggerAudit = async (q: string, c: Constraints) => {
    if (user && credits < 5) {
      setError("Insufficient Strategic Signal. Audit require 5 Credits.");
      return;
    }

    setQuery(q);
    setConstraints(c);
    setIsProcessing(true);
    setPhase('PROCESSING');
    setError(null);
    setThoughts([{ agent: 'NexusCore', thought: 'Initializing Guardrails & Signal Verification...', timestamp: new Date().toISOString() }]);

    try {
      // PHASE 4: PII Scrubbing
      const { guardrails } = await import('@/lib/server/guardrails');
      const safeQuery = guardrails ? guardrails.scrub(q) : q;

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: safeQuery, constraints: c }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "System Failure");

      setReport(data);
      setThoughts(prev => data.agent_thoughts ? [...prev, ...data.agent_thoughts] : prev);
      setPhase('REPORT');
      fetchDecisions(); // Refresh portfolio in background
    } catch (err: any) {
      setError(err.message || "Protocol Error");
      setPhase('INTAKE');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-[#e1e1e1] overflow-hidden">
      <div className="scanline" />
      
      {/* SIDEBAR */}
      <aside className="w-16 border-r border-white/5 flex flex-col items-center py-6 space-y-8 bg-[#0a0a0a] z-50">
         <div onClick={() => setPhase(user ? 'PORTFOLIO' : 'IDLE')} className="w-10 h-10 bg-accent/20 border border-accent/40 rounded flex items-center justify-center cursor-pointer hover:bg-accent/30 transition-all">
            <Brain className="w-6 h-6 text-accent" />
         </div>
         <nav className="flex flex-col gap-8 opacity-40">
            <div onClick={() => setPhase('INTAKE')} className={`cursor-pointer hover:text-accent transition-colors ${phase === 'INTAKE' ? 'text-accent opacity-100' : ''}`}>
               <Plus className="w-6 h-6" />
            </div>
            <Layout className="w-5 h-5" />
            <Database className="w-5 h-5" />
            <ShieldCheck className="w-5 h-5" />
            <History className="w-5 h-5" />
         </nav>
         <div className="flex-1" />
         {user ? (
            <div className="flex flex-col gap-6 items-center pb-4">
              <UserIcon className="w-5 h-5 text-zinc-600" />
              <button onClick={handleLogout} className="text-zinc-800 hover:text-red-500 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
         ) : (
            <button onClick={() => router.push('/login')} className="p-2 text-zinc-700 hover:text-white transition-colors">
               <UserIcon className="w-5 h-5" />
            </button>
         )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
         {/* STATUS HEADER */}
         <header className="h-12 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0a] relative z-40">
            <div className="flex items-center gap-6 terminal-text uppercase tracking-widest font-black text-[10px]">
               <span className="text-accent flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_8px_var(--color-accent)]" />
                  Grid Active
               </span>
               <span className="text-zinc-800">|</span>
               <span className="text-white">Nexus OS v2.0</span>
               <span className="text-zinc-800">|</span>
               <span className="text-zinc-500">{user ? user.email : 'GUEST_ACCESS'}</span>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded uppercase text-[9px] font-bold text-zinc-400">
                  <Zap className="w-3 h-3 text-accent" />
                  Signal Balance: {user ? credits : '05'}
               </div>
            </div>
         </header>

         <div className="flex-1 flex overflow-hidden">
            {/* WORKSPACE */}
            <main className="flex-1 overflow-y-auto relative scrollbar-hide">
               <AnimatePresence mode="wait">
                  {phase === 'IDLE' && (
                     <motion.div 
                       key="idle"
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0, y: -20 }}
                       className="h-full flex flex-col items-center justify-center text-center p-12 space-y-8"
                     >
                        <div className="space-y-4 max-w-xl">
                           <h1 className="text-6xl font-black tracking-tighter text-white uppercase leading-none">
                              Decision <span className="text-accent">OS.</span>
                           </h1>
                           <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                              Transition your venture from high-risk uncertainty to strategic clarity. The India-first operating system for professional founders and architects.
                           </p>
                        </div>
                        <div className="flex gap-4">
                          <button 
                             onClick={() => setPhase('INTAKE')}
                             className="flex items-center gap-3 px-10 py-5 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-accent hover:text-black transition-all shadow-2xl"
                          >
                             Fast Audit Launch <ArrowRight className="w-4 h-4" />
                          </button>
                          <button 
                             onClick={() => router.push('/login')}
                             className="flex items-center gap-3 px-10 py-5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                          >
                             Secure Mission Data
                          </button>
                        </div>
                     </motion.div>
                  )}

                  {phase === 'PORTFOLIO' && (
                    <motion.div key="portfolio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                       <PortfolioView 
                        decisions={decisions} 
                        onCreateNew={() => setPhase('INTAKE')}
                        onSelectDecision={(d) => {
                          setReport(d.last_report);
                          setQuery(d.query);
                          setPhase('REPORT');
                        }}
                       />
                    </motion.div>
                  )}

                  {phase === 'INTAKE' && (
                     <motion.div key="intake" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                        <FounderBrief onComplete={triggerAudit} isProcessing={isProcessing} />
                     </motion.div>
                  )}

                  {phase === 'PROCESSING' && (
                    <motion.div key="processing" className="h-full flex flex-col items-center justify-center space-y-12">
                       <div className="relative">
                          <div className="w-32 h-32 border border-accent/10 rounded-full" />
                          <div className="w-32 h-32 border-t border-accent rounded-full animate-spin absolute top-0" />
                          <Brain className="w-10 h-10 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                       </div>
                       <div className="text-center space-y-2">
                          <h2 className="text-xs font-black uppercase tracking-[0.5em] text-accent animate-pulse">Running Neural Simulation</h2>
                          <div className="terminal-text text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Cross-Linking T1-T3 Signals</div>
                       </div>
                    </motion.div>
                  )}

                  {phase === 'REPORT' && report && (
                    <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
                       <ReportView report={report} query={query} onReset={() => setPhase(user ? 'PORTFOLIO' : 'IDLE')} />
                    </motion.div>
                  )}
               </AnimatePresence>
            </main>

            {/* LIVE REASONING SIDEBAR */}
            {(phase === 'PROCESSING' || phase === 'REPORT') && (
               <aside className="w-80 bg-[#0a0a0a] border-l border-white/5 flex flex-col min-w-0">
                  <div className="h-12 border-b border-white/5 flex items-center px-6 gap-3">
                     <Activity className="w-4 h-4 text-accent" />
                     <span className="terminal-text text-[10px] font-black uppercase tracking-widest">Output Log</span>
                  </div>
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                     {thoughts.map((t, i) => (
                       <div key={i} className="space-y-2 border-l border-accent/20 pl-4 py-1">
                          <div className="flex justify-between items-center">
                             <span className="text-[9px] font-black text-accent uppercase">{t.agent}</span>
                             <span className="text-[8px] text-zinc-700 font-mono">{new Date(t.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-zinc-400 font-medium">{t.thought}</p>
                       </div>
                     ))}
                  </div>
               </aside>
            )}
         </div>

         <footer className="h-10 border-t border-white/5 bg-[#050505] flex items-center justify-between px-8 terminal-text text-[9px] font-black text-zinc-700">
            <div className="flex items-center gap-8 uppercase tracking-[0.3em]">
               <span className="flex items-center gap-2 text-accent"><div className="w-1.5 h-1.5 bg-accent rounded-sm" /> CONNECTION_ESTABLISHED</span>
               <span>MEM_STATE: {user ? 'PERSISTENT' : 'TEMPORARY'}</span>
            </div>
            <span>© 2026 NEXUS OS // STRATEGIC_INTEL_READY</span>
         </footer>
      </div>
    </div>
  );
}
