/**
 * RenDS — <ren-form> Form Validation System
 * ==========================================
 * Multi-step form with field validation, error summaries,
 * and accessibility features. Supports custom validators,
 * multiple validation modes, and server-side errors.
 *
 * Light DOM — no Shadow DOM.
 *
 * Usage:
 *   <ren-form data-validate="onTouched" data-steps="3">
 *     <form class="ren-form">
 *       <div class="ren-form-error-summary" hidden>
 *         <strong>Please fix the following errors:</strong>
 *         <ul></ul>
 *       </div>
 *
 *       <div class="ren-form-progress">
 *         <div class="ren-form-step" data-step="1" data-active>
 *           <span class="ren-form-step-label">Account</span>
 *         </div>
 *         <!-- ... -->
 *       </div>
 *
 *       <div class="ren-form-section">
 *         <div class="ren-field" data-rules="required|email">
 *           <label class="ren-field-label" data-required>Email</label>
 *           <input class="ren-input" type="email" name="email" required>
 *           <span class="ren-field-error" hidden></span>
 *         </div>
 *       </div>
 *
 *       <div class="ren-form-actions">
 *         <button type="button">Previous</button>
 *         <button type="submit">Submit</button>
 *       </div>
 *     </form>
 *   </ren-form>
 */

const DEFAULT_VALIDATION_MODE = 'onSubmit';
const DEBOUNCE_DELAY = 300;

/** Built-in validators */
const builtInValidators = {
  required: (value) => {
    return value && value.trim().length > 0
      ? null
      : 'This field is required';
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Please enter a valid email address';
  },

  min: (min) => (value) => {
    if (!value) return null;
    return value.length >= parseInt(min, 10)
      ? null
      : `Must be at least ${min} characters`;
  },

  max: (max) => (value) => {
    if (!value) return null;
    return value.length <= parseInt(max, 10)
      ? null
      : `Must be no more than ${max} characters`;
  },

  pattern: (pattern) => (value) => {
    if (!value) return null;
    try {
      const regex = new RegExp(pattern);
      return regex.test(value) ? null : 'Invalid format';
    } catch (e) {
      return 'Invalid regex pattern';
    }
  },

  match: (fieldName) => (value, form) => {
    const targetField = form?.querySelector(`[name="${fieldName}"]`);
    if (!targetField) return 'Target field not found';
    return value === targetField.value ? null : 'Fields do not match';
  },
};

export class RenForm extends HTMLElement {
  static #customValidators = new Map();

  constructor() {
    super();
    this._form = null;
    this._fields = [];
    this._errors = new Map();
    this._touched = new Set();
    this._validationMode = DEFAULT_VALIDATION_MODE;
    this._debounceTimers = new Map();
    this._currentStep = 1;
    this._totalSteps = 0;
    this._isSubmitting = false;
    this._errorSummary = null;
    this._successMessage = null;
  }

  static registerValidator(name, fn) {
    RenForm.#customValidators.set(name, fn);
  }

  connectedCallback() {
    this._form = this.querySelector('form.ren-form');
    if (!this._form) return;

    this._initElements();
    this._attachEventListeners();
    this._initMultiStep();
  }

  disconnectedCallback() {
    this._removeEventListeners();
    this._clearDebounceTimers();
  }

  _initElements() {
    this._validationMode = this.getAttribute('data-validate') ?? DEFAULT_VALIDATION_MODE;
    this._fields = Array.from(this._form.querySelectorAll('.ren-field'));
    this._errorSummary = this._form.querySelector('.ren-form-error-summary');
    this._successMessage = this._form.querySelector('.ren-form-success');
  }

  _initMultiStep() {
    const stepsAttr = this.getAttribute('data-steps');
    if (!stepsAttr) return;

    this._totalSteps = parseInt(stepsAttr, 10);
    this._currentStep = 1;
    this._updateProgressIndicators();
  }

  _attachEventListeners() {
    // Form submit
    this._form.addEventListener('submit', (e) => this._handleSubmit(e));

    // Field validation
    this._fields.forEach((field) => {
      const input = field.querySelector('input, select, textarea');
      if (!input) return;

      switch (this._validationMode) {
        case 'onBlur':
          input.addEventListener('blur', () => this._validateField(field, input));
          break;

        case 'onChange':
          input.addEventListener('input', () => {
            this._debounceValidation(field, input);
          });
          break;

        case 'onTouched':
          input.addEventListener('blur', () => {
            this._touched.add(input.name);
            this._validateField(field, input);
          });
          input.addEventListener('input', () => {
            if (this._touched.has(input.name)) {
              this._debounceValidation(field, input);
            }
          });
          break;

        case 'onSubmit':
        default:
          // Only validate on submit
          break;
      }
    });
  }

