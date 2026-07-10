#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { okfDefaultOutDir, writeOkfBundle } from '../cli/knowledge-okf.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = process.env.RENDS_OKF_OUT_DIR
  ? path.resolve(root, process.env.RENDS_OKF_OUT_DIR)
  : okfDefaultOutDir(root);

const result = writeOkfBundle({
  root,
  graphPath: path.join(root, 'knowledge', 'ren10-graph.json'),
  outDir,
  packageJsonPath: path.join(root, 'package.json'),
});

console.log(`RenDS OKF bundle: ${result.concepts} concepts`);
console.log(`OKF: ${path.relative(root, result.outDir).split(path.sep).join('/')}`);
