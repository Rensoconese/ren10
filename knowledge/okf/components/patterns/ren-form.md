---
type: "RenDS Component"
title: ren-form
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:pattern:ren-form
sourcePath: components/patterns/ren-form
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - component
  - pattern
  - ren10
  - rends
---

# ren-form

Source path: `components/patterns/ren-form`

## Relationships

- `exposes_selector` -> [.ren-field](../../selectors/ren-field.md)
- `exposes_selector` -> [.ren-form](../../selectors/ren-form.md)
- `exposes_selector` -> [.ren-form-actions](../../selectors/ren-form-actions.md)
- `exposes_selector` -> [.ren-form-error-summary](../../selectors/ren-form-error-summary.md)
- `exposes_selector` -> [.ren-form-progress](../../selectors/ren-form-progress.md)
- `exposes_selector` -> [.ren-form-row](../../selectors/ren-form-row.md)
- `exposes_selector` -> [.ren-form-section](../../selectors/ren-form-section.md)
- `exposes_selector` -> [.ren-form-section-title](../../selectors/ren-form-section-title.md)
- `exposes_selector` -> [.ren-form-step](../../selectors/ren-form-step.md)
- `exposes_selector` -> [.ren-form-step-label](../../selectors/ren-form-step-label.md)
- `exposes_selector` -> [.ren-form-success](../../selectors/ren-form-success.md)
- `has_contract` -> [ren-form pattern.md](../../foundation/contract-pattern-ren-form.md)
- `has_css` -> [ren-form.css](../../css/ren-form-css.md)
- `has_docs_page` -> [ren-form docs](../../docs/ren-form-docs.md)
- `has_js` -> [ren-form.js](../../javascript/ren-form-js.md)
- `used_by_example` -> [auth-form.html](../../examples/auth-form-html.md) (ren-form)
- `used_by_example` -> [dashboard-shell.html](../../examples/dashboard-shell-html.md) (selector)
- `used_by_example` -> [data-table.html](../../examples/data-table-html.md) (selector)
- `used_by_example` -> [dialog-workflow.html](../../examples/dialog-workflow-html.md) (ren-form)
- `used_by_example` -> [settings-form.html](../../examples/settings-form-html.md) (ren-form)
- `uses_token` -> [--body-sm-size](../../tokens/body-sm-size.md)
- `uses_token` -> [--caption-size](../../tokens/caption-size.md)
- `uses_token` -> [--color-accent](../../tokens/color-accent.md)
- `uses_token` -> [--color-accent-subtle](../../tokens/color-accent-subtle.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-danger](../../tokens/color-danger.md)
- `uses_token` -> [--color-danger-subtle](../../tokens/color-danger-subtle.md)
- `uses_token` -> [--color-fill](../../tokens/color-fill.md)
- `uses_token` -> [--color-on-accent](../../tokens/color-on-accent.md)
- `uses_token` -> [--color-on-success](../../tokens/color-on-success.md)
- `uses_token` -> [--color-success](../../tokens/color-success.md)
- `uses_token` -> [--color-success-subtle](../../tokens/color-success-subtle.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-faint](../../tokens/color-text-faint.md)
- `uses_token` -> [--color-text-muted](../../tokens/color-text-muted.md)
- `uses_token` -> [--duration-enter](../../tokens/duration-enter.md)
- `uses_token` -> [--duration-state](../../tokens/duration-state.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--label-size](../../tokens/label-size.md)
- `uses_token` -> [--label-weight](../../tokens/label-weight.md)
- `uses_token` -> [--leading-normal](../../tokens/leading-normal.md)
- `uses_token` -> [--radius-md](../../tokens/radius-md.md)
- `uses_token` -> [--space-1](../../tokens/space-1.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-3](../../tokens/space-3.md)
- `uses_token` -> [--space-4](../../tokens/space-4.md)
- `uses_token` -> [--space-6](../../tokens/space-6.md)
- `uses_token` -> [--title-sm-leading](../../tokens/title-sm-leading.md)
- `uses_token` -> [--title-sm-size](../../tokens/title-sm-size.md)
- `uses_token` -> [--title-sm-weight](../../tokens/title-sm-weight.md)
- `uses_token` -> [--weight-bold](../../tokens/weight-bold.md)
- `uses_token` -> [--weight-semibold](../../tokens/weight-semibold.md)

## Structured Data

