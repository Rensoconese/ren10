# ren-form

Form validation + layout pattern. Wraps a native `<form>` with declarative
field rules, error summaries, multi-step support, and emit-on-submit
events. Pairs with `ren-field` for control-level wiring.

Load this file after `ren-design.md` and before generating, editing, or
reviewing any `<ren-form>` UI.

## Purpose

The form-level pattern in RenDS. Owns:
- Declarative validation (`data-rules`) with built-in validators
  (`required`, `email`, `min`, `max`, `pattern`, `match`, etc.).
- Validation timing modes (`onSubmit`, `onBlur`, `onChange`, `onTouched`).
- Error summary management at the top of the form.
- Multi-step (wizard) progression via `data-steps`.
- Submitting / disabled state propagation across the form.

Field-level ARIA wiring is delegated to `ren-field`. Layout uses
`ren-stack` / `ren-form-row` / `ren-form-section`.

## Use When

- The page is a real form (login, signup, settings, checkout, multi-step
  wizard) that needs declarative validation rules.
- You want a single error summary at the top of the form, focusable on
  invalid submit.
- You want consistent submitting state and event-driven submission.
- You are using `ren-field` to wrap the controls.

## Do Not Use When

- The "form" is a single search input — use `<form>` + `ren-field` directly.
- The "form" is a chat composer or freeform editor — use a custom flow.
- You need fully-custom field validation that does not fit the
  `data-rules` DSL — use a plain `<form>` with your own JS.
- The interaction is a step-by-step UI without form fields — use
  `ren-tabs` or `ren-empty-state` flows.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "The UI is a real form with multiple fields and validation."
    - "You want declarative rules (data-rules=\"required|email|min:8\")."
    - "You want a single error summary that focuses on invalid submit."
    - "You want submitting state to disable the form during async submission."
    - "You want a multi-step wizard with progress indicator."
  avoidWhen:
    - "It is a single-input search/filter — use ren-field alone."
    - "Validation logic is irreducibly custom and the data-rules DSL would not express it."
    - "The flow is not actually a form (chat composer, command palette, etc.)."

canonicalImports:
  css:
    - "rends/components/patterns/ren-form/ren-form.css"
  js:
    - "rends/components/patterns/ren-form/ren-form.js"
  notes:
    - "Always pair with rends/components/primitives/ren-field/ren-field.css + ren-field.js for field wiring."

requiredMarkup:
  - "<ren-form> wraps a real <form>. Do not omit the <form> element."
  - "Each input lives inside <ren-field>; do not use bare <input> at the top level of the form."
  - "Add data-validate=\"onSubmit|onBlur|onChange|onTouched\" on <ren-form>; default is onSubmit."
  - "If using rules, attach data-rules to each <ren-field> (or to the inner control), not to the <form>."
  - "Submit button must be type=\"submit\" inside the <form>."
  - "Provide an empty .ren-form-error-summary with role=\"alert\" tabindex=\"-1\" so the component can populate AND focus it on invalid submit. The component sets tabindex=\"-1\" automatically if you forget."

forbiddenPatterns:
  - "<ren-form> wrapping a <div> instead of a <form>."
  - "Manual aria-invalid / aria-describedby — ren-field owns those."
  - "Submitting via fetch from a custom click handler that bypasses the ren-submit event."
  - "Using a placeholder as the only label."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-field-* for input chrome, --ren-btn-* for actions."
    - "Layout tokens (--space-*) and semantic colors for content."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, etc.)."
    - "Hardcoded colors / sizes that bypass tokens."

accessibility:
  required:
    - "Native <form> semantics; preserve the submit event."
    - "Each control has a <label> via ren-field."
    - "Error summary has role=\"alert\" AND tabindex=\"-1\" so .focus() actually shifts focus on invalid submit. The component sets tabindex=\"-1\" if missing."
    - "Required-state must be explicit (required attribute), not placeholder-only."
    - "Disabled / submitting state cannot strip focus rings."
```

## Required CSS / JS Imports

```html
<link rel="stylesheet" href="rends/components/patterns/ren-form/ren-form.css">
<link rel="stylesheet" href="rends/components/primitives/ren-field/ren-field.css">
<script type="module" src="rends/components/patterns/ren-form/ren-form.js"></script>
<script type="module" src="rends/components/primitives/ren-field/ren-field.js"></script>
```

## Canonical Markup

Single-step login form with onTouched validation:

```html
<ren-form data-validate="onTouched">
  <form class="ren-form ren-stack" novalidate>
    <div class="ren-form-error-summary" role="alert" tabindex="-1" hidden>
      <strong>Please fix the following errors:</strong>
      <ul></ul>
    </div>

    <ren-field data-rules="required|email">
      <label>Email</label>
      <input class="ren-input" type="email" name="email" autocomplete="email" required>
      <span data-error></span>
    </ren-field>

    <ren-field data-rules="required|min:8">
      <label>Password</label>
      <input class="ren-input" type="password" name="password" autocomplete="current-password" required minlength="8">
      <span data-error></span>
    </ren-field>

    <div class="ren-form-actions">
      <button class="ren-btn ren-btn-full" type="submit">Sign in</button>
    </div>
  </form>
