// @ts-check
/**
 * checkPattern: prove that a mounted component follows a WAI-ARIA Authoring
 * Practices Guide (APG) pattern.
 *
 * Three files work together:
 *
 *   patterns.cjs      what each APG pattern requires: declarative rules for
 *                     roles, states, properties and relationships, plus a
 *                     readable keyboard script.
 *   pattern-map.cjs   which registry component implements which pattern, where
 *                     the pattern's parts live in its markup, and the recorded
 *                     deviations with their reasons.
 *   this file         the engine that evaluates the rules against the page.
 *
 * Roles and accessible names come from Playwright's role engine, which
 * computes them in the page from attributes and element semantics. It is the
 * same code in Chromium, Firefox and WebKit, and it never asks the browser's
 * accessibility tree. States are read from the ARIA attribute or from the
 * native HTML state that maps to it (`checked`, `open`, `:modal`, `value`...),
 * because APG prefers native semantics where they exist.
 *
 * Every check is a poll: it re-reads the page until the rule holds or the
 * timeout expires, so nothing here depends on transition timing.
 */
const { expect, test } = require('@playwright/test');

const IDREF_ATTRIBUTES = ['aria-controls', 'aria-labelledby', 'aria-describedby', 'aria-activedescendant', 'aria-owns'];
const POLL = { timeout: 3000, intervals: [25, 50, 100, 200] };

/* ── In-page helpers (serialised into the page; they must stay self-contained) ── */

/** `<button#id.class> "text"` for failure messages. */
const describeElements = (elements) => elements.map((el) => {
  const id = el.id ? `#${el.id}` : '';
  const cls = typeof el.className === 'string' && el.className.trim() ? `.${el.className.trim().split(/\s+/).join('.')}` : '';
  const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 24);
  return `<${el.localName}${id}${cls}>${text ? ` "${text}"` : ''}`;
});

/**
 * The value of an ARIA state or property: the attribute when it is set,
 * otherwise the native HTML state that maps to it. Returns null when neither
 * exists.
 */
const readStates = (elements, attr) => elements.map((el) => {
  const explicit = el.getAttribute(attr);
  if (explicit !== null) return explicit;
  const tag = el.localName;
  const type = el.getAttribute('type') || '';
  const isRange = tag === 'input' && type === 'range';
  const isNumber = tag === 'input' && type === 'number';
  switch (attr) {
    case 'aria-checked':
      if (tag === 'input' && (type === 'checkbox' || type === 'radio')) return el.indeterminate ? 'mixed' : String(el.checked);
      return null;
    case 'aria-expanded': {
      // <summary> is exposed as an expandable button whose state is <details open>.
      const details = tag === 'summary' ? el.parentElement : null;
      return details?.localName === 'details' ? String(details.open) : null;
    }
    case 'aria-modal':
      return tag === 'dialog' && el.matches(':modal') ? 'true' : null;
    case 'aria-disabled':
      return 'disabled' in el ? String(el.matches(':disabled')) : null;
    case 'aria-valuenow':
      if (isRange) return el.value;
      if (isNumber) return el.value === '' ? null : el.value;
      if (tag === 'progress' || tag === 'meter') return String(el.value);
      return null;
    case 'aria-valuemin':
      if (isRange) return el.min || '0';
      if (isNumber) return el.min || null;
      return null;
    case 'aria-valuemax':
      if (isRange) return el.max || '100';
      if (isNumber) return el.max || null;
      return null;
    case 'aria-selected':
      return tag === 'option' ? String(el.selected) : null;
    case 'aria-invalid':
      return typeof el.checkValidity === 'function' && el.willValidate ? String(!el.checkValidity()) : null;
    default:
      return null;
  }
});

/** Faded out completely: rendered, with a box, and still nothing to see. */
const isTransparent = (el) => {
  for (let node = el; node instanceof Element; node = node.parentElement) {
    if (getComputedStyle(node).opacity === '0') return true;
  }
  return false;
};

/** Every IDREF attribute under `root` must point at elements that exist. */
const findBrokenReferences = (root, attributes) => {
  const problems = [];
  const selector = attributes.map((name) => `[${name}]`).join(',');
  const elements = [...root.querySelectorAll(selector)];
  if (root.matches?.(selector)) elements.unshift(root);
  for (const el of elements) {
    for (const name of attributes) {
      if (!el.hasAttribute(name)) continue;
      const ids = el.getAttribute(name).trim().split(/\s+/).filter(Boolean);
      const who = `<${el.localName}${el.id ? `#${el.id}` : ''}>`;
      if (!ids.length) problems.push(`${who} has an empty ${name}`);
      for (const id of ids) {
        const matches = document.querySelectorAll(`[id="${CSS.escape(id)}"]`).length;
        if (matches === 0) problems.push(`${who} ${name}="${id}" points at nothing`);
        else if (matches > 1) problems.push(`${who} ${name}="${id}" is ambiguous: ${matches} elements share that id`);
      }
    }
  }
  return problems;
};

