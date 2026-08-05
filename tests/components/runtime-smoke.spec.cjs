// @ts-check
/**
 * Runtime smoke: every component that ships JavaScript must survive being
 * used, not merely being catalogued.
 *
 * This exists because four real defects shipped past a suite of 4,700 tests:
 *
 *   - ren-menubar defined openMenu twice and the winner called itself, so no
 *     menu could open. The only spec naming it asserted that the module
 *     registers its custom element.
 *   - A bare <ren-table> warned about its missing structure and then threw,
 *     because connectedCallback carried on into setup that assumed it.
 *   - The JS positioning fallback recursed until the stack overflowed.
 *   - base/grid.css overrode a motion token for the whole system.
 *
 * The gates that existed counted contracts, docs pages and aiHints — structure.
 * Nothing mounted a component and used it. `ren10 doctor` reported 8/8 while a
 * catalogued component could not open.
 *
 * So this drives all 32 JS components from the CLI registry — the same source
 * of truth `ren10 add` copies from — through four phases, asserting no
 * uncaught error in any of them. Console warnings are allowed: they are the
 * documented channel for markup a component needs and cannot find.
 */
const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT = path.resolve(__dirname, '../..');
const FIXTURE = '/tests/components/fixtures/runtime-smoke.html';

/**
 * Lifecycle methods that are safe to call with no arguments and are expected
 * to be idempotent. These are exactly the shapes the menubar recursion lived
 * in, so they are called in sequence and then again to catch state that only
 * breaks on a second pass.
 */
const LIFECYCLE_METHODS = ['open', 'close', 'toggle', 'show', 'hide'];

// Each phase mounts all 32 components for real, so the default 30s is short.
test.describe.configure({ timeout: 180_000 });

let server;
/** @type {Array<{key: string, tag: string, usage: string, assets: string[]}>} */
let components = [];

test.beforeAll(async () => {
  server = await startStaticServer(ROOT);

  const { REGISTRY } = await import('../../cli/registry.js');

  const assetsFor = (entry, seen = new Set()) => {
    const files = [];
    for (const dep of entry.components ?? []) {
      if (seen.has(dep) || !REGISTRY[dep]) continue;
      seen.add(dep);
      files.push(...assetsFor(REGISTRY[dep], seen));
    }
    for (const file of entry.files ?? []) {
      files.push(`/components/${entry.layer}/${entry.dir}/${file}`);
    }
    return files;
  };

  components = Object.entries(REGISTRY)
    .filter(([, entry]) => (entry.files ?? []).some((file) => file.endsWith('.js')))
    .map(([key, entry]) => ({
      key,
      // The custom element tag, when the usage snippet mounts one.
      tag: entry.usage?.match(/<(ren-[a-z-]+)/)?.[1] ?? null,
      usage: entry.usage ?? '',
      assets: assetsFor(entry),
    }));

  expect(components.length, 'registry should expose JS components').toBeGreaterThan(20);
});

test.afterAll(async () => {
  await server?.close();
});

/**
 * Mount markup with the component's own CSS and JS on a served page, and
 * report anything that threw.
 *
 * The page is fetched over http rather than injected with setContent(): on
 * about:blank a `<script type="module">` fails with net::ERR_FAILED because
 * the origin is opaque, so the component never loads and nothing ever throws.
 * The first version of this spec did exactly that and passed against the
 * known-broken code — it has to be same-origin with what it imports.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<{errors: string[], defined: boolean|null}>}
 */
async function mount(page, component, markup) {
  const errors = [];
  // Removed after each mount: all components share one page, and a leaked
  // listener would attribute a later error to an earlier component.
  const collect = (error) => errors.push(error.message);
  page.on('pageerror', collect);

  await page.goto(`${server.origin}${FIXTURE}`);

  const styles = component.assets.filter((asset) => asset.endsWith('.css'));
  const scripts = component.assets.filter((asset) => asset.endsWith('.js'));

  // Markup first, then the module: defining the element upgrades what is
  // already in the DOM, which is the path a real page takes.
  await page.evaluate(
    ([sheets, html]) => {
      for (const href of sheets) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
      document.getElementById('host').innerHTML = html;
    },
    [styles, markup]
  );

  const loaded = await page.evaluate(
    (sources) =>
      Promise.all(sources.map((src) => import(src)))
        .then(() => true)
        .catch(() => false),
    scripts
  );

  let defined = null;
  if (component.tag) {
    defined = await page
      .waitForFunction((tag) => customElements.get(tag) !== undefined, component.tag, {
        timeout: 2000,
      })
      .then(() => true)
      .catch(() => false);
  }

  await page.waitForTimeout(50);
  page.off('pageerror', collect);
  return { errors, defined, loaded };
}

