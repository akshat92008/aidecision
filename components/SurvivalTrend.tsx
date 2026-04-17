"use client";

import React from "react";
import { motion } from "framer-motion";

interface SurvivalTrendProps {
  report: any;
}

export const SurvivalTrend = ({ report }: SurvivalTrendProps) => {
  // Generate mock trend data based on runway
  const runwayMonths = report.runway_guardian?.raw_metrics?.runway_months || 6.2;
  
  // Data points for a 12-month projection
  const data = Array.from({ length: 12 }, (_, i) => {
    const baseline = runwayMonths * 10; // scale for visualization
    const month = i + 1;
    // Survival probability decays or stabilizes based on score
    const value = Math.max(10, baseline - (i * 8) + (Math.random() * 5));
    return { month: `M${month}`, value };
  });

  const maxVal = Math.max(...data.map(d => d.value));

  return (
    <div className="w-full h-full flex items-end gap-2 px-4">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
          <div className="relative w-full flex items-end justify-center h-[180px]">
             <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${(item.value / maxVal) * 100}%` }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className={`w-full max-w-[40px] rounded-t-lg transition-all ${item.value > 40 ? 'bg-indigo-600/40 group-hover:bg-indigo-500' : 'bg-red-500/40 group-hover:bg-red-400'}`}
             />
             {/* Tooltip on hover */}
             <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-[10px] font-bold px-2 py-1 rounded text-white whitespace-nowrap z-20">
                {Math.round(item.value)}% Survival
             </div>
          </div>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{item.month}</span>
        </div>
      ))}
    </div>
  );
};
