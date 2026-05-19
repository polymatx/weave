import { describe, expect, it } from 'vitest';
import { SqliteTracer } from './tracer.js';
import type { TraceEvent } from './types.js';

function makeRun(runId: string): TraceEvent[] {
  return [
    { type: 'run.start', runId, t: 1000, initialState: { x: 0 } },
    { type: 'node.start', runId, t: 1010, node: 'a', state: { x: 0 } },
    {
      type: 'agent.call',
      runId,
      t: 1100,
      node: 'a',
      model: 'claude-sonnet-4-6',
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      costUsd: 0.001,
      durationMs: 90,
    },
    { type: 'node.end', runId, t: 1200, node: 'a', patch: { x: 1 }, durationMs: 190 },
    { type: 'run.end', runId, t: 1300, finalState: { x: 1 }, durationMs: 300 },
  ];
}

describe('SqliteTracer', () => {
  it('records run lifecycle and aggregates cost/tokens/steps', () => {
    const tr = new SqliteTracer(':memory:');
    for (const e of makeRun('r1')) tr.record(e);

    const run = tr.getRun('r1');
    expect(run?.status).toBe('completed');
    expect(run?.steps).toBe(1);
    expect(run?.totalCostUsd).toBeCloseTo(0.001);
    expect(run?.totalTokens).toBe(150);
    expect(run?.durationMs).toBe(300);

    const events = tr.getEvents('r1');
    expect(events).toHaveLength(5);
    expect(events[0]?.type).toBe('run.start');
  });

  it('records errors', () => {
    const tr = new SqliteTracer(':memory:');
    tr.record({ type: 'run.start', runId: 'r2', t: 0, initialState: {} });
    tr.record({ type: 'run.error', runId: 'r2', t: 100, error: 'boom' });

    const run = tr.getRun('r2');
    expect(run?.status).toBe('error');
    expect(run?.errorMessage).toBe('boom');
  });

  it('lists runs in descending start order', () => {
    const tr = new SqliteTracer(':memory:');
    tr.record({ type: 'run.start', runId: 'old', t: 100, initialState: {} });
    tr.record({ type: 'run.start', runId: 'new', t: 200, initialState: {} });

    const runs = tr.listRuns();
    expect(runs[0]?.runId).toBe('new');
    expect(runs[1]?.runId).toBe('old');
  });
});
