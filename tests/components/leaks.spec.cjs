// @ts-check
/**
 * Leaks: a component that is removed from the page must give back what it
 * acquired outside its own subtree.
 *
 * runtime-smoke proves a component survives disconnect and reconnect. Nothing
 * proved that a removed component is actually gone: a `document` listener that
 * disconnectedCallback forgets keeps firing on a dead instance, and keeps the
 * instance (and its subtree) in memory for the life of the page. In a
 * single-page app that mounts and unmounts views, that grows without bound.
 *
 * Every JS component in the registry gets two tests:
 *
 *   1. Resource accounting (every browser, `@<component> @leaks`: this is the
 *      test that covers the matrix cell). tests/utils/resource-accounting.cjs
 *      counts listeners on long-lived targets, timers, animation frames,
 *      observers and page-level DOM. The component is mounted, driven
 *      (pointer, focus, keys, lifecycle methods, one disconnect and reconnect)
 *      and removed six times, in three states (idle, open, mid-opening; see
 *      tests/utils/leak-driver.cjs), and after each removal the count must be
 *      back to the baseline taken before the module loaded.
 *   2. Retention (chromium only, no matrix tags): after the same six removals
 *      and a forced garbage collection, no instance of the element class is
 *      left on the heap. It catches what holds no countable resource: a
 *      module-level reference to the last instance, for one.
 *
 * A custom element is removed from the DOM; the rest of its usage, such as an
 * external trigger button, stays, so a listener left on it is seen. A
 * component initialised by a function is torn down through the function it
 * exports and stays in the page, so the teardown itself is what is measured.
 *
 * A module-level singleton (one `document` listener shared by every instance)
 * is not a leak, but it has to be declared in SHARED below, where it is
 * checked to stay constant. Anything undeclared fails, whether it grows per
 * instance or not, and the failure says which of the two it is.
 *
 * Listeners inside the component's own subtree are not held once it is gone,
 * so they are not counted after a removal. They are counted across the
 * reconnect: a component that adds one again without having removed it on
 * disconnect runs that handler twice from then on.
 *
 * The last describe turns the checks on a fixture element that leaks on
 * purpose, so a browser where the accounting sees nothing fails loudly
 * instead of passing everything.
 */
const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('../utils/static-server.cjs');
const { REGISTRY, ROOT, FIXTURE, mountRegistry } = require('../utils/mount-registry.cjs');
const { installResourceAccounting, takeSnapshot, acquisitionSites, pending, residue, judge } = require('../utils/resource-accounting.cjs');
const { STATES, installDriver, driver, driveAndRemove } = require('../utils/leak-driver.cjs');
const { describeSurvivors } = require('../utils/heap-retainers.cjs');

/** Mount, drive and remove this many times per state. Two is what tells "per instance" from "once". */
const ROUNDS = 2;
// LEAKS_STATES=open narrows a local run to one state when hunting a leak.
const states = process.env.LEAKS_STATES ? STATES.filter((state) => process.env.LEAKS_STATES.split(',').includes(state)) : STATES;
if (!states.length) throw new Error(`LEAKS_STATES=${process.env.LEAKS_STATES} names none of: ${STATES.join(', ')}`);

/** How long timers and frames get to drain after a removal before they count as leaked. */
const SETTLE_TIMEOUT = 4000;
/** How long an opening component gets to finish before it is removed in the `open` state. */
const OPEN_TIMEOUT = 1500;
// Copied at every use: expect.poll consumes the array it is given.
const POLL = [20, 30, 50, 100, 200];
/** Skip reason for the dark project: it would run exactly the same code a second time. */
const ONE_SCHEME = 'what a component acquires does not depend on the colour scheme: the light project covers it';

/**
 * Module-level singletons, by accounting label. One per page no matter how
 * many instances were mounted: the check fails if a count ever differs from
 * the one declared here (for a timer: exceeds it), and if a declared entry
 * never shows up.
 *
 * @type {Record<string, string[]>}
 */