test.describe('runtime smoke', () => {
  test('every JS component mounts its documented usage without throwing', async ({ page }) => {
    const failures = [];

    const notLoaded = [];

    for (const component of components) {
      if (!component.usage.trim()) continue;
      const { errors, defined, loaded } = await mount(page, component, component.usage);
      if (errors.length) failures.push(`${component.key}: ${errors[0]}`);
      // A component that never loaded cannot throw, which is precisely how an
      // earlier version of this spec passed against known-broken code.
      if (!loaded) notLoaded.push(`${component.key}: module failed to import`);
      else if (component.tag && defined === false) {
        notLoaded.push(`${component.key}: <${component.tag}> never upgraded`);
      }
    }

    expect(notLoaded, 'components must actually load before anything is proven').toEqual([]);
    expect(failures, 'components threw while mounting their registry usage').toEqual([]);
  });

  test('lifecycle methods are callable and idempotent', async ({ page }) => {
    const failures = [];

    for (const component of components) {
      if (!component.tag || !component.usage.trim()) continue;
      const { errors } = await mount(page, component, component.usage);
      if (errors.length) continue; // already reported by the mount test

      // Call each lifecycle method twice: once to exercise it, once to catch
      // state that only breaks on re-entry.
      const thrown = await page.evaluate(
        ([tag, methods]) => {
          const element = document.querySelector(tag);
          if (!element) return null;
          const problems = [];
          for (const pass of [1, 2]) {
            for (const method of methods) {
              if (typeof element[method] !== 'function') continue;
              try {
                element[method]();
              } catch (error) {
                problems.push(`${method} (pass ${pass}): ${error.message}`);
              }
            }
          }
          return problems;
        },
        [component.tag, LIFECYCLE_METHODS]
      );

      const all = [...(thrown ?? []), ...errors];
      if (all.length) failures.push(`${component.key}: ${all.join('; ')}`);
    }

    expect(failures, 'lifecycle methods threw').toEqual([]);
  });

  test('components survive disconnect and reconnect', async ({ page }) => {
    const failures = [];

    for (const component of components) {
      if (!component.tag || !component.usage.trim()) continue;
      const { errors: mountErrors } = await mount(page, component, component.usage);
      if (mountErrors.length) continue;

      // Watch only the reconnect: mount() already stopped collecting.
      const reconnectErrors = [];
      const collect = (error) => reconnectErrors.push(error.message);
      page.on('pageerror', collect);

      await page.evaluate((tag) => {
        const element = document.querySelector(tag);
        if (!element) return;
        const parent = element.parentNode;
        const next = element.nextSibling;
        element.remove();
        parent.insertBefore(element, next);
      }, component.tag);
      await page.waitForTimeout(50);
      page.off('pageerror', collect);

      if (reconnectErrors.length) {
        failures.push(`${component.key}: ${reconnectErrors.join('; ')}`);
      }
    }

    expect(failures, 'components threw on reconnect').toEqual([]);
  });

  test('activating the first control does not throw', async ({ page }) => {
    const failures = [];

    for (const component of components) {
      if (!component.tag || !component.usage.trim()) continue;
      const { errors: mountErrors } = await mount(page, component, component.usage);
      if (mountErrors.length) continue;

      // The menubar recursion only fired on activation: openMenu() took an
      // index, so no argument-free lifecycle call reached it, and the crash
      // needed a trigger press. Clicking the first control is what a user
      // does first, and it is the cheapest way to reach that code.
      const clickErrors = [];
      const collect = (error) => clickErrors.push(error.message);
      page.on('pageerror', collect);

      await page.evaluate((tag) => {
        const host = document.querySelector(tag);
        const control = host?.querySelector(
          'button, summary, [role="menuitem"], [role="tab"], [role="option"], input:not([type="hidden"])'
        );
        // Programmatic click: some controls sit under an overlay that a real
        // pointer could not reach, and reachability is not what is under test.
        control?.click();
      }, component.tag);
      await page.waitForTimeout(80);
      page.off('pageerror', collect);

      if (clickErrors.length) failures.push(`${component.key}: ${clickErrors[0]}`);
    }

    expect(failures, 'components threw when their first control was activated').toEqual([]);
  });

  test('an empty element warns instead of throwing', async ({ page }) => {
    const failures = [];

    for (const component of components) {
      if (!component.tag) continue;

      // No children at all: the component cannot find the markup it needs.
      // It is expected to say so — and expected NOT to throw afterwards.
      // This is the shape the ren-table crash had.
      const { errors } = await mount(page, component, `<${component.tag}></${component.tag}>`);
      if (errors.length) failures.push(`${component.key}: ${errors[0]}`);
    }

    expect(failures, 'components threw when mounted without their markup').toEqual([]);
  });
});
