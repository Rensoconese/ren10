/* ═══════════════════════════════════════════════════════════════
   REN NUMBER FIELD (STEPPER) WEB COMPONENT
   ═══════════════════════════════════════════════════════════════
   A light-DOM web component that enhances a number input with
   increment/decrement buttons. Handles keyboard navigation,
   long-press auto-repeat with acceleration, and min/max bounds.

   Attributes:
   - min: Minimum value (default: 0)
   - max: Maximum value (default: 100)
   - step: Step size (default: 1)
   - value: Current value
   - disabled: Disable the field

   Events:
   - ren-change: Dispatched on value change { value, oldValue }

   Methods:
   - increment(): Increase value by step
   - decrement(): Decrease value by step
   - getValue(): Return current numeric value
   - setValue(val): Set value and clamp to bounds
   ═══════════════════════════════════════════════════════════════ */

export class RenNumberField extends HTMLElement {
  constructor() {
    super();

    /* ═══ STATE ═══ */
    this.min = 0;
    this.max = 100;
    this.step = 1;
    this.value = 0;
    this.pressTimeout = null;
    this.pressInterval = null;
    this.pressRepeatDelay = 500;
    this.pressRepeatInterval = 100;
    this.pressRepeatAcceleration = 0.95;

    /* ═══ BIND METHODS ═══ */
    this.handleDecrementPress = this.handleDecrementPress.bind(this);
    this.handleIncrementPress = this.handleIncrementPress.bind(this);
    this.handleDecrementRelease = this.handleDecrementRelease.bind(this);
    this.handleIncrementRelease = this.handleIncrementRelease.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputKeydown = this.handleInputKeydown.bind(this);
  }

  connectedCallback() {
    /* ═══ READ ATTRIBUTES ═══ */
    const minAttr = this.getAttribute('min');
    const maxAttr = this.getAttribute('max');
    const stepAttr = this.getAttribute('step');
    const valueAttr = this.getAttribute('value');
    const disabledAttr = this.hasAttribute('disabled');

    if (minAttr !== null) this.min = parseFloat(minAttr);
    if (maxAttr !== null) this.max = parseFloat(maxAttr);
    if (stepAttr !== null) this.step = parseFloat(stepAttr);
    if (valueAttr !== null) this.value = parseFloat(valueAttr);

    /* ═══ GET OR CREATE ELEMENTS ═══ */
    this.input = this.querySelector('.ren-number-field-input');
    this.decrementBtn = this.querySelector('.ren-number-field-decrement');
    this.incrementBtn = this.querySelector('.ren-number-field-increment');

    /* ═══ CREATE IF MISSING ═══ */
    if (!this.input) {
      this.input = document.createElement('input');
      this.input.type = 'number';
      this.input.className = 'ren-number-field-input';
      this.appendChild(this.input);
    }

    if (!this.decrementBtn) {
      this.decrementBtn = document.createElement('button');
      this.decrementBtn.className = 'ren-number-field-decrement';
      this.decrementBtn.setAttribute('aria-label', 'Decrease');
      this.insertBefore(this.decrementBtn, this.input);
    }

    if (!this.incrementBtn) {
      this.incrementBtn = document.createElement('button');
      this.incrementBtn.className = 'ren-number-field-increment';
      this.incrementBtn.setAttribute('aria-label', 'Increase');
      this.appendChild(this.incrementBtn);
    }

    /* ═══ SET INITIAL VALUES ═══ */
    this.input.value = this.value.toString();
    this.input.min = this.min.toString();
    this.input.max = this.max.toString();
    this.input.step = this.step.toString();

    if (disabledAttr) {
      this.input.disabled = true;
      this.decrementBtn.disabled = true;
      this.incrementBtn.disabled = true;
    }

    /* ═══ ATTACH EVENT LISTENERS ═══ */
    this.input.addEventListener('change', this.handleInputChange);
    this.input.addEventListener('keydown', this.handleInputKeydown);

    /* ═══ BUTTON PRESS & HOLD ═══ */
    this.decrementBtn.addEventListener('mousedown', this.handleDecrementPress);
    this.decrementBtn.addEventListener('mouseup', this.handleDecrementRelease);
    this.decrementBtn.addEventListener('mouseleave', this.handleDecrementRelease);
    this.decrementBtn.addEventListener('touchstart', this.handleDecrementPress);
    this.decrementBtn.addEventListener('touchend', this.handleDecrementRelease);

    this.incrementBtn.addEventListener('mousedown', this.handleIncrementPress);
    this.incrementBtn.addEventListener('mouseup', this.handleIncrementRelease);
    this.incrementBtn.addEventListener('mouseleave', this.handleIncrementRelease);
    this.incrementBtn.addEventListener('touchstart', this.handleIncrementPress);
    this.incrementBtn.addEventListener('touchend', this.handleIncrementRelease);
  }

  disconnectedCallback() {
    /* ═══ CLEAN UP EVENT LISTENERS ═══ */
    if (this.input) {
      this.input.removeEventListener('change', this.handleInputChange);
      this.input.removeEventListener('keydown', this.handleInputKeydown);
    }

    if (this.decrementBtn) {
      this.decrementBtn.removeEventListener('mousedown', this.handleDecrementPress);
      this.decrementBtn.removeEventListener('mouseup', this.handleDecrementRelease);
      this.decrementBtn.removeEventListener('mouseleave', this.handleDecrementRelease);
      this.decrementBtn.removeEventListener('touchstart', this.handleDecrementPress);
      this.decrementBtn.removeEventListener('touchend', this.handleDecrementRelease);
    }

    if (this.incrementBtn) {
      this.incrementBtn.removeEventListener('mousedown', this.handleIncrementPress);
      this.incrementBtn.removeEventListener('mouseup', this.handleIncrementRelease);
      this.incrementBtn.removeEventListener('mouseleave', this.handleIncrementRelease);
      this.incrementBtn.removeEventListener('touchstart', this.handleIncrementPress);
      this.incrementBtn.removeEventListener('touchend', this.handleIncrementRelease);
    }

    /* ═══ CLEAR TIMERS ═══ */
    this.clearPressTimers();
  }

