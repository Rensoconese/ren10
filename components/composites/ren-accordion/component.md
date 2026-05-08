# ren-accordion Component Contract

Disclosure group for vertically stacked expandable sections.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-accordion` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-accordion` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Accordion composite behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this composite.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-accordion/ren-accordion.css">
<script type="module" src="rends/components/composites/ren-accordion/ren-accordion.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-accordion">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-accordion`
- `.ren-accordion-bordered`
- `.ren-accordion-content`
- `.ren-accordion-flush`
- `.ren-accordion-item`
- `.ren-accordion-trigger`

## States And Attributes

- `[aria-disabled]`
- `[aria-expanded]`
- `:active`
- `:disabled`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-collapse-bg`
- `--ren-collapse-border`
- `--ren-collapse-duration`
- `--ren-collapse-easing`
- `--ren-collapse-padding`
- `--ren-collapse-radius`
- `--ren-collapse-trigger-font`
- `--ren-collapse-trigger-weight`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-accordion/ren-accordion.css`
- `components/composites/ren-accordion/ren-accordion.js`
- `docs/components/ren-accordion.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
