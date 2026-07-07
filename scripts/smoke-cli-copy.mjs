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

  return result.stdout;
}

run(['init', '--shape', 'sharp']);
const generatedIndex = fs.readFileSync(path.join(tmp, 'rends', 'index.css'), 'utf8');
if (!generatedIndex.includes("@import './themes/appearance.css';")) {
  throw new Error('init scaffold did not import themes/appearance.css');
}

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

const upgradeDryRun = run(['upgrade', 'dialog', '--force', '--dry-run']);
if (!upgradeDryRun.includes('already up to date')) {
  throw new Error('upgrade dry-run should not report changes for a freshly added JS component');
}

run(['upgrade', 'dialog', '--force']);

const dialogModule = path.join(tmp, 'rends', 'components', 'dialog', 'ren-dialog.js');
if (!fs.readFileSync(dialogModule, 'utf8').includes("from '../../utils/focus-trap.js'")) {
  throw new Error('upgrade rewrote dialog imports back to the package source layout');
}

run(['remove', 'dialog']);
if (fs.existsSync(path.join(tmp, 'rends', 'components', 'dialog'))) {
  throw new Error('remove should delete an unmodified freshly added JS component');
}

const componentIndex = fs.readFileSync(path.join(tmp, 'rends', 'components', 'index.css'), 'utf8');
if (componentIndex.includes("./dialog/")) {
  throw new Error('remove should delete the dialog @import from components/index.css');
}

console.log('RenDS CLI copy smoke: OK');
