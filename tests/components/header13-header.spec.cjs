// @ts-check
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const path = require('node:path');
const { startStaticServer } = require('../utils/static-server.cjs');
const { expectNoOverflow } = require('../utils/block-quality.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK_PATH = '/templates/blocks/hero-lightbox-top-copy-band-dual-cta.html';
const ROOT = '[data-rh13-root]';

async function gotoHeader13(page, origin) {
  const response = await page.goto(`${origin}${BLOCK_PATH}`);
  expect(response?.status(), 'Header13 block must exist').toBe(200);
  await expect(page.locator(ROOT)).toHaveCount(1);
}

test.describe('Header13 — lightbox top with dual-CTA copy band', () => {
  let staticServer;

  test.beforeAll(async () => {
    staticServer = await startStaticServer(PKG_ROOT);
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  test('preserves the exact source-derived anatomy without extras', async ({ page }) => {
    await gotoHeader13(page, staticServer.origin);
    await expect(page.locator(`${ROOT} h1.rh13-title`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rh13-lede`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} a.rh13-cta`)).toHaveCount(2);
    await expect(page.locator(`${ROOT} button.rh13-media-trigger`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rh13-poster img`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rh13-scrim`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rh13-play`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} ren-dialog#rh13-video`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} #rh13-video dialog`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} #rh13-video .rh13-loader`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} #rh13-video iframe`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} form, ${ROOT} nav, ${ROOT} video`)).toHaveCount(0);
    await expect(page.locator(`${ROOT} .rh13-actions > *`)).toHaveCount(2);
  });

  test('uses a full-svh vertical shell with one flexible full-cover media region', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoHeader13(page, staticServer.origin);
    const geometry = await page.locator(ROOT).evaluate((root) => {
      const media = root.querySelector('.rh13-media').getBoundingClientRect();
      const trigger = root.querySelector('.rh13-media-trigger').getBoundingClientRect();
      const band = root.querySelector('.rh13-band').getBoundingClientRect();
      const bounds = root.getBoundingClientRect();
      return {
        rootHeight: bounds.height,
        mediaTop: media.top - bounds.top,
        mediaBottom: media.bottom - bounds.top,
        bandTop: band.top - bounds.top,
        triggerDelta: Math.max(
          Math.abs(trigger.left - media.left),
          Math.abs(trigger.top - media.top),
          Math.abs(trigger.right - media.right),
          Math.abs(trigger.bottom - media.bottom),
        ),
      };
    });
    expect(geometry.rootHeight).toBeGreaterThanOrEqual(900);
    expect(Math.abs(geometry.mediaTop)).toBeLessThanOrEqual(1);
    expect(Math.abs(geometry.mediaBottom - geometry.bandTop)).toBeLessThanOrEqual(1);
    expect(geometry.triggerDelta).toBeLessThanOrEqual(1);
  });

  test('stacks the lower band on mobile and switches to two columns at medium width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoHeader13(page, staticServer.origin);
    const mobile = await page.locator(`${ROOT} .rh13-band-layout`).evaluate((layout) => {
      const [heading, copy] = Array.from(layout.children).map((child) => child.getBoundingClientRect());
      return { headingBottom: heading.bottom, copyTop: copy.top };
    });
    expect(mobile.copyTop).toBeGreaterThanOrEqual(mobile.headingBottom);

    await page.setViewportSize({ width: 1280, height: 900 });
    const desktop = await page.locator(`${ROOT} .rh13-band-layout`).evaluate((layout) => {
      const [heading, copy] = Array.from(layout.children).map((child) => child.getBoundingClientRect());
      return {
        ratio: heading.width / copy.width,
        topDelta: Math.abs(heading.top - copy.top),
      };
    });
    expect(desktop.ratio).toBeGreaterThanOrEqual(0.95);
    expect(desktop.ratio).toBeLessThanOrEqual(1.05);
    expect(desktop.topDelta).toBeLessThanOrEqual(2);
  });

  for (const width of [320, 390, 767, 768, 1280]) {
    test(`does not overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await gotoHeader13(page, staticServer.origin);
      await expectNoOverflow(page, 'html');
    });
  }

  test('uses real resolvable destinations for both CTAs', async ({ page }) => {
    await gotoHeader13(page, staticServer.origin);
    const links = page.locator(`${ROOT} a.rh13-cta`);
    const hrefs = await links.evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href')));
    expect(new Set(hrefs).size).toBe(2);
    for (const href of hrefs) {
      expect(href).toBeTruthy();
      expect(href).not.toBe('#');
      const response = await page.request.get(new URL(href, page.url()).href);
      expect(response.ok(), href).toBe(true);
    }
  });

  test('opens with a deterministic loader, reveals playable media, and restores focus on Escape', async ({ page }) => {
    await gotoHeader13(page, staticServer.origin);
    const trigger = page.locator(`${ROOT} .rh13-media-trigger`);
    await page.evaluate(() => {
      const frame = document.querySelector('#rh13-video iframe');
      const nativeSrcdoc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'srcdoc');
      let pendingSrcdoc = '';
      Object.defineProperty(frame, 'srcdoc', {
        configurable: true,
        get: () => '',
        set: (value) => { pendingSrcdoc = value; },
      });
      window.__releaseRh13Video = () => {
        delete frame.srcdoc;
        nativeSrcdoc.set.call(frame, pendingSrcdoc);
      };
    });
    await trigger.focus();
    await page.evaluate(() => document.querySelector('.rh13-media-trigger').click());

    const dialog = page.locator('#rh13-video dialog');
    const stage = page.locator('#rh13-video .rh13-video-stage');
    const loader = page.locator('#rh13-video .rh13-loader');
    const iframe = page.locator('#rh13-video iframe');
    await expect(dialog).toHaveAttribute('open', '');
    await expect(stage).toHaveAttribute('aria-busy', 'true');
    await expect(loader).toBeVisible();
    await expect(iframe).toBeHidden();

    await page.evaluate(() => window.__releaseRh13Video());
    await expect(iframe).toBeVisible();
    await expect(loader).toBeHidden();
    await expect(stage).toHaveAttribute('aria-busy', 'false');
    await expect.poll(() => iframe.evaluate((element) => {
      const video = element.contentDocument?.querySelector('video');
      const source = video?.querySelector('source');
      return {
        video: Boolean(video),
        controls: Boolean(video?.controls),
        source: source?.getAttribute('src') || '',
        playable: video?.canPlayType(source?.getAttribute('type') || '') || '',
      };
    })).toMatchObject({
      video: true,
      controls: true,
      source: expect.stringMatching(/^data:video\/webm;base64,/),
      playable: expect.stringMatching(/maybe|probably/),
    });

    await page.keyboard.press('Escape');
    await expect(dialog).not.toHaveAttribute('open', '');
    await expect(trigger).toBeFocused();
    await expect(iframe).not.toHaveAttribute('srcdoc');
  });

  test('dismisses by close affordance and backdrop without duplicating the trigger', async ({ page }) => {
    await gotoHeader13(page, staticServer.origin);
    const trigger = page.locator(`${ROOT} .rh13-media-trigger`);
    const dialog = page.locator('#rh13-video dialog');
    await trigger.click();
    await page.locator('#rh13-video [data-dialog-close]').click();
    await expect(dialog).not.toHaveAttribute('open', '');
    await expect(trigger).toBeFocused();

    await trigger.click();
    await page.mouse.click(2, 2);
    await expect(dialog).not.toHaveAttribute('open', '');
    await expect(page.locator(`${ROOT} .rh13-media-trigger`)).toHaveCount(1);
  });

  test('traps keyboard focus inside the modal and restores the invoking trigger', async ({ page }) => {
    await gotoHeader13(page, staticServer.origin);
    const trigger = page.locator(`${ROOT} .rh13-media-trigger`);
    const dialog = page.locator('#rh13-video dialog');
    const close = page.locator('#rh13-video [data-dialog-close]');

    await trigger.focus();
    await trigger.click();
    await expect(dialog).toHaveAttribute('open', '');
    await expect(close).toBeFocused();

    for (let step = 0; step < 6; step += 1) {
      await page.keyboard.press('Tab');
      await expect.poll(() => page.evaluate(() => {
        const modal = document.querySelector('#rh13-video dialog');
        return modal?.contains(document.activeElement) ?? false;
      })).toBe(true);
    }

    await page.keyboard.press('Shift+Tab');
    await expect.poll(() => page.evaluate(() => {
      const modal = document.querySelector('#rh13-video dialog');
      return modal?.contains(document.activeElement) ?? false;
    })).toBe(true);

    await close.click();
    await expect(dialog).not.toHaveAttribute('open', '');
    await expect(trigger).toBeFocused();
  });

  test('keeps poster, copy, both CTAs, and one alternative destination without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await gotoHeader13(page, staticServer.origin);
    await expect(page.locator(`${ROOT} .rh13-poster img`)).toBeVisible();
    await expect(page.locator(`${ROOT} .rh13-title`)).toBeVisible();
    await expect(page.locator(`${ROOT} .rh13-lede`)).toBeVisible();
    await expect(page.locator(`${ROOT} .rh13-cta`)).toHaveCount(2);
    await expect(page.locator(`${ROOT} .rh13-video-fallback`)).toBeVisible();
    const href = await page.locator(`${ROOT} .rh13-video-fallback`).getAttribute('href');
    const response = await page.request.get(new URL(href, page.url()).href);
    expect(response.ok()).toBe(true);
    await expect(page.locator('#rh13-video dialog')).not.toHaveAttribute('open', '');
    await context.close();
  });

  test('provides 44px targets and visible focus in light and dark themes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoHeader13(page, staticServer.origin);
    const targets = page.locator(`${ROOT} .rh13-media-trigger, ${ROOT} .rh13-cta`);
    const sizes = await targets.evaluateAll((elements) => elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }));
    expect(sizes.every(({ width, height }) => width >= 44 && height >= 44), JSON.stringify(sizes)).toBe(true);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      const trigger = page.locator(`${ROOT} .rh13-media-trigger`);
      await trigger.focus();
      const outline = await trigger.evaluate((element) => getComputedStyle(element).outlineStyle);
      expect(outline).not.toBe('none');
    }
  });

  test('removes custom and dialog motion under reduced-motion preference', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoHeader13(page, staticServer.origin);
    await page.locator(`${ROOT} .rh13-media-trigger`).click();
    const durations = await page.locator('#rh13-video dialog').evaluate((element) => getComputedStyle(element).transitionDuration);
    expect(durations.split(',').every((value) => ['0s', '0ms'].includes(value.trim()))).toBe(true);
    const spinnerAnimation = await page.locator('#rh13-video .rh13-loader').evaluate((element) => getComputedStyle(element).animationName);
    expect(spinnerAnimation).toBe('none');
  });

  test('passes WCAG 2.1 AA axe checks while closed and open', async ({ page }) => {
    await gotoHeader13(page, staticServer.origin);
    await injectAxe(page);
    await checkA11y(page, ROOT, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    });
    await page.locator(`${ROOT} .rh13-media-trigger`).click();
    await checkA11y(page, '#rh13-video dialog', {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    });
  });

  test('contains no framework, shadow DOM, forbidden palette, or copied external media source', async ({ page }) => {
    await gotoHeader13(page, staticServer.origin);
    const source = await page.content();
    expect(source).not.toMatch(/react|jsx|tsx|tailwind|shadcn|radix|relume-icons|attachShadow/i);
    expect(source).not.toMatch(/--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
    expect(source).not.toMatch(/https?:\/\/(?:www\.)?(?:youtube|cloudfront)/i);
  });
});
