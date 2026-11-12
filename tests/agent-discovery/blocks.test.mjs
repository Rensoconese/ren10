import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  BLOCK_CATALOG_PATH,
  BLOCK_FAMILIES,
  extractBlockMarkup,
  findElementByMarker,
  loadBlockCatalog,
} from '../../cli/blocks.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const cli = path.join(root, 'cli', 'index.js');
const catalog = loadBlockCatalog(root);

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8', maxBuffer: 1024 * 1024 * 20 });
}

function runJson(args, expectedType) {
  const result = run(args);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.apiVersion, 1);
  assert.equal(payload.type, expectedType);
  return payload.data;
}

test('catalog covers every shipped block page, grouped into known families', () => {
  const pages = readdirSync(path.join(root, 'templates', 'blocks'))
    .filter((file) => file.endsWith('.html') && file !== 'index.html');
  assert.equal(catalog.count, pages.length);
  assert.equal(catalog.blocks.length, pages.length);
  const expected = {
    nav: 29, hero: 30, feature: 120, testimonial: 12, pricing: 12, faq: 12,
    cta: 60, contact: 12, blog: 12, 'article-header': 12, footer: 12, 'application-shell': 12,
  };
  for (const [family, count] of Object.entries(expected)) {
    assert.equal(catalog.families[family].count, count, `${family} block count`);
  }
  assert.deepEqual(Object.keys(catalog.families), BLOCK_FAMILIES.map((family) => family.key));
});

test('every catalog entry is derived from its file and points at shipped assets', () => {
  for (const block of catalog.blocks) {
    assert.ok(block.title && block.summary, `${block.name} has a title and summary`);
    assert.ok(block.name.startsWith(BLOCK_FAMILIES.find((family) => family.key === block.family).prefix));
    for (const asset of [block.path, ...block.styles, ...block.scripts, ...block.media]) {
      assert.ok(existsSync(path.join(root, asset)), `${block.name}: ${asset} exists`);
    }
    assert.ok(block.styles.includes('index.css'), `${block.name} links the RenDS bundle`);
    for (const component of block.components) {
      assert.ok(
        ['primitives', 'composites', 'patterns'].some((layer) => existsSync(path.join(root, 'components', layer, component))),
        `${block.name}: ${component} is a shipped component`,
      );
    }
  }
});

test('catalog records component dependencies, including ones imported by inline scripts', () => {
  const byName = Object.fromEntries(catalog.blocks.map((block) => [block.name, block]));
  assert.ok(byName['faq-accent-panel'].components.includes('ren-accordion'));
  assert.ok(byName['faq-accent-panel'].scripts.includes('components/composites/ren-accordion/ren-accordion.js'));
  assert.ok(byName['contact-centered-form'].components.includes('ren-form'));
  assert.ok(byName['nav-drawer'].components.includes('ren-sheet'));
  assert.ok(byName['nav-drawer'].scripts.includes('components/composites/ren-sheet/ren-sheet.js'));
  assert.equal(byName['nav-drawer'].inlineScript, true);
  // `.ren-sr-only` is a global utility, not a ren-table dependency.
  assert.ok(!byName['pricing-billing-period-toggle'].components.includes('ren-table'));
});

test('markup extraction returns the block root plus companion elements, not the demo page', () => {
  const html = '<main><header><h1>Demo</h1></header><section class="x-block bb-detail-preview"><section>inner</section></section>\n<ren-sheet id="s">menu</ren-sheet>\n<nav class="bb-block-pagination">prev</nav></main>';
  assert.equal(
    extractBlockMarkup(html),
    '<section class="x-block bb-detail-preview"><section>inner</section></section>\n<ren-sheet id="s">menu</ren-sheet>',
  );
  const element = findElementByMarker('<div><div class="a">x</div></div>', 'class="a"');
  assert.equal(element.tag, 'div');
  const real = readFileSync(path.join(root, 'templates/blocks/nav-drawer.html'), 'utf8');
  const markup = extractBlockMarkup(real);
  assert.match(markup, /^<section class="rb-preview bb-detail-preview"/);
  assert.match(markup, /<\/ren-sheet>$/);
  assert.doesNotMatch(markup, /bb-block-pagination|bb-detail-title/);
});

