/* ═══ REN DATE PICKER WEB COMPONENT ═══
   A composable date picker that combines an input field with a calendar dropdown.

   Features:
   - Integrates RenCalendar component internally
   - Single and range date selection modes
   - Preset shortcuts (Today, Tomorrow, Next Week, etc.)
   - Popover API for dropdown positioning
   - Locale-aware date formatting
   - Focus management with blur/focus trapping
   - Form integration with hidden input

   Usage:
   <ren-date-picker placeholder="Select date" format="long" mode="single"></ren-date-picker>
   ══════════════════════════════════════════════════════════════════ */

export class RenDatePicker extends HTMLElement {
  constructor() {
    super();

    /* ═══ STATE ═══ */
    this.calendar = null;
    this.dropdown = null;
    this.trigger = null;
    this.isOpen = false;
    this.selectedValue = null;
    this.selectedRange = null;

    /* ═══ CONFIGURATION ═══ */
    this.format = 'short'; // short, medium, long
    this.locale = 'en-US';
    this.mode = 'single'; // single, range
    this.placeholder = 'Select date';

    /* ═══ BIND METHODS ═══ */
    this.handleTriggerClick = this.handleTriggerClick.bind(this);
    this.handleTriggerKeyDown = this.handleTriggerKeyDown.bind(this);
    this.handleCalendarSelect = this.handleCalendarSelect.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
  }

  connectedCallback() {
    /* ═══ READ ATTRIBUTES ═══ */
    this.mode = this.getAttribute('mode') || 'single';
    this.format = this.getAttribute('format') || 'short';
    this.locale = this.getAttribute('locale') || 'en-US';
    this.placeholder = this.getAttribute('placeholder') || 'Select date';

    const minAttr = this.getAttribute('min');
    const maxAttr = this.getAttribute('max');

    /* ═══ RENDER COMPONENT ═══ */
    this.render();

    /* ═══ SET UP CALENDAR ═══ */
    this.calendar = this.querySelector('ren-calendar');
    if (!this.calendar) {
      this.calendar = document.createElement('ren-calendar');
      this.calendar.setAttribute('mode', this.mode);
      if (this.locale) this.calendar.setAttribute('locale', this.locale);
      if (minAttr) this.calendar.setAttribute('min', minAttr);
      if (maxAttr) this.calendar.setAttribute('max', maxAttr);
      this.dropdown.appendChild(this.calendar);
    }

    /* ═══ SET UP TRIGGER ═══ */
    this.trigger = this.querySelector('.ren-date-picker-trigger');
    if (this.trigger) {
      this.trigger.addEventListener('click', this.handleTriggerClick);
      this.trigger.addEventListener('keydown', this.handleTriggerKeyDown);
    }

    /* ═══ SET UP DROPDOWN ═══ */
    this.dropdown = this.querySelector('[popover]');
    if (!this.dropdown) {
      this.dropdown = document.createElement('div');
      this.dropdown.className = 'ren-date-picker-dropdown';
      this.dropdown.setAttribute('popover', 'manual');
      this.appendChild(this.dropdown);
    }

    /* ═══ SETUP CALENDAR IN DROPDOWN ═══ */
    if (!this.calendar) {
      this.calendar = document.createElement('ren-calendar');
      this.calendar.setAttribute('mode', this.mode);
      if (this.locale) this.calendar.setAttribute('locale', this.locale);
      if (minAttr) this.calendar.setAttribute('min', minAttr);
      if (maxAttr) this.calendar.setAttribute('max', maxAttr);
      this.dropdown.appendChild(this.calendar);
    }

    /* ═══ LISTEN TO CALENDAR EVENTS ═══ */
    this.calendar.addEventListener('ren-date-select', this.handleCalendarSelect);

    /* ═══ LISTEN TO DOCUMENT CLICKS ═══ */
    document.addEventListener('click', this.handleDocumentClick);

    /* ═══ SET INITIAL VALUE ═══ */
    const valueAttr = this.getAttribute('value');
    if (valueAttr) {
      this.setValue(valueAttr);
    }

    /* ═══ ADD TO FORM IF PARENT IS FORM ═══ */
    this.addHiddenInput();
  }

