# ren-toast Component Contract

Transient notification system with live-region announcements.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-toast` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-toast` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Toast composite behavior or visual role.
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
    - "You need a transient notification anchored to a viewport corner that auto-dismisses after a duration."
    - "The notification must NOT steal focus or block the page (use ren-dialog for that)."
    - "You need a status variant — success / info / warning / danger / loading — with matching icon and subtle status surface."
    - "You need a polite or assertive live-region announcement for screen-readers (handled via utils/live-region)."
    - "You need the imperative window.toast API (toast.success, toast.danger, toast.promise(...)) instead of declarative markup."
    - "You need swipe-to-dismiss, hover-to-pause timers, and an optional inline action button."
  avoidWhen:
    - "The message blocks the workflow and demands a decision — use ren-dialog (alert variant)."
    - "The message is persistent / inline page-level — use ren-banner or ren-alert."
    - "The message describes a form field state — use the helper-text / error slot on ren-field."
    - "The disclosure is a contextual popover from a trigger — use ren-popover or ren-tooltip."

canonicalImports:
  css:
    - "rends/components/composites/ren-toast/ren-toast.css"
  js:
    - "rends/components/composites/ren-toast/ren-toast.js"
  notes:
    - "JS is required: it owns the viewport queue, timers, live-region announcements, and swipe handling. window.toast is exposed as the imperative API."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Place one <ren-toast-viewport> (or <div class=\"ren-toast-viewport\" role=\"region\" aria-label=\"Notifications\">) per position; data-position defaults to bottom-right."
  - "Toasts themselves are appended by the JS as .ren-toast nodes with .ren-toast-icon, .ren-toast-body (.ren-toast-title + .ren-toast-description), optional .ren-toast-actions, and .ren-toast-close."
  - "Status variants are applied as a sibling class on .ren-toast: .ren-toast-success / .ren-toast-info / .ren-toast-warning / .ren-toast-danger / .ren-toast-error / .ren-toast-loading."
  - "Action buttons inside .ren-toast-actions reuse .ren-btn (typically .ren-btn-ghost .ren-btn-sm); .ren-toast-action is only an override hook."
  - "Set duration: 0 (or status: 'loading') for persistent toasts; expose a close button so users can dismiss them."

forbiddenPatterns:
  - "Calling toast.show() with status: 'danger' AND focusing the toast — toasts must not steal focus."
  - "Rendering toasts inline in document body without a .ren-toast-viewport host (timers and stacking will not work)."
  - "Hardcoded position offsets via inline style — use the [data-position] attribute and rely on var(--space-4) inset."
  - "Custom slide animations via @keyframes overriding ren-toast-slide-in-*; route motion through --duration-enter / --ease-enter."
  - "Using colored side borders for status emphasis; variants use a subtle status surface plus icon/text instead."
  - "Using a toast to ask for confirmation (\"Are you sure?\") — confirmations belong in ren-dialog."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-toast-anim-duration, --ren-toast-bg, --ren-toast-border, --ren-toast-duration, --ren-toast-easing, --ren-toast-gap, --ren-toast-padding, --ren-toast-radius, --ren-toast-shadow, --ren-toast-width, plus the shared --ren-btn-* family for inline action buttons."
    - "Semantic state tokens: --color-success, --color-success-subtle, --color-info, --color-info-subtle, --color-warning, --color-warning-subtle, --color-danger, --color-danger-subtle, --color-accent (progress bar), --color-surface, --color-surface-raised, --color-surface-hover, --color-surface-active, --color-text, --color-text-muted, --color-border."
    - "Shape / motion tokens: --space-*, --radius-sm, --radius-lg, --shadow-lg, --duration-enter, --duration-exit, --duration-micro, --ease-enter, --ease-exit, --transition-tactile, --z-toast."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / rgb / named color values in overrides for the status surface, border, or icon color."
    - "Hardcoded animation timings; route through --duration-enter / --duration-exit and the paired easings."

accessibility:
  required:
    - "Viewport is a role=\"region\" with aria-label=\"Notifications\" so screen-readers can locate it as a landmark."
    - "Success / info messages announce via aria-live=\"polite\"; danger / error messages announce via aria-live=\"assertive\" (handled by announcePolite / announceAssertive)."
    - "Status must be communicated by icon AND text/title — color alone does not satisfy the contrast contract."
    - "Hover and keyboard focus pause auto-dismiss timers; restoring focus elsewhere resumes them."
    - "The .ren-toast-close button has an accessible name (aria-label=\"Close\") and is reachable via keyboard."
    - "Toasts never trap focus; they receive focus only when the user tabs into the viewport region intentionally."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-toast/ren-toast.css">
<script type="module" src="rends/components/composites/ren-toast/ren-toast.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<ren-toast-viewport data-position="bottom-right" aria-label="Notifications"></ren-toast-viewport>

```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-btn`
- `.ren-toast`
- `.ren-toast-action`
- `.ren-toast-actions`
- `.ren-toast-body`
- `.ren-toast-close`
- `.ren-toast-danger`
- `.ren-toast-description`
- `.ren-toast-error`
- `.ren-toast-icon`
- `.ren-toast-info`
- `.ren-toast-loading`
- `.ren-toast-progress`
- `.ren-toast-success`
- `.ren-toast-title`
- `.ren-toast-viewport`
- `.ren-toast-warning`

## States And Attributes

- `[data-closing]`
- `[data-position]`
- `[data-swiping]`
- `[data-toast-id]`
- `:active`
- `:hover`

## Public Token API

- `--ren-btn-bg`
- `--ren-btn-bg-active`
- `--ren-btn-bg-hover`
- `--ren-btn-border-color`
- `--ren-btn-border-width`
- `--ren-btn-color`
- `--ren-btn-duration`
- `--ren-btn-easing`
- `--ren-btn-font-size`
- `--ren-btn-font-weight`
- `--ren-btn-gap`
- `--ren-btn-height`
- `--ren-btn-padding-x`
- `--ren-btn-padding-y`
- `--ren-btn-radius`
- `--ren-btn-ring-color`
- `--ren-btn-ring-offset`
- `--ren-btn-ring-width`
- `--ren-toast-anim-duration`
- `--ren-toast-bg`
- `--ren-toast-border`
- `--ren-toast-duration`
- `--ren-toast-easing`
- `--ren-toast-gap`
- `--ren-toast-padding`
- `--ren-toast-radius`
- `--ren-toast-shadow`
- `--ren-toast-width`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-toast/ren-toast.css`
- `components/composites/ren-toast/ren-toast.js`
- `docs/components/ren-toast.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
