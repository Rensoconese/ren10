// @ts-check
/**
 * Navigation blocks — catalog + Navbar Mega Menu (navbar5) + Featured Mega Menu (navbar6)
 * + Icons Mega Menu (navbar7) + Link-Rail Mega Menu (navbar8)
 * + Footer Mega Menu (navbar9) + Card-Grid Mega Menu (navbar10)
 * + Logo-Left Menu-Right Dropdown (navbar11)
 * + Logo-Left Menu-Right Grouped (navbar12)
 * + Logo-Left Menu-Center Dropdown (navbar13)
 * + Floating Logo-Left Menu-Right Actions (navbar14 RED).
 */
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { injectAxe, checkA11y } = require('axe-playwright');
const {
  expectAligned,
  expectNoOverflow,
  expectSingleVisibleAffordance,
  expectWidthRatio,
  inspectNativeChrome,
} = require('../utils/block-quality.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCKS_INDEX = '/templates/blocks/index.html';
const MEGA_MENU = '/templates/blocks/nav-mega-menu.html';
const MEGA_MENU_FEATURED = '/templates/blocks/nav-mega-menu-featured.html';
const MEGA_MENU_ICONS = '/templates/blocks/nav-mega-menu-icons.html';
const MEGA_MENU_LINK_RAIL = '/templates/blocks/nav-mega-menu-link-rail.html';
const MEGA_MENU_FOOTER = '/templates/blocks/nav-mega-menu-footer.html';
const MEGA_MENU_CARD_GRID = '/templates/blocks/nav-mega-menu-card-grid.html';
const LOGO_LEFT_MENU_RIGHT_DROPDOWN = '/templates/blocks/nav-logo-left-menu-right-dropdown.html';
const LOGO_LEFT_MENU_RIGHT_GROUPED = '/templates/blocks/nav-logo-left-menu-right-grouped.html';
const LOGO_LEFT_MENU_CENTER_DROPDOWN = '/templates/blocks/nav-logo-left-menu-center-dropdown.html';
const FLOATING_LOGO_LEFT_MENU_RIGHT_ACTIONS = '/templates/blocks/nav-floating-logo-left-menu-right-actions.html';
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

const HOVER_CORRIDOR_CASES = [
  {
    id: 'navbar6',
    path: MEGA_MENU_FEATURED,
    disclosure: '.rmf-disclosure',
    summary: '.rmf-disclosure > summary',
    destination: '.rmf-dest',
  },
  {
    id: 'navbar7',
    path: MEGA_MENU_ICONS,
    disclosure: '.rmi-disclosure',
    summary: '.rmi-disclosure > summary',
    destination: '.rmi-dest',
  },
  {
    id: 'navbar8',
    path: MEGA_MENU_LINK_RAIL,
    disclosure: '.rml-disclosure',
    summary: '.rml-disclosure > summary',
    destination: '.rml-dest',
  },
  {
    id: 'navbar9',
    path: MEGA_MENU_FOOTER,
    disclosure: '.rmnf-disclosure',
    summary: '.rmnf-disclosure > summary',
    destination: '.rmnf-dest',
  },
  {
    id: 'navbar10',
    path: MEGA_MENU_CARD_GRID,
    disclosure: '.rmcg-disclosure',
    summary: '.rmcg-disclosure > summary',
    destination: '.rmcg-card',
  },
  {
    id: 'navbar11',
    path: LOGO_LEFT_MENU_RIGHT_DROPDOWN,
    disclosure: '.rn11-disclosure',
    summary: '.rn11-disclosure > summary',
    destination: '.rn11-dropdown-link',
  },
  {
    id: 'navbar12',
    path: LOGO_LEFT_MENU_RIGHT_GROUPED,
    disclosure: '.rn12-disclosure',
    summary: '.rn12-disclosure > summary',
    destination: '.rn12-destination',
  },
  {
    id: 'navbar13',
    path: LOGO_LEFT_MENU_CENTER_DROPDOWN,
    disclosure: '.rn13-disclosure',
    summary: '.rn13-disclosure > summary',
    destination: '.rn13-destination',
  },
  {
    id: 'navbar14',
    path: FLOATING_LOGO_LEFT_MENU_RIGHT_ACTIONS,
    disclosure: '.rn14-disclosure',
    summary: '.rn14-disclosure > summary',
    destination: '.rn14-destination',
  },
];

const MOBILE_NAV_CHROME_CASES = [
  { id: 'navbar5', path: MEGA_MENU, root: '[data-rbm-root]' },
  { id: 'navbar6', path: MEGA_MENU_FEATURED, root: '[data-rmf-root]' },
  { id: 'navbar7', path: MEGA_MENU_ICONS, root: '[data-rmi-root]' },
  { id: 'navbar8', path: MEGA_MENU_LINK_RAIL, root: '[data-rml-root]' },
  { id: 'navbar9', path: MEGA_MENU_FOOTER, root: '[data-rmnf-root]' },
  { id: 'navbar10', path: MEGA_MENU_CARD_GRID, root: '[data-rmcg-root]' },
  { id: 'navbar11', path: LOGO_LEFT_MENU_RIGHT_DROPDOWN, root: '[data-rn11-root]' },
  { id: 'navbar12', path: LOGO_LEFT_MENU_RIGHT_GROUPED, root: '[data-rn12-root]' },
  { id: 'navbar14', path: FLOATING_LOGO_LEFT_MENU_RIGHT_ACTIONS, root: '[data-rn14-root]' },
];

test.describe('Mobile mega-menu chrome', () => {
  /** @type {{ origin: string, close: () => Promise<void> }} */
  let staticServer;

  test.beforeAll(async () => {
    staticServer = await startStaticServer();
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  for (const variant of MOBILE_NAV_CHROME_CASES) {
    test(`${variant.id} centers its close icon and renders one action separator`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${staticServer.origin}${variant.path}`);

      const toggle = page.locator(`${variant.root} .ren-nav-toggle`);
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');

      const chrome = await page.evaluate((rootSelector) => {
        const root = document.querySelector(rootSelector);
        const button = root?.querySelector('.ren-nav-toggle');
        const firstBar = button?.querySelector('span:nth-child(1)');
        const thirdBar = button?.querySelector('span:nth-child(3)');
        const links = root?.querySelector('.ren-nav-links');
        const actions = root?.querySelector('.ren-nav-actions');
        if (!button || !firstBar || !thirdBar || !links || !actions) return null;

        const buttonRect = button.getBoundingClientRect();
        const firstRect = firstBar.getBoundingClientRect();
        const thirdRect = thirdBar.getBoundingClientRect();
        const linksRect = links.getBoundingClientRect();
        const actionsRect = actions.getBoundingClientRect();
        const linksStyle = getComputedStyle(links);
        const actionsStyle = getComputedStyle(actions);

        const center = (rect) => ({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
        const buttonCenter = center(buttonRect);
        const firstCenter = center(firstRect);
        const thirdCenter = center(thirdRect);
        const iconCenter = {
          x: (firstCenter.x + thirdCenter.x) / 2,
          y: (firstCenter.y + thirdCenter.y) / 2,
        };

        return {
          barCenterDeltaX: Math.abs(firstCenter.x - thirdCenter.x),
          barCenterDeltaY: Math.abs(firstCenter.y - thirdCenter.y),
          iconButtonDeltaX: Math.abs(iconCenter.x - buttonCenter.x),
          iconButtonDeltaY: Math.abs(iconCenter.y - buttonCenter.y),
          linksActionsGap: Math.abs(actionsRect.top - linksRect.bottom),
          separatorCount:
            (parseFloat(linksStyle.borderBottomWidth) > 0 ? 1 : 0) +
            (parseFloat(actionsStyle.borderTopWidth) > 0 ? 1 : 0),
        };
      }, variant.root);

      expect(chrome, `${variant.id} mobile chrome`).toBeTruthy();
      expect(chrome.barCenterDeltaX, `${variant.id} ${JSON.stringify(chrome)}`).toBeLessThanOrEqual(1);
      expect(chrome.barCenterDeltaY, `${variant.id} ${JSON.stringify(chrome)}`).toBeLessThanOrEqual(1);
      expect(chrome.iconButtonDeltaX, `${variant.id} X centered horizontally`).toBeLessThanOrEqual(1);
      expect(chrome.iconButtonDeltaY, `${variant.id} X centered vertically`).toBeLessThanOrEqual(1);
      expect(chrome.linksActionsGap, `${variant.id} links/actions are contiguous`).toBeLessThanOrEqual(1);
      expect(chrome.separatorCount, `${variant.id} renders one separator`).toBe(1);
    });
  }
});

test.describe('Desktop mega-menu pointer corridor', () => {
  /** @type {{ origin: string, close: () => Promise<void> }} */
  let staticServer;

  test.beforeAll(async () => {
    staticServer = await startStaticServer();
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  for (const variant of HOVER_CORRIDOR_CASES) {
    test(`${variant.id} keeps hover content open while the pointer crosses into the panel`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`${staticServer.origin}${variant.path}`);

      const disclosure = page.locator(variant.disclosure);
      const summary = page.locator(variant.summary);
      const destination = page.locator(variant.destination).first();

      await summary.hover();
      await expect(disclosure).toHaveAttribute('open', '');
      await expect(destination).toBeVisible();

      const summaryBox = await summary.boundingBox();
      const destinationBox = await destination.boundingBox();
      expect(summaryBox, 'summary geometry').toBeTruthy();
      expect(destinationBox, 'destination geometry').toBeTruthy();

      await page.mouse.move(
        summaryBox.x + summaryBox.width / 2,
        summaryBox.y + summaryBox.height / 2
      );
      await page.mouse.move(
        destinationBox.x + destinationBox.width / 2,
        destinationBox.y + Math.min(12, destinationBox.height / 2),
        { steps: 24 }
      );

      await expect(disclosure).toHaveAttribute('open', '');
      await expect(destination).toBeVisible();
    });
  }
});

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
      if (!nav || !panel) return null;
      const navRect = nav.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      return {
        navBottom: navRect.bottom,
        panelTop: panelRect.top,
        panelPosition: getComputedStyle(panel).position,
      };
    });
    expect(desktop).toBeTruthy();
    expect(desktop.panelPosition).toBe('absolute');
    expect(desktop.panelTop).toBeGreaterThanOrEqual(desktop.navBottom - 1);
    await expectNoOverflow(page, 'html');

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
      };
    });
    expect(mobile).toBeTruthy();
    expect(['static', 'relative']).toContain(mobile.position);
    // Following primary destinations must start at or below the panel (not covered).
    expect(mobile.pricingTop).toBeGreaterThanOrEqual(mobile.panelBottom - 1);
    expect(mobile.docsTop).toBeGreaterThanOrEqual(mobile.panelBottom - 1);
    await expectNoOverflow(page, 'html');
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

  /**
   * Visual regression guards for the mega-menu chrome defects:
   * double chevron (classless ::after + SVG), classless details card chrome,
   * misaligned Solutions trigger, sparse category rows, stacked feature cards,
   * and mobile centered / nested-card rows.
   */
  test('desktop mega-menu chrome: single chevron, neutral details, aligned trigger', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${staticServer.origin}${MEGA_MENU}`);

    // Shared helpers: one authored chevron affordance; primary peers share centerY.
    await expectSingleVisibleAffordance(
      page,
      ['.rbm-disclosure summary .rbm-chevron'],
      'mega-menu chevron'
    );
    await expectAligned(
      page,
      [
        'a.ren-nav-link[href="#product"]',
        '.rbm-disclosure > summary',
        'a.ren-nav-link[href="#pricing"]',
      ],
      'centerY',
      2
    );

    const detailsChrome = await inspectNativeChrome(page, '.rbm-disclosure');
    expect(detailsChrome.borderTopWidth === '0px', 'details outer border').toBeTruthy();
    expect(detailsChrome.marginTop).toBe('0px');
    expect(detailsChrome.paddingTop).toBe('0px');

    // Block-specific: full box reset on details (helper samples top edges only).
    const detailsBox = await page.evaluate(() => {
      const details = document.querySelector('.rbm-disclosure');
      if (!details) return null;
      const ds = getComputedStyle(details);
      return {
        borderStyle: ds.borderTopStyle,
        marginBottom: ds.marginBottom,
        paddingRight: ds.paddingRight,
        paddingBottom: ds.paddingBottom,
        paddingLeft: ds.paddingLeft,
      };
    });
    expect(detailsBox).toBeTruthy();
    expect(detailsBox.borderStyle === 'none' || detailsChrome.borderTopWidth === '0px', 'details outer border').toBeTruthy();
    expect(detailsBox.marginBottom).toBe('0px');
    expect(detailsBox.paddingRight).toBe('0px');
    expect(detailsBox.paddingBottom).toBe('0px');
    expect(detailsBox.paddingLeft).toBe('0px');

    // Classless summary::after must not render a second chevron.
    const summaryChrome = await inspectNativeChrome(page, '.rbm-disclosure > summary');
    const afterContent = String(summaryChrome.afterContent || 'none').replace(/['"]/g, '');
    const afterNeutralized =
      afterContent === 'none' ||
      afterContent === '' ||
      summaryChrome.afterDisplay === 'none';
    expect(afterNeutralized, 'classless summary::after must be neutralized').toBe(true);

    // Marker must not add a third indicator.
    const markerContent = String(summaryChrome.markerContent || 'none').replace(/['"]/g, '');
    expect(
      markerContent === 'none' || markerContent === '' || summaryChrome.markerDisplay === 'none',
      'summary marker'
    ).toBeTruthy();

    const svgChevrons = await page.locator('.rbm-disclosure summary .rbm-chevron').count();
    expect(svgChevrons).toBe(1);

    await page.locator('.rbm-disclosure > summary').click();
    await expect(page.locator('.rbm-disclosure')).toHaveAttribute('open', '');

    const openChrome = await page.evaluate(() => {
      const summary = document.querySelector('.rbm-disclosure > summary');
      if (!summary) return null;
      const ss = getComputedStyle(summary);
      return {
        marginBottom: ss.marginBottom,
        paddingBottom: ss.paddingBottom,
        borderBottomWidth: ss.borderBottomWidth,
        borderBottomStyle: ss.borderBottomStyle,
      };
    });
    expect(openChrome).toBeTruthy();
    expect(openChrome.marginBottom).toBe('0px');
    // No open-summary divider (classless border-block-end).
    expect(
      openChrome.borderBottomStyle === 'none' || openChrome.borderBottomWidth === '0px',
      'open summary divider'
    ).toBeTruthy();
  });

  test('desktop mega-menu content anatomy: categories, featured rows, featured surface', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${staticServer.origin}${MEGA_MENU}`);
    await page.locator('.rbm-disclosure > summary').click();
    await expect(page.locator('.rbm-panel')).toBeVisible();

    const anatomy = await page.evaluate(() => {
      const dests = Array.from(document.querySelectorAll('.rbm-dest'));
      const destReports = dests.map((dest) => {
        const icon = dest.querySelector('.ren-icon, .rbm-dest-icon');
        const title = dest.querySelector('.rbm-dest-label, .rbm-dest-title');
        const desc = dest.querySelector('.rbm-dest-desc');
        const ir = icon?.getBoundingClientRect();
        const iconStyle = icon ? getComputedStyle(icon) : null;
        const titleStyle = title ? getComputedStyle(title) : null;
        const descStyle = desc ? getComputedStyle(desc) : null;
        const descRect = desc?.getBoundingClientRect();
        return {
          hasIcon: Boolean(icon),
          iconW: ir ? Math.round(ir.width) : 0,
          iconH: ir ? Math.round(ir.height) : 0,
          hasTitle: Boolean(title) && (title.textContent || '').trim().length > 0,
          titleWeight: titleStyle ? parseInt(titleStyle.fontWeight, 10) || 0 : 0,
          hasDesc: Boolean(desc) && (desc.textContent || '').trim().length > 0,
          descVisible:
            Boolean(desc) &&
            descStyle?.display !== 'none' &&
            descStyle?.visibility !== 'hidden' &&
            (descRect?.height || 0) > 0,
        };
      });

      const features = Array.from(document.querySelectorAll('.rbm-feature'));
      const featureReports = features.map((feature) => {
        const media = feature.querySelector('.rbm-feature-media');
        const body = feature.querySelector('.rbm-feature-body');
        const mr = media?.getBoundingClientRect();
        const br = body?.getBoundingClientRect();
        const horizontal =
          Boolean(mr && br) &&
          mr.left < br.left - 8 &&
          Math.abs(mr.top - br.top) < Math.max(mr.height, br.height) * 0.55;
        const ratio = mr && mr.height > 0 ? mr.width / mr.height : 0;
        return {
          horizontal,
          mediaW: mr ? Math.round(mr.width) : 0,
          mediaH: mr ? Math.round(mr.height) : 0,
          ratio: Number(ratio.toFixed(2)),
        };
      });

      const featured = document.querySelector('.rbm-featured');
      const groups = document.querySelector('.rbm-groups');
      const panel = document.querySelector('.rbm-panel');
      const fr = featured?.getBoundingClientRect();
      const gr = groups?.getBoundingClientRect();
      const featuredBg = featured ? getComputedStyle(featured).backgroundColor : '';
      const panelBg = panel ? getComputedStyle(panel).backgroundColor : '';
      const featuredSurface =
        featuredBg &&
        featuredBg !== 'rgba(0, 0, 0, 0)' &&
        featuredBg !== 'transparent' &&
        featuredBg !== panelBg;

      const viewAll = document.querySelector('.rbm-view-all');
      const viewAllChevron = viewAll?.querySelector('.rbm-view-all-chevron, .ren-icon');

      return {
        destCount: dests.length,
        destReports,
        featureCount: features.length,
        featureReports,
        featuredWidth: fr ? Math.round(fr.width) : 0,
        groupsWidth: gr ? Math.round(gr.width) : 0,
        featuredCapped: Boolean(fr && gr && fr.width < gr.width - 8),
        featuredSurface,
        featuredBg,
        panelBg,
        hasViewAllChevron: Boolean(viewAllChevron),
      };
    });

    expect(anatomy.destCount).toBe(8);
    for (const [i, dest] of anatomy.destReports.entries()) {
      expect(dest.hasIcon, `dest ${i} icon`).toBe(true);
      expect(dest.iconW, `dest ${i} icon width`).toBeGreaterThanOrEqual(22);
      expect(dest.iconW, `dest ${i} icon width max`).toBeLessThanOrEqual(26);
      expect(dest.iconH, `dest ${i} icon height`).toBeGreaterThanOrEqual(22);
      expect(dest.iconH, `dest ${i} icon height max`).toBeLessThanOrEqual(26);
      expect(dest.hasTitle, `dest ${i} title`).toBe(true);
      expect(dest.titleWeight, `dest ${i} title weight`).toBeGreaterThanOrEqual(600);
      expect(dest.hasDesc, `dest ${i} desc text`).toBe(true);
      expect(dest.descVisible, `dest ${i} desc visible`).toBe(true);
    }

    expect(anatomy.featureCount).toBe(2);
    for (const [i, feature] of anatomy.featureReports.entries()) {
      expect(feature.horizontal, `feature ${i} horizontal media/text`).toBe(true);
      // 3:2 media ratio (±0.2 tolerance for subpixel rounding).
      expect(feature.ratio, `feature ${i} ratio ${feature.ratio}`).toBeGreaterThanOrEqual(1.3);
      expect(feature.ratio, `feature ${i} ratio ${feature.ratio}`).toBeLessThanOrEqual(1.7);
    }

    expect(anatomy.featuredCapped, `featured ${anatomy.featuredWidth} vs groups ${anatomy.groupsWidth}`).toBe(
      true
    );
    expect(anatomy.featuredSurface, `featuredBg=${anatomy.featuredBg} panelBg=${anatomy.panelBg}`).toBe(true);
    expect(anatomy.hasViewAllChevron).toBe(true);
  });

  test('mobile mega-menu rows: full width, start-aligned, no nested-card details', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${staticServer.origin}${MEGA_MENU}`);
    await page.locator('.ren-nav-toggle').click();
    await page.locator('.rbm-disclosure > summary').click();
    await expect(page.locator('.rbm-panel')).toBeVisible();

    // Shared helpers: width ratio + single chevron + native chrome inspection.
    await expectWidthRatio(page, 'a.ren-nav-link[href="#product"]', '#rbm-primary-links', 0.92, 1.05);
    await expectWidthRatio(page, '.rbm-disclosure > summary', '#rbm-primary-links', 0.92, 1.05);
    await expectSingleVisibleAffordance(
      page,
      ['.rbm-disclosure summary .rbm-chevron'],
      'mobile mega-menu chevron'
    );
    await expectNoOverflow(page, 'html');

    const detailsChrome = await inspectNativeChrome(page, '.rbm-disclosure');
    const summaryChrome = await inspectNativeChrome(page, '.rbm-disclosure > summary');

    const mobile = await page.evaluate(() => {
      const links = document.querySelector('#rbm-primary-links');
      const product = document.querySelector('a.ren-nav-link[href="#product"]');
      const summary = document.querySelector('.rbm-disclosure > summary');
      const details = document.querySelector('.rbm-disclosure');
      if (!links || !product || !summary || !details) return { missing: true };

      const linksRect = links.getBoundingClientRect();
      const productRect = product.getBoundingClientRect();
      const summaryRect = summary.getBoundingClientRect();
      const productStyle = getComputedStyle(product);
      const summaryStyle = getComputedStyle(summary);
      const detailsStyle = getComputedStyle(details);

      const textAlignStart = (style) => {
        const ta = style.textAlign;
        return ta === 'start' || ta === 'left' || ta === 'match-parent' || ta === '';
      };
      const justifyStart = (style) => {
        const j = style.justifyContent;
        return j === 'flex-start' || j === 'start' || j === 'normal' || j === 'left';
      };

      // Nested-card appearance: border + radius + padding combo like classless details.
      const borderW = parseFloat(detailsStyle.borderTopWidth) || 0;
      const radius = parseFloat(detailsStyle.borderTopLeftRadius) || 0;
      const padL = parseFloat(detailsStyle.paddingLeft) || 0;
      const padR = parseFloat(detailsStyle.paddingRight) || 0;
      const nestedCard = borderW > 0 && radius > 0 && padL + padR > 0;

      return {
        missing: false,
        productTextAlign: productStyle.textAlign,
        productJustify: productStyle.justifyContent,
        productAlignSelf: productStyle.alignSelf,
        summaryTextAlign: summaryStyle.textAlign,
        summaryJustify: summaryStyle.justifyContent,
        productStartAligned: textAlignStart(productStyle) && justifyStart(productStyle),
        summaryStartAligned: textAlignStart(summaryStyle) && justifyStart(summaryStyle),
        productLeftOffset: productRect.left - linksRect.left,
        summaryLeftOffset: summaryRect.left - linksRect.left,
        nestedCard,
        detailsBorder: detailsStyle.borderTopWidth,
        detailsPadding: `${detailsStyle.paddingTop} ${detailsStyle.paddingRight} ${detailsStyle.paddingBottom} ${detailsStyle.paddingLeft}`,
        detailsRadius: detailsStyle.borderTopLeftRadius,
      };
    });

    expect(mobile.missing).toBeFalsy();
    expect(mobile.productStartAligned, JSON.stringify(mobile)).toBe(true);
    expect(mobile.summaryStartAligned, JSON.stringify(mobile)).toBe(true);
    expect(Math.abs(mobile.productLeftOffset)).toBeLessThanOrEqual(8);
    expect(Math.abs(mobile.summaryLeftOffset)).toBeLessThanOrEqual(8);
    expect(mobile.nestedCard, `nested card chrome: border=${mobile.detailsBorder} pad=${mobile.detailsPadding}`).toBe(
      false
    );

    // Cross-check helper chrome samples against nested-card rule.
    expect(detailsChrome.borderTopWidth === '0px' || detailsChrome.paddingTop === '0px').toBeTruthy();
    const afterContent = String(summaryChrome.afterContent || 'none').replace(/['"]/g, '');
    expect(
      afterContent === 'none' || afterContent === '' || summaryChrome.afterDisplay === 'none',
      'mobile classless summary::after'
    ).toBeTruthy();
  });
});

/**
 * Navbar 6 — Featured Mega Menu (nav-mega-menu-featured).
 * Phase A RED: implementation file is intentionally absent; these tests must fail
 * specifically for missing anatomy / page, not for broken suite wiring.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoFeaturedBlock(page, origin) {
  const response = await page.goto(`${origin}${MEGA_MENU_FEATURED}`);
  expect(response, 'HTTP response for featured mega block').toBeTruthy();
  // Fail fast when the block file is absent (Phase A RED).
  expect(response.status(), 'featured block must not 404 — implement templates/blocks/nav-mega-menu-featured.html').toBe(200);
  await expect(page.locator('[data-rmf-root]'), 'missing [data-rmf-root] shell').toHaveCount(1, { timeout: 2000 });
}

test.describe('Navbar Mega Menu Featured (navbar6)', () => {
  /** @type {{ origin: string, close: () => Promise<void> }} */
  let staticServer;

  // Keep RED failures fast: absent selectors should not burn the default 30s action timeout.
  test.use({ actionTimeout: 3000, navigationTimeout: 10000 });
  test.describe.configure({ timeout: 20000 });

  test.beforeAll(async () => {
    staticServer = await startStaticServer();
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  test('block page loads with ren-nav shell and featured root', async ({ page }) => {
    await gotoFeaturedBlock(page, staticServer.origin);

    await expect(page.getByRole('heading', { name: /Navbar Mega Menu Featured|Featured Mega Menu/i, level: 1 })).toBeVisible();
    await expect(page.locator('ren-nav')).toHaveCount(1);
    await expect(page.locator('nav.ren-nav')).toHaveCount(1);
    await expect(page.locator('#rmf-primary-links')).toHaveCount(1);
    await expect(page.locator('ul.ren-nav-links')).toHaveCount(1);
  });

  test('exactly one primary links tree serves desktop and mobile', async ({ page }) => {
    await gotoFeaturedBlock(page, staticServer.origin);
    await expect(page.locator('#rmf-primary-links')).toHaveCount(1);
    await expect(page.locator('[data-rmf-root] ul.ren-nav-links')).toHaveCount(1);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('#rmf-primary-links')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.locator('[data-rmf-root] .ren-nav-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rmf-primary-links')).toBeVisible();
    await expect(page.locator('[data-rmf-root] ul.ren-nav-links')).toHaveCount(1);
  });

  test('anatomy: four top-level entries, 3×4 destinations, one feature, one see-all, one chevron', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoFeaturedBlock(page, staticServer.origin);

    // Exact top-level list ownership: four direct children, three peer links + one mega.
    await expect(page.locator('#rmf-primary-links > li')).toHaveCount(4);
    const topLevelLinks = page.locator('#rmf-primary-links > li > a.ren-nav-link');
    const megaSummaries = page.locator('#rmf-primary-links > li > .rmf-disclosure > summary');
    await expect(topLevelLinks).toHaveCount(3);
    await expect(megaSummaries).toHaveCount(1);

    await expect(page.locator('[data-rmf-root] .ren-nav-actions a, [data-rmf-root] .ren-nav-actions .ren-btn')).toHaveCount(2);
    await expect(page.locator('[data-rmf-root] .ren-nav-toggle')).toHaveCount(1);

    await page.locator('.rmf-disclosure > summary').click();
    await expect(page.locator('.rmf-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rmf-panel')).toBeVisible();

    await expect(page.locator('.rmf-group')).toHaveCount(3);
    await expect(page.locator('.rmf-dest')).toHaveCount(12);
    await expect(page.locator('.rmf-dest-desc')).toHaveCount(12);
    await expect(page.locator('.rmf-feature')).toHaveCount(1);
    await expect(page.locator('.rmf-feature-media')).toHaveCount(1);
    await expect(page.locator('.rmf-view-all')).toHaveCount(1);

    await expectSingleVisibleAffordance(
      page,
      ['.rmf-disclosure summary .rmf-chevron'],
      'featured mega-menu chevron'
    );
  });

  test('featured promo is a single anchor without nested button controls', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoFeaturedBlock(page, staticServer.origin);
    await page.locator('.rmf-disclosure > summary').click();

    const feature = page.locator('.rmf-feature');
    await expect(feature).toHaveCount(1);
    await expect(feature).toHaveAttribute('href', /.+/);
    await expect(feature.locator('button, [role="button"]')).toHaveCount(0);

    const tagName = await feature.evaluate((el) => el.tagName);
    expect(tagName).toBe('A');
  });

  test('summary opens by click, keyboard, and desktop pointer hover; Escape restores focus', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoFeaturedBlock(page, staticServer.origin);

    const disclosure = page.locator('.rmf-disclosure');
    const summary = disclosure.locator('summary');
    const panel = page.locator('.rmf-panel');

    await expect(disclosure).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();
    await expect(page.locator('.rmf-dest').first()).toBeVisible();

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
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');

    // Relume desktop pointer hover-open (additive to click/keyboard).
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();

    // Stable close region: moving summary → panel must not close.
    await panel.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('.rmf-dest').first()).toBeVisible();

    // Leave the disclosure+panel hit region → close.
    await page.locator('[data-rmf-root] .ren-nav-brand').hover();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('outside click and destination activation close the disclosure', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoFeaturedBlock(page, staticServer.origin);

    const disclosure = page.locator('.rmf-disclosure');
    const summary = disclosure.locator('summary');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.locator('[data-rmf-root] .ren-nav-brand').click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('.rmf-dest').first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('mobile toggle exposes the same tree and closes mega on menu close', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoFeaturedBlock(page, staticServer.origin);

    const toggle = page.locator('[data-rmf-root] .ren-nav-toggle');
    const disclosure = page.locator('.rmf-disclosure');
    const summary = disclosure.locator('summary');

    await expect(toggle).toHaveAttribute('aria-controls', 'rmf-primary-links');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rmf-primary-links')).toBeVisible();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('.rmf-dest').first()).toBeVisible();
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
    await gotoFeaturedBlock(page, staticServer.origin);

    await expect(page.locator('[data-rmf-root] .ren-nav-toggle')).toBeHidden();
    await expect(page.locator('#rmf-primary-links')).toBeVisible();
    await expect(page.locator('[data-rmf-root] .ren-nav-actions a, [data-rmf-root] .ren-nav-actions .ren-btn').first()).toBeVisible();

    await page.locator('.rmf-disclosure > summary').click();
    await expect(page.locator('.rmf-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rmf-dest')).toHaveCount(12);
    await expect(page.locator('.rmf-feature')).toHaveCount(1);
    await expect(page.locator('.rmf-view-all')).toBeVisible();

    await context.close();
  });

  test('viewport geometry: desktop panel under bar, mobile in-flow, no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoFeaturedBlock(page, staticServer.origin);
    await page.locator('.rmf-disclosure > summary').click();
    await expect(page.locator('.rmf-panel')).toBeVisible();

    const desktop = await page.evaluate(() => {
      const nav = document.querySelector('[data-rmf-root] .ren-nav');
      const panel = document.querySelector('.rmf-panel');
      if (!nav || !panel) return null;
      const navRect = nav.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      return {
        navBottom: navRect.bottom,
        panelTop: panelRect.top,
        panelPosition: getComputedStyle(panel).position,
      };
    });
    expect(desktop).toBeTruthy();
    expect(desktop.panelPosition).toBe('absolute');
    expect(desktop.panelTop).toBeGreaterThanOrEqual(desktop.navBottom - 1);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoFeaturedBlock(page, staticServer.origin);
    await page.locator('[data-rmf-root] .ren-nav-toggle').click();
    await page.locator('.rmf-disclosure > summary').click();
    await expect(page.locator('.rmf-panel')).toBeVisible();

    const mobile = await page.evaluate(() => {
      const panel = document.querySelector('.rmf-panel');
      if (!panel) return null;
      return { position: getComputedStyle(panel).position };
    });
    expect(mobile).toBeTruthy();
    expect(['static', 'relative']).toContain(mobile.position);
    await expectNoOverflow(page, 'html');
  });

  test('tablet mid-width: stacked mega composition with readable destinations', async ({ page }) => {
    // 834px is ≥48rem (desktop shell) but <64rem (mid-width mega content band).
    await page.setViewportSize({ width: 834, height: 1112 });
    await gotoFeaturedBlock(page, staticServer.origin);

    const toggle = page.locator('[data-rmf-root] .ren-nav-toggle');
    await expect(toggle).toBeHidden();

    await page.locator('.rmf-disclosure > summary').click();
    await expect(page.locator('.rmf-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rmf-panel')).toBeVisible();
    await expect(page.locator('.rmf-group')).toHaveCount(3);
    await expect(page.locator('.rmf-dest')).toHaveCount(12);
    await expect(page.locator('.rmf-dest-desc')).toHaveCount(12);
    await expect(page.locator('.rmf-feature')).toHaveCount(1);

    const tablet = await page.evaluate(() => {
      const groups = document.querySelector('.rmf-groups');
      const featured = document.querySelector('.rmf-featured');
      const panel = document.querySelector('.rmf-panel');
      const dest = document.querySelector('.rmf-dest');
      const destLabel = document.querySelector('.rmf-dest-label');
      const destDesc = document.querySelector('.rmf-dest-desc');
      const featureInner = document.querySelector('.rmf-feature-inner');
      const featureMedia = document.querySelector('.rmf-feature-media');
      const featureBody = document.querySelector('.rmf-feature-body');
      if (!groups || !featured || !panel || !dest || !destLabel || !destDesc) return null;

      const gr = groups.getBoundingClientRect();
      const fr = featured.getBoundingClientRect();
      const pr = panel.getBoundingClientRect();
      const dr = dest.getBoundingClientRect();
      const labelR = destLabel.getBoundingClientRect();
      const descR = destDesc.getBoundingClientRect();
      const mediaR = featureMedia?.getBoundingClientRect();
      const bodyR = featureBody?.getBoundingClientRect();
      const innerStyle = featureInner ? getComputedStyle(featureInner) : null;

      // Readable width: destination text column should not be a narrow crumb.
      // Prefer measured copy width; fall back to whole dest.
      const readableWidth = Math.max(labelR.width, descR.width, dr.width - 48);

      return {
        groupsTop: gr.top,
        groupsBottom: gr.bottom,
        groupsWidth: Math.round(gr.width),
        featuredTop: fr.top,
        featuredWidth: Math.round(fr.width),
        panelWidth: Math.round(pr.width),
        destWidth: Math.round(dr.width),
        readableWidth: Math.round(readableWidth),
        labelHeight: Math.round(labelR.height),
        descHeight: Math.round(descR.height),
        stacked: fr.top >= gr.bottom - 2,
        featuredFullBand: fr.width >= gr.width * 0.9,
        mediaLeftOfBody: Boolean(
          mediaR && bodyR && mediaR.left < bodyR.left - 8 && Math.abs(mediaR.top - bodyR.top) < 48
        ),
        featureDisplay: innerStyle?.display || '',
        featureColumns: innerStyle?.gridTemplateColumns || '',
      };
    });

    expect(tablet, 'tablet composition metrics').toBeTruthy();
    expect(tablet.stacked, `featured must sit below groups (ft=${tablet.featuredTop} gb=${tablet.groupsBottom})`).toBe(
      true
    );
    expect(
      tablet.featuredFullBand,
      `featured ${tablet.featuredWidth} should span groups band ${tablet.groupsWidth}`
    ).toBe(true);
    // Regression guard: 3-up columns across full tablet panel, not 3+side squeeze.
    expect(tablet.readableWidth, `destination readable width ${tablet.readableWidth}`).toBeGreaterThanOrEqual(160);
    expect(tablet.destWidth, `destination hit width ${tablet.destWidth}`).toBeGreaterThanOrEqual(180);
    // Labels/descriptions should not stack into a tall multi-line crumb column.
    expect(tablet.labelHeight, `label height ${tablet.labelHeight}`).toBeLessThanOrEqual(48);
    expect(tablet.descHeight, `desc height ${tablet.descHeight}`).toBeLessThanOrEqual(72);
    expect(tablet.mediaLeftOfBody, 'prefer horizontal featured media|copy relationship').toBe(true);
    await expectNoOverflow(page, 'html');

    // ≥64rem restores side-by-side groups + constrained right feature panel.
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('.rmf-panel')).toBeVisible();
    const wide = await page.evaluate(() => {
      const groups = document.querySelector('.rmf-groups');
      const featured = document.querySelector('.rmf-featured');
      if (!groups || !featured) return null;
      const gr = groups.getBoundingClientRect();
      const fr = featured.getBoundingClientRect();
      return {
        sideBySide: fr.left >= gr.right - 4 && Math.abs(fr.top - gr.top) < 48,
        featuredCapped: fr.width < gr.width - 8 && fr.width <= 320,
        featuredWidth: Math.round(fr.width),
        groupsWidth: Math.round(gr.width),
      };
    });
    expect(wide).toBeTruthy();
    expect(wide.sideBySide, `wide should be side-by-side (fw=${wide.featuredWidth} gw=${wide.groupsWidth})`).toBe(
      true
    );
    expect(wide.featuredCapped, `featured ${wide.featuredWidth} vs groups ${wide.groupsWidth}`).toBe(true);
  });

  test('ren-icon wrappers size SVGs without width/height attributes', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoFeaturedBlock(page, staticServer.origin);
    await page.locator('.rmf-disclosure > summary').click();
    await expect(page.locator('.rmf-panel')).toBeVisible();

    const iconAudit = await page.evaluate(() => {
      const root = document.querySelector('[data-rmf-root]');
      if (!root) return { error: 'missing-root' };

      const wrappers = Array.from(root.querySelectorAll('.ren-icon'));
      const results = [];
      for (const wrap of wrappers) {
        const svg = wrap.querySelector('svg');
        if (!svg) {
          results.push({ error: 'missing-svg', className: wrap.className });
          continue;
        }
        const wrapStyle = getComputedStyle(wrap);
        const svgStyle = getComputedStyle(svg);
        const wrapRect = wrap.getBoundingClientRect();
        const svgRect = svg.getBoundingClientRect();
        const isSm = wrap.classList.contains('ren-icon-sm');
        const isLg = wrap.classList.contains('ren-icon-lg');
        results.push({
          className: wrap.className,
          hasWidthAttr: svg.hasAttribute('width'),
          hasHeightAttr: svg.hasAttribute('height'),
          viewBox: svg.getAttribute('viewBox'),
          focusable: svg.getAttribute('focusable'),
          ariaHidden: svg.getAttribute('aria-hidden'),
          isSm,
          isLg,
          // Prefer computed style (stable) over transformed bounding boxes.
          wrapW: Math.round(parseFloat(wrapStyle.width)),
          wrapH: Math.round(parseFloat(wrapStyle.height)),
          svgW: Math.round(parseFloat(svgStyle.width)),
          svgH: Math.round(parseFloat(svgStyle.height)),
          rectW: Math.round(wrapRect.width),
          rectH: Math.round(wrapRect.height),
          svgRectW: Math.round(svgRect.width),
          svgRectH: Math.round(svgRect.height),
        });
      }
      return { count: results.length, results };
    });

    expect(iconAudit.error, JSON.stringify(iconAudit)).toBeUndefined();
    // 12 destination icons (lg) + 1 chevron (sm) + 1 view-all chevron (sm)
    expect(iconAudit.count, 'expected ren-icon wrappers in featured mega').toBe(14);

    for (const item of iconAudit.results) {
      expect(item.hasWidthAttr, `${item.className} must not set svg width`).toBe(false);
      expect(item.hasHeightAttr, `${item.className} must not set svg height`).toBe(false);
      expect(item.viewBox, item.className).toBeTruthy();
      expect(item.focusable, item.className).toBe('false');
      expect(item.ariaHidden, item.className).toBe('true');
      // Computed size comes from .ren-icon-* (sm=16px / 1rem, lg=24px / 1.5rem).
      if (item.isSm) {
        expect(item.wrapW, `${item.className} wrapW=${item.wrapW}`).toBe(16);
        expect(item.wrapH, `${item.className} wrapH=${item.wrapH}`).toBe(16);
      }
      if (item.isLg) {
        expect(item.wrapW, `${item.className} wrapW=${item.wrapW}`).toBe(24);
        expect(item.wrapH, `${item.className} wrapH=${item.wrapH}`).toBe(24);
      }
      expect(item.svgW, `${item.className} svg fills wrap width`).toBe(item.wrapW);
      expect(item.svgH, `${item.className} svg fills wrap height`).toBe(item.wrapH);
      // Bounding rect can expand slightly under rotate transforms; keep a loose visual floor.
      expect(item.rectW, `${item.className} visual wrapW`).toBeGreaterThanOrEqual(item.wrapW - 1);
      expect(item.rectH, `${item.className} visual wrapH`).toBeGreaterThanOrEqual(item.wrapH - 1);
      expect(item.svgRectW, `${item.className} visual svgW`).toBeGreaterThanOrEqual(item.wrapW - 1);
      expect(item.svgRectH, `${item.className} visual svgH`).toBeGreaterThanOrEqual(item.wrapH - 1);
    }

    const smCount = iconAudit.results.filter((r) => r.isSm).length;
    const lgCount = iconAudit.results.filter((r) => r.isLg).length;
    expect(smCount, 'sm icons (chevron + view-all)').toBe(2);
    expect(lgCount, 'lg destination icons').toBe(12);
  });

  test('desktop chrome: single chevron, neutral details, aligned trigger, 16:9 feature', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoFeaturedBlock(page, staticServer.origin);

    await expectSingleVisibleAffordance(
      page,
      ['.rmf-disclosure summary .rmf-chevron'],
      'featured mega-menu chevron'
    );

    const peerLinks = page.locator('#rmf-primary-links > li > a.ren-nav-link');
    await expect(peerLinks.first()).toBeVisible();
    await expect(page.locator('.rmf-disclosure > summary')).toBeVisible();

    // Align mega summary with first and last peer top-level links.
    const firstHref = await peerLinks.nth(0).getAttribute('href');
    const lastHref = await peerLinks.nth(2).getAttribute('href');
    expect(firstHref).toBeTruthy();
    expect(lastHref).toBeTruthy();
    await expectAligned(
      page,
      [
        `a.ren-nav-link[href="${firstHref}"]`,
        '.rmf-disclosure > summary',
        `a.ren-nav-link[href="${lastHref}"]`,
      ],
      'centerY',
      2
    );

    const detailsChrome = await inspectNativeChrome(page, '.rmf-disclosure');
    expect(detailsChrome.borderTopWidth === '0px', 'details outer border').toBeTruthy();
    expect(detailsChrome.marginTop).toBe('0px');
    expect(detailsChrome.paddingTop).toBe('0px');

    const summaryChrome = await inspectNativeChrome(page, '.rmf-disclosure > summary');
    const afterContent = String(summaryChrome.afterContent || 'none').replace(/['"]/g, '');
    const afterNeutralized =
      afterContent === 'none' ||
      afterContent === '' ||
      summaryChrome.afterDisplay === 'none';
    expect(afterNeutralized, 'classless summary::after must be neutralized').toBe(true);

    await page.locator('.rmf-disclosure > summary').click();
    await expect(page.locator('.rmf-panel')).toBeVisible();

    const featureRatio = await page.evaluate(() => {
      const media = document.querySelector('.rmf-feature-media');
      if (!media) return null;
      const rect = media.getBoundingClientRect();
      if (rect.height <= 0) return null;
      return Number((rect.width / rect.height).toFixed(2));
    });
    expect(featureRatio, '16:9 featured media ratio').toBeTruthy();
    // 16:9 ≈ 1.778; allow ±0.2 for subpixel layout.
    expect(featureRatio).toBeGreaterThanOrEqual(1.58);
    expect(featureRatio).toBeLessThanOrEqual(1.98);
  });

  test('mobile rows: full width, start-aligned, no nested-card details', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoFeaturedBlock(page, staticServer.origin);
    await page.locator('[data-rmf-root] .ren-nav-toggle').click();
    await page.locator('.rmf-disclosure > summary').click();
    await expect(page.locator('.rmf-panel')).toBeVisible();

    const firstPeer = page.locator('#rmf-primary-links > li > a.ren-nav-link').first();
    await expect(firstPeer).toBeVisible();
    const peerHref = await firstPeer.getAttribute('href');
    expect(peerHref).toBeTruthy();

    await expectWidthRatio(page, `a.ren-nav-link[href="${peerHref}"]`, '#rmf-primary-links', 0.92, 1.05);
    await expectWidthRatio(page, '.rmf-disclosure > summary', '#rmf-primary-links', 0.92, 1.05);
    await expectSingleVisibleAffordance(
      page,
      ['.rmf-disclosure summary .rmf-chevron'],
      'mobile featured mega-menu chevron'
    );
    await expectNoOverflow(page, 'html');

    const detailsChrome = await inspectNativeChrome(page, '.rmf-disclosure');
    const summaryChrome = await inspectNativeChrome(page, '.rmf-disclosure > summary');
    expect(detailsChrome.borderTopWidth === '0px' || detailsChrome.paddingTop === '0px').toBeTruthy();
    const afterContent = String(summaryChrome.afterContent || 'none').replace(/['"]/g, '');
    expect(
      afterContent === 'none' || afterContent === '' || summaryChrome.afterDisplay === 'none',
      'mobile classless summary::after'
    ).toBeTruthy();
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await gotoFeaturedBlock(page, staticServer.origin);

    await page.locator('[data-rmf-root] .ren-nav-toggle').click();
    await page.locator('.rmf-disclosure > summary').click();

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-rmf-root]');
      if (!root) return [{ name: 'missing-root', width: 0, height: 0 }];

      const candidates = root.querySelectorAll(
        'a[href], button, summary, .ren-nav-toggle, .rmf-dest, .rmf-feature, .rmf-view-all'
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
    await gotoFeaturedBlock(page, staticServer.origin);
    await page.locator('.rmf-disclosure > summary').click();

    const motion = await page.evaluate(() => {
      const selectors = ['.rmf-panel', '.rmf-chevron', '.rmf-dest', '.rmf-feature'];
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

  test('featured mega menu preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await gotoFeaturedBlock(page, staticServer.origin);
    await injectAxe(page);
    await checkA11y(page, '[data-rmf-root]', {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    });
  });

  test('light and dark surfaces resolve through RenDS tokens', async ({ page }) => {
    await gotoFeaturedBlock(page, staticServer.origin);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }, theme);

      const colors = await page.evaluate(() => {
        const surface = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim();
        const text = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
        const nav = document.querySelector('[data-rmf-root] .ren-nav');
        return {
          surface,
          text,
          navBg: nav ? getComputedStyle(nav).backgroundColor : '',
        };
      });

      expect(colors.surface, theme).toBeTruthy();
      expect(colors.text, theme).toBeTruthy();
      expect(colors.navBg, theme).not.toBe('');
      expect(colors.navBg, theme).not.toMatch(/rgba\(0,\s*0,\s*0,\s*0\)/);
    }
  });
});

/**
 * Navbar 7 — Icons Mega Menu (nav-mega-menu-icons).
 * Phase A RED: implementation file is intentionally absent; these tests must fail
 * specifically for missing anatomy / page, not for broken suite wiring.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoIconsBlock(page, origin) {
  const response = await page.goto(`${origin}${MEGA_MENU_ICONS}`);
  expect(response, 'HTTP response for icons mega block').toBeTruthy();
  // Fail fast when the block file is absent (Phase A RED).
  expect(response.status(), 'icons block must not 404 — implement templates/blocks/nav-mega-menu-icons.html').toBe(200);
  await expect(page.locator('[data-rmi-root]'), 'missing [data-rmi-root] shell').toHaveCount(1, { timeout: 2000 });
}

test.describe('Navbar Mega Menu Icons (navbar7)', () => {
  /** @type {{ origin: string, close: () => Promise<void> }} */
  let staticServer;

  // Keep RED failures fast: absent selectors should not burn the default 30s action timeout.
  test.use({ actionTimeout: 3000, navigationTimeout: 10000 });
  test.describe.configure({ timeout: 20000 });

  test.beforeAll(async () => {
    staticServer = await startStaticServer();
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  test('block page loads with ren-nav shell and icons root', async ({ page }) => {
    await gotoIconsBlock(page, staticServer.origin);

    await expect(page.getByRole('heading', { name: /Navbar Mega Menu Icons|Icons Mega Menu/i, level: 1 })).toBeVisible();
    await expect(page.locator('ren-nav')).toHaveCount(1);
    await expect(page.locator('nav.ren-nav')).toHaveCount(1);
    await expect(page.locator('#rmi-primary-links')).toHaveCount(1);
    await expect(page.locator('ul.ren-nav-links')).toHaveCount(1);
  });

  test('exactly one primary links tree serves desktop and mobile', async ({ page }) => {
    await gotoIconsBlock(page, staticServer.origin);
    await expect(page.locator('#rmi-primary-links')).toHaveCount(1);
    await expect(page.locator('[data-rmi-root] ul.ren-nav-links')).toHaveCount(1);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('#rmi-primary-links')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.locator('[data-rmi-root] .ren-nav-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rmi-primary-links')).toBeVisible();
    await expect(page.locator('[data-rmi-root] ul.ren-nav-links')).toHaveCount(1);
  });

  test('anatomy: four top-level entries, 4×4 destinations, footer, one chevron', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoIconsBlock(page, staticServer.origin);

    // Exact top-level list ownership: four direct children, three peer links + one mega.
    await expect(page.locator('#rmi-primary-links > li')).toHaveCount(4);
    const topLevelLinks = page.locator('#rmi-primary-links > li > a.ren-nav-link');
    const megaSummaries = page.locator('#rmi-primary-links > li > .rmi-disclosure > summary');
    await expect(topLevelLinks).toHaveCount(3);
    await expect(megaSummaries).toHaveCount(1);

    await expect(page.locator('[data-rmi-root] .ren-nav-actions a, [data-rmi-root] .ren-nav-actions .ren-btn')).toHaveCount(2);
    await expect(page.locator('[data-rmi-root] .ren-nav-toggle')).toHaveCount(1);

    await page.locator('.rmi-disclosure > summary').click();
    await expect(page.locator('.rmi-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rmi-panel')).toBeVisible();

    await expect(page.locator('.rmi-group')).toHaveCount(4);
    await expect(page.locator('.rmi-dest')).toHaveCount(16);
    await expect(page.locator('.rmi-dest-desc')).toHaveCount(16);
    await expect(page.locator('.rmi-dest-icon')).toHaveCount(16);
    await expect(page.locator('.rmi-footer')).toHaveCount(1);
    await expect(page.locator('.rmi-footer-prompt')).toHaveCount(1);
    await expect(page.locator('.rmi-footer-link')).toHaveCount(1);
    await expect(page.locator('.rmi-footer-action')).toHaveCount(2);
    // No featured/raster media region (Navbar 5/6 anatomy must not leak in).
    await expect(page.locator('.rmi-feature, .rmi-featured, .rmf-feature, .rbm-feature')).toHaveCount(0);

    await expectSingleVisibleAffordance(
      page,
      ['.rmi-disclosure summary .rmi-chevron'],
      'icons mega-menu chevron'
    );
  });

  test('summary opens by click, keyboard, and desktop pointer hover; Escape restores focus', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoIconsBlock(page, staticServer.origin);

    const disclosure = page.locator('.rmi-disclosure');
    const summary = disclosure.locator('summary');
    const panel = page.locator('.rmi-panel');

    await expect(disclosure).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();
    await expect(page.locator('.rmi-dest').first()).toBeVisible();

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
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');

    // Relume desktop pointer hover-open (additive to click/keyboard).
    // Escape suppresses hover re-open until the pointer exits the corridor.
    await page.locator('[data-rmi-root] .ren-nav-brand').hover();
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();

    // Stable close region: moving summary → panel must not close.
    await panel.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('.rmi-dest').first()).toBeVisible();

    // First pointer click pins hover-open; pinned state survives leaving the hit region.
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('[data-rmi-root] .ren-nav-brand').hover();
    await expect(disclosure).toHaveAttribute('open', '');

    // Second pointer click closes; fresh hover after leaving can re-open.
    await summary.hover();
    await summary.click();
    await expect(disclosure).not.toHaveAttribute('open', '');
    await page.locator('[data-rmi-root] .ren-nav-brand').hover();
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('[data-rmi-root] .ren-nav-brand').hover();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('outside click and destination activation close the disclosure', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoIconsBlock(page, staticServer.origin);

    const disclosure = page.locator('.rmi-disclosure');
    const summary = disclosure.locator('summary');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.locator('[data-rmi-root] .ren-nav-brand').click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('.rmi-dest').first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('mobile toggle exposes the same tree and closes mega on menu close', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoIconsBlock(page, staticServer.origin);

    const toggle = page.locator('[data-rmi-root] .ren-nav-toggle');
    const disclosure = page.locator('.rmi-disclosure');
    const summary = disclosure.locator('summary');

    await expect(toggle).toHaveAttribute('aria-controls', 'rmi-primary-links');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rmi-primary-links')).toBeVisible();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('.rmi-dest').first()).toBeVisible();
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
    await gotoIconsBlock(page, staticServer.origin);

    await expect(page.locator('[data-rmi-root] .ren-nav-toggle')).toBeHidden();
    await expect(page.locator('#rmi-primary-links')).toBeVisible();
    await expect(page.locator('[data-rmi-root] .ren-nav-actions a, [data-rmi-root] .ren-nav-actions .ren-btn').first()).toBeVisible();

    await page.locator('.rmi-disclosure > summary').click();
    await expect(page.locator('.rmi-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rmi-dest')).toHaveCount(16);
    await expect(page.locator('.rmi-footer')).toHaveCount(1);
    await expect(page.locator('.rmi-footer-link')).toBeVisible();
    await expect(page.locator('.rmi-footer-action')).toHaveCount(2);

    await context.close();
  });

  test('viewport geometry: desktop panel under bar, mobile in-flow, no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoIconsBlock(page, staticServer.origin);
    await page.locator('.rmi-disclosure > summary').click();
    await expect(page.locator('.rmi-panel')).toBeVisible();

    const desktop = await page.evaluate(() => {
      const nav = document.querySelector('[data-rmi-root] .ren-nav');
      const panel = document.querySelector('.rmi-panel');
      if (!nav || !panel) return null;
      const navRect = nav.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      return {
        navBottom: navRect.bottom,
        panelTop: panelRect.top,
        panelPosition: getComputedStyle(panel).position,
      };
    });
    expect(desktop).toBeTruthy();
    expect(desktop.panelPosition).toBe('absolute');
    expect(desktop.panelTop).toBeGreaterThanOrEqual(desktop.navBottom - 1);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoIconsBlock(page, staticServer.origin);
    await page.locator('[data-rmi-root] .ren-nav-toggle').click();
    await page.locator('.rmi-disclosure > summary').click();
    await expect(page.locator('.rmi-panel')).toBeVisible();

    const mobile = await page.evaluate(() => {
      const panel = document.querySelector('.rmi-panel');
      if (!panel) return null;
      return { position: getComputedStyle(panel).position };
    });
    expect(mobile).toBeTruthy();
    expect(['static', 'relative']).toContain(mobile.position);
    await expectNoOverflow(page, 'html');
  });

  test('tablet mid-width: two-column groups, visible descriptions, horizontal footer', async ({ page }) => {
    // 834px is ≥48rem (desktop shell) but <64rem (mid-width mega content band).
    await page.setViewportSize({ width: 834, height: 1112 });
    await gotoIconsBlock(page, staticServer.origin);

    const toggle = page.locator('[data-rmi-root] .ren-nav-toggle');
    await expect(toggle).toBeHidden();

    await page.locator('.rmi-disclosure > summary').click();
    await expect(page.locator('.rmi-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rmi-panel')).toBeVisible();
    await expect(page.locator('.rmi-group')).toHaveCount(4);
    await expect(page.locator('.rmi-dest')).toHaveCount(16);
    await expect(page.locator('.rmi-dest-desc')).toHaveCount(16);
    await expect(page.locator('.rmi-footer')).toHaveCount(1);
    await expect(page.locator('.rmi-footer-action')).toHaveCount(2);

    const tablet = await page.evaluate(() => {
      const groups = document.querySelector('.rmi-groups');
      const groupEls = Array.from(document.querySelectorAll('.rmi-group'));
      const dest = document.querySelector('.rmi-dest');
      const destLabel = document.querySelector('.rmi-dest-label');
      const destDesc = document.querySelector('.rmi-dest-desc');
      const footer = document.querySelector('.rmi-footer');
      const footerActions = Array.from(document.querySelectorAll('.rmi-footer-action'));
      if (!groups || groupEls.length < 2 || !dest || !destLabel || !destDesc || !footer) return null;

      const gr = groups.getBoundingClientRect();
      const g0 = groupEls[0].getBoundingClientRect();
      const g1 = groupEls[1].getBoundingClientRect();
      const dr = dest.getBoundingClientRect();
      const labelR = destLabel.getBoundingClientRect();
      const descR = destDesc.getBoundingClientRect();
      const descStyle = getComputedStyle(destDesc);
      const descVisible =
        descStyle.display !== 'none' &&
        descStyle.visibility !== 'hidden' &&
        parseFloat(descStyle.opacity || '1') > 0 &&
        descR.height > 0;

      // Two-column intent: first two groups sit side-by-side (not a single stack).
      const twoUp = Math.abs(g0.top - g1.top) < 48 && g1.left >= g0.right - 4;

      let footerActionsHorizontal = false;
      if (footerActions.length >= 2) {
        const a0 = footerActions[0].getBoundingClientRect();
        const a1 = footerActions[1].getBoundingClientRect();
        footerActionsHorizontal = Math.abs(a0.top - a1.top) < 24 && a1.left >= a0.right - 4;
      }

      const readableWidth = Math.max(labelR.width, descR.width, dr.width - 48);

      return {
        groupsWidth: Math.round(gr.width),
        destWidth: Math.round(dr.width),
        readableWidth: Math.round(readableWidth),
        labelHeight: Math.round(labelR.height),
        descHeight: Math.round(descR.height),
        descVisible,
        twoUp,
        footerActionsHorizontal,
      };
    });

    expect(tablet, 'tablet composition metrics').toBeTruthy();
    expect(tablet.twoUp, 'tablet groups should form a 2-column band').toBe(true);
    expect(tablet.descVisible, 'descriptions visible at tablet mid-width').toBe(true);
    expect(tablet.footerActionsHorizontal, 'footer actions horizontal at tablet').toBe(true);
    expect(tablet.readableWidth, `destination readable width ${tablet.readableWidth}`).toBeGreaterThanOrEqual(140);
    expect(tablet.destWidth, `destination hit width ${tablet.destWidth}`).toBeGreaterThanOrEqual(160);
    expect(tablet.labelHeight, `label height ${tablet.labelHeight}`).toBeLessThanOrEqual(48);
    expect(tablet.descHeight, `desc height ${tablet.descHeight}`).toBeLessThanOrEqual(72);
    await expectNoOverflow(page, 'html');

    // ≥64rem restores four-column destination groups.
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('.rmi-panel')).toBeVisible();
    const wide = await page.evaluate(() => {
      const groupEls = Array.from(document.querySelectorAll('.rmi-group'));
      if (groupEls.length < 4) return null;
      const rects = groupEls.map((el) => el.getBoundingClientRect());
      // Four-up: all four groups share roughly the same top edge and span the row.
      const topsAligned = rects.every((r) => Math.abs(r.top - rects[0].top) < 48);
      const lefts = rects.map((r) => r.left).sort((a, b) => a - b);
      const progressive = lefts.every((left, i) => i === 0 || left >= lefts[i - 1] + 8);
      return {
        topsAligned,
        progressive,
        count: groupEls.length,
      };
    });
    expect(wide).toBeTruthy();
    expect(wide.count).toBe(4);
    expect(wide.topsAligned, 'wide desktop groups should share a row').toBe(true);
    expect(wide.progressive, 'wide desktop groups should advance left→right').toBe(true);
  });

  test('ren-icon wrappers size SVGs without width/height attributes; dest icons square', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoIconsBlock(page, staticServer.origin);
    await page.locator('.rmi-disclosure > summary').click();
    await expect(page.locator('.rmi-panel')).toBeVisible();

    const iconAudit = await page.evaluate(() => {
      const root = document.querySelector('[data-rmi-root]');
      if (!root) return { error: 'missing-root' };

      const destIcons = Array.from(root.querySelectorAll('.rmi-dest-icon'));
      const destSquares = destIcons.map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          w: Math.round(rect.width),
          h: Math.round(rect.height),
          square: Math.abs(rect.width - rect.height) <= 2,
        };
      });

      const wrappers = Array.from(root.querySelectorAll('.ren-icon'));
      const results = [];
      for (const wrap of wrappers) {
        const svg = wrap.querySelector('svg');
        if (!svg) {
          results.push({ error: 'missing-svg', className: wrap.className });
          continue;
        }
        const wrapStyle = getComputedStyle(wrap);
        results.push({
          className: wrap.className,
          hasWidthAttr: svg.hasAttribute('width'),
          hasHeightAttr: svg.hasAttribute('height'),
          viewBox: svg.getAttribute('viewBox'),
          focusable: svg.getAttribute('focusable'),
          ariaHidden: svg.getAttribute('aria-hidden'),
          isSm: wrap.classList.contains('ren-icon-sm'),
          isLg: wrap.classList.contains('ren-icon-lg'),
          wrapW: Math.round(parseFloat(wrapStyle.width)),
          wrapH: Math.round(parseFloat(wrapStyle.height)),
        });
      }
      return { count: results.length, results, destSquares, destIconCount: destIcons.length };
    });

    expect(iconAudit.error, JSON.stringify(iconAudit)).toBeUndefined();
    expect(iconAudit.destIconCount, '16 destination icon containers').toBe(16);
    for (const box of iconAudit.destSquares) {
      expect(box.square, `dest icon ${box.w}x${box.h}`).toBe(true);
      expect(box.w, 'dest icon size floor').toBeGreaterThanOrEqual(16);
    }

    // At least 16 destination icons + 1 chevron; footer actions may add more ren-icon wrappers.
    expect(iconAudit.count, 'expected ren-icon wrappers in icons mega').toBeGreaterThanOrEqual(17);

    for (const item of iconAudit.results) {
      expect(item.hasWidthAttr, `${item.className} must not set svg width`).toBe(false);
      expect(item.hasHeightAttr, `${item.className} must not set svg height`).toBe(false);
      expect(item.viewBox, item.className).toBeTruthy();
      expect(item.focusable, item.className).toBe('false');
      expect(item.ariaHidden, item.className).toBe('true');
    }
  });

  test('desktop chrome: single chevron, neutral details, aligned trigger', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoIconsBlock(page, staticServer.origin);

    await expectSingleVisibleAffordance(
      page,
      ['.rmi-disclosure summary .rmi-chevron'],
      'icons mega-menu chevron'
    );

    const peerLinks = page.locator('#rmi-primary-links > li > a.ren-nav-link');
    await expect(peerLinks.first()).toBeVisible();
    await expect(page.locator('.rmi-disclosure > summary')).toBeVisible();

    const firstHref = await peerLinks.nth(0).getAttribute('href');
    const lastHref = await peerLinks.nth(2).getAttribute('href');
    expect(firstHref).toBeTruthy();
    expect(lastHref).toBeTruthy();
    await expectAligned(
      page,
      [
        `a.ren-nav-link[href="${firstHref}"]`,
        '.rmi-disclosure > summary',
        `a.ren-nav-link[href="${lastHref}"]`,
      ],
      'centerY',
      2
    );

    const detailsChrome = await inspectNativeChrome(page, '.rmi-disclosure');
    expect(detailsChrome.borderTopWidth === '0px', 'details outer border').toBeTruthy();
    expect(detailsChrome.marginTop).toBe('0px');
    expect(detailsChrome.paddingTop).toBe('0px');

    const summaryChrome = await inspectNativeChrome(page, '.rmi-disclosure > summary');
    const afterContent = String(summaryChrome.afterContent || 'none').replace(/['"]/g, '');
    const afterNeutralized =
      afterContent === 'none' ||
      afterContent === '' ||
      summaryChrome.afterDisplay === 'none';
    expect(afterNeutralized, 'classless summary::after must be neutralized').toBe(true);
  });

  test('mobile rows: full width, start-aligned, descriptions hidden, footer stacked', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoIconsBlock(page, staticServer.origin);
    await page.locator('[data-rmi-root] .ren-nav-toggle').click();
    await page.locator('.rmi-disclosure > summary').click();
    await expect(page.locator('.rmi-panel')).toBeVisible();

    const firstPeer = page.locator('#rmi-primary-links > li > a.ren-nav-link').first();
    await expect(firstPeer).toBeVisible();
    const peerHref = await firstPeer.getAttribute('href');
    expect(peerHref).toBeTruthy();

    await expectWidthRatio(page, `a.ren-nav-link[href="${peerHref}"]`, '#rmi-primary-links', 0.92, 1.05);
    await expectWidthRatio(page, '.rmi-disclosure > summary', '#rmi-primary-links', 0.92, 1.05);
    await expectSingleVisibleAffordance(
      page,
      ['.rmi-disclosure summary .rmi-chevron'],
      'mobile icons mega-menu chevron'
    );
    await expectNoOverflow(page, 'html');

    const mobileLayout = await page.evaluate(() => {
      const desc = document.querySelector('.rmi-dest-desc');
      const firstDest = document.querySelector('.rmi-dest');
      const firstIcon = firstDest?.querySelector('.rmi-dest-icon');
      const firstLabel = firstDest?.querySelector('.rmi-dest-label');
      const actions = Array.from(document.querySelectorAll('.rmi-footer-action'));
      if (!desc || !firstDest || !firstIcon || !firstLabel || actions.length < 2) return null;
      const descStyle = getComputedStyle(desc);
      const descRect = desc.getBoundingClientRect();
      const descHidden =
        descStyle.display === 'none' ||
        descStyle.visibility === 'hidden' ||
        parseFloat(descStyle.opacity || '1') === 0 ||
        descRect.height === 0;
      const a0 = actions[0].getBoundingClientRect();
      const a1 = actions[1].getBoundingClientRect();
      const stacked = a1.top >= a0.bottom - 2;
      const destRect = firstDest.getBoundingClientRect();
      const iconRect = firstIcon.getBoundingClientRect();
      const labelRect = firstLabel.getBoundingClientRect();
      const iconStartsAtRow = iconRect.left - destRect.left <= 16;
      const compactIconLabelGap = labelRect.left - iconRect.right >= 0 && labelRect.left - iconRect.right <= 24;
      return { descHidden, stacked, iconStartsAtRow, compactIconLabelGap };
    });
    expect(mobileLayout).toBeTruthy();
    expect(mobileLayout.descHidden, 'mobile descriptions visually hidden').toBe(true);
    expect(mobileLayout.stacked, 'mobile footer actions stacked').toBe(true);
    expect(mobileLayout.iconStartsAtRow, 'mobile icon starts at the row edge').toBe(true);
    expect(mobileLayout.compactIconLabelGap, 'mobile icon and label stay adjacent').toBe(true);

    const detailsChrome = await inspectNativeChrome(page, '.rmi-disclosure');
    const summaryChrome = await inspectNativeChrome(page, '.rmi-disclosure > summary');
    expect(detailsChrome.borderTopWidth === '0px' || detailsChrome.paddingTop === '0px').toBeTruthy();
    const afterContent = String(summaryChrome.afterContent || 'none').replace(/['"]/g, '');
    expect(
      afterContent === 'none' || afterContent === '' || summaryChrome.afterDisplay === 'none',
      'mobile classless summary::after'
    ).toBeTruthy();
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await gotoIconsBlock(page, staticServer.origin);

    await page.locator('[data-rmi-root] .ren-nav-toggle').click();
    await page.locator('.rmi-disclosure > summary').click();

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-rmi-root]');
      if (!root) return [{ name: 'missing-root', width: 0, height: 0 }];

      const candidates = root.querySelectorAll(
        'a[href], button, summary, .ren-nav-toggle, .rmi-dest, .rmi-footer-link, .rmi-footer-action'
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
    await gotoIconsBlock(page, staticServer.origin);
    await page.locator('.rmi-disclosure > summary').click();

    const motion = await page.evaluate(() => {
      const selectors = ['.rmi-panel', '.rmi-chevron', '.rmi-dest', '.rmi-footer'];
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

  test('icons mega menu preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await gotoIconsBlock(page, staticServer.origin);
    await injectAxe(page);
    await checkA11y(page, '[data-rmi-root]', {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    });
  });

  test('light and dark surfaces resolve through RenDS tokens', async ({ page }) => {
    await gotoIconsBlock(page, staticServer.origin);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }, theme);

      const colors = await page.evaluate(() => {
        const surface = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim();
        const text = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
        const nav = document.querySelector('[data-rmi-root] .ren-nav');
        return {
          surface,
          text,
          navBg: nav ? getComputedStyle(nav).backgroundColor : '',
        };
      });

      expect(colors.surface, theme).toBeTruthy();
      expect(colors.text, theme).toBeTruthy();
      expect(colors.navBg, theme).not.toBe('');
      expect(colors.navBg, theme).not.toMatch(/rgba\(0,\s*0,\s*0,\s*0\)/);
    }
  });
});

