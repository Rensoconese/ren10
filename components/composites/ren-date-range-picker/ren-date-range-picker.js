/* ═══ REN DATE RANGE PICKER WEB COMPONENT ═══
   A composable date range picker with dual side-by-side calendars,
   preset shortcuts, and confirmation actions.

   Features:
   - Dual calendar view (current + next month)
   - Configurable preset shortcuts (Last 7 days, Last 30 days, etc.)
   - Apply / Cancel workflow for intentional selection
   - Locale-aware date formatting via Intl.DateTimeFormat
   - Popover API dropdown with CSS anchor positioning
   - Full keyboard navigation (delegates to RenCalendar)
   - Focus management and outside-click dismissal
   - Form integration with hidden inputs (start + end)
   - Min/max date constraints

   Dependencies:
   - RenCalendar (ren-calendar.js) must be registered

   Usage:
   <ren-date-range-picker
     placeholder="Select date range"
     format="short"
     locale="en-US"
     presets="last7,last30,thisMonth,lastMonth,thisYear"
     min="2024-01-01"
     max="2027-12-31"
   ></ren-date-range-picker>

   Events:
   - ren-change: { value: { start, end }, formattedValue, preset? }
   - ren-date-range-open
   - ren-date-range-close
   ══════════════════════════════════════════════════════════════════ */

/* ═══ PRESET DEFINITIONS ═══ */
const PRESETS = {
  today: {
    label: 'Today',
    getRange: () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { start: today, end: today };
    },
  },
  yesterday: {
    label: 'Yesterday',
    getRange: () => {
      const now = new Date();
      const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      return { start: yesterday, end: yesterday };
    },
  },
  last7: {
    label: 'Last 7 days',
    getRange: () => {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      return { start, end };
    },
  },
  last14: {
    label: 'Last 14 days',
    getRange: () => {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const start = new Date(end);
      start.setDate(start.getDate() - 13);
      return { start, end };
    },
  },
  last30: {
    label: 'Last 30 days',
    getRange: () => {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const start = new Date(end);
      start.setDate(start.getDate() - 29);
      return { start, end };
    },
  },
  last90: {
    label: 'Last 90 days',
    getRange: () => {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const start = new Date(end);
      start.setDate(start.getDate() - 89);
      return { start, end };
    },
  },
  thisWeek: {
    label: 'This week',
    getRange: () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dayOfWeek = today.getDay();
      const start = new Date(today);
      start.setDate(start.getDate() - dayOfWeek);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return { start, end };
    },
  },
  lastWeek: {
    label: 'Last week',
    getRange: () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dayOfWeek = today.getDay();
      const end = new Date(today);
      end.setDate(end.getDate() - dayOfWeek - 1);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      return { start, end };
    },
  },
  thisMonth: {
    label: 'This month',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start, end };
    },
  },
  lastMonth: {
    label: 'Last month',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start, end };
    },
  },
  thisQuarter: {
    label: 'This quarter',
    getRange: () => {
      const now = new Date();
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;
      const start = new Date(now.getFullYear(), quarterStart, 1);
      const end = new Date(now.getFullYear(), quarterStart + 3, 0);
      return { start, end };
    },
  },
  thisYear: {
    label: 'This year',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      return { start, end };
    },
  },
  lastYear: {
    label: 'Last year',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear() - 1, 0, 1);
      const end = new Date(now.getFullYear() - 1, 11, 31);
      return { start, end };
    },
  },
};

