"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Users, 
  DollarSign, 
  Calendar,
  ChevronRight,
  RefreshCcw,
  Zap
} from "lucide-react";
import { StartupFinancials, PlannedChange } from "@/lib/server/simulation-engine";

interface Props {
  onBack: () => void;
}

export const SimulationLab: React.FC<Props> = ({ onBack }) => {
  const [financials, setFinancials] = useState<StartupFinancials>({
    current_cash: 5000000,
    monthly_revenue: 800000,
    monthly_fixed_costs: 300000,
    monthly_variable_costs: 150000,
    team_size: 8,
    avg_salary_per_employee: 120000,
    growth_rate: 4.5,
    planned_changes: []
  });

  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runSimulation = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(financials)
      });
      const data = await res.json();
      setSimulationResult(data);
    } catch (err) {
      console.error("Simulation failure", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addScenario = () => {
    setFinancials(prev => ({
      ...prev,
      planned_changes: [
        ...prev.planned_changes,
        {
          label: `Scenario ${prev.planned_changes.length + 1}`,
          hire_count: 0,
          salary_per_hire: 0,
          marketing_spend_change: 0,
          revenue_growth_change: 0,
          delay_in_launch_days: 0,
          one_time_cost: 0,
          one_time_revenue_boost: 0
        }
      ]
    }));
  };

  return (
    <div className="h-full flex flex-col p-12 bg-black/40 overflow-y-auto">
      <div className="max-w-7xl mx-auto w-full space-y-12">
        {/* HEADER */}
        <div className="flex justify-between items-end border-b border-white/5 pb-8">
          <div className="space-y-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Strategic Frontier</h2>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Simulation Lab <span className="text-zinc-800">v1.0</span></h1>
          </div>
          <button 
            onClick={runSimulation}
            disabled={isLoading}
            className="flex items-center gap-3 px-8 py-4 bg-white text-black text-[11px] font-black uppercase tracking-widest hover:bg-accent hover:text-black transition-all disabled:opacity-50"
          >
            {isLoading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Execute Scenarios
          </button>
        </div>

        <div className="grid grid-cols-12 gap-12">
          {/* INPUTS COLUMN */}
          <div className="col-span-12 lg:col-span-4 space-y-10">
            <section className="space-y-6">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full" /> Baseline Metrics
              </h3>
              
              <div className="space-y-4">
                {[
                  { label: "Current Cash", key: "current_cash", prefix: "₹" },
                  { label: "Monthly Revenue", key: "monthly_revenue", prefix: "₹" },
                  { label: "Fixed Costs", key: "monthly_fixed_costs", prefix: "₹" },
                  { label: "Variable Costs", key: "monthly_variable_costs", prefix: "₹" },
                  { label: "Team Size", key: "team_size" },
                  { label: "Avg Salary", key: "avg_salary_per_employee", prefix: "₹" },
                  { label: "Growth Rate", key: "growth_rate", suffix: "%" }
                ].map((input) => (
                  <div key={input.key} className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-zinc-600 tracking-wider font-mono">{input.label}</label>
                    <div className="flex items-center bg-white/5 border border-white/10 p-3 rounded group focus-within:border-accent/40 transition-colors">
                      {input.prefix && <span className="text-zinc-600 mr-2 text-xs">{input.prefix}</span>}
                      <input 
                        type="number"
                        className="bg-transparent w-full focus:outline-none text-xs text-white font-mono"
                        value={(financials as any)[input.key]}
                        onChange={(e) => setFinancials(prev => ({ ...prev, [input.key]: parseFloat(e.target.value) || 0 }))}
                      />
                      {input.suffix && <span className="text-zinc-600 ml-2 text-xs">{input.suffix}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" /> Frontier Scenarios
                </h3>
                <button onClick={addScenario} className="text-[9px] font-black uppercase text-accent hover:text-white transition-colors">
                  + Add Variant
                </button>
              </div>

              <div className="space-y-4">
                {financials.planned_changes.map((scenario, sIdx) => (
                  <div key={sIdx} className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-4">
                    <input 
                       className="bg-transparent border-b border-white/10 w-full text-[11px] font-bold uppercase text-white pb-2 focus:outline-none focus:border-accent"
                       value={scenario.label}
                       onChange={(e) => {
                         const newChanges = [...financials.planned_changes];
                         newChanges[sIdx].label = e.target.value;
                         setFinancials(prev => ({ ...prev, planned_changes: newChanges }));
                       }}
                    />
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <label className="text-[8px] font-black text-zinc-600 uppercase">Hires</label>
                         <input 
                            type="number"
                            className="w-full bg-black/40 border border-white/5 p-2 rounded text-[10px] text-white"
                            value={scenario.hire_count}
                            onChange={(e) => {
                               const newChanges = [...financials.planned_changes];
                               newChanges[sIdx].hire_count = parseInt(e.target.value) || 0;
                               setFinancials(prev => ({ ...prev, planned_changes: newChanges }));
                            }}
                         />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[8px] font-black text-zinc-600 uppercase">Sal/Hire</label>
                          <input 
                             type="number"
                             className="w-full bg-black/40 border border-white/5 p-2 rounded text-[10px] text-white"
                             value={scenario.salary_per_hire}
                             onChange={(e) => {
                                const newChanges = [...financials.planned_changes];
                                newChanges[sIdx].salary_per_hire = parseFloat(e.target.value) || 0;
                                setFinancials(prev => ({ ...prev, planned_changes: newChanges }));
                             }}
                          />
                       </div>
                    </div>
                  </div>
                ))}
                {financials.planned_changes.length === 0 && (
                  <div className="h-20 border border-dashed border-white/10 rounded-lg flex items-center justify-center text-[9px] text-zinc-700 font-bold uppercase tracking-widest">
                    No active variants
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RESULTS COLUMN */}
          <div className="col-span-12 lg:col-span-8">
            {!simulationResult ? (
              <div className="h-full border border-white/5 bg-white/[0.02] rounded-3xl flex flex-col items-center justify-center text-center p-20 space-y-6">
                <Activity className="w-16 h-16 text-zinc-800" />
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight">System Ready for Simulation</h3>
                  <p className="text-sm text-zinc-600 max-w-sm mx-auto uppercase text-[10px] font-black tracking-widest leading-relaxed">
                    Input your financial baseline and variant scenarios to model runway survivability.
                  </p>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="space-y-10"
              >
                {/* STRATEGIC AUDIT REPORT */}
                <div className="grid grid-cols-12 gap-8">
                   <div className="col-span-12 lg:col-span-4 p-8 border border-accent/20 bg-accent/5 rounded-3xl space-y-6 flex flex-col items-center justify-center text-center">
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Runway Score</h4>
                        <div className="text-7xl font-black text-white">{simulationResult.auditReport.runwayScore}</div>
                        <div className="text-[9px] font-black text-accent/60 uppercase tracking-widest">Efficiency Index</div>
                      </div>
                      <div className="p-4 border border-white/5 bg-black/40 rounded-xl w-full">
                         <p className="text-[10px] leading-relaxed text-zinc-400 font-medium italic">
                            "{simulationResult.auditReport.strategicInsight}"
                         </p>
                      </div>
                   </div>

                   <div className="col-span-12 lg:col-span-8 p-8 border border-white/5 bg-white/[0.01] rounded-3xl space-y-6">
                      <div className="flex items-center gap-3">
                         <Zap className="w-4 h-4 text-accent" />
                         <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Prioritized Action Plan</h4>
                      </div>
                      <div className="space-y-3">
                         {simulationResult.auditReport.prioritizedActionPlan.map((action: any, i: number) => (
                           <div key={i} className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-xl group hover:border-accent/30 transition-all">
                              <div className={`mt-1 px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${
                                action.level === 'CRITICAL' ? 'bg-red-500 text-white' : 
                                action.level === 'URGENT' ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-black'
                              }`}>
                                {action.level}
                              </div>
                              <p className="text-[11px] font-medium text-zinc-300">{action.task}</p>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                {/* PRIMARY METRICS & HEATMAP */}
                <div className="grid grid-cols-4 gap-6">
                   <div className="p-8 border border-white/5 bg-white/[0.02] rounded-2xl space-y-3">
                      <div className="flex items-center gap-2 text-zinc-500 uppercase text-[9px] font-black tracking-widest">
                         <Calendar className="w-3 h-3 text-accent" /> Runway
                      </div>
                      <div className="text-3xl font-black text-white">
                        {simulationResult.currentMetrics.runway_months || "∞"} <span className="text-zinc-600 text-sm">Months</span>
                      </div>
                   </div>
                   <div className="p-6 border border-white/5 bg-white/[0.02] rounded-2xl space-y-2">
                      <span className="text-[8px] font-black text-zinc-600 uppercase">Burn Risk</span>
                      <div className={`text-sm font-black uppercase ${simulationResult.auditReport.riskHeatmap.burnEfficiency === 'HIGH' ? 'text-red-500' : 'text-emerald-500'}`}>
                        {simulationResult.auditReport.riskHeatmap.burnEfficiency}
                      </div>
                   </div>
                   <div className="p-6 border border-white/5 bg-white/[0.02] rounded-2xl space-y-2">
                       <span className="text-[8px] font-black text-zinc-600 uppercase">Growth Velocity</span>
                       <div className="text-sm font-black uppercase text-white">
                          {simulationResult.auditReport.riskHeatmap.growthVelocity}
                       </div>
                   </div>
                   <div className="p-6 border border-white/5 bg-white/[0.02] rounded-2xl space-y-2">
                        <span className="text-[8px] font-black text-zinc-600 uppercase">Survival Confidence</span>
                        <div className="text-sm font-black uppercase text-accent">
                           {simulationResult.auditReport.riskHeatmap.survivalConfidence}
                        </div>
                   </div>
                </div>

                {/* SCENARIO ANALYSIS */}
                <div className="space-y-6">
                   <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-accent rounded-full" /> Comparative Intelligence
                   </h3>
                   <div className="grid grid-cols-2 gap-6">
                     {simulationResult.scenarios.map((s: any, i: number) => (
                       <div key={i} className="p-6 border border-white/5 bg-white/[0.01] rounded-2xl space-y-6 group hover:border-accent/20 transition-all">
                          <div className="flex justify-between items-center">
                             <h4 className="text-white font-black uppercase text-xs tracking-tight">{s.label}</h4>
                             <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${
                               s.new_runway < 6 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                             }`}>
                                {s.new_runway < 6 ? 'High Risk' : 'Sustainable'}
                             </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                             <div className="space-y-1">
                                <span className="text-[8px] font-black text-zinc-700 uppercase">Residue Runway</span>
                                <div className="text-lg font-black text-white">{s.new_runway || '∞'} Mo</div>
                             </div>
                             <div className="space-y-1">
                                <span className="text-[8px] font-black text-zinc-700 uppercase">Survival Prob</span>
                                <div className="text-lg font-black text-white">{(s.survival_probability * 100).toFixed(1)}%</div>
                             </div>
                          </div>

                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${s.survival_probability * 100}%` }}
                               className={`h-full ${s.survival_probability > 0.7 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                             />
                          </div>
                       </div>
                     ))}
                   </div>
                </div>

                {/* PROJECTION CHART PLACEHOLDER */}
                <div className="p-8 border border-white/5 bg-white/[0.01] rounded-3xl space-y-6">
                   <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Cash Projection Matrix</h4>
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Month-by-Month Strategic Liquidity</p>
                      </div>
                      <div className="flex gap-4">
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-accent rounded-full" />
                           <span className="text-[8px] font-black text-zinc-700 uppercase">Cash Balance</span>
                         </div>
                      </div>
                   </div>
                   
                   <div className="h-64 flex items-end gap-2 border-b border-white/10 pb-4">
                      {simulationResult.currentMetrics.projection.map((snap: any, i: number) => (
                        <div key={i} className="flex-1 group relative">
                           <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${(snap.cash_balance / simulationResult.currentMetrics.projection[0].cash_balance) * 100}%` }}
                              className="w-full bg-accent/20 group-hover:bg-accent/40 transition-all rounded-t-sm min-h-[4px]"
                           />
                           <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 text-[7px] font-black text-zinc-800">
                             M{snap.month}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
