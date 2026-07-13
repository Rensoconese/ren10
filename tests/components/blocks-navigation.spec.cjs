// @ts-check
/**
 * Navigation blocks — catalog + Navbar Mega Menu (navbar5) + Featured Mega Menu (navbar6)
 * + Icons Mega Menu (navbar7 RED).
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
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();

    // Stable close region: moving summary → panel must not close.
    await panel.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('.rmi-dest').first()).toBeVisible();

    // Leave the disclosure+panel hit region → close.
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
      const actions = Array.from(document.querySelectorAll('.rmi-footer-action'));
      if (!desc || actions.length < 2) return null;
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
      return { descHidden, stacked };
    });
    expect(mobileLayout).toBeTruthy();
    expect(mobileLayout.descHidden, 'mobile descriptions visually hidden').toBe(true);
    expect(mobileLayout.stacked, 'mobile footer actions stacked').toBe(true);

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

