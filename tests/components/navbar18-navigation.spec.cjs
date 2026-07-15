// @ts-check
/**
 * Isolated Navbar 18 (nav-logo-cta-overlay-grid) — always-overlay link grid.
 * Does not modify shared blocks-navigation.spec.cjs.
 */
const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { injectAxe, checkA11y } = require('axe-playwright');
const {
  expectNoOverflow,
  expectSingleVisibleAffordance,
} = require('../utils/block-quality.cjs');
const { startStaticServer } = require('../utils/static-server.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/nav-logo-cta-overlay-grid.html';
const ROOT = '[data-rn18-root]';

/** @type {{ origin: string, close: () => Promise<void> }} */
let staticServer;

test.beforeAll(async () => {
  staticServer = await startStaticServer(PKG_ROOT);
});

test.afterAll(async () => {
  await staticServer?.close();
});

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ width: number, height: number }} viewport
 * @param {{ reducedMotion?: 'reduce' | 'no-preference', theme?: 'light' | 'dark', javaScriptEnabled?: boolean }} [opts]
 */
async function openBlock(page, viewport, opts = {}) {
  const {
    reducedMotion = 'no-preference',
    theme = 'light',
    javaScriptEnabled = true,
  } = opts;

  await page.setViewportSize(viewport);
  if (reducedMotion) {
    await page.emulateMedia({ reducedMotion });
  }

  if (!javaScriptEnabled) {
    await page.context().addInitScript(() => {
      // no-op placeholder — real disable uses context option below when needed
    });
  }

  await page.goto(`${staticServer.origin}${BLOCK}`, {
    waitUntil: 'domcontentloaded',
  });

  if (theme === 'dark') {
    await page.locator('html').evaluate((el) => {
      el.setAttribute('data-theme', 'dark');
    });
  }
}

/**
 * @param {import('@playwright/test').Page} page
 */
