// @ts-check
const path = require('node:path');
const fs = require('node:fs');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-centered-email-capture-landscape-image.html';
const ROOT = '[data-rh27-root]';

test.describe('Relume Header 27 translated to Ren10', () => {
  let server;
  test.beforeAll(async () => { server = await startStaticServer(PKG_ROOT); });
  test.afterAll(async () => { await server?.close(); });

  async function gotoBlock(page, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=header27`);
    expect(response?.status(), 'Header27 block must exist').toBe(200);
    await expect(page.locator(ROOT)).toBeVisible();
  }

  test('owns the exact centered email and landscape image anatomy without extras or pristine error', async ({ page }) => {
    await gotoBlock(page);
    const root = page.locator(ROOT);
    await expect(root.locator('section.rh27-hero, .rh27-layout.ren-center.ren-stack, .rh27-copy.ren-center.ren-stack, h1.rh27-heading, p.rh27-description, form.rh27-form, ren-field, input[type="email"], button[type="submit"], p.rh27-legal, a.rh27-terms-link, p.rh27-status, figure.rh27-media, .rh27-media img')).toHaveCount(14);
    await expect(root.locator('form')).toHaveCount(1);
    await expect(root.locator('input')).toHaveCount(1);
    await expect(root.locator('button')).toHaveCount(1);
    await expect(root.locator('form label')).toBeVisible();
    await expect(root.locator('[data-error]')).toHaveCount(1);
    await expect(root.locator('[data-error]')).toBeHidden();
    await expect(root.locator('.rh27-media img')).toHaveCount(1);
    await expect(root.locator('picture, video, iframe, dialog, nav, header, svg, [class*="logo"], [class*="brand"], [class*="overlay"], [class*="scrim"]')).toHaveCount(0);
    await expect(root).toHaveAttribute('aria-labelledby', 'rh27-heading');
  });

  test('owns one truthful intrinsic rounded cover landscape image after copy', async ({ page }) => {
    await gotoBlock(page);
    const image = page.locator(`${ROOT} .rh27-media img`);
    await expect(image).toHaveAttribute('src', /^media\/hero-[a-z0-9-]+\.png$/);
    await expect(image).toHaveAttribute('alt', /\S+/);
    await expect(image).toHaveAttribute('width', /^\d+$/);
    await expect(image).toHaveAttribute('height', /^\d+$/);
    const state = await image.evaluate((node) => {
      const box = node.getBoundingClientRect();
      return { complete: node.complete, naturalWidth: node.naturalWidth, fit: getComputedStyle(node).objectFit, radius: getComputedStyle(node.parentElement).borderRadius, landscape: box.width > box.height };
    });
    expect(state.complete).toBe(true); expect(state.naturalWidth).toBeGreaterThan(0);
    expect(state.fit).toBe('cover'); expect(state.radius).not.toBe('0px'); expect(state.landscape).toBe(true);
    const order = await page.locator(`${ROOT} .rh27-copy, ${ROOT} .rh27-media`).evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
    expect(order[1].y).toBeGreaterThanOrEqual(order[0].bottom);
  });

  for (const width of [320, 390, 639, 640, 767, 1024, 1280]) {
    test(`stays centered, content-height, and overflow-free at ${width}px`, async ({ page }) => {
      await gotoBlock(page, width, width <= 390 ? 720 : 800);
      const state = await page.locator(ROOT).evaluate((root) => {
        const section = root.querySelector('.rh27-hero');
        const content = root.querySelector('.rh27-layout');
        const s = section.getBoundingClientRect(); const c = content.getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          center: Math.abs(c.left + c.width / 2 - innerWidth / 2),
          bottomGap: Math.abs(s.bottom - c.bottom),
          minHeight: getComputedStyle(section).minHeight,
          align: getComputedStyle(content).textAlign,
        };
      });
      expect(state.overflow).toBeLessThanOrEqual(0);
      expect(state.center).toBeLessThan(2);
      expect(state.bottomGap).toBeLessThan(130);
      expect(state.minHeight).not.toMatch(/vh|svh|dvh/);
      expect(state.align).toBe('center');
    });
  }

  test('stacks through 639px and switches to a field-submit row at 640px', async ({ page }) => {
    await gotoBlock(page, 639, 720);
    let boxes = await page.locator(`${ROOT} ren-field, ${ROOT} .rh27-submit`).evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
    expect(boxes[1].y).toBeGreaterThanOrEqual(boxes[0].bottom);
    expect(Math.abs(boxes[0].width - boxes[1].width)).toBeLessThan(2);
    await gotoBlock(page, 640, 720);
    boxes = await page.locator(`${ROOT} ren-field, ${ROOT} .rh27-submit`).evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
    expect(boxes[1].x).toBeGreaterThanOrEqual(boxes[0].right);
    expect(boxes[0].width).toBeGreaterThan(boxes[1].width);
  });

  test('shows one invalid state, clears it on valid input, and announces enhanced success', async ({ page }) => {
    await gotoBlock(page);
    const field = page.locator(`${ROOT} ren-field`); const input = page.locator(`${ROOT} .rh27-email`); const error = page.locator(`${ROOT} [data-error]`); const status = page.locator(`${ROOT} .rh27-status`);
    await page.locator(`${ROOT} .rh27-submit`).click();
    await expect(field).toHaveAttribute('data-invalid', '');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(error).toBeVisible();
    await input.fill('team@example.com');
    await expect(field).not.toHaveAttribute('data-invalid', '');
    await expect(error).toBeHidden();
    await page.locator(`${ROOT} .rh27-submit`).click();
    await expect(status).toBeVisible();
    await expect(status).toContainText('check your inbox');
    await expect(error).toBeHidden();
  });

  test('has real distinct form and terms destinations', async ({ page, request }) => {
    await gotoBlock(page);
    const form = page.locator(`${ROOT} form`); const terms = page.locator(`${ROOT} .rh27-terms-link`);
    const action = await form.getAttribute('action'); const href = await terms.getAttribute('href');
    expect(action).not.toMatch(/^#|javascript:/); expect(href).not.toMatch(/^#|javascript:/);
    expect((await request.get(new URL(action, `${server.origin}${BLOCK}`).href)).ok()).toBe(true);
    expect((await request.get(new URL(href, `${server.origin}${BLOCK}`).href)).ok()).toBe(true);
  });

  test('keeps input, submit, and terms touch-safe with visible keyboard focus', async ({ page }) => {
    await gotoBlock(page, 390, 720);
    const controls = page.locator(`${ROOT} input, ${ROOT} button, ${ROOT} .rh27-terms-link`);
    await page.locator('.bb-detail-header .ren-breadcrumb a[href="index.html"]').focus();
    for (let index = 0; index < 3; index += 1) {
      await page.keyboard.press('Tab'); await expect(controls.nth(index)).toBeFocused();
      const state = await controls.nth(index).evaluate((node) => { const b = node.getBoundingClientRect(); const s = getComputedStyle(node); return { w:b.width,h:b.height,outline:s.outlineStyle,shadow:s.boxShadow }; });
      expect(state.w).toBeGreaterThanOrEqual(44); expect(state.h).toBeGreaterThanOrEqual(44);
      expect(state.outline !== 'none' || state.shadow !== 'none').toBe(true);
    }
  });

  test('keeps theme contrast and reduced-motion transitions coherent', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' }); await gotoBlock(page);
    const state = await page.locator(`${ROOT} .rh27-submit`).evaluate((node) => { const s=getComputedStyle(node); const p=getComputedStyle(node.closest('.rh27-hero')); return {duration:s.transitionDuration,color:p.color,bg:p.backgroundColor}; });
    expect(state.duration.split(',').every((value) => ['0s','0ms'].includes(value.trim()))).toBe(true);
    expect(state.color).not.toBe(state.bg);
  });

  test('keeps the native required form and terms usable without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled:false, viewport:{width:390,height:720} }); const page = await context.newPage();
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=nojs`); expect(response?.status()).toBe(200);
    await expect(page.locator(`${ROOT} form[action]`)).toHaveCount(1); await expect(page.locator(`${ROOT} input[required]`)).toHaveCount(1); await expect(page.locator(`${ROOT} .rh27-terms-link[href]`)).toHaveCount(1); await expect(page.locator(`${ROOT} .rh27-media img`)).toBeVisible();
    await page.locator(`${ROOT} input`).fill('native@example.com'); await page.locator(`${ROOT} button`).click(); await page.waitForLoadState();
    expect(page.url()).toContain('/docs/getting-started.html'); expect(page.url()).toContain('email=native%40example.com');
    await context.close();
  });

  test('passes axe in pristine, invalid, and success states', async ({ page }) => {
    await gotoBlock(page); await injectAxe(page); await checkA11y(page, ROOT);
    await page.locator(`${ROOT} .rh27-submit`).click(); await checkA11y(page, ROOT);
    await page.locator(`${ROOT} .rh27-email`).fill('axe@example.com'); await page.locator(`${ROOT} .rh27-submit`).click(); await checkA11y(page, ROOT);
  });

  test('uses one root-scoped module and documented Ren10 primitives without leakage', async ({ page }) => {
    await gotoBlock(page); const source = fs.readFileSync(path.join(PKG_ROOT, BLOCK), 'utf8');
    await expect(page.locator('script[type="module"]:not([src])')).toHaveCount(1);
    expect(source.match(/document\.querySelector\(/g)).toHaveLength(1);
    expect(source).not.toMatch(/document\.(?:querySelectorAll|getElementById|getElementsBy)/);
    expect(source).not.toMatch(/React|Vue|Svelte|Tailwind|attachShadow|display\s*:\s*(?:flex|grid)|#[0-9a-f]{3,8}|rgba?\(|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
    expect(source).toMatch(/ren-center/); expect(source).toMatch(/ren-stack/); expect(source).toMatch(/ren-switcher/);
  });
});
