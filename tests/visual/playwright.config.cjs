// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Visual Regression Testing Configuration for RenDS Design System
 *
 * This configuration includes:
 * - Multiple viewport sizes (mobile, tablet, desktop)
 * - Light and dark color schemes
 * - Screenshot matching with configurable threshold
 * - Proper timeout settings
 *
 * Browser is overridable via PLAYWRIGHT_BROWSER env var
 * (chromium|firefox|webkit). Default: chromium.
 *
 * CI only runs visual with Chromium — there are no committed baselines
 * for Firefox or WebKit, and we don't auto-generate them on each PR.
 * Firefox also skips Mobile/Tablet projects because Pixel 5 / iPad Pro
 * descriptors require `isMobile: true`, which Firefox doesn't support.
 */
const browserName = process.env.PLAYWRIGHT_BROWSER || 'chromium';
const desktopDevice = {
  chromium: devices['Desktop Chrome'],
  firefox: devices['Desktop Firefox'],
  webkit: devices['Desktop Safari'],
}[browserName];
const supportsMobileEmulation = browserName !== 'firefox';

const mobileTabletProjects = [
  {
    name: 'Mobile Light',
    use: { ...devices['Pixel 5'], browserName, colorScheme: 'light' },
  },
  {
    name: 'Mobile Dark',
    use: { ...devices['Pixel 5'], browserName, colorScheme: 'dark' },
  },
  {
    name: 'Tablet Light',
    use: { ...devices['iPad Pro'], browserName, colorScheme: 'light' },
  },
  {
    name: 'Tablet Dark',
    use: { ...devices['iPad Pro'], browserName, colorScheme: 'dark' },
  },
];

const desktopProjects = [
  {
    name: 'Desktop Light',
    use: { ...desktopDevice, viewport: { width: 1280, height: 1024 }, colorScheme: 'light' },
  },
  {
    name: 'Desktop Dark',
    use: { ...desktopDevice, viewport: { width: 1280, height: 1024 }, colorScheme: 'dark' },
  },
  {
    name: 'Ultra-wide Light',
    use: { ...desktopDevice, viewport: { width: 1920, height: 1080 }, colorScheme: 'light' },
  },
  {
    name: 'Ultra-wide Dark',
    use: { ...desktopDevice, viewport: { width: 1920, height: 1080 }, colorScheme: 'dark' },
  },
];

module.exports = defineConfig({
  testDir: '.',
  testMatch: ['visual.spec.cjs'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],

  use: {
    baseURL: 'file://',
    screenshot: { mode: 'only-on-failure', dir: 'screenshots/failures' },
    video: { mode: 'retain-on-failure', dir: 'videos' },
    trace: 'on-first-retry',
  },

  projects: supportsMobileEmulation
    ? [...mobileTabletProjects, ...desktopProjects]
    : desktopProjects,

  webServer: undefined, // No webServer needed, using file:// protocol
});

/**
 * Screenshot matching configuration
 *
 * Usage in tests:
 *
 * // Full-page screenshot with default threshold (0.2 = 20% pixel difference)
 * await expect(page).toMatchScreenshot('component-name.png', {
 *   maxDiffPixels: 100,
 *   threshold: 0.2,
 * });
 *
 * // Stricter matching
 * await expect(page).toMatchScreenshot('component-name.png', {
 *   maxDiffPixels: 10,
 *   threshold: 0.1,
 * });
 *
 * // More lenient matching (for flaky components)
 * await expect(page).toMatchScreenshot('component-name.png', {
 *   maxDiffPixels: 500,
 *   threshold: 0.5,
 * });
 */
