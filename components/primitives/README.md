# RenDS Primitives

Low-level, foundational UI components for the RenDS design system. Each component is CSS-first with optional JavaScript enhancement for interactivity and accessibility.

All components respect `prefers-reduced-motion` and meet WCAG accessibility standards.

---

## Button

Accessible, multi-variant button with loading states and touch targets.

**Usage:**
```html
<button class="ren-btn">Click me</button>
<button class="ren-btn ren-btn-secondary ren-btn-sm">Cancel</button>
<button class="ren-btn ren-btn-danger" data-loading>Deleting...</button>
```

**Variants:** `primary`, `secondary`, `ghost`, `outline`, `danger`, `link`, `accent`
**Sizes:** `sm`, `md` (default), `lg`
**Special:** `.ren-btn-icon`, `.ren-btn-full`, `.ren-btn-group`
**States:** `disabled`, `[data-loading]`, `[aria-disabled="true"]`
**JS Import:** `import { RenButton } from './ren-button/ren-button.js';`
**A11y:** 44px minimum touch target, focus ring, `aria-busy` on loading state

---

## Field

Wraps form controls with label, description, and error messaging—auto-wires ARIA relationships.

**Usage:**
```html
<ren-field>
  <label>Email</label>
  <input type="email" placeholder="name@example.com">
  <span data-description>We'll never share your email.</span>
  <span data-error>Please enter a valid email.</span>
</ren-field>
```

**Variants:** Input sizes: `.ren-input-sm`, `.ren-input-lg`; Input icons: `.ren-input-wrapper`, `.ren-input-icon`
**States:** `[data-invalid]`, `[data-valid]`, `:user-invalid`, `:user-valid`
**JS Import:** `import { RenField } from './ren-field/ren-field.js';`
**A11y:** Auto-generates IDs, wires `aria-labelledby`, `aria-describedby`, `aria-errormessage`, and `aria-invalid`

---

## Checkbox

Custom-styled checkbox built on native `<input type="checkbox">`. Supports checked, indeterminate, and disabled states.

**Usage:**
```html
<label class="ren-checkbox">
  <input type="checkbox">
  <span class="ren-checkbox-control"></span>
  <span>Accept terms</span>
</label>
```

**Variants:** Standard, indeterminate
**States:** `:checked`, `:indeterminate`, `:disabled`, `:focus-visible`
**A11y:** Native input hidden visually but fully accessible; focus ring visible on keyboard navigation

---

## Badge

Small atomic label for status, category, or notification. CSS-only.

**Usage:**
```html
<span class="ren-badge">Neutral</span>
<span class="ren-badge ren-badge-primary">Active</span>
<span class="ren-badge ren-badge-dot"></span>
```

**Variants:** `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `outline`, `dot`
**A11y:** Semantic `<span>` or use with `role="status"` if providing updates

---

## Radio

Custom-styled radio button group with keyboard navigation via arrow keys.

**Usage:**
```html
<ren-radio-group>
  <label class="ren-radio">
    <input type="radio" name="option" value="a">
    <span class="ren-radio-control"></span>
    <span>Option A</span>
  </label>
  <label class="ren-radio">
    <input type="radio" name="option" value="b">
    <span class="ren-radio-control"></span>
    <span>Option B</span>
  </label>
</ren-radio-group>
```

**Attributes:** `orientation="vertical"` (default) or `"horizontal"`
**JS Import:** `import { RenRadioGroup } from './ren-radio/ren-radio.js';`
**A11y:** Arrow key navigation; roving tabindex; auto-checks selected radio; `role="radiogroup"` on container

---

## Progress

Progress bar and meter for visual indication of completion or measurement.

**Usage:**
```html
<div class="ren-progress">
  <div class="ren-progress-bar" style="width: 65%"></div>
</div>
<div class="ren-progress ren-progress-lg ren-progress-success">
  <div class="ren-progress-bar" style="width: 85%"></div>
</div>
```

**Sizes:** `.ren-progress-sm`, `.ren-progress-lg`, `.ren-progress-xl`
**Variants:** `success`, `warning`, `danger`, `info`
**Special:** `.ren-progress-indeterminate` for loading animation
**A11y:** Use `<progress>` or `<meter>` semantically; provide text label via `.ren-progress-label`

---

## Icon

Icon sizing, coloring, and animation utilities. Works with any SVG.

**Usage:**
```html
<span class="ren-icon ren-icon-md">
  <svg>...</svg>
</span>
<span class="ren-icon ren-icon-lg ren-icon-success ren-icon-spin">
  <svg>...</svg>
