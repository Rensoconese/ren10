import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { afterEach, test } from 'node:test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { buildStateUrl, validateRenderMatrix } from './capture-block-matrix.mjs';

const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);
const CLI = 'scripts/capture-block-matrix.mjs';

const roots = [];
afterEach(async () => Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))));

const matrix = {
  version: 1,
  path: '/templates/blocks/nav-mega-menu.html',
  root: '[data-rbm-root]',
  states: [{
    id: 'desktop-light-open',
    viewport: { width: 1280, height: 1024 },
    theme: 'light',
    javaScript: true,
    reducedMotion: false,
    actions: [{ type: 'click', selector: '.rbm-disclosure > summary' }],
  }],
};

function cloneMatrix(overrides = {}) {
  return {
    ...matrix,
    ...overrides,
    states: overrides.states ?? matrix.states.map((state) => ({
      ...state,
      viewport: { ...state.viewport },
      actions: state.actions.map((action) => ({ ...action })),
    })),
  };
}

test('validateRenderMatrix accepts a complete state', () => {
  assert.deepEqual(validateRenderMatrix(matrix), []);
});

test('validateRenderMatrix rejects duplicate state ids', () => {
  const duplicate = { ...matrix, states: [matrix.states[0], matrix.states[0]] };
  assert.deepEqual(validateRenderMatrix(duplicate), ['Duplicate render state id: desktop-light-open']);
});

test('buildStateUrl always includes a unique workflow cache key', () => {
  assert.equal(
    buildStateUrl('http://127.0.0.1:8000', matrix.path, 'navbar5-desktop-light-open'),
    'http://127.0.0.1:8000/templates/blocks/nav-mega-menu.html?ren10_capture=navbar5-desktop-light-open',
  );
});

test('validateRenderMatrix rejects invalid version, path, root, theme, and viewport', () => {
  const broken = cloneMatrix({
    version: 2,
    path: 'templates/blocks/nav-mega-menu.html',
    root: '',
    states: [{
      id: 'bad-state',
      viewport: { width: 0, height: 1024 },
      theme: 'system',
      actions: [],
    }],
  });
  assert.deepEqual(validateRenderMatrix(broken), [
    'Render matrix path must start with /',
    'Render matrix root selector is required',
    'Render matrix version must equal 1',
    'State bad-state has invalid theme',
    'State bad-state requires viewport width and height',
  ]);
});

test('validateRenderMatrix rejects unsafe page paths', () => {
  for (const path of [
    '/../secret.html',
    '/templates/../../etc/passwd',
    '/templates/blocks/nav-mega-menu.html?x=1',
    '/templates/blocks/nav-mega-menu.html#frag',
    '//evil.example/x',
    '/templates/blocks/\0evil.html',
  ]) {
    const errors = validateRenderMatrix(cloneMatrix({ path }));
    assert.ok(
      errors.some((error) => error.includes('unsafe page path') || error.includes('path must start with /')),
      `expected unsafe path rejection for ${JSON.stringify(path)}, got ${JSON.stringify(errors)}`,
    );
  }
});

test('validateRenderMatrix rejects malformed actions, selectors, and keys', () => {
  const cases = [
    {
      actions: [{ type: 'hover', selector: '.x' }],
      needle: 'unsupported action type',
    },
    {
      actions: [{ type: 'click' }],
      needle: 'requires a selector',
    },
    {
      actions: [{ type: 'focus', selector: '  ' }],
      needle: 'malformed selector',
    },
    {
      actions: [{ type: 'press', key: '' }],
      needle: 'requires a key',
    },
    {
      actions: [{ type: 'press', selector: '.x\ny', key: 'Escape' }],
      needle: 'malformed selector',
    },
    {
      actions: 'click',
      needle: 'actions must be an array',
    },
  ];

  for (const { actions, needle } of cases) {
    const candidate = cloneMatrix({
      states: [{
        ...matrix.states[0],
        id: 'action-check',
        actions,
      }],
    });
    const errors = validateRenderMatrix(candidate);
    assert.ok(
      errors.some((error) => error.toLowerCase().includes(needle.toLowerCase())),
      `expected error containing ${JSON.stringify(needle)} for ${JSON.stringify(actions)}, got ${JSON.stringify(errors)}`,
    );
  }
});

test('validateRenderMatrix rejects malformed expectedMarkers', () => {
  const candidate = cloneMatrix({
    states: [{
      ...matrix.states[0],
      id: 'markers',
      expectedMarkers: {
        '.rbm-chevron': -1,
        '': 1,
      },
    }],
  });
  const errors = validateRenderMatrix(candidate);
  assert.ok(errors.some((error) => error.includes('expectedMarkers')));
});

