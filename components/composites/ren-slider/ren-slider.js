/* ═══ REN SLIDER WEB COMPONENT ═══ */

export class RenSlider extends HTMLElement {
  constructor() {
    super();
    this.handleInput = this.handleInput.bind(this);
    this.handleChange = this.handleChange.bind(this);
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
    const values = Array.isArray(val) ? val : [val];
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
