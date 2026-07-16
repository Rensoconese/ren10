# Relume to RenDS Translation Map — Header 19

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/primitives/ren-button/component.md`

## RenDS mapping

| Reference part | Ren10 mapping | Preserved behavior / correction |
| --- | --- | --- |
| Content-height section | Semantic `section.rh19-hero` | Content determines height; no viewport minimum |
| Constrained module | `ren-center ren-center-wide` | One container owns the responsive composition |
| Responsive two-peer layout | `ren-switcher` | One column through 1023px; equal centered peers from 1024px |
| Mobile/desktop order | One DOM tree plus large-screen `order` adjustment | Copy first in narrow source order; image left only in wide presentation |
| Copy rhythm | `ren-stack` | One h1, one description, then actions |
| Two destinations | Two real `a.ren-btn` anchors in `ren-cluster` | Distinct local URLs and natural wrapping |
| Image | Semantic `figure.ren-frame` with one owned image | Rounded landscape cover with meaningful alt and intrinsic dimensions |

## Progressive enhancement

- Both destinations and the image work natively without JavaScript.
- No script is required; Ren10 supplies focus, theme, and reduced-motion state handling.

## Cascade risks

- Primitive Zero margins must be neutralized so layout primitives exclusively own rhythm.
- The split must not activate at 1023px and must activate at 1024px.
- Visual reordering at large widths must not create a second DOM tree or change narrow source/focus order.
- `ren-frame` must clip the image without baseline gaps; CTA anchors must wrap without overflow at 320px.

## Rejected mappings

- No raw CSS grid/flex skeleton, `ren-cover`, form, nav, brand, video, overlay, dialog, third CTA, duplicate tree, remote asset, or JavaScript-only destination.

