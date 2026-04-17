import { callAgent } from './ai-provider';
import { 
  MARKET_ANALYST_PROMPT, 
  RISK_AUDITOR_PROMPT, 
  SYSTEMS_THINKER_PROMPT, 
  SYNTESIZER_PROMPT 
} from '../prompts';
import { 
  FinalReport, 
  Constraints, 
  FinalReportSchema 
} from '../shared/schemas';

/**
 * NEXUS DECISION ENGINE (PHASE 1)
 * Stateful multi-step orchestration for India 2026 Strategic Audits.
 */
export class DecisionEngine {
  private thoughts: { agent: string; thought: string; timestamp: string }[] = [];

  private log(agent: string, thought: string) {
    this.thoughts.push({
      agent,
      thought,
      timestamp: new Date().toISOString()
    });
    console.log(`[Nexus Engine] ${agent}: ${thought}`);
  }

  async runStrategicAudit(query: string, constraints: Constraints): Promise<FinalReport> {
    this.log('System', 'Initializing Nexus Strategic Audit Pipeline...');

    // 1. MARKET ANALYSIS (MCA / Startup India / Bharat Patterns)
    const analystSchema = {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        industry_category: { type: 'string' },
        market_realism: {
          type: 'object',
          properties: {
            tam_sam_som: {
              type: 'object',
              properties: {
                tam: { type: 'string' },
                sam: { type: 'string' },
                som: { type: 'string' },
                realism_score: { type: 'number' }
              }
            },
            tier_consumer_behavior: { type: 'string' }
          }
        },
        reasoning: { type: 'string' }
      },
      required: ['summary', 'industry_category', 'market_realism']
    };

    const analystPrompt = `${MARKET_ANALYST_PROMPT}\n\nProblem: "${query}"\nFounder Context: ${JSON.stringify(constraints)}`;
    const { data: analystData, thought: t1 } = await callAgent('MarketAnalyst', analystPrompt, 'flash', analystSchema);
    this.log('MarketAnalyst', t1);

    // 2. REGULATORY AUDIT (DPDP / GST / Labor)
    const riskSchema = {
      type: 'object',
      properties: {
        regulatory_audit: {
          type: 'object',
          properties: {
            dpdp_compliance: {
              type: 'object',
              properties: {
                risk_level: { type: 'string', enum: ["Low", "Medium", "High"] },
                critical_actions: { type: 'array', items: { type: 'string' } }
              }
            },
            gst_implications: { type: 'string' },
            labor_laws: { type: 'string' }
          }
        },
        reasoning: { type: 'string' }
      },
      required: ['regulatory_audit']
    };

    const riskPrompt = `${RISK_AUDITOR_PROMPT}\n\nEntity Context: ${analystData.summary}`;
    const { data: riskData, thought: t2 } = await callAgent('RiskAuditor', riskPrompt, 'flash', riskSchema);
    this.log('RiskAuditor', t2);

    // 3. SYSTEMS ARCHITECTURE (Tech Stack / Founder Fit)
    const systemsSchema = {
      type: 'object',
      properties: {
        tier_insights: { type: 'string' },
        demand_score: { type: 'number' },
        execution_difficulty: { type: 'number' },
        reasoning: { type: 'string' }
      },
      required: ['tier_insights', 'demand_score', 'execution_difficulty']
    };

    const systemsPrompt = `${SYSTEMS_THINKER_PROMPT}\n\nProject Context: ${analystData.summary}\nConstraints: ${JSON.stringify(constraints)}`;
    const { data: systemsData, thought: t3 } = await callAgent('SystemsThinker', systemsPrompt, 'flash', systemsSchema);
    this.log('SystemsThinker', t3);

    // 4. STRATEGIC SYNTHESIS (Final Verdict)
    const synthSchema = {
      type: 'object',
      properties: {
        truth_bomb: { type: 'string' },
        insufficient_data_signals: { type: 'array', items: { type: 'string' } },
        ninety_day_roadmap: { type: 'array', items: { type: 'string' } },
        competitor_matrix: {
           type: 'array',
           items: {
              type: 'object',
              properties: {
                 name: { type: 'string' },
                 advantage: { type: 'string' },
                 threat_level: { type: 'string', enum: ["Low", "Medium", "High"] }
              }
           }
        },
        financial_simulations: { type: 'string' },
        reasoning: { type: 'string' }
      },
      required: ['truth_bomb', 'ninety_day_roadmap', 'competitor_matrix', 'financial_simulations']
    };

    const synthPrompt = `${SYNTESIZER_PROMPT}\n\nInputs: ${JSON.stringify({ analystData, riskData, systemsData })}`;
    const { data: synthData, thought: t4 } = await callAgent('Synthesizer', synthPrompt, 'pro', synthSchema);
    this.log('Synthesizer', t4);

    // FORMULA EXECUTION
    const demandWeight = 30;
    const executionWeight = 40;
    const regulatoryPenaltyMax = 30;

    const demandScore = (systemsData.demand_score / 100) * demandWeight;
    const executionScore = ((100 - systemsData.execution_difficulty) / 100) * executionWeight;
    
    const regRisk = riskData.regulatory_audit.dpdp_compliance.risk_level === 'High' ? 1 : (riskData.regulatory_audit.dpdp_compliance.risk_level === 'Medium' ? 0.5 : 0.1);
    const regPenalty = regRisk * regulatoryPenaltyMax;

    const viabilityScore = Math.max(0, Math.min(100, demandScore + executionScore - regPenalty));

    const finalReportRaw = {
      summary: analystData.summary,
      industry_category: analystData.industry_category,
      viability_score: viabilityScore,
      score_breakdown: {
         demand: Math.round(demandScore),
         execution: Math.round(executionScore),
         regulatory_penalty: Math.round(regPenalty)
      },
      regulatory_audit: riskData.regulatory_audit,
      market_realism: analystData.market_realism,
      harsh_truth: {
         truth_bomb: synthData.truth_bomb,
         insufficient_data_signals: synthData.insufficient_data_signals
      },
      ninety_day_roadmap: synthData.ninety_day_roadmap,
      competitor_matrix: synthData.competitor_matrix,
      financial_simulations: synthData.financial_simulations,
      agent_thoughts: this.thoughts,
      deep_sources: []
    };

    return FinalReportSchema.parse(finalReportRaw);
  }
}

export const nexusEngine = new DecisionEngine();
