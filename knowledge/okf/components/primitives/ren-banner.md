---
type: "RenDS Component"
title: ren-banner
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:primitive:ren-banner
sourcePath: components/primitives/ren-banner
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

# ren-banner

Source path: `components/primitives/ren-banner`

## Relationships

- `exposes_selector` -> [.ren-banner](../../selectors/ren-banner.md)
- `exposes_selector` -> [.ren-banner-actions](../../selectors/ren-banner-actions.md)
- `exposes_selector` -> [.ren-banner-compact](../../selectors/ren-banner-compact.md)
- `exposes_selector` -> [.ren-banner-content](../../selectors/ren-banner-content.md)
- `exposes_selector` -> [.ren-banner-danger](../../selectors/ren-banner-danger.md)
- `exposes_selector` -> [.ren-banner-dismiss](../../selectors/ren-banner-dismiss.md)
- `exposes_selector` -> [.ren-banner-full](../../selectors/ren-banner-full.md)
- `exposes_selector` -> [.ren-banner-icon](../../selectors/ren-banner-icon.md)
- `exposes_selector` -> [.ren-banner-message](../../selectors/ren-banner-message.md)
- `exposes_selector` -> [.ren-banner-neutral](../../selectors/ren-banner-neutral.md)
- `exposes_selector` -> [.ren-banner-success](../../selectors/ren-banner-success.md)
- `exposes_selector` -> [.ren-banner-title](../../selectors/ren-banner-title.md)
- `exposes_selector` -> [.ren-banner-warning](../../selectors/ren-banner-warning.md)
- `has_contract` -> [ren-banner component.md](../../foundation/contract-primitive-ren-banner.md)
- `has_css` -> [ren-banner.css](../../css/ren-banner-css.md)
- `has_docs_page` -> [ren-banner docs](../../docs/ren-banner-docs.md)
- `uses_token` -> [--body-size](../../tokens/body-size.md)
- `uses_token` -> [--caption-size](../../tokens/caption-size.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-danger](../../tokens/color-danger.md)
- `uses_token` -> [--color-danger-subtle](../../tokens/color-danger-subtle.md)
- `uses_token` -> [--color-focus-ring](../../tokens/color-focus-ring.md)
- `uses_token` -> [--color-info](../../tokens/color-info.md)
- `uses_token` -> [--color-info-subtle](../../tokens/color-info-subtle.md)
- `uses_token` -> [--color-success](../../tokens/color-success.md)
- `uses_token` -> [--color-success-subtle](../../tokens/color-success-subtle.md)
- `uses_token` -> [--color-surface-sunken](../../tokens/color-surface-sunken.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-muted](../../tokens/color-text-muted.md)
- `uses_token` -> [--color-text-secondary](../../tokens/color-text-secondary.md)
- `uses_token` -> [--color-warning](../../tokens/color-warning.md)
- `uses_token` -> [--color-warning-subtle](../../tokens/color-warning-subtle.md)
- `uses_token` -> [--duration-state](../../tokens/duration-state.md)
- `uses_token` -> [--duration-tactile](../../tokens/duration-tactile.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--label-size](../../tokens/label-size.md)
- `uses_token` -> [--leading-normal](../../tokens/leading-normal.md)
- `uses_token` -> [--radius-md](../../tokens/radius-md.md)
- `uses_token` -> [--radius-sm](../../tokens/radius-sm.md)
- `uses_token` -> [--ring-width](../../tokens/ring-width.md)
- `uses_token` -> [--space-1](../../tokens/space-1.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-3](../../tokens/space-3.md)
- `uses_token` -> [--space-4](../../tokens/space-4.md)
- `uses_token` -> [--stroke-1](../../tokens/stroke-1.md)
- `uses_token` -> [--text-base](../../tokens/text-base.md)
- `uses_token` -> [--text-lg](../../tokens/text-lg.md)
- `uses_token` -> [--text-sm](../../tokens/text-sm.md)
- `uses_token` -> [--weight-semibold](../../tokens/weight-semibold.md)

## Structured Data

