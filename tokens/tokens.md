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
- Do not override semantic tokens inside a component implementation. Apply
  page-wide semantic themes at `:root` (including a root `data-theme` attribute).
  Scoped component-token overrides may live on any wrapping element; inherited
  aliases do not automatically recompute when only their source token changes.
- Use `light-dark()` in the semantic layer; do not write `.dark` patches.
- Use `--color-border-interactive` for actionable control borders. It must meet
  3:1 against adjacent neutral surfaces and control fills, including hover and
  active fills; decorative border tokens have no such guarantee.
- Use `--color-*-strong` for status/accent text on neutral surfaces.
- Use `--color-on-*` only on the matching solid background. Keep the entire
  interactive ramp at 4.5:1 for normal text: `--color-on-accent` pairs with
  `--color-accent`, `--color-accent-hover`, and `--color-accent-active`;
  `--color-on-danger` pairs with the equivalent danger state tokens.
- Pair `--color-on-surface-contrast` only with
  `--color-surface-contrast` for editorial surfaces that remain dark in every
  theme.
- Do not use `--color-text-faint` for information the user must read.
- Use semantic motion tokens and transition presets; do not write raw
  durations or easings in components.

## Visual Reference Mapping

`generateThemeFromReference()` maps observations to the existing public tokens:

- `colors.background` → `--color-surface`, the page/body background
- `colors.surface` → `--color-surface-raised` and `--color-surface-overlay`, the
  card/dialog/popover surface; defaults to the page background when omitted
- `typography.fontSans` → `--font-sans`
- `typography.fontDisplay` → `--font-heading`
- `motion` → `--duration-fast`, `--duration-normal`, and `--duration-slow`

There is no separate `--color-bg`, `--font-display`, or `--duration-base` API.
Use a generated theme on the document root for these page-wide choices.
Generated CSS includes a same-scope reduced-motion override that zeros the three
motion durations. Keep that media block when installing the theme: unlayered
motion overrides otherwise outrank the foundation's layered accessibility defaults.

## Typed Length Defaults

Spacing and radius tokens remain unregistered and `rem`-based so root font-size
preferences scale them consistently in Chromium, Firefox, and WebKit. Typed
length registration freezes these root-relative values in Firefox and WebKit;
color and duration tokens retain their valid, independent registrations.

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
