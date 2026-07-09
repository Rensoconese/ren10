# Ren10 Navbar Drawer Block Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first Ren10 Blocks module: a standalone, copyable Navbar Drawer block made with RenDS vanilla HTML/CSS/JS.

**Architecture:** Add a new `templates/blocks/` area for independent Ren10 blocks. The first block page uses the existing docs/template shell, imports RenDS CSS, uses `ren-sheet` for the drawer, and scopes all demonstration styling to page-local `.rb-*` classes that consume RenDS tokens.

**Tech Stack:** Vanilla HTML, CSS custom properties, RenDS components/layout primitives, `ren-sheet` web component, Playwright or static browser checks for verification.

## Global Constraints

- Public output must not mention private reference libraries.
- No React, JSX, TSX, Tailwind, Radix imports, or external icon packages.
- Use semantic HTML: `nav`, `a`, `button`, `ul`, `li`, `address`, `section`, `header`.
- Use RenDS layout primitives before custom `display: flex` or `display: grid`.
- Use semantic/component tokens only; no hardcoded hex or primitive palette tokens in consumer CSS.
- Use real interactive elements with visible `:focus-visible` and accessible names.
- Light DOM only; no Shadow DOM workarounds.
- Keep unrelated existing changes in `ROADMAP.md`, `STATUS.md`, and `ENHANCEMENT-PLAN.md` untouched.

---

## File Structure

- Create `templates/blocks/index.html`
  - Owns the block catalog landing page.
  - Links to standalone block demos.
  - Uses existing `site/shell.css` chrome, RenDS layout primitives, and local
    `.bb-*` styles for presentation only.

- Create `templates/blocks/nav-drawer.html`
  - Owns the first standalone block demo.
  - Imports `../../index.css`, `../../components/index.css`, `../../themes/appearance.css`, `../../tokens/component/tokens.css`, and `../../site/shell.css`.
  - Imports `../../components/composites/ren-sheet/ren-sheet.js` as a module.
  - Uses RenDS layout primitives for structure and local `.rb-*` classes for
    demo-specific presentation only.

- Modify `templates/index.html`
  - Add one card linking to `blocks/index.html`.
  - Reuse the existing `.bx-card` pattern.

- No component source changes in this first pass.

---

### Task 1: Add The Blocks Catalog Entry Point

**Files:**
- Create: `templates/blocks/index.html`
- Modify: `templates/index.html`

**Interfaces:**
- Consumes: Existing template shell classes from `site/shell.css`, existing card classes in `templates/index.html`.
- Produces: A stable URL for later block pages: `templates/blocks/index.html`.

- [ ] **Step 1: Create `templates/blocks/index.html`**

