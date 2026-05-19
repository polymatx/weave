# Changelog

All notable changes are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-05-19

### Changed
- **BREAKING**: Upgrade to Vercel AI SDK v6. Consumers must install
  `ai@^6` and `@ai-sdk/anthropic@^3` (or other v3 providers). The v4 SDK is no
  longer supported.
- `ai` and `@ai-sdk/anthropic` are now `peerDependencies` so consumers control
  the version and there is only one copy resolved.
- Internal switch from `maxSteps` to `stopWhen: stepCountIs(n)` (v6 API).
- Tool call records now read v6's `input`/`output` fields under the hood;
  public `ToolCallRecord` shape is unchanged.
- Token usage is normalized from v3 spec (`{ total }` wrappers) into the
  flat `{ promptTokens, completionTokens, totalTokens }` shape weave exposes.

### Added
- Tests for `agent()`, `SqliteTracer`, `estimateCostUsd`, and the public surface
  of `@polymatx/weave-mcp`.
- Extracted model pricing into `pricing.ts` with an explicit `PRICING_AS_OF`
  marker so price-drift is auditable.
- CI now runs `pnpm build` in addition to typecheck/lint/test.

### Migration

If you were on `@polymatx/weave@0.0.1`:

```bash
# 1. Upgrade the SDK
pnpm remove ai @ai-sdk/anthropic
pnpm add ai@^6 @ai-sdk/anthropic@^3

# 2. Upgrade weave
pnpm add @polymatx/weave@^0.1 @polymatx/weave-mcp@^0.1 @polymatx/weave-ui@^0.1
```

No code changes are required for typical use of `agent()`, `graph()`,
`SqliteCheckpointStore`, or `SqliteTracer`. If you were extending the
internals (`AgentRunResult.toolCalls`, etc.) the shapes are unchanged.

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

[Unreleased]: https://github.com/polymatx/weave/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/polymatx/weave/releases/tag/v0.1.0
[0.0.1]: https://github.com/polymatx/weave/releases/tag/v0.0.1
