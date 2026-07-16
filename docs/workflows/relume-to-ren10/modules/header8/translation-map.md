# Relume to RenDS Translation Map — Header 8

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/patterns/ren-form/pattern.md`
- `components/primitives/ren-field/component.md`
- `components/primitives/ren-button/component.md`
- `components/primitives/ren-link/component.md`

## RenDS mapping

| Reference part | Ren10 mapping | Preserved behavior / correction |
| --- | --- | --- |
| Full-viewport section | `section.rh8-hero.ren-cover` | Full dynamic viewport height and vertical centering |
| Cover video | Native decorative `video` with embedded permitted WebM source | Autoplay, loop, muted, `playsinline`; no network dependency |
| Static fallback | Local poster image behind the video plus `poster` attribute | Remains visible if video/JS is unavailable |
| Dark overlay | Semantic double-layer scrim | Worst-case foreground contrast independent of poster frame |
| Copy column | `ren-center ren-center-wide ren-cover-center` + `ren-stack` | Constrained, left-aligned copy |
| Email form | Native form with one `ren-field`, one email input, one submit `ren-btn` | Visible label, native validity, real no-JS destination |
| Responsive form | `ren-switcher` | Stacked narrow; row when the component has room |
| Legal line | Paragraph with one `a.ren-link` | Real local terms destination; no injected HTML |
| Motion control | Real secondary button outside the form | Pause/resume continuous background; not a marketing CTA |

## Interaction policy

- Native video may autoplay only while motion is allowed and the user has not
  paused it.
- `prefers-reduced-motion: reduce` pauses/hides the moving layer and leaves the
  poster visible; changes to the preference are observed.
- The motion button toggles playback and exposes the current state through its
  label and `aria-pressed`.
- Enhanced valid form submission shows an inline success status; without JS,
  the owned documentation action handles the GET request.

## Cascade risks

- Video and scrim must stay behind all interactive content.
- The video must cover without changing intrinsic page size or introducing
  horizontal overflow.
- A full-height hero at 320px must still expose every form control and the
  motion control without clipping.
- Focus rings must remain visible over the dark scrim in every theme.
- The pause control must not be counted as a second marketing CTA.

## Rejected mappings

- No `ren-nav`, logo, card, menu, second CTA, framework input, or copied asset.
- No autoplay with sound and no hidden/pseudo label.
- No JS-only form destination or legal link.
