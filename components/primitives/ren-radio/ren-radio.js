/**
 * RenDS — <ren-radio-group> Web Component
 * ========================================
 * Accessible radio group with keyboard navigation.
 * Implements arrow key navigation and roving tabindex.
 *
 * Uses Light DOM — no Shadow DOM.
 * Works with native <input type="radio"> elements.
 *
 * Attributes:
 *   orientation: 'vertical' (default) | 'horizontal'
 *   role:        'radiogroup' (auto-set)
 *
 * Usage:
 *   <ren-radio-group>
 *     <label class="ren-radio">
 *       <input type="radio" name="option" value="a">
 *       <span class="ren-radio-control"></span>
 *       <span>Option A</span>
 *     </label>
 *     <label class="ren-radio">
 *       <input type="radio" name="option" value="b">
 *       <span class="ren-radio-control"></span>
 *       <span>Option B</span>
 *     </label>
 *   </ren-radio-group>
 *
 * Arrow keys navigate between radios (Right/Down next, Left/Up previous,
 * wrapping). Selecting a radio via arrow keys also checks it. Space checks the
 * focused radio. The group's tab stop is the checked radio, or the first one.
 */

import { createKeyboardNav } from '../../../utils/keyboard-nav.js';

export class RenRadioGroup extends HTMLElement {
  static get observedAttributes() {
    return ['orientation'];
  }

  constructor() {
    super();
    this._nav = null;
    this._handleChange = this._handleChange.bind(this);
  }

  connectedCallback() {
    // Set ARIA role
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'radiogroup');
    }

    // Find all radio inputs
    const radios = this.querySelectorAll('input[type="radio"]');
    if (radios.length === 0) return;

    this._attachNav();
    this.addEventListener('change', this._handleChange);

    // Update class based on orientation
    this._updateOrientationClass();
  }

  disconnectedCallback() {
    this.removeEventListener('change', this._handleChange);
    if (this._nav) {
      this._nav.detach();
      this._nav = null;
    }
  }

  attributeChangedCallback(name) {
    if (name === 'orientation') {
      this._updateOrientationClass();
      // Detach and reattach nav with new orientation
      if (this._nav) {
        this._nav.detach();
        this._attachNav();
      }
    }
  }

  /**
   * Arrow-key navigation with a roving tabindex. Enter and Space are left to
   * the native radio (no onSelect), so Space checks the focused radio.
   * @private
   */
  _attachNav() {
    this._nav = createKeyboardNav(this, {
      selector: 'input[type="radio"]',
      // All four arrows move within a radio group, whichever way it is laid
      // out (APG Radio Group). The `orientation` attribute is layout only.
      orientation: 'both',
      loop: true,
      typeahead: false,
      focusOnHover: false,
      onActivate: (radio) => {
        // When arrow key navigation moves to a radio, check it. Moving the
        // tab stop onto a radio that is already checked is not a change.
        if (radio.checked) return;
        radio.checked = true;
        // Dispatch change event to match native behavior
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      },
      onSelect: null,
    });

    this._nav.attach();
    this._syncTabStop();
  }

  /**
   * The group's single tab stop is the checked radio, or the first one when
   * nothing is checked (APG Radio Group). Without this a radio checked in the
   * markup, or from script, was left at tabindex="-1" and Tab skipped it.
   * @private
   */
  _syncTabStop() {
    if (!this._nav) return;
    const radios = this._nav.getItems();
    const checked = radios.findIndex((radio) => radio.checked);
    if (checked !== -1 && checked !== this._nav.activeIndex) {
      this._nav.setActiveIndex(checked);
    }
  }

  _handleChange(event) {
    if (event.target instanceof HTMLInputElement && event.target.type === 'radio') {
      this._syncTabStop();
    }
  }

  _updateOrientationClass() {
    const orientation = this.getAttribute('orientation') || 'vertical';

    // Remove existing orientation classes
    this.classList.remove('ren-radio-group', 'ren-radio-group-horizontal');

    // Add appropriate class
    if (orientation === 'horizontal') {
      this.classList.add('ren-radio-group-horizontal');
    } else {
      this.classList.add('ren-radio-group');
    }
  }

  // ─── Programmatic API ───

  /**
   * Get the currently checked radio value
   */
  get value() {
    const checked = this.querySelector('input[type="radio"]:checked');
    return checked ? checked.value : null;
  }

  /**
   * Set which radio is checked by value
   */
  set value(val) {
    const radio = this.querySelector(`input[type="radio"][value="${val}"]`);
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  /**
   * Get all radio inputs
   */
  get radios() {
    return Array.from(this.querySelectorAll('input[type="radio"]'));
  }
}

// Register
if (!customElements.get('ren-radio-group')) {
  customElements.define('ren-radio-group', RenRadioGroup);
}
