// @ts-check
/**
 * Resource accounting for the leak tests (tests/components/leaks.spec.cjs).
 *
 * `installResourceAccounting(page)` patches the page so that everything a
 * component acquires outside its own subtree is counted, using standard DOM
 * APIs only (it runs unchanged on chromium, firefox and webkit):
 *
 *   listeners   addEventListener on any target that outlives the component:
 *               window, document, <html>, <body>, any node still connected
 *               after the component is gone, and non-node targets such as
 *               matchMedia() results and visualViewport. `once` listeners are
 *               released when they fire, `signal` listeners when it aborts.
 *   timers      every setInterval, and every setTimeout that has not fired.
 *   frames      requestAnimationFrame callbacks that have not run. A loop
 *               re-requests itself every frame, so it never drains.
 *   observers   Mutation/Resize/IntersectionObserver with a target and no
 *               disconnect().
 *   page state  nodes added to <html>, <head> or <body>, and attributes
 *               changed on <html>, <body> and the children <body> started
 *               with (scroll locks, `inert`, portals).
 *
 * Listeners inside the component's own subtree are not counted as held: they
 * go when the subtree goes. They are counted across a reconnect, though
 * (`listenersWithin`): one that is added again without having been removed
 * makes every handler run twice.
 *
 * Install it before the component module loads (the `beforeMount` hook of
 * mountRegistry), or module-level listeners are missed.
 *
 * The page keeps strong references to what it tracks, which makes the counts
 * deterministic and makes this page useless for garbage-collection checks: the
 * retention test in leaks.spec.cjs runs on a page without it.
 */

