# weave

> TypeScript-native agent orchestrator. MCP-native. Observability built-in.

<!-- demo gif: run `./scripts/record-demo.sh` to regenerate -->
<!-- ![weave demo](docs/assets/demo.gif) -->


`weave` is a small, opinionated framework for building multi-agent workflows in TypeScript.

- **Type-safe graphs** — full TS inference across nodes
- **MCP-native** — plug any MCP server as tools, zero glue code
- **Observability built-in** — SQLite-backed tracer + local trace UI, no SaaS signup
- **Durable** — SQLite checkpoints, resume after crash
- **Cost guardrails** — per-run USD budget, kill switch
- **Multi-provider** — Anthropic, OpenAI, Google, Ollama via Vercel AI SDK

## Install

```bash
pnpm add @polymatx/weave @polymatx/weave-mcp ai @ai-sdk/anthropic
```

## Hello, weave

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
  system: 'Research the topic. Return concise factual notes.',
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

## MCP tools

Any MCP server (filesystem, GitHub, web-fetch, Postgres, …) plugs in directly:

```ts
import { connectMcpServers } from '@polymatx/weave-mcp';

const mcp = await connectMcpServers({
  fetch: { type: 'stdio', command: 'uvx', args: ['mcp-server-fetch'] },
  github: { type: 'stdio', command: 'npx', args: ['-y', '@modelcontextprotocol/server-github'] },
});

const agent = agent({
  model: anthropic('claude-sonnet-4-6'),
  tools: mcp.tools,
});
```

## Trace UI

A local dashboard reads the same SQLite file your runs write to:

```bash
pnpm --filter @polymatx/weave-ui start --db ./weave.sqlite --port 4321
# open http://localhost:4321
```

Shows: runs list, per-run timeline, model calls, tool calls, tokens, cost, errors.

## Conditional edges

```ts
graph<State>()
  .node('classify', classifier)
  .node('billing', billingAgent)
  .node('support', supportAgent)
  .edge('classify', (s) => (s.intent === 'billing' ? 'billing' : 'support'))
  .edge('billing', END)
  .edge('support', END)
  .compile();
```

## Checkpointing & resume

```ts
import { SqliteCheckpointStore } from '@polymatx/weave';

const checkpoints = new SqliteCheckpointStore('./weave.sqlite');

const flow = graph<State>().checkpoint(checkpoints) /* ...nodes/edges */ .compile();

await flow.run({ initialState, runId: 'run-123' });

// later, after a crash:
await flow.run({ initialState, runId: 'run-123', resumeFromCheckpoint: true });
```

## Streaming

```ts
const a = agent({ model: anthropic('claude-sonnet-4-6'), system: '...' });

const { textStream, finalResult } = a.stream('Tell me a story');
for await (const chunk of textStream) process.stdout.write(chunk);
const { usage } = await finalResult;
```

In a graph, use `streamAsNode()` — emits `token.delta` events through the tracer.

## Packages

| Package                  | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `@polymatx/weave`        | Core: `agent()`, `graph()`, checkpoints, tracer   |
| `@polymatx/weave-mcp`    | MCP client integration                            |
| `@polymatx/weave-ui`     | Local trace UI (CLI: `weave-ui`)                  |

## Examples

| Example          | What it shows                                              |
| ---------------- | ---------------------------------------------------------- |
| `research-bot`   | 2-agent linear flow + MCP web fetch + checkpoints + traces |
| `code-reviewer`  | Single-agent pipeline reviewing `git diff` output          |
| `chat-router`    | Classifier + conditional edges → billing / support / sales |

Run any: `pnpm --filter weave-example-<name> start`

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
```

## Why not LangGraph.js?

- **TS-first** — full type inference across graph state, no `any`-laundering
- **MCP-native** — `mcp.tools` plugs into `agent({ tools })` directly
- **Observability bundled** — tracer + UI in-repo, not a separate paid SaaS
- **Smaller** — ~600 LOC core, no LangChain dep

## License

MIT © polymatx
