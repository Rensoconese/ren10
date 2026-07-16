# Header 20 — Relume to Ren10 Translation Map

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/primitives/ren-field/component.md`
- `components/primitives/ren-button/component.md`

## RenDS mapping

- Content-height container → labelled native section inside `ren-center ren-center-wide`.
- Responsive layout → `ren-grid`, forced to one column until 64rem and two equal centered columns from 64rem.
- Mobile copy-first/desktop image-left → one DOM tree; image grid item receives visual order only at 64rem.
- Copy rhythm → `ren-stack`; h1 and paragraph remain native.
- Form → exactly one native `<form>` with real GET action, one `ren-field`, one `.ren-btn`, one legal paragraph/link, one error, and one live status.
- Form stack/row → `ren-switcher`, forced into growing field/intrinsic submit row from 40rem.
- Media → exactly one `figure.ren-frame.ren-frame-photo` with an owned 1440×900 image.

## Cascade risks

- Reset native heading, paragraph, and figure margins locally.
- Do not hide the label; placeholder remains supplementary.
- Let `ren-field` wire the error; script sets host invalid state and input `aria-invalid` when native invalid fires.
- Inline behavior is `type="module"`; the only document query selects `[data-rh20-root]`, and all descendants are root-scoped.
- Reordering is visual only; mobile DOM/focus/read order remains copy then image.

## Responsive adaptation

- Base through 63.999rem: one grid column, copy then image.
- 40rem: only the inner form changes from stack to row.
- 64rem: two equal vertically centered columns; image is visually first and copy second.

## Progressive enhancement

- The unenhanced form retains label, native validation, GET action, terms link, copy, and image.
- JavaScript adds invalid presentation and in-place success; it does not gate the native fallback.

## Rejected mappings

- No `ren-form` wrapper is required for one field; documented `ren-field` plus native form semantics are sufficient.
- No duplicate mobile/desktop DOM.
- No switcher for the outer layout because the source requires an exact 1024px two-column boundary; `ren-grid` remains the skeleton.
