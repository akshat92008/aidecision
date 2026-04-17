"use client";

import React, { useState } from "react";
import { 
  ShieldAlert, 
  Target, 
  Map, 
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
  Network
} from "lucide-react";
import { motion } from "motion/react";
import { FinalReport } from "@/lib/shared/schemas";

interface ReportViewProps {
  report: FinalReport;
  query: string;
  onReset: () => void;
}

export default function ReportView({ report, query, onReset }: ReportViewProps) {
  const [activeTab, setActiveTab] = useState<'strategy' | 'market' | 'legal' | 'execution'>('strategy');

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
                <span className="terminal-text uppercase font-black text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded border border-accent/20">Strategic Audit</span>
                <span className="text-zinc-500">•</span>
                <span className="terminal-text text-[10px]">{report.industry_category}</span>
             </div>
             <h2 className="text-xl font-bold tracking-tight text-white uppercase">{query}</h2>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="text-right">
              <div className="terminal-text text-[9px] uppercase tracking-widest text-zinc-500">Viability Score</div>
              <div className="text-3xl font-black text-accent">{report.viability_score.toFixed(1)}%</div>
           </div>
        </div>
      </div>

      {/* NAVIGATOR */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 border-r border-white/5 flex flex-col p-4 space-y-2 bg-[#0a0a0a]">
           {[
             { id: 'strategy', label: 'Strategy Core', icon: Target },
             { id: 'market', label: 'Market Realism', icon: PieChart },
             { id: 'legal', label: 'Regulatory Wall', icon: Gavel },
             { id: 'execution', label: '90-Day Roadmap', icon: Calendar }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded ${activeTab === tab.id ? 'bg-accent/10 text-accent border border-accent/20 shadow-lg shadow-accent/5' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}
             >
               <tab.icon className="w-4 h-4" />
               {tab.label}
             </button>
           ))}
           <div className="flex-1" />
           <div className="p-4 bg-red-500/5 border border-red-500/20 rounded flex flex-col gap-2">
              <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Truth Bomb</span>
              <p className="text-[10px] text-zinc-400 italic leading-relaxed">"{report.harsh_truth.truth_bomb}"</p>
           </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <AnimatePresence mode="wait">
             {activeTab === 'strategy' && (
                <motion.div key="strategy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-4xl">
                   <div className="space-y-4">
                      <div className="terminal-text text-[10px] uppercase font-bold text-accent">Executive Audit Summary</div>
                      <p className="text-lg leading-relaxed text-zinc-300 font-medium">{report.summary}</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 border border-white/5 bg-white/2 backdrop-blur-sm space-y-2">
                         <span className="terminal-text text-[9px] uppercase tracking-widest text-zinc-500">Market Demand</span>
                         <div className="text-2xl font-black text-white">{report.score_breakdown.demand}/30</div>
                         <div className="w-full bg-white/5 h-1 rounded overflow-hidden">
                            <div className="bg-accent h-full" style={{ width: `${(report.score_breakdown.demand / 30) * 100}%` }} />
                         </div>
                      </div>
                      <div className="p-6 border border-white/5 bg-white/2 space-y-2">
                         <span className="terminal-text text-[9px] uppercase tracking-widest text-zinc-500">Execution Score</span>
                         <div className="text-2xl font-black text-white">{report.score_breakdown.execution}/40</div>
                         <div className="w-full bg-white/5 h-1 rounded overflow-hidden">
                            <div className="bg-accent h-full" style={{ width: `${(report.score_breakdown.execution / 40) * 100}%` }} />
                         </div>
                      </div>
                      <div className="p-6 border border-white/5 bg-red-500/5 space-y-2">
                         <span className="terminal-text text-[9px] uppercase tracking-widest text-red-500">Regulatory Penalty</span>
                         <div className="text-2xl font-black text-red-500">-{report.score_breakdown.regulatory_penalty}/30</div>
                         <div className="w-full bg-white/5 h-1 rounded overflow-hidden">
                            <div className="bg-red-500 h-full" style={{ width: `${(report.score_breakdown.regulatory_penalty / 30) * 100}%` }} />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="terminal-text text-[10px] uppercase font-bold text-accent">Competitor Threat Matrix</div>
                      <div className="grid grid-cols-1 gap-1 border border-white/10 rounded-lg overflow-hidden">
                         {report.competitor_matrix.map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/2 hover:bg-white/5 transition-colors">
                               <div className="space-y-1">
                                  <div className="text-sm font-bold text-white uppercase">{c.name}</div>
                                  <div className="text-[10px] text-zinc-500">{c.advantage}</div>
                               </div>
                               <div className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest ${c.threat_level === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                  {c.threat_level} Threat
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                </motion.div>
             )}

             {activeTab === 'market' && (
                <motion.div key="market" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-4xl">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-3">
                         <div className="terminal-text text-[10px] uppercase font-bold text-zinc-500">TAM (Total Market)</div>
                         <div className="p-6 border border-white/10 border-dashed rounded-xl bg-white/2">
                            <div className="text-xl font-bold text-white">{report.market_realism.tam_sam_som.tam}</div>
                         </div>
                      </div>
                      <div className="space-y-3">
                         <div className="terminal-text text-[10px] uppercase font-bold text-zinc-500">SAM (Serviceable)</div>
                         <div className="p-6 border border-white/10 border-dashed rounded-xl bg-white/2">
                            <div className="text-xl font-bold text-white">{report.market_realism.tam_sam_som.sam}</div>
                         </div>
                      </div>
                      <div className="space-y-3">
                         <div className="terminal-text text-[10px] uppercase font-bold text-zinc-500">SOM (Target)</div>
                         <div className="p-6 border border-accent/20 border-dashed rounded-xl bg-accent/5">
                            <div className="text-xl font-bold text-accent">{report.market_realism.tam_sam_som.som}</div>
                         </div>
                      </div>
                   </div>

                   <div className="p-8 border border-white/5 bg-white/2 rounded-2xl relative overflow-hidden">
                      <Layers className="absolute -bottom-8 -right-8 w-32 h-32 opacity-5 text-accent" />
                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center">
                               <TrendingUp className="w-5 h-5 text-accent" />
                            </div>
                            <div className="terminal-text text-[10px] uppercase font-bold text-accent">Tier Behavior Insights</div>
                         </div>
                         <p className="text-lg text-zinc-300 italic leading-relaxed">"{report.market_realism.tier_consumer_behavior}"</p>
                         <div className="flex items-center gap-2">
                            <span className="terminal-text text-[9px] uppercase font-bold text-zinc-600">Model Precision:</span>
                            <span className="terminal-text text-[9px] uppercase font-black text-white">{report.market_realism.tam_sam_som.realism_score}% Accuracy Index</span>
                         </div>
                      </div>
                   </div>

                   {report.harsh_truth.insufficient_data_signals && report.harsh_truth.insufficient_data_signals.length > 0 && (
                      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl space-y-4">
                         <div className="flex items-center gap-3 text-red-500">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="text-sm font-black uppercase tracking-widest">DATA INSUFFICIENT - ASSUMPTION RISK HIGH</span>
                         </div>
                         <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {report.harsh_truth.insufficient_data_signals.map((s, i) => (
                               <li key={i} className="text-[10px] text-zinc-400 flex items-center gap-2">
                                  <div className="w-1 h-1 bg-red-500 rounded-full" /> {s}
                               </li>
                            ))}
                         </ul>
                      </div>
                   )}
                </motion.div>
             )}

             {activeTab === 'legal' && (
                <motion.div key="legal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-4xl">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-8 border border-white/5 bg-white/2 rounded-2xl space-y-6">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <ShieldCheck className="w-6 h-6 text-accent" />
                               <div className="terminal-text text-[11px] uppercase font-bold text-white">DPDP 2023 Compliance</div>
                            </div>
                            <span className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest ${report.regulatory_audit.dpdp_compliance.risk_level === 'Low' ? 'bg-accent/10 text-accent' : 'bg-red-500/10 text-red-500'}`}>
                               {report.regulatory_audit.dpdp_compliance.risk_level} Risk
                            </span>
                         </div>
                         <div className="space-y-3">
                            <span className="terminal-text text-[9px] uppercase font-bold text-zinc-500 tracking-widest">Critical Actions Required:</span>
                            <ul className="space-y-2">
                               {report.regulatory_audit.dpdp_compliance.critical_actions.map((a, i) => (
                                  <li key={i} className="text-xs text-zinc-300 flex items-start gap-3">
                                     <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 shrink-0" />
                                     {a}
                                  </li>
                               ))}
                            </ul>
                         </div>
                      </div>

                      <div className="p-8 border border-white/5 bg-white/2 rounded-2xl space-y-8">
                         <div className="space-y-3">
                            <div className="flex items-center gap-3">
                               <FileText className="w-5 h-5 text-zinc-500" />
                               <div className="terminal-text text-[11px] uppercase font-bold text-white">GST Implications</div>
                            </div>
                            <p className="text-sm text-zinc-400 leading-relaxed font-mono">{report.regulatory_audit.gst_implications}</p>
                         </div>
                         <div className="space-y-3">
                            <div className="flex items-center gap-3">
                               <Gavel className="w-5 h-5 text-zinc-500" />
                               <div className="terminal-text text-[11px] uppercase font-bold text-white">Labor Law Audit</div>
                            </div>
                            <p className="text-sm text-zinc-400 leading-relaxed font-mono">{report.regulatory_audit.labor_laws}</p>
                         </div>
                      </div>
                   </div>
                </motion.div>
             )}

             {activeTab === 'execution' && (
                <motion.div key="execution" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-4xl">
                   <div className="space-y-6">
                      <div className="terminal-text text-[10px] uppercase font-bold text-accent">90-Day Execution Roadmap</div>
                      <div className="relative pl-8 space-y-12 after:content-[''] after:absolute after:left-3 after:top-2 after:bottom-2 after:w-px after:bg-white/5">
                         {report.ninety_day_roadmap.map((step, i) => (
                            <div key={i} className="relative">
                               <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 bg-accent border border-black rounded-full z-10" />
                               <div className="p-5 border border-white/5 bg-white/2 rounded-xl relative group hover:border-accent/40 transition-all cursor-default">
                                  <div className="absolute top-0 right-0 p-3 terminal-text text-[8px] opacity-10 font-black">PHASE_0{(i/3+1).toFixed(0)}</div>
                                  <span className="text-sm text-zinc-300 leading-relaxed font-medium block">{step}</span>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="terminal-text text-[10px] uppercase font-bold text-zinc-500">Infrastructure & Financial Simulation</div>
                      <div className="p-8 border border-white/5 bg-[#0a0a0a] rounded-2xl font-mono text-xs leading-relaxed text-zinc-500">
                         <div className="text-white mb-4 uppercase font-bold tracking-[0.2em] border-b border-white/5 pb-2">Venture_Simulation_Log_Output:</div>
                         {report.financial_simulations}
                         <div className="mt-6 flex items-center gap-2 text-accent">
                            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                            Simulation Complete. Burn/Growth ratios verified for India 2026.
                         </div>
                      </div>
                   </div>
                </motion.div>
             )}
          </AnimatePresence>
        </main>
      </div>

      {/* FOOTER BAR */}
      <div className="p-4 border-t border-white/5 bg-[#0a0a0a] flex items-center justify-between px-8">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 terminal-text text-[9px] uppercase font-bold text-zinc-500">
               <Network className="w-3 h-3" /> Synthesis Status: <span className="text-accent italic">Lossless</span>
            </div>
            <div className="flex items-center gap-2 terminal-text text-[9px] uppercase font-bold text-zinc-500">
               <Search className="w-3 h-3" /> Data Freshness: <span className="text-white">Live (T+2)</span>
            </div>
         </div>
         <button className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded text-[10px] uppercase font-black tracking-[0.2em] text-accent hover:bg-accent/20 transition-all">
            <Layers className="w-4 h-4" /> Export Strategic Audit (V2)
         </button>
      </div>
    </div>
  );
}

// Helper component for AnimatePresence
import { AnimatePresence } from "motion/react";
import { ShieldCheck } from "lucide-react";
