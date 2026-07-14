#!/usr/bin/env node

import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

const require = createRequire(import.meta.url);
const { startStaticServer } = require('../tests/utils/static-server.cjs');
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const screenshotDirectory = path.join(packageRoot, 'examples', 'reference-app', 'screenshots');

await mkdir(screenshotDirectory, { recursive: true });
const server = await startStaticServer(packageRoot);
const browser = await chromium.launch();

try {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    locale: 'en-US',
    timezoneId: 'UTC',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto(`${server.origin}/examples/reference-app/index.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await page.screenshot({
    path: path.join(screenshotDirectory, 'light.png'),
    fullPage: true,
    animations: 'disabled',
  });

  await page.getByRole('switch', { name: 'Dark mode' }).focus();
  await page.keyboard.press('Space');
  await page.screenshot({
    path: path.join(screenshotDirectory, 'dark.png'),
    fullPage: true,
    animations: 'disabled',
  });

  await page.getByRole('switch', { name: 'Dark mode' }).focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Invite teammate' }).click();
  await page.screenshot({
    path: path.join(screenshotDirectory, 'dialog-open.png'),
    animations: 'disabled',
  });

  await context.close();
  console.log('Captured light, dark, and dialog-open reference screenshots.');
} finally {
  await browser.close();
  await server.close();
}
