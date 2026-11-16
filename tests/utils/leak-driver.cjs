// @ts-check
/**
 * Drives a mounted component the way the leak tests need it driven
 * (tests/components/leaks.spec.cjs): make it acquire what it can, bring it to
 * a given state, and take it out of the page.
 *
 * It extends what runtime-smoke does (lifecycle methods twice, activate the
 * first control) with pointer, focus and real keys, because most of what a
 * component acquires outside its subtree is acquired on interaction: a
 * `document` listener on open, a timer on hover, an interval on press-and-hold.
 */

/** The lifecycle methods runtime-smoke calls: argument-free and idempotent. */
const LIFECYCLE_METHODS = ['open', 'close', 'toggle', 'show', 'hide'];

/**
 * The state a component is in when it is removed. Leaks hide in the last two:
 * close() usually cleans up, disconnectedCallback often does not.
 *
 *   idle     driven, then closed and released (its closing timers still pending)
 *   open     left open, hovered and pressed, and given time to finish opening
 *   opening  opened, pressed and removed in one task, with its timers pending
 */
const STATES = ['idle', 'open', 'opening'];

/**
 * Runs in the page. Install it before the resource accounting, so its own
 * frames and guards use the native functions and are never counted.
 */
function installPageDriver() {
  const g = /** @type {any} */ (window);
  const nextFrame = g.requestAnimationFrame.bind(g);
  const listen = EventTarget.prototype.addEventListener;

  // A driven click must not navigate away from the fixture. These run last
  // (window, bubble phase), after the component had its say.
  listen.call(g, 'click', (event) => {
    if (!event.defaultPrevented && event.target?.closest?.('a[href]')) event.preventDefault();
  });
  listen.call(g, 'submit', (event) => {
    if (!event.defaultPrevented) event.preventDefault();
  });

  const host = () => document.getElementById('host');
  const defined = (el) => el.localName.startsWith('ren-') && customElements.get(el.localName) !== undefined;
  const elements = () => [...host().querySelectorAll('*')].filter(defined);
  const outermost = () => elements().filter((el) => {
    for (let parent = el.parentElement; parent && parent !== host(); parent = parent.parentElement) {
      if (defined(parent)) return false;
    }
    return true;
  });
  const CONTROLS = 'button, summary, a[href], input:not([type="hidden"]), select, textarea, [tabindex], [role="menuitem"], [role="tab"], [role="option"], [role="slider"]';
  const controls = () => [...host().querySelectorAll(CONTROLS)];
  // The first control runtime-smoke would activate, per component. Never a
  // file input: a click that follows a real key press may open a file chooser.
  const FIRST_CONTROL = 'button, summary, [role="menuitem"], [role="tab"], [role="option"], input:not([type="hidden"]):not([type="file"])';
  const frames = (count) => new Promise((resolve) => {
    const step = (left) => (left <= 0 ? resolve(undefined) : nextFrame(() => step(left - 1)));
    step(count);
  });

  const fire = (target, type) => {
    const rect = target.getBoundingClientRect?.() ?? { left: 0, top: 0, width: 0, height: 0 };
    const init = {
      bubbles: !/(enter|leave)$/.test(type),
      cancelable: true,
      composed: true,
      view: g,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
      button: 0,
      buttons: /down$/.test(type) ? 1 : 0,
    };
    target.dispatchEvent(type.startsWith('pointer')
      ? new PointerEvent(type, { pointerId: 1, pointerType: 'mouse', isPrimary: true, ...init })
      : new MouseEvent(type, init));
  };
  const hover = (el) => ['pointerover', 'pointerenter', 'mouseover', 'mouseenter', 'pointermove', 'mousemove'].forEach((type) => fire(el, type));
  const leave = (el) => ['pointerout', 'pointerleave', 'mouseout', 'mouseleave'].forEach((type) => fire(el, type));
  const press = (el) => ['pointerdown', 'mousedown'].forEach((type) => fire(el, type));
  const release = (el) => ['pointerup', 'mouseup'].forEach((type) => fire(el, type));
  const call = (el, method) => {
    if (typeof el[method] !== 'function') return false;
    try { el[method](); } catch { /* runtime-smoke reports what lifecycle methods throw */ }
    return true;
  };

  /** Per-component hooks, set through `use`. */
  let hooks = {};

  const unmount = (rootSelector) => {
    hooks.teardown?.();
    // A function-initialised component stays in the page: its teardown is the release.
    if (rootSelector) return host().querySelectorAll(rootSelector).length;
    const roots = outermost();
    for (const el of roots) el.remove();
    return roots.length;
  };

  g.__leakDriver = {
    frames,
    use(own) {
      hooks = own;
    },
    tags: () => [...new Set(elements().map((el) => el.localName))],
    async mount(html) {
      host().innerHTML = html;
      await hooks.init?.();
    },
    init: () => hooks.init?.(),
    drive: () => hooks.drive?.(),
    /**
     * Pointer and focus on every element of the usage, one after the other,
     * then the page-level events components listen for.
     */
    async touch() {
      for (const el of [...host().querySelectorAll('*')].slice(0, 200)) {
        if (!el.isConnected) continue;
        hover(el);
        if (el.matches(CONTROLS)) el.focus({ preventScroll: true });
        press(el);
        release(el);
        if (el === document.activeElement) el.blur();
        leave(el);
      }
      g.dispatchEvent(new Event('resize'));
      document.dispatchEvent(new Event('scroll'));
      await frames(2);
    },
    /** The lifecycle methods, twice, to reach re-entry. */
    async lifecycle(methods) {
      for (let pass = 0; pass < 2; pass += 1) {
        for (const el of elements()) for (const method of methods) call(el, method);
        await frames(1);
      }
    },
    /** Click the first control of each component, then every control outside one (external triggers). */
    async activate() {
      for (const el of outermost()) el.querySelector(FIRST_CONTROL)?.click();
      await frames(2);
      for (const control of controls()) {
        if (!control.isConnected || control.matches('input[type="file"]')) continue;
        if (!elements().some((el) => el.contains(control))) control.click();
      }
      await frames(2);
    },
    /**
     * Take every component out and put it back where it was, as runtime-smoke
     * does, so what is removed at the end is an instance that connected twice.
     * A function-initialised component is torn down and initialised again.
     *
     * Returns the listeners the component's own subtree gained by it, when the
     * resource accounting is installed: connecting again must not add a second
     * copy of what disconnecting did not remove.
     */
    async reconnect(rootSelector) {
      const roots = rootSelector ? [...host().querySelectorAll(rootSelector)] : outermost();
      const own = () => roots.map((el) => g.__renResources?.listenersWithin(el) ?? []);
      const before = own();
      if (rootSelector) {
        hooks.teardown?.();
        await hooks.init?.();
      } else {
        for (const el of roots) {
          const parent = el.parentNode;
          const next = el.nextSibling;
          el.remove();
          parent.insertBefore(el, next);
        }
      }
      await frames(2);
      return own().flatMap((after, index) => {
        const had = before[index].map((listener) => listener.key);
        // Multiset difference: what is there now that was not there before.
        return after.filter((listener) => {
          const at = had.indexOf(listener.key);
          if (at === -1) return true;
          had.splice(at, 1);
          return false;
        }).map((listener) => listener.label);
      });
    },
    focusFirst() {
      controls()[0]?.focus({ preventScroll: true });
    },
    /** Close everything and let go of the pointer. */
    async rest() {
      for (const el of elements()) {
        call(el, 'close');
        call(el, 'hide');
      }
      release(document.documentElement);
      for (const control of controls()) leave(control);
      await frames(2);
    },
    /** Open everything, then hover and focus the first control. */
    engage() {
      for (const el of outermost()) {
        if (!call(el, 'open') && !call(el, 'show')) el.querySelector(FIRST_CONTROL)?.click();
      }
      hooks.engage?.();
      const first = controls()[0];
      if (first) {
        hover(first);
        first.focus({ preventScroll: true });
      }
    },
    /** Put the pointer down on everything matching `selector` (default: the first control) and keep it down. */
    hold(selector) {
      for (const held of selector ? host().querySelectorAll(selector) : controls().slice(0, 1)) {
        hover(held);
        press(held);
      }
    },
    /** Open, press and remove in one task: before any timer or frame the opening scheduled. */
    engageAndUnmount(holdSelector, rootSelector) {
      this.engage();
      this.hold(holdSelector);
      return unmount(rootSelector);
    },
    unmount,
    /** Empty the host for the next mount. */
    clear() {
      host().replaceChildren();
    },
    /**
     * Empty the host, but keep what was left of the usage (an external
     * trigger, say) connected, out of the way. A listener a removed component
     * left on it then still holds that component, as it would in a real page.
     */
    retire() {
      let kept = document.getElementById('leak-driver-kept');
      if (!kept) {
        kept = document.createElement('div');
        kept.id = 'leak-driver-kept';
        kept.hidden = true;
        document.body.append(kept);
      }
      kept.append(...host().childNodes);
    },
  };
}

