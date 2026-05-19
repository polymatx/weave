# Changelog

All notable changes are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Tests for `agent()`, `SqliteTracer`, `estimateCostUsd`, and the public surface
  of `@polymatx/weave-mcp`.
- Extracted model pricing into `pricing.ts` with an explicit `PRICING_AS_OF`
  marker so price-drift is auditable.
- CI now runs `pnpm build` in addition to typecheck/lint/test.

## [0.0.1] - 2026-05-19

### Added
- Initial public release.
- `@polymatx/weave`: `agent()`, `graph()`, `SqliteCheckpointStore`,
  `SqliteTracer`, USD budget guardrail, conditional edges.
- `@polymatx/weave-mcp`: MCP stdio + SSE client; JSON Schema → Zod conversion.
- `@polymatx/weave-ui`: Hono server + React/Vite local trace dashboard;
  shipped as the `weave-ui` CLI.
- Streaming agent API via `agent.stream()` and `agent.streamAsNode()` emitting
  `token.delta` trace events.
- Examples: `research-bot`, `code-reviewer`, `chat-router`.

[Unreleased]: https://github.com/polymatx/weave/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/polymatx/weave/releases/tag/v0.0.1
