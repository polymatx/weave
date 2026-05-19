import { nanoid } from 'nanoid';
import {
  BudgetExceededError,
  GraphCompileError,
  NodeNotFoundError,
  WeaveError,
} from './errors.js';
import type {
  EdgeTarget,
  GraphRunOptions,
  GraphRunResult,
  NodeContext,
  NodeFn,
  TraceEvent,
} from './types.js';
import { END } from './types.js';
import type { CheckpointStore } from './checkpoint.js';

export const START = '__START__' as const;

interface GraphInternal<S> {
  nodes: Map<string, NodeFn<S>>;
  edges: Map<string, EdgeTarget<S>>;
  entry?: string;
  maxSteps: number;
  checkpoint?: CheckpointStore;
}

export interface GraphBuilder<S> {
  node(name: string, fn: NodeFn<S>): GraphBuilder<S>;
  edge(from: string, to: EdgeTarget<S>): GraphBuilder<S>;
  entry(name: string): GraphBuilder<S>;
  maxSteps(n: number): GraphBuilder<S>;
  checkpoint(store: CheckpointStore): GraphBuilder<S>;
  compile(): CompiledGraph<S>;
}

export interface CompiledGraph<S> {
  run(options: GraphRunOptions<S>): Promise<GraphRunResult<S>>;
}

export function graph<S extends object>(): GraphBuilder<S> {
  const g: GraphInternal<S> = {
    nodes: new Map(),
    edges: new Map(),
    maxSteps: 50,
  };

  const builder: GraphBuilder<S> = {
    node(name, fn) {
      if (name === START || name === END) {
        throw new GraphCompileError(`"${name}" is a reserved node name`);
      }
      g.nodes.set(name, fn);
      if (!g.entry) g.entry = name;
      return builder;
    },
    edge(from, to) {
      g.edges.set(from, to);
      return builder;
    },
    entry(name) {
      g.entry = name;
      return builder;
    },
    maxSteps(n) {
      g.maxSteps = n;
      return builder;
    },
    checkpoint(store) {
      g.checkpoint = store;
      return builder;
    },
    compile() {
      if (!g.entry) throw new GraphCompileError('Graph has no nodes');
      if (!g.nodes.has(g.entry)) throw new GraphCompileError(`Entry "${g.entry}" not found`);
      return { run: (opts) => runGraph(g, opts) };
    },
  };

  return builder;
}

async function runGraph<S extends object>(
  g: GraphInternal<S>,
  opts: GraphRunOptions<S>,
): Promise<GraphRunResult<S>> {
  const runId = opts.runId ?? nanoid(10);
  const events: TraceEvent[] = [];
  const start = Date.now();
  let totalCost = 0;

  const emit = (event: TraceEvent) => {
    events.push(event);
    if (event.type === 'agent.call') totalCost += event.costUsd;
    if (opts.budgetUsd !== undefined && totalCost > opts.budgetUsd) {
      throw new BudgetExceededError(totalCost, opts.budgetUsd);
    }
    opts.onEvent?.(event);
  };

  let state: S = { ...opts.initialState };
  let current: string | END = g.entry!;
  let step = 0;

  if (opts.resumeFromCheckpoint && g.checkpoint) {
    const cp = await g.checkpoint.load(runId);
    if (cp) {
      state = cp.state as S;
      current = cp.nextNode;
      step = cp.step;
    }
  }

  emit({ type: 'run.start', runId, t: Date.now(), initialState: state });

  try {
    while (current !== END) {
      if (step >= g.maxSteps) {
        throw new WeaveError(`Graph exceeded maxSteps (${g.maxSteps})`);
      }
      if (opts.signal?.aborted) throw new WeaveError('Run aborted');

      const fn = g.nodes.get(current);
      if (!fn) throw new NodeNotFoundError(current);

      const nodeName = current;
      const nodeStart = Date.now();
      emit({ type: 'node.start', runId, t: nodeStart, node: nodeName, state });

      const ctx: NodeContext = {
        runId,
        nodeName,
        ...(opts.signal !== undefined && { signal: opts.signal }),
        emit,
      };

      const patch = await fn(state, ctx);
      state = { ...state, ...patch };

      emit({
        type: 'node.end',
        runId,
        t: Date.now(),
        node: nodeName,
        patch,
        durationMs: Date.now() - nodeStart,
      });

      step++;

      const target = g.edges.get(nodeName);
      if (target === undefined) {
        current = END;
      } else if (typeof target === 'function') {
        current = await target(state);
      } else {
        current = target;
      }

      if (g.checkpoint) {
        await g.checkpoint.save({ runId, step, state, nextNode: current });
      }
    }

    const durationMs = Date.now() - start;
    emit({ type: 'run.end', runId, t: Date.now(), finalState: state, durationMs });

    return { runId, state, steps: step, durationMs, events };
  } catch (err) {
    emit({
      type: 'run.error',
      runId,
      t: Date.now(),
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export { END };
