---
type: "RenDS Component"
title: ren-nav
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:pattern:ren-nav
sourcePath: components/patterns/ren-nav
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

# ren-nav

Source path: `components/patterns/ren-nav`

## Relationships

- `exposes_selector` -> [.ren-nav](../../selectors/ren-nav.md)
- `exposes_selector` -> [.ren-nav-actions](../../selectors/ren-nav-actions.md)
- `exposes_selector` -> [.ren-nav-brand](../../selectors/ren-nav-brand.md)
- `exposes_selector` -> [.ren-nav-dropdown](../../selectors/ren-nav-dropdown.md)
- `exposes_selector` -> [.ren-nav-link](../../selectors/ren-nav-link.md)
- `exposes_selector` -> [.ren-nav-links](../../selectors/ren-nav-links.md)
- `exposes_selector` -> [.ren-nav-sticky](../../selectors/ren-nav-sticky.md)
- `exposes_selector` -> [.ren-nav-toggle](../../selectors/ren-nav-toggle.md)
- `exposes_selector` -> [.ren-nav-transparent](../../selectors/ren-nav-transparent.md)
- `has_contract` -> [ren-nav pattern.md](../../foundation/contract-pattern-ren-nav.md)
- `has_css` -> [ren-nav.css](../../css/ren-nav-css.md)
- `has_docs_page` -> [ren-nav docs](../../docs/ren-nav-docs.md)
- `has_js` -> [ren-nav.js](../../javascript/ren-nav-js.md)
- `uses_token` -> [--color-surface](../../tokens/color-surface.md)
- `uses_token` -> [--duration-enter](../../tokens/duration-enter.md)
- `uses_token` -> [--duration-overlay](../../tokens/duration-overlay.md)
- `uses_token` -> [--duration-route](../../tokens/duration-route.md)
- `uses_token` -> [--duration-state](../../tokens/duration-state.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--ease-state-change](../../tokens/ease-state-change.md)
- `uses_token` -> [--ren-accent](../../tokens/ren-accent.md)
- `uses_token` -> [--ren-accent-subtle](../../tokens/ren-accent-subtle.md)
- `uses_token` -> [--ren-border](../../tokens/ren-border.md)
- `uses_token` -> [--ren-fill](../../tokens/ren-fill.md)
- `uses_token` -> [--ren-label-size](../../tokens/ren-label-size.md)
- `uses_token` -> [--ren-space-1](../../tokens/ren-space-1.md)
- `uses_token` -> [--ren-space-2](../../tokens/ren-space-2.md)
- `uses_token` -> [--ren-space-3](../../tokens/ren-space-3.md)
- `uses_token` -> [--ren-space-4](../../tokens/ren-space-4.md)
- `uses_token` -> [--ren-surface](../../tokens/ren-surface.md)
- `uses_token` -> [--ren-text](../../tokens/ren-text.md)
- `uses_token` -> [--ren-text-muted](../../tokens/ren-text-muted.md)
- `uses_token` -> [--ren-title-sm-size](../../tokens/ren-title-sm-size.md)
- `uses_token` -> [--ren-z-sticky](../../tokens/ren-z-sticky.md)

## Structured Data

```json
{
  "kind": "pattern",
  "selectors": [
    ".ren-nav",
    ".ren-nav-actions",
    ".ren-nav-brand",
    ".ren-nav-dropdown",
    ".ren-nav-link",
    ".ren-nav-links",
    ".ren-nav-sticky",
    ".ren-nav-toggle",
    ".ren-nav-transparent"
  ],
  "tokens": [
    "--color-surface",
    "--duration-enter",
    "--duration-overlay",
    "--duration-route",
    "--duration-state",
    "--ease-enter",
    "--ease-state-change",
    "--ren-accent",
    "--ren-accent-subtle",
    "--ren-border",
    "--ren-fill",
    "--ren-label-size",
    "--ren-space-1",
    "--ren-space-2",
    "--ren-space-3",
    "--ren-space-4",
    "--ren-surface",
    "--ren-text",
    "--ren-text-muted",
    "--ren-title-sm-size",
    "--ren-z-sticky"
  ],
  "hasScript": true,
  "hasDocsPage": true
}
```

## Source Content

# ren-nav Pattern Contract

