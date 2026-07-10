# ren-combobox Component Contract

Autocomplete/select composite with input, listbox, and keyboard behavior.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-combobox` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-combobox` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Combobox composite behavior or visual role.
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
    - "Users must filter / autocomplete from a large list using free-text input."
    - "You need a typeahead with keyboard navigation (Arrow Up/Down, Enter, Escape)."
    - "Grouped options or items with secondary descriptions are needed."
    - "Async loading states (.ren-combobox-loading) or empty states (.ren-combobox-empty) are required."
    - "Single-select with a text-input affordance is the right control (input visible at rest)."
    - "The inline list needs a preferred top/bottom opening side via placement without becoming a Popover API overlay."
  avoidWhen:
    - "Users pick from a short fixed list without filtering — use ren-select."
    - "Multi-select with tag chips is required — use a dedicated multi-select / ren-multiselect."
    - "The input is a free-form search that submits a query — use ren-input + ren-search."
    - "The list is a navigation menu — use ren-menu / ren-command."

canonicalImports:
  css:
    - "rends/components/composites/ren-combobox/ren-combobox.css"
  js:
    - "rends/components/composites/ren-combobox/ren-combobox.js"
  notes:
    - "If the page already imports rends/components/index.css, do not import the CSS again."
    - "CSS works standalone on the .ren-combobox structure; <ren-combobox> JS adds ARIA wiring, filtering, highlight bookkeeping, and open/close."
    - "The component does not define --ren-combobox-* tokens; theme through semantic tokens or scope semantic token overrides."

requiredMarkup:
  - "Root <ren-combobox> wraps consumer-authored .ren-combobox-item options; its JS generates the input, listbox, hidden input, and live region."
  - "Each option is <div class=\"ren-combobox-item\" role=\"option\"> with aria-selected toggled by the component and data-highlighted reflecting keyboard focus."
  - "Use .ren-combobox-item-label and .ren-combobox-item-description inside items for two-line content; do not nest extra layout divs."
  - "Empty state lives in <div class=\"ren-combobox-empty\" hidden> and the loading state in <div class=\"ren-combobox-loading\" hidden>."
  - "Group items inside <div class=\"ren-combobox-group\"> with a leading <div class=\"ren-combobox-group-label\">."
  - "Use placement=\"bottom\" by default; the host and .ren-combobox-list mirror placement to data-side. Top changes the absolute list fallback to open above the input."

forbiddenPatterns:
  - "Replacing <input> with a contentEditable div — breaks IME, autofill, and form submission."
  - "Using <ul>/<li> for the list when the component's CSS targets .ren-combobox-list / .ren-combobox-item with role=\"listbox\" / role=\"option\"."
  - "Using :hover styling alone to indicate keyboard highlight; rely on [data-highlighted] and aria-selected=\"true\"."
  - "Toggling visibility with display: none on the list; use the [hidden] attribute (CSS handles the close transition)."
  - "Hardcoded dropdown widths; the list uses inset-inline: 0 to match the input width — override --space-* / --radius-* tokens instead."

tokenPolicy:
  allowed:
    - "Semantic tokens: --color-surface, --color-border, --color-text, --color-text-muted, --color-fill, --color-fill-hover, --color-fill-active, --color-accent, --color-accent-subtle."
    - "Typography / layout: --text-xs, --text-sm, --leading-5, --space-*, --radius-sm, --radius-md, --radius-lg, --radius-full, --shadow-lg."
    - "Motion tokens: --duration-micro, --duration-enter, --duration-slow, --ease-enter, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors in consumer overrides."
    - "Defining new --ren-combobox-* component tokens — the component intentionally inherits semantic tokens."

accessibility:
  required:
    - "Input has role=\"combobox\", aria-expanded reflecting list visibility, aria-controls pointing to the .ren-combobox-list id, and aria-activedescendant pointing to the highlighted option."
    - "List has role=\"listbox\" and each item has role=\"option\"; do not nest interactive controls inside an option."
    - "Keyboard contract: Arrow Down opens / moves down, Arrow Up moves up, Enter selects, Escape closes; preserve all four."
    - "Selected option sets aria-selected=\"true\"; selection is announced — never communicate via color alone."
    - "Disabled options set aria-disabled=\"true\" AND ignore activation in JS (pointer-events styling is not enough)."
    - "Loading state uses an aria-live region (or aria-busy on the input) so AT users know results are pending."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-combobox/ren-combobox.css">
<script type="module" src="rends/components/composites/ren-combobox/ren-combobox.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<ren-combobox name="country" placeholder="Search a country">
  <div class="ren-combobox-item" data-value="ar">Argentina</div>
  <div class="ren-combobox-item" data-value="uy">Uruguay</div>
</ren-combobox>

```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-combobox`

## States And Attributes

- `[aria-disabled]`
- `[aria-selected]`
- `[data-side]`
- `[data-highlighted]`
- `placement`
- `:disabled`
- `:hover`

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

- `components/composites/ren-combobox/ren-combobox.css`
- `components/composites/ren-combobox/ren-combobox.js`
- `docs/components/ren-combobox.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
