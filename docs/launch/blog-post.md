# Building weave: a TypeScript-native agent orchestrator

> _Why I shipped yet another agent framework, what's actually different about it, and where it goes next._

## The gap

Multi-agent orchestration in 2026 has settled into a comfortable rhythm: pick LangGraph if you're in Python, AutoGen if you like message passing, CrewAI if you want a higher-level abstraction. All three are great. All three are Python.

If you're on Node — and you'd rather not maintain two language toolchains for a single workflow — your options are thin. LangChain.js exists, but its graph story is comparatively undercooked. The Vercel AI SDK gives you excellent primitives for a single agent call but stops short of orchestration. Most teams I've seen end up writing a bespoke state machine over `generateText` and call it a day.

That's the gap weave aims to fill.

## What weave is

Three packages, all TypeScript, all small:

| Package | What it does | LOC |
| --- | --- | --- |
| `@polymatx/weave` | `agent()`, `graph()`, SQLite checkpoints, SQLite tracer, cost guardrails | ~600 |
| `@polymatx/weave-mcp` | MCP stdio + SSE client → Vercel AI SDK tools | ~120 |
| `@polymatx/weave-ui` | Hono server + React/Vite local trace dashboard | ~400 |

```ts
import { agent, graph, END, SqliteTracer } from '@polymatx/weave';
import { anthropic } from '@ai-sdk/anthropic';

interface State { topic: string; research: string; draft: string }

const researcher = agent({ model: anthropic('claude-sonnet-4-6'), system: '...' });
const writer = agent({ model: anthropic('claude-sonnet-4-6'), system: '...' });

const flow = graph<State>()
  .node('research', researcher.asNode<State>((s) => s.topic, (r) => ({ research: r.text })))
  .node('write',    writer.asNode<State>(    (s) => s.research, (r) => ({ draft: r.text })))
  .edge('research', 'write')
  .edge('write', END)
  .compile();

const tracer = new SqliteTracer('./weave.sqlite');
const result = await flow.run({
  initialState: { topic: 'agent orchestration', research: '', draft: '' },
  budgetUsd: 0.5,
  onEvent: (e) => tracer.record(e),
});
```

That's the whole hello-world. State is fully typed end to end. The tracer is the same SQLite file the trace UI reads, so observability is a single side-effect away.

## Three things that are actually different

### 1. MCP is a first-class citizen, not an adapter

Most frameworks have a `Tool` interface and a separate `MCPAdapter`. Weave inverts this: an MCP server is a tool source. `connectMcpServers({...})` returns a `tools` object you hand directly to `agent({ tools })`. There is no second concept.

```ts
import { connectMcpServers } from '@polymatx/weave-mcp';

const mcp = await connectMcpServers({
  fetch:  { type: 'stdio', command: 'uvx', args: ['mcp-server-fetch'] },
  github: { type: 'stdio', command: 'npx', args: ['-y', '@modelcontextprotocol/server-github'] },
});

const researcher = agent({ model: anthropic('claude-sonnet-4-6'), tools: mcp.tools });
```

JSON Schema → Zod conversion happens internally so the AI SDK's strict typing is preserved.

### 2. Tracing is in-repo, not in your bill

Every event your run produces — `run.start`, `node.end`, `agent.call`, `tool.call`, `token.delta`, `run.error` — is persisted to a local SQLite file. The shipped UI reads from the same file and shows a per-run timeline, model usage, cost, and any errors. It's small enough to run locally and forget about.

This isn't a Langfuse replacement; if you're at scale you want a managed product. It's the right tool for the prototype stage, where the cost of "where did this token come from" is measured in productivity, not dollars.

### 3. Crashes don't lose state

`SqliteCheckpointStore` saves graph state after every node finishes. If your process dies, you call `flow.run({ runId, resumeFromCheckpoint: true })` and it picks up where it left off. This is table stakes for production workflows; it shouldn't require a Temporal cluster to get.

## What I'm worried about

**Vercel will probably add MCP support.** If they ship a first-class MCP integration in the AI SDK, weave's central differentiator weakens. My bet is that the orchestration / replay / UI surface is enough to keep the value proposition intact, but it's a real risk.

**Tracing granularity is unsolved.** Storing every `token.delta` is great for replay but bad for high-volume workloads. The next milestone makes the event level configurable and adds a "sampling" mode.

**TypeScript type inference has limits.** `graph<State>().node('a', fn).edge('a', 'b')` infers state correctly. It cannot infer at compile time that `'b'` is a valid edge target — that's still a runtime check. Doing better requires a phantom-type trick I haven't been brave enough to ship yet.

## What's next

- **Streaming UI.** The dashboard currently polls; switching it to SSE so token streams render live is half a day's work.
- **More MCP examples.** A worked example for `mcp-server-postgres` would help concretize the value prop.
- **Docs site.** Astro + Starlight, hosted on Pages.
- **Eval harness.** Either ship a small one or document a clean integration with `evalite` / `inspect-ai`.

The repo: https://github.com/polymatx/weave. Issues and discussion very welcome.

— _polymatx_
