/**
 * RenDS — CSS Anchor Positioning helpers
 * =======================================
 * Shared support detection and per-instance anchor wiring for the
 * overlay family (popover, tooltip, hover card), and the side an open
 * overlay actually landed on, which its arrow follows.
 *
 * Why per-instance names matter:
 * `anchor-name` is a document-wide identifier. When every trigger on the
 * page declares the same name, the spec resolves the anchor to the *last*
 * element in tree order, so overlay #1 positions itself against trigger #N.
 * Each pairing therefore needs its own generated name.
 *
 * Usage:
 *   import { createAnchorLink, supportsAnchorPositioning } from './anchor.js';
 *
 *   const link = createAnchorLink(triggerEl, overlayEl, 'ren-popover');
 *   // ... on disconnect
 *   link.release();
 */

let anchorSequence = 0;

/**
 * Feature-detect the CSS Anchor Positioning subset RenDS relies on.
 * @returns {boolean}
 */
export function supportsAnchorPositioning() {
  return (
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('anchor-name', '--ren-anchor') &&
    CSS.supports('position-anchor', '--ren-anchor') &&
    CSS.supports('position-area', 'bottom span-all')
  );
}

/**
 * Wire a trigger/overlay pair with a unique anchor name.
 *
 * An author-supplied `anchor-name` on the trigger always wins: the overlay
 * is pointed at that name and nothing is mutated on release. Only names
 * generated here are cleaned up, so `release()` never clobbers consumer CSS.
 *
 * @param {HTMLElement|null} trigger - Element the overlay is anchored to
 * @param {HTMLElement|null} positioned - The overlay element
 * @param {string} prefix - Dashed-ident prefix, e.g. 'ren-popover'
 * @returns {{ name: string|null, release: () => void }}
 */
export function createAnchorLink(trigger, positioned, prefix) {
  const noop = { name: null, release() {} };
  if (!trigger || !positioned) return noop;

  const authored = trigger.style.anchorName;
  const name = authored || `--${prefix}-anchor-${++anchorSequence}`;

  if (!authored) {
    trigger.style.anchorName = name;
  }
  const authoredPositionAnchor = positioned.style.positionAnchor;
  if (!authoredPositionAnchor) {
    positioned.style.positionAnchor = name;
  }

  return {
    name,
    release() {
      if (!authored && trigger.style.anchorName === name) {
        trigger.style.removeProperty('anchor-name');
      }
      if (!authoredPositionAnchor && positioned.style.positionAnchor === name) {
        positioned.style.removeProperty('position-anchor');
      }
    },
  };
}

const INLINE_SIDES = new Set(['left', 'right']);

/**
 * The side of `anchor` that `overlay` is on, along the axis of `requested`.
 * Centres rather than edges, so the opening transform (a few pixels of
 * translate and scale) cannot tip the answer.
 * @param {DOMRect} overlay
 * @param {DOMRect} anchor
 * @param {string} requested - 'top' | 'bottom' | 'left' | 'right'
 * @returns {'top'|'bottom'|'left'|'right'}
 */
export function placedSideOf(overlay, anchor, requested) {
  if (INLINE_SIDES.has(requested)) {
    return overlay.left + overlay.width / 2 < anchor.left + anchor.width / 2 ? 'left' : 'right';
  }
  return overlay.top + overlay.height / 2 < anchor.top + anchor.height / 2 ? 'top' : 'bottom';
}

/**
 * Keep `data-placed-side` on an open overlay naming the side of its trigger
 * it is actually on.
 *
 * `position-try-fallbacks` flips an overlay to the other side of its trigger
 * when there is no room, and its arrow has to follow. CSS can only see the
 * flip through `@container anchored(fallback: …)`, which Chromium has and
 * WebKit and Gecko do not, although both flip. So the side is measured: when
 * the overlay opens, and again after scroll and resize while it is open,
 * since the browser may flip it back and forth without telling anyone.
 * Arrow rules key off the attribute; it is removed when the overlay closes.
 *
 * @param {HTMLElement|null} overlay - Element with the `popover` attribute
 * @param {() => (Element|null)} getAnchor - Returns the current trigger
 * @param {string} defaultSide - Side used when the overlay has no `data-side`
 * @returns {{ update: () => void, release: () => void }}
 */
export function trackPlacedSide(overlay, getAnchor, defaultSide) {
  const noop = { update() {}, release() {} };
  if (!overlay || typeof window === 'undefined') return noop;

  const controller = new AbortController();
  let viewport = null;
  let frame = 0;
  let settle = 0;

  const update = () => {
    const anchor = getAnchor();
    if (!anchor || !overlay.isConnected) return;
    const box = overlay.getBoundingClientRect();
    if (box.width === 0 && box.height === 0) return;
    const requested = overlay.getAttribute('data-side') || defaultSide;
    const side = placedSideOf(box, anchor.getBoundingClientRect(), requested);
    if (overlay.getAttribute('data-placed-side') !== side) {
      overlay.setAttribute('data-placed-side', side);
    }
  };
  // Right after a scroll, Chromium and Gecko report the anchored box where it
  // was before the scroll for one frame while the trigger is already where it
  // is now: measured then, the overlay can read as being on the wrong side.
  // So the side is measured two frames later, and once more when scrolling
  // has stopped.
  const schedule = () => {
    clearTimeout(settle);
    settle = setTimeout(update, 150);
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    });
  };
  const stop = () => {
    viewport?.abort();
    viewport = null;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    clearTimeout(settle);
  };

  overlay.addEventListener('toggle', (event) => {
    stop();
    if (event.newState !== 'open') {
      overlay.removeAttribute('data-placed-side');
      return;
    }
    update();
    viewport = new AbortController();
    const { signal } = viewport;
    window.addEventListener('scroll', schedule, { capture: true, passive: true, signal });
    window.addEventListener('resize', schedule, { passive: true, signal });
    // Once more when the opening styles have settled.
    schedule();
  }, { signal: controller.signal });

  return {
    update,
    release() {
      controller.abort();
      stop();
      overlay.removeAttribute('data-placed-side');
    },
  };
}