/** Runs in the page. Self-contained: page.evaluate serialises it. */
function instrument() {
  const g = /** @type {any} */ (window);
  if (g.__renResources) return;

  const native = {
    add: EventTarget.prototype.addEventListener,
    remove: EventTarget.prototype.removeEventListener,
    setTimeout: g.setTimeout.bind(g),
    clearTimeout: g.clearTimeout.bind(g),
    setInterval: g.setInterval.bind(g),
    clearInterval: g.clearInterval.bind(g),
    requestAnimationFrame: g.requestAnimationFrame.bind(g),
    cancelAnimationFrame: g.cancelAnimationFrame.bind(g),
  };

  /** Call sites ever seen, for checking that a driver reaches the code it should. */
  const sites = new Set();

  /**
   * Where the current acquisition comes from: the innermost component or util
   * frames of the stack. `file` goes into the label, `chain` into the report.
   */
  const origin = () => {
    const found = [];
    for (const line of String(new Error().stack || '').split('\n')) {
      const match = line.match(/\/((?:components|utils)\/[^\s:)]+\.js):(\d+)/);
      if (!match) continue;
      const frame = `${match[1]}:${match[2]}`;
      if (found[found.length - 1] !== frame) found.push(frame);
      if (found.length === 3) break;
    }
    if (!found.length) return { file: 'unknown', chain: 'unknown call site' };
    sites.add(found[0]);
    return { file: found[0].replace(/^.*\//, '').replace(/:\d+$/, ''), chain: found.join(' < ') };
  };

  const describeNode = (node) => {
    if (node === document) return 'document';
    if (node === document.documentElement) return 'html';
    if (node === document.body) return 'body';
    if (node === document.head) return 'head';
    if (node.nodeType !== Node.ELEMENT_NODE) return node.nodeName;
    const id = node.id ? `#${node.id}` : '';
    const classes = typeof node.className === 'string' && node.className.trim()
      ? `.${node.className.trim().split(/\s+/).join('.')}`
      : '';
    return `<${node.localName}${id}${classes}>`;
  };

  /**
   * Name a listener target that outlives a removed component, or null when
   * the target goes away with it (a detached node) or is owned by whoever
   * created it (an AbortSignal dies with its controller).
   */
  const describeTarget = (target) => {
    if (target === g) return 'window';
    if (target instanceof Node) return target.isConnected ? describeNode(target) : null;
    if (typeof AbortSignal !== 'undefined' && target instanceof AbortSignal) return null;
    if (typeof MediaQueryList !== 'undefined' && target instanceof MediaQueryList) return `matchMedia("${target.media}")`;
    if (g.visualViewport && target === g.visualViewport) return 'visualViewport';
    return target?.constructor?.name || 'EventTarget';
  };

  // --- listeners -----------------------------------------------------------
  /** @type {Map<EventTarget, Array<{type: string, capture: boolean, listener: unknown, origin: {file: string, chain: string}}>>} */
  const listeners = new Map();
  const captureOf = (options) => (typeof options === 'boolean' ? options : Boolean(options && options.capture));

  const forget = (target, record) => {
    const records = listeners.get(target);
    const index = records ? records.indexOf(record) : -1;
    if (index === -1) return;
    records.splice(index, 1);
    if (!records.length) listeners.delete(target);
  };

  EventTarget.prototype.addEventListener = function addEventListener(type, listener, options) {
    // A bare `addEventListener(...)` call has no receiver: it means window.
    const target = this == null ? g : this;
    const signal = options && typeof options === 'object' ? options.signal : undefined;
    // The browser ignores a null listener and one whose signal already aborted.
    if (listener == null || signal?.aborted) return native.add.call(target, type, listener, options);

    const capture = captureOf(options);
    const records = listeners.get(target) ?? [];
    // Same (type, listener, capture) twice is one listener, as in the browser.
    if (!records.some((r) => r.type === String(type) && r.capture === capture && r.listener === listener)) {
      const record = { type: String(type), capture, listener, origin: origin() };
      records.push(record);
      listeners.set(target, records);
      const release = () => forget(target, record);
      // Registered first, so it runs right before the `once` listener it shadows
      // and is skipped with it if an earlier listener stops propagation.
      if (options && typeof options === 'object' && options.once) native.add.call(target, type, release, { capture, once: true });
      if (signal) native.add.call(signal, 'abort', release, { once: true });
    }
    return native.add.call(target, type, listener, options);
  };

  EventTarget.prototype.removeEventListener = function removeEventListener(type, listener, options) {
    const target = this == null ? g : this;
    const capture = captureOf(options);
    const record = listeners.get(target)?.find((r) => r.type === String(type) && r.capture === capture && r.listener === listener);
    if (record) forget(target, record);
    return native.remove.call(target, type, listener, options);
  };

  // --- timers --------------------------------------------------------------
  // One id pool: clearTimeout cancels an interval and the reverse.
  /** @type {Map<number, {kind: 'timeout'|'interval', delay: number, origin: {file: string, chain: string}}>} */
  const timers = new Map();

  g.setTimeout = function setTimeout(handler, delay, ...args) {
    if (typeof handler !== 'function') return native.setTimeout(handler, delay, ...args);
    const id = native.setTimeout(function () {
      timers.delete(id);
      return handler.apply(this, args);
    }, delay);
    timers.set(id, { kind: 'timeout', delay: Number(delay) || 0, origin: origin() });
    return id;
  };
  g.setInterval = function setInterval(handler, delay, ...args) {
    const id = native.setInterval(handler, delay, ...args);
    timers.set(id, { kind: 'interval', delay: Number(delay) || 0, origin: origin() });
    return id;
  };
  g.clearTimeout = function clearTimeout(id) {
    timers.delete(id);
    return native.clearTimeout(id);
  };
  g.clearInterval = function clearInterval(id) {
    timers.delete(id);
    return native.clearInterval(id);
  };

  // --- animation frames ----------------------------------------------------
  /** @type {Map<number, {chain: number, origin: {file: string, chain: string}}>} */
  const frames = new Map();
  let runningChain = 0;

  g.requestAnimationFrame = function requestAnimationFrame(callback) {
    // chain: how many consecutive frames this callback descends from.
    const record = { chain: runningChain + 1, origin: origin() };
    const id = native.requestAnimationFrame((time) => {
      frames.delete(id);
      const outer = runningChain;
      runningChain = record.chain;
      try {
        return callback(time);
      } finally {
        runningChain = outer;
      }
    });
    frames.set(id, record);
    return id;
  };
  g.cancelAnimationFrame = function cancelAnimationFrame(id) {
    frames.delete(id);
    return native.cancelAnimationFrame(id);
  };

  // --- observers -----------------------------------------------------------
  /** @type {Map<object, {name: string, targets: Set<Node>, origin: {file: string, chain: string}}>} */
  const observers = new Map();

  for (const name of ['MutationObserver', 'ResizeObserver', 'IntersectionObserver']) {
    const Native = g[name];
    if (typeof Native !== 'function') continue;
    const Tracked = class extends Native {
      constructor(...args) {
        super(...args);
        this.__renRecord = { name, targets: new Set(), origin: origin() };
      }
      observe(target, ...rest) {
        super.observe(target, ...rest);
        this.__renRecord.targets.add(target);
        observers.set(this, this.__renRecord);
      }
      unobserve(target) {
        super.unobserve(target);
        this.__renRecord.targets.delete(target);
        if (!this.__renRecord.targets.size) observers.delete(this);
      }
      disconnect() {
        super.disconnect();
        this.__renRecord.targets.clear();
        observers.delete(this);
      }
    };
    Object.defineProperty(Tracked, 'name', { value: name });
    g[name] = Tracked;
  }

  // --- page state ----------------------------------------------------------
  const roots = () => [document.documentElement, document.head, document.body];
  const initialNodes = new Set(roots().flatMap((root) => [...root.childNodes]));
  const attributesOf = (element) => Object.fromEntries([...element.attributes].map((a) => [a.name, a.value]));
  // <html>, <body> and what was in <body> to begin with: where scroll locks and `inert` land.
  const initialAttributes = new Map([document.documentElement, document.body, ...document.body.children].map((el) => [el, attributesOf(el)]));

  const pageState = () => {
    const entries = [];
    for (const root of roots()) {
      for (const node of root.childNodes) {
        if (initialNodes.has(node) || node.nodeType !== Node.ELEMENT_NODE) continue;
        // The mount helper adds the component stylesheets; they are not the component's doing.
        if (node.localName === 'link' && node.rel === 'stylesheet') continue;
        entries.push({ kind: 'node', label: `node ${describeNode(node)} added to ${describeNode(root)}`, where: '' });
      }
    }
    for (const [element, before] of initialAttributes) {
      const now = attributesOf(element);
      for (const name of new Set([...Object.keys(before), ...Object.keys(now)])) {
        if (before[name] === now[name]) continue;
        const value = name in now ? `"${now[name]}"` : 'removed';
        entries.push({ kind: 'attribute', label: `attribute ${describeNode(element)}[${name}] = ${value}`, where: '' });
      }
    }
    return entries;
  };

  g.__renResources = {
    /**
     * Everything currently held, one entry per resource. The label names the
     * resource and the file that acquired it; `where` adds the call chain.
     */
    snapshot() {
      const entries = [];
      const entry = (kind, what, from, extra) => entries.push({ kind, label: `${what} [${from.file}]`, where: from.chain, ...extra });
      for (const [target, records] of listeners) {
        const name = describeTarget(target);
        if (name === null) continue;
        for (const r of records) entry('listener', `listener ${name} ${r.type}${r.capture ? ' (capture)' : ''}`, r.origin);
      }
      // Two significant digits: a countdown resumed with 59 884 ms left is the
      // same timer as one resumed with 59 921, and should count as one label.
      const roughly = (ms) => {
        const rounded = Number(ms.toPrecision(2));
        return rounded === ms ? `${ms}ms` : `~${rounded}ms`;
      };
      for (const timer of timers.values()) entry(timer.kind, `${timer.kind} ${roughly(timer.delay)}`, timer.origin, { delay: timer.delay });
      for (const frame of frames.values()) {
        const loop = frame.chain > 3 ? ' (a loop: it has re-requested itself every frame)' : '';
        entry('frame', 'animation frame', { file: frame.origin.file, chain: `${frame.origin.chain}${loop}` });
      }
      for (const record of observers.values()) {
        const targets = [...record.targets].map((t) => (t.isConnected ? describeNode(t) : 'the removed subtree'));
        entry('observer', `${record.name} on ${[...new Set(targets)].sort().join(', ')}`, record.origin);
      }
      entries.push(...pageState());
      return entries.sort((a, b) => a.label.localeCompare(b.label));
    },
    /**
     * Listeners on `root` and its descendants, as labels. Not a leak by
     * themselves (they go when the subtree goes), but a component that adds
     * them again on every connect without removing them on disconnect ends up
     * running each handler twice after a reconnect.
     */
    listenersWithin(root) {
      const found = [];
      for (const [target, records] of listeners) {
        if (!(target instanceof Node) || !root.contains(target)) continue;
        for (const r of records) {
          const what = `${r.type}${r.capture ? ' (capture)' : ''} [${r.origin.file}]`;
          found.push({
            // What to compare by: the element's classes and id change as it is
            // used, and a re-render replaces the node, so neither is part of it.
            key: `${target.nodeName} ${what}`,
            label: `listener ${describeNode(target)} ${what}`,
          });
        }
      }
      return found;
    },
    /** Component and util call sites that acquired something since install. */
    sites: () => [...sites].sort(),
  };
}

/** Kinds that drain on their own: wait for them instead of reporting them. */
const TRANSIENT = new Set(['timeout', 'frame']);

/**
 * @typedef {{kind: string, label: string, where: string, delay?: number}} Entry
 * @typedef {Map<string, {count: number, kind: string, where: string[]}>} Held
 */

/**
 * Patch the page. Call from the `beforeMount` hook of mountRegistry.
 * @param {import('@playwright/test').Page} page
 */
async function installResourceAccounting(page) {
  // Playwright builds its own main-world helper the first time it needs one
  // (mountRegistry's waitForFunction does). That helper adds window listeners
  // and a MutationObserver and captures the timer functions, so make it exist
  // before the patch: it then runs on the native functions and is never counted.
  await page.waitForFunction(() => true);
  await page.evaluate(instrument);
}

/**
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<Entry[]>}
 */
function takeSnapshot(page) {
  return page.evaluate(() => /** @type {any} */ (window).__renResources.snapshot());
}

/**
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<string[]>}
 */
function acquisitionSites(page) {
  return page.evaluate(() => /** @type {any} */ (window).__renResources.sites());
}

/** label → count, from a list of entries or of labels. */
function tally(items) {
  const counts = new Map();
  for (const item of items) {
    const label = typeof item === 'string' ? item : item.label;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return counts;
}

/**
 * Timers and frames still pending in a snapshot, not counting the shared
 * ones that are allowed to be.
 * @param {Entry[]} snapshot
 * @param {string[]} [shared] accounting labels of module-level singletons
 */
function pending(snapshot, shared = []) {
  const budget = tally(shared);
  return snapshot.filter((entry) => {
    if (!TRANSIENT.has(entry.kind)) return false;
    const left = budget.get(entry.label) ?? 0;
    budget.set(entry.label, left - 1);
    return left <= 0;
  });
}

/**
 * What a snapshot holds beyond a baseline.
 * @param {Entry[]} baseline
 * @param {Entry[]} current
 * @returns {Held}
 */
function residue(baseline, current) {
  const before = tally(baseline);
  const extra = new Map();
  for (const [label, count] of tally(current)) {
    const net = count - (before.get(label) ?? 0);
    if (net <= 0) continue;
    const matching = current.filter((entry) => entry.label === label);
    extra.set(label, {
      count: net,
      kind: matching[0].kind,
      where: [...new Set(matching.map((entry) => entry.where).filter(Boolean))],
    });
  }
  return extra;
}

/**
 * Judge what was held after each removal. Pure: no page involved.
 *
 * A label passes when it is never held, or when it is a declared module-level
 * singleton and behaves like one: a listener, observer or node is held exactly
 * as often as declared after every removal; a timer or frame never more often.
 * Everything else is a problem, worded by how the count moved:
 *
 *   grows                more after later removals than after earlier ones
 *   constant             the same after every removal: a singleton nobody declared,
 *                        or a listener left on an element that outlives the component
 *   some states only     left behind by some removals and not by others
 *   never held           declared as shared but not observed: a stale declaration
 *
 * @param {Array<{step: string, held: Held}>} steps one entry per removal, in order
 * @param {string[]} [shared] accounting labels of module-level singletons
 * @returns {string[]} one line per problem, empty when clean
 */
function judge(steps, shared = []) {
  const allowedFor = tally(shared);
  const labels = new Set([...allowedFor.keys(), ...steps.flatMap(({ held }) => [...held.keys()])]);
  const problems = [];
  for (const label of [...labels].sort()) {
    const series = steps.map(({ held }) => held.get(label)?.count ?? 0);
    const allowed = allowedFor.get(label) ?? 0;
    const kind = steps.map(({ held }) => held.get(label)?.kind).find(Boolean);
    const seen = series.some((count) => count > 0);
    const within = TRANSIENT.has(kind)
      ? series.every((count) => count <= allowed)
      : series.every((count) => count === allowed);
    if (within && (seen || !allowed)) continue;

    const firstOver = steps[series.findIndex((count) => count > allowed)]?.step;
    let verdict;
    if (!seen) verdict = 'declared as shared but never held: remove the declaration';
    else if (series[series.length - 1] > series.find((count) => count > 0)) verdict = `grows with every instance (first left behind when removed ${firstOver})`;
    else if (series.every((count) => count === series[0])) {
      verdict = label.startsWith('listener <')
        ? 'left on an element that stays in the page, by every removal: remove it on teardown'
        : 'left behind by every removal, without growing: release it, or declare it as shared if it is a deliberate module-level singleton';
    }
    else verdict = `left behind when removed ${firstOver ?? 'in some states only'}`;
    const where = [...new Set(steps.flatMap(({ held }) => held.get(label)?.where ?? []))];
    problems.push(`${label}: ${series.join(' → ')} (allowed ${allowed}); ${verdict}${where.map((site) => `\n      acquired at ${site}`).join('')}`);
  }
  return problems;
}

module.exports = { TRANSIENT, instrument, installResourceAccounting, takeSnapshot, acquisitionSites, pending, residue, judge };
