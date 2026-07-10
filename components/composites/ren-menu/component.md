# ren-menu Component Contract

Menu/listbox-style command surface with keyboard navigation.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-menu` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-menu` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Menu composite behavior or visual role.
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
    - "A trigger button needs to open a list of imperative commands (Edit, Duplicate, Delete) with role=\"menu\"."
    - "You need keyboard navigation (Arrow keys, Home/End, typeahead) plus click-outside / Escape dismissal."
    - "Items must support menuitem, menuitemcheckbox, menuitemradio, separators, group labels, danger styling, and right-aligned shortcut text."
    - "Right-click context menus reuse the same chrome via the colocated ren-context-menu module at pointer coordinates."
    - "Positioning needs viewport-aware placement (bottom-start / bottom-end / top-start / top-end, with right/left also accepted) with native Popover API support."
  avoidWhen:
    - "User is selecting a single value to commit into a form field — use ren-select."
    - "User is filtering a combobox of suggestions — use ren-combobox."
    - "The disclosure is non-list (rich content, header/body/footer) — use ren-popover or ren-hover-card."
    - "Items are persistent navigation across the app — use ren-sidebar / ren-nav."

canonicalImports:
  css:
    - "rends/components/composites/ren-menu/ren-menu.css"
  js:
    - "rends/components/composites/ren-menu/ren-menu.js"
  notes:
    - "JS depends on utils/keyboard-nav.js and utils/dismissable.js; its compatibility export delegates ren-context-menu registration to the colocated context-menu module."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Place a trigger element with data-menu-trigger (or referenced via trigger-id=\"<id>\" on the host) immediately before <ren-menu>."
  - "Each interactive item is a real <button class=\"ren-menu-item\"> with role=\"menuitem\" (the component sets role=\"menuitemcheckbox\" / \"menuitemradio\" when those classes are present)."
  - "Visual separators use <div class=\"ren-menu-separator\"> and group titles use <div class=\"ren-menu-label\">; do not use <hr> or <h*> for these slots."
  - "Disabled items set aria-disabled=\"true\"; the component skips them in keyboard navigation and selection."
  - "Set data-value=\"…\" on items so the dispatched ren-menu-select event carries that value in detail.value (falls back to textContent)."
  - "Use placement=\"bottom-start\" by default; the host mirrors the resolved side/alignment to data-side=\"top|right|bottom|left\" and data-align=\"start|end\"."

forbiddenPatterns:
  - "Using <a href> for menu items that perform JS actions — use <button> and listen to ren-menu-select."
  - "Replacing the trigger with a div that toggles via inline click — the trigger must receive aria-haspopup=\"menu\" + aria-controls + aria-expanded from the component."
  - "Manually positioning the menu with custom left/top — let positionMenu() handle viewport collision (or use placement=\"bottom-end\" etc)."
  - "Toggling visibility with display: none — the menu relies on [popover] / .ren-open and animates via the [data-closing] state."
  - "Putting non-menu rich content (forms, multi-line text blocks) directly inside <ren-menu> — wrap such content in ren-popover instead."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-menu-bg, --ren-menu-border, --ren-menu-danger-color, --ren-menu-duration, --ren-menu-easing, --ren-menu-item-height, --ren-menu-item-hover-bg, --ren-menu-item-padding, --ren-menu-item-radius, --ren-menu-padding, --ren-menu-radius, --ren-menu-shadow, --ren-menu-width."
    - "Semantic tokens used inside items: --color-surface, --color-border, --color-text, --color-text-muted, --color-fill, --color-fill-hover, --color-danger, --color-danger-subtle, --color-accent."
    - "Layout / size / motion tokens: --space-* (1, 2, 3), --radius-sm, --radius-lg, --shadow-lg, --size-body, --size-caption, --size-icon-md, --z-dropdown, --duration-enter, --ease-enter, --duration-exit, --ease-exit, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer overrides."
    - "Hardcoded hex / rgb() colors for hover, active, or danger states — pipe through --color-fill / --color-fill-hover / --color-danger / --color-danger-subtle."
    - "Custom animation timings; reuse --duration-enter / --duration-exit so reduced-motion handling continues to apply."

accessibility:
  required:
    - "<ren-menu> sets role=\"menu\" on itself and forces role=\"menuitem\" / \"menuitemcheckbox\" / \"menuitemradio\" on its children — do not override."
    - "Trigger receives aria-haspopup=\"menu\", aria-controls=\"<menu-id>\", and aria-expanded that flips with open()/close()."
    - "Keyboard contract: ArrowDown/ArrowUp on the trigger opens the menu; Arrow keys navigate vertically with loop; Home/End jump to first/last; typeahead matches printable characters; Enter/Space selects."
    - "Checkbox / radio items toggle aria-checked; radio items reset siblings within .ren-menu-radio-group (or the menu root) before activating themselves."
    - "Dismissable layer closes on Escape and outside click via the shared dismissable util; do not block its event listeners."
    - "Danger items rely on a paired text label (Delete, Remove) — color alone (--color-danger-subtle) is not sufficient."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-menu/ren-menu.css">
<script type="module" src="rends/components/composites/ren-menu/ren-menu.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-menu">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-menu`
- `.ren-menu-checkbox-item`
- `.ren-menu-group`
- `.ren-menu-item`
- `.ren-menu-item-danger`
- `.ren-menu-item-description`
- `.ren-menu-item-icon`
- `.ren-menu-item-shortcut`
- `.ren-menu-label`
- `.ren-menu-radio-item`
- `.ren-menu-separator`
- `.ren-open`

## States And Attributes

- `[aria-checked]`
- `[aria-disabled]`
- `[data-closing]`
- `[data-align]`
- `[data-highlighted]`
- `[data-menu-trigger]`
- `[data-side]`
- `placement`
- `:active`
- `:hover`

## Public Token API

- `--ren-menu-bg`
- `--ren-menu-border`
- `--ren-menu-danger-color`
- `--ren-menu-duration`
- `--ren-menu-easing`
- `--ren-menu-item-height`
- `--ren-menu-item-hover-bg`
- `--ren-menu-item-padding`
- `--ren-menu-item-radius`
- `--ren-menu-padding`
- `--ren-menu-radius`
- `--ren-menu-shadow`
- `--ren-menu-width`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-menu/ren-menu.css`
- `components/composites/ren-menu/ren-menu.js`
- `docs/components/ren-menu.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
