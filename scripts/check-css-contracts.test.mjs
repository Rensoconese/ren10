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
  const lexicalComponentFile = join(fixtureRoot, 'components/demo/lexical.css');
  const lexicalRuntimeFile = join(fixtureRoot, 'components/demo/lexical.js');
  const runtimeReadFile = join(fixtureRoot, 'components/demo/runtime-read.js');
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
    lexicalComponentFile,
    `.lexical-demo {
  inline-size: var(--runtime-value);
  min-inline-size: var(--comment-line);
  max-inline-size: var(--comment-block);
  min-block-size: var(--string-code);
  max-block-size: var(--template-code);
}
`,
  );
  await writeFile(
    lexicalRuntimeFile,
    `// element.style.setProperty('--comment-line', '10px');
/* element.style.setProperty('--comment-block', '10px'); */
const fakeString = "element.style.setProperty('--string-code', '10px')";
const fakeTemplate = \`element.style.setProperty('--template-code', '10px')\`;
element.style.setProperty('--runtime-value', '10px');
`,
  );
  await writeFile(
    runtimeReadFile,
    `const delay = getComputedStyle(element).getPropertyValue('--ren-demo-bg');\n`,
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

  const lexicalResult = await analyzeCssContracts({
    packageRoot: fixtureRoot,
    cssFiles: [appearanceTokenFile, lexicalComponentFile],
    jsFiles: [lexicalRuntimeFile],
    contractFiles: [],
    appearanceTokenFile,
  });

  assert.deepEqual(lexicalResult.unresolved, [
    '--comment-block',
    '--comment-line',
    '--string-code',
    '--template-code',
  ]);

  const contractResult = await analyzeCssContracts({
    packageRoot: fixtureRoot,
    cssFiles: [appearanceTokenFile, componentFile],
    jsFiles: [runtimeFile],
    contractFiles: [contractFile],
    appearanceTokenFile,
  });

  assert.deepEqual(contractResult.contractAbsent, ['--ren-contract-missing']);

  const runtimeReadResult = await analyzeCssContracts({
    packageRoot: fixtureRoot,
    cssFiles: [appearanceTokenFile, componentFile],
    jsFiles: [runtimeReadFile],
    contractFiles: [],
    appearanceTokenFile,
  });
  assert.deepEqual(runtimeReadResult.unconsumed, []);
} finally {
  await rm(fixtureRoot, { recursive: true, force: true });
}

console.log('CSS contract validator fixture: OK');
