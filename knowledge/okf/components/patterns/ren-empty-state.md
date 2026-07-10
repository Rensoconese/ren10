---
type: "RenDS Component"
title: ren-empty-state
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:pattern:ren-empty-state
sourcePath: components/patterns/ren-empty-state
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - component
  - pattern
  - ren10
  - rends
---

# ren-empty-state

Source path: `components/patterns/ren-empty-state`

## Relationships

- `exposes_selector` -> [.ren-empty-state](../../selectors/ren-empty-state.md)
- `exposes_selector` -> [.ren-empty-state-actions](../../selectors/ren-empty-state-actions.md)
- `exposes_selector` -> [.ren-empty-state-bordered](../../selectors/ren-empty-state-bordered.md)
- `exposes_selector` -> [.ren-empty-state-compact](../../selectors/ren-empty-state-compact.md)
- `exposes_selector` -> [.ren-empty-state-description](../../selectors/ren-empty-state-description.md)
- `exposes_selector` -> [.ren-empty-state-icon](../../selectors/ren-empty-state-icon.md)
- `exposes_selector` -> [.ren-empty-state-title](../../selectors/ren-empty-state-title.md)
- `has_contract` -> [ren-empty-state pattern.md](../../foundation/contract-pattern-ren-empty-state.md)
- `has_css` -> [ren-empty-state.css](../../css/ren-empty-state-css.md)
- `has_docs_page` -> [ren-empty-state docs](../../docs/ren-empty-state-docs.md)
- `uses_token` -> [--body-size](../../tokens/body-size.md)
- `uses_token` -> [--caption-size](../../tokens/caption-size.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-fill](../../tokens/color-fill.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-muted](../../tokens/color-text-muted.md)
- `uses_token` -> [--leading-normal](../../tokens/leading-normal.md)
- `uses_token` -> [--radius-full](../../tokens/radius-full.md)
- `uses_token` -> [--radius-lg](../../tokens/radius-lg.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-4](../../tokens/space-4.md)
- `uses_token` -> [--space-6](../../tokens/space-6.md)
- `uses_token` -> [--space-8](../../tokens/space-8.md)
- `uses_token` -> [--text-3xl](../../tokens/text-3xl.md)
- `uses_token` -> [--text-lg](../../tokens/text-lg.md)
- `uses_token` -> [--text-sm](../../tokens/text-sm.md)
- `uses_token` -> [--text-xl](../../tokens/text-xl.md)
- `uses_token` -> [--title-sm-size](../../tokens/title-sm-size.md)
- `uses_token` -> [--weight-semibold](../../tokens/weight-semibold.md)
- `uses_token` -> [--width-prose](../../tokens/width-prose.md)

## Structured Data

```json
{
  "kind": "pattern",
  "selectors": [
    ".ren-empty-state",
    ".ren-empty-state-actions",
    ".ren-empty-state-bordered",
    ".ren-empty-state-compact",
    ".ren-empty-state-description",
    ".ren-empty-state-icon",
    ".ren-empty-state-title"
  ],
  "tokens": [
    "--body-size",
    "--caption-size",
    "--color-border",
    "--color-fill",
    "--color-text",
    "--color-text-muted",
    "--leading-normal",
    "--radius-full",
    "--radius-lg",
    "--space-2",
    "--space-4",
    "--space-6",
    "--space-8",
    "--text-3xl",
    "--text-lg",
    "--text-sm",
    "--text-xl",
    "--title-sm-size",
    "--weight-semibold",
    "--width-prose"
  ],
  "hasScript": false,
  "hasDocsPage": true
}
```

## Source Content

# ren-empty-state Pattern Contract

Empty state pattern for no-data, first-run, and recovery surfaces.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-empty-state` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-empty-state` pattern.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Empty State pattern behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this pattern.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "A data container (ren-table, list, ren-card, search result) renders zero items and needs a no-data surface."
    - "A first-run experience needs an icon + title + description + primary action (e.g. \"Add your first product\")."
    - "A search / filter result is empty and the surface should explain how to recover (.ren-empty-state-compact)."
    - "An error / recovery state needs the same centered layout as zero-data (e.g. \"Nothing here yet\")."
    - "You want a dashed-bordered placeholder inside a card or table body (.ren-empty-state-bordered)."
  avoidWhen:
    - "The UI is loading data (still pending) — use ren-skeleton, not an empty state."
    - "The page is a real 404 / 500 error route — use the error-page template, not this inline component."
    - "The container is full but a row is unselected — that is a selection-prompt, not an empty state."
    - "You need a toast / inline alert about a failed action — use ren-alert / ren-toast."

canonicalImports:
  css:
    - "rends/components/patterns/ren-empty-state/ren-empty-state.css"
  notes:
    - "CSS-only pattern. No JS — actions inside .ren-empty-state-actions are real <button> / ren-button elements wired by the consumer."
    - "Drop directly into <tbody>, <ul>, or any container — it centers itself with max-width: 28rem and auto inline margins."

requiredMarkup:
  - "Root is <div class=\"ren-empty-state\"> (or a <section> for a landmark)."
  - "Use an .ren-empty-state-icon block for the glyph/illustration; mark decorative icons aria-hidden=\"true\"."
  - "Heading is an <h2> / <h3> with class .ren-empty-state-title — never put plain text without a heading element."
  - "Description text is a <p class=\"ren-empty-state-description\">; keep within the 28rem prose width by not overriding the max-width."
  - "Actions live in <div class=\"ren-empty-state-actions\"> and should be real <button class=\"ren-btn\"> or <a class=\"ren-btn\"> — not links styled as buttons via <span>."

