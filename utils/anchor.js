/**
 * RenDS — CSS Anchor Positioning helpers
 * =======================================
 * Shared support detection and per-instance anchor wiring for the
 * overlay family (popover, tooltip, hover card).
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
