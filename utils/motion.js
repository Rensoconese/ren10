/* ============================================
   RenDS — Motion helper
   ============================================
   Tiny, zero-dependency coordinator for component
   enter/exit transitions. Pairs with:
     · tokens/semantic/motion.css  (duration + ease)
     · base/motion-presets.css     (keyframes)

   Why this exists:
     Native <dialog>, Popover API, etc. all support
     @starting-style + allow-discrete, but many
     components still need JS to sequence:
       1. Mount → paint → trigger enter
       2. Request exit → wait for animationend → unmount
     This helper does step 2 correctly in a tiny API.

   API:

     import { setMotionState, motionMount, motionUnmount,
              applyStagger, prefersReducedMotion } from './motion.js';

     // 1. Flip a data-state="open|closed" with proper
     //    event-based unmount. Returns a Promise that
     //    resolves when the transition finishes (or
     //    immediately if reduced-motion).
     await setMotionState(el, 'open');    // enter
     await setMotionState(el, 'closed');  // exit

     // 2. Mount helper: appends child, triggers enter.
     await motionMount(parent, child, { motion: 'slide-up' });

     // 3. Unmount helper: plays exit, then removes.
     await motionUnmount(child);

     // 4. Stagger helper: assigns --ren-stagger-i per child.
     applyStagger(listEl);  // optional step override: applyStagger(el, { step: 60 })

     // 5. Reduced motion check.
     if (prefersReducedMotion()) { … }
   ============================================ */

const MQ = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : null;

/** Returns true if the user prefers reduced motion. */
export function prefersReducedMotion() {
  return !!(MQ && MQ.matches);
}

/**
 * Wait for the next animation or transition to finish on `el`.
 * Resolves immediately under reduced motion or if nothing runs
 * within one frame + a small safety window.
 */
export function waitForMotion(el, { timeout = 800 } = {}) {
  if (prefersReducedMotion()) return Promise.resolve();
  if (!el) return Promise.resolve();
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      el.removeEventListener('animationend', finish);
      el.removeEventListener('transitionend', finish);
      resolve();
    };
    el.addEventListener('animationend', finish, { once: true });
    el.addEventListener('transitionend', finish, { once: true });
    // Safety: if nothing runs, bail gracefully.
    setTimeout(finish, timeout);
  });
}

/**
 * Flip `data-state` on `el` to 'open' or 'closed' and wait for
 * the resulting animation / transition to complete.
 *
 * Assumes the element uses `data-motion="…"` or its own CSS
 * keyed on `data-state`.
 */
export async function setMotionState(el, state /* 'open' | 'closed' */) {
  if (!el) return;
  // Writing the same value doesn't re-trigger animations; force reflow.
  if (el.dataset.state !== state) {
    el.dataset.state = state;
  } else {
    const prev = state === 'open' ? 'closed' : 'open';
    el.dataset.state = prev;
    // Force reflow so the browser registers the toggle.
    void el.offsetWidth; // eslint-disable-line no-unused-expressions
    el.dataset.state = state;
  }
  await waitForMotion(el);
}

/**
 * Mount `child` into `parent`, set `data-motion` + `data-state="open"`,
 * and resolve once the enter animation finishes.
 *
 * @param {Element} parent
 * @param {Element} child
 * @param {{motion?: string}} opts
 */
export async function motionMount(parent, child, { motion = 'fade' } = {}) {
  if (!parent || !child) return;
  child.dataset.motion = motion;
  child.dataset.state = 'closed';
  parent.appendChild(child);
  // Two rAFs to guarantee paint-before-toggle (Chromium needs this).
  await new Promise(requestAnimationFrame);
  await new Promise(requestAnimationFrame);
  await setMotionState(child, 'open');
}

/**
 * Set state to 'closed', wait for exit animation, then remove from DOM.
 *
 * Idempotent: safe to call twice.
 */
export async function motionUnmount(el) {
  if (!el || !el.parentNode) return;
  await setMotionState(el, 'closed');
  el.remove();
}

/**
 * Assign --ren-stagger-i to each direct child of `container` so
 * CSS can apply an incremental delay. Caps at --motion-stagger-max.
 *
 * @param {Element} container
 * @param {{step?: number}} [opts] optional per-call override in ms
 */
export function applyStagger(container, { step } = {}) {
  if (!container) return;
  const kids = Array.from(container.children);
  const max = kids.length;
  kids.forEach((k, i) => {
    const clamped = Math.min(i, 9);  // pairs with --motion-stagger-max default
    k.style.setProperty('--ren-stagger-i', String(clamped));
    if (step != null) {
      k.style.setProperty('--motion-stagger-step', `${step}ms`);
    }
  });
  return max;
}

/**
 * Run a callback on every subsequent change of `prefers-reduced-motion`.
 * Returns an unsubscribe function.
 */
export function onReducedMotionChange(cb) {
  if (!MQ) return () => {};
  const handler = (e) => cb(e.matches);
  MQ.addEventListener('change', handler);
  return () => MQ.removeEventListener('change', handler);
}
