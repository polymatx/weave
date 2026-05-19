import type { TokenUsage } from './types.js';

/**
 * Per-million-token USD prices. Pulled from public pricing pages, 2026-Q2.
 * Update as providers change pricing.
 */
const PRICING: Record<string, { input: number; output: number }> = {
  'claude-opus-4-7': { input: 15, output: 75 },
  'claude-opus-4-6': { input: 15, output: 75 },
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-haiku-4-5': { input: 0.8, output: 4 },
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
};

export function estimateCostUsd(modelId: string, usage: TokenUsage): number {
  const key = Object.keys(PRICING).find((k) => modelId.includes(k));
  if (!key) return 0;
  const p = PRICING[key]!;
  return (usage.promptTokens * p.input + usage.completionTokens * p.output) / 1_000_000;
}