export class RenDateRangePicker extends HTMLElement {
  constructor() {
    super();

    /* ═══ STATE ═══ */
    this.calendarLeft = null;
    this.calendarRight = null;
    this.dropdown = null;
    this.trigger = null;
    this.isOpen = false;

    /* ═══ CONFIRMED (applied) range ═══ */
    this.confirmedStart = null;
    this.confirmedEnd = null;

    /* ═══ DRAFT (in-progress) range ═══ */
    this.draftStart = null;
    this.draftEnd = null;
    this.activePreset = null;

    /* ═══ CONFIGURATION ═══ */
    this.format = 'short';
    this.locale = 'en-US';
    this.placeholder = 'Select date range';
    this.presetKeys = ['last7', 'last30', 'thisMonth', 'lastMonth'];
    this.minDate = null;
    this.maxDate = null;

    /* ═══ CALENDAR MONTH OFFSETS ═══ */
    this.leftMonth = new Date();
    this.rightMonth = new Date(
      this.leftMonth.getFullYear(),
      this.leftMonth.getMonth() + 1
    );

    /* ═══ BIND METHODS ═══ */
    this.handleTriggerClick = this.handleTriggerClick.bind(this);
    this.handleTriggerKeyDown = this.handleTriggerKeyDown.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleCalendarSelect = this.handleCalendarSelect.bind(this);
    this.handleApply = this.handleApply.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  connectedCallback() {
    /* ═══ READ ATTRIBUTES ═══ */
    this.format = this.getAttribute('format') || 'short';
    this.locale = this.getAttribute('locale') || 'en-US';
    this.placeholder = this.getAttribute('placeholder') || 'Select date range';

    const presetsAttr = this.getAttribute('presets');
    if (presetsAttr) {
      this.presetKeys = presetsAttr.split(',').map((k) => k.trim());
    }

    const minAttr = this.getAttribute('min');
    if (minAttr) this.minDate = minAttr;

    const maxAttr = this.getAttribute('max');
    if (maxAttr) this.maxDate = maxAttr;

    /* ═══ PARSE INITIAL VALUE ═══ */
    const startAttr = this.getAttribute('start');
    const endAttr = this.getAttribute('end');
    if (startAttr && endAttr) {
      this.confirmedStart = new Date(startAttr);
      this.confirmedEnd = new Date(endAttr);
      this.draftStart = new Date(startAttr);
      this.draftEnd = new Date(endAttr);
      this.leftMonth = new Date(this.confirmedStart.getFullYear(), this.confirmedStart.getMonth());
      this.rightMonth = new Date(this.leftMonth.getFullYear(), this.leftMonth.getMonth() + 1);
    }

    /* ═══ RENDER ═══ */
    this.render();
    this.setupEventListeners();
    this.addHiddenInputs();
    this.updateTriggerDisplay();
  }

  disconnectedCallback() {
    if (this.trigger) {
      this.trigger.removeEventListener('click', this.handleTriggerClick);
      this.trigger.removeEventListener('keydown', this.handleTriggerKeyDown);
    }

    document.removeEventListener('click', this.handleDocumentClick);
  }

  /* ═══ RENDER FULL COMPONENT ═══ */
  render() {
    this.innerHTML = '';
    this.classList.add('ren-date-range-picker');

    /* ═══ TRIGGER BUTTON ═══ */
    const trigger = document.createElement('button');
    trigger.className = 'ren-date-range-trigger ren-date-range-empty';
    trigger.setAttribute('type', 'button');
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('data-placeholder', this.placeholder);

    const valueEl = document.createElement('span');
    valueEl.className = 'ren-date-range-value';

    const startEl = document.createElement('span');
    startEl.className = 'ren-date-range-start';

    const sepEl = document.createElement('span');
    sepEl.className = 'ren-date-range-separator';
    sepEl.textContent = '→';

    const endEl = document.createElement('span');
    endEl.className = 'ren-date-range-end';

    valueEl.appendChild(startEl);
    valueEl.appendChild(sepEl);
    valueEl.appendChild(endEl);
    trigger.appendChild(valueEl);
    this.appendChild(trigger);
    this.trigger = trigger;

    /* ═══ DROPDOWN (POPOVER) ═══ */
    const dropdown = document.createElement('div');
    dropdown.className = 'ren-date-range-dropdown';
    dropdown.setAttribute('popover', 'manual');
    dropdown.setAttribute('role', 'dialog');
    dropdown.setAttribute('aria-label', 'Date range selection');

    const inner = document.createElement('div');
    inner.className = 'ren-date-range-inner';

    /* ═══ PRESETS ═══ */
    if (this.presetKeys.length > 0) {
      const presetsEl = document.createElement('div');
      presetsEl.className = 'ren-date-range-presets';
      presetsEl.setAttribute('role', 'listbox');
      presetsEl.setAttribute('aria-label', 'Date range presets');

      this.presetKeys.forEach((key) => {
        const preset = PRESETS[key];
        if (!preset) return;

        const btn = document.createElement('button');
        btn.className = 'ren-date-range-preset';
        btn.setAttribute('type', 'button');
        btn.setAttribute('role', 'option');
        btn.setAttribute('data-preset', key);
        btn.textContent = preset.label;

        btn.addEventListener('click', () => this.applyPreset(key));
        presetsEl.appendChild(btn);
      });

      inner.appendChild(presetsEl);
    }

    /* ═══ DUAL CALENDARS ═══ */
    const calendarsEl = document.createElement('div');
    calendarsEl.className = 'ren-date-range-calendars';

    const calLeft = document.createElement('ren-calendar');
    calLeft.setAttribute('mode', 'range');
    calLeft.setAttribute('locale', this.locale);
    if (this.minDate) calLeft.setAttribute('min', this.minDate);
    if (this.maxDate) calLeft.setAttribute('max', this.maxDate);

    const divider = document.createElement('div');
    divider.className = 'ren-date-range-divider';
    divider.setAttribute('aria-hidden', 'true');

    const calRight = document.createElement('ren-calendar');
    calRight.setAttribute('mode', 'range');
    calRight.setAttribute('locale', this.locale);
    if (this.minDate) calRight.setAttribute('min', this.minDate);
    if (this.maxDate) calRight.setAttribute('max', this.maxDate);

    calendarsEl.appendChild(calLeft);
    calendarsEl.appendChild(divider);
    calendarsEl.appendChild(calRight);
    inner.appendChild(calendarsEl);

    /* ═══ FOOTER WITH SUMMARY + ACTIONS ═══ */
    const footer = document.createElement('div');
    footer.className = 'ren-date-range-footer';

    const summary = document.createElement('div');
    summary.className = 'ren-date-range-summary';
    summary.setAttribute('aria-live', 'polite');

    const actions = document.createElement('div');
    actions.className = 'ren-date-range-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'ren-date-range-cancel';
    cancelBtn.setAttribute('type', 'button');
    cancelBtn.textContent = 'Cancel';

    const applyBtn = document.createElement('button');
    applyBtn.className = 'ren-date-range-apply';
    applyBtn.setAttribute('type', 'button');
    applyBtn.textContent = 'Apply';
    applyBtn.disabled = true;

    actions.appendChild(cancelBtn);
    actions.appendChild(applyBtn);
    footer.appendChild(summary);
    footer.appendChild(actions);
    inner.appendChild(footer);

    dropdown.appendChild(inner);
    this.appendChild(dropdown);
    this.dropdown = dropdown;

    /* ═══ STORE REFS ═══ */
    this.calendarLeft = calLeft;
    this.calendarRight = calRight;
    this.summaryEl = summary;
    this.applyBtn = applyBtn;
    this.cancelBtn = cancelBtn;
  }

  /* ═══ SET UP EVENT LISTENERS ═══ */
  setupEventListeners() {
    this.trigger.addEventListener('click', this.handleTriggerClick);
    this.trigger.addEventListener('keydown', this.handleTriggerKeyDown);
    document.addEventListener('click', this.handleDocumentClick);

    /* ═══ CALENDAR SELECT EVENTS ═══ */
    this.calendarLeft.addEventListener('ren-date-select', this.handleCalendarSelect);
    this.calendarRight.addEventListener('ren-date-select', this.handleCalendarSelect);

    /* ═══ FOOTER ACTIONS ═══ */
    this.applyBtn.addEventListener('click', this.handleApply);
    this.cancelBtn.addEventListener('click', this.handleCancel);

    /* ═══ SYNC CALENDAR MONTHS ═══ */
    this.syncCalendarMonths();
  }

  /* ═══ SYNC LEFT/RIGHT CALENDAR MONTHS ═══ */
  syncCalendarMonths() {
    if (this.calendarLeft && this.calendarLeft.goToMonth) {
      this.calendarLeft.goToMonth(
        this.leftMonth.getFullYear(),
        this.leftMonth.getMonth()
      );
    }

    if (this.calendarRight && this.calendarRight.goToMonth) {
      this.calendarRight.goToMonth(
        this.rightMonth.getFullYear(),
        this.rightMonth.getMonth()
      );
    }

    /* ═══ APPLY DRAFT RANGE TO BOTH CALENDARS ═══ */
    if (this.draftStart && this.draftEnd) {
      const startStr = this.dateToString(this.draftStart);
      const endStr = this.dateToString(this.draftEnd);

      if (this.calendarLeft.setRange) {
        this.calendarLeft.setRange(startStr, endStr);
      }
      if (this.calendarRight.setRange) {
        this.calendarRight.setRange(startStr, endStr);
      }
    }
  }

  /* ═══ ADD HIDDEN INPUTS FOR FORM SUBMISSION ═══ */
  addHiddenInputs() {
    const name = this.getAttribute('name') || 'date-range';

    let hiddenStart = this.querySelector('input[name$="-start"]');
    if (!hiddenStart) {
      hiddenStart = document.createElement('input');
      hiddenStart.type = 'hidden';
      hiddenStart.name = `${name}-start`;
      this.appendChild(hiddenStart);
    }

    let hiddenEnd = this.querySelector('input[name$="-end"]');
    if (!hiddenEnd) {
      hiddenEnd = document.createElement('input');
      hiddenEnd.type = 'hidden';
      hiddenEnd.name = `${name}-end`;
      this.appendChild(hiddenEnd);
    }

    this.hiddenStart = hiddenStart;
    this.hiddenEnd = hiddenEnd;
  }

  /* ═══ HANDLE TRIGGER CLICK ═══ */
  handleTriggerClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.hasAttribute('disabled')) return;
    this.isOpen ? this.close() : this.open();
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

