---
type: "RenDS Component"
title: ren-carousel
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:composite:ren-carousel
sourcePath: components/composites/ren-carousel
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - component
  - composite
  - ren10
  - rends
---

# ren-carousel

Source path: `components/composites/ren-carousel`

## Relationships

- `exposes_selector` -> [.ren-carousel](../../selectors/ren-carousel.md)
- `exposes_selector` -> [.ren-carousel-2](../../selectors/ren-carousel-2.md)
- `exposes_selector` -> [.ren-carousel-3](../../selectors/ren-carousel-3.md)
- `exposes_selector` -> [.ren-carousel-4](../../selectors/ren-carousel-4.md)
- `exposes_selector` -> [.ren-carousel-counter](../../selectors/ren-carousel-counter.md)
- `exposes_selector` -> [.ren-carousel-counter-current](../../selectors/ren-carousel-counter-current.md)
- `exposes_selector` -> [.ren-carousel-dot](../../selectors/ren-carousel-dot.md)
- `exposes_selector` -> [.ren-carousel-dots](../../selectors/ren-carousel-dots.md)
- `exposes_selector` -> [.ren-carousel-fade](../../selectors/ren-carousel-fade.md)
- `exposes_selector` -> [.ren-carousel-full](../../selectors/ren-carousel-full.md)
- `exposes_selector` -> [.ren-carousel-next](../../selectors/ren-carousel-next.md)
- `exposes_selector` -> [.ren-carousel-no-arrows](../../selectors/ren-carousel-no-arrows.md)
- `exposes_selector` -> [.ren-carousel-no-counter](../../selectors/ren-carousel-no-counter.md)
- `exposes_selector` -> [.ren-carousel-no-dots](../../selectors/ren-carousel-no-dots.md)
- `exposes_selector` -> [.ren-carousel-prev](../../selectors/ren-carousel-prev.md)
- `exposes_selector` -> [.ren-carousel-slide](../../selectors/ren-carousel-slide.md)
- `exposes_selector` -> [.ren-carousel-viewport](../../selectors/ren-carousel-viewport.md)
- `has_contract` -> [ren-carousel component.md](../../foundation/contract-composite-ren-carousel.md)
- `has_css` -> [ren-carousel.css](../../css/ren-carousel-css.md)
- `has_docs_page` -> [ren-carousel docs](../../docs/ren-carousel-docs.md)
- `has_js` -> [ren-carousel.js](../../javascript/ren-carousel-js.md)
- `uses_token` -> [--color-accent](../../tokens/color-accent.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-muted](../../tokens/color-text-muted.md)
- `uses_token` -> [--duration-enter](../../tokens/duration-enter.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--radius-full](../../tokens/radius-full.md)
- `uses_token` -> [--space-1](../../tokens/space-1.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-3](../../tokens/space-3.md)
- `uses_token` -> [--space-4](../../tokens/space-4.md)
- `uses_token` -> [--touch-min](../../tokens/touch-min.md)
- `uses_token` -> [--transition-tactile](../../tokens/transition-tactile.md)

## Structured Data

```json
{
  "kind": "composite",
  "selectors": [
    ".ren-carousel",
    ".ren-carousel-2",
    ".ren-carousel-3",
    ".ren-carousel-4",
    ".ren-carousel-counter",
    ".ren-carousel-counter-current",
    ".ren-carousel-dot",
    ".ren-carousel-dots",
    ".ren-carousel-fade",
    ".ren-carousel-full",
    ".ren-carousel-next",
    ".ren-carousel-no-arrows",
    ".ren-carousel-no-counter",
    ".ren-carousel-no-dots",
    ".ren-carousel-prev",
    ".ren-carousel-slide",
    ".ren-carousel-viewport"
  ],
  "tokens": [
    "--color-accent",
    "--color-border",
    "--color-text",
    "--color-text-muted",
    "--duration-enter",
    "--ease-enter",
    "--radius-full",
    "--space-1",
    "--space-2",
    "--space-3",
    "--space-4",
    "--touch-min",
    "--transition-tactile"
  ],
  "hasScript": true,
  "hasDocsPage": true
}
```

