import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { REGISTRY } from '../cli/registry.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'cli', 'index.js');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rends-cli-copy-'));

for (const [name, meta] of Object.entries(REGISTRY)) {
  const sourceDir = path.join(root, 'components', meta.layer, meta.dir);

  for (const file of meta.files) {
    const sourceFile = path.join(sourceDir, file);
    if (!fs.existsSync(sourceFile)) {
      throw new Error(`registry entry "${name}" declares missing file ${path.relative(root, sourceFile)}`);
    }
  }

  for (const dep of meta.deps || []) {
    const sourceDep = path.join(root, 'utils', dep);
    if (!fs.existsSync(sourceDep)) {
      throw new Error(`registry entry "${name}" declares missing dependency ${path.relative(root, sourceDep)}`);
    }
  }
}

function run(args) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd: tmp,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    throw new Error(`ren10 ${args.join(' ')} failed with exit ${result.status}`);
  }
}

run(['init']);
run(['add', 'dialog', 'popover', 'progress', 'scroll-area']);

const copiedModules = [
  path.join(tmp, 'rends', 'components', 'dialog', 'ren-dialog.js'),
  path.join(tmp, 'rends', 'components', 'popover', 'ren-popover.js'),
];

const copiedFiles = [
  path.join(tmp, 'rends', 'components', 'progress', 'ren-progress.css'),
  path.join(tmp, 'rends', 'components', 'scroll-area', 'ren-scroll-area.css'),
];

for (const filePath of copiedFiles) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`missing copied file ${filePath}`);
  }
}

for (const modulePath of copiedModules) {
  if (!fs.existsSync(modulePath)) {
    throw new Error(`missing copied module ${modulePath}`);
  }

  const source = fs.readFileSync(modulePath, 'utf8');
  const importSpecifiers = Array.from(source.matchAll(/from\s+['"](\.[^'"]+)['"]/g), (match) => match[1]);

  for (const specifier of importSpecifiers) {
    const resolved = path.resolve(path.dirname(modulePath), specifier);
    if (!fs.existsSync(resolved)) {
      throw new Error(`${path.relative(tmp, modulePath)} imports missing ${specifier}`);
    }
  }
}

console.log('RenDS CLI copy smoke: OK');
