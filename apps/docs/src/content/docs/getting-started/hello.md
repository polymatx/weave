---
title: Hello, weave
description: A 30-line example that does real work.
---

```ts
import { agent, graph, END, SqliteTracer } from '@polymatx/weave';
import { anthropic } from '@ai-sdk/anthropic';

interface State {
  topic: string;
  research: string;
  draft: string;
}

const researcher = agent({
  name: 'researcher',
  model: anthropic('claude-sonnet-4-6'),
  system: 'Research the topic and return concise factual notes.',
});

const writer = agent({
  name: 'writer',
  model: anthropic('claude-sonnet-4-6'),
  system: 'Write a 200-word brief from the supplied notes.',
});

const tracer = new SqliteTracer('./weave.sqlite');

const flow = graph<State>()
  .node('research', researcher.asNode<State>(
    (s) => `Research: ${s.topic}`,
    (r) => ({ research: r.text }),
  ))
  .node('write', writer.asNode<State>(
    (s) => `Topic: ${s.topic}\n\nNotes:\n${s.research}`,
    (r) => ({ draft: r.text }),
  ))
  .edge('research', 'write')
  .edge('write', END)
  .compile();

const result = await flow.run({
  initialState: { topic: 'agent orchestration', research: '', draft: '' },
  budgetUsd: 0.5,
  onEvent: (e) => tracer.record(e),
});

console.log(result.state.draft);
```

State is fully typed end to end. Every node call, every tool call, and every
token-counted model invocation is recorded to `weave.sqlite`. Spin up
`weave-ui` and you can scrub through the run's timeline immediately.
