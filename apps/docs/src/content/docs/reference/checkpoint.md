---
title: SqliteCheckpointStore
description: SQLite-backed checkpoint store. Survives crashes; resumes from the last step.
---

```ts
import { SqliteCheckpointStore } from '@polymatx/weave';

const store = new SqliteCheckpointStore('./weave.sqlite');
```

## Interface

```ts
interface CheckpointStore {
  save(cp: Checkpoint): Promise<void> | void;
  load(runId: string): Promise<Checkpoint | null> | Checkpoint | null;
  list(runId: string): Promise<Checkpoint[]> | Checkpoint[];
}

interface Checkpoint {
  runId: string;
  step: number;
  state: unknown;
  nextNode: string;
}
```

You can implement your own `CheckpointStore` (e.g. Postgres-backed) by
matching the interface and passing it to `.checkpoint(store)`.