</ren-form>

<script type="module">
  document.querySelector('ren-form').addEventListener('ren-submit', (e) => {
    e.preventDefault();
    fetch('/api/login', { method: 'POST', body: JSON.stringify(e.detail.values) });
  });
</script>
```

Multi-step form with progress:

```html
<ren-form data-validate="onSubmit" data-steps="3">
  <form class="ren-form ren-stack">
    <ol class="ren-form-progress" aria-label="Progress">
      <li class="ren-form-step" data-active>
        <span class="ren-form-step-label">Account</span>
      </li>
      <li class="ren-form-step">
        <span class="ren-form-step-label">Profile</span>
      </li>
      <li class="ren-form-step">
        <span class="ren-form-step-label">Review</span>
      </li>
    </ol>
    <!-- step sections … -->
  </form>
</ren-form>
```

## Attributes, Events, and API

- Host attributes:
  - `data-validate="onSubmit|onBlur|onChange|onTouched"` (default: `onSubmit`).
  - `data-steps="N"` enables multi-step mode.
- Field rules: `data-rules="required|email|min:8|max:64|pattern:^[A-Z]+$|match:password"`.
- Submitting state: component sets `[data-submitting]` on `<ren-form>` and
  disables submit buttons while the `ren-submit` consumer is async.
- Events:
  - `ren-submit` — `detail.values` (validated form data).
  - `ren-invalid` — `detail.errors` (rule failures).
- Static API: `RenForm.registerValidator(name, fn)` for custom validators.

## Variants and Public Selectors

| Class                          | Role                                   |
|--------------------------------|----------------------------------------|
| `.ren-form`                    | Form root chrome.                      |
| `.ren-form-section`            | Visually grouped section.              |
| `.ren-form-section-title`      | Section heading.                       |
| `.ren-form-row`                | Horizontal row of fields.              |
| `.ren-form-actions`            | Footer of action buttons.              |
| `.ren-form-error-summary`      | Top-of-form error summary.             |
| `.ren-form-success`            | Post-submit confirmation slot.         |
| `.ren-form-progress`           | Multi-step progress bar.               |
| `.ren-form-step`               | Single step.                           |
| `.ren-form-step-label`         | Step label text.                       |

## States

| Selector / attr        | Meaning                                                |
|------------------------|--------------------------------------------------------|
| `[data-submitting]`    | Form is processing; submit buttons disabled.           |
| `[data-has-errors]`    | One or more fields are currently invalid.              |
| `[data-invalid]`       | A specific field is invalid.                           |
| `[data-active]`        | Active step in a multi-step form.                      |
| `[data-completed]`     | Completed step.                                        |
| `[data-disabled]`      | A step is locked.                                      |

## Public Token API

Form layout uses `ren-stack` / `--space-*`. Field chrome inherits from
`ren-field`:

- `--ren-field-bg`
- `--ren-field-border-color`
- `--ren-field-border-width`
- `--ren-field-radius`
- `--ren-field-height`
- `--ren-field-padding-x`
- `--ren-field-padding-y`
- `--ren-field-color`
- `--ren-field-placeholder`
- `--ren-field-focus-color`
- `--ren-field-error-color`
- `--ren-field-success-color`

## Accessibility Contract

- The form is a real `<form>` element. `ren-form` is an enhancement.
- Each control lives in `ren-field` (auto-wires label / description / error
  IDs).
- The error summary has `role="alert"` and `tabindex="-1"` (the component
  sets `tabindex="-1"` automatically if it is missing). It receives focus
  on invalid submit so screen readers and keyboard users land on the
  error list.
- `required` is the source of truth for required state; visual indicators
  pair with it.
- Submit buttons are real `<button type="submit">`.
- During submitting state, focus stays on the form (do not yank focus).

## Anti-Patterns

- ❌ `<ren-form><div>…</div></ren-form>` — wrap a real `<form>`.
- ❌ Bare `<input>` at the top of the form without a `ren-field`.
- ❌ Bypassing `ren-submit` and POSTing from the click handler.
- ❌ Hand-writing `aria-invalid` / `aria-describedby` — `ren-field` owns
  these.
- ❌ Using placeholder as a label.

## Related Files

- `components/patterns/ren-form/ren-form.css`
- `components/patterns/ren-form/ren-form.js`
- `components/primitives/ren-field/component.md`
- `docs/components/ren-form.html`
- `ren-design.md`
- `tokens/tokens.md`

## Test Expectations

- Run component / docs a11y coverage on submit / invalid flows.
- Run `npm run lint` after token / selector changes.
- Manually verify keyboard-only submit and error summary focus.
