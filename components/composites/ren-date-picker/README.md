# RenDatePicker Component

A composable date picker component that combines an input field with a calendar dropdown. Built on top of `RenCalendar`, it provides a complete date selection experience.

## Features

- **Composable**: Integrates `RenCalendar` internally
- **Popover API**: Uses native Popover API with fallback support
- **Flexible Modes**: Single date or date range selection
- **Smart Closing**: Auto-closes on selection or manual dismissal
- **Focus Management**: Proper focus handling between trigger and dropdown
- **Locale-Aware**: Full internationalization support
- **Form Integration**: Works with HTML forms via hidden input
- **Accessible**: ARIA attributes and keyboard navigation
- **CSS Anchor Positioning**: Modern CSS positioning with fallbacks
- **Mobile Responsive**: Optimized for mobile with bottom sheet style

## Files

- `ren-date-picker.css` (300 lines) - Styling with RenDS tokens
- `ren-date-picker.js` (427 lines) - Web component implementation

## Usage

### Single Date Picker

```html
<ren-date-picker
  placeholder="Select a date"
  format="long"
  mode="single"
></ren-date-picker>
```

### Range Date Picker

```html
<ren-date-picker
  placeholder="Select date range"
  format="medium"
  mode="range"
></ren-date-picker>
```

### With Pre-filled Value

```html
<ren-date-picker
  placeholder="Select a date"
  value="2026-03-31"
  format="short"
></ren-date-picker>
```

### With Constraints

```html
<ren-date-picker
  placeholder="Select a date"
  min="2026-03-01"
  max="2026-03-31"
></ren-date-picker>
```

### In a Form

```html
<form>
  <ren-date-picker
    name="start_date"
    placeholder="Project start date"
    required
  ></ren-date-picker>
  <button type="submit">Submit</button>
</form>
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | String (ISO 8601) | - | Initial selected date or range |
| `mode` | String | `single` | Selection mode: `single`, `range` |
| `placeholder` | String | `Select date` | Placeholder text when empty |
| `format` | String | `short` | Date format: `short`, `medium`, `long` |
| `locale` | String | `en-US` | Locale for date formatting |
| `min` | String (ISO 8601) | - | Minimum selectable date |
| `max` | String (ISO 8601) | - | Maximum selectable date |
| `disabled` | Boolean | `false` | Disable the date picker |
| `name` | String | `date-picker` | Name for form submission |

## Events

### `ren-change`

Fired when a date is selected (or range is completed in range mode).

```javascript
picker.addEventListener('ren-change', (e) => {
  console.log('Value:', e.detail.value);           // ISO string or range object
  console.log('Formatted:', e.detail.formattedValue); // Locale-formatted string
});
```

**Event Detail Structure:**
```javascript
{
  value: "2026-03-31" | { start: "2026-03-15", end: "2026-03-31" },
  formattedValue: "Mar 31, 2026" | "Mar 15, 2026 → Mar 31, 2026"
}
```

### `ren-date-picker-open`

Fired when the dropdown opens.

```javascript
picker.addEventListener('ren-date-picker-open', () => {
  console.log('Dropdown opened');
});
```

### `ren-date-picker-close`

Fired when the dropdown closes.

```javascript
picker.addEventListener('ren-date-picker-close', () => {
  console.log('Dropdown closed');
});
```

## Methods

### `getValue()`
Returns the currently selected value.

```javascript
const picker = document.querySelector('ren-date-picker');
const value = picker.getValue();
// Single mode: "2026-03-31" or null
// Range mode: { start: "2026-03-15", end: "2026-03-31" } or null
```

### `setValue(value)`
Sets the selected value(s).

```javascript
// Single mode
picker.setValue('2026-04-15');

