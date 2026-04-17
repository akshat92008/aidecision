import { callAgent } from './ai-provider';
import { SIMULATION_PROMPT } from '../prompts/sim-assets';
import { FinalReport } from '../shared/schemas';

export class SimulationEngine {
  async runScenario(report: FinalReport, scenario: string) {
    const schema = {
      type: 'object',
      properties: {
        adjusted_score: { type: 'number' },
        score_delta: { type: 'number' },
        shocks_detected: { type: 'array', items: { type: 'string' } },
        shield_protocol: { type: 'string' },
        reasoning: { type: 'string' }
      },
      required: ['adjusted_score', 'score_delta', 'shocks_detected', 'shield_protocol']
    };

    const prompt = `
${SIMULATION_PROMPT}

Original Audit: ${JSON.stringify(report)}
Scenario Modifier: "${scenario}"
`;

    const { data } = await callAgent('SimAgent', prompt, 'flash', schema);
    return data;
  }
}

export const simulationEngine = new SimulationEngine();
