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

import { nexusEngine } from './decision-engine';

export async function generateDecisionReport(refinedQuery: string, industryKillers: IndustryKiller[] = []): Promise<FinalReport> {
  // Use the new Phase 1 Nexus Engine for all audits
  const constraintsData: Constraints = {
    budget_inr: "Not Specified",
    location_tier: "Tier 1",
    founder_background: "Direct Audit Mode",
    tech_stack: ["General"],
    time_to_mvp: "3 months"
  };
  return nexusEngine.runStrategicAudit(refinedQuery, constraintsData);
}
