# Ren10 Headers 1–30 Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate, complete, and visually polish a single Ren10 catalog containing reviewed Headers 1 through 30.

**Architecture:** Build on `codex/header1-5-batch`, checkpoint the already approved shared shell work, then import only unique reviewed assets from the cumulative and individual header branches. Header 29 and Header 30 follow the full Relume-to-Ren10 packet flow before implementation. A final shared pass owns catalog order, detail-page rhythm, CSS Grid seams, and static previous/next links.

**Tech Stack:** Vanilla HTML, CSS, and JavaScript; Ren10 layout/component contracts; Node.js workflow scripts; Playwright; axe-playwright; Git.

## Global Constraints

- Work only in `/Users/rensoconese/RenDS/worktrees/header-batch` on `codex/header1-5-batch`.
- Preserve unrelated user changes and never reset the dirty worktree.
- Vanilla HTML/CSS/JS and light DOM only; no React, JSX, Tailwind, or framework abstractions.
- Two-column hero skeletons use `ren-grid ren-grid-2` and become one column below `48rem`.
- Use Ren10 layout primitives before authored layout declarations.
- Consumer CSS uses semantic `--color-*`, spacing/type/motion tokens, or documented `--ren-*` component tokens; never primitive palette tokens or hardcoded colors.
- Every interactive element is semantic, keyboard reachable, visibly focusable, named, and at least 44×44 CSS pixels.
- Shared detail chrome lives in `site/shell.css`; block-local CSS owns only the preview interior.
- Every block page ends with two named static links in `.bb-block-pagination`.
- Do not publish, push, merge to `main`, or change package version.

---

### Task 1: Checkpoint the approved shared detail-page polish

**Files:**
- Create: `tests/components/block-detail-shell.spec.cjs`
- Modify: `site/shell.css`
- Modify: `templates/blocks/hero-*.html` currently present
- Modify: `templates/blocks/nav-*.html`

**Interfaces:**
- Consumes: `.bb-detail-page`, `.bb-detail-header`, `.bb-detail-preview`, `.bb-block-pagination`, and `.bb-block-pagination-link` from the approved dirty worktree.
- Produces: a browser-tested detail-page shell contract that later imported headers must satisfy.

- [ ] **Step 1: Confirm the worktree contains only the approved shell/detail changes plus the committed design document**

Run:

```bash
git status --short
git diff --check
```

Expected: modified `site/shell.css` and existing block HTML files; no untracked implementation files; `git diff --check` exits 0.

- [ ] **Step 2: Add the shared shell browser contract**

Create `tests/components/block-detail-shell.spec.cjs` with:

```js
// @ts-check
const { test, expect } = require('@playwright/test');
const { readdirSync } = require('node:fs');
const path = require('node:path');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT = path.resolve(__dirname, '../..');
const pages = readdirSync(path.join(ROOT, 'templates/blocks'))
  .filter((file) => /^(hero|nav)-.*\.html$/.test(file))
  .sort();

let server;

test.beforeAll(async () => {
  server = await startStaticServer(ROOT);
});

test.afterAll(async () => {
  await server?.close();
});

for (const file of pages) {
  test(`${file} uses shared detail rhythm and valid block navigation`, async ({ page }) => {
    const response = await page.goto(`${server.origin}/templates/blocks/${file}`);
    expect(response?.status()).toBe(200);

    const state = await page.evaluate(() => {
      const main = document.querySelector('main.bb-detail-page');
      const header = main?.querySelector(':scope > .bb-detail-header');
      const preview = main?.querySelector(':scope > .bb-detail-preview');
      const pagination = main?.querySelector('.bb-block-pagination');
      const headerRect = header?.getBoundingClientRect();
      const previewRect = preview?.getBoundingClientRect();
      return {
        display: main ? getComputedStyle(main).display : null,
        gap: headerRect && previewRect
          ? Math.round(previewRect.top - headerRect.bottom)
          : null,
        links: pagination?.querySelectorAll('a[href]').length ?? 0,
        labels: Array.from(pagination?.querySelectorAll('a[href]') ?? [])
          .map((link) => link.textContent.trim()),
        overflow: document.documentElement.scrollWidth - innerWidth,
      };
    });

    expect(state.display).toBe('grid');
    if (state.gap !== null) expect(state.gap).toBe(32);
    expect(state.links).toBe(2);
    expect(state.labels.every((label) => !/Previous block|Next block/.test(label))).toBe(true);
    expect(state.overflow).toBeLessThanOrEqual(0);
  });
}
```

- [ ] **Step 3: Run the shell contract at desktop and mobile**

