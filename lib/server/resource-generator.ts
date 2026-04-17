import { callAgent } from './ai-provider';
import { RESOURCE_PROMPT } from '../prompts/sim-assets';
import { FinalReport } from '../shared/schemas';

export class ResourceGenerator {
  async generateAsset(report: FinalReport, type: 'Recruiter' | 'Marketer' | 'Legal') {
    const schema = {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        usage_instructions: { type: 'string' }
      },
      required: ['title', 'content']
    };

    const prompt = `
${RESOURCE_PROMPT}

Original Audit Context: ${JSON.stringify(report)}
Requested Asset: "${type}"
`;

    const { data } = await callAgent('AssetAgent', prompt, 'flash', schema);
    return data;
  }
}

export const resourceGenerator = new ResourceGenerator();
