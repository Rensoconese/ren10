---
type: "RenDS Component"
title: ren-link
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:primitive:ren-link
sourcePath: components/primitives/ren-link
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

# ren-link

Source path: `components/primitives/ren-link`

## Relationships

- `exposes_selector` -> [.ren-link](../../selectors/ren-link.md)
- `exposes_selector` -> [.ren-link-external](../../selectors/ren-link-external.md)
- `exposes_selector` -> [.ren-link-muted](../../selectors/ren-link-muted.md)
- `exposes_selector` -> [.ren-link-nav](../../selectors/ren-link-nav.md)
- `exposes_selector` -> [.ren-link-plain](../../selectors/ren-link-plain.md)
- `exposes_selector` -> [.ren-link-skip](../../selectors/ren-link-skip.md)
- `has_contract` -> [ren-link component.md](../../foundation/contract-primitive-ren-link.md)
- `has_css` -> [ren-link.css](../../css/ren-link-css.md)
- `has_docs_page` -> [ren-link docs](../../docs/ren-link-docs.md)
- `used_by_example` -> [auth-form.html](../../examples/auth-form-html.md) (ren-link)
- `used_by_example` -> [dashboard-shell.html](../../examples/dashboard-shell-html.md) (ren-link)
- `uses_token` -> [--color-accent](../../tokens/color-accent.md)
- `uses_token` -> [--color-accent-subtle](../../tokens/color-accent-subtle.md)
- `uses_token` -> [--color-fill](../../tokens/color-fill.md)
- `uses_token` -> [--color-focus-ring](../../tokens/color-focus-ring.md)
- `uses_token` -> [--color-on-accent](../../tokens/color-on-accent.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-link](../../tokens/color-text-link.md)
- `uses_token` -> [--color-text-link-hover](../../tokens/color-text-link-hover.md)
- `uses_token` -> [--color-text-muted](../../tokens/color-text-muted.md)
- `uses_token` -> [--duration-tactile](../../tokens/duration-tactile.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--radius-md](../../tokens/radius-md.md)
- `uses_token` -> [--radius-sm](../../tokens/radius-sm.md)
- `uses_token` -> [--ring-width](../../tokens/ring-width.md)
- `uses_token` -> [--space-1](../../tokens/space-1.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-3](../../tokens/space-3.md)
- `uses_token` -> [--space-4](../../tokens/space-4.md)
- `uses_token` -> [--touch-min](../../tokens/touch-min.md)
- `uses_token` -> [--weight-medium](../../tokens/weight-medium.md)
- `uses_token` -> [--weight-semibold](../../tokens/weight-semibold.md)

## Structured Data

```json
{
  "kind": "primitive",
  "selectors": [
    ".ren-link",
    ".ren-link-external",
    ".ren-link-muted",
    ".ren-link-nav",
    ".ren-link-plain",
    ".ren-link-skip"
  ],
  "tokens": [
    "--color-accent",
    "--color-accent-subtle",
    "--color-fill",
    "--color-focus-ring",
    "--color-on-accent",
    "--color-text",
    "--color-text-link",
    "--color-text-link-hover",
    "--color-text-muted",
    "--duration-tactile",
    "--ease-enter",
    "--radius-md",
    "--radius-sm",
    "--ring-width",
    "--space-1",
    "--space-2",
    "--space-3",
    "--space-4",
    "--touch-min",
    "--weight-medium",
    "--weight-semibold"
  ],
  "hasScript": false,
  "hasDocsPage": true
}
```

## Source Content

# ren-link Component Contract

Accessible link styling for inline, muted, nav, external, and skip links.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-link` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-link` primitive.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Link primitive behavior or visual role.
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
    - "The element navigates to a URL, anchor, or routed page (i.e., it has a real href)."
    - "You need inline text links inside paragraphs styled with underline + hover."
    - "You need a navigation link with a 44px touch target (.ren-link-nav) plus active-route styling via aria-current=\"page\" / [data-active]."
    - "You need an external-link affordance with a trailing ↗ marker (.ren-link-external)."
    - "You need a skip-to-content link that becomes visible only on focus (.ren-link-skip)."
    - "You need a muted or unstyled (inherits color) anchor (.ren-link-muted, .ren-link-plain)."
  avoidWhen:
    - "The element triggers an imperative action (submit, open dialog, delete) — use ren-button."
    - "The element is a tab, menuitem, or pagination control — use the corresponding component."
    - "The element is a stateful toggle — use a switch, checkbox, or button with aria-pressed."

canonicalImports:
  css:
    - "rends/components/primitives/ren-link/ren-link.css"
  notes:
    - "CSS-only primitive; no JavaScript file exists for ren-link."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Always render an actual <a href=\"...\"> element. Never style a <button> or <span> as a link."
  - "External links should set rel=\"noopener noreferrer\" and target=\"_blank\" alongside .ren-link-external when opening in a new tab."
  - "Nav links representing the current page set aria-current=\"page\" (or data-active for non-routing states) on the <a>."
  - "Skip links (.ren-link-skip) must be the first focusable element in <body> and reference a real target id (e.g., href=\"#main\")."
  - "The trailing ↗ on .ren-link-external is decorative content — never use it as the only signal that a link opens externally; provide aria-label or visually-hidden text for screen readers if needed."

