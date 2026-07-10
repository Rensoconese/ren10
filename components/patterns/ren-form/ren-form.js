import { serializeFormEntries } from './serialize.js';

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
const DEFAULT_MESSAGES = { required: 'This field is required', email: 'Please enter a valid email address', pattern: 'Invalid format', invalid: 'Please correct this field', min: (n) => `Must be at least ${n} characters`, max: (n) => `Must be no more than ${n} characters` };


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
    const targetField = Array.from(form?.elements || []).find(
      (element) => element.name === fieldName
    );
    if (!targetField) return 'Target field not found';
    return value === targetField.value ? null : 'Fields do not match';
  },
};

export class RenForm extends HTMLElement {
  static #customValidators = new Map();
  static #messages = new Map();

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
    this._listenerController = null;
    this._persistKey = null;
    this._submitButtonStates = new Map();
  }

  static registerValidator(name, fn) {
    RenForm.#customValidators.set(name, fn);
  }
  static registerMessages(locale, messages) { RenForm.#messages.set(locale, { ...messages }); }

  connectedCallback() {
    this._form = this.querySelector('form.ren-form');
    if (!this._form) return;
    if (!this.hasAttribute('dir')) {
      const locale = this.getAttribute('lang') || document.documentElement.lang || '';
      if (/^(ar|fa|he|ur)(-|$)/i.test(locale)) this.setAttribute('dir', 'rtl');
    }

    this._initElements();
    this._attachEventListeners();
    this._initMultiStep();
    this._restorePersisted();
  }

  disconnectedCallback() {
    this._removeEventListeners();
    this._clearDebounceTimers();
  }

  _initElements() {
    this._validationMode = this.getAttribute('data-validate') ?? DEFAULT_VALIDATION_MODE;
    this._fields = Array.from(this._form.querySelectorAll('ren-field, .ren-field'))
      .filter((field, index, fields) => fields.indexOf(field) === index);
    this._errorSummary = this._form.querySelector('.ren-form-error-summary');
    this._successMessage = this._form.querySelector('.ren-form-success');

    // The error summary must be focusable so .focus() actually moves caret /
    // SR position when validation fails. A plain <div role="alert"> is not
    // focusable by default; set tabindex="-1" if the author did not.
    if (this._errorSummary && !this._errorSummary.hasAttribute('tabindex')) {
      this._errorSummary.setAttribute('tabindex', '-1');
    }
  }

  _initMultiStep() {
    const stepsAttr = this.getAttribute('data-steps');
    if (!stepsAttr) return;

    this._totalSteps = parseInt(stepsAttr, 10);
    this._currentStep = 1;
    this._updateProgressIndicators();
  }

  _attachEventListeners() {
    this._listenerController?.abort();
    this._listenerController = new AbortController();
    const { signal } = this._listenerController;

    // Form submit
    this._form.addEventListener('submit', (e) => this._handleSubmit(e), { signal });

    // Field validation
    this._fields.forEach((field) => {
      const input = field.querySelector('input, select, textarea');
      if (!input) return;
      input.addEventListener('input', () => this._persist(), { signal });

      switch (this._validationMode) {
        case 'onBlur':
          input.addEventListener('blur', () => this._validateField(field, input), { signal });
          break;

        case 'onChange':
          input.addEventListener('input', () => {
            this._debounceValidation(field, input);
          }, { signal });
          break;

        case 'onTouched':
          input.addEventListener('blur', () => {
            this._touched.add(input.name);
            this._validateField(field, input);
          }, { signal });
          input.addEventListener('input', () => {
            if (this._touched.has(input.name)) {
              this._debounceValidation(field, input);
            }
          }, { signal });
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
    this._listenerController?.abort();
    this._listenerController = null;
  }

  async _handleSubmit(e) {
    e.preventDefault();
    if (this._isSubmitting) return;

    this._isSubmitting = true;

    let result;
    try {
      result = await this.validateAsync();
    } catch (error) {
      this._isSubmitting = false;
      this._setSubmittingState(false);
      this.dispatchEvent(new CustomEvent('ren-submit-error', {
        detail: { error },
        bubbles: true,
        composed: true,
      }));
      return;
    }

    if (!result.valid) {
      this._isSubmitting = false;
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
    this._setSubmittingState(true);

    const values = this.getValues();
    const completions = [];
    const event = new CustomEvent('ren-submit', {
      detail: { values, form: this._form, waitUntil: (promise) => {
        if (promise && typeof promise.then === 'function') completions.push(promise);
      } },
      bubbles: true,
      composed: true,
      cancelable: true,
    });

    this.dispatchEvent(event);

    try { await Promise.all(completions); }
    catch (error) {
      this.dispatchEvent(new CustomEvent('ren-submit-error', { detail: { error }, bubbles: true, composed: true }));
    } finally {
      this._setSubmittingState(false);
      this._isSubmitting = false;
    }
  }

  _setSubmittingState(isSubmitting) {
    this.toggleAttribute('data-submitting', isSubmitting);
    this._form?.toggleAttribute('data-submitting', isSubmitting);

    if (isSubmitting) {
      this._submitButtonStates.clear();
      const submitButtons = this._form?.querySelectorAll(
        'button:not([type]), button[type="submit"], input[type="submit"], input[type="image"]'
      ) || [];
      submitButtons.forEach((button) => {
        this._submitButtonStates.set(button, button.disabled);
        button.disabled = true;
      });
      return;
    }

    this._submitButtonStates.forEach((wasDisabled, button) => {
      if (button.isConnected) button.disabled = wasDisabled;
    });
    this._submitButtonStates.clear();
  }

  _validateField(field, input) {
    const rules = field.getAttribute('data-rules') ?? input.getAttribute('data-rules') ?? '';
    const error = this._nativeValidationError(input) || this._runValidators(rules, input.value, input.name);

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

      if (error) return this._message(error, validator, param);
    }

    return null;
  }

  async _runValidatorsAsync(rulesString, value) {
    if (!rulesString) return null;
    for (const rule of rulesString.split('|').map((r) => r.trim())) {
      const [name, param] = rule.split(':');
      const fn = builtInValidators[name] || RenForm.#customValidators.get(name);
      if (!fn) continue;
      let result = param ? fn(param)(value, this._form) : fn(value, this._form);
      if (result && typeof result.then === 'function') result = await result;
      if (result) return this._message(result, name, param);
    }
    return null;
  }

  _message(message, rule, param) {
    const locale = this.getAttribute('lang') || document.documentElement.lang || 'en';
    const custom = RenForm.#messages.get(locale) || RenForm.#messages.get(locale.split('-')[0]);
    const value = custom?.[rule] ?? DEFAULT_MESSAGES[rule];
    return typeof value === 'function' ? value(param) : (value || message);
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

    ul.replaceChildren();
    errors.forEach((error) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      const field = this._findFieldInput(error.name);

      link.href = field?.id ? `#${field.id}` : '#';
      link.textContent = `${error.name}: ${error.message}`;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        if (field) field.focus();
      });

      li.appendChild(link);
      ul.appendChild(li);
    });

    this._errorSummary.setAttribute('data-has-errors', '');
    this._errorSummary.removeAttribute('hidden');
    this._errorSummary.focus();
  }

  _findFieldInput(name) {
    return Array.from(this._form?.elements || []).find(
      (element) => element.name === name
    );
  }

  _hideErrorSummary() {
    if (!this._errorSummary) return;
    this._errorSummary.removeAttribute('data-has-errors');
    this._errorSummary.setAttribute('hidden', '');
  }

  _scrollToFirstError() {
    const firstInvalid = this._form.querySelector('[data-invalid]');
    if (firstInvalid) {
      firstInvalid.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
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
    this.querySelectorAll('.ren-form-section[data-step], [data-ren-step-panel]').forEach((panel) => {
      const step = Number(panel.getAttribute('data-step') || panel.getAttribute('data-ren-step-panel'));
      panel.hidden = step !== this._currentStep;
      panel.toggleAttribute('data-active', step === this._currentStep);
    });
  }

  // ─── Public API ───

  validate() {
    const errors = [];

    this._fields.forEach((field) => {
      const input = field.querySelector('input, select, textarea');
      if (!input) return;

      const rules = field.getAttribute('data-rules') ?? input.getAttribute('data-rules') ?? '';
      const error = this._nativeValidationError(input) || this._runValidators(rules, input.value, input.name);

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

  async validateAsync() {
    const errors = [];
    for (const field of this._fields) {
      const input = field.querySelector('input, select, textarea');
      if (!input) continue;
      const rules = field.getAttribute('data-rules') ?? input.getAttribute('data-rules') ?? '';
      const error = this._nativeValidationError(input) || await this._runValidatorsAsync(rules, input.value);
      if (error) { this._setFieldError(field, input, error); this._errors.set(input.name, error); errors.push({ name: input.name, message: error }); }
      else this._clearFieldError(field, input);
    }
    return { valid: errors.length === 0, errors };
  }

  reset() {
    this._form.reset();
    this._setSubmittingState(false);
    this._isSubmitting = false;
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
    this._updateProgressIndicators();
    this._clearPersisted();
  }

  _restorePersisted() {
    this._persistKey = this.getAttribute('data-persist');
    if (!this._persistKey) return;
    try {
      const values = JSON.parse(localStorage.getItem(this._persistKey) || '{}');
      this._form.querySelectorAll('[name]').forEach((input) => {
        const value = values[input.name]; if (value == null) return;
        if (input.type === 'checkbox' || input.type === 'radio') input.checked = Array.isArray(value) ? value.includes(input.value) : Boolean(value);
        else input.value = Array.isArray(value) ? value[0] : value;
      });
    } catch { /* storage is optional */ }
  }

  _persist() {
    if (!this._persistKey) return;
    try { localStorage.setItem(this._persistKey, JSON.stringify(this.getValues())); } catch { /* private mode/quota */ }
  }

  _clearPersisted() { if (this._persistKey) { try { localStorage.removeItem(this._persistKey); } catch { /* optional */ } } }

  getValues() {
    const formData = new FormData(this._form);
    return serializeFormEntries(formData.entries());
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

      const rules = field.getAttribute('data-rules') ?? input.getAttribute('data-rules') ?? '';
      const error = this._nativeValidationError(input) || this._runValidators(rules, input.value, input.name);

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
    const panel = this.querySelector(`.ren-form-section[data-step="${stepNum}"], [data-ren-step-panel="${stepNum}"]`);
    if (panel) return this._fields.filter((field) => panel.contains(field));
    return this._fields.filter((field) => {
      const owner = field.closest('[data-step]');
      return !owner || owner.getAttribute('data-step') === String(stepNum);
    });
  }

  _nativeValidationError(input) {
    if (input.validity?.valid) return null;
    if (input.validity?.valueMissing) return this._message('', 'required');
    if (input.validity?.typeMismatch) return this._message('', 'email');
    if (input.validity?.patternMismatch) return this._message('', 'pattern');
    if (input.validity?.tooShort) return this._message('', 'min', input.minLength);
    if (input.validity?.tooLong) return this._message('', 'max', input.maxLength);
    if (input.validity?.rangeUnderflow) return this._message(`Value must be at least ${input.min}`, 'invalid');
    if (input.validity?.rangeOverflow) return this._message(`Value must be no more than ${input.max}`, 'invalid');
    return this._message('', 'invalid');
  }
}

if (!customElements.get('ren-form')) {
  customElements.define('ren-form', RenForm);
}
