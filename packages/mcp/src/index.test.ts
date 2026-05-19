import { describe, expect, it } from 'vitest';
// Re-export the internal helper so we can unit-test it without a live server.
// We reach into the module via dynamic import + path to the source.
import type { ZodTypeAny } from 'zod';

// The schema converter is module-private; test it via a thin re-export below.
// For now we test the public surface: types compile and the connector function
// is exported. Live MCP integration is covered by the example app.

import { connectMcpServer, connectMcpServers } from './index.js';

describe('@polymatx/weave-mcp public surface', () => {
  it('exports connectMcpServer', () => {
    expect(typeof connectMcpServer).toBe('function');
  });
  it('exports connectMcpServers', () => {
    expect(typeof connectMcpServers).toBe('function');
  });
});

// Keep type-only import alive so eslint doesn't drop it (kept for future internal tests).
type _Keep = ZodTypeAny;
const _keep: _Keep | undefined = undefined;
void _keep;
