// @ts-check
/**
 * Mount a component the way `ren10 add` ships it: its registry usage, its CSS
 * and its JS (dependencies first), on a same-origin fixture page.
 *
 * Shared by the per-component contract specs so they all drive the same markup.
 * The caller owns the static server (tests/utils/static-server.cjs) and passes
 * its origin.
 */
const path = require('node:path');
const { REGISTRY } = require('../../cli/registry.js');

const ROOT = path.resolve(__dirname, '../..');
const FIXTURE = '/tests/components/fixtures/runtime-smoke.html';

/** Served paths of a registry entry's files, dependencies first. */
function assetsFor(key, seen = new Set()) {
  const entry = REGISTRY[key];
  const files = [];
  for (const dep of entry.components ?? []) {
    if (seen.has(dep) || !REGISTRY[dep]) continue;
    seen.add(dep);
    files.push(...assetsFor(dep, seen));
  }
  for (const file of entry.files ?? []) files.push(`/components/${entry.layer}/${entry.dir}/${file}`);
  return files;
}

/**
 * Mount registry usage (optionally edited) with its CSS, then import its JS.
 * Returns the uncaught page errors collected from here on.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} origin static server origin
 * @param {string} key registry key, e.g. 'dialog'
 * @param {(usage: string) => string} [edit] rewrite the usage before mounting
 * @param {{ beforeMount?: (page: import('@playwright/test').Page) => Promise<void> }} [options]
 *   beforeMount runs on the loaded fixture before any markup or module is added.
 */
async function mountRegistry(page, origin, key, edit = (usage) => usage, options = {}) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${origin}${FIXTURE}`);
  await options.beforeMount?.(page);
  const assets = assetsFor(key);
  // Inline <script> in a usage snippet would not run through innerHTML anyway.
  const markup = edit(REGISTRY[key].usage).replace(/<script[\s\S]*?<\/script>/g, '');
  await page.evaluate(([sheets, html]) => {
    for (const href of sheets) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
    document.getElementById('host').innerHTML = html;
  }, [assets.filter((a) => a.endsWith('.css')), markup]);
  await page.evaluate((sources) => Promise.all(sources.map((src) => import(src))), assets.filter((a) => a.endsWith('.js')));
  const tag = markup.match(/<(ren-[a-z-]+)/)?.[1];
  if (tag) {
    await page.waitForFunction((name) => customElements.get(name) !== undefined, tag);
  }
  return errors;
}

module.exports = { REGISTRY, ROOT, FIXTURE, assetsFor, mountRegistry };
