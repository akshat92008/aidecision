import Groq from "groq-sdk";

/**
 * Initialize the Groq client for high-reliability failover.
 * This is used if Vertex AI quota is exceeded or services are unavailable.
 */
const apiKey = process.env.GROQ_API_KEY;

export const groq = apiKey 
  ? new Groq({ apiKey }) 
  : null;

/**
 * Utility to call Groq with a consistent schema-like instruction.
 * Map Zod schemas to system prompts since Groq v0.3 doesn't have native schema mode.
 */
export async function callGroqChat(prompt: string, model: string = "llama-3.3-70b-versatile") {
  if (!groq) {
    throw new Error("Groq API key missing. Fallback unavailable.");
  }

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a professional business consultant. Return responses in valid JSON ONLY. No markdown code blocks, just pure JSON string.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: model,
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  return completion.choices[0]?.message?.content || "{}";
}
