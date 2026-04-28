# RenDS

A vanilla, accessible, atomic design system. No framework required.

Built with pure HTML, CSS, and Web Components. You own the code — copy what you need, override what you want, no build step required.

Current version: **0.8.2**

---

## Quick Start

The fastest way to start is the CLI, which scaffolds a `rends/` folder into your project (shadcn/ui style — you own the files):

```bash
npx rends init
npx rends add button dialog tooltip
# or grab everything
npx rends add --all
```

Then link the foundation and whatever components you added:

```html
<!-- Foundation: reset + tokens + base layers -->
<link rel="stylesheet" href="rends/index.css">

<!-- All components in one file -->
<link rel="stylesheet" href="rends/components/index.css">

<!-- …or cherry-pick -->
<link rel="stylesheet" href="rends/components/primitives/ren-button/ren-button.css">
```

And use them:

```html
<button class="ren-btn">Click me</button>
<button class="ren-btn ren-btn-secondary">Cancel</button>

<!-- Same component, also available as a custom element -->
<ren-button variant="primary">Click me</ren-button>
```

Import JavaScript only for the interactive composites that need it:

```html
<script type="module" src="rends/components/composites/ren-dialog/ren-dialog.js"></script>
```

That's it. No build step, no bundler, no framework.

### Manual install

If you'd rather not use the CLI, clone the repo and copy the `rends/` folder into your project:

```bash
git clone https://github.com/Rensoconese/ren10.git
cp -r ren10/rends ./my-project/
```

---

## Core Concepts

### Token System

Every visual property comes from a design token. Three layers:

**Primitives** — Raw values (`--blue-500`, `--space-4`, `--text-base`). Don't consume these directly in components.

**Semantic** — Purpose-based (`--color-accent`, `--color-text-muted`, `--color-surface`). This is the layer you normally work with.

**Component** — Per-component overrides for theming (`--ren-btn-bg`, `--ren-card-radius`).

Layers flow top-down: change a primitive to re-skin everything, change a semantic to affect a group, change a component token for surgical overrides.

### Motion Tokens

Durations and easings are semantic, not time-based:

- `--duration-tactile` / `--duration-state` / `--duration-enter` / `--duration-exit` / `--duration-overlay` / `--duration-route` / `--duration-emphasize`
- `--ease-enter` / `--ease-exit` / `--ease-state-change` / `--ease-playful`

Legacy aliases (`--duration-fast`, `--ease-out`, etc.) still resolve, so existing consumers keep working.

### Layout Primitives

Composable layout classes — use them instead of hand-rolling flexbox/grid:

| Need                    | Use                     |
| ----------------------- | ----------------------- |
| Vertical stack          | `ren-stack`             |
| Items that wrap         | `ren-cluster`           |
| Horizontal row          | `ren-row`               |
| Spread left + right     | `ren-row-spread`        |
| Centered container      | `ren-center`            |
| Responsive grid         | `ren-grid`, `ren-grid-3`|
| Sidebar + content       | `ren-with-sidebar`      |
| Full-screen centered    | `ren-cover`             |

### Theming

Apply themes with data attributes on `<html>`:

```html
<html data-theme="ocean" data-shape="rounded" data-density="comfortable">
```

**Built-in themes:** `slate`, `ocean`, `forest`, `sunset`, `rose`, `purple`, `amber-editorial`, `cyber`, `minimal-mono`.
**Shape:** `sharp`, `rounded`, `pill`.
**Density:** `compact`, `comfortable` (default), `spacious`.

Dark mode is automatic via `color-scheme: light dark`. Force it with `data-theme="dark"` or `data-theme="light"`.

Need a custom palette? The hex→tokens generator at `themes/preview.html` takes your brand colors, computes AA (and optionally AAA) accessible pairs, and outputs ready-to-paste CSS custom properties.

### CSS Cascade Layers

```css
@layer reset, tokens, base, components, utilities;
```

Any CSS you write outside a layer automatically overrides RenDS styles. No `!important` needed.

---

## Architecture

```
rends/
├── index.css           ← Import this for the foundation (reset + tokens + base)
├── tokens/             ← Primitives, semantic, component tokens + motion
├── base/               ← Reset, classless styles, layouts, utilities, motion presets
├── components/
│   ├── index.css       ← Bundle import of every component's CSS
│   ├── primitives/     ← Button, Badge, Card, Field, Link, Progress, Tag…
│   ├── composites/     ← Dialog, Select, Tabs, Tooltip, Calendar, Date Picker…
│   └── patterns/       ← Nav, Sidebar, Table, Form, Menubar, Command, AI…
├── utils/              ← JS utilities (focus trap, keyboard nav, portals, live-region)
├── themes/             ← Theme presets + hex→token generator
├── blocks/             ← Full page examples (dashboard, auth, settings, landing, blog)
├── cli/                ← `npx rends` CLI (init, add, list, scales)
└── docs/               ← Demo pages, component catalog, token reference
```

52 components in total: 18 primitives, 26 composites, 8 patterns.

---

## CLI Reference

```
npx rends init                           Initialize a new RenDS project
npx rends init --scale perfect-fourth    Use a modular type scale
npx rends init --scale minor-third --fluid  Fluid clamp() responsive typography
npx rends add <component>...             Add one or more components
npx rends add --all                      Add every component
npx rends list                           List all available components
npx rends scales                         List available type scale ratios
npx rends help                           Show help
```

---

## Accessibility

All components meet WCAG 2.1 AA as a baseline, with an AAA opt-in mode in the theme generator:

- Full keyboard navigation on every interactive component
- ARIA attributes, roles, and live regions wired by default
- Visible focus rings that respect user overrides
- 44px minimum touch targets
- `prefers-reduced-motion` respected across all transitions and animations
- 4.5:1 minimum color contrast (7:1 in AAA mode)

Run the a11y suite locally:

```bash
npm run test:a11y
```

---

## Testing

```bash
npm run test              # all Playwright suites
npm run test:a11y         # axe-core accessibility audit
npm run test:visual       # visual regression (baselines per-project)
npm run test:components   # per-component demo render + scoped a11y
npm run lint              # stylelint + eslint
```

---

## Browser Support

Chrome, Edge, Firefox, Safari — latest 2 versions. No IE 11.

---

## License

MIT © 2025 Ren
