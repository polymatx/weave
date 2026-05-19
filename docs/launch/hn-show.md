# Show HN: Weave — a TypeScript-native agent orchestrator (MCP-native, traces built-in)

Hey HN,

I built `weave` because every time I tried to wire up a multi-agent flow in Node, the path of least resistance was "shell out to Python and use LangGraph." That felt wrong. So I wrote a small, opinionated TS framework that scratches three itches:

- **Type-safe graph state.** Full TypeScript inference across nodes — you write `graph<MyState>()` and every node sees the right shape. No `Record<string, any>` laundering.
- **MCP-native.** `mcp.tools` plugs directly into `agent({ tools })`. No custom adapters, no bridge classes. Every MCP server (filesystem, Postgres, GitHub, web-fetch, …) becomes available to the LLM with one line.
- **Observability bundled.** SQLite-backed tracer + a local React dashboard ships in the repo. No SaaS signup, no API key, no monthly bill. Run `weave-ui --db ./weave.sqlite` and you see every run, every model call, every tool call, every token, every dollar.

Other things I wanted but couldn't find pre-built:

- Per-run **USD budget** with a hard kill switch
- **SQLite checkpoints** so a crashed run resumes from the last step
- **Conditional edges** with full type inference on the predicate
- Streaming first-class (`agent.stream()` + `streamAsNode()` emitting `token.delta` trace events)

The core is ~600 LOC. Vercel AI SDK underneath, so Anthropic / OpenAI / Google / Ollama all work out of the box. Three example apps in the repo: a research bot, a code reviewer over `git diff`, and a chat router with conditional edges to billing/support/sales agents.

Repo: https://github.com/polymatx/weave

What I'd love feedback on:

1. The `agent.asNode(inputFrom, outputTo)` API for hoisting an agent into a graph node — does that feel right, or should the agent itself implement a node interface?
2. Tracing granularity: I currently store every `token.delta` event in SQLite for replay. Feels expensive at scale; I'm tempted to make it opt-in. What would you expect?
3. Is "MCP-native" the right pitch, or does that read as too narrow for people not deep in the Anthropic ecosystem?

Not a SaaS. No waitlist. MIT.
