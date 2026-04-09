# RenDS Patterns Tier

Complex, production-ready organism-level components for application layouts and interactions. Built with modern web standards: Web Components, CSS custom properties, and ARIA accessibility.

## Components

### 1. ren-nav — Responsive Navigation Bar

Responsive navigation with mobile hamburger menu, dropdown support, and sticky variants.

**HTML Usage:**
```html
<ren-nav class="ren-nav-sticky">
  <a href="/" class="ren-nav-brand">
    <svg><!-- logo --></svg> Brand
  </a>
  <ul class="ren-nav-links">
    <li><a href="/about" class="ren-nav-link">About</a></li>
    <li><a href="/docs" class="ren-nav-link">Docs</a></li>
  </ul>
  <div class="ren-nav-actions">
    <button class="ren-nav-toggle" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</ren-nav>
```

**CSS Classes:**
- `.ren-nav` — Root container
- `.ren-nav-sticky` — Sticky positioning with blur effect
- `.ren-nav-transparent` — Transparent background
- `.ren-nav-links` — Desktop menu flex layout
- `.ren-nav-link` — Individual nav link
- `.ren-nav-dropdown` — Dropdown menu wrapper

**JavaScript API:**
```javascript
// Set active link by href
nav.setActiveLink('/docs');

// Check if mobile menu is open
if (nav.isOpen) { /* ... */ }

// Events: click triggers ren-nav-dropdown management
```

**Keyboard Navigation:**
- Escape — Close mobile menu
- Tab — Navigate through links

**Accessibility:**
- `aria-expanded` on toggle button
- `aria-current="page"` on active link
- Focus-visible indicators on all interactive elements

---

### 2. ren-sidebar — Collapsible App Sidebar

App layout sidebar with desktop collapse, mobile overlay, state persistence, and tooltips.

**HTML Usage:**
```html
<ren-sidebar>
  <div class="ren-sidebar-header">
    <h2>Navigation</h2>
    <button class="ren-sidebar-toggle">⟨</button>
  </div>
  <div class="ren-sidebar-content">
    <nav class="ren-sidebar-nav">
      <a href="/" class="ren-sidebar-item" data-tooltip="Dashboard">
        <svg class="ren-sidebar-item-icon"></svg>
        <span class="ren-sidebar-item-text">Dashboard</span>
      </a>
    </nav>
  </div>
</ren-sidebar>
<div class="ren-sidebar-overlay"></div>
```

**CSS Classes:**
- `.ren-sidebar` — Root (uses `data-collapsed`, `data-open`)
- `.ren-sidebar-item` — Nav item with hover states
- `.ren-sidebar-item-icon` — Icon container
- `.ren-sidebar-item-text` — Text (hides when collapsed)
- `.ren-sidebar-section-label` — Section group label

**JavaScript API:**
```javascript
sidebar.toggleMenu();                  // Mobile menu toggle
sidebar.setActiveItem('/dashboard');   // Set active nav item
sidebar.openMobileMenu();              // Open mobile overlay
console.log(sidebar.isCollapsed);      // Check collapse state

// Event: ren-sidebar-toggle { collapsed: boolean }
```

**Keyboard Navigation:**
- Escape — Close mobile overlay

**Accessibility:**
- `aria-current="page"` on active item
- Tooltips via `data-tooltip` when collapsed
- Focus-visible on all interactive elements

---

### 3. ren-command — Command Palette / Spotlight

Dialog-based command palette with real-time filtering, keyboard navigation, and multi-word search.

**HTML Usage:**
```html
<ren-command data-shortcut="ctrl+k">
  <dialog class="ren-command">
    <div class="ren-command-input-wrapper">
      <input class="ren-command-input" placeholder="Search commands...">
      <div class="ren-command-kbd"><kbd>Cmd</kbd><kbd>K</kbd></div>
    </div>
    <div class="ren-command-list">
      <div class="ren-command-group">
        <div class="ren-command-group-heading">Navigation</div>
        <button class="ren-command-item" data-value="dashboard" data-keywords="home">
          <div class="ren-command-item-content">
            <div class="ren-command-item-title">Dashboard</div>
            <div class="ren-command-item-description">Go to dashboard</div>
          </div>
          <div class="ren-command-item-shortcut">⌘D</div>
        </button>
      </div>
      <div class="ren-command-empty">No results found.</div>
    </div>
  </dialog>
</ren-command>
```

**CSS Classes:**
- `.ren-command` — Dialog container with animation
- `.ren-command-input` — Search input
- `.ren-command-item` — Command item (has `data-highlighted`)
- `.ren-command-item-title`, `.ren-command-item-description` — Text content
- `.ren-command-group` — Collapsible group (hides when `data-empty`)

