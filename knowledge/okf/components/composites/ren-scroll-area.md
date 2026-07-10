---
type: "RenDS Component"
title: ren-scroll-area
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:composite:ren-scroll-area
sourcePath: components/composites/ren-scroll-area
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - component
  - composite
  - ren10
  - rends
---

# ren-scroll-area

Source path: `components/composites/ren-scroll-area`

## Relationships

- `exposes_selector` -> [.ren-scroll-area](../../selectors/ren-scroll-area.md)
- `exposes_selector` -> [.ren-scroll-area-full](../../selectors/ren-scroll-area-full.md)
- `exposes_selector` -> [.ren-scroll-area-lg](../../selectors/ren-scroll-area-lg.md)
- `exposes_selector` -> [.ren-scroll-area-md](../../selectors/ren-scroll-area-md.md)
- `exposes_selector` -> [.ren-scroll-area-sm](../../selectors/ren-scroll-area-sm.md)
- `exposes_selector` -> [.ren-scroll-area-xl](../../selectors/ren-scroll-area-xl.md)
- `has_contract` -> [ren-scroll-area component.md](../../foundation/contract-composite-ren-scroll-area.md)
- `has_css` -> [ren-scroll-area.css](../../css/ren-scroll-area-css.md)
- `has_docs_page` -> [ren-scroll-area docs](../../docs/ren-scroll-area-docs.md)
- `uses_token` -> [--color-fill-active](../../tokens/color-fill-active.md)
- `uses_token` -> [--color-fill-hover](../../tokens/color-fill-hover.md)
- `uses_token` -> [--color-surface](../../tokens/color-surface.md)
- `uses_token` -> [--duration-enter](../../tokens/duration-enter.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--radius-full](../../tokens/radius-full.md)
- `uses_token` -> [--scroll-max](../../tokens/scroll-max.md)
- `uses_token` -> [--transition-tactile](../../tokens/transition-tactile.md)

## Structured Data

```json
{
  "kind": "composite",
  "selectors": [
    ".ren-scroll-area",
    ".ren-scroll-area-full",
    ".ren-scroll-area-lg",
    ".ren-scroll-area-md",
    ".ren-scroll-area-sm",
    ".ren-scroll-area-xl"
  ],
  "tokens": [
    "--color-fill-active",
    "--color-fill-hover",
    "--color-surface",
    "--duration-enter",
    "--ease-enter",
    "--radius-full",
    "--scroll-max",
    "--transition-tactile"
  ],
  "hasScript": false,
  "hasDocsPage": true
}
```

## Source Content

# ren-scroll-area Component Contract

Scrollable region styling that preserves native scrolling.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-scroll-area` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-scroll-area` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Scroll Area composite behavior or visual role.
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
    - "A bounded region needs themed native scrollbars (Firefox scrollbar-color + WebKit ::-webkit-scrollbar)."
    - "You want consistent scrollbar styling across light/dark themes without injecting JS or shadow DOM."
    - "Need preset max-height utilities (.ren-scroll-area-sm/-md/-lg/-xl/-full) and direction variants (.-x, .-y)."
    - "Need fade-edge masks (.-fade, .-fade-x) to hint at overflow without resorting to JS observers."
    - "Need an \"auto\" variant where the scrollbar only appears on hover / focus-within."
  avoidWhen:
    - "You need virtualization, restore-scroll-position, or scroll-into-view APIs — those need bespoke JS, not this CSS contract."
    - "You need a custom-drawn track / thumb (e.g. mini-map, position indicator) — native scrollbar styling cannot do this."
    - "The container should never scroll (clip overflow) — use overflow: clip / hidden directly."
    - "The content scrolls horizontally only and needs snap behavior — use a dedicated carousel/scroll-snap pattern."

canonicalImports:
  css:
    - "rends/components/composites/ren-scroll-area/ren-scroll-area.css"
  js: []
  notes:
    - "CSS-only component: no JavaScript file is colocated. Do not introduce JS unless the source component grows that responsibility."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Apply class=\"ren-scroll-area\" to a real block element that owns overflow (commonly <div>, <section>, <main>)."
  - "Constrain height/width explicitly — either via .ren-scroll-area-sm/-md/-lg/-xl/-full, an inline --scroll-max custom property, or a parent flex/grid track."
  - "Pair direction with intent: .-x for horizontal-only, .-y for vertical-only; omit for auto in both axes."
  - "When using .-fade or .-fade-x the masking ::before/::after read from --color-surface; ensure the scroll area sits on a surface that matches that token."
  - "Children that should be focusable for keyboard scrolling need tabindex=\"0\" on the .ren-scroll-area itself when it has no focusable descendants."

forbiddenPatterns:
  - "Overriding overflow with overflow: hidden — that defeats the entire component (no scrollbar, no fade mask alignment)."
  - "Wrapping a <ren-scroll-area> custom element instead of the .ren-scroll-area class — no custom element exists for this composite."
  - "Stacking position: absolute children that escape the scroll context — the fade overlays (::before/::after at z-index: 10) assume in-flow content underneath."
  - "Hardcoding scrollbar-color or ::-webkit-scrollbar-thumb hex values — theme via --color-fill-active / --color-fill-hover so dark mode adapts."
  - "Setting --scroll-max on the parent expecting cascade — the rule is .ren-scroll-area[--scroll-max] { max-height: var(--scroll-max) } so the variable must be authored on the same element."

