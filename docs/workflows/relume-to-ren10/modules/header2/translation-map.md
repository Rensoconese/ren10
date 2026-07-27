# Relume to RenDS Translation Map — Header 2

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

| Reference part | Ren10 mapping | Preserved behavior / deliberate correction |
| --- | --- | --- |
| Hero section shell | `<section class="rh2-hero" data-rh2-root aria-labelledby="rh2-heading">` | Named landmark via heading association; not a navbar |
| Two-zone grid (copy + media) | `.rh2-layout.ren-switcher` with copy + media children | Stacks below threshold; two equal tracks when wide; vertical center on wide |
| Primary heading | one `h1#rh2-heading.rh2-heading` | Sole page-level heading; compact demo chrome has no competing heading |
| Description | one `p.rh2-description` | Semantic body copy; tokens for type/color |
| Email + single CTA form | `<ren-form>` + native `<form>` + one `<ren-field>` email + one `button.ren-btn[type=submit]` | Visible label; `required` + email validation; one CTA only |
| Form row (field + button) | `.rh2-signup-row` cluster inside constrained `.rh2-signup` | Side-by-side when space allows; stack full-width on narrow |
| Terms prose + link | `p.rh2-terms` with one `a.ren-link[href="../../LICENSE"]` | Real elements (no HTML injection); destination resolves to the repository license; link is not a second CTA button |
| Media column | `figure.rh2-media.ren-frame.ren-frame-photo` + local Ren10 product screenshot | Cover media peer column; no CDN asset; no chromatic hardcodes |
| Demo brand (page chrome only) | shared `dx-brand` R-in-square + Ren10 | Hero source has no brand; brand appears only in shell |

## Interaction policy

- No open/close surface. Interaction is form focus, type, validate, submit.
- Submit uses `ren-submit` (cancelable); demo prevents navigation and surfaces a polite live status.
- Invalid submit focuses the error summary / field path per `ren-form` + `ren-field`.
- Terms link is ordinary navigation; it must not be duplicated as a button.
- Light/dark via `data-theme` + semantic tokens; reduced-motion respected if any transition is authored.

## Cascade risks

- Heading ownership: the page shell is compact brand/link chrome without a
  heading; `h1#rh2-heading` is therefore the single page-level heading and
  labels the hero section directly, matching the reference anatomy.
- `ren-field` visible label must not break the compact email+button row at 320px.
- `ren-form-row` min-widths can force overflow; use a block-local `.rh2-signup-row` instead of `.ren-form-row` min-width 250px.
- Media `ren-frame` must not force horizontal overflow at 320.
- The local screenshot uses `ren-frame` cover behavior and a tokenized surface fallback.

## Responsive adaptation

- Narrow (320 / 390 / 767): single column, copy above media; form stacks.
- From mid (768+): form email+button can sit in one row inside the copy column.
- Wide (~48rem+ container / desktop 1280): two-column switcher, media beside copy, columns vertically centered.
- Do not invent a mobile nav or second CTA at any seam.

## Progressive enhancement

- Without JS: native `<form>`, email input, submit button, and terms link remain usable; `ren-form` / `ren-field` upgrade when modules load.
- No disclosure that would hide content when JS is disabled.

## Rejected mappings

- No `ren-nav`, `ren-sheet`, `ren-menu`, or hamburger — source is not a navbar.
- No second CTA button (source has exactly one).
- No background image hero — media is a peer column.
- No Relume CDN image, copy, classes, or framework primitives.
