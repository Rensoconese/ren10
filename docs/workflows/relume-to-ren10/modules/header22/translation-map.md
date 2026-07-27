# Header22 — Relume to Ren10 Translation Map

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

## RenDS mapping

- Section/container → labelled native section in `ren-center ren-center-wide`.
- Responsive split → one `ren-grid` tree; copy remains first in DOM and media receives desktop visual order only.
- Copy rhythm → `ren-stack` with native h1 and paragraph.
- Form → one native GET form, one `ren-field`, one `.ren-btn`, one legal paragraph/terms link and one polite status.
- Form seam → `ren-switcher`, stacking below 40rem and growing-field/intrinsic-submit from 40rem.
- Media → one real button containing `ren-frame ren-frame-video`, owned poster, token scrim and decorative SVG play affordance.
- Modal → `ren-dialog` wrapping one native dialog, titled header, close control, one labelled `ren-spinner` and one aspect-video iframe whose `srcdoc` owns one deterministic local WebM video.

## Cascade risks

- Reset native heading, paragraph and figure margins only under `.rh22-*` selectors.
- Keep play and scrim pointer-inert; close/play SVGs remain decorative.
- Hide pristine error explicitly despite enhanced `ren-field` styles.
- Enhanced submit sets `noValidate` only at runtime and uses the public `ren-field.setError()` API; no-JS retains native validation.
- Inline behavior is `type="module"`; the only document query selects `[data-rh22-root]`, all descendants are root-scoped.
- Iframe styles remain isolated in `srcdoc` and use system canvas colors.

## Responsive adaptation

- Base through 63.999rem: one column, copy/form/legal then media.
- 40rem: form alone changes to a row.
- 64rem: two equal vertically centered columns; media visually left and copy right.

## Progressive enhancement

- Before upgrade, native form/label/input/button/link/image remain usable.
- With JavaScript disabled, native GET submission remains active and `noscript` supplies one real overview destination.
- JavaScript enhances in-place form feedback and modal video without gating core content.

## Rejected mappings

- No duplicated mobile/desktop DOM.
- No framework lightbox or remote video dependency.
- No `ren-form` wrapper for one field; documented native form plus `ren-field` is sufficient.
