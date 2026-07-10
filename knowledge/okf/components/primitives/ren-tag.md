---
type: "RenDS Component"
title: ren-tag
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:primitive:ren-tag
sourcePath: components/primitives/ren-tag
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - component
  - primitive
  - ren10
  - rends
---

# ren-tag

Source path: `components/primitives/ren-tag`

## Relationships

- `exposes_selector` -> [.ren-tag](../../selectors/ren-tag.md)
- `exposes_selector` -> [.ren-tag-clickable](../../selectors/ren-tag-clickable.md)
- `exposes_selector` -> [.ren-tag-danger](../../selectors/ren-tag-danger.md)
- `exposes_selector` -> [.ren-tag-dismiss](../../selectors/ren-tag-dismiss.md)
- `exposes_selector` -> [.ren-tag-group](../../selectors/ren-tag-group.md)
- `exposes_selector` -> [.ren-tag-lg](../../selectors/ren-tag-lg.md)
- `exposes_selector` -> [.ren-tag-primary](../../selectors/ren-tag-primary.md)
- `exposes_selector` -> [.ren-tag-sm](../../selectors/ren-tag-sm.md)
- `exposes_selector` -> [.ren-tag-success](../../selectors/ren-tag-success.md)
- `exposes_selector` -> [.ren-tag-warning](../../selectors/ren-tag-warning.md)
- `has_contract` -> [ren-tag component.md](../../foundation/contract-primitive-ren-tag.md)
- `has_css` -> [ren-tag.css](../../css/ren-tag-css.md)
- `has_docs_page` -> [ren-tag docs](../../docs/ren-tag-docs.md)
- `used_by_example` -> [ai-panel.html](../../examples/ai-panel-html.md) (ren-tag)
- `used_by_example` -> [data-table.html](../../examples/data-table-html.md) (ren-tag)
- `uses_token` -> [--body-size](../../tokens/body-size.md)
- `uses_token` -> [--caption-size](../../tokens/caption-size.md)
- `uses_token` -> [--color-accent](../../tokens/color-accent.md)
- `uses_token` -> [--color-accent-subtle](../../tokens/color-accent-subtle.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-border-strong](../../tokens/color-border-strong.md)
- `uses_token` -> [--color-danger](../../tokens/color-danger.md)
- `uses_token` -> [--color-danger-strong](../../tokens/color-danger-strong.md)
- `uses_token` -> [--color-danger-subtle](../../tokens/color-danger-subtle.md)
- `uses_token` -> [--color-fill](../../tokens/color-fill.md)
- `uses_token` -> [--color-fill-active](../../tokens/color-fill-active.md)
- `uses_token` -> [--color-fill-hover](../../tokens/color-fill-hover.md)
- `uses_token` -> [--color-focus-ring](../../tokens/color-focus-ring.md)
- `uses_token` -> [--color-on-accent](../../tokens/color-on-accent.md)
- `uses_token` -> [--color-success](../../tokens/color-success.md)
- `uses_token` -> [--color-success-strong](../../tokens/color-success-strong.md)
- `uses_token` -> [--color-success-subtle](../../tokens/color-success-subtle.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-muted](../../tokens/color-text-muted.md)
- `uses_token` -> [--color-warning](../../tokens/color-warning.md)
- `uses_token` -> [--color-warning-strong](../../tokens/color-warning-strong.md)
- `uses_token` -> [--color-warning-subtle](../../tokens/color-warning-subtle.md)
- `uses_token` -> [--duration-tactile](../../tokens/duration-tactile.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--radius-full](../../tokens/radius-full.md)
- `uses_token` -> [--ring-offset-width](../../tokens/ring-offset-width.md)
- `uses_token` -> [--ring-width](../../tokens/ring-width.md)
- `uses_token` -> [--space-1](../../tokens/space-1.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--stroke-1](../../tokens/stroke-1.md)
- `uses_token` -> [--text-sm](../../tokens/text-sm.md)
- `uses_token` -> [--text-xs](../../tokens/text-xs.md)
- `uses_token` -> [--weight-medium](../../tokens/weight-medium.md)

## Structured Data

