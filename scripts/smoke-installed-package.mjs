import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ren10-installed-'));
const pack = spawnSync('npm', ['pack', '--silent', '--pack-destination', tmp], { cwd: root, encoding: 'utf8' });
if (pack.status !== 0) throw new Error(pack.stderr);
const tgz = path.join(tmp, pack.stdout.trim().split(/\s+/).pop());
const consumer = path.join(tmp, 'consumer'); fs.mkdirSync(consumer);
for (const args of [['init', '-y'], ['install', tgz]]) {
  const result = spawnSync('npm', args, { cwd: consumer, encoding: 'utf8', stdio: 'pipe' });
  if (result.status !== 0) throw new Error(`${args.join(' ')} failed: ${result.stderr}`);
}
const cli = path.join(consumer, 'node_modules', 'ren10', 'cli', 'index.js');
const run = (args) => { const result = spawnSync(process.execPath, [cli, ...args], { cwd: consumer, encoding: 'utf8' }); if (result.status !== 0) throw new Error(result.stderr); return result.stdout; };
run(['init']);
run(['add', 'sheet', 'date-picker', 'date-range-picker', 'context-menu']);
run(['agent-docs', '--agent', 'codex']);
const docs = fs.readFileSync(path.join(consumer, 'AGENTS.md'), 'utf8');
if (!docs.includes('<!-- RENDS:START -->')) throw new Error('agent docs were not written to consumer cwd');
if (fs.existsSync(path.join(consumer, 'node_modules', 'ren10', 'AGENTS.md')) && fs.readFileSync(path.join(consumer, 'node_modules', 'ren10', 'AGENTS.md'), 'utf8').includes('Rends')) throw new Error('package AGENTS.md was mutated');
console.log('Installed package smoke: OK');
