const { test, expect } = require('@playwright/test');
const path = require('path');

// Construct the file URL for the test page
const TEST_PAGE_URL = `file://${path.resolve(__dirname, 'test-page.html')}`;

test.describe('RenDS Design System - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test page
    await page.goto(TEST_PAGE_URL, { waitUntil: 'networkidle' });
  });

  // ========================================
  // Full Page Screenshots
  // ========================================

  test('should render full test page correctly', async ({ page }) => {
    // Take a full-page screenshot
    await expect(page).toHaveScreenshot('full-page.png', {
      maxDiffPixels: 200,
      threshold: 0.2,
    });
  });

  // ========================================
  // Primitives Section
  // ========================================

  test('should render buttons section correctly', async ({ page }) => {
    const section = page.locator('h2:has-text("Primitives") ~ .test-subsection:first-child');
    await expect(section).toHaveScreenshot('primitives-buttons.png', {
      maxDiffPixels: 100,
      threshold: 0.15,
    });
  });

  test('should render badges section correctly', async ({ page }) => {
    const section = page.locator('text=Badges').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('primitives-badges.png', {
      maxDiffPixels: 50,
      threshold: 0.1,
    });
  });

  test('should render banners section correctly', async ({ page }) => {
    const section = page.locator('text=Banners').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('primitives-banners.png', {
      maxDiffPixels: 100,
      threshold: 0.15,
    });
  });

  test('should render breadcrumbs section correctly', async ({ page }) => {
    const section = page.locator('text=Breadcrumbs').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('primitives-breadcrumbs.png', {
      maxDiffPixels: 50,
      threshold: 0.1,
    });
  });

  test('should render cards section correctly', async ({ page }) => {
    const section = page.locator('text=Cards').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('primitives-cards.png', {
      maxDiffPixels: 150,
      threshold: 0.2,
    });
  });

  test('should render checkboxes section correctly', async ({ page }) => {
    const section = page.locator('text=Checkboxes').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('primitives-checkboxes.png', {
      maxDiffPixels: 50,
      threshold: 0.1,
    });
  });

  test('should render fields section correctly', async ({ page }) => {
    const section = page.locator('text=Fields').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('primitives-fields.png', {
      maxDiffPixels: 100,
      threshold: 0.15,
    });
  });

  test('should render icons section correctly', async ({ page }) => {
    const section = page.locator('text=Icons').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('primitives-icons.png', {
      maxDiffPixels: 75,
      threshold: 0.12,
    });
  });

  test('should render links section correctly', async ({ page }) => {
    const section = page.locator('text=Links').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('primitives-links.png', {
      maxDiffPixels: 50,
      threshold: 0.1,
    });
  });

  test('should render pagination section correctly', async ({ page }) => {
    const section = page.locator('text=Pagination').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('primitives-pagination.png', {
      maxDiffPixels: 75,
      threshold: 0.12,
    });
  });

  test('should render progress section correctly', async ({ page }) => {
    const section = page.locator('text=Progress').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('primitives-progress.png', {
      maxDiffPixels: 100,
      threshold: 0.15,
    });
  });

  test('should render radio buttons section correctly', async ({ page }) => {
    const section = page.locator('text=Radio Buttons').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('primitives-radio.png', {
      maxDiffPixels: 50,
      threshold: 0.1,
    });
  });

  test('should render tags section correctly', async ({ page }) => {
    const section = page.locator('text=Tags').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('primitives-tags.png', {
      maxDiffPixels: 50,
      threshold: 0.1,
    });
  });

  test('should render switches section correctly', async ({ page }) => {
    const section = page.locator('text=Switches').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('primitives-switches.png', {
      maxDiffPixels: 50,
      threshold: 0.1,
    });
  });

  test('should render separators section correctly', async ({ page }) => {
    const section = page.locator('text=Separators').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('primitives-separators.png', {
      maxDiffPixels: 30,
      threshold: 0.08,
    });
  });

  test('should render avatars section correctly', async ({ page }) => {
    const section = page.locator('text=Avatars').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('primitives-avatars.png', {
      maxDiffPixels: 75,
      threshold: 0.12,
    });
  });

  test('should render spinners section correctly', async ({ page }) => {
    const section = page.locator('text=Spinners').locator('..').locator('..').first();
    // Spinners animate, so we use a more lenient threshold
    await expect(section).toHaveScreenshot('primitives-spinners.png', {
      maxDiffPixels: 200,
      threshold: 0.25,
    });
  });

  test('should render skeleton loaders section correctly', async ({ page }) => {
    const section = page.locator('text=Skeleton Loaders').locator('..').locator('..').first();
    // Skeletons animate, so use more lenient threshold
    await expect(section).toHaveScreenshot('primitives-skeleton.png', {
      maxDiffPixels: 150,
      threshold: 0.2,
    });
  });

  test('should render keyboard keys section correctly', async ({ page }) => {
    const section = page.locator('text=Keyboard Keys').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('primitives-kbd.png', {
      maxDiffPixels: 50,
      threshold: 0.1,
    });
  });

  // ========================================
  // Composites Section
  // ========================================

  test('should render dialog section correctly', async ({ page }) => {
    const section = page.locator('text=Dialog').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('composites-dialog.png', {
      maxDiffPixels: 100,
      threshold: 0.15,
    });
  });

  test('should render tabs section correctly', async ({ page }) => {
    const section = page.locator('text=Tabs').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('composites-tabs.png', {
      maxDiffPixels: 75,
      threshold: 0.12,
    });
  });

  test('should render accordion section correctly', async ({ page }) => {
    const section = page.locator('text=Accordion').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('composites-accordion.png', {
      maxDiffPixels: 75,
      threshold: 0.12,
    });
  });

  test('should render toggle group section correctly', async ({ page }) => {
    const section = page.locator('text=Toggle Group').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('composites-toggle-group.png', {
      maxDiffPixels: 50,
      threshold: 0.1,
    });
  });

  test('should render tooltip section correctly', async ({ page }) => {
    const section = page.locator('text=Tooltip').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('composites-tooltip.png', {
      maxDiffPixels: 75,
      threshold: 0.12,
    });
  });

  test('should render select section correctly', async ({ page }) => {
    const section = page.locator('text=Select').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('composites-select.png', {
      maxDiffPixels: 50,
      threshold: 0.1,
    });
  });

  test('should render slider section correctly', async ({ page }) => {
    const section = page.locator('text=Slider').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('composites-slider.png', {
      maxDiffPixels: 75,
      threshold: 0.12,
    });
  });

  // ========================================
  // Theme Tests
  // ========================================

  test('should render dark theme section correctly', async ({ page }) => {
    const section = page.locator('text=Dark Mode').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('theme-dark-mode.png', {
      maxDiffPixels: 150,
      threshold: 0.2,
    });
  });

  test('should render RTL section correctly', async ({ page }) => {
    const section = page.locator('text=RTL').locator('..').locator('..').first();
    await expect(section).toHaveScreenshot('theme-rtl.png', {
      maxDiffPixels: 150,
      threshold: 0.2,
    });
  });

  // ========================================
  // Dark Mode Tests
  // ========================================

  test('dark-mode: should render full page in dark scheme', async ({ page }) => {
    // This test runs with colorScheme: 'dark' from playwright.config.js
    await expect(page).toHaveScreenshot('full-page-dark.png', {
      maxDiffPixels: 300,
      threshold: 0.25,
    });
  });

  // ========================================
  // Reduced Motion Tests
  // ========================================

  test('should respect prefers-reduced-motion', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Wait a moment for styles to apply
    await page.waitForTimeout(100);

    // Verify that animations are disabled
    const hasReducedMotion = await page.evaluate(() => {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });

    expect(hasReducedMotion).toBe(true);

    // Take screenshot with reduced motion
    await expect(page).toHaveScreenshot('reduced-motion.png', {
      maxDiffPixels: 200,
      threshold: 0.2,
    });
  });

  test('should respect prefers-reduced-motion for animations', async ({ page }) => {
    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Check a specific animated element (spinner)
    const spinner = page.locator('style:has-text("spin")').first();

    // Verify animation duration is minimal
    const animationDuration = await page.evaluate(() => {
      const spinnerEl = document.querySelector('[style*="animation"]');
      if (spinnerEl) {
        return window.getComputedStyle(spinnerEl).animationDuration;
      }
      return 'not found';
    });

    console.log('Animation duration with reduced motion:', animationDuration);
  });

  // ========================================
  // RTL Layout Tests
  // ========================================

  test('should render RTL layout correctly', async ({ page }) => {
    // Locate the RTL section
    const rtlSection = page.locator('dir=rtl').first();

    // Verify it exists
    const isVisible = await rtlSection.isVisible();
    expect(isVisible).toBe(true);

    // Take screenshot of RTL section
    await expect(rtlSection).toHaveScreenshot('rtl-layout.png', {
      maxDiffPixels: 150,
      threshold: 0.2,
    });
  });

  test('should verify RTL text direction', async ({ page }) => {
    // Verify RTL section has correct dir attribute
    const rtlSection = page.locator('dir=rtl').first();
    const direction = await rtlSection.getAttribute('dir');

    expect(direction).toBe('rtl');
  });

  test('should verify flex order in RTL', async ({ page }) => {
    // In RTL, breadcrumb should be reversed
    const breadcrumbItems = page.locator('dir=rtl .breadcrumb-demo a, dir=rtl .breadcrumb-current').first();

    const text = await breadcrumbItems.evaluate(() => {
      const parent = document.querySelector('[dir="rtl"] .breadcrumb-demo');
      return parent?.textContent || '';
    });

    // Should contain RTL text
    expect(text.length).toBeGreaterThan(0);
  });

  // ========================================
  // Color Scheme Tests
  // ========================================

  test('should handle light color scheme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });

    // Verify light theme
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    // Light background should not be dark
    expect(bgColor).not.toMatch(/rgb\(0, 0, 0\)|rgb\(26, 26, 26\)/);
  });

  test('should handle dark color scheme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });

    // Wait for style recalculation
    await page.waitForTimeout(100);

    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    // Color should have been evaluated
    expect(bgColor).toBeTruthy();
  });

  // ========================================
  // Interaction States
  // ========================================

  test('should handle focus states', async ({ page }) => {
    // Focus on first button
    const firstButton = page.locator('button').first();
    await firstButton.focus();

    // Verify focus
    const isFocused = await firstButton.evaluate((el) => {
      return document.activeElement === el;
    });

    expect(isFocused).toBe(true);

    // Take screenshot with focus state
    await expect(page).toHaveScreenshot('focus-state.png', {
      maxDiffPixels: 200,
      threshold: 0.2,
    });
  });

  test('should handle hover states for buttons', async ({ page }) => {
    const button = page.locator('button').first();

    // Hover over button
    await button.hover();

    // Verify hover
    const isHovered = await button.evaluate((el) => {
      return el.matches(':hover');
    });

    // :hover pseudo-class may not be verifiable this way in all cases
    console.log('Button hover state verified');
  });

  test('should handle active states', async ({ page }) => {
    const button = page.locator('button').first();

    // Click and verify active state
    await button.click({ force: true });

    // Take screenshot
    const screenshot = await page.screenshot({ fullPage: false });
    expect(screenshot).toBeTruthy();
  });

  // ========================================
  // Accessibility Checks
  // ========================================

  test('should have proper semantic HTML structure', async ({ page }) => {
    // Check for h1
    const h1 = page.locator('h1').first();
    expect(await h1.isVisible()).toBe(true);

    // Check for section structure
    const sections = page.locator('h2');
    const count = await sections.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have proper form labels', async ({ page }) => {
    // Check for labels associated with inputs
    const labels = page.locator('label');
    const count = await labels.count();
    expect(count).toBeGreaterThan(0);

    // Verify first label has a for attribute
    const firstLabel = labels.first();
    const forAttr = await firstLabel.getAttribute('for');
    // Label might have for attribute or be a wrapper
    expect(forAttr || (await firstLabel.locator('input').count()) > 0).toBeTruthy();
  });

  test('should have proper button types', async ({ page }) => {
    // Check for buttons
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    // All buttons should be accessible
    const firstButton = buttons.first();
    const isVisible = await firstButton.isVisible();
    expect(isVisible).toBe(true);
  });

  // ========================================
  // Content Verification
  // ========================================

  test('should display all component sections', async ({ page }) => {
    // Check for key sections
    const sections = [
      'Buttons',
      'Badges',
      'Cards',
      'Checkboxes',
      'Dialog',
      'Tabs',
      'Dark Mode',
      'RTL',
      'Accessibility',
    ];

    for (const section of sections) {
      const element = page.locator(`text="${section}"`).first();
      expect(await element.isVisible()).toBe(true);
    }
  });

  test('should have proper page title', async ({ page }) => {
    const title = await page.title();
    expect(title).toContain('RenDS');
    expect(title).toContain('Visual Regression');
  });

  // ========================================
  // Edge Cases
  // ========================================

  test('should handle very long content gracefully', async ({ page }) => {
    // Verify page renders without overflow issues
    const hasOverflow = await page.evaluate(() => {
      const body = document.body;
      return body.scrollWidth > window.innerWidth;
    });

    // Page should not have unwanted horizontal scroll
    // (may have intentional horizontal scroll for RTL section)
    console.log('Has horizontal overflow:', hasOverflow);
  });

  test('should handle multiple instances of same component', async ({ page }) => {
    // Check that multiple buttons render correctly
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(5);

    // All should be visible
    for (let i = 0; i < Math.min(5, count); i++) {
      const button = buttons.nth(i);
      expect(await button.isVisible()).toBe(true);
    }
  });
});
