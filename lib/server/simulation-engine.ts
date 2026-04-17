/**
 * STRATEGIC RUNWAY ENGINE (PORTED FROM PYTHON)
 * Calibrated for Indian startup ecosystem (2024-25).
 */

export interface PlannedChange {
  label: string;
  hire_count: number;
  salary_per_hire: number;
  marketing_spend_change: number;
  revenue_growth_change: number;
  delay_in_launch_days: number;
  one_time_cost: number;
  one_time_revenue_boost: number;
}

export interface StartupFinancials {
  current_cash: number;
  monthly_revenue: number;
  monthly_fixed_costs: number;
  monthly_variable_costs: number;
  team_size: number;
  avg_salary_per_employee: number;
  growth_rate: number;
  planned_changes: PlannedChange[];
}

export interface MonthlySnapshot {
  month: number;
  cash_balance: number;
  monthly_revenue: number;
  burn_rate: number;
}

const INDIA_STARTUP_MORTALITY_CURVE: Record<number, number> = {
  0: 0.00, 1: 0.05, 2: 0.12, 3: 0.22, 4: 0.35, 5: 0.48, 6: 0.58, 
  7: 0.67, 8: 0.74, 9: 0.80, 10: 0.85, 11: 0.88, 12: 0.91, 18: 0.95, 24: 0.97
};

const RISK_THRESHOLDS = { HIGH: 3, MEDIUM: 6 };
const SIMULATION_HORIZON_MONTHS = 18;

export class SimulationEngine {
  
  private totalMonthlyCosts(fin: StartupFinancials, extraHires = 0, extraSalary = 0, marketingDelta = 0): number {
    const salaryTotal = (fin.team_size * fin.avg_salary_per_employee) + (extraHires * extraSalary);
    return fin.monthly_fixed_costs + fin.monthly_variable_costs + salaryTotal + marketingDelta;
  }

  private calculateSurvivalProbability(runway: number, growthRate: number): number {
    if (runway === Infinity) return 0.99;
    
    // Interpolation
    const sortedKeys = Object.keys(INDIA_STARTUP_MORTALITY_CURVE).map(Number).sort((a, b) => a - b);
    let baseProb = 0.97;
    for (let i = 0; i < sortedKeys.length; i++) {
      const k = sortedKeys[i];
      if (runway <= k) {
        if (i === 0) {
          baseProb = INDIA_STARTUP_MORTALITY_CURVE[k];
        } else {
          const prevK = sortedKeys[i - 1];
          const frac = (runway - prevK) / (k - prevK);
          baseProb = INDIA_STARTUP_MORTALITY_CURVE[prevK] + frac * (INDIA_STARTUP_MORTALITY_CURVE[k] - INDIA_STARTUP_MORTALITY_CURVE[prevK]);
        }
        break;
      }
    }

    const growthBonus = Math.min(growthRate * 0.015, 0.15);
    const growthPenalty = growthRate < 0 ? Math.max(growthRate * 0.02, -0.20) : 0;
    
    return Math.min(Math.max(baseProb + growthBonus + growthPenalty, 0.01), 0.99);
  }

  private simulateCashFlow(
    startingCash: number,
    startingRevenue: number,
    totalMonthlyCosts: number,
    growthRatePct: number,
    delayMonths = 0,
    revenueGrowthDeltaPct = 0
  ): MonthlySnapshot[] {
    const monthlyGrowth = (growthRatePct + revenueGrowthDeltaPct) / 100;
    let cash = startingCash;
    let revenue = startingRevenue;
    const snapshots: MonthlySnapshot[] = [];

    for (let month = 1; month <= SIMULATION_HORIZON_MONTHS; month++) {
      const effectiveRevenue = month <= delayMonths ? 0 : revenue;
      const netBurn = totalMonthlyCosts - effectiveRevenue;
      cash -= netBurn;
      revenue *= (1 + monthlyGrowth);

      snapshots.push({
        month,
        cash_balance: Math.round(cash * 100) / 100,
        monthly_revenue: Math.round(effectiveRevenue * 100) / 100,
        burn_rate: Math.round(netBurn * 100) / 100
      });

      if (cash <= 0) break;
    }
    return snapshots;
  }

