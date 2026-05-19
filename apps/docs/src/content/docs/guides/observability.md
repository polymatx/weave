---
title: Observability
description: Record every run to SQLite and inspect it in the local dashboard.
---

```ts
import { SqliteTracer } from '@polymatx/weave';

const tracer = new SqliteTracer('./weave.sqlite');

await flow.run({
  initialState,
  onEvent: (e) => tracer.record(e),
});
```

Every emitted `TraceEvent` is written to the SQLite file. The trace UI reads
from the same file:

```bash
npx @polymatx/weave-ui --db ./weave.sqlite --port 4321
# open http://localhost:4321
```

### Event types

| Event           | When it fires                                            |
| --------------- | -------------------------------------------------------- |
| `run.start`     | Graph run begins                                         |
| `node.start`    | Node entered                                             |
| `node.end`      | Node returned a patch                                    |
| `agent.call`    | An LLM call completed (carries token usage, cost USD)    |
| `tool.call`     | An agent tool was invoked                                |
| `token.delta`   | A streaming agent emitted a chunk                        |
| `run.end`       | Graph reached `END`                                      |
| `run.error`     | Run aborted or threw                                     |

### Querying programmatically

```ts
const runs = tracer.listRuns(50);
const events = tracer.getEvents(runId);
```

Useful for building custom dashboards or wiring weave traces into your own
ETL.
