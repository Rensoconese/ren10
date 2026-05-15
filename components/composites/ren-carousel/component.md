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

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "Multiple peer items (images, cards, testimonials) need horizontal cycling with snap behavior."
    - "Different slides-per-view densities are needed (.ren-carousel-2 / -3 / -4 / -full)."
    - "Optional autoplay with visible progress indicator is desired (data-autoplay + data-autoplay-duration)."
    - "Touch swipe + keyboard arrow navigation are required."
    - "You want a fade transition variant via .ren-carousel-fade in addition to scroll-snap."
  avoidWhen:
    - "Content is editorial reading order — use a vertical stack instead (carousels hide content)."
    - "The interaction is a tab switch with persistent panels — use ren-tabs."
    - "Items are step-by-step in a process — use ren-stepper / ren-wizard."
    - "There is only one or two items — render them inline."

canonicalImports:
  css:
    - "rends/components/composites/ren-carousel/ren-carousel.css"
  js:
    - "rends/components/composites/ren-carousel/ren-carousel.js"
  notes:
    - "If the page already imports rends/components/index.css, do not import the CSS again."
    - "JS handles arrow generation, dot pagination, autoplay timer, and aria-current bookkeeping; CSS-only fallback offers scroll-snap + the native ::scroll-button() pseudos when supported."
    - "Add data-autoplay to enable autoplay; pair with data-autoplay-duration=\"5000\" (ms) for the progress bar."

requiredMarkup:
  - "<ren-carousel> wraps a single <div class=\"ren-carousel-viewport\"> which contains <div class=\"ren-carousel-slide\"> children."
  - "Use .ren-carousel-2 / -3 / -4 / -full on the host to declare slides-per-view; do not set flex-basis inline."
  - "Arrow buttons use .ren-carousel-prev / .ren-carousel-next; the JS injects them when needed, do not author chevron glyphs by hand."
  - "Dot list is <ul class=\"ren-carousel-dots\"> with <li><button class=\"ren-carousel-dot\" aria-current=\"true|false\"></button></li> items."
  - "Each slide carries aria-current=\"true\" only when active; the component manages this attribute."

forbiddenPatterns:
  - "Replacing slides with arbitrary <div role=\"group\"> without scroll-snap-align: start — breaks snap behavior."
  - "Hardcoded translateX(-N%) transforms to advance slides; use scroll-snap or the fade variant."
  - "Adding an autoplay timer in consumer code instead of using data-autoplay + data-autoplay-duration."
  - "Hiding arrows by setting display: none on .ren-carousel-prev/.ren-carousel-next — use the .ren-carousel-no-arrows variant."
  - "Inline width: 50% on a slide to override slides-per-view — switch to the correct .ren-carousel-N class."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-carousel-arrow-size, --ren-carousel-dot-active, --ren-carousel-dot-color, --ren-carousel-dot-size, --ren-carousel-duration, --ren-carousel-easing, --ren-carousel-gap, --ren-carousel-radius."
    - "Semantic tokens: --color-accent, --color-border, --color-text, --color-text-muted."
    - "Layout / motion tokens: --space-*, --radius-full, --touch-min, --duration-enter, --ease-enter, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors in consumer overrides (the default rgba arrow scrim lives inside the component; do not duplicate it)."
    - "Hardcoded dot sizes / colors; tune --ren-carousel-dot-size / --ren-carousel-dot-active."

accessibility:
  required:
    - "Wrap the carousel with role=\"region\" (or role=\"group\") and an accessible name so screen readers can label the collection."
    - "Active slide / active dot use aria-current=\"true\"; never communicate the active state through color alone."
    - "Keyboard: Left/Right arrows traverse slides; arrow buttons and dots are real <button> elements with :focus-visible rings."
    - "Touch targets on .ren-carousel-prev/.ren-carousel-next stay ≥ 44px (min-width / min-height enforced in CSS)."
    - "Autoplay must pause on hover / focus / data-autoplay removal; aria-busy=\"true\" disables interaction during transitions."
    - "Respect prefers-reduced-motion: scroll-behavior becomes auto and the autoplay progress bar shows the final frame instead of animating."
```

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