## Source Content

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


/* ═══════════════════════════════════════════════════════════════════════════
   RenDS — <ren-carousel> Web Component
   ═══════════════════════════════════════════════════════════════════════════
   Accessible carousel/slider with scroll-snap, keyboard nav, autoplay, and dots.

   Features:
   - CSS scroll-snap for performant sliding
   - Configurable slides-per-view (1, 2, 3, 4)
   - Fade or slide transitions
   - Touch-friendly swipe support
   - Keyboard navigation (Arrow keys)
   - Optional autoplay with progress indicator
   - Responsive via container queries
   - Respects prefers-reduced-motion
   ═════════════════════════════════════════════════════════════════════════ */

/* ═══ CAROUSEL OUTER CONTAINER ═══ */
.ren-carousel {
  container-type: inline-size;
  container-name: ren-carousel;
  position: relative;
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* ═══ VIEWPORT (SCROLL CONTAINER) ═══ */
.ren-carousel-viewport {
  position: relative;
  width: 100%;
  height: auto;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  touch-action: pan-x pinch-zoom; /* Prevent vertical scroll interference during horizontal swipe */
}

/* Hide scrollbar in Chrome, Safari, and Opera */
.ren-carousel-viewport::-webkit-scrollbar {
  display: none;
}

/* Container for slides with flexbox */
.ren-carousel-viewport {
  display: flex;
  flex-wrap: nowrap;
}

/* ═══ INDIVIDUAL SLIDES ═══ */
.ren-carousel-slide {
  flex: 0 0 100%;
  min-width: 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  height: auto;
}

/* Ensure slide content can be sized */
.ren-carousel-slide > * {
  display: block;
  width: 100%;
  height: auto;
}

/* ═══ SLIDES-PER-VIEW VARIANTS ═══ */

/* 2 slides visible (50% each) */
.ren-carousel-2 .ren-carousel-slide {
  flex: 0 0 50%;
  min-width: 50%;
}

/* 3 slides visible (33.33% each) */
.ren-carousel-3 .ren-carousel-slide {
  flex: 0 0 calc(100% / 3);
  min-width: calc(100% / 3);
}

/* 4 slides visible (25% each) */
.ren-carousel-4 .ren-carousel-slide {
  flex: 0 0 25%;
  min-width: 25%;
}

/* Responsive: stack to 1 or 2 on narrow screens via container queries */
@supports (container-type: inline-size) {
  @container (max-width: 640px) {
    .ren-carousel-2 .ren-carousel-slide,
    .ren-carousel-3 .ren-carousel-slide,
    .ren-carousel-4 .ren-carousel-slide {
      flex: 0 0 100%;
      min-width: 100%;
    }
  }

  @container (max-width: 1024px) and (min-width: 641px) {
    .ren-carousel-3 .ren-carousel-slide,
    .ren-carousel-4 .ren-carousel-slide {
      flex: 0 0 50%;
      min-width: 50%;
    }
  }
}

/* ═══ FADE TRANSITION VARIANT ═══ */
.ren-carousel-fade {
  position: relative;
}

.ren-carousel-fade .ren-carousel-viewport {
  scroll-behavior: auto;
}

.ren-carousel-fade .ren-carousel-slide {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  opacity: 0;
  transition: opacity var(--duration-enter) var(--ease-enter);
  pointer-events: none;
}

.ren-carousel-fade .ren-carousel-slide[aria-current="true"] {
  position: relative;
  opacity: 1;
  pointer-events: auto;
}

/* ═══ NAVIGATION ARROWS ═══ */
.ren-carousel-prev,
.ren-carousel-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;

  width: var(--touch-min);
  height: var(--touch-min);
  min-width: 44px;
  min-height: 44px;

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: rgb(0, 0, 0, 0.4);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  color: white;
  font-size: 20px;
  transition: var(--transition-tactile);
}

