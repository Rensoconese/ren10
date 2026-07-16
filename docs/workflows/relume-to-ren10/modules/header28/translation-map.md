# Header28 — Relume to Ren10 Translation Map

## Mandatory contracts loaded

- `ren-design.md`, `tokens/tokens.md`, `base/layouts.md`, `base/primitive-zero.md`, `components/components.md`
- `components/primitives/ren-button/component.md`
- `components/primitives/ren-spinner/component.md`
- `components/composites/ren-dialog/component.md`

## RenDS mapping

- Native labelled section → `ren-center ren-center-wide ren-stack`.
- Centered copy rhythm → `ren-stack`; centered actions → `ren-cluster`; real anchors use `.ren-btn` variants.
- Landscape trigger → real button with `ren-frame ren-frame-video`, one owned poster, token scrim and decorative SVG.
- Modal → `ren-dialog` wrapping native dialog, named title, real close, one labelled spinner and one iframe whose `srcdoc` owns deterministic local WebM.

## Cascade risks

- Native h1/paragraph/figure margins reset only under `.rh28-*` selectors.
- Scrim/play SVG are pointer-inert; play and close chrome have one owner each.
- Hidden loader/iframe states remain Header28-prefixed; dialog sizing is scoped by `#rh28-video`.
- Inline module has one document root query and all descendant queries are root-scoped.
- Iframe styles remain isolated and use system canvas colors.

## Responsive adaptation

- One centered copy/media stack at every width; action cluster wraps on narrow screens.
- Spacing and dialog cap grow at 48rem and 64rem without changing semantics/order.

## Progressive enhancement

- Native copy, anchors, poster and button render before upgrade.
- `noscript` supplies one real overview destination without duplicating the enhanced dialog.

## Rejected mappings

- No duplicated mobile/desktop DOM, form, remote embed or framework abstraction.
