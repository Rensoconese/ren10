# Relume to RenDS Translation Map — Header 6

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/primitives/ren-field/component.md`
- `components/primitives/ren-button/component.md`

## RenDS mapping

| Reference part | Ren10 mapping | Preserved behavior / deliberate correction |
| --- | --- | --- |
| Fullscreen section | `<section class="rh6-hero ren-cover">` | Viewport minimum and labelled semantic region |
| Foreground container | `.rh6-content.ren-center.ren-center-wide.ren-cover-center` | Vertically centered, page-width inset |
| Constrained copy | `.rh6-copy.ren-stack` | Left aligned, medium content width |
| Heading + description | one native `h1` + one `p` | Original Ren10 copy and semantic typography tokens |
| Form region | native `<form>` in `.rh6-signup.ren-stack` | Exactly one email and submit; a real GET fallback destination instead of console logging |
| Email field | one `<ren-field>` containing one visible `<label>`, one `.ren-input[type=email]`, and one `[data-error]` | Adds missing visible name, native required/email/autocomplete behavior, Light DOM ARIA wiring |
| Submit CTA | one real `<button class="ren-btn">` | Exactly one submit action with default 44px target |
| Responsive form | `.rh6-form-row.ren-switcher` | Stacked narrow, growing field + intrinsic button row from small widths |
| Legal line | one native `p` + one real `.ren-link` anchor | Replaces injected HTML; link resolves to the repository license/terms destination |
| Background image | absolute `.rh6-background > img` | Full-bleed cover using a local Ren10-owned asset; decorative alt |
| Dark scrim | one `.rh6-scrim` with two semantic overlay layers | Full inset and strong enough for AA over worst-case white media |
| Enhanced success | local submit handler + one `role=status` region | Prevents navigation only when JS runs, resets email, announces deterministic demo success |

## Cascade risks

- Primitive Zero heading, paragraph, form, and label margins are reset only
  inside the Header6 stack/form scope.
- `ren-cover` direct-child margins must not move the absolute background layer.
- `.ren-switcher` owns form flex/wrap; the small-width rule changes child bases,
  not the outer layout model.
- Field label, error, input focus, and button focus must remain legible on media;
  component public tokens and semantic inverted text own those surfaces.
- The always-dark scrim must not mix with theme-dependent `--color-text`, which
  would become light and weaken the dark-host overlay.

## Responsive adaptation

- 320/390: the visible label/email/button stack vertically and occupy full width.
- 767/768/1280: one row; email field flexes, submit remains intrinsic, legal line
  stays beneath. This preserves the source's small-and-wider relationship without
  copying its framework breakpoint literal.
- `ren-cover` keeps the background/scrim viewport-sized at every required seam.

## Progressive enhancement

- Native HTML is complete before custom-element upgrade. Without JavaScript,
  the browser validates the required email and submits by GET to the real Ren10
  getting-started page; the terms anchor remains independently usable.
- With JavaScript, `ren-field` wires label/error semantics and a local submit
  handler prevents navigation after valid submission, clears the field, and
  updates the polite status region.

## Rejected mappings

- No `ren-form` is required for one native field; native email validity remains
  the source of truth and avoids duplicating rules.
- No nav, brand, second CTA, dialog, video, injected HTML, remote endpoint,
  CSS-background-only media replacement, or copied source asset.
- No React, Tailwind, framework input/button abstraction, primitive palette
  tokens, Shadow DOM, or source console logging.
