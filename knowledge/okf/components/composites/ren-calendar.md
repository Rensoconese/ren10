---
type: "RenDS Component"
title: ren-calendar
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:composite:ren-calendar
sourcePath: components/composites/ren-calendar
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - component
  - composite
  - ren10
  - rends
---

# ren-calendar

Source path: `components/composites/ren-calendar`

## Relationships

- `exposes_selector` -> [.ren-calendar](../../selectors/ren-calendar.md)
- `exposes_selector` -> [.ren-calendar-day](../../selectors/ren-calendar-day.md)
- `exposes_selector` -> [.ren-calendar-day-in-range](../../selectors/ren-calendar-day-in-range.md)
- `exposes_selector` -> [.ren-calendar-day-range-end](../../selectors/ren-calendar-day-range-end.md)
- `exposes_selector` -> [.ren-calendar-day-range-start](../../selectors/ren-calendar-day-range-start.md)
- `exposes_selector` -> [.ren-calendar-grid](../../selectors/ren-calendar-grid.md)
- `exposes_selector` -> [.ren-calendar-header](../../selectors/ren-calendar-header.md)
- `exposes_selector` -> [.ren-calendar-lg](../../selectors/ren-calendar-lg.md)
- `exposes_selector` -> [.ren-calendar-nav](../../selectors/ren-calendar-nav.md)
- `exposes_selector` -> [.ren-calendar-next](../../selectors/ren-calendar-next.md)
- `exposes_selector` -> [.ren-calendar-prev](../../selectors/ren-calendar-prev.md)
- `exposes_selector` -> [.ren-calendar-sm](../../selectors/ren-calendar-sm.md)
- `exposes_selector` -> [.ren-calendar-title](../../selectors/ren-calendar-title.md)
- `exposes_selector` -> [.ren-calendar-weekday](../../selectors/ren-calendar-weekday.md)
- `exposes_selector` -> [.ren-calendar-weekdays](../../selectors/ren-calendar-weekdays.md)
- `has_contract` -> [ren-calendar component.md](../../foundation/contract-composite-ren-calendar.md)
- `has_css` -> [ren-calendar.css](../../css/ren-calendar-css.md)
- `has_docs_page` -> [ren-calendar docs](../../docs/ren-calendar-docs.md)
- `has_js` -> [ren-calendar.js](../../javascript/ren-calendar-js.md)
- `uses_token` -> [--body-size](../../tokens/body-size.md)
- `uses_token` -> [--caption-size](../../tokens/caption-size.md)
- `uses_token` -> [--color-accent](../../tokens/color-accent.md)
- `uses_token` -> [--color-accent-subtle](../../tokens/color-accent-subtle.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-fill](../../tokens/color-fill.md)
- `uses_token` -> [--color-fill-active](../../tokens/color-fill-active.md)
- `uses_token` -> [--color-on-accent](../../tokens/color-on-accent.md)
- `uses_token` -> [--color-surface-raised](../../tokens/color-surface-raised.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-faint](../../tokens/color-text-faint.md)
- `uses_token` -> [--color-text-muted](../../tokens/color-text-muted.md)
- `uses_token` -> [--duration-enter](../../tokens/duration-enter.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--label-size](../../tokens/label-size.md)
- `uses_token` -> [--label-weight](../../tokens/label-weight.md)
- `uses_token` -> [--radius-lg](../../tokens/radius-lg.md)
- `uses_token` -> [--radius-md](../../tokens/radius-md.md)
- `uses_token` -> [--shadow-md](../../tokens/shadow-md.md)
- `uses_token` -> [--space-0-5](../../tokens/space-0-5.md)
- `uses_token` -> [--space-1](../../tokens/space-1.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-3](../../tokens/space-3.md)
- `uses_token` -> [--space-4](../../tokens/space-4.md)
- `uses_token` -> [--space-6](../../tokens/space-6.md)
- `uses_token` -> [--touch-min](../../tokens/touch-min.md)
- `uses_token` -> [--transition-tactile](../../tokens/transition-tactile.md)

## Structured Data

