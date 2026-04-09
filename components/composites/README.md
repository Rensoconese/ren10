# RenDS Composites Tier

A collection of production-ready, accessible web components built on native HTML elements and modern CSS. Each composite combines semantic markup, CSS animations, and lightweight JavaScript (where needed) to create robust, keyboard-navigable UI patterns.

---

## Component Directory

### Dialog & Overlays

#### `ren-dialog`
Modal dialog using native `<dialog>` element with CSS animations, focus management, and size variants.

**Usage:**
```html
<ren-dialog size="md">
  <dialog>
    <div class="ren-dialog-header">
      <h2 class="ren-dialog-title">Confirm</h2>
      <button class="ren-dialog-close" data-dialog-close>×</button>
    </div>
    <div class="ren-dialog-body">Content here</div>
    <div class="ren-dialog-footer">
      <button data-dialog-close>Cancel</button>
      <button>Confirm</button>
    </div>
  </dialog>
</ren-dialog>
```

**Classes:** `.ren-dialog-sm|md|lg|xl|full`, `.ren-dialog-header`, `.ren-dialog-body`, `.ren-dialog-footer`
**API:** `show()`, `close()`, `isOpen`
**Events:** `ren-open`, `ren-close`
**Accessibility:** Focus trap, Escape key, click-outside dismissal, mobile bottom-sheet behavior.

---

#### `ren-alert-dialog`
Non-dismissible confirmation dialog. Extends `ren-dialog` with `alert` attribute to block outside clicks.

**Usage:**
```html
<ren-alert-dialog>
  <dialog>
    <div class="ren-alert-dialog-icon">⚠</div>
    <h2>Delete item?</h2>
    <p>This action cannot be undone.</p>
    <div class="ren-dialog-footer">
      <button data-dialog-close>Cancel</button>
      <button>Delete</button>
    </div>
  </dialog>
</ren-alert-dialog>
```

**Differences:** No click-outside dismissal, optional Escape key blocking via `no-escape` attribute.

---

#### `ren-sheet`
Side/bottom sheet with slide-in animation and swipe-to-dismiss support. Uses Popover API fallback.

**Usage:**
```html
<ren-sheet data-side="right" data-size="md">
  <h2 slot="title">Sheet Title</h2>
  <p>Sheet content</p>
  <div slot="footer"><button>Action</button></div>
</ren-sheet>
```

**Classes:** `.ren-sheet-header`, `.ren-sheet-body`, `.ren-sheet-footer`
**Attributes:** `data-side` (left|right|top|bottom), `data-size` (sm|md|lg|xl|full)
**API:** `show()`, `close()`
**Accessibility:** Focus trap, Escape dismissal, aria labels on header/description slots.

---

### Popovers & Tooltips

#### `ren-popover`
Floating popover with CSS anchor positioning and automatic viewport collision handling.

**Usage:**
```html
<button data-popover-trigger>Open</button>
<ren-popover placement="bottom" offset="8">
  <div class="ren-popover-header">Title</div>
  <div class="ren-popover-body">Content</div>
</ren-popover>
```

**Classes:** `.ren-popover-arrow`, `.ren-popover-header`, `.ren-popover-body`, `.ren-popover-footer`
**Attributes:** `placement` (top|bottom|left|right), `offset` (pixels), `trigger-id`
**API:** `open()`, `close()`, `toggle()`, `isOpen()`
**Events:** `ren-open`, `ren-close`
**Accessibility:** Click-outside dismissal, Escape key, aria-modal.

---

#### `ren-tooltip`
Lightweight tooltip with hover/focus triggers and configurable delay.

**Usage:**
```html
<button>
  Hover me
  <ren-tooltip placement="top" show-delay="500">Helper text</ren-tooltip>
</button>
```

**Classes:** `.ren-tooltip-arrow`
**Attributes:** `placement`, `show-delay`, `hide-delay`, `offset`
**API:** `show()`, `hide()`, `isOpen()`
**Accessibility:** Shows on hover and focus, auto-hides on blur/mouseleave, touch support (long-press).

---

#### `ren-hover-card`
Card that appears on hover near a trigger element. Uses CSS anchor positioning.

**Usage:**
```html
<div class="ren-hover-card-trigger">Hover target</div>
<div class="ren-hover-card">Card content</div>
```

**Classes:** `.ren-hover-card-trigger`, `.ren-hover-card`
**Accessibility:** Anchor-positioned, optional arrow indicator.

---

### Navigation & Tabs