const SHARED = {
  // loadStyles() injects one stylesheet per document, guarded by its id.
  'ren-menu': ['node <style#ren-menu-styles> added to head'],
  'ren-select': ['node <style#ren-select-styles> added to head'],
  // One delegated listener opens every [data-sheet-trigger] on the page
  // (guarded by window.__renSheetTriggerWired).
  'ren-sheet': ['listener document click [ren-sheet.js]'],
  // F6 focuses the toasts from anywhere (guarded by window.__renToastF6Wired).
  // The live region and its one debounced clean-up timer belong to
  // utils/live-region.js: one of each per page, whoever announces.
  'ren-toast': [
    'listener document keydown [ren-toast.js]',
    'node <div#ren-live-polite> added to body',
    'timeout 5000ms [live-region.js]',
  ],
};

/**
 * Per-component driving beyond the generic one, for acquisitions the generic
 * driver cannot reach. Run with LEAKS_SITES=1 to print the call sites a
 * component's test reached; an acquisition that is not in that list is not
 * being tested.
 *
 * @type {Record<string, import('../utils/leak-driver.cjs').ComponentDriver>}
 */
const DRIVERS = {
  // Function-initialised: no custom element, so the registry usage's inline
  // script (stripped by the mount helper) is replayed here.
  dropzone: {
    root: '.ren-dropzone',
    inPage: () => {
      const zones = () => [...document.querySelectorAll('#host .ren-dropzone')];
      const drag = (type) => zones().forEach((zone) => zone.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true })));
      let api;
      return {
        async init() {
          api = await import('/components/composites/ren-dropzone/ren-dropzone.js');
          zones().forEach((zone) => api.initDropZone(zone));
        },
        drive() {
          drag('dragenter');
          drag('dragover');
          drag('dragleave');
        },
        engage: () => drag('dragenter'),
        teardown: () => zones().forEach((zone) => api.destroyDropZone(zone)),
      };
    },
  },
  toolbar: {
    root: '[role="toolbar"]',
    inPage: () => {
      let api;
      return {
        async init() {
          api = await import('/components/composites/ren-toolbar/ren-toolbar.js');
          api.initAllToolbars();
        },
        teardown: () => document.querySelectorAll('#host [role="toolbar"]').forEach((toolbar) => api.destroyToolbar(toolbar)),
      };
    },
  },
  // Autoplay is what starts the interval.
  carousel: { edit: (usage) => usage.replace('<ren-carousel', '<ren-carousel autoplay="4000" loop') },
  // The drag listeners go on `document` when the pointer goes down on an area.
  'color-picker': {
    edit: (usage) => usage.replace('<ren-color-picker', '<ren-color-picker alpha'),
    hold: '.ren-color-picker-saturation',
  },
  // An external trigger is where a dialog reaches outside its own subtree.
  dialog: {
    edit: (usage) => `<button type="button" data-dialog-trigger="leaks-dialog" commandfor="leaks-dialog" command="show-modal">Open</button>\n${usage.replace('<ren-dialog', '<ren-dialog id="leaks-dialog"')}`,
  },
  // Press and hold on a stepper starts a timeout, then a repeating interval;
  // two fingers can hold both steppers at once.
  'number-field': { hold: '.ren-number-field-decrement, .ren-number-field-increment' },
  table: { hold: '.ren-th-resize' },
  toast: {
    inPage: () => {
      const toast = () => /** @type {any} */ (window).toast;
      return {
        // The registry usage's inline script, plus a persistent toast, one that
        // outlives any settle window, and one dismissed by hand.
        drive() {
          toast()('Message sent successfully');
          toast()({ title: 'Upload failed', description: 'Try again', status: 'error' });
          toast().loading('Working');
          toast()({ title: 'Syncing', duration: 60000 });
          toast().dismiss(toast()({ title: 'Dismissed', duration: 60000 }));
        },
        engage: () => toast()({ title: 'Still here', duration: 60000 }),
      };
    },
  },
  // Long-press on touch starts its own timer.
  tooltip: {
    inPage: () => {
      const touch = (type) => document.querySelectorAll('#host .ren-tooltip-trigger')
        .forEach((trigger) => trigger.dispatchEvent(new Event(type, { bubbles: true, cancelable: true })));
      return {
        drive() {
          touch('touchstart');
          touch('touchend');
        },
        engage: () => touch('touchstart'),
      };
    },
  },
  // Validation is debounced once a field has been touched.
  form: {
    inPage: () => {
      const type = () => {
        const input = /** @type {HTMLInputElement | null} */ (document.querySelector('#host input[name="email"]'));
        if (!input) return;
        input.focus();
        input.blur();
        input.value = 'not-an-email';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      };
      return { drive: type, engage: type };
    },
  },
  'context-menu': {
    inPage: () => {
      const open = () => document.querySelector('#host [data-context]')
        ?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 20, clientY: 20 }));
      return { drive: open, engage: open };
    },
  },
  // Swipe to dismiss.
  sheet: {
    inPage: () => {
      const touch = (type, x) => {
        const event = new Event(type, { bubbles: true, cancelable: true });
        Object.defineProperty(event, 'touches', { value: [{ clientX: x, clientY: 0 }] });
        document.querySelector('#host ren-sheet dialog')?.dispatchEvent(event);
      };
      return {
        drive() {
          touch('touchstart', 0);
          touch('touchmove', 10);
          touch('touchend', 10);
        },
        engage: () => touch('touchstart', 0),
      };
    },
  },
};