```json
{
  "kind": "composite",
  "selectors": [
    ".ren-calendar",
    ".ren-calendar-day",
    ".ren-calendar-day-in-range",
    ".ren-calendar-day-range-end",
    ".ren-calendar-day-range-start",
    ".ren-calendar-grid",
    ".ren-calendar-header",
    ".ren-calendar-lg",
    ".ren-calendar-nav",
    ".ren-calendar-next",
    ".ren-calendar-prev",
    ".ren-calendar-sm",
    ".ren-calendar-title",
    ".ren-calendar-weekday",
    ".ren-calendar-weekdays"
  ],
  "tokens": [
    "--body-size",
    "--caption-size",
    "--color-accent",
    "--color-accent-subtle",
    "--color-border",
    "--color-fill",
    "--color-fill-active",
    "--color-on-accent",
    "--color-surface-raised",
    "--color-text",
    "--color-text-faint",
    "--color-text-muted",
    "--duration-enter",
    "--ease-enter",
    "--label-size",
    "--label-weight",
    "--radius-lg",
    "--radius-md",
    "--shadow-md",
    "--space-0-5",
    "--space-1",
    "--space-2",
    "--space-3",
    "--space-4",
    "--space-6",
    "--touch-min",
    "--transition-tactile"
  ],
  "hasScript": true,
  "hasDocsPage": true
}
```

## Source Content

# ren-calendar Component Contract

Calendar grid and date selection composite.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-calendar` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-calendar` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Calendar composite behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this composite.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "The UI needs a full month grid for date browsing or selection."
    - "You need single, range, or multiple selection modes (mode=\"single|range|multiple\")."
    - "Locale-aware month names and first-day-of-week must be supported (locale, first-day attrs)."
    - "min / max bounds must constrain selectable dates."
    - "You need ARIA grid + roving tabindex keyboard navigation across days."
  avoidWhen:
    - "You only need a date text input — use ren-date-picker (composite that may embed ren-calendar)."
    - "You need a year/decade picker without a month grid — use a different control."
    - "The UI is a schedule / agenda view rather than date selection — use a calendar-view pattern."
    - "Only a static date display is needed — use ren-text with a formatted Date."

canonicalImports:
  css:
    - "rends/components/composites/ren-calendar/ren-calendar.css"
  js:
    - "rends/components/composites/ren-calendar/ren-calendar.js"
  notes:
    - "If the page already imports rends/components/index.css, do not import the CSS again."
    - "JS is required: <ren-calendar> renders the grid imperatively; there is no static markup fallback."
    - "Configure via attributes (value, mode, locale, first-day, min, max); avoid manual DOM mutations on .ren-calendar-grid."

requiredMarkup:
  - "Render <ren-calendar> as the host; the component populates its own .ren-calendar-header, .ren-calendar-weekdays, and .ren-calendar-grid."
  - "Each day cell is a real <button class=\"ren-calendar-day\"> with aria-selected and (when applicable) data-today / data-outside / [disabled]."
  - "Navigation arrows use .ren-calendar-prev / .ren-calendar-next inside .ren-calendar-nav and rely on the component's chevron pseudo-elements."
  - "Use .ren-calendar-sm or .ren-calendar-lg on the host for size variants; do not invent custom size classes."
  - "For ranges, the component sets .ren-calendar-day-range-start, .ren-calendar-day-in-range, .ren-calendar-day-range-end — do not author these by hand."

forbiddenPatterns:
  - "Replacing day <button>s with <div role=\"button\"> — breaks keyboard + screen reader expectations."
  - "Hardcoded today highlight (border: 2px solid #...) — rely on [data-today] and --color-accent."
  - "Toggling a day's selected state by adding a custom class instead of aria-selected=\"true\"."
  - "Mounting the calendar inside a non-modal popover without focus management — wrap in ren-popover or ren-dialog if floating."
  - "Hardcoded weekday labels in the markup; the component renders them from locale."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-calendar-bg, --ren-calendar-border, --ren-calendar-day-size, --ren-calendar-radius, --ren-calendar-range-bg, --ren-calendar-selected-bg, --ren-calendar-selected-color, --ren-calendar-today-bg, --ren-calendar-width."
    - "Semantic tokens: --color-surface-raised, --color-border, --color-text, --color-text-muted, --color-text-faint, --color-fill, --color-fill-active, --color-accent, --color-accent-subtle, --color-on-accent."
    - "Layout / motion tokens: --space-*, --radius-*, --shadow-md, --touch-min, --duration-enter, --ease-enter, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors in consumer overrides."
    - "Hardcoded day-cell sizes; tune --ren-calendar-day-size or pick the .ren-calendar-sm / .ren-calendar-lg variant."

