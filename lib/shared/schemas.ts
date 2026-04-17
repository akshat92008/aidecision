import { z } from "zod";

/**
 * Structured Research Source
 */
export const ResearchSourceSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  snippet: z.string().describe("Key insight from this source"),
  type: z.enum(["article", "report", "competitor", "social", "academic"]),
});

/**
 * Capture user constraints (India 2026 Spec)
 */
export const ConstraintsSchema = z.object({
  budget_inr: z.string().describe("e.g. ₹50 Lakhs"),
  location_tier: z.enum(["Tier 1", "Tier 2", "Tier 3"]),
  founder_background: z.string().describe("Industry experience/Skills"),
  tech_stack: z.array(z.string()).describe("e.g. Next.js, Flutter, AWS"),
  time_to_mvp: z.string().describe("e.g. 3 months"),
});

/**
 * Regulatory Audit Layer (India 2026)
 */
export const RegulatoryAuditSchema = z.object({
  dpdp_compliance: z.object({
    risk_level: z.enum(["Low", "Medium", "High"]),
    critical_actions: z.array(z.string()),
  }),
  gst_implications: z.string(),
  labor_laws: z.string().describe("City/State specific labor regulations"),
});

/**
 * 4-Pillar Weighted Scoring Matrix (V2)
 */
export const ScoreBreakdownSchema = z.object({
  demand: z.number().min(0).max(30).describe("Weight: 30%"),
  execution: z.number().min(0).max(40).describe("Weight: 40%"),
  regulatory_penalty: z.number().min(0).max(30).describe("Max Penalty: 30%"),
});

/**
 * Indian Market Realism
 */
export const MarketRealismSchema = z.object({
  tam_sam_som: z.object({
    tam: z.string(),
    sam: z.string(),
    som: z.string(),
    realism_score: z.number(),
  }),
  tier_consumer_behavior: z.string().describe("e.g. WhatsApp reliance in Tier 2"),
});

/**
 * FINAL STRATEGIC AUDIT SCHEMA
 */
export const FinalReportSchema = z.object({
  summary: z.string(),
  industry_category: z.string(),
  viability_score: z.number().min(0).max(100),
  score_breakdown: ScoreBreakdownSchema,
  regulatory_audit: RegulatoryAuditSchema,
  market_realism: MarketRealismSchema,
  harsh_truth: z.object({
     truth_bomb: z.string(),
     insufficient_data_signals: z.array(z.string()).optional().describe("Flagged if market signal is weak"),
  }),
  ninety_day_roadmap: z.array(z.string()),
  competitor_matrix: z.array(z.object({
     name: z.string(),
     advantage: z.string(),
     threat_level: z.enum(["Low", "Medium", "High"]),
  })),
  financial_simulations: z.string(),
  agent_thoughts: z.array(z.object({
     agent: z.string(),
     thought: z.string(),
     timestamp: z.string(),
  })),
  deep_sources: z.array(z.any()),
});

export type FinalReport = z.infer<typeof FinalReportSchema>;
export type Constraints = z.infer<typeof ConstraintsSchema>;
export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;

/**
 * CONSULTATION / CIL SCHEMAS
 */

export const ClarifyingQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  category: z.enum(["Budget", "Geography", "Time", "Skills", "Scale", "Model"]),
  impact: z.string(),
});

export const ConsultationSchema = z.object({
  questions: z.array(ClarifyingQuestionSchema).min(3).max(5),
  initial_intent_summary: z.string(),
  reasoning: z.string().optional(),
});

export const RefinedProblemSchema = z.object({
  refined_query: z.string(),
  context_summary: z.string(),
  reasoning: z.string().optional(),
});

export type ClarifyingQuestion = z.infer<typeof ClarifyingQuestionSchema>;
export type Consultation = z.infer<typeof ConsultationSchema>;
export type RefinedProblem = z.infer<typeof RefinedProblemSchema>;

export const IndustryKillerSchema = z.object({
  risk: z.string(),
  impact: z.string(),
  mitigation_likelihood: z.number(),
});

export const IndustryKillerDetectionSchema = z.object({
  killers: z.array(IndustryKillerSchema).length(3),
  analysis_summary: z.string(),
  reasoning: z.string().optional(),
});

export type IndustryKillerDetection = z.infer<typeof IndustryKillerDetectionSchema>;
export type IndustryKiller = z.infer<typeof IndustryKillerSchema>;
export type AgentThought = { agent: string; thought: string; timestamp: string };

/**
 * STRATEGIC MEMORY & LIFECYCLE (PHASE 2)
 */

export const MilestoneSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  status: z.enum(["pending", "in_progress", "completed", "blocked"]),
  due_date: z.string().optional(),
  completed_at: z.string().optional(),
});

export const DecisionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  query: z.string(),
  constraints: ConstraintsSchema,
  status: z.enum(["draft", "active", "pivot", "kill"]),
  viability_score: z.number(),
  score_trend: z.number().describe("Delta from previous audit"),
  created_at: z.string(),
  updated_at: z.string(),
  last_report: FinalReportSchema,
  milestones: z.array(MilestoneSchema),
});

export type Milestone = z.infer<typeof MilestoneSchema>;
export type Decision = z.infer<typeof DecisionSchema>;