/* ── Engine ── */

class PatternCheck {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {{ key: string, dir: string, pattern: any, implementation: any }} context
   */
  constructor(page, { key, dir, pattern, implementation }) {
    this.page = page;
    this.component = key;
    this.dir = dir;
    this.pattern = pattern;
    this.implementation = implementation;
    this.expect = expect;
    /** Deviations by the rule or key they replace. */
    this.deviations = new Map((implementation.deviations ?? []).map((deviation) => [deviation.rule, deviation]));
    this.usedDeviations = new Set();
    /** The element a dialog was opened from, set by the dialog patterns: focus returns to it. */
    this.invoker = null;
  }

  /** Where the registry usage is mounted. */
  get host() { return this.page.locator('#host'); }
  /** Focusable sentinels around the usage, so Tab never has to leave the page. */
  get before() { return this.page.locator('#apg-before'); }
  get after() { return this.page.locator('#apg-after'); }

  /**
   * A named part of the pattern in this component: the selector the map gives,
   * or by default every element under the usage with the part's role.
   * @param {string} name
   * @returns {import('@playwright/test').Locator}
   */
  part(name) {
    const custom = this.implementation.parts?.[name];
    if (typeof custom === 'string') return this.page.locator(custom);
    if (typeof custom === 'function') return custom(this.page);
    const definition = this.pattern.parts?.[name];
    if (!definition) throw new Error(`${this.dir}: the ${this.pattern.name} pattern needs a "${name}" part; name its selector in the map`);
    if (definition.selector) return this.host.locator(definition.selector);
    return this.host.getByRole(definition.role, { includeHidden: true });
  }

  /** Whether the map or the pattern says where a part lives. */
  hasPart(name) {
    return Boolean(this.implementation.parts?.[name] ?? this.pattern.parts?.[name]);
  }

  /** True when the component's contract promises an optional key or feature. */
  claims(feature) { return (this.implementation.claims ?? []).includes(feature); }

  /** A component-specific action the pattern needs (open, show...), from the map. */
  async act(name, ...args) {
    const action = this.implementation.actions?.[name];
    if (!action) throw new Error(`${this.dir}: the ${this.pattern.name} pattern needs an "${name}" action in the map`);
    return action(this, ...args);
  }

  async press(key) { await this.page.keyboard.press(key); }

  /** Move focus onto the widget the way a keyboard user does: Tab from before it. */
  async tabInto() {
    await this.before.focus();
    await this.press('Tab');
  }

  /** On screen for a sighted user: rendered, not visibility:hidden, not faded to nothing. */
  async isShown(locator) {
    return (await locator.isVisible()) && !(await locator.evaluate(isTransparent));
  }

  /** Wait until an element is on screen, or gone from it. */
  async expectShown(locator, shown, message) {
    await expect.poll(() => this.isShown(locator), { ...POLL, message }).toBe(shown);
  }

  async labels(locator) { return locator.evaluateAll(describeElements); }
  async states(locator, attr) { return locator.evaluateAll(readStates, attr); }
  async state(locator, attr) { return (await this.states(locator, attr))[0] ?? null; }

  /** Does each element carry one of these roles? Returns the indexes that do not. */
  async withoutRole(locator, roles) {
    const count = await locator.count();
    let matching = 0;
    for (const role of roles) matching += await locator.and(this.page.getByRole(role, { includeHidden: true })).count();
    // A <summary> has no ARIA role of its own; browsers expose it as a button
    // that expands and collapses its <details>.
    const summaries = roles.includes('button')
      ? await locator.evaluateAll((els) => els.map((el) => el.localName === 'summary' && el.parentElement?.localName === 'details' && el.parentElement.querySelector(':scope > summary') === el))
      : [];
    matching += summaries.filter(Boolean).length;
    if (matching >= count) return [];
    const offenders = [];
    for (let i = 0; i < count; i += 1) {
      if (summaries[i]) continue;
      let ok = false;
      for (const role of roles) ok = ok || (await locator.nth(i).and(this.page.getByRole(role, { includeHidden: true })).count()) > 0;
      if (!ok) offenders.push(i);
    }
    return offenders;
  }

