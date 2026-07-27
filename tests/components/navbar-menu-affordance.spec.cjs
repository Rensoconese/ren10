const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('../utils/static-server.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCKS_ROOT = path.join(PKG_ROOT, 'templates/blocks');
const NAVBAR_FILES = fs.readdirSync(BLOCKS_ROOT)
  .filter((name) => name.startsWith('nav-') && name.endsWith('.html'))
  .sort();

test('drawer stacks include the required layout primitive base class', () => {
  const expectations = new Map([
    ['nav-drawer.html', ['rb-menu-icon', 'rb-drawer-links']],
    ['nav-logo-cta-left-drawer.html', ['rn32-contact']],
  ]);

  for (const [file, scopedClasses] of expectations) {
    const html = fs.readFileSync(path.join(BLOCKS_ROOT, file), 'utf8');
    for (const scopedClass of scopedClasses) {
      const match = html.match(new RegExp(`class="([^"]*\\b${scopedClass}\\b[^"]*)"`));
      expect(match, `${file}: .${scopedClass}`).toBeTruthy();
      expect(match[1].split(/\s+/), `${file}: ${match[1]}`).toContain('ren-stack');
    }
  }
});

test.describe('Navbar drawer menu affordance', () => {
  let server;

  test.beforeAll(async () => {
    server = await startStaticServer(PKG_ROOT);
  });

  test.afterAll(async () => {
    await server?.close();
  });

  test('renders three separate hamburger bars and opens a labelled sheet', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${server.origin}/templates/blocks/nav-drawer.html`);

    const trigger = page.getByRole('button', { name: 'Open navigation menu' });
    const bars = trigger.locator('.rb-menu-icon > span');
    await expect(bars).toHaveCount(3);
    const geometry = await bars.evaluateAll((nodes) => nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return { top: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) };
    }));
    expect(new Set(geometry.map(({ top }) => top)).size).toBe(3);
    expect(geometry.every(({ width, height }) => width >= 16 && height === 2)).toBe(true);

    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Navigation' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close navigation menu' })).toBeVisible();
    const closeSize = await page.getByRole('button', { name: 'Close navigation menu' }).evaluate((button) => {
      const rect = button.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    expect(closeSize.width).toBeGreaterThanOrEqual(44);
    expect(closeSize.height).toBeGreaterThanOrEqual(44);
  });
});
