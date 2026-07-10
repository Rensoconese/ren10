---
type: "RenDS component-router"
title: "Component router"
description: "RenDS component-router generated from the RenDS knowledge graph."
id: foundation:component-router
sourcePath: components/components.md
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - component-router
  - ren10
  - rends
---

# Component router

Source path: `components/components.md`

## Relationships

_No outgoing relationships._

## Source Content

# Component Router

Load this file when deciding which RenDS component or pattern to use. After
choosing, load the exact colocated `component.md` or `pattern.md` before
writing markup, CSS, or JavaScript.

## Counts

- Primitives: 19
- Composites: 26
- Patterns: 8
- Total: 53

## Routing Rules

- Use primitives for atomic UI: buttons, badges, cards, fields, links, status,
  and simple form controls.
- Use composites when behavior needs JS enhancement, ARIA relationships,
  popover/dialog behavior, typeahead, roving focus, or state coordination.
- Use patterns for page-level structures and repeated product workflows.
- Do not invent component variants from memory. The colocated contract and CSS
  file are the public source of truth.
- Import component CSS explicitly unless the page already imports
  `rends/components/index.css`.

## Component Contracts

Every `component.md` and `pattern.md` follows the same schema:

- Purpose
- Use when
- Do not use when
- Required imports
- Canonical markup
- Variants
- States and attributes
- Public token API
- Accessibility contract
- Related files
- Test expectations

## Related Files

- `components/index.css` - full component CSS bundle.
- `components/primitives/*/component.md`
- `components/composites/*/component.md`
- `components/patterns/*/pattern.md`
- `docs/components.html`
- `docs/components-showcase.html`
