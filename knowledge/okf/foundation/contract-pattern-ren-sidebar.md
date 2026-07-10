---
type: "RenDS Contract"
title: "ren-sidebar pattern.md"
description: "RenDS Contract generated from the RenDS knowledge graph."
id: contract:pattern:ren-sidebar
sourcePath: components/patterns/ren-sidebar/pattern.md
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - contract
  - ren10
  - rends
---

# ren-sidebar pattern.md

Source path: `components/patterns/ren-sidebar/pattern.md`

## Relationships

_No outgoing relationships._

## Structured Data

```json
{
  "kind": "pattern"
}
```

## Source Content

# ren-sidebar

Application sidebar pattern: persistent left/right navigation with desktop
collapse, mobile overlay, active-item state, and keyboard accessibility.
Pairs with a main content slot to form an app shell layout.

Load this file after `ren-design.md` and before generating, editing, or
reviewing any `<ren-sidebar>` UI.

## Purpose

The dashboard / app-shell sidebar pattern in RenDS. Owns:
- Persistent layout with `.ren-sidebar-layout` (sidebar + main content).
- Desktop collapsed / expanded states (`[data-collapsed]`).
- Mobile overlay state (`[data-open]`) with backdrop and Escape / outside
  click dismissal.
- Active item state via `aria-current="page"` plus `.active`.
- Persistence of collapse state in `localStorage`.
- Toggle button + keyboard support.

Sidebar items are real `<a>` (for routes) or `<button>` (for actions); they
are *not* `ren-link` / `ren-btn` — sidebar styling owns their chrome.

## Use When

- The product has persistent left/right navigation across multiple pages.
- The page is an app shell with sidebar + main layout (`.ren-sidebar-layout`).
- The sidebar must collapse on desktop and overlay on mobile.
- Persistence of collapse state across sessions matters.

## Do Not Use When

- The navigation is a top horizontal bar — use `ren-nav`.
- The navigation is a one-off menu inside another component — use
  `ren-menu` / `ren-menubar`.
- The sidebar is a transient panel — use `ren-sheet`.
- The sidebar is a single floating button toolbar — use `ren-toolbar`.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "The product needs persistent navigation across many pages."
    - "Desktop should support a collapsed (icon-only) and expanded state."
    - "Mobile should overlay with backdrop dismissal."
    - "Active route should be reflected via aria-current=\"page\"."
    - "Collapse state should persist in localStorage."
  avoidWhen:
    - "The navigation is a horizontal top bar — use ren-nav."
    - "The disclosure is transient or context-specific — use ren-sheet / ren-menu."
    - "The page does not have a multi-section nav."

canonicalImports:
  css:
    - "rends/components/patterns/ren-sidebar/ren-sidebar.css"
  js:
    - "rends/components/patterns/ren-sidebar/ren-sidebar.js"
  notes:
    - "JS handles toggle, persistence, and overlay dismissal. CSS-only fallback only renders the expanded desktop state."

requiredMarkup:
  - "Wrap the app shell in <div class=\"ren-sidebar-layout\">."
  - "<ren-sidebar> is the sidebar root; main content goes in a sibling <main class=\"ren-sidebar-main\">."
  - "Wrap items in <nav class=\"ren-sidebar-nav\"> with <a class=\"ren-sidebar-item\"> children."
  - "Use aria-current=\"page\" on the active item; the .active class is for styling parity."
  - "Provide an aria-label on <ren-sidebar> when multiple navigation landmarks exist on the page."
  - "Toggle button uses .ren-sidebar-toggle and aria-label (the icon alone is not a name)."

forbiddenPatterns:
  - "Wrapping non-nav content in <nav class=\"ren-sidebar-nav\">."
  - "Using ren-btn / ren-link as sidebar items — use .ren-sidebar-item directly."
  - "Hardcoded sidebar widths in inline styles; use --ren-sidebar-width."
  - "Manually toggling display: none for the mobile overlay; use the [data-open] state."

tokenPolicy:
  allowed:
    - "Component tokens: every --ren-sidebar-* listed in Public Token API."
    - "Semantic tokens for content (--color-text, --color-text-muted, etc.)."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, etc.) in consumer code."
    - "Hardcoded shadow / overlay colors that bypass tokens."

accessibility:
  required:
    - "Wrap items in a real <nav> landmark."
    - "Active item uses aria-current=\"page\"."
    - "Toggle button has aria-label and toggles aria-expanded if it controls disclosure."
    - "Collapsed icon-only items must keep accessible names from their link text (do not hide it from AT)."
    - "Mobile overlay closes on Escape and outside click."
