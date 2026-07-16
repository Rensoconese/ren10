# Relume Header18 to Ren10 Translation Map

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/primitives/ren-button/component.md`
- `components/primitives/ren-field/component.md`
- `components/primitives/ren-spinner/component.md`
- `components/composites/ren-dialog/component.md`

## Ren10 mapping

- Section/container: native labelled `<section>` plus `ren-center ren-center-wide ren-stack`.
- Upper responsive copy: `ren-switcher`; h1 left and `ren-stack` support right.
- Form: native GET `<form>` with `ren-switcher`, one `ren-field`, visible label, native email input, one `.ren-btn` submit, wired error, and polite status.
- Legal copy: native paragraph and one real local terms anchor with a 44px inline target.
- Landscape media: one real button containing `ren-frame ren-frame-video`, one owned local image, one token scrim, and one decorative SVG play circle.
- Modal: one `ren-dialog` wrapping one native `<dialog>`, titled header, singular close control, one `ren-spinner`, and one aspect-video iframe.
- Media: iframe `srcdoc` receives one owned deterministic WebM video with controls; it is cleared on close.
- Progressive alternative: `<noscript>` supplies one real local video-overview destination without duplicating the enhanced trigger.

## Cascade risks

- Primitive Zero native heading, paragraph, figure, form, and dialog margins are neutralized only through Header18-prefixed selectors.
- The play SVG and scrim are pointer-inert and cannot create nested controls.
- The close SVG is decorative and the real button owns the accessible name.
- Hidden loader/iframe/status states use Header18-prefixed selectors; no pseudo-element owns play or close chrome.
- Inline behavior is `type="module"`; every query begins at `[data-rh18-root]` to avoid global lexical collisions and cross-block selection.
- `srcdoc` styles are isolated inside the iframe and use system canvas colors rather than consumer literals.

## Responsive adaptation

- Section remains content-height at every width.
- Copy and form stack in DOM order on narrow screens.
- Form becomes one row at 40rem; copy becomes two equal top-aligned columns at 48rem.
- Trigger remains one full-width 16:9 landscape surface.
- Dialog uses Ren10's mobile sheet adaptation and medium/large width caps without copying Relume pixels exactly.

## Progressive enhancement

- Before custom-element upgrade, semantic form, input, submit, terms link, image, and native dialog markup remain present.
- With JavaScript disabled, the enhanced trigger cannot open; the poster, copy, native GET form, terms link, and explicit video alternative remain usable.
- With reduced motion, dialog transitions collapse and the spinner uses the documented gentle non-rotating pulse.

## Rejected mappings

- No React, Tailwind, shadcn, Radix, external iframe, or Relume icon dependency.
- No placeholder-only email field, injected terms HTML, fragment destination, or console-only submit.
- No background `<video>` because the reference owns a lightbox trigger, not ambient media.
- No raw flex/grid outer skeleton where Ren10 switcher/stack/center/frame primitives cover it.
