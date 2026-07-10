// @ts-check
/**
 * Navigation blocks — catalog + Navbar Mega Menu behavior.
 */
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { injectAxe, checkA11y } = require('axe-playwright');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCKS_INDEX = '/templates/blocks/index.html';
const MEGA_MENU = '/templates/blocks/nav-mega-menu.html';
const DRAWER = '/templates/blocks/nav-drawer.html';

async function startStaticServer() {
  const contentTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
  };

  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url || '/', 'http://127.0.0.1').pathname);
    const filePath = path.normalize(path.join(PKG_ROOT, pathname));

    if (!filePath.startsWith(PKG_ROOT + path.sep) && filePath !== PKG_ROOT) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, {
        'content-type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
      });
      res.end(data);
    });
  });

  await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
  const { port } = server.address();
  return {
    origin: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolveClose) => server.close(resolveClose)),
  };
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function collectPageErrors(page) {
  /** @type {string[]} */
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  return errors;
}

test.describe('Navigation blocks', () => {
  /** @type {{ origin: string, close: () => Promise<void> }} */
  let staticServer;

  test.beforeAll(async () => {
    staticServer = await startStaticServer();
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  test('catalog lists both navigation blocks and pages load cleanly', async ({ page }) => {
    const errors = await collectPageErrors(page);

    await page.goto(`${staticServer.origin}${BLOCKS_INDEX}`);
    await expect(page.getByRole('heading', { name: 'Navigation blocks' })).toBeVisible();

    const drawerCard = page.locator('a.bb-card[href="nav-drawer.html"]');
    const megaCard = page.locator('a.bb-card[href="nav-mega-menu.html"]');
    await expect(drawerCard).toBeVisible();
    await expect(megaCard).toBeVisible();
    await expect(drawerCard.getByRole('heading', { name: 'Navbar Drawer' })).toBeVisible();
    await expect(megaCard.getByRole('heading', { name: 'Navbar Mega Menu' })).toBeVisible();

    await page.goto(`${staticServer.origin}${DRAWER}`);
    await expect(page.getByRole('heading', { name: 'Navbar Drawer', level: 1 })).toBeVisible();

    await page.goto(`${staticServer.origin}${MEGA_MENU}`);
    await expect(page.getByRole('heading', { name: 'Navbar Mega Menu', level: 1 })).toBeVisible();
    await expect(page.locator('ren-nav')).toHaveCount(1);
    await expect(page.locator('nav[aria-label="Example site"]')).toHaveCount(1);

    expect(errors, `console/page errors:\n${errors.join('\n')}`).toEqual([]);
  });

  test('exactly one primary links tree serves desktop and mobile', async ({ page }) => {
    await page.goto(`${staticServer.origin}${MEGA_MENU}`);
    await expect(page.locator('#rbm-primary-links')).toHaveCount(1);
    await expect(page.locator('ul.ren-nav-links')).toHaveCount(1);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('#rbm-primary-links')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.locator('.ren-nav-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rbm-primary-links')).toBeVisible();
    await expect(page.locator('ul.ren-nav-links')).toHaveCount(1);
  });

  test('summary opens by click and keyboard; Escape restores focus', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${staticServer.origin}${MEGA_MENU}`);

    const disclosure = page.locator('.rbm-disclosure');
    const summary = disclosure.locator('summary');
    const panel = page.locator('.rbm-panel');

    await expect(disclosure).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();
    await expect(page.getByRole('link', { name: 'Live routing' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('SUMMARY');

    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(disclosure).toHaveAttribute('open', '');
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.focus();
    await page.keyboard.press(' ');
    await expect(disclosure).toHaveAttribute('open', '');
  });

  test('outside click and destination activation close the disclosure', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${staticServer.origin}${MEGA_MENU}`);

    const disclosure = page.locator('.rbm-disclosure');
    const summary = disclosure.locator('summary');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');

    // Click a surface outside the disclosure (panel overlays the hero top).
    await page.locator('.ren-nav-brand').click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.getByRole('link', { name: 'Live routing' }).click();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('mobile toggle exposes the same tree and closes mega on menu close', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${staticServer.origin}${MEGA_MENU}`);

    const toggle = page.locator('.ren-nav-toggle');
    const disclosure = page.locator('.rbm-disclosure');
    const summary = disclosure.locator('summary');

    await expect(toggle).toHaveAttribute('aria-controls', 'rbm-primary-links');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rbm-primary-links')).toBeVisible();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.getByRole('link', { name: 'Signal map' })).toBeVisible();
    // Summary activation must not collapse the mobile tree.
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('JS-disabled mobile keeps the nav tree and mega destinations usable', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto(`${staticServer.origin}${MEGA_MENU}`);

    // Inert toggle is hidden; single tree + actions remain available.
    await expect(page.locator('.ren-nav-toggle')).toBeHidden();
    await expect(page.locator('#rbm-primary-links')).toBeVisible();
    await expect(page.locator('#rbm-primary-links a.ren-nav-link[href="#product"]')).toBeVisible();
    await expect(page.locator('.ren-nav-actions a[href="#sign-in"]')).toBeVisible();
    await expect(page.locator('.ren-nav-actions a[href="#start"]')).toBeVisible();

    await page.locator('.rbm-disclosure > summary').click();
    await expect(page.locator('.rbm-disclosure')).toHaveAttribute('open', '');
    await expect(page.getByRole('link', { name: 'Live routing' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Signal map' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View all insights' })).toBeVisible();

    await context.close();
  });

  test('viewport geometry: desktop panel under bar, mobile in-flow, no horizontal overflow', async ({ page }) => {
    // Desktop: panel top is at or below navbar bottom; no horizontal overflow.
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${staticServer.origin}${MEGA_MENU}`);
    await page.locator('.rbm-disclosure > summary').click();
    await expect(page.locator('.rbm-panel')).toBeVisible();

    const desktop = await page.evaluate(() => {
      const nav = document.querySelector('.rbm-preview .ren-nav');
      const panel = document.querySelector('.rbm-panel');
      const doc = document.documentElement;
      if (!nav || !panel) return null;
      const navRect = nav.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      return {
        navBottom: navRect.bottom,
        panelTop: panelRect.top,
        panelPosition: getComputedStyle(panel).position,
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
      };
    });
    expect(desktop).toBeTruthy();
    expect(desktop.panelPosition).toBe('absolute');
    expect(desktop.panelTop).toBeGreaterThanOrEqual(desktop.navBottom - 1);
    expect(desktop.scrollWidth).toBeLessThanOrEqual(desktop.clientWidth + 1);

    // Mobile: panel is in-flow and does not cover following nav destinations.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${staticServer.origin}${MEGA_MENU}`);
    await page.locator('.ren-nav-toggle').click();
    await page.locator('.rbm-disclosure > summary').click();
    await expect(page.locator('.rbm-panel')).toBeVisible();

    const mobile = await page.evaluate(() => {
      const panel = document.querySelector('.rbm-panel');
      const pricing = document.querySelector('a.ren-nav-link[href="#pricing"]');
      const docs = document.querySelector('a.ren-nav-link[href="#docs"]');
      const doc = document.documentElement;
      if (!panel || !pricing || !docs) return null;
      const panelRect = panel.getBoundingClientRect();
      const pricingRect = pricing.getBoundingClientRect();
      const docsRect = docs.getBoundingClientRect();
      const position = getComputedStyle(panel).position;
      return {
        position,
        panelBottom: panelRect.bottom,
        pricingTop: pricingRect.top,
        docsTop: docsRect.top,
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
      };
    });
    expect(mobile).toBeTruthy();
    expect(['static', 'relative']).toContain(mobile.position);
    // Following primary destinations must start at or below the panel (not covered).
    expect(mobile.pricingTop).toBeGreaterThanOrEqual(mobile.panelBottom - 1);
    expect(mobile.docsTop).toBeGreaterThanOrEqual(mobile.panelBottom - 1);
    expect(mobile.scrollWidth).toBeLessThanOrEqual(mobile.clientWidth + 1);
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto(`${staticServer.origin}${MEGA_MENU}`);

    await page.locator('.ren-nav-toggle').click();
    await page.locator('.rbm-disclosure > summary').click();

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-rbm-root]');
      if (!root) return [{ name: 'missing-root', width: 0, height: 0 }];

      const candidates = root.querySelectorAll(
        'a[href], button, summary, .ren-nav-toggle, .rbm-dest, .rbm-feature, .rbm-view-all'
      );
      const bad = [];
      for (const el of candidates) {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        if (rect.width < 44 || rect.height < 44) {
          bad.push({
            name: el.className || el.tagName,
            text: (el.textContent || '').trim().slice(0, 40),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          });
        }
      }
      return bad;
    });

    expect(undersized, JSON.stringify(undersized, null, 2)).toEqual([]);
    await context.close();
  });

  test('reduced-motion disables block-local transitions and animations', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${staticServer.origin}${MEGA_MENU}`);
    await page.locator('.rbm-disclosure > summary').click();

    const motion = await page.evaluate(() => {
      const selectors = ['.rbm-panel', '.rbm-chevron', '.rbm-dest', '.rbm-feature'];
      return selectors.map((selector) => {
        const el = document.querySelector(selector);
        if (!el) return { selector, missing: true };
        const style = window.getComputedStyle(el);
        return {
          selector,
          transitionDuration: style.transitionDuration,
          animationName: style.animationName,
          animationDuration: style.animationDuration,
        };
      });
    });

    for (const item of motion) {
      expect(item.missing, item.selector).toBeFalsy();
      const durations = String(item.transitionDuration || '')
        .split(',')
        .map((part) => part.trim());
      for (const duration of durations) {
        expect(duration === '0s' || duration === '0ms' || duration === '', item.selector).toBeTruthy();
      }
      const animName = String(item.animationName || 'none');
      expect(animName === 'none' || animName === '', item.selector).toBeTruthy();
    }
  });

  test('mega menu preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await page.goto(`${staticServer.origin}${MEGA_MENU}`);
    await injectAxe(page);
    await checkA11y(page, '[data-rbm-root]', {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    });
  });

  test('light and dark surfaces resolve through RenDS tokens', async ({ page }) => {
    await page.goto(`${staticServer.origin}${MEGA_MENU}`);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }, theme);

      const colors = await page.evaluate(() => {
        const surface = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim();
        const text = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
        const nav = document.querySelector('.rbm-preview .ren-nav');
        const hero = document.querySelector('.rbm-hero');
        return {
          surface,
          text,
          navBg: nav ? getComputedStyle(nav).backgroundColor : '',
          heroColor: hero ? getComputedStyle(hero).color : '',
        };
      });

      expect(colors.surface, theme).toBeTruthy();
      expect(colors.text, theme).toBeTruthy();
      expect(colors.navBg, theme).not.toBe('');
      expect(colors.heroColor, theme).not.toBe('');
      // Resolved paint should not be the invalid empty / transparent-only surface for text.
      expect(colors.navBg, theme).not.toMatch(/rgba\(0,\s*0,\s*0,\s*0\)/);
    }
  });

  test('repeated init replaces the previous listener controller', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${staticServer.origin}${MEGA_MENU}`);

    const ok = await page.evaluate(() => {
      const root = document.querySelector('[data-rbm-root]');
      if (!root || typeof window.initNavMegaMenu !== 'function') return false;
      const first = window.initNavMegaMenu();
      const second = window.initNavMegaMenu();
      // First controller should be aborted when replaced.
      return Boolean(first?.signal?.aborted && second && !second.signal.aborted);
    });
    expect(ok).toBe(true);

    // Still only one effective open/close path.
    const disclosure = page.locator('.rbm-disclosure');
    await page.locator('.rbm-disclosure > summary').click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');
  });
});