function root(page) {
  return page.locator(ROOT);
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function openMenu(page) {
  const toggle = root(page).locator('.ren-nav-toggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 */
async function isVisiblyDisplayed(page, selector) {
  return page.locator(`${ROOT} ${selector}`).evaluateAll((els) =>
    els.some((el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return (
        style.display !== 'none'
        && style.visibility !== 'hidden'
        && rect.width > 0
        && rect.height > 0
      );
    }),
  );
}

test.describe('Navbar 18 logo CTA overlay grid (navbar18)', () => {
  test('block page loads with ren-nav shell and navbar18 root', async ({ page }) => {
    await openBlock(page, { width: 1280, height: 900 });
    await expect(root(page), 'missing [data-rn18-root] shell').toHaveCount(1, {
      timeout: 5000,
    });
    await expect(root(page).locator('ren-nav')).toHaveCount(1);
    await expect(root(page).locator('nav.ren-nav')).toHaveCount(1);
    await expect(root(page).locator('ul.ren-nav-links')).toHaveCount(1);
  });

  test('exact affordance counts: brand, CTA, toggle, 8 links, contact, 5 socials, 0 chevrons', async ({ page }) => {
    await openBlock(page, { width: 1280, height: 900 });
    await expect(root(page).locator('.ren-nav-brand')).toHaveCount(1);
    await expect(
      root(page).locator('.ren-nav-actions a.ren-btn, .ren-nav-actions .ren-btn'),
    ).toHaveCount(1);
    await expect(root(page).locator('.ren-nav-toggle')).toHaveCount(1);
    await expect(root(page).locator('a.rn18-link')).toHaveCount(8);
    await expect(root(page).locator('.rn18-contact')).toHaveCount(1);
    await expect(root(page).locator('a.rn18-social-link')).toHaveCount(5);
    await expect(root(page).locator('.rn18-chevron')).toHaveCount(0);
    await expect(root(page).locator('details')).toHaveCount(0);
    await expect(root(page).locator('summary')).toHaveCount(0);
  });

  test('one navigation landmark and one link tree', async ({ page }) => {
    await openBlock(page, { width: 1280, height: 900 });
    await expect(root(page).locator('nav')).toHaveCount(1);
    await expect(root(page).locator('ul.ren-nav-links')).toHaveCount(1);
    await expect(root(page).locator('ul.ren-nav-links > li')).toHaveCount(8);
  });

  test('desktop closed: bar shows brand + CTA + toggle; destinations not visible', async ({ page }) => {
    await openBlock(page, { width: 1280, height: 900 });
    await expect(root(page).locator('.ren-nav-brand')).toBeVisible();
    await expect(root(page).locator('.ren-nav-actions .ren-btn').first()).toBeVisible();
    await expect(root(page).locator('.ren-nav-toggle')).toBeVisible();
    await expect(root(page).locator('.ren-nav-toggle')).toHaveAttribute('aria-expanded', 'false');

    const linksVisible = await isVisiblyDisplayed(page, 'a.rn18-link');
    expect(linksVisible, 'closed desktop must hide overlay destinations').toBe(false);
  });

  test('desktop open: overlay shows 8 links, contact, and 5 socials', async ({ page }) => {
    await openBlock(page, { width: 1280, height: 900 });
    await openMenu(page);

    await expect(root(page).locator('a.rn18-link').first()).toBeVisible();
    await expect(root(page).locator('.rn18-contact')).toBeVisible();
    await expect(root(page).locator('a.rn18-social-link').first()).toBeVisible();

    const linkCount = await root(page).locator('a.rn18-link').evaluateAll((els) =>
      els.filter((el) => {
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.display !== 'none' && rect.width > 0 && rect.height > 0;
      }).length,
    );
    expect(linkCount).toBe(8);

    const geometry = await page.evaluate((rootSel) => {
      const rootEl = document.querySelector(rootSel);
      const nav = rootEl?.querySelector('.ren-nav');
      const menu = rootEl?.querySelector('.rn18-menu');
      const brand = rootEl?.querySelector('.ren-nav-brand');
      const cta = rootEl?.querySelector('.ren-nav-actions .ren-btn');
      const toggle = rootEl?.querySelector('.ren-nav-toggle');
      if (!nav || !menu || !brand || !cta || !toggle) return null;
      const navRect = nav.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const brandRect = brand.getBoundingClientRect();
      const ctaRect = cta.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();
      const barBottom = Math.max(brandRect.bottom, ctaRect.bottom, toggleRect.bottom);
      return {
        // Menu is in-flow under the permanent bar row (grid row 2).
        menuBelowBar: menuRect.top >= barBottom - 2,
        brandLeftOfCta: brandRect.left < ctaRect.left,
        ctaLeftOfToggle: ctaRect.left < toggleRect.left,
        menuWidth: menuRect.width,
        navWidth: navRect.width,
        menuLeft: menuRect.left,
        navLeft: navRect.left,
        widthDelta: Math.abs(menuRect.width - navRect.width),
        leftDelta: Math.abs(menuRect.left - navRect.left),
      };
    }, ROOT);

    expect(geometry).not.toBeNull();
    expect(geometry.menuBelowBar).toBe(true);
    expect(geometry.brandLeftOfCta).toBe(true);
    expect(geometry.ctaLeftOfToggle).toBe(true);
    // Full-width alignment: menu matches nav box (not the old ~85% / 40px-strip case).
    expect(geometry.widthDelta, 'menu width must match nav width').toBeLessThanOrEqual(2);
    expect(geometry.leftDelta, 'menu must align with nav start edge').toBeLessThanOrEqual(2);
    expect(geometry.menuWidth).toBeGreaterThan(geometry.navWidth * 0.98);
  });

  test('desktop toggle closes the overlay', async ({ page }) => {
    await openBlock(page, { width: 1280, height: 900 });
    const toggle = root(page).locator('.ren-nav-toggle');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    const linksVisible = await isVisiblyDisplayed(page, 'a.rn18-link');
    expect(linksVisible).toBe(false);
  });

  test('Escape from overlay destination link closes and focuses toggle', async ({ page }) => {
    await openBlock(page, { width: 1280, height: 900 });
    const toggle = root(page).locator('.ren-nav-toggle');
    await openMenu(page);
    const link = root(page).locator('a.rn18-link').first();
    await link.focus();
    await expect(link).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('Escape from contact action closes and focuses toggle', async ({ page }) => {
    await openBlock(page, { width: 1280, height: 900 });
    const toggle = root(page).locator('.ren-nav-toggle');
    await openMenu(page);
    const contact = root(page).locator('.rn18-contact');
    await contact.focus();
    await expect(contact).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('Escape from social destination closes and focuses toggle', async ({ page }) => {
    await openBlock(page, { width: 1280, height: 900 });
    const toggle = root(page).locator('.ren-nav-toggle');
    await openMenu(page);
    const social = root(page).locator('a.rn18-social-link').first();
    await social.focus();
    await expect(social).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('desktop outside click closes overlay', async ({ page }) => {
    await openBlock(page, { width: 1280, height: 900 });
    await openMenu(page);
    // Overlay covers in-preview siblings; click demo chrome outside ren-nav.
    await page.locator('.rn18-page-header h1').click();
    await expect(root(page).locator('.ren-nav-toggle')).toHaveAttribute('aria-expanded', 'false');
  });

  test('desktop destination activation closes overlay', async ({ page }) => {
    await openBlock(page, { width: 1280, height: 900 });
    await openMenu(page);
    await root(page).locator('a.rn18-link').first().click();
    await expect(root(page).locator('.ren-nav-toggle')).toHaveAttribute('aria-expanded', 'false');
  });

  test('desktop bar CTA while open closes the overlay', async ({ page }) => {
    await openBlock(page, { width: 1280, height: 900 });
    await openMenu(page);
    await root(page).locator('.ren-nav-actions a.ren-btn, .ren-nav-actions .ren-btn').first().click();
    await expect(root(page).locator('.ren-nav-toggle')).toHaveAttribute('aria-expanded', 'false');
    const linksVisible = await isVisiblyDisplayed(page, 'a.rn18-link');
    expect(linksVisible).toBe(false);
  });

  test('desktop does not open overlay on hover alone', async ({ page }) => {
    await openBlock(page, { width: 1280, height: 900 });
    await root(page).locator('.ren-nav-toggle').hover();
    await expect(root(page).locator('.ren-nav-toggle')).toHaveAttribute('aria-expanded', 'false');
    const linksVisible = await isVisiblyDisplayed(page, 'a.rn18-link');
    expect(linksVisible).toBe(false);
  });

  test('tablet open preserves always-overlay model and two-column intent', async ({ page }) => {
    await openBlock(page, { width: 834, height: 1112 });
    await expect(root(page).locator('.ren-nav-toggle')).toBeVisible();
    await openMenu(page);
    await expect(root(page).locator('a.rn18-link').nth(1)).toBeVisible();

    const grid = await page.evaluate((rootSel) => {
      const rootEl = document.querySelector(rootSel);
      const links = Array.from(rootEl?.querySelectorAll('a.rn18-link') || []);
      if (links.length < 2) return null;
      const a = links[0].getBoundingClientRect();
      const b = links[1].getBoundingClientRect();
      return {
        sideBySide: Math.abs(a.top - b.top) < a.height * 0.5 && b.left > a.right - 4,
        bothVisible: a.width > 0 && b.width > 0,
      };
    }, ROOT);

    expect(grid).not.toBeNull();
    expect(grid.bothVisible).toBe(true);
    expect(grid.sideBySide, 'tablet open should use multi-column link grid').toBe(true);
  });

  test('mobile closed: brand + CTA + toggle visible; destinations hidden', async ({ page }) => {
    await openBlock(page, { width: 390, height: 844 });
    await expect(root(page).locator('.ren-nav-brand')).toBeVisible();
    await expect(root(page).locator('.ren-nav-actions .ren-btn').first()).toBeVisible();
    await expect(root(page).locator('.ren-nav-toggle')).toBeVisible();
    const linksVisible = await isVisiblyDisplayed(page, 'a.rn18-link');
    expect(linksVisible).toBe(false);
  });

  test('mobile open: stacked destinations and footer actions', async ({ page }) => {
    await openBlock(page, { width: 390, height: 1100 });
    await openMenu(page);
    await expect(root(page).locator('a.rn18-link').first()).toBeVisible();
    await expect(root(page).locator('.rn18-contact')).toBeVisible();
    await expect(root(page).locator('a.rn18-social-link').first()).toBeVisible();

    const stack = await page.evaluate((rootSel) => {
      const rootEl = document.querySelector(rootSel);
      const links = Array.from(rootEl?.querySelectorAll('a.rn18-link') || []);
      if (links.length < 2) return null;
      const a = links[0].getBoundingClientRect();
      const b = links[1].getBoundingClientRect();
      return {
        stacked: b.top >= a.bottom - 2,
        singleColumn: Math.abs(a.left - b.left) < 8,
      };
    }, ROOT);

    expect(stack).not.toBeNull();
    expect(stack.stacked).toBe(true);
    expect(stack.singleColumn).toBe(true);
  });

  test('mobile toggle has accessible name and expanded/controls', async ({ page }) => {
    await openBlock(page, { width: 390, height: 844 });
    const toggle = root(page).locator('.ren-nav-toggle');
    await expect(toggle).toHaveAttribute('aria-label', /.+/);
    await expect(toggle).toHaveAttribute('aria-controls', /.+/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('single close affordance on open toggle (no duplicate chevrons)', async ({ page }) => {
    await openBlock(page, { width: 390, height: 844 });
    await openMenu(page);
    await expectSingleVisibleAffordance(page, [
      `${ROOT} .ren-nav-toggle`,
    ], 'navbar18 menu close toggle');
    await expect(root(page).locator('.rn18-chevron')).toHaveCount(0);
  });

  test('JS-disabled: toggle hidden; destinations, contact, and socials reachable', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    try {
      await page.setViewportSize({ width: 390, height: 1100 });
      await page.goto(`${staticServer.origin}${BLOCK}`, { waitUntil: 'domcontentloaded' });

      await expect(root(page)).toHaveCount(1);
      await expect(root(page).locator('.ren-nav-toggle')).toBeHidden();
      await expect(root(page).locator('a.rn18-link').first()).toBeVisible();
      await expect(root(page).locator('.rn18-contact')).toBeVisible();
      await expect(root(page).locator('a.rn18-social-link').first()).toBeVisible();

      const visibleLinks = await root(page).locator('a.rn18-link').evaluateAll((els) =>
        els.filter((el) => {
          const style = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return style.display !== 'none' && rect.width > 0 && rect.height > 0;
        }).length,
      );
      expect(visibleLinks).toBe(8);
    } finally {
      await context.close();
    }
  });

  test('light and dark open states keep readable token surfaces', async ({ page }) => {
    await openBlock(page, { width: 1280, height: 900 }, { theme: 'light' });
    await openMenu(page);
    const light = await page.evaluate((rootSel) => {
      const rootEl = document.querySelector(rootSel);
      const nav = rootEl?.querySelector('.ren-nav');
      const menu = rootEl?.querySelector('.rn18-menu');
      if (!nav || !menu) return null;
      const navBg = getComputedStyle(nav).backgroundColor;
      const menuBg = getComputedStyle(menu).backgroundColor;
      const linkColor = getComputedStyle(rootEl.querySelector('a.rn18-link')).color;
      return { navBg, menuBg, linkColor };
    }, ROOT);
    expect(light).not.toBeNull();
    expect(light.navBg).not.toBe('rgba(0, 0, 0, 0)');
    expect(light.linkColor).not.toBe('rgba(0, 0, 0, 0)');

    await page.locator('html').evaluate((el) => el.setAttribute('data-theme', 'dark'));
    const dark = await page.evaluate((rootSel) => {
      const rootEl = document.querySelector(rootSel);
      const nav = rootEl?.querySelector('.ren-nav');
      const link = rootEl?.querySelector('a.rn18-link');
      if (!nav || !link) return null;
      return {
        navBg: getComputedStyle(nav).backgroundColor,
        linkColor: getComputedStyle(link).color,
      };
    }, ROOT);
    expect(dark).not.toBeNull();
    expect(dark.navBg).not.toBe('rgba(0, 0, 0, 0)');
    expect(dark.linkColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('reduced motion open does not require animation to show destinations', async ({ page }) => {
    await openBlock(page, { width: 1280, height: 900 }, { reducedMotion: 'reduce' });
    await openMenu(page);
    await expect(root(page).locator('a.rn18-link').first()).toBeVisible();
  });

  test('interactive targets meet 44px minimum', async ({ page }) => {
    await openBlock(page, { width: 390, height: 1100 });
    await openMenu(page);

    const sizes = await page.evaluate((rootSel) => {
      const rootEl = document.querySelector(rootSel);
      const selectors = [
        '.ren-nav-brand',
        '.ren-nav-toggle',
        '.ren-nav-actions .ren-btn',
        'a.rn18-link',
        '.rn18-contact',
        'a.rn18-social-link',
      ];
      /** @type {{ selector: string, w: number, h: number }[]} */
      const out = [];
      for (const selector of selectors) {
        rootEl?.querySelectorAll(selector).forEach((el) => {
          const rect = el.getBoundingClientRect();
          out.push({ selector, w: rect.width, h: rect.height });
        });
      }
      return out;
    }, ROOT);

    expect(sizes.length).toBeGreaterThan(10);
    for (const item of sizes) {
      expect(item.w, `${item.selector} width`).toBeGreaterThanOrEqual(44);
      expect(item.h, `${item.selector} height`).toBeGreaterThanOrEqual(44);
    }
  });

  test('open overlay does not overflow the viewport horizontally', async ({ page }) => {
    await openBlock(page, { width: 390, height: 1100 });
    await openMenu(page);
    await expectNoOverflow(page, ROOT);
    await expectNoOverflow(page, `${ROOT} .rn18-menu`);
    await expectNoOverflow(page, `${ROOT} .ren-nav`);
  });

  test('narrow 320 and 340 bars keep non-overlapping 44px chrome', async ({ page }) => {
    for (const width of [320, 340]) {
      await openBlock(page, { width, height: 720 });
      const report = await page.evaluate((rootSel) => {
        const rootEl = document.querySelector(rootSel);
        const brand = rootEl?.querySelector('.ren-nav-brand');
        const cta = rootEl?.querySelector('.ren-nav-actions .ren-btn');
        const toggle = rootEl?.querySelector('.ren-nav-toggle');
        if (!brand || !cta || !toggle) return null;

        /** @param {DOMRect} a @param {DOMRect} b */
        function overlapX(a, b) {
          return Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        }

        const brandRect = brand.getBoundingClientRect();
        const ctaRect = cta.getBoundingClientRect();
        const toggleRect = toggle.getBoundingClientRect();
        return {
          brand: { w: brandRect.width, h: brandRect.height, l: brandRect.left, r: brandRect.right },
          cta: { w: ctaRect.width, h: ctaRect.height, l: ctaRect.left, r: ctaRect.right },
          toggle: { w: toggleRect.width, h: toggleRect.height, l: toggleRect.left, r: toggleRect.right },
          brandCtaOverlap: overlapX(brandRect, ctaRect),
          ctaToggleOverlap: overlapX(ctaRect, toggleRect),
          brandToggleOverlap: overlapX(brandRect, toggleRect),
        };
      }, ROOT);

      expect(report, `geometry at ${width}px`).not.toBeNull();
      expect(report.brandCtaOverlap, `${width}px brand/CTA overlap`).toBe(0);
      expect(report.ctaToggleOverlap, `${width}px CTA/toggle overlap`).toBe(0);
      expect(report.brandToggleOverlap, `${width}px brand/toggle overlap`).toBe(0);
      for (const key of ['brand', 'cta', 'toggle']) {
        expect(report[key].w, `${width}px ${key} width`).toBeGreaterThanOrEqual(44);
        expect(report[key].h, `${width}px ${key} height`).toBeGreaterThanOrEqual(44);
      }
      expect(report.brand.r, `${width}px brand before CTA`).toBeLessThanOrEqual(report.cta.l + 0.5);
      expect(report.cta.r, `${width}px CTA before toggle`).toBeLessThanOrEqual(report.toggle.l + 0.5);
    }
  });

  test('open state has no root or document horizontal overflow at mobile and desktop', async ({ page }) => {
    for (const viewport of [
      { width: 320, height: 720 },
      { width: 390, height: 844 },
      { width: 1280, height: 900 },
    ]) {
      await openBlock(page, viewport);
      await openMenu(page);
      await expectNoOverflow(page, ROOT);
      await expectNoOverflow(page, `${ROOT} .ren-nav`);
      await expectNoOverflow(page, `${ROOT} .rn18-menu`);

      const docOverflow = await page.evaluate(() => ({
        html: {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        },
        body: {
          scrollWidth: document.body.scrollWidth,
          clientWidth: document.body.clientWidth,
        },
      }));
      expect(
        docOverflow.html.scrollWidth,
        `html overflow at ${viewport.width}`,
      ).toBeLessThanOrEqual(docOverflow.html.clientWidth + 1);
      expect(
        docOverflow.body.scrollWidth,
        `body overflow at ${viewport.width}`,
      ).toBeLessThanOrEqual(docOverflow.body.clientWidth + 1);
    }
  });

  test('menu panel matches nav full width at mobile and desktop', async ({ page }) => {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 1280, height: 900 },
    ]) {
      await openBlock(page, viewport);
      await openMenu(page);
      const measure = await page.evaluate((rootSel) => {
        const rootEl = document.querySelector(rootSel);
        const nav = rootEl?.querySelector('.ren-nav');
        const menu = rootEl?.querySelector('.rn18-menu');
        if (!nav || !menu) return null;
        const navRect = nav.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        return {
          navW: navRect.width,
          menuW: menuRect.width,
          navL: navRect.left,
          menuL: menuRect.left,
          navR: navRect.right,
          menuR: menuRect.right,
        };
      }, ROOT);
      expect(measure, `measure at ${viewport.width}`).not.toBeNull();
      expect(Math.abs(measure.menuW - measure.navW), `${viewport.width} width delta`).toBeLessThanOrEqual(2);
      expect(Math.abs(measure.menuL - measure.navL), `${viewport.width} left delta`).toBeLessThanOrEqual(2);
      expect(Math.abs(measure.menuR - measure.navR), `${viewport.width} right delta`).toBeLessThanOrEqual(2);
    }
  });

  test('same-band desktop resize preserves open via public ARIA only', async ({ page }) => {
    await openBlock(page, { width: 1280, height: 900 });
    await openMenu(page);
    await expect(root(page).locator('.ren-nav-toggle')).toHaveAttribute('aria-expanded', 'true');

    // Width-only same band (still ≥768).
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.waitForTimeout(50);
    await expect(root(page).locator('.ren-nav-toggle')).toHaveAttribute('aria-expanded', 'true');
    await expect(root(page).locator('a.rn18-link').first()).toBeVisible();

    // Height-only same band.
    await page.setViewportSize({ width: 1200, height: 850 });
    await page.waitForTimeout(50);
    await expect(root(page).locator('.ren-nav-toggle')).toHaveAttribute('aria-expanded', 'true');
    await expect(root(page).locator('a.rn18-link').first()).toBeVisible();

    // Public ownership only — no private ren-nav method checks.
    const publicState = await page.evaluate((rootSel) => {
      const rootEl = document.querySelector(rootSel);
      const host = rootEl?.querySelector('ren-nav');
      const toggle = rootEl?.querySelector('.ren-nav-toggle');
      return {
        ariaExpanded: toggle?.getAttribute('aria-expanded'),
        dataOpen: host?.hasAttribute('data-open') ?? false,
        ariaControls: toggle?.getAttribute('aria-controls'),
        ariaLabel: toggle?.getAttribute('aria-label'),
      };
    }, ROOT);
    expect(publicState.ariaExpanded).toBe('true');
    expect(publicState.dataOpen).toBe(true);
    expect(publicState.ariaControls).toBeTruthy();
    expect(publicState.ariaLabel).toBeTruthy();
  });

  test('breakpoint crossing at 767/768/769 closes open shell via public ARIA', async ({ page }) => {
    // Open on wide, cross down through 768 into narrow.
    await openBlock(page, { width: 900, height: 800 });
    await openMenu(page);
    await expect(root(page).locator('.ren-nav-toggle')).toHaveAttribute('aria-expanded', 'true');

    await page.setViewportSize({ width: 769, height: 800 });
    await page.waitForTimeout(50);
    await expect(root(page).locator('.ren-nav-toggle')).toHaveAttribute('aria-expanded', 'true');

    await page.setViewportSize({ width: 768, height: 800 });
    await page.waitForTimeout(50);
    // 768 is the wide-band edge (width < 768 is narrow); stay open at exactly 768.
    await expect(root(page).locator('.ren-nav-toggle')).toHaveAttribute('aria-expanded', 'true');

    await page.setViewportSize({ width: 767, height: 800 });
    await page.waitForTimeout(50);
    await expect(root(page).locator('.ren-nav-toggle')).toHaveAttribute('aria-expanded', 'false');

    // Open on narrow, cross up into wide — must close on band change.
    await openMenu(page);
    await expect(root(page).locator('.ren-nav-toggle')).toHaveAttribute('aria-expanded', 'true');
    await page.setViewportSize({ width: 768, height: 800 });
    await page.waitForTimeout(50);
    await expect(root(page).locator('.ren-nav-toggle')).toHaveAttribute('aria-expanded', 'false');
  });

  test('navbar18 preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await openBlock(page, { width: 1280, height: 900 });
    await openMenu(page);
    await injectAxe(page);
    await checkA11y(page, ROOT, {
      detailedReport: true,
      axeOptions: {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    });
  });
});
