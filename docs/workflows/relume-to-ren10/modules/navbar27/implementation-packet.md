# Implementation Packet — Navbar 27

## Goal

Implement Relume catalog module `navbar27` as Ren10 block
`nav-mega-menu-category-collections` under
`templates/blocks/nav-mega-menu-category-collections.html` with isolated
Playwright coverage in `tests/components/navbar27-navigation.spec.cjs`.

## Anatomy to preserve (sanitized)

- Full-width logo-left / four-entry menu / two end actions.
- Three plain top links + one mega disclosure with one chevron.
- Mega: two category groups × five title-only links (10) + two whole-card
  collection promos (media, title, description, CTA text) without nested
  interactive descendants.
- One mobile toggle; one responsive tree; desktop full-bleed under-bar mega;
  mobile in-flow mega; actions permanent on desktop and shell-owned on mobile.

## Allowed files only

- `docs/workflows/relume-to-ren10/modules/navbar27/**`
- `templates/blocks/nav-mega-menu-category-collections.html`
- `tests/components/navbar27-navigation.spec.cjs`

Do not edit inventory, blocks index, shared navigation suite, package files, or
core Ren10 sources.

## RED rule

Write the isolated spec first. Run it with the production HTML absent. Record
genuine RED evidence. Commit packet + tests before production HTML.

## Implementation rules

- Vanilla HTML/CSS/JS, Light DOM, Ren10 tokens and layout primitives.
- Native `details`/`summary` for the mega; block-local JS for desktop hover
  corridor, pin/click, Escape focus restore, outside/destination/CTA close,
  mobile-shell and breakpoint close.
- WCAG 2.1 AA, visible focus, 44px targets, reduced motion, progressive
  enhancement.
- No protected Relume source, copy, URLs, assets, class strings, durations, or
  breakpoint constants.

## Validation (worker scope)

```bash
npx playwright test --config tests/components/playwright.config.cjs \
  tests/components/navbar27-navigation.spec.cjs --project="Desktop Light"
npm run workflow:relume:capture -- \
  docs/workflows/relume-to-ren10/modules/navbar27/render-matrix.json \
  --module navbar27 --output output/playwright/navbar27
npm run lint
node scripts/relume-workflow.mjs validate docs/workflows/relume-to-ren10/modules/navbar27
git diff --check
```

Do not run the shared full navigation regression or `npm run agent:check` in
this parallel worker.

## Stage ownership

Worker advances `reference` → `mapped` → `red` → `green` using packet-local
evidence. Do not author Codex green visual-review evidence and do not advance
`green` → `reviewed`.
