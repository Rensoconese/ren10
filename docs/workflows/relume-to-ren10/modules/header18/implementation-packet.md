# Header18 Implementation Packet

## Objective

Implement `header18` as `templates/blocks/hero-top-split-email-video-lightbox.html`: a content-height Ren10 hero with split copy/email support above one landscape video-lightbox trigger. Scope is limited to the declared block and focused test.

## Complete reference brief

Authenticated Relume source establishes one content-height constrained section. Its upper region stacks on mobile and becomes two top-aligned columns at medium width: one h1 left; description, one email/submit form, and one legal terms line right. The form stacks then becomes `1fr/max-content` at small width. One full-width landscape trigger follows, owning one image, scrim, and play icon. It opens one dialog with one loader and one aspect-video iframe using progressive medium/large caps. No extra CTA, nav, logo, background video, second trigger/form/dialog/iframe exists. The source lacks a visible label, real validation/status, native action, real terms destination, no-JavaScript alternative, iframe title/status semantics, motion handling, and owned media.

## RenDS translation map

Use one labelled native section with `ren-center ren-center-wide ren-stack`; `ren-switcher` for upper copy and form; `ren-field` for a visible labelled required email; one native GET form and `.ren-btn` submit; one real terms link; one button with `ren-frame ren-frame-video`, owned image, token scrim, and decorative SVG; one `ren-dialog` with native `<dialog>`, title, singular close, `ren-spinner`, busy owner, and one titled iframe. Use owned deterministic WebM via iframe `srcdoc`, clear it on close, and provide a noscript video alternative. All inline behavior must be `type="module"`; only the root may be selected from `document`, and every other query is root-scoped.

## Acceptance criteria

The exact machine-readable criteria are in `acceptance.json`. Tests must cover exact counts/no extras; content height; copy seam 767/768; form seam 390/640; full-width 16:9 trigger; widths 320/390/640/767/768/1280; native/enhanced form; no-JavaScript; loading/loaded/playable/unloaded iframe; close/Escape/backdrop/focus trap+restore; reduced motion; light/dark; focus; 44px; axe AA; tokens/layouts; module/root scoping; and absence of framework/copied dependencies.

## Required RED evidence

Run the focused suite before creating production HTML. Expected failure is a 404/ENOENT for the absent block. Store the command and result in `red-evidence.json`, then advance `red` to `green` before implementation.

## Allowed files

- `templates/blocks/hero-top-split-email-video-lightbox.html`
- `tests/components/header18-header.spec.cjs`
- Packet-local workflow/evidence/capture files under `docs/workflows/relume-to-ren10/modules/header18/`

## Forbidden files and dependencies

- Inventory, catalog, core APIs, tokens, shared components, registries, or unrelated files.
- React, JSX/TSX, Tailwind, shadcn, Radix, relume-icons, external embeds, copied assets/content/classes/URLs, or Shadow DOM.

## Required render matrix

Use `render-matrix.json`: desktop light/dark closed/open, tablet 768, seam 767, form 640, mobile 390 closed/open, narrow 320, mobile no-JavaScript, and reduced-motion open.

## Required validation commands

```bash
NODE_PATH=/Users/rensoconese/RenDS/rends/node_modules /Users/rensoconese/RenDS/rends/node_modules/.bin/playwright test --config tests/components/playwright.config.cjs tests/components/header18-header.spec.cjs
node scripts/capture-block-matrix.mjs docs/workflows/relume-to-ren10/modules/header18/render-matrix.json --module header18 --output docs/workflows/relume-to-ren10/modules/header18/captures --repo-root .
npm run lint
npm run agent:check
node scripts/relume-workflow.mjs validate docs/workflows/relume-to-ren10/modules/header18
git diff --check
```

## Completion rule

Stop at packet stage `green`. Produce capture evidence and green evidence, but do not advance to `reviewed`; independent review is a separate gate.
