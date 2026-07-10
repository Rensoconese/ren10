---
type: "RenDS Contract"
title: "ren-kbd component.md"
description: "RenDS Contract generated from the RenDS knowledge graph."
id: contract:primitive:ren-kbd
sourcePath: components/primitives/ren-kbd/component.md
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - contract
  - ren10
  - rends
---

# ren-kbd component.md

Source path: `components/primitives/ren-kbd/component.md`

## Relationships

_No outgoing relationships._

## Structured Data

```json
{
  "kind": "primitive"
}
```

## Source Content

# ren-kbd Component Contract

Keyboard key / shortcut primitive for documentation and command hints.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-kbd` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-kbd` primitive.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Kbd primitive behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this primitive.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "You need to display a single keyboard key (⌘, K, Esc, Enter) in documentation or command hints."
    - "You need to render a keyboard combo (⌘ + K) where each key is a chip with native <kbd> semantics."
    - "You want monospaced, chip-styled tokens with a sunken background and bottom-shadow border."
    - "You need an inline label inside menu items, tooltips, or docs showing the shortcut for an action."
  avoidWhen:
    - "The element is a status pill or category label — use ren-badge or ren-tag."
    - "The element is a clickable shortcut trigger — use ren-button and place a <kbd> inside its label."
    - "You need block-level code samples — use <pre><code> or a code-block component, not <kbd>."

canonicalImports:
  css:
    - "rends/components/primitives/ren-kbd/ren-kbd.css"
  notes:
    - "CSS-only primitive; no JavaScript file exists for ren-kbd."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Always use a real <kbd> element with class=\"ren-kbd\"; never style a <span> or <code> as a kbd chip."
  - "Each key in a combo is its own <kbd class=\"ren-kbd\">; the joiner (+) lives between them as plain text."
  - "Inside running prose, place the <kbd> inline (it is display: inline-flex with no forced line break)."
  - "Use white-space: nowrap behavior built in — do not wrap the key glyph across lines via extra markup."

forbiddenPatterns:
  - "<span class=\"ren-kbd\"> or <code class=\"ren-kbd\"> — must be a real <kbd> for assistive tech."
  - "Hardcoded background or border colors that bypass --ren-kbd-bg / --ren-kbd-border."
  - "Adding click handlers on .ren-kbd to fire a shortcut — wrap the kbd inside a ren-button instead."
  - "Using <kbd class=\"ren-kbd\"> for a multi-character command name (e.g., \"git status\") — use <code> for that."
  - "Stacking multiple keys inside a single <kbd> (e.g., <kbd>⌘K</kbd>) — split them into one <kbd> per key."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-kbd-bg, --ren-kbd-border, --ren-kbd-color, --ren-kbd-font-family, --ren-kbd-font-size, --ren-kbd-padding, --ren-kbd-radius."
    - "Semantic tokens consumed internally: --color-text, --color-surface-sunken, --color-border-strong."
    - "Type tokens: --font-mono, --caption-size, --weight-medium."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors in consumer overrides."
    - "Custom font-family overrides that bypass --ren-kbd-font-family / --font-mono."

accessibility:
  required:
    - "Use the native <kbd> element so screen readers announce \"keyboard input\" semantics."
    - "Keep contrast on the chip background ≥ WCAG AA against surrounding text (driven by --color-surface-sunken / --color-text)."
    - "Do not rely on the chip styling alone to convey shortcut meaning; pair with descriptive text (e.g., \"Press <kbd>⌘</kbd> + <kbd>K</kbd> to open search\")."
    - "Do not make .ren-kbd interactive — it has no focus ring or hit target."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-kbd/ren-kbd.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-kbd">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-kbd`

## States And Attributes

- `None detected in the colocated CSS/JS. Check related files before inventing one.`

## Public Token API

- `--ren-kbd-bg`
- `--ren-kbd-border`
- `--ren-kbd-color`
- `--ren-kbd-font-family`
- `--ren-kbd-font-size`
- `--ren-kbd-padding`
- `--ren-kbd-radius`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/primitives/ren-kbd/ren-kbd.css`
- `docs/components/ren-kbd.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
