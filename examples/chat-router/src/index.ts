import { anthropic } from '@ai-sdk/anthropic';
import { agent, graph, END, SqliteTracer } from '@polymatx/weave';

type Intent = 'billing' | 'support' | 'sales' | 'unknown';

interface State {
  message: string;
  intent: Intent;
  reply: string;
}

function classifyText(raw: string): Intent {
  const lower = raw.toLowerCase();
  if (/\b(bill|invoice|refund|charge|payment|subscription)\b/.test(lower)) return 'billing';
  if (/\b(broken|error|bug|crash|not working|down|issue)\b/.test(lower)) return 'support';
  if (/\b(buy|pricing|plan|upgrade|enterprise|demo)\b/.test(lower)) return 'sales';
  return 'unknown';
}

async function main() {
  const message = process.argv.slice(2).join(' ') || 'My invoice last month looks wrong';

  const classifier = agent({
    name: 'classifier',
    model: anthropic('claude-haiku-4-5'),
    system:
      'Classify a user message into exactly one of: billing, support, sales, unknown. Reply with ONLY the single word — no other text.',
  });

  const billing = agent({
    name: 'billing',
    model: anthropic('claude-sonnet-4-6'),
    system: 'You handle billing inquiries. Be precise. Ask for invoice ID if needed.',
  });

  const support = agent({
    name: 'support',
    model: anthropic('claude-sonnet-4-6'),
    system: 'You handle technical support. Ask for repro steps if unclear.',
  });

  const sales = agent({
    name: 'sales',
    model: anthropic('claude-sonnet-4-6'),
    system: 'You handle sales. Be helpful, recommend plans, no hard-sell.',
  });

  const tracer = new SqliteTracer('./weave.sqlite');

  const flow = graph<State>()
    .node(
      'classify',
      classifier.asNode<State>(
        (s) => s.message,
        (r) => {
          const cleaned = r.text.trim().toLowerCase();
          const allowed = ['billing', 'support', 'sales'] as const;
          const intent: Intent =
            (allowed as readonly string[]).includes(cleaned)
              ? (cleaned as Intent)
              : classifyText(r.text);
          return { intent };
        },
      ),
    )
    .node(
      'billing',
      billing.asNode<State>(
        (s) => s.message,
        (r) => ({ reply: r.text }),
      ),
    )
    .node(
      'support',
      support.asNode<State>(
        (s) => s.message,
        (r) => ({ reply: r.text }),
      ),
    )
    .node(
      'sales',
      sales.asNode<State>(
        (s) => s.message,
        (r) => ({ reply: r.text }),
      ),
    )
    .node('fallback', (s) => ({
      reply: `Sorry, I couldn't determine how to help with: "${s.message}". Could you rephrase?`,
    }))
    .edge('classify', (s) => {
      switch (s.intent) {
        case 'billing':
          return 'billing';
        case 'support':
          return 'support';
        case 'sales':
          return 'sales';
        default:
          return 'fallback';
      }
    })
    .edge('billing', END)
    .edge('support', END)
    .edge('sales', END)
    .edge('fallback', END)
    .compile();

  const result = await flow.run({
    initialState: { message, intent: 'unknown', reply: '' },
    budgetUsd: 0.5,
    onEvent: (e) => tracer.record(e),
  });

  console.info(`\n=== INTENT: ${result.state.intent} ===\n`);
  console.info(result.state.reply);
  console.info(`\nrun: ${result.runId}  ${result.durationMs}ms`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
