// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Per-component smoke testing.
 *
 * Runs on Desktop Light + Desktop Dark only — the goal of this suite is
 * structural: every component registered in cli/registry.js must have a
 * matching section in docs/components.html that renders and passes axe.
 * Full viewport matrix coverage belongs to docs.spec.cjs / a11y.spec.cjs.
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
    {
      name: 'Desktop Light',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 1024 }, colorScheme: 'light' },
    },
    {
      name: 'Desktop Dark',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 1024 }, colorScheme: 'dark' },
    },
  ],
});