/**
 * Navbar 8 — Link-Rail Mega Menu (nav-mega-menu-link-rail).
 * Phase A RED: implementation file is intentionally absent; these tests must fail
 * specifically for missing anatomy / page, not for broken suite wiring.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoLinkRailBlock(page, origin) {
  const response = await page.goto(`${origin}${MEGA_MENU_LINK_RAIL}`);
  expect(response, 'HTTP response for link-rail mega block').toBeTruthy();
  // Fail fast when the block file is absent (Phase A RED).
  expect(response.status(), 'link-rail block must not 404 — implement templates/blocks/nav-mega-menu-link-rail.html').toBe(200);
  await expect(page.locator('[data-rml-root]'), 'missing [data-rml-root] shell').toHaveCount(1, { timeout: 2000 });
}

test.describe('Navbar Mega Menu Link Rail (navbar8)', () => {
  /** @type {{ origin: string, close: () => Promise<void> }} */
  let staticServer;

  // Keep RED failures fast: absent selectors should not burn the default 30s action timeout.
  test.use({ actionTimeout: 3000, navigationTimeout: 10000 });
  test.describe.configure({ timeout: 20000 });

  test.beforeAll(async () => {
    staticServer = await startStaticServer();
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  test('block page loads with ren-nav shell and link-rail root', async ({ page }) => {
    await gotoLinkRailBlock(page, staticServer.origin);

    await expect(page.getByRole('heading', { name: /Navbar Mega Menu Link Rail|Link.?Rail Mega Menu/i, level: 1 })).toBeVisible();
    await expect(page.locator('ren-nav')).toHaveCount(1);
    await expect(page.locator('nav.ren-nav')).toHaveCount(1);
    await expect(page.locator('#rml-primary-links')).toHaveCount(1);
    await expect(page.locator('ul.ren-nav-links')).toHaveCount(1);
  });

  test('exactly one primary links tree serves desktop and mobile', async ({ page }) => {
    await gotoLinkRailBlock(page, staticServer.origin);
    await expect(page.locator('#rml-primary-links')).toHaveCount(1);
    await expect(page.locator('[data-rml-root] ul.ren-nav-links')).toHaveCount(1);
    // Single landmark: no nested unlabeled nav for rail/mega.
    await expect(page.locator('[data-rml-root] nav')).toHaveCount(1);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('#rml-primary-links')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.locator('[data-rml-root] .ren-nav-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rml-primary-links')).toBeVisible();
    await expect(page.locator('[data-rml-root] ul.ren-nav-links')).toHaveCount(1);
  });

  test('anatomy: four top-level entries, 3×4 destinations, contrast rail, one chevron', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoLinkRailBlock(page, staticServer.origin);

    // Exact top-level list ownership: four direct children, three peer links + one mega.
    await expect(page.locator('#rml-primary-links > li')).toHaveCount(4);
    const topLevelLinks = page.locator('#rml-primary-links > li > a.ren-nav-link');
    const megaSummaries = page.locator('#rml-primary-links > li > .rml-disclosure > summary');
    await expect(topLevelLinks).toHaveCount(3);
    await expect(megaSummaries).toHaveCount(1);

    await expect(page.locator('[data-rml-root] .ren-nav-actions a, [data-rml-root] .ren-nav-actions .ren-btn')).toHaveCount(2);
    await expect(page.locator('[data-rml-root] .ren-nav-toggle')).toHaveCount(1);

    await page.locator('.rml-disclosure > summary').click();
    await expect(page.locator('.rml-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rml-panel')).toBeVisible();

    await expect(page.locator('.rml-group')).toHaveCount(3);
    await expect(page.locator('.rml-dest')).toHaveCount(12);
    await expect(page.locator('.rml-dest-desc')).toHaveCount(12);
    await expect(page.locator('.rml-dest-icon')).toHaveCount(12);
    await expect(page.locator('.rml-rail')).toHaveCount(1);
    await expect(page.locator('.rml-rail-heading')).toHaveCount(1);
    await expect(page.locator('.rml-rail-link')).toHaveCount(5);
    // No featured/raster media region (Navbar 5/6/7 anatomy must not leak in).
    await expect(page.locator('.rml-feature, .rml-featured, .rmi-feature, .rmf-feature, .rbm-feature, .rmi-footer')).toHaveCount(0);

    await expectSingleVisibleAffordance(
      page,
      ['.rml-disclosure summary .rml-chevron'],
      'link-rail mega-menu chevron'
    );
  });

  test('summary opens by click, keyboard, and desktop pointer hover; Escape restores focus', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoLinkRailBlock(page, staticServer.origin);

    const disclosure = page.locator('.rml-disclosure');
    const summary = disclosure.locator('summary');
    const panel = page.locator('.rml-panel');

    await expect(disclosure).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();
    await expect(page.locator('.rml-dest').first()).toBeVisible();

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
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');

    // Relume desktop pointer hover-preview (additive to click/keyboard); navbar7 pin policy.
    // Escape suppresses hover re-open until the pointer exits the corridor.
    await page.locator('[data-rml-root] .ren-nav-brand').hover();
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();

    // Stable close region: moving summary → panel must not close.
    await panel.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('.rml-dest').first()).toBeVisible();

    // First pointer click pins hover-open; pinned state survives leaving the hit region.
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('[data-rml-root] .ren-nav-brand').hover();
    await expect(disclosure).toHaveAttribute('open', '');

    // Second pointer click closes; fresh hover after leaving can re-open.
    await summary.hover();
    await summary.click();
    await expect(disclosure).not.toHaveAttribute('open', '');
    await page.locator('[data-rml-root] .ren-nav-brand').hover();
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('[data-rml-root] .ren-nav-brand').hover();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('outside click and destination activation close the disclosure', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoLinkRailBlock(page, staticServer.origin);

    const disclosure = page.locator('.rml-disclosure');
    const summary = disclosure.locator('summary');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.locator('[data-rml-root] .ren-nav-brand').click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('.rml-dest').first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('.rml-rail-link').first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('mobile toggle exposes the same tree and closes mega on menu close', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoLinkRailBlock(page, staticServer.origin);

    const toggle = page.locator('[data-rml-root] .ren-nav-toggle');
    const disclosure = page.locator('.rml-disclosure');
    const summary = disclosure.locator('summary');

    await expect(toggle).toHaveAttribute('aria-controls', 'rml-primary-links');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rml-primary-links')).toBeVisible();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('.rml-dest').first()).toBeVisible();
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
    await gotoLinkRailBlock(page, staticServer.origin);

    await expect(page.locator('[data-rml-root] .ren-nav-toggle')).toBeHidden();
    await expect(page.locator('#rml-primary-links')).toBeVisible();
    await expect(page.locator('[data-rml-root] .ren-nav-actions a, [data-rml-root] .ren-nav-actions .ren-btn').first()).toBeVisible();

    await page.locator('.rml-disclosure > summary').click();
    await expect(page.locator('.rml-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rml-dest')).toHaveCount(12);
    await expect(page.locator('.rml-rail')).toHaveCount(1);
    await expect(page.locator('.rml-rail-link')).toHaveCount(5);
    await expect(page.locator('.rml-rail-heading')).toBeVisible();

    await context.close();
  });

  test('viewport geometry: desktop panel under bar, mobile in-flow, no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoLinkRailBlock(page, staticServer.origin);
    await page.locator('.rml-disclosure > summary').click();
    await expect(page.locator('.rml-panel')).toBeVisible();

    const desktop = await page.evaluate(() => {
      const nav = document.querySelector('[data-rml-root] .ren-nav');
      const panel = document.querySelector('.rml-panel');
      if (!nav || !panel) return null;
      const navRect = nav.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      return {
        navBottom: navRect.bottom,
        panelTop: panelRect.top,
        panelPosition: getComputedStyle(panel).position,
      };
    });
    expect(desktop).toBeTruthy();
    expect(desktop.panelPosition).toBe('absolute');
    expect(desktop.panelTop).toBeGreaterThanOrEqual(desktop.navBottom - 1);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoLinkRailBlock(page, staticServer.origin);
    await page.locator('[data-rml-root] .ren-nav-toggle').click();
    await page.locator('.rml-disclosure > summary').click();
    await expect(page.locator('.rml-panel')).toBeVisible();

    const mobile = await page.evaluate(() => {
      const panel = document.querySelector('.rml-panel');
      if (!panel) return null;
      return { position: getComputedStyle(panel).position };
    });
    expect(mobile).toBeTruthy();
    expect(['static', 'relative']).toContain(mobile.position);
    await expectNoOverflow(page, 'html');
  });

  test('tablet mid-width: readable groups, visible descriptions, distinct rail', async ({ page }) => {
    // 834px is ≥48rem (desktop shell) but <64rem (mid-width mega content band).
    await page.setViewportSize({ width: 834, height: 1112 });
    await gotoLinkRailBlock(page, staticServer.origin);

    const toggle = page.locator('[data-rml-root] .ren-nav-toggle');
    await expect(toggle).toBeHidden();

    await page.locator('.rml-disclosure > summary').click();
    await expect(page.locator('.rml-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rml-panel')).toBeVisible();
    await expect(page.locator('.rml-group')).toHaveCount(3);
    await expect(page.locator('.rml-dest')).toHaveCount(12);
    await expect(page.locator('.rml-dest-desc')).toHaveCount(12);
    await expect(page.locator('.rml-rail')).toHaveCount(1);
    await expect(page.locator('.rml-rail-link')).toHaveCount(5);

    const tablet = await page.evaluate(() => {
      const groups = document.querySelector('.rml-groups');
      const groupEls = Array.from(document.querySelectorAll('.rml-group'));
      const dest = document.querySelector('.rml-dest');
      const destLabel = document.querySelector('.rml-dest-label');
      const destDesc = document.querySelector('.rml-dest-desc');
      const rail = document.querySelector('.rml-rail');
      if (!groups || groupEls.length < 2 || !dest || !destLabel || !destDesc || !rail) return null;

      const gr = groups.getBoundingClientRect();
      const railR = rail.getBoundingClientRect();
      const dr = dest.getBoundingClientRect();
      const labelR = destLabel.getBoundingClientRect();
      const descR = destDesc.getBoundingClientRect();
      const descStyle = getComputedStyle(destDesc);
      const descVisible =
        descStyle.display !== 'none' &&
        descStyle.visibility !== 'hidden' &&
        parseFloat(descStyle.opacity || '1') > 0 &&
        descR.height > 0;

      const readableWidth = Math.max(labelR.width, descR.width, dr.width - 48);
      const railDistinct = railR.width > 0 && railR.height > 0;

      return {
        groupsWidth: Math.round(gr.width),
        destWidth: Math.round(dr.width),
        readableWidth: Math.round(readableWidth),
        labelHeight: Math.round(labelR.height),
        descHeight: Math.round(descR.height),
        descVisible,
        railDistinct,
        railWidth: Math.round(railR.width),
      };
    });

    expect(tablet, 'tablet composition metrics').toBeTruthy();
    expect(tablet.descVisible, 'descriptions visible at tablet mid-width').toBe(true);
    expect(tablet.railDistinct, 'contrast rail remains present at tablet').toBe(true);
    expect(tablet.readableWidth, `destination readable width ${tablet.readableWidth}`).toBeGreaterThanOrEqual(120);
    expect(tablet.destWidth, `destination hit width ${tablet.destWidth}`).toBeGreaterThanOrEqual(140);
    expect(tablet.labelHeight, `label height ${tablet.labelHeight}`).toBeLessThanOrEqual(48);
    expect(tablet.descHeight, `desc height ${tablet.descHeight}`).toBeLessThanOrEqual(72);
    await expectNoOverflow(page, 'html');

    // ≥64rem restores three-column primary groups + narrower rail hierarchy.
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('.rml-panel')).toBeVisible();
    const wide = await page.evaluate(() => {
      const groupEls = Array.from(document.querySelectorAll('.rml-group'));
      const rail = document.querySelector('.rml-rail');
      const groups = document.querySelector('.rml-groups');
      if (groupEls.length < 3 || !rail || !groups) return null;
      const rects = groupEls.map((el) => el.getBoundingClientRect());
      const topsAligned = rects.every((r) => Math.abs(r.top - rects[0].top) < 48);
      const lefts = rects.map((r) => r.left).sort((a, b) => a - b);
      const progressive = lefts.every((left, i) => i === 0 || left >= lefts[i - 1] + 8);
      const groupsR = groups.getBoundingClientRect();
      const railR = rail.getBoundingClientRect();
      const railNarrower = railR.width < groupsR.width * 0.55;
      return {
        topsAligned,
        progressive,
        count: groupEls.length,
        railNarrower,
        groupsWidth: Math.round(groupsR.width),
        railWidth: Math.round(railR.width),
      };
    });
    expect(wide).toBeTruthy();
    expect(wide.count).toBe(3);
    expect(wide.topsAligned, 'wide desktop groups should share a row').toBe(true);
    expect(wide.progressive, 'wide desktop groups should advance left→right').toBe(true);
    expect(wide.railNarrower, `rail ${wide.railWidth} should be narrower than groups ${wide.groupsWidth}`).toBe(true);
  });

  test('ren-icon wrappers size SVGs without width/height attributes; dest icons square', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoLinkRailBlock(page, staticServer.origin);
    await page.locator('.rml-disclosure > summary').click();
    await expect(page.locator('.rml-panel')).toBeVisible();

    const iconAudit = await page.evaluate(() => {
      const root = document.querySelector('[data-rml-root]');
      if (!root) return { error: 'missing-root' };

      const destIcons = Array.from(root.querySelectorAll('.rml-dest-icon'));
      const destSquares = destIcons.map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          w: Math.round(rect.width),
          h: Math.round(rect.height),
          square: Math.abs(rect.width - rect.height) <= 2,
        };
      });

      const wrappers = Array.from(root.querySelectorAll('.ren-icon'));
      const results = [];
      for (const wrap of wrappers) {
        const svg = wrap.querySelector('svg');
        if (!svg) {
          results.push({ error: 'missing-svg', className: wrap.className });
          continue;
        }
        const wrapStyle = getComputedStyle(wrap);
        results.push({
          className: wrap.className,
          hasWidthAttr: svg.hasAttribute('width'),
          hasHeightAttr: svg.hasAttribute('height'),
          viewBox: svg.getAttribute('viewBox'),
          focusable: svg.getAttribute('focusable'),
          ariaHidden: svg.getAttribute('aria-hidden'),
          isSm: wrap.classList.contains('ren-icon-sm'),
          isLg: wrap.classList.contains('ren-icon-lg'),
          wrapW: Math.round(parseFloat(wrapStyle.width)),
          wrapH: Math.round(parseFloat(wrapStyle.height)),
        });
      }
      return { count: results.length, results, destSquares, destIconCount: destIcons.length };
    });

    expect(iconAudit.error, JSON.stringify(iconAudit)).toBeUndefined();
    expect(iconAudit.destIconCount, '12 destination icon containers').toBe(12);
    for (const box of iconAudit.destSquares) {
      expect(box.square, `dest icon ${box.w}x${box.h}`).toBe(true);
      expect(box.w, 'dest icon size floor').toBeGreaterThanOrEqual(16);
    }

    // At least 12 destination icons + 1 chevron.
    expect(iconAudit.count, 'expected ren-icon wrappers in link-rail mega').toBeGreaterThanOrEqual(13);

    for (const item of iconAudit.results) {
      expect(item.hasWidthAttr, `${item.className} must not set svg width`).toBe(false);
      expect(item.hasHeightAttr, `${item.className} must not set svg height`).toBe(false);
      expect(item.viewBox, item.className).toBeTruthy();
      expect(item.focusable, item.className).toBe('false');
      expect(item.ariaHidden, item.className).toBe('true');
    }
  });

  test('desktop chrome: single chevron, neutral details, aligned trigger', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoLinkRailBlock(page, staticServer.origin);

    await expectSingleVisibleAffordance(
      page,
      ['.rml-disclosure summary .rml-chevron'],
      'link-rail mega-menu chevron'
    );

    const peerLinks = page.locator('#rml-primary-links > li > a.ren-nav-link');
    await expect(peerLinks.first()).toBeVisible();
    await expect(page.locator('.rml-disclosure > summary')).toBeVisible();

    const firstHref = await peerLinks.nth(0).getAttribute('href');
    const lastHref = await peerLinks.nth(2).getAttribute('href');
    expect(firstHref).toBeTruthy();
    expect(lastHref).toBeTruthy();
    await expectAligned(
      page,
      [
        `a.ren-nav-link[href="${firstHref}"]`,
        '.rml-disclosure > summary',
        `a.ren-nav-link[href="${lastHref}"]`,
      ],
      'centerY',
      2
    );

    const detailsChrome = await inspectNativeChrome(page, '.rml-disclosure');
    expect(detailsChrome.borderTopWidth === '0px', 'details outer border').toBeTruthy();
    expect(detailsChrome.marginTop).toBe('0px');
    expect(detailsChrome.paddingTop).toBe('0px');

    const summaryChrome = await inspectNativeChrome(page, '.rml-disclosure > summary');
    const afterContent = String(summaryChrome.afterContent || 'none').replace(/['"]/g, '');
    const afterNeutralized =
      afterContent === 'none' ||
      afterContent === '' ||
      summaryChrome.afterDisplay === 'none';
    expect(afterNeutralized, 'classless summary::after must be neutralized').toBe(true);
  });

  test('mobile rows: full width, start-aligned, descriptions hidden, rail stacked', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoLinkRailBlock(page, staticServer.origin);
    await page.locator('[data-rml-root] .ren-nav-toggle').click();
    await page.locator('.rml-disclosure > summary').click();
    await expect(page.locator('.rml-panel')).toBeVisible();

    const firstPeer = page.locator('#rml-primary-links > li > a.ren-nav-link').first();
    await expect(firstPeer).toBeVisible();
    const peerHref = await firstPeer.getAttribute('href');
    expect(peerHref).toBeTruthy();

    await expectWidthRatio(page, `a.ren-nav-link[href="${peerHref}"]`, '#rml-primary-links', 0.92, 1.05);
    await expectWidthRatio(page, '.rml-disclosure > summary', '#rml-primary-links', 0.92, 1.05);
    await expectSingleVisibleAffordance(
      page,
      ['.rml-disclosure summary .rml-chevron'],
      'mobile link-rail mega-menu chevron'
    );
    await expectNoOverflow(page, 'html');

    const mobileLayout = await page.evaluate(() => {
      const desc = document.querySelector('.rml-dest-desc');
      const firstDest = document.querySelector('.rml-dest');
      const firstIcon = firstDest?.querySelector('.rml-dest-icon');
      const firstLabel = firstDest?.querySelector('.rml-dest-label');
      const railLinks = Array.from(document.querySelectorAll('.rml-rail-link'));
      if (!desc || !firstDest || !firstIcon || !firstLabel || railLinks.length < 2) return null;
      const descStyle = getComputedStyle(desc);
      const descRect = desc.getBoundingClientRect();
      const descHidden =
        descStyle.display === 'none' ||
        descStyle.visibility === 'hidden' ||
        parseFloat(descStyle.opacity || '1') === 0 ||
        descRect.height === 0;
      const a0 = railLinks[0].getBoundingClientRect();
      const a1 = railLinks[1].getBoundingClientRect();
      const stacked = a1.top >= a0.bottom - 2;
      const destRect = firstDest.getBoundingClientRect();
      const iconRect = firstIcon.getBoundingClientRect();
      const labelRect = firstLabel.getBoundingClientRect();
      const iconStartsAtRow = iconRect.left - destRect.left <= 16;
      const compactIconLabelGap = labelRect.left - iconRect.right >= 0 && labelRect.left - iconRect.right <= 24;
      return { descHidden, stacked, iconStartsAtRow, compactIconLabelGap };
    });
    expect(mobileLayout).toBeTruthy();
    expect(mobileLayout.descHidden, 'mobile descriptions visually hidden').toBe(true);
    expect(mobileLayout.stacked, 'mobile rail links stacked').toBe(true);
    expect(mobileLayout.iconStartsAtRow, 'mobile icon starts at the row edge').toBe(true);
    expect(mobileLayout.compactIconLabelGap, 'mobile icon and label stay adjacent').toBe(true);

    const detailsChrome = await inspectNativeChrome(page, '.rml-disclosure');
    const summaryChrome = await inspectNativeChrome(page, '.rml-disclosure > summary');
    expect(detailsChrome.borderTopWidth === '0px' || detailsChrome.paddingTop === '0px').toBeTruthy();
    const afterContent = String(summaryChrome.afterContent || 'none').replace(/['"]/g, '');
    expect(
      afterContent === 'none' || afterContent === '' || summaryChrome.afterDisplay === 'none',
      'mobile classless summary::after'
    ).toBeTruthy();
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await gotoLinkRailBlock(page, staticServer.origin);

    await page.locator('[data-rml-root] .ren-nav-toggle').click();
    await page.locator('.rml-disclosure > summary').click();

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-rml-root]');
      if (!root) return [{ name: 'missing-root', width: 0, height: 0 }];

      const candidates = root.querySelectorAll(
        'a[href], button, summary, .ren-nav-toggle, .rml-dest, .rml-rail-link'
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
    await gotoLinkRailBlock(page, staticServer.origin);
    await page.locator('.rml-disclosure > summary').click();

    const motion = await page.evaluate(() => {
      const selectors = ['.rml-panel', '.rml-chevron', '.rml-dest', '.rml-rail'];
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

  test('link-rail mega menu preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await gotoLinkRailBlock(page, staticServer.origin);
    await injectAxe(page);
    await checkA11y(page, '[data-rml-root]', {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    });
  });

  test('light and dark surfaces resolve through RenDS tokens', async ({ page }) => {
    await gotoLinkRailBlock(page, staticServer.origin);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }, theme);

      const colors = await page.evaluate(() => {
        const surface = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim();
        const text = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
        const nav = document.querySelector('[data-rml-root] .ren-nav');
        return {
          surface,
          text,
          navBg: nav ? getComputedStyle(nav).backgroundColor : '',
        };
      });

      expect(colors.surface, theme).toBeTruthy();
      expect(colors.text, theme).toBeTruthy();
      expect(colors.navBg, theme).not.toBe('');
      expect(colors.navBg, theme).not.toMatch(/rgba\(0,\s*0,\s*0,\s*0\)/);
    }
  });
});