forbiddenPatterns:
  - "<button class=\"ren-link\"> — use a real <a> with an href."
  - "<a class=\"ren-link\" onclick=\"...\"> without an href — non-focusable, breaks keyboard activation."
  - "Removing the focus ring (outline: none) without restoring a visible :focus-visible style."
  - "Hardcoded color overrides like style=\"color:#0066cc\" — use --ren-link-color / --color-text-link."
  - "Using .ren-link-nav for inline prose links; it expects flex layout and a 44px hit area."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-link-color, --ren-link-font-weight, --ren-link-hover-color, --ren-link-underline."
    - "Semantic tokens: --color-text-link, --color-text-link-hover, --color-text, --color-text-muted, --color-accent, --color-accent-subtle, --color-on-accent, --color-focus-ring, --color-fill."
    - "Layout / motion tokens: --space-*, --radius-sm, --radius-md, --touch-min, --ring-width, --duration-tactile, --ease-enter."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors in consumer overrides."
    - "Custom underline colors via text-decoration shorthand that bypass --ren-link-underline."

accessibility:
  required:
    - "Real <a href> semantics; never simulate a link with a div + onclick."
    - "Visible :focus-visible ring driven by --color-focus-ring and --ring-width."
    - ".ren-link-nav guarantees a 44px touch target via min-height: var(--touch-min)."
    - "The current navigation item must set aria-current=\"page\" so screen readers announce route position."
    - "Skip links must be reachable as the first Tab stop and become visually focused via .ren-link-skip:focus."
    - "External-link ↗ glyph is a visual hint only; do not rely on it for assistive-tech announcement."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-link/ren-link.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-link">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-link`
- `.ren-link-external`
- `.ren-link-muted`
- `.ren-link-nav`
- `.ren-link-plain`
- `.ren-link-skip`

## States And Attributes

- `[aria-current]`
- `[data-active]`
- `:active`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-link-color`
- `--ren-link-font-weight`
- `--ren-link-hover-color`
- `--ren-link-underline`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/primitives/ren-link/ren-link.css`
- `docs/components/ren-link.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/* ============================================
   RenDS — Link Component
   ============================================
   Styled anchor with variants.
   CSS-only. No JS needed.

   44px touch target on mobile via min-height.
   Accessible focus ring on keyboard navigation.

   Usage:
     <a href="/page" class="ren-link">Standard link</a>
     <a href="/page" class="ren-link ren-link-muted">Subtle link</a>
     <a href="/page" class="ren-link ren-link-external">External ↗</a>
   ============================================ */

/* ─── Base Link ─── */
.ren-link {
  display: inline;
  color: var(--color-text-link);
  background: none;
  text-decoration: underline;
  text-decoration-color: color-mix(in oklch, var(--color-text-link), transparent 60%);
  text-underline-offset: 0.15em;
  text-decoration-thickness: 1px;
  cursor: pointer;
  transition:
    color var(--duration-tactile) var(--ease-enter),
    text-decoration-color var(--duration-tactile) var(--ease-enter);
  /* Inline elements: ensure touch target via padding */
  -webkit-tap-highlight-color: transparent;
}

.ren-link:hover {
  color: var(--color-text-link-hover);
  background: none;
  text-decoration: underline;
  text-decoration-color: color-mix(in oklch, var(--color-text-link-hover), transparent 30%);
  text-decoration-thickness: 2px;
}

.ren-link:active {
  opacity: 0.8;
}

.ren-link:focus-visible {
  outline: var(--ring-width) solid var(--color-focus-ring);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* ─── Muted / Subtle ─── */
.ren-link-muted {
  color: var(--color-text-muted);
  text-decoration: none;
}

.ren-link-muted:hover {
  color: var(--color-text);
  text-decoration: underline;
}

/* ─── Unstyled (inherits parent color) ─── */
.ren-link-plain {
  color: inherit;
  text-decoration: none;
}

.ren-link-plain:hover {
  text-decoration: underline;
}

/* ─── External link indicator ─── */
.ren-link-external::after {
  content: ' ↗';
  font-size: 0.85em;
  text-decoration: none;
  display: inline;
}

/* ─── Nav link (block-level, with padding for touch target) ─── */
.ren-link-nav {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--touch-min);
  padding: var(--space-1) var(--space-2);
  color: var(--color-text);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition:
    background-color var(--duration-tactile) var(--ease-enter),
    color var(--duration-tactile) var(--ease-enter);
}

.ren-link-nav:hover {
  background-color: var(--color-fill);
  color: var(--color-text);
  text-decoration: none;
}

.ren-link-nav[aria-current="page"],
.ren-link-nav[data-active] {
  background-color: var(--color-accent-subtle);
  color: var(--color-accent);
  font-weight: var(--weight-medium);
}

.ren-link-nav:focus-visible {
  outline: var(--ring-width) solid var(--color-focus-ring);
  outline-offset: -2px;
}

/* ─── Skip link (a11y) ─── */
.ren-link-skip {
  position: absolute;
  top: -100%;
  left: var(--space-3);
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-accent);
  color: var(--color-on-accent);
  border-radius: var(--radius-md);
  font-weight: var(--weight-semibold);
  text-decoration: none;
  z-index: 9999;
  transition: top var(--duration-tactile) var(--ease-enter);
}

.ren-link-skip:focus {
  top: var(--space-3);
}
