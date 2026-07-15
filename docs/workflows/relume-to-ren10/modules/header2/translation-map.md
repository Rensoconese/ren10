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
| Primary heading | one `h1#rh2-heading.rh2-heading` | Real heading hierarchy inside the hero (demo page uses a separate docs `h1`) |
| Description | one `p.rh2-description` | Semantic body copy; tokens for type/color |
| Email + single CTA form | `<ren-form>` + native `<form>` + one `<ren-field>` email + one `button.ren-btn[type=submit]` | Visible label; `required` + email validation; one CTA only |
| Form row (field + button) | `.rh2-signup-row` cluster inside constrained `.rh2-signup` | Side-by-side when space allows; stack full-width on narrow |
| Terms prose + link | `p.rh2-terms` with one `a.ren-link` | Real elements (no HTML injection); link is not a second CTA button |
| Media column | `figure.rh2-media.ren-frame.ren-frame-photo` + tokenized placeholder | Cover media peer column; no CDN asset; no chromatic hardcodes |
| Demo brand (page chrome only) | shared `dx-brand` R-in-square + Ren10 | Hero source has no brand; brand appears only in shell |

## Interaction policy

- No open/close surface. Interaction is form focus, type, validate, submit.
- Submit uses `ren-submit` (cancelable); demo prevents navigation and surfaces a polite live status.
- Invalid submit focuses the error summary / field path per `ren-form` + `ren-field`.
- Terms link is ordinary navigation; it must not be duplicated as a button.
- Light/dark via `data-theme` + semantic tokens; reduced-motion respected if any transition is authored.

## Cascade risks

- Docs page `h1` (template title) vs hero `h1`: keep a single page-level docs heading outside the preview root; hero heading may be `h2` in the full page document order **or** the preview may be the sole primary heading region under a labelled section — prefer one visible `h1` for the block under test and demote the template chrome title if needed so axe heading-order stays clean. Chosen approach: template chrome uses `h1` for the docs title; hero uses `h2` with class `rh2-heading` that is visually primary inside the block, while tests assert the block heading role/name and landmark. *Correction:* Relume uses `h1` inside the section; for a standalone block page the docs title is the page `h1` and the hero heading is `h2` to avoid dual `h1`. Document as intentional Ren10 page composition.
- `ren-field` visible label must not break the compact email+button row at 320px.
- `ren-form-row` min-widths can force overflow; use a block-local `.rh2-signup-row` instead of `.ren-form-row` min-width 250px.
- Media `ren-frame` must not force horizontal overflow at 320.
- Placeholder gradient must use only semantic tokens (`--color-surface*`, `--color-accent` via `color-mix`).

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