/** Call a method of the page driver. */
const driver = (page, method, ...args) => page.evaluate(
  ([name, params]) => /** @type {any} */ (window).__leakDriver[name](...params),
  [method, args]
);

/**
 * @typedef {object} ComponentDriver
 * @property {(usage: string) => string} [edit] rewrite the registry usage before mounting
 * @property {string} [root] selector of a function-initialised component (no custom element):
 *   it is torn down through `teardown` and stays in the page
 * @property {string} [hold] what the pointer stays pressed on in the open states (default: the first control)
 * @property {() => {init?: Function, drive?: Function, engage?: Function, teardown?: Function}} [inPage]
 *   runs once in the page and returns hooks: init() after every mount, drive() while
 *   the component is being driven, engage() when it is opened, teardown() before removal
 */

/**
 * Install the page driver and a component's own hooks.
 * @param {import('@playwright/test').Page} page
 * @param {ComponentDriver} [own]
 */
async function installDriver(page, own = {}) {
  await page.evaluate(installPageDriver);
  if (!own.inPage) return;
  const hooks = await page.evaluateHandle(own.inPage);
  await page.evaluate((value) => /** @type {any} */ (window).__leakDriver.use(value), hooks);
  await hooks.dispose();
}

/**
 * Drive a mounted component into `state` and remove it.
 *
 * @param {import('@playwright/test').Page} page
 * @param {ComponentDriver} own
 * @param {string} state one of STATES
 * @param {() => Promise<unknown>} opened waits for what the component scheduled while opening
 * @returns {Promise<{removed: number, regrown: string[]}>} how many roots were removed (or torn
 *   down), and the listeners the component's own subtree gained by reconnecting
 */
