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
 *   centred on the trigger, or flush with its leading / trailing edge. Above or
 *   below the trigger the edges are logical: under dir="rtl" `start` lines up
 *   the right edges. `side` itself is physical and never mirrors.
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
  // Layout size, not the painted box. Overlays are measured while an open
  // animation still scales them, and `left`/`top` place the unscaled box: a
  // far-edge alignment computed from the scaled width lands a few pixels off.
  const paintedRect = overlay.getBoundingClientRect();
  const overlayRect = {
    width: overlay.offsetWidth || paintedRect.width,
    height: overlay.offsetHeight || paintedRect.height,
  };
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

  // `start` / `end` name the inline edges when the overlay sits above or below
  // the trigger, so they swap sides with the trigger's direction.
  const rtl = isVertical && getComputedStyle(trigger).direction === 'rtl';
  const leading = rtl ? 'end' : 'start';
  const trailing = rtl ? 'start' : 'end';

  let crossPosition;
  if (align === leading) {
    crossPosition = cross.start;
  } else if (align === trailing) {
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

/**
 * Place a `position: fixed` overlay beside its trigger by script, on the side
 * its `data-side` asks for (flipped when only the other side has room), for
 * engines without CSS anchor positioning. Writes `left` and `top`; a rule
 * that sets them with `!important`, such as a narrow-viewport sheet, still
 * wins.
 *
 * @param {Element|null} trigger
 * @param {HTMLElement|null} overlay
 * @param {{ side?: string, offset?: number }} [options] - `side` defaults to
 *   the overlay's `data-side`, else 'bottom'
 * @returns {string|null} The side it was placed on
 */
export function placeOverlay(trigger, overlay, options = {}) {
  if (!trigger || !overlay) return null;
  const { side = overlay.getAttribute('data-side') || 'bottom', offset = 8 } = options;
  const { x, y, side: placed } = computeOverlayPosition(trigger, overlay, { side, offset });
  overlay.style.left = `${x}px`;
  overlay.style.top = `${y}px`;
  return placed;
}

/**
 * Keep a script-placed overlay against its trigger for as long as it is open.
 *
 * For engines without CSS anchor positioning. `place` is the caller's own
 * routine (usually computeOverlayPosition() written to `left`/`top` of a
 * `position: fixed` overlay); this runs it when the overlay opens, once it is
 * laid out and has a size, and again on every scroll and resize until it
 * closes, so the overlay goes with its trigger instead of staying where the
 * viewport was when it opened. Scroll is listened for in the capture phase,
 * so a scrolling container moves it too. A change in the overlay's own size
 * places it again as well: some fill their content as they open, and a box
 * measured empty is centred on the wrong point.
 *
 * @param {HTMLElement|null} overlay - Element with the `popover` attribute
 * @param {() => void} place - Writes the overlay's position
 * @returns {{ release: () => void }}
 */
export function keepPlacedWhileOpen(overlay, place) {
  const noop = { release() {} };
  if (!overlay || typeof window === 'undefined') return noop;

  const controller = new AbortController();
  let viewport = null;
  let resizing = null;
  let frame = 0;
  const stop = () => {
    viewport?.abort();
    viewport = null;
    resizing?.disconnect();
    resizing = null;
    cancelAnimationFrame(frame);
    frame = 0;
  };
  // Placing can change the overlay's size again (it shrinks to fit at an
  // edge), so a resize places it on the next frame, not inside the observer
  // callback: that would be a ResizeObserver loop, which WebKit reports as an
  // error.
  const placeNextFrame = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      place();
    });
  };

  overlay.addEventListener('toggle', (event) => {
    stop();
    if (event.newState !== 'open') return;
    place();
    viewport = new AbortController();
    const { signal } = viewport;
    window.addEventListener('scroll', place, { capture: true, passive: true, signal });
    window.addEventListener('resize', place, { passive: true, signal });
    if (typeof ResizeObserver === 'function') {
      resizing = new ResizeObserver(placeNextFrame);
      resizing.observe(overlay);
    }
  }, { signal: controller.signal });

  return {
    release() {
      controller.abort();
      stop();
    },
  };
}
