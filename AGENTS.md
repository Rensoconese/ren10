# AGENTS.md — RenDS / ren10

This is a routing index for AI agents working in this repository. It is
**not** the design system documentation — it tells you which file to load
next.

> This file is the version published with the `ren10` npm package and
> committed to the public `ren10` GitHub repo. A near-identical copy may
> exist in a parent workspace; both must stay in sync.

## Package Layout

- `ren-design.md` — root design contract for tokens, themes, philosophy.
- `tokens/`, `base/`, `components/`, `utils/`, `themes/` — implementation.
- `docs/`, `examples/`, `templates/`, `create/` — documentation and
  golden examples.
- `cli/` — `npx ren10` CLI source.
- `evals/` — eval prompts + checklist for RenDS-aware agents.

The authoritative source for building UI is everything under this
package root.

## Mandatory Loading Order

For any task that builds, edits, or reviews UI with RenDS:

1. **Always first.** `ren-design.md` — root design contract for tokens,
   themes, philosophy, and the registry of all 53 components.
2. **Token decisions.** `tokens/tokens.md` — when choosing a color,
   spacing, type, motion, radius, shadow, or component-level theme value.
3. **Page skeleton.** `base/layouts.md` — before writing any layout
   CSS. RenDS supplies layout primitives (`ren-stack`, `ren-grid`,
   `ren-with-sidebar`, etc.); use them instead of bespoke
   `display: flex` / `display: grid`.
4. **Native HTML.** `base/primitive-zero.md` — when the markup uses
   classless / native HTML elements (headings, lists, tables, `details`,
   etc.).
5. **Picking a component.** `components/components.md` — routes to
   the correct primitive / composite / pattern.
6. **Building a component.** The colocated contract for *every* RenDS part
   used:
   - `components/primitives/<name>/component.md`
   - `components/composites/<name>/component.md`
   - `components/patterns/<name>/pattern.md`

Every colocated contract carries a YAML `aiHints` block (between
**Do Not Use When** and **Required Imports**) with
`selectionCriteria` / `canonicalImports` / `requiredMarkup` /
`forbiddenPatterns` / `tokenPolicy` / `accessibility`. Read the
`aiHints` first when deciding between two RenDS parts.

Never invent RenDS APIs from `ren-design.md` alone. Selectors, attributes,
states, and the public token surface live in the colocated contract files.

## Hard Rules (apply to every UI task)

- **Vanilla output only.** RenDS targets vanilla HTML, CSS, and JavaScript with
  optional custom elements. Official `@ren10/astro` build-time wrappers are
  allowed in `.astro` files because they emit the same native Light DOM. Do
  not output React, Vue, Svelte, JSX, TSX, framework islands, shadcn/ui, or
  Tailwind utility classes.
- **Layout primitives over custom CSS.** Before writing
  `display: flex` / `display: grid`, find the equivalent layout primitive
  in `base/layouts.md`.
- **Tokens, not literals.** Component CSS and consumer code use semantic
  (`--color-*`) or component (`--ren-*`) tokens. Never primitive palette
  tokens (`--blue-*`, `--gray-*`, `--red-*`, `--green-*`, `--orange-*`,
  `--yellow-*`, `--teal-*`, `--purple-*`, `--pink-*`) and never hardcoded
  hex / non-grayscale rgba in consumer code.
- **Real elements.** Render real `<button>`, `<dialog>`, `<form>`,
  `<input>`, `<a>`, etc. — never style a `<div>` as one of these.
- **Accessibility is required.** Every interactive element has visible
  `:focus-visible`, an accessible name, keyboard support, and respects
  `prefers-reduced-motion`. WCAG 2.1 AA is the baseline.
- **Light DOM only.** No `attachShadow`, no Shadow DOM workarounds.
- **One contract per part.** Lowercase filenames only:
  `ren-design.md`, `primitive-zero.md`, `tokens.md`, `layouts.md`,
  `components.md`, `component.md`, `pattern.md`. Never reintroduce the
  uppercase variants (DESIGN, COMPONENT, PATTERN, TOKENS, LAYOUTS,
  PRIMITIVE-ZERO, COMPONENTS) — the validation block in this file
  greps for them.

## Validation Commands

Run these before reporting a task complete:

