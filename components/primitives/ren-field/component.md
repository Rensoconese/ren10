# ren-field

Form-field wrapper that connects labels, descriptions, errors, and the
underlying control through ARIA. Carries the field's visual frame
(input chrome, error / valid borders, sizing).

Load this file after `ren-design.md` and before generating, editing, or
reviewing any `<ren-field>` UI.

## Purpose

Owns the wiring between a `<label>`, helper text (`[data-description]`),
error text (`[data-error]`), and the control inside it. The custom element
auto-generates IDs, links them via `for` / `aria-labelledby` /
`aria-describedby` / `aria-errormessage`, and toggles `aria-invalid` and
`data-invalid` from the host's validation state. Visual styling for the
control itself comes from `.ren-input` / `.ren-input-wrapper`.

## Use When

- The UI is a labeled form control: text, email, password, number, search,
  url, date, textarea, select.
- The control needs helper text and / or error text wired through ARIA.
- You want consistent field heights, border / focus ring treatment, and
  validation states across the app.
- The field belongs to a `ren-form` pattern that drives validation.

## Do Not Use When

- The control is a single button — use `ren-button`.
- The control is a checkbox / radio / switch — use `ren-checkbox` /
  `ren-radio` / `ren-toggle-group`.
- The control is a search/combobox with autocomplete — use `ren-combobox`.
- You only need a static label-value pair for display — use `<dl>` /
  `ren-card` content.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "The control is a labeled form input that benefits from auto-wired ARIA."
    - "You need helper text + error text + invalid styling tied to the same control."
    - "You want a consistent input frame (height, padding, focus ring, error border)."
    - "You are inside a <ren-form> that drives validation."
  avoidWhen:
    - "The control is a checkbox / radio / switch — use those primitives directly."
    - "The control is a combobox / select with custom listbox — use ren-combobox / ren-select."
    - "You need a fully custom number stepper — use ren-number-field."
    - "You need OTP segmented inputs — use ren-otp."

canonicalImports:
  css:
    - "rends/components/primitives/ren-field/ren-field.css"
  js:
    - "rends/components/primitives/ren-field/ren-field.js"
  notes:
    - "JS is required for ARIA wiring and validation state syncing — do not skip."

requiredMarkup:
  - "<ren-field> wraps exactly one <label>, exactly one control, plus optional [data-description] and [data-error]."
  - "Error and description nodes do not need their own IDs — the component generates them."
  - "Native control attributes drive validity (required, type=email, pattern, min, max). Do not duplicate validation in JS for the same rules."
  - "Use .ren-input on inputs / textareas / selects; use .ren-input-wrapper for icon adornments."

forbiddenPatterns:
  - "Manual aria-describedby / aria-errormessage on the input — the component sets them."
  - "Reaching into the slotted control to override .ren-input internals; theme via --ren-field-* tokens."
  - "Showing error text without setting [data-invalid] / aria-invalid on the control."
  - "Hiding required-state info in placeholder text."

tokenPolicy:
  allowed:
    - "Component tokens: every --ren-field-* listed in Public Token API."
    - "Semantic tokens for any custom decoration (--color-text-muted for the description, etc.)."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, etc.) in consumer code."
    - "Hardcoded hex / rgb colors in consumer overrides."

accessibility:
  required:
    - "Always provide a visible <label>; do not rely on placeholder text."
    - "Required inputs must mark required (the attribute) — visual indicator alone is not enough."
    - "Error messages must be set in [data-error] AND aria-invalid must be true on the control."
    - "Keep visible focus rings; do not remove the input outline without a replacement."
    - "Disabled fields use the disabled attribute on the control, not aria-disabled alone."
```

## Required CSS / JS Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-field/ren-field.css">
<script type="module" src="rends/components/primitives/ren-field/ren-field.js"></script>
```

## Canonical Markup

Required email field with helper + error:

```html
<ren-field>
  <label>Email</label>
  <input class="ren-input" type="email" name="email" autocomplete="email" required>
  <span data-description>We will never share your email.</span>
  <span data-error>Enter a valid email address.</span>
</ren-field>
```

