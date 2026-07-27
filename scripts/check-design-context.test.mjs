import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { validateDesignContext, writeDesignContext } from './check-design-context.mjs';

const packageRoot = path.resolve(import.meta.dirname, '..');

test('design context validator distinguishes missing, current, and stale generated manifests', async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'ren10-design-check-'));
  try {
    for (const entry of ['package.json', 'ren-design.md']) await cp(path.join(packageRoot, entry), path.join(cwd, entry));
    for (const directory of ['tokens', 'base', 'components', 'cli']) {
      await cp(path.join(packageRoot, directory), path.join(cwd, directory), { recursive: true });
    }

    const missing = await validateDesignContext(cwd);
    assert.equal(missing.ok, false);
    assert.equal(missing.reason, 'missing');

    await writeDesignContext(cwd);
    const current = await validateDesignContext(cwd);
    assert.equal(current.ok, true);

    const file = path.join(cwd, '.ren10', 'design.json');
    const stale = JSON.parse(await readFile(file, 'utf8'));
    stale.system.version = '0.0.0';
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, `${JSON.stringify(stale, null, 2)}\n`);
    const drifted = await validateDesignContext(cwd);
    assert.equal(drifted.ok, false);
    assert.equal(drifted.reason, 'stale');
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});
