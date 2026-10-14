import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parseModule, generateCode } from 'magicast';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const magicastRoot = path.dirname(require.resolve('magicast/package.json'));
const bundlePath = path.join(magicastRoot, 'dist/builders-pgs2P7Vh.js');

test('Magicast uses the patched external source-map implementation, with no embedded copy', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(magicastRoot, 'package.json'), 'utf8'));
  assert.equal(manifest.version, '0.5.4');
  assert.equal(manifest.ren10Patch?.revision, 1);
  assert.equal(manifest.dependencies['source-map-js'], '^1.2.2');
  assert.equal(manifest.inlinedDependencies['source-map-js'], undefined);
  const source = fs.readFileSync(bundlePath, 'utf8');
  assert.match(source, /import sourceMap from "source-map-js"/);
  assert.doesNotMatch(source, /source-map-js@1\.2\.1|require_source_map_consumer|require_source_node/);
});

test('the implementation used by Magicast bounds indexed maps and rejects invalid offsets', () => {
  // Expose the actual private bridge in a disposable module; do not substitute a
  // direct source-map import, which would miss a stale embedded implementation.
  const directory = fs.mkdtempSync(path.join(magicastRoot, 'dist/security-probe-'));
  try {
    const probe = path.join(directory, 'probe.mjs');
    fs.writeFileSync(probe, fs.readFileSync(bundlePath, 'utf8') + '\nexport { import_source_map as securitySourceMap };\n');
    const script = `
      import assert from 'node:assert/strict';
      const { securitySourceMap: sm } = await import(${JSON.stringify(pathToFileURL(probe).href)});
      const basic = { version: 3, sources: ['input.js'], names: [], mappings: 'AAAA', sourcesContent: ['x'] };
      const indexed = line => ({ version: 3, sections: [{ offset: { line, column: 0 }, map: basic }] });
      // Large, valid integer offsets used to force a synchronous billion-line
      // loop even after the generated code was exhausted. Runs in a timed child.
      assert.throws(() => new sm.SourceMapConsumer(indexed(1e9)));
      // Within the consumer's offset limit, SourceNode must still stop when the
      // generated code ends rather than loop through one million absent lines.
      const large = new sm.SourceMapConsumer(indexed(1e6));
      assert.equal(sm.SourceNode.fromStringWithSourceMap('x', large).toString(), 'x');
      for (const line of [-1, 0.5, Infinity, '1']) {
        assert.throws(() => new sm.SourceMapConsumer(indexed(line)));
      }
      const normal = new sm.SourceMapConsumer(basic);
      assert.equal(sm.SourceNode.fromStringWithSourceMap('x', normal).toString(), 'x');
      const nested = { version: 3, sections: [{ offset: { line: 9007199254740991, column: 0 }, map: indexed(1) }] };
      assert.throws(() => new sm.SourceMapConsumer(nested));
      const cumulative = { version: 3, sections: [{ offset: { line: 9999999, column: 0 }, map: indexed(2) }] };
      assert.throws(() => new sm.SourceMapConsumer(cumulative));
      const encoded = new sm.SourceMapConsumer(JSON.stringify(basic));
      assert.equal(sm.SourceNode.fromStringWithSourceMap('x', encoded).toString(), 'x');
    `;
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], { encoding: 'utf8', timeout: 5000 });
    assert.equal(result.error, undefined, result.error?.message);
    assert.equal(result.status, 0, result.stderr);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('Magicast still edits config and produces useful source maps', () => {
  const mod = parseModule('export default { integrations: [], enabled: true };', { sourceFileName: 'astro.config.mjs' });
  mod.exports.default.enabled = false;
  const result = generateCode(mod, { sourceMapName: 'astro.config.mjs.map' });
  assert.match(result.code, /enabled: false/);
  assert.equal(result.map.version, 3);
  assert.ok(result.map.sources.includes('astro.config.mjs'));
  assert.equal(parseModule(result.code).exports.default.enabled, false);
});

test('Astro remote image cache remains a build TTL path without client reuse headers', async () => {
  const astroRoot = path.dirname(require.resolve('astro/package.json'));
  const remotePath = path.join(astroRoot, 'dist/assets/build/remote.js');
  const source = fs.readFileSync(remotePath, 'utf8');
  assert.doesNotMatch(source, /satisfiesWithoutRevalidation|evaluateRequest|responseHeaders/);
  const { loadRemoteImage, revalidateRemoteImage } = await import(pathToFileURL(remotePath));
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, options, headers: new Headers(url.headers) });
    return new Response('image-bytes', { headers: { 'cache-control': 'private, no-store', 'set-cookie': 'session=private', etag: 'v1' } });
  };
  const config = { domains: ['example.com'], remotePatterns: [] };
  const first = await loadRemoteImage('https://example.com/image.png', fetcher, config);
  const second = await revalidateRemoteImage('https://example.com/image.png', first, fetcher, config);
  assert.deepEqual(Object.keys(first).sort(), ['data', 'etag', 'expires', 'lastModified']);
  assert.deepEqual(Object.keys(second).sort(), ['data', 'etag', 'expires', 'lastModified']);
  for (const call of calls) {
    const headers = call.headers;
    assert.equal(headers.get('cache-control'), null);
    assert.equal(headers.get('cookie'), null);
    assert.equal(headers.get('authorization'), null);
  }
  assert.equal(calls[1].headers.get('if-none-match'), 'v1');
  assert.ok(first.expires <= Date.now());
  assert.ok(second.expires <= Date.now());
  // Ren10's hook only adds CSS, so it cannot introduce cache header forwarding.
  assert.doesNotMatch(fs.readFileSync(path.join(root, 'packages/astro/integration.js'), 'utf8'), /fetch\(|CachePolicy|headers/);
});
