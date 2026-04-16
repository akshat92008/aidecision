"use client";

import { motion } from "motion/react";
import { 
  BarChart2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Network, 
  ShieldAlert, 
  Target,
  LineChart,
  Zap,
  DollarSign,
  TrendingUp,
  Flame,
  Search,
  ListChecks,
  RefreshCw,
  Ghost
} from "lucide-react";
import { FinalReport, ScoreBreakdown } from "@/lib/shared/schemas";

interface ReportViewProps {
  report: FinalReport;
  query: string;
  onReset: () => void;
}

export function ReportView({ report, query, onReset }: ReportViewProps) {
  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case "Worth Testing": return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_30px_rgba(34,197,94,0.1)]";
      case "Strong Risk": return "text-rose-500 border-rose-500/30 bg-rose-500/10 shadow-[0_0_30px_rgba(244,63,94,0.1)]";
      case "Moderate Risk": return "text-amber-400 border-amber-400/30 bg-amber-400/10 shadow-[0_0_30px_rgba(251,191,36,0.1)]";
      default: return "text-text-muted border-white/10 bg-white/5";
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "Worth Testing": return <CheckCircle2 className="w-10 h-10" />;
      case "Strong Risk": return <XCircle className="w-10 h-10" />;
      case "Moderate Risk": return <AlertTriangle className="w-10 h-10" />;
      default: return null;
    }
  };

  const scoreItems = [
    { label: "Market Demand", value: report.score_breakdown.demand, max: 30, icon: <TrendingUp className="w-4 h-4" /> },
    { label: "Competition", value: report.score_breakdown.competition, max: 20, icon: <Target className="w-4 h-4" /> },
    { label: "Execution ease", value: report.score_breakdown.execution, max: 25, icon: <Zap className="w-4 h-4" /> },
    { label: "Monetization", value: report.score_breakdown.monetization, max: 25, icon: <DollarSign className="w-4 h-4" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="w-full space-y-10 pb-32"
    >
      {/* Header Badge */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-3">
             <span className="bg-accent-primary/20 text-accent-primary text-[9px] font-black uppercase tracking-[0.3em] px-4 py-1 rounded-full border border-accent-primary/30">
               {report.industry_category}
             </span>
             <span className="text-text-muted text-[9px] uppercase tracking-[0.4em] font-mono">Expert Synthesis</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight">
            {query}
          </h2>
        </div>
        <button 
          onClick={onReset}
          className="text-[10px] uppercase font-bold tracking-[0.3em] px-8 py-4 border border-white/10 rounded-full hover:bg-white/5 transition-all text-text-muted hover:text-white"
        >
          New Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 🔥 THE HARSH TRUTH CARD (Primary Impact) */}
        <div className="lg:col-span-12 xl:col-span-8 bg-[#0a0a0a] border border-rose-500/20 rounded-[40px] p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <Flame className="w-64 h-64 text-rose-500" />
          </div>
          <div className="flex items-center gap-3 mb-10 relative z-10">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h3 className="uppercase tracking-[0.3em] text-[10px] font-black text-rose-400">The Harsh Truth Pass</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
            <div className="space-y-6">
              {report.harsh_truth.failure_reasons.map((item, i) => (
                <div key={i} className="group relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[8px] uppercase font-black px-2 py-0.5 rounded-sm ${
                      item.severity === 'Critical' ? 'bg-rose-600 text-white' : 'bg-white/10 text-white'
                    }`}>
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-white mb-2 group-hover:text-rose-400 transition-colors">
                    {item.reason}
                  </p>
                  <p className="text-sm text-text-muted italic leading-relaxed font-light">
                    "{item.explanation}"
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-10">
              <div className="bg-rose-500/5 border border-rose-500/10 rounded-3xl p-8 relative">
                 <h4 className="text-[10px] uppercase tracking-widest font-black text-rose-400 mb-4">Brutal Reality Check</h4>
                 <p className="text-md text-text-main font-medium italic leading-relaxed">
                   "{report.harsh_truth.truth_bomb}"
                 </p>
              </div>
              <div className="space-y-4">
                 <h4 className="text-[10px] uppercase tracking-widest font-black text-text-muted mb-4 opacity-50">Downside Risks</h4>
                 {report.harsh_truth.downside_risks.map((risk, i) => (
                    <div key={i} className="flex gap-3 text-sm text-text-muted font-light">
                      <span className="text-rose-500 font-bold select-none">•</span>
                      <span>{risk}</span>
                    </div>
                 ))}
              </div>
            </div>
          </div>
        </div>

        {/* 📊 SUCCESS PROBABILITY & VERDICT */}
        <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-8">
           <div className="bg-glass-surface border border-glass-border rounded-[40px] p-10 flex-1 flex flex-col items-center justify-center text-center shadow-2xl min-h-[300px]">
              <h3 className="uppercase tracking-[0.3em] text-[10px] font-black text-text-muted mb-8">Success probability</h3>
              <div className="relative">
                 {/* Decorative Circle */}
                 <div className="absolute inset-0 scale-[1.8] blur-3xl bg-accent-primary opacity-10 rounded-full" />
                 <span className="text-8xl font-display font-black tracking-tighter text-white relative z-10">
                   {report.success_probability}%
                 </span>
              </div>
              <p className="mt-8 text-xs text-text-muted font-medium uppercase tracking-widest opacity-60">
                 Calculated Confidence
              </p>
           </div>

           <div className={`rounded-[40px] p-10 border-2 flex flex-col items-center gap-6 transition-all ${getVerdictStyle(report.verdict)}`}>
              {getVerdictIcon(report.verdict)}
              <div className="text-center">
                 <p className="text-[10px] uppercase tracking-[0.4em] font-black opacity-60 mb-2">Final Verdict</p>
                 <h4 className="text-3xl font-display font-black italic uppercase tracking-tighter">{report.verdict}</h4>
              </div>
           </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* WEIGHHTED MATRIX */}
        <div className="bg-glass-surface border border-glass-border rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-5">
              <BarChart2 className="w-32 h-32" />
           </div>
           <div className="flex items-center gap-3 mb-12">
            <Target className="w-5 h-5 text-accent-secondary" />
            <h3 className="uppercase tracking-[0.3em] text-[10px] font-black text-text-muted">Weighted Analytics matrix</h3>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
              {scoreItems.map((item, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-mono tracking-widest uppercase opacity-70">
                    <div className="flex items-center gap-2">
                       {item.icon}
                       <span>{item.label}</span>
                    </div>
                    <span>{item.value}<span className="opacity-40 ml-1">/{item.max}</span></span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/10">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: (item.value / item.max) * 100 + "%" }}
                      transition={{ duration: 1.5, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full"
                    />
                  </div>
                </div>
              ))}
           </div>

           <div className="mt-12 pt-8 border-t border-white/5">
              <span className="text-3xl font-display font-light text-white italic">
                {report.score_total}<span className="text-sm opacity-40 ml-1">/100 Total Score</span>
              </span>
           </div>
        </div>

        {/* MARKET REALITY */}
        <div className="bg-glass-surface border border-glass-border rounded-[40px] p-10 shadow-2xl">
           <div className="flex items-center gap-3 mb-10">
            <Search className="w-5 h-5 text-blue-400" />
            <h3 className="uppercase tracking-[0.3em] text-[10px] font-black text-text-muted">Market Reality Scan</h3>
           </div>
           
           <div className="space-y-10">
              <div className="grid grid-cols-1 gap-4">
                 {report.research.market_trends.map((trend, i) => (
                    <div key={i} className="flex gap-4 items-center bg-white/5 border border-white/5 rounded-2xl p-4 transition-colors hover:border-blue-400/20">
                       <Ghost className="w-4 h-4 text-blue-400/60" />
                       <p className="text-sm text-text-main font-light italic">{trend}</p>
                    </div>
                 ))}
              </div>
              <div className="pt-8 border-t border-white/5">
                 <h4 className="text-[9px] uppercase tracking-widest font-black text-text-muted mb-4 opacity-50 italic">Competitor Scan Results</h4>
                 <p className="text-sm text-text-muted leading-relaxed font-light italic leading-loose">
                    "{report.research.competitor_landscape}"
                 </p>
              </div>
           </div>
        </div>

      </div>

      {/* FOOTER: ROADMAP & ACTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-glass-surface border border-glass-border rounded-[40px] p-10 shadow-2xl">
            <div className="flex items-center gap-3 mb-12">
               <ListChecks className="w-5 h-5 text-emerald-400" />
               <h3 className="uppercase tracking-[0.3em] text-[10px] font-black text-text-muted">Strategic Roadmap</h3>
            </div>
            <div className="space-y-8">
               {report.action_plan.map((step, i) => (
                  <div key={i} className="flex gap-8 group">
                     <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-black text-emerald-400">
                          {i + 1}
                        </div>
                        {i !== report.action_plan.length - 1 && <div className="w-px h-full bg-emerald-500/20" />}
                     </div>
                     <div className="pb-8">
                        <p className="text-text-main leading-relaxed font-medium text-lg mb-2">{step}</p>
                        <p className="text-[10px] uppercase font-mono tracking-widest text-text-muted">Phase 0{i+1}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="flex flex-col gap-8">
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[40px] p-8 shadow-2xl">
              <div className="flex flex-col items-center text-center p-6 bg-white/5 rounded-3xl border border-white/5">
                 <Zap className="w-8 h-8 text-emerald-400 mb-6" />
                 <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-emerald-400 mb-4">Immediate Validation</h4>
                 <p className="text-sm text-text-main font-bold leading-relaxed">{report.validation_step}</p>
              </div>
            </div>

            <div className="bg-glass-surface border border-glass-border rounded-[40px] p-10 flex-1 shadow-2xl">
               <div className="flex items-center gap-3 mb-8">
                  <RefreshCw className="w-5 h-5 text-amber-400" />
                  <h3 className="uppercase tracking-[0.3em] text-[10px] font-black text-text-muted">Strategic Pivots</h3>
               </div>
               <div className="space-y-4">
                  {report.alternatives.map((alt, i) => (
                     <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-text-muted leading-relaxed font-light italic">
                        {alt}
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
