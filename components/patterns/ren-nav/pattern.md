# ren-nav Pattern Contract

Navigation pattern for responsive site/app nav and active states.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-nav` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-nav` pattern.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Nav pattern behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this pattern.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## Required Imports

```html
<link rel="stylesheet" href="rends/components/patterns/ren-nav/ren-nav.css">
<script type="module" src="rends/components/patterns/ren-nav/ren-nav.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-nav">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-nav`
- `.ren-nav-actions`
- `.ren-nav-brand`
- `.ren-nav-dropdown`
- `.ren-nav-link`
- `.ren-nav-links`
- `.ren-nav-sticky`
- `.ren-nav-toggle`
- `.ren-nav-transparent`

## States And Attributes

- `[aria-current]`
- `[aria-expanded]`
- `[data-dropdown]`
- `[data-open]`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-nav-bg`
- `--ren-nav-border`
- `--ren-nav-gap`
- `--ren-nav-height`
- `--ren-nav-link-active`
- `--ren-nav-link-color`
- `--ren-nav-padding-x`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/patterns/ren-nav/ren-nav.css`
- `components/patterns/ren-nav/ren-nav.js`
- `docs/components/ren-nav.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