  _debounceValidation(field, input) {
    // Clear existing timer
    if (this._debounceTimers.has(input.name)) {
      clearTimeout(this._debounceTimers.get(input.name));
    }

    // Set new timer
    const timer = setTimeout(() => {
      this._validateField(field, input);
      this._debounceTimers.delete(input.name);
    }, DEBOUNCE_DELAY);

    this._debounceTimers.set(input.name, timer);
  }

  _clearDebounceTimers() {
    this._debounceTimers.forEach((timer) => clearTimeout(timer));
    this._debounceTimers.clear();
  }

  _removeEventListeners() {
    // Event listeners are automatically cleaned up when DOM is removed
  }

  async _handleSubmit(e) {
    e.preventDefault();

    const result = this.validate();

    if (!result.valid) {
      this.dispatchEvent(
        new CustomEvent('ren-invalid', {
          detail: { errors: result.errors },
          bubbles: true,
          composed: true,
        })
      );
      this._showErrorSummary(result.errors);
      this._scrollToFirstError();
      return;
    }

    // Success
    this._hideErrorSummary();
    this._isSubmitting = true;
    this.setAttribute('data-submitting', '');

    const values = this.getValues();
    const event = new CustomEvent('ren-submit', {
      detail: { values, form: this._form },
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(event);

    // Reset submitting state after a brief delay to allow for async handling
    setTimeout(() => {
      this._isSubmitting = false;
      this.removeAttribute('data-submitting');
    }, 100);
  }

  _validateField(field, input) {
    const rules = field.getAttribute('data-rules') ?? '';
    const error = this._runValidators(rules, input.value, input.name);

    if (error) {
      this._setFieldError(field, input, error);
      this._errors.set(input.name, error);
    } else {
      this._clearFieldError(field, input);
      this._errors.delete(input.name);
    }

    // Dispatch field validation event
    this.dispatchEvent(
      new CustomEvent('ren-field-validated', {
        detail: {
          name: input.name,
          valid: !error,
          error,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  _runValidators(rulesString, value, fieldName) {
    if (!rulesString) return null;

    const rules = rulesString.split('|').map((r) => r.trim());

    for (const rule of rules) {
      let validator = null;
      let param = null;

      if (rule.includes(':')) {
        [validator, param] = rule.split(':');
      } else {
        validator = rule;
      }

      // Get validator function
      let validatorFn = builtInValidators[validator];
      if (!validatorFn && RenForm.#customValidators.has(validator)) {
        validatorFn = RenForm.#customValidators.get(validator);
      }

      if (!validatorFn) continue;

      // Run validator
      let error;
      if (param) {
        if (validator === 'match') {
          error = validatorFn(param)(value, this._form);
        } else {
          error = validatorFn(param)(value);
        }
      } else {
        error = validatorFn(value);
      }

      if (error) return error;
    }

    return null;
  }

  _setFieldError(field, input, message) {
    field.setAttribute('data-invalid', '');
    input.setAttribute('aria-invalid', 'true');

    const errorEl = field.querySelector('.ren-field-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
      if (!errorEl.id) {
        errorEl.id = `error-${input.name}`;
      }
      input.setAttribute('aria-errormessage', errorEl.id);
    }
  }

  _clearFieldError(field, input) {
    field.removeAttribute('data-invalid');
    input.removeAttribute('aria-invalid');

    const errorEl = field.querySelector('.ren-field-error');
    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = '';
    }
  }

  _showErrorSummary(errors) {
    if (!this._errorSummary) return;

    const ul = this._errorSummary.querySelector('ul');
    if (!ul) return;

    ul.innerHTML = '';
    errors.forEach((error) => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="#field-${error.name}">${error.name}: ${error.message}</a>`;
      li.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();
        const field = this._form.querySelector(`[name="${error.name}"]`);
        if (field) field.focus();
      });
      ul.appendChild(li);
    });

    this._errorSummary.setAttribute('data-has-errors', '');
    this._errorSummary.removeAttribute('hidden');
    this._errorSummary.focus();
  }

  _hideErrorSummary() {
    if (!this._errorSummary) return;
    this._errorSummary.removeAttribute('data-has-errors');
    this._errorSummary.setAttribute('hidden', '');
  }

  _scrollToFirstError() {
    const firstInvalid = this._form.querySelector('[data-invalid]');
    if (firstInvalid) {
      setTimeout(() => {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = firstInvalid.querySelector('input, select, textarea');
        if (input) input.focus();
      }, 100);
    }
  }

  _updateProgressIndicators() {
    const steps = this.querySelectorAll('.ren-form-step');
    steps.forEach((step, idx) => {
      const stepNum = idx + 1;
      step.setAttribute('data-step', stepNum);

      if (stepNum < this._currentStep) {
        step.setAttribute('data-completed', '');
        step.removeAttribute('data-active');
        step.removeAttribute('data-disabled');
      } else if (stepNum === this._currentStep) {
        step.removeAttribute('data-completed');
        step.setAttribute('data-active', '');
        step.removeAttribute('data-disabled');
      } else {
        step.removeAttribute('data-completed');
        step.removeAttribute('data-active');
        step.setAttribute('data-disabled', '');
      }
    });
  }

  // ─── Public API ───

  validate() {
    const errors = [];

    this._fields.forEach((field) => {
      const input = field.querySelector('input, select, textarea');
      if (!input) return;

      const rules = field.getAttribute('data-rules') ?? '';
      const error = this._runValidators(rules, input.value, input.name);

      if (error) {
        this._setFieldError(field, input, error);
        errors.push({ name: input.name, message: error });
      } else {
        this._clearFieldError(field, input);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  reset() {
    this._form.reset();
    this._errors.clear();
    this._touched.clear();
    this._debounceTimers.forEach((timer) => clearTimeout(timer));
    this._debounceTimers.clear();

    this._fields.forEach((field) => {
      const input = field.querySelector('input, select, textarea');
      if (input) {
        this._clearFieldError(field, input);
      }
    });

    this._hideErrorSummary();
  }

  getValues() {
    const values = {};
    const formData = new FormData(this._form);
    formData.forEach((value, name) => {
      values[name] = value;
    });
    return values;
  }

  setErrors(errors) {
    this._errors.clear();

    errors.forEach((error) => {
      const field = this._form.querySelector(
        `.ren-field:has([name="${error.name}"])`
      );
      const input = field?.querySelector('input, select, textarea');

      if (field && input) {
        this._setFieldError(field, input, error.message);
        this._errors.set(error.name, error.message);
      }
    });

    this._showErrorSummary(errors);
  }

  setFieldError(name, message) {
    const field = this._form.querySelector(
      `.ren-field:has([name="${name}"])`
    );
    const input = field?.querySelector('input, select, textarea');

    if (field && input) {
      this._setFieldError(field, input, message);
      this._errors.set(name, message);
    }
  }

  clearFieldError(name) {
    const field = this._form.querySelector(
      `.ren-field:has([name="${name}"])`
    );
    const input = field?.querySelector('input, select, textarea');

    if (field && input) {
      this._clearFieldError(field, input);
      this._errors.delete(name);
    }
  }

  // ─── Multi-Step API ───

  nextStep() {
    if (this._currentStep >= this._totalSteps) return false;

    // Validate current step fields
    const currentStepFields = this._getStepFields(this._currentStep);
    const errors = [];

    currentStepFields.forEach((field) => {
      const input = field.querySelector('input, select, textarea');
      if (!input) return;

      const rules = field.getAttribute('data-rules') ?? '';
      const error = this._runValidators(rules, input.value, input.name);

      if (error) {
        this._setFieldError(field, input, error);
        errors.push({ name: input.name, message: error });
      } else {
        this._clearFieldError(field, input);
      }
    });

    if (errors.length > 0) {
      return false;
    }

    this._currentStep++;
    this._updateProgressIndicators();
    this._hideErrorSummary();

    this.dispatchEvent(
      new CustomEvent('ren-step-change', {
        detail: { step: this._currentStep, totalSteps: this._totalSteps },
        bubbles: true,
        composed: true,
      })
    );

    return true;
  }

  prevStep() {
    if (this._currentStep <= 1) return false;

    this._currentStep--;
    this._updateProgressIndicators();
    this._hideErrorSummary();

    this.dispatchEvent(
      new CustomEvent('ren-step-change', {
        detail: { step: this._currentStep, totalSteps: this._totalSteps },
        bubbles: true,
        composed: true,
      })
    );

    return true;
  }

  goToStep(stepNum) {
    if (stepNum < 1 || stepNum > this._totalSteps) return false;

    this._currentStep = stepNum;
    this._updateProgressIndicators();
    this._hideErrorSummary();

    this.dispatchEvent(
      new CustomEvent('ren-step-change', {
        detail: { step: this._currentStep, totalSteps: this._totalSteps },
        bubbles: true,
        composed: true,
      })
    );

    return true;
  }

  get currentStep() {
    return this._currentStep;
  }

  get totalSteps() {
    return this._totalSteps;
  }

  _getStepFields(stepNum) {
    // Assumes fields are organized by step (configurable via data-step)
    // For simplicity, returns all fields. Override in subclass if needed.
    return this._fields;
  }
}

if (!customElements.get('ren-form')) {
  customElements.define('ren-form', RenForm);
}
