# RenCalendar Component

A fully accessible, keyboard-navigable calendar component for date selection in RenDS. Supports single, range, and multiple date selection modes.

## Features

- **Multiple Selection Modes**: Single date, date range, or multiple dates
- **Accessible**: ARIA grid pattern, keyboard navigation, screen reader support
- **Locale-Aware**: Uses `Intl.DateTimeFormat` for date formatting
- **Customizable**: Min/max dates, first day of week, sizing variants
- **Keyboard Navigation**:
  - Arrow keys to navigate dates
  - Enter/Space to select
  - Home/End for week navigation
  - PageUp/PageDown for month navigation
- **Visual States**: Today indicator, outside month dates, disabled dates
- **CSS-First**: Uses RenDS design tokens and variables

## Files

- `ren-calendar.css` (350 lines) - Styling with RenDS tokens
- `ren-calendar.js` (503 lines) - Web component implementation

## Usage

### Basic Single Date Selection

```html
<ren-calendar
  value="2026-03-31"
  mode="single"
  locale="en-US"
></ren-calendar>
```

### Date Range Selection

```html
<ren-calendar
  mode="range"
  locale="en-US"
></ren-calendar>
```

### Multiple Date Selection

```html
<ren-calendar
  mode="multiple"
  locale="en-US"
></ren-calendar>
```

### Size Variants

```html
<!-- Small -->
<ren-calendar class="ren-calendar-sm"></ren-calendar>

<!-- Large -->
<ren-calendar class="ren-calendar-lg"></ren-calendar>
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | String (ISO 8601) | - | Initial selected date |
| `mode` | String | `single` | Selection mode: `single`, `range`, `multiple` |
| `locale` | String | `en-US` | Locale for date formatting |
| `first-day` | Number | `0` | First day of week (0=Sun, 1=Mon) |
| `min` | String (ISO 8601) | - | Minimum selectable date |
| `max` | String (ISO 8601) | - | Maximum selectable date |

## Events

### `ren-date-select`

Fired when a date is selected. Event details:

```javascript
// Single mode
event.detail = { date: Date }

// Range mode
event.detail = { range: { start: Date, end: Date } }

// Multiple mode
event.detail = { dates: Date[] }
```

```javascript
calendar.addEventListener('ren-date-select', (e) => {
  if (calendar.getAttribute('mode') === 'single') {
    console.log('Selected:', e.detail.date);
  } else if (calendar.getAttribute('mode') === 'range') {
    console.log('Range:', e.detail.range);
  }
});
```

## Methods

### `getValue()`
Returns the currently selected value based on mode.

```javascript
const calendar = document.querySelector('ren-calendar');
const value = calendar.getValue(); // String | Object | Array
```

### `setValue(value)`
Sets the selected value(s).

```javascript
// Single mode
calendar.setValue('2026-04-15');

// Range mode
calendar.setValue({ start: '2026-03-15', end: '2026-04-15' });

// Multiple mode
calendar.setValue(['2026-03-15', '2026-03-20']);
```

### `goToMonth(year, month)`
Navigate to a specific month (0-indexed).

```javascript
calendar.goToMonth(2026, 3); // April 2026
```

### `setRange(start, end)`
Set a date range (range mode only).

```javascript
calendar.setRange('2026-03-15', '2026-04-15');
```

## Styling with RenDS Tokens

The component uses these design tokens:

- **Colors**: `--color-text`, `--color-accent`, `--color-surface-raised`, `--color-border`, etc.
- **Spacing**: `--space-1` through `--space-6`
- **Typography**: `--body-size`, `--label-size`, `--label-weight`
- **Radius**: `--radius-md`, `--radius-lg`
- **Shadows**: `--shadow-md`
- **Transitions**: `--duration-fast`, `--duration-normal`, `--ease-out`

## Accessibility

- **ARIA Grid Pattern**: Proper roles and labels for screen readers
- **Roving Tabindex**: Keyboard navigation with tabindex management
- **Semantic HTML**: Button elements with proper ARIA attributes
- **Focus Management**: Visual focus indicators
- **Today Indicator**: Clearly marked with ring outline
- **Disabled States**: Proper visual and interactive feedback

## Size Variants

### `.ren-calendar-sm`
Smaller, compact variant suitable for inline usage.

### `.ren-calendar-lg`
Larger variant with bigger touch targets and more spacing.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Arrow Up | Move focus up one week |
| Arrow Down | Move focus down one week |
| Arrow Left | Move focus left one day |
| Arrow Right | Move focus right one day |
| Home | Move to start of week |
| End | Move to end of week |
| PageUp | Previous month |
| PageDown | Next month |
| Enter / Space | Select focused date |

## Integration with RenDatePicker

The calendar component is designed to be used standalone or composed into `RenDatePicker` for a complete date selection experience.

```html
<ren-date-picker mode="single" placeholder="Select a date">
  <!-- Calendar is inserted here by RenDatePicker -->
</ren-date-picker>
```

## Browser Support

- Modern browsers with Web Components support (Chrome 67+, Firefox 63+, Safari 10.1+)
- Popover API support for RenDatePicker (graceful fallback for older browsers)
- CSS Custom Properties support required
