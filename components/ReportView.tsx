"use client";

import React, { useState } from "react";
import { 
  ShieldAlert, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  ArrowLeft,
  ArrowRight,
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

import { SurvivalDashboard } from "./SurvivalDashboard";
import { SurvivalTrend } from "./SurvivalTrend";

interface ReportViewProps {
  report: FinalReport;
  query: string;
  onReset: () => void;
}

export default function ReportView({ report, query, onReset }: ReportViewProps) {
  const [showSim, setShowSim] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#060606] overflow-hidden">
      {/* SaaS HEADER */}
      <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-10 bg-[#080808]/80 backdrop-blur-xl z-50">
         <div className="flex items-center gap-6">
            <button 
              onClick={onReset}
              className="p-2.5 hover:bg-white/5 border border-white/10 rounded-xl transition-colors text-slate-500 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="space-y-0.5">
               <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded">Audit Case #00742</span>
                  <span className="text-slate-700">•</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{report.industry_category}</span>
               </div>
               <h2 className="text-xl font-bold tracking-tight text-white uppercase truncate max-w-md">{query}</h2>
            </div>
         </div>

         <div className="flex items-center gap-10">
            <div className="text-right">
               <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Viability Signal</div>
               <div className="text-2xl font-black text-emerald-400">{report.viability_score.toFixed(1)}%</div>
            </div>
            <button 
              onClick={() => setShowSim(!showSim)}
              className="px-6 py-3 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all rounded-xl shadow-lg"
            >
               Toggle Strategic Simulation
            </button>
         </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-[#060606]">
        <SurvivalDashboard report={report} onRunSimulation={() => setShowSim(true)} />
        
        {/* WEEKLY REPORT PREVIEW */}
        <div className="max-w-7xl mx-auto px-8 pb-20 space-y-8">
           <div className="p-10 border border-slate-800/50 bg-[#080808] rounded-[2rem] space-y-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                 <LayoutGrid className="w-64 h-64" />
              </div>
              
              <div className="flex items-center justify-between relative z-10">
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Your Weekly Survival Report</h3>
                    <p className="text-slate-500 text-sm font-medium">Auto-generated simulation of your next 12 months under current conditions.</p>
                 </div>
                 <button className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-widest hover:text-indigo-300 transition-colors">
                    View Full Forecast <ArrowRight className="w-4 h-4" />
                 </button>
              </div>

              <div className="h-[300px] w-full bg-black/40 border border-white/5 rounded-3xl p-8 relative z-10">
                 <SurvivalTrend report={report} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                 <div className="space-y-3">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Top Risk Exposure</div>
                    <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-2xl">
                       <p className="text-sm font-bold text-red-500 leading-snug">Regulatory Friction in {report.industry_category}</p>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Key Recovery Action</div>
                    <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                       <p className="text-sm font-bold text-emerald-500 leading-snug">{(report.ninety_day_roadmap?.[0]) || "Strategic Optimization Required"}</p>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Burn Trend</div>
                    <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl font-mono text-sm font-black text-amber-500">
                       STABLE (-2% Efficiency Variance)
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </main>

      {/* OVERLAY SIMULATION PANEL */}
      <AnimatePresence>
        {showSim && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 150 }}
            className="absolute inset-y-0 right-0 w-[600px] bg-[#080808] border-l border-slate-800 shadow-2xl z-[100]"
          >
            <div className="h-full flex flex-col">
               <header className="p-8 border-b border-slate-800/50 flex items-center justify-between">
                  <h3 className="text-xl font-black text-white uppercase">Real-Time Scenario War Room</h3>
                  <button 
                    onClick={() => setShowSim(false)}
                    className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </button>
               </header>
               <div className="flex-1 overflow-y-auto">
                  <SimulationLab onBack={() => setShowSim(false)} />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
