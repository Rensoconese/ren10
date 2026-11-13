# RenDS essentials · v0.14.1

The compact entry contract for agents. Read this first for any RenDS / ren10
UI task, then load detail only when the task needs it. `ren-design.md` stays
the canonical source (exact token values, rationale, component registry); this
file routes to it and to the colocated contracts. CLI: `npx ren10 docs design --dense`
prints this file. `npm run design:check` fails when a token, class, command,
path, count, or the version named here drifts from the package.

## What RenDS is

A vanilla, accessible, atomic design system shipped as the `ren10` npm
package: one cascade-layered stylesheet (`index.css`), CSS custom properties,
and optional custom elements that enhance real HTML in the Light DOM. WCAG 2.1
AA is the floor. 53 components (19 primitives, 26 composites, 8 patterns)
plus 335 ready-made page-section blocks.

## Hard rules

1. Vanilla output only: HTML, CSS, JavaScript, optional `ren-*` custom
   elements. No React, Vue, Svelte, JSX/TSX, Tailwind, shadcn/ui. `.astro`
   files are allowed only through `@ren10/astro` direct imports.
2. Layout primitives before custom CSS: no bespoke `display: flex` / `grid`
   when a `ren-*` layout class covers it.
3. Tokens, not literals: semantic (`--color-*`, `--space-*`, `--text-*`) or
   component (`--ren-*`) tokens. Never primitive palette tokens (`--blue-*`,
   `--gray-*`, `--red-*`...) and never hardcoded hex or colored rgba.
4. Real elements: `<button>`, `<a>`, `<input>`, `<form>`, `<dialog>`,
   `<table>`, `<details>`. Never a styled `<div>` standing in for one.
5. Accessibility: visible `:focus-visible`, an accessible name on every
   control, full keyboard support, 44px touch targets, `prefers-reduced-motion`
   respected.
6. Light DOM only: never `attachShadow`.
7. Never invent a selector, attribute, event, or token. Verify it in the
   colocated contract or with the CLI first.
8. Agent safety: the button that confirms a delete, payment, send or publish
   carries `data-agent-confirm="<what it does>"`; fields an agent may fill but
   not read take `data-agent-secret`; one-time secrets take
   `data-agent-hidden`. See `docs/agent-safety.md`.

## Load on demand

| Need | Command | File |
|---|---|---|
| Plan a page or feature | `npx ren10 build "<idea>" --json` | — |
| Find anything | `npx ren10 search "<query>" --json` | `knowledge/ren10-graph.json` |
| Page-section blocks | `npx ren10 blocks --list` | `templates/blocks/catalog.json` |
| One block's markup | `npx ren10 blocks <name>` | `templates/blocks/<name>.html` |
| Token values and rules | `npx ren10 docs tokens --dense` | `tokens/tokens.md` |
| Layout primitives | `npx ren10 docs layouts --dense` | `base/layouts.md` |
| Native HTML styling | `npx ren10 docs primitive-zero --dense` | `base/primitive-zero.md` |
| Pick a component | `npx ren10 component --list` | `components/components.md` |
| Use a component | `npx ren10 component <name> --dense` | `components/<layer>/ren-<name>/component.md` |
| Rationale, exact values | `npx ren10 docs design` | `ren-design.md` |
| CLI surface | `npx ren10 manifest --json` | — |

Patterns use `pattern.md` instead of `component.md`. Every contract carries an
`aiHints` YAML block (`selectionCriteria`, `canonicalImports`,
`requiredMarkup`, `forbiddenPatterns`, `tokenPolicy`, `accessibility`): read it
before choosing between two parts.

## Tokens

Three layers. Components and consumer CSS read layers 2 and 3 only.

1. Primitive (raw scale): `--blue-500`, `--space-4`, `--radius-md`.
   Exists so semantic tokens can point at it.
2. Semantic (intent): what you reach for every day.
3. Component (`--ren-*`): public override points such as `--ren-btn-bg`,
   `--ren-card-radius`, `--ren-dialog-width`.

Reach for these first:

