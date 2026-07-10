---
type: "RenDS Component"
title: ren-sidebar
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:pattern:ren-sidebar
sourcePath: components/patterns/ren-sidebar
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - component
  - pattern
  - ren10
  - rends
---

# ren-sidebar

Source path: `components/patterns/ren-sidebar`

## Relationships

- `exposes_selector` -> [.ren-sidebar](../../selectors/ren-sidebar.md)
- `exposes_selector` -> [.ren-sidebar-content](../../selectors/ren-sidebar-content.md)
- `exposes_selector` -> [.ren-sidebar-divider](../../selectors/ren-sidebar-divider.md)
- `exposes_selector` -> [.ren-sidebar-footer](../../selectors/ren-sidebar-footer.md)
- `exposes_selector` -> [.ren-sidebar-header](../../selectors/ren-sidebar-header.md)
- `exposes_selector` -> [.ren-sidebar-item](../../selectors/ren-sidebar-item.md)
- `exposes_selector` -> [.ren-sidebar-item-icon](../../selectors/ren-sidebar-item-icon.md)
- `exposes_selector` -> [.ren-sidebar-item-text](../../selectors/ren-sidebar-item-text.md)
- `exposes_selector` -> [.ren-sidebar-layout](../../selectors/ren-sidebar-layout.md)
- `exposes_selector` -> [.ren-sidebar-main](../../selectors/ren-sidebar-main.md)
- `exposes_selector` -> [.ren-sidebar-nav](../../selectors/ren-sidebar-nav.md)
- `exposes_selector` -> [.ren-sidebar-overlay](../../selectors/ren-sidebar-overlay.md)
- `exposes_selector` -> [.ren-sidebar-section](../../selectors/ren-sidebar-section.md)
- `exposes_selector` -> [.ren-sidebar-section-label](../../selectors/ren-sidebar-section-label.md)
- `exposes_selector` -> [.ren-sidebar-toggle](../../selectors/ren-sidebar-toggle.md)
- `has_contract` -> [ren-sidebar pattern.md](../../foundation/contract-pattern-ren-sidebar.md)
- `has_css` -> [ren-sidebar.css](../../css/ren-sidebar-css.md)
- `has_docs_page` -> [ren-sidebar docs](../../docs/ren-sidebar-docs.md)
- `has_js` -> [ren-sidebar.js](../../javascript/ren-sidebar-js.md)
- `used_by_example` -> [app-sidebar.html](../../examples/app-sidebar-html.md) (ren-sidebar)
- `used_by_example` -> [dashboard-shell.html](../../examples/dashboard-shell-html.md) (ren-sidebar)
- `uses_token` -> [--duration-enter](../../tokens/duration-enter.md)
- `uses_token` -> [--duration-state](../../tokens/duration-state.md)
- `uses_token` -> [--ease-state-change](../../tokens/ease-state-change.md)
- `uses_token` -> [--ren-accent](../../tokens/ren-accent.md)
- `uses_token` -> [--ren-accent-subtle](../../tokens/ren-accent-subtle.md)
- `uses_token` -> [--ren-bg](../../tokens/ren-bg.md)
- `uses_token` -> [--ren-border](../../tokens/ren-border.md)
- `uses_token` -> [--ren-caption-size](../../tokens/ren-caption-size.md)
- `uses_token` -> [--ren-fill](../../tokens/ren-fill.md)
- `uses_token` -> [--ren-label-size](../../tokens/ren-label-size.md)
- `uses_token` -> [--ren-separator](../../tokens/ren-separator.md)
- `uses_token` -> [--ren-sidebar-collapsed-width](../../tokens/ren-sidebar-collapsed-width.md)
- `uses_token` -> [--ren-sidebar-width](../../tokens/ren-sidebar-width.md)
- `uses_token` -> [--ren-space-1](../../tokens/ren-space-1.md)
- `uses_token` -> [--ren-space-2](../../tokens/ren-space-2.md)
- `uses_token` -> [--ren-space-3](../../tokens/ren-space-3.md)
- `uses_token` -> [--ren-space-4](../../tokens/ren-space-4.md)
- `uses_token` -> [--ren-surface](../../tokens/ren-surface.md)
- `uses_token` -> [--ren-surface-sunken](../../tokens/ren-surface-sunken.md)
- `uses_token` -> [--ren-text](../../tokens/ren-text.md)
- `uses_token` -> [--ren-text-faint](../../tokens/ren-text-faint.md)
- `uses_token` -> [--ren-text-muted](../../tokens/ren-text-muted.md)
- `uses_token` -> [--sidebar-collapsed-width](../../tokens/sidebar-collapsed-width.md)
- `uses_token` -> [--sidebar-width](../../tokens/sidebar-width.md)

