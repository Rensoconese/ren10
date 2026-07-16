# Relume to RenDS Translation Map — Header 10

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/primitives/ren-field/component.md`
- `components/primitives/ren-button/component.md`
- `components/primitives/ren-link/component.md`

## RenDS mapping

| Reference part | Ren10 mapping | Preserved behavior / correction |
| --- | --- | --- |
| Full-height vertical shell | `section.rh10-hero.ren-cover` | Small-viewport-height composition with semantic section landmark |
| Flexible top media | `figure.rh10-media` + owned local `img` | Flexes to remaining height; image uses cover geometry |
| Bottom content band | Surface `div.rh10-band` + `ren-center ren-center-wide` | Constrained page band with Ren10 surface/text tokens |
| Responsive two-column split | `ren-switcher` | Heading left and supporting content right when room exists; stack narrowly |
| Copy rhythm | `ren-stack` | Heading, description, form, and legal line keep system spacing |
| Email form | Native form with one `ren-field`, one email input, one submit `ren-btn` | Visible label, native validity, real no-JS destination |
| Responsive form row | Nested `ren-switcher` | Stacked mobile, input-growing row at small/wide state |
| Legal line | Paragraph with one `a.ren-link` | Real local terms destination; no injected markup |

## Interaction and progressive enhancement

- Enhanced valid form submission stays on the preview and exposes a polite
  confirmation status.
- Native validity remains the source of truth.
- Without JavaScript, the image/copy/form remain complete and a valid GET
  reaches the owned getting-started document; terms resolve to the license.
- The block has no custom motion; Ren10 focus/state transitions inherit the
  reduced-motion token collapse.

## Cascade risks

- `ren-cover` default child margins/padding must not create gaps around the top
  image or push the total shell beyond the viewport.
- The top media must flex while the bottom band remains content-sized.
- Nested switchers must stack at 320/390 without shrinking the email field or
  overflowing the root.
- The surface band must remain readable in both light and dark themes.

## Rejected mappings

- No `ren-nav`, brand, second CTA, card, video, scrim, dialog, or copied asset.
- No framework input/button primitives and no JavaScript-only destination.
