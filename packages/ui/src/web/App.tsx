import { useEffect, useState } from 'react';

interface RunSummary {
  runId: string;
  startedAt: number;
  endedAt: number | null;
  durationMs: number | null;
  status: 'running' | 'completed' | 'error';
  totalCostUsd: number;
  totalTokens: number;
  steps: number;
  errorMessage: string | null;
}

interface TraceEvent {
  type: string;
  runId: string;
  t: number;
  node?: string;
  durationMs?: number;
  usage?: { totalTokens: number };
  costUsd?: number;
  tool?: string;
  error?: string;
  model?: string;
}

export function App() {
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [events, setEvents] = useState<TraceEvent[]>([]);

  useEffect(() => {
    const load = () => fetch('/api/runs').then((r) => r.json()).then(setRuns);
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetch(`/api/runs/${selected}/events`)
      .then((r) => r.json())
      .then(setEvents);
  }, [selected]);

  const activeRun = runs.find((r) => r.runId === selected);

  return (
    <div className="app">
      <aside className="sidebar">
        <header>
          <h1>
            weave <small>traces</small>
          </h1>
        </header>
        <ul className="run-list">
          {runs.map((r) => (
            <li
              key={r.runId}
              className={`run-item ${r.runId === selected ? 'active' : ''}`}
              onClick={() => setSelected(r.runId)}
            >
              <div className="row">
                <span className="run-id">{r.runId}</span>
                <span className={`status status-${r.status}`}>{r.status}</span>
              </div>
              <div className="run-meta">
                {r.steps} steps · {fmtMs(r.durationMs)} · {fmtUsd(r.totalCostUsd)} ·{' '}
                {r.totalTokens} tok
              </div>
            </li>
          ))}
          {runs.length === 0 && <div className="empty">No runs yet</div>}
        </ul>
      </aside>

      <main className="main">
        {activeRun ? (
          <>
            <h2>{activeRun.runId}</h2>
            <div className="subtitle">
              started {new Date(activeRun.startedAt).toLocaleString()}
              {activeRun.errorMessage && ` · error: ${activeRun.errorMessage}`}
            </div>

            <div className="stats">
              <div className="stat">
                <div className="label">Status</div>
                <div className="value">{activeRun.status}</div>
              </div>
              <div className="stat">
                <div className="label">Steps</div>
                <div className="value">{activeRun.steps}</div>
              </div>
              <div className="stat">
                <div className="label">Tokens</div>
                <div className="value">{activeRun.totalTokens.toLocaleString()}</div>
              </div>
              <div className="stat">
                <div className="label">Cost</div>
                <div className="value">{fmtUsd(activeRun.totalCostUsd)}</div>
              </div>
            </div>

            <div className="events">
              {events.map((e, i) => (
                <div key={i} className="event">
                  <span className="event-type">{e.type}</span>
                  <span className="event-node">{e.node ?? ''}</span>
                  <span className="event-detail">{eventDetail(e)}</span>
                  <span className="event-duration">{fmtMs(e.durationMs ?? null)}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty">Select a run to inspect</div>
        )}
      </main>
    </div>
  );
}

function fmtMs(ms: number | null): string {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function fmtUsd(v: number): string {
  return `$${v.toFixed(4)}`;
}

function eventDetail(e: TraceEvent): string {
  switch (e.type) {
    case 'agent.call':
      return `${e.model ?? ''} · ${e.usage?.totalTokens ?? 0} tok · ${fmtUsd(e.costUsd ?? 0)}`;
    case 'tool.call':
      return `tool=${e.tool}`;
    case 'run.error':
      return e.error ?? '';
    default:
      return '';
  }
}