**JavaScript API:**
```javascript
command.open();                        // Open palette
command.close();                       // Close palette
command.registerAction('save', () => { /* ... */ });

// Event: ren-command-select { item, value, action }
```

**Keyboard Navigation:**
- Ctrl+K / Cmd+K — Global shortcut
- Arrow Up/Down — Navigate items
- Enter — Select item
- Escape — Close

**Accessibility:**
- `aria-expanded` on group headers
- Focus management with auto-focus on open
- Screen reader friendly descriptions

---

### 4. ren-table — Data Table with Sorting, Filtering, Pagination

Comprehensive data table with sort indicators, row selection, column resize, and pagination.

**HTML Usage:**
```html
<ren-table data-page-size="10">
  <div class="ren-table-toolbar">
    <input class="ren-input" placeholder="Search..." data-table-search>
  </div>
  <div class="ren-table-wrapper">
    <table class="ren-table">
      <thead class="ren-table-header">
        <tr>
          <th class="ren-th ren-table-select">
            <input type="checkbox" aria-label="Select all">
          </th>
          <th class="ren-th ren-th-sortable" data-column="name">Name</th>
          <th class="ren-th ren-th-sortable" data-column="email">Email</th>
        </tr>
      </thead>
      <tbody class="ren-table-body">
        <tr class="ren-tr" data-row-id="1">
          <td class="ren-td ren-table-select">
            <input type="checkbox">
          </td>
          <td class="ren-td">John Doe</td>
          <td class="ren-td">john@example.com</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="ren-table-pagination"></div>
</ren-table>
```

**CSS Classes:**
- `.ren-table` — Table element
- `.ren-th-sortable` — Sortable header (gets `data-sort="asc"` or `desc"`)
- `.ren-tr` — Table row (gets `aria-selected`)
- `.ren-td` — Table cell
- `.ren-table-select` — Checkbox column
- `.ren-table-compact`, `.ren-table-comfortable` — Density variants

**JavaScript API:**
```javascript
table.setLoading(true);                // Show shimmer overlay
table.setDensity('compact');           // 'default' | 'compact' | 'comfortable'
table.getSelectedRows();               // Array of selected row IDs
table.clearSelection();                // Clear all selections
table.filter(columnIndex, value);      // Filter by column

// Events: ren-sort, ren-select, ren-page, ren-filter
```

**Keyboard Navigation:**
- Arrow keys — Navigate cells
- Space — Toggle row selection
- Shift+Click — Range select rows
- Enter — Sort (on header)

**Accessibility:**
- `aria-sort` on sortable headers
- `aria-selected` on selected rows
- Column headers with proper roles
- High contrast support

---

### 5. ren-form — Multi-Step Form with Validation

Form validation system supporting multiple validation modes, field rules, and step-by-step flows.

**HTML Usage:**
```html
<ren-form data-validate="onTouched" data-steps="2">
  <form class="ren-form">
    <div class="ren-form-error-summary" hidden>
      <strong>Please fix errors:</strong>
      <ul></ul>
    </div>

    <div class="ren-form-progress">
      <div class="ren-form-step" data-step="1" data-active>
        <span class="ren-form-step-label">Account</span>
      </div>
      <div class="ren-form-step" data-step="2">
        <span class="ren-form-step-label">Confirm</span>
      </div>
    </div>

    <div class="ren-form-section">
      <h2 class="ren-form-section-title">Account Info</h2>
      <div class="ren-field" data-rules="required|email">
        <label class="ren-field-label">Email</label>
        <input class="ren-input" type="email" name="email" required>
        <span class="ren-field-error" hidden></span>
      </div>
    </div>

    <div class="ren-form-actions">
      <button type="button">Previous</button>
      <button type="submit">Submit</button>
    </div>
  </form>
</ren-form>
```

**CSS Classes:**
- `.ren-form` — Container
- `.ren-form-section` — Grouped fields
- `.ren-form-row` — Horizontal field layout (responsive)
- `.ren-form-step` — Progress indicator (gets `data-active`, `data-completed`, `data-disabled`)
- `.ren-form-error-summary` — Error list (shows when `data-has-errors`)

**Validation Rules:**
`required | email | min:8 | max:50 | pattern:regex | match:fieldName`

