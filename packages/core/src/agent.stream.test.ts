import { describe, expect, it } from 'vitest';
import { MockLanguageModelV3 } from 'ai/test';
import type { LanguageModel } from 'ai';
import { agent } from './agent.js';

function streamingMockModel(chunks: string[]): LanguageModel {
  return new MockLanguageModelV3({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doStream: (async () => ({
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue({ type: 'stream-start', warnings: [] });
          controller.enqueue({ type: 'text-start', id: '1' });
          for (const c of chunks) {
            controller.enqueue({ type: 'text-delta', id: '1', delta: c });
          }
          controller.enqueue({ type: 'text-end', id: '1' });
          controller.enqueue({
            type: 'finish',
            finishReason: 'stop',
            usage: {
              inputTokens: { total: 10 },
              outputTokens: { total: chunks.length },
              totalTokens: 10 + chunks.length,
            },
          });
          controller.close();
        },
      }),
    })) as any,
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
