# RenDS

A vanilla, accessible, atomic design system. No framework required.

Built entirely with pure HTML, CSS, and JavaScript — plus Web Components for encapsulation. Inspired by shadcn/ui's "own the code" approach.

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/rends.git
```

### 2. Copy into your project

Copy the `rends/` folder (or the whole repo) into your project directory:

```
my-project/
├── rends/          ← put it here
├── index.html
└── styles.css
```

### 3. Link the CSS

```html
<!-- Foundation: tokens, reset, layouts, utilities -->
<link rel="stylesheet" href="rends/index.css">

<!-- Components: all at once or individually -->
<link rel="stylesheet" href="rends/components/all.css">

<!-- OR pick only what you need -->
<link rel="stylesheet" href="rends/components/primitives/button/button.css">
```

### 4. Use it

```html
<button class="ren-btn">Click me</button>
<button class="ren-btn ren-btn-secondary">Secondary</button>

<div class="ren-card">
  <div class="ren-card-header">Title</div>
  <div class="ren-card-body">Content goes here.</div>
</div>
```

### 5. Add JS only when needed

Most components are CSS-only. Import JavaScript only for interactive composites:

```html
<script type="module" src="rends/components/composites/dialog/dialog.js"></script>
```

That's it. No build step, no npm, no framework.

---

## Using the CLI (optional)

If you prefer to add components one at a time (shadcn/ui style):

```bash
# Initialize config
node rends/cli/index.js init

# Add specific components
node rends/cli/index.js add button
node rends/cli/index.js add dialog tooltip

# See everything available
node rends/cli/index.js list
```

---

## Core Concepts

### Token System

Every visual property comes from a design token. Three layers:

**Primitives** — Raw values (don't use directly in components):
```css
--blue-500, --space-4, --text-base
```

**Semantic** — Purpose-based (this is what you use):
```css
--color-accent, --color-text-muted, --color-surface
```

**Component** — Per-component overrides for theming:
```css
--ren-btn-bg, --ren-card-radius
```

### Layout Primitives

RenDS includes composable layout classes. Use these instead of writing custom flexbox/grid:

| Need | Use |
|------|-----|
| Vertical stack | `ren-stack` |
| Horizontal items that wrap | `ren-cluster` |
| Horizontal row | `ren-row` |
| Spread left + right | `ren-row-spread` |
| Centered container | `ren-center` |
| Responsive grid | `ren-grid`, `ren-grid-3` |
| Sidebar + content | `ren-with-sidebar` |
| Full-screen centered | `ren-cover` |

### Theming

Apply themes with data attributes on `<html>`:

```html
<html data-theme="ocean" data-shape="rounded" data-density="compact">
```

**Themes:** `slate` (default), `ocean`, `forest`, `sunset`, `rose`, `purple`
**Shape:** `sharp`, `rounded`, `pill`
**Density:** `comfortable` (default), `compact`, `spacious`

Dark mode is automatic via `color-scheme: light dark`.

### CSS Cascade Layers

```css
@layer reset, tokens, base, components, utilities;
```

Any CSS you write outside a layer automatically overrides RenDS styles. No `!important` needed.

---

## Architecture

```
rends/
├── index.css           ← Import this one file for the foundation
├── tokens/             ← Design tokens (primitives, semantic, component)
├── base/               ← Reset, classless styles, layouts, utilities
├── components/
│   ├── primitives/     ← Button, Badge, Card, Field, etc.
│   ├── composites/     ← Dialog, Select, Tabs, Tooltip, etc.
│   └── patterns/       ← Nav, Sidebar, Table, Form, etc.
├── utils/              ← JS utilities (focus trap, keyboard nav, etc.)
├── themes/             ← Theme presets
├── blocks/             ← Full page examples (dashboard, auth, settings)
├── cli/                ← CLI tool for adding components
└── docs/               ← Demos and documentation
```

## Accessibility

All components are WCAG 2.1 AA compliant with:

- Full keyboard navigation
- ARIA attributes and roles
- Visible focus rings
- 44px minimum touch targets
- `prefers-reduced-motion` support
- 4.5:1 minimum color contrast

## Browser Support

Chrome, Edge, Firefox, Safari (latest 2 versions). No IE 11.

## License

MIT © 2025 Ren
