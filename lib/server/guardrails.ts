/**
 * NEXUS SAFETY LAYER (PHASE 4)
 * Implements PII scrubbing and content safety to prevent sensitive 
 * data leaks to LLM providers.
 */

const PII_PATTERNS = {
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  PHONE: /(\+91[\-\s]?)?[0-9]{10}/g, // India focus
  PAN_CARD: /[A-Z]{5}[0-9]{4}[A-Z]{1}/g,
  GSTIN: /[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}/g,
};

export class GuardrailEngine {
  /**
   * Automatically anonymizes PII from a target string.
   */
  scrub(text: string): string {
    let scrubbed = text;
    
    scrubbed = scrubbed.replace(PII_PATTERNS.EMAIL, "[EMAIL_HIDDEN]");
    scrubbed = scrubbed.replace(PII_PATTERNS.PHONE, "[PHONE_HIDDEN]");
    scrubbed = scrubbed.replace(PII_PATTERNS.PAN_CARD, "[GOVT_ID_HIDDEN]");
    scrubbed = scrubbed.replace(PII_PATTERNS.GSTIN, "[GSTIN_HIDDEN]");
    
    return scrubbed;
  }

  /**
   * Validates if the query is within strategic bounds.
   */
  isStrategic(query: string): boolean {
    const harmfulPatterns = [/hack/i, /illegal/i, /fraud/i, /spam/i];
    return !harmfulPatterns.some(p => p.test(query));
  }
}

export const guardrails = new GuardrailEngine();
