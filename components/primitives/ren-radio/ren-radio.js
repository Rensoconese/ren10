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
 * Arrow keys navigate between radios.
 * Selecting a radio via arrow keys also checks it.
 */

import { createKeyboardNav } from '../../utils/keyboard-nav.js';

export class RenRadioGroup extends HTMLElement {
  static get observedAttributes() {
    return ['orientation'];
  }

  constructor() {
    super();
    this._nav = null;
  }

  connectedCallback() {
    // Set ARIA role
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'radiogroup');
    }

    // Find all radio inputs
    const radios = this.querySelectorAll('input[type="radio"]');
    if (radios.length === 0) return;

    // Set up keyboard navigation using roving tabindex
    const orientation = this.getAttribute('orientation') || 'vertical';

    this._nav = createKeyboardNav(this, {
      selector: 'input[type="radio"]',
      orientation,
      loop: true,
      typeahead: false,
      focusOnHover: false,
      onActivate: (radio, index) => {
        // When arrow key navigation moves to a radio, check it
        radio.checked = true;
        // Dispatch change event to match native behavior
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      },
      onSelect: null,
    });

    this._nav.attach();

    // Update class based on orientation
    this._updateOrientationClass();
  }

  disconnectedCallback() {
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
        const orientation = this.getAttribute('orientation') || 'vertical';
        this._nav = createKeyboardNav(this, {
          selector: 'input[type="radio"]',
          orientation,
          loop: true,
          typeahead: false,
          focusOnHover: false,
          onActivate: (radio, index) => {
            radio.checked = true;
            radio.dispatchEvent(new Event('change', { bubbles: true }));
          },
          onSelect: null,
        });
        this._nav.attach();
      }
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