  /* ═══ HANDLE OUTSIDE CLICK ═══ */
  handleDocumentClick(event) {
    if (!this.contains(event.target) && this.isOpen) {
      this.handleCancel();
    }
  }

  /* ═══ HANDLE CALENDAR DATE SELECT ═══ */
  handleCalendarSelect(event) {
    const detail = event.detail;

    if (detail.range) {
      /* ═══ UPDATE DRAFT RANGE ═══ */
      if (detail.range.start) {
        this.draftStart = detail.range.start;
      }
      if (detail.range.end) {
        this.draftEnd = detail.range.end;
      }

      /* ═══ ENSURE START < END ═══ */
      if (this.draftStart && this.draftEnd && this.draftStart > this.draftEnd) {
        const tmp = this.draftStart;
        this.draftStart = this.draftEnd;
        this.draftEnd = tmp;
      }

      /* ═══ SYNC RANGE ACROSS BOTH CALENDARS ═══ */
      if (this.draftStart && this.draftEnd) {
        const startStr = this.dateToString(this.draftStart);
        const endStr = this.dateToString(this.draftEnd);

        [this.calendarLeft, this.calendarRight].forEach((cal) => {
          if (cal !== event.target && cal.setRange) {
            cal.setRange(startStr, endStr);
          }
        });
      }

      /* ═══ CLEAR ACTIVE PRESET ═══ */
      this.activePreset = null;
      this.updatePresetHighlight();

      /* ═══ UPDATE SUMMARY + APPLY BUTTON ═══ */
      this.updateSummary();
      this.updateApplyState();
    }
  }