**JavaScript API:**
```javascript
form.validate();                       // { valid: bool, errors: [] }
form.getValues();                      // Form data as object
form.reset();                          // Clear form and errors
form.setErrors([{name, message}]);     // Server-side errors
form.setFieldError(name, message);
form.nextStep();                       // Move to next step
form.prevStep();                       // Move to previous step

// Events: ren-submit, ren-invalid, ren-step-change, ren-field-validated
// Custom validators: RenForm.registerValidator('customRule', (value) => null|error)
```

**Keyboard Navigation:**
- Tab — Navigate fields

**Accessibility:**
- `aria-invalid` on invalid fields
- `aria-errormessage` links to error text
- Required field labels marked with `data-required`
- Focus management on error scroll

---

### 6. ren-menubar — Application Menu Bar

Horizontal menu bar with WAI-ARIA menubar pattern, keyboard navigation, checkbox/radio items.

**HTML Usage:**
```html
<ren-menubar>
  <div class="ren-menubar" role="menubar">
    <button class="ren-menubar-trigger" aria-haspopup="menu">File</button>
    <div class="ren-menubar-menu" role="menu" hidden>
      <button class="ren-menubar-item" role="menuitem">New</button>
      <button class="ren-menubar-item" role="menuitem">Open</button>
      <div class="ren-menubar-separator"></div>
      <button class="ren-menubar-item ren-menubar-checkbox"
              role="menuitemcheckbox" aria-checked="false">
        Show Sidebar
      </button>
      <button class="ren-menubar-item ren-menubar-submenu" role="menuitem">
        View
        <div class="ren-menubar-menu" role="menu" hidden>
          <button class="ren-menubar-item" role="menuitem">Zoom In</button>
        </div>
      </button>
    </div>
  </div>
</ren-menubar>
```

**CSS Classes:**
- `.ren-menubar` — Root container
- `.ren-menubar-trigger` — Top-level menu button
- `.ren-menubar-menu` — Dropdown panel (gets `hidden`)
- `.ren-menubar-item` — Menu item
- `.ren-menubar-separator` — Divider
- `.ren-menubar-submenu` — Item with submenu (has chevron)
- `.ren-menubar-checkbox` — Checkbox item
- `.ren-menubar-radio` — Radio item

**JavaScript API:**
```javascript
menubar.closeAll();                    // Close all open menus
menubar.openMenu(triggerIndex);        // Open specific menu

// Event: ren-menubar-select { item, value, checked? }
```

**Keyboard Navigation:**
- Arrow Right/Left — Navigate triggers
- Arrow Down/Up — Navigate items
- Enter / Space — Select item
- Escape — Close menu
- Home / End — First/last item
- Typeahead — Type first letter to jump to item

**Accessibility:**
- WAI-ARIA menubar pattern with proper roles
- `aria-expanded` on triggers
- `aria-checked` on checkbox/radio items
- Roving focus with visible indicators

---

### 7. ren-empty-state — Empty State Pattern (CSS-only)

Reusable pattern for empty/no-data states. No JavaScript required.

**HTML Usage:**
```html
<div class="ren-empty-state">
  <div class="ren-empty-state-icon">📦</div>
  <h3 class="ren-empty-state-title">No products yet</h3>
  <p class="ren-empty-state-description">
    Add your first product to get started.
  </p>
  <div class="ren-empty-state-actions">
    <button class="ren-btn">Add product</button>
    <button class="ren-btn ren-btn-secondary">Learn more</button>
  </div>
</div>
```

**CSS Classes:**
- `.ren-empty-state` — Container (centered, with padding)
- `.ren-empty-state-icon` — Icon/illustration (4rem circle)
- `.ren-empty-state-title` — Main heading
- `.ren-empty-state-description` — Supporting text
- `.ren-empty-state-actions` — Button group
- `.ren-empty-state-compact` — Smaller variant
- `.ren-empty-state-bordered` — Dashed border for inline use

**No JavaScript API** — Pure CSS styling.

**Accessibility:**
- Semantic heading structure
- Adequate color contrast
- Text-based messaging (not icon-only)

---

### 8. ren-ai — AI Content Patterns (CSS-only)

Design patterns for AI-generated content, inspired by IBM Carbon for AI.

