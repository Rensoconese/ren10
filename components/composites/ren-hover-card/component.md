# ren-hover-card Component Contract

Non-blocking preview surface shown from hover/focus intent.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-hover-card` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-hover-card` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Hover Card composite behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this composite.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-hover-card/ren-hover-card.css">
<script type="module" src="rends/components/composites/ren-hover-card/ren-hover-card.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-hover-card">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-hover-card`
- `.ren-hover-card-body`
- `.ren-hover-card-disabled`
- `.ren-hover-card-footer`
- `.ren-hover-card-header`
- `.ren-hover-card-lg`
- `.ren-hover-card-loading`
- `.ren-hover-card-sm`
- `.ren-hover-card-trigger`

## States And Attributes

- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-hover-card-anchor`

If no `--ren-*` token is detected here, theme through semantic tokens from `tokens/tokens.md` and avoid selector overrides.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-hover-card/ren-hover-card.css`
- `components/composites/ren-hover-card/ren-hover-card.js`
- `docs/components/ren-hover-card.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
