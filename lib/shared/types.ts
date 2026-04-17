// Frontend Types for the 5 Modules
export interface RunwayData {
  currentMetrics?: {
    runway_months: number | null;
    burn_rate: number;
    survival_probability: number;
    cash_out_date: string;
  };
  current?: {
    runway_months: number | null;
    burn_rate: number;
    survival_probability: number;
    cash_out_date: string;
  };
}

export interface ExecutionDrift {
  drift_detected: boolean;
  action: string;
  score: number;
  bottlenecks: Array<{
    task: string;
    issue: string;
    severity: 'HIGH' | 'MEDIUM' | 'CRITICAL';
  }>;
}

export interface GrowthExperiment {
  id: string;
  name: string;
  hypothesis: string;
  expected_roi: string;
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface UnicornIntel {
  competitor_alerts: Array<{
    type: string;
    signal: string;
    impact: string;
    severity: string;
  }>;
  trend_shifts: Array<{
    signal: string;
    action: string;
  }>;
}

export interface AuditScore {
  founder_score: number;
  win_rate: number;
  pattern_detected: string;
  total_decisions: number;
}
