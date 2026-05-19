/**
 * Model pricing in USD per 1 million tokens.
 *
 * NOTE: Pricing data rots fast. Update from each provider's pricing page.
 * Last verified: 2026-Q2.
 *
 * Sources:
 *   - https://www.anthropic.com/pricing
 *   - https://openai.com/api/pricing
 *   - https://ai.google.dev/pricing
 *
 * The model ID matcher uses substring inclusion, so `claude-sonnet-4-6` will
 * match any model string containing that substring (e.g. dated variants).
 */

export interface ModelPrice {
  input: number;
  output: number;
}

export const PRICING_AS_OF = '2026-Q2';

export const PRICING: Record<string, ModelPrice> = {
  // Anthropic
  'claude-opus-4-7': { input: 15, output: 75 },
  'claude-opus-4-6': { input: 15, output: 75 },
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-haiku-4-5': { input: 0.8, output: 4 },
  // OpenAI
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  // Google
  'gemini-2.5-pro': { input: 1.25, output: 5 },
  'gemini-2.5-flash': { input: 0.15, output: 0.6 },
};