Run:

```bash
npx playwright test --config tests/components/playwright.config.cjs \
  tests/components/block-detail-shell.spec.cjs \
  --project="Desktop Light" --project="Mobile Light" --workers=1 --retries=0
```

Expected: all currently present block pages pass in both projects.

- [ ] **Step 4: Run repository checks for the approved polish**

Run:

```bash
npm run lint
npm run agent:check
git diff --check
```

Expected: all commands exit 0. Existing ESLint warnings may remain, but there are zero errors.

- [ ] **Step 5: Commit only the shared polish and its test**

```bash
git add site/shell.css templates/blocks tests/components/block-detail-shell.spec.cjs
git commit -m "fix(blocks): standardize detail rhythm and pagination"
```

### Task 2: Consolidate reviewed Headers 6–25

**Files:**
- Import: twenty `templates/blocks/hero-*.html` files unique to `codex/header26-30-batch`
- Import: `tests/components/header6-header.spec.cjs` through `header25-header.spec.cjs`
- Import: `docs/workflows/relume-to-ren10/modules/header6` through `header25`
- Modify: `templates/blocks/index.html`
- Modify: imported header HTML files to satisfy the shared shell contract

**Interfaces:**
- Consumes: reviewed source branch `codex/header26-30-batch` at `364e943` and the Task 1 shell contract.
- Produces: runnable, catalogued Headers 1–25 on the target branch.

- [ ] **Step 1: Record the exact import set**

Run:

```bash
comm -13 \
  <(find templates/blocks -maxdepth 1 -type f -name 'hero-*.html' -exec basename {} \; | sort) \
  <(find ../header-batch6/templates/blocks -maxdepth 1 -type f -name 'hero-*.html' -exec basename {} \; | sort)
```

Expected: exactly these twenty files:

```text
hero-centered-copy-dual-cta.html
hero-centered-email-capture.html
hero-centered-search.html
hero-cover-image-email-split-band.html
hero-email-copy-image-left.html
hero-fullscreen-bg-left-email-capture.html
hero-fullscreen-bg-video-left-copy-dual-cta.html
hero-fullscreen-media-top-copy-band-dual-cta.html
hero-fullscreen-video-email-form.html
hero-fullscreen-video-top-copy-band-dual-cta.html
hero-lightbox-top-copy-band-dual-cta.html
hero-lightbox-top-email-split-band.html
hero-split-copy-dual-cta-landscape-image.html
hero-split-copy-dual-cta-landscape-lightbox.html
hero-split-email-form-landscape-image.html
hero-split-image-left-copy-dual-cta.html
hero-split-video-lightbox-left-copy-dual-cta.html
hero-split-video-lightbox-left-email-form.html
hero-top-split-email-video-lightbox.html
hero-video-email-split-band.html
```

- [ ] **Step 2: Import only reviewed Header 6–25 files and the cumulative catalog**

Run:

```bash
git checkout codex/header26-30-batch -- \
  templates/blocks/index.html \
  templates/blocks/hero-centered-copy-dual-cta.html \
  templates/blocks/hero-centered-email-capture.html \
  templates/blocks/hero-centered-search.html \
  templates/blocks/hero-cover-image-email-split-band.html \
  templates/blocks/hero-email-copy-image-left.html \
  templates/blocks/hero-fullscreen-bg-left-email-capture.html \
  templates/blocks/hero-fullscreen-bg-video-left-copy-dual-cta.html \
  templates/blocks/hero-fullscreen-media-top-copy-band-dual-cta.html \
  templates/blocks/hero-fullscreen-video-email-form.html \
  templates/blocks/hero-fullscreen-video-top-copy-band-dual-cta.html \
  templates/blocks/hero-lightbox-top-copy-band-dual-cta.html \
  templates/blocks/hero-lightbox-top-email-split-band.html \
  templates/blocks/hero-split-copy-dual-cta-landscape-image.html \
  templates/blocks/hero-split-copy-dual-cta-landscape-lightbox.html \
  templates/blocks/hero-split-email-form-landscape-image.html \
  templates/blocks/hero-split-image-left-copy-dual-cta.html \
  templates/blocks/hero-split-video-lightbox-left-copy-dual-cta.html \
  templates/blocks/hero-split-video-lightbox-left-email-form.html \
  templates/blocks/hero-top-split-email-video-lightbox.html \
  templates/blocks/hero-video-email-split-band.html \
  tests/components/header{6..25}-header.spec.cjs \
  docs/workflows/relume-to-ren10/modules/header{6..25}
```

