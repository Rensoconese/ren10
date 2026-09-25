# Migration guide

## 0.14.0 — field-audit corrections

- The standalone reset declares the `reset` layer, including when loaded
  directly, so it cannot override component typography or surfaces.
- All component CSS now declares the `components` cascade layer itself. Load
  `foundation.css` once and import component CSS directly, including through
  Astro wrappers. Remove redundant `layer(components)` from selective imports
  to avoid a nested `components.components` layer. The complete and split
  bundles preserve the same layer order as source files. Ordinary unlayered
  application overrides win consistently; review workarounds that previously
  depended on the broken bundle's higher specificity.
- A `.ren-stack` now owns direct flow-element block margins and initializes
  its own `--stack-gap`. A nested plain stack no longer inherits a parent's
  size modifier. Add the desired modifier or `--stack-gap` to each stack;
  change `--space-stack` for a shared theme default. Comfortable/compact/
  spacious defaults remain 12/8/16px. Explicit size modifiers stay fixed.
  Nested prose inside a wrapper retains classless reading rhythm.
- `.ren-card-cover` is an edge-to-edge image or image wrapper. Remove local
  fixes that compensated for first/last-child padding after visually checking
  the upgraded card. `.ren-card-simple` is for sectionless content and applies
  padding once on the root. Do not combine it with structured slots.
- Refresh older installed Ren10 skills from `skills/rends/`; check provenance
  with `npm run agent:provenance -- --skill /path/to/SKILL.md /path/to/project`.
  Equal package versions can still contain different CSS; compare hashes.
- See `docs/composition-recipes.md` and `examples/tour-composition.html` for
  wrapping CTA labels, consent/form groups and informational tour actions.

Upgrade and visually verify each consumer
before removing its existing compatibility patches.

## 0.9.x

Use lowercase contract paths (`ren-design.md`, `tokens.md`, `layouts.md`,
`components.md`). Replace primitive palette variables with semantic `--color-*`
tokens and load `index.css` once. Run `npm run lint:contracts` to find stale
aliases before upgrading.
