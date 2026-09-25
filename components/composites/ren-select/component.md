# ren-select Component Contract

Custom select/listbox composite with trigger, options, and keyboard navigation.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-select` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-select` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Select composite behavior or visual role.
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
    - "You need a styled single- or multi-select with a button trigger and a listbox popup."
    - "You need full keyboard navigation (Arrow keys, Home/End, typeahead, Enter/Space, Escape)."
    - "You need ARIA combobox/listbox semantics with aria-expanded, aria-selected, and data-highlighted."
    - "You need optional grouping (.ren-select-group + .ren-select-label) or separators between options."
    - "You need multi-select chips (.ren-select-chips, .ren-select-chip) with removal affordances."
    - "You need hidden form-input integration for submission alongside custom dropdown UI."
    - "The dropdown needs a preferred placement via placement=\"top|right|bottom|left\" while preserving viewport flip fallback."
  avoidWhen:
    - "A bare <select> styled via base/primitive-zero would meet the requirements."
    - "The control is binary state — use ren-checkbox, ren-switch, or ren-toggle."
    - "The disclosure is a free-form menu of commands, not value selection — use ren-menu / ren-menubar."
    - "The disclosure is a navigation list — use ren-nav or ren-sidebar."

canonicalImports:
  css:
    - "rends/components/composites/ren-select/ren-select.css"
  js:
    - "rends/components/composites/ren-select/ren-select.js"
  notes:
    - "JS is required: it owns keyboard nav, dismissable popup, popover positioning, and the hidden form input."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "<ren-select> wraps a real <button data-select-trigger> and a [data-select-content] listbox container."
  - "Each option is a <div data-select-item data-value=\"...\"> inside .ren-select-content; rely on data-select-item, not arbitrary children."
  - "Leave the trigger empty and set placeholder on the host: the component renders .ren-select-placeholder (or .ren-select-value once something is chosen) plus .ren-select-icon into it on connect, and hand-written children are replaced on the first selection."
  - "Name the trigger: role=\"combobox\" is name-from-author, so its text is not its name. Provide aria-label / aria-labelledby on <ren-select> (the component moves it onto the trigger) or a <label for=\"{select id}\"> — otherwise the placeholder is used as the fallback name."
  - "The host, the trigger, and the content carry .ren-select, .ren-select-trigger, and .ren-select-content; the component adds any that are missing on connect."
  - "Set name on <ren-select> when the value must submit with a form; the component injects the hidden input automatically."
  - "With multiple, value is an ordered array and the component injects one same-name hidden input per selected value so FormData preserves repeated entries. Removable chips render as a sibling of the button trigger so interactive controls are never nested."
  - "Use .ren-select-group + .ren-select-label for grouped options and .ren-select-separator between groups; do not invent dividers."
  - "Use placement=\"bottom\" by default; the host and .ren-select-content mirror the resolved side to data-side and data-align."

forbiddenPatterns:
  - "Substituting a <div role=\"button\"> for the [data-select-trigger] <button> — the trigger must be a real button."
  - "Animating the dropdown manually with display: none / display: block — use the .ren-open class and the popover open state."
  - "Removing the focus ring on .ren-select-trigger:focus-visible without restoring an equivalent visible ring."
  - "Hardcoding option backgrounds via inline style — use --color-accent-subtle / --color-fill via the documented selectors."
  - "Putting interactive children (links, buttons) inside .ren-select-item; items must remain single-action options."

tokenPolicy:
  allowed:
    - "Semantic input tokens: --color-input-bg, --color-input-bg-hover, --color-input-border, --color-input-border-focus, --color-input-focus-ring, --color-input-placeholder, --color-input-disabled-bg, --color-input-disabled-text."
    - "Surface and content tokens: --color-surface, --color-fill, --color-accent, --color-accent-subtle, --color-text, --color-text-muted, --color-border."
    - "Shape / motion tokens: --radius-sm, --radius-md, --radius-lg, --space-*, --shadow-lg, --duration-enter, --duration-exit, --duration-micro, --ease-enter, --ease-exit, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / rgb / named color values in overrides."
    - "Hardcoded transition durations; use --duration-enter / --duration-exit / --duration-micro with their paired easings."