**HTML Usage:**
```html
<!-- AI Slug -->
<span class="ren-ai-slug">AI</span>

<!-- AI Message -->
<div class="ren-ai-message">
  <div class="ren-ai-message-header">
    <span class="ren-ai-slug">AI</span>
    Claude
  </div>
  <div class="ren-ai-message-content">
    This is an AI-generated response with streaming.
  </div>
  <div class="ren-ai-message-footer">
    <button class="ren-ai-action">👍</button>
    <button class="ren-ai-action">👎</button>
  </div>
</div>

<!-- Streaming Indicator -->
<div class="ren-ai-message ren-ai-streaming">
  <div class="ren-ai-message-content">Generating response...</div>
</div>

<!-- Typing Indicator -->
<div class="ren-ai-typing">
  Thinking
  <div class="ren-ai-typing-dots">
    <span></span><span></span><span></span>
  </div>
</div>

<!-- Citation -->
<p>According to research<a href="#" class="ren-ai-citation">[1]</a></p>

<!-- Sources List -->
<div class="ren-ai-sources">
  <a href="https://..." class="ren-ai-source">
    <div class="ren-ai-source-number">1</div>
    <div>
      <div class="ren-ai-source-title">Article Title</div>
      <div class="ren-ai-source-url">example.com</div>
    </div>
  </a>
</div>

<!-- Confidence Indicator -->
<div class="ren-ai-confidence" data-level="high">
  Confidence
  <div class="ren-ai-confidence-bar">
    <div class="ren-ai-confidence-fill"></div>
  </div>
</div>

<!-- Prompt Input -->
<div class="ren-ai-prompt">
  <textarea class="ren-ai-prompt-input" placeholder="Ask anything..."></textarea>
  <button class="ren-ai-prompt-send">↑</button>
</div>

<!-- Skeleton Loading -->
<div class="ren-ai-skeleton">
  <div class="ren-ai-skeleton-line"></div>
  <div class="ren-ai-skeleton-line"></div>
</div>
```

**CSS Classes:**
- `.ren-ai-slug` — Purple "AI" label badge
- `.ren-ai-message` — Chat bubble with left purple border
- `.ren-ai-streaming` — Adds blinking cursor animation
- `.ren-ai-typing` — "AI is thinking" indicator with animated dots
- `.ren-ai-citation` — Citation badge (links to sources)
- `.ren-ai-sources` — Source reference list
- `.ren-ai-confidence` — Confidence bar (data-level: high|medium|low)
- `.ren-ai-prompt` — Chat input container
- `.ren-ai-skeleton` — Shimmer loading placeholder

**No JavaScript API** — Pure CSS styling and animations.

**Accessibility:**
- Semantic HTML structure
- Alt text for icons (provide via ARIA labels)
- Sufficient color contrast
- Reduced motion support for animations

---

## Design Tokens Used

All components leverage RenDS design tokens:

```css
--ren-space-* (1-8)          /* Spacing scale */
--ren-surface                /* Surface backgrounds */
--ren-surface-sunken
--ren-text                   /* Text colors */
--ren-text-muted
--ren-text-faint
--ren-accent                 /* Primary accent color */
--ren-accent-subtle
--ren-fill                   /* Interactive fills */
--ren-fill-hover
--ren-border                 /* Border colors */
--ren-separator
--ren-radius-*               /* Border radius scale */
--ren-z-sticky               /* Z-index tiers */
--ren-z-modal
--ren-font-mono              /* Typography */
--duration-*                 /* Animation timing */
--ease-*
```

## Accessibility

All components support:
- **ARIA roles & attributes** — Proper semantic structure
- **Keyboard navigation** — Tab, arrow keys, escape, enter
- **Focus management** — Visible focus indicators
- **Color contrast** — WCAG AA compliance
- **Reduced motion** — Respects `prefers-reduced-motion`
- **Screen readers** — Semantic HTML and labels

## Browser Support

Modern browsers with Web Components support:
- Chrome 90+ (most stable)
- Firefox 93+
- Safari 15+

Features like Popover API, Dialog, and CSS Nesting require newer versions.

## File Structure

```
patterns/
├── ren-nav/
│   ├── ren-nav.css (204 lines)
│   └── ren-nav.js (180 lines)
├── ren-sidebar/
│   ├── ren-sidebar.css (299 lines)
│   └── ren-sidebar.js (215 lines)
├── ren-command/
│   ├── ren-command.css (314 lines)
│   └── ren-command.js (319 lines)
├── ren-table/
│   ├── ren-table.css (542 lines)
│   └── ren-table.js (782 lines)
├── ren-form/
│   ├── ren-form.css (317 lines)
│   └── ren-form.js (590 lines)
├── ren-menubar/
│   ├── ren-menubar.css (339 lines)
│   └── ren-menubar.js (530 lines)
├── ren-empty-state/
│   └── ren-empty-state.css (111 lines)
├── ren-ai/
│   └── ren-ai.css (456 lines)
└── README.md (this file)
```

**Total Production Code:** ~5,200 lines of CSS and JavaScript.
