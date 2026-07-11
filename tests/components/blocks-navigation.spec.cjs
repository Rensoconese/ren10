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

  /**
   * Visual regression guards for the mega-menu chrome defects:
   * double chevron (classless ::after + SVG), classless details card chrome,
   * misaligned Solutions trigger, sparse category rows, stacked feature cards,
   * and mobile centered / nested-card rows.
   */
  test('desktop mega-menu chrome: single chevron, neutral details, aligned trigger', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${staticServer.origin}${MEGA_MENU}`);

    const closed = await page.evaluate(() => {
      const details = document.querySelector('.rbm-disclosure');
      const summary = details?.querySelector(':scope > summary');
      if (!details || !summary) return { missing: true };

      const ds = getComputedStyle(details);
      const after = getComputedStyle(summary, '::after');
      const afterW = parseFloat(after.width) || 0;
      const afterH = parseFloat(after.height) || 0;
      const afterContent = String(after.content || 'none').replace(/['"]/g, '');
      const afterVisible =
        afterContent !== 'none' &&
        afterContent !== '' &&
        after.display !== 'none' &&
        after.visibility !== 'hidden' &&
        afterW > 1 &&
        afterH > 1;
      const svgChevrons = details.querySelectorAll('summary .rbm-chevron').length;
      const product = document.querySelector('a.ren-nav-link[href="#product"]');
      const pricing = document.querySelector('a.ren-nav-link[href="#pricing"]');
      const pr = product?.getBoundingClientRect();
      const sr = summary.getBoundingClientRect();
      const prc = pricing?.getBoundingClientRect();

      return {
        missing: false,
        borderWidth: ds.borderTopWidth,
        borderStyle: ds.borderTopStyle,
        marginTop: ds.marginTop,
        marginBottom: ds.marginBottom,
        paddingTop: ds.paddingTop,
        paddingRight: ds.paddingRight,
        paddingBottom: ds.paddingBottom,
        paddingLeft: ds.paddingLeft,
        afterVisible,
        svgChevrons,
        chevronSources: (afterVisible ? 1 : 0) + svgChevrons,
        productMidY: pr ? (pr.top + pr.bottom) / 2 : null,
        summaryMidY: (sr.top + sr.bottom) / 2,
        pricingMidY: prc ? (prc.top + prc.bottom) / 2 : null,
        productTop: pr?.top ?? null,
        summaryTop: sr.top,
      };
    });

    expect(closed.missing).toBeFalsy();
    expect(closed.borderStyle === 'none' || closed.borderWidth === '0px', 'details outer border').toBeTruthy();
    expect(closed.marginTop).toBe('0px');
    expect(closed.marginBottom).toBe('0px');
    expect(closed.paddingTop).toBe('0px');
    expect(closed.paddingRight).toBe('0px');
    expect(closed.paddingBottom).toBe('0px');
    expect(closed.paddingLeft).toBe('0px');
    expect(closed.chevronSources, `chevron sources: after=${closed.afterVisible} svg=${closed.svgChevrons}`).toBe(1);
    expect(closed.svgChevrons).toBe(1);
    expect(closed.afterVisible, 'classless summary::after must be neutralized').toBe(false);
    expect(Math.abs(closed.summaryMidY - closed.productMidY)).toBeLessThanOrEqual(2);
    expect(Math.abs(closed.summaryMidY - closed.pricingMidY)).toBeLessThanOrEqual(2);

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

      const widthRatio = (elRect) => (linksRect.width > 0 ? elRect.width / linksRect.width : 0);
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

      const after = getComputedStyle(summary, '::after');
      const afterW = parseFloat(after.width) || 0;
      const afterH = parseFloat(after.height) || 0;
      const afterContent = String(after.content || 'none').replace(/['"]/g, '');
      const afterVisible =
        afterContent !== 'none' &&
        afterContent !== '' &&
        after.display !== 'none' &&
        afterW > 1 &&
        afterH > 1;
      const svgChevrons = details.querySelectorAll('summary .rbm-chevron').length;

      return {
        missing: false,
        productWidthRatio: widthRatio(productRect),
        summaryWidthRatio: widthRatio(summaryRect),
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
        chevronSources: (afterVisible ? 1 : 0) + svgChevrons,
        afterVisible,
        svgChevrons,
      };
    });

    expect(mobile.missing).toBeFalsy();
    expect(mobile.productWidthRatio, `product width ratio ${mobile.productWidthRatio}`).toBeGreaterThanOrEqual(
      0.92
    );
    expect(mobile.summaryWidthRatio, `summary width ratio ${mobile.summaryWidthRatio}`).toBeGreaterThanOrEqual(
      0.92
    );
    expect(mobile.productStartAligned, JSON.stringify(mobile)).toBe(true);
    expect(mobile.summaryStartAligned, JSON.stringify(mobile)).toBe(true);
    expect(Math.abs(mobile.productLeftOffset)).toBeLessThanOrEqual(8);
    expect(Math.abs(mobile.summaryLeftOffset)).toBeLessThanOrEqual(8);
    expect(mobile.nestedCard, `nested card chrome: border=${mobile.detailsBorder} pad=${mobile.detailsPadding}`).toBe(
      false
    );
    expect(mobile.chevronSources, `mobile chevrons after=${mobile.afterVisible} svg=${mobile.svgChevrons}`).toBe(1);
  });
});
