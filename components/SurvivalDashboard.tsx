"use client";

import React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  Target,
  Clock,
  Briefcase
} from "lucide-react";
import { motion } from "framer-motion";

interface SurvivalDashboardProps {
  report: any;
  onRunSimulation: () => void;
}

export const SurvivalDashboard = ({ report, onRunSimulation }: SurvivalDashboardProps) => {
  const runway = report.runway_guardian || {
    runway_score: 75,
    runway_status: "HEALTHY",
    risk_heatmap: { survivalConfidence: "85%" },
    raw_metrics: { runway_months: 6.2, burn_rate: 500000 }
  };

  const brain = report || {};

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 bg-[#060606] min-h-screen text-slate-200">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-8 border-b border-slate-800/50">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Strategic Survival Dashboard</h1>
          <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">Active Decision Intelligence // Unified State</p>
        </div>
        <button 
          onClick={onRunSimulation}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all flex items-center gap-2"
        >
          <Zap className="w-4 h-4 fill-white" /> Open Simulation War Room
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* A. RUNWAY PANEL */}
        <div className="bg-[#0a0a0a] border border-slate-800/50 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Clock className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
             </div>
             <span className="text-xs font-black uppercase tracking-widest text-slate-500">Capital Runway</span>
          </div>
          
          <div className="flex items-end gap-6 pt-4">
             <div className="space-y-1">
                <p className="text-sm font-bold text-slate-500 uppercase">Current</p>
                <h2 className="text-6xl font-black text-white tracking-tighter">{runway.raw_metrics.runway_months}<span className="text-xl text-slate-600 ml-2">Mo</span></h2>
             </div>
             <div className="pb-2">
                <ArrowRight className="w-8 h-8 text-slate-800" />
             </div>
             <div className="space-y-1">
                <p className="text-sm font-bold text-indigo-400 uppercase">Optimized</p>
                <h2 className="text-6xl font-black text-emerald-500 tracking-tighter">9.1<span className="text-xl text-emerald-900 ml-2">Mo</span></h2>
             </div>
          </div>
          <div className="pt-4 flex items-center gap-2 text-emerald-500 text-sm font-bold">
             <TrendingUp className="w-4 h-4" /> +2.9 Months gained with recommended actions
          </div>
        </div>

        {/* B. RISK PANEL */}
        <div className="bg-[#0a0a0a] border border-slate-800/50 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <ShieldCheck className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Zap className="w-5 h-5 text-indigo-500" />
             </div>
             <span className="text-xs font-black uppercase tracking-widest text-slate-500">Survival Probability</span>
          </div>

          <div className="pt-4 flex items-center gap-12">
             <div className="relative">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364" strokeDashoffset={364 - (364 * parseInt(runway.risk_heatmap.survivalConfidence)) / 100} className="text-indigo-500" strokeLinecap="round" />
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-black text-white">
                   {runway.risk_heatmap.survivalConfidence}
                </div>
             </div>
             <div className="space-y-4">
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">System Status</p>
                   <p className={`text-lg font-black uppercase ${runway.runway_status === 'HEALTHY' ? 'text-emerald-500' : 'text-red-500'}`}>{runway.runway_status}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Cash-out Risk</p>
                   <p className="text-lg font-black text-white uppercase">LOW IMPACT</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* C. DECISION IMPACT (Double Width) */}
         <div className="lg:col-span-2 bg-[#0a0a0a] border border-slate-800/50 rounded-3xl p-8 space-y-8 shadow-2xl">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                     <Target className="w-5 h-5 text-amber-500" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Strategic Decision Impact</span>
               </div>
               <span className="text-[10px] font-bold text-slate-600 uppercase italic">Analysis of: "{brain.industry_category}"</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">Financial Consequences</h3>
                  <ul className="space-y-4">
                     {[
                       { label: 'Burn Rate Increase', value: `+₹${(runway.raw_metrics.burn_rate * 0.2).toLocaleString()}`, icon: TrendingUp, color: 'text-red-500' },
                       { label: 'Runway Change', value: '-1.4 Months', icon: TrendingDown, color: 'text-red-500' },
                       { label: 'Survival Impact', value: '-8% Confidence', icon: AlertCircle, color: 'text-red-400' }
                     ].map((item, i) => (
                       <li key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <div className="flex items-center gap-3">
                             <item.icon className="w-4 h-4 text-slate-500" />
                             <span className="text-xs font-bold text-slate-400 uppercase">{item.label}</span>
                          </div>
                          <span className={`text-sm font-black ${item.color}`}>{item.value}</span>
                       </li>
                     ))}
                  </ul>
               </div>

               <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">Market Reasoning (The Brain)</h3>
                  <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl relative">
                     <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Briefcase className="w-12 h-12" />
                     </div>
                     <p className="text-sm text-slate-400 leading-relaxed italic">
                        "{brain.summary}"
                     </p>
                  </div>
               </div>
            </div>
         </div>

         {/* D. ACTION RECOMMENDATIONS */}
         <div className="bg-[#0a0a0a] border border-slate-800/50 rounded-3xl p-8 space-y-8 shadow-2xl">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-indigo-500" />
               </div>
               <span className="text-xs font-black uppercase tracking-widest text-slate-500">Founder Action Plan</span>
            </div>

            <div className="space-y-4">
               {brain.ninety_day_roadmap ? brain.ninety_day_roadmap.slice(0, 3).map((action: string, i: number) => (
                 <div key={i} className="group p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-indigo-500/50 transition-all cursor-default relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600 opacity-20 group-hover:opacity-100 transition-opacity" />
                    <div className="flex gap-4">
                       <span className="text-xs font-black text-indigo-500 opacity-30">0{i+1}</span>
                       <p className="text-[13px] font-bold text-slate-300 leading-snug">{action}</p>
                    </div>
                 </div>
               )) : (
                 <p className="text-slate-500 italic text-sm">Awaiting Strategic Synthesis...</p>
               )}
            </div>

            <button className="w-full py-4 border border-indigo-600/30 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all">
               Generate Detailed PDF Audit
            </button>
         </div>
      </div>
    </div>
  );
};
