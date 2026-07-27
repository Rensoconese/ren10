# Relume to RenDS Translation Map — Header 5

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/primitives/ren-button/component.md`

## RenDS mapping

| Reference part | Ren10 mapping | Preserved behavior / deliberate difference |
| --- | --- | --- |
| Fullscreen section | `<section class="rh5-hero ren-cover">` | Viewport minimum, semantic labelled region |
| Foreground container | `.rh5-content.ren-center.ren-center-wide.ren-cover-center` | Vertically centered, page-width inset |
| Constrained copy | `.rh5-copy.ren-stack` | Left aligned, medium content width |
| Heading + description | one native `h1` + one `p` | Original Ren10 copy, semantic type tokens |
| CTA cluster | `.rh5-actions.ren-cluster` with two real anchors styled `.ren-btn` | Exactly two navigational CTAs; alternate surface first, outlined secondary second |
| Background image | absolute `.rh5-background > img` | Full-bleed cover; local Ren10-owned asset instead of CDN source |
| Dark overlay | `.rh5-scrim` | Full inset semantic overlay strengthened by token composition for AA |

## Cascade risks

- Primitive Zero heading/paragraph margins are reset only inside the copy stack.
- `ren-cover` direct-child margins must not move the absolute background layer.
- Button variants need overlay-specific component-token scopes without primitive colors.
- The hero fixes its local color scheme to the light semantic side so inverted text
  remains white over its always-dark scrim in both host themes.

## Responsive adaptation

- `ren-cover` maintains full viewport height at 320/390/767/768/1280.
- `ren-center-wide` owns horizontal inset; `ren-stack` and `ren-cluster` own copy rhythm.
- The CTA cluster wraps naturally when space is insufficient; content order never changes.

## Progressive enhancement

- Pure HTML/CSS. Heading, description, links, background, and scrim render identically
  without JavaScript.

## Rejected mappings

- No nav/brand shell, form, modal, video, carousel, or background CSS-only replacement.
- No copied CDN asset, Tailwind, React, or a third CTA.
