"use client";

import React from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreVertical,
  Activity,
  MapPin, 
  Banknote 
} from "lucide-react";
import { Decision } from "@/lib/shared/schemas";
import { motion } from "framer-motion";

interface DecisionCardProps {
  decision: Decision;
  onClick: () => void;
}

export const DecisionCard = ({ decision, onClick }: DecisionCardProps) => {
  const completedMilestones = decision.milestones.filter(m => m.status === 'completed').length;
  const totalMilestones = decision.milestones.length;
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="war-room-panel group cursor-pointer border border-white/5 bg-[#0a0a0a] hover:border-accent/40 transition-all p-6 rounded-xl flex flex-col gap-6 relative overflow-hidden"
      onClick={onClick}
    >
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
         <Activity className="w-24 h-24" />
      </div>

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="terminal-text text-[9px] uppercase font-black px-2 py-0.5 bg-accent/10 text-accent rounded border border-accent/20">
               {decision.status}
            </span>
            <span className="text-zinc-700 font-mono text-[9px]">{new Date(decision.updated_at).toLocaleDateString()}</span>
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-tight line-clamp-1">{decision.query}</h3>
        </div>
        <button className="p-2 text-zinc-700 hover:text-white transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/2 border border-white/5 rounded-lg space-y-1">
          <span className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Viability</span>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-white">{decision.viability_score.toFixed(0)}%</span>
            <div className={`flex items-center gap-1 text-[10px] font-bold mb-1 ${decision.score_trend >= 0 ? 'text-accent' : 'text-red-500'}`}>
              {decision.score_trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(decision.score_trend)}
            </div>
          </div>
        </div>
        <div className="p-4 bg-white/2 border border-white/5 rounded-lg space-y-1">
          <span className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Execution</span>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-white">{progress.toFixed(0)}%</span>
            <span className="text-[9px] text-zinc-700 font-black mb-1 uppercase bg-white/5 px-1.5 py-0.5 rounded">Sync</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between terminal-text text-[9px] font-black uppercase tracking-widest text-zinc-500">
           <span>Roadmap Status</span>
           <span>{completedMilestones}/{totalMilestones} Phases</span>
        </div>
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="bg-accent h-full shadow-[0_0_8px_var(--color-accent)]"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 pt-2 border-t border-white/5">
        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-zinc-500">
          <MapPin className="w-3 h-3" /> {decision.constraints.location_tier}
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-zinc-500">
          <Banknote className="w-3 h-3" /> {decision.constraints.budget_inr}
        </div>
      </div>
    </motion.div>
  );
};
