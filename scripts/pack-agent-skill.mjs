#!/usr/bin/env node
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const outDir = path.join(root, 'dist');
const artifact = `rends-skill-${pkg.version}.tgz`;

mkdirSync(outDir, { recursive: true });
rmSync(path.join(outDir, artifact), { force: true });

const result = spawnSync('tar', ['-czf', path.join(outDir, artifact), '-C', path.join(root, 'skills'), 'rends'], {
  cwd: root,
  encoding: 'utf8',
});

if (result.status !== 0) {
  if (result.stdout) console.error(result.stdout);
  if (result.stderr) console.error(result.stderr);
  process.exit(result.status ?? 1);
}

console.log(`Packed ${path.relative(root, path.join(outDir, artifact))}`);
