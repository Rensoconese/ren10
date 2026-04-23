/**
 * RenDS Component Registry
 * Maps component names to metadata, files, and dependencies
 */

export const REGISTRY = {
  // PRIMITIVES
  button: {
    name: 'Button',
    layer: 'primitives',
    dir: 'ren-button',
    description: 'Versatile button with variants, sizes, icon support, loading state',
    files: ['ren-button.css', 'ren-button.js'],
    deps: [],
    usage: `<ren-button>Click me</ren-button>
<ren-button variant="primary">Primary</ren-button>
<ren-button variant="secondary" size="sm">Cancel</ren-button>`,
  },

  field: {
    name: 'Field',
    layer: 'primitives',
    dir: 'ren-field',
    description: 'Form field wrapper with label, error, description',
    files: ['ren-field.css', 'ren-field.js'],
    deps: ['id-generator.js'],
    usage: `<ren-field>
  <label for="username">Username</label>
  <input id="username" type="text">
  <small>Enter your username</small>
</ren-field>`,
  },

  checkbox: {
    name: 'Checkbox',
    layer: 'primitives',
    dir: 'ren-checkbox',
    description: 'Checkbox and toggle switch with accessibility',
    files: ['ren-checkbox.css', 'ren-checkbox.js'],
    deps: [],
    usage: `<ren-checkbox>
  <input type="checkbox" id="agree">
  <label for="agree">I agree</label>
</ren-checkbox>`,
  },

  badge: {
    name: 'Badge',
    layer: 'primitives',
    dir: 'ren-badge',
    description: 'Small label with variants and sizes',
    files: ['ren-badge.css'],
    deps: [],
    usage: `<span class="ren-badge">New</span>
<span class="ren-badge ren-badge-primary">Active</span>
<span class="ren-badge ren-badge-sm">v1.0</span>`,
  },

  radio: {
    name: 'Radio',
    layer: 'primitives',
    dir: 'ren-radio',
    description: 'Radio button group with keyboard navigation',
    files: ['ren-radio.css', 'ren-radio.js'],
    deps: ['keyboard-nav.js', 'id-generator.js'],
    usage: `<ren-radio name="option">
  <input type="radio" id="opt1" value="a">
  <label for="opt1">Option A</label>
  <input type="radio" id="opt2" value="b">
  <label for="opt2">Option B</label>
</ren-radio>`,
  },

  progress: {
    name: 'Progress',
    layer: 'primitives',
    dir: 'ren-progress',
    description: 'Progress bar with determinate/indeterminate modes',
    files: ['ren-progress.css', 'ren-progress.js'],
    deps: [],
    usage: `<ren-progress value="65" max="100"></ren-progress>
<ren-progress indeterminate></ren-progress>`,
  },

  icon: {
    name: 'Icon',
    layer: 'primitives',
    dir: 'ren-icon',
    description: 'Icon wrapper for SVG with size and color variants',
    files: ['ren-icon.css'],
    deps: [],
    usage: `<ren-icon class="ren-icon-sm"><svg>...</svg></ren-icon>
<ren-icon class="ren-icon-lg">🎨</ren-icon>`,
  },

  avatar: {
    name: 'Avatar',
    layer: 'primitives',
    dir: 'ren-avatar',
    description: 'User avatar with image, initials fallback, status dot, and sizes',
    files: ['ren-avatar.css'],
    deps: [],
    usage: `<span class="ren-avatar"><img src="/u.jpg" alt="Jane Doe"></span>
<span class="ren-avatar ren-avatar-lg">JD</span>
<span class="ren-avatar" data-status="online">JD</span>`,
  },

  banner: {
    name: 'Banner',
    layer: 'primitives',
    dir: 'ren-banner',
    description: 'Full-width announcement or status banner with variants',
    files: ['ren-banner.css'],
    deps: [],
    usage: `<div class="ren-banner ren-banner-info" role="status">
  <p>Heads up: maintenance window tonight at 10pm UTC.</p>
  <button class="ren-banner-close" aria-label="Dismiss">×</button>
</div>`,
  },

  breadcrumb: {
    name: 'Breadcrumb',
    layer: 'primitives',
    dir: 'ren-breadcrumb',
    description: 'Hierarchical navigation trail with separators',
    files: ['ren-breadcrumb.css'],
    deps: [],
    usage: `<nav class="ren-breadcrumb" aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/docs">Docs</a></li>
    <li aria-current="page">Breadcrumb</li>
  </ol>
</nav>`,
  },

  card: {
    name: 'Card',
    layer: 'primitives',
    dir: 'ren-card',
    description: 'Surface container with header, body, footer sections',
    files: ['ren-card.css'],
    deps: [],
    usage: `<article class="ren-card">
  <header class="ren-card-header"><h3>Title</h3></header>
  <div class="ren-card-body">Content goes here.</div>
  <footer class="ren-card-footer"><button class="ren-btn">Action</button></footer>
</article>`,
  },

  kbd: {
    name: 'Kbd',
    layer: 'primitives',
    dir: 'ren-kbd',
    description: 'Keyboard key indicator for shortcuts',
    files: ['ren-kbd.css'],
    deps: [],
    usage: `Press <kbd class="ren-kbd">⌘</kbd>+<kbd class="ren-kbd">K</kbd> to search.`,
  },

  link: {
    name: 'Link',
    layer: 'primitives',
    dir: 'ren-link',
    description: 'Styled link with underline, external icon, and variants',
    files: ['ren-link.css'],
    deps: [],
    usage: `<a href="/docs" class="ren-link">Read the docs</a>
<a href="https://example.com" class="ren-link ren-link-external">External</a>`,
  },

  pagination: {
    name: 'Pagination',
    layer: 'primitives',
    dir: 'ren-pagination',
    description: 'Page navigation controls with prev/next and page numbers',
    files: ['ren-pagination.css'],
    deps: [],
    usage: `<nav class="ren-pagination" aria-label="Pagination">
  <a href="?page=1" aria-label="Previous">‹</a>
  <a href="?page=1">1</a>
  <a href="?page=2" aria-current="page">2</a>
  <a href="?page=3">3</a>
  <a href="?page=3" aria-label="Next">›</a>
</nav>`,
  },

  separator: {
    name: 'Separator',
    layer: 'primitives',
    dir: 'ren-separator',
    description: 'Visual or semantic divider (horizontal/vertical)',
    files: ['ren-separator.css'],
    deps: [],
    usage: `<hr class="ren-separator">
<div class="ren-separator ren-separator-vertical" role="separator" aria-orientation="vertical"></div>`,
  },

  skeleton: {
    name: 'Skeleton',
    layer: 'primitives',
    dir: 'ren-skeleton',
    description: 'Loading placeholder shape (text, circle, rect) with shimmer',
    files: ['ren-skeleton.css'],
    deps: [],
    usage: `<div class="ren-skeleton ren-skeleton-text"></div>
<div class="ren-skeleton ren-skeleton-circle"></div>
<div class="ren-skeleton" style="width:200px;height:120px"></div>`,
  },

  spinner: {
    name: 'Spinner',
    layer: 'primitives',
    dir: 'ren-spinner',
    description: 'Indeterminate loading spinner respecting reduced-motion',
    files: ['ren-spinner.css'],
    deps: [],
    usage: `<span class="ren-spinner" role="status" aria-label="Loading"></span>
<span class="ren-spinner ren-spinner-lg"></span>`,
  },

  tag: {
    name: 'Tag',
    layer: 'primitives',
    dir: 'ren-tag',
    description: 'Pill-shaped tag/chip with optional dismiss button',
    files: ['ren-tag.css'],
    deps: [],
    usage: `<span class="ren-tag">design</span>
<span class="ren-tag ren-tag-removable">a11y
  <button class="ren-tag-close" aria-label="Remove">×</button>
</span>`,
  },

  // COMPOSITES
  dialog: {
    name: 'Dialog',
    layer: 'composites',
    dir: 'ren-dialog',
    description: 'Modal dialog with backdrop, animations, focus trap',
    files: ['ren-dialog.css', 'ren-dialog.js'],
    deps: ['focus-trap.js', 'dismissable.js', 'id-generator.js'],
    usage: `<ren-dialog>
  <dialog class="ren-dialog">
    <h2>Confirm</h2>
    <p>Are you sure?</p>
    <button>Cancel</button>
    <button>Confirm</button>
  </dialog>
</ren-dialog>`,
  },

  popover: {
    name: 'Popover',
    layer: 'composites',
    dir: 'ren-popover',
    description: 'Floating popover with anchor positioning',
    files: ['ren-popover.css', 'ren-popover.js'],
    deps: ['dismissable.js', 'id-generator.js'],
    usage: `<ren-popover>
  <button slot="trigger">Open</button>
  <div class="ren-popover">Content</div>
</ren-popover>`,
  },

  tooltip: {
    name: 'Tooltip',
    layer: 'composites',
    dir: 'ren-tooltip',
    description: 'Accessible tooltip with positioning and delay',
    files: ['ren-tooltip.css', 'ren-tooltip.js'],
    deps: ['id-generator.js'],
    usage: `<ren-tooltip content="Help text">
  <button>Hover me</button>
</ren-tooltip>`,
  },

  tabs: {
    name: 'Tabs',
    layer: 'composites',
    dir: 'ren-tabs',
    description: 'Tab interface with keyboard navigation',
    files: ['ren-tabs.css', 'ren-tabs.js'],
    deps: ['keyboard-nav.js', 'id-generator.js'],
    usage: `<ren-tabs>
  <button role="tab">Tab 1</button>
  <button role="tab">Tab 2</button>
  <div role="tabpanel">Content 1</div>
  <div role="tabpanel">Content 2</div>
</ren-tabs>`,
  },

  accordion: {
    name: 'Accordion',
    layer: 'composites',
    dir: 'ren-accordion',
    description: 'Collapsible accordion sections',
    files: ['ren-accordion.css', 'ren-accordion.js'],
    deps: ['id-generator.js'],
    usage: `<ren-accordion>
  <details>
    <summary>Section 1</summary>
    Content
  </details>
  <details>
    <summary>Section 2</summary>
    Content
  </details>
</ren-accordion>`,
  },

  menu: {
    name: 'Menu',
    layer: 'composites',
    dir: 'ren-menu',
    description: 'Dropdown menu with keyboard navigation',
    files: ['ren-menu.css', 'ren-menu.js'],
    deps: ['keyboard-nav.js', 'dismissable.js', 'id-generator.js'],
    usage: `<ren-menu>
  <button slot="trigger">Menu</button>
  <ul role="menu" class="ren-menu">
    <li role="menuitem"><a href="#">Item 1</a></li>
    <li role="menuitem"><a href="#">Item 2</a></li>
  </ul>
</ren-menu>`,
  },

  select: {
    name: 'Select',
    layer: 'composites',
    dir: 'ren-select',
    description: 'Custom select dropdown with search support',
    files: ['ren-select.css', 'ren-select.js'],
    deps: ['keyboard-nav.js', 'dismissable.js', 'id-generator.js'],
    usage: `<ren-select name="choice">
  <option>Select...</option>
  <option value="a">Option A</option>
  <option value="b">Option B</option>
</ren-select>`,
  },

  toast: {
    name: 'Toast',
    layer: 'composites',
    dir: 'ren-toast',
    description: 'Toast notifications with dismiss action',
    files: ['ren-toast.css', 'ren-toast.js'],
    deps: ['live-region.js'],
    usage: `<ren-toast role="status" aria-live="polite">
  Message sent successfully
  <button aria-label="Dismiss">×</button>
</ren-toast>`,
  },

  slider: {
    name: 'Slider',
    layer: 'composites',
    dir: 'ren-slider',
    description: 'Range slider with keyboard support',
    files: ['ren-slider.css', 'ren-slider.js'],
    deps: [],
    usage: `<ren-slider min="0" max="100" value="50">
  <input type="range">
  <output>50</output>
</ren-slider>`,
  },

  'toggle-group': {
    name: 'Toggle Group',
    layer: 'composites',
    dir: 'ren-toggle-group',
    description: 'Grouped toggle buttons with selection',
    files: ['ren-toggle-group.css', 'ren-toggle-group.js'],
    deps: [],
    usage: `<ren-toggle-group>
  <button>Left</button>
  <button>Center</button>
  <button>Right</button>
</ren-toggle-group>`,
  },

  combobox: {
    name: 'Combobox',
    layer: 'composites',
    dir: 'ren-combobox',
    description: 'Autocomplete input with list filtering',
    files: ['ren-combobox.css', 'ren-combobox.js'],
    deps: ['keyboard-nav.js', 'dismissable.js', 'id-generator.js'],
    usage: `<ren-combobox autocomplete="list">
  <input type="text" placeholder="Search...">
  <ul role="listbox" class="ren-combobox-list">
    <li role="option">Option 1</li>
  </ul>
</ren-combobox>`,
  },

  sheet: {
    name: 'Sheet',
    layer: 'composites',
    dir: 'ren-sheet',
    description: 'Side panel drawer with slide animation',
    files: ['ren-sheet.css', 'ren-sheet.js'],
    deps: ['focus-trap.js', 'dismissable.js'],
    usage: `<ren-sheet>
  <button slot="trigger">Open Drawer</button>
  <aside class="ren-sheet">
    Content
  </aside>
</ren-sheet>`,
  },

  'hover-card': {
    name: 'Hover Card',
    layer: 'composites',
    dir: 'ren-hover-card',
    description: 'Card that appears on hover/focus',
    files: ['ren-hover-card.css', 'ren-hover-card.js'],
    deps: [],
    usage: `<ren-hover-card>
  <button>Hover me</button>
  <div class="ren-hover-card-content">Preview content</div>
</ren-hover-card>`,
  },

  'scroll-area': {
    name: 'Scroll Area',
    layer: 'composites',
    dir: 'ren-scroll-area',
    description: 'Scrollable area with custom scrollbars',
    files: ['ren-scroll-area.css', 'ren-scroll-area.js'],
    deps: [],
    usage: `<ren-scroll-area class="ren-scroll-area">
  <div>Long content...</div>
</ren-scroll-area>`,
  },

  'number-field': {
    name: 'Number Field',
    layer: 'composites',
    dir: 'ren-number-field',
    description: 'Input for numbers with increment/decrement',
    files: ['ren-number-field.css', 'ren-number-field.js'],
    deps: ['id-generator.js'],
    usage: `<ren-number-field>
  <label>Quantity</label>
  <input type="number" min="0" max="10">
</ren-number-field>`,
  },

  otp: {
    name: 'OTP',
    layer: 'composites',
    dir: 'ren-otp',
    description: 'One-time password input with auto-focus',
    files: ['ren-otp.css', 'ren-otp.js'],
    deps: [],
    usage: `<ren-otp length="6">
  <input type="text" maxlength="1">
  <input type="text" maxlength="1">
  ...
</ren-otp>`,
  },

  calendar: {
    name: 'Calendar',
    layer: 'composites',
    dir: 'ren-calendar',
    description: 'Date picker calendar interface',
    files: ['ren-calendar.css', 'ren-calendar.js'],
    deps: ['id-generator.js'],
    usage: `<ren-calendar selected="2025-03-15">
  <table role="grid">...</table>
</ren-calendar>`,
  },

  'date-picker': {
    name: 'Date Picker',
    layer: 'composites',
    dir: 'ren-date-picker',
    description: 'Input with calendar dropdown',
    files: ['ren-date-picker.css', 'ren-date-picker.js'],
    deps: ['dismissable.js', 'id-generator.js'],
    usage: `<ren-date-picker>
  <input type="date">
  <ren-calendar></ren-calendar>
</ren-date-picker>`,
  },

  carousel: {
    name: 'Carousel',
    layer: 'composites',
    dir: 'ren-carousel',
    description: 'Slide carousel with pagination',
    files: ['ren-carousel.css', 'ren-carousel.js'],
    deps: [],
    usage: `<ren-carousel auto-play interval="5000">
  <div class="ren-carousel-slide">Slide 1</div>
  <div class="ren-carousel-slide">Slide 2</div>
  <button aria-label="Previous">←</button>
  <button aria-label="Next">→</button>
</ren-carousel>`,
  },

  'alert-dialog': {
    name: 'Alert Dialog',
    layer: 'composites',
    dir: 'ren-alert-dialog',
    description: 'Modal alert for destructive or blocking confirmations',
    files: ['ren-alert-dialog.css'],
    deps: [],
    usage: `<dialog class="ren-alert-dialog" role="alertdialog" aria-labelledby="ad-title">
  <h2 id="ad-title">Delete project?</h2>
  <p>This action cannot be undone.</p>
  <div class="ren-alert-dialog-actions">
    <button class="ren-btn">Cancel</button>
    <button class="ren-btn ren-btn-danger">Delete</button>
  </div>
</dialog>`,
  },

  collapsible: {
    name: 'Collapsible',
    layer: 'composites',
    dir: 'ren-collapsible',
    description: 'Single expandable region built on native <details>',
    files: ['ren-collapsible.css'],
    deps: [],
    usage: `<details class="ren-collapsible">
  <summary>Show more</summary>
  <p>Hidden content revealed when expanded.</p>
</details>`,
  },

  'color-picker': {
    name: 'Color Picker',
    layer: 'composites',
    dir: 'ren-color-picker',
    description: 'Color input with swatches, hex field, and native picker',
    files: ['ren-color-picker.css', 'ren-color-picker.js'],
    deps: [],
    usage: `<ren-color-picker value="#5b6cff">
  <input type="color">
  <input type="text" class="ren-color-picker-hex">
</ren-color-picker>`,
  },

  'context-menu': {
    name: 'Context Menu',
    layer: 'composites',
    dir: 'ren-context-menu',
    description: 'Right-click / long-press menu with keyboard support',
    files: ['ren-context-menu.css', 'ren-context-menu.js'],
    deps: ['dismissable.js', 'keyboard-nav.js'],
    usage: `<ren-context-menu>
  <div class="ren-context-menu-trigger">Right-click me</div>
  <ul role="menu" class="ren-context-menu">
    <li role="menuitem">Copy</li>
    <li role="menuitem">Paste</li>
  </ul>
</ren-context-menu>`,
  },

  'date-range-picker': {
    name: 'Date Range Picker',
    layer: 'composites',
    dir: 'ren-date-range-picker',
    description: 'Two-calendar picker for start/end date selection',
    files: ['ren-date-range-picker.css', 'ren-date-range-picker.js'],
    deps: ['dismissable.js', 'id-generator.js'],
    usage: `<ren-date-range-picker>
  <input type="text" placeholder="Start">
  <input type="text" placeholder="End">
</ren-date-range-picker>`,
  },

  dropzone: {
    name: 'Dropzone',
    layer: 'composites',
    dir: 'ren-dropzone',
    description: 'Drag-and-drop file upload area with keyboard fallback',
    files: ['ren-dropzone.css', 'ren-dropzone.js'],
    deps: [],
    usage: `<ren-dropzone accept="image/*" multiple>
  <label>
    <input type="file" multiple>
    <span>Drop files here or click to browse</span>
  </label>
</ren-dropzone>`,
  },

  toolbar: {
    name: 'Toolbar',
    layer: 'composites',
    dir: 'ren-toolbar',
    description: 'Horizontal group of controls with roving tabindex',
    files: ['ren-toolbar.css', 'ren-toolbar.js'],
    deps: ['keyboard-nav.js'],
    usage: `<ren-toolbar role="toolbar" aria-label="Formatting">
  <button>Bold</button>
  <button>Italic</button>
  <button>Underline</button>
</ren-toolbar>`,
  },

  // PATTERNS
  nav: {
    name: 'Navigation',
    layer: 'patterns',
    dir: 'ren-nav',
    description: 'Responsive navigation bar with mobile menu',
    files: ['ren-nav.css', 'ren-nav.js'],
    deps: [],
    usage: `<ren-nav class="ren-nav">
  <a href="/" class="ren-nav-brand">Logo</a>
  <ul class="ren-nav-menu">
    <li><a href="/home">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</ren-nav>`,
  },

  sidebar: {
    name: 'Sidebar',
    layer: 'patterns',
    dir: 'ren-sidebar',
    description: 'Collapsible sidebar with persistence',
    files: ['ren-sidebar.css', 'ren-sidebar.js'],
    deps: [],
    usage: `<ren-sidebar class="ren-sidebar">
  <nav class="ren-sidebar-nav">
    <a href="#">Link 1</a>
    <a href="#">Link 2</a>
  </nav>
</ren-sidebar>`,
  },

  command: {
    name: 'Command',
    layer: 'patterns',
    dir: 'ren-command',
    description: 'Command/search palette with keyboard shortcuts',
    files: ['ren-command.css', 'ren-command.js'],
    deps: ['focus-trap.js', 'dismissable.js'],
    usage: `<ren-command open>
  <input class="ren-command-input" placeholder="Type a command...">
  <ul class="ren-command-list">
    <li data-value="save">Save</li>
    <li data-value="copy">Copy</li>
  </ul>
</ren-command>`,
  },

  table: {
    name: 'Table',
    layer: 'patterns',
    dir: 'ren-table',
    description: 'Sortable, responsive data table',
    files: ['ren-table.css', 'ren-table.js'],
    deps: [],
    usage: `<ren-table class="ren-table">
  <thead>
    <tr><th>Name</th><th>Email</th></tr>
  </thead>
  <tbody>
    <tr><td>John</td><td>john@example.com</td></tr>
  </tbody>
</ren-table>`,
  },

  form: {
    name: 'Form',
    layer: 'patterns',
    dir: 'ren-form',
    description: 'Styled form wrapper with validation styling',
    files: ['ren-form.css', 'ren-form.js'],
    deps: [],
    usage: `<ren-form class="ren-form">
  <ren-field>
    <label>Email</label>
    <input type="email" required>
  </ren-field>
  <button type="submit">Submit</button>
</ren-form>`,
  },

  menubar: {
    name: 'Menubar',
    layer: 'patterns',
    dir: 'ren-menubar',
    description: 'Top-level menu bar with submenu support',
    files: ['ren-menubar.css', 'ren-menubar.js'],
    deps: ['keyboard-nav.js', 'id-generator.js'],
    usage: `<ren-menubar class="ren-menubar">
  <div role="menubar">
    <button role="menuitem">File</button>
    <button role="menuitem">Edit</button>
  </div>
</ren-menubar>`,
  },

  ai: {
    name: 'AI',
    layer: 'patterns',
    dir: 'ren-ai',
    description: 'AI chat surface — message bubbles, prompt input, streaming caret',
    files: ['ren-ai.css'],
    deps: [],
    usage: `<section class="ren-ai">
  <div class="ren-ai-thread">
    <div class="ren-ai-msg ren-ai-msg-user">Summarize this PR.</div>
    <div class="ren-ai-msg ren-ai-msg-assistant">Sure — here's a 3-bullet TL;DR…</div>
  </div>
  <form class="ren-ai-prompt">
    <textarea placeholder="Ask anything…"></textarea>
    <button class="ren-btn">Send</button>
  </form>
</section>`,
  },

  'empty-state': {
    name: 'Empty State',
    layer: 'patterns',
    dir: 'ren-empty-state',
    description: 'Friendly placeholder for zero-data screens with optional CTA',
    files: ['ren-empty-state.css'],
    deps: [],
    usage: `<div class="ren-empty-state">
  <ren-icon class="ren-icon-xl">📭</ren-icon>
  <h3>No messages yet</h3>
  <p>When someone writes you, it'll show up here.</p>
  <button class="ren-btn ren-btn-primary">Compose</button>
</div>`,
  },
};

/**
 * Get all components organized by layer
 */
export function getComponentsByLayer() {
  const layers = {};
  Object.entries(REGISTRY).forEach(([key, meta]) => {
    if (!layers[meta.layer]) layers[meta.layer] = [];
    layers[meta.layer].push({ key, ...meta });
  });
  return layers;
}

/**
 * Validate component name and return metadata
 */
export function getComponent(name) {
  return REGISTRY[name.toLowerCase()];
}

/**
 * Get all available component names
 */
export function getAllComponents() {
  return Object.keys(REGISTRY);
}
