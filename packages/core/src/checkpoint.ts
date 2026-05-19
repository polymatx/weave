import Database from 'better-sqlite3';

export interface Checkpoint {
  runId: string;
  step: number;
  state: unknown;
  nextNode: string;
}

export interface CheckpointStore {
  save(cp: Checkpoint): Promise<void> | void;
  load(runId: string): Promise<Checkpoint | null> | Checkpoint | null;
  list(runId: string): Promise<Checkpoint[]> | Checkpoint[];
}

export class SqliteCheckpointStore implements CheckpointStore {
  private readonly db: Database.Database;

  constructor(path: string) {
    this.db = new Database(path);
    this.db.pragma('journal_mode = WAL');
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS checkpoints (
        run_id TEXT NOT NULL,
        step INTEGER NOT NULL,
        state TEXT NOT NULL,
        next_node TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        PRIMARY KEY (run_id, step)
      );
      CREATE INDEX IF NOT EXISTS idx_checkpoints_run ON checkpoints(run_id, step DESC);
    `);
  }

  save(cp: Checkpoint): void {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO checkpoints (run_id, step, state, next_node, created_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(cp.runId, cp.step, JSON.stringify(cp.state), cp.nextNode, Date.now());
  }

  load(runId: string): Checkpoint | null {
    const row = this.db
      .prepare(
        `SELECT run_id, step, state, next_node FROM checkpoints
         WHERE run_id = ? ORDER BY step DESC LIMIT 1`,
      )
      .get(runId) as
      | { run_id: string; step: number; state: string; next_node: string }
      | undefined;
    if (!row) return null;
    return {
      runId: row.run_id,
      step: row.step,
      state: JSON.parse(row.state),
      nextNode: row.next_node,
    };
  }

  list(runId: string): Checkpoint[] {
    const rows = this.db
      .prepare(
        `SELECT run_id, step, state, next_node FROM checkpoints
         WHERE run_id = ? ORDER BY step ASC`,
      )
      .all(runId) as Array<{ run_id: string; step: number; state: string; next_node: string }>;
    return rows.map((r) => ({
      runId: r.run_id,
      step: r.step,
      state: JSON.parse(r.state),
      nextNode: r.next_node,
    }));
  }

  close(): void {
    this.db.close();
  }
}
