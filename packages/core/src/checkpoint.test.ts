import { describe, expect, it } from 'vitest';
import { SqliteCheckpointStore } from './checkpoint.js';

describe('SqliteCheckpointStore', () => {
  it('saves and loads latest checkpoint', () => {
    const store = new SqliteCheckpointStore(':memory:');
    store.save({ runId: 'r1', step: 0, state: { x: 1 }, nextNode: 'a' });
    store.save({ runId: 'r1', step: 1, state: { x: 2 }, nextNode: 'b' });
    store.save({ runId: 'r1', step: 2, state: { x: 3 }, nextNode: '__END__' });

    const latest = store.load('r1');
    expect(latest?.step).toBe(2);
    expect(latest?.state).toEqual({ x: 3 });
    expect(latest?.nextNode).toBe('__END__');

    expect(store.load('does-not-exist')).toBeNull();

    const all = store.list('r1');
    expect(all).toHaveLength(3);
    expect(all[0]?.step).toBe(0);
    store.close();
  });
});
