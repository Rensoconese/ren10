# ren-toggle-group Component Contract

Grouped toggle controls for mutually exclusive or multi-select modes.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-toggle-group` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-toggle-group` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Toggle Group composite behavior or visual role.
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
    - "User picks from a small set of mutually exclusive options shown as visually grouped buttons (single mode)."
    - "User toggles multiple independent options that share a control (multiple mode, type=\"multiple\")."
    - "The choices are short labels or icons (text alignment, view density, list/grid mode) better surfaced than in a select."
    - "You want a visual variant — default filled pill group or .ren-toggle-group-outline."
    - "You need size variants (.ren-toggle-group-sm / .ren-toggle-group-lg), full-width fill, or vertical orientation."
  avoidWhen:
    - "The choice set is large or sortable — use ren-select."
    - "The choice is binary on/off for a single concept — use ren-switch or ren-checkbox."
    - "Items are commands rather than state — use ren-toolbar."
    - "Items are pages or routes — use ren-tabs or ren-nav."

canonicalImports:
  css:
    - "rends/components/composites/ren-toggle-group/ren-toggle-group.css"
  js:
    - "rends/components/composites/ren-toggle-group/ren-toggle-group.js"
  notes:
    - "JS is required: it wires role=button, roving tabindex, aria-pressed updates, keyboard navigation, and the ren-toggle-group-change event."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "<ren-toggle-group type=\"single|multiple\" value=\"...\"> wraps real <button class=\"ren-toggle-group-item\" data-value=\"...\"> elements (the component will also accept [role=button] nodes)."
  - "Each item must carry a data-value attribute or a stable textContent — the component uses it to drive selection and the change event."
  - "Set type=\"single\" for mutually-exclusive selection (the component clears other aria-pressed values) or type=\"multiple\" for independent toggles."
  - "Variants are applied on the host: .ren-toggle-group-outline, .ren-toggle-group-sm / -lg, .ren-toggle-group-full, .ren-toggle-group-vertical."
  - "Icons inside items must be <svg> or [role=\"img\"] children sized to 1em (handled by the CSS); accompany icons with text or aria-label."

forbiddenPatterns:
  - "<a href> as items — toggle-group is for state, not navigation."
  - "Setting aria-pressed manually on items; let the component drive it via setValue / click handling."
  - "Using ren-btn inside the group as items — they bring their own chrome; use plain <button class=\"ren-toggle-group-item\"> instead."
  - "Hardcoding the pressed background (background: #fff) — use --color-surface / --color-accent semantic tokens and the outline variant for accent fills."
  - "Removing the focus-visible outline without restoring an outline-offset visible ring."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-toggle-active-bg, --ren-toggle-active-color, --ren-toggle-bg, --ren-toggle-color, --ren-toggle-font-size, --ren-toggle-font-weight, --ren-toggle-height, --ren-toggle-padding-x, --ren-toggle-radius."
    - "Semantic tokens: --color-fill, --color-surface, --color-text, --color-text-muted, --color-accent, --color-border, --color-border-strong."
    - "Shape / motion tokens: --radius-md, --radius-lg, --space-*, --shadow-sm, --touch-min, --transition-tactile, font-size tokens (--font-size-label, --font-size-body, --font-size-xs)."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / rgb / named color values in overrides for the pressed background or accent border."
    - "Hardcoded transition durations on item hover; route through --transition-tactile."

accessibility:
  required:
    - "Items are real <button> elements with role=\"button\" and aria-pressed reflecting state; roving tabindex ensures only one item is tabindex=0 at a time."
    - "Arrow Right/Down moves focus to the next item, Arrow Left/Up to the previous (wrapping); Home / End jump to first / last."
    - "Touch target meets calc(var(--touch-min) - 4px); .ren-toggle-group-sm should only be used in non-touch contexts."
    - "Active state communicates via background AND font-weight / box-shadow — never rely on color alone."
    - "Focus-visible outline is 2px solid var(--color-accent) with outline-offset; preserve it across all variants."
    - "Disabled items use :disabled with pointer-events: none so they remain in tab order semantics but cannot be activated."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-toggle-group/ren-toggle-group.css">
<script type="module" src="rends/components/composites/ren-toggle-group/ren-toggle-group.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<ren-toggle-group type="single" value="left"><button class="ren-toggle-group-item" type="button" data-value="left">Left</button><button class="ren-toggle-group-item" type="button" data-value="center">Center</button><button class="ren-toggle-group-item" type="button" data-value="right">Right</button></ren-toggle-group>

```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-toggle-group`
- `.ren-toggle-group-full`
- `.ren-toggle-group-item`
- `.ren-toggle-group-lg`
- `.ren-toggle-group-outline`
- `.ren-toggle-group-sm`
- `.ren-toggle-group-vertical`

## States And Attributes

- `[aria-pressed]`
- `[data-state]`
- `:disabled`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-toggle-active-bg`
- `--ren-toggle-active-color`
- `--ren-toggle-bg`
- `--ren-toggle-color`
- `--ren-toggle-font-size`
- `--ren-toggle-font-weight`
- `--ren-toggle-height`
- `--ren-toggle-padding-x`
- `--ren-toggle-radius`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-toggle-group/ren-toggle-group.css`
- `components/composites/ren-toggle-group/ren-toggle-group.js`
- `docs/components/ren-toggle-group.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