</span>
```

**Sizes:** `xs`, `sm`, `md` (default), `lg`, `xl`, `2xl`
**Colors:** `primary`, `success`, `warning`, `danger`, `muted`
**Animation:** `.ren-icon-spin` (respects `prefers-reduced-motion`)
**A11y:** Icons decorative by default; use with text or `aria-label` if meaningful

---

## Card

Versatile container for grouped content. Supports header, body, footer sections.

**Usage:**
```html
<div class="ren-card">
  <div class="ren-card-header">
    <h3 class="ren-card-title">Title</h3>
    <p class="ren-card-description">Description</p>
  </div>
  <div class="ren-card-body">Content</div>
  <div class="ren-card-footer">
    <button class="ren-btn">Action</button>
  </div>
</div>
```

**Variants:** `elevated`, `outline`, `ghost`, `sunken`
**Special:** `.ren-card-interactive`, `.ren-card-selectable`, `.ren-card-simple`
**States:** `[data-status="success|warning|danger|info"]` for accent border
**A11y:** Use semantic headings in header; sections optional

---

## Link

Styled anchor with variants for different contexts.

**Usage:**
```html
<a href="/page" class="ren-link">Standard link</a>
<a href="/page" class="ren-link ren-link-muted">Subtle link</a>
<a href="/page" class="ren-link-nav" aria-current="page">Nav link</a>
<a href="/page" class="ren-link-skip">Skip to content</a>
```

**Variants:** `muted`, `plain`, `external`, `nav`, `skip`
**A11y:** Focus ring on keyboard navigation; skip link jumps to main content; use `aria-current="page"` on active nav link

---

## Banner

Inline message for alerts, status updates, and notifications. Persistent (unlike toast).

**Usage:**
```html
<div class="ren-banner" role="status">
  <span class="ren-banner-icon">ℹ</span>
  <div class="ren-banner-content">
    <strong class="ren-banner-title">Info</strong>
    <p class="ren-banner-message">Your changes were saved.</p>
  </div>
</div>
```

**Variants:** `success`, `warning`, `danger`, `neutral`
**Special:** `.ren-banner-compact`, `.ren-banner-full`, `.ren-banner-dismiss`, `.ren-banner-actions`
**States:** `[data-dismissing]` for dismiss animation
**A11y:** Use `role="status"` for passive updates; `role="alert"` for urgent messages

---

## Breadcrumb

Hierarchical navigation trail showing page location.

**Usage:**
```html
<nav aria-label="Breadcrumb" class="ren-breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/products/shoes" aria-current="page">Shoes</a></li>
  </ol>
</nav>
```

**Separator:** Default is `›`; customize via `--breadcrumb-separator` CSS variable
**Special:** `.ren-breadcrumb-truncated` hides middle items for deep paths
**A11y:** `<nav aria-label="Breadcrumb">`, `<ol>` for list semantics, `aria-current="page"` on current item

---

## Pagination

Page navigation for lists and tables.

**Usage:**
```html
<nav aria-label="Pagination" class="ren-pagination">
  <a href="?p=1" class="ren-pagination-prev">&lsaquo;</a>
  <a href="?p=1" class="ren-pagination-item">1</a>
  <a href="?p=2" class="ren-pagination-item" aria-current="page">2</a>
  <a href="?p=3" class="ren-pagination-item">3</a>
  <a href="?p=3" class="ren-pagination-next">&rsaquo;</a>
</nav>
```

**Variants:** `simple` (prev + info + next only), `compact` (smaller targets), `centered`
**States:** `[aria-disabled="true"]` or `:disabled` for inactive prev/next; `[aria-current="page"]` for active item
**A11y:** 44px touch targets; `aria-label` on prev/next; `aria-current="page"` on active page number

---

## Tag

Interactive badge with optional dismiss button. Represents selected items or filters.

**Usage:**
```html
<span class="ren-tag">HTML</span>
<span class="ren-tag ren-tag-removable">
  React
  <button class="ren-tag-dismiss" aria-label="Remove">&times;</button>
</span>
<span class="ren-tag ren-tag-clickable" role="button" tabindex="0">Filter: Active</span>
```

**Variants:** `primary`, `success`, `warning`, `danger` (colors); `sm`, `lg` (sizes)
**Special:** `.ren-tag-removable`, `.ren-tag-clickable`
**States:** `[aria-pressed="true"]` or `[data-selected]` for selected state
**A11y:** Use `role="button"` and `tabindex="0"` on clickable tags; `aria-label` on dismiss buttons
