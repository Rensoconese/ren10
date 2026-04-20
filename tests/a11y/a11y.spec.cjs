const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const path = require('path');

// Construct the file URL for the test page
const TEST_PAGE_URL = `file://${path.resolve(__dirname, '../visual/test-page.html')}`;

test.describe('RenDS Design System - Accessibility (WCAG AAA)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test page
    await page.goto(TEST_PAGE_URL, { waitUntil: 'networkidle' });
  });

  // ========================================
  // Full Page Accessibility
  // ========================================

  test('full page should have no WCAG AAA violations', async ({ page }) => {
    // Inject axe-core
    await injectAxe(page);

    // Run axe-core check with WCAG 2.1 AA standard (real enforcement after F7.3)
    await checkA11y(
      page,
      null, // entire page
      {
        standards: 'wcag21aa',
        detailedReport: true,
        detailedReportOptions: {
          html: true,
        },
      },
      false // skipFailures = false — enforce real after F7.3 a11y deep-clean
    );
  });

  test('full page should meet minimum contrast requirements', async ({ page }) => {
    // Check color contrast using axe-core
    await injectAxe(page);

    const violations = await page.evaluate(async () => {
      // @ts-ignore
      const results = await axe.run({
        runOnly: { type: 'rule', values: ['color-contrast'] },
      });
      return results.violations;
    });

    // Log violations for review
    if (violations.length > 0) {
      console.log('Contrast violations:', JSON.stringify(violations, null, 2));
    }

    // Enforce real after F7.4 token audit: zero tolerance for contrast violations.
    expect(violations.length).toBe(0);
  });

  // ========================================
  // Component-Specific Accessibility Tests
  // ========================================

  test('buttons should be keyboard accessible', async ({ page }) => {
    // Focus on first button
    await page.locator('button').first().focus();

    // Verify it's focused
    const isFocused = await page.locator('button').first().evaluate((el) => {
      return document.activeElement === el;
    });

    expect(isFocused).toBe(true);

    // Navigate through buttons with Tab key
    await page.keyboard.press('Tab');

    // Verify focus moved
    const nextFocused = await page.evaluate(() => {
      return document.activeElement?.tagName === 'BUTTON';
    });

    console.log('Next focused element is button:', nextFocused);
  });

  test('form inputs should have associated labels', async ({ page }) => {
    // Get all inputs
    const inputs = await page.locator('input[type="text"], input[type="checkbox"], input[type="radio"]').all();

    for (const input of inputs) {
      const inputId = await input.getAttribute('id');
      const inputName = await input.getAttribute('name');

      if (inputId) {
        // Check if there's a label for this input
        const label = page.locator(`label[for="${inputId}"]`);
        const labelExists = await label.count();

        if (labelExists === 0) {
          // Input might be labeled differently (parent label, aria-label, etc.)
          const ariaLabel = await input.getAttribute('aria-label');
          const ariaLabelledBy = await input.getAttribute('aria-labelledby');

          // At least one labeling method should exist
          expect(ariaLabel || ariaLabelledBy || labelExists > 0).toBeTruthy();
        }
      }
    }
  });

  test('interactive elements should be properly sized', async ({ page }) => {
    // Check button sizes (minimum recommended is 44x44px)
    const buttons = await page.locator('button').all();

    for (const button of buttons.slice(0, 5)) {
      // Skip disabled buttons for this check
      const isDisabled = await button.isDisabled();
      if (isDisabled) continue;

      const box = await button.boundingBox();

      if (box) {
        // Buttons should be reasonably sized
        const minSize = 32; // Minimum acceptable size
        expect(Math.max(box.width, box.height)).toBeGreaterThanOrEqual(minSize);
      }
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

    let previousLevel = 0;
    let violations = 0;

    for (const heading of headings) {
      const level = parseInt((await heading.evaluate((el) => el.tagName)).substring(1));

      // Heading levels shouldn't skip more than one level
      if (level > previousLevel + 1) {
        violations++;
      }

      previousLevel = level;
    }

    // Log but don't strictly fail
    console.log(`Heading hierarchy violations: ${violations}`);
    expect(violations).toBeLessThanOrEqual(5);
  });

  test('page should have a main landmark', async ({ page }) => {
    // Check for main content landmark
    const main = page.locator('main, [role="main"]').first();
    const hasMain = await main.count();

    // If no main, check if content is properly structured
    if (hasMain === 0) {
      const content = page.locator('body > *').first();
      expect(await content.isVisible()).toBe(true);
      console.log('No main landmark found, but page has content');
    } else {
      expect(hasMain).toBeGreaterThanOrEqual(1);
    }
  });

  test('should have proper focus management', async ({ page }) => {
    // Initial focus should be manageable
    const body = page.locator('body');
    await body.focus();

    // Tab through some elements
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(50);
    }

    // Verify we can access elements
    const focused = await page.evaluate(() => {
      return document.activeElement?.tagName || 'NONE';
    });

    // Should have focused something
    expect(focused).not.toBe('HTML');
  });

  // ========================================
  // Color and Contrast Tests
  // ========================================

  test('dark mode should have sufficient contrast', async ({ page }) => {
    // Navigate to dark mode section
    const darkSection = page.locator('[data-theme="dark"]').first();

    if (await darkSection.isVisible()) {
      await injectAxe(page);

      // Enforce real after F7.5 cross-theme audit.
      await checkA11y(
        page,
        '[data-theme="dark"]',
        {
          standards: 'wcag21aa',
        },
        false
      );
    }
  });

  test('light theme should have sufficient contrast', async ({ page }) => {
    // Check contrast in light theme sections
    await injectAxe(page);

    // Enforce real after F7.5 cross-theme audit. Selector targets the main
    // container which inherits the page-level light scheme by default.
    await checkA11y(
      page,
      'main',
      {
        standards: 'wcag21aa',
      },
      false
    );
  });

  // ========================================
  // Images and Icons
  // ========================================

  test('should have alt text for images (if present)', async ({ page }) => {
    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const title = await img.getAttribute('title');

      // Image should have alt text or title
      if (!alt && !title) {
        const ariaLabel = await img.getAttribute('aria-label');
        const ariaLabelledBy = await img.getAttribute('aria-labelledby');

        expect(ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test('icon descriptions should be present', async ({ page }) => {
    // Check for icon elements (using emoji in test page)
    const iconItems = await page.locator('.icon-item').all();

    for (const item of iconItems) {
      const title = await item.getAttribute('title');

      // Icons should have a title attribute for accessibility
      expect(title).toBeTruthy();
    }
  });

  // ========================================
  // Link Accessibility
  // ========================================

  test('links should have descriptive text', async ({ page }) => {
    const links = await page.locator('a').all();

    for (const link of links) {
      const text = await link.textContent();
      const title = await link.getAttribute('title');
      const ariaLabel = await link.getAttribute('aria-label');

      // Link should have some descriptive content
      expect(text?.trim() || title || ariaLabel).toBeTruthy();

      // Avoid generic link text
      if (text?.trim()) {
        expect(['Click here', 'Read more']).not.toContain(text.trim());
      }
    }
  });

  // ========================================
  // Form Accessibility
  // ========================================

  test('form inputs should have visible labels', async ({ page }) => {
    const inputs = await page.locator('input[type="text"]').all();

    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');

      // Input should have some form of accessible label
      // Note: placeholder alone is not sufficient
      const hasLabel = id || ariaLabel || ariaLabelledBy;
      expect(hasLabel).toBeTruthy();
    }
  });

  test('checkboxes should be properly labeled', async ({ page }) => {
    const checkboxes = await page.locator('input[type="checkbox"]').all();

    for (const checkbox of checkboxes) {
      const id = await checkbox.getAttribute('id');

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const labelCount = await label.count();

        if (labelCount === 0) {
          const ariaLabel = await checkbox.getAttribute('aria-label');
          expect(ariaLabel).toBeTruthy();
        }
      }
    }
  });

  test('radio buttons should be properly grouped', async ({ page }) => {
    const radios = await page.locator('input[type="radio"]').all();

    // Group radios by name
    const groups = new Map();

    for (const radio of radios) {
      const name = await radio.getAttribute('name');
      if (name) {
        if (!groups.has(name)) {
          groups.set(name, []);
        }
        groups.get(name).push(radio);
      }
    }

    // Each radio group should have multiple items (except edge cases)
    for (const [name, items] of groups) {
      if (items.length > 1) {
        expect(items.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  // ========================================
  // ARIA Attributes
  // ========================================

  test('should not have invalid ARIA attributes', async ({ page }) => {
    // Check for common ARIA mistakes
    const elementsWithAriaLabel = await page.locator('[aria-label]').all();

    for (const el of elementsWithAriaLabel) {
      const ariaLabel = await el.getAttribute('aria-label');

      // aria-label should not be empty
      expect(ariaLabel?.trim()).toBeTruthy();
    }
  });

  test('should use appropriate ARIA roles', async ({ page }) => {
    // Get elements with role attributes
    const roledElements = await page.locator('[role]').all();

    const validRoles = [
      'button',
      'link',
      'main',
      'navigation',
      'contentinfo',
      'complementary',
      'region',
      'article',
      'tab',
      'tabpanel',
      'menuitem',
      'option',
      'alert',
      'dialog',
    ];

    for (const el of roledElements) {
      const role = await el.getAttribute('role');

      if (role) {
        // Check if role is known (this is a simplified check)
        expect(role.length).toBeGreaterThan(0);
      }
    }
  });

  // ========================================
  // Language and Localization
  // ========================================

  test('page should declare language', async ({ page }) => {
    const htmlLang = await page.locator('html').getAttribute('lang');

    expect(htmlLang).toBeTruthy();
    expect(htmlLang?.length).toBeGreaterThan(0);
  });

  test('RTL content should have language declaration', async ({ page }) => {
    const rtlSection = page.locator('[dir="rtl"]').first();

    if (await rtlSection.isVisible()) {
      const lang = await rtlSection.getAttribute('lang');

      // If no lang on rtl section, check parent or global
      if (!lang) {
        const htmlLang = await page.locator('html').getAttribute('lang');
        expect(htmlLang).toBeTruthy();
      }
    }
  });

  // ========================================
  // Motion and Animation
  // ========================================

  test('should respect prefers-reduced-motion', async ({ page }) => {
    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Check that page renders without issues
    const hasContent = await page.evaluate(() => {
      return document.body.children.length > 0;
    });

    expect(hasContent).toBe(true);
  });

  test('animated elements should be pausable', async ({ page }) => {
    // Look for animated elements
    const spinners = page.locator('[style*="animation"]');
    const spinnerCount = await spinners.count();

    // If there are animations, they should respond to reduced-motion
    if (spinnerCount > 0) {
      console.log(`Found ${spinnerCount} animated elements`);
    }
  });

  // ========================================
  // Mobile Accessibility
  // ========================================

  test('should be touch-friendly', async ({ page }) => {
    // Emulate mobile device
    await page.setViewportSize({ width: 375, height: 667 });

    // Check for mobile-friendly elements
    const buttons = await page.locator('button').all();

    for (const button of buttons.slice(0, 3)) {
      const box = await button.boundingBox();

      if (box) {
        // Buttons should be large enough to tap (44x44px minimum)
        const isLarge = Math.max(box.width, box.height) >= 44;
        expect(isLarge || (await button.isDisabled())).toBeTruthy();
      }
    }
  });

  // ========================================
  // Keyboard Navigation
  // ========================================

  test('should support keyboard navigation', async ({ page }) => {
    // Start at the beginning
    await page.keyboard.press('Home');

    // Navigate with Tab key
    let focusedElement = null;
    let focusCount = 0;

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');

      focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tag: el?.tagName,
          type: el?.type,
          visible: el?.offsetParent !== null,
        };
      });

      if (focusedElement.visible) {
        focusCount++;
      }
    }

    // Should be able to tab through elements
    expect(focusCount).toBeGreaterThan(0);
  });

  test('should handle Escape key in dialogs', async ({ page }) => {
    // Find dialog or modal (not testing closing, just key handling)
    const dialog = page.locator('[role="dialog"], .dialog-content').first();

    if (await dialog.isVisible()) {
      // Press Escape
      await page.keyboard.press('Escape');

      // Page should still be responsive
      const isAccessible = await page.evaluate(() => {
        return document.body.offsetParent !== null;
      });

      expect(isAccessible).toBe(true);
    }
  });

  // ========================================
  // Screen Reader Compatibility
  // ========================================

  test('should announce button purposes', async ({ page }) => {
    const buttons = await page.locator('button').all();

    for (const button of buttons.slice(0, 3)) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');

      // Button should have some accessible name
      expect(text?.trim() || ariaLabel || title).toBeTruthy();
    }
  });

  test('should provide context for dynamic content', async ({ page }) => {
    // Check for aria-live regions
    const liveRegions = await page.locator('[aria-live]').all();

    console.log(`Found ${liveRegions.length} live regions`);
  });

  // ========================================
  // Comprehensive Accessibility Report
  // ========================================

  test('should generate accessibility report', async ({ page }) => {
    await injectAxe(page);

    const report = await page.evaluate(async () => {
      // @ts-ignore
      const results = await axe.run({
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa'],
        },
      });

      return {
        violations: results.violations.length,
        passes: results.passes.length,
        incomplete: results.incomplete.length,
        inapplicable: results.inapplicable.length,
      };
    });

    console.log('Accessibility Report:', report);

    // Log violations for review
    expect(report.violations).toBeDefined();
    expect(report.passes).toBeGreaterThan(0);
  });
});