accessibility:
  required:
    - "Day cells implement the ARIA grid pattern with a single roving tabindex; never expose more than one tab stop in the grid."
    - "Keyboard: Arrow keys move focus between days, PageUp/PageDown move months, Home/End jump within a week — preserve these in any customization."
    - "Selected days set aria-selected=\"true\"; do not communicate selection through color alone."
    - "Today indicator uses [data-today] AND an inset ring (box-shadow); the ring is required so color-blind users perceive today."
    - "Out-of-month days set [data-outside] and pointer-events: none; do not let them receive focus."
    - "Min/max bounds disable cells via the native [disabled] attribute so the browser blocks activation."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-calendar/ren-calendar.css">
<script type="module" src="rends/components/composites/ren-calendar/ren-calendar.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-calendar">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-calendar`
- `.ren-calendar-day`
- `.ren-calendar-day-in-range`
- `.ren-calendar-day-range-end`
- `.ren-calendar-day-range-start`
- `.ren-calendar-grid`
- `.ren-calendar-header`
- `.ren-calendar-lg`
- `.ren-calendar-nav`
- `.ren-calendar-next`
- `.ren-calendar-prev`
- `.ren-calendar-sm`
- `.ren-calendar-title`
- `.ren-calendar-weekday`
- `.ren-calendar-weekdays`

## States And Attributes

- `[aria-selected]`
- `[data-outside]`
- `[data-today]`
- `:active`
- `:disabled`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-calendar-bg`
- `--ren-calendar-border`
- `--ren-calendar-day-size`
- `--ren-calendar-radius`
- `--ren-calendar-range-bg`
- `--ren-calendar-selected-bg`
- `--ren-calendar-selected-color`
- `--ren-calendar-today-bg`
- `--ren-calendar-width`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-calendar/ren-calendar.css`
- `components/composites/ren-calendar/ren-calendar.js`
- `docs/components/ren-calendar.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/* ═══ REN CALENDAR WEB COMPONENT ═══
   A fully accessible, keyboard-navigable calendar component
   with support for single, range, and multiple date selection.
   Uses ARIA grid pattern with roving tabindex for keyboard navigation.
   ══════════════════════════════════════════════════════════════════ */

/* ═══ BASE CONTAINER ═══ */
.ren-calendar {
  container-type: inline-size;
  container-name: ren-calendar;
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-4);
  font-family: inherit;
}

/* ═══ HEADER WITH NAVIGATION ═══ */
.ren-calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
  gap: var(--space-2);
}

/* ═══ MONTH/YEAR TITLE ═══ */
.ren-calendar-title {
  font-size: var(--body-size);
  font-weight: var(--label-weight);
  color: var(--color-text);
  flex: 1;
  text-align: center;
  min-width: 150px;
  white-space: nowrap;
}

/* ═══ NAVIGATION BUTTONS ═══ */
.ren-calendar-nav {
  display: flex;
  gap: var(--space-1);
}

.ren-calendar-nav button {
  width: var(--touch-min);
  height: var(--touch-min);
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text);
  cursor: pointer;
  transition: var(--transition-tactile);
  position: relative;

  &:hover {
    background: var(--color-fill);
  }

  &:active {
    background: var(--color-fill-active);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  /* ═══ CHEVRON ICONS ═══ */
  &.ren-calendar-prev::before {
    content: '‹';
    font-size: 1.5em;
    font-weight: bold;
  }

  &.ren-calendar-next::before {
    content: '›';
    font-size: 1.5em;
    font-weight: bold;
  }
}

/* ═══ WEEKDAY HEADERS ═══ */
.ren-calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-1);
  margin-bottom: var(--space-2);
  font-size: var(--label-size);
  font-weight: var(--label-weight);
  color: var(--color-text-muted);
  text-align: center;
}

.ren-calendar-weekday {
  padding: var(--space-2) var(--space-1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ═══ CALENDAR GRID ═══ */
.ren-calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-1);
}

