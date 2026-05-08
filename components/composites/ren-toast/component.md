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

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-toast/ren-toast.css">
<script type="module" src="rends/components/composites/ren-toast/ren-toast.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-toast">...</div>
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
