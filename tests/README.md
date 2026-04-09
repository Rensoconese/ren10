# RenDS Visual Regression & Accessibility Testing Suite

Comprehensive testing setup for the RenDS Design System using Playwright and axe-core.

## Overview

This testing suite includes:

1. **Visual Regression Testing** - Screenshot-based testing of all design system components
2. **Accessibility Testing (WCAG AAA)** - Automated accessibility compliance checking
3. **Component Coverage** - Every primitive and composite component in multiple states
4. **Multi-dimensional Testing** - Mobile, tablet, desktop viewports; light & dark modes; RTL layouts

## Files

### Visual Regression Testing

#### `/tests/visual/test-page.html`
Comprehensive HTML page containing every RenDS component in all their states:

**Primitives** (13 components):
- Buttons (primary, secondary, danger, hover, active, disabled states)
- Badges (all color variants)
- Banners (success, warning, error, info)
- Breadcrumbs
- Cards (default, centered, featured)
- Checkboxes (unchecked, checked, disabled, indeterminate)
- Fields (normal, focused, error, success, disabled)
- Icons (12 unicode/emoji icons)
- Links (default, hover, visited, active, disabled)
- Pagination
- Progress (0%, 50%, 100%, indeterminate)
- Radio buttons (unchecked, checked, disabled)
- Tags (colored variants)
- Switches (off, on, disabled)
- Separators (horizontal and vertical)
- Avatars (4 sizes: 32px, 40px, 48px, 56px + grouped)
- Spinners (3 sizes with animation)
- Skeleton loaders (text and image patterns)
- Keyboard keys (kbd elements with combinations)

**Composites** (7 components):
- Dialog (open state)
- Tabs (active and inactive states)
- Accordion (open and closed items)
- Toggle Group
- Tooltip (hidden and visible states)
- Select dropdown
- Slider (default and disabled)

**Theme Variants**:
- Light mode components
- Dark mode section (data-theme="dark")
- RTL (Right-to-Left) section with Arabic content
- Reduced motion support

#### `/tests/visual/playwright.config.js`
Playwright configuration for visual regression testing:

**Key Features**:
- 10 test projects:
  - Mobile Light & Dark (Pixel 5)
  - Tablet Light & Dark (iPad Pro)
  - Desktop Light & Dark (1280x1024)
  - Ultra-wide Light & Dark (1920x1080)
  - Firefox Desktop Light
  - Safari Desktop Light

- Screenshot matching with configurable thresholds (default: 20% pixel difference allowed)
- Multiple reporters: HTML, JSON, JUnit
- Trace recording on test retry
- Video capture on failure

**Screenshot Matching Configuration**:
```javascript
// Default threshold (20% pixel difference)
await expect(page).toMatchSnapshot('component.png', {
  maxDiffPixels: 100,
  threshold: 0.2,
});

// Stricter matching (10% pixel difference)
await expect(page).toMatchSnapshot('component.png', {
  maxDiffPixels: 10,
  threshold: 0.1,
});

// Lenient matching for animated components (50% pixel difference)
await expect(page).toMatchSnapshot('component.png', {
  maxDiffPixels: 500,
  threshold: 0.5,
});
```

#### `/tests/visual/visual.spec.js`
Comprehensive Playwright test suite with 50+ test cases:

**Test Categories**:

1. **Full Page Screenshots** (1 test)
   - Complete page rendering

2. **Primitives** (20 tests)
   - Individual section screenshots
   - Component state variations
   - Size variations

3. **Composites** (7 tests)
   - Dialog, Tabs, Accordion, Toggle Group, Tooltip, Select, Slider

4. **Theme Tests** (2 tests)
   - Dark mode rendering
   - RTL layout verification

5. **Dark Mode Tests** (1 test)
   - Full page rendering with dark color scheme

6. **Reduced Motion Tests** (2 tests)
   - Respects prefers-reduced-motion media query
   - Animation duration verification

7. **RTL Layout Tests** (3 tests)
   - RTL section rendering
   - Direction attribute verification
   - Flex order verification

8. **Color Scheme Tests** (2 tests)
   - Light mode rendering
   - Dark mode rendering

