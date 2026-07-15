# Grok Implementation Packet — Navbar 28

## Objective

Implement `navbar28` as `templates/blocks/nav-mega-menu-category-collections.html`
with isolated coverage in `tests/components/navbar28-navigation.spec.cjs`.
Change only the packet directory, that HTML path, and that isolated spec.

## Complete sanitized reference

Authenticated Relume MCP retrieval confirmed complete source for slug
`navbar28` with primitives included.

- Full-width logo-left bar with bottom border; four top entries (three links +
  one mega); two actions; one hamburger; one chevron.
- Mega left: one titled category group with five simple links (~15rem cap).
- Mega right: three full-bleed overlay collection cards (image + dark overlay +
  title + description + CTA label). Source nests interactive buttons — Ren10
  must not.
- Desktop: absolute full-width mega under the bar; three-column collection grid.
- Mobile: brand + toggle top row; in-flow mega; stacked full-width actions from
  the single actions cluster.
- Desktop hover open / leave close; activation toggles everywhere.
- Source defects to fix: unnamed toggle; incomplete disclosure ARIA; nested
  interactive CTAs; no Escape/outside/focus return/reduced motion; dual action
  trees; numeric z-index.

## Complete RenDS translation

- One `ren-nav` / one landmark / one links tree / one actions cluster.
- Native `details/summary`; neutralize classless chrome; one authored chevron.
- `ren-with-sidebar` for category column + collections region; `ren-grid-3` for
  three collection cards (stack below 48rem).
- Whole-card collection anchors; CTA is a non-interactive span.
- Ren10 48rem shell; desktop hover corridor + click pin; Escape restores focus
  even when a destination holds focus; destination close for every destination
  class; JS-disabled fallback; tokens only.

## Acceptance criteria

See `acceptance.json`. Exact counts, geometry seams, a11y, tokens, and progressive
enhancement are automated; Codex owns visual green review.

## RED then GREEN

Add the isolated suite first and run it while the production HTML is absent to
record genuine RED. Only then implement production and drive the focused suite green.
Do not author Codex green-evidence or advance green→reviewed.

## Allowed files

- `docs/workflows/relume-to-ren10/modules/navbar28/**`
- `templates/blocks/nav-mega-menu-category-collections.html`
- `tests/components/navbar28-navigation.spec.cjs`

## Required validation

```bash
npx playwright test tests/components/navbar28-navigation.spec.cjs
npm run lint
node scripts/relume-workflow.mjs validate docs/workflows/relume-to-ren10/modules/navbar28
git diff --check
```

Do not run the shared full navigation regression or `npm run agent:check`.
