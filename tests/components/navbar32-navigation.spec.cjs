// @ts-check
/**
 * Isolated Navbar 32 — logo-left permanent CTA + always-visible left drawer.
 * Does not extend blocks-navigation.spec.cjs (parallel worker ownership).
 */
const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');
const {
  expectAligned,
  expectNoOverflow,
  expectSingleVisibleAffordance,
} = require('../utils/block-quality.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/nav-logo-cta-left-drawer.html';
const ROOT = '[data-rn32-root]';

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 * @param {{ width?: number, height?: number, reducedMotion?: 'reduce' | 'no-preference' }} [opts]
 */
async function gotoBlock(page, origin, opts = {}) {
  const width = opts.width ?? 1280;
  const height = opts.height ?? 900;
  await page.setViewportSize({ width, height });
  if (opts.reducedMotion) {
    await page.emulateMedia({ reducedMotion: opts.reducedMotion });
  }
  await page.goto(`${origin}${BLOCK}`);
}

/**
 * Open via the external hamburger (real pointer click).
 * @param {import('@playwright/test').Page} page
 */
async function openDrawer(page) {
  const toggle = page.locator(`${ROOT} .rn32-toggle`);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('ren-sheet#rn32-drawer')).toHaveAttribute('open', '');
  await expect(page.locator('#rn32-drawer .ren-sheet-close')).toBeVisible();
}

/**
 * Close via the real in-sheet close control (no scripted el.click bypass).
 * @param {import('@playwright/test').Page} page
 */
async function closeDrawer(page) {
  const closeBtn = page.locator('#rn32-drawer .ren-sheet-close');
  await expect(closeBtn).toBeVisible();
  await closeBtn.click();
  await expectSheetClosed(page);
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function expectSheetClosed(page) {
  await expect(page.locator(`${ROOT} .rn32-toggle`)).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('ren-sheet#rn32-drawer')).not.toHaveAttribute('open', '');
}

/**
 * Fully visible 44px hit target (not clipped by viewport).
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 * @param {string} label
 */
async function expectFullyVisibleTouchTarget(page, selector, label) {
  const box = await page.locator(selector).first().boundingBox();
  expect(box, `${label} geometry`).toBeTruthy();
  expect(box.height, `${label} height`).toBeGreaterThanOrEqual(44);
  expect(box.width, `${label} width`).toBeGreaterThanOrEqual(44);
  const viewport = page.viewportSize();
  expect(viewport, 'viewport').toBeTruthy();
  expect(box.x, `${label} left`).toBeGreaterThanOrEqual(-0.5);
  expect(box.y, `${label} top`).toBeGreaterThanOrEqual(-0.5);
  expect(box.x + box.width, `${label} right`).toBeLessThanOrEqual(viewport.width + 0.5);
  expect(box.y + box.height, `${label} bottom`).toBeLessThanOrEqual(viewport.height + 0.5);
}

