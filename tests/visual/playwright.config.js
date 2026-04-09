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
 */
module.exports = defineConfig({
  testDir: './',
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
    // Base URL for test page
    baseURL: 'file://',

    // Screenshot settings
    screenshot: {
      mode: 'only-on-failure',
      dir: 'screenshots/failures',
    },

    // Video settings
    video: {
      mode: 'retain-on-failure',
      dir: 'videos',
    },

    // Trace settings
    trace: 'on-first-retry',
  },

  // Configure projects for different viewports and color schemes
  projects: [
    // Mobile - Light
    {
      name: 'Mobile Light',
      use: {
        ...devices['Pixel 5'],
        colorScheme: 'light',
      },
    },

    // Mobile - Dark
    {
      name: 'Mobile Dark',
      use: {
        ...devices['Pixel 5'],
        colorScheme: 'dark',
      },
    },

    // Tablet - Light
    {
      name: 'Tablet Light',
      use: {
        ...devices['iPad Pro'],
        colorScheme: 'light',
      },
    },

    // Tablet - Dark
    {
      name: 'Tablet Dark',
      use: {
        ...devices['iPad Pro'],
        colorScheme: 'dark',
      },
    },

    // Desktop - Light
    {
      name: 'Desktop Light',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 1024 },
        colorScheme: 'light',
      },
    },

    // Desktop - Dark
    {
      name: 'Desktop Dark',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 1024 },
        colorScheme: 'dark',
      },
    },

    // Ultra-wide Desktop - Light
    {
      name: 'Ultra-wide Light',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        colorScheme: 'light',
      },
    },

    // Ultra-wide Desktop - Dark
    {
      name: 'Ultra-wide Dark',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        colorScheme: 'dark',
      },
    },

    // Firefox - Desktop Light (cross-browser testing)
    {
      name: 'Firefox Desktop Light',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 1024 },
        colorScheme: 'light',
      },
    },

    // Safari - Desktop Light (cross-browser testing)
    {
      name: 'Safari Desktop Light',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 1024 },
        colorScheme: 'light',
      },
    },
  ],

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
