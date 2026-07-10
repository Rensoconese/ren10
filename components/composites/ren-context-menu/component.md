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
  - "Menu root is <ren-context-menu id=\"<menu-id>\">; the component applies the .ren-context-menu, role=menu, and manual popover semantics."
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
<div data-context="editor-actions" tabindex="0">Right-click me</div>
<ren-context-menu id="editor-actions">
  <button class="ren-menu-item" role="menuitem">Copy</button>
  <button class="ren-menu-item" role="menuitem">Paste</button>
</ren-context-menu>
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
- `trigger-id`

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
