---
title: Streaming
description: Stream tokens out of an agent in real time, with trace events per chunk.
---

```ts
const a = agent({ model: anthropic('claude-sonnet-4-6'), system: '...' });

const { textStream, finalResult } = a.stream('Tell me a story.');
for await (const chunk of textStream) process.stdout.write(chunk);

const { usage } = await finalResult;
```

Inside a graph, use `streamAsNode` instead of `asNode`. The node emits
`token.delta` events as chunks arrive:

```ts
graph<State>().node(
  'narrate',
  writer.streamAsNode<State>(
    (s) => s.prompt,
    (r) => ({ output: r.text }),
  ),
);
```

The trace UI shows streamed outputs as they arrive.