Expected: twenty new block pages, twenty header suites, twenty workflow directories, and a catalog with twenty-five header cards.

- [ ] **Step 3: Normalize imported detail markup**

For every imported header, preserve its existing `rh6` through `rh25` root class and `data-rh6-root` through `data-rh25-root` attribute, then add the shared classes to the three outer regions. Header 6 is the concrete pattern:

```html
<main class="dx-shell bb-detail-page">
  <header class="bb-detail-header ren-stack">
    <!-- existing breadcrumb, Header block kicker, title, and description -->
  </header>

  <section class="rh6-hero bb-detail-preview" data-rh6-root>
    <!-- existing reviewed block implementation -->
  </section>

  <nav class="bb-block-pagination ren-grid ren-grid-2" aria-label="Block pagination">
    <!-- named previous and next destinations, rebuilt in Task 6 -->
  </nav>
</main>
```

Do not alter internal interactions during this normalization step.

- [ ] **Step 4: Run imported suites and shared shell coverage**

Run:

```bash
npx playwright test --config tests/components/playwright.config.cjs \
  tests/components/header{6..25}-header.spec.cjs \
  tests/components/block-detail-shell.spec.cjs \
  --project="Desktop Light" --workers=1 --retries=0
```

Expected: all Header 6–25 contracts and all detail shell cases pass.

- [ ] **Step 5: Commit the reviewed cumulative batch**

```bash
git add templates/blocks docs/workflows/relume-to-ren10/modules/header{6..25} tests/components
git commit -m "feat(headers): consolidate reviewed Headers 6 through 25"
```

### Task 3: Consolidate independently reviewed Headers 26–28

**Files:**
- Import from `codex/header26`: `templates/blocks/hero-centered-copy-dual-cta-landscape-image.html`, `tests/components/header26-header.spec.cjs`, `docs/workflows/relume-to-ren10/modules/header26`
- Import from `codex/header27`: `templates/blocks/hero-centered-email-capture-landscape-image.html`, `tests/components/header27-header.spec.cjs`, `docs/workflows/relume-to-ren10/modules/header27`
- Import from `codex/header28`: `templates/blocks/hero-centered-copy-dual-cta-landscape-lightbox.html`, `tests/components/header28-header.spec.cjs`, `docs/workflows/relume-to-ren10/modules/header28`
- Modify: the three imported HTML files for shared detail chrome only

**Interfaces:**
- Consumes: Task 1 shell contract and independently green branches `codex/header26`, `codex/header27`, `codex/header28`.
- Produces: runnable Headers 26–28 with their original evidence preserved.

- [ ] **Step 1: Import exact reviewed files without their divergent catalog copies**

```bash
git checkout codex/header26 -- \
  templates/blocks/hero-centered-copy-dual-cta-landscape-image.html \
  tests/components/header26-header.spec.cjs \
  docs/workflows/relume-to-ren10/modules/header26

git checkout codex/header27 -- \
  templates/blocks/hero-centered-email-capture-landscape-image.html \
  tests/components/header27-header.spec.cjs \
  docs/workflows/relume-to-ren10/modules/header27

git checkout codex/header28 -- \
  templates/blocks/hero-centered-copy-dual-cta-landscape-lightbox.html \
  tests/components/header28-header.spec.cjs \
  docs/workflows/relume-to-ren10/modules/header28
```

- [ ] **Step 2: Normalize the three detail pages**

Apply the Task 2 outer structure without changing the reviewed root selectors:

```text
[data-rh26-root]
[data-rh27-root]
[data-rh28-root]
```

Every page must expose one `.bb-detail-header`, one `.bb-detail-preview`, and one `.bb-block-pagination` with two real links.

- [ ] **Step 3: Verify the independent contracts remain green**

```bash
npx playwright test --config tests/components/playwright.config.cjs \
  tests/components/header26-header.spec.cjs \
  tests/components/header27-header.spec.cjs \
  tests/components/header28-header.spec.cjs \
  tests/components/block-detail-shell.spec.cjs \
  --project="Desktop Light" --project="Mobile Light" --workers=1 --retries=0
```

Expected: Header 26–28 and shared shell cases pass in both projects.

- [ ] **Step 4: Commit the imported reviewed headers**

```bash
git add templates/blocks docs/workflows/relume-to-ren10/modules/header{26..28} tests/components
git commit -m "feat(headers): consolidate reviewed Headers 26 through 28"
```

### Task 4: Build Header 29 — centered email capture above landscape lightbox

