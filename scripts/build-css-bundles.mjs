#!/usr/bin/env node
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
const expand = async (file, seen = new Set()) => {
  const abs = path.resolve(file);
  if (!(await access(abs).then(() => true).catch(() => false))) return '';
  if (seen.has(abs)) return '';
  seen.add(abs);
  const source = await readFile(abs, 'utf8');
  let result = '';
  for (const match of source.matchAll(/@import\s+['"]([^'"]+\.css)['"]\s*(?:layer\([^)]*\))?\s*;/g)) {
    result += await expand(path.resolve(path.dirname(abs), match[1]), seen);
  }
  return result + source.replace(/@import\s+['"]([^'"]+\.css)['"]\s*(?:layer\([^)]*\))?\s*;/g, '');
};
const minify = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,>])\s*/g, '$1').trim() + '\n';
const write = async (name, css) => { await writeFile(path.join(out, name), css); await writeFile(path.join(out, name.replace('.css', '.min.css')), minify(css)); };
await mkdir(out, { recursive: true });
await write('ren10.css', await expand(path.join(root, 'index.css')));
await write('ren10-foundation.css', await expand(path.join(root, 'tokens/index.css')) + await expand(path.join(root, 'base/index.css')));
await write('ren10-components.css', await expand(path.join(root, 'components/index.css')));
console.log('RenDS CSS bundles built (deterministic import closure).');