Password with visible label and helper:

```html
<ren-field>
  <label>Password</label>
  <input class="ren-input" type="password" name="password" autocomplete="new-password" minlength="8" required>
  <span data-description>At least 8 characters.</span>
  <span data-error></span>
</ren-field>
```

Textarea:

```html
<ren-field>
  <label>Notes</label>
  <textarea class="ren-input" name="notes" rows="4"></textarea>
</ren-field>
```

Input with leading icon:

```html
<ren-field>
  <label>Search</label>
  <span class="ren-input-wrapper">
    <span class="ren-input-icon" aria-hidden="true">🔍</span>
    <input class="ren-input" type="search" name="q">
  </span>
</ren-field>
```

## Variants

| Class                       | Role                                |
|-----------------------------|-------------------------------------|
| `.ren-input`                | Base input chrome.                  |
| `.ren-input-sm` / `-lg`     | Size override.                      |
| `.ren-input-error`          | Manual error styling on the input.  |
| `.ren-input-success`        | Manual success styling.             |
| `.ren-input-wrapper`        | Container for adornments.           |
| `.ren-input-icon`           | Leading icon slot.                  |
| `.ren-input-icon-end`       | Trailing icon slot.                 |
| `.ren-field-label`          | Label slot styling.                 |
| `.ren-field-description`    | Helper text slot styling.           |
| `.ren-field-error`          | Error slot styling.                 |

## States

| Selector / attr        | Meaning                                              |
|------------------------|------------------------------------------------------|
| `:hover` / `:active`   | Pointer interaction.                                 |
| `:focus-visible`       | Keyboard focus on the control.                       |
| `:disabled`            | Native disabled state.                               |
| `:user-invalid`        | Native validity after interaction (CSS Lv4).         |
| `:user-valid`          | Native validity after interaction (CSS Lv4).         |
| `[aria-invalid="true"]` / `[data-invalid]` | Component-driven invalid state.  |
| `[data-valid]`         | Component-driven valid state.                        |
| `[data-required]`      | Component marks required visually.                   |
| `[data-description]`   | Slot for helper text.                                |
| `[data-error]`         | Slot for error text.                                 |

## Public Token API

- `--ren-field-bg`
- `--ren-field-border-color`
- `--ren-field-border-width`
- `--ren-field-radius`
- `--ren-field-height`
- `--ren-field-padding-x`
- `--ren-field-padding-y`
- `--ren-field-font-size`
- `--ren-field-color`
- `--ren-field-placeholder`
- `--ren-field-focus-color`
- `--ren-field-error-color`
- `--ren-field-success-color`

## Accessibility Contract

- Always provide a visible `<label>`; placeholder is not a label.
- Required inputs use the native `required` attribute; mark it visually too.
- Error text lives in `[data-error]`. The component sets `aria-invalid` on
  the control automatically when the host marks the field invalid.
- Focus rings must remain visible — do not strip outline without restoring.
- Disabled fields use `disabled` on the control. `aria-disabled` is only
  acceptable when the disabled state must remain focusable.

## Anti-Patterns

- ❌ Putting label text in `placeholder` instead of `<label>`.
- ❌ Manual `aria-describedby` / `aria-errormessage` on the input — the
  component owns these.
- ❌ Showing error text without setting `aria-invalid` on the control.
- ❌ `.ren-input { border: 2px solid #ccc; }` — theme through
  `--ren-field-border-*` tokens.

## Related Files

- `components/primitives/ren-field/ren-field.css`
- `components/primitives/ren-field/ren-field.js`
- `components/patterns/ren-form/pattern.md` (validation pattern)
- `docs/components/ren-field.html`
- `ren-design.md`
- `tokens/tokens.md`

## Test Expectations

- Run component / docs a11y coverage when markup, ARIA, or validation
  behavior changes.
- Run `npm run lint` after token / selector changes.
- Manually verify light/dark themes for focus ring and error glow.
