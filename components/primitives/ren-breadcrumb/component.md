# ren-breadcrumb Component Contract

Hierarchical navigation trail built on native navigation/list semantics.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-breadcrumb` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-breadcrumb` primitive.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Breadcrumb primitive behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this primitive.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## Required Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-breadcrumb/ren-breadcrumb.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-breadcrumb">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-breadcrumb`
- `.ren-breadcrumb-truncated`

## States And Attributes

- `[aria-current]`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-breadcrumb-active-color`
- `--ren-breadcrumb-color`
- `--ren-breadcrumb-font-size`
- `--ren-breadcrumb-gap`
- `--ren-breadcrumb-separator`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/primitives/ren-breadcrumb/ren-breadcrumb.css`
- `docs/components/ren-breadcrumb.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
