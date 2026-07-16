// @ts-check
const path = require('node:path');
const { test, expect, request } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-fullscreen-video-email-form.html';

test.describe('Relume Header 8 translated to Ren10', () => {
  let server;

  test.beforeAll(async () => { server = await startStaticServer(ROOT); });
  test.afterAll(async () => { await server?.close(); });

  async function gotoBlock(page) {
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=header8`);
    expect(response?.status(), 'Header8 block must resolve').toBe(200);
    await expect(page.locator('[data-rh8-root]')).toBeVisible();
  }

  test('owns the exact hero, copy, form, background, and action anatomy', async ({ page }) => {
    await gotoBlock(page);
    const root = page.locator('[data-rh8-root]');
    await expect(root).toHaveCount(1);
    await expect(root.locator('h1.rh8-heading')).toHaveCount(1);
    await expect(root.locator('p.rh8-description')).toHaveCount(1);
    await expect(root.locator('form.rh8-form')).toHaveCount(1);
    await expect(root.locator('label')).toHaveCount(1);
    await expect(root.locator('input.rh8-email[type="email"]')).toHaveCount(1);
    await expect(root.locator('button.rh8-submit[type="submit"]')).toHaveCount(1);
    await expect(root.locator('.rh8-terms a[href]')).toHaveCount(1);
    await expect(root.locator('video.rh8-video')).toHaveCount(1);
    await expect(root.locator('.rh8-poster')).toHaveCount(1);
    await expect(root.locator('.rh8-scrim')).toHaveCount(1);
    await expect(root.locator('button.rh8-motion-toggle[type="button"]')).toHaveCount(1);
    await expect(root.locator('nav, header, [class*="brand"], [class*="logo"], .ren-nav-toggle')).toHaveCount(0);
    await expect(root.locator('form button')).toHaveCount(1);
    await expect(root).toHaveAttribute('aria-labelledby', 'rh8-heading');
  });

  test('uses real deterministic cover video with native autoplay safety attributes', async ({ page }) => {
    await gotoBlock(page);
    const video = page.locator('.rh8-video');
    await expect(video).toHaveAttribute('autoplay', '');
    await expect(video).toHaveAttribute('loop', '');
    await expect(video).toHaveAttribute('muted', '');
    await expect(video).toHaveAttribute('playsinline', '');
    await expect(video).toHaveAttribute('poster', /\S+/);
    await expect(video.locator('source[type="video/webm"]')).toHaveAttribute('src', /^data:video\/webm;base64,/);
    const media = await video.evaluate(async (node) => {
      if (node.readyState < 1) await new Promise((resolve) => node.addEventListener('loadedmetadata', resolve, { once: true }));
      return {
        muted: node.muted,
        loop: node.loop,
        duration: node.duration,
        objectFit: getComputedStyle(node).objectFit,
        parentHidden: node.parentElement?.getAttribute('aria-hidden'),
      };
    });
    expect(media.muted).toBe(true);
    expect(media.loop).toBe(true);
    expect(media.duration).toBeGreaterThan(0);
    expect(media.objectFit).toBe('cover');
    expect(media.parentHidden).toBe('true');
  });

  for (const width of [320, 390, 767, 768, 1280]) {
    test(`fills the viewport and avoids overflow at ${width}px`, async ({ page }) => {
      const height = width >= 768 ? 900 : 844;
      await page.setViewportSize({ width, height });
      await gotoBlock(page);
      const state = await page.locator('[data-rh8-root]').evaluate((root) => {
        const rect = root.getBoundingClientRect();
        const content = root.querySelector('.rh8-copy').getBoundingClientRect();
        const video = root.querySelector('.rh8-video').getBoundingClientRect();
        return {
          rootHeight: rect.height,
          viewportHeight: innerHeight,
          pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          rootOverflow: root.scrollWidth - root.clientWidth,
          contentLeft: content.left - rect.left,
          contentWidth: content.width,
          verticalDelta: Math.abs((content.top + content.height / 2) - (rect.top + rect.height / 2)),
          videoCovers: video.width >= rect.width - 2 && video.height >= rect.height - 2,
        };
      });
      expect(state.rootHeight).toBeGreaterThanOrEqual(state.viewportHeight - 1);
      expect(state.pageOverflow).toBeLessThanOrEqual(1);
      expect(state.rootOverflow).toBeLessThanOrEqual(1);
      expect(state.contentLeft).toBeGreaterThanOrEqual(16);
      expect(state.contentWidth).toBeLessThanOrEqual(640);
      expect(state.verticalDelta).toBeLessThanOrEqual(56);
      expect(state.videoCovers).toBe(true);
    });
  }

  test('stacks the field and submit narrowly, then places them in one row', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoBlock(page);
    const narrow = await page.locator('.rh8-form-row').evaluate((row) => {
      const input = row.querySelector('ren-field').getBoundingClientRect();
      const button = row.querySelector('.rh8-submit').getBoundingClientRect();
      return { stacked: button.top >= input.bottom - 1 };
    });
    expect(narrow.stacked).toBe(true);

    await page.setViewportSize({ width: 768, height: 900 });
    const wide = await page.locator('.rh8-form-row').evaluate((row) => {
      const input = row.querySelector('ren-field').getBoundingClientRect();
      const button = row.querySelector('.rh8-submit').getBoundingClientRect();
      return {
        sameRow: button.top < input.bottom && Math.abs(input.bottom - button.bottom) <= 2,
        buttonRight: button.right,
        rowRight: row.getBoundingClientRect().right,
      };
    });
    expect(wide.sameRow).toBe(true);
    expect(wide.buttonRight).toBeLessThanOrEqual(wide.rowRight + 1);
  });

  test('pauses and resumes moving media with an exposed state', async ({ page }) => {
    await gotoBlock(page);
    const toggle = page.locator('.rh8-motion-toggle');
    const video = page.locator('.rh8-video');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toContainText(/Play background/i);
    expect(await video.evaluate((node) => node.paused)).toBe(true);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).toContainText(/Pause background/i);
  });

  test('reduced motion uses the static poster and keeps video paused', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoBlock(page);
    const state = await page.locator('[data-rh8-root]').evaluate((root) => {
      const video = root.querySelector('.rh8-video');
      const poster = root.querySelector('.rh8-poster');
      const toggle = root.querySelector('.rh8-motion-toggle');
      return {
        paused: video.paused,
        videoVisibility: getComputedStyle(video).visibility,
        posterVisibility: getComputedStyle(poster).visibility,
        pressed: toggle.getAttribute('aria-pressed'),
      };
    });
    expect(state.paused).toBe(true);
    expect(state.videoVisibility).toBe('hidden');
    expect(state.posterVisibility).toBe('visible');
    expect(state.pressed).toBe('true');
  });

  test('keeps readable foreground and visible 44px targets in both themes', async ({ page }) => {
    await gotoBlock(page);
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      const state = await page.locator('[data-rh8-root]').evaluate((root) => {
        const targets = [...root.querySelectorAll('input, button, a')];
        const boxes = targets.map((target) => {
          const rect = target.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        });
        const heading = root.querySelector('.rh8-heading');
        const scrim = root.querySelector('.rh8-scrim');
        const link = root.querySelector('.rh8-terms a');
        link.focus();
        return {
          boxes,
          headingColor: getComputedStyle(heading).color,
          scrimImage: getComputedStyle(scrim).backgroundImage,
          focusOutline: getComputedStyle(link).outlineStyle,
          focusOffset: Number.parseFloat(getComputedStyle(link).outlineOffset),
        };
      });
      expect(state.boxes.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
      expect(state.headingColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(state.scrimImage).not.toBe('none');
      expect(state.focusOutline).not.toBe('none');
      expect(state.focusOffset).toBeGreaterThanOrEqual(2);
    }
  });

  test('submits a valid address as an enhanced inline confirmation', async ({ page }) => {
    await gotoBlock(page);
    await page.locator('.rh8-email').fill('reader@example.com');
    await page.locator('.rh8-submit').click();
    await expect(page.locator('.rh8-form-status')).toBeVisible();
    await expect(page.locator('.rh8-form-status')).toContainText(/Thanks/i);
    expect(new URL(page.url()).pathname).toBe(BLOCK);
  });

  test('passes axe WCAG 2.1 AA', async ({ page }) => {
    await gotoBlock(page);
    await injectAxe(page);
    await checkA11y(page, '[data-rh8-root]', {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    });
  });

  test('keeps poster, native form, and owned destinations without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(`${server.origin}${BLOCK}?ren10_test=header8-no-js`);
    await expect(page.locator('[data-rh8-root]')).toBeVisible();
    await expect(page.locator('.rh8-poster')).toBeVisible();
    await expect(page.locator('.rh8-form')).toHaveAttribute('action', '../../docs/getting-started.html');
    await expect(page.locator('.rh8-terms a')).toHaveAttribute('href', '../../LICENSE');

    const api = await request.newContext();
    for (const destination of ['/docs/getting-started.html?email=reader%40example.com', '/LICENSE']) {
      const response = await api.get(`${server.origin}${destination}`);
      expect(response.status()).toBe(200);
      expect((await response.body()).length).toBeGreaterThan(0);
    }
    await api.dispose();
    await context.close();
  });
});