9. **Interaction States** (3 tests)
   - Focus state
   - Hover state
   - Active state

10. **Accessibility Checks** (3 tests)
    - Semantic HTML structure
    - Form labels
    - Button accessibility

11. **Content Verification** (2 tests)
    - All sections display correctly
    - Page title validation

12. **Edge Cases** (2 tests)
    - Overflow handling
    - Multiple component instances

### Accessibility Testing

#### `/tests/a11y/a11y.spec.js`
Comprehensive accessibility test suite using axe-core with 35+ tests:

**Test Categories**:

1. **Full Page Accessibility** (2 tests)
   - WCAG 2.1 AA compliance
   - Color contrast requirements

2. **Component-Specific** (7 tests)
   - Button keyboard accessibility
   - Form input labels
   - Interactive element sizing (44x44px minimum)
   - Heading hierarchy
   - Main landmark presence
   - Focus management
   - Tab order navigation

3. **Color & Contrast** (2 tests)
   - Dark mode contrast checking
   - Light theme contrast checking

4. **Images & Icons** (2 tests)
   - Alt text verification
   - Icon descriptions

5. **Link Accessibility** (1 test)
   - Descriptive link text

6. **Form Accessibility** (3 tests)
   - Label associations
   - Checkbox labeling
   - Radio button grouping

7. **ARIA Attributes** (2 tests)
   - Valid ARIA labels
   - Appropriate ARIA roles

8. **Language & Localization** (2 tests)
   - Language declaration
   - RTL language support

9. **Motion & Animation** (2 tests)
   - prefers-reduced-motion support
   - Pausable animations

10. **Mobile Accessibility** (1 test)
    - Touch-friendly sizing

11. **Keyboard Navigation** (2 tests)
    - Tab navigation
    - Escape key handling

12. **Screen Reader Compatibility** (2 tests)
    - Button announcements
    - Dynamic content context

13. **Comprehensive Report** (1 test)
    - Accessibility metrics summary

## Installation

### 1. Install Dependencies

```bash
npm install --save-dev @playwright/test axe-core axe-playwright
```

Or with yarn:

```bash
yarn add --dev @playwright/test axe-core axe-playwright
```

### 2. Install Browsers

```bash
npx playwright install
```

## Usage

### Running Visual Regression Tests

```bash
# Run all visual tests
npx playwright test tests/visual/visual.spec.js

# Run tests for specific project (e.g., Desktop Light)
npx playwright test tests/visual/visual.spec.js --project="Desktop Light"

# Run specific test
npx playwright test tests/visual/visual.spec.js -g "should render buttons section"

# Update baseline screenshots
npx playwright test tests/visual/visual.spec.js --update-snapshots

# Run with UI mode (interactive)
npx playwright test tests/visual/visual.spec.js --ui

# Run in headed mode (see browser)
npx playwright test tests/visual/visual.spec.js --headed

# Generate HTML report
npx playwright show-report
```

### Running Accessibility Tests

```bash
# Run all accessibility tests
npx playwright test tests/a11y/a11y.spec.js

# Run specific accessibility test
npx playwright test tests/a11y/a11y.spec.js -g "should have no WCAG AAA violations"

# Run with detailed output
npx playwright test tests/a11y/a11y.spec.js --verbose

# Generate accessibility report
npx playwright show-report
```

### Running All Tests

```bash
# Run complete test suite
npx playwright test tests/

# Run in parallel
npx playwright test tests/ --workers=4

# Run with specific browser
npx playwright test tests/ --project="Safari Desktop Light"
```

## Directory Structure

```
tests/
├── README.md                           # This file
├── visual/
│   ├── test-page.html                 # Test component page
│   ├── playwright.config.js            # Visual test configuration
│   ├── visual.spec.js                  # Visual regression tests
│   └── __screenshots__/               # Generated baseline screenshots
│       ├── full-page-Desktop Light.png
│       ├── primitives-buttons-Desktop Light.png
│       └── ... (many more)
│
├── a11y/
│   ├── a11y.spec.js                   # Accessibility tests
│   └── __screenshots__/               # Accessibility test screenshots
│
└── test-results/                       # Test results
    ├── results.json
    └── junit.xml

playwright-report/                      # HTML test report
videos/                                 # Screen recordings on failure
```