/* ═══ INDIVIDUAL DAY BUTTON ═══ */
.ren-calendar-day {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  width: 100%;
  aspect-ratio: 1;
  padding: var(--space-0-5);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: var(--body-size);
  cursor: pointer;
  transition: var(--transition-tactile);
  position: relative;

  /* ═══ DEFAULT STATE ═══ */
  &:not([disabled]):hover {
    background: var(--color-fill);
  }

  &:not([disabled]):active {
    background: var(--color-fill-active);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  /* ═══ SELECTED DATE ═══ */
  &[aria-selected="true"] {
    background: var(--color-accent);
    color: var(--color-on-accent);
    font-weight: 600;
  }

  /* ═══ TODAY INDICATOR ═══ */
  &[data-today] {
    background: var(--color-accent-subtle);
    color: var(--color-accent);
    font-weight: 600;
    box-shadow: inset 0 0 0 2px var(--color-accent);
  }

  &[data-today][aria-selected="true"] {
    background: var(--color-accent);
    color: var(--color-on-accent);
    box-shadow: none;
  }

  /* ═══ OUTSIDE MONTH DATES ═══ */
  &[data-outside] {
    color: var(--color-text-faint);
    pointer-events: none;
  }

  /* ═══ DISABLED DATES ═══ */
  &[disabled] {
    color: var(--color-text-muted);
    cursor: not-allowed;
    opacity: 0.5;
  }

  /* ═══ RANGE START ═══ */
  &.ren-calendar-day-range-start {
    background: var(--color-accent);
    color: var(--color-on-accent);
    border-radius: var(--radius-md);

    &::after {
      content: '';
      position: absolute;
      right: -4px;
      top: 0;
      bottom: 0;
      width: 50%;
      background: var(--color-accent-subtle);
      z-index: -1;
    }
  }

  /* ═══ RANGE END ═══ */
  &.ren-calendar-day-range-end {
    background: var(--color-accent);
    color: var(--color-on-accent);
    border-radius: var(--radius-md);

    &::before {
      content: '';
      position: absolute;
      left: -4px;
      top: 0;
      bottom: 0;
      width: 50%;
      background: var(--color-accent-subtle);
      z-index: -1;
    }
  }

  /* ═══ IN RANGE ═══ */
  &.ren-calendar-day-in-range {
    background: var(--color-accent-subtle);
    color: var(--color-text);
    border-radius: 0;
  }
}

/* ═══ ANIMATION FOR MONTH TRANSITIONS ═══ */
@keyframes ren-calendar-fade-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ren-calendar-grid {
  animation: ren-calendar-fade-in var(--duration-enter) var(--ease-enter);
}

/* ═══ REDUCED MOTION SUPPORT ═══ */
@media (prefers-reduced-motion: reduce) {
  .ren-calendar-grid {
    animation: none;
  }

  .ren-calendar-nav button,
  .ren-calendar-day {
    transition: none;
  }
}

/* ═══ SIZE VARIANT: SMALL ═══ */
.ren-calendar-sm {
  padding: var(--space-3);

  .ren-calendar-header {
    margin-bottom: var(--space-3);
  }

  .ren-calendar-title {
    font-size: var(--label-size);
  }

  .ren-calendar-nav button {
    width: 36px;
    height: 36px;
    min-width: 36px;
    min-height: 36px;
  }

  .ren-calendar-weekday {
    font-size: var(--caption-size);
  }

  .ren-calendar-day {
    font-size: var(--label-size);
    min-width: 36px;
    min-height: 36px;
  }
}

/* ═══ SIZE VARIANT: LARGE ═══ */
.ren-calendar-lg {
  padding: var(--space-6);

  .ren-calendar-header {
    margin-bottom: var(--space-6);
    gap: var(--space-4);
  }

  .ren-calendar-title {
    font-size: 1.25rem;
  }

  .ren-calendar-nav button {
    width: 52px;
    height: 52px;
    min-width: 52px;
    min-height: 52px;
    font-size: 1.25rem;
  }

  .ren-calendar-weekdays {
    margin-bottom: var(--space-4);
  }

  .ren-calendar-grid {
    gap: var(--space-2);
  }

  .ren-calendar-day {
    font-size: 1.125rem;
    min-width: 52px;
    min-height: 52px;
  }
}

/* ═══ DARK MODE SUPPORT ═══ */
@media (prefers-color-scheme: dark) {
  .ren-calendar {
    /* ═══ USES CSS VARIABLES - AUTO ADAPTS ═══ */
  }
}

/* ═══ COMPACT LAYOUT (Container Query) ═══ */
@container ren-calendar (max-width: 320px) {
  .ren-calendar {
    padding: var(--space-3);
  }

  .ren-calendar-grid {
    gap: var(--space-0-5);
  }

  .ren-calendar-day {
    min-width: 32px;
    min-height: 32px;
    font-size: var(--label-size);
  }

  .ren-calendar-nav button {
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
  }
}


/* ═══ REN CALENDAR WEB COMPONENT ═══
   A fully accessible, keyboard-navigable calendar for date selection.

   Features:
   - Multiple selection modes: single, range, multiple
   - Full keyboard navigation with ARIA grid pattern
   - Locale-aware date formatting
   - Customizable min/max dates
   - Month navigation with prev/next buttons
   - Today indicator and outside-month date styling

   Usage:
   <ren-calendar value="2026-03-31" locale="en-US" mode="single"></ren-calendar>
   ══════════════════════════════════════════════════════════════════ */

export class RenCalendar extends HTMLElement {
  constructor() {
    super();

    /* ═══ STATE ═══ */
    this.currentDate = new Date();
    this.selectedDate = null;
    this.selectedDates = new Set();
    this.rangeStart = null;
    this.rangeEnd = null;
    this.focusedDate = null;

    /* ═══ CONFIGURATION ═══ */
    this.mode = 'single'; // single, range, multiple
    this.locale = 'en-US';
    this.firstDay = 0; // 0 = Sunday, 1 = Monday
    this.minDate = null;
    this.maxDate = null;

    /* ═══ BIND METHODS ═══ */
    this.handleDayClick = this.handleDayClick.bind(this);
    this.handleDayKeyDown = this.handleDayKeyDown.bind(this);
    this.handlePrevMonth = this.handlePrevMonth.bind(this);
    this.handleNextMonth = this.handleNextMonth.bind(this);
  }

  connectedCallback() {
    /* ═══ READ ATTRIBUTES ═══ */
    this.mode = this.getAttribute('mode') || 'single';
    this.locale = this.getAttribute('locale') || 'en-US';
    const firstDayAttr = this.getAttribute('first-day');
    if (firstDayAttr !== null) this.firstDay = parseInt(firstDayAttr, 10);

    /* ═══ PARSE DATE ATTRIBUTES ═══ */
    const valueAttr = this.getAttribute('value');
    if (valueAttr) {
      const parsed = new Date(valueAttr);
      if (!isNaN(parsed)) {
        this.selectedDate = parsed;
        this.currentDate = new Date(parsed);
      }
    }

    const minAttr = this.getAttribute('min');
    if (minAttr) this.minDate = new Date(minAttr);

    const maxAttr = this.getAttribute('max');
    if (maxAttr) this.maxDate = new Date(maxAttr);

    /* ═══ RENDER CALENDAR ═══ */
    this.render();
  }

  /* ═══ RENDER CALENDAR ═══ */
  render() {
    this.innerHTML = '';
    this.classList.add('ren-calendar');

    /* ═══ BUILD HEADER ═══ */
    const header = document.createElement('div');
    header.className = 'ren-calendar-header';

    const title = document.createElement('div');
    title.className = 'ren-calendar-title';
    title.textContent = this.formatMonthYear();
    title.setAttribute('aria-live', 'polite');

    const navDiv = document.createElement('div');
    navDiv.className = 'ren-calendar-nav';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'ren-calendar-prev';
    prevBtn.setAttribute('aria-label', `Previous month (${this.formatPrevMonth()})`);
    prevBtn.addEventListener('click', this.handlePrevMonth);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'ren-calendar-next';
    nextBtn.setAttribute('aria-label', `Next month (${this.formatNextMonth()})`);
    nextBtn.addEventListener('click', this.handleNextMonth);

    navDiv.appendChild(prevBtn);
    navDiv.appendChild(nextBtn);

    header.appendChild(title);
    header.appendChild(navDiv);
    this.appendChild(header);

    /* ═══ BUILD WEEKDAY HEADERS ═══ */
    const weekdaysDiv = document.createElement('div');
    weekdaysDiv.className = 'ren-calendar-weekdays';

    const weekdayNames = this.getWeekdayNames();
    weekdayNames.forEach((name) => {
      const dayLabel = document.createElement('div');
      dayLabel.className = 'ren-calendar-weekday';
      dayLabel.textContent = name;
      dayLabel.setAttribute('aria-label', name);
      weekdaysDiv.appendChild(dayLabel);
    });

    this.appendChild(weekdaysDiv);

    /* ═══ BUILD CALENDAR GRID ═══ */
    const grid = document.createElement('div');
    grid.className = 'ren-calendar-grid';
    grid.setAttribute('role', 'grid');

    const dates = this.generateCalendarDates();
    dates.forEach((date, index) => {
      const dayBtn = document.createElement('button');
      dayBtn.className = 'ren-calendar-day';
      dayBtn.textContent = date.date.getDate();
      dayBtn.setAttribute('type', 'button');
      dayBtn.setAttribute('role', 'gridcell');
      dayBtn.setAttribute('data-date', this.dateToString(date.date));

      /* ═══ HANDLE OUTSIDE MONTH DATES ═══ */
      if (date.outside) {
        dayBtn.setAttribute('data-outside', '');
        dayBtn.setAttribute('aria-disabled', 'true');
        dayBtn.disabled = true;
      }

      /* ═══ CHECK IF DATE IS DISABLED ═══ */
      if (this.isDateDisabled(date.date)) {
        dayBtn.disabled = true;
        dayBtn.setAttribute('aria-disabled', 'true');
      }

      /* ═══ CHECK IF TODAY ═══ */
      if (this.isToday(date.date)) {
        dayBtn.setAttribute('data-today', '');
      }

      /* ═══ CHECK IF SELECTED (SINGLE MODE) ═══ */
      if (this.mode === 'single' && this.selectedDate && this.isSameDay(date.date, this.selectedDate)) {
        dayBtn.setAttribute('aria-selected', 'true');
        this.focusedDate = date.date;
      }

      /* ═══ CHECK IF SELECTED (MULTIPLE MODE) ═══ */
      if (this.mode === 'multiple' && this.selectedDates.has(this.dateToString(date.date))) {
        dayBtn.setAttribute('aria-selected', 'true');
      }

      /* ═══ CHECK RANGE SELECTION ═══ */
      if (this.mode === 'range' && this.rangeStart && this.rangeEnd) {
        const dateStr = this.dateToString(date.date);
        const rangeStart = this.dateToString(this.rangeStart);
        const rangeEnd = this.dateToString(this.rangeEnd);

        if (dateStr === rangeStart) {
          dayBtn.classList.add('ren-calendar-day-range-start');
          dayBtn.setAttribute('aria-selected', 'true');
        } else if (dateStr === rangeEnd) {
          dayBtn.classList.add('ren-calendar-day-range-end');
          dayBtn.setAttribute('aria-selected', 'true');
        } else if (dateStr > rangeStart && dateStr < rangeEnd) {
          dayBtn.classList.add('ren-calendar-day-in-range');
        }
      }

      /* ═══ EVENT LISTENERS ═══ */
      dayBtn.addEventListener('click', (e) => this.handleDayClick(e, date.date));
      dayBtn.addEventListener('keydown', (e) => this.handleDayKeyDown(e, date.date, index, dates.length));

      grid.appendChild(dayBtn);
    });

    this.appendChild(grid);

    /* ═══ SET TABINDEX FOR FOCUS MANAGEMENT ═══ */
    this.updateTabIndex();
  }

  /* ═══ UPDATE TABINDEX FOR ROVING TABINDEX PATTERN ═══ */
  updateTabIndex() {
    const buttons = Array.from(this.querySelectorAll('.ren-calendar-day'));
    const enabledButtons = buttons.filter((btn) => !btn.disabled);
    let target = null;

    if (this.focusedDate) {
      const focusedDateString = this.dateToString(this.focusedDate);
      target = enabledButtons.find((btn) => btn.dataset.date === focusedDateString);
    }

    if (!target && this.selectedDate) {
      const selectedDateString = this.dateToString(this.selectedDate);
      target = enabledButtons.find((btn) => btn.dataset.date === selectedDateString);
    }

    if (!target) {
      target = enabledButtons.find((btn) => btn.hasAttribute('data-today'));
    }

    target ??= enabledButtons[0] ?? null;

    buttons.forEach((btn) => {
      btn.setAttribute('tabindex', btn === target ? '0' : '-1');
    });
  }

  /* ═══ GENERATE CALENDAR DATES ═══ */
  generateCalendarDates() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    /* ═══ FIRST DAY OF MONTH AND WEEKDAY ═══ */
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    /* ═══ STARTING WEEKDAY ═══ */
    let startingDayOfWeek = firstDay.getDay() - this.firstDay;
    if (startingDayOfWeek < 0) startingDayOfWeek += 7;

    const dates = [];

    /* ═══ PREVIOUS MONTH DATES ═══ */
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
      dates.push({ date: prevDate, outside: true });
    }

    /* ═══ CURRENT MONTH DATES ═══ */
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push({ date: new Date(year, month, day), outside: false });
    }

    /* ═══ NEXT MONTH DATES ═══ */
    const remainingCells = 42 - dates.length; // 6 rows × 7 cols
    for (let day = 1; day <= remainingCells; day++) {
      dates.push({ date: new Date(year, month + 1, day), outside: true });
    }

    return dates;
  }

  /* ═══ GET WEEKDAY NAMES ═══ */
  getWeekdayNames() {
    const formatter = new Intl.DateTimeFormat(this.locale, { weekday: 'short' });
    const weekdays = [];

    for (let i = 0; i < 7; i++) {
      const dayIndex = (i + this.firstDay) % 7;
      const date = new Date(2024, 0, dayIndex + 7); // Sunday is Jan 7, 2024
      weekdays.push(formatter.format(date).toUpperCase().substring(0, 2));
    }

    return weekdays;
  }

  /* ═══ FORMAT MONTH AND YEAR ═══ */
  formatMonthYear() {
    const formatter = new Intl.DateTimeFormat(this.locale, { month: 'long', year: 'numeric' });
    return formatter.format(this.currentDate);
  }

  /* ═══ FORMAT PREVIOUS MONTH ═══ */
  formatPrevMonth() {
    const prevMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
    const formatter = new Intl.DateTimeFormat(this.locale, { month: 'long', year: 'numeric' });
    return formatter.format(prevMonth);
  }

  /* ═══ FORMAT NEXT MONTH ═══ */
  formatNextMonth() {
    const nextMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
    const formatter = new Intl.DateTimeFormat(this.locale, { month: 'long', year: 'numeric' });
    return formatter.format(nextMonth);
  }

  /* ═══ HANDLE DAY CLICK ═══ */
  handleDayClick(event, date) {
    if (event.target.disabled || event.target.hasAttribute('data-outside')) {
      return;
    }

    this.selectDate(date);
  }

  /* ═══ SELECT DATE ═══ */
  selectDate(date) {
    if (this.mode === 'single') {
      this.selectedDate = date;
      this.focusedDate = date;
      this.dispatchDateSelectEvent();
    } else if (this.mode === 'range') {
      if (!this.rangeStart) {
        this.rangeStart = date;
      } else if (!this.rangeEnd) {
        if (date < this.rangeStart) {
          this.rangeEnd = this.rangeStart;
          this.rangeStart = date;
        } else {
          this.rangeEnd = date;
        }
      } else {
        this.rangeStart = date;
        this.rangeEnd = null;
      }
      this.dispatchDateSelectEvent();
    } else if (this.mode === 'multiple') {
      const dateStr = this.dateToString(date);
      if (this.selectedDates.has(dateStr)) {
        this.selectedDates.delete(dateStr);
      } else {
        this.selectedDates.add(dateStr);
      }
      this.dispatchDateSelectEvent();
    }

    this.render();
  }

  /* ═══ HANDLE DAY KEYBOARD NAVIGATION ═══ */
  handleDayKeyDown(event, date, index, totalDates) {
    const key = event.key;

    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      this.selectDate(date);
      return;
    }

    if (key === 'ArrowUp') {
      event.preventDefault();
      const newIndex = Math.max(0, index - 7);
      this.focusDateAtIndex(newIndex);
      return;
    }

    if (key === 'ArrowDown') {
      event.preventDefault();
      const newIndex = Math.min(totalDates - 1, index + 7);
      this.focusDateAtIndex(newIndex);
      return;
    }

    if (key === 'ArrowLeft') {
      event.preventDefault();
      const newIndex = Math.max(0, index - 1);
      this.focusDateAtIndex(newIndex);
      return;
    }

    if (key === 'ArrowRight') {
      event.preventDefault();
      const newIndex = Math.min(totalDates - 1, index + 1);
      this.focusDateAtIndex(newIndex);
      return;
    }

    if (key === 'Home') {
      event.preventDefault();
      const weekStart = Math.floor(index / 7) * 7;
      this.focusDateAtIndex(weekStart);
      return;
    }

    if (key === 'End') {
      event.preventDefault();
      const weekEnd = Math.ceil((index + 1) / 7) * 7 - 1;
      this.focusDateAtIndex(Math.min(totalDates - 1, weekEnd));
      return;
    }

    if (key === 'PageUp') {
      event.preventDefault();
      this.handlePrevMonth();
      return;
    }

    if (key === 'PageDown') {
      event.preventDefault();
      this.handleNextMonth();
      return;
    }
  }

  /* ═══ FOCUS DATE AT INDEX ═══ */
  focusDateAtIndex(index) {
    const buttons = this.querySelectorAll('.ren-calendar-day');
    if (buttons[index] && !buttons[index].disabled) {
      this.focusedDate = new Date(buttons[index].dataset.date);
      this.updateTabIndex();
      buttons[index].focus();
    }
  }

  /* ═══ HANDLE PREVIOUS MONTH ═══ */
  handlePrevMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
    this.render();
  }

  /* ═══ HANDLE NEXT MONTH ═══ */
  handleNextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
    this.render();
  }

  /* ═══ GO TO MONTH ═══ */
  goToMonth(year, month) {
    this.currentDate = new Date(year, month);
    this.render();
  }

  /* ═══ SET RANGE ═══ */
  setRange(start, end) {
    if (this.mode !== 'range') {
      console.warn('RenCalendar: setRange() only works in range mode');
      return;
    }

    this.rangeStart = new Date(start);
    this.rangeEnd = new Date(end);
    this.render();
  }

  /* ═══ DISPATCH CUSTOM EVENT ═══ */
  dispatchDateSelectEvent() {
    let eventData = { date: this.selectedDate };

    if (this.mode === 'range') {
      eventData = { range: { start: this.rangeStart, end: this.rangeEnd } };
    } else if (this.mode === 'multiple') {
      eventData = { dates: Array.from(this.selectedDates).map((d) => new Date(d)) };
    }

    this.dispatchEvent(
      new CustomEvent('ren-date-select', {
        detail: eventData,
        bubbles: true,
        composed: true,
      })
    );
  }

  /* ═══ UTILITY METHODS ═══ */

  /* ═══ CHECK IF DATE IS TODAY ═══ */
  isToday(date) {
    const today = new Date();
    return this.isSameDay(date, today);
  }

  /* ═══ CHECK IF TWO DATES ARE THE SAME DAY ═══ */
  isSameDay(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /* ═══ CHECK IF DATE IS DISABLED ═══ */
  isDateDisabled(date) {
    if (this.minDate && date < this.minDate) return true;
    if (this.maxDate && date > this.maxDate) return true;
    return false;
  }

  /* ═══ CONVERT DATE TO ISO STRING ═══ */
  dateToString(date) {
    return date.toISOString().split('T')[0];
  }

  /* ═══ PUBLIC METHODS ═══ */

  /* ═══ GET VALUE ═══ */
  getValue() {
    if (this.mode === 'single') {
      return this.selectedDate ? this.dateToString(this.selectedDate) : null;
    } else if (this.mode === 'range') {
      return this.rangeStart && this.rangeEnd
        ? { start: this.dateToString(this.rangeStart), end: this.dateToString(this.rangeEnd) }
        : null;
    } else if (this.mode === 'multiple') {
      return Array.from(this.selectedDates);
    }
  }

  /* ═══ SET VALUE ═══ */
  setValue(value) {
    if (this.mode === 'single' && typeof value === 'string') {
      this.selectedDate = new Date(value);
      this.render();
    } else if (this.mode === 'range' && value && typeof value === 'object') {
      this.rangeStart = new Date(value.start);
      this.rangeEnd = new Date(value.end);
      this.render();
    } else if (this.mode === 'multiple' && Array.isArray(value)) {
      this.selectedDates = new Set(value);
      this.render();
    }
  }
}

/* ═══ REGISTER COMPONENT ═══ */
if (!customElements.get('ren-calendar')) {
  customElements.define('ren-calendar', RenCalendar);
}
