import { describe, expect, it } from 'vitest';
import { estimateCostUsd, PRICING } from './cost.js';

describe('estimateCostUsd', () => {
  it('returns 0 for unknown model', () => {
    expect(estimateCostUsd('mystery-model-9000', { promptTokens: 1000, completionTokens: 500, totalTokens: 1500 })).toBe(0);
  });

  it('computes claude-sonnet-4-6 cost correctly', () => {
    const cost = estimateCostUsd('claude-sonnet-4-6', {
      promptTokens: 1_000_000,
      completionTokens: 1_000_000,
      totalTokens: 2_000_000,
    });
    expect(cost).toBeCloseTo(PRICING['claude-sonnet-4-6']!.input + PRICING['claude-sonnet-4-6']!.output);
  });

  it('matches model IDs by substring', () => {
    const cost = estimateCostUsd('claude-sonnet-4-6-20250101', {
      promptTokens: 1000,
      completionTokens: 1000,
      totalTokens: 2000,
    });
    expect(cost).toBeGreaterThan(0);
  });

  it('scales linearly with token count', () => {
    const small = estimateCostUsd('gpt-4o-mini', { promptTokens: 100, completionTokens: 100, totalTokens: 200 });
    const big = estimateCostUsd('gpt-4o-mini', { promptTokens: 1000, completionTokens: 1000, totalTokens: 2000 });
    expect(big / small).toBeCloseTo(10);
  });
});
