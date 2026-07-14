import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';
import { checkA11y, injectAxe } from 'axe-playwright';

const require = createRequire(import.meta.url);
const { startStaticServer } = require('../utils/static-server.cjs');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '../..');
const packageJson = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));
let server;

async function routePublishedPackageToLocal(page) {
  const prefix = `https://cdn.jsdelivr.net/npm/ren10@${packageJson.version}/`;
  await page.route(`${prefix}**`, async (route) => {
    const relativePath = route.request().url().slice(prefix.length);
    const body = await readFile(path.join(packageRoot, relativePath));
    const contentType = relativePath.endsWith('.css')
      ? 'text/css; charset=utf-8'
      : 'application/javascript; charset=utf-8';
    await route.fulfill({ status: 200, contentType, body });
  });
}

test.beforeAll(async () => {
  server = await startStaticServer(packageRoot);
});

test.afterAll(async () => {
  await server.close();
});

test.beforeEach(async ({ page }) => {
  await page.goto(`${server.origin}/examples/reference-app/index.html`, { waitUntil: 'networkidle' });
});

test('loads the canonical consumer application', async ({ page }) => {
  await expect(page).toHaveTitle(/Ren10 reference workspace/);
  await expect(page.getByRole('heading', { level: 1, name: 'Workspace overview' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Workspace' })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Recent projects' })).toBeVisible();
  const stylesheets = await page.locator('link[rel="stylesheet"]').evaluateAll((links) =>
    links.map((link) => new URL(link.href).pathname),
  );
  expect(stylesheets.filter((href) => href.endsWith('/index.css'))).toHaveLength(1);
  expect(stylesheets.some((href) => href.endsWith('/components/index.css'))).toBe(false);
});

test('switches between light and dark themes immediately', async ({ page }) => {
  const switchControl = page.getByRole('switch', { name: 'Dark mode' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await switchControl.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.keyboard.press('Space');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('keeps keyboard focus in the dialog and restores it after Escape', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Invite teammate' });
  await trigger.focus();
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog', { name: 'Invite teammate' });
  await expect(dialog).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const openDialog = document.querySelector('dialog[open]');
    return Boolean(openDialog?.contains(document.activeElement));
  })).toBe(true);

  await page.keyboard.press('Tab');
  await expect.poll(() => page.evaluate(() => {
    const openDialog = document.querySelector('dialog[open]');
    return Boolean(openDialog?.contains(document.activeElement));
  })).toBe(true);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('keeps an invalid invite open and closes after valid native submission', async ({ page }) => {
  await page.getByRole('button', { name: 'Invite teammate' }).click();
  const dialog = page.getByRole('dialog', { name: 'Invite teammate' });
  const email = page.getByLabel('Email address');

  await page.getByRole('button', { name: 'Send invitation' }).click();
  await expect(dialog).toBeVisible();
  await expect(email).toBeFocused();
  await expect(email).toHaveJSProperty('validity.valid', false);

  await email.fill('reviewer@example.com');
  await page.getByRole('button', { name: 'Send invitation' }).click();
  await expect(dialog).toBeHidden();
});

test('provides programmatic names for every form control', async ({ page }) => {
  await expect(page.getByLabel('Workspace name')).toBeVisible();
  await expect(page.getByLabel('Contact email')).toBeVisible();
  await expect(page.getByLabel('Weekly summary')).toBeVisible();
  await expect(page.getByRole('switch', { name: 'Dark mode' })).toBeVisible();

  const unnamedControls = await page.locator('input, select, textarea, button').evaluateAll((controls) =>
    controls.filter((control) => !control.matches('[disabled]'))
      .filter((control) => !control.labels?.length && !control.getAttribute('aria-label') && !control.textContent?.trim())
      .map((control) => control.outerHTML),
  );
  expect(unnamedControls).toEqual([]);
});

test('does not introduce horizontal overflow at a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test('opens mobile navigation from outside the hidden sidebar and reaches theme control', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  const trigger = page.getByRole('button', { name: 'Open navigation' });
  const sidebar = page.locator('#primary-sidebar');

  await expect(trigger).toHaveAttribute('aria-controls', 'primary-sidebar');
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(sidebar).toHaveAttribute('data-open', '');
  await expect(page.getByRole('switch', { name: 'Dark mode' })).toBeVisible();
});

test('collapses motion durations when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const duration = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--duration-enter').trim(),
  );
  expect(duration).toBe('0ms');
});

test('has no WCAG 2.1 AA axe violations', async ({ page }) => {
  await injectAxe(page);
  await checkA11y(page, null, {
    standards: 'wcag21aa',
    detailedReport: true,
    detailedReportOptions: { html: true },
  });
});

test.describe('distributed vanilla starter', () => {
  test.beforeEach(async ({ page }) => {
    await routePublishedPackageToLocal(page);
    await page.goto(`${server.origin}/skills/rends/assets/starter/index.html`, { waitUntil: 'networkidle' });
  });

  test('loads through version-pinned local package routes and exposes its skip link', async ({ page }) => {
    await expect(page).toHaveTitle(/Ren10 workspace starter/);
    await expect(page.getByRole('heading', { level: 1, name: 'Workspace overview' })).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  });

  test('opens mobile nav, reaches theme control, saves the form, and passes axe', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Open navigation' }).click();
    const themeToggle = page.getByRole('button', { name: 'Use dark theme' });
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect.poll(() => page.evaluate(() =>
      document.getAnimations().filter((animation) => animation.playState === 'running').length,
    )).toBe(0);
    await page.keyboard.press('Escape');

    await page.getByLabel('Workspace name').fill('Aurora');
    await page.getByRole('button', { name: 'Save settings' }).click();
    await expect(page.getByRole('status')).toContainText('Settings saved.');

    await injectAxe(page);
    await checkA11y(page, null, {
      standards: 'wcag21aa',
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });
});
