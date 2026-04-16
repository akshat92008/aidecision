import { z } from "zod";

/**
 * Capture user constraints (Budget, Time, Skills)
 */
export const ConstraintsSchema = z.object({
  budget: z.string().optional().describe("e.g. $10,000"),
  time: z.string().optional().describe("e.g. 6 months"),
  skills: z.array(z.string()).optional().describe("e.g. Software dev, marketing"),
});

/**
 * 4-Pillar Weighted Scoring Matrix
 */
export const ScoreBreakdownSchema = z.object({
  demand: z.number().min(0).max(30).describe("Weight: 30%"),
  competition: z.number().min(0).max(20).describe("Weight: 20%"),
  execution: z.number().min(0).max(25).describe("Weight: 25%"),
  monetization: z.number().min(0).max(25).describe("Weight: 25%"),
});

/**
 * Historical Market Data & Industry Trends
 */
export const ResearchDataSchema = z.object({
  industry_category: z.string(),
  market_trends: z.array(z.string()),
  competitor_landscape: z.string(),
});

/**
 * The 'Harsh Truth' / Critic Layer
 */
export const HarshTruthSchema = z.object({
  failure_reasons: z.array(z.object({
    reason: z.string(),
    severity: z.enum(["Critical", "High", "Medium"]),
    explanation: z.string(),
  })).length(3),
  truth_bomb: z.string().describe("A brutal 1-sentence reality check"),
  downside_risks: z.array(z.string()),
});

/**
 * FINAL HYBRID REPORT SCHEMA
 * Combines Research-Grade Analytics with Brutal Reality
 */
export const FinalReportSchema = z.object({
  summary: z.string(),
  industry_category: z.string(),
  score_total: z.number().min(0).max(100),
  score_breakdown: ScoreBreakdownSchema,
  research: ResearchDataSchema,
  harsh_truth: HarshTruthSchema,
  success_probability: z.number().min(0).max(100),
  verdict: z.enum(["Strong Risk", "Moderate Risk", "Worth Testing"]),
  action_plan: z.array(z.string()).describe("Detailed steps"),
  validation_step: z.string().describe("1 major validation test"),
  alternatives: z.array(z.string()),
});

export type FinalReport = z.infer<typeof FinalReportSchema>;
export type Constraints = z.infer<typeof ConstraintsSchema>;
export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;