  /* ═══ APPLY PRESET ═══ */
  applyPreset(key) {
    const preset = PRESETS[key];
    if (!preset) return;

    const range = preset.getRange();
    this.draftStart = range.start;
    this.draftEnd = range.end;
    this.activePreset = key;

    /* ═══ NAVIGATE CALENDARS TO SHOW THE RANGE ═══ */
    this.leftMonth = new Date(range.start.getFullYear(), range.start.getMonth());
    this.rightMonth = new Date(this.leftMonth.getFullYear(), this.leftMonth.getMonth() + 1);

    /* ═══ IF END IS IN A DIFFERENT MONTH, ADJUST ═══ */
    if (range.end.getMonth() !== range.start.getMonth() || range.end.getFullYear() !== range.start.getFullYear()) {
      this.rightMonth = new Date(range.end.getFullYear(), range.end.getMonth());
      /* ═══ ENSURE LEFT IS BEFORE RIGHT ═══ */
      if (this.rightMonth <= this.leftMonth) {
        this.leftMonth = new Date(this.rightMonth.getFullYear(), this.rightMonth.getMonth() - 1);
      }
    }

    this.syncCalendarMonths();
    this.updatePresetHighlight();
    this.updateSummary();
    this.updateApplyState();
  }

  /* ═══ UPDATE PRESET BUTTON HIGHLIGHT ═══ */
  updatePresetHighlight() {
    const presetBtns = this.querySelectorAll('.ren-date-range-preset');
    presetBtns.forEach((btn) => {
      const key = btn.getAttribute('data-preset');
      if (key === this.activePreset) {
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.removeAttribute('aria-selected');
      }
    });
  }

