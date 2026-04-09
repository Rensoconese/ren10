/* ═══ REN SLIDER WEB COMPONENT ═══ */

export class RenSlider extends HTMLElement {
  constructor() {
    super();
    this.handleInput = this.handleInput.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  connectedCallback() {
    this.input = this.querySelector('input[type="range"]');

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
    this.input.addEventListener('input', this.handleInput);
    this.input.addEventListener('change', this.handleChange);

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
      const valueEl = document.createElement('div');
      valueEl.className = 'ren-slider-value';
      this.valueDisplay = valueEl;
      this.input.parentElement.appendChild(valueEl);
      this.updateValueDisplay();
    }

    /* ═══ TRANSFER VARIANT CLASSES ═══ */
    this.transferVariantClasses();
  }

  disconnectedCallback() {
    if (this.input) {
      this.input.removeEventListener('input', this.handleInput);
      this.input.removeEventListener('change', this.handleChange);
    }
  }

  /* ═══ UPDATE CSS VARIABLE FOR TRACK FILL ═══ */
  updateValue() {
    if (!this.input) return;

    const min = parseFloat(this.input.min) || 0;
    const max = parseFloat(this.input.max) || 100;
    const value = parseFloat(this.input.value) || min;

    const percentage = ((value - min) / (max - min)) * 100;
    this.input.style.setProperty('--value', `${percentage}%`);
  }

  /* ═══ UPDATE VALUE DISPLAY TEXT ═══ */
  updateValueDisplay() {
    if (!this.valueDisplay || !this.input) return;

    const value = this.input.value;
    const unit = this.getAttribute('unit') || '';
    this.valueDisplay.textContent = `${value}${unit}`;
  }

  /* ═══ INPUT EVENT HANDLER ═══ */
  handleInput(event) {
    this.updateValue();
    this.updateValueDisplay();

    this.dispatchEvent(
      new CustomEvent('ren-slider-input', {
        detail: { value: parseFloat(this.input.value) },
        bubbles: true,
        composed: true,
      })
    );
  }

  /* ═══ CHANGE EVENT HANDLER ═══ */
  handleChange(event) {
    this.dispatchEvent(
      new CustomEvent('ren-slider-change', {
        detail: { value: parseFloat(this.input.value) },
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
    return this.input ? parseFloat(this.input.value) : null;
  }

  set value(val) {
    if (this.input) {
      this.input.value = val;
      this.updateValue();
      this.updateValueDisplay();
    }
  }

  get min() {
    return this.input ? parseFloat(this.input.min) : null;
  }

  set min(val) {
    if (this.input) {
      this.input.min = val;
      this.updateValue();
    }
  }

  get max() {
    return this.input ? parseFloat(this.input.max) : null;
  }

  set max(val) {
    if (this.input) {
      this.input.max = val;
      this.updateValue();
    }
  }

  get disabled() {
    return this.input ? this.input.disabled : false;
  }

  set disabled(val) {
    if (this.input) {
      this.input.disabled = val;
    }
  }
}

/* ═══ REGISTER COMPONENT ═══ */
if (!customElements.get('ren-slider')) {
  customElements.define('ren-slider', RenSlider);
}