async function driveAndRemove(page, own, state, opened) {
  const { root = null, hold = null } = own;
  await driver(page, 'touch');
  await driver(page, 'lifecycle', LIFECYCLE_METHODS);
  await driver(page, 'activate');
  await driver(page, 'drive');
  // Mid-use, whatever state that left it in: what the first connection
  // acquired has to be released here, or it shows up after the final removal.
  const regrown = await driver(page, 'reconnect', root);
  // Again: some components only render their controls once they are open.
  await driver(page, 'touch');
  await driver(page, 'focusFirst');
  // Real keys: open from the keyboard, type ahead, dismiss.
  for (const key of ['ArrowDown', 'a', 'Escape']) await page.keyboard.press(key);
  const remove = async () => {
    if (state === 'idle') {
      await driver(page, 'rest');
      await page.keyboard.press('Escape');
      return driver(page, 'unmount', root);
    }
    if (state === 'opening') return driver(page, 'engageAndUnmount', hold, root);
    await driver(page, 'engage');
    await opened();
    await driver(page, 'hold', hold);
    // Long enough for a press-and-hold to start repeating.
    await opened();
    return driver(page, 'unmount', root);
  };
  return { removed: await remove(), regrown };
}

module.exports = { STATES, LIFECYCLE_METHODS, installDriver, driver, driveAndRemove };
