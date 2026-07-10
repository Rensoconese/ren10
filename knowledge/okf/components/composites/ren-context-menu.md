---
type: "RenDS Component"
title: ren-context-menu
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:composite:ren-context-menu
sourcePath: components/composites/ren-context-menu
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - component
  - composite
  - ren10
  - rends
---

# ren-context-menu

Source path: `components/composites/ren-context-menu`

## Relationships

- `exposes_selector` -> [.ren-context-menu](../../selectors/ren-context-menu.md)
- `exposes_selector` -> [.ren-menu-item](../../selectors/ren-menu-item.md)
- `exposes_selector` -> [.ren-menu-separator](../../selectors/ren-menu-separator.md)
- `has_contract` -> [ren-context-menu component.md](../../foundation/contract-composite-ren-context-menu.md)
- `has_css` -> [ren-context-menu.css](../../css/ren-context-menu-css.md)
- `has_docs_page` -> [ren-context-menu docs](../../docs/ren-context-menu-docs.md)
- `has_js` -> [ren-context-menu.js](../../javascript/ren-context-menu-js.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-surface](../../tokens/color-surface.md)
- `uses_token` -> [--duration-enter](../../tokens/duration-enter.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--radius-lg](../../tokens/radius-lg.md)
- `uses_token` -> [--shadow-lg](../../tokens/shadow-lg.md)
- `uses_token` -> [--space-1](../../tokens/space-1.md)
- `uses_token` -> [--stroke-1](../../tokens/stroke-1.md)

## Structured Data

```json
{
  "kind": "composite",
  "selectors": [
    ".ren-context-menu",
    ".ren-menu-item",
    ".ren-menu-separator"
  ],
  "tokens": [
    "--color-border",
    "--color-surface",
    "--duration-enter",
    "--ease-enter",
    "--radius-lg",
    "--shadow-lg",
    "--space-1",
    "--stroke-1"
  ],
  "hasScript": true,
  "hasDocsPage": true
}
```

## Source Content

# ren-context-menu Component Contract

Contextual action menu opened from a target or pointer interaction.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-context-menu` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-context-menu` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Context Menu composite behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this composite.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "A target area needs a right-click (or long-press) action menu that opens at the pointer."
    - "The menu hosts imperative actions (cut / copy / paste / delete) rather than navigation."
    - "You want the native Popover API plus the shared ren-menu item styling."
    - "Positioning should follow the pointer instead of a static anchor."
    - "A scoped trigger region is needed (declared via data-context=\"<menu-id>\")."
  avoidWhen:
    - "The menu opens from a button click — use ren-menu (dropdown) instead."
    - "The trigger is a hover affordance — use ren-popover / ren-hover-card."
    - "The menu is the primary navigation — use ren-menubar / ren-sidebar."
    - "You need cascading submenus — use ren-menu (supports nested patterns)."

canonicalImports:
  css:
    - "rends/components/composites/ren-context-menu/ren-context-menu.css"
    - "rends/components/composites/ren-menu/ren-menu.css"
  js:
    - "rends/components/composites/ren-context-menu/ren-context-menu.js"
  notes:
    - "If the page already imports rends/components/index.css, do not import the CSS again."
    - "ren-menu.css must be present alongside this CSS — the menu items (.ren-menu-item, .ren-menu-separator) live there and are reused."
    - "JS handles contextmenu event interception, pointer-based positioning, and popover open/close."

requiredMarkup:
  - "Declare the trigger region with data-context=\"<menu-id>\" on any element; do not use inline oncontextmenu attributes."
  - "Menu root is <div id=\"<menu-id>\" class=\"ren-context-menu\" popover> — the popover attribute is required, not optional."
  - "Items are real <button class=\"ren-menu-item\"> elements; separators are <hr class=\"ren-menu-separator\">."
  - "Destructive actions use .ren-menu-item-danger (defined in ren-menu.css); do not invent custom danger classes."
  - "Position is set by JS — do not write inline top/left on the menu element."

