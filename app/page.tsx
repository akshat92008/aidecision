"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef } from "react";
import { SimulationLab } from "@/components/SimulationLab";
import { 
  Plus,
  Brain,
  Activity,
  History,
  ArrowRight,
  Layout,
  LogOut,
  User as UserIcon,
  ShieldCheck,
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
  const [phase, setPhase] = useState<'IDLE' | 'PORTFOLIO' | 'INTAKE' | 'PROCESSING' | 'REPORT' | 'SIMULATION'>('IDLE');
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
  const abortControllerRef = useRef<AbortController | null>(null);

  const switchPhase = (newPhase: typeof phase) => {
    if (isProcessing && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsProcessing(false);
    }
    setPhase(newPhase);
    setError(null);
  };

  useEffect(() => {
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
    setThoughts([]);
    setIsProcessing(true);
    setPhase('PROCESSING');
    setError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setThoughts([{ agent: 'NexusCore', thought: 'Initializing Guardrails & Signal Verification...', timestamp: new Date().toISOString() }]);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, constraints: c }),
        signal: controller.signal
      });

      if (!res.ok) throw new Error("Connection Failure");
      if (!res.body) throw new Error("Empty Strategic Signal");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.type === 'thought') {
              setThoughts(prev => [...prev, data.payload]);
            } else if (data.type === 'report') {
              setReport(data.payload);
              setPhase('REPORT');
              fetchDecisions();
            } else if (data.type === 'error') {
              throw new Error(data.payload);
            }
          } catch (e) {
            console.error("Stream parse error:", e);
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err.message || "Protocol Error");
      setIsProcessing(false);
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex h-screen bg-black text-slate-200 overflow-hidden font-sans">
      {/* SaaS SIDEBAR */}
      <aside className="w-64 border-r border-slate-800/50 flex flex-col bg-[#080808] z-50">
         <div className="p-8 pb-12 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-600/20">
               <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-bold text-white tracking-tight text-lg uppercase italic">Nexus</span>
         </div>
         
         <nav className="flex-1 px-4 space-y-2">
            {[
              { id: 'PORTFOLIO', label: 'Dashboard', icon: Layout },
              { id: 'SIMULATION', label: 'Survival Sim', icon: Activity },
              { id: 'INTAKE', label: 'New Decision', icon: Plus },
              { id: 'HISTORY', label: 'Audit History', icon: History }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => switchPhase(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${phase === item.id || (item.id === 'PORTFOLIO' && phase === 'REPORT') ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 shadow-sm' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
         </nav>

         <div className="p-4 border-t border-slate-800/50">
            <div className="flex items-center gap-3 px-4 py-3 bg-indigo-600/5 border border-indigo-600/10 rounded-xl">
               <Zap className="w-4 h-4 text-indigo-500" />
               <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Strategic Signals</p>
                  <p className="text-sm font-bold text-white uppercase">{user ? credits : '05'} Credits</p>
               </div>
            </div>
         </div>

         <div className="p-4">
           {user ? (
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-red-400 transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Log out</span>
              </button>
           ) : (
              <button onClick={() => router.push('/login')} className="w-full flex items-center gap-3 px-4 py-2 text-indigo-400 hover:text-white transition-colors">
                <UserIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Founder Login</span>
              </button>
           )}
         </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-[#060606]">
         <main className="flex-1 overflow-y-auto relative overscroll-none">
            <AnimatePresence mode="wait">
               {phase === 'IDLE' && (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="h-full flex flex-col items-center justify-center p-8 text-center max-w-4xl mx-auto"
                  >
                     <div className="space-y-8">
                        <motion.div 
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mx-auto border border-indigo-600/20 shadow-2xl shadow-indigo-600/10"
                        >
                           <ShieldCheck className="w-10 h-10 text-indigo-500" />
                        </motion.div>
                        
                        <div className="space-y-6">
                           <h1 className="text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                              See How Your Decisions Affect Your Runway <br/>
                              <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">— Before It’s Too Late</span>
                           </h1>
                           <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
                              Simulate hiring, spending, and growth decisions. Get instant clarity on runway, risk, and survival.
                           </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                          <button 
                             onClick={() => setPhase('INTAKE')}
                             className="group flex items-center justify-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 hover:-translate-y-1 transition-all"
                          >
                             Run Survival Simulation <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                          <button 
                             onClick={() => router.push('/login')}
                             className="flex items-center justify-center gap-3 px-10 py-5 bg-slate-900 border border-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
                          >
                             View Sample Report
                          </button>
                        </div>

                        <div className="pt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                           {[
                             { label: 'Strategic Alignment', value: '4 Agents', desc: 'Market, Risk, Systems Analysts' },
                             { label: 'Survival Precision', value: '99.2%', desc: 'Calibrated for 2024-25 data' },
                             { label: 'Decisions Modeled', value: '1.2k+', desc: 'Across 12 industry sectors' }
                           ].map((stat, i) => (
                             <div key={i} className="text-center space-y-1 p-6 border border-white/5 rounded-2xl bg-white/[0.02]">
                                <div className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{stat.label}</div>
                                <div className="text-2xl font-black text-white">{stat.value}</div>
                                <div className="text-[11px] text-slate-600 font-medium">{stat.desc}</div>
                             </div>
                           ))}
                        </div>
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
                       <div className="w-40 h-40 border-4 border-slate-800/50 rounded-full" />
                       <div className="w-40 h-40 border-t-4 border-indigo-500 rounded-full animate-spin absolute top-0" />
                       <Brain className="w-12 h-12 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="text-center space-y-4">
                       <h2 className="text-xl font-extrabold text-white tracking-tight">Simulating Survival Scenarios...</h2>
                       <p className="text-slate-500 text-sm font-medium animate-pulse">Our 4 Strategic Agents are auditing your trajectory</p>
                    </div>
                 </motion.div>
               )}

               {phase === 'REPORT' && report && (
                 <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
                    <ReportView report={report} query={query} onReset={() => setPhase(user ? 'PORTFOLIO' : 'IDLE')} />
                 </motion.div>
               )}

               {phase === 'SIMULATION' && (
                 <motion.div key="simulation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                    <SimulationLab onBack={() => setPhase(user ? 'PORTFOLIO' : 'IDLE')} />
                 </motion.div>
               )}
            </AnimatePresence>
         </main>

         {/* REASONING FOOTER */}
         {(phase === 'PROCESSING' || phase === 'REPORT') && thoughts.length > 0 && (
            <footer className="h-16 border-t border-slate-800/50 bg-[#080808] flex items-center px-8 gap-6 z-40 overflow-hidden">
               <div className="flex items-center gap-3 shrink-0">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Agent Reasoning Log</span>
               </div>
               <div className="flex-1 flex gap-8 items-center overflow-x-auto scrollbar-hide">
                  {thoughts.slice(-3).map((t, i) => (
                    <div key={i} className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity shrink-0">
                       <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">{t.agent}:</span>
                       <span className="text-[11px] font-medium text-slate-300 truncate max-w-[200px]">{t.thought}</span>
                    </div>
                  ))}
               </div>
               {isProcessing && (
                  <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-bold uppercase animate-pulse shrink-0">
                     <Zap className="w-3 h-3" /> Grid Calibrating...
                  </div>
               )}
            </footer>
         )}
      </div>
    </div>
  );
}
