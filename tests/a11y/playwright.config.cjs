// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Accessibility testing configuration for RenDS Design System.
 *
 * 4 viewports × 2 color schemes = 8 Chromium projects. We don't cross-browser a11y
 * because axe-core evaluates the rendered DOM identically across engines (the
 * exception is scroll-region focus, but that's captured by the default projects).
 */
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
    { name: 'Mobile Light',      use: { ...devices['Pixel 5'],          colorScheme: 'light' } },
    { name: 'Mobile Dark',       use: { ...devices['Pixel 5'],          colorScheme: 'dark'  } },
    { name: 'Tablet Light',      use: { ...devices['iPad Pro'],         colorScheme: 'light' } },
    { name: 'Tablet Dark',       use: { ...devices['iPad Pro'],         colorScheme: 'dark'  } },
    { name: 'Desktop Light',     use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 1024 }, colorScheme: 'light' } },
    { name: 'Desktop Dark',      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 1024 }, colorScheme: 'dark'  } },
    { name: 'Ultra-wide Light',  use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 }, colorScheme: 'light' } },
    { name: 'Ultra-wide Dark',   use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 }, colorScheme: 'dark'  } },
  ],
});
