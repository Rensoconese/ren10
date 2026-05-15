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

- **Vanilla only.** RenDS targets vanilla HTML, CSS, and JavaScript with
  optional custom elements. Do not output React, Vue, Svelte, JSX, TSX,
  shadcn/ui, Tailwind utility classes, or any framework abstraction.
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

The companion Anthropic skill (`rends-skill/SKILL.md` in the parent
workspace, distributable as a tarball) is what external agents load
when they detect RenDS in a project. It must keep the same loading
order as this file. Updates to the loading order belong in **both**
places.