Navigation pattern for responsive site/app nav and active states.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-nav` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-nav` pattern.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Nav pattern behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this pattern.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "The product needs a horizontal site / app top navigation bar (brand + links + actions)."
    - "The nav must collapse to a hamburger menu below 48rem (768px) with an animated <span>-stripe toggle."
    - "Active route should be reflected via aria-current=\"page\" (or the .active class) on a .ren-nav-link."
    - "You need optional sticky-on-scroll behavior with a translucent backdrop blur (.ren-nav-sticky)."
    - "You need a transparent variant for hero sections (.ren-nav-transparent)."
    - "You need top-level dropdown menus inside the nav using the native [popover] API (.ren-nav-dropdown)."
  avoidWhen:
    - "The nav is a persistent left/right rail — use ren-sidebar."
    - "The UI is a desktop-style application menubar (File / Edit / View) — use ren-menubar."
    - "The disclosure is a one-off dropdown unrelated to site nav — use ren-menu or ren-popover."
    - "The nav lives inside a card or pattern as secondary tabs — use ren-tabs."

canonicalImports:
  css:
    - "rends/components/patterns/ren-nav/ren-nav.css"
  js:
    - "rends/components/patterns/ren-nav/ren-nav.js"
  notes:
    - "JS registers <ren-nav> and owns the mobile toggle, Escape-to-close, resize handler, and popover-based dropdowns."
    - "CSS-only fallback renders the desktop layout; mobile menu requires JS to toggle [aria-expanded] on .ren-nav-toggle."

requiredMarkup:
  - "Wrap the bar in <ren-nav> containing a <nav class=\"ren-nav\" aria-label=\"…\">."
  - "Brand block uses <a class=\"ren-nav-brand\" href=\"/\"> with a logo + product name; it sits at the inline-start."
  - "Links live in <ul class=\"ren-nav-links\"> of <li><a class=\"ren-nav-link\" href=\"…\"></a></li>; active item adds aria-current=\"page\"."
  - "Mobile hamburger is <button class=\"ren-nav-toggle\" aria-expanded=\"false\" aria-controls=\"…\" aria-label=\"Toggle menu\"> with three <span> stripes inside."
  - "Action area (CTA buttons, theme toggle, sign-in) goes in <div class=\"ren-nav-actions\"> which floats to the inline-end via margin-inline-start: auto."
  - "Dropdowns use .ren-nav-dropdown wrapping a trigger <a class=\"ren-nav-link\" aria-expanded=\"false\" popovertarget=\"…\"> and a [popover] panel."

forbiddenPatterns:
  - "Using <div> stacks instead of <nav> + <ul>/<li> — landmarks and list semantics matter."
  - "Manually toggling display: none on .ren-nav-links for mobile — set [data-open] on .ren-nav or aria-expanded on .ren-nav-toggle."
  - "Styling links with ren-btn — sidebar / nav items own their own chrome via .ren-nav-link."
  - "Replacing the hamburger with a custom toggle that lacks aria-expanded / aria-controls."
  - "Hardcoding the sticky backdrop color — the .ren-nav-sticky variant already uses color-mix on --color-surface."

tokenPolicy:
  allowed:
    - "Public component tokens listed in Public Token API: --ren-nav-bg, --ren-nav-border, --ren-nav-gap, --ren-nav-height, --ren-nav-link-active, --ren-nav-link-color, --ren-nav-padding-x."
    - "Semantic tokens consumed by selectors: --ren-surface, --ren-border, --ren-text, --ren-text-muted, --ren-accent, --ren-accent-subtle, --ren-fill, --color-surface (for sticky color-mix)."
    - "Spacing / radius tokens: --ren-space-1, --ren-space-2, --ren-space-3, --ren-space-4, --ren-title-sm-size, --ren-label-size."
    - "Motion tokens: --duration-overlay, --duration-state, --duration-route, --duration-enter, --ease-state-change, --ease-enter."
    - "Z-index token: --ren-z-sticky."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer overrides."
    - "Hardcoded hex / named colors for bg, border, active, or hover."
    - "Custom z-index values that bypass --ren-z-sticky for sticky mode."

accessibility:
  required:
    - "Root is a real <nav> with aria-label (e.g. \"Primary\") so screen readers can list landmarks."
    - "Active route uses aria-current=\"page\" (the .active class is a styling alias, not the source of truth)."
    - ".ren-nav-toggle has aria-expanded reflecting menu state, aria-controls pointing to the links list, and an aria-label (icon-only is not a name)."
    - "Mobile menu closes on Escape and on link activation (the component owns both behaviors)."
    - "Dropdown triggers expose aria-expanded; popover panels are real [popover] elements so the platform manages focus return."
    - "Focus-visible outlines use --ren-accent at 2px offset — do not remove without a visible alternative."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/patterns/ren-nav/ren-nav.css">