/* Arrow positioning */
.ren-carousel-prev {
  left: var(--space-3);
}

.ren-carousel-next {
  right: var(--space-3);
}

/* Arrow chevron using ::before pseudo-element */
.ren-carousel-prev::before {
  content: '‹';
  font-size: 24px;
  font-weight: bold;
  line-height: 1;
}

.ren-carousel-next::before {
  content: '›';
  font-size: 24px;
  font-weight: bold;
  line-height: 1;
}

/* Hover state — increase opacity */
.ren-carousel-prev:hover:not(:disabled),
.ren-carousel-next:hover:not(:disabled) {
  background-color: rgb(0, 0, 0, 0.7);
}

/* Active/focus state */
.ren-carousel-prev:focus-visible,
.ren-carousel-next:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Hidden arrows at boundaries */
.ren-carousel[data-at-start] .ren-carousel-prev,
.ren-carousel[data-at-end] .ren-carousel-next {
  opacity: 0;
  pointer-events: none;
}

/* Disabled state */
.ren-carousel-prev:disabled,
.ren-carousel-next:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ═══ PROGRESSIVE ENHANCEMENT: CSS-ONLY SCROLL BUTTONS ═══
   Modern browsers support ::scroll-button() pseudo-elements for native
   scroll container navigation without JavaScript.
   When supported, these replace the JS-generated arrow buttons. */

@supports selector(::scroll-button(inline-start)) {
  .ren-carousel-viewport {
    /* Enable native scroll buttons */
    overflow-x: auto;
  }

  .ren-carousel-viewport::scroll-button(inline-start),
  .ren-carousel-viewport::scroll-button(inline-end) {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;

    width: var(--touch-min, 44px);
    height: var(--touch-min, 44px);
    min-width: 44px;
    min-height: 44px;

    display: flex;
    align-items: center;
    justify-content: center;

    background-color: rgb(0, 0, 0, 0.4);
    border: none;
    border-radius: var(--radius-full, 9999px);
    cursor: pointer;
    color: white;

    transition: var(--transition-tactile);
  }

  .ren-carousel-viewport::scroll-button(inline-start) {
    content: '‹';
    left: var(--space-3, 0.75rem);
  }

  .ren-carousel-viewport::scroll-button(inline-end) {
    content: '›';
    right: var(--space-3, 0.75rem);
  }

  .ren-carousel-viewport::scroll-button(inline-start):hover,
  .ren-carousel-viewport::scroll-button(inline-end):hover {
    background-color: rgb(0, 0, 0, 0.7);
  }

  /* Hide JS-generated arrows when native scroll buttons are available */
  .ren-carousel .ren-carousel-prev,
  .ren-carousel .ren-carousel-next {
    display: none;
  }
}

/* ═══ PAGINATION DOTS ═══ */
.ren-carousel-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-3);
  padding: 0;
  list-style: none;
}

.ren-carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background-color: var(--color-border);
  border: none;
  cursor: pointer;
  transition: var(--transition-tactile);
  padding: 0;
  margin: 0;
}

/* Active dot */
.ren-carousel-dot[aria-current="true"] {
  background-color: var(--color-accent);
  transform: scale(1.25);
}

/* Hover state */
.ren-carousel-dot:hover:not([aria-current="true"]) {
  background-color: var(--color-border);
  opacity: 0.7;
}

/* Focus visible */
.ren-carousel-dot:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: var(--radius-full);
}

/* ═══ AUTOPLAY PROGRESS BAR ═══ */
.ren-carousel-dot[aria-current="true"]::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 2px;
  background-color: var(--color-accent);
  border-radius: var(--radius-full);
  opacity: 0;
}

/* Show progress bar when autoplay is active */
.ren-carousel[data-autoplay] .ren-carousel-dot[aria-current="true"]::after {
  opacity: 1;
  animation: carousel-progress linear forwards;
}

@keyframes carousel-progress {
  from {
    width: 0;
  }
  to {
    width: 6px;
  }
}