let server;
test.beforeAll(async () => { server = await startStaticServer(ROOT); });
test.afterAll(async () => { await server?.close(); });

/**
 * What the two checks need to know about the thing under test.
 *
 * @typedef {object} Subject
 * @property {string} name for messages
 * @property {string | null} tag the custom element, or null for a function-initialised component
 * @property {string} markup what every mount after the first puts in the host
 * @property {import('../utils/leak-driver.cjs').ComponentDriver} driver
 * @property {string[]} shared accounting labels of its module-level singletons
 * @property {(page: import('@playwright/test').Page, beforeMount: (page: import('@playwright/test').Page) => Promise<void>) => Promise<string[]>} mount
 *   the first mount, the one that loads the module; returns the page errors collected from then on
 * @property {(page: import('@playwright/test').Page) => Promise<unknown>} [before]
 *   runs on the fixture before the module loads, after the accounting is in place
 */

/** @returns {Subject[]} every registry component that ships JS: the ones that owe `leaks` */
const subjects = () => Object.entries(REGISTRY)
  .filter(([, entry]) => (entry.files ?? []).some((file) => file.endsWith('.js')))
  .map(([key, entry]) => {
    const own = DRIVERS[key] ?? {};
    const edit = own.edit ?? ((usage) => usage);
    return {
      name: entry.dir,
      tag: entry.usage?.match(/<(ren-[a-z-]+)/)?.[1] ?? null,
      markup: edit(entry.usage ?? '').replace(/<script[\s\S]*?<\/script>/g, ''),
      driver: own,
      shared: SHARED[entry.dir] ?? [],
      mount: (page, beforeMount) => mountRegistry(page, server.origin, key, edit, { beforeMount }),
    };
  });

/**
 * Mount, drive and remove the subject ROUNDS times in every state, with the
 * resource accounting on, and judge what each removal left behind.
 *
 * @param {import('@playwright/test').Page} page
 * @param {Subject} subject
 * @param {{settle?: number, open?: number}} [timeouts]
 * @returns {Promise<{problems: string[], errors: string[], warnings: string[], order: string}>}
 *   `warnings` is what the component said while mounting: a component that
 *   warns about its markup has bailed out, and then nothing below tested it
 */
