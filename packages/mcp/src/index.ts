import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { tool, type Tool } from 'ai';
import { z, type ZodTypeAny } from 'zod';

export interface StdioServerSpec {
  type: 'stdio';
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface SseServerSpec {
  type: 'sse';
  url: string;
}

export type McpServerSpec = StdioServerSpec | SseServerSpec;

export interface McpServerHandle {
  name: string;
  client: Client;
  tools: Record<string, Tool>;
  close: () => Promise<void>;
}

export async function connectMcpServer(
  name: string,
  spec: McpServerSpec,
): Promise<McpServerHandle> {
  const client = new Client({ name: `weave-${name}`, version: '0.0.1' }, { capabilities: {} });

  const transport =
    spec.type === 'stdio'
      ? new StdioClientTransport({
          command: spec.command,
          args: spec.args ?? [],
          ...(spec.env !== undefined && { env: spec.env }),
        })
      : new SSEClientTransport(new URL(spec.url));

  await client.connect(transport);

  const list = await client.listTools();
  const tools: Record<string, Tool> = {};

  for (const t of list.tools) {
    tools[`${name}__${t.name}`] = tool({
      description: t.description ?? `MCP tool ${t.name} from ${name}`,
      inputSchema: jsonSchemaToZod(t.inputSchema as JsonSchema),
      execute: async (args: unknown) => {
        const result = await client.callTool({
          name: t.name,
          arguments: args as Record<string, unknown>,
        });
        return result.content;
      },
    });
  }

  return {
    name,
    client,
    tools,
    close: async () => {
      await client.close();
    },
  };
}

export async function connectMcpServers(
  specs: Record<string, McpServerSpec>,
): Promise<{
  tools: Record<string, Tool>;
  handles: McpServerHandle[];
  closeAll: () => Promise<void>;
}> {
  const handles = await Promise.all(
    Object.entries(specs).map(([name, spec]) => connectMcpServer(name, spec)),
  );
  const tools: Record<string, Tool> = {};
  for (const h of handles) Object.assign(tools, h.tools);
  return {
    tools,
    handles,
    closeAll: async () => {
      await Promise.all(handles.map((h) => h.close()));
    },
  };
}

interface JsonSchema {
  type?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: unknown[];
  description?: string;
}

function jsonSchemaToZod(schema: JsonSchema | undefined): ZodTypeAny {
  if (!schema) return z.object({}).passthrough();

  switch (schema.type) {
    case 'object': {
      const shape: Record<string, ZodTypeAny> = {};
      const required = new Set(schema.required ?? []);
      for (const [key, prop] of Object.entries(schema.properties ?? {})) {
        let zt = jsonSchemaToZod(prop);
        if (prop.description) zt = zt.describe(prop.description);
        if (!required.has(key)) zt = zt.optional();
        shape[key] = zt;
      }
      return z.object(shape).passthrough();
    }
    case 'array':
      return z.array(jsonSchemaToZod(schema.items));
    case 'string':
      return schema.enum ? z.enum(schema.enum as [string, ...string[]]) : z.string();
    case 'number':
    case 'integer':
      return z.number();
    case 'boolean':
      return z.boolean();
    default:
      return z.unknown();
  }
}