test('blocks:check passes on the committed catalog', () => {
  const result = spawnSync(process.execPath, [path.join(root, 'scripts', 'build-block-catalog.mjs'), '--check'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, new RegExp(`${catalog.count} blocks`));
});

test('blocks --list groups by family, as text and typed JSON', () => {
  const list = runJson(['blocks', '--list', '--json'], 'blocks.list');
  assert.equal(list.count, catalog.count);
  assert.equal(list.catalog, BLOCK_CATALOG_PATH);
  assert.equal(list.families.pricing.blocks.length, 12);
  assert.deepEqual(Object.keys(list.families.pricing.blocks[0]).sort(), ['name', 'summary', 'title']);

  const filtered = runJson(['blocks', '--list', '--family', 'footer', '--json'], 'blocks.list');
  assert.deepEqual(Object.keys(filtered.families), ['footer']);
  assert.equal(filtered.count, 12);

  const text = run(['blocks', '--list']);
  assert.equal(text.status, 0);
  assert.match(text.stdout, /PRICING/);
  assert.match(text.stdout, /pricing-billing-period-toggle/);

  const bad = run(['blocks', '--list', '--family', 'nope', '--json']);
  assert.equal(bad.status, 1);
  assert.equal(JSON.parse(bad.stdout).code, 'ERR_UNKNOWN_BLOCK_FAMILY');
});

test('blocks <name> prints markup and dependencies; --dense and --json mirror component/docs', () => {
  const detail = runJson(['blocks', 'faq-accent-panel', '--json'], 'blocks.detail');
  assert.equal(detail.family, 'faq');
  assert.match(detail.markup, /^<section class="faq9-block bb-detail-preview"/);
  assert.ok(detail.styles.includes('templates/blocks/faq-batch2.css'));
  assert.deepEqual(detail.components, [{ name: 'ren-accordion', command: 'npx ren10 component accordion --dense' }]);
  assert.equal(detail.dense, undefined);

  const dense = runJson(['blocks', 'faq-accent-panel', '--dense', '--json'], 'blocks.detail');
  assert.equal(dense.markup, undefined, 'dense output omits markup');
  assert.match(dense.dense, /^faq-accent-panel\|faq\|Accent Panel FAQ/);
  assert.match(dense.dense, /scripts=components\/composites\/ren-accordion\/ren-accordion\.js/);

  const denseText = run(['blocks', 'faq-accent-panel', '--dense']);
  assert.equal(denseText.stdout.trim(), dense.dense);
  assert.ok(denseText.stdout.length < 1200, 'dense output stays token-efficient');

  const text = run(['blocks', 'nav-drawer']);
  assert.equal(text.status, 0);
  assert.match(text.stdout, /<ren-sheet side="right"/);
  assert.match(text.stdout, /Inline <script type="module">/);
});

test('unknown blocks fail with suggestions', () => {
  const result = run(['blocks', 'pricing', '--json']);
  assert.equal(result.status, 1);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.code, 'ERR_UNKNOWN_BLOCK');
  assert.ok(payload.suggestions.length > 0);
  assert.ok(payload.suggestions.every((item) => item.name.startsWith('pricing-')));
});

test('manifest and help advertise the blocks command', () => {
  const manifest = runJson(['manifest', '--json'], 'manifest');
  const command = manifest.commands.find((item) => item.name === 'blocks');
  assert.ok(command?.json);
  assert.ok(manifest.jsonSupported.includes('blocks'));
  assert.deepEqual(manifest.responseTypes.blocks, ['blocks.list', 'blocks.detail']);
  assert.equal(manifest.blocks.count, catalog.count);
  assert.equal(manifest.blocks.catalog, BLOCK_CATALOG_PATH);
  const help = run(['--help']);
  assert.match(help.stdout, /blocks \[name\]/);
});