async function accountFor(page, subject, { settle: settleTimeout = SETTLE_TIMEOUT, open: openTimeout = OPEN_TIMEOUT } = {}) {
  let baseline = [];
  const warnings = [];
  const heard = (message) => {
    // renWarn's format, "RenTabs: No tablist found": what a component says about markup it cannot use.
    if (message.type() === 'warning' && /^Ren[A-Z]\w*: /.test(message.text())) warnings.push(message.text());
  };
  page.on('console', heard);
  const errors = await subject.mount(page, async (fixture) => {
    await installDriver(fixture, subject.driver);
    await installResourceAccounting(fixture);
    await subject.before?.(fixture);
    baseline = await takeSnapshot(fixture);
  });
  await driver(page, 'init');
  await driver(page, 'frames', 2);
  page.off('console', heard);

  /** Wait until no timer or frame is pending and the counts hold still, then report what is held. */
  const settle = async () => {
    let snapshot = [];
    let previous = '';
    await expect.poll(async () => {
      snapshot = await takeSnapshot(page);
      if (pending(snapshot, subject.shared).length) return 'timers or frames pending';
      const current = JSON.stringify(snapshot);
      const stable = current === previous;
      previous = current;
      return stable ? 'quiet' : 'changing';
    }, { timeout: settleTimeout, intervals: [...POLL] }).toBe('quiet').catch(() => {});
    return residue(baseline, snapshot);
  };
  /** Wait for the timers and frames of an opening component that can finish within the window. */
  const opened = () => expect.poll(async () => pending(await takeSnapshot(page), subject.shared)
    .filter((entry) => entry.kind === 'frame' || entry.delay <= openTimeout).length, { timeout: openTimeout, intervals: [...POLL] })
    .toBe(0).catch(() => {});

  const steps = [];
  /** Listeners a component's own subtree gained by being reconnected. */
  const twice = new Set();
  for (let round = 1; round <= ROUNDS; round += 1) {
    for (const state of states) {
      // The first mount is subject.mount's: it is the one that loads the module.
      if (steps.length > 0) await driver(page, 'mount', subject.markup);
      const { removed, regrown } = await driveAndRemove(page, subject.driver, state, opened);
      expect(removed, 'the driver must find the component to remove').toBeGreaterThan(0);
      steps.push({ step: `${state} #${round}`, held: await settle() });
      for (const label of regrown) twice.add(label);
      await driver(page, 'clear');
    }
  }

  if (process.env.LEAKS_SITES) console.log(`SITES ${subject.name} ${JSON.stringify(await acquisitionSites(page))}`);
  const problems = [
    ...judge(steps, subject.shared),
    ...[...twice].sort().map((label) => `${label}: added again by a reconnect without having been removed on disconnect, so its handler now runs twice`),
  ];
  return { problems, errors, warnings, order: steps.map(({ step }) => step).join(', ') };
}

/**
 * Chromium only. Mount, drive and remove the subject as accountFor does, on a
 * page without the accounting (which would itself hold the instances).
 *
 * @param {import('@playwright/test').Page} page
 * @param {Subject} subject
 * @returns {Promise<{
 *   survivors: () => Promise<Record<string, number>>,
 *   diagnose: (keys: string[]) => Promise<string>,
 * }>} `survivors` counts what a full garbage collection leaves alive, per element
 *   class; `diagnose` says where those survivors are and what holds them
 */
async function removeAndProbe(page, subject) {
  await subject.mount(page, (fixture) => installDriver(fixture, subject.driver));
  const client = await page.context().newCDPSession(page);
  const tags = new Set();
  const ROOTS = '(function-initialised roots)';

  const survivors = async () => {
    // The console keeps every logged argument alive, components included.
    await client.send('Runtime.discardConsoleEntries');
    await client.send('HeapProfiler.collectGarbage');
    const counts = {};
    for (const tag of tags) {
      const prototype = await client.send('Runtime.evaluate', {
        expression: `customElements.get(${JSON.stringify(tag)}).prototype`,
        objectGroup: 'leaks',
      });
      const { objects } = await client.send('Runtime.queryObjects', {
        prototypeObjectId: prototype.result.objectId,
        objectGroup: 'leaks',
      });
      // The query also returns the prototypes of subclasses (ren-alert-dialog
      // extends ren-dialog). Those are not elements: reading a DOM property
      // on one throws, which is how they are told apart.
      const length = await client.send('Runtime.callFunctionOn', {
        objectId: objects.objectId,
        functionDeclaration: `function () {
          return this.filter((object) => {
            try { return object.nodeType === Node.ELEMENT_NODE; } catch { return false; }
          }).length;
        }`,
        returnByValue: true,
      });
      counts[tag] = length.result.value;
    }
    // queryObjects returns the instances themselves: let go before the next collection.
    await client.send('Runtime.releaseObjectGroup', { objectGroup: 'leaks' });
    // A function-initialised component has no class to query: its roots are watched through WeakRefs.
    if (subject.driver.root) {
      counts[ROOTS] = await page.evaluate(() => (/** @type {any} */ (window).__leakProbes ?? []).filter((ref) => ref.deref() !== undefined).length);
    }
    return counts;
  };

  let first = true;
  for (let round = 1; round <= ROUNDS; round += 1) {
    for (const state of states) {
      if (first) await driver(page, 'init');
      else await driver(page, 'mount', subject.markup);
      for (const tag of await driver(page, 'tags')) tags.add(tag);
      if (subject.driver.root) {
        await page.evaluate((selector) => {
          const g = /** @type {any} */ (window);
          g.__leakProbes = [...(g.__leakProbes ?? []), ...[...document.querySelectorAll(selector)].map((el) => new WeakRef(el))];
        }, subject.driver.root);
      }
      if (first) {
        // Prove the probe can see a live instance before trusting a zero.
        const live = await survivors();
        expect(live[subject.tag ?? ROOTS], 'the heap probe must see the mounted instance').toBeGreaterThan(0);
      }
      first = false;
      await driveAndRemove(page, subject.driver, state, () => driver(page, 'frames', 4));
      // A function-initialised root is still in the host and has to go for real;
      // anything else left of the usage stays in the page, as it would in an app.
      await driver(page, subject.driver.root ? 'clear' : 'retire');
    }
  }

  /** For a red run: a count does not say whether the component or the browser holds the node. */
  const diagnose = async (keys) => {
    const reports = [];
    for (const key of keys) {
      reports.push(await describeSurvivors(client, key === ROOTS
        ? { label: 'function-initialised roots', expression: '(window.__leakProbes ?? []).map((ref) => ref.deref()).filter(Boolean)' }
        : { tag: key }));
    }
    return reports.join('\n\n');
  };
  return { survivors, diagnose };
}