```json
{
  "kind": "pattern",
  "selectors": [
    ".ren-field",
    ".ren-form",
    ".ren-form-actions",
    ".ren-form-error-summary",
    ".ren-form-progress",
    ".ren-form-row",
    ".ren-form-section",
    ".ren-form-section-title",
    ".ren-form-step",
    ".ren-form-step-label",
    ".ren-form-success"
  ],
  "tokens": [
    "--body-sm-size",
    "--caption-size",
    "--color-accent",
    "--color-accent-subtle",
    "--color-border",
    "--color-danger",
    "--color-danger-subtle",
    "--color-fill",
    "--color-on-accent",
    "--color-on-success",
    "--color-success",
    "--color-success-subtle",
    "--color-text",
    "--color-text-faint",
    "--color-text-muted",
    "--duration-enter",
    "--duration-state",
    "--ease-enter",
    "--label-size",
    "--label-weight",
    "--leading-normal",
    "--radius-md",
    "--space-1",
    "--space-2",
    "--space-3",
    "--space-4",
    "--space-6",
    "--title-sm-leading",
    "--title-sm-size",
    "--title-sm-weight",
    "--weight-bold",
    "--weight-semibold"
  ],
  "hasScript": true,
  "hasDocsPage": true
}
```

## Source Content

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


/* ============================================
   RenDS — Form Validation System Organism
   ============================================
   Multi-step form with field validation,
   error summaries, and accessibility features.

   Includes:
   - Form container with field stack layout
   - Section grouping and horizontal rows
   - Error summary boxes (CSS shown/hidden)
   - Multi-step progress indicators
   - Loading/submitting states
   - Responsive design

   Light DOM — no Shadow DOM.
   ============================================ */

/* ─── Form Container ─── */
.ren-form {
  container-type: inline-size;
  container-name: ren-form;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  width: 100%;
  max-width: 100%;
}

/* Submitting state — disable interactions */
.ren-form[data-submitting] {
  opacity: 0.6;
  pointer-events: none;
}

/* ─── Error Summary ─── */
.ren-form-error-summary {
  padding: var(--space-4);
  background-color: var(--color-danger-subtle);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-md);
  transition: all var(--duration-enter) var(--ease-enter);
}

.ren-form-error-summary[hidden],
.ren-form-error-summary:not([data-has-errors]) {
  display: none;
}

.ren-form-error-summary strong {
  display: block;
  font-size: var(--label-size);
  font-weight: var(--label-weight);
  color: var(--color-danger);
  margin-bottom: var(--space-2);
}

.ren-form-error-summary ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.ren-form-error-summary li {
  font-size: var(--caption-size);
  color: var(--color-danger);
  line-height: var(--leading-normal);
}

.ren-form-error-summary a {
  color: var(--color-danger);
  text-decoration: underline;
  cursor: pointer;
}

.ren-form-error-summary a:hover {
  text-decoration: none;
}

/* ─── Success Message ─── */
.ren-form-success {
  padding: var(--space-4);
  background-color: var(--color-success-subtle);
  border: 1px solid var(--color-success);
  border-radius: var(--radius-md);
  font-size: var(--body-sm-size);
  color: var(--color-success);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  transition: all var(--duration-enter) var(--ease-enter);
}

.ren-form-success[hidden] {
  display: none;
}

/* ─── Form Sections ─── */
.ren-form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.ren-form-section-title {
  font-size: var(--title-sm-size);
  font-weight: var(--title-sm-weight);
  color: var(--color-text);
  margin: 0;
  padding: 0;
  line-height: var(--title-sm-leading);
}

/* ─── Form Row (Horizontal Layout) ─── */
.ren-form-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.ren-form-row > .ren-field {
  flex: 1;
  min-width: 250px;
}

/* Stack on narrow containers */
@container ren-form (max-width: 480px) {
  .ren-form-row {
    flex-direction: column;
    gap: var(--space-4);
  }

  .ren-form-row > .ren-field {
    min-width: 100%;
    flex: none;
  }
}

/* ─── Form Actions ─── */
.ren-form-actions {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-4);
  flex-wrap: wrap;
}

.ren-form-actions button {
  white-space: nowrap;
}

@container ren-form (max-width: 480px) {
  .ren-form-actions {
    flex-direction: column-reverse;
  }

  .ren-form-actions button {
    width: 100%;
  }
}