  /* ═══ UPDATE FOOTER SUMMARY ═══ */
  updateSummary() {
    if (!this.summaryEl) return;

    if (this.draftStart && this.draftEnd) {
      const start = this.formatDate(this.draftStart);
      const end = this.formatDate(this.draftEnd);
      const days = this.daysBetween(this.draftStart, this.draftEnd);
      this.summaryEl.innerHTML = `<strong>${start}</strong> → <strong>${end}</strong> (${days} day${days !== 1 ? 's' : ''})`;
    } else if (this.draftStart) {
      this.summaryEl.innerHTML = `<strong>${this.formatDate(this.draftStart)}</strong> → ...`;
    } else {
      this.summaryEl.textContent = 'Select a start date';
    }
  }

  /* ═══ UPDATE APPLY BUTTON STATE ═══ */
  updateApplyState() {
    if (this.applyBtn) {
      this.applyBtn.disabled = !(this.draftStart && this.draftEnd);
    }
  }

  /* ═══ HANDLE APPLY ═══ */
  handleApply() {
    if (!this.draftStart || !this.draftEnd) return;

    this.confirmedStart = new Date(this.draftStart);
    this.confirmedEnd = new Date(this.draftEnd);

    this.updateTriggerDisplay();
    this.updateHiddenInputs();
    this.dispatchChangeEvent();
    this.close();
  }

  /* ═══ HANDLE CANCEL ═══ */
  handleCancel() {
    /* ═══ REVERT DRAFT TO CONFIRMED ═══ */
    this.draftStart = this.confirmedStart ? new Date(this.confirmedStart) : null;
    this.draftEnd = this.confirmedEnd ? new Date(this.confirmedEnd) : null;
    this.activePreset = null;
    this.close();
  }

