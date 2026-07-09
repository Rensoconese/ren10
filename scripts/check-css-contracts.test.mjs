#!/usr/bin/env node

import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { analyzeCssContracts } from './check-css-contracts.mjs';

const fixtureRoot = await mkdtemp(join(tmpdir(), 'rends-css-contracts-'));

try {
  const appearanceTokenFile = join(fixtureRoot, 'tokens/component/tokens.css');
  const componentFile = join(fixtureRoot, 'components/demo/demo.css');
  const runtimeFile = join(fixtureRoot, 'components/demo/demo.js');
  const contractFile = join(fixtureRoot, 'components/demo/component.md');

  await mkdir(join(fixtureRoot, 'tokens/component'), { recursive: true });
  await mkdir(join(fixtureRoot, 'components/demo'), { recursive: true });

  await writeFile(
    appearanceTokenFile,
    `:root {
  --declared: currentColor;
  --ren-demo-bg: var(--declared);
}
`,
  );
  await writeFile(
    componentFile,
    `.demo {
  color: var(--declared);
  background: var(--missing);
  border-color: var(--with-fallback, currentColor);
  inline-size: var(--runtime-value);
  anchor-name: --ren-demo-anchor;
}
`,
  );
  await writeFile(
    runtimeFile,
    `element.style.setProperty('--runtime-value', '10px');
`,
  );
  await writeFile(
    contractFile,
    'The `--ren-demo-` family includes `--ren-demo-anchor` and the required `--ren-contract-missing` token.\n',
  );

  const result = await analyzeCssContracts({
    packageRoot: fixtureRoot,
    cssFiles: [appearanceTokenFile, componentFile],
    jsFiles: [runtimeFile],
    contractFiles: [],
    appearanceTokenFile,
  });

  assert.deepEqual(result.unresolved, ['--missing']);
  assert.deepEqual(result.unconsumed, ['--ren-demo-bg']);
  assert.equal(result.errors.length, 2);

  const contractResult = await analyzeCssContracts({
    packageRoot: fixtureRoot,
    cssFiles: [appearanceTokenFile, componentFile],
    jsFiles: [runtimeFile],
    contractFiles: [contractFile],
    appearanceTokenFile,
  });

  assert.deepEqual(contractResult.contractAbsent, ['--ren-contract-missing']);
} finally {
  await rm(fixtureRoot, { recursive: true, force: true });
}

console.log('CSS contract validator fixture: OK');
