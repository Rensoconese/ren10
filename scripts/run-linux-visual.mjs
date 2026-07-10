#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

if (process.platform !== 'linux') {
  console.error('The authoritative visual baseline is Linux-only. Run npm test for the portable local suite.');
  process.exit(1);
}

const result = spawnSync(
  'npm',
  ['run', 'test:visual', '--', '--project=Desktop Light'],
  { stdio: 'inherit' }
);
process.exit(result.status ?? 1);