```

## Required CSS / JS Imports

```html
<link rel="stylesheet" href="rends/components/patterns/ren-sidebar/ren-sidebar.css">
<script type="module" src="rends/components/patterns/ren-sidebar/ren-sidebar.js"></script>
```

## Canonical Markup

App shell with sidebar + main:

```html
<div class="ren-sidebar-layout">
  <ren-sidebar class="ren-sidebar" aria-label="Primary">
    <div class="ren-sidebar-header">
      <a class="ren-sidebar-item" href="/" aria-label="Home">
        <span class="ren-sidebar-item-icon" aria-hidden="true">⌂</span>
        <span class="ren-sidebar-item-text">Acme</span>
      </a>
    </div>

    <nav class="ren-sidebar-nav" aria-label="Main">
      <a class="ren-sidebar-item active" href="/dashboard" aria-current="page">
        <span class="ren-sidebar-item-icon" aria-hidden="true">📊</span>
        <span class="ren-sidebar-item-text">Dashboard</span>
      </a>
      <a class="ren-sidebar-item" href="/projects">
        <span class="ren-sidebar-item-icon" aria-hidden="true">📁</span>
        <span class="ren-sidebar-item-text">Projects</span>
      </a>
    </nav>

    <div class="ren-sidebar-section">
      <div class="ren-sidebar-section-label">Account</div>
      <a class="ren-sidebar-item" href="/settings">
        <span class="ren-sidebar-item-icon" aria-hidden="true">⚙</span>
        <span class="ren-sidebar-item-text">Settings</span>
      </a>
    </div>

    <button class="ren-sidebar-toggle" type="button" aria-label="Toggle sidebar"></button>
  </ren-sidebar>

  <main class="ren-sidebar-main">
    <!-- page content -->
  </main>
</div>
```

Programmatic API:

```js
const sidebar = document.querySelector('ren-sidebar');
sidebar.toggleMenu();
sidebar.setActiveItem('/projects');
sidebar.addEventListener('ren-sidebar-toggle', (e) => console.log(e.detail.collapsed));
```

## Attributes, Events, and API

- Host states:
  - `[data-collapsed]` — desktop collapsed (icon-only).
  - `[data-open]` — mobile overlay open.
- Active item: `.active` class plus `aria-current="page"` on the
  current `.ren-sidebar-item`.
- Methods: `toggleMenu()`, `openMobileMenu()`, `closeMobileMenu()`,
  `setActiveItem(href)`.
- Getters: `isCollapsed`, `isMobileOpen`.
- Event: `ren-sidebar-toggle` (`detail.collapsed`).
- Persistence: collapse state stored in `localStorage` under
  `ren-sidebar-collapsed`.

## Variants and Public Selectors

| Class                            | Role                                |
|----------------------------------|-------------------------------------|
| `.ren-sidebar`                   | Sidebar root chrome.                |
| `.ren-sidebar-layout`            | Layout wrapper (sidebar + main).    |
| `.ren-sidebar-main`              | Main-content slot.                  |
| `.ren-sidebar-header`            | Header slot.                        |
| `.ren-sidebar-content`           | Scrollable middle slot.             |
| `.ren-sidebar-footer`            | Footer slot.                        |
| `.ren-sidebar-nav`               | `<nav>` wrapper.                    |
| `.ren-sidebar-section`           | Grouped section.                    |
| `.ren-sidebar-section-label`     | Section heading text.               |
| `.ren-sidebar-item`              | Single nav item.                    |
| `.ren-sidebar-item-icon`         | Icon slot inside an item.           |
| `.ren-sidebar-item-text`         | Text slot inside an item.           |
| `.ren-sidebar-divider`           | Visual divider between sections.    |
| `.ren-sidebar-toggle`            | Collapse button.                    |
| `.ren-sidebar-overlay`           | Mobile backdrop.                    |

## States

| Selector / attr        | Meaning                                |
|------------------------|----------------------------------------|
| `[aria-current="page"]`| Active route on the current item.      |
| `[aria-disabled]`      | Disabled item (still focusable).       |
| `[data-collapsed]`     | Desktop collapsed (icon-only) state.   |
| `[data-open]`          | Mobile overlay open.                   |
| `:focus-visible`       | Keyboard focus on an item or toggle.   |

## Public Token API

- `--ren-sidebar-bg`
- `--ren-sidebar-border`
- `--ren-sidebar-width`
- `--ren-sidebar-collapsed-width`
- `--ren-sidebar-item-height`
- `--ren-sidebar-item-padding`
- `--ren-sidebar-item-radius`
- `--ren-sidebar-active-bg`
- `--ren-sidebar-active-color`
- `--ren-sidebar-duration`
- `--ren-sidebar-easing`

## Accessibility Contract

- Wrap items in a real `<nav>` landmark and label the sidebar with
  `aria-label` when multiple nav landmarks exist on the page.
- The current route uses `aria-current="page"`.
- Collapsed icon-only items must keep accessible names — do not hide the
  text label from screen readers.
- The toggle button has an `aria-label` (`"Toggle sidebar"`).
- Mobile overlay closes on Escape and outside click.
- Persistence respects user choice; do not auto-collapse on every visit.

## Anti-Patterns

- ❌ Wrapping a `<nav>` of non-RenDS items inside `.ren-sidebar-nav`.
- ❌ Replacing items with `ren-btn` / `ren-link` and re-styling.
- ❌ `<ren-sidebar style="width:240px">` — set `--ren-sidebar-width` on a
  parent scope.
- ❌ Using `display: none` to hide the sidebar on mobile — toggle the
  `[data-open]` state instead.
- ❌ Decorative-icon-only items without text labels.

## Related Files

- `components/patterns/ren-sidebar/ren-sidebar.css`
- `components/patterns/ren-sidebar/ren-sidebar.js`
- `docs/components/ren-sidebar.html`
- `ren-design.md`
- `tokens/tokens.md`

## Test Expectations

- Run component / docs a11y coverage on collapse / mobile overlay flows.
- Run `npm run lint` after token / selector changes.
- Manually verify keyboard navigation: Tab through items, Escape closes
  the mobile overlay.
