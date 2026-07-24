# Relume to Ren10 Translation Map — Header 13

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/primitives/ren-button/component.md`
- `components/primitives/ren-spinner/component.md`
- `components/composites/ren-dialog/component.md`
- `examples/dialog-workflow.html`
- `evals/checklist.md`

## Ren10 mapping

- Full-height vertical shell → semantic section with `ren-cover`; only the
  media region uses local flex growth because the primitive has no public
  vertical media-band composition.
- Upper media region → one real full-surface `<button>` containing a
  `ren-frame` poster, semantic scrim, and inline decorative play SVG.
- Lightbox → one `<ren-dialog>` wrapping one real `<dialog>`, with
  `.ren-dialog-title`, `[data-dialog-close]`, one aspect-video stage, one
  loader, and one iframe.
- Deterministic video → owned inline `srcdoc` containing native `<video
  controls>` and an owned data WebM source, attached only after open and
  removed on close.
- Lower constrained band → `ren-center ren-center-wide` plus `ren-switcher`.
- Right-hand copy → `ren-stack`; two navigational CTAs → exactly two real
  anchors styled with `ren-btn` and `ren-btn-outline` inside `ren-cluster`.
- JavaScript-disabled video alternative → one `<noscript>` text link colocated
  with the media region; it is not a third marketing CTA.

## Cascade risks

- `ren-cover` defaults must not create padding around the edge-to-edge media or
  make the full-height shell overflow its viewport.
- The media region must flex while the lower band remains content-sized; the
  poster button, image, and scrim must share one geometry owner.
- The play icon must not become a nested control or intercept pointer events.
- Dialog component sizing must remain within the viewport at 320/390 and must
  not clip its close target or video stage.
- Hidden loader/iframe states must win before custom-element upgrade and after
  close; loading cannot leave both visible or both interactive.
- CTA anchors must retain documented focus rings and 44px touch targets in
  both themes.

## Responsive adaptation

- Mobile preserves source order: media first, then h1, description, actions.
- The lower `ren-switcher` stays one column until the medium-width seam, then
  becomes two top-aligned columns.
- CTA cluster wraps naturally; there is no duplicated mobile DOM.
- Dialog width uses its component token and a mobile-safe full-width cap.

## Progressive enhancement

- Core image, heading, description, and both CTA links require no JavaScript.
- `<noscript>` exposes a real owned video-alternative document.
- JavaScript upgrades only the modal lightbox and lazy deterministic video.
- The native dialog composite owns modality, focus trap/restoration, Escape,
  backdrop dismissal, and scroll locking.

## Rejected mappings

- No background video, autoplaying hero media, form, nav, logo, third CTA,
  second trigger, carousel, or decorative dialog clone.
- No framework abstraction, external embed, copied source asset, or
  JavaScript-only CTA destination.