  /**
   * Evaluate one declarative rule against the page right now.
   * @returns {Promise<string[]>} what is wrong; empty when the rule holds
   */
  async violations(rule) {
    if (rule.check) return rule.check(this);
    if (rule.optional && !this.hasPart(rule.part)) return [];
    const part = this.part(rule.part);
    const count = await part.count();
    if (count === 0) return rule.optional ? [] : [`found no "${rule.part}" element`];
    const labels = await this.labels(part);
    const problems = [];

    if (rule.role) {
      const roles = [].concat(rule.role);
      for (const index of await this.withoutRole(part, roles)) problems.push(`${labels[index]} does not have role ${roles.join(' or ')}`);
    }

    if (rule.named) {
      for (let i = 0; i < count; i += 1) {
        const named = await expect(part.nth(i)).toHaveAccessibleName(/\S/, { timeout: 1 }).then(() => true, () => false);
        if (!named) problems.push(`${labels[i]} has no accessible name`);
      }
    }

    if (rule.inside) {
      const containers = await this.part(rule.inside).elementHandles();
      const contained = await part.evaluateAll((els, parents) => els.map((el) => parents.some((parent) => {
        if (parent !== el && parent.contains(el)) return true;
        const owned = (parent.getAttribute('aria-owns') || '').split(/\s+/).filter(Boolean);
        return owned.some((id) => document.getElementById(id)?.contains(el));
      })), containers);
      contained.forEach((ok, index) => { if (!ok) problems.push(`${labels[index]} is not inside (or owned by) a "${rule.inside}" element`); });
    }

    if (rule.attr && rule.oneOf) {
      const values = await this.states(part, rule.attr);
      values.forEach((value, index) => {
        if (!rule.oneOf.includes(value)) problems.push(`${labels[index]} has ${rule.attr}=${JSON.stringify(value)}, expected ${rule.oneOf.map((v) => JSON.stringify(v)).join(' or ')}`);
      });
    }

    if (rule.attr && rule.exactly !== undefined) {
      const values = await this.states(part, rule.attr);
      const hits = values.filter((value) => value === rule.value).length;
      if (hits !== rule.exactly) problems.push(`${hits} "${rule.part}" element(s) have ${rule.attr}="${rule.value}", expected ${rule.exactly} (${values.map((v) => JSON.stringify(v)).join(', ')})`);
    }

    if (rule.ref) {
      const targets = await this.part(rule.to).elementHandles();
      const results = await part.evaluateAll((els, { attr, wanted }) => els.map((el) => {
        const ids = (el.getAttribute(attr) || '').trim().split(/\s+/).filter(Boolean);
        return { ids, found: ids.map((id) => wanted.indexOf(document.getElementById(id))) };
      }), { attr: rule.ref, wanted: targets });
      results.forEach(({ ids, found }, index) => {
        if (!ids.length) problems.push(`${labels[index]} has no ${rule.ref}`);
        else if (found.every((position) => position === -1)) problems.push(`${labels[index]} ${rule.ref}="${ids.join(' ')}" does not point at a "${rule.to}" element`);
        else if (rule.pairwise && !found.includes(index)) problems.push(`${labels[index]} ${rule.ref}="${ids.join(' ')}" points at another ${rule.to}, not its own`);
      });
    }

    if (rule.tracks) {
      // The state must say what is really on screen: `true` exactly while the
      // paired element is visible. With as many targets as elements they pair
      // up in order (tab 2 with panel 2); otherwise the first target stands
      // for the content.
      const values = await this.states(part, rule.attr);
      const shown = this.part(rule.tracks.shown);
      const shownCount = await shown.count();
      for (let i = 0; i < count; i += 1) {
        const target = shownCount === count ? shown.nth(i) : shown.first();
        const expected = String(shownCount > 0 && (await this.isShown(target)));
        if (values[i] !== expected) problems.push(`${labels[i]} has ${rule.attr}=${JSON.stringify(values[i])} while its ${rule.tracks.shown} is ${expected === 'true' ? 'visible' : 'hidden'}`);
      }
    }

    return problems;
  }

  /** Poll a rule until it holds; fail with what APG says and what was found. */
  async expectRule(rule) {
    await expect
      .poll(() => this.violations(rule), { ...POLL, message: `${this.dir} · APG ${this.pattern.name} · ${rule.id}: ${rule.text}` })
      .toEqual([]);
  }

