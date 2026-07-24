# Token Contract

Load this file before choosing colors, spacing, typography, radius, shadows,
motion, z-index, or component-level theme overrides.

## Purpose

RenDS uses a three-layer token model:

1. Primitive tokens are raw values: `--blue-500`, `--space-4`,
   `--text-base`, `--radius-md`.
2. Semantic tokens describe intent: `--color-accent`,
   `--color-text-muted`, `--space-card-padding`, `--duration-enter`.
3. Component tokens expose public override points:
   `--ren-btn-bg`, `--ren-card-radius`, `--ren-dialog-width`.

Components consume semantic or component tokens. They do not consume primitive
tokens directly.

## Required Imports

```html
<link rel="stylesheet" href="rends/index.css">
<link rel="stylesheet" href="rends/tokens/component/tokens.css">
```

Use `tokens/component/tokens.css` when a page or component depends on the
component token API.

## Rules

- Use semantic tokens for day-to-day UI values.
- Add a semantic token when an intent is missing; do not hard-code raw values.
- Use component tokens for surgical component theming.
- Do not override semantic tokens inside a component implementation; override
  at `:root`, `[data-theme]`, or a consumer-owned theme scope.
- Use `light-dark()` in the semantic layer; do not write `.dark` patches.
- Use `--color-border-interactive` for actionable control borders.
- Use `--color-*-strong` for status/accent text on neutral surfaces.
- Use `--color-on-*` only on the matching solid background.
- Pair `--color-on-surface-contrast` only with
  `--color-surface-contrast` for editorial surfaces that remain dark in every
  theme.
- Do not use `--color-text-faint` for information the user must read.
- Use semantic motion tokens and transition presets; do not write raw
  durations or easings in components.

## Related Files

- `tokens/primitives/*.css` - raw palettes and scales.
- `tokens/semantic/*.css` - intent-based token layer.
- `tokens/component/tokens.css` - public component override API.
- `tokens/registered-properties.css` - typed CSS custom properties.
- `rends-skill/references/tokens.md` - expanded agent reference.
- `docs/tokens.html` - visual docs page.

## Test Expectations

- CSS lint should pass after token edits.
- Accessibility/a11y checks should pass when color pairings change.
- Any new component value should be expressible as a semantic or component
  token before shipping.