/** The classes (or roots) that still have live instances. */
const alive = (counts) => Object.fromEntries(Object.entries(counts).filter(([, count]) => count > 0));

for (const subject of subjects()) {
  test.describe(`leaks: ${subject.name}`, () => {
    test('gives back listeners, timers, frames and observers when removed', { tag: [`@${subject.name}`, '@leaks'] }, async ({ page, colorScheme }) => {
      test.skip(colorScheme === 'dark', ONE_SCHEME);
      test.setTimeout(90_000);
      const { problems, errors, warnings, order } = await accountFor(page, subject);
      expect(warnings, 'the registry usage must give the component the markup it needs: one that warns and bails out acquires nothing, and nothing was tested').toEqual([]);
      expect(problems, `${subject.name} left resources behind after removal.\nCounts are per removal: ${order}`).toEqual([]);
      expect(errors, 'threw while being driven and removed').toEqual([]);
    });

    // No @ren-* / @leaks tags: this test is skipped outside chromium, so it
    // must not be what covers the matrix cell.
    test('removed instances are garbage-collected', { tag: '@retention' }, async ({ page, browserName, colorScheme }, testInfo) => {
      test.skip(browserName !== 'chromium', 'reads the heap over CDP; the accounting test covers every browser');
      test.skip(colorScheme === 'dark', ONE_SCHEME);
      test.setTimeout(90_000);
      const { survivors, diagnose } = await removeAndProbe(page, subject);
      // Polled: a timer that is still pending may hold an instance until it fires.
      let left = {};
      await expect.poll(async () => {
        left = alive(await survivors());
        return left;
      }, { timeout: 8000, intervals: [50, 100, 250, 500] }).toEqual({}).catch(() => {});
      if (Object.keys(left).length === 0) return;

      // The failure has to say what holds them: this may run on a browser
      // build nobody has locally, where the holder can be the engine itself.
      const report = await diagnose(Object.keys(left));
      await testInfo.attach('what-holds-the-survivors.txt', { body: report, contentType: 'text/plain' });
      expect(left, `${subject.name}: removed elements are still reachable after garbage collection (${browserName} ${page.context().browser()?.version()})\n\n${report}\n`).toEqual({});
    });
  });
}

/**
 * A browser can keep a removed node reachable on its own, with no reference
 * from page code, and then the retention test above fails for something the
 * component did not hold. One case is known:
 *
 * Chromium up to at least 147 (the build Playwright 1.59 installs; 156 does
 * not do it) keeps an element in the style engine's pending-invalidation
 * table when one of its classes changes while it is connected and a
 * sibling-combinator rule mentions that class (`.ren-btn-group > .ren-btn +
 * .ren-btn`). The entry survives the removal, and the element's parent
 * pointer keeps everything above it alive. ren-button tripped it by inserting
 * its generated <button> first and classing it afterwards: every <ren-button>
 * ever created stayed in memory.
 *
 * The retention test catches that only on an affected Chromium, which is not
 * the one most people run locally. This pins the cause on every browser: the
 * generated button must be complete before it enters the page.
 */
