# ren-button

Action primitive for commands, form submissions, links styled as controls,
icon-only triggers, and loading states.

Load this file after `ren-design.md` and before generating, editing, or
reviewing any `ren-btn` / `<ren-button>` UI.

## Purpose

The single touch-target primitive in RenDS. Owns visible action affordances:
solid CTAs, secondary commands, ghosted toolbar actions, link-styled inline
actions, and icon-only buttons. Does not own form inputs, navigation, or
dialog launchers — those compose `ren-button` inside their own contracts.

## Use When

- The element is a clickable command: submit, save, delete, open modal,
  toggle, fire any imperative action.
- An anchor needs to *look* like a button (use `.ren-btn` on `<a>` only when
  the link semantically replaces a button — otherwise use `ren-link`).
- A trigger is part of a composite (`ren-dialog` opener, `ren-menu` trigger,
  `ren-popover` anchor); the inner element should be `<button class="ren-btn">`.
- A loading / busy state must be reflected in markup (`data-loading`).

## Do Not Use When

- The control is a form input (use `ren-field` + native input).
- The control is plain navigation (use `ren-link` or a real `<a>`).
- The control is a checkbox / radio / toggle (use `ren-checkbox`,
  `ren-radio`, `ren-toggle-group`).
- The element is a styled label or status (use `ren-badge` or `ren-tag`).

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "User action triggers an imperative side effect (submit, save, delete, open dialog)."
    - "Need primary / secondary / destructive emphasis tied to the same touch-target shape."
    - "Need a 44px-minimum touch target with a visible focus ring."
    - "Need a loading / busy affordance via data-loading + aria-busy."
    - "Need an icon-only control with an accessible name (.ren-btn-icon + aria-label)."
  avoidWhen:
    - "The element is purely navigational — use ren-link."
    - "The element is a form input — use ren-field with a native input."
    - "The element is a stateful selector (checkbox, radio, switch, toggle)."
    - "You only need text emphasis or a status pill — use ren-badge / ren-tag."

canonicalImports:
  css:
    - "rends/components/primitives/ren-button/ren-button.css"
  js:
    - "rends/components/primitives/ren-button/ren-button.js"
  notes:
    - "If the page already imports rends/components/index.css, do not import the CSS again."
    - "JS is only required when using <ren-button> attributes (loading, variant, size, icon, full); plain <button class=\"ren-btn\"> works without JS."

requiredMarkup:
  - "Always render an actual <button> (or <ren-button>) element. Never style a <div> as a button."
  - "Icon-only buttons must include an accessible name via aria-label or visually-hidden text."
  - "Loading buttons must set data-loading and aria-busy=\"true\" on the same node."
  - "Use type=\"button\" for non-submit buttons inside <form> to avoid accidental submission."

forbiddenPatterns:
  - "div / span with a click handler styled as a button."
  - "<button style=\"background: #...\"> — use --ren-btn-bg."
  - "Removing the focus ring (outline: none) without restoring a visible :focus-visible style."
  - "Custom danger styling that overrides --color-danger with a primitive --red-* token."
  - "Disabling via aria-disabled alone without preventing the click handler."

tokenPolicy:
  allowed:
    - "Semantic tokens: --color-accent, --color-on-accent, --color-danger, --color-text-link, --color-focus-ring."
    - "Component tokens: every --ren-btn-* listed in Public Token API."
    - "Layout / size tokens: --space-*, --size-*, --radius-*."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, etc.) in consumer code."
    - "Hardcoded hex / named colors in consumer overrides."
    - "Raw transition values; use --ren-btn-duration / --ren-btn-easing."

accessibility:
  required:
    - "Real <button> semantics; rely on native click / Enter / Space."
    - "Visible :focus-visible ring driven by --ren-btn-ring-* tokens."
    - "Touch target ≥ 44px (default size). Smaller (.ren-btn-sm = 32px) only for non-touch contexts."
    - "Icon-only buttons have aria-label or visually-hidden label text."
    - "Loading buttons expose aria-busy=\"true\" and ignore activation while busy."
    - "Disabled buttons set both `disabled` (real) or `aria-disabled=\"true\"` AND prevent activation in the handler."