#### `ren-tabs`
Accessible tabbed interface with keyboard navigation (arrow keys, Home/End).

**Usage:**
```html
<ren-tabs default-value="0" activation="manual">
  <div role="tablist" class="ren-tab-list">
    <button role="tab" class="ren-tab">Tab 1</button>
    <button role="tab" class="ren-tab">Tab 2</button>
  </div>
  <div role="tabpanel" class="ren-tab-panel">Panel 1</div>
  <div role="tabpanel" class="ren-tab-panel">Panel 2</div>
</ren-tabs>
```

**Classes:** `.ren-tab-list-underline|pills|enclosed`, `.ren-tab`, `.ren-tab-panel`
**Attributes:** `activation` (manual|automatic), `orientation` (horizontal|vertical), `default-value`
**API:** `selectTabByIndex(i)`, `selectTabById(id)`, `selectedIndex`, `selectedTab`, `selectedPanel`
**Events:** `ren-tab-change` (detail: {tab, panel, index, id})
**Accessibility:** ARIA tablist pattern, roving tabindex, manual/auto activation modes.

---

#### `ren-toolbar`
Grouped actions with roving tabindex. Keyboard navigation with arrow keys and Home/End.

**Usage:**
```html
<div class="ren-toolbar" role="toolbar" aria-label="Formatting">
  <button class="ren-toolbar-item" tabindex="0">Bold</button>
  <button class="ren-toolbar-item" tabindex="-1">Italic</button>
  <div class="ren-toolbar-separator" role="separator"></div>
</div>
```

**Classes:** `.ren-toolbar-item`, `.ren-toolbar-separator`
**Accessibility:** WAI-ARIA toolbar pattern, roving tabindex, arrow key navigation.

---

### Menus & Dropdowns

#### `ren-menu`
Dropdown menu with keyboard navigation, typeahead, checkbox and radio items.

**Usage:**
```html
<button data-menu-trigger id="menu-btn">Menu</button>
<ren-menu trigger-id="menu-btn" placement="bottom-start">
  <button class="ren-menu-item" role="menuitem">Option 1</button>
  <div class="ren-menu-separator"></div>
  <button class="ren-menu-item ren-menu-item-danger" role="menuitem">Delete</button>
</ren-menu>
```

**Classes:** `.ren-menu-item`, `.ren-menu-item-danger`, `.ren-menu-separator`, `.ren-menu-label`, `.ren-menu-icon`, `.ren-menu-shortcut`
**Attributes:** `placement` (bottom-start|bottom-end|top-start|top-end), `trigger-id`
**API:** `open()`, `close()`, `isOpen()`
**Events:** `ren-menu-select`, `ren-menu-open`, `ren-menu-close`
**Accessibility:** Arrow key nav, typeahead, checkbox/radio support, click-outside dismissal.

---

#### `ren-context-menu`
Right-click context menu. Extends `ren-menu` with contextmenu event handling.

**Usage:**
```html
<div data-context-menu-trigger id="target">Right-click me</div>
<ren-context-menu trigger-id="target">
  <button class="ren-menu-item">Copy</button>
  <button class="ren-menu-item">Paste</button>
</ren-context-menu>
```

**Events:** `ren-context-menu-open` (detail: {x, y, target})

---

### Form Components

#### `ren-select`
Custom select/dropdown with full keyboard nav, multi-select support, and option groups.

**Usage:**
```html
<ren-select placeholder="Choose..." name="country">
  <button data-select-trigger>Select</button>
  <div data-select-content>
    <div class="ren-select-item" data-value="us">USA</div>
    <div class="ren-select-item" data-value="ca">Canada</div>
  </div>
</ren-select>
```

**Classes:** `.ren-select-trigger`, `.ren-select-icon`, `.ren-select-item`, `.ren-select-label`, `.ren-select-separator`
**Attributes:** `placeholder`, `name`, `multiple`, `size` (sm|lg)
**API:** `open()`, `close()`, `getValue()`, `setValue(val)`
**Events:** `ren-select-change`
**Accessibility:** Keyboard nav (arrows, typeahead), click-outside dismissal, roving tabindex.

---

#### `ren-combobox`
Searchable autocomplete input with filtering and keyboard navigation.

**Usage:**
```html
<ren-combobox placeholder="Search..." name="fruit">
  <div role="option">Apple</div>
  <div role="option">Banana</div>
</ren-combobox>
```

