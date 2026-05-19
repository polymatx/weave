import { describe, expect, it } from 'vitest';
import { MockLanguageModelV1 } from 'ai/test';
import type { LanguageModel } from 'ai';
import { agent } from './agent.js';

function streamingMockModel(chunks: string[]): LanguageModel {
  return new MockLanguageModelV1({
    doStream: async () => ({
      stream: new ReadableStream({
        start(controller) {
          for (const c of chunks) {
            controller.enqueue({ type: 'text-delta', textDelta: c });
          }
          controller.enqueue({
            type: 'finish',
            finishReason: 'stop',
            usage: { promptTokens: 10, completionTokens: chunks.length },
          });
          controller.close();
        },
      }),
      rawCall: { rawPrompt: null, rawSettings: {} },
    }),
  }) as unknown as LanguageModel;
}

describe('agent().stream()', () => {
  it('yields text chunks and resolves final result', async () => {
    const a = agent({ model: streamingMockModel(['Hel', 'lo, ', 'world']) });
    const { textStream, finalResult } = a.stream('hi');

    let collected = '';
    for await (const chunk of textStream) collected += chunk;

    const result = await finalResult;
    expect(collected).toBe('Hello, world');
    expect(result.text).toBe('Hello, world');
    expect(result.usage.totalTokens).toBe(13);
  });

  it('streamAsNode emits token.delta + agent.call events', async () => {
    const a = agent({ model: streamingMockModel(['A', 'B', 'C']) });
    const events: string[] = [];
    const fn = a.streamAsNode<{ q: string; r: string }>(
      (s) => s.q,
      (r) => ({ r: r.text }),
    );
    const patch = await fn(
      { q: 'q1', r: '' },
      {
        runId: 'r1',
        nodeName: 'streamer',
        emit: (e) => events.push(e.type),
      },
    );

    expect(patch.r).toBe('ABC');
    expect(events.filter((t) => t === 'token.delta')).toHaveLength(3);
    expect(events).toContain('agent.call');
  });
});
