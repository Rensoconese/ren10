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
    const buttons = this.querySelectorAll('.ren-calendar-day');
    buttons.forEach((btn, index) => {
      if (btn.hasAttribute('data-today') && !this.focusedDate) {
        btn.setAttribute('tabindex', '0');
      } else if (this.focusedDate && this.isSameDay(this.focusedDate, new Date(btn.textContent))) {
        btn.setAttribute('tabindex', '0');
      } else {
        btn.setAttribute('tabindex', '-1');
      }
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