test('static server rejects encoded traversal and ignores query-string paths', async () => {
  const { startStaticServer } = require('../tests/utils/static-server.cjs');
  const root = await mkdtemp(join(tmpdir(), 'ren10-static-'));
  roots.push(root);
  await writeFile(join(root, 'ok.html'), '<!doctype html><title>ok</title>\n');

  const server = await startStaticServer(root);
  try {
    // Percent-encoded ".." survives URL parsing and must be rejected after decode.
    const encodedTraversal = await fetch(`${server.origin}/%2e%2e%2f%2e%2e%2fetc%2fpasswd`);
    assert.equal(encodedTraversal.status, 403);

    // Literal ".." is normalized by the URL parser into an in-root path → not found,
    // never a successful read outside the server root.
    const literalTraversal = await fetch(`${server.origin}/../../etc/passwd`);
    assert.equal([403, 404].includes(literalTraversal.status), true);

    // Query strings must not affect path resolution or bypass the root jail.
    const withQuery = await fetch(`${server.origin}/ok.html?path=../../etc/passwd`);
    assert.equal(withQuery.status, 200);
    assert.equal(withQuery.headers.get('cache-control'), 'no-store');
    assert.match(await withQuery.text(), /ok/);

    const missing = await fetch(`${server.origin}/missing.html`);
    assert.equal(missing.status, 404);
  } finally {
    await server.close();
  }
});

test('capture CLI requires matrix path, --module, and --output', async () => {
  async function run(args) {
    try {
      await execFileAsync(process.execPath, [CLI, ...args], { cwd: process.cwd() });
      return { code: 0, stderr: '' };
    } catch (error) {
      return {
        code: error.code ?? 1,
        stderr: String(error.stderr || error.message || ''),
      };
    }
  }

  const missingFlags = await run(['/tmp/does-not-matter.json']);
  assert.notEqual(missingFlags.code, 0);
  assert.match(missingFlags.stderr, /--module|--output|Usage/i);

  const missingModule = await run([
    'docs/workflows/relume-to-ren10/modules/navbar5/render-matrix.json',
    '--output',
    '.ren10-workflow/captures',
  ]);
  assert.notEqual(missingModule.code, 0);
  assert.match(missingModule.stderr, /--module/);

  const missingOutput = await run([
    'docs/workflows/relume-to-ren10/modules/navbar5/render-matrix.json',
    '--module',
    'navbar5',
  ]);
  assert.notEqual(missingOutput.code, 0);
  assert.match(missingOutput.stderr, /--output/);

  const missingMatrix = await run([
    'docs/workflows/relume-to-ren10/modules/navbar5/render-matrix.json',
    '--module',
    'navbar5',
    '--output',
    '.ren10-workflow/captures',
  ]);
  assert.notEqual(missingMatrix.code, 0);
  assert.match(missingMatrix.stderr, /ENOENT|no such file|not found/i);
});

test('captureMatrix validates before launching the browser', async () => {
  const { captureMatrix } = await import('./capture-block-matrix.mjs');
  const root = await mkdtemp(join(tmpdir(), 'ren10-capture-'));
  roots.push(root);
  const matrixPath = join(root, 'render-matrix.json');
  await writeFile(
    matrixPath,
    `${JSON.stringify(cloneMatrix({
      states: [{
        ...matrix.states[0],
        id: 'bad-actions',
        actions: [{ type: 'dblclick', selector: '.x' }],
      }],
    }), null, 2)}\n`,
  );

  await assert.rejects(
    () => captureMatrix({
      matrixPath,
      moduleId: 'navbar5',
      repoRoot: process.cwd(),
      outputRoot: join(root, 'out'),
    }),
    /unsupported action type|dblclick/i,
  );
});

test('validateRenderMatrix requires a non-empty states array', () => {
  const base = {
    version: 1,
    path: matrix.path,
    root: matrix.root,
  };

  for (const [label, states] of [
    ['missing', undefined],
    ['null', null],
    ['object', {}],
    ['empty', []],
  ]) {
    const candidate = { ...base };
    if (label !== 'missing') candidate.states = states;
    const errors = validateRenderMatrix(candidate);
    assert.ok(
      errors.some((error) => /states/i.test(error) && /non-empty|array|required|empty/i.test(error)),
      `${label} states must error, got ${JSON.stringify(errors)}`,
    );
  }
});

test('validateRenderMatrix rejects unsafe state ids', () => {
  for (const id of ['../escape', '..', '.', '/abs', 'a/b', 'a\\b', 'C:\\\\win', '']) {
    const errors = validateRenderMatrix(cloneMatrix({
      states: [{ ...matrix.states[0], id }],
    }));
    assert.ok(
      errors.some((error) =>
        /unsafe|invalid|path|segment|id/i.test(error)),
      `expected unsafe state id rejection for ${JSON.stringify(id)}, got ${JSON.stringify(errors)}`,
    );
  }
});