tokenPolicy:
  allowed:
    - "Semantic tokens used by the scrollbar and fade masks: --color-fill-active, --color-fill-hover, --color-surface."
    - "Layout / shape / motion tokens: --radius-full, --duration-enter, --ease-enter, --transition-tactile."
    - "Authoring custom max-height via the --scroll-max custom property on the .ren-scroll-area element."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer overrides."
    - "Hardcoded hex / rgb() values for scrollbar thumb or fade-mask gradients."
    - "Inventing --ren-scroll-area-* tokens — none are part of the Public Token API today."

accessibility:
  required:
    - "If the scrollable region contains no focusable child, set tabindex=\"0\" on the .ren-scroll-area so keyboard users can scroll it with Arrow / PageUp / PageDown."
    - "Provide an accessible name (aria-label / aria-labelledby) when the region is a discrete content landmark; e.g. <section class=\"ren-scroll-area\" aria-label=\"Logs\">."
    - "Honor prefers-reduced-motion: the component disables scroll-behavior: smooth via the existing @media rule — do not re-enable smooth scrolling under reduced-motion."
    - "Do not rely on the fade-edge gradients alone to signal more content; pair with a visible affordance (chevron, scroll-hint) when content overflow is decision-critical."
    - "Scrollbar contrast: --color-fill-active and --color-fill-hover must remain distinguishable from --color-surface in both themes; do not theme so the thumb disappears."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-scroll-area/ren-scroll-area.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-scroll-area">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-scroll-area`
- `.ren-scroll-area-full`
- `.ren-scroll-area-lg`
- `.ren-scroll-area-md`
- `.ren-scroll-area-sm`
- `.ren-scroll-area-xl`

## States And Attributes

- `:hover`

## Public Token API

- `None detected in the colocated CSS/JS. Check related files before inventing one.`

If no `--ren-*` token is detected here, theme through semantic tokens from `tokens/tokens.md` and avoid selector overrides.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/composites/ren-scroll-area/ren-scroll-area.css`
- `docs/components/ren-scroll-area.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


.ren-scroll-area {
  position: relative;
  overflow: auto;

  scrollbar-width: thin;
  scrollbar-color: var(--color-fill-active) transparent;

  transition: scrollbar-color var(--duration-enter) var(--ease-enter);

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-fill-active);
    border-radius: var(--radius-full);
    border: 2px solid transparent;
    background-clip: content-box;

    transition: var(--transition-tactile);
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--color-fill-hover);
    background-clip: content-box;
  }

  &::-webkit-scrollbar-corner {
    background: transparent;
  }

  /* Hover state for standard scrollbar */
  &:hover {
    scrollbar-color: var(--color-fill-hover) transparent;
  }

  /* Variants */
  &.-auto {
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    /* Show on scroll */
    &:is(:hover, :focus-within) {
      scrollbar-width: thin;
      scrollbar-color: var(--color-fill-active) transparent;

      &::-webkit-scrollbar {
        display: block;
      }
    }
  }

  &.-always {
    scrollbar-width: thin;
    scrollbar-color: var(--color-fill-active) transparent;

    &::-webkit-scrollbar {
      display: block;
    }
  }

  &.-hidden {
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  /* Direction variants */
  &.-x {
    overflow-x: auto;
    overflow-y: hidden;
  }

  &.-y {
    overflow-x: hidden;
    overflow-y: auto;
  }

  /* Fade edges for smooth content transitions */
  &.-fade {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 20px;

      pointer-events: none;
      background: linear-gradient(
        to bottom,
        var(--color-surface) 0%,
        transparent 100%
      );

      z-index: 10;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 20px;

      pointer-events: none;
      background: linear-gradient(
        to top,
        var(--color-surface) 0%,
        transparent 100%
      );

      z-index: 10;
    }
  }

  /* Horizontal fade */
  &.-fade-x {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 20px;

      pointer-events: none;
      background: linear-gradient(
        to right,
        var(--color-surface) 0%,
        transparent 100%
      );

      z-index: 10;
    }

    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 20px;

      pointer-events: none;
      background: linear-gradient(
        to left,
        var(--color-surface) 0%,
        transparent 100%
      );

      z-index: 10;
    }
  }

  /* Max-height with custom property */
  &[--scroll-max] {
    max-height: var(--scroll-max, 20rem);
  }

  /* Smooth scrolling behavior */
  scroll-behavior: smooth;

  @media (prefers-reduced-motion: reduce) {
    scroll-behavior: auto;
  }
}

/* Utility class for common heights */
.ren-scroll-area-sm {
  max-height: 12rem;
}

.ren-scroll-area-md {
  max-height: 20rem;
}

.ren-scroll-area-lg {
  max-height: 30rem;
}

.ren-scroll-area-xl {
  max-height: 40rem;
}

.ren-scroll-area-full {
  height: 100%;
  max-height: none;
}
