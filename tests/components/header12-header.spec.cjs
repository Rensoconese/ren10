// @ts-check
const path = require('node:path');
const { test, expect, request } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-video-email-split-band.html';

test.describe('Relume Header 12 translated to Ren10', () => {
  let server;

  test.beforeAll(async () => { server = await startStaticServer(ROOT); });
  test.afterAll(async () => { await server?.close(); });

  async function gotoBlock(page) {
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=header12`);
    expect(response?.status(), 'Header12 block must resolve').toBe(200);
    await expect(page.locator('[data-rh12-root]')).toBeVisible();
  }

  test('owns the exact video, band, copy, form, legal, and motion anatomy', async ({ page }) => {
    await gotoBlock(page);
    const root = page.locator('[data-rh12-root]');
    await expect(root).toHaveCount(1);
    await expect(root.locator('.rh12-media')).toHaveCount(1);
    await expect(root.locator('video.rh12-video')).toHaveCount(1);
    await expect(root.locator('video.rh12-video > source')).toHaveCount(1);
    await expect(root.locator('img.rh12-poster')).toHaveCount(1);
    await expect(root.locator('.rh12-scrim')).toHaveCount(1);
    await expect(root.locator('button.rh12-motion-toggle[type="button"]')).toHaveCount(1);
    await expect(root.locator('.rh12-band')).toHaveCount(1);
    await expect(root.locator('h1.rh12-heading')).toHaveCount(1);
    await expect(root.locator('p.rh12-description')).toHaveCount(1);
    await expect(root.locator('form.rh12-form')).toHaveCount(1);
    await expect(root.locator('label')).toHaveCount(1);
    await expect(root.locator('input.rh12-email[type="email"]')).toHaveCount(1);
    await expect(root.locator('button.rh12-submit[type="submit"]')).toHaveCount(1);
    await expect(root.locator('.rh12-terms a[href]')).toHaveCount(1);
    await expect(root.locator('form button')).toHaveCount(1);
    await expect(root.locator('nav, header, [class*="brand"], [class*="logo"], dialog')).toHaveCount(0);
    await expect(root).toHaveAttribute('aria-labelledby', 'rh12-heading');
  });

  test('uses one owned deterministic cover video with autoplay safety attributes', async ({ page }) => {
    await gotoBlock(page);
    const video = page.locator('.rh12-video');
    await expect(video).toHaveAttribute('autoplay', '');
    await expect(video).toHaveAttribute('loop', '');
    await expect(video).toHaveAttribute('muted', '');
    await expect(video).toHaveAttribute('playsinline', '');
    await expect(video).toHaveAttribute('poster', /^\.\.\/\.\.\//);
    await expect(video.locator('source[type="video/webm"]')).toHaveAttribute('src', /^data:video\/webm;base64,/);
    const state = await video.evaluate(async (node) => {
      if (node.readyState < 1) await new Promise((resolve) => node.addEventListener('loadedmetadata', resolve, { once: true }));
      return {
        muted: node.muted,
        loop: node.loop,
        duration: node.duration,
        objectFit: getComputedStyle(node).objectFit,
        hiddenParent: node.parentElement?.getAttribute('aria-hidden'),
      };
    });
    expect(state.muted).toBe(true);
    expect(state.loop).toBe(true);
    expect(state.duration).toBeGreaterThan(0);
    expect(state.objectFit).toBe('cover');
    expect(state.hiddenParent).toBe('true');
  });

  for (const width of [320, 390, 767, 768, 1280]) {
    test(`fills svh with contiguous flexible video media and no overflow at ${width}px`, async ({ page }) => {
      const height = width >= 768 ? 900 : width === 320 ? 720 : 844;
      await page.setViewportSize({ width, height });
      await gotoBlock(page);
      const state = await page.locator('[data-rh12-root]').evaluate((root) => {
        const rootRect = root.getBoundingClientRect();
        const mediaRect = root.querySelector('.rh12-media').getBoundingClientRect();
        const bandRect = root.querySelector('.rh12-band').getBoundingClientRect();
        const videoRect = root.querySelector('.rh12-video').getBoundingClientRect();
        return {
          rootHeight: rootRect.height,
          rootContentHeight: root.clientHeight,
          viewportHeight: innerHeight,
          pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          rootOverflow: root.scrollWidth - root.clientWidth,
          mediaHeight: mediaRect.height,
          contiguous: Math.abs(mediaRect.bottom - bandRect.top) <= 1,
          fillsRemainder: Math.abs(mediaRect.height + bandRect.height - root.clientHeight) <= 1,
          videoCovers: videoRect.width >= mediaRect.width - 1 && videoRect.height >= mediaRect.height - 1,
        };
      });
      expect(Math.abs(state.rootHeight - state.viewportHeight)).toBeLessThanOrEqual(1);
      expect(state.pageOverflow).toBeLessThanOrEqual(1);
      expect(state.rootOverflow).toBeLessThanOrEqual(1);
      expect(state.mediaHeight).toBeGreaterThanOrEqual(120);
      expect(state.contiguous).toBe(true);
      expect(state.fillsRemainder).toBe(true);
      expect(state.videoCovers).toBe(true);
    });
  }

  test('stacks the band narrowly and splits heading left from support right when wide', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoBlock(page);
    const narrow = await page.locator('.rh12-band-layout').evaluate((layout) => {
      const heading = layout.querySelector('.rh12-heading').getBoundingClientRect();
      const support = layout.querySelector('.rh12-support').getBoundingClientRect();
      return support.top >= heading.bottom - 1;
    });
    expect(narrow).toBe(true);

    await page.setViewportSize({ width: 1280, height: 900 });
    const wide = await page.locator('.rh12-band-layout').evaluate((layout) => {
      const heading = layout.querySelector('.rh12-heading').getBoundingClientRect();
      const support = layout.querySelector('.rh12-support').getBoundingClientRect();
      return support.left > heading.left && Math.abs(support.top - heading.top) <= 2;
    });
    expect(wide).toBe(true);
  });

  test('stacks field and submit narrowly, then bottom-aligns them in one row', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoBlock(page);
    const narrow = await page.locator('.rh12-form-row').evaluate((row) => {
      const field = row.querySelector('ren-field').getBoundingClientRect();
      const button = row.querySelector('.rh12-submit').getBoundingClientRect();
      return button.top >= field.bottom - 1;
    });
    expect(narrow).toBe(true);

    await page.setViewportSize({ width: 768, height: 900 });
    const wide = await page.locator('.rh12-form-row').evaluate((row) => {
      const field = row.querySelector('ren-field').getBoundingClientRect();
      const button = row.querySelector('.rh12-submit').getBoundingClientRect();
      return button.top < field.bottom && Math.abs(button.bottom - field.bottom) <= 2;
    });
    expect(wide).toBe(true);
  });

  test('pauses and resumes moving media with exposed state', async ({ page }) => {
    await gotoBlock(page);
    const toggle = page.locator('.rh12-motion-toggle');
    const video = page.locator('.rh12-video');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toContainText(/Play video/i);
    expect(await video.evaluate((node) => node.paused)).toBe(true);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).toContainText(/Pause video/i);
  });

  test('reduced motion uses the poster and starts paused', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoBlock(page);
    const state = await page.locator('[data-rh12-root]').evaluate((root) => {
      const video = root.querySelector('.rh12-video');
      const poster = root.querySelector('.rh12-poster');
      const toggle = root.querySelector('.rh12-motion-toggle');
      return {
        paused: video.paused,
        videoVisibility: getComputedStyle(video).visibility,
        posterVisibility: getComputedStyle(poster).visibility,
        pressed: toggle.getAttribute('aria-pressed'),
        disabled: toggle.disabled,
      };
    });
    expect(state.paused).toBe(true);
    expect(state.videoVisibility).toBe('hidden');
    expect(state.posterVisibility).toBe('visible');
    expect(state.pressed).toBe('true');
    expect(state.disabled).toBe(true);
  });

  test('keeps readable theme surfaces, visible focus, and 44px targets', async ({ page }) => {
    await gotoBlock(page);
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      const state = await page.locator('[data-rh12-root]').evaluate((root) => {
        const targets = [...root.querySelectorAll('input, button, a')];
        const boxes = targets.map((target) => {
          const rect = target.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        });
        const band = root.querySelector('.rh12-band');
        const link = root.querySelector('.rh12-terms a');
        link.focus();
        return {
          boxes,
          bandBg: getComputedStyle(band).backgroundColor,
          focusStyle: getComputedStyle(link).outlineStyle,
          focusOffset: Number.parseFloat(getComputedStyle(link).outlineOffset),
        };
      });
      expect(state.boxes.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
      expect(state.bandBg).not.toBe('rgba(0, 0, 0, 0)');
      expect(state.focusStyle).not.toBe('none');
      expect(state.focusOffset).toBeGreaterThanOrEqual(2);
    }
  });

  test('exposes corrective validation and enhanced inline success', async ({ page }) => {
    await gotoBlock(page);
    await page.locator('.rh12-submit').click();
    await expect(page.locator('.rh12-email')).toBeFocused();
    await expect(page.locator('.rh12-email')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('[data-error]')).toContainText(/valid email/i);
    await page.locator('.rh12-email').fill('reader@example.com');
    await expect(page.locator('.rh12-email')).not.toHaveAttribute('aria-invalid', 'true');
    await page.locator('.rh12-submit').click();
    await expect(page.locator('.rh12-form-status')).toBeVisible();
    await expect(page.locator('.rh12-form-status')).toContainText(/Thanks/i);
    expect(new URL(page.url()).pathname).toBe(BLOCK);
  });

  test('passes axe WCAG 2.1 AA', async ({ page }) => {
    await gotoBlock(page);
    await injectAxe(page);
    await checkA11y(page, '[data-rh12-root]', {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    });
  });

  test('keeps poster, native form, and owned destinations without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(`${server.origin}${BLOCK}?ren10_test=header12-no-js`);
    await expect(page.locator('[data-rh12-root]')).toBeVisible();
    await expect(page.locator('.rh12-poster')).toBeVisible();
    await expect(page.locator('.rh12-video')).toBeHidden();
    await expect(page.locator('.rh12-motion-toggle')).toBeHidden();
    await expect(page.locator('.rh12-form')).toHaveAttribute('action', '../../docs/getting-started.html');
    await expect(page.locator('.rh12-terms a')).toHaveAttribute('href', '../../LICENSE');

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
