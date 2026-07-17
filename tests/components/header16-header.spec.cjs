// @ts-check
const path = require('node:path');
const fs = require('node:fs');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-split-email-form-landscape-image.html';
const ROOT = '[data-rh16-root]';

test.describe('Relume Header 16 translated to Ren10', () => {
  let server;
  test.beforeAll(async () => { server = await startStaticServer(PKG_ROOT); });
  test.afterAll(async () => { await server?.close(); });

  async function gotoBlock(page, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=header16`);
    expect(response?.status(), 'Header16 block must exist').toBe(200);
    await expect(page.locator(ROOT)).toBeVisible();
  }

  test('owns the exact source-derived anatomy without extras', async ({ page }) => {
    await gotoBlock(page);
    const root = page.locator(ROOT);
    await expect(root.locator('section.rh16-hero')).toHaveCount(1);
    await expect(root.locator('.rh16-shell')).toHaveCount(1);
    await expect(root.locator('h1.rh16-heading')).toHaveCount(1);
    await expect(root.locator('p.rh16-description')).toHaveCount(1);
    await expect(root.locator('form.rh16-form')).toHaveCount(1);
    await expect(root.locator('.rh16-form label')).toHaveCount(1);
    await expect(root.locator('input[type="email"]')).toHaveCount(1);
    await expect(root.locator('button[type="submit"]')).toHaveCount(1);
    await expect(root.locator('.rh16-form [data-error]')).toHaveCount(1);
    await expect(root.locator('.rh16-status[role="status"]')).toHaveCount(1);
    await expect(root.locator('.rh16-legal')).toHaveCount(1);
    await expect(root.locator('a.rh16-terms[href]')).toHaveCount(1);
    await expect(root.locator('figure.rh16-media')).toHaveCount(1);
    await expect(root.locator('.rh16-media img')).toHaveCount(1);
    await expect(root.locator('img')).toHaveCount(1);
    await expect(root.locator('nav, [class*="logo"], [class*="brand"], video, iframe, dialog, [class*="overlay"], [class*="scrim"]')).toHaveCount(0);
    await expect(root.locator('a.ren-btn, button:not([type="submit"])')).toHaveCount(0);
  });

  for (const width of [320, 390, 640, 767, 768, 1280]) {
    test(`remains content-height and overflow-free at ${width}px`, async ({ page }) => {
      await gotoBlock(page, width, width < 768 ? 844 : 900);
      const geometry = await page.locator(ROOT).evaluate((root) => {
        const section = root.querySelector('.rh16-hero').getBoundingClientRect();
        const media = root.querySelector('.rh16-media').getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          sectionBottom: Math.round(section.bottom),
          mediaBottom: Math.round(media.bottom),
          minHeight: getComputedStyle(root.querySelector('.rh16-hero')).minHeight,
        };
      });
      expect(geometry.overflow).toBeLessThanOrEqual(0);
      expect(Math.abs(geometry.sectionBottom - geometry.mediaBottom)).toBeLessThan(100);
      expect(geometry.minHeight).not.toMatch(/vh|svh|dvh/);
    });
  }

  test('stacks through 767px and forms equal top-aligned columns at 768px', async ({ page }) => {
    await gotoBlock(page, 767, 900);
    let boxes = await page.locator(`${ROOT} .rh16-heading, ${ROOT} .rh16-support`).evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
    expect(Math.abs(boxes[0].x - boxes[1].x)).toBeLessThan(2);
    expect(boxes[1].y).toBeGreaterThan(boxes[0].bottom);
    await gotoBlock(page, 768, 900);
    boxes = await page.locator(`${ROOT} .rh16-heading, ${ROOT} .rh16-support`).evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
    expect(boxes[1].x).toBeGreaterThan(boxes[0].right);
    expect(Math.abs(boxes[0].y - boxes[1].y)).toBeLessThan(2);
    expect(Math.abs(boxes[0].width - boxes[1].width)).toBeLessThan(4);
  });

  test('switches the form from a stack to one row at 640px', async ({ page }) => {
    await gotoBlock(page, 390, 844);
    let boxes = await page.locator(`${ROOT} ren-field, ${ROOT} .rh16-submit`).evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
    expect(boxes[1].y).toBeGreaterThan(boxes[0].bottom);
    await gotoBlock(page, 640, 900);
    boxes = await page.locator(`${ROOT} ren-field, ${ROOT} .rh16-submit`).evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
    expect(boxes[1].x).toBeGreaterThan(boxes[0].right);
    expect(Math.abs(boxes[0].bottom - boxes[1].bottom)).toBeLessThan(2);
  });

  test('validates email and exposes linked error and polite success', async ({ page }) => {
    await gotoBlock(page);
    const input = page.locator(`${ROOT} .rh16-email`);
    await page.locator(`${ROOT} .rh16-submit`).click();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator(`${ROOT} [data-error]`)).toBeVisible();
    await expect(input).toHaveAttribute('aria-errormessage', /.+/);
    await input.fill('team@example.com');
    await page.locator(`${ROOT} .rh16-submit`).click();
    await expect(page.locator(`${ROOT} .rh16-status`)).toBeVisible();
    await expect(page.locator(`${ROOT} .rh16-status`)).toContainText(/ready|thanks/i);
  });

  test('uses real resolvable action and terms destinations', async ({ page, request }) => {
    await gotoBlock(page);
    const formAction = await page.locator(`${ROOT} form`).getAttribute('action');
    const termsHref = await page.locator(`${ROOT} .rh16-terms`).getAttribute('href');
    expect(formAction).toBeTruthy(); expect(formAction).not.toBe('#');
    expect(termsHref).toBeTruthy(); expect(termsHref).not.toBe('#');
    expect((await request.get(new URL(formAction, `${server.origin}${BLOCK}`).href)).ok()).toBe(true);
    expect((await request.get(new URL(termsHref, `${server.origin}${BLOCK}`).href)).ok()).toBe(true);
  });

  test('owns one meaningful intrinsically sized cover image', async ({ page }) => {
    await gotoBlock(page);
    const image = page.locator(`${ROOT} .rh16-media img`);
    await expect(image).toHaveAttribute('src', /^media\/hero-[a-z0-9-]+\.png$/);
    await expect(image).toHaveAttribute('alt', /\S+/);
    await expect(image).toHaveAttribute('width', /^\d+$/);
    await expect(image).toHaveAttribute('height', /^\d+$/);
    const visual = await image.evaluate((node) => ({ fit: getComputedStyle(node).objectFit, radius: getComputedStyle(node.parentElement).borderRadius }));
    expect(visual.fit).toBe('cover'); expect(visual.radius).not.toBe('0px');
  });

  test('preserves native form, terms, and image without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(`${server.origin}${BLOCK}?ren10_test=nojs`);
    await expect(page.locator(`${ROOT} form[action]`)).toBeVisible();
    await expect(page.locator(`${ROOT} input[required]`)).toBeVisible();
    await expect(page.locator(`${ROOT} .rh16-terms[href]`)).toBeVisible();
    await expect(page.locator(`${ROOT} .rh16-media img`)).toBeVisible();
    await page.locator(`${ROOT} input`).fill('team@example.com');
    const navigation = page.waitForNavigation();
    await page.locator(`${ROOT} .rh16-submit`).click();
    expect((await navigation)?.ok()).toBe(true);
    expect(page.url()).toMatch(/getting-started\.html\?email=team%40example\.com/);
    await context.close();
  });

  test('keeps controls touch-safe and keyboard focus visible with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' }); await gotoBlock(page, 390, 844);
    const targets = page.locator(`${ROOT} .rh16-email, ${ROOT} .rh16-submit, ${ROOT} .rh16-terms`);
    await page.locator('.bb-detail-header .ren-breadcrumb a[href="index.html"]').focus();
    for (let index = 0; index < await targets.count(); index += 1) {
      const target = targets.nth(index); const box = await target.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
      await page.keyboard.press('Tab'); await expect(target).toBeFocused();
      expect(await target.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe('none');
    }
  });

  test('passes axe AA in light and dark', async ({ page }) => {
    await gotoBlock(page); await injectAxe(page); await checkA11y(page, ROOT, { detailedReport: true, detailedReportOptions: { html: true } });
  });

  test('uses one root-scoped inline module and no policy leakage', async ({ page }) => {
    await gotoBlock(page);
    const source = fs.readFileSync(path.join(PKG_ROOT, BLOCK), 'utf8');
    await expect(page.locator('script:not([src])')).toHaveCount(1);
    await expect(page.locator('script:not([src])[type="module"]')).toHaveCount(1);
    expect(source).toMatch(/querySelector\(['"]\[data-rh16-root\]/);
    expect(source.match(/document\.querySelector/g)).toHaveLength(1);
    expect(source).not.toMatch(/React|Tailwind|attachShadow|display\s*:\s*(flex|grid)|#[0-9a-f]{3,8}|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
  });
});