test.describe('Navbar Logo CTA Left Drawer (navbar32)', () => {
  /** @type {{ origin: string, close: () => Promise<void> }} */
  let staticServer;

  test.use({ actionTimeout: 3000, navigationTimeout: 10000 });
  test.describe.configure({ timeout: 20000 });

  test.beforeAll(async () => {
    staticServer = await startStaticServer(PKG_ROOT);
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  test('block page loads with left-drawer shell and navbar32 root', async ({ page }) => {
    await gotoBlock(page, staticServer.origin);

    await expect(
      page.getByRole('heading', {
        name: /Logo.?CTA.?Left.?Drawer|Navbar 32|nav-logo-cta-left-drawer/i,
        level: 1,
      })
    ).toBeVisible();
    await expect(page.locator(ROOT)).toHaveCount(1);
    await expect(page.locator('ren-sheet#rn32-drawer')).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav.rn32-nav`)).toHaveCount(1);
    await expect(page.locator('#rn32-primary-links')).toHaveCount(1);
    await expect(page.locator('nav nav')).toHaveCount(0);
  });

  test('exactly one primary links tree serves every width', async ({ page }) => {
    await gotoBlock(page, staticServer.origin, { width: 1280, height: 900 });
    await expect(page.locator('#rn32-primary-links')).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.rn32-links`)).toHaveCount(1);

    await openDrawer(page);
    await expect(page.locator('#rn32-primary-links')).toBeVisible();
    await expect(page.locator(`${ROOT} a.rn32-link`)).toHaveCount(5);

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('#rn32-primary-links')).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.rn32-links`)).toHaveCount(1);
  });

  test('anatomy: one brand, one CTA, one toggle, five primary, contact, five social, zero chevrons/dropdowns', async ({ page }) => {
    await gotoBlock(page, staticServer.origin, { width: 1280, height: 900 });

    await expect(page.locator(`${ROOT} .rn32-brand`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} a.rn32-cta`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rn32-toggle`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rn32-toggle span`)).toHaveCount(3);

    await expect(page.locator('#rn32-primary-links > li')).toHaveCount(5);
    await expect(page.locator(`${ROOT} a.rn32-link`)).toHaveCount(5);
    await expect(page.locator(`${ROOT} a.rn32-social-link`)).toHaveCount(5);
    await expect(page.locator(`${ROOT} a.rn32-contact-link`)).toHaveCount(2);
    await expect(page.locator(`${ROOT} .rn32-contact-title`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rn32-contact-address`)).toHaveCount(1);

    await expect(page.locator(`${ROOT} details, ${ROOT} summary, ${ROOT} .rn32-disclosure`)).toHaveCount(0);
    await expect(page.locator(`${ROOT} .rn32-chevron, ${ROOT} .ren-nav-dropdown`)).toHaveCount(0);
    await expect(
      page.locator(`${ROOT} ren-menu, ${ROOT} ren-popover, ${ROOT} ren-collapsible, ${ROOT} .ren-nav`)
    ).toHaveCount(0);

    // Destination classes: 5 primary + 5 social + 2 contact + 1 CTA = 13
    await expect(page.locator(`${ROOT} a.rn32-destination`)).toHaveCount(13);
    await expect(page.locator('#rn32-drawer .ren-sheet-header')).toHaveCount(1);
    await expect(page.locator('#rn32-drawer .ren-sheet-title')).toHaveCount(1);
    await expect(page.locator('#rn32-drawer .ren-sheet-close')).toHaveCount(1);
  });

  test('toggle opens and in-sheet close button closes; public open contract only', async ({ page }) => {
    await gotoBlock(page, staticServer.origin, { width: 1280, height: 900 });

    const toggle = page.locator(`${ROOT} .rn32-toggle`);
    const sheet = page.locator('ren-sheet#rn32-drawer');
    const closeBtn = page.locator('#rn32-drawer .ren-sheet-close');

    await expect(toggle).toHaveAttribute('aria-label', /Open menu/i);
    await expect(toggle).toHaveAttribute('aria-controls', 'rn32-drawer');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(sheet).toHaveAttribute('side', 'left');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(sheet).toHaveAttribute('open', '');
    await expect(page.locator(`${ROOT} a.rn32-link`).first()).toBeVisible();
    await expect(closeBtn).toBeVisible();
    await expect(closeBtn).toHaveAttribute('aria-label', 'Close menu');
    await expect(closeBtn).toHaveAttribute('data-sheet-close', '');

    // Public contract only — never private custom-element fields.
    const publicOpen = await page.evaluate(() => {
      const el = document.querySelector('ren-sheet#rn32-drawer');
      return el && typeof el.open === 'boolean' ? el.open : null;
    });
    expect(publicOpen).toBe(true);

    // Real pointer click on the in-sheet close control (no el.click() bypass).
    await closeBtn.click();
    await expectSheetClosed(page);
  });

  test('Escape from a focused menu destination restores focus to the toggle', async ({ page }) => {
    await gotoBlock(page, staticServer.origin, { width: 1280, height: 900 });
    await openDrawer(page);

    const dest = page.locator(`${ROOT} a.rn32-link`).first();
    await dest.focus();
    await expect.poll(() => page.evaluate(() => document.activeElement?.classList.contains('rn32-link'))).toBe(true);

    await page.keyboard.press('Escape');
    await expectSheetClosed(page);
    await expect.poll(() => page.evaluate(() => document.activeElement?.classList.contains('rn32-toggle'))).toBe(true);
  });

  test('in-sheet close button restores focus to the toggle', async ({ page }) => {
    await gotoBlock(page, staticServer.origin, { width: 1280, height: 900 });
    await openDrawer(page);

    await page.locator('#rn32-drawer .ren-sheet-close').click();
    await expectSheetClosed(page);
    await expect.poll(() => page.evaluate(() => document.activeElement?.classList.contains('rn32-toggle'))).toBe(true);
  });

  test('outside/backdrop activation closes the open drawer', async ({ page }) => {
    await gotoBlock(page, staticServer.origin, { width: 1280, height: 900 });
    await openDrawer(page);

    // Click near the viewport end (outside the left sheet content).
    await page.mouse.click(1200, 400);
    await expectSheetClosed(page);
  });

  test('destination activation closes the drawer for every in-sheet destination class', async ({ page }) => {
    await gotoBlock(page, staticServer.origin, { width: 1280, height: 900 });

    const cases = [
      { name: 'primary', selector: `${ROOT} a.rn32-link` },
      { name: 'social', selector: `${ROOT} a.rn32-social-link` },
      { name: 'contact', selector: `${ROOT} a.rn32-contact-link` },
    ];

    for (const item of cases) {
      await openDrawer(page);
      // Real pointer click on destinations inside the modal sheet.
      await page.locator(item.selector).first().click();
      await expectSheetClosed(page);
    }

    // Bar CTA remains a destination class; while open the modal top-layer keeps
    // bar chrome inert, so close via the real in-sheet control then activate CTA.
    await openDrawer(page);
    await closeDrawer(page);
    await page.locator(`${ROOT} a.rn32-cta`).click();
    await expect(page.locator(`${ROOT} a.rn32-cta`)).toHaveAttribute('href', /.+/);
  });

  test('same-breakpoint resize keeps open state; seam widths keep one tree and always-on toggle', async ({ page }) => {
    await gotoBlock(page, staticServer.origin, { width: 900, height: 900 });
    await openDrawer(page);

    await page.setViewportSize({ width: 920, height: 900 });
    await expect(page.locator('ren-sheet#rn32-drawer')).toHaveAttribute('open', '');
    await expect(page.locator(`${ROOT} .rn32-toggle`)).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rn32-primary-links')).toHaveCount(1);

    for (const width of [320, 340, 767, 768, 769, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.locator(`${ROOT} .rn32-toggle`)).toBeVisible();
      await expect(page.locator('#rn32-primary-links')).toHaveCount(1);
      await expect(page.locator(`${ROOT} a.rn32-link`)).toHaveCount(5);
      await expect(page.locator(`${ROOT} a.rn32-cta`)).toBeVisible();
    }
  });

  test('desktop / tablet / mobile geometry: bar ownership, left sheet, no root overflow', async ({ page }) => {
    for (const width of [1280, 834, 390, 320, 340, 767, 768, 769]) {
      await gotoBlock(page, staticServer.origin, { width, height: 900 });

      const bar = await page.evaluate((rootSel) => {
        const root = document.querySelector(rootSel);
        const brand = root?.querySelector('.rn32-brand');
        const cta = root?.querySelector('.rn32-cta');
        const toggle = root?.querySelector('.rn32-toggle');
        const barEl = root?.querySelector('.rn32-bar');
        if (!brand || !cta || !toggle || !barEl) return null;
        const brandRect = brand.getBoundingClientRect();
        const ctaRect = cta.getBoundingClientRect();
        const toggleRect = toggle.getBoundingClientRect();
        const barRect = barEl.getBoundingClientRect();
        return {
          brandLeft: brandRect.left,
          ctaLeft: ctaRect.left,
          toggleLeft: toggleRect.left,
          barLeft: barRect.left,
          barRight: barRect.right,
          sideBySide:
            Math.abs(brandRect.top - ctaRect.top) <= 16
            && Math.abs(ctaRect.top - toggleRect.top) <= 16
            && brandRect.right <= ctaRect.left + 2
            && ctaRect.right <= toggleRect.left + 2,
          brandAtStart: brandRect.left - barRect.left <= 32,
          toggleAtEnd: barRect.right - toggleRect.right <= 32,
        };
      }, ROOT);

      expect(bar, `bar metrics @${width}`).toBeTruthy();
      expect(bar.sideBySide, `logo / CTA / toggle one row @${width}`).toBe(true);
      expect(bar.brandAtStart, `brand start @${width}`).toBe(true);
      expect(bar.toggleAtEnd, `toggle end @${width}`).toBe(true);

      await openDrawer(page);
      const sheetGeom = await page.evaluate(() => {
        const dialog = document.querySelector('ren-sheet#rn32-drawer dialog.ren-sheet, ren-sheet#rn32-drawer .ren-sheet, dialog.ren-sheet');
        const host = document.querySelector('ren-sheet#rn32-drawer');
        const surface = dialog || host;
        if (!surface) return null;
        const rect = surface.getBoundingClientRect();
        const side = host?.getAttribute('side') || host?.getAttribute('data-side');
        return {
          left: rect.left,
          width: rect.width,
          side,
          nearLeftEdge: rect.left <= 8,
        };
      });
      expect(sheetGeom, `sheet geom @${width}`).toBeTruthy();
      expect(sheetGeom.side).toBe('left');
      expect(sheetGeom.nearLeftEdge, `left edge drawer @${width}`).toBe(true);
      expect(sheetGeom.width, `drawer width @${width}`).toBeGreaterThan(120);

      await expectNoOverflow(page, 'html');
      await expectNoOverflow(page, 'body');
    }
  });

  test('JS-disabled keeps primary tree, contact, socials, and CTA usable; toggle hidden', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await page.goto(`${staticServer.origin}${BLOCK}`);

    await expect(page.locator(`${ROOT} .rn32-toggle`)).toBeHidden();
    await expect(page.locator('#rn32-primary-links')).toBeVisible();
    await expect(page.locator(`${ROOT} a.rn32-link`)).toHaveCount(5);
    await expect(page.locator(`${ROOT} a.rn32-link`).first()).toBeVisible();
    await expect(page.locator(`${ROOT} a.rn32-social-link`)).toHaveCount(5);
    await expect(page.locator(`${ROOT} a.rn32-social-link`).first()).toBeVisible();
    await expect(page.locator(`${ROOT} a.rn32-contact-link`)).toHaveCount(2);
    await expect(page.locator(`${ROOT} a.rn32-cta`)).toBeVisible();
    await expect(page.locator(`${ROOT} .rn32-contact-title`)).toBeVisible();

    await context.close();
  });

  test('light and dark themes keep tokenized surfaces without inventing chrome', async ({ page }) => {
    await gotoBlock(page, staticServer.origin, { width: 1280, height: 900 });
    await openDrawer(page);

    const light = await page.evaluate(() => {
      const bar = document.querySelector('[data-rn32-root] .rn32-bar');
      const link = document.querySelector('[data-rn32-root] a.rn32-link');
      if (!bar || !link) return null;
      const barStyle = getComputedStyle(bar);
      const linkStyle = getComputedStyle(link);
      return {
        barBg: barStyle.backgroundColor,
        linkColor: linkStyle.color,
      };
    });
    expect(light).toBeTruthy();
    expect(light.barBg).not.toBe('rgba(0, 0, 0, 0)');
    expect(light.linkColor).not.toBe('rgba(0, 0, 0, 0)');

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    const dark = await page.evaluate(() => {
      const bar = document.querySelector('[data-rn32-root] .rn32-bar');
      const link = document.querySelector('[data-rn32-root] a.rn32-link');
      if (!bar || !link) return null;
      return {
        barBg: getComputedStyle(bar).backgroundColor,
        linkColor: getComputedStyle(link).color,
      };
    });
    expect(dark).toBeTruthy();
    expect(dark.barBg).not.toBe('rgba(0, 0, 0, 0)');
    // Theme swap should re-resolve semantic colors (not necessarily different hex if tokens match).
    expect(dark.linkColor).toMatch(/^rgb/);
  });

  test('reduced-motion disables block-local transitions and animations', async ({ page }) => {
    await gotoBlock(page, staticServer.origin, {
      width: 1280,
      height: 900,
      reducedMotion: 'reduce',
    });
    await openDrawer(page);

    const motion = await page.evaluate(() => {
      const selectors = ['.rn32-toggle', '.rn32-toggle span', 'a.rn32-link', '.rn32-bar'];
      return selectors.map((selector) => {
        const el = document.querySelector(`[data-rn32-root] ${selector}`) || document.querySelector(selector);
        if (!el) return { selector, missing: true };
        const style = getComputedStyle(el);
        return {
          selector,
          transitionDuration: style.transitionDuration,
          animationDuration: style.animationDuration,
          animationName: style.animationName,
        };
      });
    });

    for (const entry of motion) {
      expect(entry.missing, entry.selector).toBeFalsy();
      const transitions = String(entry.transitionDuration || '')
        .split(',')
        .map((part) => part.trim());
      for (const duration of transitions) {
        if (!duration || duration === '0s' || duration === '0ms') continue;
        const ms = duration.endsWith('ms')
          ? Number.parseFloat(duration)
          : Number.parseFloat(duration) * 1000;
        expect(ms, `${entry.selector} transition`).toBeLessThanOrEqual(1);
      }
      if (entry.animationName && entry.animationName !== 'none') {
        const animations = String(entry.animationDuration || '')
          .split(',')
          .map((part) => part.trim());
        for (const duration of animations) {
          if (!duration || duration === '0s' || duration === '0ms') continue;
          const ms = duration.endsWith('ms')
            ? Number.parseFloat(duration)
            : Number.parseFloat(duration) * 1000;
          expect(ms, `${entry.selector} animation`).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  test('fully visible 44px targets for toggle, close, CTA, primary, social, and contact', async ({ page }) => {
    await gotoBlock(page, staticServer.origin, { width: 320, height: 720 });
    await expectFullyVisibleTouchTarget(page, `${ROOT} .rn32-toggle`, 'toggle');
    await expectFullyVisibleTouchTarget(page, `${ROOT} a.rn32-cta`, 'cta');

    await openDrawer(page);
    await expectFullyVisibleTouchTarget(page, '#rn32-drawer .ren-sheet-close', 'sheet close');
    await expectFullyVisibleTouchTarget(page, `${ROOT} a.rn32-link`, 'primary');
    await expectFullyVisibleTouchTarget(page, `${ROOT} a.rn32-social-link`, 'social');
    await expectFullyVisibleTouchTarget(page, `${ROOT} a.rn32-contact-link`, 'contact');

    // Header title + close share one row when open.
    await expectAligned(
      page,
      ['#rn32-drawer .ren-sheet-title', '#rn32-drawer .ren-sheet-close'],
      'centerY',
      12
    );

    await closeDrawer(page);
    await expectAligned(
      page,
      [`${ROOT} .rn32-brand`, `${ROOT} a.rn32-cta`, `${ROOT} .rn32-toggle`],
      'centerY',
      16
    );
  });

  test('single close affordance is ren-sheet-close; toggle keeps hamburger (no second X)', async ({ page }) => {
    for (const width of [1280, 834, 390, 320]) {
      await gotoBlock(page, staticServer.origin, { width, height: 900 });
      await openDrawer(page);

      await expect(page.locator(`${ROOT} .rn32-chevron`)).toHaveCount(0);
      await expect(page.locator('#rn32-drawer .ren-sheet-close')).toHaveCount(1);
      await expectSingleVisibleAffordance(
        page,
        ['#rn32-drawer .ren-sheet-close'],
        `navbar32 sheet close @${width}`
      );

      // External toggle stays three-bar hamburger — not an X morph.
      await expect(page.locator(`${ROOT} .rn32-toggle span`)).toHaveCount(3);
      const noXMorph = await page.evaluate(() => {
        const spans = Array.from(document.querySelectorAll('[data-rn32-root] .rn32-toggle > span'));
        if (spans.length !== 3) return { ok: false, reason: 'span count' };
        const rotated = spans.some((span) => {
          const style = getComputedStyle(span);
          const rotate = (style.rotate || '').trim();
          if (rotate && rotate !== 'none' && rotate !== '0deg') return true;
          const transform = style.transform || '';
          // 45° X arms show non-axis-aligned matrix components (b/c nonzero).
          if (transform.startsWith('matrix(')) {
            const parts = transform.slice(7, -1).split(',').map((v) => Number.parseFloat(v.trim()));
            if (parts.length >= 4) {
              const [, b, c] = parts;
              return Math.abs(b) > 0.01 || Math.abs(c) > 0.01;
            }
          }
          return false;
        });
        const allVisible = spans.every((span) => Number.parseFloat(getComputedStyle(span).opacity || '1') > 0.5);
        return {
          ok: !rotated && allVisible,
          open: document.querySelector('[data-rn32-root] .rn32-toggle')?.getAttribute('aria-expanded'),
        };
      });
      expect(noXMorph.ok, `hamburger not X @${width}`).toBe(true);
      expect(noXMorph.open).toBe('true');

      await closeDrawer(page);
    }
  });

  test('preview passes WCAG 2.1 AA axe scan (closed and open)', async ({ page }) => {
    await gotoBlock(page, staticServer.origin, { width: 1280, height: 900 });
    await injectAxe(page);
    await checkA11y(page, ROOT, {
      detailedReport: true,
      axeOptions: {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    });

    await openDrawer(page);
    await checkA11y(page, undefined, {
      detailedReport: true,
      axeOptions: {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    });
  });
});