forbiddenPatterns:
  - "Opening the menu via custom JS that calls .style.display = 'block' — use showPopover() so the API handles light dismiss + the top layer."
  - "<div role=\"menuitem\" tabindex=\"0\"> styled as a button; use a real <button class=\"ren-menu-item\">."
  - "Static anchored positioning (top: 0; left: 0) — context menus must follow the contextmenu event coordinates."
  - "Suppressing the native context menu globally (document.oncontextmenu = e => e.preventDefault()) — scope prevention to data-context regions only."
  - "Hardcoded box-shadow / hex backgrounds; use --shadow-lg and --color-surface."

tokenPolicy:
  allowed:
    - "Semantic tokens: --color-surface, --color-border, --color-text, --color-text-muted, --color-fill, --color-fill-hover, --color-fill-active, --color-danger, --color-accent."
    - "Layout / motion tokens: --space-*, --stroke-1, --radius-lg, --shadow-lg, --duration-enter, --ease-enter."
    - "Reuses --ren-menu-* tokens defined by ren-menu (item padding, hover bg, etc.) — override at the ren-menu scope."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors in consumer overrides."
    - "Defining new --ren-context-menu-* component tokens — the component inherits from ren-menu intentionally."

accessibility:
  required:
    - "Menu root has role=\"menu\" (set by JS) and each .ren-menu-item has role=\"menuitem\"; do not nest interactive controls inside items."
    - "Keyboard: Arrow Up/Down moves focus across items, Home/End jump to first/last, Escape closes the menu, Enter / Space activates."
    - "Trigger must be reachable by keyboard via Shift+F10 (or the dedicated context-menu key) — never gate the menu behind right-click only."
    - "Disabled items set aria-disabled=\"true\" AND skip in keyboard navigation order."
    - "Focus moves into the menu on open and returns to the trigger on close — preserve this when extending behavior."
    - "Reduced motion: open transition is disabled under prefers-reduced-motion (already handled)."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-context-menu/ren-context-menu.css">