  /** Relationship integrity: every IDREF in the document resolves. */
  async expectReferences(label = '') {
    await expect
      .poll(() => this.page.locator('body').evaluate(findBrokenReferences, IDREF_ATTRIBUTES), {
        ...POLL,
        message: `${this.dir} · relationship integrity${label ? ` (${label})` : ''}: every ${IDREF_ATTRIBUTES.join(', ')} points at an element that exists`,
      })
      .toEqual([]);
  }

  /**
   * A rule or key the component deliberately handles differently: run what it
   * does instead. Returns false when no deviation is recorded.
   */
  async deviates(id) {
    const deviation = this.deviations.get(id);
    if (!deviation) return false;
    this.usedDeviations.add(id);
    await test.step(`${id}: recorded deviation, asserting what ${this.dir} does instead`, () => deviation.instead(this));
    return true;
  }

  /**
   * Roles, states, properties and relationships, checked once the widget is in
   * the state where all its parts exist.
   */
  async structure() {
    await test.step(`APG ${this.pattern.name}: roles, states and properties`, async () => {
      for (const rule of this.pattern.rules ?? []) {
        if (this.deviations.has(rule.id)) {
          // A recorded deviation must still deviate; a rule that passes again
          // means the record is stale and has to go.
          const stillDeviates = (await this.violations(rule)).length > 0;
          expect(stillDeviates, `${this.dir}: the recorded deviation for "${rule.id}" is stale — the component now meets the rule; delete the deviation from the pattern map`).toBe(true);
          await this.deviates(rule.id);
          continue;
        }
        await this.expectRule(rule);
      }
      await this.expectReferences('after mount');
    });
  }

  /** States that must follow the real state, re-checked after every key. */
  async live(label) {
    for (const rule of this.pattern.rules ?? []) {
      if (!rule.live) continue;
      const deviation = this.deviations.get(rule.id);
      if (deviation) {
        // What the component does instead has to keep holding too, when its
        // assertion only looks (`live: true`) and can be repeated safely.
        if (deviation.live) await test.step(`${rule.id}: recorded deviation still holds ${label}`, () => deviation.instead(this));
        continue;
      }
      await this.expectRule({ ...rule, text: `${rule.text} [${label}]` });
    }
    await this.expectReferences(label);
  }

  /**
   * One keyboard requirement of the pattern. After the keys are pressed the
   * live states and every relationship are checked again, which is what proves
   * that aria-expanded / aria-selected / aria-checked follow the real state.
   *
   * @param {string} id stable name, used by deviations in the map
   * @param {string} text what APG says the key does
   * @param {() => Promise<void>} body presses the keys and asserts the outcome
   * @param {{ optional?: string }} [options] optional: APG marks the key optional;
   *   it runs only when the component's contract claims that feature
   */
  async key(id, text, body, options = {}) {
    if (options.optional && !this.claims(options.optional)) return;
    await test.step(`${id}: ${text}`, async () => {
      if (!(await this.deviates(id))) await body();
      await this.live(`after ${id}`);
    });
  }

  /** Every deviation in the map must name a rule or key this pattern has. */
  expectDeviationsUsed() {
    const unused = [...this.deviations.keys()].filter((id) => !this.usedDeviations.has(id));
    expect(unused, `${this.dir}: deviations recorded for rules or keys the ${this.pattern.name} check never reached (typo, or a claim that is missing)`).toEqual([]);
  }
}

/**
 * Check one mounted component against one APG pattern.
 *
 * The caller mounts the registry usage first (tests/utils/mount-registry.cjs).
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ key: string, dir: string, pattern: any, implementation: any }} context
 */
async function checkPattern(page, context) {
  const t = new PatternCheck(page, context);
  // Sentinels on both sides of the usage: Tab and Shift+Tab always have a
  // target inside the page (Firefox fires no focusout when focus leaves the
  // document).
  await page.evaluate(() => {
    const sentinel = (id, text) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.id = id;
      button.textContent = text;
      return button;
    };
    const host = document.getElementById('host');
    host.before(sentinel('apg-before', 'Before'));
    host.after(sentinel('apg-after', 'After'));
  });
  await context.implementation.setup?.(t);
  await context.pattern.prepare?.(t);
  await t.structure();
  if (context.pattern.keyboard) {
    await test.step(`APG ${context.pattern.name}: keyboard interaction`, () => context.pattern.keyboard(t));
  }
  t.expectDeviationsUsed();
  return t;
}

module.exports = { checkPattern, PatternCheck, IDREF_ATTRIBUTES };
