# Grok Implementation Packet — Header 1

## Objective

Convert Relume `header1` into the standalone Ren10 block `templates/blocks/hero-split-copy-dual-cta-media.html`, preserving its split anatomy and responsive intent without source code or dependencies.

## Complete reference brief

The authenticated MCP source establishes one section/container, copy-left with one heading, one description, exactly two CTAs (primary and secondary), and one rounded cover image right. It stacks before the large breakpoint, then becomes two equal vertically centered columns. No interactive state exists beyond native CTA states.

## RenDS translation map

Use semantic sectioning plus `ren-center-wide`, `ren-switcher`, `ren-stack-lg`, `ren-cluster`, `ren-frame`, and documented `.ren-btn` variants. Use only semantic/component tokens. Preserve one real image and two real links. No framework, source class, source content, source URL, custom element, or JavaScript is required.

## Acceptance criteria

The focused test proves anatomy, CTA ownership, mobile stacking, equal desktop geometry, 320/390/767/768/1280 overflow, 44px focusable actions, light/dark token resolution, JavaScript-disabled completeness, reduced motion, and axe WCAG 2.1 AA.

## Required RED evidence

Before the production HTML existed, the focused Desktop Light run failed all 12 tests because the block path returned HTTP 404.

## Allowed files

- `templates/blocks/hero-split-copy-dual-cta-media.html`
- `tests/components/header1-header.spec.cjs`

Workflow packet/evidence files are maintained separately from the implementation scope.

## Forbidden files and dependencies

- Inventory, block catalog, core Ren10 contracts/APIs, tokens, and unrelated files.
- Relume source/classes/text/URL/assets/dependencies.
- React, Vue, Svelte, JSX/TSX, Tailwind, shadcn, or Shadow DOM.

## Required render matrix

Fresh desktop/mobile light/dark, JavaScript-disabled, and reduced-motion states from `render-matrix.json`.

## Required validation commands

```bash
npx playwright test tests/components/header1-header.spec.cjs --config tests/components/playwright.config.cjs --workers=1
node scripts/relume-workflow.mjs validate docs/workflows/relume-to-ren10/modules/header1
npm run lint
git diff --check
```

## Completion report format

Report RED/GREEN results, exact changed files, intentional Ren10 differences, capture states, and residual risk. Stop at workflow stage `green` for independent review.
