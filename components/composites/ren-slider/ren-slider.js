/* ═══ REN SLIDER WEB COMPONENT ═══ */

export class RenSlider extends HTMLElement {
  constructor() {
    super();
    this.handleInput = this.handleInput.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleRangePointerDown = this.handleRangePointerDown.bind(this);
    this.handleRangePointerMove = this.handleRangePointerMove.bind(this);
    this.handleRangePointerEnd = this.handleRangePointerEnd.bind(this);
  }

  connectedCallback() {
    this.inputs = [...this.querySelectorAll('input[type="range"]')];
    this.input = this.inputs[0] || null;

    if (!this.input) {
      console.warn('RenSlider: No input[type="range"] found');
      return;
    }

    /* ═══ SET UP TRACK CLASS ═══ */
    const trackContainer = this.input.parentElement || this.input;
    trackContainer.classList.add('ren-slider-track');

    /* ═══ INITIALIZE VALUE ═══ */
    this.updateValue();

    /* ═══ EVENT LISTENERS ═══ */
    this.inputs.forEach((input) => {
      input.addEventListener('input', this.handleInput);
      input.addEventListener('change', this.handleChange);
    });

    this.range = this.inputs.length === 2 ? this.querySelector('.ren-slider-range') : null;
    this.range?.addEventListener('pointerdown', this.handleRangePointerDown, true);
    this.range?.addEventListener('pointermove', this.handleRangePointerMove, true);
    this.range?.addEventListener('pointerup', this.handleRangePointerEnd, true);
    this.range?.addEventListener('pointercancel', this.handleRangePointerEnd, true);

    /* ═══ HANDLE LABEL DISPLAY ═══ */
    const label = this.getAttribute('label');
    if (label && !this.querySelector('.ren-slider-label')) {
      const labelEl = document.createElement('div');
      labelEl.className = 'ren-slider-label';
      labelEl.textContent = label;
      this.insertBefore(labelEl, this.input.parentElement);
    }

    /* ═══ HANDLE VALUE DISPLAY ═══ */
    if (this.hasAttribute('show-value')) {
      this.valueDisplay = this.querySelector('.ren-slider-value');
      if (!this.valueDisplay) {
        const valueEl = document.createElement('div');
        valueEl.className = 'ren-slider-value';
        this.valueDisplay = valueEl;
        this.input.parentElement.appendChild(valueEl);
      }
      this.updateValueDisplay();
    }

    /* ═══ TRANSFER VARIANT CLASSES ═══ */
    this.transferVariantClasses();
  }

  disconnectedCallback() {
    this.inputs?.forEach((input) => {
      input.removeEventListener('input', this.handleInput);
      input.removeEventListener('change', this.handleChange);
    });
    this.range?.removeEventListener('pointerdown', this.handleRangePointerDown, true);
    this.range?.removeEventListener('pointermove', this.handleRangePointerMove, true);
    this.range?.removeEventListener('pointerup', this.handleRangePointerEnd, true);
    this.range?.removeEventListener('pointercancel', this.handleRangePointerEnd, true);
    this.pointerDrag = null;
  }

  /* ═══ UPDATE CSS VARIABLE FOR TRACK FILL ═══ */
  updateValue() {
    if (!this.input) return;

    const percentages = this.inputs.map((input) => {
      const min = Number(input.min || 0);
      const max = Number(input.max || 100);
      const value = input.valueAsNumber;
      const percentage = ((value - min) / (max - min)) * 100;
      input.style.setProperty('--value', `${percentage}%`);
      return percentage;
    });

    if (percentages.length === 2) {
      const track = this.querySelector('.ren-slider-track-input');
      track?.style.setProperty('--value-start', `${Math.min(...percentages)}%`);
      track?.style.setProperty('--value-end', `${Math.max(...percentages)}%`);
    }
  }

  /* ═══ UPDATE VALUE DISPLAY TEXT ═══ */
  updateValueDisplay() {
    if (!this.valueDisplay || !this.input) return;

    const value = this.inputs.length === 2
      ? this.inputs.map((input) => input.value).join(' – ')
      : this.input.value;
    const unit = this.getAttribute('unit') || '';
    this.valueDisplay.textContent = `${value}${unit}`;
  }