**Files:**
- Create: `docs/workflows/relume-to-ren10/modules/header29/reference-brief.md`
- Create: `docs/workflows/relume-to-ren10/modules/header29/reference-evidence.json`
- Create: `docs/workflows/relume-to-ren10/modules/header29/translation-map.md`
- Create: `docs/workflows/relume-to-ren10/modules/header29/acceptance.json`
- Create: `docs/workflows/relume-to-ren10/modules/header29/render-matrix.json`
- Create: remaining standard packet/evidence files required by `scripts/relume-workflow.mjs`
- Create: `tests/components/header29-header.spec.cjs`
- Create: `templates/blocks/hero-centered-email-capture-landscape-lightbox.html`

**Interfaces:**
- Consumes: official reference image `https://cdn.prod.website-files.com/61789b489343c8242282a0ae/618f3e80d085c4ba2a68d6ee_6185057ad81cfd065db51b02_section-header29.png`; Ren10 `ren-form`, `ren-field`, `ren-button`, `ren-link`, `ren-dialog`, `ren-spinner`, `ren-frame`, `ren-stack`, `ren-cluster`, and shared detail chrome contracts.
- Produces: `[data-rh29-root]`, `#rh29-heading`, `.rh29-form`, `.rh29-media-trigger`, and `ren-dialog#rh29-video`.

- [ ] **Step 1: Load every required Ren10 contract before writing markup**

Read completely:

```text
base/primitive-zero.md
components/components.md
components/primitives/ren-button/component.md
components/primitives/ren-field/component.md
components/primitives/ren-link/component.md
components/primitives/ren-spinner/component.md
components/composites/ren-dialog/component.md
components/patterns/ren-form/pattern.md
```

- [ ] **Step 2: Scaffold and populate the Header 29 workflow packet**

Run:

```bash
node scripts/relume-workflow.mjs init \
  --family headers \
  --module header29 \
  --block hero-centered-email-capture-landscape-lightbox \
  --path templates/blocks/hero-centered-email-capture-landscape-lightbox.html \
  --test-path tests/components/header29-header.spec.cjs
```

The acceptance file must require exactly this anatomy:

```json
{
  "version": 1,
  "module": "header29",
  "requirements": [
    "Centered heading and description above one email form",
    "One labeled required email field, one submit button, terms link, and polite success status",
    "One wide 16:9 landscape media trigger below the copy",
    "One ren-dialog lightbox with named close control, spinner, and iframe",
    "One-column composition at every width; form row stacks below 40rem",
    "Shared detail chrome and two named pagination links"
  ]
}
```

- [ ] **Step 3: Write the failing Header 29 browser contract**

Create `tests/components/header29-header.spec.cjs` with core assertions:

```js
// @ts-check
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const path = require('node:path');
const { startStaticServer } = require('../utils/static-server.cjs');
const { expectNoOverflow } = require('../utils/block-quality.cjs');

const ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-centered-email-capture-landscape-lightbox.html';
let server;

test.beforeAll(async () => { server = await startStaticServer(ROOT); });
test.afterAll(async () => { await server?.close(); });

test.beforeEach(async ({ page }) => {
  const response = await page.goto(`${server.origin}${BLOCK}`);
  expect(response?.status()).toBe(200);
});

test('owns centered email capture and one landscape lightbox', async ({ page }) => {
  const root = page.locator('[data-rh29-root]');
  await expect(root.locator('#rh29-heading')).toHaveCount(1);
  await expect(root.locator('form.rh29-form')).toHaveCount(1);
  await expect(root.locator('input[type="email"][required]')).toHaveCount(1);
  await expect(root.locator('button[type="submit"]')).toHaveCount(1);
  await expect(root.locator('.rh29-terms a[href]')).toHaveCount(1);
  await expect(root.locator('.rh29-media-trigger')).toHaveCount(1);
  await expect(page.locator('ren-dialog#rh29-video')).toHaveCount(1);
});

test('opens, closes, restores focus, and passes axe', async ({ page }) => {
  const trigger = page.locator('.rh29-media-trigger');
  await trigger.focus();
  await trigger.press('Enter');
  await expect(page.locator('#rh29-video')).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(page.locator('#rh29-video')).not.toHaveAttribute('open', '');
  await expect(trigger).toBeFocused();
  await injectAxe(page);
  await checkA11y(page, '[data-rh29-root]', { detailedReport: true });
});

for (const width of [320, 390, 639, 640, 768, 1280]) {
  test(`has no overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.reload();
    await expectNoOverflow(page, 'html');
  });
}
```

- [ ] **Step 4: Run the Header 29 suite to verify RED**

```bash
npx playwright test --config tests/components/playwright.config.cjs \
  tests/components/header29-header.spec.cjs \
  --project="Desktop Light" --workers=1 --retries=0
