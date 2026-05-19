#!/usr/bin/env node
import { createServer } from './server.js';

function parseArgs(argv: string[]): { db: string; port: number } {
  let db = './weave.sqlite';
  let port = 4321;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--db' && argv[i + 1]) db = argv[++i]!;
    else if (a === '--port' && argv[i + 1]) port = Number(argv[++i]!);
    else if (a === '-h' || a === '--help') {
      console.info('Usage: weave-ui [--db ./weave.sqlite] [--port 4321]');
      process.exit(0);
    }
  }
  return { db, port };
}

const { db, port } = parseArgs(process.argv.slice(2));
createServer({ dbPath: db, port }).start();
