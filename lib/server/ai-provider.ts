import { getVertexModel } from './vertex-client';
import { callGroqChat } from './groq-client';
import { 
  FinalReport, 
  FinalReportSchema, 
  IndustryKillerDetection, 
  Constraints, 
  Consultation, 
  IndustryKiller, 
  AgentThought,
  RefinedProblem
} from '../shared/schemas';

async function callAgent(
  agentName: string, 
  prompt: string, 
  modelType: 'pro' | 'flash' = 'flash',
  responseSchema?: any
): Promise<{data: any, thought: string}> {
  console.log(`[Agent: ${agentName}] Analyzing...`);
  
  // PRIMARY: Vertex AI
  try {
    const model = getVertexModel(
      modelType === 'pro' ? 'gemini-1.5-pro' : 'gemini-1.5-flash',
      responseSchema
    );
    
    const fullPrompt = `${prompt}\n\nIMPORTANT: Return ONLY a valid JSON object. Include your internal reasoning in a 'reasoning' field.`;
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
    });
    
    const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const data = JSON.parse(text);
    const thought = data.reasoning || "Reasoning sequence complete.";
    
    return { data, thought };
    
  } catch (vertexError: any) {
    console.warn(`[Agent: ${agentName}] Vertex AI failure: ${vertexError.message}. Initiating Groq failover...`);
    
    // SECONDARY: Groq Fallback
    try {
      const groqPrompt = `${prompt}\n\nSchema requirement: ${JSON.stringify(responseSchema || "Valid JSON")}. Return ONLY JSON.`;
      const groqResponse = await callGroqChat(groqPrompt);
      const data = JSON.parse(groqResponse);
      const thought = data.reasoning || "Groq analysis sequence active.";
      
      return { data, thought };
    } catch (groqError: any) {
      console.error(`[Agent: ${agentName}] Critical: Both Primary and Fallback AI providers failed.`);
      throw new Error(`Intelligence Layer Error: ${vertexError.message} (Fallback: ${groqError.message})`);
    }
  }
}

export async function getIndustryKillers(query: string): Promise<IndustryKillerDetection> {
  const schema = {
    type: 'object',
    properties: {
      killers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            risk: { type: 'string' },
            impact: { type: 'string' },
            mitigation_likelihood: { type: 'number' }
          },
          required: ['risk', 'impact', 'mitigation_likelihood']
        },
        minItems: 3,
        maxItems: 3
      },
      analysis_summary: { type: 'string' },
      reasoning: { type: 'string' }
    },
    required: ['killers', 'analysis_summary', 'reasoning']
  };

  const prompt = `
    Analyze: "${query}"
    Identify the top 3 REAL industry killers in the Indian Market (2024-2026).
    Focus on Bharat-specific failure modes (Logistics friction, UPI-dependency risks, etc).
  `;
  const { data } = await callAgent('IndustryScanner', prompt, 'flash', schema);
  return data;
}

export async function getConsultationQuestions(query: string, currentConstraints?: Constraints): Promise<Consultation> {
  const killers = await getIndustryKillers(query);
  const schema = {
    type: 'object',
    properties: {
      questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            question: { type: 'string' },
            category: { type: 'string', enum: ["Budget", "Geography", "Time", "Skills", "Scale", "Model"] },
            impact: { type: 'string' }
          },
          required: ['id', 'question', 'category', 'impact']
        },
        minItems: 3,
        maxItems: 5
      },
      initial_intent_summary: { type: 'string' },
      reasoning: { type: 'string' }
    },
    required: ['questions', 'initial_intent_summary', 'reasoning']
  };

  const prompt = `
    Idea: "${query}"
    Indian Market Killers: ${JSON.stringify(killers.killers)}
    Generate assessment questions focusing on Founder-Market Fit for India (Budget in INR, City Tier).
  `;
  const { data } = await callAgent('Consultant', prompt, 'flash', schema);
  return data;
}

