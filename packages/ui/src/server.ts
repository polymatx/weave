import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { serve } from '@hono/node-server';
import { SqliteTracer } from '@polymatx/weave';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

export interface ServerOptions {
  dbPath: string;
  port: number;
  webDir?: string;
}

export function createServer(opts: ServerOptions): { start: () => void } {
  const tracer = new SqliteTracer(opts.dbPath);
  const app = new Hono();

  app.get('/api/health', (c) => c.json({ ok: true }));

  app.get('/api/runs', (c) => {
    const limit = Number(c.req.query('limit') ?? 50);
    return c.json(tracer.listRuns(limit));
  });

  app.get('/api/runs/:id', (c) => {
    const run = tracer.getRun(c.req.param('id'));
    if (!run) return c.json({ error: 'not found' }, 404);
    return c.json(run);
  });

  app.get('/api/runs/:id/events', (c) => {
    return c.json(tracer.getEvents(c.req.param('id')));
  });

  const webDir = opts.webDir ?? defaultWebDir();
  if (webDir && existsSync(webDir)) {
    app.use('/*', serveStatic({ root: webDir }));
    app.get('/*', serveStatic({ path: `${webDir}/index.html` }));
  }

  return {
    start() {
      serve({ fetch: app.fetch, port: opts.port }, (info) => {
        console.info(`weave-ui listening on http://localhost:${info.port}`);
        console.info(`  db: ${opts.dbPath}`);
      });
    },
  };
}

function defaultWebDir(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, 'web');
}
