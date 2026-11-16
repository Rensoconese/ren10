// @ts-check
/**
 * Right-to-left helpers shared by the RTL specs.
 *
 * A component is mounted twice, once per direction, from the same registry
 * usage. Everything the specs assert is a visible outcome: where a box ends up,
 * which item has focus, which slide is in view. Nothing here reads a raw
 * `scrollLeft` (browsers disagree on its sign under RTL) or waits on a timer.
 */
const { REGISTRY, mountRegistry } = require('./mount-registry.cjs');

/** Sub-pixel layout differs per engine; a mirrored box may be off by a rounding step. */
const TOLERANCE = 1.5;

/**
 * Mount a registry usage under `dir` on <html>, with reduced motion so
 * transitions cannot leave a box mid-flight.
 *
 * `inset` narrows the host symmetrically. A component flush against the
 * viewport edge hides alignment defects: an overlay anchored to the wrong edge
 * is clamped back and looks right. With room on both sides it cannot.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 * @param {string} key registry key
 * @param {'ltr'|'rtl'} dir
 * @param {{ edit?: (usage: string) => string, inset?: number, motion?: boolean }} [options]
 *   `motion: true` keeps animations running, for the tests that step one by hand.
 */
async function mountDirected(page, origin, key, dir, { edit = (usage) => usage, inset = 0, motion = false } = {}) {
  await page.emulateMedia({ reducedMotion: motion ? 'no-preference' : 'reduce' });
  const entry = REGISTRY[key];
  const shipsJs = (entry.files ?? []).some((file) => file.endsWith('.js'));
  const firstTag = edit(entry.usage).match(/<(ren-[a-z-]+)/)?.[1] ?? null;
  return mountRegistry(page, origin, key, edit, {
    beforeMount: (target) => target.evaluate(([direction, margin, inertTag]) => {
      document.documentElement.dir = direction;
      const host = document.getElementById('host');
      host.style.marginInline = `${margin}px`;
      // mountRegistry waits for the first ren-* tag of the usage to be defined.
      // A CSS-only component never defines one (ren-empty-state mounts a
      // <ren-icon>), so give it an inert definition instead of a timeout.
      if (inertTag && !customElements.get(inertTag)) customElements.define(inertTag, class extends HTMLElement {});
    }, [dir, inset, shipsJs ? null : firstTag]),
  });
}

/**
 * Every rendered box under <body>, in document order.
 *
 * `start`/`end` are distances from the left and right edges of the box's frame,
 * so the mirror of a box swaps them. The frame is the viewport, except inside a
 * surface that keeps a physical side on purpose (`physicalSelectors`): there the
 * frame is that surface, which must stay put while its content mirrors within it.
 * `visibleLeft`/`visibleRight` are the box clipped by its scrolling ancestors: a
 * carousel slide parked outside its viewport is not "outside the page".
 *
 * @param {string[]} [physicalSelectors]
 */
function readBoxes(physicalSelectors = []) {
  const width = document.documentElement.clientWidth;
  const boxes = [];
  const all = [...document.body.querySelectorAll('*')];
  const physicalSurface = (el) => {
    for (const selector of physicalSelectors) {
      const surface = el.closest(selector);
      if (surface) return surface;
    }
    return null;
  };
  all.forEach((el, index) => {
    if (el instanceof SVGElement && el.ownerSVGElement) return; // glyph internals
    if (!el.getClientRects().length) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;
    // Both spellings: the option names changed between engine versions.
    if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true, opacityProperty: true, visibilityProperty: true })) return;
    const style = getComputedStyle(el);
    let visibleLeft = rect.left;
    let visibleRight = rect.right;
    if (style.position !== 'fixed') {
      for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
        const ancestorStyle = getComputedStyle(ancestor);
        if (ancestorStyle.overflowX !== 'visible') {
          const clip = ancestor.getBoundingClientRect();
          visibleLeft = Math.max(visibleLeft, clip.left);
          visibleRight = Math.min(visibleRight, clip.right);
        }
        if (ancestorStyle.position === 'fixed') break;
      }
    }
    const label = `<${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${el.classList.length ? `.${[...el.classList].join('.')}` : ''}>`;
    const surface = physicalSurface(el);
    const frame = surface && surface !== el ? surface.getBoundingClientRect() : { left: 0, right: width };
    boxes.push({
      index,
      label,
      // The surface itself: same place in both directions, not the mirrored one.
      physical: surface === el,
      // Inline boxes follow the bidi algorithm, not the box model: Latin text
      // in an RTL paragraph keeps its own order, so they are not mirror images.
      inline: style.display.startsWith('inline') || style.display === 'contents',
      // A subtree pinned to `direction: ltr` (digits, code) is not mirrored inside.
      insideLtrIsland: el.parentElement ? getComputedStyle(el.parentElement).direction === 'ltr' : false,
      animated: el.getAnimations().some((animation) => animation.playState === 'running'),
      start: rect.left - frame.left,
      end: frame.right - rect.right,
      width: rect.width,
      top: rect.top,
      visibleLeft,
      visibleRight,
    });
  });
  return { boxes, elements: all.length, clientWidth: width, scrollWidth: document.documentElement.scrollWidth };
}

