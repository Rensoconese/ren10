# Relume to RenDS Translation Map — Header 15

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
| Content-height section | Semantic `section.rh15-hero` | Section grows from content; no invented viewport minimum |
| Constrained content | `ren-center ren-center-wide` | One container owns copy and media |
| Vertical module rhythm | `ren-stack` | Copy region precedes media with responsive token gap |
| Responsive copy split | `ren-switcher` | One column narrowly; heading left and support right when wide |
| Supporting copy rhythm | `ren-stack` | Description precedes the action group |
| Two CTA destinations | Two real `a.ren-btn` anchors in `ren-cluster` | Distinct local URLs, primary then outline, wrapping naturally |
| Landscape media | Semantic `figure.ren-frame` with one owned `img` | Full-width rounded 16:9 frame, intrinsic size, cover fitting |

## Interaction and progressive enhancement

- The block is navigation-only: both CTAs remain real anchors and work with no
  JavaScript.
- Ren10 button focus and state transitions inherit the reduced-motion token
  collapse; no block-local animation or script is needed.
- Light/dark styling comes exclusively from Ren10 semantic/component tokens.

## Cascade risks

- Primitive Zero heading, paragraph, and figure margins must be neutralized so
  `ren-stack`, `ren-switcher`, and `ren-cluster` exclusively own spacing.
- `ren-switcher` must not split before the medium state or produce unequal,
  misaligned columns at 768px.
- `ren-frame` owns aspect ratio; the image must fill it without adding native
  inline-image baseline space or escaping the rounded clipping edge.
- CTA anchors must wrap rather than shrink below 44px or overflow at 320px.

## Rejected mappings

- No `ren-cover`, nav, brand, form, card, video, overlay, dialog, duplicated
  mobile tree, external asset, or JavaScript-only destination.
