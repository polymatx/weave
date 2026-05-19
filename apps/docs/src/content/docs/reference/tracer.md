---
title: SqliteTracer
description: SQLite-backed tracer that records every trace event.
---

```ts
import { SqliteTracer } from '@polymatx/weave';

const tracer = new SqliteTracer('./weave.sqlite');
```

## Methods

| Method                  | Returns                          |
| ----------------------- | -------------------------------- |
| `record(event)`         | `void` — persists a trace event  |
| `listRuns(limit?)`      | `RunSummary[]`                   |
| `getRun(runId)`         | `RunSummary \| null`             |
| `getEvents(runId)`      | `TraceEvent[]`                   |
| `close()`               | `void`                           |

## `RunSummary`

```ts
{
  runId: string;
  startedAt: number;
  endedAt: number | null;
  durationMs: number | null;
  status: 'running' | 'completed' | 'error';
  totalCostUsd: number;
  totalTokens: number;
  steps: number;
  errorMessage: string | null;
}
```
