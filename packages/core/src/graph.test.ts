import { describe, expect, it } from 'vitest';
import { graph, END } from './graph.js';
import { BudgetExceededError, NodeNotFoundError } from './errors.js';

interface State {
  count: number;
  log: string[];
}

describe('graph()', () => {
  it('runs linear flow and threads state', async () => {
    const flow = graph<State>()
      .node('a', (s) => ({ count: s.count + 1, log: [...s.log, 'a'] }))
      .node('b', (s) => ({ count: s.count + 10, log: [...s.log, 'b'] }))
      .edge('a', 'b')
      .edge('b', END)
      .compile();

    const r = await flow.run({ initialState: { count: 0, log: [] } });

    expect(r.state.count).toBe(11);
    expect(r.state.log).toEqual(['a', 'b']);
    expect(r.steps).toBe(2);
  });

  it('supports conditional edges', async () => {
    const flow = graph<State>()
      .node('start', (s) => ({ log: [...s.log, 'start'] }))
      .node('low', (s) => ({ log: [...s.log, 'low'] }))
      .node('high', (s) => ({ log: [...s.log, 'high'] }))
      .edge('start', (s) => (s.count < 5 ? 'low' : 'high'))
      .edge('low', END)
      .edge('high', END)
      .compile();

    const lo = await flow.run({ initialState: { count: 1, log: [] } });
    const hi = await flow.run({ initialState: { count: 99, log: [] } });

    expect(lo.state.log).toEqual(['start', 'low']);
    expect(hi.state.log).toEqual(['start', 'high']);
  });

  it('emits trace events', async () => {
    const events: string[] = [];
    const flow = graph<State>()
      .node('a', (s) => ({ count: s.count + 1 }))
      .edge('a', END)
      .compile();

    await flow.run({
      initialState: { count: 0, log: [] },
      onEvent: (e) => events.push(e.type),
    });

    expect(events).toContain('run.start');
    expect(events).toContain('node.start');
    expect(events).toContain('node.end');
    expect(events).toContain('run.end');
  });

  it('throws NodeNotFoundError for missing edge target', async () => {
    const flow = graph<State>()
      .node('a', () => ({}))
      .edge('a', 'nonexistent')
      .compile();

    await expect(flow.run({ initialState: { count: 0, log: [] } })).rejects.toThrow(
      NodeNotFoundError,
    );
  });

  it('enforces budget via emitted agent.call events', async () => {
    const flow = graph<State>()
      .node('expensive', (_s, ctx) => {
        ctx.emit({
          type: 'agent.call',
          runId: ctx.runId,
          t: Date.now(),
          node: ctx.nodeName,
          model: 'test',
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          costUsd: 1.0,
          durationMs: 0,
        });
        return {};
      })
      .edge('expensive', END)
      .compile();

    await expect(
      flow.run({ initialState: { count: 0, log: [] }, budgetUsd: 0.1 }),
    ).rejects.toThrow(BudgetExceededError);
  });
});