  private generateAuditReport(current: any) {
    const runway = current.runway_months || 0;
    const survival = current.survival_probability;
    
    // 1. Prioritized Action Plan
    const actions = [];
    if (runway <= 3) {
      actions.push({ level: "CRITICAL", task: "Freeze all non-essential hiring and marketing spend immediately." });
      actions.push({ level: "STRATEGIC", task: "Initiate bridge round or seed-extension conversations today." });
    } else if (runway <= 6) {
      actions.push({ level: "URGENT", task: "Audit vendor SaaS subscriptions for 20% cost reduction." });
      actions.push({ level: "STRATEGIC", task: "Optimize sales cycle to accelerate MRR by 1.5x." });
    } else {
      actions.push({ level: "HEALTHY", task: "Maintain growth momentum while monitoring burn efficiency." });
      actions.push({ level: "STRATEGIC", task: "Plan next milestone fundraise for 6 months from now." });
    }

    // 2. Risk Heatmap
    const riskHeatmap = {
      burnEfficiency: runway < 6 ? "HIGH" : "LOW",
      growthVelocity: survival < 0.6 ? "LOW" : "STABLE",
      survivalConfidence: `${Math.round(survival * 100)}%`
    };

    // 3. Strategic Score Calculation
    const runwayWeight = Math.min(runway / 18, 1.0) * 60;
    const survivalWeight = survival * 40;
    const score = Math.round(runwayWeight + survivalWeight);

    return {
      runwayScore: score,
      prioritizedActionPlan: actions,
      riskHeatmap,
      strategicInsight: `Nexus Risk Engine estimates a ${Math.round(survival * 100)}% transition success rate over the next 12 months.`
    };
  }

  runSimulation(fin: StartupFinancials) {
    const totalCosts = this.totalMonthlyCosts(fin);
    const burn = totalCosts - fin.monthly_revenue;
    const runway = burn <= 0 ? Infinity : fin.current_cash / burn;
    
    const currentResults = {
      burn_rate: burn,
      runway_months: runway === Infinity ? null : Math.round(runway * 100) / 100,
      survival_probability: this.calculateSurvivalProbability(runway, fin.growth_rate),
      is_profitable: burn <= 0,
      projection: this.simulateCashFlow(fin.current_cash, fin.monthly_revenue, totalCosts, fin.growth_rate)
    };

    const auditReport = this.generateAuditReport(currentResults);

    const scenarios = fin.planned_changes.map(change => {
      const newTotalCosts = this.totalMonthlyCosts(fin, change.hire_count, change.salary_per_hire, change.marketing_spend_change);
      const delayMonths = Math.ceil(change.delay_in_launch_days / 30.44);
      const newBurn = newTotalCosts - fin.monthly_revenue;
      const newRunway = newBurn <= 0 ? Infinity : (fin.current_cash - change.one_time_cost + change.one_time_revenue_boost) / newBurn;
      
      return {
        label: change.label,
        new_burn_rate: newBurn,
        new_runway: newRunway === Infinity ? null : Math.round(newRunway * 100) / 100,
        survival_probability: this.calculateSurvivalProbability(newRunway, fin.growth_rate + change.revenue_growth_change),
        projection: this.simulateCashFlow(
          fin.current_cash - change.one_time_cost + change.one_time_revenue_boost,
          fin.monthly_revenue,
          newTotalCosts,
          fin.growth_rate,
          delayMonths,
          change.revenue_growth_change
        )
      };
    });

    return { currentMetrics: currentResults, auditReport, scenarios };
  }
}

export const simulationEngine = new SimulationEngine();
