# Relume to RenDS Translation Map — Header 4

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/composites/ren-dialog/component.md`
- `components/primitives/ren-button/component.md`
- `components/primitives/ren-field/component.md`
- `components/primitives/ren-link/component.md`
- `components/primitives/ren-icon/component.md`
- `components/primitives/ren-spinner/component.md`

## RenDS mapping

| Reference part | Ren10 mapping | Preserved behavior / deliberate correction |
| --- | --- | --- |
| Section shell + container | `<section class="rh4-section" data-rh4-root>` inside `ren-center ren-center-wide` | Real section landmark; token section padding |
| Two-column split | `ren-switcher` with elevated `--switcher-threshold` (~56–60rem) so tablet stays stacked | Matches source “stack until large” intent better than `ren-grid-2` (which splits at 640px) |
| Heading + description | Real `h1.rh4-title` + `p.rh4-lede` in `ren-stack` | Semantic heading hierarchy for the hero |
| Email form | Native `<form class="rh4-form">` with `ren-field` + `input.ren-input type=email` + `button.ren-btn type=submit` | One CTA; field/button row via `ren-cluster` / block form grid |
| Terms line | `p.rh4-terms` with `a.ren-link[href="../../LICENSE"]` | Real, resolvable repository-license destination; not dangerouslySetInnerHTML |
| Media trigger | `<button type="button" class="rh4-media-trigger">` wrapping `ren-frame ren-frame-video` poster + overlay + play icon | Real button; accessible name; ≥44px target |
| Poster image | Local Ren10 product screenshot (no Relume CDN asset) | Real product context with a semantic surface fallback |
| Play icon | `span.ren-icon ren-icon-2xl` + authored SVG (`currentColor`) | No `relume-icons` dependency |
| Video lightbox | `<ren-dialog id="rh4-video" size="xl">` with real `<dialog>`, title, close, body iframe | Focus trap, Escape, backdrop, restore focus |
| Loading spinner | `.ren-spinner.ren-spinner-lg` with `role="status"` until iframe `load` | Reduced-motion via spinner contract |
| Iframe media | `iframe` with `srcdoc` applied on open; contains a native, controlled `<video>` backed by a tiny deterministic inline WebM clip; cleared on close | Real playable media without network or copied embed URL; deterministic in tests and offline demos |

## Interaction policy

- Dialog open is activation-only (click/keyboard on media trigger).
- Public `ren-dialog` API only (`show()`, `close()`, `isOpen`, events).
- On `ren-open`: set the iframe's self-contained video document, show spinner,
  and hide the iframe until its document load event.
- On `ren-close`: clear iframe `src` / `srcdoc` and reset loading UI.
- Form `submit`: `preventDefault` for the static demo (no network).
- No hover-only lightbox open.
- No second marketing CTA.

## Cascade risks

- Dialog must not be clipped by preview `overflow: hidden`.
- Media overlay must not block the button’s accessible name or focus ring.
- `ren-field` label must remain visible (not placeholder-only).
- Spinner and iframe must not both compete for AT announcements when loaded.
- Form row at 320px must not overflow the root (stack or wrap cleanly).
- Play icon color on dark overlay: use inverted/on-overlay semantic tokens, not hardcoded white hex if avoidable (grayscale/on-overlay tokens OK).

## Responsive adaptation

- Narrow / tablet: single column via switcher threshold; form stacks then becomes horizontal when width allows.
- Large: two columns, copy start / media end, items vertically centered.
- Section vertical padding uses `--space-section` / stepped spacing tokens, not Relume `py-16/24/28` literals.

## Progressive enhancement

- Without JS: copy, form, terms, and poster remain visible. The initial custom
  field error stays hidden and native validation remains available. A valid
  form submit reaches the owned `docs/getting-started.html` fallback; the terms
  link resolves to the repository license. The media trigger does not open a
  modal; dialog content stays in DOM but closed.
- With JS: dialog upgrades to modal lightbox; iframe lazy-bound on open.

## Rejected mappings

- Not a navbar / `ren-nav` / sheet drawer — source is a hero header section.
- No second CTA or ghost button invented for visual balance.
- No copied Relume assets, icon packages, Tailwind classes, or embed URLs.
- No Shadow DOM or framework wrappers.
