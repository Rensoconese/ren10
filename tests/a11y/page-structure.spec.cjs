const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { startStaticServer } = require('../utils/static-server.cjs');

// Structural gate over the shipped full-page demos. Consumers copy these pages
// whole, so each one must hold at a narrow phone width, expose one <main>,
// keep a gap-free heading outline and name every form control in static HTML.
const root = path.resolve(__dirname, '../..');
const pages = [];
for (const dir of ['examples', 'templates']) {
  pages.push(...fs.readdirSync(path.join(root, dir)).filter(file => file.endsWith('.html')).map(file => `${dir}/${file}`));
}

// The checks below do not depend on color scheme or device emulation, so they
// run once per browser instead of once per project. 'Desktop Light' is the only
// project defined for chromium, firefox and webkit alike (firefox drops the
// mobile/tablet projects), and it is not a mobile device descriptor, so the
// viewport can be narrowed to an exact 390 CSS px without touch/DPR side effects.
const GATE_PROJECT = 'Desktop Light';
const NARROW_VIEWPORT = { width: 390, height: 844 };

let server;
test.beforeAll(async () => { server = await startStaticServer(root); });
test.afterAll(async () => { await server?.close(); });

async function openPage(page, file) {
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${server.origin}/${file}`, { waitUntil: 'load' });
}

// Short selector-like description so CI logs point at the element.
function describeElementSource() {
  return (element) => {
    let label = element.tagName.toLowerCase();
    if (element.id) label += `#${element.id}`;
    const classes = (element.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 3);
    if (classes.length) label += `.${classes.join('.')}`;
    const name = element.getAttribute('name');
    if (name) label += `[name="${name}"]`;
    return label;
  };
}

test.describe('shipped demo pages — structure at 390px', () => {
  test.use({ viewport: NARROW_VIEWPORT });
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== GATE_PROJECT, `structural gate runs once per browser, in "${GATE_PROJECT}"`);
  });

  for (const file of pages) {
    test(`${file} — no horizontal page overflow at 390px`, async ({ page }) => {
      await openPage(page, file);
      // Hide classic scrollbars so the layout viewport is exactly 390 CSS px in
      // every engine (headless Chromium already hides them; Firefox/WebKit may not).
      await page.addStyleTag({ content: 'html { scrollbar-width: none; }' });
      const result = await page.evaluate((describeSource) => {
        const describe = new Function(`return (${describeSource})`)()();
        const root = document.documentElement;
        const viewport = root.clientWidth;
        const clips = (element) => getComputedStyle(element).overflowX !== 'visible';
        const offenders = [];
        for (const element of document.body.querySelectorAll('*')) {
          const rect = element.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) continue;
          if (rect.right <= viewport + 0.5) continue;
          // Content scrolled inside an in-bounds clipping container is not the
          // culprit; that container reports itself if it escapes. Absolutely
          // positioned content may still escape such a container, so keep it.
          const position = getComputedStyle(element).position;
          let clipped = false;
          if (position !== 'absolute' && position !== 'fixed') {
            for (let ancestor = element.parentElement; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
              if (clips(ancestor) && ancestor.getBoundingClientRect().right <= viewport + 0.5) { clipped = true; break; }
            }
          }
          if (clipped) continue;
          offenders.push({ element: describe(element), right: Math.round(rect.right), width: Math.round(rect.width), position });
        }
        offenders.sort((a, b) => b.right - a.right);
        return { viewport, scrollWidth: root.scrollWidth, overflow: root.scrollWidth - viewport, offenders: offenders.slice(0, 6) };
      }, describeElementSource.toString());
      expect(result.viewport, `${file}: layout viewport must be exactly 390 CSS px`).toBe(390);
      const detail = result.offenders.map(o => `${o.element} right=${o.right}px width=${o.width}px (${o.position})`).join('\n  ');
      expect(result.overflow, `${file}: page scrollWidth ${result.scrollWidth}px exceeds the ${result.viewport}px viewport by ${result.overflow}px. Widest offenders:\n  ${detail || '(none found)'}`).toBe(0);
    });

    test(`${file} — exactly one <main> landmark`, async ({ page }) => {
      await openPage(page, file);
      const mains = await page.locator('main, [role="main"]').evaluateAll((elements, describeSource) => {
        const describe = new Function(`return (${describeSource})`)()();
        return elements.map(describe);
      }, describeElementSource.toString());
      expect(mains.length, `${file}: expected exactly one <main> landmark, found ${mains.length}${mains.length ? `: ${mains.join(', ')}` : ''}`).toBe(1);
    });

    test(`${file} — no skipped heading levels`, async ({ page }) => {
      await openPage(page, file);
      const skips = await page.evaluate((describeSource) => {
        const describe = new Function(`return (${describeSource})`)()();
        // Only headings that are rendered count. Content in a closed <dialog>,
        // a collapsed region or any display:none subtree is not in the
        // accessibility tree until it opens, and it is outlined relative to its
        // own context when shown, so it must not break the page outline here.
        // Visually hidden (.ren-sr-only) headings are rendered and do count.
        const rendered = (heading) => heading.getClientRects().length > 0
          && getComputedStyle(heading).visibility !== 'hidden'
          && !heading.closest('[aria-hidden="true"]');
        const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter(rendered);
        const found = [];
        for (let index = 1; index < headings.length; index += 1) {
          const previous = Number(headings[index - 1].tagName[1]);
          const current = Number(headings[index].tagName[1]);
          if (current - previous > 1) {
            const text = headings[index].textContent.trim().replace(/\s+/g, ' ').slice(0, 60);
            found.push(`h${previous}→h${current} at ${describe(headings[index])} "${text}"`);
          }
        }
        return found;
      }, describeElementSource.toString());
      expect(skips, `${file}: heading levels must not skip (rendered outline)`).toEqual([]);
    });
  }
});

test.describe('shipped demo pages — form controls without JavaScript', () => {
  // Names must come from static markup, not from runtime wiring by component
  // scripts, so a page that fails to load its JS still has labelled controls.
  test.use({ javaScriptEnabled: false });
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== GATE_PROJECT, `structural gate runs once per browser, in "${GATE_PROJECT}"`);
  });

  for (const file of pages) {
    test(`${file} — every form control has an accessible name with JS disabled`, async ({ page }) => {
      await openPage(page, file);
      const unnamed = await page.evaluate((describeSource) => {
        const describe = new Function(`return (${describeSource})`)()();
        const skippedTypes = new Set(['hidden', 'submit', 'button', 'reset', 'image']);
        const controls = [...document.querySelectorAll('input, select, textarea')]
          .filter(control => !skippedTypes.has(control.type));
        // label[for] and wrapping labels both surface through control.labels.
        const hasName = (control) => {
          if (control.labels && [...control.labels].some(label => label.textContent.trim())) return true;
          if ((control.getAttribute('aria-label') || '').trim()) return true;
          if ((control.getAttribute('title') || '').trim()) return true;
          const ids = (control.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean);
          return ids.some(id => (document.getElementById(id)?.textContent || '').trim());
        };
        return controls.filter(control => !hasName(control)).map(describe);
      }, describeElementSource.toString());
      expect(unnamed, `${file}: form controls without an accessible name (label[for], wrapping label, aria-label, aria-labelledby or title) when JS is disabled`).toEqual([]);
    });
  }
});
