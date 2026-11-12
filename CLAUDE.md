# CLAUDE.md

This package ships RenDS, a vanilla design system. Routing for AI
agents (Claude Code, Claude Desktop, Claude API, any other Claude-powered
tool) lives in [`AGENTS.md`](./AGENTS.md). Read that file first — it is
the canonical contract.

For UI work, the mandatory loading order is:

1. `ren-essentials.md` — compact entry contract (rules, tokens, layouts,
   routing; ≈8 KB, also `npx ren10 docs design --dense`). Load the full
   `ren-design.md` only when you need exact values or rationale.
2. `tokens/tokens.md` — token decisions.
3. `base/layouts.md` — layout primitives before any custom CSS.
4. `base/primitive-zero.md` — classless / native HTML.
5. `components/components.md` — picking a component; for a whole page
   section (nav, hero, pricing, footer...) check `npx ren10 blocks` first.
6. The colocated `component.md` / `pattern.md` for every RenDS part you
   touch. Each carries an `aiHints` YAML block with
   `selectionCriteria`, `canonicalImports`, `requiredMarkup`,
   `forbiddenPatterns`, `tokenPolicy`, and `accessibility`.

Hard rules, validation commands, and golden examples all live in
`AGENTS.md`. Do not duplicate them here.

<!-- RENDS:START -->
RenDS v0.14.1 · vanilla HTML/CSS/JS · Light DOM · 53 components · 335 blocks

READ FIRST: `ren-essentials.md` (≈8 KB: rules, tokens, layouts, routing; same as
`npx ren10 docs design --dense`). Load `ren-design.md` (≈97 KB) only for exact values or rationale.

WORKFLOW — discover before writing UI:
1. `npx ren10 build "<idea>"` — composition kit: page sections (blocks), components, docs.
2. `npx ren10 blocks <name>` — copy a shipped nav/hero/pricing/footer block before hand-building one.
3. `npx ren10 docs layouts --dense` — choose the page skeleton before custom CSS.
4. `npx ren10 component <name> --dense` — read contract, imports, aiHints, usage.
5. `npx ren10 doctor` — verify package health before shipping.

RULES:
- Vanilla only: no React/Vue/Svelte/JSX/TSX, no Tailwind, no shadcn/ui.
- Use RenDS layout primitives before custom flex/grid CSS.
- Use semantic/component tokens (`--color-*`, `--space-*`, `--ren-*`), never primitive palette tokens or hardcoded colors.
- Real elements only: button, a, input, form, dialog, table, details.
- Light DOM only; never attachShadow.

COMPONENTS: primitives=19, composites=26, patterns=8.
MORE CLI:
  manifest --json          self-describing CLI surface
  search "<query>"         search graph across components/blocks/docs/examples/tokens
  blocks --list            page-section blocks grouped by family
  docs <topic> --dense     design (essentials), tokens, layouts, primitive-zero, components, evals
  component --list         all components grouped by layer
  knowledge query "<q>"    packaged graph query; --json emits typed JSON
<!-- RENDS:END -->