Create the file with this complete page structure:

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blocks — RenDS Templates</title>
  <meta name="description" content="Standalone RenDS blocks for composing marketing and application pages.">
  <link rel="stylesheet" href="../../index.css">
  <link rel="stylesheet" href="../../components/index.css">
  <link rel="stylesheet" href="../../themes/appearance.css">
  <link rel="stylesheet" href="../../tokens/component/tokens.css">
  <link rel="stylesheet" href="../../site/shell.css">
  <style>
    .bb-hero {
      max-width: 72ch;
      padding-block: var(--space-12) var(--space-8);
    }

    .bb-hero h1 {
      margin: var(--space-2) 0 var(--space-4);
      font-size: clamp(var(--text-4xl), 6vw, var(--text-6xl));
      line-height: 1.05;
      font-weight: var(--weight-bold);
    }

    .bb-hero .lede {
      max-width: 58ch;
      margin: 0;
      color: var(--color-text-muted);
      font-size: var(--text-xl);
      line-height: 1.55;
    }

    .bb-card {
      padding: var(--space-6);
      color: inherit;
      text-decoration: none;
      background: var(--color-surface-raised);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      transition: border-color var(--duration-state) var(--ease-state-change),
        transform var(--duration-state) var(--ease-state-change);
    }

    .bb-card:hover {
      border-color: var(--color-border-accent);
      transform: translateY(-2px);
    }

    .bb-card:focus-visible {
      outline: var(--ring-width) solid var(--color-focus-ring);
      outline-offset: var(--ring-offset);
    }

    .bb-card-eyebrow {
      color: var(--color-text-muted);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .bb-card-title {
      margin: 0;
      font-size: var(--text-xl);
      font-weight: var(--weight-bold);
    }

    .bb-card-desc {
      margin: 0;
      color: var(--color-text-muted);
      font-size: var(--text-sm);
      line-height: 1.55;
    }

    .bb-card-arrow {
      color: var(--color-accent);
      font-weight: var(--weight-bold);
    }
  </style>
</head>
<body>
  <header class="dx-nav">
    <div class="dx-nav-inner">
      <a href="../../docs/index.html" class="dx-brand">
        <span class="dx-brand-mark">R</span>
        <span>RenDS</span>
        <span class="ren-badge ren-badge-secondary" style="margin-left: var(--space-1);">v0.9.0</span>
      </a>
      <nav class="dx-nav-menu" aria-label="Primary">
        <a href="../../docs/index.html">Docs</a>
        <a href="../../docs/components.html">Components</a>
        <a href="../index.html" aria-current="page">Templates</a>
        <a href="../../create/index.html">Theme Builder</a>
      </nav>
      <div class="dx-nav-actions">
        <a href="https://github.com/Rensoconese/ren10" class="ren-btn ren-btn-ghost ren-btn-sm">GitHub</a>
        <a href="../../docs/getting-started.html" class="ren-btn ren-btn-primary ren-btn-sm">Get started</a>
      </div>
    </div>
  </header>

  <main class="dx-shell">
    <header class="bb-hero">
      <p class="dx-kicker">Blocks</p>
      <h1>Standalone RenDS blocks</h1>
      <p class="lede">
        Composable page sections built from RenDS primitives, patterns, layout helpers,
        and tokens. Use one block at a time, or combine them into full templates.
      </p>
    </header>

    <section aria-labelledby="navigation-blocks">
      <p class="dx-kicker">Navigation</p>
      <h2 id="navigation-blocks">Navigation blocks</h2>
      <div class="ren-grid">
        <a class="bb-card ren-stack-sm" href="nav-drawer.html">
          <span class="bb-card-eyebrow">Navbar</span>
          <h3 class="bb-card-title">Navbar Drawer</h3>
          <p class="bb-card-desc">
            Compact brand, CTA, and drawer navigation built with a real nav landmark,
            RenDS buttons, and the sheet composite.
          </p>
          <span class="bb-card-arrow" aria-hidden="true">-&gt;</span>
        </a>
      </div>
    </section>
  </main>
</body>
</html>
```

- [ ] **Step 2: Link the block catalog from `templates/index.html`**

In the existing `.bx-grid`, add this card after the Landing page card:

```html
<a class="bx-card" href="blocks/index.html">
  <div class="bx-card-eyebrow">Blocks</div>
  <h2 class="bx-card-title">Composable blocks</h2>
  <p class="bx-card-desc">
    Standalone nav, hero, feature, pricing, FAQ, CTA, and footer sections
    built with RenDS primitives, patterns, and tokens.
  </p>
  <span class="bx-card-arrow" aria-hidden="true">-&gt;</span>
</a>
```

- [ ] **Step 3: Verify static links**

Run:

```bash
test -f templates/blocks/index.html
rg -n 'href="blocks/index.html"|href="nav-drawer.html"' templates/index.html templates/blocks/index.html
```

Expected:

```text
templates/index.html:...href="blocks/index.html"
templates/blocks/index.html:...href="nav-drawer.html"
```

- [ ] **Step 4: Commit Task 1**

```bash
git add templates/index.html templates/blocks/index.html
git commit -m "docs: add ren10 blocks catalog"
```

---

### Task 2: Add The Navbar Drawer Block Demo

**Files:**
- Create: `templates/blocks/nav-drawer.html`

**Interfaces:**
- Consumes: `ren-sheet` trigger API through `[data-sheet-trigger="rb-nav-drawer"]` and close API through `[data-sheet-close]`.
- Produces: A copyable standalone block demo at `templates/blocks/nav-drawer.html`.

- [ ] **Step 1: Create `templates/blocks/nav-drawer.html`**

Create the file with this complete page structure:

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Navbar Drawer Block — RenDS Templates</title>
  <meta name="description" content="A standalone RenDS navbar drawer block built with vanilla HTML, CSS, and ren-sheet.">
  <link rel="stylesheet" href="../../index.css">
  <link rel="stylesheet" href="../../components/index.css">
  <link rel="stylesheet" href="../../themes/appearance.css">
  <link rel="stylesheet" href="../../tokens/component/tokens.css">
  <link rel="stylesheet" href="../../site/shell.css">
  <style>
    .rb-page-header {
      max-width: 74ch;
      padding-block: var(--space-8);
    }

    .rb-page-header h1 {
      margin: var(--space-2) 0 var(--space-3);
      font-size: clamp(var(--text-3xl), 5vw, var(--text-5xl));
      line-height: 1.1;
      font-weight: var(--weight-bold);
    }

    .rb-page-header .lede {
      margin: 0;
      color: var(--color-text-muted);
      font-size: var(--text-lg);
      line-height: 1.55;
    }

    .rb-preview {
      overflow: hidden;
      margin-block: var(--space-6) var(--space-10);
      background: var(--color-surface-raised);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
    }

    .rb-nav {
      min-height: 72px;
      padding: var(--space-3) var(--space-5);
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
    }

    .rb-brand {
      min-height: var(--touch-min);
      color: var(--color-text);
      text-decoration: none;
      font-weight: var(--weight-bold);
    }

    .rb-brand-mark {
      width: 32px;
      height: 32px;
      color: var(--color-surface);
      background: var(--color-text);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: var(--weight-bold);
    }

    .rb-menu-icon {
      gap: 4px;
      width: 18px;
    }

    .rb-menu-icon span {
      display: block;
      height: 2px;
      background: currentColor;
      border-radius: var(--radius-full);
    }

    .rb-hero {
      padding: clamp(var(--space-8), 8vw, var(--space-16));
      min-height: 360px;
      align-content: center;
      background:
        linear-gradient(135deg, var(--color-surface), var(--color-surface-sunken));
    }

    .rb-hero h2 {
      max-width: 13ch;
      margin: 0;
      font-size: clamp(var(--text-4xl), 7vw, var(--text-7xl));
      line-height: 1;
      font-weight: var(--weight-bold);
    }

    .rb-hero p {
      max-width: 56ch;
      margin: 0;
      color: var(--color-text-muted);
      font-size: var(--text-lg);
      line-height: 1.6;
    }

    .rb-drawer-links {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .rb-drawer-links a {
      min-height: var(--touch-min);
      color: var(--color-text);
      text-decoration: none;
      font-size: var(--text-3xl);
      font-weight: var(--weight-bold);
      line-height: 1.1;
      border-radius: var(--radius-md);
    }

    .rb-drawer-links a:hover {
      color: var(--color-accent);
    }

    .rb-drawer-links a:focus-visible {
      outline: var(--ring-width) solid var(--color-focus-ring);
      outline-offset: var(--ring-offset);
    }

    .rb-drawer-meta {
      margin-block-start: var(--space-8);
      color: var(--color-text-muted);
      font-style: normal;
    }

    .rb-drawer-meta strong {
      color: var(--color-text);
      font-size: var(--text-sm);
    }

    .rb-drawer-meta a {
      color: var(--color-text);
    }

    .rb-social a {
      min-height: var(--touch-min);
      color: var(--color-text-muted);
      text-decoration: none;
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
    }

    .rb-social a:hover {
      color: var(--color-text);
    }

    @media (max-width: 640px) {
      .rb-nav {
        padding-inline: var(--space-4);
      }

      .rb-nav-actions .ren-btn:not(.ren-btn-icon) {
        display: none;
      }

      .rb-drawer-links a {
        font-size: var(--text-2xl);
      }
    }
  </style>
</head>
<body>
  <header class="dx-nav">
    <div class="dx-nav-inner">
      <a href="../../docs/index.html" class="dx-brand">
        <span class="dx-brand-mark">R</span>
        <span>RenDS</span>
        <span class="ren-badge ren-badge-secondary" style="margin-left: var(--space-1);">v0.9.0</span>
      </a>
      <nav class="dx-nav-menu" aria-label="Primary">
        <a href="../../docs/index.html">Docs</a>
        <a href="../../docs/components.html">Components</a>
        <a href="../index.html" aria-current="page">Templates</a>
        <a href="../../create/index.html">Theme Builder</a>
      </nav>
      <div class="dx-nav-actions">
        <a href="https://github.com/Rensoconese/ren10" class="ren-btn ren-btn-ghost ren-btn-sm">GitHub</a>
        <a href="../../docs/getting-started.html" class="ren-btn ren-btn-primary ren-btn-sm">Get started</a>
      </div>
    </div>
  </header>

  <main class="dx-shell">
    <header class="rb-page-header">
      <nav class="ren-breadcrumb" aria-label="Breadcrumb" style="margin-bottom: var(--space-4);">
        <ol>
          <li><a href="../index.html" class="ren-link-plain">Templates</a></li>
          <li><a href="index.html" class="ren-link-plain">Blocks</a></li>
          <li aria-current="page">Navbar Drawer</li>
        </ol>
      </nav>
      <p class="dx-kicker">Navbar block</p>
      <h1>Navbar Drawer</h1>
      <p class="lede">
        A compact navigation block with a brand, primary action, and edge drawer.
        It uses semantic navigation markup, RenDS buttons, and the sheet composite.
      </p>
    </header>

    <section class="rb-preview" aria-label="Navbar drawer preview">
      <nav class="rb-nav ren-row-spread" aria-label="Example site">
        <a class="rb-brand ren-row" href="#">
          <span class="rb-brand-mark ren-center" aria-hidden="true">A</span>
          <span>Atlas Studio</span>
        </a>
        <div class="rb-nav-actions ren-cluster">
          <a class="ren-btn ren-btn-secondary" href="#">Book a call</a>
          <button class="ren-btn ren-btn-icon" type="button" data-sheet-trigger="rb-nav-drawer" aria-label="Open navigation menu">
            <span class="rb-menu-icon ren-stack-sm" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </nav>

      <div class="rb-hero ren-stack">
        <h2>Clearer systems for growing teams.</h2>
        <p>
          A quiet marketing surface showing how the drawer keeps primary navigation
          available without crowding the first viewport.
        </p>
        <p>
          <a class="ren-btn" href="#">Start a project</a>
          <a class="ren-btn ren-btn-ghost" href="#">View services</a>
        </p>
      </div>
    </section>

    <ren-sheet side="right" size="md" id="rb-nav-drawer">
      <header class="ren-sheet-header">
        <h2 class="ren-sheet-title">Navigation</h2>
        <button type="button" class="ren-sheet-close" data-sheet-close aria-label="Close navigation menu">×</button>
      </header>
      <div class="ren-sheet-body">
        <ul class="rb-drawer-links ren-stack-sm">
          <li><a href="#" data-sheet-close>Work</a></li>
          <li><a href="#" data-sheet-close>Services</a></li>
          <li><a href="#" data-sheet-close>Process</a></li>
          <li><a href="#" data-sheet-close>Notes</a></li>
          <li><a href="#" data-sheet-close>Contact</a></li>
        </ul>
        <address class="rb-drawer-meta ren-stack">
          <strong>Get in touch</strong>
          <a href="mailto:hello@example.com">hello@example.com</a>
          <span>Buenos Aires, Argentina</span>
        </address>
        <div class="rb-social ren-cluster" aria-label="Social links">
          <a href="#">LinkedIn</a>
          <a href="#">Instagram</a>
          <a href="#">X</a>
        </div>
      </div>
      <footer class="ren-sheet-footer">
        <a class="ren-btn ren-btn-full" href="#" data-sheet-close>Book a call</a>
      </footer>
    </ren-sheet>
  </main>

  <script type="module" src="../../components/composites/ren-sheet/ren-sheet.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify required RenDS contracts are represented**

Run:

```bash
rg -n '<nav class="rb-nav"|<ren-sheet|data-sheet-trigger="rb-nav-drawer"|data-sheet-close|aria-label="Open navigation menu"|ren-sheet-title|ren-btn-icon' templates/blocks/nav-drawer.html
```

Expected: every pattern is found at least once.

- [ ] **Step 3: Commit Task 2**

```bash
git add templates/blocks/nav-drawer.html
git commit -m "docs: add navbar drawer block"
```

---

### Task 3: Verify Browser Behavior And Responsiveness

**Files:**
- Inspect: `templates/blocks/nav-drawer.html`
- No source changes unless verification finds a concrete issue.

**Interfaces:**
- Consumes: The `ren-sheet` global trigger listener from `ren-sheet.js`.
- Produces: Verified behavior at mobile and desktop widths.

- [ ] **Step 1: Start a static server**

Run from `rends/`:

```bash
python3 -m http.server 4173
```

Expected: server reports it is serving on `http://0.0.0.0:4173/`.

- [ ] **Step 2: Open the block page at desktop width**

Use Playwright or a browser at:

```text
http://localhost:4173/templates/blocks/nav-drawer.html
```

Viewport:

```text
1280x900
```

Expected:

- Top docs nav is visible.
- Block preview is visible.
- Brand, CTA, and icon menu trigger fit without overlapping.
- Clicking the icon menu trigger opens the right sheet.
- Escape closes the sheet and returns focus to the trigger.

- [ ] **Step 3: Open the block page at mobile width**

Use viewport:

```text
390x844
```

Expected:

- Docs nav remains usable.
- Block CTA in the top preview hides and the icon menu trigger remains visible.
- Drawer links fit without horizontal overflow.
- Sheet close button has visible focus and closes the panel.

- [ ] **Step 4: Capture screenshots for review**

Save desktop and mobile screenshots under a temporary ignored location:

```text
/tmp/ren10-navbar-drawer-desktop.png
/tmp/ren10-navbar-drawer-mobile.png
```

Do not commit screenshots.

- [ ] **Step 5: Commit any verification fixes**

Only if source changed:

```bash
git add templates/blocks/nav-drawer.html templates/blocks/index.html templates/index.html
git commit -m "fix: polish navbar drawer block"
```

---

### Task 4: Run Repository Validation

**Files:**
- Inspect all files changed by Tasks 1-3.

**Interfaces:**
- Consumes: Existing RenDS lint and agent validation commands.
- Produces: Final confidence that docs, token policy, and agent checks still pass.

- [ ] **Step 1: Check uppercase stale contract references**

Run from `/Users/rensoconese/RenDS/rends`:

```bash
rg -n "rends/design\.md|DESIGN\.md|COMPONENT\.md|PATTERN\.md|TOKENS\.md|LAYOUTS\.md|PRIMITIVE-ZERO\.md|COMPONENTS\.md" . --glob '!node_modules/**'
```

Expected: no output.

- [ ] **Step 2: Check component contract counts**

Run:

```bash
find components/primitives -mindepth 2 -maxdepth 2 -type f -name component.md | wc -l
find components/composites -mindepth 2 -maxdepth 2 -type f -name component.md | wc -l
find components/patterns -mindepth 2 -maxdepth 2 -type f -name pattern.md | wc -l
```

Expected:

```text
19
26
8
```

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected: stylelint and token policy pass.

- [ ] **Step 4: Run agent checks**

Run:

```bash
npm run agent:check
```

Expected: agent smoke, skill check, doctor, evals, and knowledge check pass.

- [ ] **Step 5: Review final diff**

Run:

```bash
git status --short
git diff --stat HEAD~3..HEAD
```

Expected:

- New `templates/blocks/index.html`
- New `templates/blocks/nav-drawer.html`
- Modified `templates/index.html`
- No changes to unrelated user-edited files.

---

### Task 5: Final Documentation Handoff

**Files:**
- Inspect: `templates/blocks/index.html`
- Inspect: `templates/blocks/nav-drawer.html`
- Inspect: `templates/index.html`

**Interfaces:**
- Consumes: Completed implementation and validation logs.
- Produces: Concise final summary for the user.

- [ ] **Step 1: Summarize what shipped**

Final response should mention:

```text
Created the Ren10 Blocks catalog and first standalone Navbar Drawer block.
The block is vanilla RenDS: nav landmark, real links/buttons, ren-sheet drawer, token-based CSS, and no external UI dependencies.
```

- [ ] **Step 2: Summarize verification**

Final response should mention which commands passed:

```text
Verified with npm run lint and npm run agent:check.
```

If a command could not run or failed for an unrelated pre-existing reason, report the exact command and reason.

- [ ] **Step 3: Suggest the next block category**

Offer one concrete next block:

```text
Next good block: Feature Split Card, because it exercises layout, card composition, icon slots, and responsive media.
```
