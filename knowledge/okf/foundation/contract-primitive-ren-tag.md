---
type: "RenDS Contract"
title: "ren-tag component.md"
description: "RenDS Contract generated from the RenDS knowledge graph."
id: contract:primitive:ren-tag
sourcePath: components/primitives/ren-tag/component.md
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - contract
  - ren10
  - rends
---

# ren-tag component.md

Source path: `components/primitives/ren-tag/component.md`

## Relationships

_No outgoing relationships._

## Structured Data

```json
{
  "kind": "primitive"
}
```

## Source Content

# ren-tag Component Contract

Compact keyword, filter, or removable token primitive.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-tag` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-tag` primitive.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Tag primitive behavior or visual role.
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
    - "The user picks, adds, or removes a value (filter chip, selected keyword, attached label)."
    - "You need a removable token with an embedded dismiss button (.ren-tag-dismiss)."
    - "You need a toggleable filter pill driven by aria-pressed or data-selected (.ren-tag-clickable)."
    - "You need a status-tinted token (.ren-tag-primary / .ren-tag-success / .ren-tag-warning / .ren-tag-danger) tied to a semantic color."
    - "Multiple tokens flow together in a wrap — use .ren-tag-group as the parent."
  avoidWhen:
    - "The element is a static, non-interactive status pill — use ren-badge."
    - "The element triggers an imperative action (submit, open dialog) — use ren-button."
    - "The element is a hyperlink to another page — use ren-link."
    - "The element is a form-style multi-select dropdown option — use ren-select / ren-combobox option markup."

canonicalImports:
  css:
    - "rends/components/primitives/ren-tag/ren-tag.css"
  notes:
    - "CSS-only primitive. There is no colocated JS — wire up dismiss/click handlers in your own script."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Render the tag as an inline element: <span class=\"ren-tag\"> for static, <span class=\"ren-tag ren-tag-clickable\" tabindex=\"0\" role=\"button\"> for toggleable filters."
  - "Removable tags must include <button class=\"ren-tag-dismiss\" type=\"button\" aria-label=\"Remove <name>\">; never use a non-button element for dismissal."
  - "Toggle / filter tags must mirror selection state via aria-pressed=\"true|false\" (preferred) or data-selected; do not rely on color alone."
  - "Group multiple tags inside a parent with class=\"ren-tag-group\" so the gap and wrap behavior come from the design system."
  - "Combine at most one color variant (.ren-tag-primary | .ren-tag-success | .ren-tag-warning | .ren-tag-danger) with at most one size (.ren-tag-sm | .ren-tag-lg)."

forbiddenPatterns:
  - "<div class=\"ren-tag\" onclick=...> for clickable tags — use a real <button> or .ren-tag-clickable with role=\"button\" and tabindex=\"0\"."
  - "Custom dismiss icons drawn with background-image; place a text \"×\" or an <svg aria-hidden=\"true\"> inside .ren-tag-dismiss instead."
  - "Hardcoded background-color: #... overrides; theme via --ren-tag-bg / --ren-tag-border-color / --ren-tag-color."
  - "Using ren-tag-danger purely for emphasis on a non-danger value — semantic color variants must match meaning (danger = destructive / error)."
  - "Removing the :focus-visible outline on .ren-tag-clickable or .ren-tag-dismiss without restoring a visible ring."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-tag-bg, --ren-tag-border-color, --ren-tag-color, --ren-tag-font-size, --ren-tag-font-weight, --ren-tag-gap, --ren-tag-height, --ren-tag-padding-x, --ren-tag-radius."
    - "Semantic tokens consumed internally: --color-text, --color-text-muted, --color-fill, --color-fill-hover, --color-fill-active, --color-border, --color-border-strong, --color-accent, --color-accent-subtle, --color-on-accent, --color-success / --color-success-subtle / --color-success-strong, --color-warning / --color-warning-subtle / --color-warning-strong, --color-danger / --color-danger-subtle / --color-danger-strong, --color-focus-ring, --stroke-1, --radius-full, --ring-width, --ring-offset-width."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / rgba background and border colors."
    - "Inline padding / font-size overrides; pick the .ren-tag-sm / .ren-tag-lg variant or override --ren-tag-padding-x / --ren-tag-font-size."

accessibility:
  required:
    - "Clickable tags must be focusable: either a real <button>, or use .ren-tag-clickable with tabindex=\"0\" and role=\"button\" plus Space / Enter handling."
    - "Toggle state must be exposed via aria-pressed; data-selected is for styling parity only, not a substitute for ARIA."
    - "Dismiss buttons need an aria-label that names the value being removed (e.g. \"Remove React\"), not just \"Remove\"."
    - "Color variants must not be the sole signal of meaning — pair .ren-tag-danger with text or an icon that conveys the same state."
    - ":focus-visible outline must remain visible on both .ren-tag-clickable and .ren-tag-dismiss; the CSS wires this to --color-focus-ring."
    - "Long tag text truncates with ellipsis (.ren-tag > span overflow rule); when this happens, surface the full value via title or an off-screen label."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-tag/ren-tag.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-tag">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-tag`
- `.ren-tag-clickable`
- `.ren-tag-danger`
- `.ren-tag-dismiss`
- `.ren-tag-group`
- `.ren-tag-lg`
- `.ren-tag-primary`
- `.ren-tag-sm`
- `.ren-tag-success`
- `.ren-tag-warning`

## States And Attributes

- `[aria-pressed]`
- `[data-selected]`
- `:active`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-tag-bg`
- `--ren-tag-border-color`
- `--ren-tag-color`
- `--ren-tag-font-size`
- `--ren-tag-font-weight`
- `--ren-tag-gap`
- `--ren-tag-height`
- `--ren-tag-padding-x`
- `--ren-tag-radius`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/primitives/ren-tag/ren-tag.css`
- `docs/components/ren-tag.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
