/**
 * RenDS — Overlay positioning fallback
 * =====================================
 * Flip + clamp math for browsers without CSS Anchor Positioning. Modern
 * engines never reach it: the overlay family lets `position-area` and
 * `position-try-fallbacks` place the overlay and only calls in here when the
 * detection in `anchor.js` comes back false. ren-select is the exception —
 * it has no CSS anchor path, so it always positions through JS.
 *
 * Why one helper:
 * The routine used to live three times over (popover, tooltip, select). Two
 * of those copies flipped to the opposite side unconditionally, so an overlay
 * too tall for either side bounced top → bottom → top until the stack blew.
 * Three copies of the same math drift in silence; this one is the contract.
 *
 * The options exist because the callers genuinely differ, not for the sake of
 * being generic: a tooltip centres on its trigger and may sit flush against
 * the viewport edge, a select dropdown aligns to a trigger edge and keeps a
 * 16px margin. Placement defaults stay with the caller — `side` is always
 * passed in, already normalised.
 *
 * Usage:
 *   import { computeOverlayPosition } from './positioning.js';
 *
 *   const { x, y, side } = computeOverlayPosition(trigger, overlay, {
 *     side: 'bottom',
 *     offset: 8,
 *   });
 */

const SIDES = new Set(['top', 'right', 'bottom', 'left']);
const OPPOSITE_SIDE = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

/**
 * Pull a coordinate back inside the viewport.
 *
 * The trailing edge is corrected before the leading one, so an overlay wider
 * than the viewport ends up flush with the leading gutter instead of hanging
 * off the opposite side.
 *
 * @param {number} position - Candidate coordinate
 * @param {number} size - Overlay size along that axis
 * @param {number} limit - Viewport size along that axis
 * @param {number} overflowPadding - Inset at which the position counts as overflowing
 * @param {number} clampPadding - Inset restored when the position is corrected
 * @returns {number}
 */
function clampToViewport(position, size, limit, overflowPadding, clampPadding) {
  let next = position;
  if (next + size > limit - overflowPadding) next = limit - size - clampPadding;
  if (next < overflowPadding) next = clampPadding;
  return next;
}

/**
 * Measure a trigger/overlay pair and return the overlay's viewport position.
 *
 * The flip is single-hop by design: the overlay moves to the opposite side
 * only when the preferred side overflows *and* the opposite one has room.
 * When neither fits it stays on the preferred side, and the clamp — where the
 * caller enabled it for that axis — pulls it back into view.
 *
 * @param {HTMLElement} trigger - Element the overlay is positioned against
 * @param {HTMLElement} overlay - The overlay being positioned
 * @param {Object} [options]
 * @param {'top'|'right'|'bottom'|'left'} [options.side] - Preferred side. Callers
 *   normalise their own attribute (and own its default) first; an unrecognised
 *   value falls back to 'bottom' rather than producing NaN coordinates.
 * @param {'center'|'start'|'end'} [options.align='center'] - Cross-axis alignment:
 *   centred on the trigger, or flush with its leading / trailing edge.
 * @param {number} [options.offset=8] - Gap between trigger and overlay.
 * @param {number} [options.overflowPadding=0] - Viewport inset that must stay
 *   clear for a position to count as fitting. Drives both the flip decision and
 *   whether the clamp engages.
 * @param {number} [options.clampPadding=8] - Inset the clamp restores when it has
 *   to pull the overlay back inside the viewport.
 * @param {'x'|'both'} [options.clampAxis='x'] - Axes the clamp applies to.
 *   Horizontal-only keeps an overlay vertically glued to its trigger, at the
 *   cost of letting it run past the top or bottom edge.
 * @returns {{ x: number, y: number, side: string, align: string, flipped: boolean }}
 */
export function computeOverlayPosition(trigger, overlay, options = {}) {
  const {
    side,
    align = 'center',
    offset = 8,
    overflowPadding = 0,
    clampPadding = 8,
    clampAxis = 'x',
  } = options;

  const triggerRect = trigger.getBoundingClientRect();
  const overlayRect = overlay.getBoundingClientRect();
  const viewport = { width: window.innerWidth, height: window.innerHeight };

  const preferred = SIDES.has(side) ? side : 'bottom';
  const isVertical = preferred === 'top' || preferred === 'bottom';

  // Main axis: the one the side moves along. Cross axis: the one `align`
  // slides the overlay on. Naming them this way keeps a single set of
  // formulas instead of one branch per side.
  const main = {
    size: isVertical ? overlayRect.height : overlayRect.width,
    limit: isVertical ? viewport.height : viewport.width,
    before: isVertical ? triggerRect.top : triggerRect.left,
    after: isVertical ? triggerRect.bottom : triggerRect.right,
  };
  const cross = {
    size: isVertical ? overlayRect.width : overlayRect.height,
    start: isVertical ? triggerRect.left : triggerRect.top,
    end: isVertical ? triggerRect.right : triggerRect.bottom,
  };

  const positionFor = (candidate) =>
    candidate === 'top' || candidate === 'left'
      ? main.before - main.size - offset
      : main.after + offset;

  const overflowsOn = (candidate, position) =>
    candidate === 'top' || candidate === 'left'
      ? position < overflowPadding
      : position + main.size > main.limit - overflowPadding;

  let finalSide = preferred;
  let flipped = false;
  let mainPosition = positionFor(preferred);

  const opposite = OPPOSITE_SIDE[preferred];
  if (overflowsOn(preferred, mainPosition) && !overflowsOn(opposite, positionFor(opposite))) {
    finalSide = opposite;
    flipped = true;
    mainPosition = positionFor(opposite);
  }

  let crossPosition;
  if (align === 'start') {
    crossPosition = cross.start;
  } else if (align === 'end') {
    crossPosition = cross.end - cross.size;
  } else {
    crossPosition = cross.start + (cross.end - cross.start - cross.size) / 2;
  }

  let x = isVertical ? crossPosition : mainPosition;
  let y = isVertical ? mainPosition : crossPosition;

  x = clampToViewport(x, overlayRect.width, viewport.width, overflowPadding, clampPadding);
  if (clampAxis === 'both') {
    y = clampToViewport(y, overlayRect.height, viewport.height, overflowPadding, clampPadding);
  }

  return { x, y, side: finalSide, align, flipped };
}