## Test Page Features

### Component States
Each component demonstrates:
- Default state
- Hover state (via data-state attribute)
- Active state
- Disabled state
- Focus state
- Error/success states (where applicable)
- Indeterminate state (checkboxes)

### Responsive Design
- Mobile viewport: 375x667px (Pixel 5)
- Tablet viewport: 768x1024px (iPad Pro)
- Desktop viewport: 1280x1024px
- Ultra-wide viewport: 1920x1080px

### Theme Coverage
- Light mode (default)
- Dark mode (data-theme="dark")
- RTL layout (dir="rtl") with Arabic content
- Reduced motion support (@media prefers-reduced-motion)

### Accessibility Features
- Semantic HTML structure
- ARIA attributes where needed
- Focus visible styling
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliance

## Best Practices

### Visual Regression Testing

1. **Baseline Establishment**
   - Run tests once with `--update-snapshots` to create baseline
   - Review baseline screenshots carefully
   - Commit to version control

2. **Threshold Configuration**
   - Use stricter thresholds (0.1) for static components
   - Use lenient thresholds (0.25-0.5) for animations
   - Use very lenient thresholds (0.5+) for complex interactions

3. **Failure Investigation**
   - Check generated diff images in playwright-report
   - Compare with baseline screenshots
   - Determine if change is intentional or a regression

4. **Maintenance**
   - Update baselines when design system changes intentionally
   - Review all baseline changes in code review
   - Keep old baselines in version control for comparison

### Accessibility Testing

1. **Fix Violations**
   - Address critical violations immediately
   - Prioritize by impact on user experience
   - Test fixes with actual assistive technologies

2. **Context Matters**
   - Some axe violations are false positives
   - Always verify with manual testing
   - Use WCAG guidelines as source of truth

3. **Automated vs Manual**
   - Automated tests catch ~30% of accessibility issues
   - Manual testing with screen readers is essential
   - Involve users with disabilities in testing

## Configuration Notes

### Playwright Config

The `playwright.config.js` includes:
- **Parallelization**: Disabled in CI for stability
- **Retries**: 2 retries in CI, 0 locally
- **Timeout**: Default 30s per test
- **Reporters**: HTML, JSON, JUnit formats

### Snapshot Configuration

Snapshots are stored per-project:
- `visual.spec.js-snapshots/full-page-Desktop Light.png`
- `visual.spec.js-snapshots/full-page-Mobile Dark.png`
- etc.

## Troubleshooting

### Snapshots Don't Match

1. Check if design system styles changed
2. Verify viewport size is correct
3. Check if fonts are loaded properly
4. Look at diff images in report
5. Update baselines if changes are intentional

### Tests Timeout

1. Increase timeout in playwright.config.js
2. Check system resources
3. Reduce number of parallel workers
4. Check for infinite animations

### Accessibility Tests Fail

1. Check axe-core output for specific violation
2. Verify WCAG requirements are met
3. Test with actual screen reader
4. Check ARIA implementations
5. Review contrast ratios

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Visual & A11y Tests

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - run: npm ci
      - run: npx playwright install --with-deps

      - run: npx playwright test tests/

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## Performance Tips

1. **Parallel Execution**: Set workers > 1 for faster test runs
2. **Project Filtering**: Run specific projects instead of all
3. **Focused Tests**: Use `-g` flag to run specific tests
4. **Caching**: Screenshots are cached, disable with `--update-snapshots`

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test Configuration](https://playwright.dev/docs/test-configuration)
- [Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [axe-core](https://github.com/dequelabs/axe-core)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Support & Contribution

For issues or improvements:
1. Check existing test results
2. Review screenshot diffs in HTML report
3. Create focused test cases
4. Document any environment-specific issues

---

**Last Updated**: April 7, 2026
**RenDS Version**: Current
**Test Coverage**: 50+ Visual Tests | 35+ Accessibility Tests
