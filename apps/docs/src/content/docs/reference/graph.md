---
title: graph()
description: Reference for the graph builder.
---

```ts
import { graph, END } from '@polymatx/weave';
```

## Signature

```ts
graph<State extends object>(): GraphBuilder<State>
```

## Builder methods

| Method                       | Description                                                |
| ---------------------------- | ---------------------------------------------------------- |
| `.node(name, fn)`            | Register a node. First call becomes the entry by default.  |
| `.edge(from, to)`            | Register an edge. `to` may be a string, `END`, or a fn.    |
| `.entry(name)`               | Override the entry node.                                   |
| `.maxSteps(n)`               | Override the per-run step cap (default 50).                |
| `.checkpoint(store)`         | Attach a checkpoint store for durable runs.                |
| `.compile()`                 | Returns a `CompiledGraph<State>`.                          |

## Running

```ts
compiled.run({
  initialState,
  signal?: AbortSignal,
  runId?: string,
  budgetUsd?: number,
  onEvent?: (event: TraceEvent) => void,
  resumeFromCheckpoint?: boolean,
});
```

Returns `{ runId, state, steps, durationMs, events }`.

## Errors

- `NodeNotFoundError` — an edge points to a node that wasn't registered.
- `GraphCompileError` — invalid configuration at `compile()` time.
- `BudgetExceededError` — cumulative cost exceeded `budgetUsd`.
- `WeaveError` — `maxSteps` exhausted, run aborted, or otherwise.
