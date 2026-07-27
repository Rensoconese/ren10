# Relume to Ren10 Translation Map — Header14

## Mandatory contracts loaded

- `ren-design.md`, `tokens/tokens.md`, `base/layouts.md`, `base/primitive-zero.md`, `components/components.md`
- `components/primitives/ren-button/component.md`
- `components/primitives/ren-field/component.md`
- `components/primitives/ren-spinner/component.md`
- `components/composites/ren-dialog/component.md`

## Ren10 mapping

- Full-height shell → semantic section with `ren-cover`; media alone flexes.
- Full-cover trigger → one real button containing a `ren-frame` image, inert scrim, and decorative inline play SVG.
- Lightbox → one `ren-dialog` wrapping a real `dialog`, title, close button, one `ren-spinner`, and one iframe.
- Owned playable media → iframe `srcdoc` with one native controlled video and deterministic data WebM, attached on open and removed on close.
- Lower band → `ren-center ren-center-wide` plus `ren-switcher`.
- Right column → `ren-stack`; one native form with one `ren-field`, visible label, native email validity/error, one submit button, one polite status, and one legal paragraph with one real terms link.
- Form row → `ren-switcher` with a small threshold so it becomes input plus max-content submit from 40rem.
- No-JavaScript alternatives → native GET form destination and one video-alternative link inside `noscript`.

## Cascade risks

- Reset `ren-cover` child margins so full-svh ownership is not exceeded.
- Trigger, image, scrim, and play affordance must share the media geometry without nested controls or pointer interception.
- Hidden loader/iframe states must win before and after custom-element upgrade.
- `ren-field` owns ARIA wiring; do not manually duplicate describedby/errormessage.
- Form-row switching must not make the submit narrower than 44px or overflow at 320px.
- Dialog sizing must retain close control and aspect-video stage inside narrow viewports.

## Responsive adaptation

- Mobile source order: media, h1, description, form, legal.
- At 40rem the form becomes a one-row input/submit composition.
- At 48rem the band becomes two equal, top-aligned columns.
- The iframe fills the dialog stage and is capped by Ren10 width tokens.

## Progressive enhancement

- Core poster, copy, form, legal terms, and fallback link work without JavaScript.
- JavaScript adds modal behavior, lazy iframe loading, validation/status polish, focus trap/restoration, and non-navigating demo success.
- Native validity and real destinations remain authoritative fallbacks.

## Rejected mappings

- No background video, extra CTA, nav, logo, second dialog/iframe/form, hidden label, fragment link, copied external embed, or duplicated mobile tree.
