# Grok Implementation Packet — Navbar 21

## Objective

Implement `navbar21` as
`templates/blocks/nav-logo-center-links-fullscreen-featured.html` with isolated
coverage in `tests/components/navbar21-navigation.spec.cjs`.

## Sanitized Relume facts

- Sticky logo-left bar; four centered bar entries (three plain + one dropdown
  with three title-only destinations); always-visible menu toggle.
- Toggle opens a full-viewport overlay with eight large destinations, a
  featured rail (heading + two image/title/description/cue articles + view-all
  with trailing chevron), contact link, and five socials.
- Bar link set and panel link set are intentionally different collections.
- Source defects: unnamed toggle, incomplete Escape/focus, nested landmark
  risk, conditional mount focus loss, unlabeled social icons, no reduced-motion.
- Do not copy source code, classes, text, URLs, assets, SVG paths, dependencies,
  durations, easing, or breakpoint constants.

## Ren10 contract

- One `<ren-nav>` / `<nav class="ren-nav">` landmark; panel lives inside it.
- Native `details/summary` for the bar dropdown; one `.rn21-chevron` only for
  that disclosure (plus one separate view-all chevron in the featured rail).
- Force `.ren-nav-toggle` visible at all widths; `aria-controls` the panel id.
- Hide bar links below 48rem; never use ren-nav’s under-bar drawer as the
  fullscreen composition.
- Eight large panel anchors; two article anchors with tokenized media; five
  socials with accessible names; one contact link.
- Desktop hover/pin disclosure controller; Escape, outside, destination, and
  breakpoint close for disclosure and panel.
- JS-disabled: hide inert toggle; expose bar destinations and panel content in
  flow.
- Semantic/component tokens and layout primitives only.
- Preview root: `[data-rn21-root]` / `.rn21-preview`.

## Acceptance criteria

1. Exact anatomy counts and single landmark / no nested `nav`.
2. Desktop geometry: logo | centered bar menu | toggle; absolute dropdown.
3. Mobile geometry: logo + toggle; fullscreen stacked composition when open.
4. Interactions, progressive enhancement, 44px targets, focus, reduced motion,
   light/dark, axe WCAG 2.1 AA, no overflow.

## RED then GREEN

Add the isolated Navbar 21 suite first; run it while the HTML is absent; record
RED evidence; commit packet/tests before production HTML. Advance packet only
through `red` → `green`. Do not author Codex green-evidence or advance to
`reviewed`.

## Allowed files

- `docs/workflows/relume-to-ren10/modules/navbar21/**`
- `templates/blocks/nav-logo-center-links-fullscreen-featured.html`
- `tests/components/navbar21-navigation.spec.cjs`

## Forbidden files and dependencies

- `inventory.json`, `templates/blocks/index.html`,
  `tests/components/blocks-navigation.spec.cjs`, shared helpers, package files,
  core Ren10 registries, and any other path.
- Framework abstractions and Shadow DOM.

## Required validation

```bash
npx playwright test tests/components/navbar21-navigation.spec.cjs
npx playwright test tests/components/blocks-navigation.spec.cjs
npm run lint
npm run agent:check
node scripts/relume-workflow.mjs validate docs/workflows/relume-to-ren10/modules/navbar21
git diff --check
```
