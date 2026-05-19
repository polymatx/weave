import { describe, expect, it } from 'vitest';
import { MockLanguageModelV1 } from 'ai/test';
import type { LanguageModel } from 'ai';
import { agent } from './agent.js';

function mockModel(text = 'mocked reply'): LanguageModel {
  return new MockLanguageModelV1({
    doGenerate: async () => ({
      rawCall: { rawPrompt: null, rawSettings: {} },
      finishReason: 'stop',
      usage: { promptTokens: 10, completionTokens: 5 },
      text,
    }),
  }) as unknown as LanguageModel;
}

describe('agent()', () => {
  it('runs and returns text + usage', async () => {
    const a = agent({ model: mockModel('hello'), system: 'sys' });
    const result = await a.run('hi');
    expect(result.text).toBe('hello');
    expect(result.usage.promptTokens).toBe(10);
    expect(result.usage.completionTokens).toBe(5);
    expect(result.usage.totalTokens).toBe(15);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('auto-generates a name when none provided', () => {
    const a = agent({ model: mockModel() });
    expect(a.name).toMatch(/^agent-/);
  });

  it('uses provided name', () => {
    const a = agent({ name: 'pinned', model: mockModel() });
    expect(a.name).toBe('pinned');
  });

  it('asNode emits agent.call event with cost', async () => {
    const a = agent({ name: 'n1', model: mockModel('out') });
    const events: string[] = [];
    const fn = a.asNode<{ q: string; r: string }>(
      (s) => s.q,
      (r) => ({ r: r.text }),
    );
    const patch = await fn(
      { q: 'q1', r: '' },
      {
        runId: 'rX',
        nodeName: 'n1',
        emit: (e) => events.push(e.type),
      },
    );
    expect(patch).toEqual({ r: 'out' });
    expect(events).toContain('agent.call');
  });
});
