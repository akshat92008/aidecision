import { callAgent } from './ai-provider';
import { Decision } from '../shared/schemas';

export class SynthesisEngine {
  async scanPortfolio(decisions: Decision[]) {
    if (decisions.length < 2) return null;

    const schema = {
      type: 'object',
      properties: {
        opportunity_clusters: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              synergy_logic: { type: 'string' },
              combined_viability: { type: 'number' },
              pivot_suggestion: { type: 'string' }
            }
          }
        },
        portfolio_health_score: { type: 'number' }
      },
      required: ['opportunity_clusters', 'portfolio_health_score']
    };

    const prompt = `
Role: Portfolio Synthesis Architect
Objective: Identify emergent opportunities across multiple venture concepts.

Portfolio Data:
${decisions.map(d => `- ${d.query} (Score: ${d.viability_score}%)`).join('\n')}

Task:
1. Identify if any 2+ ideas can be combined into a single platform or synergy.
2. Calculate a "Portfolio Health Score" based on diversification and focus.
3. Suggest a "Master Pivot" if the current portfolio is fragmented.
`;

    const { data } = await callAgent('SynthesisAgent', prompt, 'pro', schema);
    return data;
  }
}

export const synthesisEngine = new SynthesisEngine();