**API:** `open()`, `close()`, `filter(query)`
**Accessibility:** Keyboard nav, live search filtering, ARIA combobox pattern.

---

#### `ren-number-field`
Numeric input with increment/decrement buttons, min/max bounds, and step support.

**Usage:**
```html
<ren-number-field min="0" max="100" step="5">
  <button class="ren-number-field-decrement">−</button>
  <input class="ren-number-field-input" type="number" value="50">
  <button class="ren-number-field-increment">+</button>
</ren-number-field>
```

**Classes:** `.ren-number-field-input`, `.ren-number-field-increment`, `.ren-number-field-decrement`
**API:** `value` property, `increment()`, `decrement()`
**Accessibility:** Keyboard input, accessible stepper buttons.

---

#### `ren-toggle-group`
Grouped toggle buttons for single or multiple selection.

**Usage:**
```html
<ren-toggle-group type="single" value="md">
  <button class="ren-toggle-group-item" data-value="sm">Small</button>
  <button class="ren-toggle-group-item" data-value="md">Medium</button>
  <button class="ren-toggle-group-item" data-value="lg">Large</button>
</ren-toggle-group>
```

**Classes:** `.ren-toggle-group-item`, `.ren-toggle-group-outline|full|vertical`
**Attributes:** `type` (single|multiple), `value`
**Variants:** Default (filled), outline, full-width, vertical
**Accessibility:** Roving tabindex, arrow key nav, aria-pressed.

---

#### `ren-slider`
Range input with CSS-driven track fill and custom styling.

**Usage:**
```html
<ren-slider min="0" max="100" value="50" label="Volume" show-value>
  <div class="ren-slider-track">
    <input type="range" value="50">
  </div>
</ren-slider>
```

**Classes:** `.ren-slider-track`, `.ren-slider-label`, `.ren-slider-value`, `.ren-slider-marks`
**Variants:** Size (sm|lg), Color (success|warning|danger), Vertical orientation
**API:** `value` property
**Events:** `ren-slider-input`, `ren-slider-change`

---

#### `ren-otp`
One-time password input with auto-advancing slots and paste support.

**Usage:**
```html
<ren-otp length="6" type="numeric"></ren-otp>
```

**Classes:** `.ren-otp-slot`
**Attributes:** `length`, `type` (numeric|alphanumeric), `disabled`
**API:** `getValue()`, `setValue(str)`, `clear()`
**Accessibility:** Sequential slot focus, paste from clipboard, validation states.

---

### Expanding Content

#### `ren-accordion`
CSS-first accordion using native `<details><summary>` with exclusive or multiple mode.

**Usage:**
```html
<ren-accordion type="single" default-value="0">
  <details>
    <summary class="ren-accordion-trigger">Item 1</summary>
    <div class="ren-accordion-content">Content 1</div>
  </details>
  <details>
    <summary class="ren-accordion-trigger">Item 2</summary>
    <div class="ren-accordion-content">Content 2</div>
  </details>
</ren-accordion>
```

**Classes:** `.ren-accordion-trigger`, `.ren-accordion-content`
**Variants:** `.ren-accordion-bordered`, `.ren-accordion-flush`
**Attributes:** `type` (single|multiple), `collapsible`, `default-value`
**API:** `openItem(i)`, `closeItem(i)`, `toggleItem(i)`, `getOpenItems()`
**Events:** `ren-accordion-change`
**Accessibility:** Native details/summary semantics, keyboard accessible.

---

#### `ren-collapsible`
CSS-only expand/collapse using `<details>` without grouping (single item).

**Usage:**
```html
<details class="ren-collapsible">
  <summary>Expand me</summary>
  <div class="ren-collapsible-content">Hidden content</div>
</details>
```

**Accessibility:** Native semantics, no JS required.

---

### Date & Time

#### `ren-calendar`
Fully accessible calendar grid with single/range/multiple date selection.

**Usage:**
```html
<ren-calendar mode="single" format="YYYY-MM-DD"></ren-calendar>
```

**Classes:** `.ren-calendar-header`, `.ren-calendar-title`, `.ren-calendar-nav`
**Attributes:** `mode` (single|range|multiple), `format`, `min-date`, `max-date`
**API:** `getSelectedDate()`, `setSelectedDate(d)`
**Accessibility:** Keyboard nav (arrows), ARIA grid pattern.

---

#### `ren-date-picker`
Date input field with calendar popover using Popover API.

**Usage:**
```html
<ren-date-picker format="MM/DD/YYYY" placeholder="Select date"></ren-date-picker>
```