// Range mode
picker.setValue({ start: '2026-03-15', end: '2026-04-15' });
```

### `open()`
Opens the dropdown programmatically.

```javascript
picker.open();
```

### `close()`
Closes the dropdown programmatically.

```javascript
picker.close();
```

### `toggle()`
Toggles the dropdown state.

```javascript
picker.toggle();
```

## Properties

### `disabled`
Get or set the disabled state.

```javascript
picker.disabled = true;  // Disable
picker.disabled = false; // Enable

console.log(picker.disabled); // true or false
```

### `open`
Get or set the open state of the dropdown.

```javascript
picker.open = true;  // Open dropdown
picker.open = false; // Close dropdown

console.log(picker.open); // true or false
```

## Date Formats

The `format` attribute controls how dates are displayed in the trigger:

- `short` - "3/31/26" or similar (locale-dependent)
- `medium` - "Mar 31, 2026" or similar
- `long` - "March 31, 2026" or similar

## Range Display

In range mode, dates are displayed with an arrow separator:

```
"Mar 15, 2026 → Mar 31, 2026"
```

The arrow is automatically handled by CSS and can be customized.

## Styling with RenDS Tokens

The component uses these design tokens:

- **Colors**: `--color-text`, `--color-accent`, `--color-surface`, `--color-surface-raised`, `--color-border`, `--color-fill`, etc.
- **Spacing**: `--space-1` through `--space-6`
- **Typography**: `--body-size`, `--label-size`, `--label-weight`
- **Radius**: `--radius-md`, `--radius-lg`
- **Shadows**: `--shadow-lg`
- **Transitions**: `--duration-fast`, `--duration-normal`, `--ease-out`
- **Sizes**: `--touch-min` (44px)

## Accessibility

- **ARIA Labels**: Proper `aria-haspopup`, `aria-expanded` attributes
- **Focus Management**: Focus returns to trigger when dropdown closes
- **Keyboard Navigation**: Arrow keys, Enter/Space, Escape
- **Screen Readers**: Calendar grid pattern properly announced
- **Touch Targets**: 44px minimum for mobile usability

## Keyboard Interaction

| Key | Action |
|-----|--------|
| Enter / Space | Open/close dropdown |
| Escape | Close dropdown |
| Arrow Keys | Navigate dates (when dropdown open) |
| Home / End | Week navigation (when dropdown open) |
| PageUp / PageDown | Month navigation (when dropdown open) |

## Mobile Optimization

On mobile screens (max-width: 480px), the dropdown changes to:

- **Bottom Sheet Style**: Slides up from bottom
- **Full Width**: Expands to fill screen width
- **Touch-Optimized**: Larger touch targets
- **Scrollable**: Fits within viewport with scroll

## Form Integration

The component works seamlessly with HTML forms:

```html
<form id="event-form">
  <ren-date-picker name="event_date" placeholder="Event date"></ren-date-picker>
  <button type="submit">Create Event</button>
</form>

<script>
  document.getElementById('event-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    console.log('Date:', formData.get('event_date'));
  });
</script>
```

## Composition with RenCalendar

The date picker creates and manages a `RenCalendar` component internally. You can access it:

```javascript
const picker = document.querySelector('ren-date-picker');
const calendar = picker.querySelector('ren-calendar');

// Listen to calendar events
calendar.addEventListener('ren-date-select', (e) => {
  console.log('Calendar selection:', e.detail);
});
```

## Error and Success States

Add custom validation states via classes:

```html
<ren-date-picker class="ren-date-picker-error"></ren-date-picker>
<ren-date-picker class="ren-date-picker-success"></ren-date-picker>
```

These will update the border color for visual feedback.

## Browser Support

- Modern browsers with Web Components support (Chrome 67+, Firefox 63+, Safari 10.1+)
- Popover API for dropdown (Chrome 114+, Firefox 114+, Safari 17+)
- Graceful fallback to fixed positioning on older browsers
- CSS Anchor Positioning with fallback (no position-anchor support)
- CSS Custom Properties required

## Related Components

- **RenCalendar** - The underlying calendar component
- **RenInput** - Basic input component (similar trigger styling)
- **RenPopover** - General-purpose popover component