/**
 * Navbar 9 — Footer Mega Menu (nav-mega-menu-footer).
 * Phase A RED: implementation file is intentionally absent; these tests must fail
 * specifically for missing anatomy / page, not for broken suite wiring.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoFooterMegaBlock(page, origin) {
  const response = await page.goto(`${origin}${MEGA_MENU_FOOTER}`);
  expect(response, 'HTTP response for footer mega block').toBeTruthy();
  expect(response.status(), 'footer mega block must not 404 — implement templates/blocks/nav-mega-menu-footer.html').toBe(200);
  await expect(page.locator('[data-rmnf-root]'), 'missing [data-rmnf-root] shell').toHaveCount(1, { timeout: 2000 });
}

test.describe('Navbar Mega Menu Footer (navbar9)', () => {
  /** @type {{ origin: string, close: () => Promise<void> }} */
  let staticServer;

  test.use({ actionTimeout: 3000, navigationTimeout: 10000 });
  test.describe.configure({ timeout: 20000 });

  test.beforeAll(async () => {
    staticServer = await startStaticServer();
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  test('block page loads with ren-nav shell and footer mega root', async ({ page }) => {
    await gotoFooterMegaBlock(page, staticServer.origin);

    await expect(page.getByRole('heading', { name: /Navbar Mega Menu Footer|Footer Mega Menu/i, level: 1 })).toBeVisible();
    await expect(page.locator('ren-nav')).toHaveCount(1);
    await expect(page.locator('nav.ren-nav')).toHaveCount(1);
    await expect(page.locator('#rmnf-primary-links')).toHaveCount(1);
    await expect(page.locator('ul.ren-nav-links')).toHaveCount(1);
  });

  test('exactly one primary links tree serves desktop and mobile', async ({ page }) => {
    await gotoFooterMegaBlock(page, staticServer.origin);
    await expect(page.locator('#rmnf-primary-links')).toHaveCount(1);
    await expect(page.locator('[data-rmnf-root] ul.ren-nav-links')).toHaveCount(1);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('#rmnf-primary-links')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.locator('[data-rmnf-root] .ren-nav-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rmnf-primary-links')).toBeVisible();
    await expect(page.locator('[data-rmnf-root] ul.ren-nav-links')).toHaveCount(1);
  });

  test('anatomy: four top-level entries, four destinations, footer band, one chevron', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoFooterMegaBlock(page, staticServer.origin);

    await expect(page.locator('#rmnf-primary-links > li')).toHaveCount(4);
    const topLevelLinks = page.locator('#rmnf-primary-links > li > a.ren-nav-link');
    const megaSummaries = page.locator('#rmnf-primary-links > li > .rmnf-disclosure > summary');
    await expect(topLevelLinks).toHaveCount(3);
    await expect(megaSummaries).toHaveCount(1);

    await expect(page.locator('[data-rmnf-root] .ren-nav-actions a, [data-rmnf-root] .ren-nav-actions .ren-btn')).toHaveCount(2);
    await expect(page.locator('[data-rmnf-root] .ren-nav-toggle')).toHaveCount(1);

    await page.locator('.rmnf-disclosure > summary').click();
    await expect(page.locator('.rmnf-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rmnf-panel')).toBeVisible();

    await expect(page.locator('.rmnf-group')).toHaveCount(4);
    await expect(page.locator('.rmnf-dest')).toHaveCount(4);
    await expect(page.locator('.rmnf-dest-desc')).toHaveCount(4);
    await expect(page.locator('.rmnf-dest-icon')).toHaveCount(4);
    await expect(page.locator('.rmnf-footer-band')).toHaveCount(1);
    await expect(page.locator('.rmnf-footer-heading')).toHaveCount(1);
    await expect(page.locator('.rmnf-footer-link')).toHaveCount(1);
    await expect(page.locator('.rml-rail, .rmi-footer-action, .rmi-footer, .rmf-feature, .rbm-feature')).toHaveCount(0);

    await expectSingleVisibleAffordance(
      page,
      ['.rmnf-disclosure summary .rmnf-chevron'],
      'footer mega-menu chevron'
    );
  });

  test('summary opens by click, keyboard, and desktop pointer hover; Escape restores focus', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoFooterMegaBlock(page, staticServer.origin);

    const disclosure = page.locator('.rmnf-disclosure');
    const summary = disclosure.locator('summary');
    const panel = page.locator('.rmnf-panel');

    await expect(disclosure).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();
    await expect(page.locator('.rmnf-dest').first()).toBeVisible();

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
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');

    await page.locator('[data-rmnf-root] .ren-nav-brand').hover();
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();

    await panel.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('.rmnf-dest').first()).toBeVisible();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('[data-rmnf-root] .ren-nav-brand').hover();
    await expect(disclosure).toHaveAttribute('open', '');

    await summary.hover();
    await summary.click();
    await expect(disclosure).not.toHaveAttribute('open', '');
    await page.locator('[data-rmnf-root] .ren-nav-brand').hover();
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('[data-rmnf-root] .ren-nav-brand').hover();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('outside click and destination or footer link activation close the disclosure', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoFooterMegaBlock(page, staticServer.origin);

    const disclosure = page.locator('.rmnf-disclosure');
    const summary = disclosure.locator('summary');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.locator('[data-rmnf-root] .ren-nav-brand').click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('.rmnf-dest').first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('.rmnf-footer-link').click();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('mobile toggle exposes the same tree and closes mega on menu close', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoFooterMegaBlock(page, staticServer.origin);

    const toggle = page.locator('[data-rmnf-root] .ren-nav-toggle');
    const disclosure = page.locator('.rmnf-disclosure');
    const summary = disclosure.locator('summary');

    await expect(toggle).toHaveAttribute('aria-controls', 'rmnf-primary-links');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rmnf-primary-links')).toBeVisible();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('.rmnf-dest').first()).toBeVisible();
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
    await gotoFooterMegaBlock(page, staticServer.origin);

    await expect(page.locator('[data-rmnf-root] .ren-nav-toggle')).toBeHidden();
    await expect(page.locator('#rmnf-primary-links')).toBeVisible();
    await expect(page.locator('[data-rmnf-root] .ren-nav-actions a, [data-rmnf-root] .ren-nav-actions .ren-btn').first()).toBeVisible();

    await page.locator('.rmnf-disclosure > summary').click();
    await expect(page.locator('.rmnf-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rmnf-dest')).toHaveCount(4);
    await expect(page.locator('.rmnf-footer-band')).toHaveCount(1);
    await expect(page.locator('.rmnf-footer-link')).toBeVisible();
    await expect(page.locator('.rmnf-footer-heading')).toBeVisible();

    await context.close();
  });

  test('viewport geometry: desktop panel under bar, mobile in-flow, no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoFooterMegaBlock(page, staticServer.origin);
    await page.locator('.rmnf-disclosure > summary').click();
    await expect(page.locator('.rmnf-panel')).toBeVisible();

    const desktop = await page.evaluate(() => {
      const nav = document.querySelector('[data-rmnf-root] .ren-nav');
      const panel = document.querySelector('.rmnf-panel');
      if (!nav || !panel) return null;
      const navRect = nav.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      return {
        navBottom: navRect.bottom,
        panelTop: panelRect.top,
        panelPosition: getComputedStyle(panel).position,
      };
    });
    expect(desktop).toBeTruthy();
    expect(desktop.panelPosition).toBe('absolute');
    expect(desktop.panelTop).toBeGreaterThanOrEqual(desktop.navBottom - 1);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoFooterMegaBlock(page, staticServer.origin);
    await page.locator('[data-rmnf-root] .ren-nav-toggle').click();
    await page.locator('.rmnf-disclosure > summary').click();
    await expect(page.locator('.rmnf-panel')).toBeVisible();

    const mobile = await page.evaluate(() => {
      const panel = document.querySelector('.rmnf-panel');
      if (!panel) return null;
      return { position: getComputedStyle(panel).position };
    });
    expect(mobile).toBeTruthy();
    expect(['static', 'relative']).toContain(mobile.position);
    await expectNoOverflow(page, 'html');
  });

  test('tablet mid-width: two-column groups, visible descriptions, distinct footer band', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1112 });
    await gotoFooterMegaBlock(page, staticServer.origin);

    const toggle = page.locator('[data-rmnf-root] .ren-nav-toggle');
    await expect(toggle).toBeHidden();

    await page.locator('.rmnf-disclosure > summary').click();
    await expect(page.locator('.rmnf-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rmnf-panel')).toBeVisible();
    await expect(page.locator('.rmnf-group')).toHaveCount(4);
    await expect(page.locator('.rmnf-dest')).toHaveCount(4);
    await expect(page.locator('.rmnf-dest-desc')).toHaveCount(4);
    await expect(page.locator('.rmnf-footer-band')).toHaveCount(1);
    await expect(page.locator('.rmnf-footer-link')).toHaveCount(1);

    const tablet = await page.evaluate(() => {
      const groups = document.querySelector('.rmnf-groups');
      const groupEls = Array.from(document.querySelectorAll('.rmnf-group'));
      const dest = document.querySelector('.rmnf-dest');
      const destLabel = document.querySelector('.rmnf-dest-label');
      const destDesc = document.querySelector('.rmnf-dest-desc');
      const footer = document.querySelector('.rmnf-footer-band');
      if (!groups || groupEls.length < 2 || !dest || !destLabel || !destDesc || !footer) return null;

      const gr = groups.getBoundingClientRect();
      const g0 = groupEls[0].getBoundingClientRect();
      const g1 = groupEls[1].getBoundingClientRect();
      const dr = dest.getBoundingClientRect();
      const labelR = destLabel.getBoundingClientRect();
      const descR = destDesc.getBoundingClientRect();
      const footerR = footer.getBoundingClientRect();
      const descStyle = getComputedStyle(destDesc);
      const descVisible =
        descStyle.display !== 'none' &&
        descStyle.visibility !== 'hidden' &&
        parseFloat(descStyle.opacity || '1') > 0 &&
        descR.height > 0;

      const twoUp = Math.abs(g0.top - g1.top) < 48 && g1.left >= g0.right - 4;
      const footerBelowGrid = footerR.top >= gr.bottom - 8;
      const footerDistinct = footerR.width > 0 && footerR.height > 0 && footerBelowGrid;
      const readableWidth = Math.max(labelR.width, descR.width, dr.width - 48);

      return {
        groupsWidth: Math.round(gr.width),
        destWidth: Math.round(dr.width),
        readableWidth: Math.round(readableWidth),
        labelHeight: Math.round(labelR.height),
        descHeight: Math.round(descR.height),
        descVisible,
        twoUp,
        footerDistinct,
        footerWidth: Math.round(footerR.width),
      };
    });

    expect(tablet, 'tablet composition metrics').toBeTruthy();
    expect(tablet.twoUp, 'tablet groups should form a 2-column band').toBe(true);
    expect(tablet.descVisible, 'descriptions visible at tablet mid-width').toBe(true);
    expect(tablet.footerDistinct, 'footer band sits beneath destination grid').toBe(true);
    expect(tablet.readableWidth, `destination readable width ${tablet.readableWidth}`).toBeGreaterThanOrEqual(120);
    expect(tablet.destWidth, `destination hit width ${tablet.destWidth}`).toBeGreaterThanOrEqual(140);
    expect(tablet.labelHeight, `label height ${tablet.labelHeight}`).toBeLessThanOrEqual(48);
    expect(tablet.descHeight, `desc height ${tablet.descHeight}`).toBeLessThanOrEqual(72);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('.rmnf-panel')).toBeVisible();
    const wide = await page.evaluate(() => {
      const groupEls = Array.from(document.querySelectorAll('.rmnf-group'));
      const groups = document.querySelector('.rmnf-groups');
      const footer = document.querySelector('.rmnf-footer-band');
      const panel = document.querySelector('.rmnf-panel');
      if (groupEls.length < 4 || !groups || !footer || !panel) return null;
      const rects = groupEls.map((el) => el.getBoundingClientRect());
      const topsAligned = rects.every((r) => Math.abs(r.top - rects[0].top) < 48);
      const lefts = rects.map((r) => r.left).sort((a, b) => a - b);
      const progressive = lefts.every((left, i) => i === 0 || left >= lefts[i - 1] + 8);
      const groupsR = groups.getBoundingClientRect();
      const footerR = footer.getBoundingClientRect();
      const panelR = panel.getBoundingClientRect();
      const footerFullWidth = footerR.width >= panelR.width * 0.9;
      const footerBelow = footerR.top >= groupsR.bottom - 8;
      return {
        topsAligned,
        progressive,
        count: groupEls.length,
        footerFullWidth,
        footerBelow,
        groupsWidth: Math.round(groupsR.width),
        footerWidth: Math.round(footerR.width),
        panelWidth: Math.round(panelR.width),
      };
    });
    expect(wide).toBeTruthy();
    expect(wide.count).toBe(4);
    expect(wide.topsAligned, 'wide desktop groups should share a row').toBe(true);
    expect(wide.progressive, 'wide desktop groups should advance left→right').toBe(true);
    expect(wide.footerBelow, 'footer band should sit below the four-column grid').toBe(true);
    expect(wide.footerFullWidth, `footer ${wide.footerWidth} should span panel ${wide.panelWidth}`).toBe(true);
  });

  test('ren-icon wrappers size SVGs without width/height attributes; dest icons square', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoFooterMegaBlock(page, staticServer.origin);
    await page.locator('.rmnf-disclosure > summary').click();
    await expect(page.locator('.rmnf-panel')).toBeVisible();

    const iconAudit = await page.evaluate(() => {
      const root = document.querySelector('[data-rmnf-root]');
      if (!root) return { error: 'missing-root' };

      const destIcons = Array.from(root.querySelectorAll('.rmnf-dest-icon'));
      const destSquares = destIcons.map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          w: Math.round(rect.width),
          h: Math.round(rect.height),
          square: Math.abs(rect.width - rect.height) <= 2,
        };
      });

      const wrappers = Array.from(root.querySelectorAll('.ren-icon'));
      const results = [];
      for (const wrap of wrappers) {
        const svg = wrap.querySelector('svg');
        if (!svg) {
          results.push({ error: 'missing-svg', className: wrap.className });
          continue;
        }
        const wrapStyle = getComputedStyle(wrap);
        results.push({
          className: wrap.className,
          hasWidthAttr: svg.hasAttribute('width'),
          hasHeightAttr: svg.hasAttribute('height'),
          viewBox: svg.getAttribute('viewBox'),
          focusable: svg.getAttribute('focusable'),
          ariaHidden: svg.getAttribute('aria-hidden'),
          isSm: wrap.classList.contains('ren-icon-sm'),
          isLg: wrap.classList.contains('ren-icon-lg'),
          wrapW: Math.round(parseFloat(wrapStyle.width)),
          wrapH: Math.round(parseFloat(wrapStyle.height)),
        });
      }
      return { count: results.length, results, destSquares, destIconCount: destIcons.length };
    });

    expect(iconAudit.error, JSON.stringify(iconAudit)).toBeUndefined();
    expect(iconAudit.destIconCount, '4 destination icon containers').toBe(4);
    for (const box of iconAudit.destSquares) {
      expect(box.square, `dest icon ${box.w}x${box.h}`).toBe(true);
      expect(box.w, 'dest icon size floor').toBeGreaterThanOrEqual(16);
    }

    expect(iconAudit.count, 'expected ren-icon wrappers in footer mega').toBeGreaterThanOrEqual(5);

    for (const item of iconAudit.results) {
      expect(item.hasWidthAttr, `${item.className} must not set svg width`).toBe(false);
      expect(item.hasHeightAttr, `${item.className} must not set svg height`).toBe(false);
      expect(item.viewBox, item.className).toBeTruthy();
      expect(item.focusable, item.className).toBe('false');
      expect(item.ariaHidden, item.className).toBe('true');
    }
  });

  test('desktop chrome: single chevron, neutral details, aligned trigger', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoFooterMegaBlock(page, staticServer.origin);

    await expectSingleVisibleAffordance(
      page,
      ['.rmnf-disclosure summary .rmnf-chevron'],
      'footer mega-menu chevron'
    );

    const peerLinks = page.locator('#rmnf-primary-links > li > a.ren-nav-link');
    await expect(peerLinks.first()).toBeVisible();
    await expect(page.locator('.rmnf-disclosure > summary')).toBeVisible();

    const firstHref = await peerLinks.nth(0).getAttribute('href');
    const lastHref = await peerLinks.nth(2).getAttribute('href');
    expect(firstHref).toBeTruthy();
    expect(lastHref).toBeTruthy();
    await expectAligned(
      page,
      [
        `a.ren-nav-link[href="${firstHref}"]`,
        '.rmnf-disclosure > summary',
        `a.ren-nav-link[href="${lastHref}"]`,
      ],
      'centerY',
      2
    );

    const detailsChrome = await inspectNativeChrome(page, '.rmnf-disclosure');
    expect(detailsChrome.borderTopWidth === '0px', 'details outer border').toBeTruthy();
    expect(detailsChrome.marginTop).toBe('0px');
    expect(detailsChrome.paddingTop).toBe('0px');

    const summaryChrome = await inspectNativeChrome(page, '.rmnf-disclosure > summary');
    const afterContent = String(summaryChrome.afterContent || 'none').replace(/['"]/g, '');
    const afterNeutralized =
      afterContent === 'none' ||
      afterContent === '' ||
      summaryChrome.afterDisplay === 'none';
    expect(afterNeutralized, 'classless summary::after must be neutralized').toBe(true);
  });

  test('mobile rows: full width, start-aligned, descriptions hidden, footer band stacked', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoFooterMegaBlock(page, staticServer.origin);
    await page.locator('[data-rmnf-root] .ren-nav-toggle').click();
    await page.locator('.rmnf-disclosure > summary').click();
    await expect(page.locator('.rmnf-panel')).toBeVisible();

    const firstPeer = page.locator('#rmnf-primary-links > li > a.ren-nav-link').first();
    await expect(firstPeer).toBeVisible();
    const peerHref = await firstPeer.getAttribute('href');
    expect(peerHref).toBeTruthy();

    await expectWidthRatio(page, `a.ren-nav-link[href="${peerHref}"]`, '#rmnf-primary-links', 0.92, 1.05);
    await expectWidthRatio(page, '.rmnf-disclosure > summary', '#rmnf-primary-links', 0.92, 1.05);
    await expectSingleVisibleAffordance(
      page,
      ['.rmnf-disclosure summary .rmnf-chevron'],
      'mobile footer mega-menu chevron'
    );
    await expectNoOverflow(page, 'html');

    const mobileLayout = await page.evaluate(() => {
      const desc = document.querySelector('.rmnf-dest-desc');
      const firstDest = document.querySelector('.rmnf-dest');
      const firstIcon = firstDest?.querySelector('.rmnf-dest-icon');
      const firstLabel = firstDest?.querySelector('.rmnf-dest-label');
      const footer = document.querySelector('.rmnf-footer-band');
      const groups = document.querySelector('.rmnf-groups');
      if (!desc || !firstDest || !firstIcon || !firstLabel || !footer || !groups) return null;
      const descStyle = getComputedStyle(desc);
      const descRect = desc.getBoundingClientRect();
      const descHidden =
        descStyle.display === 'none' ||
        descStyle.visibility === 'hidden' ||
        parseFloat(descStyle.opacity || '1') === 0 ||
        descRect.height === 0;
      const destRect = firstDest.getBoundingClientRect();
      const iconRect = firstIcon.getBoundingClientRect();
      const labelRect = firstLabel.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      const groupsRect = groups.getBoundingClientRect();
      const iconStartsAtRow = iconRect.left - destRect.left <= 16;
      const compactIconLabelGap = labelRect.left - iconRect.right >= 0 && labelRect.left - iconRect.right <= 24;
      const footerBelowGrid = footerRect.top >= groupsRect.bottom - 8;
      return { descHidden, iconStartsAtRow, compactIconLabelGap, footerBelowGrid };
    });
    expect(mobileLayout).toBeTruthy();
    expect(mobileLayout.descHidden, 'mobile descriptions visually hidden').toBe(true);
    expect(mobileLayout.iconStartsAtRow, 'mobile icon starts at the row edge').toBe(true);
    expect(mobileLayout.compactIconLabelGap, 'mobile icon and label stay adjacent').toBe(true);
    expect(mobileLayout.footerBelowGrid, 'mobile footer band follows destination groups').toBe(true);

    const detailsChrome = await inspectNativeChrome(page, '.rmnf-disclosure');
    const summaryChrome = await inspectNativeChrome(page, '.rmnf-disclosure > summary');
    expect(detailsChrome.borderTopWidth === '0px' || detailsChrome.paddingTop === '0px').toBeTruthy();
    const afterContent = String(summaryChrome.afterContent || 'none').replace(/['"]/g, '');
    expect(
      afterContent === 'none' || afterContent === '' || summaryChrome.afterDisplay === 'none',
      'mobile classless summary::after'
    ).toBeTruthy();
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await gotoFooterMegaBlock(page, staticServer.origin);

    await page.locator('[data-rmnf-root] .ren-nav-toggle').click();
    await page.locator('.rmnf-disclosure > summary').click();

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-rmnf-root]');
      if (!root) return [{ name: 'missing-root', width: 0, height: 0 }];

      const candidates = root.querySelectorAll(
        'a[href], button, summary, .ren-nav-toggle, .rmnf-dest, .rmnf-footer-link'
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
    await gotoFooterMegaBlock(page, staticServer.origin);
    await page.locator('.rmnf-disclosure > summary').click();

    const motion = await page.evaluate(() => {
      const selectors = ['.rmnf-panel', '.rmnf-chevron', '.rmnf-dest', '.rmnf-footer-band'];
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

  test('footer mega menu preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await gotoFooterMegaBlock(page, staticServer.origin);
    await injectAxe(page);
    await checkA11y(page, '[data-rmnf-root]', {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    });
  });

  test('light and dark surfaces resolve through RenDS tokens', async ({ page }) => {
    await gotoFooterMegaBlock(page, staticServer.origin);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }, theme);

      const colors = await page.evaluate(() => {
        const surface = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim();
        const text = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
        const nav = document.querySelector('[data-rmnf-root] .ren-nav');
        return {
          surface,
          text,
          navBg: nav ? getComputedStyle(nav).backgroundColor : '',
        };
      });

      expect(colors.surface, theme).toBeTruthy();
      expect(colors.text, theme).toBeTruthy();
      expect(colors.navBg, theme).not.toBe('');
      expect(colors.navBg, theme).not.toMatch(/rgba\(0,\s*0,\s*0,\s*0\)/);
    }
  });
});