```bash
# From this package root: confirm no stale uppercase contract refs.
rg -n "design\.md|DESIGN\.md|COMPONENT\.md|PATTERN\.md|TOKENS\.md|LAYOUTS\.md|PRIMITIVE-ZERO\.md|COMPONENTS\.md" . --glob '!node_modules/**'

# Confirm contract counts and aiHints coverage.
find components/primitives -mindepth 2 -maxdepth 2 -type f -name component.md | wc -l    # → 19
find components/composites -mindepth 2 -maxdepth 2 -type f -name component.md | wc -l    # → 26
find components/patterns   -mindepth 2 -maxdepth 2 -type f -name pattern.md   | wc -l    # → 8
grep -l "^## aiHints" components/primitives/*/component.md components/composites/*/component.md components/patterns/*/pattern.md | wc -l  # → 53

# Lint must pass (stylelint + token policy).
npm run lint
```

`npm run lint` runs Stylelint plus a RenDS token-policy check
(`scripts/lint-tokens.mjs`). Both must pass.

## Agent CLI

When the package CLI is available, agents can discover before generating:

```bash
npx ren10 manifest --json
npx ren10 build "settings form with sidebar" --json
npx ren10 component button --dense
npx ren10 docs layouts --dense
npx ren10 search "dialog workflow" --json
npx ren10 docs astro --dense
npx ren10 theme visual-reference.json --out src/styles/theme.css --json
npx ren10 design-context --write
npx ren10 detect templates/ --profile codex
npx ren10 doctor
```

## Astro Projects

Use `@ren10/astro/components/<ExportName>` direct imports. The full catalog is
at `@ren10/astro/catalog.json`; its `contract` field routes to authoritative
component documentation. Do not recreate adapters or add hydration directives
for canonical RenDS behavior. See `docs/astro.md` and `starters/astro/`.

## Relume-to-Ren10 Blocks

When converting Relume library modules into Ren10 blocks, follow this route
**in addition to** the mandatory RenDS loading order and hard rules above.
Do not skip or reorder those rules.

1. Read the approved workflow runbook at
   `docs/workflows/relume-to-ren10/README.md` (and the design at
   `docs/superpowers/specs/2026-07-12-relume-to-ren10-workflow-design.md`).
2. Run `npm run workflow:relume -- status <packet-dir>` and confirm the
   packet stage before any implementation work.
3. Refuse implementation without a valid reference brief, translation map,
   and acceptance packet under `docs/workflows/relume-to-ren10/modules/`.
4. Capture the standard render matrix via
   `npm run workflow:relume:capture` (or the matrix CLI) before visual review.
5. Keep explicit user review after the Codex visual gate; automation and
   model identities cannot accept a packet.

Family/module status lives in
`docs/workflows/relume-to-ren10/inventory.json`. Only one module may be
`in_progress` at a time. Run `npm run workflow:relume:check` to validate
every inventory entry against its packet.

## Golden Examples

Concrete, runnable UI flows live at `examples/*.html`. Read these
before producing your own output for a similar pattern. They demonstrate
correct use of layouts, tokens, ARIA, and component composition.

- `examples/auth-form.html`
- `examples/dashboard-shell.html`
- `examples/settings-form.html`
- `examples/data-table.html`
- `examples/dialog-workflow.html`
- `examples/app-sidebar.html`
- `examples/ai-panel.html`

## Eval / Self-Check

Before final response, run through `evals/checklist.md` and confirm
each item. Eval prompts (`evals/prompts.json`) are the canonical
test set for RenDS-aware agents.

## Skill Wrapper

The companion Anthropic-style skill lives at `skills/rends/SKILL.md` and is
packaged with `npm run agent:skill:pack`. It is a compact wrapper around this
file, the CLI manifest, and the colocated contracts; it must not become a
second source of truth.

<!-- RENDS:START -->
RenDS v0.13.0 · vanilla HTML/CSS/JS · Light DOM · 53 components

WORKFLOW — discover before writing UI:
1. `npx ren10 build "<idea>"` — get a composition kit for the requested UI.
2. `npx ren10 docs layouts --dense` — choose the page skeleton before custom CSS.
3. `npx ren10 component <name> --dense` — read contract, imports, aiHints, usage.
4. `npx ren10 doctor` — verify package health before shipping.

RULES:
- Vanilla only: no React/Vue/Svelte/JSX/TSX, no Tailwind, no shadcn/ui.
- Use RenDS layout primitives before custom flex/grid CSS.
- Use semantic/component tokens (`--color-*`, `--space-*`, `--ren-*`), never primitive palette tokens or hardcoded colors.
- Real elements only: button, a, input, form, dialog, table, details.
- Light DOM only; never attachShadow.

COMPONENTS: primitives=19, composites=26, patterns=8.
MORE CLI:
  manifest --json          self-describing CLI surface
  search "<query>"         search graph across components/docs/examples/tokens
  docs <topic> --dense     design, tokens, layouts, primitive-zero, components, evals
  component --list         all components grouped by layer
  knowledge query "<q>"    packaged graph query; --json emits typed JSON
<!-- RENDS:END -->