```

Expected: FAIL because the Header 29 HTML page does not exist.

- [ ] **Step 5: Implement the minimal semantic anatomy**

The preview body must contain:

```html
<section class="rh29-hero bb-detail-preview" data-rh29-root aria-labelledby="rh29-heading">
  <div class="rh29-content ren-center ren-center-wide ren-stack">
    <div class="rh29-copy ren-center ren-center-prose ren-stack">
      <h1 id="rh29-heading">Move from signal to shared direction</h1>
      <p class="rh29-description">Capture the next useful idea, then show the work clearly enough for everyone to move.</p>
      <ren-form data-validate="onSubmit">
        <form class="rh29-form ren-stack" novalidate>
          <div class="ren-form-error-summary" role="alert" tabindex="-1" hidden>
            <strong>Check your email address.</strong><ul></ul>
          </div>
          <div class="rh29-form-row ren-grid ren-grid-2">
            <ren-field data-rules="required|email">
              <label for="rh29-email">Work email</label>
              <input id="rh29-email" class="ren-input" name="email" type="email" autocomplete="email" required>
              <span data-error></span>
            </ren-field>
            <button class="ren-btn" type="submit">Get the field guide</button>
          </div>
          <p class="rh29-terms">By subscribing, you agree to the <a class="ren-link" href="../../LICENSE">terms of use</a>.</p>
          <p class="rh29-status" role="status" aria-live="polite"></p>
        </form>
      </ren-form>
    </div>
    <button class="rh29-media-trigger" type="button" data-dialog-trigger="rh29-video" aria-label="Play the Ren10 overview video">
      <span class="rh29-poster ren-frame" aria-hidden="true"><img src="../../examples/reference-app/screenshots/light.png" alt=""></span>
      <span class="rh29-play ren-center" aria-hidden="true">▶</span>
    </button>
  </div>
</section>

<ren-dialog id="rh29-video" aria-labelledby="rh29-video-title">
  <dialog>
    <header class="ren-dialog-header">
      <h2 id="rh29-video-title" class="ren-dialog-title">Ren10 product overview</h2>
      <button class="ren-dialog-close" type="button" data-dialog-close aria-label="Close video">×</button>
    </header>
    <div class="ren-dialog-body">
      <div class="rh29-video-stage ren-frame">
        <span class="ren-spinner" aria-label="Loading video"></span>
        <iframe title="Ren10 product overview" loading="lazy" allow="autoplay; fullscreen"></iframe>
      </div>
    </div>
  </dialog>
</ren-dialog>
```

Use `.rh29-form-row { grid-template-columns: minmax(0, 1fr) max-content; }` and override it to `1fr` inside `@media (max-width: 39.999rem)`. All other spacing and visual values use Ren10 tokens.

- [ ] **Step 6: Run Header 29 tests and complete workflow evidence**

```bash
npx playwright test --config tests/components/playwright.config.cjs \
  tests/components/header29-header.spec.cjs \
  --project="Desktop Light" --project="Mobile Light" --workers=1 --retries=0
node scripts/relume-workflow.mjs status \
  docs/workflows/relume-to-ren10/modules/header29
```

Expected: tests pass and workflow status reaches `green` after evidence files are populated with actual command results.

- [ ] **Step 7: Commit Header 29**

```bash
git add templates/blocks/hero-centered-email-capture-landscape-lightbox.html \
  tests/components/header29-header.spec.cjs \
  docs/workflows/relume-to-ren10/modules/header29
git commit -m "feat(headers): add Header 29 email lightbox hero"
```

### Task 5: Build Header 30 — fullscreen background media with centered dual CTA

**Files:**
- Create: complete `docs/workflows/relume-to-ren10/modules/header30` packet
- Create: `tests/components/header30-header.spec.cjs`
- Create: `templates/blocks/hero-fullscreen-bg-centered-copy-dual-cta.html`

**Interfaces:**
- Consumes: official reference image `https://cdn.prod.website-files.com/61789b489343c8242282a0ae/618f3e8164c3a6b7e6d564e1_6185057cdac8095d20087d5c_section-header30.png`; `ren-cover`, `ren-center`, `ren-stack`, `ren-cluster`, `ren-button`, `ren-link`, and shared detail chrome.
- Produces: `[data-rh30-root]`, `#rh30-heading`, `.rh30-background`, `.rh30-scrim`, and exactly two CTA links.

