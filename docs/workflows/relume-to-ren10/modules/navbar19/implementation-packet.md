# Grok Implementation Packet — Navbar 19

## Objective

Implement `navbar19` as
`templates/blocks/nav-logo-left-center-links-site-panel.html` with an isolated
Playwright suite at `tests/components/navbar19-navigation.spec.cjs`. Advance the
workflow packet through `reference` → `mapped` → `red` with genuine evidence.
Drive automated tests to GREEN. Do **not** author Codex green-evidence and do
**not** advance `green` → `reviewed`.

## Complete reference brief

See embedded facts from `reference-brief.md` (same packet directory). Summary:

- Authenticated Relume MCP complete source for `navbar19` (2026-07-15).
- Bar: logo start, desktop-centered four top entries (3 plain + 1 dropdown with
  3 title-only destinations + 1 chevron), always-visible menu toggle end.
- Site panel (every width): 8 large primary links, 4 columns × 5 links, contact
  (phone, email, location), 5 social links.
- Desktop bar row hides while site panel is open. Mobile top row is logo +
  toggle only.
- Source defects: unnamed toggle, fake dropdown trigger, nested nav risk,
  incomplete keyboard/Escape/focus/outside/reduced-motion contracts.
- Public output must not include source text, URLs, assets, classes, SVG paths,
  dependencies, durations, or breakpoint constants.

## RenDS translation map

See `translation-map.md`. Key decisions:

- One `<ren-nav>` / `<nav class="ren-nav">` landmark.
- Bar tree: `#rn19-bar-links.ren-nav-links` with native `details` disclosure.
- Site panel: `#rn19-site-panel` region controlled by `.ren-nav-toggle`
  (`aria-controls`, `aria-expanded`, accessible name).
- Toggle forced visible at all widths.
- 48rem single boundary; hover corridor only on desktop disclosure.
- PE: JS-disabled exposes catalog + native disclosure; inert toggle hidden.
- Reject nested nav, ren-card/menu/popover/collapsible, permanent CTAs, brand
  SVG copies.

## Acceptance criteria

From `acceptance.json` plus block-specific checks:

1. Exact anatomy counts: 1 brand; 4 bar entries (3 links + 1 disclosure);
   3 destinations; 1 chevron; 1 toggle; 8 primary panel links; 4 columns;
   20 column links; phone + email + location; 5 socials.
2. One landmark / no nested `nav`; one authored chevron; one close/toggle owner.
3. Desktop geometry: logo start, centered bar row, toggle end; absolute
   dropdown; bar row hidden when panel open.
4. Mobile geometry: closed top row is logo + toggle; open shows site panel.
5. Interactions: disclosure hover/click/keyboard/Escape/outside/destination;
   panel toggle/Escape/outside/destination; breakpoint reset; reduced motion.
6. JS-disabled usability for catalog + disclosure.
7. 44px targets, visible focus, light/dark tokens, axe WCAG 2.1 AA.

## Required RED evidence

Add the isolated suite first. Run it while production HTML is absent. Record
genuine failing status (404 / missing root). Commit packet + tests before
production HTML. Only then implement the block and drive tests to GREEN.

## Allowed files

- `docs/workflows/relume-to-ren10/modules/navbar19/**`
- `templates/blocks/nav-logo-left-center-links-site-panel.html`
- `tests/components/navbar19-navigation.spec.cjs`

## Forbidden files and dependencies

- `docs/workflows/relume-to-ren10/inventory.json`
- `templates/blocks/index.html`
- `tests/components/blocks-navigation.spec.cjs`
- Shared helpers, package files, core Ren10 files, registries, other paths
- New dependencies
- Relume source/classes/text/URLs/assets/SVG paths/durations/breakpoints
- Framework abstractions and Shadow DOM

## Required render matrix

Implement against `render-matrix.json` states: desktop/tablet/mobile, light/dark,
panel open/closed, disclosure open/hover, JS-disabled, reduced motion.

## Required validation commands

```bash
npx playwright test --config tests/components/playwright.config.cjs \
  tests/components/navbar19-navigation.spec.cjs --project="Desktop Light"
npx playwright test --config tests/components/playwright.config.cjs \
  tests/components/blocks-navigation.spec.cjs --project="Desktop Light"
npm run lint
npm run agent:check
node scripts/relume-workflow.mjs validate docs/workflows/relume-to-ren10/modules/navbar19
node scripts/relume-workflow.mjs status docs/workflows/relume-to-ren10/modules/navbar19
npm run workflow:relume:capture -- \
  docs/workflows/relume-to-ren10/modules/navbar19/render-matrix.json \
  --module navbar19 --output output/playwright/navbar19
git diff --check
rg -n "design\.md|DESIGN\.md|COMPONENT\.md|PATTERN\.md|TOKENS\.md|LAYOUTS\.md|PRIMITIVE-ZERO\.md|COMPONENTS\.md" . --glob '!node_modules/**'
find components/primitives -mindepth 2 -maxdepth 2 -type f -name component.md | wc -l
find components/composites -mindepth 2 -maxdepth 2 -type f -name component.md | wc -l
find components/patterns   -mindepth 2 -maxdepth 2 -type f -name pattern.md   | wc -l
```

## Completion report format

Report RED proof, GREEN focused/full counts, commits, capture states,
validation results, intentional differences, residual risks. Do not paste
protected source. Leave packet stage at `red` for independent Codex visual
review (do not author Codex green-evidence).
