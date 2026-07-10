---
type: "RenDS Contract"
title: "ren-command pattern.md"
description: "RenDS Contract generated from the RenDS knowledge graph."
id: contract:pattern:ren-command
sourcePath: components/patterns/ren-command/pattern.md
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - contract
  - ren10
  - rends
---

# ren-command pattern.md

Source path: `components/patterns/ren-command/pattern.md`

## Relationships

_No outgoing relationships._

## Structured Data

```json
{
  "kind": "pattern"
}
```

## Source Content

# ren-command Pattern Contract

Command palette pattern for searchable application actions.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-command` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-command` pattern.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Command pattern behavior or visual role.
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
    - "The product needs a Ctrl/Cmd+K command palette / Spotlight-style action launcher."
    - "Actions are searchable by title, description, or data-keywords, with keyboard up/down navigation and Enter to activate."
    - "Items are grouped (e.g. \"Navigation\", \"Settings\") via .ren-command-group with .ren-command-group-heading."
    - "You want a global keyboard shortcut (data-shortcut=\"ctrl+k\") that opens the palette from anywhere on the page."
    - "You need a modal overlay with backdrop + Escape-to-close dismissal driven by a real <dialog>."
  avoidWhen:
    - "The list is a navigation menu — use ren-nav or ren-menubar."
    - "The list is a static dropdown of options — use ren-menu / ren-select."
    - "The list is a filter for a data table — use ren-table-toolbar-search inside ren-table."
    - "There is no search input (just a static action list) — use ren-menu."

canonicalImports:
  css:
    - "rends/components/patterns/ren-command/ren-command.css"
  js:
    - "rends/components/patterns/ren-command/ren-command.js"
  notes:
    - "JS registers customElements.define('ren-command', ...) and owns the global shortcut listener, filtering, roving highlight, and ren-command-select event."
    - "The pattern is dialog-based; the underlying <dialog> must be present so showModal() / close() work."

requiredMarkup:
  - "Use a <ren-command> custom element wrapping a real <dialog class=\"ren-command\"> (the JS calls dialog.showModal())."
  - "Inside, include a .ren-command-input-wrapper with a <input class=\"ren-command-input\" type=\"text\"> and an optional .ren-command-kbd hint."
  - "Wrap action rows in <ul class=\"ren-command-list\"> (or container) of <button class=\"ren-command-item\"> rows; items may carry data-keywords, data-value, data-action."
  - "Group rows under <div class=\"ren-command-group\"><div class=\"ren-command-group-heading\">…</div>…</div>; the JS toggles [data-empty] on empty groups."
  - "Provide a .ren-command-empty fallback element; the JS shows it when the filter produces zero matches."
  - "Each .ren-command-item that has a shortcut puts the keys inside .ren-command-item-shortcut with <kbd> elements."

forbiddenPatterns:
  - "Implementing as a <div> with click handlers — must be <ren-command> + <dialog> so Escape, focus, and a11y come from the platform."
  - "Filtering items via display: none from external code — the component owns visibility via _filterItems()."
  - "Building roving focus / highlight manually — the [data-highlighted] attribute is set by the component on the active item."
  - "Binding a second Ctrl+K listener at the document level — use the data-shortcut attribute or registerAction() API."
  - "Submitting selection from a custom click handler that bypasses the ren-command-select event."

tokenPolicy:
  allowed:
    - "Public component tokens listed in Public Token API: --ren-command-bg, --ren-command-border, --ren-command-item-height, --ren-command-item-radius, --ren-command-max-height, --ren-command-radius, --ren-command-shadow, --ren-command-width."
    - "Semantic surface / text tokens consumed by selectors: --ren-surface, --ren-border, --ren-text, --ren-text-muted, --ren-text-faint, --ren-fill, --ren-fill-hover, --ren-separator."
    - "Spacing / motion tokens: --ren-space-*, --ren-radius-*, --duration-enter, --duration-overlay, --duration-state, --ease-enter, --ease-state-change."
    - "Z-index token: --ren-z-modal."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer overrides."
    - "Hardcoded hex / named colors for surface, border, fill, or text."
    - "Custom z-index values that bypass --ren-z-modal (the palette must layer above content but below toasts)."

accessibility:
  required:
    - "Render as a real <dialog> so focus trap, Escape, and inert background come from the browser."
    - "The input is a real <input type=\"text\"> with an accessible name (label or aria-label like \"Search commands\")."
    - "The component injects a [role=\"status\"][aria-live=\"polite\"] region announcing result counts on every filter — do not remove it."
    - "Items must be real <button> elements (or role=\"option\" rows) so Enter / Space / click all work uniformly."
    - "Disabled items use aria-disabled=\"true\" AND pointer-events: none (the CSS handles the latter)."
    - "The shortcut hint inside .ren-command-kbd is decorative; do not rely on it as the only affordance — Escape and click-outside must both close."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/patterns/ren-command/ren-command.css">
<script type="module" src="rends/components/patterns/ren-command/ren-command.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-command">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-command`
- `.ren-command-empty`
- `.ren-command-footer`
- `.ren-command-footer-hint`
- `.ren-command-group`
- `.ren-command-group-heading`
- `.ren-command-input`
- `.ren-command-input-wrapper`
- `.ren-command-item`
- `.ren-command-item-content`
- `.ren-command-item-description`
- `.ren-command-item-icon`
- `.ren-command-item-shortcut`
- `.ren-command-item-title`
- `.ren-command-kbd`
- `.ren-command-list`
- `.ren-command-separator`

## States And Attributes

- `[aria-disabled]`
- `[aria-live]`
- `[data-empty]`
- `[data-highlighted]`
- `:active`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-command-bg`
- `--ren-command-border`
- `--ren-command-item-height`
- `--ren-command-item-radius`
- `--ren-command-max-height`
- `--ren-command-radius`
- `--ren-command-shadow`
- `--ren-command-width`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/patterns/ren-command/ren-command.css`
- `components/patterns/ren-command/ren-command.js`
- `docs/components/ren-command.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