<script type="module" src="rends/components/patterns/ren-nav/ren-nav.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-nav">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-nav`
- `.ren-nav-actions`
- `.ren-nav-brand`
- `.ren-nav-dropdown`
- `.ren-nav-link`
- `.ren-nav-links`
- `.ren-nav-sticky`
- `.ren-nav-toggle`
- `.ren-nav-transparent`

## States And Attributes

- `[aria-current]`
- `[aria-expanded]`
- `[data-dropdown]`
- `[data-open]`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-nav-bg`
- `--ren-nav-border`
- `--ren-nav-gap`
- `--ren-nav-height`
- `--ren-nav-link-active`
- `--ren-nav-link-color`
- `--ren-nav-padding-x`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/patterns/ren-nav/ren-nav.css`
- `components/patterns/ren-nav/ren-nav.js`
- `docs/components/ren-nav.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


.ren-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ren-space-2, 0.5rem) var(--ren-space-4, 1rem);
  background-color: var(--ren-surface);
  border-bottom: 1px solid var(--ren-border);
  min-height: 3.5rem;
  transition: backdrop-filter var(--duration-overlay) var(--ease-state-change), background-color var(--duration-overlay) var(--ease-state-change);

  &[data-open] .ren-nav-links,
  &:has(.ren-nav-toggle[aria-expanded="true"]) .ren-nav-links {
    display: flex;
  }

  &.ren-nav-sticky {
    position: sticky;
    top: 0;
    z-index: var(--ren-z-sticky, 100);
    backdrop-filter: blur(8px);
    background-color: color-mix(in srgb, var(--color-surface) 95%, transparent);
  }

  &.ren-nav-transparent {
    background-color: transparent;
    border-bottom-color: transparent;
  }
}

.ren-nav-brand {
  display: flex;
  align-items: center;
  gap: var(--ren-space-2, 0.5rem);
  font-weight: 600;
  font-size: var(--ren-title-sm-size, 1.125rem);
  color: var(--ren-text);
  text-decoration: none;
  flex-shrink: 0;

  &:focus-visible {
    outline: 2px solid var(--ren-accent);
    outline-offset: 2px;
    border-radius: 0.375rem;
  }
}

.ren-nav-links {
  display: flex;
  align-items: center;
  gap: var(--ren-space-1, 0.25rem);
  list-style: none;
  margin: 0;
  padding: 0;

  @media (max-width: 48rem) {
    display: none;
    position: absolute;
    top: 3.5rem;
    inset-inline: 0;
    flex-direction: column;
    gap: 0;
    background-color: var(--ren-surface);
    border-bottom: 1px solid var(--ren-border);
    padding: var(--ren-space-2, 0.5rem) 0;
    animation: slideDown var(--duration-enter) var(--ease-enter);
    z-index: 1000;

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-0.5rem);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }
}

.ren-nav-link {
  padding: var(--ren-space-2, 0.5rem) var(--ren-space-3, 0.75rem);
  color: var(--ren-text-muted);
  font-size: var(--ren-label-size, 0.875rem);
  border-radius: 0.375rem;
  transition: background-color var(--duration-state) var(--ease-state-change), color var(--duration-state) var(--ease-state-change);
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background-color: var(--ren-fill);
    color: var(--ren-text);
  }

  &:focus-visible {
    outline: 2px solid var(--ren-accent);
    outline-offset: -2px;
  }

  &[aria-current="page"],
  &.active {
    color: var(--ren-accent);
    font-weight: 500;
    background-color: var(--ren-accent-subtle);
  }

  @media (max-width: 48rem) {
    padding: var(--ren-space-2, 0.5rem) var(--ren-space-4, 1rem);
    border-radius: 0;

    &:hover {
      background-color: var(--ren-fill);
    }
  }
}

.ren-nav-actions {
  display: flex;
  align-items: center;
  gap: var(--ren-space-2, 0.5rem);
  margin-inline-start: auto;
}

.ren-nav-toggle {
  display: none;
  flex-direction: column;
  gap: 0.375rem;
  background: none;
  border: none;
  padding: var(--ren-space-2, 0.5rem);
  cursor: pointer;
  color: var(--ren-text);
  min-width: 44px;
  min-height: 44px;
  border-radius: 0.375rem;
  transition: background-color var(--duration-state) var(--ease-state-change);

  &:hover {
    background-color: var(--ren-fill);
  }

  &:focus-visible {
    outline: 2px solid var(--ren-accent);
    outline-offset: 2px;
  }

  & span {
    width: 1.5rem;
    height: 2px;
    background-color: currentColor;
    border-radius: 1px;
    transition: transform var(--duration-route) var(--ease-state-change), opacity var(--duration-route) var(--ease-state-change);
    transform-origin: center;
  }

  &[aria-expanded="true"] {
    & span:nth-child(1) {
      transform: rotate(45deg) translateY(0.5rem);
    }

    & span:nth-child(2) {
      opacity: 0;
      transform: scaleX(0);
    }

    & span:nth-child(3) {
      transform: rotate(-45deg) translateY(-0.5rem);
    }
  }

  @media (max-width: 48rem) {
    display: flex;
  }
}