/**
 * Navbar 10 — Card-Grid Mega Menu (nav-mega-menu-card-grid).
 * Phase A RED: implementation file is intentionally absent; these tests must fail
 * specifically for missing anatomy / page, not for broken suite wiring.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoCardGridBlock(page, origin) {
  const response = await page.goto(`${origin}${MEGA_MENU_CARD_GRID}`);
  expect(response, 'HTTP response for card-grid mega block').toBeTruthy();
  expect(
    response.status(),
    'card-grid block must not 404 — implement templates/blocks/nav-mega-menu-card-grid.html'
  ).toBe(200);
  await expect(page.locator('[data-rmcg-root]'), 'missing [data-rmcg-root] shell').toHaveCount(1, {
    timeout: 2000,
  });
}

test.describe('Navbar Mega Menu Card Grid (navbar10)', () => {
  /** @type {{ origin: string, close: () => Promise<void> }} */
  let staticServer;

  test.use({ actionTimeout: 3000, navigationTimeout: 10000 });
  test.describe.configure({ timeout: 20000 });

  test.beforeAll(async () => {
    staticServer = await startStaticServer();
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  test('block page loads with ren-nav shell and card-grid root', async ({ page }) => {
    await gotoCardGridBlock(page, staticServer.origin);

    await expect(
      page.getByRole('heading', { name: /Navbar Mega Menu Card Grid|Card.?Grid Mega Menu/i, level: 1 })
    ).toBeVisible();
    await expect(page.locator('ren-nav')).toHaveCount(1);
    await expect(page.locator('nav.ren-nav')).toHaveCount(1);
    await expect(page.locator('#rmcg-primary-links')).toHaveCount(1);
    await expect(page.locator('ul.ren-nav-links')).toHaveCount(1);
  });

  test('exactly one primary links tree serves desktop and mobile', async ({ page }) => {
    await gotoCardGridBlock(page, staticServer.origin);
    await expect(page.locator('#rmcg-primary-links')).toHaveCount(1);
    await expect(page.locator('[data-rmcg-root] ul.ren-nav-links')).toHaveCount(1);
    await expect(page.locator('[data-rmcg-root] nav')).toHaveCount(1);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('#rmcg-primary-links')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.locator('[data-rmcg-root] .ren-nav-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rmcg-primary-links')).toBeVisible();
    await expect(page.locator('[data-rmcg-root] ul.ren-nav-links')).toHaveCount(1);
  });

  test('anatomy: four top-level entries, five mega links, six whole cards, one chevron', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoCardGridBlock(page, staticServer.origin);

    await expect(page.locator('#rmcg-primary-links > li')).toHaveCount(4);
    const topLevelLinks = page.locator('#rmcg-primary-links > li > a.ren-nav-link');
    const megaSummaries = page.locator('#rmcg-primary-links > li > .rmcg-disclosure > summary');
    await expect(topLevelLinks).toHaveCount(3);
    await expect(megaSummaries).toHaveCount(1);

    await expect(page.locator('[data-rmcg-root] .ren-nav-actions a, [data-rmcg-root] .ren-nav-actions .ren-btn')).toHaveCount(2);
    await expect(page.locator('[data-rmcg-root] .ren-nav-toggle')).toHaveCount(1);

    await page.locator('.rmcg-disclosure > summary').click();
    await expect(page.locator('.rmcg-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rmcg-panel')).toBeVisible();

    await expect(page.locator('.rmcg-layout.ren-with-sidebar')).toHaveCount(1);
    await expect(page.locator('.rmcg-link-col')).toHaveCount(1);
    await expect(page.locator('.rmcg-group-heading')).toHaveCount(1);
    await expect(page.locator('.rmcg-mega-link')).toHaveCount(5);
    await expect(page.locator('.rmcg-card-grid.ren-grid-2')).toHaveCount(1);
    await expect(page.locator('a.rmcg-card.ren-card.ren-card-interactive')).toHaveCount(6);
    await expect(page.locator('.rmcg-card-media')).toHaveCount(6);
    await expect(page.locator('.rmcg-card-title')).toHaveCount(6);
    await expect(page.locator('.rmcg-card-desc')).toHaveCount(6);
    await expect(page.locator('.rmcg-card-cta')).toHaveCount(6);
    await expect(page.locator('.rmnf-footer-band, .rml-rail, .rmi-footer, .rmf-feature, .rbm-feature')).toHaveCount(0);

    await expectSingleVisibleAffordance(
      page,
      ['.rmcg-disclosure summary .rmcg-chevron'],
      'card-grid mega-menu chevron'
    );
  });

  test('six editorial cards are single anchors without nested interactive descendants', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoCardGridBlock(page, staticServer.origin);
    await page.locator('.rmcg-disclosure > summary').click();

    const cards = page.locator('a.rmcg-card.ren-card.ren-card-interactive');
    await expect(cards).toHaveCount(6);

    for (let i = 0; i < 6; i += 1) {
      const card = cards.nth(i);
      const tagName = await card.evaluate((el) => el.tagName);
      expect(tagName, `card ${i} tag`).toBe('A');
      await expect(card).toHaveAttribute('href', /.+/);
      await expect(card.locator('a[href], button, [role="button"]')).toHaveCount(0);
    }
  });

  test('summary opens by click, keyboard, and desktop pointer hover; Escape restores focus', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoCardGridBlock(page, staticServer.origin);

    const disclosure = page.locator('.rmcg-disclosure');
    const summary = disclosure.locator('summary');
    const panel = page.locator('.rmcg-panel');

    await expect(disclosure).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();
    await expect(page.locator('.rmcg-card').first()).toBeVisible();

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
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');

    await page.locator('[data-rmcg-root] .ren-nav-brand').hover();
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();

    await panel.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('.rmcg-card').first()).toBeVisible();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('[data-rmcg-root] .ren-nav-brand').hover();
    await expect(disclosure).toHaveAttribute('open', '');

    await summary.hover();
    await summary.click();
    await expect(disclosure).not.toHaveAttribute('open', '');
    await page.locator('[data-rmcg-root] .ren-nav-brand').hover();
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('[data-rmcg-root] .ren-nav-brand').hover();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('outside click and mega link or card activation close the disclosure', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoCardGridBlock(page, staticServer.origin);

    const disclosure = page.locator('.rmcg-disclosure');
    const summary = disclosure.locator('summary');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.locator('[data-rmcg-root] .ren-nav-brand').click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('.rmcg-mega-link').first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('a.rmcg-card').first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('mobile toggle exposes the same tree and closes mega on menu close', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoCardGridBlock(page, staticServer.origin);

    const toggle = page.locator('[data-rmcg-root] .ren-nav-toggle');
    const disclosure = page.locator('.rmcg-disclosure');
    const summary = disclosure.locator('summary');

    await expect(toggle).toHaveAttribute('aria-controls', 'rmcg-primary-links');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rmcg-primary-links')).toBeVisible();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('.rmcg-card').first()).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('JS-disabled mobile keeps the nav tree and mega content usable', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await gotoCardGridBlock(page, staticServer.origin);

    await expect(page.locator('[data-rmcg-root] .ren-nav-toggle')).toBeHidden();
    await expect(page.locator('#rmcg-primary-links')).toBeVisible();
    await expect(page.locator('[data-rmcg-root] .ren-nav-actions a, [data-rmcg-root] .ren-nav-actions .ren-btn').first()).toBeVisible();

    await page.locator('.rmcg-disclosure > summary').click();
    await expect(page.locator('.rmcg-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rmcg-mega-link')).toHaveCount(5);
    await expect(page.locator('a.rmcg-card')).toHaveCount(6);
    await expect(page.locator('.rmcg-group-heading')).toBeVisible();

    await context.close();
  });

  test('viewport geometry: desktop panel under bar, mobile in-flow, no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoCardGridBlock(page, staticServer.origin);
    await page.locator('.rmcg-disclosure > summary').click();
    await expect(page.locator('.rmcg-panel')).toBeVisible();

    const desktop = await page.evaluate(() => {
      const nav = document.querySelector('[data-rmcg-root] .ren-nav');
      const panel = document.querySelector('.rmcg-panel');
      if (!nav || !panel) return null;
      const navRect = nav.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      return {
        navBottom: navRect.bottom,
        panelTop: panelRect.top,
        panelPosition: getComputedStyle(panel).position,
      };
    });
    expect(desktop).toBeTruthy();
    expect(desktop.panelPosition).toBe('absolute');
    expect(desktop.panelTop).toBeGreaterThanOrEqual(desktop.navBottom - 1);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoCardGridBlock(page, staticServer.origin);
    await page.locator('[data-rmcg-root] .ren-nav-toggle').click();
    await page.locator('.rmcg-disclosure > summary').click();
    await expect(page.locator('.rmcg-panel')).toBeVisible();

    const mobile = await page.evaluate(() => {
      const panel = document.querySelector('.rmcg-panel');
      if (!panel) return null;
      return { position: getComputedStyle(panel).position };
    });
    expect(mobile).toBeTruthy();
    expect(['static', 'relative']).toContain(mobile.position);
    await expectNoOverflow(page, 'html');
  });

  test('tablet mid-width and wide desktop: narrow link column and responsive card grid', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1112 });
    await gotoCardGridBlock(page, staticServer.origin);

    const toggle = page.locator('[data-rmcg-root] .ren-nav-toggle');
    await expect(toggle).toBeHidden();

    await page.locator('.rmcg-disclosure > summary').click();
    await expect(page.locator('.rmcg-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rmcg-panel')).toBeVisible();
    await expect(page.locator('.rmcg-mega-link')).toHaveCount(5);
    await expect(page.locator('a.rmcg-card')).toHaveCount(6);

    const tablet = await page.evaluate(() => {
      const linkCol = document.querySelector('.rmcg-link-col');
      const cardGrid = document.querySelector('.rmcg-card-grid');
      const cards = Array.from(document.querySelectorAll('a.rmcg-card'));
      const firstCard = cards[0];
      const media = firstCard?.querySelector('.rmcg-card-media');
      const body = firstCard?.querySelector('.rmcg-card-body');
      if (!linkCol || !cardGrid || cards.length < 2 || !firstCard || !media || !body) return null;

      const linkR = linkCol.getBoundingClientRect();
      const gridR = cardGrid.getBoundingClientRect();
      const c0 = cards[0].getBoundingClientRect();
      const c1 = cards[1].getBoundingClientRect();
      const twoUpCards = Math.abs(c0.top - c1.top) < 48 && c1.left >= c0.right - 4;

      return {
        linkColWidth: Math.round(linkR.width),
        cardGridWidth: Math.round(gridR.width),
        narrowLeft: linkR.width < gridR.width * 0.72,
        twoUpCards,
        cardReadable: Math.round(Math.max(body.getBoundingClientRect().width, c0.width - 48)),
      };
    });

    expect(tablet, 'tablet composition metrics').toBeTruthy();
    expect(tablet.narrowLeft, 'link column narrower than card region at tablet').toBe(true);
    expect(tablet.twoUpCards, 'tablet card grid should form two columns when space allows').toBe(true);
    expect(tablet.cardReadable, `card readable width ${tablet.cardReadable}`).toBeGreaterThanOrEqual(120);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('.rmcg-panel')).toBeVisible();
    const wide = await page.evaluate(() => {
      const linkCol = document.querySelector('.rmcg-link-col');
      const cardGrid = document.querySelector('.rmcg-card-grid');
      const cards = Array.from(document.querySelectorAll('a.rmcg-card'));
      if (!linkCol || !cardGrid || cards.length < 6) return null;

      const linkR = linkCol.getBoundingClientRect();
      const gridR = cardGrid.getBoundingClientRect();
      const linkNarrow = linkR.width <= 16 * 16 && linkR.width < gridR.width * 0.45;

      const cardLayouts = cards.map((card) => {
        const media = card.querySelector('.rmcg-card-media');
        const body = card.querySelector('.rmcg-card-body');
        if (!media || !body) return { horizontal: false, mediaShare: 0 };
        const mr = media.getBoundingClientRect();
        const br = body.getBoundingClientRect();
        const cardR = card.getBoundingClientRect();
        const horizontal =
          mr.left < br.left - 8 && Math.abs(mr.top - br.top) < Math.max(mr.height, br.height) * 0.55;
        const mediaShare = cardR.width > 0 ? mr.width / cardR.width : 0;
        return { horizontal, mediaShare: Number(mediaShare.toFixed(2)) };
      });

      const gridRects = cards.map((el) => el.getBoundingClientRect());
      const twoColumnBand =
        Math.abs(gridRects[0].top - gridRects[1].top) < 48 && gridRects[1].left >= gridRects[0].right - 4;

      return {
        linkNarrow,
        linkColWidth: Math.round(linkR.width),
        cardGridWidth: Math.round(gridR.width),
        twoColumnBand,
        cardLayouts,
      };
    });

    expect(wide).toBeTruthy();
    expect(wide.linkNarrow, `link ${wide.linkColWidth} vs cards ${wide.cardGridWidth}`).toBe(true);
    expect(wide.twoColumnBand, 'wide desktop keeps a two-column card grid').toBe(true);
    for (const [i, layout] of wide.cardLayouts.entries()) {
      expect(layout.horizontal, `card ${i} horizontal media/copy at wide desktop`).toBe(true);
      expect(layout.mediaShare, `card ${i} media share ${layout.mediaShare}`).toBeLessThanOrEqual(0.62);
    }
  });

  test('card media uses approximately 3:2 frames with cover crop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoCardGridBlock(page, staticServer.origin);
    await page.locator('.rmcg-disclosure > summary').click();
    await expect(page.locator('.rmcg-panel')).toBeVisible();

    const mediaAudit = await page.evaluate(() => {
      const frames = Array.from(document.querySelectorAll('.rmcg-card-media'));
      return frames.map((frame, index) => {
        const rect = frame.getBoundingClientRect();
        const style = getComputedStyle(frame);
        const ratio = rect.height > 0 ? rect.width / rect.height : 0;
        const img = frame.querySelector('img');
        const imgStyle = img ? getComputedStyle(img) : null;
        return {
          index,
          ratio: Number(ratio.toFixed(2)),
          aspectRatio: style.aspectRatio,
          objectFit: imgStyle?.objectFit || '',
          hasRenFrame: frame.classList.contains('ren-frame'),
        };
      });
    });

    expect(mediaAudit.length, 'six card media frames').toBe(6);
    for (const item of mediaAudit) {
      expect(item.hasRenFrame, `frame ${item.index} ren-frame`).toBe(true);
      expect(item.ratio, `frame ${item.index} box ratio ${item.ratio}`).toBeGreaterThanOrEqual(1.3);
      expect(item.ratio, `frame ${item.index} box ratio ${item.ratio}`).toBeLessThanOrEqual(1.7);
      const aspect = String(item.aspectRatio || '');
      expect(
        aspect.includes('3') && aspect.includes('2'),
        `frame ${item.index} aspect-ratio ${aspect}`
      ).toBe(true);
      expect(item.objectFit, `frame ${item.index} object-fit`).toBe('cover');
    }
  });

  test('desktop chrome: single chevron, neutral details, aligned trigger', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoCardGridBlock(page, staticServer.origin);

    await expectSingleVisibleAffordance(
      page,
      ['.rmcg-disclosure summary .rmcg-chevron'],
      'card-grid mega-menu chevron'
    );

    const peerLinks = page.locator('#rmcg-primary-links > li > a.ren-nav-link');
    await expect(peerLinks.first()).toBeVisible();
    await expect(page.locator('.rmcg-disclosure > summary')).toBeVisible();

    const firstHref = await peerLinks.nth(0).getAttribute('href');
    const lastHref = await peerLinks.nth(2).getAttribute('href');
    expect(firstHref).toBeTruthy();
    expect(lastHref).toBeTruthy();
    await expectAligned(
      page,
      [
        `a.ren-nav-link[href="${firstHref}"]`,
        '.rmcg-disclosure > summary',
        `a.ren-nav-link[href="${lastHref}"]`,
      ],
      'centerY',
      2
    );

    const detailsChrome = await inspectNativeChrome(page, '.rmcg-disclosure');
    expect(detailsChrome.borderTopWidth === '0px', 'details outer border').toBeTruthy();
    expect(detailsChrome.marginTop).toBe('0px');
    expect(detailsChrome.paddingTop).toBe('0px');

    const summaryChrome = await inspectNativeChrome(page, '.rmcg-disclosure > summary');
    const afterContent = String(summaryChrome.afterContent || 'none').replace(/['"]/g, '');
    const afterNeutralized =
      afterContent === 'none' ||
      afterContent === '' ||
      summaryChrome.afterDisplay === 'none';
    expect(afterNeutralized, 'classless summary::after must be neutralized').toBe(true);
  });

  test('mobile rows: full width peers, one-column cards by default, no overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoCardGridBlock(page, staticServer.origin);
    await page.locator('[data-rmcg-root] .ren-nav-toggle').click();
    await page.locator('.rmcg-disclosure > summary').click();
    await expect(page.locator('.rmcg-panel')).toBeVisible();

    const firstPeer = page.locator('#rmcg-primary-links > li > a.ren-nav-link').first();
    await expect(firstPeer).toBeVisible();
    const peerHref = await firstPeer.getAttribute('href');
    expect(peerHref).toBeTruthy();

    await expectWidthRatio(page, `a.ren-nav-link[href="${peerHref}"]`, '#rmcg-primary-links', 0.92, 1.05);
    await expectWidthRatio(page, '.rmcg-disclosure > summary', '#rmcg-primary-links', 0.92, 1.05);
    await expectSingleVisibleAffordance(
      page,
      ['.rmcg-disclosure summary .rmcg-chevron'],
      'mobile card-grid mega-menu chevron'
    );
    await expectNoOverflow(page, 'html');

    const mobileLayout = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('a.rmcg-card'));
      const linkCol = document.querySelector('.rmcg-link-col');
      const cardGrid = document.querySelector('.rmcg-card-grid');
      if (cards.length < 2 || !linkCol || !cardGrid) return null;
      const c0 = cards[0].getBoundingClientRect();
      const c1 = cards[1].getBoundingClientRect();
      const linkR = linkCol.getBoundingClientRect();
      const gridR = cardGrid.getBoundingClientRect();
      const stackedCards = c1.top >= c0.bottom - 8;
      const linkAboveCards = gridR.top >= linkR.bottom - 16;
      return { stackedCards, linkAboveCards, cardCount: cards.length };
    });
    expect(mobileLayout).toBeTruthy();
    expect(mobileLayout.stackedCards, 'mobile cards stack in one column by default').toBe(true);
    expect(mobileLayout.linkAboveCards, 'five-link column precedes card grid in flow').toBe(true);
    expect(mobileLayout.cardCount).toBe(6);

    const detailsChrome = await inspectNativeChrome(page, '.rmcg-disclosure');
    const summaryChrome = await inspectNativeChrome(page, '.rmcg-disclosure > summary');
    expect(detailsChrome.borderTopWidth === '0px' || detailsChrome.paddingTop === '0px').toBeTruthy();
    const afterContent = String(summaryChrome.afterContent || 'none').replace(/['"]/g, '');
    expect(
      afterContent === 'none' || afterContent === '' || summaryChrome.afterDisplay === 'none',
      'mobile classless summary::after'
    ).toBeTruthy();
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await gotoCardGridBlock(page, staticServer.origin);

    await page.locator('[data-rmcg-root] .ren-nav-toggle').click();
    await page.locator('.rmcg-disclosure > summary').click();

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-rmcg-root]');
      if (!root) return [{ name: 'missing-root', width: 0, height: 0 }];

      const candidates = root.querySelectorAll(
        'a[href], button, summary, .ren-nav-toggle, .rmcg-mega-link, a.rmcg-card'
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
    await gotoCardGridBlock(page, staticServer.origin);
    await page.locator('.rmcg-disclosure > summary').click();

    const motion = await page.evaluate(() => {
      const selectors = ['.rmcg-panel', '.rmcg-chevron', 'a.rmcg-card', '.rmcg-card-media'];
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

  test('card-grid mega menu preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await gotoCardGridBlock(page, staticServer.origin);
    await injectAxe(page);
    await checkA11y(page, '[data-rmcg-root]', {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    });
  });

  test('light and dark surfaces resolve through RenDS tokens', async ({ page }) => {
    await gotoCardGridBlock(page, staticServer.origin);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }, theme);

      const colors = await page.evaluate(() => {
        const surface = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim();
        const text = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
        const nav = document.querySelector('[data-rmcg-root] .ren-nav');
        return {
          surface,
          text,
          navBg: nav ? getComputedStyle(nav).backgroundColor : '',
        };
      });

      expect(colors.surface, theme).toBeTruthy();
      expect(colors.text, theme).toBeTruthy();
      expect(colors.navBg, theme).not.toBe('');
      expect(colors.navBg, theme).not.toMatch(/rgba\(0,\s*0,\s*0,\s*0\)/);
    }
  });
});

