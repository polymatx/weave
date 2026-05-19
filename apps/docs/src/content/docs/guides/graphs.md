---
title: Graphs & state
description: Wire nodes and edges into a typed state machine.
---

```ts
import { graph, END } from '@polymatx/weave';

interface State { intent: 'billing' | 'support' | 'unknown'; reply: string }

const flow = graph<State>()
  .node('classify', classifier)
  .node('billing', billingAgent.asNode<State>(...))
  .node('support', supportAgent.asNode<State>(...))
  .edge('classify', (s) => (s.intent === 'billing' ? 'billing' : 'support'))
  .edge('billing', END)
  .edge('support', END)
  .compile();
```

Nodes return a `Partial<State>` patch that's merged into the running state. The
state type is fully inferred — no `any` casts anywhere.

### Conditional edges

An edge target can be a function returning a node name or `END`:

```ts
.edge('classify', async (s) => (await needsHuman(s)) ? 'human' : 'auto')
```

### Budget

```ts
await flow.run({ initialState, budgetUsd: 0.50 });
```

If the cumulative cost of `agent.call` events exceeds the budget, the run
throws `BudgetExceededError`.

### Limits

`maxSteps` (default 50) caps how many node transitions a single run will
perform. Exceeding it throws `WeaveError`.
