"use client";

import React, { useState } from "react";
import { 
  ShieldAlert, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  ArrowLeft,
  Calendar,
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Gavel,
  PieChart,
  Zap,
  Box,
  Brain,
  Clock,
  ShieldCheck,
  TrendingDown,
  Banknote,
  LayoutGrid,
  UserCircle,
  Activity,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FinalReport } from "@/lib/shared/schemas";

interface ReportViewProps {
  report: FinalReport;
  query: string;
  onReset: () => void;
}

export default function ReportView({ report, query, onReset }: ReportViewProps) {
  const [activeTab, setActiveTab] = useState<'strategy' | 'market' | 'legal' | 'execution' | 'simulator' | 'assets'>('strategy');

  const downloadPdf = async () => {
    try {
      const res = await fetch("/api/report/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report, query }),
      });
      if (!res.ok) throw new Error("PDF failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Nexus_Strategic_Audit_${query.replace(/ /g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF. Check system logs.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={onReset}
            className="p-2 hover:bg-white/5 border border-white/10 rounded transition-colors text-zinc-500 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="space-y-1">
             <div className="flex items-center gap-2">
                <span className="terminal-text uppercase font-black text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded border border-accent/20">Strategic Audit Outcome</span>
                <span className="text-zinc-500">•</span>
                <span className="terminal-text text-[10px]">{report.industry_category}</span>
             </div>
             <h2 className="text-xl font-bold tracking-tight text-white uppercase">{query}</h2>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <button 
             onClick={downloadPdf}
             className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
           >
              <FileText className="w-3.5 h-3.5" /> Export PDF
           </button>
           <div className="text-right">
              <div className="terminal-text text-[9px] uppercase tracking-widest text-zinc-500">Viability Score</div>
              <div className="text-3xl font-black text-accent shadow-accent/20 drop-shadow-sm">{report.viability_score.toFixed(1)}%</div>
           </div>
        </div>
      </div>

      {/* NAVIGATOR */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-white/5 flex flex-col p-6 space-y-4 bg-[#0a0a0a]">
           {[
             { id: 'strategy', label: 'Strategy Core', icon: Target },
             { id: 'market', label: 'Market Realism', icon: PieChart },
             { id: 'legal', label: 'Regulatory Wall', icon: Gavel },
             { id: 'execution', label: '90-Day Roadmap', icon: Calendar },
             { id: 'simulator', label: 'Strategic War Room', icon: Zap },
             { id: 'assets', label: 'Resource Hub', icon: Box }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex items-center gap-4 px-4 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all rounded ${activeTab === tab.id ? 'bg-accent/10 text-accent border border-accent/20 shadow-lg shadow-accent/5' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}
             >
               <tab.icon className="w-4 h-4" />
               {tab.label}
             </button>
           ))}
           <div className="flex-1" />
           <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-xl flex flex-col gap-3">
              <div className="flex items-center gap-2">
                 <ShieldAlert className="w-4 h-4 text-red-500" />
                 <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Truth Bomb</span>
              </div>
              <p className="text-[11px] text-zinc-400 italic leading-relaxed font-medium">"{report.harsh_truth.truth_bomb}"</p>
           </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-12 scrollbar-hide bg-[#050505] relative">
          <div className="absolute top-0 right-0 p-8 opacity-2">
             <Brain className="w-64 h-64" />
          </div>
          
          <AnimatePresence mode="wait">
             {activeTab === 'strategy' && (
                <motion.div key="strategy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-16 max-w-4xl relative z-10">
                   <div className="space-y-6">
                      <div className="terminal-text text-[11px] uppercase font-black text-accent tracking-[0.3em]">Executive Audit Summary</div>
                      <p className="text-xl leading-relaxed text-zinc-300 font-medium">{report.summary}</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="p-8 border border-white/5 bg-white/2 backdrop-blur-sm space-y-4 rounded-xl">
                         <span className="terminal-text text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Market Demand</span>
                         <div className="text-3xl font-black text-white">{report.score_breakdown.demand}<span className="text-sm opacity-30">/30</span></div>
                         <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(report.score_breakdown.demand / 30) * 100}%` }} className="bg-accent h-full shadow-[0_0_10px_var(--color-accent)]" />
                         </div>
                      </div>
                      <div className="p-8 border border-white/5 bg-white/2 space-y-4 rounded-xl">
                         <span className="terminal-text text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Execution Cap</span>
                         <div className="text-3xl font-black text-white">{report.score_breakdown.execution}<span className="text-sm opacity-30">/40</span></div>
                         <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(report.score_breakdown.execution / 40) * 100}%` }} className="bg-accent h-full shadow-[0_0_10px_var(--color-accent)]" />
                         </div>
                      </div>
                      <div className="p-8 border border-white/5 bg-red-500/5 space-y-4 rounded-xl">
                         <span className="terminal-text text-[10px] uppercase tracking-widest text-red-500 font-bold">Regulatory Penalty</span>
                         <div className="text-3xl font-black text-red-500">-{report.score_breakdown.regulatory_penalty}<span className="text-sm opacity-30">/30</span></div>
                         <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(report.score_breakdown.regulatory_penalty / 30) * 100}%` }} className="bg-red-500 h-full shadow-[0_0_10px_#f87171]" />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="terminal-text text-[11px] uppercase font-black text-accent tracking-[0.3em]">Competitor Threat Matrix</div>
                      <div className="grid grid-cols-1 gap-1 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                         {report.competitor_matrix.map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-6 bg-[#0a0a0a] hover:bg-white/5 transition-all">
                               <div className="space-y-1">
                                  <div className="text-sm font-black text-white uppercase tracking-tight">{c.name}</div>
                                  <div className="text-[11px] text-zinc-500 font-medium">{c.advantage}</div>
                               </div>
                               <div className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-[0.2em] border ${c.threat_level === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                  {c.threat_level} Priority
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                </motion.div>
             )}

             {activeTab === 'market' && (
                <motion.div key="market" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-16 max-w-4xl">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-4">
                         <div className="terminal-text text-[10px] uppercase font-black text-zinc-600 tracking-widest">Total Market (TAM)</div>
                         <div className="p-8 border border-white/5 border-dashed rounded-2xl bg-white/2">
                            <div className="text-2xl font-black text-white tracking-tight">{report.market_realism.tam_sam_som.tam}</div>
                         </div>
                      </div>
                      <div className="space-y-4">
                         <div className="terminal-text text-[10px] uppercase font-black text-zinc-600 tracking-widest">Serviceable (SAM)</div>
                         <div className="p-8 border border-white/5 border-dashed rounded-2xl bg-white/2">
                            <div className="text-2xl font-black text-white tracking-tight">{report.market_realism.tam_sam_som.sam}</div>
                         </div>
                      </div>
                      <div className="space-y-4">
                         <div className="terminal-text text-[10px] uppercase font-black text-accent tracking-widest">Targetable (SOM)</div>
                         <div className="p-8 border border-accent/20 border-dashed rounded-2xl bg-accent/5">
                            <div className="text-2xl font-black text-accent tracking-tight">{report.market_realism.tam_sam_som.som}</div>
                         </div>
                      </div>
                   </div>

                   <div className="p-10 border border-white/5 bg-[#0a0a0a] rounded-3xl relative overflow-hidden group hover:border-accent/20 transition-all">
                      <Layers className="absolute -bottom-10 -right-10 w-48 h-48 opacity-[0.02] text-accent group-hover:opacity-5 transition-all" />
                      <div className="space-y-6 relative z-10">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center">
                               <TrendingUp className="w-6 h-6 text-accent" />
                            </div>
                            <div className="terminal-text text-[11px] uppercase font-black text-accent tracking-[0.2em]">Tier Behavior Insights</div>
                         </div>
                         <p className="text-xl text-zinc-300 italic leading-relaxed font-medium">"{report.market_realism.tier_consumer_behavior}"</p>
                         <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                            <span className="terminal-text text-[10px] uppercase font-bold text-zinc-700">Audit Precision:</span>
                            <span className="terminal-text text-[10px] uppercase font-black text-white bg-white/5 px-3 py-1 rounded">{report.market_realism.tam_sam_som.realism_score}% Alignment</span>
                         </div>
                      </div>
                   </div>

                   {report.harsh_truth.insufficient_data_signals && report.harsh_truth.insufficient_data_signals.length > 0 && (
                      <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-2xl space-y-6">
                         <div className="flex items-center gap-4 text-red-500">
                            <AlertTriangle className="w-6 h-6" />
                            <span className="text-sm font-black uppercase tracking-[0.3em]">DATA INSUFFICIENT - ASSUMPTION RISK HIGH</span>
                         </div>
                         <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {report.harsh_truth.insufficient_data_signals.map((s, i) => (
                               <li key={i} className="text-[11px] text-zinc-400 flex items-start gap-3 bg-white/2 p-3 border border-white/5 rounded-lg">
                                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0 shadow-[0_0_5px_#ef4444]" /> 
                                  {s}
                               </li>
                            ))}
                         </ul>
                      </div>
                   )}
                </motion.div>
             )}

             {activeTab === 'legal' && (
                <motion.div key="legal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-16 max-w-4xl">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="p-10 border border-white/5 bg-[#0a0a0a] rounded-3xl space-y-8">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <ShieldCheck className="w-8 h-8 text-accent" />
                               <div className="terminal-text text-[12px] uppercase font-black text-white tracking-[0.1em]">DPDP 2023 Compliance</div>
                            </div>
                            <span className={`px-4 py-2 rounded-[4px] text-[10px] font-black uppercase tracking-widest border ${report.regulatory_audit.dpdp_compliance.risk_level === 'Low' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                               {report.regulatory_audit.dpdp_compliance.risk_level} Risk
                            </span>
                         </div>
                         <div className="space-y-6">
                            <span className="terminal-text text-[10px] uppercase font-black text-zinc-700 tracking-[0.3em]">Critical Guardrails:</span>
                            <ul className="space-y-4">
                               {report.regulatory_audit.dpdp_compliance.critical_actions.map((a, i) => (
                                  <li key={i} className="text-[13px] text-zinc-300 flex items-start gap-4 p-4 border border-white/5 rounded-xl bg-white/2">
                                     <div className="w-2 h-2 bg-accent rounded-full mt-2 shrink-0 shadow-accent/40" />
                                     {a}
                                  </li>
                               ))}
                            </ul>
                         </div>
                      </div>

                      <div className="p-10 border border-white/5 bg-[#0a0a0a] rounded-3xl space-y-10">
                         <div className="space-y-4">
                            <div className="flex items-center gap-4">
                               <FileText className="w-6 h-6 text-zinc-700" />
                               <div className="terminal-text text-[11px] uppercase font-black text-white tracking-widest">GST & Fiscal Protocol</div>
                            </div>
                            <p className="text-sm text-zinc-500 leading-relaxed font-mono p-6 bg-white/2 border border-white/5 rounded-xl">{report.regulatory_audit.gst_implications}</p>
                         </div>
                         <div className="space-y-4">
                            <div className="flex items-center gap-4">
                               <Gavel className="w-6 h-6 text-zinc-700" />
                               <div className="terminal-text text-[11px] uppercase font-black text-white tracking-widest">Labor Jurisprudence</div>
                            </div>
                            <p className="text-sm text-zinc-500 leading-relaxed font-mono p-6 bg-white/2 border border-white/5 rounded-xl">{report.regulatory_audit.labor_laws}</p>
                         </div>
                      </div>
                   </div>
                </motion.div>
             )}

             {activeTab === 'execution' && (
                <motion.div key="execution" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-16 max-w-4xl">
                   <div className="space-y-10">
                      <div className="flex items-center justify-between">
                         <div className="terminal-text text-[11px] uppercase font-black text-accent tracking-[0.3em]">90-Day GTM Strategic Protocol</div>
                         <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Interactive Execution Tracking Active</div>
                      </div>
                      
                      <div className="relative pl-12 space-y-16 after:content-[''] after:absolute after:left-5 after:top-2 after:bottom-2 after:w-[1px] after:bg-white/10 after:opacity-20">
                         {report.ninety_day_roadmap.map((step, i) => (
                            <div key={i} className="relative group">
                               <button 
                                 className="absolute -left-[35px] top-1 w-6 h-6 bg-[#0a0a0a] border border-white/10 rounded-full z-10 flex items-center justify-center hover:border-accent group-hover:scale-110 transition-all font-mono text-[8px] text-zinc-500"
                                 onClick={() => {
                                    alert(`Milestone Protocol Initialized: ${step}\nProgress will be synced with your Decision OS profile.`);
                                 }}
                               >
                                  {i+1}
                               </button>
                               <div className="p-8 border border-white/5 bg-[#0a0a0a] rounded-2xl relative transition-all cursor-default hover:border-accent/40 hover:translate-x-1">
                                  <div className="absolute top-0 right-0 p-4 terminal-text text-[9px] opacity-10 font-black flex items-center gap-2">
                                     <Clock className="w-3 h-3" /> PHASE_INT_0{(i/3+1).toFixed(0)}
                                  </div>
                                  <span className="text-lg text-zinc-300 leading-relaxed font-medium block pr-12">{step}</span>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="terminal-text text-[11px] uppercase font-black text-zinc-700 tracking-[0.2em]">Infrastructure Capacity & Financial Health</div>
                      <div className="p-10 border border-white/5 bg-[#0a0a0a] rounded-3xl font-mono text-[13px] leading-loose text-zinc-500 relative group overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Database className="w-24 h-24" />
                         </div>
                         <div className="text-white mb-6 uppercase font-black tracking-[0.3em] border-b border-white/5 pb-4 flex items-center justify-between">
                            <span>Venture_Audit_Log::Financial_Sim</span>
                            <span className="text-[10px] text-zinc-700">V2.0.4.Nexus</span>
                         </div>
                         <div className="p-6 bg-black/40 rounded-xl border border-white/5">
                            {report.financial_simulations}
                         </div>
                         <div className="mt-8 flex items-center gap-4 text-accent/80 font-black tracking-widest text-[11px]">
                            <div className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_8px_var(--color-accent)]" />
                            SIMULATION_END // GRID_READY_FOR_DEPLOYMENT
                         </div>
                      </div>
                   </div>
                </motion.div>
             )}

             {activeTab === 'simulator' && (
                <motion.div key="simulator" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12 max-w-4xl">
                   <div className="space-y-4">
                      <div className="terminal-text text-[11px] uppercase font-black text-accent tracking-[0.3em]">Strategic War Room (Scenario Simulation)</div>
                      <p className="text-zinc-500 text-sm font-medium">Model market shocks and recalculate venture viability scores in real-time.</p>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[
                        { title: 'Market Shock', desc: 'Competitor enters with aggressive pricing.', icon: TrendingDown },
                        { title: 'Capital Shock', desc: '50% budget cut or funding delay.', icon: Banknote },
                        { title: 'Regulatory Shock', desc: 'Sudden DPDP audit or compliance shift.', icon: ShieldAlert },
                        { title: 'Growth Shock', desc: 'Viral growth exceeds tech infrastructure.', icon: Zap }
                      ].map((s, i) => (
                        <button key={i} className="p-8 border border-white/5 bg-[#0a0a0a] rounded-2xl text-left space-y-4 hover:border-accent/40 transition-all group active:scale-95">
                           <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                              <s.icon className="w-5 h-5 text-accent" />
                           </div>
                           <div className="space-y-1">
                              <h4 className="text-sm font-black text-white uppercase tracking-tight">{s.title}</h4>
                              <p className="text-[11px] text-zinc-600 font-medium">{s.desc}</p>
                           </div>
                        </button>
                      ))}
                   </div>
                   
                   <div className="p-10 border border-white/5 bg-[#0a0a0a] rounded-3xl border-dashed flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                      <LayoutGrid className="w-12 h-12 text-zinc-700" />
                      <span className="terminal-text text-[10px] uppercase font-black tracking-[0.3em]">Awaiting Scenario Initialization...</span>
                   </div>
                </motion.div>
             )}

             {activeTab === 'assets' && (
                <motion.div key="assets" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12 max-w-4xl">
                   <div className="space-y-4">
                      <div className="terminal-text text-[11px] uppercase font-black text-accent tracking-[0.3em]">Venture Resource Hub</div>
                      <p className="text-zinc-500 text-sm font-medium">Generate actionable zero-to-one files based on your Strategic Audit.</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { title: 'Recruitment Protocol', category: 'Recruiter', icon: UserCircle },
                        { title: 'GTM Landing Copy', category: 'Marketer', icon: FileText },
                        { title: 'DPDP Audit Pack', category: 'Legal', icon: ShieldCheck }
                      ].map((a, i) => (
                        <div key={i} className="p-6 border border-white/5 bg-[#0a0a0a] rounded-2xl flex flex-col gap-6 group hover:border-accent/20 transition-all">
                           <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                              <a.icon className="w-6 h-6 text-zinc-500 group-hover:text-accent transition-colors" />
                           </div>
                           <div className="space-y-1">
                              <h4 className="text-xs font-black text-white uppercase tracking-tighter">{a.title}</h4>
                              <span className="text-[9px] text-zinc-700 font-black uppercase tracking-widest">{a.category} Agent Active</span>
                           </div>
                           <button className="w-full py-2 bg-white/5 border border-white/10 rounded text-[9px] font-black uppercase tracking-widest hover:bg-accent hover:text-black transition-all">
                              Generate Asset
                           </button>
                        </div>
                      ))}
                   </div>
                </motion.div>
             )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
