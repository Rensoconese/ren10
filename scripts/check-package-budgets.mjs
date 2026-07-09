#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fail = []; const bytes = (p) => statSync(p).size;
const budgets = { unpacked: 20 * 1024 * 1024, tarball: 8 * 1024 * 1024, css: 900 * 1024, minCss: 500 * 1024, knowledge: 12 * 1024 * 1024 };
for (const file of ['ren10.css','ren10.min.css','ren10-foundation.css','ren10-foundation.min.css','ren10-components.css','ren10-components.min.css']) {
  const p = path.join(root, 'dist', file); if (!existsSync(p)) fail.push(`Missing bundle: dist/${file}`);
}
if (existsSync(path.join(root, 'dist/ren10.css')) && bytes(path.join(root, 'dist/ren10.css')) > budgets.css) fail.push('Full CSS bundle exceeds 900 KiB.');
if (existsSync(path.join(root, 'dist/ren10.min.css')) && bytes(path.join(root, 'dist/ren10.min.css')) > budgets.minCss) fail.push('Minified CSS bundle exceeds 500 KiB.');
for (const file of ['knowledge/ren10-graph.json','knowledge/ren10-graph.sqlite']) if (existsSync(path.join(root,file)) && bytes(path.join(root,file)) > budgets.knowledge) fail.push(`${file} exceeds 12 MiB.`);
try { const out = execFileSync('npm',['pack','--dry-run','--json'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}); const item=JSON.parse(out)[0]; if ((item.unpackedSize ?? 0)>budgets.unpacked) fail.push(`Package unpacked size exceeds ${budgets.unpacked} bytes.`); if ((item.size ?? 0)>budgets.tarball) fail.push(`Package tarball exceeds ${budgets.tarball} bytes.`); } catch (e) { fail.push(`npm pack failed: ${e.message}`); }
if (fail.length) { console.error(fail.join('\n')); process.exit(1); }
console.log('Package budgets: OK');
