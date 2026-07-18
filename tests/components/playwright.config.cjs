// @ts-check
const path = require('node:path');
const { defineConfig, devices } = require('@playwright/test');

/**
 * Per-component smoke testing.
 *
 * Runs on Desktop Light + Desktop Dark only — the goal of this suite is
 * structural: every component registered in cli/registry.js must have a
 * matching section in docs/components.html that renders and passes axe.
 * Full viewport matrix coverage belongs to docs.spec.cjs / a11y.spec.cjs.
 *
 * testDir is the tests/ parent so reusable helpers under tests/utils/ are
 * discoverable with the same config (e.g. block-quality.spec.cjs).
 *
 * Browser is overridable via PLAYWRIGHT_BROWSER env var (chromium|firefox|webkit).
 * Default: chromium. CI uses this to fan out the matrix.
 */
const browserName = process.env.PLAYWRIGHT_BROWSER || 'chromium';
const desktopDevice = {
  chromium: devices['Desktop Chrome'],
  firefox: devices['Desktop Firefox'],
  webkit: devices['Desktop Safari'],
}[browserName];
const ciWorkers = browserName === 'firefox' ? 2 : 1;

module.exports = defineConfig({
  testDir: path.join(__dirname, '..'),
  testMatch: ['components/**/*.spec.cjs', 'utils/**/*.spec.cjs'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? ciWorkers : undefined,
  reporter: [['list']],
  use: {
    baseURL: 'file://',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'Desktop Light',
      use: { ...desktopDevice, viewport: { width: 1280, height: 1024 }, colorScheme: 'light' },
    },
    {
      name: 'Desktop Dark',
      use: { ...desktopDevice, viewport: { width: 1280, height: 1024 }, colorScheme: 'dark' },
    },
  ],
});