- [ ] **Step 1: Scaffold the Header 30 packet**

```bash
node scripts/relume-workflow.mjs init \
  --family headers \
  --module header30 \
  --block hero-fullscreen-bg-centered-copy-dual-cta \
  --path templates/blocks/hero-fullscreen-bg-centered-copy-dual-cta.html \
  --test-path tests/components/header30-header.spec.cjs
```

Acceptance requirements:

```json
{
  "version": 1,
  "module": "header30",
  "requirements": [
    "One full-height background image with decorative alt text and one scrim",
    "Centered heading, description, primary CTA, and secondary CTA",
    "Readable text contrast in light and dark themes",
    "Content remains centered and visible from 320 through 1440 pixels",
    "Reduced motion has no nonzero authored animation or transition",
    "Shared detail chrome and two named pagination links"
  ]
}
```

- [ ] **Step 2: Write the failing Header 30 contract**

Create `tests/components/header30-header.spec.cjs` with:

```js
// @ts-check
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const path = require('node:path');
const { startStaticServer } = require('../utils/static-server.cjs');
const { expectNoOverflow } = require('../utils/block-quality.cjs');

const ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-fullscreen-bg-centered-copy-dual-cta.html';
let server;

test.beforeAll(async () => { server = await startStaticServer(ROOT); });
test.afterAll(async () => { await server?.close(); });

test.beforeEach(async ({ page }) => {
  const response = await page.goto(`${server.origin}${BLOCK}`);
  expect(response?.status()).toBe(200);
});

test('owns one centered fullscreen composition', async ({ page }) => {
  const root = page.locator('[data-rh30-root]');
  await expect(root.locator('.rh30-background img')).toHaveCount(1);
  await expect(root.locator('.rh30-scrim')).toHaveCount(1);
  await expect(root.locator('#rh30-heading')).toHaveCount(1);
  await expect(root.locator('.rh30-actions > a.ren-btn')).toHaveCount(2);
  const geometry = await root.evaluate((element) => {
    const rootRect = element.getBoundingClientRect();
    const contentRect = element.querySelector('.rh30-content').getBoundingClientRect();
    return {
      minHeight: rootRect.height,
      centerDelta: Math.abs(
        contentRect.top + contentRect.height / 2 -
        (rootRect.top + rootRect.height / 2)
      ),
    };
  });
  expect(geometry.minHeight).toBeGreaterThanOrEqual(640);
  expect(geometry.centerDelta).toBeLessThanOrEqual(2);
});

test('passes axe and has no overflow', async ({ page }) => {
  await injectAxe(page);
  await checkA11y(page, '[data-rh30-root]', { detailedReport: true });
  await expectNoOverflow(page, 'html');
});
```

- [ ] **Step 3: Run Header 30 tests to verify RED**

```bash
npx playwright test --config tests/components/playwright.config.cjs \
  tests/components/header30-header.spec.cjs \
  --project="Desktop Light" --workers=1 --retries=0
```

Expected: FAIL because the Header 30 page does not exist.

- [ ] **Step 4: Implement the verified fullscreen anatomy**

Use this exact preview structure:

```html
<section class="rh30-hero ren-cover bb-detail-preview" data-rh30-root aria-labelledby="rh30-heading">
  <figure class="rh30-background" aria-hidden="true">
    <img src="../../examples/reference-app/screenshots/dark.png" alt="" width="1280" height="1845">
  </figure>
  <div class="rh30-scrim" aria-hidden="true"></div>
  <div class="rh30-content ren-cover-center ren-center ren-center-prose ren-stack">
    <h1 id="rh30-heading">Bring every decision into clear focus</h1>
    <p>Build a durable system for the work, context, and conversations that move your product forward.</p>
    <div class="rh30-actions ren-cluster" aria-label="Hero actions">
      <a class="ren-btn" href="../../docs/getting-started.html">Start building</a>
      <a class="ren-btn ren-btn-outline" href="../../docs/components.html">Explore components</a>
    </div>
  </div>
</section>
```

The root uses `--cover-height: min(80dvh, 50rem)`, while the canonical standalone capture asserts at least 640px at desktop. The background and scrim are absolutely positioned; content remains a positioned Grid child above them. Use `--color-overlay`, `--color-text-inverted`, and documented button component tokens for contrast.

- [ ] **Step 5: Run Header 30 tests and complete workflow evidence**

```bash
npx playwright test --config tests/components/playwright.config.cjs \
  tests/components/header30-header.spec.cjs \
  --project="Desktop Light" --project="Mobile Light" --workers=1 --retries=0
node scripts/relume-workflow.mjs status \
  docs/workflows/relume-to-ren10/modules/header30
```

