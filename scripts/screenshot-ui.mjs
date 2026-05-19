#!/usr/bin/env node
/**
 * Capture the trace UI as docs/assets/ui.png.
 *
 * Prereqs (one-time):
 *   pnpm dlx playwright install chromium
 *   pnpm add -w playwright
 *
 * Usage:
 *   1. Start the UI in another terminal:
 *        node packages/ui/dist/cli.js --db /tmp/weave-demo.sqlite --port 4321
 *   2. Run this script:
 *        node scripts/screenshot-ui.mjs
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const URL = process.env.WEAVE_UI_URL ?? 'http://localhost:4321';
const OUT = 'docs/assets/ui.png';

await mkdir(dirname(OUT), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto(URL, { waitUntil: 'networkidle' });

// Click the first completed run to populate the right pane.
await page.waitForSelector('.run-item');
const items = await page.$$('.run-item');
if (items[1]) await items[1].click();
await page.waitForSelector('.event', { timeout: 5000 }).catch(() => {});

await page.screenshot({ path: OUT, fullPage: false });
await browser.close();

console.log(`saved ${OUT}`);
