---
type: "RenDS primitive-zero"
title: "Native HTML contract"
description: "RenDS primitive-zero generated from the RenDS knowledge graph."
id: foundation:primitive-zero
sourcePath: base/primitive-zero.md
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - primitive-zero
  - ren10
  - rends
---

# Native HTML contract

Source path: `base/primitive-zero.md`

## Relationships

_No outgoing relationships._

## Source Content

# Primitive Zero Contract

Primitive Zero is RenDS' classless layer: native HTML elements styled through
`base/classless.css` before any `ren-` component class is introduced. Load this
file when an agent is about to write semantic HTML, prose content, form
structure, tables, media, or document scaffolding without a component class.

## Purpose

- Preserve browser semantics first: headings, paragraphs, lists, tables, forms,
  media, landmarks, and disclosure elements should be valid native HTML before
  they become RenDS components.
- Provide readable default typography, spacing, focus rings, and reduced-motion
  behavior through tokens.
- Define when a tag graduates from classless HTML into a primitive, composite,
  or pattern.

## Use Primitive Zero When

- The element is meaningful HTML on its own: `h1`, `p`, `a`, `ul`, `ol`,
  `blockquote`, `table`, `fieldset`, `details`, `summary`, `figure`, `code`,
  `pre`, `kbd`, `mark`, `del`, `ins`, landmarks, and form labels.
- The visual behavior can be handled by `base/classless.css` and semantic
  tokens.
- The user benefits from native browser behavior even if JavaScript is disabled.

## Graduate To A Component When

- The element needs a named public API, variants, state, or custom properties.
- Interaction requires ARIA wiring, roving tabindex, focus trapping, dismiss
  behavior, typeahead, live-region announcements, or JS enhancement.
- A repeated UI object needs a `ren-` class so consumers can theme it
  intentionally.

## Required Imports

```html
<link rel="stylesheet" href="rends/index.css">
```

`rends/index.css` imports reset, tokens, base classless styles, layouts, motion
presets, and utilities. Component CSS is not required for Primitive Zero.

## Accessibility Contract

- Use landmarks for structure, not decoration. Primitive Zero applies no visual
  chrome to `header`, `nav`, `main`, `article`, `section`, `aside`, or `footer`.
- Use `:focus-visible` behavior from the foundation; do not remove the focus
  ring.
- Keep body text readable: do not drop below the RenDS minimum type scale.
- Respect `prefers-reduced-motion`; foundation tokens collapse motion before
  component overrides.
- Do not use color alone for state. Pair error/success/warning with text,
  icons, or ARIA where needed.

## Related Files

- `base/classless.css` - implementation source of truth.
- `base/reset.css` - browser normalization.
- `base/motion-alternatives.css` and `base/motion-presets.css` - motion safety.
- `docs/primitive-zero.html` - visual reference and element catalog.
- `_archive/PRIMITIVE-ZERO-A11Y-AUDIT.md` - historical audit context.

## Test Expectations

- `npm run test:a11y` must keep `docs/primitive-zero.html` free of axe
  violations.
- Manual review should cover keyboard focus, headings, links, table captions,
  form labels, `details/summary`, and code/pre wrapping in both light and dark
  themes.
