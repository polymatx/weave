---
title: Install
description: Add weave to a Node 22+ project.
---

```bash
pnpm add @polymatx/weave @polymatx/weave-mcp ai @ai-sdk/anthropic
```

Or with `npm` / `yarn`:

```bash
npm install @polymatx/weave @polymatx/weave-mcp ai @ai-sdk/anthropic
yarn add @polymatx/weave @polymatx/weave-mcp ai @ai-sdk/anthropic
```

## Requirements

- **Node** 22 or newer (we rely on native ES modules and modern async APIs).
- A package manager that understands `workspace:*` if you contribute to the
  monorepo (`pnpm` recommended).

## Optional pieces

- `@polymatx/weave-ui` ships the local trace dashboard. Install only if you
  want it running locally:

  ```bash
  npm install -g @polymatx/weave-ui
  weave-ui --db ./weave.sqlite --port 4321
  ```

- Any provider SDK: `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/google`,
  `ollama-ai-provider`, etc. Weave doesn't care which one you use.
