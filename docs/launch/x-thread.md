# X/Twitter launch thread

**1/** I shipped weave — a TypeScript-native agent orchestrator with MCP support and observability built in.

If you've ever wished LangGraph spoke TypeScript natively, this is for you.

https://github.com/polymatx/weave

**2/** Why TypeScript?

Every multi-agent framework that matters today (LangGraph, AutoGen, CrewAI) is Python. If you're on Node, you've been writing bespoke state machines over `generateText`.

Weave gives you `graph<State>().node().edge().compile()` with full type inference.

**3/** Why MCP-native?

Anthropic's Model Context Protocol is becoming the universal tool interface. Every framework I've used treats it as a second-class citizen with adapters and bridges.

In weave: `mcp.tools` plugs into `agent({ tools })`. One line, no glue.

**4/** Why observability built in?

Trace UIs are paid SaaS (LangSmith, Langfuse, Helicone). For prototyping that's painful.

Weave ships a Hono + React dashboard that reads from a local SQLite file. Free, offline, MIT.

**5/** Built-in features I needed but couldn't find pre-built:

- Per-run USD budget with kill switch
- SQLite checkpoints (crash → resume)
- Conditional edges with type inference
- Streaming agents via `streamAsNode()`
- Cost tracking per node

**6/** Stack:

- Node 22 + TS strict
- Vercel AI SDK (Anthropic/OpenAI/Google/Ollama)
- better-sqlite3 for checkpoints + traces
- Hono + React + Vite for the UI
- pnpm workspaces

**7/** Examples in the repo:

- research-bot — 2-agent flow + MCP web fetch
- code-reviewer — summarize → review a git diff
- chat-router — classifier with conditional edges to billing/support/sales

**8/** What I want from the community:

- Try it. Open issues. Tell me where it falls over.
- If you want an MCP server I haven't written an example for, file it.
- Stars appreciated

https://github.com/polymatx/weave