Expected: tests pass and the packet reaches `green` with actual measurements recorded.

- [ ] **Step 6: Commit Header 30**

```bash
git add templates/blocks/hero-fullscreen-bg-centered-copy-dual-cta.html \
  tests/components/header30-header.spec.cjs \
  docs/workflows/relume-to-ren10/modules/header30
git commit -m "feat(headers): add Header 30 centered fullscreen hero"
```

### Task 6: Rebuild catalog order, pagination chain, and global header polish

**Files:**
- Modify: `templates/blocks/index.html`
- Modify: all thirty `templates/blocks/hero-*.html`
- Modify: `tests/components/blocks-headers.spec.cjs`
- Modify: `tests/components/header-docs-navigation.spec.cjs`
- Modify: `tests/components/header-media-rhythm.spec.cjs`
- Modify: `tests/components/block-detail-shell.spec.cjs`

**Interfaces:**
- Consumes: thirty header pages and shared shell selectors from Tasks 1–5.
- Produces: one ordered catalog and an unbroken static navigation chain across the complete block library.

- [ ] **Step 1: Extend catalog tests before editing the catalog**

Add these assertions to `tests/components/blocks-headers.spec.cjs`:

```js
test('catalog exposes exactly thirty ordered headers', async ({ page }) => {
  await page.goto(`${origin}/templates/blocks/index.html`);
  const cards = page.locator('a.bb-card[href^="hero-"]');
  await expect(cards).toHaveCount(30);
  const labels = await cards.locator('.bb-card-eyebrow').allTextContents();
  expect(labels).toEqual(Array.from({ length: 30 }, (_, index) => `Header ${index + 1}`));
});

test('every header destination resolves', async ({ page }) => {
  await page.goto(`${origin}/templates/blocks/index.html`);
  const hrefs = await page.locator('a.bb-card[href^="hero-"]').evaluateAll(
    (links) => links.map((link) => link.getAttribute('href'))
  );
  for (const href of hrefs) {
    const response = await page.request.get(`${origin}/templates/blocks/${href}`);
    expect(response.status(), href).toBe(200);
  }
});
```

- [ ] **Step 2: Run catalog tests to verify RED**

```bash
npx playwright test --config tests/components/playwright.config.cjs \
  tests/components/blocks-headers.spec.cjs \
  --project="Desktop Light" --workers=1 --retries=0
```

Expected: FAIL because the catalog has only twenty-five header cards.

- [ ] **Step 3: Add Header 26–30 cards in strict order**

Append cards with these exact labels and destinations:

```text
Header 26 → hero-centered-copy-dual-cta-landscape-image.html
Header 27 → hero-centered-email-capture-landscape-image.html
Header 28 → hero-centered-copy-dual-cta-landscape-lightbox.html
Header 29 → hero-centered-email-capture-landscape-lightbox.html
Header 30 → hero-fullscreen-bg-centered-copy-dual-cta.html
```

Each card uses `.bb-card.ren-stack-sm`, `.bb-card-eyebrow`, `.bb-card-title`, and `.bb-card-desc`.

- [ ] **Step 4: Rebuild every static previous/next destination from catalog order**

The complete chain is:

```text
last navigation block → Header 1 → Header 2 → … → Header 30 → All blocks
```

Each link must name its destination title:

```html
<a class="bb-block-pagination-link" href="hero-centered-email-capture-landscape-lightbox.html" rel="prev">
  <span aria-hidden="true">←</span>
  <span><span class="bb-block-pagination-direction">Previous</span><br>Centered email capture with landscape lightbox</span>
</a>
```

Do not leave generic `Previous block` or `Next block` labels.

- [ ] **Step 5: Audit all two-column hero roots**

Run:

```bash
rg -n 'ren-switcher|display:\s*flex' templates/blocks/hero-*.html
```

For every outer two-column content/media composition returned by the audit, append `ren-grid ren-grid-2` to that element's existing class list. For example, an existing `rh8-layout` root becomes:

```html
<div class="rh8-layout ren-grid ren-grid-2">
```

On each actual block selector (`.rh8-layout`, `.rh9-layout`, and the other selectors returned by the audit), set the desktop grid gap and alignment. The concrete `.rh8-layout` rule is:

```css
.rh8-layout {
  --grid-gap: var(--space-12);
  align-items: center;
}

@media (max-width: 47.999rem) {
  .rh8-layout {
    --grid-gap: var(--space-8);
    grid-template-columns: 1fr;
  }
}
```

