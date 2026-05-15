# ren-checkbox Component Contract

Native checkbox styling with checked, indeterminate, disabled, and focus states.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-checkbox` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-checkbox` primitive.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Checkbox primitive behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this primitive.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "The control toggles a boolean value (checked / unchecked) for a single option."
    - "The control belongs in a list where each option is independently selectable (multi-select)."
    - "You need an indeterminate / mixed state (e.g., parent of a tree, \"select all\" with partial children)."
    - "You need native form-submission semantics (name / value / required) tied to a real <input type=\"checkbox\">."
    - "The label sits next to a custom-styled box that participates in :checked / :hover / :focus-visible / :indeterminate / :disabled states."
  avoidWhen:
    - "The control is an on/off toggle with two visible states — use ren-switch."
    - "The control is one of several mutually-exclusive options — use ren-radio."
    - "You need a yes/no choice inside a tabular row without form submission — consider ren-switch."
    - "You need a tri-state with named states beyond on/off/mixed — design a custom segmented control."

canonicalImports:
  css:
    - "rends/components/primitives/ren-checkbox/ren-checkbox.css"
  notes:
    - "CSS-only primitive — no colocated JS exists. Indeterminate must be set in JS via input.indeterminate = true; the CSS reacts to :indeterminate."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Wrap each control in <label class=\"ren-checkbox\"> containing exactly one <input type=\"checkbox\"> and one <span class=\"ren-checkbox-control\"> sibling, in that order."
  - "Label text goes in a trailing <span> (or text node) after .ren-checkbox-control so :checked + .ren-checkbox-control adjacency works."
  - "Group related checkboxes inside a <fieldset> with a <legend> to provide a group accessible name."
  - "For indeterminate state, set input.indeterminate = true via JS; you cannot express it via an HTML attribute alone."
  - "Disabled inputs must use the real disabled attribute — the .ren-checkbox:has(input:disabled) selector relies on it."

forbiddenPatterns:
  - "Replacing <input type=\"checkbox\"> with a <div role=\"checkbox\"> — breaks form submission and native keyboard."
  - "Hiding the input with display:none — destroys keyboard focus; use the documented visually-hidden technique already in the CSS."
  - "Custom checkmark glyphs injected via JS or inline SVG — the ::after pseudo owns the checkmark."
  - "Mixing two label nodes per input (e.g., wrapping <label> plus a separate <label for>) — choose one."
  - "Communicating error / validity via color alone; pair with text or an inline error message."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-checkbox-border, --ren-checkbox-checked-bg, --ren-checkbox-checked-color, --ren-checkbox-duration, --ren-checkbox-easing, --ren-checkbox-gap, --ren-checkbox-radius, --ren-checkbox-size."
    - "Semantic tokens: --color-accent, --color-accent-hover, --color-on-accent, --color-border-strong, --color-text, --color-focus-ring."
    - "Layout / motion tokens: --space-2, --radius-sm, --touch-min, --ring-width, --ring-offset-width, --duration-state, --duration-tactile, --ease-enter, --ease-playful."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors for the checked fill, border, or checkmark."
    - "Raw transition values; use --ren-checkbox-duration / --ren-checkbox-easing or the --duration-* / --ease-* tokens."

accessibility:
  required:
    - "Always use a real <input type=\"checkbox\"> so Space toggles, Tab focuses, and form submission carries the value."
    - "Touch target stays ≥ var(--touch-min) via min-height on .ren-checkbox; do not shrink below that for touch contexts."
    - "Focus is visible on the .ren-checkbox-control via :focus-visible outline driven by --color-focus-ring and --ring-width."
    - "Each checkbox has an accessible name via its wrapping <label> text; never rely on placeholder or title alone."
    - "Group multiple related checkboxes inside <fieldset><legend> for a programmatic group name."
    - "Disabled state must use the native disabled attribute (not just aria-disabled) so the input is excluded from form submission and keyboard navigation."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-checkbox/ren-checkbox.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-checkbox">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-checkbox`
- `.ren-checkbox-control`

For toggle switches with on/off semantics, see the sibling primitive `ren-switch`.

## States And Attributes

- `:active`
- `:checked`
- `:disabled`
- `:focus-visible`
- `:hover`
- `:indeterminate`

## Public Token API

- `--ren-checkbox-border`
- `--ren-checkbox-checked-bg`
- `--ren-checkbox-checked-color`
- `--ren-checkbox-duration`
- `--ren-checkbox-easing`
- `--ren-checkbox-gap`
- `--ren-checkbox-radius`
- `--ren-checkbox-size`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/primitives/ren-checkbox/ren-checkbox.css`
- `docs/components/ren-checkbox.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
