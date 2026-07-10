# ren-alert-dialog Component Contract

Non-dismissible confirmation dialog for destructive or critical decisions.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-alert-dialog` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-alert-dialog` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Alert Dialog composite behavior or visual role.
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
    - "A destructive or irreversible action (delete, sign-out, discard) requires explicit confirmation."
    - "Accidental dismissal (Escape, backdrop click) must NOT close the dialog."
    - "The decision is binary and centered around two actions (cancel + confirm)."
    - "Content is short: an icon, a title, a one-paragraph description, and two buttons."
    - "You want the native <dialog> showModal() flow with returnValue for the outcome."
  avoidWhen:
    - "The dialog hosts a form, multi-step flow, or scrollable content — use ren-dialog."
    - "The disclosure should dismiss on Escape / backdrop — use ren-dialog (no alert)."
    - "The notification does not block the page — use ren-toast or ren-banner."

canonicalImports:
  css:
    - "rends/components/composites/ren-alert-dialog/ren-alert-dialog.css"
  notes:
    - "If the page already imports rends/components/index.css, do not import the CSS again."
    - "No colocated JS — call dialog.showModal() / dialog.close(returnValue) directly on the native <dialog>."
    - "The component uses the same --ren-dialog-* token namespace as ren-dialog, so token overrides cascade."

requiredMarkup:
  - "The root element is a real <dialog class=\"ren-alert-dialog\">; never substitute a <div role=\"alertdialog\">."
  - "Provide a .ren-alert-dialog-title (heading) and a .ren-alert-dialog-description so AT can announce the decision."
  - "Actions live inside .ren-alert-dialog-actions and use real <button> elements (.ren-btn-secondary + .ren-btn-danger or similar)."
  - "Each button calls dialog.close('cancel' | 'confirm' | …) so the consumer can read returnValue on the close event."
  - "Use .ren-alert-dialog-icon-danger or .ren-alert-dialog-icon-warning on the icon slot for severity — do not invent new severity classes."

forbiddenPatterns:
  - "<div class=\"ren-alert-dialog\"> rendered without the native <dialog> element."
  - "Calling dialog.show() instead of dialog.showModal() — alert behavior requires modality + ::backdrop."
  - "Adding Escape-to-close handlers; the alert variant intentionally blocks accidental dismissal."
  - "Hardcoded rgba backdrops (background: rgba(0,0,0,.5)) — the ::backdrop already reads --color-overlay."
  - "Replacing .ren-alert-dialog-actions with arbitrary flex containers that bypass the @container narrow-stack layout."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-dialog-backdrop, --ren-dialog-bg, --ren-dialog-border-color, --ren-dialog-duration, --ren-dialog-easing, --ren-dialog-gap, --ren-dialog-padding, --ren-dialog-radius, --ren-dialog-shadow, --ren-dialog-width."
    - "Semantic tokens: --color-surface, --color-overlay, --color-text, --color-text-muted, --color-danger, --color-danger-subtle, --color-warning, --color-warning-subtle, --color-fill."
    - "Layout / motion tokens: --space-*, --radius-*, --shadow-xl, --icon-xl, --duration-enter, --ease-enter, --transition-overlay."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors in consumer overrides."
    - "Custom backdrop opacity values that bypass --color-overlay or --transition-overlay."

accessibility:
  required:
    - "Use a real <dialog> so the browser exposes role=\"dialog\" + aria-modal automatically; add aria-labelledby pointing to .ren-alert-dialog-title."
    - "Open with showModal(); the backdrop becomes inert so background content is unreachable to keyboard / AT."
    - "The destructive button must be visually distinct (.ren-btn-danger) AND announced by its text — never rely on color alone."
    - "Focus must move into the dialog on open and return to the trigger on close (native <dialog> behavior)."
    - "Touch targets on action buttons stay ≥ 44px (default .ren-btn size)."
    - "Reduced motion: transitions are disabled under prefers-reduced-motion (already handled by the component)."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-alert-dialog/ren-alert-dialog.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<dialog class="ren-alert-dialog" aria-labelledby="delete-title" aria-describedby="delete-description"><h2 id="delete-title" class="ren-alert-dialog-title">Delete project?</h2><p id="delete-description" class="ren-alert-dialog-description">This cannot be undone.</p><div class="ren-alert-dialog-actions"><button type="button" class="ren-btn ren-btn-secondary">Cancel</button><button type="button" class="ren-btn ren-btn-danger">Delete</button></div></dialog>

```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-alert-dialog`
- `.ren-alert-dialog-actions`
- `.ren-alert-dialog-description`
- `.ren-alert-dialog-icon`
- `.ren-alert-dialog-icon-danger`
- `.ren-alert-dialog-icon-warning`
- `.ren-alert-dialog-title`

## States And Attributes

- `None detected in the colocated CSS/JS. Check related files before inventing one.`

## Public Token API

- `--ren-dialog-backdrop`
- `--ren-dialog-bg`
- `--ren-dialog-border-color`
- `--ren-dialog-duration`
- `--ren-dialog-easing`
- `--ren-dialog-gap`
- `--ren-dialog-padding`
- `--ren-dialog-radius`
- `--ren-dialog-shadow`
- `--ren-dialog-width`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/composites/ren-alert-dialog/ren-alert-dialog.css`
- `docs/components/ren-alert-dialog.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
