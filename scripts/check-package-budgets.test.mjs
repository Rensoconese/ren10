import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {
  evaluateBudgetMetrics,
  measureCliRssBytes,
  measureRequestCount,
} from './check-package-budgets.mjs';
const root = path.resolve(import.meta.dirname, '..');
const digest = (file) => crypto.createHash('sha256').update(readFileSync(path.join(root, 'dist', file))).digest('hex');
execFileSync('node', ['scripts/build-css-bundles.mjs'], { cwd: root, stdio: 'ignore' });
const before = ['ren10.css','ren10.min.css','ren10-foundation.css','ren10-foundation.min.css','ren10-components.css','ren10-components.min.css'].map(digest);
execFileSync('node', ['scripts/build-css-bundles.mjs'], { cwd: root, stdio: 'ignore' });
const after = ['ren10.css','ren10.min.css','ren10-foundation.css','ren10-foundation.min.css','ren10-components.css','ren10-components.min.css'].map(digest);
if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('CSS bundle build is not deterministic');

const fixturePolicy = {
  metrics: {
    unpackedBytes: { baseline: 100, allowedDelta: 0, target: 100 },
    requestCount: { baseline: 5, allowedDelta: -3, target: 2 },
    cliRssBytes: { baseline: 1000, allowedDelta: 50, target: 1050 },
  },
};
const diagnostics = evaluateBudgetMetrics(
  { unpackedBytes: 101, requestCount: 3, cliRssBytes: 1051 },
  fixturePolicy
);
for (const metric of ['unpackedBytes', 'requestCount', 'cliRssBytes']) {
  if (!diagnostics.some((message) => message.startsWith(`${metric}:`))) {
    throw new Error(`budget fixture did not diagnose ${metric}`);
  }
}
if (measureRequestCount() !== 1) throw new Error('bundled CSS request count must be measured as one');
const measuredRss = measureCliRssBytes();
if (!Number.isFinite(measuredRss) || measuredRss <= 0) {
  throw new Error('CLI RSS must be measured portably as positive bytes');
}
console.log('Bundle determinism: OK');