| Purpose | Tokens |
|---|---|
| Text | `--color-text`, `--color-text-muted` (never `--color-text-faint` for content) |
| Surfaces | `--color-surface`, `--color-surface-raised`, `--color-surface-contrast` |
| Accent | `--color-accent`, `--color-accent-hover`, `--color-on-accent` (only on accent fills), `--color-accent-strong` (accent text) |
| Status | `--color-danger`, `--color-success`, `--color-warning`, `--color-danger-strong` |
| Borders | `--color-border`, `--color-border-interactive` (3:1 for controls) |
| Spacing | `--space-1` … `--space-8`, `--space-card-padding`, `--space-section`, `--space-section-sm`, `--space-section-lg` |
| Type | `--font-sans`, `--font-heading`, `--text-sm`, `--text-base`, `--text-lg`, `--text-2xl`, `--text-4xl`, `--weight-bold`, `--leading-tight` |
| Shape, depth | `--radius-md`, `--radius-lg`, `--radius-full`, `--shadow-sm`, `--shadow-md`, `--shadow-lg` |
| Motion | `--duration-fast`, `--duration-normal`, `--ease-out` (collapse under reduced motion) |
| Width | `--width-prose` |

Theme with attributes on `<html>`: `data-theme` (named theme),
`data-mode="light|dark|auto"`, `data-density="compact|comfortable|spacious"`,
and `data-shape` (needs `themes/appearance.css`). Color modes come from `light-dark()` in the semantic layer: no
`.dark` patches.

## Layout primitives

Pick the page skeleton before components. All ship in `index.css`.

| Need | Class |
|---|---|
| Vertical flow | `ren-stack` (+ `ren-stack-sm`, `ren-stack-lg`) |
| Wrapping inline group | `ren-cluster` |
| Row / left-right spread | `ren-row`, `ren-row-spread` |
| Centered column | `ren-center`, `ren-center-narrow`, `ren-center-wide`, `ren-center-prose` |
| Card rows | `ren-grid` + `ren-grid-2` / `ren-grid-3` / `ren-grid-4`, `ren-auto-grid` |
| Sidebar + content | `ren-with-sidebar`, `ren-sidebar-grid` |
| Full-height centered hero | `ren-cover` |
| Page with breakouts | `ren-page-grid`, `ren-prose-grid` |
| Media ratio | `ren-frame`, `ren-frame-photo` |
| Direction switch, scroller | `ren-switcher`, `ren-reel` |

Prefer `gap` on the parent over child margins. The grid system
(`ren-col-grid`, `ren-bento`, `ren-card-grid`...) is in `base/layouts.md`.

## Component, composite, pattern, block, or example?

Smallest thing that solves the task wins; compose upward.

- **Primitive** (atomic UI, no JS required): avatar, badge, banner,
  breadcrumb, button, card, checkbox, field, icon, kbd, link, pagination,
  progress, radio, separator, skeleton, spinner, switch, tag.
- **Composite** (JS enhancement, ARIA wiring, focus management): accordion,
  alert-dialog, calendar, carousel, collapsible, color-picker, combobox,
  context-menu, date-picker, date-range-picker, dialog, dropzone, hover-card,
  menu, number-field, otp, popover, scroll-area, select, sheet, slider, tabs,
  toast, toggle-group, toolbar, tooltip.
- **Pattern** (page-level structure or workflow): ai, command, empty-state,
  form, menubar, nav, sidebar, table.
- **Block**: a finished page section that composes the above. Use one before
  hand-building a navbar, hero, pricing table, FAQ, or footer.
  Families: nav (29), hero (30), feature (120), testimonial (12),
  pricing (12), faq (12), cta (60), contact (12), blog (12),
  article-header (12), footer (12), application-shell (12).
- **Example**: a complete, copy-correct flow in `examples/*.html` (auth
  form, dashboard shell, settings form, data table, dialog workflow, app
  sidebar, AI panel). Read the closest one before building a similar screen.

## Using a block

`npx ren10 blocks <name>` prints the markup (the element marked
`.bb-detail-preview` plus any companion such as a `<ren-sheet>`), then the
stylesheets to link in order, module scripts, inline `<style>` / `<script>`
to copy, and the components it uses. Replace demo copy and media
(`templates/blocks/media/`) with real content; keep the landmarks, headings
and labels. Stack sections in page order: nav, hero, feature, testimonial,
pricing, faq, cta, contact, footer.

## Imports

```html
<link rel="stylesheet" href="node_modules/ren10/index.css">
<script type="module" src="node_modules/ren10/components/composites/ren-dialog/ren-dialog.js"></script>
```

`index.css` carries tokens, base, layouts and every component's CSS. Add each
composite or pattern script you use as a module. Lighter pages can import
`foundation.css` plus the component stylesheets listed in each contract.

## Before you finish

```bash
npx ren10 detect <files> --profile codex
npx ren10 doctor
```

Self-check against `evals/checklist.md`: semantic landmarks and one `<h1>`,
labelled controls, visible focus, no primitive tokens or hex, no horizontal
overflow at 390px, reduced motion respected.