/* ─── Multi-Step Progress Indicator ─── */
.ren-form-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.ren-form-step {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* Step circle */
.ren-form-step::before {
  content: attr(data-step);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  min-width: 2.5rem;
  border-radius: 50%;
  background-color: var(--color-border);
  color: var(--color-text-muted);
  font-size: var(--label-size);
  font-weight: var(--label-weight);
  transition: all var(--duration-state) var(--ease-enter);
  border: 2px solid transparent;
}

/* Step label */
.ren-form-step-label {
  font-size: var(--label-size);
  font-weight: var(--label-weight);
  color: var(--color-text-muted);
  white-space: nowrap;
  transition: all var(--duration-state) var(--ease-enter);
}

/* Divider between steps */
.ren-form-step:not(:last-child)::after {
  content: '';
  flex: 1;
  height: 2px;
  background-color: var(--color-border);
  min-width: 1rem;
  transition: background-color var(--duration-state) var(--ease-enter);
}

/* Active step */
.ren-form-step[data-active] {
  /* Step circle */
}

.ren-form-step[data-active]::before {
  background-color: var(--color-accent);
  color: var(--color-on-accent);
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-subtle);
}

.ren-form-step[data-active] .ren-form-step-label {
  color: var(--color-accent);
  font-weight: var(--weight-semibold);
}

/* Completed step */
.ren-form-step[data-completed] {
  /* Step circle */
}

.ren-form-step[data-completed]::before {
  background-color: var(--color-success);
  color: var(--color-on-success);
  border-color: var(--color-success);
  content: '✓';
  font-size: 1.25rem;
  font-weight: var(--weight-bold);
}

.ren-form-step[data-completed] .ren-form-step-label {
  color: var(--color-text-muted);
}

/* Divider after completed step is colored */
.ren-form-step[data-completed]:not(:last-child)::after {
  background-color: var(--color-success);
}

/* ─── Disabled step ─── */
.ren-form-step[data-disabled] {
  pointer-events: none;
}

.ren-form-step[data-disabled]::before {
  background-color: var(--color-fill);
  color: var(--color-text-faint);
  opacity: 0.5;
}

.ren-form-step[data-disabled] .ren-form-step-label {
  color: var(--color-text-faint);
  opacity: 0.5;
}

/* Stack steps vertically on narrow containers */
@container ren-form (max-width: 360px) {
  .ren-form-progress {
    flex-direction: column;
    gap: var(--space-3);
  }

  .ren-form-step:not(:last-child)::after {
    content: '';
    width: 2px;
    height: 1.5rem;
    background-color: var(--color-border);
    min-width: 0;
  }
}

/* ─── Smooth focus management ─── */
.ren-form:has(.ren-field[data-invalid]) {
  scroll-behavior: smooth;
}

