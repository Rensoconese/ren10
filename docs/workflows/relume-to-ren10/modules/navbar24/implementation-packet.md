# Grok Implementation Packet — Navbar 24

## Objective

Implement `navbar24` as `templates/blocks/nav-mega-menu-product-rail.html` with an
isolated Playwright suite at `tests/components/navbar24-navigation.spec.cjs` and a
closed workflow packet under `docs/workflows/relume-to-ren10/modules/navbar24/`.
Change no other files (do not edit inventory, blocks index, shared nav suite,
helpers, package files, or core Ren10).

## Complete sanitized reference

Authenticated Relume MCP (`relume_oauth__get_component`, slug `navbar24`,
primitives include) returned complete section source plus badge/button/media-query
utilities.

- One brand, four top entries (three links + one mega trigger), two header actions
  (secondary + primary), one hamburger, one chevron.
- Mega intro: title, description, one secondary CTA.
- Mega sublinks: exactly eight bold title-only destinations in a two-column grid.
- Mega product rail: exactly one linked product card with portrait media (~10:12),
  name, variant, price, and optional badge.
- Desktop: full-width bar; full-width absolute mega under the bar; two-track
  interior (larger intro+links track, narrower product rail with sunken surface).
- Mobile: logo + toggle top row; one stacked tree; actions full-width in open panel;
  nested mega in flow.
- Desktop hover open / leave close; activation toggles; source uses max-width 991px
  to suppress hover — Ren10 uses 48rem only.
- Source defects to fix: unnamed toggle; incomplete disclosure contract; duplicate
  action trees; missing Escape/outside/destination/focus-return/breakpoint/reduced-motion;
  generic section root; numeric z-index.
- Do not copy source code, classes, text, URLs, assets, SVG paths, durations, or
  breakpoint constants.

## Complete RenDS translation

- One `<ren-nav>` / `<nav class="ren-nav">` and one responsive links tree.
- Native `details/summary`; reset classless chrome; exactly one authored chevron.
- Layout: `ren-with-sidebar` or equivalent two-track shell for intro+sublinks vs
  product rail; `ren-grid-2` for eight sublinks; `ren-frame` for portrait media;
  `ren-card ren-card-interactive` for the product whole-card anchor.
- Intro CTA is a real `a.ren-btn`; product badge is a non-interactive `span.ren-badge`.
- Semantic/component tokens only. No raw colors, primitive palette tokens, raw
  durations, or numeric z-index.
- Desktop hover corridor across full-width panel; click pin; Escape restores focus
  to summary from any focused mega destination; every destination class closes.
- JS-disabled mobile exposes the one tree, both actions, and native disclosure.

## Acceptance criteria

1. Exact counts: one brand, four entries, eight sublinks, one product, one intro
   CTA, two actions, one toggle, one chevron.
2. Product is a single anchor without nested interactive descendants.
3. Stable hover, click pin, keyboard, Escape-from-destination, outside/destination
   close, mobile shell, same-breakpoint resize, and 767/768/769 seams.
4. Desktop full-width panel under bar; tablet/mobile reflow without overflow at
   320/340/390 and desktop widths.
5. One landmark/tree, visible focus, 44px touch targets, reduced motion, light/dark,
   JS-disabled fallback, and axe WCAG 2.1 AA pass.

## RED then GREEN

Add the isolated Navbar 24 suite first and run it against the missing block to
record expected 404/anatomy failures. Only then implement production HTML and drive
focused tests green. Do not author Codex green-evidence and do not advance past green.

## Allowed files

- `docs/workflows/relume-to-ren10/modules/navbar24/**`
- `templates/blocks/nav-mega-menu-product-rail.html`
- `tests/components/navbar24-navigation.spec.cjs`

## Required validation

```bash
npx playwright test tests/components/navbar24-navigation.spec.cjs --config tests/components/playwright.config.cjs
npm run lint
git diff --check
node scripts/relume-workflow.mjs validate docs/workflows/relume-to-ren10/modules/navbar24
```

Do not run the shared full navigation regression or `npm run agent:check` in this
parallel worker.
