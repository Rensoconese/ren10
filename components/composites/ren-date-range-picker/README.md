# ren-date-range-picker

A composable date range picker with dual side-by-side calendars, configurable preset shortcuts, and an apply/cancel workflow. Built as a Web Component on top of `ren-calendar`.

## Usage

```html
<!-- Basic -->
<ren-date-range-picker placeholder="Select date range"></ren-date-range-picker>

<!-- With presets and locale -->
<ren-date-range-picker
  placeholder="Seleccionar rango"
  locale="es-ES"
  format="long"
  presets="last7,last30,thisMonth,lastMonth,thisQuarter,thisYear"
  min="2024-01-01"
  max="2027-12-31"
></ren-date-range-picker>

<!-- With initial value -->
<ren-date-range-picker
  start="2026-04-01"
  end="2026-04-07"
></ren-date-range-picker>

<!-- Disabled -->
<ren-date-range-picker disabled></ren-date-range-picker>
```

## Attributes

| Attribute     | Type   | Default            | Description                                      |
|---------------|--------|--------------------|--------------------------------------------------|
| `placeholder` | string | "Select date range"| Text shown when no range is selected              |
| `format`      | string | "short"            | Date format: "short", "medium", "long"            |
| `locale`      | string | "en-US"            | BCP 47 locale for Intl.DateTimeFormat             |
| `presets`     | string | "last7,last30,..." | Comma-separated preset keys                       |
| `min`         | string | —                  | Minimum selectable date (ISO format)              |
| `max`         | string | —                  | Maximum selectable date (ISO format)              |
| `start`       | string | —                  | Initial start date (ISO format)                   |
| `end`         | string | —                  | Initial end date (ISO format)                     |
| `name`        | string | "date-range"       | Name prefix for hidden form inputs                |
| `disabled`    | bool   | false              | Disables the component                            |

## Available Presets

`today`, `yesterday`, `last7`, `last14`, `last30`, `last90`, `thisWeek`, `lastWeek`, `thisMonth`, `lastMonth`, `thisQuarter`, `thisYear`, `lastYear`

## Events

```js
// Fires when user clicks "Apply"
picker.addEventListener('ren-change', (e) => {
  console.log(e.detail.value);          // { start: "2026-04-01", end: "2026-04-07" }
  console.log(e.detail.formattedValue); // "04/01/2026 → 04/07/2026"
  console.log(e.detail.preset);         // "last7" or null
  console.log(e.detail.days);           // 7
});

// Open/close events
picker.addEventListener('ren-date-range-open', () => { /* ... */ });
picker.addEventListener('ren-date-range-close', () => { /* ... */ });
```

## JavaScript API

```js
const picker = document.querySelector('ren-date-range-picker');

// Get current value
picker.getValue();  // { start: "2026-04-01", end: "2026-04-07" } or null

// Set value programmatically
picker.setValue('2026-04-01', '2026-04-07');

// Clear selection
picker.clear();

// Property access
picker.value = { start: '2026-04-01', end: '2026-04-07' };
picker.disabled = true;
```

## Form Integration

Hidden inputs are automatically created for form submission:

```html
<form>
  <ren-date-range-picker name="booking"></ren-date-range-picker>
  <!-- Creates: -->
  <!-- <input type="hidden" name="booking-start" value="2026-04-01"> -->
  <!-- <input type="hidden" name="booking-end" value="2026-04-07"> -->
</form>
```

## Dependencies

Requires `ren-calendar` to be registered:

```js
import './ren-calendar/ren-calendar.js';
import './ren-date-range-picker/ren-date-range-picker.js';
```
