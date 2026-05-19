---
title: Introduction
description: What weave is, who it's for, and what it's not.
---

`weave` is a small TypeScript framework for building multi-agent workflows. It
exists because the agent ecosystem in 2026 is overwhelmingly Python, and the
Node options are either bespoke state machines on top of `generateText` or thin
ports that don't quite fit.

## What you get

- A typed `agent()` primitive on top of the Vercel AI SDK (multi-provider).
- A `graph()` runtime with type-safe state and conditional edges.
- A first-class MCP client — any MCP server's tools become agent tools.
- A SQLite-backed tracer plus a local web dashboard (`weave-ui`).
- USD budget enforcement with a kill switch.
- Streaming agents with per-token trace events.
- SQLite checkpoints so crashed runs resume.

## What you don't get

- A managed inference service.
- A managed eval platform.
- Auto-prompt-rewriting magic.

This is glue, not intelligence.

## When to use it

- You are building a Node service that orchestrates two or more LLM calls.
- You want to use MCP servers as your tool layer.
- You want to inspect every model call, every tool call, every dollar locally
  before paying for a SaaS trace product.

## When not to use it

- You're a single-shot prompt with no orchestration. Use the AI SDK directly.
- You're at scale, with hundreds of concurrent runs and external eval needs.
  Use Temporal + Langfuse.
- You're in Python. Use LangGraph.
