---
type: "RenDS Contract"
title: "ren-accordion component.md"
description: "RenDS Contract generated from the RenDS knowledge graph."
id: contract:composite:ren-accordion
sourcePath: components/composites/ren-accordion/component.md
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - contract
  - ren10
  - rends
---

# ren-accordion component.md

Source path: `components/composites/ren-accordion/component.md`

## Relationships

_No outgoing relationships._

## Structured Data

```json
{
  "kind": "composite"
}
```

## Source Content

# ren-accordion Component Contract

Disclosure group for vertically stacked expandable sections.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-accordion` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-accordion` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Accordion composite behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this composite.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "You need a vertically stacked group of disclosure sections sharing chrome."
    - "Exclusive (single open) behavior is required, optionally with collapsible=all-closed."
    - "Multiple sections may be open simultaneously (type=\"multiple\")."
    - "You want native <details>/<summary> semantics with smooth height animation."
    - "Initial open items must be declarable via default-value=\"0,2\"."
  avoidWhen:
    - "Only one disclosure is needed — use ren-collapsible instead."
    - "Sections should not share chrome / divider lines — use isolated ren-collapsible items."
    - "The disclosure is a navigation menu — use ren-menu or ren-sidebar."
    - "Content swaps in place without expanding — use ren-tabs."

canonicalImports:
  css:
    - "rends/components/composites/ren-accordion/ren-accordion.css"
  js:
    - "rends/components/composites/ren-accordion/ren-accordion.js"
  notes:
    - "If the page already imports rends/components/index.css, do not import the CSS again."
    - "JS adds exclusive mode, default-value parsing, and the ren-accordion-change event; native <details> handles open/close without JS."

requiredMarkup:
  - "<ren-accordion> wraps real <details> elements; each <details> holds a <summary class=\"ren-accordion-trigger\"> and a <div class=\"ren-accordion-content\">."
  - "Do not replace <details>/<summary> with <button>+<div> — exclusive mode relies on native [name] grouping."
  - "Use type=\"single\" (default) or type=\"multiple\"; add collapsible only when single mode must allow all closed."
  - "Set default-value=\"0,1\" (comma-separated indices) to declare initial open items."
  - "Use .ren-accordion-bordered or .ren-accordion-flush on the host for variants; do not invent new variant classes."

forbiddenPatterns:
  - "<div role=\"button\"> styled as a summary instead of a real <summary> / <button>."
  - "Manual height animation with hardcoded max-height: 500px in inline styles — rely on the component's ::details-content transition."
  - "Hardcoded chevron icons inside the summary; the ::after pseudo-element already renders one."
  - "Toggling open state via display: none on .ren-accordion-content instead of the <details>[open] attribute."
  - "Overriding focus ring with outline: none on .ren-accordion-trigger without restoring :focus-visible."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-collapse-bg, --ren-collapse-border, --ren-collapse-duration, --ren-collapse-easing, --ren-collapse-padding, --ren-collapse-radius, --ren-collapse-trigger-font, --ren-collapse-trigger-weight."
    - "Semantic tokens: --color-border, --color-text, --color-text-muted, --color-fill, --color-fill-active, --color-accent."
    - "Layout / motion tokens: --space-*, --size-*, --radius-*, --duration-enter, --ease-enter, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors in consumer overrides."
    - "Raw transition durations; use --duration-enter / --ease-enter or --ren-collapse-duration / --ren-collapse-easing."

accessibility:
  required:
    - "Use real <details>/<summary> so the browser exposes the native disclosure pattern to AT."
    - "Keep the chevron decorative (::after pseudo); never put text inside it that an AT must announce."
    - "Touch target on .ren-accordion-trigger is min-height: var(--size-lg); do not shrink below 44px on touch surfaces."
    - "Visible :focus-visible outline (2px solid --color-accent) must be preserved on the summary."
    - "Disabled triggers must set aria-disabled=\"true\" and not toggle on activation."
    - "Animations respect prefers-reduced-motion (transitions are removed under reduce)."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-accordion/ren-accordion.css">
<script type="module" src="rends/components/composites/ren-accordion/ren-accordion.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-accordion">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-accordion`
- `.ren-accordion-bordered`
- `.ren-accordion-content`
- `.ren-accordion-flush`
- `.ren-accordion-item`
- `.ren-accordion-trigger`

## States And Attributes

- `[aria-disabled]`
- `[aria-expanded]`
- `:active`
- `:disabled`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-collapse-bg`
- `--ren-collapse-border`
- `--ren-collapse-duration`
- `--ren-collapse-easing`
- `--ren-collapse-padding`
- `--ren-collapse-radius`
- `--ren-collapse-trigger-font`
- `--ren-collapse-trigger-weight`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-accordion/ren-accordion.css`
- `components/composites/ren-accordion/ren-accordion.js`
- `docs/components/ren-accordion.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
