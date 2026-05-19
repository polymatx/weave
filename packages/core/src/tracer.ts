import Database from 'better-sqlite3';
import type { TraceEvent } from './types.js';

export interface RunSummary {
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

export class SqliteTracer {
  private readonly db: Database.Database;

  constructor(path: string) {
    this.db = new Database(path);
    this.db.pragma('journal_mode = WAL');
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS runs (
        run_id TEXT PRIMARY KEY,
        started_at INTEGER NOT NULL,
        ended_at INTEGER,
        duration_ms INTEGER,
        status TEXT NOT NULL,
        total_cost_usd REAL NOT NULL DEFAULT 0,
        total_tokens INTEGER NOT NULL DEFAULT 0,
        steps INTEGER NOT NULL DEFAULT 0,
        error_message TEXT,
        initial_state TEXT,
        final_state TEXT
      );
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        run_id TEXT NOT NULL,
        t INTEGER NOT NULL,
        type TEXT NOT NULL,
        node TEXT,
        payload TEXT NOT NULL,
        FOREIGN KEY (run_id) REFERENCES runs(run_id)
      );
      CREATE INDEX IF NOT EXISTS idx_events_run ON events(run_id, t);
    `);
  }

  record(event: TraceEvent): void {
    switch (event.type) {
      case 'run.start':
        this.db
          .prepare(
            `INSERT OR REPLACE INTO runs (run_id, started_at, status, initial_state)
             VALUES (?, ?, 'running', ?)`,
          )
          .run(event.runId, event.t, JSON.stringify(event.initialState));
        break;
      case 'run.end':
        this.db
          .prepare(
            `UPDATE runs SET ended_at = ?, duration_ms = ?, status = 'completed',
             final_state = ? WHERE run_id = ?`,
          )
          .run(event.t, event.durationMs, JSON.stringify(event.finalState), event.runId);
        break;
      case 'run.error':
        this.db
          .prepare(
            `UPDATE runs SET ended_at = ?, status = 'error', error_message = ? WHERE run_id = ?`,
          )
          .run(event.t, event.error, event.runId);
        break;
      case 'agent.call':
        this.db
          .prepare(
            `UPDATE runs SET total_cost_usd = total_cost_usd + ?,
             total_tokens = total_tokens + ? WHERE run_id = ?`,
          )
          .run(event.costUsd, event.usage.totalTokens, event.runId);
        break;
      case 'node.end':
        this.db
          .prepare(`UPDATE runs SET steps = steps + 1 WHERE run_id = ?`)
          .run(event.runId);
        break;
    }

    const node = 'node' in event ? event.node : null;
    this.db
      .prepare(`INSERT INTO events (run_id, t, type, node, payload) VALUES (?, ?, ?, ?, ?)`)
      .run(event.runId, event.t, event.type, node, JSON.stringify(event));
  }

  listRuns(limit = 50): RunSummary[] {
    const rows = this.db
      .prepare(
        `SELECT run_id, started_at, ended_at, duration_ms, status, total_cost_usd,
                total_tokens, steps, error_message
         FROM runs ORDER BY started_at DESC LIMIT ?`,
      )
      .all(limit) as Array<{
      run_id: string;
      started_at: number;
      ended_at: number | null;
      duration_ms: number | null;
      status: string;
      total_cost_usd: number;
      total_tokens: number;
      steps: number;
      error_message: string | null;
    }>;
    return rows.map((r) => ({
      runId: r.run_id,
      startedAt: r.started_at,
      endedAt: r.ended_at,
      durationMs: r.duration_ms,
      status: r.status as RunSummary['status'],
      totalCostUsd: r.total_cost_usd,
      totalTokens: r.total_tokens,
      steps: r.steps,
      errorMessage: r.error_message,
    }));
  }

  getRun(runId: string): RunSummary | null {
    const r = this.db
      .prepare(
        `SELECT run_id, started_at, ended_at, duration_ms, status, total_cost_usd,
                total_tokens, steps, error_message
         FROM runs WHERE run_id = ?`,
      )
      .get(runId) as
      | {
          run_id: string;
          started_at: number;
          ended_at: number | null;
          duration_ms: number | null;
          status: string;
          total_cost_usd: number;
          total_tokens: number;
          steps: number;
          error_message: string | null;
        }
      | undefined;
    if (!r) return null;
    return {
      runId: r.run_id,
      startedAt: r.started_at,
      endedAt: r.ended_at,
      durationMs: r.duration_ms,
      status: r.status as RunSummary['status'],
      totalCostUsd: r.total_cost_usd,
      totalTokens: r.total_tokens,
      steps: r.steps,
      errorMessage: r.error_message,
    };
  }

  getEvents(runId: string): TraceEvent[] {
    const rows = this.db
      .prepare(`SELECT payload FROM events WHERE run_id = ? ORDER BY t ASC, id ASC`)
      .all(runId) as Array<{ payload: string }>;
    return rows.map((r) => JSON.parse(r.payload) as TraceEvent);
  }

  close(): void {
    this.db.close();
  }
}