.ren-nav-dropdown {
  position: relative;

  & [popover] {
    padding: var(--ren-space-1, 0.25rem);
    background-color: var(--ren-surface);
    border: 1px solid var(--ren-border);
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    margin-top: var(--ren-space-1, 0.25rem);
    list-style: none;
    padding-inline-start: 0;

    &[popover] {
      inset: auto auto auto auto;
    }
  }

  & .ren-nav-link[aria-expanded="true"] {
    background-color: var(--ren-fill);
    color: var(--ren-accent);
  }
}


/**
 * RenNav Component - Responsive Navigation Bar
 * Modern web component with keyboard navigation and mobile support
 */

const MOBILE_BREAKPOINT = 768;
const KEYBOARD_CODES = { Escape: 'Escape' };

class RenNav extends HTMLElement {
  constructor() {
    super();
    this._toggleBtn = null;
    this._linksContainer = null;
    this._links = [];
    this._isOpen = false;
    this._dropdowns = new Map();
  }

  connectedCallback() {
    this._initElements();
    this._attachEventListeners();
    this._initDropdowns();
    this._updateMobileState();
  }

  disconnectedCallback() {
    this._removeEventListeners();
  }

  _initElements() {
    this._toggleBtn = this.querySelector('.ren-nav-toggle');
    this._linksContainer = this.querySelector('.ren-nav-links');
    this._links = Array.from(this.querySelectorAll('.ren-nav-link'));
  }

  _attachEventListeners() {
    // Toggle button click
    if (this._toggleBtn) {
      this._toggleBtn.addEventListener('click', () => this._toggleMenu());
    }

    // Close menu on link click
    this._links.forEach(link => {
      link.addEventListener('click', () => {
        if (this._isOpen) {
          this._closeMenu();
        }
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === KEYBOARD_CODES.Escape && this._isOpen) {
        this._closeMenu();
      }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      this._updateMobileState();
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (this._isOpen && !this.contains(e.target)) {
        this._closeMenu();
      }
    });
  }

  _initDropdowns() {
    const dropdownToggles = this.querySelectorAll('[data-dropdown]');
    dropdownToggles.forEach(toggle => {
      const popoverId = toggle.getAttribute('aria-controls');
      if (popoverId) {
        const popover = this.querySelector(`#${popoverId}`);
        if (popover) {
          this._dropdowns.set(toggle, popover);
          toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this._toggleDropdown(toggle, popover);
          });

          // Close dropdown on item click
          popover.querySelectorAll('a, button').forEach(item => {
            item.addEventListener('click', () => {
              this._closeDropdown(toggle, popover);
            });
          });
        }
      }
    });
  }

  _toggleDropdown(toggle, popover) {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      this._closeDropdown(toggle, popover);
    } else {
      // Close other dropdowns
      this._dropdowns.forEach((pop, tog) => {
        if (tog !== toggle) {
          this._closeDropdown(tog, pop);
        }
      });

      toggle.setAttribute('aria-expanded', 'true');
      popover.showPopover?.();
    }
  }

  _closeDropdown(toggle, popover) {
    toggle.setAttribute('aria-expanded', 'false');
    popover.hidePopover?.();
  }

  _toggleMenu() {
    if (this._isOpen) {
      this._closeMenu();
    } else {
      this._openMenu();
    }
  }

  _openMenu() {
    this._isOpen = true;
    this.setAttribute('data-open', '');
    if (this._toggleBtn) {
      this._toggleBtn.setAttribute('aria-expanded', 'true');
    }
  }

  _closeMenu() {
    this._isOpen = false;
    this.removeAttribute('data-open');
    if (this._toggleBtn) {
      this._toggleBtn.setAttribute('aria-expanded', 'false');
    }
  }

  _updateMobileState() {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    if (!isMobile && this._isOpen) {
      this._closeMenu();
    }
  }

  _removeEventListeners() {
    if (this._toggleBtn) {
      this._toggleBtn.removeEventListener('click', () => this._toggleMenu());
    }

    this._links.forEach(link => {
      link.removeEventListener('click', () => {
        if (this._isOpen) {
          this._closeMenu();
        }
      });
    });
  }

  // Public API
  setActiveLink(href) {
    this._links.forEach(link => {
      if (link.getAttribute('href') === href) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('active');
      }
    });
  }

  get isOpen() {
    return this._isOpen;
  }
}

customElements.define('ren-nav', RenNav);
