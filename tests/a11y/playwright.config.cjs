// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Accessibility testing configuration for RenDS Design System.
 *
 * 4 viewports × 2 color schemes = 8 projects per browser. We DO cross-browser
 * a11y in CI (axe-core is mostly engine-agnostic, but scroll-region focus and
 * custom-element shadow root timing can still differ).
 *
 * Browser is overridable via PLAYWRIGHT_BROWSER env var (chromium|firefox|webkit).
 * Default: chromium. CI uses this to fan out the matrix.
 *
 * Mobile / Tablet use Playwright's device descriptors (Pixel 5 / iPad Pro);
 * those are inherently Chromium-flavored emulations, but with browserName
 * overridden the engine swaps while the viewport/userAgent stay in shape.
 */
const browserName = process.env.PLAYWRIGHT_BROWSER || 'chromium';
const desktopDevice = {
  chromium: devices['Desktop Chrome'],
  firefox: devices['Desktop Firefox'],
  webkit: devices['Desktop Safari'],
}[browserName];

module.exports = defineConfig({
  testDir: '.',
  testMatch: ['**/*.spec.cjs'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list']],
  use: {
    baseURL: 'file://',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'Mobile Light',      use: { ...devices['Pixel 5'],   browserName, colorScheme: 'light' } },
    { name: 'Mobile Dark',       use: { ...devices['Pixel 5'],   browserName, colorScheme: 'dark'  } },
    { name: 'Tablet Light',      use: { ...devices['iPad Pro'],  browserName, colorScheme: 'light' } },
    { name: 'Tablet Dark',       use: { ...devices['iPad Pro'],  browserName, colorScheme: 'dark'  } },
    { name: 'Desktop Light',     use: { ...desktopDevice, viewport: { width: 1280, height: 1024 }, colorScheme: 'light' } },
    { name: 'Desktop Dark',      use: { ...desktopDevice, viewport: { width: 1280, height: 1024 }, colorScheme: 'dark'  } },
    { name: 'Ultra-wide Light',  use: { ...desktopDevice, viewport: { width: 1920, height: 1080 }, colorScheme: 'light' } },
    { name: 'Ultra-wide Dark',   use: { ...desktopDevice, viewport: { width: 1920, height: 1080 }, colorScheme: 'dark'  } },
  ],
});