```

## Required CSS / JS Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-button/ren-button.css">
<script type="module" src="rends/components/primitives/ren-button/ren-button.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the
CSS again. JS is only required when consuming `<ren-button>` attributes.

## Canonical Markup

Primary action button:

```html
<button class="ren-btn">Save changes</button>
```

Secondary + small:

```html
<button class="ren-btn ren-btn-secondary ren-btn-sm" type="button">Cancel</button>
```

Destructive with loading state:

```html
<button class="ren-btn ren-btn-danger" data-loading aria-busy="true" disabled>
  Deleting...
</button>
```

Icon-only with accessible name:

```html
<button class="ren-btn ren-btn-icon" aria-label="Close dialog">
  <svg aria-hidden="true" focusable="false" width="16" height="16">...</svg>
</button>
```

Web component form (attribute-driven state):

```html
<ren-button variant="secondary" size="sm">Cancel</ren-button>
<ren-button variant="primary" loading>Submitting</ren-button>
```

## Variants

| Class                  | Role                                |
|------------------------|-------------------------------------|
| `.ren-btn`             | Default primary CTA.                |
| `.ren-btn-primary`     | Same as default; explicit.          |
| `.ren-btn-secondary`   | Tonal / fill-style secondary.       |
| `.ren-btn-outline`     | Border-only, transparent fill.      |
| `.ren-btn-ghost`       | No fill, no border; text + hover.   |
| `.ren-btn-link`        | Inline text-style action.           |
| `.ren-btn-danger`      | Destructive emphasis.               |
| `.ren-btn-accent`      | Custom accent via `--btn-accent`.   |
| `.ren-btn-icon`        | Square icon-only target.            |
| `.ren-btn-full`        | Stretches to container width.       |
| `.ren-btn-group`       | Joined sibling buttons.             |
| `.ren-btn-sm` / `-lg`  | Size override (32px / 52px).        |

## States

| Selector / attr        | Meaning                                                |
|------------------------|--------------------------------------------------------|
| `:hover`               | Pointer is over an interactive button.                 |
| `:active`              | Pressed state.                                         |
| `:focus-visible`       | Keyboard focus; renders the ring.                      |
| `:disabled`            | Native disabled; non-interactive, in tab order off.    |
| `[aria-disabled="true"]` | ARIA-disabled; visually disabled but stays focusable.|
| `[data-loading]`       | Spinner replaces label; pair with `aria-busy="true"`.  |

## Public Token API

Override these on `:root`, `[data-theme]`, or a scope wrapping the button.
Do **not** override the internal `.ren-btn` class.

- `--ren-btn-bg`
- `--ren-btn-bg-hover`
- `--ren-btn-bg-active`
- `--ren-btn-color`
- `--ren-btn-border-color`
- `--ren-btn-border-width`
- `--ren-btn-radius`
- `--ren-btn-height`
- `--ren-btn-padding-x`
- `--ren-btn-padding-y`
- `--ren-btn-gap`
- `--ren-btn-font-size`
- `--ren-btn-font-weight`
- `--ren-btn-ring-width`
- `--ren-btn-ring-offset`
- `--ren-btn-ring-color`
- `--ren-btn-duration`
- `--ren-btn-easing`

## Accessibility Contract

- Use a real `<button>` (or `<ren-button>` which renders a button internally).
- Keep a visible focus ring driven by `--ren-btn-ring-*`.
- Maintain a 44px minimum touch target (default size). `ren-btn-sm` (32px)
  is reserved for non-touch contexts (toolbars, dense desktop UI).
- Icon-only buttons must have an accessible name via `aria-label` or visually
  hidden text inside the button.
- Loading buttons expose `aria-busy="true"`. The component sets it
  automatically when `loading` is the chosen attribute on `<ren-button>`.
- Do not communicate state through color alone — `ren-btn-danger` carries the
  variant in the class, not just the hue.

## Anti-Patterns

- ❌ `<div class="ren-btn" onclick="...">` — must be a real `<button>`.
- ❌ Inline hex colors: `<button style="background:#0066ff;">`.
- ❌ Overriding `.ren-btn { background: ... !important }` — use
  `--ren-btn-bg` on a parent scope.
- ❌ Mixing `disabled` and a click handler that still fires (the handler
  must early-return or be detached).
- ❌ Using `ren-btn-link` when the destination is a navigation URL — use
  `ren-link` instead.

## Related Files

- `components/primitives/ren-button/ren-button.css`
- `components/primitives/ren-button/ren-button.js`
- `docs/components/ren-button.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, ARIA, or states change.
- Run `npm run lint` after token / selector changes.
- Manually verify light/dark themes when surface, border, or shadow values
  change — focus rings must remain visible in both modes.