test('captureMatrix rejects unsafe moduleId and state ids before browser launch', async () => {
  const { captureMatrix } = await import('./capture-block-matrix.mjs');
  const root = await mkdtemp(join(tmpdir(), 'ren10-capture-path-'));
  roots.push(root);
  const goodMatrixPath = join(root, 'good-matrix.json');
  const badStateMatrixPath = join(root, 'bad-state-matrix.json');
  await writeFile(goodMatrixPath, `${JSON.stringify(matrix, null, 2)}\n`);
  await writeFile(
    badStateMatrixPath,
    `${JSON.stringify(cloneMatrix({
      states: [{ ...matrix.states[0], id: '../escape' }],
    }), null, 2)}\n`,
  );

  const cases = [
    {
      label: 'module traversal',
      options: {
        matrixPath: goodMatrixPath,
        moduleId: '../evil',
        repoRoot: process.cwd(),
        outputRoot: join(root, 'out'),
      },
      needle: /module|path|segment|unsafe|traversal|\.\./i,
    },
    {
      label: 'module absolute',
      options: {
        matrixPath: goodMatrixPath,
        moduleId: '/tmp/evil',
        repoRoot: process.cwd(),
        outputRoot: join(root, 'out'),
      },
      needle: /module|path|segment|unsafe|absolute/i,
    },
    {
      label: 'module separator',
      options: {
        matrixPath: goodMatrixPath,
        moduleId: 'a/b',
        repoRoot: process.cwd(),
        outputRoot: join(root, 'out'),
      },
      needle: /module|path|segment|unsafe|separator|slash/i,
    },
    {
      label: 'state traversal',
      options: {
        matrixPath: badStateMatrixPath,
        moduleId: 'navbar5',
        repoRoot: process.cwd(),
        outputRoot: join(root, 'out'),
      },
      needle: /state|path|segment|unsafe|id|\.\./i,
    },
  ];

  for (const { label, options, needle } of cases) {
    await assert.rejects(
      () => captureMatrix(options),
      needle,
      `expected pre-browser rejection for ${label}`,
    );
  }
});

test('static server rejects symlink escape outside root', async () => {
  const { startStaticServer } = require('../tests/utils/static-server.cjs');
  const { symlink, mkdir } = await import('node:fs/promises');
  const root = await mkdtemp(join(tmpdir(), 'ren10-static-symlink-'));
  const outside = await mkdtemp(join(tmpdir(), 'ren10-static-outside-'));
  roots.push(root, outside);

  await writeFile(join(outside, 'secret.txt'), 'top-secret\n');
  await writeFile(join(root, 'ok.html'), '<!doctype html><title>ok</title>\n');
  await symlink(outside, join(root, 'escape-dir'));
  await symlink(join(outside, 'secret.txt'), join(root, 'escape-file.txt'));

  const nested = join(root, 'nested');
  await mkdir(nested);
  await symlink(join(outside, 'secret.txt'), join(nested, 'via-nested.txt'));

  const server = await startStaticServer(root);
  try {
    const fileEscape = await fetch(`${server.origin}/escape-file.txt`);
    assert.equal(fileEscape.status, 403, 'symlinked file outside root must be 403');

    const dirEscape = await fetch(`${server.origin}/escape-dir/secret.txt`);
    assert.equal(dirEscape.status, 403, 'path through symlinked directory outside root must be 403');

    const nestedEscape = await fetch(`${server.origin}/nested/via-nested.txt`);
    assert.equal(nestedEscape.status, 403, 'nested symlink outside root must be 403');

    const missing = await fetch(`${server.origin}/missing.html`);
    assert.equal(missing.status, 404);

    const ok = await fetch(`${server.origin}/ok.html`);
    assert.equal(ok.status, 200);
    assert.equal(ok.headers.get('cache-control'), 'no-store');
    assert.match(await ok.text(), /ok/);
  } finally {
    await server.close();
  }
});

test('settleWithCleanup preserves primary errors and surfaces cleanup failures', async () => {
  const { settleWithCleanup } = await import('./capture-block-matrix.mjs');

  const primary = new Error('primary boom');
  const cleanupA = new Error('cleanup A');
  const cleanupB = new Error('cleanup B');

  await assert.rejects(
    () => settleWithCleanup(primary, [
      async () => { throw cleanupA; },
      async () => { throw cleanupB; },
    ]),
    (error) => {
      assert.equal(error, primary);
      assert.ok(Array.isArray(error.cleanupErrors));
      assert.equal(error.cleanupErrors.length, 2);
      return true;
    },
  );

  await assert.rejects(
    () => settleWithCleanup(undefined, [
      async () => { throw cleanupA; },
    ]),
    (error) => {
      assert.match(String(error.message || error), /cleanup/i);
      return true;
    },
  );

  await settleWithCleanup(undefined, [async () => {}]);
});
