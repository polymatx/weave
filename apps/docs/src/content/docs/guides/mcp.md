---
title: MCP tools
description: Use any MCP server as a tool source for your agents.
---

```ts
import { connectMcpServers } from '@polymatx/weave-mcp';

const mcp = await connectMcpServers({
  fetch: { type: 'stdio', command: 'uvx', args: ['mcp-server-fetch'] },
  github: { type: 'stdio', command: 'npx', args: ['-y', '@modelcontextprotocol/server-github'] },
});

const researcher = agent({
  model: anthropic('claude-sonnet-4-6'),
  tools: mcp.tools,
});
```

Each MCP tool is namespaced under its server name (e.g. `fetch__fetch_url`)
so collisions are impossible.

### Transports

- `{ type: 'stdio', command, args, env? }` — spawn a local MCP server process.
- `{ type: 'sse', url }` — connect to a remote MCP server over Server-Sent Events.

### Cleanup

When the graph finishes, close the MCP connections:

```ts
await mcp.closeAll();
```

For long-running services, you typically connect once at startup and reuse the
handles across many graph runs.