Apply those same declarations to each audited block's existing layout selector; do not rename the selector or create a generic cross-block class.

Keep `ren-switcher` only for input/button rows whose intrinsic wrapping behavior is intentional.

- [ ] **Step 6: Run catalog, shell, media, and navigation suites**

```bash
npx playwright test --config tests/components/playwright.config.cjs \
  tests/components/blocks-headers.spec.cjs \
  tests/components/header-docs-navigation.spec.cjs \
  tests/components/header-media-rhythm.spec.cjs \
  tests/components/block-detail-shell.spec.cjs \
  --project="Desktop Light" --project="Mobile Light" --workers=1 --retries=0
```

Expected: 30 ordered cards, all destinations 200, all pages use shared detail chrome, and no overflow.

- [ ] **Step 7: Commit the unified catalog and polish**

```bash
git add templates/blocks site/shell.css tests/components
git commit -m "fix(headers): unify catalog rhythm and responsive grids"
```

### Task 7: Capture the final matrix and run repository release gates

**Files:**
- Modify: Header 29 and Header 30 capture/green evidence files
- Modify only if a defect is found: affected header HTML or test

**Interfaces:**
- Consumes: complete Header 1–30 catalog.
- Produces: fresh evidence that supports the completion claim.

- [ ] **Step 1: Capture Header 29 and Header 30 render matrices**

```bash
node scripts/capture-block-matrix.mjs \
  docs/workflows/relume-to-ren10/modules/header29/render-matrix.json \
  --module header29 --output .ren10-workflow/captures

node scripts/capture-block-matrix.mjs \
  docs/workflows/relume-to-ren10/modules/header30/render-matrix.json \
  --module header30 --output .ren10-workflow/captures
```

Expected: every declared state produces a PNG and metadata JSON with no missing selector/action.

- [ ] **Step 2: Run every Header 1–30 suite in Chromium**

```bash
npx playwright test --config tests/components/playwright.config.cjs \
  tests/components/header*-header.spec.cjs \
  tests/components/blocks-headers.spec.cjs \
  tests/components/header-docs-navigation.spec.cjs \
  tests/components/header-media-rhythm.spec.cjs \
  tests/components/block-detail-shell.spec.cjs \
  --project="Desktop Light" --project="Mobile Light" --workers=1 --retries=0
```

Expected: zero failures.

- [ ] **Step 3: Run a direct browser geometry audit at required seams**

For widths `320`, `390`, `767`, `768`, and `1280`, visit every `hero-*.html` page. Before each navigation, install this error collector with `page.addInitScript`, then assert the returned state:

```js
await page.addInitScript(() => {
  window.__capturedPageErrors = [];
  window.addEventListener('error', (event) => {
    window.__capturedPageErrors.push(event.message || 'window error');
  });
  window.addEventListener('unhandledrejection', (event) => {
    window.__capturedPageErrors.push(String(event.reason || 'unhandled rejection'));
  });
});
```

```js
({
  paginationLinks: document.querySelectorAll('.bb-block-pagination a[href]').length,
  overflow: document.documentElement.scrollWidth - innerWidth,
  pageErrors: window.__capturedPageErrors?.length ?? 0,
})
```

Expected for every page: `paginationLinks === 2`, `overflow <= 0`, `pageErrors === 0`.

- [ ] **Step 4: Run all Ren10 static gates**

```bash
rg -n "rends/design\.md|DESIGN\.md|COMPONENT\.md|PATTERN\.md|TOKENS\.md|LAYOUTS\.md|PRIMITIVE-ZERO\.md|COMPONENTS\.md" . --glob '!node_modules/**'
find components/primitives -mindepth 2 -maxdepth 2 -type f -name component.md | wc -l
find components/composites -mindepth 2 -maxdepth 2 -type f -name component.md | wc -l
find components/patterns -mindepth 2 -maxdepth 2 -type f -name pattern.md | wc -l
npm run lint
npm run agent:check
git diff --check
```

Expected: stale-reference search returns no matches; counts are `19`, `26`, `8`; remaining commands exit 0.

- [ ] **Step 5: Review the final diff and commit fresh evidence fixes only if needed**

```bash
git status --short
git diff --stat
git log --oneline -8
```

Expected: no untracked implementation files, no unrelated paths, and a reviewable sequence of focused commits. If evidence or a final defect fix changed tracked files:

```bash
git add docs/workflows/relume-to-ren10/modules/header{29,30} templates/blocks tests/components
git commit -m "test(headers): record consolidated Header 1 through 30 evidence"
```
