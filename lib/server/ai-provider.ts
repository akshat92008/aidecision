import { getVertexModel } from './vertex-client';
import { FinalReport, FinalReportSchema } from '../shared/schemas';

/**
 * 6-AGENT SEQUENTIAL HYBRID ORCHESTRATOR
 * Utilizes Gemini 1.5 Pro/Flash on Vertex AI ($300 GCP Credits)
 */

async function callAgent(agentName: string, prompt: string, modelType: 'pro' | 'flash' = 'flash') {
  console.log(`[Agent: ${agentName}] Analyzing...`);
  try {
    const model = getVertexModel(modelType === 'pro' ? 'gemini-1.5-pro' : 'gemini-1.5-flash');
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    return JSON.parse(text);
  } catch (error: any) {
    console.warn(`[Agent: ${agentName}] Warning:`, error.message);
    throw error;
  }
}

export async function generateDecisionReport(query: string, constraints?: any): Promise<FinalReport> {
  // 1. CLARIFIER AGENT - Expansion & Context
  const clarifierData = await callAgent('Clarifier', `
    Input Idea: "${query}"
    Context: ${JSON.stringify(constraints || {})}
    Expand this query into a professional business context. Identify core assumptions and industry category.
    Return schema: { industry_category: string, summary: string, assumptions: string[] }
  `);

  // 2. RESEARCH AGENT - Market Reality
  const researchData = await callAgent('Research', `
    Business Context: ${clarifierData.summary}
    Analyze specific market demand, current industry trends, and the competitive landscape.
    Return schema: { market_trends: string[], competitor_landscape: string }
  `);

  // 3. ANALYSIS AGENT - Weighted Scoring
  const analysisData = await callAgent('Analysis', `
    Idea: ${query}
    Research: ${JSON.stringify(researchData)}
    Assumptions: ${JSON.stringify(clarifierData.assumptions)}
    Calculate weighted scores (0-30 for demand, 0-20 for competition, 0-25 for execution, 0-25 for monetization).
    Return schema: { score_breakdown: { demand: number, competition: number, execution: number, monetization: number } }
  `, 'flash'); // Cost saving: Use Flash for math/metrics

  const totalScore = analysisData.score_breakdown.demand + 
                   analysisData.score_breakdown.competition + 
                   analysisData.score_breakdown.execution + 
                   analysisData.score_breakdown.monetization;

  // 4. STRATEGY AGENT - The Roadmap
  const strategyData = await callAgent('Strategy', `
    Summary: ${clarifierData.summary}
    Scores: ${JSON.stringify(analysisData.score_breakdown)} (Total: ${totalScore}/100)
    Provide an actionable execution roadmap, 1 major validation test, and alternative pivots.
    Return schema: { action_plan: string[], validation_step: string, alternatives: string[] }
  `);

  // 5. CRITIC AGENT (Reasoning Pro) - The HARSH TRUTH
  const criticData = await callAgent('Critic', `
    Full Business Plan: ${JSON.stringify({ clarifierData, researchData, analysisData, strategyData })}
    You are the "Brutal Reality" Analyst. Identify the top 3 REAL specific reasons this idea will fail. 
    Be punchy, negative-insight focused, and specific (e.g., "CAC will exceed $100 for a $20 product").
    Also provide a Success Probability (0-100) and a final Verdict.
    Verdict Mapping: Score > 70 -> Worth Testing; 50-70 -> Moderate Risk; < 50 -> Strong Risk.
    Return schema: { 
      harsh_truth: { 
        failure_reasons: [{reason:string, severity:'Critical'|'High'|'Medium', explanation:string}], 
        truth_bomb: string, 
        downside_risks: string[] 
      },
      success_probability: number,
      verdict: string
    }
  `, 'pro');

  // 6. SYNTHESIS AGENT - Final Research-Grade Construction
  const finalReportRaw = {
    summary: clarifierData.summary,
    industry_category: clarifierData.industry_category,
    score_total: totalScore,
    score_breakdown: analysisData.score_breakdown,
    research: {
      industry_category: clarifierData.industry_category,
      market_trends: researchData.market_trends,
      competitor_landscape: researchData.competitor_landscape
    },
    harsh_truth: criticData.harsh_truth,
    success_probability: criticData.success_probability,
    verdict: criticData.verdict,
    action_plan: strategyData.action_plan,
    validation_step: strategyData.validation_step,
    alternatives: strategyData.alternatives
  };

  const validation = FinalReportSchema.safeParse(finalReportRaw);
  if (!validation.success) {
    console.error('Synthesis validation failed:', validation.error.errors);
    throw new Error('AI Synthesis failed to meet hybrid research-grade specifications.');
  }

  return validation.data;
}
