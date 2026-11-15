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
 * So this drives every JS component from the CLI registry — the same source
 * of truth `ren10 add` copies from — through five phases, asserting no
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

// The registry is read when the file loads, not in beforeAll, so each
// component gets its own tests: a failure names the component, and every test
// carries `@<component>` plus `@runtime` or `@lifecycle`, which is what
// `npm run coverage:check` counts (tests/coverage/README.md).
const { REGISTRY } = require('../../cli/registry.js');

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

/** @type {Array<{key: string, dir: string, tag: string|null, usage: string, assets: string[]}>} */
const components = Object.entries(REGISTRY)
  .filter(([, entry]) => (entry.files ?? []).some((file) => file.endsWith('.js')))
  .map(([key, entry]) => ({
    key,
    dir: entry.dir,
    // The custom element tag, when the usage snippet mounts one.
    tag: entry.usage?.match(/<(ren-[a-z-]+)/)?.[1] ?? null,
    usage: entry.usage ?? '',
    assets: assetsFor(entry),
  }));

let server;

test.beforeAll(async () => {
  server = await startStaticServer(ROOT);
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

test('the registry exposes the JS components this suite drives', () => {
  expect(components.length, 'registry should expose JS components').toBeGreaterThan(20);
});

/** Mount the registry usage; skip when mounting already threw (the mount test reports it). */
async function mountUsage(page, component) {
  const result = await mount(page, component, component.usage);
  test.skip(result.errors.length > 0, `mount threw, reported by the mount test: ${result.errors[0]}`);
  return result;
}

/** Run an action on the mounted page and return what it threw. */
async function errorsDuring(page, action) {
  const errors = [];
  const collect = (error) => errors.push(error.message);
  page.on('pageerror', collect);
  await action();
  page.off('pageerror', collect);
  return errors;
}

for (const component of components) {
  test.describe(`runtime smoke: ${component.dir}`, { tag: `@${component.dir}` }, () => {
    if (component.usage.trim()) {
      test('mounts its documented usage without throwing', { tag: '@runtime' }, async ({ page }) => {
        const { errors, defined, loaded } = await mount(page, component, component.usage);
        // A component that never loaded cannot throw, which is precisely how an
        // earlier version of this spec passed against known-broken code.
        expect(loaded, 'module must import before anything is proven').toBe(true);
        if (component.tag) expect(defined, `<${component.tag}> must upgrade`).toBe(true);
        expect(errors, 'threw while mounting its registry usage').toEqual([]);
      });
    }

    if (component.tag && component.usage.trim()) {
      test('lifecycle methods are callable and idempotent', { tag: '@lifecycle' }, async ({ page }) => {
        await mountUsage(page, component);
        // Call each lifecycle method twice: once to exercise it, once to catch
        // state that only breaks on re-entry.
        const thrown = await page.evaluate(
          ([tag, methods]) => {
            const element = document.querySelector(tag);
            if (!element) return [];
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
        expect(thrown, 'lifecycle methods threw').toEqual([]);
      });

      test('survives disconnect and reconnect', { tag: '@lifecycle' }, async ({ page }) => {
        await mountUsage(page, component);
        const errors = await errorsDuring(page, async () => {
          await page.evaluate((tag) => {
            const element = document.querySelector(tag);
            if (!element) return;
            const parent = element.parentNode;
            const next = element.nextSibling;
            element.remove();
            parent.insertBefore(element, next);
          }, component.tag);
          await page.waitForTimeout(50);
        });
        expect(errors, 'threw on reconnect').toEqual([]);
      });

      test('activating the first control does not throw', { tag: '@runtime' }, async ({ page }) => {
        await mountUsage(page, component);
        // The menubar recursion only fired on activation: openMenu() took an
        // index, so no argument-free lifecycle call reached it, and the crash
        // needed a trigger press. Clicking the first control is what a user
        // does first, and it is the cheapest way to reach that code.
        const errors = await errorsDuring(page, async () => {
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
        });
        expect(errors, 'threw when its first control was activated').toEqual([]);
      });
    }

    if (component.tag) {
      test('an empty element warns instead of throwing', { tag: '@runtime' }, async ({ page }) => {
        // No children at all: the component cannot find the markup it needs.
        // It is expected to say so — and expected NOT to throw afterwards.
        // This is the shape the ren-table crash had.
        const { errors } = await mount(page, component, `<${component.tag}></${component.tag}>`);
        expect(errors, 'threw when mounted without its markup').toEqual([]);
      });
    }
  });
}