  /* ═══ OPEN DROPDOWN ═══ */
  open() {
    if (this.isOpen || this.hasAttribute('disabled')) return;
    if (!this.dropdown) return;

    /* ═══ RESET DRAFT TO CONFIRMED ═══ */
    this.draftStart = this.confirmedStart ? new Date(this.confirmedStart) : null;
    this.draftEnd = this.confirmedEnd ? new Date(this.confirmedEnd) : null;

    /* ═══ SET CALENDAR MONTHS ═══ */
    if (this.confirmedStart) {
      this.leftMonth = new Date(this.confirmedStart.getFullYear(), this.confirmedStart.getMonth());
      this.rightMonth = new Date(this.leftMonth.getFullYear(), this.leftMonth.getMonth() + 1);
    }

    try {
      this.dropdown.showPopover();
    } catch (e) {
      this.dropdown.style.display = 'block';
    }

    this.isOpen = true;

    if (this.trigger) {
      this.trigger.setAttribute('aria-expanded', 'true');
    }

    this.syncCalendarMonths();
    this.updateSummary();
    this.updateApplyState();
    this.updatePresetHighlight();

    /* ═══ FOCUS FIRST PRESET OR CALENDAR ═══ */
    setTimeout(() => {
      const firstPreset = this.querySelector('.ren-date-range-preset');
      if (firstPreset) {
        firstPreset.focus();
      } else {
        const firstDay = this.calendarLeft?.querySelector('.ren-calendar-day:not([disabled])');
        if (firstDay) firstDay.focus();
      }
    }, 100);

    this.dispatchEvent(
      new CustomEvent('ren-date-range-open', {
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
      this.dropdown.style.display = 'none';
    }

    this.isOpen = false;

    if (this.trigger) {
      this.trigger.setAttribute('aria-expanded', 'false');
      this.trigger.focus();
    }

    this.dispatchEvent(
      new CustomEvent('ren-date-range-close', {
        bubbles: true,
        composed: true,
      })
    );
  }

  /* ═══ UPDATE TRIGGER DISPLAY ═══ */
  updateTriggerDisplay() {
    if (!this.trigger) return;

    if (this.confirmedStart && this.confirmedEnd) {
      const startEl = this.trigger.querySelector('.ren-date-range-start');
      const endEl = this.trigger.querySelector('.ren-date-range-end');

      if (startEl) startEl.textContent = this.formatDate(this.confirmedStart);
      if (endEl) endEl.textContent = this.formatDate(this.confirmedEnd);

      this.trigger.classList.remove('ren-date-range-empty');
    } else {
      this.trigger.classList.add('ren-date-range-empty');
    }
  }

  /* ═══ UPDATE HIDDEN INPUTS ═══ */
  updateHiddenInputs() {
    if (this.hiddenStart) {
      this.hiddenStart.value = this.confirmedStart ? this.dateToString(this.confirmedStart) : '';
    }
    if (this.hiddenEnd) {
      this.hiddenEnd.value = this.confirmedEnd ? this.dateToString(this.confirmedEnd) : '';
    }
  }

  /* ═══ DISPATCH CHANGE EVENT ═══ */
  dispatchChangeEvent() {
    const value =
      this.confirmedStart && this.confirmedEnd
        ? {
            start: this.dateToString(this.confirmedStart),
            end: this.dateToString(this.confirmedEnd),
          }
        : null;

    const formattedValue =
      this.confirmedStart && this.confirmedEnd
        ? `${this.formatDate(this.confirmedStart)} → ${this.formatDate(this.confirmedEnd)}`
        : '';

    this.dispatchEvent(
      new CustomEvent('ren-change', {
        detail: {
          value,
          formattedValue,
          preset: this.activePreset || null,
          days: this.confirmedStart && this.confirmedEnd
            ? this.daysBetween(this.confirmedStart, this.confirmedEnd)
            : 0,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /* ═══ FORMAT DATE ═══ */
  formatDate(date) {
    if (!date) return '';
    const formatter = new Intl.DateTimeFormat(this.locale, {
      year: 'numeric',
      month: this.format === 'short' ? '2-digit' : this.format === 'long' ? 'long' : 'short',
      day: '2-digit',
    });
    return formatter.format(date);
  }

  /* ═══ DATE TO ISO STRING ═══ */
  dateToString(date) {
    return date.toISOString().split('T')[0];
  }

  /* ═══ DAYS BETWEEN TWO DATES ═══ */
  daysBetween(start, end) {
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const diff = Math.abs(end.getTime() - start.getTime());
    return Math.round(diff / MS_PER_DAY) + 1;
  }

  /* ═══ PUBLIC API ═══ */

  /* ═══ GET VALUE ═══ */
  getValue() {
    if (!this.confirmedStart || !this.confirmedEnd) return null;
    return {
      start: this.dateToString(this.confirmedStart),
      end: this.dateToString(this.confirmedEnd),
    };
  }

  /* ═══ SET VALUE ═══ */
  setValue(start, end) {
    this.confirmedStart = new Date(start);
    this.confirmedEnd = new Date(end);
    this.draftStart = new Date(start);
    this.draftEnd = new Date(end);
    this.updateTriggerDisplay();
    this.updateHiddenInputs();
  }

  /* ═══ CLEAR VALUE ═══ */
  clear() {
    this.confirmedStart = null;
    this.confirmedEnd = null;
    this.draftStart = null;
    this.draftEnd = null;
    this.activePreset = null;
    this.updateTriggerDisplay();
    this.updateHiddenInputs();
  }

  /* ═══ GETTERS/SETTERS ═══ */
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

  get value() {
    return this.getValue();
  }

  set value(val) {
    if (val && val.start && val.end) {
      this.setValue(val.start, val.end);
    } else {
      this.clear();
    }
  }
}

/* ═══ REGISTER COMPONENT ═══ */
if (!customElements.get('ren-date-range-picker')) {
  customElements.define('ren-date-range-picker', RenDateRangePicker);
}
