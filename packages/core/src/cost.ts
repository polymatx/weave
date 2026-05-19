import { PRICING } from './pricing.js';
import type { TokenUsage } from './types.js';

export { PRICING, PRICING_AS_OF } from './pricing.js';

export function estimateCostUsd(modelId: string, usage: TokenUsage): number {
  const key = Object.keys(PRICING).find((k) => modelId.includes(k));
  if (!key) return 0;
  const p = PRICING[key]!;
  return (usage.promptTokens * p.input + usage.completionTokens * p.output) / 1_000_000;
}