/* Dynamic progress bar timing — controlled by JS */
.ren-carousel[data-autoplay-duration] .ren-carousel-dot[aria-current="true"]::after {
  animation-duration: inherit;
}

/* ═══ CAROUSEL COUNTER ═══ */
.ren-carousel-counter {
  text-align: center;
  font-size: 14px;
  color: var(--color-text-muted);
  margin-top: var(--space-2);
  font-variant-numeric: tabular-nums;
}

.ren-carousel-counter-current {
  font-weight: 600;
  color: var(--color-text);
}

/* ═══ ACCESSIBILITY & ANIMATIONS ═══ */

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .ren-carousel-viewport {
    scroll-behavior: auto;
  }

  .ren-carousel-slide,
  .ren-carousel-dot,
  .ren-carousel-prev,
  .ren-carousel-next {
    transition: none;
    animation: none;
  }

  .ren-carousel[data-autoplay] .ren-carousel-dot[aria-current="true"]::after {
    animation: none;
    width: 6px;
    opacity: 1;
  }
}

/* ═══ FOCUS VISIBLE FOR KEYBOARD NAVIGATION ═══ */
.ren-carousel-slide:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* ═══ RESPONSIVE ADJUSTMENTS (Container Queries) ═══ */

/* Compact carousel */
@container ren-carousel (max-width: 480px) {
  .ren-carousel {
    gap: var(--space-2);
  }

  .ren-carousel-prev,
  .ren-carousel-next {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .ren-carousel-prev {
    left: var(--space-2);
  }

  .ren-carousel-next {
    right: var(--space-2);
  }

  .ren-carousel-dots {
    gap: var(--space-1);
  }

  .ren-carousel-dot {
    width: 6px;
    height: 6px;
  }

  .ren-carousel-dot[aria-current="true"] {
    transform: scale(1.1);
  }
}

/* Wide carousel — hover reveal arrows */
@container ren-carousel (min-width: 768px) {
  .ren-carousel-prev,
  .ren-carousel-next {
    opacity: 0.6;
  }

  .ren-carousel:hover .ren-carousel-prev:not(:disabled),
  .ren-carousel:hover .ren-carousel-next:not(:disabled) {
    opacity: 1;
  }
}

/* ═══ UTILITY CLASSES ═══ */

/* Carousel without dots */
.ren-carousel-no-dots .ren-carousel-dots {
  display: none;
}

/* Carousel without arrows */
.ren-carousel-no-arrows .ren-carousel-prev,
.ren-carousel-no-arrows .ren-carousel-next {
  display: none;
}

/* Carousel without counter */
.ren-carousel-no-counter .ren-carousel-counter {
  display: none;
}

/* Full width slides (1 per view) */
.ren-carousel-full .ren-carousel-slide {
  flex: 0 0 100%;
  min-width: 100%;
}

/* Draggable appearance */
.ren-carousel-viewport {
  user-select: none;
  -webkit-user-select: none;
}

.ren-carousel-slide {
  user-select: none;
  -webkit-user-select: none;
}

/* Touch feedback */
.ren-carousel-slide {
  cursor: grab;
}

.ren-carousel-slide:active {
  cursor: grabbing;
}

/* ═══ LOADING STATE ═══ */
.ren-carousel[aria-busy="true"] {
  opacity: 0.6;
  pointer-events: none;
}

/* ═══ SEMANTIC HTML ADJUSTMENTS ═══ */
.ren-carousel[role="group"],
.ren-carousel[role="region"] {
  /* Already defined above, this is for clarity */
}

/* Ensure images in slides maintain aspect ratio */
.ren-carousel-slide img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

/* Video in carousel */
.ren-carousel-slide video {
  width: 100%;
  height: auto;
  display: block;
}


/**
 * RenDS — <ren-carousel> Web Component
 * ═════════════════════════════════════════════════════════════════════════
 * Accessible carousel/slider with native scroll-snap, keyboard navigation,
 * autoplay, pagination dots, and optional next/prev arrows.
 *
 * Features:
 * - Light DOM (no Shadow DOM)
 * - CSS scroll-snap for performant horizontal scrolling
 * - Keyboard navigation (Arrow Left/Right)
 * - Touch swipe support (native scroll-snap)
 * - Auto-generated pagination dots
 * - Optional next/prev navigation arrows
 * - Autoplay with configurable interval
 * - Loop mode (infinite carousel)
 * - Configurable slides-per-view (1, 2, 3, 4)
 * - Fade transition variant
 * - Custom events (ren-slide-change)
 * - Respects prefers-reduced-motion
 *
 * Attributes:
 *   autoplay: milliseconds interval for autoplay (e.g., 5000)
 *   loop: enable infinite looping
 *   slides-per-view: number of slides visible (default: 1)
 *   fade: enable fade transition instead of slide
 *
 * Methods:
 *   next() — go to next slide
 *   prev() — go to previous slide
 *   goTo(index) — jump to specific slide
 *   pause() — pause autoplay
 *   resume() — resume autoplay
 *
 * Events:
 *   ren-slide-change: detail = { index, total, id }
 *
 * Markup:
 *   <ren-carousel autoplay="5000" loop slides-per-view="1">
 *     <div class="ren-carousel-viewport">
 *       <div class="ren-carousel-slide">
 *         <img src="slide1.jpg" alt="Slide 1">
 *       </div>
 *       <div class="ren-carousel-slide">
 *         <img src="slide2.jpg" alt="Slide 2">
 *       </div>
 *       <!-- Dots and arrows auto-generated by JS -->
 *     </div>
 *   </ren-carousel>
 * ═════════════════════════════════════════════════════════════════════════
 */

let nextId = 0;

export class RenCarousel extends HTMLElement {
  static get observedAttributes() {
    return ['autoplay', 'loop', 'slides-per-view', 'fade'];
  }

  constructor() {
    super();
    this.id = this.id || `ren-carousel-${++nextId}`;

    this._viewport = null;
    this._slides = [];
    this._dotsContainer = null;
    this._dots = [];
    this._prevButton = null;
    this._nextButton = null;
    this._counterElement = null;

    this._currentIndex = 0;
    this._totalSlides = 0;
    this._autoplayInterval = null;
    this._autoplayDuration = null;
    this._isAutoplayActive = false;
    this._scrollTimeout = null;
    this._intersectionObserver = null;

    this._autoplayMs = 0;
    this._shouldLoop = false;
    this._slidePerView = 1;
    this._isFade = false;
    this._reducedMotionQuery = null;
    this._handleReducedMotionChange = null;
  }

  /* ═══ LIFECYCLE ═══ */

  connectedCallback() {
    this._parseAttributes();
    this._initialize();
    this._attachReducedMotionListener();
    this._attachEventListeners();
    if (this._autoplayMs > 0) {
      this._startAutoplay();
    }
  }

  disconnectedCallback() {
    this._stopAutoplay();
    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect();
    }
    this._detachReducedMotionListener();
    this._detachEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.isConnected) return;

    switch (name) {
      case 'autoplay':
        this._autoplayMs = newValue ? parseInt(newValue, 10) : 0;
        if (this._autoplayMs > 0) {
          this._startAutoplay();
        } else {
          this._stopAutoplay();
        }
        break;
      case 'loop':
        this._shouldLoop = this.hasAttribute('loop');
        this._updateArrowVisibility();
        break;
      case 'slides-per-view':
        this._slidePerView = newValue ? parseInt(newValue, 10) : 1;
        this._applySlidePerViewClass();
        break;
      case 'fade':
        this._isFade = this.hasAttribute('fade');
        this._updateFadeVariant();
        break;
    }
  }

  /* ═══ INITIALIZATION ═══ */

  _parseAttributes() {
    this._autoplayMs = this.hasAttribute('autoplay')
      ? parseInt(this.getAttribute('autoplay'), 10)
      : 0;
    this._shouldLoop = this.hasAttribute('loop');
    this._slidePerView = this.hasAttribute('slides-per-view')
      ? parseInt(this.getAttribute('slides-per-view'), 10)
      : 1;
    this._isFade = this.hasAttribute('fade');
  }

  _initialize() {
    // Set up ARIA attributes
    this.setAttribute('role', 'group');
    this.setAttribute('aria-roledescription', 'carousel');
    if (!this.getAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Image carousel');
    }

    // Find viewport
    this._viewport = this.querySelector('.ren-carousel-viewport');
    if (!this._viewport) {
      console.warn('RenCarousel: No viewport found');
      return;
    }

    // Add scroll-snap to viewport if not already present
    if (!this._viewport.classList.contains('ren-carousel-viewport')) {
      this._viewport.classList.add('ren-carousel-viewport');
    }

    // Collect slides
    this._slides = Array.from(
      this.querySelectorAll('.ren-carousel-slide')
    );

    if (this._slides.length === 0) {
      console.warn('RenCarousel: No slides found');
      return;
    }

    this._totalSlides = this._slides.length;

    // Set up slides with ARIA attributes
    this._slides.forEach((slide, index) => {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', `Slide ${index + 1} of ${this._totalSlides}`);
      if (index === 0) {
        slide.setAttribute('aria-current', 'true');
      }
      slide.tabIndex = 0;
    });

    // Create navigation elements
    this._createDots();
    this._createArrows();
    this._createCounter();

    // Apply variant classes
    this._applySlidePerViewClass();
    if (this._isFade) {
      this._updateFadeVariant();
    }

    // Set up Intersection Observer to track active slide
    this._setupIntersectionObserver();

    // Initial state
    this._updateArrowVisibility();
    this._updateDotState();
    this._updateCounter();
  }

  _createDots() {
    // Remove existing dots if any
    const existing = this.querySelector('.ren-carousel-dots');
    if (existing) existing.remove();

    // Create dots container
    this._dotsContainer = document.createElement('ul');
    this._dotsContainer.className = 'ren-carousel-dots';
    this._dotsContainer.setAttribute('role', 'tablist');
    this._dotsContainer.setAttribute('aria-label', 'Carousel pagination');

    // Create individual dots
    this._dots = this._slides.map((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'ren-carousel-dot';
      dot.setAttribute('type', 'button');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.setAttribute('aria-controls', this.id);
      if (index === 0) {
        dot.setAttribute('aria-current', 'true');
      }

      dot.addEventListener('click', () => this.goTo(index));
      const li = document.createElement('li');
      li.appendChild(dot);
      this._dotsContainer.appendChild(li);

      return dot;
    });

    this.appendChild(this._dotsContainer);
  }

  _createArrows() {
    // Remove existing arrows if any
    const existing = this.querySelectorAll('.ren-carousel-prev, .ren-carousel-next');
    existing.forEach(el => el.remove());

    // Create previous button
    this._prevButton = document.createElement('button');
    this._prevButton.className = 'ren-carousel-prev';
    this._prevButton.setAttribute('type', 'button');
    this._prevButton.setAttribute('aria-label', 'Previous slide');
    this._prevButton.addEventListener('click', () => this.prev());

    // Create next button
    this._nextButton = document.createElement('button');
    this._nextButton.className = 'ren-carousel-next';
    this._nextButton.setAttribute('type', 'button');
    this._nextButton.setAttribute('aria-label', 'Next slide');
    this._nextButton.addEventListener('click', () => this.next());

    // Insert after viewport
    this._viewport.parentNode.insertBefore(this._prevButton, this._viewport.nextSibling);
    this._viewport.parentNode.insertBefore(this._nextButton, this._viewport.nextSibling.nextSibling);
  }

  _createCounter() {
    // Remove existing counter if any
    const existing = this.querySelector('.ren-carousel-counter');
    if (existing) existing.remove();

    this._counterElement = document.createElement('div');
    this._counterElement.className = 'ren-carousel-counter';
    this._counterElement.setAttribute('aria-live', 'polite');
    this._counterElement.setAttribute('aria-atomic', 'true');

    this.appendChild(this._counterElement);
  }

  _applySlidePerViewClass() {
    // Remove all slides-per-view classes
    this.classList.remove('ren-carousel-1', 'ren-carousel-2', 'ren-carousel-3', 'ren-carousel-4');

    // Add the appropriate class
    if (this._slidePerView >= 1 && this._slidePerView <= 4) {
      this.classList.add(`ren-carousel-${this._slidePerView}`);
    }
  }

  _updateFadeVariant() {
    if (this._isFade) {
      this.classList.add('ren-carousel-fade');
    } else {
      this.classList.remove('ren-carousel-fade');
    }
  }

  _setupIntersectionObserver() {
    if (this._isFade) {
      // For fade mode, we'll handle active state differently
      return;
    }

    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect();
    }

    const options = {
      root: this._viewport,
      threshold: 0.5,
    };

    this._intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = this._slides.indexOf(entry.target);
          if (index !== -1) {
            this._setCurrentIndex(index);
          }
        }
      });
    }, options);

    this._slides.forEach((slide) => {
      this._intersectionObserver.observe(slide);
    });
  }

  /* ═══ NAVIGATION METHODS ═══ */

  next() {
    if (this._currentIndex < this._totalSlides - 1) {
      this.goTo(this._currentIndex + 1);
    } else if (this._shouldLoop) {
      this.goTo(0);
    }
  }

  prev() {
    if (this._currentIndex > 0) {
      this.goTo(this._currentIndex - 1);
    } else if (this._shouldLoop) {
      this.goTo(this._totalSlides - 1);
    }
  }

  goTo(index) {
    // Clamp index
    index = Math.max(0, Math.min(index, this._totalSlides - 1));

    // Scroll to slide
    const slide = this._slides[index];
    if (slide) {
      slide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      this._setCurrentIndex(index);

      // Reset autoplay timer when navigating
      if (this._autoplayMs > 0) {
        this._stopAutoplay();
        this._startAutoplay();
      }
    }
  }

  _setCurrentIndex(index) {
    if (this._currentIndex === index) return;

    // Update slides ARIA
    this._slides.forEach((slide, i) => {
      if (i === index) {
        slide.setAttribute('aria-current', 'true');
      } else {
        slide.removeAttribute('aria-current');
      }
    });

    this._currentIndex = index;
    this._updateDotState();
    this._updateArrowVisibility();
    this._updateCounter();
    this._dispatchChangeEvent();
  }

  /* ═══ STATE UPDATES ═══ */

  _updateDotState() {
    this._dots.forEach((dot, index) => {
      if (index === this._currentIndex) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute('aria-current');
      }
    });
  }

  _updateArrowVisibility() {
    if (this._prevButton && this._nextButton) {
      const atStart = this._currentIndex === 0;
      const atEnd = this._currentIndex === this._totalSlides - 1;

      if (this._shouldLoop) {
        // When looping, arrows are always visible
        this.removeAttribute('data-at-start');
        this.removeAttribute('data-at-end');
        this._prevButton.removeAttribute('disabled');
        this._nextButton.removeAttribute('disabled');
      } else {
        // Without loop, hide/disable arrows at boundaries
        if (atStart) {
          this.setAttribute('data-at-start', '');
          this._prevButton.setAttribute('disabled', '');
        } else {
          this.removeAttribute('data-at-start');
          this._prevButton.removeAttribute('disabled');
        }

        if (atEnd) {
          this.setAttribute('data-at-end', '');
          this._nextButton.setAttribute('disabled', '');
        } else {
          this.removeAttribute('data-at-end');
          this._nextButton.removeAttribute('disabled');
        }
      }
    }
  }

  _updateCounter() {
    if (this._counterElement) {
      this._counterElement.innerHTML = `
        <span class="ren-carousel-counter-current">${this._currentIndex + 1}</span>
        <span> / ${this._totalSlides}</span>
      `;
    }
  }

  /* ═══ AUTOPLAY ═══ */

  _prefersReducedMotion() {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  }

  _attachReducedMotionListener() {
    this._reducedMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null;
    if (!this._reducedMotionQuery) return;

    this._handleReducedMotionChange = (event) => {
      if (event.matches) {
        this._stopAutoplay();
      } else if (this._autoplayMs > 0) {
        this._startAutoplay();
      }
    };

    this._reducedMotionQuery.addEventListener?.('change', this._handleReducedMotionChange);
  }

  _detachReducedMotionListener() {
    if (this._reducedMotionQuery && this._handleReducedMotionChange) {
      this._reducedMotionQuery.removeEventListener?.('change', this._handleReducedMotionChange);
    }
    this._reducedMotionQuery = null;
    this._handleReducedMotionChange = null;
  }

  _startAutoplay() {
    if (this._autoplayInterval || this._autoplayMs <= 0) return;
    if (this._prefersReducedMotion()) {
      this._stopAutoplay();
      return;
    }

    this._isAutoplayActive = true;
    this.setAttribute('data-autoplay', '');
    this.setAttribute('data-autoplay-duration', `${this._autoplayMs}ms`);

    // Start autoplay
    this._autoplayInterval = setInterval(() => {
      this.next();
    }, this._autoplayMs);
  }

  _stopAutoplay() {
    if (this._autoplayInterval) {
      clearInterval(this._autoplayInterval);
      this._autoplayInterval = null;
    }
    this._isAutoplayActive = false;
    this.removeAttribute('data-autoplay');
    this.removeAttribute('data-autoplay-duration');
  }

  pause() {
    this._stopAutoplay();
  }

  resume() {
    if (this._autoplayMs > 0) {
      this._startAutoplay();
    }
  }

  /* ═══ EVENT LISTENERS ═══ */

  _attachEventListeners() {
    // Keyboard navigation
    this._handleKeydown = (e) => this._onKeydown(e);
    this.addEventListener('keydown', this._handleKeydown);

    // Pause autoplay on hover
    this._handleMouseEnter = () => {
      if (this._isAutoplayActive) {
        this._stopAutoplay();
      }
    };
    this._handleMouseLeave = () => {
      if (this._autoplayMs > 0) {
        this._startAutoplay();
      }
    };
    this.addEventListener('mouseenter', this._handleMouseEnter);
    this.addEventListener('mouseleave', this._handleMouseLeave);

    // Pause autoplay on focus
    this._handleFocus = () => {
      if (this._isAutoplayActive) {
        this._stopAutoplay();
      }
    };
    this._handleBlur = () => {
      if (this._autoplayMs > 0) {
        this._startAutoplay();
      }
    };
    this.addEventListener('focus', this._handleFocus, true);
    this.addEventListener('blur', this._handleBlur, true);
  }

  _detachEventListeners() {
    if (this._handleKeydown) {
      this.removeEventListener('keydown', this._handleKeydown);
    }
    if (this._handleMouseEnter) {
      this.removeEventListener('mouseenter', this._handleMouseEnter);
    }
    if (this._handleMouseLeave) {
      this.removeEventListener('mouseleave', this._handleMouseLeave);
    }
    if (this._handleFocus) {
      this.removeEventListener('focus', this._handleFocus, true);
    }
    if (this._handleBlur) {
      this.removeEventListener('blur', this._handleBlur, true);
    }
  }

  _onKeydown(e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.next();
    } else if (e.key === ' ' || e.key === 'Enter') {
      // Allow space/enter on dots
      if (e.target.classList.contains('ren-carousel-dot')) {
        e.preventDefault();
        e.target.click();
      }
    }
  }

  /* ═══ EVENT DISPATCHING ═══ */

  _dispatchChangeEvent() {
    const event = new CustomEvent('ren-slide-change', {
      detail: {
        index: this._currentIndex,
        total: this._totalSlides,
        id: this.id,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

// Register the component
if (!customElements.get('ren-carousel')) {
  customElements.define('ren-carousel', RenCarousel);
}
