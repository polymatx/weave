---
title: Checkpoints
description: Persist graph state per node so crashed runs can resume.
---

```ts
import { SqliteCheckpointStore } from '@polymatx/weave';

const checkpoints = new SqliteCheckpointStore('./weave.sqlite');

const flow = graph<State>()
  /* ...nodes/edges... */
  .checkpoint(checkpoints)
  .compile();

await flow.run({ initialState, runId: 'order-123' });

// later, after a crash or process restart:
await flow.run({ initialState, runId: 'order-123', resumeFromCheckpoint: true });
```

Each completed node appends a checkpoint row keyed on `(runId, step)`. Resuming
loads the latest checkpoint, restores state, and continues from the recorded
`nextNode`.

### When to use

- Long-running pipelines (minutes or more) where a crash mid-run is unacceptable.
- Workflows that drive external side effects (DB writes, API calls) and need
  exactly-once semantics per step.

### When not to use

- Cheap, idempotent flows. Re-running from scratch is simpler.