export async function getRefinedProblem(query: string, answers: Record<string, string>): Promise<RefinedProblem> {
  const schema = {
    type: 'object',
    properties: {
      refined_query: { type: 'string' },
      context_summary: { type: 'string' },
      reasoning: { type: 'string' }
    },
    required: ['refined_query', 'context_summary', 'reasoning']
  };

  const prompt = `Original: ${query}. Answers: ${JSON.stringify(answers)}. Refine the problem for the Indian context (Specify Tier 1/2/3).`;
  const { data } = await callAgent('Refiner', prompt, 'flash', schema);
  return data;
}

export async function generateDecisionReport(refinedQuery: string, industryKillers: IndustryKiller[] = []): Promise<FinalReport> {
  const thoughts: AgentThought[] = [];

  // 1. MARKET ANALYST (India Focus)
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
  const { data: analystData, thought: t1 } = await callAgent('MarketAnalyst', `Problem: "${refinedQuery}". Research MCA records, Startup India data, and Tier-specific trends.`, 'flash', analystSchema);
  thoughts.push({ agent: 'MarketAnalyst', thought: t1, timestamp: new Date().toISOString() });

  // 2. RISK/LEGAL (DPDP & GST)
  const legalSchema = {
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
  const { data: legalData, thought: t2 } = await callAgent('RiskAgent', `Audit for DPDP 2023, GST, and specific Labor Laws in India for: ${analystData.summary}`, 'flash', legalSchema);
  thoughts.push({ agent: 'RiskAgent', thought: t2, timestamp: new Date().toISOString() });

  // 3. SYSTEMS THINKER (Consumer Patterns)
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
  const { data: systemsData, thought: t3 } = await callAgent('SystemsThinker', `Analyze Tier-2 consumer behavior (WhatsApp/Reels dependency) and GTM feasibility for: ${analystData.summary}`, 'flash', systemsSchema);
  thoughts.push({ agent: 'SystemsThinker', thought: t3, timestamp: new Date().toISOString() });

  // 4. STRATEGIST (90-Day Roadmap)
  const strategySchema = {
    type: 'object',
    properties: {
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
    required: ['ninety_day_roadmap', 'competitor_matrix', 'financial_simulations']
  };
  const { data: strategyData, thought: t4 } = await callAgent('Strategist', `Generate 90-day India GTM roadmap and competitor matrix for ${analystData.summary}`, 'flash', strategySchema);
  thoughts.push({ agent: 'Strategist', thought: t4, timestamp: new Date().toISOString() });

  // 5. CRITIC (Harsh Truth)
  const criticSchema = {
    type: 'object',
    properties: {
       truth_bomb: { type: 'string' },
       insufficient_data_signals: { type: 'array', items: { type: 'string' } },
       reasoning: { type: 'string' }
    },
    required: ['truth_bomb']
  };
  const { data: criticData, thought: t5 } = await callAgent('Critic', `Brutal India-specific reality check for ${analystData.summary}. If signals are weak, return DATA INSUFFICIENT - ASSUMPTION RISK HIGH.`, 'pro', criticSchema);
  thoughts.push({ agent: 'Critic', thought: t5, timestamp: new Date().toISOString() });

  // REVISED FORMULA: Viability = (Demand*0.3 + Execution*0.4 - RegulatoryRisk*0.3)
  const demandWeight = 30;
  const executionWeight = 40;
  const regulatoryPenaltyMax = 30;

  const demandScore = (systemsData.demand_score / 100) * demandWeight;
  const executionScore = ((100 - systemsData.execution_difficulty) / 100) * executionWeight;
  
  const regRisk = legalData.regulatory_audit.dpdp_compliance.risk_level === 'High' ? 1 : (legalData.regulatory_audit.dpdp_compliance.risk_level === 'Medium' ? 0.5 : 0.1);
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
    regulatory_audit: legalData.regulatory_audit,
    market_realism: analystData.market_realism,
    harsh_truth: {
       truth_bomb: criticData.truth_bomb,
       insufficient_data_signals: criticData.insufficient_data_signals
    },
    ninety_day_roadmap: strategyData.ninety_day_roadmap,
    competitor_matrix: strategyData.competitor_matrix,
    financial_simulations: strategyData.financial_simulations,
    agent_thoughts: thoughts,
    deep_sources: []
  };

  return FinalReportSchema.parse(finalReportRaw);
}
