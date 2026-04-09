/**
 * RenDS — <ren-field> Web Component
 * ===================================
 * Auto-wires ARIA relationships between label, input,
 * description, and error message.
 *
 * Light DOM — no Shadow DOM. Just enhances existing HTML.
 *
 * Usage:
 *   <ren-field>
 *     <label>Email</label>
 *     <input type="email" placeholder="name@example.com">
 *     <span data-description>We'll never share your email.</span>
 *     <span data-error>Please enter a valid email.</span>
 *   </ren-field>
 *
 * The component automatically:
 * - Generates IDs and wires aria-labelledby
 * - Wires aria-describedby to description
 * - Wires aria-errormessage to error
 * - Sets aria-invalid when error is visible
 * - Adds data-required to label when input is required
 * - Adds .ren-field, .ren-field-label, .ren-input, etc. classes
 */

import { autoId, wireAria } from '../../utils/id-generator.js';

export class RenField extends HTMLElement {
  connectedCallback() {
    // Add base class
    this.classList.add('ren-field');

    // Find child elements
    const label = this.querySelector('label');
    const input = this.querySelector('input, select, textarea');
    const description = this.querySelector('[data-description]');
    const error = this.querySelector('[data-error]');

    if (!input) return;

    // ─── Add classes ───
    label?.classList.add('ren-field-label');
    input.classList.add('ren-input');
    description?.classList.add('ren-field-description');
    error?.classList.add('ren-field-error');

    // ─── Generate IDs ───
    const inputId = autoId(input, 'input');

    // Wire label → input (using for attribute)
    if (label && !label.getAttribute('for')) {
      label.setAttribute('for', inputId);
    }

    // Wire description → input (aria-describedby)
    if (description) {
      const descId = autoId(description, 'desc');
      const existing = input.getAttribute('aria-describedby');
      if (!existing?.includes(descId)) {
        input.setAttribute(
          'aria-describedby',
          existing ? `${existing} ${descId}` : descId
        );
      }
    }

    // Wire error → input (aria-errormessage)
    if (error) {
      const errorId = autoId(error, 'error');
      input.setAttribute('aria-errormessage', errorId);
      error.setAttribute('role', 'alert');
      error.setAttribute('aria-live', 'polite');

      // Initially hide error if not invalid
      if (!this.hasAttribute('data-invalid')) {
        error.hidden = true;
      }
    }

    // ─── Required indicator ───
    if (input.hasAttribute('required') && label) {
      label.setAttribute('data-required', '');
    }

    // ─── Observe validity changes ───
    this._input = input;
    this._error = error;

    // Listen for custom validation
    input.addEventListener('invalid', () => this._setInvalid(true));
    input.addEventListener('input', () => {
      if (this.hasAttribute('data-invalid') && input.validity.valid) {
        this._setInvalid(false);
      }
    });
  }

  _setInvalid(invalid) {
    if (invalid) {
      this.setAttribute('data-invalid', '');
      this._input?.setAttribute('aria-invalid', 'true');
      if (this._error) this._error.hidden = false;
    } else {
      this.removeAttribute('data-invalid');
      this._input?.removeAttribute('aria-invalid');
      if (this._error) this._error.hidden = true;
    }
  }

  // ─── Public API ───

  /** Set field to invalid state with a message */
  setError(message) {
    if (this._error && message) {
      this._error.textContent = message;
    }
    this._setInvalid(true);
  }

  /** Clear error state */
  clearError() {
    this._setInvalid(false);
  }

  /** Check if field is currently invalid */
  get invalid() {
    return this.hasAttribute('data-invalid');
  }

  set invalid(val) {
    this._setInvalid(val);
  }
}

if (!customElements.get('ren-field')) {
  customElements.define('ren-field', RenField);
}
