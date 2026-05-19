# @polymatx/weave-mcp

MCP client integration for `weave`.

```ts
import { connectMcpServers } from '@polymatx/weave-mcp';

const mcp = await connectMcpServers({
  fetch: { type: 'stdio', command: 'uvx', args: ['mcp-server-fetch'] },
});

agent({ model, tools: mcp.tools });
```

See [repository README](https://github.com/polymatx/weave) for full docs.
