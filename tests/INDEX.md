# RenDS Visual Regression & Accessibility Testing Suite - Index

## Quick Navigation

- **[SETUP.md](./SETUP.md)** - 5-minute quick start guide
- **[README.md](./README.md)** - Complete documentation
- **[Visual Tests](./visual/)** - Screenshot-based regression testing
- **[A11y Tests](./a11y/)** - Accessibility compliance testing

## What's Included

### 1. Test Page (`tests/visual/test-page.html`) - 957 lines
Comprehensive HTML page with **26 components** in all states:

**Primitives (13)**
- Button (8 states: default, hover, active, disabled, primary, secondary, success, danger)
- Badge (6 color variants)
- Banner (4 types: success, warning, error, info)
- Breadcrumb (2 examples)
- Card (3 variants: default, centered, featured)
- Checkbox (5 states: unchecked, checked, disabled, disabled-checked, indeterminate)
- Field (5 states: normal, focused, error, success, disabled)
- Icon (12 unicode/emoji icons)
- Link (5 states: default, hover, visited, active, disabled)
- Pagination (complete component)
- Progress (4 states: 0%, 50%, 100%, indeterminate)
- Radio Button (4 states: unchecked, checked, disabled, disabled-checked)
- Tag (4 color variants)
- Switch (3 states: off, on, disabled)
- Separator (horizontal & vertical)
- Avatar (4 sizes + grouped avatars)
- Spinner (3 sizes with animation)
- Skeleton Loader (2 patterns)
- Keyboard Key (2 combinations)

**Composites (7)**
- Dialog (open state)
- Tabs (active/inactive states)
- Accordion (open/closed items)
- Toggle Group (3-way toggle)
- Tooltip (hidden/visible states)
- Select (closed state with options)
- Slider (default & disabled)

**Themes**
- Light mode (default)
- Dark mode (data-theme="dark")
- RTL (dir="rtl" with Arabic)
- Reduced motion support

### 2. Visual Test Config (`tests/visual/playwright.config.js`)
Playwright configuration with:
- **10 test projects**:
  - Mobile Light (Pixel 5, 375×667)
  - Mobile Dark (Pixel 5, 375×667)
  - Tablet Light (iPad Pro, 768×1024)
  - Tablet Dark (iPad Pro, 768×1024)
  - Desktop Light (1280×1024)
  - Desktop Dark (1280×1024)
  - Ultra-wide Light (1920×1080)
  - Ultra-wide Dark (1920×1080)
  - Firefox Desktop Light
  - Safari Desktop Light

- **Reporters**: HTML, JSON, JUnit
- **Screenshot matching**: Configurable thresholds
- **Video/Trace**: On failure for debugging

### 3. Visual Tests (`tests/visual/visual.spec.js`) - 536 lines
**50+ test cases** covering:

1. **Full Page** (1 test)
   - Entire page rendering

2. **Primitives** (20 tests)
   - Each component section
   - Individual component states
   - Size variations

3. **Composites** (7 tests)
   - Dialog, Tabs, Accordion, Toggle Group, Tooltip, Select, Slider

4. **Themes** (2 tests)
   - Dark mode rendering
   - RTL layout

5. **Dark Mode** (1 test)
   - Full page in dark scheme

6. **Reduced Motion** (2 tests)
   - prefers-reduced-motion support
   - Animation duration verification

7. **RTL Layout** (3 tests)
   - RTL section rendering
   - Direction attribute verification
   - Flex order verification

8. **Color Schemes** (2 tests)
   - Light scheme rendering
   - Dark scheme rendering

9. **Interaction States** (3 tests)
   - Focus state
   - Hover state
   - Active state

10. **Accessibility** (3 tests)
    - Semantic HTML structure
    - Form labels
    - Button accessibility

11. **Content** (2 tests)
    - All sections displayed
    - Page title validation

12. **Edge Cases** (2 tests)
    - Overflow handling
    - Multiple component instances

### 4. Accessibility Tests (`tests/a11y/a11y.spec.js`) - 582 lines
**35+ test cases** using axe-core covering:

1. **Full Page A11y** (2 tests)
   - WCAG 2.1 AA compliance
   - Color contrast requirements

2. **Components** (7 tests)
   - Button keyboard access
   - Form input labels
   - Interactive element sizing
   - Heading hierarchy
   - Main landmark
   - Focus management
   - Tab order

3. **Color & Contrast** (2 tests)
   - Dark mode contrast
   - Light theme contrast

4. **Images & Icons** (2 tests)
   - Alt text verification
   - Icon descriptions

5. **Links** (1 test)
   - Descriptive link text

6. **Forms** (3 tests)
   - Label associations
   - Checkbox labeling
   - Radio grouping

7. **ARIA** (2 tests)
   - Valid ARIA labels
   - Appropriate roles

8. **Language** (2 tests)
   - Language declaration
   - RTL support

9. **Motion** (2 tests)
   - prefers-reduced-motion support
   - Pausable animations

10. **Mobile** (1 test)
    - Touch-friendly sizing

11. **Keyboard** (2 tests)
    - Tab navigation
    - Escape key handling

12. **Screen Reader** (2 tests)
    - Button announcements
    - Dynamic content context

13. **Reporting** (1 test)
    - Accessibility metrics summary