```json
{
  "kind": "primitive",
  "selectors": [
    ".ren-banner",
    ".ren-banner-actions",
    ".ren-banner-compact",
    ".ren-banner-content",
    ".ren-banner-danger",
    ".ren-banner-dismiss",
    ".ren-banner-full",
    ".ren-banner-icon",
    ".ren-banner-message",
    ".ren-banner-neutral",
    ".ren-banner-success",
    ".ren-banner-title",
    ".ren-banner-warning"
  ],
  "tokens": [
    "--body-size",
    "--caption-size",
    "--color-border",
    "--color-danger",
    "--color-danger-subtle",
    "--color-focus-ring",
    "--color-info",
    "--color-info-subtle",
    "--color-success",
    "--color-success-subtle",
    "--color-surface-sunken",
    "--color-text",
    "--color-text-muted",
    "--color-text-secondary",
    "--color-warning",
    "--color-warning-subtle",
    "--duration-state",
    "--duration-tactile",
    "--ease-enter",
    "--label-size",
    "--leading-normal",
    "--radius-md",
    "--radius-sm",
    "--ring-width",
    "--space-1",
    "--space-2",
    "--space-3",
    "--space-4",
    "--stroke-1",
    "--text-base",
    "--text-lg",
    "--text-sm",
    "--weight-semibold"
  ],
  "hasScript": false,
  "hasDocsPage": true
}
```

## Source Content

# ren-banner Component Contract

Persistent inline message for status, warning, or alert content.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-banner` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-banner` primitive.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Banner primitive behavior or visual role.
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
    - "You need a persistent inline message that sits in page flow (success / warning / danger / info / neutral)."
    - "The message has structured content: icon + title + message + optional actions or dismiss button."
    - "You need a page-top full-bleed announcement via .ren-banner-full (no border-radius, no side borders)."
    - "You need a compact single-line variant for dense surfaces (.ren-banner-compact)."
    - "The banner should remain on screen until user dismisses it or the underlying state changes."
  avoidWhen:
    - "The message is transient and overlay-style — use ren-toast."
    - "The message blocks the entire flow and requires confirmation — use ren-dialog (alert)."
    - "You only need a small inline status label — use ren-badge."
    - "The message is form validation tied to a single field — use ren-field's error slot."

canonicalImports:
  css:
    - "rends/components/primitives/ren-banner/ren-banner.css"
  notes:
    - "CSS-only primitive — no colocated JS exists. Dismiss button is plain HTML; if you wire dismissal, set data-dismissing to trigger the documented animation."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Root must carry role=\"status\" (info / success / neutral) or role=\"alert\" (danger / urgent warning) so AT announces correctly."
  - "Use the documented children: <span class=\"ren-banner-icon\">, <div class=\"ren-banner-content\"> with <strong class=\"ren-banner-title\"> + <p class=\"ren-banner-message\">."
  - "Dismiss button is <button class=\"ren-banner-dismiss\" aria-label=\"Dismiss\"> — never a <div> with click handler."
  - "Wrap any banner action buttons in <div class=\"ren-banner-actions\"> placed inside .ren-banner-content."
  - "To animate dismissal, set [data-dismissing] on the root; do not animate via inline styles."

forbiddenPatterns:
  - "Using a banner as a transient toast that auto-dismisses without user action — wrong semantics."
  - "Hardcoded border / background colors per severity — use the .ren-banner-{success | warning | danger | neutral} variant."
  - "Stacking two severity variants on the same banner (e.g., .ren-banner-success.ren-banner-danger)."
  - "Dismiss button without aria-label or visible text — the ✕ glyph alone is not an accessible name."
  - "Communicating severity with icon color only; the role attribute and surrounding text must convey severity to AT."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-banner-bg, --ren-banner-border-color, --ren-banner-border-width, --ren-banner-color, --ren-banner-gap, --ren-banner-icon-size, --ren-banner-padding, --ren-banner-radius."
    - "Semantic tokens: --color-info-subtle, --color-success-subtle, --color-warning-subtle, --color-danger-subtle, --color-surface-sunken, --color-border, --color-text, --color-text-secondary, --color-text-muted, --color-focus-ring."
    - "Motion tokens: --duration-tactile, --duration-state, --ease-enter."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors or hardcoded rgba border tints — use color-mix on semantic tokens as the CSS already does."
    - "Inline transition / animation values; use --duration-* / --ease-* tokens."

accessibility:
  required:
    - "Set role=\"alert\" for danger / urgent warning banners and role=\"status\" for non-urgent info / success / neutral."
    - "Dismiss button must have aria-label (or visible text) and a visible :focus-visible ring driven by --color-focus-ring."
    - ".ren-banner-title renders as a real heading-like element (<strong>); when stacked among <h*> content, follow document outline."
    - "Respect prefers-reduced-motion: the [data-dismissing] animation collapses to display:none per the CSS — do not re-introduce motion."
    - "Banner content must not rely on color alone; the icon + title + message convey severity together."
    - "Action buttons inside .ren-banner-actions must be real <button> elements with their own keyboard focus order."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-banner/ren-banner.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-banner">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-banner`
- `.ren-banner-actions`
- `.ren-banner-compact`
- `.ren-banner-content`
- `.ren-banner-danger`
- `.ren-banner-dismiss`
- `.ren-banner-full`
- `.ren-banner-icon`
- `.ren-banner-message`
- `.ren-banner-neutral`
- `.ren-banner-success`
- `.ren-banner-title`
- `.ren-banner-warning`

