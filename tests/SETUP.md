# RenDS Visual & Accessibility Testing Setup Guide

Quick setup instructions to get testing running.

## 5-Minute Quick Start

### 1. Install Dependencies

```bash
cd /path/to/rends
npm install --save-dev @playwright/test axe-core axe-playwright
```

### 2. Install Playwright Browsers

```bash
npx playwright install
```

### 3. Create Baseline Screenshots

```bash
npx playwright test tests/visual/visual.spec.js --update-snapshots
```

### 4. Run Tests

```bash
# Run all tests
npx playwright test tests/

# Run just visual tests
npx playwright test tests/visual/visual.spec.js

# Run just accessibility tests
npx playwright test tests/a11y/a11y.spec.js

# View interactive report
npx playwright show-report
```

## File Locations

```
rends/
├── tests/
│   ├── README.md                    ← Full documentation
│   ├── SETUP.md                     ← This file
│   ├── package.json.snippet         ← Add to your package.json
│   │
│   ├── visual/
│   │   ├── test-page.html           ← Component showcase page
│   │   ├── playwright.config.js     ← Test configuration
│   │   ├── visual.spec.js           ← Visual regression tests (50+ tests)
│   │   └── __screenshots__/         ← Baseline screenshots (auto-generated)
│   │
│   └── a11y/
│       └── a11y.spec.js             ← Accessibility tests (35+ tests)
```

## What Gets Tested

### Visual Regression (50+ tests)
- **Primitives**: Buttons, badges, banners, breadcrumbs, cards, checkboxes, fields, icons, links, pagination, progress, radio buttons, tags, switches, separators, avatars, spinners, skeleton loaders, kbd
- **Composites**: Dialogs, tabs, accordions, toggle groups, tooltips, selects, sliders
- **Themes**: Light mode, dark mode, RTL layouts
- **Viewports**: Mobile (375px), Tablet (768px), Desktop (1280px), Ultra-wide (1920px)
- **Browsers**: Chrome, Firefox, Safari

### Accessibility Tests (35+ tests)
- WCAG 2.1 AA compliance
- Color contrast checking
- Keyboard navigation
- Screen reader compatibility
- Form accessibility
- ARIA attributes
- Focus management
- Mobile touch targets
- And more...

## Understanding the Test Page

**test-page.html** contains:

1. **19 Primitive Components**
   - Every component in the design system
   - Multiple states (default, hover, active, disabled, etc.)
   - All color variants

2. **7 Composite Components**
   - Complex interactive patterns
   - Open/closed states where applicable

3. **Theme Variants**
   - Light mode (default)
   - Dark mode (`.theme-dark` section with `data-theme="dark"`)
   - RTL layout (`.rtl-section` with `dir="rtl"` and Arabic content)
   - Reduced motion support

4. **Accessibility Features**
   - Semantic HTML
   - ARIA labels
   - Focus visible styling
   - Keyboard navigation
   - Color contrast

## Key Test Scenarios

### Visual Tests Check:
- ✓ Component rendering across viewports
- ✓ Color accuracy in light/dark modes
- ✓ Layout in RTL layouts
- ✓ All component states
- ✓ Responsive behavior

### Accessibility Tests Check:
- ✓ WCAG compliance
- ✓ Keyboard accessibility
- ✓ Screen reader compatibility
- ✓ Color contrast ratios
- ✓ Touch target sizing
- ✓ Focus management
- ✓ Form labeling

## Running Tests by Category

```bash
# Visual regression tests only
npx playwright test tests/visual/visual.spec.js

# Accessibility tests only
npx playwright test tests/a11y/a11y.spec.js

# Specific component
npx playwright test visual.spec.js -g "buttons"

# Specific viewport/theme
npx playwright test visual.spec.js --project="Mobile Light"
npx playwright test visual.spec.js --project="Desktop Dark"

# Specific browser
npx playwright test visual.spec.js --project="Firefox Desktop Light"
npx playwright test visual.spec.js --project="Safari Desktop Light"

# Mobile-only tests
npx playwright test --project="Mobile Light" --project="Mobile Dark"

# Desktop-only tests
npx playwright test --project="Desktop Light" --project="Desktop Dark"
```

## Baseline Workflows

### Creating Initial Baselines
```bash
npx playwright test tests/visual/visual.spec.js --update-snapshots
# Now review the generated screenshots in tests/visual/__screenshots__/
# Commit them to version control
```

### Updating Baselines After Design Changes
```bash
# Make your design system changes
# Then update baselines:
npx playwright test tests/visual/visual.spec.js --update-snapshots --project="Desktop Light"
npx playwright test tests/visual/visual.spec.js --update-snapshots --project="Desktop Dark"
# ... repeat for other projects
```

### Comparing Before/After
```bash
# Run tests (this will show diffs if they fail)
npx playwright test tests/visual/visual.spec.js

# View detailed report with diffs
npx playwright show-report
```

## CI/CD Setup

### GitHub Actions
Add to `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

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

### GitLab CI
Add to `.gitlab-ci.yml`:

```yaml
test:
  image: mcr.microsoft.com/playwright:v1.40.0-jammy
  script:
    - npm ci
    - npx playwright test tests/
  artifacts:
    when: always
    paths:
      - playwright-report/
    expire_in: 30 days
```

## Troubleshooting

### Screenshots Don't Match
1. Check if design system CSS changed
2. Verify fonts are loaded (may vary by system)
3. Look at diff in `playwright-report/` folder
4. If intentional: `npx playwright test --update-snapshots`

### "No screenshots to compare"
- Run with `--update-snapshots` to create baselines first
- Commit baseline screenshots to git

### Tests Timeout
- Check if system is under load
- Increase timeout in `playwright.config.js`
- Run fewer tests in parallel

### Browsers Not Found
```bash
npx playwright install
# Or install specific browser:
npx playwright install firefox
```

### Can't Find Test Page
- Ensure test-page.html is in `tests/visual/`
- Check file path in test files (uses `__dirname`)
- Path should resolve to `file://...` protocol

## Common Commands

```bash
# Run all tests
npx playwright test tests/

# Run visual tests
npx playwright test tests/visual/

# Run a11y tests
npx playwright test tests/a11y/

# Run specific test by name
npx playwright test -g "should render buttons"

# Run in UI mode (interactive)
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed

# Update baselines
npx playwright test --update-snapshots

# Show test report
npx playwright show-report

# Debug a specific test
npx playwright test tests/visual/visual.spec.js --debug -g "buttons"

# Run on specific project
npx playwright test --project="Desktop Light"

# Run specific number of workers
npx playwright test --workers=1
```

## Next Steps

1. **Run Visual Tests**: `npx playwright test tests/visual/visual.spec.js --update-snapshots`
2. **Review Baselines**: Check `tests/visual/__screenshots__/` folder
3. **Commit Baselines**: Add screenshots to version control
4. **Run a11y Tests**: `npx playwright test tests/a11y/`
5. **Set Up CI**: Add test step to your pipeline
6. **Regular Runs**: Run before merging design system changes

## Additional Resources

- [Full Documentation](./README.md)
- [Playwright Docs](https://playwright.dev/)
- [axe-core Docs](https://github.com/dequelabs/axe-core)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Support

For detailed configuration options, troubleshooting, and advanced usage, see [README.md](./README.md).

---

**Ready to test?** Run: `npx playwright test tests/visual/visual.spec.js --update-snapshots`
