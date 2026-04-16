import { VertexAI } from '@google-cloud/vertexai';

/**
 * Initialize the Vertex AI client using environment variables.
 * This utilizes the $300 Google Cloud credits.
 */
const project = process.env.GCP_PROJECT_ID;
const location = process.env.GCP_LOCATION || 'us-central1';

export const vertexClient = project 
  ? new VertexAI({ project, location }) 
  : null;

/**
 * Helper to get a specific generative model from Vertex AI.
 * Higher reasoning tasks (Critic, Synthesis) should use Gemini 1.5 Pro.
 */
export function getVertexModel(modelName: 'gemini-1.5-pro' | 'gemini-1.5-flash' = 'gemini-1.5-flash') {
  if (!vertexClient) {
    throw new Error('Vertex AI client not initialized. Check GCP_PROJECT_ID in .env.local.');
  }
  
  // Use specific stable versions of the models
  const modelId = modelName === 'gemini-1.5-pro' ? 'gemini-1.5-pro-002' : 'gemini-1.5-flash-002';
  
  return vertexClient.getGenerativeModel({
    model: modelId,
    generationConfig: {
      maxOutputTokens: modelName === 'gemini-1.5-pro' ? 2048 : 1024, // Cost saving: Limit output tokens
      temperature: 0.1, // Cost saving: More deterministic = less compute
      responseMimeType: 'application/json',
    },
  });
}
