# Relume to RenDS Translation Map — Header 3

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/composites/ren-dialog/component.md`
- `components/primitives/ren-button/component.md`
- `components/primitives/ren-spinner/component.md`
- `components/primitives/ren-icon/component.md`
- `components/primitives/ren-link/component.md` (docs chrome only)

## RenDS mapping

| Reference part | Ren10 mapping | Preserved behavior / deliberate correction |
| --- | --- | --- |
| Hero section root | `<header class="rh3-hero" data-rh3-root aria-labelledby="rh3-heading">` | Landmark with labelled heading instead of anonymous section |
| Heading + description | `#rh3-heading` + `.rh3-lede` in `.rh3-copy.ren-stack` | One product heading and one supporting lede |
| Two CTAs | `.rh3-actions.ren-cluster` with primary `.ren-btn` + secondary `.ren-btn.ren-btn-secondary` | Exactly two actions; real buttons/links; ≥44px targets |
| Two-column composition | `.rh3-layout.ren-switcher` with tokenized threshold/gap | Stacks when narrow; equal columns when wide; no bespoke flex/grid unless switcher cannot express gap rhythm |
| Video thumbnail + play | one `a.rh3-media-trigger` over a local Ren10 product screenshot, scrim, and play icon | Named control (`aria-label`); single play affordance |
| Video lightbox | `<ren-dialog id="rh3-video" size="xl">` with real `<dialog>` | Focus trap, Escape, backdrop dismiss, focus return via ren-dialog |
| Loading while iframe loads | `.ren-spinner` with `role="status"` until load; hide after | Reduced-motion handled by spinner contract |
| Iframe | one `iframe` with title; `src` applied on open / progressive link fallback | No autoplay surprise on page load; PE link when JS off |
| Brand | docs chrome R-in-square + Ren10 only (not in Relume tree) | Source has no logo; do not invent in-block brand |

## Interaction policy

- Play/media control is activation-only (no hover-open).
- `data-dialog-trigger="rh3-video"` opens the dialog; close via
  `[data-dialog-close]`, Escape, or backdrop.
- Iframe `src` is assigned when the dialog opens (or kept empty until open) to
  avoid background network work; spinner shows until `load`.
- On close, clear or pause the embed when practical so audio does not continue.
- CTAs do not open the lightbox and are not duplicated inside the dialog.

## Cascade risks

- Media trigger must remain a single interactive owner (no nested button inside
  link, no second play control).
- Scrim uses semantic overlay token (`--color-overlay` or surface-on-media
  tokens), never hardcoded chromatic rgba.
- Dialog body must not force horizontal page overflow at 320px; iframe is
  fluid (`width: 100%`, aspect-ratio 16/9 via `ren-frame` / `ren-frame-video`).
- Primitive Zero list/button defaults must not break CTA cluster spacing.
- Preview root should not clip the modal (modal lives in top layer / dialog).

## Responsive adaptation

- Narrow (320 / 390 / 767): single column — copy then media.
- Seam and up (768 / 1280): two columns when switcher threshold allows; media
  remains on the inline-end side in LTR.
- Section padding and inter-column gap use `--space-*` / `--space-section`
  tokens, not source percentage padding constants.

## Progressive enhancement

- With JavaScript disabled: heading, lede, and both CTAs remain usable; the
  media control is a real link to the video destination (new tab or same-tab
  navigation) so the media is not a dead control.
- With JavaScript enabled: the same control opens `ren-dialog` via
  `data-dialog-trigger` (preventDefault) and hosts the embed.

## Rejected mappings

- No navbar / `ren-nav` / sheet drawer — source is a hero header, not navigation.
- No third CTA, trust logos, or invented brand inside the hero tree.
- No copied Relume thumbnail URL, YouTube embed, icon SVG paths, or class strings.
- No React, Tailwind, Radix, or Shadow DOM.
