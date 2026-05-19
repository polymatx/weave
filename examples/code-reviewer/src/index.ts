import { anthropic } from '@ai-sdk/anthropic';
import { agent, graph, END, SqliteTracer } from '@polymatx/weave';
import { execSync } from 'node:child_process';

interface State {
  diff: string;
  summary: string;
  review: string;
}

function captureDiff(ref: string): string {
  try {
    return execSync(`git diff ${ref}`, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 });
  } catch (e) {
    throw new Error(`git diff ${ref} failed: ${(e as Error).message}`);
  }
}

async function main() {
  const ref = process.argv[2] ?? 'HEAD~1';
  const diff = captureDiff(ref);

  if (!diff.trim()) {
    console.info(`No diff against ${ref}.`);
    return;
  }

  const summarizer = agent({
    name: 'summarizer',
    model: anthropic('claude-sonnet-4-6'),
    system: 'Summarize a git diff in 3 bullet points: what changed, why it might matter, blast radius.',
  });

  const reviewer = agent({
    name: 'reviewer',
    model: anthropic('claude-sonnet-4-6'),
    system:
      'You are a senior code reviewer. Given a diff and a summary, return: (1) bugs/risks, (2) security concerns, (3) suggested improvements. Be concise. Quote file:line when pointing at code.',
  });

  const tracer = new SqliteTracer('./weave.sqlite');

  const flow = graph<State>()
    .node(
      'summarize',
      summarizer.asNode<State>(
        (s) => `Diff (against ${ref}):\n\n${s.diff}`,
        (r) => ({ summary: r.text }),
      ),
    )
    .node(
      'review',
      reviewer.asNode<State>(
        (s) => `Diff:\n${s.diff}\n\nSummary:\n${s.summary}\n\nNow review.`,
        (r) => ({ review: r.text }),
      ),
    )
    .edge('summarize', 'review')
    .edge('review', END)
    .compile();

  const result = await flow.run({
    initialState: { diff, summary: '', review: '' },
    budgetUsd: 1.0,
    onEvent: (e) => tracer.record(e),
  });

  console.info('\n=== SUMMARY ===\n');
  console.info(result.state.summary);
  console.info('\n=== REVIEW ===\n');
  console.info(result.state.review);
  console.info(`\nrun: ${result.runId}  ${result.durationMs}ms`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
