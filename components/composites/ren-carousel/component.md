# ren-carousel Component Contract

Slide navigation composite for grouped media/content.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-carousel` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-carousel` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Carousel composite behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this composite.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-carousel/ren-carousel.css">
<script type="module" src="rends/components/composites/ren-carousel/ren-carousel.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-carousel">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-carousel`
- `.ren-carousel-2`
- `.ren-carousel-3`
- `.ren-carousel-4`
- `.ren-carousel-counter`
- `.ren-carousel-counter-current`
- `.ren-carousel-dot`
- `.ren-carousel-dots`
- `.ren-carousel-fade`
- `.ren-carousel-full`
- `.ren-carousel-next`
- `.ren-carousel-no-arrows`
- `.ren-carousel-no-counter`
- `.ren-carousel-no-dots`
- `.ren-carousel-prev`
- `.ren-carousel-slide`
- `.ren-carousel-viewport`

## States And Attributes

- `[aria-busy]`
- `[aria-current]`
- `[data-at-end]`
- `[data-at-start]`
- `[data-autoplay-duration]`
- `[data-autoplay]`
- `:active`
- `:disabled`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-carousel-arrow-size`
- `--ren-carousel-dot-active`
- `--ren-carousel-dot-color`
- `--ren-carousel-dot-size`
- `--ren-carousel-duration`
- `--ren-carousel-easing`
- `--ren-carousel-gap`
- `--ren-carousel-radius`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-carousel/ren-carousel.css`
- `components/composites/ren-carousel/ren-carousel.js`
- `docs/components/ren-carousel.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
