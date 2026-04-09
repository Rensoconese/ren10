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
