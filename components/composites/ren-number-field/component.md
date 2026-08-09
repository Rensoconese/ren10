# ren-number-field Component Contract

Numeric input composite with increment/decrement affordances.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-number-field` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-number-field` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Number Field composite behavior or visual role.
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
    - "User needs a discrete numeric value with visible − / + stepper buttons (quantities, counts, ratings out of N)."
    - "Need long-press auto-repeat with acceleration on the stepper buttons (mouse and touch)."
    - "Need keyboard contract: ArrowUp/Down for ±step, Home/End for min/max, clamped to min/max/step bounds."
    - "Need data-invalid / data-valid states wired to the wrapper (single source of truth for the focus ring)."
    - "Need :has(:focus) to color the whole group, not just the inner input."
  avoidWhen:
    - "Free-form numeric typing without bounds — use a plain <input type=\"number\"> styled via ren-input."
    - "Continuous value selection with visible track — use ren-slider."
    - "Numeric value paired with a unit selector (10 px / 1 rem) — compose ren-input with a ren-select."
    - "Currency / locale-formatted amount with thousands separators — that needs a masked input, not a stepper."

canonicalImports:
  css:
    - "rends/components/composites/ren-number-field/ren-number-field.css"
  js:
    - "rends/components/composites/ren-number-field/ren-number-field.js"
  notes:
    - "Public Token API has no --ren-number-field-* tokens; theme through semantic input/fill tokens listed below."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Use <ren-number-field min=\"…\" max=\"…\" step=\"…\" value=\"…\"> as the host so attributes wire min/max/step on the inner input."
  - "Inner input is <input type=\"number\" class=\"ren-number-field-input\"> — keep type=\"number\" so mobile keyboards switch to digits."
  - "Decrement / increment must be real type=\"button\" steppers with class=\"ren-number-field-decrement\" / class=\"ren-number-field-increment\" and aria-label=\"Decrease\" / \"Increase\" (the component fills these if missing)."
  - "Leave the stepper buttons empty: the CSS injects − and + via ::before, so writing the glyph as button text renders −− / ++."
  - "The host element carries .ren-number-field; the component adds it on connect, so <ren-number-field> alone is enough."
  - "Validation state goes on the wrapper as [data-invalid] or [data-valid]; the inner focus ring color reads from --color-danger / --color-success."
  - "Size variants are .ren-number-field-sm and .ren-number-field-lg on the wrapper; do not size buttons or input independently."

forbiddenPatterns:
  - "Wrapping a <span role=\"button\"> instead of a real <button> for the steppers — long-press auto-repeat hooks depend on native button events."
  - "Showing the native spinner UI — the CSS already hides ::-webkit-inner-spin-button / ::-webkit-outer-spin-button and uses -moz-appearance: textfield."
  - "Bypassing the host's clamp() by writing this.value directly — call setValue(), increment(), or decrement() so min/max/step clamping runs and ren-change dispatches."
  - "Removing aria-label from the stepper buttons — the visible ± glyph alone has no accessible name."
  - "Writing − / + as the stepper button text — the CSS already injects them with ::before, so the button renders −− / ++."
  - "Custom outline on the inner input — focus styling is owned by the wrapper via :has(.ren-number-field-input:focus)."

tokenPolicy:
  allowed:
    - "Semantic input tokens: --color-input-bg, --color-input-bg-hover, --color-input-border, --color-input-border-focus, --color-input-focus-ring, --color-input-placeholder, --color-disabled-bg, --color-disabled-text."
    - "Semantic neutral / state tokens: --color-text, --color-border, --color-fill-hover, --color-fill-active, --color-danger, --color-success."
    - "Layout / type / motion tokens: --space-1, --space-2, --space-3, --space-4, --stroke-1, --radius-sm, --radius-md, --radius-lg, --touch-min, --size-sm, --size-lg, --body-size, --text-sm, --text-lg, --font-mono, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer overrides."
    - "Hardcoded hex / rgb() values; the current CSS still has two rgb() calls for focus-ring tints — do not propagate that pattern, theme via tokens."
    - "Inventing --ren-number-field-* custom properties not present in the source until they ship in the Public Token API."

accessibility:
  required:
    - "Stepper buttons keep min-width / height = var(--touch-min) (44px) — do not shrink below this except inside .ren-number-field-sm for non-touch contexts."
    - "Each stepper has an aria-label (\"Decrease\" / \"Increase\"); the icon is decorative content."
    - "ArrowUp / ArrowDown on the input dispatch increment()/decrement(); Home / End jump to min / max; values are always clamped before dispatching ren-change."
    - "Disabled state sets disabled on the inner input AND both buttons so they are removed from the tab order — do not rely on opacity alone."
    - "data-invalid / data-valid changes border AND focus ring color, but always pair with text feedback near the field — color is not the only signal."
    - "Long-press auto-repeat must stop on pointerup/touchend AND mouseleave so dragging off the button cancels acceleration."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-number-field/ren-number-field.css">
<script type="module" src="rends/components/composites/ren-number-field/ren-number-field.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<ren-number-field min="0" max="10" step="1" value="2"><button class="ren-number-field-decrement" type="button" aria-label="Decrease"></button><input class="ren-number-field-input" type="number" aria-label="Quantity"><button class="ren-number-field-increment" type="button" aria-label="Increase"></button></ren-number-field>

```

The stepper buttons stay empty: the CSS draws `−` and `+` through
`::before`, so typing the glyph as button text renders `−−` / `++`. The
`aria-label` is what names them.

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-number-field`
- `.ren-number-field-decrement`
- `.ren-number-field-increment`
- `.ren-number-field-input`
- `.ren-number-field-lg`
- `.ren-number-field-sm`

## States And Attributes

- `[data-invalid]`
- `[data-valid]`
- `:active`
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
- The auto-generated stepper `aria-label`s come from `utils/i18n.js` and are resolved once while the DOM is built, so call `setLocale()` before the component upgrades — a locale change after mount does not relabel existing steppers.

## Related Files

- `components/composites/ren-number-field/ren-number-field.css`
- `components/composites/ren-number-field/ren-number-field.js`
- `docs/components/ren-number-field.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
