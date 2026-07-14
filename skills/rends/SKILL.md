---
name: rends
description: >
  Use this skill when building, editing, reviewing, or auditing UI with RenDS
  / ren10: vanilla HTML, CSS, JavaScript, design tokens, ren-* classes,
  RenDS components, layout primitives, accessibility contracts, or a project
  that contains a rends/ directory or package.json dependency on ren10.
---

# RenDS Agent Skill

RenDS is the vanilla, accessible design system shipped as the `ren10` npm
package. This skill is a routing wrapper. It is not the design system
documentation and must not become a second source of truth.

## First Move

When the `ren10` CLI is available, discover before generating:

```bash
npx ren10 manifest --json
npx ren10 build "<user intent>" --json
npx ren10 component <name> --dense
npx ren10 docs layouts --dense
npx ren10 doctor
```

Use `npx ren10 search "<query>" --json` when the right component, example,
selector, or token is unclear.

## Source Precedence

Treat the installed `ren10` package, its CLI output, and the canonical GitHub
source declared in `sources.json` as authoritative. Do not learn public APIs
from `_archive/`, the legacy `rends-skill/` workspace copy, root phase/status
notes, screenshots, or Figma frames. Visual references can guide composition
and density, but selectors, attributes, events, tokens, and imports must be
verified against package contracts or CLI output.

If a requested component cannot be verified, run
`npx ren10 search "<intent>" --json`. Compose it from returned contracts or
report the capability gap; never invent a `ren-*` selector or custom element.

## Mandatory Loading Order

For any task that builds, edits, or reviews UI with RenDS:

1. Load `rends/ren-design.md` first.
2. Load `rends/tokens/tokens.md` before choosing color, spacing, type,
   motion, radius, shadow, or theme values.
3. Load `rends/base/layouts.md` before writing layout CSS.
4. Load `rends/base/primitive-zero.md` when using native/classless HTML.
5. Load `rends/components/components.md` when choosing a component.
6. Load the colocated contract for every RenDS part used:
   `rends/components/primitives/<name>/component.md`,
   `rends/components/composites/<name>/component.md`, or
   `rends/components/patterns/<name>/pattern.md`.

Selectors, attributes, states, imports, token APIs, accessibility rules, and
`aiHints` live in the colocated contracts. Never invent RenDS APIs from memory
or from this skill.

## Hard Rules

- Vanilla only: no React, Vue, Svelte, JSX, TSX, Tailwind, shadcn/ui, or
  framework abstractions.
- Use RenDS layout primitives before custom `display: flex` or
  `display: grid`.
- Use semantic tokens (`--color-*`, `--space-*`, etc.) or component tokens
  (`--ren-*`). Do not use primitive palette tokens or hardcoded colors in
  component/consumer CSS.
- Render real semantic elements: `<button>`, `<a>`, `<input>`, `<form>`,
  `<dialog>`, `<table>`, `<details>`.
- Light DOM only. Do not use `attachShadow`.
- Accessibility is required: visible `:focus-visible`, accessible names,
  keyboard support, reduced-motion respect, and WCAG 2.1 AA baseline.
- Read each component's `aiHints` before selecting or composing it.

## Useful Commands

```bash
npx ren10 component --list
npx ren10 component button --dense
npx ren10 docs tokens --dense
npx ren10 docs primitive-zero --dense
npx ren10 search "dialog workflow" --json
npx ren10 build "settings form with sidebar" --json
npx ren10 knowledge query "ren-toast status" --json
npx ren10 doctor
```

## Validation

Before reporting completion from a RenDS task, run the repository checklist
that applies to the work. From the `rends/` package root:

```bash
npm run lint
npm run agent:check
```

For UI changes with runtime behavior, also run the relevant Playwright suites
or the full `npm test` when the blast radius warrants it.

The packaged v0 adapter is declared in `v0.json`. Its vanilla starter under
`assets/starter/` is a reviewed baseline, not a second API source. Preserve its
framework-free stack and re-run `npx ren10 doctor` after updating the skill or
adopting a new package version.

For migrations, inspect the installed `package.json`, `CHANGELOG.md`, and
`MIGRATION.md`, preview copied-component changes with
`npx ren10 upgrade --dry-run`, and validate the result before applying it to an
existing application.

## Source Of Truth

- Package source: `rends/`
- Root routing index: `rends/AGENTS.md`
- CLI manifest: `npx ren10 manifest --json`
- Agent-ready roadmap: `rends/docs/agent-ready-roadmap.md`
- Evals/self-check: `rends/evals/`

This skill should stay compact. If a rule needs details, point to the CLI or
the authoritative contract file instead of duplicating the rule here.