accessibility:
  required:
    - "Trigger carries an author-supplied accessible name (aria-label, aria-labelledby, or an associated <label>); the placeholder is only the fallback, because role=\"combobox\" ignores the button's own text."
    - "Trigger exposes aria-expanded on open/close and aria-disabled when inert; native <button> Enter/Space activation must be preserved."
    - "Listbox container carries role=\"listbox\"; each option carries role=\"option\" and aria-selected reflects the selected value."
    - "Roving highlight on options uses [data-highlighted]; only one option may be highlighted at a time."
    - "Trigger meets the 44px touch target via min-height: var(--touch-min); .ren-select-sm is only acceptable in non-touch contexts."
    - "Escape closes the listbox and returns focus to the trigger; outside click dismisses without stealing focus elsewhere."
    - "Disabled state combines :disabled (or aria-disabled=\"true\") with pointer-events: none on items so click and keypress both no-op."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-select/ren-select.css">
<script type="module" src="rends/components/composites/ren-select/ren-select.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<ren-select name="country" placeholder="Choose a country"><button class="ren-select-trigger" type="button" data-select-trigger></button><div class="ren-select-content" data-select-content role="listbox"><div class="ren-select-item" data-select-item data-value="ar">Argentina</div><div class="ren-select-item" data-select-item data-value="uy">Uruguay</div></div></ren-select>

```

The trigger is left empty on purpose: on connect the component renders
`.ren-select-placeholder` (or `.ren-select-value` once something is chosen)
plus the chevron into it. `placeholder` is what those nodes read, and — because
`role="combobox"` takes its name from the author, never from its text — it is
also the trigger's fallback accessible name. Give the select a real
`<label for>`, `aria-labelledby`, or `aria-label` whenever the field has a
visible label.

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-open`
- `.ren-select`
- `.ren-select-chip`
- `.ren-select-chip-remove`
- `.ren-select-chips`
- `.ren-select-content`
- `.ren-select-empty`
- `.ren-select-group`
- `.ren-select-icon`
- `.ren-select-item`
- `.ren-select-label`
- `.ren-select-lg`
- `.ren-select-placeholder`
- `.ren-select-separator`
- `.ren-select-sm`
- `.ren-select-trigger`
- `.ren-select-value`

## States And Attributes

- `[aria-disabled]`
- `[aria-expanded]`
- `[aria-selected]`
- `[data-highlighted]`
- `[data-align]`
- `[data-flipped]`
- `[data-select-content]`
- `[data-select-item]`
- `[data-select-trigger]`
- `[data-side]`
- `placement`
- `:disabled`
- `:focus-visible`
- `:hover`

## JavaScript API

- `value` (getter / setter) and `selectValue(value)` take a string (or `null`)
  in single-select mode.
- `value` and `selectValue(values)` take an ordered array in `multiple` mode.
- `open()`, `close()`, `isOpen`, `options`, `selectedOption`, and `refresh()`
  round out the surface; `refresh()` re-reads the options after you add or
  remove them.
- Multiple selection accumulates and removes values without closing the
  listbox, renders `.ren-select-chip` entries, and submits repeated same-name
  hidden inputs.
- `aria-disabled="false"` remains operable; only native `disabled` or
  `aria-disabled="true"` disables an option.

## Events

Names match `scripts/public-events.mjs`, the gated manifest of public events —
the component prefixes every event with its own tag, so there is no bare
`ren-change` / `ren-open` / `ren-close` here.

| Event | Bubbles | Composed | Detail |
| --- | --- | --- | --- |
| `ren-select-change` | yes | no | `{ value, label, item }` |
| `ren-select-open` | yes | no | none |
| `ren-select-close` | yes | no | none |
| `change` | yes | yes | none — the native event, for form integration |

## Public Token API

- `None detected in the colocated CSS/JS. Check related files before inventing one.`

If no `--ren-*` token is detected here, theme through semantic tokens from `tokens/tokens.md` and avoid selector overrides.

## Accessibility Contract

- The trigger's accessible name is resolved once, on connect, in this order:
  `aria-label` / `aria-labelledby` on the trigger, then the same attributes on
  `<ren-select>` (moved onto the trigger), then an associated `<label>`, then
  the `placeholder` text. Changing those attributes after mount does not
  relabel an upgraded trigger — set them in the markup.
- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-select/ren-select.css`
- `components/composites/ren-select/ren-select.js`
- `docs/components/ren-select.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