  /* ═══ INPUT EVENT HANDLER ═══ */
  handleInput(event) {
    if (this.inputs.length === 2) {
      const [lower, upper] = this.inputs;
      if (event.target === lower && lower.valueAsNumber > upper.valueAsNumber) {
        lower.value = upper.value;
      } else if (event.target === upper && upper.valueAsNumber < lower.valueAsNumber) {
        upper.value = lower.value;
      }
    }
    this.updateValue();
    this.updateValueDisplay();

    this.dispatchEvent(
      new CustomEvent('ren-slider-input', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  isVerticalRange() {
    return this.classList.contains('ren-slider-vertical');
  }

  pointerPosition(event) {
    return this.isVerticalRange() ? -event.clientY : event.clientX;
  }

  valueFromPointer(input, event) {
    const rect = this.range.getBoundingClientRect();
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const step = input.step === 'any' ? 0 : Number(input.step || 1);
    const ratio = this.isVerticalRange()
      ? Math.max(0, Math.min(1, (rect.bottom - event.clientY) / rect.height))
      : Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    let value = min + ratio * (max - min);
    if (step > 0) value = min + Math.round((value - min) / step) * step;
    return Math.max(min, Math.min(max, value));
  }

  handleRangePointerDown(event) {
    if (this.inputs.length !== 2 || this.disabled) return;
    const [lower, upper] = this.inputs;
    if (lower.valueAsNumber !== upper.valueAsNumber) return;
    const enabledInputs = this.inputs.filter((input) => !input.disabled);
    if (enabledInputs.length === 0) return;

    event.preventDefault();
    this.pointerDrag = {
      pointerId: event.pointerId,
      startPosition: this.pointerPosition(event),
      enabledInputs,
      activeInput: null,
    };
    this.range.setPointerCapture?.(event.pointerId);
  }

  handleRangePointerMove(event) {
    const drag = this.pointerDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();

    if (!drag.activeInput) {
      const position = this.pointerPosition(event);
      if (position === drag.startPosition) return;
      const directionalInput = position < drag.startPosition ? this.inputs[0] : this.inputs[1];
      drag.activeInput = directionalInput.disabled ? drag.enabledInputs[0] : directionalInput;
      drag.activeInput.focus();
    }

    drag.activeInput.value = this.valueFromPointer(drag.activeInput, event);
    drag.activeInput.dispatchEvent(new Event('input', { bubbles: true }));
  }

  handleRangePointerEnd(event) {
    const drag = this.pointerDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    if (drag.activeInput) drag.activeInput.dispatchEvent(new Event('change', { bubbles: true }));
    this.range.releasePointerCapture?.(event.pointerId);
    this.pointerDrag = null;
  }

  /* ═══ CHANGE EVENT HANDLER ═══ */
  handleChange(event) {
    this.dispatchEvent(
      new CustomEvent('ren-slider-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  /* ═══ TRANSFER VARIANT CLASSES TO TRACK ═══ */
  transferVariantClasses() {
    if (!this.input) return;

    const trackContainer = this.input.parentElement || this.input;
    const variants = ['sm', 'lg', 'success', 'warning', 'danger', 'vertical'];

    variants.forEach((variant) => {
      if (this.classList.contains(`ren-slider-${variant}`)) {
        trackContainer.classList.add(`ren-slider-${variant}`);
      }
    });
  }

  /* ═══ GETTERS AND SETTERS ═══ */
  get value() {
    if (!this.input) return null;
    const values = this.inputs.map((input) => input.valueAsNumber);
    return values.length === 2 ? values : values[0];
  }

  set value(val) {
    if (!this.input) return;
    const values = Array.isArray(val) ? [...val] : [val];
    if (this.inputs.length === 2 && values.length >= 2) {
      values.splice(0, 2, ...values.slice(0, 2).map(Number).sort((a, b) => a - b));
    }
    this.inputs.forEach((input, index) => {
      if (values[index] !== undefined) input.value = values[index];
    });
    this.updateValue();
    this.updateValueDisplay();
  }

  get min() {
    return this.input ? parseFloat(this.input.min) : null;
  }

  set min(val) {
    if (this.input) {
      this.inputs.forEach((input) => input.min = val);
      this.updateValue();
    }
  }

  get max() {
    return this.input ? parseFloat(this.input.max) : null;
  }

  set max(val) {
    if (this.input) {
      this.inputs.forEach((input) => input.max = val);
      this.updateValue();
    }
  }

  get disabled() {
    return this.input ? this.inputs.every((input) => input.disabled) : false;
  }

  set disabled(val) {
    if (this.input) {
      this.inputs.forEach((input) => input.disabled = val);
    }
  }
}

/* ═══ REGISTER COMPONENT ═══ */
if (!customElements.get('ren-slider')) {
  customElements.define('ren-slider', RenSlider);
}