```json
{
  "kind": "primitive",
  "selectors": [
    ".ren-tag",
    ".ren-tag-clickable",
    ".ren-tag-danger",
    ".ren-tag-dismiss",
    ".ren-tag-group",
    ".ren-tag-lg",
    ".ren-tag-primary",
    ".ren-tag-sm",
    ".ren-tag-success",
    ".ren-tag-warning"
  ],
  "tokens": [
    "--body-size",
    "--caption-size",
    "--color-accent",
    "--color-accent-subtle",
    "--color-border",
    "--color-border-strong",
    "--color-danger",
    "--color-danger-strong",
    "--color-danger-subtle",
    "--color-fill",
    "--color-fill-active",
    "--color-fill-hover",
    "--color-focus-ring",
    "--color-on-accent",
    "--color-success",
    "--color-success-strong",
    "--color-success-subtle",
    "--color-text",
    "--color-text-muted",
    "--color-warning",
    "--color-warning-strong",
    "--color-warning-subtle",
    "--duration-tactile",
    "--ease-enter",
    "--radius-full",
    "--ring-offset-width",
    "--ring-width",
    "--space-1",
    "--space-2",
    "--stroke-1",
    "--text-sm",
    "--text-xs",
    "--weight-medium"
  ],
  "hasScript": false,
  "hasDocsPage": true
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


/* ============================================
   RenDS — Tag / Chip Component
   ============================================
   Interactive badge with optional dismiss button.
   CSS-only (dismiss needs minimal JS).

   Different from Badge: Tag is interactive,
   dismissable, and represents user-selected items.

   Usage:
     <span class="ren-tag">
       HTML
     </span>

     <span class="ren-tag ren-tag-removable">
       React
       <button class="ren-tag-dismiss" aria-label="Remove React">&times;</button>
     </span>

     <span class="ren-tag ren-tag-clickable" tabindex="0" role="button">
       Filter: Active
     </span>
   ============================================ */

.ren-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 0.25em 0.65em;
  font-size: var(--caption-size, var(--text-sm));
  font-weight: var(--weight-medium);
  line-height: 1.5;
  color: var(--color-text);
  background-color: var(--color-fill);
  border: var(--stroke-1) solid var(--color-border);
  border-radius: var(--radius-full);
  white-space: nowrap;
  user-select: none;
  max-width: 100%;
}

/* Tag text truncation */
.ren-tag > span {
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ─── Dismiss button ─── */
.ren-tag-dismiss {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.1em;
  height: 1.1em;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-full);
  font-size: 1.1em;
  line-height: 1;
  flex-shrink: 0;
  transition:
    color var(--duration-tactile) var(--ease-enter),
    background-color var(--duration-tactile) var(--ease-enter);
}

.ren-tag-dismiss:hover {
  color: var(--color-text);
  background-color: var(--color-fill-hover);
}

.ren-tag-dismiss:focus-visible {
  outline: var(--ring-width) solid var(--color-focus-ring);
  outline-offset: 1px;
}

/* ─── Clickable / Selectable ─── */
.ren-tag-clickable {
  cursor: pointer;
  transition:
    background-color var(--duration-tactile) var(--ease-enter),
    border-color var(--duration-tactile) var(--ease-enter);
}

.ren-tag-clickable:hover {
  background-color: var(--color-fill-hover);
  border-color: var(--color-border-strong);
}

.ren-tag-clickable:active {
  background-color: var(--color-fill-active);
}

.ren-tag-clickable:focus-visible {
  outline: var(--ring-width) solid var(--color-focus-ring);
  outline-offset: var(--ring-offset-width);
}

/* Selected state */
.ren-tag-clickable[aria-pressed="true"],
.ren-tag-clickable[data-selected] {
  background-color: var(--color-accent);
  color: var(--color-on-accent);
  border-color: var(--color-accent);
}

/* ─── Color variants ─── */
.ren-tag-primary {
  background-color: var(--color-accent-subtle);
  border-color: color-mix(in oklch, var(--color-accent), transparent 70%);
  color: var(--color-accent);
}

.ren-tag-success {
  background-color: var(--color-success-subtle);
  border-color: color-mix(in oklch, var(--color-success), transparent 70%);
  color: var(--color-success-strong);
}

.ren-tag-warning {
  background-color: var(--color-warning-subtle);
  border-color: color-mix(in oklch, var(--color-warning), transparent 70%);
  color: var(--color-warning-strong);
}

.ren-tag-danger {
  background-color: var(--color-danger-subtle);
  border-color: color-mix(in oklch, var(--color-danger), transparent 70%);
  color: var(--color-danger-strong);
}

/* ─── Size variants ─── */
.ren-tag-sm {
  padding: 0.1em 0.45em;
  font-size: var(--text-xs);
  gap: 0.15em;
}

.ren-tag-lg {
  padding: 0.35em 0.8em;
  font-size: var(--body-size);
}

/* ─── Tag group ─── */
.ren-tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
}