## States And Attributes

- `[data-dismissing]`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-banner-bg`
- `--ren-banner-border-color`
- `--ren-banner-border-width`
- `--ren-banner-color`
- `--ren-banner-gap`
- `--ren-banner-icon-size`
- `--ren-banner-padding`
- `--ren-banner-radius`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/primitives/ren-banner/ren-banner.css`
- `docs/components/ren-banner.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/* ============================================
   RenDS — Banner / Alert Component
   ============================================
   Inline messages for success, warning, error, info.
   CSS-only. No JS needed (dismiss is optional JS).

   Different from Toast: Banner is inline, persistent,
   part of the page flow. Toast is ephemeral overlay.

   Usage:
     <div class="ren-banner" role="status">
       <span class="ren-banner-icon">ℹ</span>
       <div class="ren-banner-content">
         <strong class="ren-banner-title">Info</strong>
         <p class="ren-banner-message">Your changes have been saved.</p>
       </div>
     </div>

     <div class="ren-banner ren-banner-danger" role="alert">
       <span class="ren-banner-icon">!</span>
       <div class="ren-banner-content">
         <strong class="ren-banner-title">Error</strong>
         <p class="ren-banner-message">Could not save changes.</p>
       </div>
       <button class="ren-banner-dismiss" aria-label="Dismiss">&times;</button>
     </div>

   Simple (no title):
     <div class="ren-banner ren-banner-success" role="status">
       <span class="ren-banner-icon">✓</span>
       <p class="ren-banner-message">File uploaded successfully.</p>
     </div>
   ============================================ */

/* ─── Base Banner ─── */
.ren-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--body-size);
  line-height: var(--leading-normal);
  /* Default: info */
  background-color: var(--color-info-subtle);
  border: var(--stroke-1) solid color-mix(in oklch, var(--color-info), transparent 70%);
  color: var(--color-text);
}

/* ─── Icon ─── */
.ren-banner-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  font-size: var(--text-base);
  margin-top: 1px;
}

/* ─── Content ─── */
.ren-banner-content {
  flex: 1;
  min-width: 0;
}

.ren-banner-title {
  display: block;
  font-weight: var(--weight-semibold);
  font-size: var(--label-size, var(--text-sm));
  margin: 0 0 var(--space-1);
}

.ren-banner-message {
  font-size: var(--caption-size, var(--text-sm));
  color: var(--color-text-secondary);
  margin: 0;
}

/* Title-only (no message) */
.ren-banner-title:last-child {
  margin-bottom: 0;
}

/* ─── Actions (buttons inside banner) ─── */
.ren-banner-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

/* ─── Dismiss button ─── */
.ren-banner-dismiss {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-size: var(--text-lg);
  line-height: 1;
  transition: color var(--duration-tactile) var(--ease-enter);
}

.ren-banner-dismiss:hover {
  color: var(--color-text);
}

.ren-banner-dismiss:focus-visible {
  outline: var(--ring-width) solid var(--color-focus-ring);
  outline-offset: 2px;
}

/* ─── Variants ─── */

.ren-banner-success {
  background-color: var(--color-success-subtle);
  border-color: color-mix(in oklch, var(--color-success), transparent 70%);
}

.ren-banner-warning {
  background-color: var(--color-warning-subtle);
  border-color: color-mix(in oklch, var(--color-warning), transparent 70%);
}

.ren-banner-danger {
  background-color: var(--color-danger-subtle);
  border-color: color-mix(in oklch, var(--color-danger), transparent 70%);
}

.ren-banner-neutral {
  background-color: var(--color-surface-sunken);
  border-color: var(--color-border);
}

/* ─── Compact variant (less padding, single line) ─── */
.ren-banner-compact {
  align-items: center;
  padding: var(--space-2) var(--space-3);
  gap: var(--space-2);
}

.ren-banner-compact .ren-banner-icon {
  width: 1.25rem;
  height: 1.25rem;
  font-size: var(--text-sm);
}

/* ─── Full-width variant (no border-radius, for page top) ─── */
.ren-banner-full {
  border-radius: 0;
  border-inline-start: none;
  border-inline-end: none;
}

/* ─── Dismiss animation ─── */
.ren-banner[data-dismissing] {
  animation: ren-banner-dismiss var(--duration-state) var(--ease-enter) forwards;
}

@keyframes ren-banner-dismiss {
  to {
    opacity: 0;
    height: 0;
    padding-block: 0;
    margin-block: 0;
    overflow: hidden;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .ren-banner[data-dismissing] {
    animation: none;
    display: none;
  }
}
