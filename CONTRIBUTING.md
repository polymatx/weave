# Contributing to weave

Thanks for your interest. Contributions of any size are welcome.

## Quick start

```bash
git clone https://github.com/polymatx/weave
cd weave
pnpm install
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

Node 22+ and pnpm 11+ are required.

## Workflow

1. **Open an issue first** for non-trivial changes so we can agree on scope.
   For typos and small fixes a PR is fine.
2. **Branch from `main`** with a short descriptive name (`feat/streaming-events`,
   `fix/mcp-stdio-close`).
3. **Add or update tests** for any behavior change. The test suite must stay
   green (`pnpm test`).
4. **Keep the diff focused.** One conceptual change per PR.
5. **Don't bump versions in your PR.** Releases are cut by maintainers.

## Coding style

- TypeScript strict mode is non-negotiable; no `any` without a comment that
  justifies it.
- Prefer pure functions in the core runtime. Side effects (DB writes, network
  calls) happen at the edges.
- Public exports go through `packages/<pkg>/src/index.ts`. Keep that barrel
  tidy.
- Internal helpers do not need to be exported.

## Commit messages

Conventional Commits format is appreciated but not required:

```
feat(core): durable retries on transient model errors
fix(mcp): close stdio transport on graph abort
docs: clarify checkpoint API in README
```

## Areas where help is wanted

- More example apps (RAG over docs, browser-use clone, voice agent).
- Provider coverage in `pricing.ts` — pricing drifts; PRs that update with a
  citation and "as of" date are very welcome.
- Better type inference on `graph().edge(from, to)` (currently `to` is
  validated at runtime).
- Eval harness integration (`evalite`, `inspect-ai`).
- Docs site improvements (`apps/docs`).

## Reporting security issues

Please do not open public issues for vulnerabilities. Email the maintainer
directly via the address listed on the GitHub profile.
