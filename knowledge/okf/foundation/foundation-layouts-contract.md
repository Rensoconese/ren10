---
type: "RenDS Contract"
title: "Layout primitives contract"
description: "RenDS Contract generated from the RenDS knowledge graph."
id: foundation:layouts-contract
sourcePath: base/layouts.md
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - layouts-contract
  - ren10
  - rends
---

# Layout primitives contract

Source path: `base/layouts.md`

## Relationships

_No outgoing relationships._

## Source Content

# Layout Contract

Load this file before writing custom layout CSS. RenDS layouts are public API:
agents should compose with layout primitives first and only write bespoke
layout CSS when the primitive set does not cover the problem.

## Purpose

- Keep page structure consistent across RenDS consumers.
- Avoid one-off `display: flex` and `display: grid` rules that duplicate the
  foundation.
- Ensure responsive behavior follows the same spacing, width, and container
  rules as the rest of the system.

## Routing Table

| Need | Use | Avoid |
|---|---|---|
| Vertical flow | `ren-stack`, `ren-stack-sm`, `ren-stack-lg` | Custom column flex |
| Inline wrapping group | `ren-cluster` | Custom wrap flex |
| Horizontal row | `ren-row` | Repeated `display:flex; align-items:center` |
| Left/right spread | `ren-row-spread` | Custom `justify-content: space-between` |
| Centered content | `ren-center`, `ren-center-narrow`, `ren-center-wide`, `ren-center-prose` | Fixed width + auto margins |
| Responsive cards | `ren-grid`, `ren-grid-2`, `ren-grid-3`, `ren-grid-4` | Hand-authored repeat grids |
| Sidebar + content | `ren-with-sidebar` | Custom fixed sidebar layout |
| Full-screen centered surface | `ren-cover` | `min-height:100vh` centering |
| Aspect-ratio media | `ren-frame`, `ren-frame-square`, `ren-frame-photo` | Ad hoc aspect wrappers |
| Responsive direction switch | `ren-switcher` | Viewport-only flex swaps |
| Horizontal scroll | `ren-reel` | Raw overflow and scroll snap |

## Required Imports

```html
<link rel="stylesheet" href="rends/index.css">
```

## Rules

- Decide the page skeleton before selecting components.
- Use layout primitives for structure, then place primitives/composites/patterns
  inside them.
- Prefer `gap` on the parent over margins on children.
- Prefer container-query helpers when behavior depends on component width.
- Keep nested layout primitives shallow; flatten structure when possible.
- Use semantic spacing tokens such as `--space-*`, `--space-card-padding`, and
  `--space-section` when a custom value is unavoidable.

## Related Files

- `base/layouts.css` - implementation source of truth.
- `base/grid.css` - grid helpers.
- `base/utilities.css` - small utilities.
- `rends-skill/references/architecture.md` - expanded agent guidance.
- `docs/layouts.html` - visual reference.

## Test Expectations

- Layout changes should keep responsive docs/pages readable at mobile and
  desktop widths.
- Do not add raw layout CSS when an existing primitive can express the same
  structure.
