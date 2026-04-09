/**
 * RenDS — <ren-button> Web Component
 * ====================================
 * Enhanced button with loading state, variants, and
 * proper accessibility out of the box.
 *
 * Uses Light DOM — no Shadow DOM needed for a button.
 * The CSS classes work standalone too.
 *
 * Attributes:
 *   variant:  primary | secondary | ghost | outline | danger | link
 *   size:     sm | md | lg
 *   loading:  boolean — shows spinner, disables interaction
 *   disabled: boolean — standard disabled state
 *   icon:     boolean — square icon button
 *   full:     boolean — full width
 *
 * Usage:
 *   <ren-button>Click me</ren-button>
 *   <ren-button variant="secondary" size="sm">Cancel</ren-button>
 *   <ren-button variant="danger" loading>Deleting...</ren-button>
 *   <ren-button icon aria-label="Close">✕</ren-button>
 */

const VARIANT_MAP = {
  primary: 'ren-btn',
  secondary: 'ren-btn ren-btn-secondary',
  ghost: 'ren-btn ren-btn-ghost',
  outline: 'ren-btn ren-btn-outline',
  danger: 'ren-btn ren-btn-danger',
  link: 'ren-btn ren-btn-link',
};

const SIZE_MAP = {
  sm: 'ren-btn-sm',
  md: '',
  lg: 'ren-btn-lg',
};

export class RenButton extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'size', 'loading', 'disabled', 'icon', 'full'];
  }

  constructor() {
    super();
    this._button = null;
  }

  connectedCallback() {
    // If this element wraps a <button>, enhance it
    // If not, create one
    this._button = this.querySelector('button, a, [role="button"]');

    if (!this._button) {
      // Wrap content in a button
      const button = document.createElement('button');
      button.setAttribute('type', 'button');

      // Move children into the button
      while (this.firstChild) {
        button.appendChild(this.firstChild);
      }
      this.appendChild(button);
      this._button = button;
    }

    this._updateClasses();
    this._updateState();
  }

  attributeChangedCallback() {
    if (this._button) {
      this._updateClasses();
      this._updateState();
    }
  }

  _updateClasses() {
    if (!this._button) return;

    const variant = this.getAttribute('variant') || 'primary';
    const size = this.getAttribute('size') || 'md';

    const classes = [
      VARIANT_MAP[variant] || VARIANT_MAP.primary,
      SIZE_MAP[size] || '',
      this.hasAttribute('icon') ? 'ren-btn-icon' : '',
      this.hasAttribute('full') ? 'ren-btn-full' : '',
    ]
      .filter(Boolean)
      .join(' ');

    this._button.className = classes;
  }

  _updateState() {
    if (!this._button) return;

    // Loading
    if (this.hasAttribute('loading')) {
      this._button.setAttribute('data-loading', '');
      this._button.setAttribute('aria-busy', 'true');
    } else {
      this._button.removeAttribute('data-loading');
      this._button.removeAttribute('aria-busy');
    }

    // Disabled
    if (this.hasAttribute('disabled')) {
      this._button.setAttribute('disabled', '');
      this._button.setAttribute('aria-disabled', 'true');
    } else {
      this._button.removeAttribute('disabled');
      this._button.removeAttribute('aria-disabled');
    }
  }

  // ─── Programmatic API ───

  get loading() {
    return this.hasAttribute('loading');
  }

  set loading(val) {
    if (val) {
      this.setAttribute('loading', '');
    } else {
      this.removeAttribute('loading');
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  get variant() {
    return this.getAttribute('variant') || 'primary';
  }

  set variant(val) {
    this.setAttribute('variant', val);
  }
}

// Register
if (!customElements.get('ren-button')) {
  customElements.define('ren-button', RenButton);
}