  disconnectedCallback() {
    if (this.trigger) {
      this.trigger.removeEventListener('click', this.handleTriggerClick);
      this.trigger.removeEventListener('keydown', this.handleTriggerKeyDown);
    }

    if (this.calendar) {
      this.calendar.removeEventListener('ren-date-select', this.handleCalendarSelect);
    }

    document.removeEventListener('click', this.handleDocumentClick);
  }

  /* ═══ RENDER COMPONENT STRUCTURE ═══ */
  render() {
    this.classList.add('ren-date-picker');

    if (this.mode === 'range') {
      this.classList.add('ren-date-picker-range');
    }

    if (this.innerHTML.trim() === '') {
      /* ═══ CREATE TRIGGER ═══ */
      const trigger = document.createElement('button');
      trigger.className = 'ren-date-picker-trigger ren-date-picker-empty';
      trigger.setAttribute('type', 'button');
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('data-placeholder', this.placeholder);

      const valueSpan = document.createElement('span');
      valueSpan.className = 'ren-date-picker-value';
      trigger.appendChild(valueSpan);

      this.appendChild(trigger);

      /* ═══ CREATE DROPDOWN ═══ */
      const dropdown = document.createElement('div');
      dropdown.className = 'ren-date-picker-dropdown';
      dropdown.setAttribute('popover', 'manual');

      this.appendChild(dropdown);
    }
  }

  /* ═══ ADD HIDDEN INPUT FOR FORM SUBMISSION ═══ */
  addHiddenInput() {
    let hidden = this.querySelector('input[type="hidden"]');
    if (!hidden) {
      hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = this.getAttribute('name') || 'date-picker';
      this.appendChild(hidden);
    }
    this.hiddenInput = hidden;
  }

