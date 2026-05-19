---
title: Agents
description: The `agent()` primitive — a thin runnable around a model and a tool set.
---

```ts
import { agent } from '@polymatx/weave';
import { anthropic } from '@ai-sdk/anthropic';

const reviewer = agent({
  name: 'reviewer',
  model: anthropic('claude-sonnet-4-6'),
  system: 'You are a careful senior code reviewer.',
  temperature: 0.2,
  maxSteps: 5,
});

const result = await reviewer.run('Review this diff: ...');
console.log(result.text);
console.log(result.usage); // { promptTokens, completionTokens, totalTokens }
```

### Tools

```ts
import { tool } from 'ai';
import { z } from 'zod';

const a = agent({
  model: anthropic('claude-sonnet-4-6'),
  tools: {
    sum: tool({
      description: 'Add two integers.',
      parameters: z.object({ a: z.number(), b: z.number() }),
      execute: async ({ a, b }) => a + b,
    }),
  },
});
```

Any tool the Vercel AI SDK accepts works. For MCP-backed tools, see the
[MCP guide](/weave/guides/mcp/).

### Plugging into a graph

`agent.asNode(inputFrom, outputTo)` hoists an agent into a graph node:

```ts
graph<State>().node(
  'review',
  reviewer.asNode<State>((s) => s.diff, (r) => ({ review: r.text })),
);
```

The node automatically emits an `agent.call` trace event with token usage and
estimated cost.