/**
 * Navbar 11 — Logo-Left Menu-Right Dropdown (nav-logo-left-menu-right-dropdown).
 * Phase A RED: implementation file is intentionally absent; these tests must fail
 * specifically for missing anatomy / page, not for broken suite wiring.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoNavbar11Block(page, origin) {
  const response = await page.goto(`${origin}${LOGO_LEFT_MENU_RIGHT_DROPDOWN}`);
  expect(response, 'HTTP response for logo-left menu-right dropdown block').toBeTruthy();
  expect(
    response.status(),
    'navbar11 block must not 404 — implement templates/blocks/nav-logo-left-menu-right-dropdown.html'
  ).toBe(200);
  await expect(page.locator('[data-rn11-root]'), 'missing [data-rn11-root] shell').toHaveCount(1, {
    timeout: 2000,
  });
}

/** @type {{ version: number, path: string, root: string, states: Array<{ id: string, viewport: { width: number, height: number }, theme: string, javaScript: boolean, reducedMotion: boolean, actions: Array<{ type: string, selector: string }>, expectedMarkers: Record<string, number> }> }} */
const RN11_RENDER_MATRIX = JSON.parse(
  fs.readFileSync(
    path.join(PKG_ROOT, 'docs/workflows/relume-to-ren10/modules/navbar11/render-matrix.json'),
    'utf8'
  )
);

