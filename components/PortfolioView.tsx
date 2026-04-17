"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  Table as TableIcon, 
  Filter, 
  Zap,
  TrendingUp,
  Brain,
  History,
  Activity
} from "lucide-react";
import { Decision } from "@/lib/shared/schemas";
import { DecisionCard } from "./DecisionCard";
import { motion, AnimatePresence } from "framer-motion";

interface PortfolioViewProps {
  decisions: Decision[];
  onCreateNew: () => void;
  onSelectDecision: (decision: Decision) => void;
}

export const PortfolioView = ({ decisions, onCreateNew, onSelectDecision }: PortfolioViewProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filter, setFilter] = useState('all');

  const filteredDecisions = decisions.filter(d => 
    filter === 'all' ? true : d.status === filter
  );

  return (
    <div className="max-w-7xl mx-auto p-10 space-y-10 h-full overflow-y-auto scrollbar-hide">
      {/* PORTFOLIO HEADER */}
      <div className="flex items-end justify-between border-b border-white/5 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 terminal-text text-[10px] font-black uppercase text-accent tracking-[0.3em]">
             <div className="w-2 h-2 bg-accent rounded-sm animate-pulse" />
             Strategic Portfolio Matrix
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Your Venture <span className="text-zinc-700">Operating System</span></h1>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex bg-[#0a0a0a] border border-white/10 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-600 hover:text-white'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`p-2 rounded ${viewMode === 'table' ? 'bg-white/10 text-white' : 'text-zinc-600 hover:text-white'}`}
              >
                <TableIcon className="w-4 h-4" />
              </button>
           </div>
           
           <button 
             onClick={onCreateNew}
             className="flex items-center gap-3 px-8 py-4 bg-accent text-black text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-accent/10"
           >
              Initialize Audit <Plus className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* METRICS STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Audits', value: decisions.length, icon: Brain },
          { label: 'Active Missions', value: decisions.filter(d => d.status === 'active').length, icon: Activity },
          { label: 'Avg Viability', value: `${(decisions.reduce((acc, d) => acc + d.viability_score, 0) / (decisions.length || 1)).toFixed(0)}%`, icon: TrendingUp },
          { label: 'Pivots Logged', value: decisions.filter(d => d.status === 'pivot').length, icon: History },
        ].map((m, i) => (
          <div key={i} className="p-6 border border-white/5 bg-[#0a0a0a] rounded-xl flex items-center justify-between group hover:border-accent/20 transition-all">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-black text-zinc-600 tracking-widest">{m.label}</span>
              <div className="text-2xl font-black text-white">{m.value}</div>
            </div>
            <m.icon className="w-8 h-8 text-zinc-800 group-hover:text-accent/40 transition-colors" />
          </div>
        ))}
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-accent transition-colors" />
            <input 
              placeholder="Search strategic intents..." 
              className="bg-[#0a0a0a] border border-white/5 rounded-full py-3 pl-12 pr-6 text-xs text-white focus:outline-none focus:border-accent/40 w-80 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-700" />
            {['all', 'active', 'pivot', 'kill'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-[9px] uppercase font-black tracking-widest transition-all ${filter === f ? 'bg-accent text-black' : 'border border-white/5 text-zinc-600 hover:text-white hover:border-white/20'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ASSET GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredDecisions.length === 0 ? (
            <div className="col-span-full h-80 border border-white/5 border-dashed rounded-3xl flex flex-col items-center justify-center space-y-4 text-zinc-700">
               <Zap className="w-12 h-12 opacity-20" />
               <p className="text-[11px] uppercase font-black tracking-[0.3em]">No Decision Signals Found In Range</p>
            </div>
          ) : (
            filteredDecisions.map((decision) => (
              <DecisionCard 
                key={decision.id} 
                decision={decision} 
                onClick={() => onSelectDecision(decision)} 
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* SYSTEM LOG FOOTER */}
      <div className="pt-20 pb-10 flex items-center justify-center opacity-10">
         <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.5em]">
            <span>Grid_Sync_Ready</span>
            <span>•</span>
            <span>Auth: Secured</span>
            <span>•</span>
            <span>Decision_OS_v2</span>
         </div>
      </div>
    </div>
  );
};