**Classes:** `.ren-date-picker-trigger`, `.ren-date-picker-content`
**API:** `open()`, `close()`, `getDate()`, `setDate(d)`
**Accessibility:** Click to open calendar, keyboard nav within calendar.

---

### Media & Display

#### `ren-carousel`
Scroll-snap carousel with keyboard nav, autoplay, and pagination dots.

**Usage:**
```html
<ren-carousel autoplay="5000" loop slides-per-view="1">
  <div class="ren-carousel-viewport">
    <div class="ren-carousel-slide"><img src="1.jpg"></div>
    <div class="ren-carousel-slide"><img src="2.jpg"></div>
  </div>
</ren-carousel>
```

**Classes:** `.ren-carousel-viewport`, `.ren-carousel-slide`, `.ren-carousel-dots`, `.ren-carousel-button`
**Attributes:** `autoplay`, `loop`, `slides-per-view`, `fade`
**API:** `next()`, `prev()`, `goTo(i)`, `pause()`, `resume()`
**Events:** `ren-slide-change`
**Accessibility:** Arrow key nav, auto-generated dots, pause on hover.

---

#### `ren-scroll-area`
Custom scrollbar styling with native scroll behavior.

**Usage:**
```html
<div class="ren-scroll-area" style="height: 300px; overflow-y: auto;">
  Long content here
</div>
```

**Variants:** `.ren-scroll-area-auto` (hide scrollbar, show on scroll)
**Accessibility:** Native scroll, styled scrollbar.

---

### Notifications

#### `ren-toast`
Toast notification system with viewport positioning, auto-dismiss, and variants.

**Usage:**
```javascript
import { toast } from 'ren-toast.js';

toast('File saved');
toast({
  title: 'Error',
  description: 'Failed to upload',
  type: 'error',
  duration: 5000
});
```

**Types:** success, error, warning, info, loading
**Positions:** top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
**Accessibility:** aria-live region, dismissible button, auto-announce.

---

### Utilities & Special

#### `ren-color-picker`
Full-featured color picker with HSV canvas, hue slider, and alpha support.

**Usage:**
```html
<ren-color-picker value="#3b82f6" alpha format="hex" swatches="#ef4444,#22c55e"></ren-color-picker>
```

**Formats:** HEX, RGB, HSL
**Attributes:** `value`, `alpha`, `format`, `swatches`
**API:** `getColor()`, `setColor(hex)`
**Accessibility:** Keyboard nav, EyeDropper API support.

---

#### `ren-dropzone`
Drag-and-drop file upload area with visual feedback.

**Usage:**
```html
<div class="ren-dropzone">
  <input type="file" class="ren-dropzone-input" multiple>
  <p>Drag files here or click to browse</p>
</div>

<script>
  import { initDropZone } from 'ren-dropzone.js';
  const dz = initDropZone(document.querySelector('.ren-dropzone'));
  dz.addEventListener('ren-files-added', (e) => {
    console.log(e.detail.files);
  });
</script>
```

**Events:** `ren-files-added` (detail: {files})
**Accessibility:** File input as fallback, drag-over feedback.

---

## Design Tokens

All components use CSS custom properties for theming:

```css
--color-text, --color-text-muted
--color-surface, --color-surface-raised, --color-surface-sunken
--color-border, --color-border-hover, --color-border-focus
--color-fill, --color-fill-active, --color-fill-hover
--color-accent, --color-accent-subtle
--color-success, --color-warning, --color-danger, --color-info
--radius-sm, --radius-md, --radius-lg, --radius-xl, --radius-full
--space-1, --space-2, --space-3, --space-4, --space-6
--duration-fast, --duration-normal, --duration-slow
--ease-default, --ease-in, --ease-out
```

---

## Accessibility

All composites follow WAI-ARIA patterns:

- **Focus management:** Focus traps in modals, roving tabindex in lists/toolbars
- **Keyboard navigation:** Arrow keys, Home/End, Enter/Space, Escape
- **Screen readers:** ARIA labels, live regions, semantic roles
- **Motion:** Respects `prefers-reduced-motion` media query
- **Contrast:** WCAG AA compliant color ratios
- **Touch:** Minimum 44px touch targets, mobile-optimized interactions

---

## Browser Support

- Modern browsers with CSS support (Chrome, Firefox, Safari, Edge)
- Graceful degradation for older browsers
- Popover API fallbacks to JS positioning
- CSS anchor positioning fallbacks to absolute positioning