test.describe('Navbar Logo Left Menu Right Dropdown (navbar11)', () => {
  /** @type {{ origin: string, close: () => Promise<void> }} */
  let staticServer;

  test.use({ actionTimeout: 3000, navigationTimeout: 10000 });
  test.describe.configure({ timeout: 20000 });

  test.beforeAll(async () => {
    staticServer = await startStaticServer();
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  test('block page loads with ren-nav shell and navbar11 root', async ({ page }) => {
    await gotoNavbar11Block(page, staticServer.origin);

    await expect(
      page.getByRole('heading', {
        name: /Logo.?Left Menu.?Right Dropdown|Navbar 11|nav-logo-left-menu-right-dropdown/i,
        level: 1,
      })
    ).toBeVisible();
    await expect(page.locator('ren-nav')).toHaveCount(1);
    await expect(page.locator('nav.ren-nav')).toHaveCount(1);
    await expect(page.locator('#rn11-primary-links')).toHaveCount(1);
    await expect(page.locator('[data-rn11-root] ul.ren-nav-links')).toHaveCount(1);
    await expect(page.locator('[data-rn11-root] nav')).toHaveCount(1);
    await expect(page.locator('nav nav')).toHaveCount(0);
  });

  test('exactly one primary links tree serves desktop and mobile', async ({ page }) => {
    await gotoNavbar11Block(page, staticServer.origin);
    await expect(page.locator('#rn11-primary-links')).toHaveCount(1);
    await expect(page.locator('[data-rn11-root] ul.ren-nav-links')).toHaveCount(1);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('#rn11-primary-links')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.locator('[data-rn11-root] .ren-nav-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rn11-primary-links')).toBeVisible();
    await expect(page.locator('[data-rn11-root] ul.ren-nav-links')).toHaveCount(1);
  });

  test('anatomy: one brand, four top entries, four rich anchors, four icons, two actions, one toggle, one chevron', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar11Block(page, staticServer.origin);

    await expect(page.locator('[data-rn11-root] .ren-nav-brand')).toHaveCount(1);

    await expect(page.locator('#rn11-primary-links > li')).toHaveCount(4);
    const topLevelLinks = page.locator('#rn11-primary-links > li > a.ren-nav-link');
    const dropdownSummaries = page.locator('#rn11-primary-links > li > .rn11-disclosure > summary');
    await expect(topLevelLinks).toHaveCount(3);
    await expect(dropdownSummaries).toHaveCount(1);

    await expect(
      page.locator('[data-rn11-root] .ren-nav-actions a, [data-rn11-root] .ren-nav-actions .ren-btn')
    ).toHaveCount(2);
    await expect(page.locator('[data-rn11-root] .ren-nav-toggle')).toHaveCount(1);

    await page.locator('.rn11-disclosure > summary').click();
    await expect(page.locator('.rn11-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rn11-panel')).toBeVisible();

    await expect(page.locator('a.rn11-dropdown-link')).toHaveCount(4);
    await expect(page.locator('.rn11-destination-icon.ren-icon')).toHaveCount(4);
    await expect(page.locator('a.rn11-dropdown-link .ren-stack-xs')).toHaveCount(4);
    await expect(page.locator('.rn11-dest-title')).toHaveCount(4);
    await expect(page.locator('.rn11-dest-desc')).toHaveCount(4);

    await expect(page.locator('.rmcg-card, .rmf-feature, .rmi-panel, .ren-card')).toHaveCount(0);

    await expectSingleVisibleAffordance(
      page,
      ['.rn11-disclosure summary .rn11-chevron'],
      'navbar11 dropdown chevron'
    );
    await expect(page.locator('.rn11-chevron')).toHaveCount(1);
  });

  test('rich dropdown destinations are single anchors with coherent icon/title/description rows', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar11Block(page, staticServer.origin);
    await page.locator('.rn11-disclosure > summary').click();

    const links = page.locator('a.rn11-dropdown-link.ren-row');
    await expect(links).toHaveCount(4);

    for (let i = 0; i < 4; i += 1) {
      const link = links.nth(i);
      const tagName = await link.evaluate((el) => el.tagName);
      expect(tagName, `destination ${i} tag`).toBe('A');
      await expect(link).toHaveAttribute('href', /.+/);
      await expect(link.locator('.rn11-destination-icon.ren-icon')).toHaveCount(1);
      await expect(link.locator('.ren-stack-xs')).toHaveCount(1);
      await expect(link.locator('a[href], button, [role="button"]')).toHaveCount(0);
    }

    const firstHref = await links.nth(0).getAttribute('href');
    expect(firstHref).toBeTruthy();
    await expectAligned(
      page,
      [
        `a.rn11-dropdown-link[href="${firstHref}"] .rn11-destination-icon`,
        `a.rn11-dropdown-link[href="${firstHref}"] .rn11-dest-title`,
      ],
      'centerY',
      3
    );
  });

  test('summary opens by click, keyboard, and desktop pointer hover; click pins; Escape restores focus', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar11Block(page, staticServer.origin);

    const disclosure = page.locator('.rn11-disclosure');
    const summary = disclosure.locator('summary');
    const panel = page.locator('.rn11-panel');

    await expect(disclosure).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();
    await expect(page.locator('a.rn11-dropdown-link').first()).toBeVisible();

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
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');

    await page.locator('[data-rn11-root] .ren-nav-brand').hover();
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();

    await panel.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('a.rn11-dropdown-link').first()).toBeVisible();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('[data-rn11-root] .ren-nav-brand').hover();
    await expect(disclosure).toHaveAttribute('open', '');

    await summary.hover();
    await summary.click();
    await expect(disclosure).not.toHaveAttribute('open', '');
    await page.locator('[data-rn11-root] .ren-nav-brand').hover();
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('[data-rn11-root] .ren-nav-brand').hover();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('outside click and destination activation close the disclosure', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar11Block(page, staticServer.origin);

    const disclosure = page.locator('.rn11-disclosure');
    const summary = disclosure.locator('summary');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.locator('[data-rn11-root] .ren-nav-brand').click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('a.rn11-dropdown-link').first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('mobile toggle exposes the same tree and closes dropdown on menu close', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar11Block(page, staticServer.origin);

    const toggle = page.locator('[data-rn11-root] .ren-nav-toggle');
    const disclosure = page.locator('.rn11-disclosure');
    const summary = disclosure.locator('summary');

    // Source hamburger is unnamed — Ren10 requires an accessible name + expanded/controls wiring.
    await expect(toggle).toHaveAttribute('aria-label', /.+/);
    await expect(toggle).toHaveAttribute('aria-controls', 'rn11-primary-links');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rn11-primary-links')).toBeVisible();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('a.rn11-dropdown-link').first()).toBeVisible();
    // Summary activation must not collapse the mobile tree.
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('breakpoint crossing closes an open dropdown and resets interaction policy', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar11Block(page, staticServer.origin);

    const disclosure = page.locator('.rn11-disclosure');
    await page.locator('.rn11-disclosure > summary').click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(disclosure).not.toHaveAttribute('open', '');

    await page.locator('[data-rn11-root] .ren-nav-toggle').click();
    await page.locator('.rn11-disclosure > summary').click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(disclosure).not.toHaveAttribute('open', '');

    const summary = page.locator('.rn11-disclosure > summary');
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('[data-rn11-root] .ren-nav-brand').hover();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('JS-disabled mobile keeps the nav tree, actions, and native disclosure usable', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoNavbar11Block(page, staticServer.origin);

    await expect(page.locator('[data-rn11-root] .ren-nav-toggle')).toBeHidden();
    await expect(page.locator('#rn11-primary-links')).toBeVisible();
    await expect(
      page.locator('[data-rn11-root] .ren-nav-actions a, [data-rn11-root] .ren-nav-actions .ren-btn').first()
    ).toBeVisible();

    await page.locator('.rn11-disclosure > summary').click();
    await expect(page.locator('.rn11-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('a.rn11-dropdown-link')).toHaveCount(4);
    await expect(page.locator('.rn11-destination-icon')).toHaveCount(4);

    await context.close();
  });

  test('viewport geometry: compact desktop panel under bar, mobile in-flow, no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar11Block(page, staticServer.origin);
    await page.locator('.rn11-disclosure > summary').click();
    await expect(page.locator('.rn11-panel')).toBeVisible();

    const desktop = await page.evaluate(() => {
      const nav = document.querySelector('[data-rn11-root] .ren-nav');
      const panel = document.querySelector('.rn11-panel');
      if (!nav || !panel) return null;
      const navRect = nav.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      return {
        navBottom: navRect.bottom,
        panelTop: panelRect.top,
        panelPosition: getComputedStyle(panel).position,
        panelWidth: Math.round(panelRect.width),
      };
    });
    expect(desktop).toBeTruthy();
    expect(desktop.panelPosition).toBe('absolute');
    expect(desktop.panelTop).toBeGreaterThanOrEqual(desktop.navBottom - 1);
    expect(desktop.panelWidth, 'compact desktop panel near 20rem').toBeGreaterThanOrEqual(280);
    expect(desktop.panelWidth, 'compact desktop panel near 20rem').toBeLessThanOrEqual(360);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar11Block(page, staticServer.origin);
    await page.locator('[data-rn11-root] .ren-nav-toggle').click();
    await page.locator('.rn11-disclosure > summary').click();
    await expect(page.locator('.rn11-panel')).toBeVisible();

    const mobile = await page.evaluate(() => {
      const panel = document.querySelector('.rn11-panel');
      const links = document.querySelector('#rn11-primary-links');
      if (!panel || !links) return null;
      const panelRect = panel.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      return {
        position: getComputedStyle(panel).position,
        fullWidth: Math.abs(panelRect.width - linksRect.width) <= 8,
      };
    });
    expect(mobile).toBeTruthy();
    expect(['static', 'relative']).toContain(mobile.position);
    expect(mobile.fullWidth, 'mobile dropdown panel spans the nav tree width').toBe(true);
    await expectNoOverflow(page, 'html');
  });

  test('tablet shows destination descriptions; small mobile condenses rows', async ({ page }) => {
    // 834px is ≥48rem: desktop shell (no hamburger) with visible destination descriptions.
    await page.setViewportSize({ width: 834, height: 1112 });
    await gotoNavbar11Block(page, staticServer.origin);
    await expect(page.locator('[data-rn11-root] .ren-nav-toggle')).toBeHidden();
    await page.locator('.rn11-disclosure > summary').click();

    const tabletDesc = await page.evaluate(() => {
      const desc = Array.from(document.querySelectorAll('.rn11-dest-desc'));
      return desc.map((el) => {
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          display: style.display,
          visibility: style.visibility,
          height: rect.height,
        };
      });
    });
    expect(tabletDesc.length).toBe(4);
    for (const item of tabletDesc) {
      expect(item.display, JSON.stringify(item)).not.toBe('none');
      expect(item.visibility, JSON.stringify(item)).not.toBe('hidden');
      expect(item.height, JSON.stringify(item)).toBeGreaterThan(0);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar11Block(page, staticServer.origin);
    await page.locator('[data-rn11-root] .ren-nav-toggle').click();
    await page.locator('.rn11-disclosure > summary').click();

    const mobileDesc = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.rn11-dest-desc')).map((el) => {
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          display: style.display,
          visibility: style.visibility,
          height: rect.height,
        };
      });
    });
    expect(mobileDesc.length).toBe(4);
    const hiddenCount = mobileDesc.filter(
      (item) =>
        item.display === 'none'
        || item.visibility === 'hidden'
        || item.height === 0
    ).length;
    expect(hiddenCount, 'descriptions hidden on small mobile').toBeGreaterThanOrEqual(3);
  });

  test('desktop chrome: single chevron, neutral details, aligned top-level peers', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar11Block(page, staticServer.origin);

    await expectSingleVisibleAffordance(
      page,
      ['.rn11-disclosure summary .rn11-chevron'],
      'navbar11 desktop chevron'
    );

    const peerLinks = page.locator('#rn11-primary-links > li > a.ren-nav-link');
    await expect(peerLinks.first()).toBeVisible();
    await expect(page.locator('.rn11-disclosure > summary')).toBeVisible();

    const firstHref = await peerLinks.nth(0).getAttribute('href');
    const lastHref = await peerLinks.nth(2).getAttribute('href');
    expect(firstHref).toBeTruthy();
    expect(lastHref).toBeTruthy();
    await expectAligned(
      page,
      [
        `a.ren-nav-link[href="${firstHref}"]`,
        '.rn11-disclosure > summary',
        `a.ren-nav-link[href="${lastHref}"]`,
      ],
      'centerY',
      2
    );

    const detailsChrome = await inspectNativeChrome(page, '.rn11-disclosure');
    expect(detailsChrome.borderTopWidth === '0px', 'details outer border').toBeTruthy();
    expect(detailsChrome.marginTop).toBe('0px');
    expect(detailsChrome.paddingTop).toBe('0px');

    const summaryChrome = await inspectNativeChrome(page, '.rn11-disclosure > summary');
    const afterContent = String(summaryChrome.afterContent || 'none').replace(/['"]/g, '');
    const afterNeutralized =
      afterContent === 'none'
      || afterContent === ''
      || summaryChrome.afterDisplay === 'none';
    expect(afterNeutralized, 'classless summary::after must be neutralized').toBe(true);

    const markerContent = String(summaryChrome.markerContent || 'none').replace(/['"]/g, '');
    expect(
      markerContent === 'none' || markerContent === '' || summaryChrome.markerDisplay === 'none',
      'summary marker'
    ).toBeTruthy();

    await expect(page.locator('.rn11-disclosure summary .rn11-chevron')).toHaveCount(1);

    await page.locator('.rn11-disclosure > summary').click();
    await expect(page.locator('.rn11-disclosure')).toHaveAttribute('open', '');
    const openChrome = await page.evaluate(() => {
      const summary = document.querySelector('.rn11-disclosure > summary');
      if (!summary) return null;
      const ss = getComputedStyle(summary);
      return {
        marginBottom: ss.marginBottom,
        borderBottomWidth: ss.borderBottomWidth,
        borderBottomStyle: ss.borderBottomStyle,
      };
    });
    expect(openChrome).toBeTruthy();
    expect(openChrome.marginBottom).toBe('0px');
    expect(
      openChrome.borderBottomStyle === 'none' || openChrome.borderBottomWidth === '0px',
      'open summary divider'
    ).toBeTruthy();
  });

  test('mobile rows: full-width peers, one chevron, no overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar11Block(page, staticServer.origin);
    await page.locator('[data-rn11-root] .ren-nav-toggle').click();
    await page.locator('.rn11-disclosure > summary').click();
    await expect(page.locator('.rn11-panel')).toBeVisible();

    const firstPeer = page.locator('#rn11-primary-links > li > a.ren-nav-link').first();
    await expect(firstPeer).toBeVisible();
    const peerHref = await firstPeer.getAttribute('href');
    expect(peerHref).toBeTruthy();

    await expectWidthRatio(page, `a.ren-nav-link[href="${peerHref}"]`, '#rn11-primary-links', 0.92, 1.05);
    await expectWidthRatio(page, '.rn11-disclosure > summary', '#rn11-primary-links', 0.92, 1.05);
    await expectSingleVisibleAffordance(
      page,
      ['.rn11-disclosure summary .rn11-chevron'],
      'mobile navbar11 chevron'
    );
    await expectNoOverflow(page, 'html');
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoNavbar11Block(page, staticServer.origin);

    await page.locator('[data-rn11-root] .ren-nav-toggle').click();
    await page.locator('.rn11-disclosure > summary').click();

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-rn11-root]');
      if (!root) return [{ name: 'missing-root', width: 0, height: 0 }];

      const candidates = root.querySelectorAll(
        'a[href], button, summary, .ren-nav-toggle, a.rn11-dropdown-link'
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
    await gotoNavbar11Block(page, staticServer.origin);
    await page.locator('.rn11-disclosure > summary').click();

    const motion = await page.evaluate(() => {
      const selectors = ['.rn11-panel', '.rn11-chevron', 'a.rn11-dropdown-link', '.rn11-destination-icon'];
      return selectors.map((selector) => {
        const el = document.querySelector(selector);
        if (!el) return { selector, missing: true };
        const style = getComputedStyle(el);
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

  test('render-matrix marker counts hold across packet viewport states', async ({ page }) => {
    for (const state of RN11_RENDER_MATRIX.states) {
      if (!state.javaScript) continue;

      if (state.reducedMotion) {
        await page.emulateMedia({ reducedMotion: 'reduce' });
      } else {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
      }

      await page.setViewportSize(state.viewport);
      await gotoNavbar11Block(page, staticServer.origin);

      await page.evaluate((theme) => {
        document.documentElement.setAttribute('data-theme', theme);
      }, state.theme);

      for (const action of state.actions) {
        if (action.type === 'click') {
          await page.locator(action.selector).click();
        } else if (action.type === 'hover') {
          await page.locator(action.selector).hover();
        }
      }

      for (const [selector, count] of Object.entries(state.expectedMarkers)) {
        await expect(
          page.locator(selector),
          `${state.id} expects ${count}× ${selector}`
        ).toHaveCount(count);
      }
    }
  });

  test('navbar11 preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await gotoNavbar11Block(page, staticServer.origin);
    await injectAxe(page);
    await checkA11y(page, '[data-rn11-root]', {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    });
  });

  test('light and dark surfaces resolve through RenDS tokens', async ({ page }) => {
    await gotoNavbar11Block(page, staticServer.origin);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }, theme);

      const colors = await page.evaluate(() => {
        const surface = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim();
        const text = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
        const nav = document.querySelector('[data-rn11-root] .ren-nav');
        return {
          surface,
          text,
          navBg: nav ? getComputedStyle(nav).backgroundColor : '',
        };
      });

      expect(colors.surface, theme).toBeTruthy();
      expect(colors.text, theme).toBeTruthy();
      expect(colors.navBg, theme).not.toBe('');
      expect(colors.navBg, theme).not.toMatch(/rgba\(0,\s*0,\s*0,\s*0\)/);
    }
  });
});

/**
 * Navbar 12 — Logo-Left Menu-Right Grouped (nav-logo-left-menu-right-grouped).
 * Phase A RED: implementation file is intentionally absent; these tests must fail
 * specifically for missing anatomy / page, not for broken suite wiring.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoNavbar12Block(page, origin) {
  const response = await page.goto(`${origin}${LOGO_LEFT_MENU_RIGHT_GROUPED}`);
  expect(response, 'HTTP response for logo-left menu-right grouped block').toBeTruthy();
  expect(
    response.status(),
    'navbar12 block must not 404 — implement templates/blocks/nav-logo-left-menu-right-grouped.html'
  ).toBe(200);
  await expect(page.locator('[data-rn12-root]'), 'missing [data-rn12-root] shell').toHaveCount(1, {
    timeout: 2000,
  });
}

/** @type {{ version: number, path: string, root: string, states: Array<{ id: string, viewport: { width: number, height: number }, theme: string, javaScript: boolean, reducedMotion: boolean, actions: Array<{ type: string, selector: string }>, expectedMarkers: Record<string, number> }> }} */
const RN12_RENDER_MATRIX = JSON.parse(
  fs.readFileSync(
    path.join(PKG_ROOT, 'docs/workflows/relume-to-ren10/modules/navbar12/render-matrix.json'),
    'utf8'
  )
);

test.describe('Navbar Logo Left Menu Right Grouped (navbar12)', () => {
  /** @type {{ origin: string, close: () => Promise<void> }} */
  let staticServer;

  test.use({ actionTimeout: 3000, navigationTimeout: 10000 });
  test.describe.configure({ timeout: 20000 });

  test.beforeAll(async () => {
    staticServer = await startStaticServer();
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  test('block page loads with ren-nav shell and navbar12 root', async ({ page }) => {
    await gotoNavbar12Block(page, staticServer.origin);

    await expect(
      page.getByRole('heading', {
        name: /Logo.?Left Menu.?Right Grouped|Navbar 12|nav-logo-left-menu-right-grouped/i,
        level: 1,
      })
    ).toBeVisible();
    await expect(page.locator('ren-nav')).toHaveCount(1);
    await expect(page.locator('nav.ren-nav')).toHaveCount(1);
    await expect(page.locator('#rn12-primary-links')).toHaveCount(1);
    await expect(page.locator('[data-rn12-root] ul.ren-nav-links')).toHaveCount(1);
    await expect(page.locator('[data-rn12-root] nav')).toHaveCount(1);
    await expect(page.locator('nav nav')).toHaveCount(0);
  });

  test('exactly one primary links tree serves desktop and mobile', async ({ page }) => {
    await gotoNavbar12Block(page, staticServer.origin);
    await expect(page.locator('#rn12-primary-links')).toHaveCount(1);
    await expect(page.locator('[data-rn12-root] ul.ren-nav-links')).toHaveCount(1);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('#rn12-primary-links')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.locator('[data-rn12-root] .ren-nav-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rn12-primary-links')).toBeVisible();
    await expect(page.locator('[data-rn12-root] ul.ren-nav-links')).toHaveCount(1);
  });

  test('anatomy: one brand, four top entries, two groups, two labels, eight rich anchors, eight icons, two actions, one toggle, one chevron', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar12Block(page, staticServer.origin);

    await expect(page.locator('[data-rn12-root] .ren-nav-brand')).toHaveCount(1);

    await expect(page.locator('#rn12-primary-links > li')).toHaveCount(4);
    const topLevelLinks = page.locator('#rn12-primary-links > li > a.ren-nav-link');
    const dropdownSummaries = page.locator('#rn12-primary-links > li > .rn12-disclosure > summary');
    await expect(topLevelLinks).toHaveCount(3);
    await expect(dropdownSummaries).toHaveCount(1);

    await expect(
      page.locator('[data-rn12-root] .ren-nav-actions a, [data-rn12-root] .ren-nav-actions .ren-btn')
    ).toHaveCount(2);
    await expect(page.locator('[data-rn12-root] .ren-nav-toggle')).toHaveCount(1);

    await page.locator('.rn12-disclosure > summary').click();
    await expect(page.locator('.rn12-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rn12-panel')).toBeVisible();

    await expect(page.locator('.rn12-group')).toHaveCount(2);
    await expect(page.locator('.rn12-group-label')).toHaveCount(2);
    await expect(page.locator('a.rn12-destination.ren-row')).toHaveCount(8);
    await expect(page.locator('.rn12-destination-icon.ren-icon')).toHaveCount(8);
    await expect(page.locator('a.rn12-destination .ren-stack-xs')).toHaveCount(8);
    await expect(page.locator('.rn12-dest-title')).toHaveCount(8);
    await expect(page.locator('.rn12-dest-desc')).toHaveCount(8);

    for (let g = 0; g < 2; g += 1) {
      const group = page.locator('.rn12-group').nth(g);
      await expect(group.locator('.rn12-group-label')).toHaveCount(1);
      await expect(group.locator('a.rn12-destination.ren-row')).toHaveCount(4);
    }

    await expect(page.locator('.rmcg-card, .rmf-feature, .rmi-panel, .ren-card, .ren-menu, .ren-popover')).toHaveCount(0);

    await expectSingleVisibleAffordance(
      page,
      ['.rn12-disclosure summary .rn12-chevron'],
      'navbar12 dropdown chevron'
    );
    await expect(page.locator('.rn12-chevron')).toHaveCount(1);
  });

  test('rich grouped destinations are single anchors with coherent icon/title/description rows', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar12Block(page, staticServer.origin);
    await page.locator('.rn12-disclosure > summary').click();

    const links = page.locator('a.rn12-destination.ren-row');
    await expect(links).toHaveCount(8);

    for (let i = 0; i < 8; i += 1) {
      const link = links.nth(i);
      const tagName = await link.evaluate((el) => el.tagName);
      expect(tagName, `destination ${i} tag`).toBe('A');
      await expect(link).toHaveAttribute('href', /.+/);
      await expect(link.locator('.rn12-destination-icon.ren-icon')).toHaveCount(1);
      await expect(link.locator('.ren-stack-xs')).toHaveCount(1);
      await expect(link.locator('a[href], button, [role="button"]')).toHaveCount(0);
    }

    const firstHref = await links.nth(0).getAttribute('href');
    expect(firstHref).toBeTruthy();
    await expectAligned(
      page,
      [
        `a.rn12-destination[href="${firstHref}"] .rn12-destination-icon`,
        `a.rn12-destination[href="${firstHref}"] .rn12-dest-title`,
      ],
      'centerY',
      3
    );
  });

  test('summary opens by click, keyboard, and desktop pointer hover; click pins; Escape restores focus', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar12Block(page, staticServer.origin);

    const disclosure = page.locator('.rn12-disclosure');
    const summary = disclosure.locator('summary');
    const panel = page.locator('.rn12-panel');

    await expect(disclosure).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();
    await expect(page.locator('a.rn12-destination').first()).toBeVisible();

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
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');

    await page.locator('[data-rn12-root] .ren-nav-brand').hover();
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();

    await panel.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('a.rn12-destination').first()).toBeVisible();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('[data-rn12-root] .ren-nav-brand').hover();
    await expect(disclosure).toHaveAttribute('open', '');

    await summary.hover();
    await summary.click();
    await expect(disclosure).not.toHaveAttribute('open', '');
    await page.locator('[data-rn12-root] .ren-nav-brand').hover();
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('[data-rn12-root] .ren-nav-brand').hover();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('outside click and destination activation close the disclosure', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar12Block(page, staticServer.origin);

    const disclosure = page.locator('.rn12-disclosure');
    const summary = disclosure.locator('summary');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.locator('[data-rn12-root] .ren-nav-brand').click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('a.rn12-destination').first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('mobile toggle exposes the same tree and closes dropdown on menu close', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar12Block(page, staticServer.origin);

    const toggle = page.locator('[data-rn12-root] .ren-nav-toggle');
    const disclosure = page.locator('.rn12-disclosure');
    const summary = disclosure.locator('summary');

    await expect(toggle).toHaveAttribute('aria-label', /.+/);
    await expect(toggle).toHaveAttribute('aria-controls', 'rn12-primary-links');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rn12-primary-links')).toBeVisible();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('a.rn12-destination').first()).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('breakpoint crossing closes an open dropdown and resets interaction policy', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar12Block(page, staticServer.origin);

    const disclosure = page.locator('.rn12-disclosure');
    await page.locator('.rn12-disclosure > summary').click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(disclosure).not.toHaveAttribute('open', '');

    await page.locator('[data-rn12-root] .ren-nav-toggle').click();
    await page.locator('.rn12-disclosure > summary').click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(disclosure).not.toHaveAttribute('open', '');

    const summary = page.locator('.rn12-disclosure > summary');
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('[data-rn12-root] .ren-nav-brand').hover();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('JS-disabled mobile keeps the nav tree, actions, groups, and native disclosure usable', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoNavbar12Block(page, staticServer.origin);

    await expect(page.locator('[data-rn12-root] .ren-nav-toggle')).toBeHidden();
    await expect(page.locator('#rn12-primary-links')).toBeVisible();
    await expect(
      page.locator('[data-rn12-root] .ren-nav-actions a, [data-rn12-root] .ren-nav-actions .ren-btn').first()
    ).toBeVisible();

    await page.locator('.rn12-disclosure > summary').click();
    await expect(page.locator('.rn12-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rn12-group')).toHaveCount(2);
    await expect(page.locator('.rn12-group-label')).toHaveCount(2);
    await expect(page.locator('a.rn12-destination')).toHaveCount(8);
    await expect(page.locator('.rn12-destination-icon')).toHaveCount(8);

    await context.close();
  });

  test('viewport geometry: right-biased two-column desktop panel under bar, mobile one-column in-flow, no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar12Block(page, staticServer.origin);
    await page.locator('.rn12-disclosure > summary').click();
    await expect(page.locator('.rn12-panel')).toBeVisible();

    const desktop = await page.evaluate(() => {
      const nav = document.querySelector('[data-rn12-root] .ren-nav');
      const panel = document.querySelector('.rn12-panel');
      const groups = document.querySelector('.rn12-groups');
      if (!nav || !panel || !groups) return null;
      const navRect = nav.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const groupsStyle = getComputedStyle(groups);
      const groupEls = Array.from(document.querySelectorAll('.rn12-group'));
      const groupRects = groupEls.map((el) => el.getBoundingClientRect());
      return {
        navBottom: navRect.bottom,
        panelTop: panelRect.top,
        panelLeft: panelRect.left,
        panelRight: panelRect.right,
        navRight: navRect.right,
        panelPosition: getComputedStyle(panel).position,
        panelWidth: Math.round(panelRect.width),
        groupsDisplay: groupsStyle.display,
        groupsColumns: groupsStyle.gridTemplateColumns,
        groupCount: groupRects.length,
        groupsSideBySide:
          groupRects.length === 2
          && Math.abs(groupRects[0].top - groupRects[1].top) <= 8
          && groupRects[1].left > groupRects[0].right - 1,
      };
    });
    expect(desktop).toBeTruthy();
    expect(desktop.panelPosition).toBe('absolute');
    expect(desktop.panelTop).toBeGreaterThanOrEqual(desktop.navBottom - 1);
    expect(desktop.panelRight, 'right-biased panel hugs the menu end').toBeGreaterThanOrEqual(
      desktop.navRight - 24
    );
    expect(desktop.groupsDisplay, 'desktop groups use grid').toMatch(/grid/);
    expect(desktop.groupCount).toBe(2);
    expect(desktop.groupsSideBySide, 'desktop two equal group columns').toBe(true);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar12Block(page, staticServer.origin);
    await page.locator('[data-rn12-root] .ren-nav-toggle').click();
    await page.locator('.rn12-disclosure > summary').click();
    await expect(page.locator('.rn12-panel')).toBeVisible();

    const mobile = await page.evaluate(() => {
      const panel = document.querySelector('.rn12-panel');
      const links = document.querySelector('#rn12-primary-links');
      const groups = document.querySelector('.rn12-groups');
      if (!panel || !links || !groups) return null;
      const panelRect = panel.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      const groupEls = Array.from(document.querySelectorAll('.rn12-group'));
      const groupRects = groupEls.map((el) => el.getBoundingClientRect());
      return {
        position: getComputedStyle(panel).position,
        fullWidth: Math.abs(panelRect.width - linksRect.width) <= 8,
        oneColumn:
          groupRects.length === 2
          && groupRects[1].top >= groupRects[0].bottom - 1
          && Math.abs(groupRects[0].left - groupRects[1].left) <= 8,
      };
    });
    expect(mobile).toBeTruthy();
    expect(['static', 'relative']).toContain(mobile.position);
    expect(mobile.fullWidth, 'mobile dropdown panel spans the nav tree width').toBe(true);
    expect(mobile.oneColumn, 'mobile groups stack as one column').toBe(true);
    await expectNoOverflow(page, 'html');
  });

  test('tablet shows two groups with descriptions; small mobile condenses rows', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1112 });
    await gotoNavbar12Block(page, staticServer.origin);
    await expect(page.locator('[data-rn12-root] .ren-nav-toggle')).toBeHidden();
    await page.locator('.rn12-disclosure > summary').click();

    const tablet = await page.evaluate(() => {
      const groupEls = Array.from(document.querySelectorAll('.rn12-group'));
      const groupRects = groupEls.map((el) => el.getBoundingClientRect());
      const desc = Array.from(document.querySelectorAll('.rn12-dest-desc'));
      return {
        groupCount: groupRects.length,
        groupsSideBySide:
          groupRects.length === 2
          && Math.abs(groupRects[0].top - groupRects[1].top) <= 8
          && groupRects[1].left > groupRects[0].right - 1,
        desc: desc.map((el) => {
          const style = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return {
            display: style.display,
            visibility: style.visibility,
            height: rect.height,
          };
        }),
      };
    });
    expect(tablet.groupCount).toBe(2);
    expect(tablet.groupsSideBySide, 'tablet two coherent group columns').toBe(true);
    expect(tablet.desc.length).toBe(8);
    for (const item of tablet.desc) {
      expect(item.display, JSON.stringify(item)).not.toBe('none');
      expect(item.visibility, JSON.stringify(item)).not.toBe('hidden');
      expect(item.height, JSON.stringify(item)).toBeGreaterThan(0);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar12Block(page, staticServer.origin);
    await page.locator('[data-rn12-root] .ren-nav-toggle').click();
    await page.locator('.rn12-disclosure > summary').click();

    const mobileDesc = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.rn12-dest-desc')).map((el) => {
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          display: style.display,
          visibility: style.visibility,
          height: rect.height,
        };
      });
    });
    expect(mobileDesc.length).toBe(8);
    const hiddenCount = mobileDesc.filter(
      (item) =>
        item.display === 'none'
        || item.visibility === 'hidden'
        || item.height === 0
    ).length;
    expect(hiddenCount, 'descriptions hidden on small mobile').toBeGreaterThanOrEqual(6);
  });

  test('desktop chrome: single chevron, neutral details, aligned top-level peers', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar12Block(page, staticServer.origin);

    await expectSingleVisibleAffordance(
      page,
      ['.rn12-disclosure summary .rn12-chevron'],
      'navbar12 desktop chevron'
    );

    const peerLinks = page.locator('#rn12-primary-links > li > a.ren-nav-link');
    await expect(peerLinks.first()).toBeVisible();
    await expect(page.locator('.rn12-disclosure > summary')).toBeVisible();

    const firstHref = await peerLinks.nth(0).getAttribute('href');
    const lastHref = await peerLinks.nth(2).getAttribute('href');
    expect(firstHref).toBeTruthy();
    expect(lastHref).toBeTruthy();
    await expectAligned(
      page,
      [
        `a.ren-nav-link[href="${firstHref}"]`,
        '.rn12-disclosure > summary',
        `a.ren-nav-link[href="${lastHref}"]`,
      ],
      'centerY',
      2
    );

    const detailsChrome = await inspectNativeChrome(page, '.rn12-disclosure');
    expect(detailsChrome.borderTopWidth === '0px', 'details outer border').toBeTruthy();
    expect(detailsChrome.marginTop).toBe('0px');
    expect(detailsChrome.paddingTop).toBe('0px');

    const summaryChrome = await inspectNativeChrome(page, '.rn12-disclosure > summary');
    const afterContent = String(summaryChrome.afterContent || 'none').replace(/['"]/g, '');
    const afterNeutralized =
      afterContent === 'none'
      || afterContent === ''
      || summaryChrome.afterDisplay === 'none';
    expect(afterNeutralized, 'classless summary::after must be neutralized').toBe(true);

    const markerContent = String(summaryChrome.markerContent || 'none').replace(/['"]/g, '');
    expect(
      markerContent === 'none' || markerContent === '' || summaryChrome.markerDisplay === 'none',
      'summary marker'
    ).toBeTruthy();

    await expect(page.locator('.rn12-disclosure summary .rn12-chevron')).toHaveCount(1);

    await page.locator('.rn12-disclosure > summary').click();
    await expect(page.locator('.rn12-disclosure')).toHaveAttribute('open', '');
    const openChrome = await page.evaluate(() => {
      const summary = document.querySelector('.rn12-disclosure > summary');
      if (!summary) return null;
      const ss = getComputedStyle(summary);
      return {
        marginBottom: ss.marginBottom,
        borderBottomWidth: ss.borderBottomWidth,
        borderBottomStyle: ss.borderBottomStyle,
      };
    });
    expect(openChrome).toBeTruthy();
    expect(openChrome.marginBottom).toBe('0px');
    expect(
      openChrome.borderBottomStyle === 'none' || openChrome.borderBottomWidth === '0px',
      'open summary divider'
    ).toBeTruthy();
  });

  test('mobile rows: full-width peers, one chevron, no overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar12Block(page, staticServer.origin);
    await page.locator('[data-rn12-root] .ren-nav-toggle').click();
    await page.locator('.rn12-disclosure > summary').click();
    await expect(page.locator('.rn12-panel')).toBeVisible();

    const firstPeer = page.locator('#rn12-primary-links > li > a.ren-nav-link').first();
    await expect(firstPeer).toBeVisible();
    const peerHref = await firstPeer.getAttribute('href');
    expect(peerHref).toBeTruthy();

    await expectWidthRatio(page, `a.ren-nav-link[href="${peerHref}"]`, '#rn12-primary-links', 0.92, 1.05);
    await expectWidthRatio(page, '.rn12-disclosure > summary', '#rn12-primary-links', 0.92, 1.05);
    await expectSingleVisibleAffordance(
      page,
      ['.rn12-disclosure summary .rn12-chevron'],
      'mobile navbar12 chevron'
    );
    await expectNoOverflow(page, 'html');
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoNavbar12Block(page, staticServer.origin);

    await page.locator('[data-rn12-root] .ren-nav-toggle').click();
    await page.locator('.rn12-disclosure > summary').click();

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-rn12-root]');
      if (!root) return [{ name: 'missing-root', width: 0, height: 0 }];

      const candidates = root.querySelectorAll(
        'a[href], button, summary, .ren-nav-toggle, a.rn12-destination'
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
    await gotoNavbar12Block(page, staticServer.origin);
    await page.locator('.rn12-disclosure > summary').click();

    const motion = await page.evaluate(() => {
      const selectors = ['.rn12-panel', '.rn12-chevron', 'a.rn12-destination', '.rn12-destination-icon'];
      return selectors.map((selector) => {
        const el = document.querySelector(selector);
        if (!el) return { selector, missing: true };
        const style = getComputedStyle(el);
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

  test('render-matrix marker counts hold across packet viewport states', async ({ page }) => {
    for (const state of RN12_RENDER_MATRIX.states) {
      if (!state.javaScript) continue;

      if (state.reducedMotion) {
        await page.emulateMedia({ reducedMotion: 'reduce' });
      } else {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
      }

      await page.setViewportSize(state.viewport);
      await gotoNavbar12Block(page, staticServer.origin);

      await page.evaluate((theme) => {
        document.documentElement.setAttribute('data-theme', theme);
      }, state.theme);

      for (const action of state.actions) {
        if (action.type === 'click') {
          await page.locator(action.selector).click();
        } else if (action.type === 'hover') {
          await page.locator(action.selector).hover();
        }
      }

      for (const [selector, count] of Object.entries(state.expectedMarkers)) {
        await expect(
          page.locator(selector),
          `${state.id} expects ${count}× ${selector}`
        ).toHaveCount(count);
      }
    }
  });

  test('navbar12 preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await gotoNavbar12Block(page, staticServer.origin);
    await injectAxe(page);
    await checkA11y(page, '[data-rn12-root]', {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    });
  });

  test('light and dark surfaces resolve through RenDS tokens', async ({ page }) => {
    await gotoNavbar12Block(page, staticServer.origin);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }, theme);

      const colors = await page.evaluate(() => {
        const surface = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim();
        const text = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
        const nav = document.querySelector('[data-rn12-root] .ren-nav');
        return {
          surface,
          text,
          navBg: nav ? getComputedStyle(nav).backgroundColor : '',
        };
      });

      expect(colors.surface, theme).toBeTruthy();
      expect(colors.text, theme).toBeTruthy();
      expect(colors.navBg, theme).not.toBe('');
      expect(colors.navBg, theme).not.toMatch(/rgba\(0,\s*0,\s*0,\s*0\)/);
    }
  });
});

/**
 * Navbar 13 — Logo-Left Menu-Center Dropdown (nav-logo-left-menu-center-dropdown).
 * Phase A RED: implementation file is intentionally absent; these tests must fail
 * specifically for missing anatomy / page, not for broken suite wiring.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoNavbar13Block(page, origin) {
  const response = await page.goto(`${origin}${LOGO_LEFT_MENU_CENTER_DROPDOWN}`);
  expect(response, 'HTTP response for logo-left menu-center dropdown block').toBeTruthy();
  expect(
    response.status(),
    'navbar13 block must not 404 — implement templates/blocks/nav-logo-left-menu-center-dropdown.html'
  ).toBe(200);
  await expect(page.locator('[data-rn13-root]'), 'missing [data-rn13-root] shell').toHaveCount(1, {
    timeout: 2000,
  });
}

/** @type {{ version: number, path: string, root: string, states: Array<{ id: string, viewport: { width: number, height: number }, theme: string, javaScript: boolean, reducedMotion: boolean, actions: Array<{ type: string, selector: string }>, expectedMarkers: Record<string, number> }> }} */
const RN13_RENDER_MATRIX = JSON.parse(
  fs.readFileSync(
    path.join(PKG_ROOT, 'docs/workflows/relume-to-ren10/modules/navbar13/render-matrix.json'),
    'utf8'
  )
);

test.describe('Navbar Logo Left Menu Center Dropdown (navbar13)', () => {
  /** @type {{ origin: string, close: () => Promise<void> }} */
  let staticServer;

  test.use({ actionTimeout: 3000, navigationTimeout: 10000 });
  test.describe.configure({ timeout: 20000 });

  test.beforeAll(async () => {
    staticServer = await startStaticServer();
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  test('block page loads with ren-nav shell and navbar13 root', async ({ page }) => {
    await gotoNavbar13Block(page, staticServer.origin);

    await expect(
      page.getByRole('heading', {
        name: /Logo.?Left Menu.?Center Dropdown|Navbar 13|nav-logo-left-menu-center-dropdown/i,
        level: 1,
      })
    ).toBeVisible();
    await expect(page.locator('ren-nav')).toHaveCount(1);
    await expect(page.locator('nav.ren-nav')).toHaveCount(1);
    await expect(page.locator('#rn13-primary-links')).toHaveCount(1);
    await expect(page.locator('[data-rn13-root] ul.ren-nav-links')).toHaveCount(1);
    await expect(page.locator('[data-rn13-root] nav')).toHaveCount(1);
    await expect(page.locator('nav nav')).toHaveCount(0);
  });

  test('exactly one primary links tree serves desktop and mobile', async ({ page }) => {
    await gotoNavbar13Block(page, staticServer.origin);
    await expect(page.locator('#rn13-primary-links')).toHaveCount(1);
    await expect(page.locator('[data-rn13-root] ul.ren-nav-links')).toHaveCount(1);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('#rn13-primary-links')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.locator('[data-rn13-root] .ren-nav-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rn13-primary-links')).toBeVisible();
    await expect(page.locator('[data-rn13-root] ul.ren-nav-links')).toHaveCount(1);
  });

  test('anatomy: one brand, four top entries, three title-only destinations, one action, one toggle, one chevron', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar13Block(page, staticServer.origin);

    await expect(page.locator('[data-rn13-root] .ren-nav-brand')).toHaveCount(1);

    await expect(page.locator('#rn13-primary-links > li')).toHaveCount(4);
    const topLevelLinks = page.locator('#rn13-primary-links > li > a.ren-nav-link');
    const dropdownSummaries = page.locator('#rn13-primary-links > li > .rn13-disclosure > summary');
    await expect(topLevelLinks).toHaveCount(3);
    await expect(dropdownSummaries).toHaveCount(1);

    await expect(
      page.locator('[data-rn13-root] .ren-nav-actions a, [data-rn13-root] .ren-nav-actions .ren-btn')
    ).toHaveCount(1);
    await expect(page.locator('[data-rn13-root] .ren-nav-actions a.ren-btn')).toHaveCount(1);
    await expect(page.locator('[data-rn13-root] .ren-nav-toggle')).toHaveCount(1);

    await page.locator('.rn13-disclosure > summary').click();
    await expect(page.locator('.rn13-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rn13-panel')).toBeVisible();

    await expect(page.locator('a.rn13-destination')).toHaveCount(3);
    await expect(page.locator('.rn13-destination-icon, .rn13-dest-desc, .rn13-group, .rn13-group-label')).toHaveCount(0);
    await expect(page.locator('a.rn13-destination .ren-icon, a.rn13-destination img, a.rn13-destination .ren-stack-xs')).toHaveCount(0);

    await expect(
      page.locator('.rmcg-card, .rmf-feature, .rmi-panel, .ren-card, .ren-menu, .ren-popover, ren-collapsible, .ren-collapsible')
    ).toHaveCount(0);

    await expectSingleVisibleAffordance(
      page,
      ['.rn13-disclosure summary .rn13-chevron'],
      'navbar13 dropdown chevron'
    );
    await expect(page.locator('.rn13-chevron')).toHaveCount(1);
  });

  test('title-only destinations are whole anchors without icons, groups, or descriptions', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar13Block(page, staticServer.origin);
    await page.locator('.rn13-disclosure > summary').click();

    const links = page.locator('a.rn13-destination');
    await expect(links).toHaveCount(3);

    for (let i = 0; i < 3; i += 1) {
      const link = links.nth(i);
      const tagName = await link.evaluate((el) => el.tagName);
      expect(tagName, `destination ${i} tag`).toBe('A');
      await expect(link).toHaveAttribute('href', /.+/);
      const text = (await link.innerText()).trim();
      expect(text.length, `destination ${i} title text`).toBeGreaterThan(0);
      await expect(link.locator('a[href], button, [role="button"], .ren-icon, img, p, small')).toHaveCount(0);
    }

    await expect(page.locator('.rn13-group, .rn13-group-label, .rn13-dest-desc, .rn13-destination-icon')).toHaveCount(0);
  });

  test('summary opens by click, keyboard, and desktop pointer hover; click pins; Escape restores focus', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar13Block(page, staticServer.origin);

    const disclosure = page.locator('.rn13-disclosure');
    const summary = disclosure.locator('summary');
    const panel = page.locator('.rn13-panel');

    await expect(disclosure).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();
    await expect(page.locator('a.rn13-destination').first()).toBeVisible();

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
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');

    await page.locator('[data-rn13-root] .ren-nav-brand').hover();
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();

    await panel.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('a.rn13-destination').first()).toBeVisible();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('[data-rn13-root] .ren-nav-brand').hover();
    await expect(disclosure).toHaveAttribute('open', '');

    await summary.hover();
    await summary.click();
    await expect(disclosure).not.toHaveAttribute('open', '');
    await page.locator('[data-rn13-root] .ren-nav-brand').hover();
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('[data-rn13-root] .ren-nav-brand').hover();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('outside click and destination activation close the disclosure', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar13Block(page, staticServer.origin);

    const disclosure = page.locator('.rn13-disclosure');
    const summary = disclosure.locator('summary');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.locator('[data-rn13-root] .ren-nav-brand').click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('a.rn13-destination').first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('mobile toggle exposes the same tree and closes dropdown on menu close', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar13Block(page, staticServer.origin);

    const toggle = page.locator('[data-rn13-root] .ren-nav-toggle');
    const disclosure = page.locator('.rn13-disclosure');
    const summary = disclosure.locator('summary');

    // Source hamburger is unnamed — Ren10 requires an accessible name + expanded/controls wiring.
    await expect(toggle).toHaveAttribute('aria-label', /.+/);
    await expect(toggle).toHaveAttribute('aria-controls', 'rn13-primary-links');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rn13-primary-links')).toBeVisible();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('a.rn13-destination').first()).toBeVisible();
    // Summary activation must not collapse the mobile tree.
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('breakpoint crossing closes an open dropdown and resets interaction policy', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar13Block(page, staticServer.origin);

    const disclosure = page.locator('.rn13-disclosure');
    await page.locator('.rn13-disclosure > summary').click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(disclosure).not.toHaveAttribute('open', '');

    await page.locator('[data-rn13-root] .ren-nav-toggle').click();
    await page.locator('.rn13-disclosure > summary').click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(disclosure).not.toHaveAttribute('open', '');

    const summary = page.locator('.rn13-disclosure > summary');
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('[data-rn13-root] .ren-nav-brand').hover();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('JS-disabled mobile keeps the nav tree, action, and native disclosure usable', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoNavbar13Block(page, staticServer.origin);

    await expect(page.locator('[data-rn13-root] .ren-nav-toggle')).toBeHidden();
    await expect(page.locator('#rn13-primary-links')).toBeVisible();
    await expect(
      page.locator('[data-rn13-root] .ren-nav-actions a, [data-rn13-root] .ren-nav-actions .ren-btn')
    ).toHaveCount(1);
    await expect(
      page.locator('[data-rn13-root] .ren-nav-actions a, [data-rn13-root] .ren-nav-actions .ren-btn').first()
    ).toBeVisible();

    await page.locator('.rn13-disclosure > summary').click();
    await expect(page.locator('.rn13-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('a.rn13-destination')).toHaveCount(3);
    await expect(page.locator('.rn13-destination-icon, .rn13-dest-desc, .rn13-group')).toHaveCount(0);

    await context.close();
  });

  test('viewport geometry: centered menu, narrow absolute desktop panel under bar, mobile in-flow, no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar13Block(page, staticServer.origin);

    const shell = await page.evaluate(() => {
      const nav = document.querySelector('[data-rn13-root] .ren-nav');
      const links = document.querySelector('#rn13-primary-links');
      const brand = document.querySelector('[data-rn13-root] .ren-nav-brand');
      const actions = document.querySelector('[data-rn13-root] .ren-nav-actions');
      if (!nav || !links || !brand || !actions) return null;
      const navRect = nav.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      const brandRect = brand.getBoundingClientRect();
      const actionsRect = actions.getBoundingClientRect();
      return {
        navCenterX: navRect.left + navRect.width / 2,
        linksCenterX: linksRect.left + linksRect.width / 2,
        brandWidth: brandRect.width,
        actionsWidth: actionsRect.width,
        brandRight: brandRect.right,
        linksLeft: linksRect.left,
        linksRight: linksRect.right,
        actionsLeft: actionsRect.left,
        sideBySide:
          Math.abs(brandRect.top - linksRect.top) <= 12
          && Math.abs(actionsRect.top - linksRect.top) <= 12
          && brandRect.right <= linksRect.left + 1
          && linksRect.right <= actionsRect.left + 1,
      };
    });
    expect(shell).toBeTruthy();
    expect(shell.sideBySide, 'desktop logo / centered menu / action share one row').toBe(true);
    expect(
      Math.abs(shell.linksCenterX - shell.navCenterX),
      'menu remains geometrically centered despite unequal side widths'
    ).toBeLessThanOrEqual(16);
    expect(
      Math.abs(shell.brandWidth - shell.actionsWidth),
      'side content widths are unequal so centering is not accidental'
    ).toBeGreaterThan(8);

    await page.locator('.rn13-disclosure > summary').click();
    await expect(page.locator('.rn13-panel')).toBeVisible();

    const desktop = await page.evaluate(() => {
      const nav = document.querySelector('[data-rn13-root] .ren-nav');
      const panel = document.querySelector('.rn13-panel');
      const summary = document.querySelector('.rn13-disclosure > summary');
      if (!nav || !panel || !summary) return null;
      const navRect = nav.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const summaryRect = summary.getBoundingClientRect();
      return {
        navBottom: navRect.bottom,
        panelTop: panelRect.top,
        panelPosition: getComputedStyle(panel).position,
        panelWidth: Math.round(panelRect.width),
        panelCenterX: panelRect.left + panelRect.width / 2,
        summaryCenterX: summaryRect.left + summaryRect.width / 2,
        overlapsBar: panelRect.top < navRect.bottom - 2 && panelRect.bottom > navRect.top + 2,
      };
    });
    expect(desktop).toBeTruthy();
    expect(desktop.panelPosition).toBe('absolute');
    expect(desktop.panelTop).toBeGreaterThanOrEqual(desktop.navBottom - 1);
    expect(desktop.overlapsBar, 'narrow dropdown must not cover the bar').toBe(false);
    expect(desktop.panelWidth, 'narrow title-only desktop panel').toBeGreaterThanOrEqual(120);
    expect(desktop.panelWidth, 'narrow title-only desktop panel').toBeLessThanOrEqual(280);
    expect(
      Math.abs(desktop.panelCenterX - desktop.summaryCenterX),
      'panel centered beneath its trigger'
    ).toBeLessThanOrEqual(24);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar13Block(page, staticServer.origin);
    await page.locator('[data-rn13-root] .ren-nav-toggle').click();
    await page.locator('.rn13-disclosure > summary').click();
    await expect(page.locator('.rn13-panel')).toBeVisible();

    const mobile = await page.evaluate(() => {
      const panel = document.querySelector('.rn13-panel');
      const links = document.querySelector('#rn13-primary-links');
      if (!panel || !links) return null;
      const panelRect = panel.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      return {
        position: getComputedStyle(panel).position,
        fullWidth: Math.abs(panelRect.width - linksRect.width) <= 8,
      };
    });
    expect(mobile).toBeTruthy();
    expect(['static', 'relative']).toContain(mobile.position);
    expect(mobile.fullWidth, 'mobile dropdown panel spans the nav tree width').toBe(true);
    await expectNoOverflow(page, 'html');
  });

  test('tablet uses desktop shell; mobile keeps action in the top row with stacked tree', async ({ page }) => {
    // 834px is ≥48rem: desktop shell (no hamburger), centered menu, one action.
    await page.setViewportSize({ width: 834, height: 1112 });
    await gotoNavbar13Block(page, staticServer.origin);
    await expect(page.locator('[data-rn13-root] .ren-nav-toggle')).toBeHidden();
    await expect(page.locator('#rn13-primary-links')).toBeVisible();
    await expect(
      page.locator('[data-rn13-root] .ren-nav-actions a, [data-rn13-root] .ren-nav-actions .ren-btn')
    ).toHaveCount(1);
    await page.locator('.rn13-disclosure > summary').click();
    await expect(page.locator('a.rn13-destination')).toHaveCount(3);
    await expect(page.locator('.rn13-dest-desc, .rn13-destination-icon, .rn13-group')).toHaveCount(0);

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar13Block(page, staticServer.origin);

    const topRow = await page.evaluate(() => {
      const brand = document.querySelector('[data-rn13-root] .ren-nav-brand');
      const actions = document.querySelector('[data-rn13-root] .ren-nav-actions');
      const toggle = document.querySelector('[data-rn13-root] .ren-nav-toggle');
      const links = document.querySelector('#rn13-primary-links');
      if (!brand || !actions || !toggle || !links) return null;
      const brandRect = brand.getBoundingClientRect();
      const actionsRect = actions.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      const linksStyle = getComputedStyle(links);
      return {
        brandTop: brandRect.top,
        actionsTop: actionsRect.top,
        toggleTop: toggleRect.top,
        actionVisible: actionsRect.width > 0 && actionsRect.height > 0 && getComputedStyle(actions).display !== 'none',
        toggleVisible: toggleRect.width > 0 && toggleRect.height > 0,
        linksBelowTopRow: linksRect.top >= Math.max(brandRect.bottom, actionsRect.bottom, toggleRect.bottom) - 4
          || linksStyle.display === 'none'
          || linksStyle.visibility === 'hidden',
      };
    });
    expect(topRow).toBeTruthy();
    expect(topRow.actionVisible, 'mobile action stays in the chrome row').toBe(true);
    expect(topRow.toggleVisible, 'mobile toggle is present in the chrome row').toBe(true);
    expect(Math.abs(topRow.brandTop - topRow.actionsTop), 'brand and action share top row').toBeLessThanOrEqual(12);
    expect(Math.abs(topRow.brandTop - topRow.toggleTop), 'brand and toggle share top row').toBeLessThanOrEqual(12);
    expect(topRow.linksBelowTopRow, 'navigation tree is not inlined into the top row when closed').toBe(true);

    await page.locator('[data-rn13-root] .ren-nav-toggle').click();
    await expect(page.locator('#rn13-primary-links')).toBeVisible();
    const opened = await page.evaluate(() => {
      const brand = document.querySelector('[data-rn13-root] .ren-nav-brand');
      const actions = document.querySelector('[data-rn13-root] .ren-nav-actions');
      const toggle = document.querySelector('[data-rn13-root] .ren-nav-toggle');
      const links = document.querySelector('#rn13-primary-links');
      if (!brand || !actions || !toggle || !links) return null;
      const brandRect = brand.getBoundingClientRect();
      const actionsRect = actions.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      return {
        actionStillTop: Math.abs(brandRect.top - actionsRect.top) <= 12,
        toggleStillTop: Math.abs(brandRect.top - toggleRect.top) <= 12,
        linksBelow: linksRect.top >= Math.max(brandRect.bottom, actionsRect.bottom, toggleRect.bottom) - 4,
      };
    });
    expect(opened).toBeTruthy();
    expect(opened.actionStillTop, 'opened mobile keeps action in top row').toBe(true);
    expect(opened.toggleStillTop, 'opened mobile keeps toggle in top row').toBe(true);
    expect(opened.linksBelow, 'opened mobile stacks the tree under the top row').toBe(true);
  });

  test('desktop chrome: single chevron, neutral details, aligned top-level peers', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar13Block(page, staticServer.origin);

    await expectSingleVisibleAffordance(
      page,
      ['.rn13-disclosure summary .rn13-chevron'],
      'navbar13 desktop chevron'
    );

    const peerLinks = page.locator('#rn13-primary-links > li > a.ren-nav-link');
    await expect(peerLinks.first()).toBeVisible();
    await expect(page.locator('.rn13-disclosure > summary')).toBeVisible();

    const firstHref = await peerLinks.nth(0).getAttribute('href');
    const lastHref = await peerLinks.nth(2).getAttribute('href');
    expect(firstHref).toBeTruthy();
    expect(lastHref).toBeTruthy();
    await expectAligned(
      page,
      [
        `a.ren-nav-link[href="${firstHref}"]`,
        '.rn13-disclosure > summary',
        `a.ren-nav-link[href="${lastHref}"]`,
      ],
      'centerY',
      2
    );

    const detailsChrome = await inspectNativeChrome(page, '.rn13-disclosure');
    expect(detailsChrome.borderTopWidth === '0px', 'details outer border').toBeTruthy();
    expect(detailsChrome.marginTop).toBe('0px');
    expect(detailsChrome.paddingTop).toBe('0px');

    const summaryChrome = await inspectNativeChrome(page, '.rn13-disclosure > summary');
    const afterContent = String(summaryChrome.afterContent || 'none').replace(/['"]/g, '');
    const afterNeutralized =
      afterContent === 'none'
      || afterContent === ''
      || summaryChrome.afterDisplay === 'none';
    expect(afterNeutralized, 'classless summary::after must be neutralized').toBe(true);

    const markerContent = String(summaryChrome.markerContent || 'none').replace(/['"]/g, '');
    expect(
      markerContent === 'none' || markerContent === '' || summaryChrome.markerDisplay === 'none',
      'summary marker'
    ).toBeTruthy();

    await expect(page.locator('.rn13-disclosure summary .rn13-chevron')).toHaveCount(1);

    await page.locator('.rn13-disclosure > summary').click();
    await expect(page.locator('.rn13-disclosure')).toHaveAttribute('open', '');
    const openChrome = await page.evaluate(() => {
      const summary = document.querySelector('.rn13-disclosure > summary');
      if (!summary) return null;
      const ss = getComputedStyle(summary);
      return {
        marginBottom: ss.marginBottom,
        borderBottomWidth: ss.borderBottomWidth,
        borderBottomStyle: ss.borderBottomStyle,
      };
    });
    expect(openChrome).toBeTruthy();
    expect(openChrome.marginBottom).toBe('0px');
    expect(
      openChrome.borderBottomStyle === 'none' || openChrome.borderBottomWidth === '0px',
      'open summary divider'
    ).toBeTruthy();
  });

  test('mobile rows: full-width peers, one chevron, no overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar13Block(page, staticServer.origin);
    await page.locator('[data-rn13-root] .ren-nav-toggle').click();
    await page.locator('.rn13-disclosure > summary').click();
    await expect(page.locator('.rn13-panel')).toBeVisible();

    const firstPeer = page.locator('#rn13-primary-links > li > a.ren-nav-link').first();
    await expect(firstPeer).toBeVisible();
    const peerHref = await firstPeer.getAttribute('href');
    expect(peerHref).toBeTruthy();

    await expectWidthRatio(page, `a.ren-nav-link[href="${peerHref}"]`, '#rn13-primary-links', 0.92, 1.05);
    await expectWidthRatio(page, '.rn13-disclosure > summary', '#rn13-primary-links', 0.92, 1.05);
    await expectSingleVisibleAffordance(
      page,
      ['.rn13-disclosure summary .rn13-chevron'],
      'mobile navbar13 chevron'
    );
    await expectNoOverflow(page, 'html');
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoNavbar13Block(page, staticServer.origin);

    await page.locator('[data-rn13-root] .ren-nav-toggle').click();
    await page.locator('.rn13-disclosure > summary').click();

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-rn13-root]');
      if (!root) return [{ name: 'missing-root', width: 0, height: 0 }];

      const candidates = root.querySelectorAll(
        'a[href], button, summary, .ren-nav-toggle, a.rn13-destination'
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
    await gotoNavbar13Block(page, staticServer.origin);
    await page.locator('.rn13-disclosure > summary').click();

    const motion = await page.evaluate(() => {
      const selectors = ['.rn13-panel', '.rn13-chevron', 'a.rn13-destination'];
      return selectors.map((selector) => {
        const el = document.querySelector(selector);
        if (!el) return { selector, missing: true };
        const style = getComputedStyle(el);
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

  test('render-matrix marker counts hold across packet viewport states', async ({ page }) => {
    for (const state of RN13_RENDER_MATRIX.states) {
      if (!state.javaScript) continue;

      if (state.reducedMotion) {
        await page.emulateMedia({ reducedMotion: 'reduce' });
      } else {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
      }

      await page.setViewportSize(state.viewport);
      await gotoNavbar13Block(page, staticServer.origin);

      await page.evaluate((theme) => {
        document.documentElement.setAttribute('data-theme', theme);
      }, state.theme);

      for (const action of state.actions) {
        if (action.type === 'click') {
          await page.locator(action.selector).click();
        } else if (action.type === 'hover') {
          await page.locator(action.selector).hover();
        }
      }

      for (const [selector, count] of Object.entries(state.expectedMarkers)) {
        await expect(
          page.locator(selector),
          `${state.id} expects ${count}× ${selector}`
        ).toHaveCount(count);
      }
    }
  });

  test('navbar13 preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await gotoNavbar13Block(page, staticServer.origin);
    await injectAxe(page);
    await checkA11y(page, '[data-rn13-root]', {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    });
  });

  test('light and dark surfaces resolve through RenDS tokens', async ({ page }) => {
    await gotoNavbar13Block(page, staticServer.origin);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }, theme);

      const colors = await page.evaluate(() => {
        const surface = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim();
        const text = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
        const nav = document.querySelector('[data-rn13-root] .ren-nav');
        return {
          surface,
          text,
          navBg: nav ? getComputedStyle(nav).backgroundColor : '',
        };
      });

      expect(colors.surface, theme).toBeTruthy();
      expect(colors.text, theme).toBeTruthy();
      expect(colors.navBg, theme).not.toBe('');
      expect(colors.navBg, theme).not.toMatch(/rgba\(0,\s*0,\s*0,\s*0\)/);
    }
  });
});

/**
 * Navbar 14 — Floating Logo-Left Menu-Right Actions (nav-floating-logo-left-menu-right-actions).
 * Phase A RED: implementation file is intentionally absent; these tests must fail
 * specifically for missing anatomy / page, not for broken suite wiring.
 *
 * Defining differences from Navbar 13: end-aligned menu (not centered), two actions
 * (secondary + primary) owned by the collapsible panel (not permanent top-row chrome).
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoNavbar14Block(page, origin) {
  const response = await page.goto(`${origin}${FLOATING_LOGO_LEFT_MENU_RIGHT_ACTIONS}`);
  expect(response, 'HTTP response for floating logo-left menu-right actions block').toBeTruthy();
  expect(
    response.status(),
    'navbar14 block must not 404 — implement templates/blocks/nav-floating-logo-left-menu-right-actions.html'
  ).toBe(200);
  await expect(page.locator('[data-rn14-root]'), 'missing [data-rn14-root] shell').toHaveCount(1, {
    timeout: 2000,
  });
}

/** @type {{ version: number, path: string, root: string, states: Array<{ id: string, viewport: { width: number, height: number }, theme: string, javaScript: boolean, reducedMotion: boolean, actions: Array<{ type: string, selector: string }>, expectedMarkers: Record<string, number> }> }} */
const RN14_RENDER_MATRIX = JSON.parse(
  fs.readFileSync(
    path.join(PKG_ROOT, 'docs/workflows/relume-to-ren10/modules/navbar14/render-matrix.json'),
    'utf8'
  )
);

test.describe('Navbar Floating Logo Left Menu Right Actions (navbar14)', () => {
  /** @type {{ origin: string, close: () => Promise<void> }} */
  let staticServer;

  test.use({ actionTimeout: 3000, navigationTimeout: 10000 });
  test.describe.configure({ timeout: 20000 });

  test.beforeAll(async () => {
    staticServer = await startStaticServer();
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  test('block page loads with ren-nav shell and navbar14 root', async ({ page }) => {
    await gotoNavbar14Block(page, staticServer.origin);

    await expect(
      page.getByRole('heading', {
        name: /Floating Logo.?Left Menu.?Right Actions|Navbar 14|nav-floating-logo-left-menu-right-actions/i,
        level: 1,
      })
    ).toBeVisible();
    await expect(page.locator('ren-nav')).toHaveCount(1);
    await expect(page.locator('nav.ren-nav')).toHaveCount(1);
    await expect(page.locator('#rn14-primary-links')).toHaveCount(1);
    await expect(page.locator('[data-rn14-root] ul.ren-nav-links')).toHaveCount(1);
    await expect(page.locator('[data-rn14-root] nav')).toHaveCount(1);
    await expect(page.locator('nav nav')).toHaveCount(0);
  });

  test('exactly one primary links tree serves desktop and mobile', async ({ page }) => {
    await gotoNavbar14Block(page, staticServer.origin);
    await expect(page.locator('#rn14-primary-links')).toHaveCount(1);
    await expect(page.locator('[data-rn14-root] ul.ren-nav-links')).toHaveCount(1);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('#rn14-primary-links')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.locator('[data-rn14-root] .ren-nav-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rn14-primary-links')).toBeVisible();
    await expect(page.locator('[data-rn14-root] ul.ren-nav-links')).toHaveCount(1);
  });

  test('anatomy: one brand, four top entries, three title-only destinations, two actions, one toggle, one chevron', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar14Block(page, staticServer.origin);

    await expect(page.locator('[data-rn14-root] .ren-nav-brand')).toHaveCount(1);

    await expect(page.locator('#rn14-primary-links > li')).toHaveCount(4);
    const topLevelLinks = page.locator('#rn14-primary-links > li > a.ren-nav-link');
    const dropdownSummaries = page.locator('#rn14-primary-links > li > .rn14-disclosure > summary');
    await expect(topLevelLinks).toHaveCount(3);
    await expect(dropdownSummaries).toHaveCount(1);

    await expect(
      page.locator('[data-rn14-root] .ren-nav-actions a, [data-rn14-root] .ren-nav-actions .ren-btn')
    ).toHaveCount(2);
    await expect(page.locator('[data-rn14-root] .ren-nav-actions a.ren-btn')).toHaveCount(2);
    await expect(page.locator('[data-rn14-root] .ren-nav-actions .ren-btn-secondary')).toHaveCount(1);
    await expect(page.locator('[data-rn14-root] .ren-nav-actions .ren-btn-primary')).toHaveCount(1);
    await expect(page.locator('[data-rn14-root] .ren-nav-toggle')).toHaveCount(1);

    await page.locator('.rn14-disclosure > summary').click();
    await expect(page.locator('.rn14-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rn14-panel')).toBeVisible();

    await expect(page.locator('a.rn14-destination')).toHaveCount(3);
    await expect(page.locator('.rn14-destination-icon, .rn14-dest-desc, .rn14-group, .rn14-group-label')).toHaveCount(0);
    await expect(page.locator('a.rn14-destination .ren-icon, a.rn14-destination img, a.rn14-destination .ren-stack-xs')).toHaveCount(0);

    await expect(
      page.locator('.rmcg-card, .rmf-feature, .rmi-panel, .ren-card, .ren-menu, .ren-popover, ren-collapsible, .ren-collapsible')
    ).toHaveCount(0);

    await expectSingleVisibleAffordance(
      page,
      ['.rn14-disclosure summary .rn14-chevron'],
      'navbar14 dropdown chevron'
    );
    await expect(page.locator('.rn14-chevron')).toHaveCount(1);
  });

  test('title-only destinations are whole anchors without icons, groups, or descriptions', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar14Block(page, staticServer.origin);
    await page.locator('.rn14-disclosure > summary').click();

    const links = page.locator('a.rn14-destination');
    await expect(links).toHaveCount(3);

    for (let i = 0; i < 3; i += 1) {
      const link = links.nth(i);
      const tagName = await link.evaluate((el) => el.tagName);
      expect(tagName, `destination ${i} tag`).toBe('A');
      await expect(link).toHaveAttribute('href', /.+/);
      const text = (await link.innerText()).trim();
      expect(text.length, `destination ${i} title text`).toBeGreaterThan(0);
      await expect(link.locator('a[href], button, [role="button"], .ren-icon, img, p, small')).toHaveCount(0);
    }

    await expect(page.locator('.rn14-group, .rn14-group-label, .rn14-dest-desc, .rn14-destination-icon')).toHaveCount(0);
  });

  test('summary opens by click, keyboard, and desktop pointer hover; click pins; Escape restores focus', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar14Block(page, staticServer.origin);

    const disclosure = page.locator('.rn14-disclosure');
    const summary = disclosure.locator('summary');
    const panel = page.locator('.rn14-panel');

    await expect(disclosure).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();
    await expect(page.locator('a.rn14-destination').first()).toBeVisible();

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
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');

    await page.locator('[data-rn14-root] .ren-nav-brand').hover();
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();

    await panel.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('a.rn14-destination').first()).toBeVisible();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('[data-rn14-root] .ren-nav-brand').hover();
    await expect(disclosure).toHaveAttribute('open', '');

    await summary.hover();
    await summary.click();
    await expect(disclosure).not.toHaveAttribute('open', '');
    await page.locator('[data-rn14-root] .ren-nav-brand').hover();
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('[data-rn14-root] .ren-nav-brand').hover();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('outside click and destination activation close the disclosure', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar14Block(page, staticServer.origin);

    const disclosure = page.locator('.rn14-disclosure');
    const summary = disclosure.locator('summary');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.locator('[data-rn14-root] .ren-nav-brand').click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('a.rn14-destination').first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('mobile toggle exposes the same tree and closes dropdown on menu close', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar14Block(page, staticServer.origin);

    const toggle = page.locator('[data-rn14-root] .ren-nav-toggle');
    const disclosure = page.locator('.rn14-disclosure');
    const summary = disclosure.locator('summary');

    // Source hamburger is unnamed — Ren10 requires an accessible name + expanded/controls wiring.
    await expect(toggle).toHaveAttribute('aria-label', /.+/);
    await expect(toggle).toHaveAttribute('aria-controls', 'rn14-primary-links');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rn14-primary-links')).toBeVisible();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('a.rn14-destination').first()).toBeVisible();
    // Summary activation must not collapse the mobile tree.
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('breakpoint crossing closes an open dropdown and resets interaction policy', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar14Block(page, staticServer.origin);

    const disclosure = page.locator('.rn14-disclosure');
    await page.locator('.rn14-disclosure > summary').click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(disclosure).not.toHaveAttribute('open', '');

    await page.locator('[data-rn14-root] .ren-nav-toggle').click();
    await page.locator('.rn14-disclosure > summary').click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(disclosure).not.toHaveAttribute('open', '');

    const summary = page.locator('.rn14-disclosure > summary');
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('[data-rn14-root] .ren-nav-brand').hover();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('JS-disabled mobile keeps the nav tree, both actions, and native disclosure usable', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoNavbar14Block(page, staticServer.origin);

    await expect(page.locator('[data-rn14-root] .ren-nav-toggle')).toBeHidden();
    await expect(page.locator('#rn14-primary-links')).toBeVisible();
    await expect(
      page.locator('[data-rn14-root] .ren-nav-actions a, [data-rn14-root] .ren-nav-actions .ren-btn')
    ).toHaveCount(2);
    await expect(
      page.locator('[data-rn14-root] .ren-nav-actions a, [data-rn14-root] .ren-nav-actions .ren-btn').nth(0)
    ).toBeVisible();
    await expect(
      page.locator('[data-rn14-root] .ren-nav-actions a, [data-rn14-root] .ren-nav-actions .ren-btn').nth(1)
    ).toBeVisible();

    await page.locator('.rn14-disclosure > summary').click();
    await expect(page.locator('.rn14-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('a.rn14-destination')).toHaveCount(3);
    await expect(page.locator('.rn14-destination-icon, .rn14-dest-desc, .rn14-group')).toHaveCount(0);

    await context.close();
  });

  test('viewport geometry: end-aligned menu + actions, narrow absolute desktop panel under bar, mobile in-flow, no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar14Block(page, staticServer.origin);

    const shell = await page.evaluate(() => {
      const nav = document.querySelector('[data-rn14-root] .ren-nav');
      const links = document.querySelector('#rn14-primary-links');
      const brand = document.querySelector('[data-rn14-root] .ren-nav-brand');
      const actions = document.querySelector('[data-rn14-root] .ren-nav-actions');
      if (!nav || !links || !brand || !actions) return null;
      const navRect = nav.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      const brandRect = brand.getBoundingClientRect();
      const actionsRect = actions.getBoundingClientRect();
      return {
        navCenterX: navRect.left + navRect.width / 2,
        navRight: navRect.right,
        navLeft: navRect.left,
        linksCenterX: linksRect.left + linksRect.width / 2,
        brandLeft: brandRect.left,
        brandRight: brandRect.right,
        linksLeft: linksRect.left,
        linksRight: linksRect.right,
        actionsLeft: actionsRect.left,
        actionsRight: actionsRect.right,
        sideBySide:
          Math.abs(brandRect.top - linksRect.top) <= 12
          && Math.abs(actionsRect.top - linksRect.top) <= 12
          && brandRect.right <= linksRect.left + 1
          && linksRect.right <= actionsRect.left + 1,
      };
    });
    expect(shell).toBeTruthy();
    expect(shell.sideBySide, 'desktop logo / end-aligned menu / two actions share one row').toBe(true);
    expect(
      shell.linksCenterX - shell.navCenterX,
      'menu cluster sits end-side of center (not geometrically centered like navbar13)'
    ).toBeGreaterThan(16);
    expect(
      shell.navRight - shell.actionsRight,
      'actions hug the floating shell end'
    ).toBeLessThanOrEqual(32);
    expect(
      shell.brandLeft - shell.navLeft,
      'logo stays at the floating shell start'
    ).toBeLessThanOrEqual(32);
    expect(
      shell.actionsLeft - shell.linksRight,
      'menu and actions form a contiguous end cluster'
    ).toBeLessThanOrEqual(24);

    await page.locator('.rn14-disclosure > summary').click();
    await expect(page.locator('.rn14-panel')).toBeVisible();

    const desktop = await page.evaluate(() => {
      const nav = document.querySelector('[data-rn14-root] .ren-nav');
      const panel = document.querySelector('.rn14-panel');
      const summary = document.querySelector('.rn14-disclosure > summary');
      if (!nav || !panel || !summary) return null;
      const navRect = nav.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const summaryRect = summary.getBoundingClientRect();
      return {
        navBottom: navRect.bottom,
        panelTop: panelRect.top,
        panelPosition: getComputedStyle(panel).position,
        panelWidth: Math.round(panelRect.width),
        panelCenterX: panelRect.left + panelRect.width / 2,
        summaryCenterX: summaryRect.left + summaryRect.width / 2,
        overlapsBar: panelRect.top < navRect.bottom - 2 && panelRect.bottom > navRect.top + 2,
      };
    });
    expect(desktop).toBeTruthy();
    expect(desktop.panelPosition).toBe('absolute');
    expect(desktop.panelTop).toBeGreaterThanOrEqual(desktop.navBottom - 1);
    expect(desktop.overlapsBar, 'narrow dropdown must not cover the bar').toBe(false);
    expect(desktop.panelWidth, 'narrow title-only desktop panel').toBeGreaterThanOrEqual(120);
    expect(desktop.panelWidth, 'narrow title-only desktop panel').toBeLessThanOrEqual(280);
    expect(
      Math.abs(desktop.panelCenterX - desktop.summaryCenterX),
      'panel centered beneath its trigger'
    ).toBeLessThanOrEqual(24);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar14Block(page, staticServer.origin);
    await page.locator('[data-rn14-root] .ren-nav-toggle').click();
    await page.locator('.rn14-disclosure > summary').click();
    await expect(page.locator('.rn14-panel')).toBeVisible();

    const mobile = await page.evaluate(() => {
      const panel = document.querySelector('.rn14-panel');
      const links = document.querySelector('#rn14-primary-links');
      if (!panel || !links) return null;
      const panelRect = panel.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      return {
        position: getComputedStyle(panel).position,
        fullWidth: Math.abs(panelRect.width - linksRect.width) <= 8,
      };
    });
    expect(mobile).toBeTruthy();
    expect(['static', 'relative']).toContain(mobile.position);
    expect(mobile.fullWidth, 'mobile dropdown panel spans the nav tree width').toBe(true);
    await expectNoOverflow(page, 'html');
  });

  test('tablet uses desktop shell; mobile top row is logo+toggle only with both actions inside the open panel', async ({ page }) => {
    // 834px is ≥48rem: desktop shell (no hamburger), end-aligned menu, two actions.
    await page.setViewportSize({ width: 834, height: 1112 });
    await gotoNavbar14Block(page, staticServer.origin);
    await expect(page.locator('[data-rn14-root] .ren-nav-toggle')).toBeHidden();
    await expect(page.locator('#rn14-primary-links')).toBeVisible();
    await expect(
      page.locator('[data-rn14-root] .ren-nav-actions a, [data-rn14-root] .ren-nav-actions .ren-btn')
    ).toHaveCount(2);
    await page.locator('.rn14-disclosure > summary').click();
    await expect(page.locator('a.rn14-destination')).toHaveCount(3);
    await expect(page.locator('.rn14-dest-desc, .rn14-destination-icon, .rn14-group')).toHaveCount(0);

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar14Block(page, staticServer.origin);

    const closed = await page.evaluate(() => {
      const brand = document.querySelector('[data-rn14-root] .ren-nav-brand');
      const actions = document.querySelector('[data-rn14-root] .ren-nav-actions');
      const toggle = document.querySelector('[data-rn14-root] .ren-nav-toggle');
      const links = document.querySelector('#rn14-primary-links');
      if (!brand || !actions || !toggle || !links) return null;
      const brandRect = brand.getBoundingClientRect();
      const actionsRect = actions.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      const actionsStyle = getComputedStyle(actions);
      const linksStyle = getComputedStyle(links);
      const actionVisible =
        actionsRect.width > 0
        && actionsRect.height > 0
        && actionsStyle.display !== 'none'
        && actionsStyle.visibility !== 'hidden'
        && Number(actionsStyle.opacity || '1') > 0;
      return {
        brandTop: brandRect.top,
        toggleTop: toggleRect.top,
        actionVisible,
        toggleVisible: toggleRect.width > 0 && toggleRect.height > 0,
        linksBelowTopRow:
          linksRect.top >= Math.max(brandRect.bottom, toggleRect.bottom) - 4
          || linksStyle.display === 'none'
          || linksStyle.visibility === 'hidden',
      };
    });
    expect(closed).toBeTruthy();
    expect(closed.actionVisible, 'closed mobile must not show actions in the permanent top row').toBe(false);
    expect(closed.toggleVisible, 'mobile toggle is present in the chrome row').toBe(true);
    expect(Math.abs(closed.brandTop - closed.toggleTop), 'brand and toggle share top row').toBeLessThanOrEqual(12);
    expect(closed.linksBelowTopRow, 'navigation tree is not inlined into the top row when closed').toBe(true);

    await page.locator('[data-rn14-root] .ren-nav-toggle').click();
    await expect(page.locator('#rn14-primary-links')).toBeVisible();
    await expect(
      page.locator('[data-rn14-root] .ren-nav-actions a, [data-rn14-root] .ren-nav-actions .ren-btn')
    ).toHaveCount(2);

    const opened = await page.evaluate(() => {
      const brand = document.querySelector('[data-rn14-root] .ren-nav-brand');
      const actions = document.querySelector('[data-rn14-root] .ren-nav-actions');
      const toggle = document.querySelector('[data-rn14-root] .ren-nav-toggle');
      const links = document.querySelector('#rn14-primary-links');
      const actionButtons = Array.from(
        document.querySelectorAll('[data-rn14-root] .ren-nav-actions a, [data-rn14-root] .ren-nav-actions .ren-btn')
      );
      if (!brand || !actions || !toggle || !links || actionButtons.length < 2) return null;
      const brandRect = brand.getBoundingClientRect();
      const actionsRect = actions.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      const firstRect = actionButtons[0].getBoundingClientRect();
      const secondRect = actionButtons[1].getBoundingClientRect();
      return {
        toggleStillTop: Math.abs(brandRect.top - toggleRect.top) <= 12,
        actionsNotTopRow: Math.abs(brandRect.top - actionsRect.top) > 12,
        linksBelowToggle: linksRect.top >= Math.max(brandRect.bottom, toggleRect.bottom) - 4,
        actionsBelowLinks: actionsRect.top >= linksRect.bottom - 4,
        firstFullWidth: Math.abs(firstRect.width - linksRect.width) <= 8,
        secondFullWidth: Math.abs(secondRect.width - linksRect.width) <= 8,
        stacked: secondRect.top >= firstRect.bottom - 2,
      };
    });
    expect(opened).toBeTruthy();
    expect(opened.toggleStillTop, 'opened mobile keeps toggle in top row').toBe(true);
    expect(opened.actionsNotTopRow, 'opened mobile keeps actions out of the permanent top row').toBe(true);
    expect(opened.linksBelowToggle, 'opened mobile stacks the tree under logo+toggle').toBe(true);
    expect(opened.actionsBelowLinks, 'both actions sit inside the panel below the link tree').toBe(true);
    expect(opened.firstFullWidth, 'first action is full-width in the open panel').toBe(true);
    expect(opened.secondFullWidth, 'second action is full-width in the open panel').toBe(true);
    expect(opened.stacked, 'both actions stack vertically inside the open panel').toBe(true);
  });

  test('desktop chrome: single chevron, neutral details, aligned top-level peers', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar14Block(page, staticServer.origin);

    await expectSingleVisibleAffordance(
      page,
      ['.rn14-disclosure summary .rn14-chevron'],
      'navbar14 desktop chevron'
    );

    const peerLinks = page.locator('#rn14-primary-links > li > a.ren-nav-link');
    await expect(peerLinks.first()).toBeVisible();
    await expect(page.locator('.rn14-disclosure > summary')).toBeVisible();

    const firstHref = await peerLinks.nth(0).getAttribute('href');
    const lastHref = await peerLinks.nth(2).getAttribute('href');
    expect(firstHref).toBeTruthy();
    expect(lastHref).toBeTruthy();
    await expectAligned(
      page,
      [
        `a.ren-nav-link[href="${firstHref}"]`,
        '.rn14-disclosure > summary',
        `a.ren-nav-link[href="${lastHref}"]`,
      ],
      'centerY',
      2
    );

    const detailsChrome = await inspectNativeChrome(page, '.rn14-disclosure');
    expect(detailsChrome.borderTopWidth === '0px', 'details outer border').toBeTruthy();
    expect(detailsChrome.marginTop).toBe('0px');
    expect(detailsChrome.paddingTop).toBe('0px');

    const summaryChrome = await inspectNativeChrome(page, '.rn14-disclosure > summary');
    const afterContent = String(summaryChrome.afterContent || 'none').replace(/['"]/g, '');
    const afterNeutralized =
      afterContent === 'none'
      || afterContent === ''
      || summaryChrome.afterDisplay === 'none';
    expect(afterNeutralized, 'classless summary::after must be neutralized').toBe(true);

    const markerContent = String(summaryChrome.markerContent || 'none').replace(/['"]/g, '');
    expect(
      markerContent === 'none' || markerContent === '' || summaryChrome.markerDisplay === 'none',
      'summary marker'
    ).toBeTruthy();

    await expect(page.locator('.rn14-disclosure summary .rn14-chevron')).toHaveCount(1);

    await page.locator('.rn14-disclosure > summary').click();
    await expect(page.locator('.rn14-disclosure')).toHaveAttribute('open', '');
    const openChrome = await page.evaluate(() => {
      const summary = document.querySelector('.rn14-disclosure > summary');
      if (!summary) return null;
      const ss = getComputedStyle(summary);
      return {
        marginBottom: ss.marginBottom,
        borderBottomWidth: ss.borderBottomWidth,
        borderBottomStyle: ss.borderBottomStyle,
      };
    });
    expect(openChrome).toBeTruthy();
    expect(openChrome.marginBottom).toBe('0px');
    expect(
      openChrome.borderBottomStyle === 'none' || openChrome.borderBottomWidth === '0px',
      'open summary divider'
    ).toBeTruthy();
  });

  test('mobile rows: full-width peers, one chevron, no overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar14Block(page, staticServer.origin);
    await page.locator('[data-rn14-root] .ren-nav-toggle').click();
    await page.locator('.rn14-disclosure > summary').click();
    await expect(page.locator('.rn14-panel')).toBeVisible();

    const firstPeer = page.locator('#rn14-primary-links > li > a.ren-nav-link').first();
    await expect(firstPeer).toBeVisible();
    const peerHref = await firstPeer.getAttribute('href');
    expect(peerHref).toBeTruthy();

    await expectWidthRatio(page, `a.ren-nav-link[href="${peerHref}"]`, '#rn14-primary-links', 0.92, 1.05);
    await expectWidthRatio(page, '.rn14-disclosure > summary', '#rn14-primary-links', 0.92, 1.05);
    await expectSingleVisibleAffordance(
      page,
      ['.rn14-disclosure summary .rn14-chevron'],
      'mobile navbar14 chevron'
    );
    await expectNoOverflow(page, 'html');
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoNavbar14Block(page, staticServer.origin);

    await page.locator('[data-rn14-root] .ren-nav-toggle').click();
    await page.locator('.rn14-disclosure > summary').click();

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-rn14-root]');
      if (!root) return [{ name: 'missing-root', width: 0, height: 0 }];

      const candidates = root.querySelectorAll(
        'a[href], button, summary, .ren-nav-toggle, a.rn14-destination'
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
    await gotoNavbar14Block(page, staticServer.origin);
    await page.locator('.rn14-disclosure > summary').click();

    const motion = await page.evaluate(() => {
      const selectors = ['.rn14-panel', '.rn14-chevron', 'a.rn14-destination'];
      return selectors.map((selector) => {
        const el = document.querySelector(selector);
        if (!el) return { selector, missing: true };
        const style = getComputedStyle(el);
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

  test('render-matrix marker counts hold across packet viewport states', async ({ page }) => {
    for (const state of RN14_RENDER_MATRIX.states) {
      if (!state.javaScript) continue;

      if (state.reducedMotion) {
        await page.emulateMedia({ reducedMotion: 'reduce' });
      } else {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
      }

      await page.setViewportSize(state.viewport);
      await gotoNavbar14Block(page, staticServer.origin);

      await page.evaluate((theme) => {
        document.documentElement.setAttribute('data-theme', theme);
      }, state.theme);

      for (const action of state.actions) {
        if (action.type === 'click') {
          await page.locator(action.selector).click();
        } else if (action.type === 'hover') {
          await page.locator(action.selector).hover();
        }
      }

      for (const [selector, count] of Object.entries(state.expectedMarkers)) {
        await expect(
          page.locator(selector),
          `${state.id} expects ${count}× ${selector}`
        ).toHaveCount(count);
      }
    }
  });

  test('navbar14 preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await gotoNavbar14Block(page, staticServer.origin);
    await injectAxe(page);
    await checkA11y(page, '[data-rn14-root]', {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    });
  });

  test('light and dark surfaces resolve through RenDS tokens', async ({ page }) => {
    await gotoNavbar14Block(page, staticServer.origin);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }, theme);

      const colors = await page.evaluate(() => {
        const surface = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim();
        const text = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
        const nav = document.querySelector('[data-rn14-root] .ren-nav');
        return {
          surface,
          text,
          navBg: nav ? getComputedStyle(nav).backgroundColor : '',
        };
      });

      expect(colors.surface, theme).toBeTruthy();
      expect(colors.text, theme).toBeTruthy();
      expect(colors.navBg, theme).not.toBe('');
      expect(colors.navBg, theme).not.toMatch(/rgba\(0,\s*0,\s*0,\s*0\)/);
    }
  });
});