### 5. Documentation

**[SETUP.md](./SETUP.md)** - Quick Start
- 5-minute setup
- Key test scenarios
- Common commands
- Troubleshooting

**[README.md](./README.md)** - Complete Guide
- Detailed overview
- Installation instructions
- Usage examples
- Best practices
- CI/CD integration
- Performance tips
- Additional resources

**[package.json.snippet](./package.json.snippet)**
- Dependencies to add
- Scripts to add
- Example full config

## Test Statistics

| Category | Count | Files |
|----------|-------|-------|
| HTML Lines | 957 | test-page.html |
| Visual Tests | 50+ | visual.spec.js |
| A11y Tests | 35+ | a11y.spec.js |
| Test Projects | 10 | playwright.config.js |
| Components Tested | 26 | test-page.html |
| Viewports | 4 | playwright.config.js |
| Browsers | 3 | playwright.config.js |
| Themes | 4 | test-page.html |
| **Total Test Cases** | **85+** | - |

## Quick Start

```bash
# 1. Install dependencies
npm install --save-dev @playwright/test axe-core axe-playwright

# 2. Install browsers
npx playwright install

# 3. Create baselines
npx playwright test tests/visual/visual.spec.js --update-snapshots

# 4. Run all tests
npx playwright test tests/

# 5. View report
npx playwright show-report
```

## Key Features

### Visual Testing
- ✓ Screenshot comparison across viewports
- ✓ Light & dark mode testing
- ✓ RTL layout verification
- ✓ Cross-browser testing (Chrome, Firefox, Safari)
- ✓ Configurable thresholds (strict to lenient)
- ✓ HTML, JSON, JUnit reports

### Accessibility Testing
- ✓ WCAG 2.1 AA compliance
- ✓ Color contrast checking
- ✓ Keyboard navigation verification
- ✓ Screen reader compatibility
- ✓ Form accessibility
- ✓ ARIA attribute validation
- ✓ Touch target sizing
- ✓ Focus management

### Component Coverage
- ✓ All primitives: buttons, badges, fields, inputs, icons, etc.
- ✓ All composites: dialogs, tabs, accordions, selects, etc.
- ✓ Multiple states: default, hover, active, disabled, error, etc.
- ✓ All sizes and variants
- ✓ All color schemes

### Theme Coverage
- ✓ Light mode (default)
- ✓ Dark mode
- ✓ RTL layouts (Arabic content)
- ✓ Reduced motion support

### Responsive Testing
- ✓ Mobile: 375×667 (Pixel 5)
- ✓ Tablet: 768×1024 (iPad Pro)
- ✓ Desktop: 1280×1024
- ✓ Ultra-wide: 1920×1080

## File Structure

```
tests/
├── INDEX.md                         ← You are here
├── SETUP.md                         ← Quick start
├── README.md                        ← Full documentation
├── package.json.snippet             ← Add to your package.json
│
├── visual/
│   ├── test-page.html              ← 957 lines: Component showcase
│   ├── playwright.config.js        ← Config with 10 projects
│   ├── visual.spec.js              ← 536 lines: 50+ visual tests
│   └── __screenshots__/            ← Auto-generated baselines
│
└── a11y/
    ├── a11y.spec.js                ← 582 lines: 35+ a11y tests
    └── __screenshots__/            ← Test screenshots
```

## Common Tasks

| Task | Command |
|------|---------|
| Setup | `npm install && npx playwright install` |
| Create baselines | `npx playwright test tests/visual --update-snapshots` |
| Run all tests | `npx playwright test tests/` |
| Run visual tests only | `npx playwright test tests/visual/` |
| Run a11y tests only | `npx playwright test tests/a11y/` |
| Run mobile tests | `npx playwright test --project='Mobile Light'` |
| Run desktop tests | `npx playwright test --project='Desktop Light'` |
| View report | `npx playwright show-report` |
| Debug test | `npx playwright test --debug` |
| Update specific project | `npx playwright test --project='Dark' --update-snapshots` |

## Getting Started

1. **Read [SETUP.md](./SETUP.md)** for quick start (5 minutes)
2. **Run initial setup**: Install packages and create baselines
3. **Review [README.md](./README.md)** for detailed info
4. **Integrate with CI/CD** using provided examples
5. **Run regularly** before design system changes

## Documentation Overview

```
SETUP.md              ← Start here (quick start)
    ↓
README.md             ← Detailed reference
    ↓
test-page.html        ← Component showcase
visual.spec.js        ← Visual tests
a11y.spec.js          ← A11y tests
```

## Version Info

- **Created**: April 7, 2026
- **Playwright**: ^1.40.0
- **axe-core**: ^4.8.0
- **Coverage**: 26 components, 85+ test cases
- **Browsers**: Chrome, Firefox, Safari
- **Viewports**: 4 sizes (mobile to ultra-wide)
- **Themes**: Light, dark, RTL, reduced-motion

## Next Steps

1. Install dependencies
2. Create baseline screenshots
3. Commit baselines to version control
4. Set up CI/CD pipeline
5. Run tests regularly
6. Update baselines when design changes intentionally

---

**Start with [SETUP.md](./SETUP.md)** for a 5-minute quick start.

For detailed information, see [README.md](./README.md).