  /* ═══ HANDLE TRIGGER CLICK ═══ */
  handleTriggerClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.hasAttribute('disabled')) return;

    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /* ═══ HANDLE TRIGGER KEYBOARD ═══ */
  handleTriggerKeyDown(event) {
    if (this.hasAttribute('disabled')) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.open();
    }

    if (event.key === 'Escape') {
      this.close();
    }
  }

  /* ═══ HANDLE CALENDAR DATE SELECT ═══ */
  handleCalendarSelect(event) {
    const detail = event.detail;

    if (this.mode === 'single') {
      this.selectedValue = detail.date;
      this.updateTrigger(this.formatDate(detail.date));
      this.dispatchChangeEvent();
      this.close();
    } else if (this.mode === 'range') {
      this.selectedRange = detail.range;
      if (detail.range && detail.range.start && detail.range.end) {
        const formattedRange = `${this.formatDate(detail.range.start)} → ${this.formatDate(detail.range.end)}`;
        this.updateTrigger(formattedRange);
        this.dispatchChangeEvent();
        this.close();
      } else {
        const start = detail.range?.start ? this.formatDate(detail.range.start) : '';
        this.updateTrigger(start);
      }
    }
  }

  /* ═══ HANDLE DOCUMENT CLICK (CLOSE DROPDOWN ON OUTSIDE CLICK) ═══ */
  handleDocumentClick(event) {
    if (!this.contains(event.target) && this.isOpen) {
      this.close();
    }
  }

  /* ═══ OPEN DROPDOWN ═══ */
  open() {
    if (this.isOpen || this.hasAttribute('disabled')) return;

    if (!this.dropdown) return;

    /* ═══ SET UP POPOVER AND POSITIONING ═══ */
    try {
      this.dropdown.showPopover();
    } catch (e) {
      /* ═══ FALLBACK FOR UNSUPPORTED BROWSERS ═══ */
      this.dropdown.style.display = 'block';
    }

    this.isOpen = true;

    if (this.trigger) {
      this.trigger.setAttribute('aria-expanded', 'true');
    }

    /* ═══ FOCUS CALENDAR ═══ */
    setTimeout(() => {
      if (this.calendar) {
        const firstDay = this.calendar.querySelector('.ren-calendar-day:not([disabled])');
        if (firstDay) {
          firstDay.focus();
        }
      }
    }, 100);

    this.dispatchEvent(
      new CustomEvent('ren-date-picker-open', {
        bubbles: true,
        composed: true,
      })
    );
  }

  /* ═══ CLOSE DROPDOWN ═══ */
  close() {
    if (!this.isOpen) return;

    if (!this.dropdown) return;

    try {
      this.dropdown.hidePopover();
    } catch (e) {
      /* ═══ FALLBACK FOR UNSUPPORTED BROWSERS ═══ */
      this.dropdown.style.display = 'none';
    }

    this.isOpen = false;

    if (this.trigger) {
      this.trigger.setAttribute('aria-expanded', 'false');
      this.trigger.focus();
    }

    this.dispatchEvent(
      new CustomEvent('ren-date-picker-close', {
        bubbles: true,
        composed: true,
      })
    );
  }

  /* ═══ UPDATE TRIGGER TEXT ═══ */
  updateTrigger(formattedValue) {
    if (!this.trigger) return;

    const valueSpan = this.trigger.querySelector('.ren-date-picker-value');
    if (valueSpan) {
      valueSpan.textContent = formattedValue;
    }

    this.trigger.classList.remove('ren-date-picker-empty');

    /* ═══ UPDATE HIDDEN INPUT ═══ */
    if (this.hiddenInput) {
      this.hiddenInput.value = formattedValue;
    }
  }

  /* ═══ FORMAT DATE FOR DISPLAY ═══ */
  formatDate(date) {
    if (!date) return '';

    const formatter = new Intl.DateTimeFormat(this.locale, {
      year: 'numeric',
      month: this.format === 'short' ? '2-digit' : this.format === 'long' ? 'long' : 'short',
      day: '2-digit',
    });

    return formatter.format(date);
  }

  /* ═══ DISPATCH CHANGE EVENT ═══ */
  dispatchChangeEvent() {
    let value = null;
    let formattedValue = '';

    if (this.mode === 'single') {
      value = this.selectedValue ? this.dateToString(this.selectedValue) : null;
      formattedValue = this.selectedValue ? this.formatDate(this.selectedValue) : '';
    } else if (this.mode === 'range') {
      if (this.selectedRange && this.selectedRange.start && this.selectedRange.end) {
        value = {
          start: this.dateToString(this.selectedRange.start),
          end: this.dateToString(this.selectedRange.end),
        };
        formattedValue = `${this.formatDate(this.selectedRange.start)} → ${this.formatDate(this.selectedRange.end)}`;
      }
    }

    this.dispatchEvent(
      new CustomEvent('ren-change', {
        detail: {
          value,
          formattedValue,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /* ═══ CONVERT DATE TO ISO STRING ═══ */
  dateToString(date) {
    return date.toISOString().split('T')[0];
  }

  /* ═══ PUBLIC METHODS ═══ */

  /* ═══ GET VALUE ═══ */
  getValue() {
    if (this.mode === 'single') {
      return this.selectedValue ? this.dateToString(this.selectedValue) : null;
    } else if (this.mode === 'range') {
      return this.selectedRange
        ? {
            start: this.dateToString(this.selectedRange.start),
            end: this.dateToString(this.selectedRange.end),
          }
        : null;
    }
  }

  /* ═══ SET VALUE ═══ */
  setValue(value) {
    if (this.mode === 'single' && typeof value === 'string') {
      this.selectedValue = new Date(value);
      this.calendar.setValue(value);
      this.updateTrigger(this.formatDate(this.selectedValue));
    } else if (this.mode === 'range' && value && typeof value === 'object') {
      this.selectedRange = {
        start: new Date(value.start),
        end: new Date(value.end),
      };
      this.calendar.setRange(value.start, value.end);
      const formatted = `${this.formatDate(this.selectedRange.start)} → ${this.formatDate(this.selectedRange.end)}`;
      this.updateTrigger(formatted);
    }
  }

  /* ═══ TOGGLE DROPDOWN ═══ */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /* ═══ GETTERS AND SETTERS ═══ */
  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    if (val) {
      this.setAttribute('disabled', '');
      if (this.trigger) this.trigger.disabled = true;
    } else {
      this.removeAttribute('disabled');
      if (this.trigger) this.trigger.disabled = false;
    }
  }

  get open() {
    return this.isOpen;
  }

  set open(val) {
    if (val) {
      this.open();
    } else {
      this.close();
    }
  }
}

/* ═══ REGISTER COMPONENT ═══ */
if (!customElements.get('ren-date-picker')) {
  customElements.define('ren-date-picker', RenDatePicker);
}