test('leaks: ren-button builds its generated button before inserting it', async ({ page, colorScheme }) => {
  test.skip(colorScheme === 'dark', ONE_SCHEME);
  await mountRegistry(page, server.origin, 'button', undefined, {
    // Before the module loads: record every attribute change on a node that is in the page.
    beforeMount: (fixture) => fixture.evaluate(() => {
      const g = /** @type {any} */ (window);
      g.__connectedChanges = [];
      new MutationObserver((records) => {
        for (const record of records) g.__connectedChanges.push(`<${/** @type {Element} */ (record.target).localName}> ${record.attributeName}`);
      }).observe(document.getElementById('host'), { subtree: true, attributes: true });
    }),
  });
  await expect(page.locator('ren-button button.ren-btn')).toHaveCount(3);
  const changes = await page.evaluate(() => /** @type {any} */ (window).__connectedChanges);
  expect(changes.filter((change) => change.startsWith('<button>')), 'attributes set on the generated button after it was inserted').toEqual([]);
});

/**
 * The same accounting with the newest platform features switched off, so the
 * fallback branches run on every browser and not only on the ones that still
 * need them: JS positioning where CSS Anchor Positioning is missing, and the
 * `commandfor` polyfill of ren-dialog. Those branches reach outside the
 * component too (ren-popover positions its trigger's parent).
 */
test.describe('leaks: fallback paths', () => {
  const FALLBACKS = ['ren-popover', 'ren-tooltip', 'ren-color-picker', 'ren-date-picker', 'ren-date-range-picker', 'ren-dialog'];
  const withoutNewFeatures = (page) => page.evaluate(() => {
    const supports = CSS.supports.bind(CSS);
    CSS.supports = (...args) => (/anchor|position-area/.test(args.join(' ')) ? false : supports(...args));
    delete HTMLButtonElement.prototype.commandForElement;
  });

  for (const subject of subjects().filter(({ name }) => FALLBACKS.includes(name))) {
    test(`${subject.name} gives everything back without CSS anchor positioning or commandfor`, async ({ page, colorScheme }) => {
      test.skip(colorScheme === 'dark', ONE_SCHEME);
      test.setTimeout(90_000);
      const { problems, errors, order } = await accountFor(page, { ...subject, before: withoutNewFeatures });
      expect(problems, `${subject.name} left resources behind after removal.\nCounts are per removal: ${order}`).toEqual([]);
      expect(errors, 'threw while being driven and removed').toEqual([]);
    });
  }

  // Giving the parent's `position` back must not pull it from under a sibling.
  test('ren-popover keeps a shared parent positioned until its last popover goes, and leaves an authored position alone', async ({ page, colorScheme }) => {
    test.skip(colorScheme === 'dark', ONE_SCHEME);
    const two = (usage) => `${usage}\n${usage.replaceAll('account-trigger', 'billing-trigger')}`;
    const parent = page.locator('#shared');
    const removeFirst = () => page.locator('ren-popover').first().evaluate((el) => el.remove());

    await mountRegistry(page, server.origin, 'popover', (usage) => `<div id="shared">${two(usage)}</div>`, { beforeMount: withoutNewFeatures });
    await expect(parent).toHaveAttribute('style', /position:\s*relative/);
    await removeFirst();
    await expect(parent, 'the second popover still needs it').toHaveAttribute('style', /position:\s*relative/);
    await removeFirst();
    expect(await parent.getAttribute('style'), 'given back with the last popover').toBeNull();

    await mountRegistry(page, server.origin, 'popover', (usage) => `<div id="shared" style="position: absolute;">${two(usage)}</div>`, { beforeMount: withoutNewFeatures });
    await removeFirst();
    await removeFirst();
    expect(await parent.getAttribute('style'), 'an authored position is not the fallback\'s to remove').toBe('position: absolute;');
  });
});

/**
 * The checks, checked. tests/components/fixtures/leaky-element.js acquires one
 * of everything and can be told to forget any release. If the accounting were
 * blind in some browser (a patched API that is not the one components call, a
 * stack format the call-site parser misses), these fail there.
 */