## Structured Data

```json
{
  "kind": "pattern",
  "selectors": [
    ".ren-sidebar",
    ".ren-sidebar-content",
    ".ren-sidebar-divider",
    ".ren-sidebar-footer",
    ".ren-sidebar-header",
    ".ren-sidebar-item",
    ".ren-sidebar-item-icon",
    ".ren-sidebar-item-text",
    ".ren-sidebar-layout",
    ".ren-sidebar-main",
    ".ren-sidebar-nav",
    ".ren-sidebar-overlay",
    ".ren-sidebar-section",
    ".ren-sidebar-section-label",
    ".ren-sidebar-toggle"
  ],
  "tokens": [
    "--duration-enter",
    "--duration-state",
    "--ease-state-change",
    "--ren-accent",
    "--ren-accent-subtle",
    "--ren-bg",
    "--ren-border",
    "--ren-caption-size",
    "--ren-fill",
    "--ren-label-size",
    "--ren-separator",
    "--ren-sidebar-collapsed-width",
    "--ren-sidebar-width",
    "--ren-space-1",
    "--ren-space-2",
    "--ren-space-3",
    "--ren-space-4",
    "--ren-surface",
    "--ren-surface-sunken",
    "--ren-text",
    "--ren-text-faint",
    "--ren-text-muted",
    "--sidebar-collapsed-width",
    "--sidebar-width"
  ],
  "hasScript": true,
  "hasDocsPage": true
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


.ren-sidebar-layout {
  display: flex;
  min-height: 100dvh;
  background-color: var(--ren-bg);
}

.ren-sidebar {
  --sidebar-width: var(--ren-sidebar-width, 16rem);
  --sidebar-collapsed-width: var(--ren-sidebar-collapsed-width, 4rem);

  width: var(--sidebar-width);
  flex-shrink: 0;
  background-color: var(--ren-surface-sunken);
  border-inline-end: 1px solid var(--ren-border);
  display: flex;
  flex-direction: column;
  transition: width var(--duration-enter) var(--ease-state-change), transform var(--duration-enter) var(--ease-state-change);
  overflow: hidden;
  z-index: 50;

  &[data-collapsed] {
    width: var(--sidebar-collapsed-width);

    & .ren-sidebar-item-text {
      opacity: 0;
      width: 0;
      overflow: hidden;
      transition: opacity var(--duration-enter) var(--ease-state-change), width var(--duration-enter) var(--ease-state-change);
    }

    & .ren-sidebar-section-label {
      opacity: 0;
      width: 0;
      overflow: hidden;
      transition: opacity var(--duration-enter) var(--ease-state-change), width var(--duration-enter) var(--ease-state-change);
    }

    & .ren-sidebar-item {
      justify-content: center;
      position: relative;

      &:hover::after {
        content: attr(data-tooltip);
        position: absolute;
        inset-inline-start: 100%;
        top: 50%;
        transform: translateY(-50%);
        margin-inline-start: var(--ren-space-2, 0.5rem);
        padding: var(--ren-space-2, 0.5rem) var(--ren-space-3, 0.75rem);
        background-color: var(--ren-text);
        color: var(--ren-surface);
        border-radius: 0.375rem;
        font-size: var(--ren-caption-size, 0.75rem);
        white-space: nowrap;
        z-index: 1000;
        pointer-events: none;
      }
    }
  }

  @media (max-width: 48rem) {
    position: fixed;
    top: 0;
    inset-inline-start: 0;
    height: 100dvh;
    width: var(--sidebar-width);
    transform: translateX(-100%);
    transition: transform var(--duration-enter) var(--ease-state-change);

    &[data-open] {
      transform: translateX(0);
      box-shadow: 4px 0 12px rgb(0 0 0 / 0.15);
    }

    &[data-collapsed] {
      transform: translateX(-100%);
      width: var(--sidebar-width);
    }
  }
}

.ren-sidebar-header {
  padding: var(--ren-space-3, 0.75rem) var(--ren-space-4, 1rem);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--ren-border);
  flex-shrink: 0;

  @media (max-width: 48rem) {
    padding: var(--ren-space-3, 0.75rem) var(--ren-space-4, 1rem);
  }
}

.ren-sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--ren-space-2, 0.5rem);
  scrollbar-width: thin;
  scrollbar-color: var(--ren-border) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--ren-border);
    border-radius: 3px;

    &:hover {
      background-color: var(--ren-text-muted);
    }
  }
}

.ren-sidebar-footer {
  padding: var(--ren-space-3, 0.75rem) var(--ren-space-4, 1rem);
  border-top: 1px solid var(--ren-border);
  flex-shrink: 0;

  @media (max-width: 48rem) {
    padding: var(--ren-space-3, 0.75rem) var(--ren-space-4, 1rem);
  }
}

.ren-sidebar-nav {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--ren-space-1, 0.25rem);
}

.ren-sidebar-section {
  margin-top: var(--ren-space-4, 1rem);

  &:first-child {
    margin-top: 0;
  }
}

.ren-sidebar-section-label {
  padding: var(--ren-space-1, 0.25rem) var(--ren-space-3, 0.75rem);
  font-size: var(--ren-caption-size, 0.75rem);
  font-weight: 600;
  color: var(--ren-text-faint);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: opacity var(--duration-enter) var(--ease-state-change);
  white-space: nowrap;
  overflow: hidden;
}

.ren-sidebar-item {
  display: flex;
  align-items: center;
  gap: var(--ren-space-3, 0.75rem);
  padding: var(--ren-space-2, 0.5rem) var(--ren-space-3, 0.75rem);
  border-radius: 0.375rem;
  color: var(--ren-text-muted);
  font-size: var(--ren-label-size, 0.875rem);
  cursor: pointer;
  transition: background-color var(--duration-state) var(--ease-state-change), color var(--duration-state) var(--ease-state-change);
  text-decoration: none;
  white-space: nowrap;
  user-select: none;

  &:hover {
    background-color: var(--ren-fill);
    color: var(--ren-text);
  }

  &:focus-visible {
    outline: 2px solid var(--ren-accent);
    outline-offset: -2px;
  }

  &.active,
  &[aria-current="page"] {
    background-color: var(--ren-accent-subtle);
    color: var(--ren-accent);
    font-weight: 500;

    & .ren-sidebar-item-icon {
      color: var(--ren-accent);
    }
  }

  &[aria-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}

.ren-sidebar-item-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(--ren-text-muted);
  transition: color var(--duration-state) var(--ease-state-change);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ren-sidebar-item-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity var(--duration-enter) var(--ease-state-change), width var(--duration-enter) var(--ease-state-change);
}

.ren-sidebar-divider {
  height: 1px;
  background-color: var(--ren-separator);
  margin: var(--ren-space-2, 0.5rem) 0;
}

.ren-sidebar-toggle {
  background: none;
  border: none;
  padding: var(--ren-space-2, 0.5rem);
  cursor: pointer;
  color: var(--ren-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 32px;
  border-radius: 0.375rem;
  transition: background-color var(--duration-state) var(--ease-state-change), color var(--duration-state) var(--ease-state-change);

  &:hover {
    background-color: var(--ren-fill);
    color: var(--ren-text);
  }

  &:focus-visible {
    outline: 2px solid var(--ren-accent);
    outline-offset: 2px;
  }

  @media (max-width: 48rem) {
    display: none;
  }
}

.ren-sidebar-main {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  scrollbar-width: thin;
  scrollbar-color: var(--ren-border) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--ren-border);
    border-radius: 3px;

    &:hover {
      background-color: var(--ren-text-muted);
    }
  }

  @media (max-width: 48rem) {
    margin-inline-start: 0;
  }
}

.ren-sidebar-overlay {
  position: fixed;
  inset: 0;
  background-color: rgb(0 0 0 / 0.5);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--duration-enter) var(--ease-state-change);
  z-index: 40;

  @media (max-width: 48rem) {
    .ren-sidebar[data-open] ~ & {
      opacity: 1;
      pointer-events: auto;
    }
  }
}

/* ═══ REDUCED MOTION ═══ */
@media (prefers-reduced-motion: reduce) {
  .ren-sidebar,
  .ren-sidebar * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}


/**
 * RenSidebar Component - Collapsible sidebar for app layouts
 * Supports desktop collapse and mobile overlay modes
 */

const MOBILE_BREAKPOINT = 768;
const STORAGE_KEY = 'ren-sidebar-collapsed';
const KEYBOARD_CODES = { Escape: 'Escape' };

class RenSidebar extends HTMLElement {
  constructor() {
    super();
    this._toggleBtn = null;
    this._isCollapsed = false;
    this._isOpen = false;
    this._isMobile = false;
    this._navItems = [];
    this._listenerController = null;
    this._storageKey = STORAGE_KEY;
  }

  connectedCallback() {
    this._initElements();
    this._restoreState();
    this._attachEventListeners();
    this._updateMobileState();
  }

  disconnectedCallback() {
    this._removeEventListeners();
  }

  _initElements() {
    this._toggleBtn = this.querySelector('.ren-sidebar-toggle');
    this._navItems = Array.from(this.querySelectorAll('.ren-sidebar-item'));
    this._storageKey = this.getAttribute('storage-key') || STORAGE_KEY;
  }

  _attachEventListeners() {
    this._listenerController?.abort();
    this._listenerController = new AbortController();
    const { signal } = this._listenerController;

    // Toggle collapse button
    if (this._toggleBtn) {
      this._toggleBtn.addEventListener('click', () => this._toggleCollapse(), { signal });
    }

    // Nav item clicks
    this._navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.currentTarget.hasAttribute('href')) {
          this._setActiveItem(e.currentTarget);
        }
        if (this._isMobile && this._isOpen) {
          this._closeMenu();
        }
      }, { signal });
    });

    // Close on Escape (mobile)
    document.addEventListener('keydown', (e) => {
      if (e.key === KEYBOARD_CODES.Escape && this._isMobile && this._isOpen) {
        this._closeMenu();
      }
    }, { signal });

    // Handle window resize
    window.addEventListener('resize', () => {
      this._updateMobileState();
    }, { signal });

    // Close menu on outside click (mobile)
    document.addEventListener('click', (e) => {
      if (this._isMobile && this._isOpen && !this.contains(e.target)) {
        const overlay = this.nextElementSibling;
        if (overlay && overlay.classList.contains('ren-sidebar-overlay')) {
          if (overlay.contains(e.target)) {
            this._closeMenu();
          }
        }
      }
    }, { signal });

    // Expose toggle menu for mobile
    this._setupMobileToggle();
  }

  _setupMobileToggle() {
    // Allow external control via method
    this.toggleMenu = () => {
      if (this._isOpen) {
        this._closeMenu();
      } else {
        this._openMenu();
      }
    };
  }

  _removeEventListeners() {
    this._listenerController?.abort();
    this._listenerController = null;
  }

  _toggleCollapse() {
    if (this._isCollapsed) {
      this._expand();
    } else {
      this._collapse();
    }
  }

  _collapse() {
    this._isCollapsed = true;
    this.setAttribute('data-collapsed', '');
    this._writeCollapsedState(true);
    this._dispatchToggleEvent();
  }

  _expand() {
    this._isCollapsed = false;
    this.removeAttribute('data-collapsed');
    this._writeCollapsedState(false);
    this._dispatchToggleEvent();
  }

  _toggleMenu() {
    if (this._isOpen) {
      this._closeMenu();
    } else {
      this._openMenu();
    }
  }

  _openMenu() {
    if (!this._isMobile) return;
    this._isOpen = true;
    this.setAttribute('data-open', '');
  }

  _closeMenu() {
    if (!this._isMobile) return;
    this._isOpen = false;
    this.removeAttribute('data-open');
  }

  _updateMobileState() {
    const wasMobile = this._isMobile;
    this._isMobile = window.innerWidth < MOBILE_BREAKPOINT;

    // Close menu when transitioning to desktop
    if (wasMobile && !this._isMobile && this._isOpen) {
      this._closeMenu();
    }

    // Reset collapse on mobile
    if (this._isMobile && this._isCollapsed) {
      this._expand();
    }
  }

  _restoreState() {
    const isCollapsed = this._readCollapsedState();
    if (isCollapsed && !this._isMobile) {
      this._collapse();
    }
  }

  _readCollapsedState() {
    try {
      return localStorage.getItem(this._storageKey) === 'true';
    } catch (error) {
      return false;
    }
  }

  _writeCollapsedState(isCollapsed) {
    try {
      localStorage.setItem(this._storageKey, isCollapsed ? 'true' : 'false');
    } catch (error) {
      // Storage can be blocked in private contexts; visual state still updates.
    }
  }

  _setActiveItem(item) {
    this._navItems.forEach(navItem => {
      navItem.classList.remove('active');
      navItem.removeAttribute('aria-current');
    });

    item.classList.add('active');
    item.setAttribute('aria-current', 'page');
  }

  _dispatchToggleEvent() {
    const event = new CustomEvent('ren-sidebar-toggle', {
      detail: { collapsed: this._isCollapsed },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  // Public API
  get isCollapsed() {
    return this._isCollapsed;
  }

  get isMobileOpen() {
    return this._isOpen;
  }

  setActiveItem(href) {
    const item = this._navItems.find((navItem) => navItem.getAttribute('href') === href);
    if (item && item.classList.contains('ren-sidebar-item')) {
      this._setActiveItem(item);
    }
  }

  openMobileMenu() {
    if (this._isMobile) {
      this._openMenu();
    }
  }

  closeMobileMenu() {
    if (this._isMobile) {
      this._closeMenu();
    }
  }
}

customElements.define('ren-sidebar', RenSidebar);
