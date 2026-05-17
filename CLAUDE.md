# CLAUDE.md

This package ships RenDS, a vanilla design system. Routing for AI
agents (Claude Code, Claude Desktop, Claude API, any other Claude-powered
tool) lives in [`AGENTS.md`](./AGENTS.md). Read that file first — it is
the canonical contract.

For UI work, the mandatory loading order is:

1. `ren-design.md` — root design contract.
2. `tokens/tokens.md` — token decisions.
3. `base/layouts.md` — layout primitives before any custom CSS.
4. `base/primitive-zero.md` — classless / native HTML.
5. `components/components.md` — picking a component.
6. The colocated `component.md` / `pattern.md` for every RenDS part you
   touch. Each carries an `aiHints` YAML block with
   `selectionCriteria`, `canonicalImports`, `requiredMarkup`,
   `forbiddenPatterns`, `tokenPolicy`, and `accessibility`.

Hard rules, validation commands, and golden examples all live in
`AGENTS.md`. Do not duplicate them here.
