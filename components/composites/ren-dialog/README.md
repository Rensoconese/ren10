# RenDialog - Modal/Dialog Component

A production-grade dialog component built on the native HTML `<dialog>` element with integrated focus management, keyboard handling, and smooth animations.

## Files

- **ren-dialog.css** - Styles for the dialog, animations, and responsive behavior
- **ren-dialog.js** - Web component implementation with focus trap and dismissal utilities

## Basic Usage

### Simple Dialog

```html
<button data-dialog-trigger="my-dialog">Open Dialog</button>

<ren-dialog id="my-dialog" size="md">
  <dialog>
    <div class="ren-dialog-header">
      <h2 class="ren-dialog-title">Dialog Title</h2>
      <button class="ren-dialog-close" data-dialog-close>&times;</button>
    </div>
    <div class="ren-dialog-body">
      Dialog content goes here
    </div>
    <div class="ren-dialog-footer">
      <button data-dialog-close>Cancel</button>
      <button>Confirm</button>
    </div>
  </dialog>
</ren-dialog>
```

### Alert Dialog (Non-dismissible)

```html
<ren-alert-dialog>
  <dialog>
    <div class="ren-dialog-header">
      <h2 class="ren-dialog-title">Important Notice</h2>
    </div>
    <div class="ren-dialog-body">
      This action cannot be undone.
    </div>
    <div class="ren-dialog-footer">
      <button data-dialog-close>Cancel</button>
      <button>Confirm</button>
    </div>
  </dialog>
</ren-alert-dialog>
```

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `open` | boolean | Opens the dialog when present |
| `alert` | boolean | Prevents click-outside dismissal |
| `size` | sm \| md \| lg \| xl \| full | Dialog width variant (default: md) |
| `no-escape` | boolean | Prevents Escape key from closing |

## API Methods

```javascript
// Get dialog element
const dialog = document.querySelector('ren-dialog');

// Open/show the dialog
await dialog.show();
// or
await dialog.open();

// Close the dialog with optional return value
await dialog.close('action-confirmed');

// Check if open
if (dialog.isOpen) {
  console.log('Dialog is open');
}

// Access underlying dialog element
const nativeDialog = dialog.dialog;
```

## Events

### `ren-open`
Dispatched when dialog opens

```javascript
dialog.addEventListener('ren-open', () => {
  console.log('Dialog opened');
});
```

### `ren-close`
Dispatched when dialog closes

```javascript
dialog.addEventListener('ren-close', (e) => {
  console.log('Return value:', e.detail.returnValue);
});
```

## Size Variants

- **sm** - 24rem (small: 384px)
- **md** - 32rem (medium: 512px) - DEFAULT
- **lg** - 42rem (large: 672px)
- **xl** - 56rem (extra large: 896px)
- **full** - 95dvw (full viewport width)

```html
<ren-dialog size="lg">...</ren-dialog>
```

## Features

### Focus Management
- Automatic focus trap within dialog
- Tab navigation confined to dialog
- Focus returns to trigger on close
- Auto-focuses first focusable element

### Keyboard Support
- **Escape** - Closes dialog (unless `no-escape` set)
- **Tab/Shift+Tab** - Cycles through focusable elements
- **Enter** - On buttons/form controls as normal

### Click-Outside Dismissal
- Click on backdrop closes dialog
- Disabled for alert dialogs
- Can be disabled with `alert` attribute

### Animations
- Smooth fade-in + scale entry
- Smooth fade-out + scale exit
- Mobile sheet animation (bottom slide)
- Respects `prefers-reduced-motion`

### Mobile Responsive
- Full-width on small screens
- Bottom sheet style on mobile (<640px)
- Adapts padding and layout

### Accessibility
- Uses native `<dialog>` element
- Focus trap for keyboard navigation
- ARIA-compatible structure
- Semantic HTML structure
- Color contrast compliance

## Auto-Wiring

Buttons are automatically wired:

```html
<!-- Trigger button - opens dialog with matching ID -->
<button data-dialog-trigger="my-dialog">Open</button>

<!-- Close button - any button with data-dialog-close -->
<button data-dialog-close>Close</button>
```

## JavaScript Integration

```javascript
import { RenDialog, RenAlertDialog } from './ren-dialog.js';

// Components auto-register, but you can import them:
const dialog = new RenDialog();

// or use declaratively:
document.querySelector('ren-dialog').show();
```

## CSS Customization

Dialog sizing is controlled via CSS variables:

```css
ren-dialog {
  --dialog-max-width: 48rem; /* Override default width */
}
```

All colors, spacing, and animations use design tokens for consistency with the design system.

## Browser Support

- Chrome 90+
- Firefox 98+
- Safari 15.4+
- Edge 90+

(Requires `<dialog>` element support)

## Migration from Old Modals

If migrating from another modal library:

1. Replace `<div class="modal">` with `<ren-dialog>`
2. Wrap content in `<dialog>` element
3. Add `.ren-dialog-header`, `.ren-dialog-body`, `.ren-dialog-footer` classes
4. Replace trigger selectors with `data-dialog-trigger`
5. Replace close handlers with `data-dialog-close`

## Known Limitations

- Nested dialogs not supported (by design - use drawer/sheet instead)
- Backdrop blur may have performance impact on older devices
- The `<dialog>` element's `returnValue` is used internally

## Best Practices

1. Always provide a close button in header
2. Use alert dialogs for important confirmations
3. Keep content concise and focused
4. Test on mobile and touch devices
5. Ensure sufficient contrast for close button
6. Provide context about what action will occur