test.describe('leaks: the checks catch what they claim to', () => {
  const MODULE = '/tests/components/fixtures/leaky-element.js';
  const SINGLETON = 'listener document visibilitychange [leaky-element.js]';
  // Short windows: the leaks here never drain, so every wait runs to its end.
  const QUICK = { settle: 500, open: 150 };
  test.beforeEach(({ colorScheme }) => {
    test.skip(colorScheme === 'dark', ONE_SCHEME);
  });

  /** @returns {Subject} */
  const fixture = (leak, shared = [SINGLETON]) => {
    const markup = `<ren-leaky-fixture leak="${leak}"></ren-leaky-fixture>\n<button type="button">Outside</button>`;
    return {
      name: 'ren-leaky-fixture',
      tag: 'ren-leaky-fixture',
      markup,
      driver: {},
      shared,
      async mount(page, beforeMount) {
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(`${server.origin}${FIXTURE}`);
        await beforeMount(page);
        await page.evaluate(async ([html, src]) => {
          document.getElementById('host').innerHTML = html;
          await import(src);
        }, [markup, MODULE]);
        return errors;
      },
    };
  };

  /** problem lines → { label: 'grows' | 'constant' | 'stale' | 'twice' | 'other' } */
  const verdicts = (problems) => Object.fromEntries(problems.map((problem) => {
    const label = problem.match(/^(.*?): (?:\d+(?: → \d+)* \(allowed|added again by a reconnect)/)?.[1] ?? problem;
    if (problem.includes('added again by a reconnect')) return [label, 'twice'];
    if (problem.includes('grows with every instance')) return [label, 'grows'];
    if (/left (behind|on an element that stays in the page,) by every removal/.test(problem)) return [label, 'constant'];
    if (problem.includes('declared as shared but never held')) return [label, 'stale'];
    return [label, 'other'];
  }));

  test('an element that releases everything passes', async ({ page }) => {
    const { problems, errors } = await accountFor(page, fixture(''), QUICK);
    expect(problems).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('every kind of leak is reported, with the file that acquired it', async ({ page }) => {
    const everything = 'document-listener signal-listener media-listener viewport-listener once-listener outside-listener own-listener interval timeout frame mutation-observer resize-observer intersection-observer node attribute';
    const { problems } = await accountFor(page, fixture(everything), QUICK);
    expect(verdicts(problems)).toEqual({
      'IntersectionObserver on the removed subtree [leaky-element.js]': 'grows',
      'MutationObserver on the removed subtree [leaky-element.js]': 'grows',
      'ResizeObserver on body [leaky-element.js]': 'grows',
      'animation frame [leaky-element.js]': 'grows',
      // One attribute, set again by every instance.
      'attribute body[data-ren-leaky-lock] = ""': 'constant',
      'interval 1000ms [leaky-element.js]': 'grows',
      // The button is part of the usage and is replaced with every mount.
      'listener <button> click [leaky-element.js]': 'constant',
      // On the element itself: not held once it is gone, but doubled by a reconnect.
      'listener <ren-leaky-fixture> click [leaky-element.js]': 'twice',
      'listener document keydown [leaky-element.js]': 'grows',
      'listener document ren-leaky-ready [leaky-element.js]': 'grows',
      'listener matchMedia("(min-width: 600px)") change [leaky-element.js]': 'grows',
      'listener visualViewport resize [leaky-element.js]': 'grows',
      'listener window resize [leaky-element.js]': 'grows',
      'node <div.ren-leaky-portal> added to body': 'grows',
      'timeout 60000ms [leaky-element.js]': 'grows',
    });
  });

  test('a singleton nobody declared and a declaration nothing backs are both reported', async ({ page }) => {
    const stale = 'listener window scroll [leaky-element.js]';
    const { problems } = await accountFor(page, fixture('', [stale]), QUICK);
    expect(verdicts(problems)).toEqual({ [SINGLETON]: 'constant', [stale]: 'stale' });
  });

  test('a retained instance is reported with what holds it, a released one is not', { tag: '@retention' }, async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'reads the heap over CDP');
    const retained = await removeAndProbe(page, fixture('instance'));
    expect(await retained.survivors()).toEqual({ 'ren-leaky-fixture': ROUNDS * states.length });
    // And the diagnosis a red run would print names the holder: the fixture's
    // module-level `retained` array. Checked here so it is known to work on
    // whatever Chromium build CI runs before it is ever needed there.
    const report = await retained.diagnose(['ren-leaky-fixture']);
    expect(report).toContain(`<ren-leaky-fixture>: ${ROUNDS * states.length} alive after garbage collection.`);
    expect(report).toContain('"connected":false');
    expect(report).toMatch(/--retained \(context\)--> Array \[object\]/);

    const released = await removeAndProbe(page, fixture(''));
    await expect.poll(async () => alive(await released.survivors()), { timeout: 8000 }).toEqual({});
  });
});