/* ─── Animation for error entry ─── */
@keyframes slideInError {
  from {
    opacity: 0;
    transform: translateY(-0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ren-form-error-summary[data-has-errors] {
  animation: slideInError var(--duration-enter) var(--ease-enter);
}

@media (prefers-reduced-motion: reduce) {
  .ren-form-error-summary[data-has-errors],
  .ren-form-step::before,
  .ren-form-step-label,
  .ren-form-step:not(:last-child)::after {
    animation: none;
    transition: none;
  }
}


/**
 * RenDS — <ren-form> Form Validation System
 * ==========================================
 * Multi-step form with field validation, error summaries,
 * and accessibility features. Supports custom validators,
 * multiple validation modes, and server-side errors.
 *
 * Light DOM — no Shadow DOM.
 *
 * Usage:
 *   <ren-form data-validate="onTouched" data-steps="3">
 *     <form class="ren-form">
 *       <div class="ren-form-error-summary" hidden>
 *         <strong>Please fix the following errors:</strong>
 *         <ul></ul>
 *       </div>
 *
 *       <div class="ren-form-progress">
 *         <div class="ren-form-step" data-step="1" data-active>
 *           <span class="ren-form-step-label">Account</span>
 *         </div>
 *         <!-- ... -->
 *       </div>
 *
 *       <div class="ren-form-section">
 *         <div class="ren-field" data-rules="required|email">
 *           <label class="ren-field-label" data-required>Email</label>
 *           <input class="ren-input" type="email" name="email" required>
 *           <span class="ren-field-error" hidden></span>
 *         </div>
 *       </div>
 *
 *       <div class="ren-form-actions">
 *         <button type="button">Previous</button>
 *         <button type="submit">Submit</button>
 *       </div>
 *     </form>
 *   </ren-form>
 */

const DEFAULT_VALIDATION_MODE = 'onSubmit';
const DEBOUNCE_DELAY = 300;

/** Built-in validators */
const builtInValidators = {
  required: (value) => {
    return value && value.trim().length > 0
      ? null
      : 'This field is required';
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Please enter a valid email address';
  },

  min: (min) => (value) => {
    if (!value) return null;
    return value.length >= parseInt(min, 10)
      ? null
      : `Must be at least ${min} characters`;
  },

  max: (max) => (value) => {
    if (!value) return null;
    return value.length <= parseInt(max, 10)
      ? null
      : `Must be no more than ${max} characters`;
  },

  pattern: (pattern) => (value) => {
    if (!value) return null;
    try {
      const regex = new RegExp(pattern);
      return regex.test(value) ? null : 'Invalid format';
    } catch (e) {
      return 'Invalid regex pattern';
    }
  },

  match: (fieldName) => (value, form) => {
    const targetField = Array.from(form?.elements || []).find(
      (element) => element.name === fieldName
    );
    if (!targetField) return 'Target field not found';
    return value === targetField.value ? null : 'Fields do not match';
  },
};

export class RenForm extends HTMLElement {
  static #customValidators = new Map();

  constructor() {
    super();
    this._form = null;
    this._fields = [];
    this._errors = new Map();
    this._touched = new Set();
    this._validationMode = DEFAULT_VALIDATION_MODE;
    this._debounceTimers = new Map();
    this._currentStep = 1;
    this._totalSteps = 0;
    this._isSubmitting = false;
    this._errorSummary = null;
    this._successMessage = null;
    this._listenerController = null;
  }

  static registerValidator(name, fn) {
    RenForm.#customValidators.set(name, fn);
  }

  connectedCallback() {
    this._form = this.querySelector('form.ren-form');
    if (!this._form) return;

    this._initElements();
    this._attachEventListeners();
    this._initMultiStep();
  }

  disconnectedCallback() {
    this._removeEventListeners();
    this._clearDebounceTimers();
  }

  _initElements() {
    this._validationMode = this.getAttribute('data-validate') ?? DEFAULT_VALIDATION_MODE;
    this._fields = Array.from(this._form.querySelectorAll('.ren-field'));
    this._errorSummary = this._form.querySelector('.ren-form-error-summary');
    this._successMessage = this._form.querySelector('.ren-form-success');

    // The error summary must be focusable so .focus() actually moves caret /
    // SR position when validation fails. A plain <div role="alert"> is not
    // focusable by default; set tabindex="-1" if the author did not.
    if (this._errorSummary && !this._errorSummary.hasAttribute('tabindex')) {
      this._errorSummary.setAttribute('tabindex', '-1');
    }
  }

  _initMultiStep() {
    const stepsAttr = this.getAttribute('data-steps');
    if (!stepsAttr) return;

    this._totalSteps = parseInt(stepsAttr, 10);
    this._currentStep = 1;
    this._updateProgressIndicators();
  }

  _attachEventListeners() {
    this._listenerController?.abort();
    this._listenerController = new AbortController();
    const { signal } = this._listenerController;

    // Form submit
    this._form.addEventListener('submit', (e) => this._handleSubmit(e), { signal });

    // Field validation
    this._fields.forEach((field) => {
      const input = field.querySelector('input, select, textarea');
      if (!input) return;

      switch (this._validationMode) {
        case 'onBlur':
          input.addEventListener('blur', () => this._validateField(field, input), { signal });
          break;

        case 'onChange':
          input.addEventListener('input', () => {
            this._debounceValidation(field, input);
          }, { signal });
          break;

        case 'onTouched':
          input.addEventListener('blur', () => {
            this._touched.add(input.name);
            this._validateField(field, input);
          }, { signal });
          input.addEventListener('input', () => {
            if (this._touched.has(input.name)) {
              this._debounceValidation(field, input);
            }
          }, { signal });
          break;

        case 'onSubmit':
        default:
          // Only validate on submit
          break;
      }
    });
  }

  _debounceValidation(field, input) {
    // Clear existing timer
    if (this._debounceTimers.has(input.name)) {
      clearTimeout(this._debounceTimers.get(input.name));
    }

    // Set new timer
    const timer = setTimeout(() => {
      this._validateField(field, input);
      this._debounceTimers.delete(input.name);
    }, DEBOUNCE_DELAY);

    this._debounceTimers.set(input.name, timer);
  }

  _clearDebounceTimers() {
    this._debounceTimers.forEach((timer) => clearTimeout(timer));
    this._debounceTimers.clear();
  }

  _removeEventListeners() {
    this._listenerController?.abort();
    this._listenerController = null;
  }

  async _handleSubmit(e) {
    e.preventDefault();

    const result = this.validate();

    if (!result.valid) {
      this.dispatchEvent(
        new CustomEvent('ren-invalid', {
          detail: { errors: result.errors },
          bubbles: true,
          composed: true,
        })
      );
      this._showErrorSummary(result.errors);
      this._scrollToFirstError();
      return;
    }

    // Success
    this._hideErrorSummary();
    this._isSubmitting = true;
    this.setAttribute('data-submitting', '');

    const values = this.getValues();
    const event = new CustomEvent('ren-submit', {
      detail: { values, form: this._form },
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(event);

    // Reset submitting state after a brief delay to allow for async handling
    setTimeout(() => {
      this._isSubmitting = false;
      this.removeAttribute('data-submitting');
    }, 100);
  }

  _validateField(field, input) {
    const rules = field.getAttribute('data-rules') ?? '';
    const error = this._runValidators(rules, input.value, input.name);

    if (error) {
      this._setFieldError(field, input, error);
      this._errors.set(input.name, error);
    } else {
      this._clearFieldError(field, input);
      this._errors.delete(input.name);
    }

    // Dispatch field validation event
    this.dispatchEvent(
      new CustomEvent('ren-field-validated', {
        detail: {
          name: input.name,
          valid: !error,
          error,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  _runValidators(rulesString, value, fieldName) {
    if (!rulesString) return null;

    const rules = rulesString.split('|').map((r) => r.trim());

    for (const rule of rules) {
      let validator = null;
      let param = null;

      if (rule.includes(':')) {
        [validator, param] = rule.split(':');
      } else {
        validator = rule;
      }

      // Get validator function
      let validatorFn = builtInValidators[validator];
      if (!validatorFn && RenForm.#customValidators.has(validator)) {
        validatorFn = RenForm.#customValidators.get(validator);
      }

      if (!validatorFn) continue;

      // Run validator
      let error;
      if (param) {
        if (validator === 'match') {
          error = validatorFn(param)(value, this._form);
        } else {
          error = validatorFn(param)(value);
        }
      } else {
        error = validatorFn(value);
      }

      if (error) return error;
    }

    return null;
  }

  _setFieldError(field, input, message) {
    field.setAttribute('data-invalid', '');
    input.setAttribute('aria-invalid', 'true');

    const errorEl = field.querySelector('.ren-field-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
      if (!errorEl.id) {
        errorEl.id = `error-${input.name}`;
      }
      input.setAttribute('aria-errormessage', errorEl.id);
    }
  }

  _clearFieldError(field, input) {
    field.removeAttribute('data-invalid');
    input.removeAttribute('aria-invalid');

    const errorEl = field.querySelector('.ren-field-error');
    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = '';
    }
  }

  _showErrorSummary(errors) {
    if (!this._errorSummary) return;

    const ul = this._errorSummary.querySelector('ul');
    if (!ul) return;

    ul.replaceChildren();
    errors.forEach((error) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      const field = this._findFieldInput(error.name);

      link.href = field?.id ? `#${field.id}` : '#';
      link.textContent = `${error.name}: ${error.message}`;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        if (field) field.focus();
      });

      li.appendChild(link);
      ul.appendChild(li);
    });

    this._errorSummary.setAttribute('data-has-errors', '');
    this._errorSummary.removeAttribute('hidden');
    this._errorSummary.focus();
  }

  _findFieldInput(name) {
    return Array.from(this._form?.elements || []).find(
      (element) => element.name === name
    );
  }

  _hideErrorSummary() {
    if (!this._errorSummary) return;
    this._errorSummary.removeAttribute('data-has-errors');
    this._errorSummary.setAttribute('hidden', '');
  }

  _scrollToFirstError() {
    const firstInvalid = this._form.querySelector('[data-invalid]');
    if (firstInvalid) {
      setTimeout(() => {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = firstInvalid.querySelector('input, select, textarea');
        if (input) input.focus();
      }, 100);
    }
  }

  _updateProgressIndicators() {
    const steps = this.querySelectorAll('.ren-form-step');
    steps.forEach((step, idx) => {
      const stepNum = idx + 1;
      step.setAttribute('data-step', stepNum);

      if (stepNum < this._currentStep) {
        step.setAttribute('data-completed', '');
        step.removeAttribute('data-active');
        step.removeAttribute('data-disabled');
      } else if (stepNum === this._currentStep) {
        step.removeAttribute('data-completed');
        step.setAttribute('data-active', '');
        step.removeAttribute('data-disabled');
      } else {
        step.removeAttribute('data-completed');
        step.removeAttribute('data-active');
        step.setAttribute('data-disabled', '');
      }
    });
  }

  // ─── Public API ───

  validate() {
    const errors = [];

    this._fields.forEach((field) => {
      const input = field.querySelector('input, select, textarea');
      if (!input) return;

      const rules = field.getAttribute('data-rules') ?? '';
      const error = this._runValidators(rules, input.value, input.name);

      if (error) {
        this._setFieldError(field, input, error);
        errors.push({ name: input.name, message: error });
      } else {
        this._clearFieldError(field, input);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  reset() {
    this._form.reset();
    this._errors.clear();
    this._touched.clear();
    this._debounceTimers.forEach((timer) => clearTimeout(timer));
    this._debounceTimers.clear();

    this._fields.forEach((field) => {
      const input = field.querySelector('input, select, textarea');
      if (input) {
        this._clearFieldError(field, input);
      }
    });

    this._hideErrorSummary();
  }

  getValues() {
    const values = {};
    const formData = new FormData(this._form);
    formData.forEach((value, name) => {
      values[name] = value;
    });
    return values;
  }

  setErrors(errors) {
    this._errors.clear();

    errors.forEach((error) => {
      const field = this._form.querySelector(
        `.ren-field:has([name="${error.name}"])`
      );
      const input = field?.querySelector('input, select, textarea');

      if (field && input) {
        this._setFieldError(field, input, error.message);
        this._errors.set(error.name, error.message);
      }
    });

    this._showErrorSummary(errors);
  }

  setFieldError(name, message) {
    const field = this._form.querySelector(
      `.ren-field:has([name="${name}"])`
    );
    const input = field?.querySelector('input, select, textarea');

    if (field && input) {
      this._setFieldError(field, input, message);
      this._errors.set(name, message);
    }
  }

  clearFieldError(name) {
    const field = this._form.querySelector(
      `.ren-field:has([name="${name}"])`
    );
    const input = field?.querySelector('input, select, textarea');

    if (field && input) {
      this._clearFieldError(field, input);
      this._errors.delete(name);
    }
  }

  // ─── Multi-Step API ───

  nextStep() {
    if (this._currentStep >= this._totalSteps) return false;

    // Validate current step fields
    const currentStepFields = this._getStepFields(this._currentStep);
    const errors = [];

    currentStepFields.forEach((field) => {
      const input = field.querySelector('input, select, textarea');
      if (!input) return;

      const rules = field.getAttribute('data-rules') ?? '';
      const error = this._runValidators(rules, input.value, input.name);

      if (error) {
        this._setFieldError(field, input, error);
        errors.push({ name: input.name, message: error });
      } else {
        this._clearFieldError(field, input);
      }
    });

    if (errors.length > 0) {
      return false;
    }

    this._currentStep++;
    this._updateProgressIndicators();
    this._hideErrorSummary();

    this.dispatchEvent(
      new CustomEvent('ren-step-change', {
        detail: { step: this._currentStep, totalSteps: this._totalSteps },
        bubbles: true,
        composed: true,
      })
    );

    return true;
  }

  prevStep() {
    if (this._currentStep <= 1) return false;

    this._currentStep--;
    this._updateProgressIndicators();
    this._hideErrorSummary();

    this.dispatchEvent(
      new CustomEvent('ren-step-change', {
        detail: { step: this._currentStep, totalSteps: this._totalSteps },
        bubbles: true,
        composed: true,
      })
    );

    return true;
  }

  goToStep(stepNum) {
    if (stepNum < 1 || stepNum > this._totalSteps) return false;

    this._currentStep = stepNum;
    this._updateProgressIndicators();
    this._hideErrorSummary();

    this.dispatchEvent(
      new CustomEvent('ren-step-change', {
        detail: { step: this._currentStep, totalSteps: this._totalSteps },
        bubbles: true,
        composed: true,
      })
    );

    return true;
  }

  get currentStep() {
    return this._currentStep;
  }

  get totalSteps() {
    return this._totalSteps;
  }

  _getStepFields(stepNum) {
    // Assumes fields are organized by step (configurable via data-step)
    // For simplicity, returns all fields. Override in subclass if needed.
    return this._fields;
  }
}

if (!customElements.get('ren-form')) {
  customElements.define('ren-form', RenForm);
}
