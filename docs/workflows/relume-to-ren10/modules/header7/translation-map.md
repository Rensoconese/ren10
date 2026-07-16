# Relume to Ren10 Translation Map — Header 7

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/primitives/ren-button/component.md`

## Ren10 mapping

| Reference part | Ren10 mapping | Preserved behavior / deliberate correction |
| --- | --- | --- |
| Fullscreen section | `section.rh7-hero.ren-cover` | Semantic labelled section with viewport minimum |
| Foreground container | `.rh7-content.ren-center.ren-center-wide.ren-cover-center` | Vertically centered and page-inset |
| Constrained copy | `.rh7-copy.ren-stack` | Left aligned and width constrained |
| Heading + description | One native `h1` and one `p` | Exact semantic anatomy |
| CTA cluster | `.rh7-actions.ren-cluster` with two real anchors styled `.ren-btn` | Exactly two real destinations; alternate surface then secondary outline |
| Background video | One native `video` with owned inline WebM source | Autoplay, loop, muted, playsinline and cover semantics without third-party network |
| Scrim | `.rh7-scrim` | Full-inset semantic overlay for AA contrast |
| Motion control | One real `.rh7-motion` button | Required pause/play mechanism; not a marketing CTA |

## Cascade risks

- The hero fixes its local color scheme so inverted foreground remains white in
  both host themes.
- The background video and scrim must remain behind copy without creating page
  overflow or intercepting foreground actions.
- Native video controls are the no-JavaScript fallback; enhancement must remove
  them only after the custom motion button is operable.
- Focus rings must remain visible against the darkest and lightest possible
  background-video frames.

## Responsive adaptation

- `ren-cover` owns viewport height; `ren-center-wide` owns horizontal inset;
  `ren-stack` and `ren-cluster` own copy and CTA rhythm.
- Video remains absolute, full inset and `object-fit: cover` at
  320/390/767/768/1280.

## Motion and progressive enhancement

- Markup retains native autoplay/loop/muted and native controls.
- Enhancement hides native controls only after revealing a 44px custom pause
  button. It pauses immediately when reduced motion is active.
- Without JavaScript, native controls, both CTAs and the whole copy remain usable.

## Rejected mappings

- No image fallback element because the authenticated source owns video only;
  the video element and semantic surface color supply a stable first-frame fallback.
- No nav, logo, form, third CTA, dialog, framework wrapper or external embed.
