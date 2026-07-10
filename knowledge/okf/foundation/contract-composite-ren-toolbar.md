---
type: "RenDS Contract"
title: "ren-toolbar component.md"
description: "RenDS Contract generated from the RenDS knowledge graph."
id: contract:composite:ren-toolbar
sourcePath: components/composites/ren-toolbar/component.md
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - contract
  - ren10
  - rends
---

# ren-toolbar component.md

Source path: `components/composites/ren-toolbar/component.md`

## Relationships

_No outgoing relationships._

## Structured Data

```json
{
  "kind": "composite"
}
```

## Source Content

# ren-toolbar Component Contract

Grouped command bar with roving keyboard navigation.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-toolbar` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-toolbar` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Toolbar composite behavior or visual role.
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
    - "You need a grouped command bar (formatting actions, edit operations, view controls) co-located near content."
    - "You need the WAI-ARIA Toolbar pattern: Arrow keys move between items, Tab moves focus in / out of the toolbar."
    - "You need Home / End to jump to first / last item and skip disabled ones."
    - "Some items are toggleable (aria-pressed / [data-active] for sticky on-states like Bold)."
    - "You need a visual separator (.ren-toolbar-separator) to group related commands within the bar."
    - "You need icon-only items via .ren-toolbar-item-icon (aspect-ratio 1) or a ghost variant (.ren-toolbar-ghost)."
  avoidWhen:
    - "Items represent value selection rather than commands — use ren-toggle-group."
    - "Items represent navigation to other pages — use ren-nav or ren-sidebar."
    - "You need to switch between content panels — use ren-tabs."
    - "There is only one action — use ren-button directly."

canonicalImports:
  css:
    - "rends/components/composites/ren-toolbar/ren-toolbar.css"
  js:
    - "rends/components/composites/ren-toolbar/ren-toolbar.js"
  notes:
    - "JS is required for the roving tabindex pattern: import initToolbar / initAllToolbars from ren-toolbar.js."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "The host is <div class=\"ren-toolbar\" role=\"toolbar\" aria-label=\"<purpose>\">; the role and an aria-label are required so AT can announce it."
  - "Items are real <button class=\"ren-toolbar-item\"> with tabindex=\"0\" on the first item and tabindex=\"-1\" on the rest (roving tabindex)."
  - "Separators are <div class=\"ren-toolbar-separator\" role=\"separator\"> between logical groups within the toolbar."
  - "Sticky toggle items reflect state via aria-pressed=\"true|false\" or [data-active]; do not mix the two on the same item."
  - "Use .ren-toolbar-vertical on the host to switch arrow keys to Up/Down and turn separators horizontal."

forbiddenPatterns:
  - "Omitting role=\"toolbar\" or aria-label on the host — initToolbar bails out and the keyboard pattern will not attach."
  - "Setting tabindex=\"0\" on every item — only the focused item should be tabindex=\"0\"; the JS rewrites the rest to -1."
  - "Using <a href> as items — toolbar items invoke commands, not navigate; use ren-nav for links."
  - "Hardcoded gap / padding in inline styles; use --space-1 via the documented selectors."
  - "Mounting toolbar buttons as .ren-btn — toolbar owns its own item chrome; mixing the two doubles the focus rings and padding."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-toolbar-active-bg, --ren-toolbar-bg, --ren-toolbar-border, --ren-toolbar-height, --ren-toolbar-item-hover, --ren-toolbar-item-radius, --ren-toolbar-item-size, --ren-toolbar-padding, --ren-toolbar-radius."
    - "Semantic tokens: --color-text, --color-accent, --color-border, --color-fill-hover, --color-fill-active, --color-surface, --color-surface-raised, --color-surface-sunken, --color-disabled-text, --color-focus-ring."
    - "Shape / motion tokens: --radius-sm, --radius-md, --space-1, --space-2, --size-sm, --stroke-1, --ring-width, --shadow-xs, --transition-tactile, --weight-medium, --caption-size, --text-sm."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / rgb / named color values in overrides for the pressed-state background or active accent color."
    - "Hardcoded transition durations on item hover; route through --transition-tactile."

accessibility:
  required:
    - "Host carries role=\"toolbar\" plus an aria-label describing its purpose (e.g. \"Formatting\")."
    - "Roving tabindex: only one .ren-toolbar-item is tabindex=\"0\" at any time; Tab enters/exits the toolbar instead of cycling items."
    - "Arrow Left/Right (horizontal) or Up/Down (.ren-toolbar-vertical) moves focus; Home / End jump to first / last; disabled items are skipped."
    - "Toggle items expose aria-pressed and a visible non-color cue (box-shadow + accent color) in addition to background fill."
    - "Focus-visible ring is var(--ring-width) solid var(--color-focus-ring) with outline-offset: -1px; preserve it across variants."
    - "Disabled items use :disabled or aria-disabled=\"true\"; both block keyboard activation and are filtered out of the focus rotation."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-toolbar/ren-toolbar.css">
<script type="module" src="rends/components/composites/ren-toolbar/ren-toolbar.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-toolbar">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-toolbar`
- `.ren-toolbar-ghost`
- `.ren-toolbar-item`
- `.ren-toolbar-item-icon`
- `.ren-toolbar-separator`
- `.ren-toolbar-vertical`

## States And Attributes

- `[aria-disabled]`
- `[aria-pressed]`
- `[data-active]`
- `:active`
- `:disabled`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-toolbar-active-bg`
- `--ren-toolbar-bg`
- `--ren-toolbar-border`
- `--ren-toolbar-height`
- `--ren-toolbar-item-hover`
- `--ren-toolbar-item-radius`
- `--ren-toolbar-item-size`
- `--ren-toolbar-padding`
- `--ren-toolbar-radius`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-toolbar/ren-toolbar.css`
- `components/composites/ren-toolbar/ren-toolbar.js`
- `docs/components/ren-toolbar.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
