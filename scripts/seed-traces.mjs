#!/usr/bin/env node
/**
 * Seed the trace DB with synthetic runs so we can demo the UI without API keys.
 * Usage: node scripts/seed-traces.mjs [./weave.sqlite]
 */
import { SqliteTracer } from '../packages/core/dist/index.js';

const path = process.argv[2] ?? './weave-demo.sqlite';
const tracer = new SqliteTracer(path);
const now = Date.now();

const runs = [
  {
    runId: 'run-research-01',
    nodes: ['research', 'write'],
    model: 'claude-sonnet-4-6',
    costPerCall: 0.012,
    tokensPerCall: 1450,
    status: 'completed',
  },
  {
    runId: 'run-router-02',
    nodes: ['classify', 'billing'],
    model: 'claude-haiku-4-5',
    costPerCall: 0.0008,
    tokensPerCall: 320,
    status: 'completed',
  },
  {
    runId: 'run-review-03',
    nodes: ['summarize', 'review'],
    model: 'claude-sonnet-4-6',
    costPerCall: 0.018,
    tokensPerCall: 2100,
    status: 'completed',
  },
  {
    runId: 'run-failed-04',
    nodes: ['classify'],
    model: 'claude-haiku-4-5',
    costPerCall: 0.0005,
    tokensPerCall: 180,
    status: 'error',
  },
];

let t = now - runs.length * 90_000;

for (const r of runs) {
  tracer.record({ type: 'run.start', runId: r.runId, t, initialState: { topic: 'demo' } });
  let stepT = t;
  for (const node of r.nodes) {
    stepT += 1500;
    tracer.record({ type: 'node.start', runId: r.runId, t: stepT, node, state: {} });
    tracer.record({
      type: 'agent.call',
      runId: r.runId,
      t: stepT + 1200,
      node,
      model: r.model,
      usage: {
        promptTokens: Math.round(r.tokensPerCall * 0.6),
        completionTokens: Math.round(r.tokensPerCall * 0.4),
        totalTokens: r.tokensPerCall,
      },
      costUsd: r.costPerCall,
      durationMs: 1180,
    });
    tracer.record({
      type: 'node.end',
      runId: r.runId,
      t: stepT + 1300,
      node,
      patch: { ok: true },
      durationMs: 1300,
    });
    stepT += 1500;
  }
  if (r.status === 'error') {
    tracer.record({ type: 'run.error', runId: r.runId, t: stepT + 200, error: 'BudgetExceededError: run budget exceeded' });
  } else {
    tracer.record({ type: 'run.end', runId: r.runId, t: stepT + 200, finalState: { done: true }, durationMs: stepT + 200 - t });
  }
  t += 90_000;
}

console.log(`Seeded ${runs.length} runs into ${path}`);
tracer.close();