<script type="module" src="rends/components/composites/ren-context-menu/ren-context-menu.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-context-menu">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-context-menu`
- `.ren-menu-item`
- `.ren-menu-separator`
- `.ren-open`

## States And Attributes

- `[aria-disabled]`
- `[data-context]`

## Public Token API

- `None detected in the colocated CSS/JS. Check related files before inventing one.`

If no `--ren-*` token is detected here, theme through semantic tokens from `tokens/tokens.md` and avoid selector overrides.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-context-menu/ren-context-menu.css`
- `components/composites/ren-context-menu/ren-context-menu.js`
- `docs/components/ren-context-menu.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/* ============================================
   RenDS — Context Menu Component
   ============================================
   Right-click menu using Popover API.
   Reuses ren-menu styles for items.
   Minimal JS for right-click trigger + positioning.

   Usage:
     <div class="ren-context-menu-trigger" data-context="my-ctx-menu">
       Right-click this area
     </div>

     <div id="my-ctx-menu" class="ren-context-menu" popover>
       <button class="ren-menu-item">Cut</button>
       <button class="ren-menu-item">Copy</button>
       <button class="ren-menu-item">Paste</button>
       <hr class="ren-menu-separator">
       <button class="ren-menu-item ren-menu-item-danger">Delete</button>
     </div>
   ============================================ */

.ren-context-menu {
  /* Reset popover defaults */
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  inset: auto;

  /* Menu appearance (matches ren-menu) */
  background: var(--color-surface);
  border: var(--stroke-1) solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding-block: var(--space-1);
  min-width: 10rem;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  overscroll-behavior: contain;

  /* Position set by JS */
  position: fixed;

  /* Animation — semantic tokens keep context-menu in sync with
     ren-menu / ren-popover. Collapses to 0ms under reduce. */
  opacity: 0;
  transform: scale(0.95);
  transform-origin: top left;
  transition:
    opacity var(--duration-enter) var(--ease-enter),
    transform var(--duration-enter) var(--ease-enter),
    overlay var(--duration-enter) var(--ease-enter) allow-discrete,
    display var(--duration-enter) var(--ease-enter) allow-discrete;
}

.ren-context-menu:popover-open,
.ren-context-menu.ren-open {
  opacity: 1;
  transform: scale(1);
}

@starting-style {
  .ren-context-menu:popover-open {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* ─── Reuse menu item styles ─── */
/* Already defined in ren-menu.css:
   .ren-menu-item, .ren-menu-separator, etc.
   Import ren-menu.css alongside this file.
*/

/* ─── Reduced motion ─── */
@media (prefers-reduced-motion: reduce) {
  .ren-context-menu {
    transition: none;
  }
}


/* ============================================
   RenDS — Context Menu Controller
   ============================================
   Handles right-click trigger, positioning,
   and keyboard navigation.

   Usage:
     import { initContextMenu } from './ren-context-menu.js';
     initContextMenu('my-ctx-menu');

   Or auto-init all:
     import { initAllContextMenus } from './ren-context-menu.js';
     initAllContextMenus();
   ============================================ */

/**
 * @param {string} menuId - The popover element ID
 */
export function initContextMenu(menuId) {
  const menu = document.getElementById(menuId);
  if (!menu) return;

  if (menu.dataset.renContextMenuInitialized === 'true') return;
  menu.dataset.renContextMenuInitialized = 'true';

  menu.setAttribute('popover', 'manual');

  // Find all triggers for this menu
  const triggers = [...document.querySelectorAll(`[data-context="${menuId}"]`)];
  const itemSelector = '.ren-menu-item:not(:disabled):not([aria-disabled="true"])';

  const isOpen = () => menu.matches(':popover-open') || menu.classList.contains('ren-open');

  const close = () => {
    if (!isOpen()) return;

    if ('hidePopover' in menu && menu.matches(':popover-open')) {
      try {
        menu.hidePopover();
      } catch (e) {
        // Popover may have already been closed by the browser.
      }
    } else {
      menu.classList.remove('ren-open');
    }

    menu.setAttribute('data-state', 'closed');
  };

  const show = (x, y) => {
    if (isOpen()) {
      close();
    }

    // Position menu at cursor
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    if ('showPopover' in menu) {
      try {
        menu.showPopover();
      } catch (e) {
        // Popover may already be open during rapid repeated contextmenu events.
      }
    } else {
      menu.classList.add('ren-open');
    }

    menu.setAttribute('data-state', 'open');

    // Adjust if overflows viewport
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = `${Math.max(8, x - rect.width)}px`;
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = `${Math.max(8, y - rect.height)}px`;
    }

    // Focus first item
    const firstItem = menu.querySelector(itemSelector);
    firstItem?.focus();
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      show(e.clientX, e.clientY);
    });

    trigger.addEventListener('keydown', (e) => {
      if (e.key !== 'ContextMenu' && !(e.key === 'F10' && e.shiftKey)) return;

      e.preventDefault();
      const rect = trigger.getBoundingClientRect();
      show(rect.left + 8, rect.bottom + 8);
    });
  });

  // Keyboard navigation inside menu
  menu.addEventListener('keydown', (e) => {
    const items = [...menu.querySelectorAll(itemSelector)];
    if (items.length === 0) return;

    const current = items.indexOf(document.activeElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(current + 1) % items.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(current - 1 + items.length) % items.length]?.focus();
    } else if (e.key === 'Escape') {
      close();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      document.activeElement?.click();
      close();
    }
  });

  // Close on item click
  menu.addEventListener('click', (e) => {
    if (e.target.closest('.ren-menu-item')) {
      close();
    }
  });

  const isMenuOrTrigger = (target) =>
    target instanceof Node &&
    (menu.contains(target) || triggers.some((trigger) => trigger.contains(target)));

  document.addEventListener(
    'pointerdown',
    (e) => {
      if (isOpen() && !isMenuOrTrigger(e.target)) {
        close();
      }
    },
    true
  );

  document.addEventListener(
    'contextmenu',
    (e) => {
      if (isOpen() && !isMenuOrTrigger(e.target)) {
        close();
      }
    },
    true
  );
}

/**
 * Auto-init all context menus.
 */
export function initAllContextMenus() {
  const menuIds = new Set();
  document.querySelectorAll('[data-context]').forEach((el) => {
    menuIds.add(el.dataset.context);
  });
  menuIds.forEach(initContextMenu);
}
