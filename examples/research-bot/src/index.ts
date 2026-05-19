import { anthropic } from '@ai-sdk/anthropic';
import {
  agent,
  graph,
  END,
  SqliteCheckpointStore,
  SqliteTracer,
} from '@polymatx/weave';
import { connectMcpServers } from '@polymatx/weave-mcp';

interface State {
  topic: string;
  research: string;
  draft: string;
}

async function main() {
  const topic = process.argv.slice(2).join(' ') || 'modern agent orchestration patterns';

  const mcp = process.env.WEAVE_MCP_FETCH
    ? await connectMcpServers({
        fetch: { type: 'stdio', command: 'uvx', args: ['mcp-server-fetch'] },
      })
    : { tools: {}, handles: [], closeAll: async () => {} };

  const researcher = agent({
    name: 'researcher',
    model: anthropic('claude-sonnet-4-6'),
    system: 'You research topics and return concise factual notes with sources.',
    tools: mcp.tools,
    maxSteps: 5,
  });

  const writer = agent({
    name: 'writer',
    model: anthropic('claude-sonnet-4-6'),
    system: 'You write a tight 200-word brief from supplied research notes. No filler.',
  });

  const tracer = new SqliteTracer('./weave.sqlite');
  const checkpoints = new SqliteCheckpointStore('./weave.sqlite');

  const flow = graph<State>()
    .node('research', researcher.asNode<State>(
      (s) => `Research notes on: ${s.topic}`,
      (r) => ({ research: r.text }),
    ))
    .node('write', writer.asNode<State>(
      (s) => `Topic: ${s.topic}\n\nNotes:\n${s.research}\n\nWrite the brief.`,
      (r) => ({ draft: r.text }),
    ))
    .edge('research', 'write')
    .edge('write', END)
    .checkpoint(checkpoints)
    .compile();

  const result = await flow.run({
    initialState: { topic, research: '', draft: '' },
    budgetUsd: 0.5,
    onEvent: (e) => tracer.record(e),
  });

  console.info('\n=== BRIEF ===\n');
  console.info(result.state.draft);
  console.info(`\nrun: ${result.runId}  steps: ${result.steps}  ${result.durationMs}ms`);
  console.info('View trace UI: pnpm --filter @polymatx/weave-ui start');

  await mcp.closeAll();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