  /* ═══════════════════════════════════════════════════════════════
     DECREMENT BUTTON HANDLERS
     ═══════════════════════════════════════════════════════════════ */
  handleDecrementPress = (e) => {
    if (this.input.disabled || this.decrementBtn.disabled) return;
    e.preventDefault();

    this.decrement();

    /* ═══ START LONG PRESS REPEAT ═══ */
    this.pressTimeout = setTimeout(() => {
      let repeatInterval = this.pressRepeatInterval;

      this.pressInterval = setInterval(() => {
        this.decrement();
        /* ═══ ACCELERATE ═══ */
        repeatInterval *= this.pressRepeatAcceleration;
        clearInterval(this.pressInterval);

        this.pressInterval = setInterval(
          () => this.decrement(),
          Math.max(50, repeatInterval)
        );
      }, this.pressRepeatInterval);
    }, this.pressRepeatDelay);
  };

  handleDecrementRelease = () => {
    this.clearPressTimers();
  };

  /* ═══════════════════════════════════════════════════════════════
     INCREMENT BUTTON HANDLERS
     ═══════════════════════════════════════════════════════════════ */
  handleIncrementPress = (e) => {
    if (this.input.disabled || this.incrementBtn.disabled) return;
    e.preventDefault();

    this.increment();

    /* ═══ START LONG PRESS REPEAT ═══ */
    this.pressTimeout = setTimeout(() => {
      let repeatInterval = this.pressRepeatInterval;

      this.pressInterval = setInterval(() => {
        this.increment();
        /* ═══ ACCELERATE ═══ */
        repeatInterval *= this.pressRepeatAcceleration;
        clearInterval(this.pressInterval);

        this.pressInterval = setInterval(
          () => this.increment(),
          Math.max(50, repeatInterval)
        );
      }, this.pressRepeatInterval);
    }, this.pressRepeatDelay);
  };

  handleIncrementRelease = () => {
    this.clearPressTimers();
  };

  /* ═══════════════════════════════════════════════════════════════
     INPUT HANDLERS
     ═══════════════════════════════════════════════════════════════ */
  handleInputChange = (e) => {
    const newValue = parseFloat(e.target.value);

    if (!isNaN(newValue)) {
      const oldValue = this.value;
      this.value = this.clamp(newValue);
      this.input.value = this.value.toString();

      this.dispatchChangeEvent(oldValue);
    }
  };

  handleInputKeydown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.increment();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.decrement();
    } else if (e.key === 'Home') {
      e.preventDefault();
      const oldValue = this.value;
      this.value = this.min;
      this.input.value = this.value.toString();
      this.dispatchChangeEvent(oldValue);
    } else if (e.key === 'End') {
      e.preventDefault();
      const oldValue = this.value;
      this.value = this.max;
      this.input.value = this.value.toString();
      this.dispatchChangeEvent(oldValue);
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     PUBLIC METHODS
     ═══════════════════════════════════════════════════════════════ */
  increment() {
    const oldValue = this.value;
    this.value = this.clamp(this.value + this.step);
    this.input.value = this.value.toString();
    this.dispatchChangeEvent(oldValue);
  }

  decrement() {
    const oldValue = this.value;
    this.value = this.clamp(this.value - this.step);
    this.input.value = this.value.toString();
    this.dispatchChangeEvent(oldValue);
  }

  getValue() {
    return this.value;
  }

  setValue(val) {
    const oldValue = this.value;
    this.value = this.clamp(parseFloat(val) || 0);
    this.input.value = this.value.toString();
    this.dispatchChangeEvent(oldValue);
  }

  /* ═══════════════════════════════════════════════════════════════
     UTILITY METHODS
     ═══════════════════════════════════════════════════════════════ */
  clamp(val) {
    return Math.max(this.min, Math.min(this.max, val));
  }

  dispatchChangeEvent(oldValue) {
    if (this.value !== oldValue) {
      this.dispatchEvent(
        new CustomEvent('ren-change', {
          bubbles: true,
          composed: true,
          detail: {
            value: this.value,
            oldValue: oldValue,
          },
        })
      );
    }
  }

  clearPressTimers() {
    if (this.pressTimeout) {
      clearTimeout(this.pressTimeout);
      this.pressTimeout = null;
    }

    if (this.pressInterval) {
      clearInterval(this.pressInterval);
      this.pressInterval = null;
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     PROPERTIES
     ═══════════════════════════════════════════════════════════════ */
  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    if (val) {
      this.setAttribute('disabled', '');
      if (this.input) this.input.disabled = true;
      if (this.decrementBtn) this.decrementBtn.disabled = true;
      if (this.incrementBtn) this.incrementBtn.disabled = true;
    } else {
      this.removeAttribute('disabled');
      if (this.input) this.input.disabled = false;
      if (this.decrementBtn) this.decrementBtn.disabled = false;
      if (this.incrementBtn) this.incrementBtn.disabled = false;
    }
  }
}

/* ═══ REGISTER COMPONENT ═══ */
if (!customElements.get('ren-number-field')) {
  customElements.define('ren-number-field', RenNumberField);
}
