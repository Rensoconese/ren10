import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'cli', 'index.js');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rends-cli-copy-'));

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
run(['add', 'dialog', 'popover']);

const copiedModules = [
  path.join(tmp, 'rends', 'components', 'dialog', 'ren-dialog.js'),
  path.join(tmp, 'rends', 'components', 'popover', 'ren-popover.js'),
];

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
