# Relume to RenDS Translation Map — Header 12

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
| Full-height vertical shell | `section.rh12-hero.ren-cover` | Exact small-viewport-height composition and semantic section |
| Flexible top media | `figure.rh12-media` with native video, poster layer, and scrim | One owned cover video; flexible remainder; deterministic static fallback |
| Motion control | Real `button.ren-btn.ren-btn-outline` | Explicit pause/play state; reduced-motion starts paused |
| Bottom content band | Surface `div.rh12-band` + `ren-center ren-center-wide` | Constrained content-sized band using Ren10 surface/text tokens |
| Responsive split | `ren-switcher` | Heading left and support right when wide; stack narrowly |
| Copy rhythm | `ren-stack` | Description, form, status, and legal line preserve source order |
| Email form | Native form with one `ren-field`, one email input, one submit `ren-btn` | Visible label, native validity, real no-JS destination |
| Responsive form row | Nested `ren-switcher` | Stacked mobile; field-growing row from the small state |
| Legal line | Paragraph with one `a.ren-link` | Real local terms destination; no injected markup |

## Interaction and progressive enhancement

- The motion button exposes pause/play through visible text and
  `aria-pressed`; native video is decorative and removed from the accessibility
  tree with its media layer.
- Reduced motion pauses and hides video while preserving the poster and keeps
  the control disabled with a visible `Motion paused` state.
- Enhanced valid submission stays on the preview and announces a polite
  confirmation. Native validity remains the source of truth.
- Without JavaScript, poster, copy, native GET form, and terms destination are
  complete; the video and motion button are hidden.

## Cascade risks

- `ren-cover` is itself a flex column; Primitive Zero figure and heading
  margins must not add gaps or expand the shell beyond `100svh`.
- The media must be `flex: 1 1 auto` with `min-block-size: 0`, while the band
  remains content-sized.
- The absolute video, poster, scrim, and motion control must remain owned by the
  media region; the control cannot overlap or escape the video at narrow widths.
- Nested switchers must stack at 320/390 without shrinking the email field or
  overflowing the root.

## Rejected mappings

- No `ren-nav`, brand, second CTA, card, dialog, framework primitive, external
  media, injected legal HTML, or JavaScript-only destination.