forbiddenPatterns:
  - "Using .ren-empty-state as a generic centered hero — it is reserved for no-data / zero-state surfaces."
  - "Combining .ren-empty-state-compact with .ren-empty-state-bordered when the container is already a bordered card (double border)."
  - "Decorative icon as the only message — always include .ren-empty-state-title so screen readers understand the state."
  - "Hardcoding padding / max-width via inline style — override --ren-empty-padding / --ren-empty-max-width instead."
  - "Embedding form fields directly inside .ren-empty-state — pair with ren-form / ren-button actions only."

tokenPolicy:
  allowed:
    - "Public component tokens listed in Public Token API: --ren-empty-padding, --ren-empty-gap, --ren-empty-icon-size, --ren-empty-title-size, --ren-empty-desc-color, --ren-empty-max-width."
    - "Semantic tokens consumed by selectors: --color-text, --color-text-muted, --color-fill, --color-border."
    - "Layout / type tokens: --space-*, --radius-full, --radius-lg, --width-prose, --text-xl, --text-3xl, --body-size, --caption-size, --weight-semibold, --leading-normal."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) for the icon background or borders."
    - "Hardcoded hex / named colors for text, fill, or border."
    - "Custom widths / margins that bypass --ren-empty-max-width; the component is meant to self-center."

accessibility:
  required:
    - "Title is a real heading element (<h2> / <h3>) so the empty state appears in the document outline."
    - "Decorative icons / emoji use aria-hidden=\"true\"; meaningful illustrations need alt text or aria-label."
    - "Primary action is a real <button> or <a> with keyboard activation and a 44px touch target (inherited from .ren-btn)."
    - "Do not communicate the empty state through icon color alone — the title text must remain the source of truth."
    - "If the empty state is announced after an async load, wrap it in role=\"status\" or aria-live=\"polite\" so screen readers learn the new state."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/patterns/ren-empty-state/ren-empty-state.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-empty-state">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-empty-state`
- `.ren-empty-state-actions`
- `.ren-empty-state-bordered`
- `.ren-empty-state-compact`
- `.ren-empty-state-description`
- `.ren-empty-state-icon`
- `.ren-empty-state-title`

## States And Attributes

- `None detected in the colocated CSS/JS. Check related files before inventing one.`

## Public Token API

- `--ren-empty-desc-color`
- `--ren-empty-gap`
- `--ren-empty-icon-size`
- `--ren-empty-max-width`
- `--ren-empty-padding`
- `--ren-empty-title-size`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/patterns/ren-empty-state/ren-empty-state.css`
- `docs/components/ren-empty-state.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/* ============================================
   RenDS — Empty State Pattern
   ============================================
   Reusable pattern for empty/no-data states.
   CSS-only. No JS needed.

   Use inside any data container (table, list,
   card) when there's nothing to display.

   Inspired by Polaris: every data component
   should have a documented empty state.

   Usage:
     <div class="ren-empty-state">
       <div class="ren-empty-state-icon">📦</div>
       <h3 class="ren-empty-state-title">No products yet</h3>
       <p class="ren-empty-state-description">
         Add your first product to get started.
       </p>
       <div class="ren-empty-state-actions">
         <button class="ren-btn">Add product</button>
       </div>
     </div>

   Compact (inline):
     <div class="ren-empty-state ren-empty-state-compact">
       <p class="ren-empty-state-description">No results found.</p>
     </div>
   ============================================ */

.ren-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-8) var(--space-4);
  max-width: 28rem;
  margin-inline: auto;
}

/* ─── Icon / Illustration ─── */
.ren-empty-state-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  font-size: var(--text-3xl);
  color: var(--color-text-muted);
  background-color: var(--color-fill);
  border-radius: var(--radius-full);
  margin-bottom: var(--space-4);
}

/* ─── Title ─── */
.ren-empty-state-title {
  font-size: var(--title-sm-size, var(--text-lg));
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

/* ─── Description ─── */
.ren-empty-state-description {
  font-size: var(--body-size);
  color: var(--color-text-muted);
  line-height: var(--leading-normal);
  margin-bottom: var(--space-4);
  max-width: var(--width-prose);
}

.ren-empty-state-description:last-child {
  margin-bottom: 0;
}

/* ─── Actions ─── */
.ren-empty-state-actions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  justify-content: center;
}

/* ─── Compact variant (for inline empty states) ─── */
.ren-empty-state-compact {
  padding: var(--space-6) var(--space-4);
}

.ren-empty-state-compact .ren-empty-state-icon {
  width: 2.5rem;
  height: 2.5rem;
  font-size: var(--text-xl);
  margin-bottom: var(--space-2);
}

.ren-empty-state-compact .ren-empty-state-title {
  font-size: var(--body-size);
}

.ren-empty-state-compact .ren-empty-state-description {
  font-size: var(--caption-size, var(--text-sm));
}

/* ─── Bordered variant (for use inside cards/tables) ─── */
.ren-empty-state-bordered {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  margin: var(--space-4);
}