/**
 * Read the boxes once layout stops changing (two identical reads a frame apart).
 * @param {import('@playwright/test').Page} page
 * @param {string[]} [physicalSelectors] surfaces that keep a physical side
 */
async function settledBoxes(page, physicalSelectors = []) {
  let previous = '';
  let snapshot = await page.evaluate(readBoxes, physicalSelectors);
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const current = JSON.stringify(snapshot);
    if (current === previous) return snapshot;
    previous = current;
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    snapshot = await page.evaluate(readBoxes, physicalSelectors);
  }
  return snapshot;
}

/** Boxes that leave the viewport sideways, plus document-level horizontal overflow. */
function overflowProblems(snapshot) {
  const problems = [];
  if (snapshot.scrollWidth > snapshot.clientWidth + 1) {
    problems.push(`the document scrolls horizontally (${snapshot.scrollWidth}px content in a ${snapshot.clientWidth}px viewport)`);
  }
  for (const box of snapshot.boxes) {
    if (box.animated || box.visibleRight <= box.visibleLeft) continue;
    if (box.visibleLeft < -TOLERANCE || box.visibleRight > snapshot.clientWidth + TOLERANCE) {
      problems.push(`${box.label} leaves the viewport: ${box.visibleLeft.toFixed(1)}..${box.visibleRight.toFixed(1)} of ${snapshot.clientWidth}`);
    }
  }
  return problems;
}

/**
 * Boxes whose RTL position is not the mirror image of their LTR position.
 * A surface read as physical (see readBoxes) has to be in the same place instead.
 *
 * @param {ReturnType<typeof readBoxes>} ltr
 * @param {ReturnType<typeof readBoxes>} rtl
 */
function mirrorProblems(ltr, rtl) {
  const problems = [];
  if (ltr.elements !== rtl.elements) {
    return [`the component rendered ${rtl.elements} elements under RTL and ${ltr.elements} under LTR`];
  }
  const mirrored = new Map(rtl.boxes.map((box) => [box.index, box]));
  const original = new Set(ltr.boxes.map((box) => box.index));
  for (const box of rtl.boxes) {
    if (!original.has(box.index) && !box.animated) problems.push(`${box.label} is rendered under RTL but not under LTR`);
  }
  for (const box of ltr.boxes) {
    const twin = mirrored.get(box.index);
    if (box.inline || box.animated) continue;
    if (!twin) {
      problems.push(`${box.label} is rendered under LTR but not under RTL`);
      continue;
    }
    if (twin.insideLtrIsland) continue;
    if (box.physical) {
      if (Math.abs(twin.start - box.start) > TOLERANCE || Math.abs(twin.width - box.width) > TOLERANCE) {
        problems.push(
          `${box.label} keeps a physical side but moved: ${box.start.toFixed(1)}px from the left under LTR, ` +
          `${twin.start.toFixed(1)}px under RTL`
        );
      }
      continue;
    }
    if (Math.abs(twin.end - box.start) > TOLERANCE || Math.abs(twin.width - box.width) > TOLERANCE) {
      problems.push(
        `${box.label} is not mirrored: ${box.start.toFixed(1)}px from the left under LTR, ` +
        `${twin.end.toFixed(1)}px from the right under RTL (width ${box.width.toFixed(1)} → ${twin.width.toFixed(1)})`
      );
    }
  }
  return problems;
}

module.exports = { TOLERANCE, mountDirected, readBoxes, settledBoxes, overflowProblems, mirrorProblems };
