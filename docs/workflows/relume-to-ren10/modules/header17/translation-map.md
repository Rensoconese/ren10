# Header 17 — Relume to Ren10 Translation Map

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/primitives/ren-button/component.md`
- `components/composites/ren-dialog/component.md`

## RenDS mapping

- Content-height section → native labelled `<section>` with semantic spacing/surface tokens.
- Constrained vertical composition → `ren-center ren-center-wide ren-stack`.
- Responsive heading/support split → `ren-switcher`; equal children at the 48rem boundary.
- Support and action rhythm → `ren-stack` plus wrapping `ren-cluster`.
- CTA destinations → exactly two real local anchors styled with documented `.ren-btn` variants.
- Landscape trigger → one real full-width `<button>` containing one `ren-frame` poster, owned image, semantic scrim, and one SVG play affordance.
- Modal → one `ren-dialog` with a real native `<dialog>`, labelled header, close button, `ren-frame-video` stage, `ren-spinner`, and exactly one iframe.
- Video → deterministic owned `data:video/webm` written into iframe `srcdoc` only while open.

## Cascade risks

- Reset native button padding/border/background only inside `.rh17-media-trigger`; restore explicit focus-visible ring and 44px geometry.
- Reset heading, paragraph, and figure margins locally.
- Use one scrim element only; do not combine it with generated pseudo-element overlays.
- Inline behavior is `type="module"`; the only document query selects `[data-rh17-root]`, and every remaining query is root/dialog scoped.
- The custom-element module is an external ES module and is required by the standalone page; it is not duplicated inline.

## Responsive adaptation

- Below 48rem the copy switcher stacks in DOM order.
- At and above 48rem it becomes two equal top-aligned columns.
- The media remains full-width at every breakpoint.
- Dialog width is constrained to the viewport, targets 738px at medium and 940px at large, and retains a 16:9 stage.

## Progressive enhancement

- Copy, image, both CTA anchors, and a `<noscript>` alternative link exist in initial HTML.
- The native dialog remains closed before upgrade.
- JavaScript enhances the single trigger into a modal video and tears iframe media down on close.

## Rejected mappings

- No background video: the reference owns a click-to-open poster.
- No custom modal or div role dialog: `ren-dialog` owns modality, focus trap, Escape, backdrop, and focus restoration.
- No duplicated mobile tree or media trigger.
- No bespoke flex/grid page skeleton where Ren10 layouts cover the relationship.
