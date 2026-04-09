/**
 * RenDS — <ren-accordion> (Minimal Enhancement)
 * ════════════════════════════════════════════════
 *
 * Native <details><summary> handles 90% of the work.
 * This JS only adds:
 *   - Exclusive mode (single): close others when one opens
 *     → Uses native <details name="..."> when supported,
 *       with JS fallback for older browsers
 *   - default-value attribute: open items on init
 *   - ren-accordion-change event: custom event dispatch
 *
 * Attributes:
 *   type:          'single' (default) | 'multiple'
 *   collapsible:   boolean (single mode only) — allow all closed
 *   default-value: comma-separated indices to open on init
 *
 * Markup:
 *   <ren-accordion type="single" default-value="0">
 *     <details>
 *       <summary class="ren-accordion-trigger">Item 1</summary>
 *       <div class="ren-accordion-content">Content...</div>
 *     </details>
 *     <details>
 *       <summary class="ren-accordion-trigger">Item 2</summary>
 *       <div class="ren-accordion-content">Content...</div>
 *     </details>
 *   </ren-accordion>
 *
 * Events:
 *   ren-accordion-change: Fired when item open state changes
 *   - detail: { item, isOpen, index }
 */

/**
 * Feature detect: does <details name="..."> support exclusive mode natively?
 * When supported, setting the same `name` on multiple <details> makes them
 * behave like radio buttons — opening one closes the others automatically.
 */
const supportsDetailsName = (() => {
  try {
    const d1 = document.createElement('details');
    const d2 = document.createElement('details');
    d1.name = 'test';
    d2.name = 'test';
    d1.open = true;
    d2.open = true;
    const container = document.createElement('div');
    container.append(d1, d2);
    document.body.append(container);
    // If native exclusive works, opening d2 should close d1
    const works = !d1.open;
    container.remove();
    return works;
  } catch {
    return false;
  }
})();

export class RenAccordion extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'collapsible', 'default-value'];
  }

  constructor() {
    super();
    /** @private */ this._useNativeExclusive = false;
    /** @private */ this._groupName = '';
  }

  connectedCallback() {
    this.classList.add('ren-accordion');

    // Determine mode (exclusive or multiple)
    this._exclusive = this.getAttribute('type') !== 'multiple';
    this._collapsible = this.hasAttribute('collapsible');

    // Generate a unique group name for native <details name>
    this._groupName = `ren-accordion-${this.id || Math.random().toString(36).slice(2, 8)}`;

    // Use native exclusive mode when browser supports it
    this._useNativeExclusive = supportsDetailsName && this._exclusive;
    this._applyNativeExclusive();

    // Listen for toggle events on all child details (event delegation)
    this.addEventListener('toggle', this._handleToggle.bind(this), true);

    // Apply default open items
    const defaultValue = this.getAttribute('default-value');
    if (defaultValue) {
      this._setDefaultOpen(defaultValue);
    }
  }

  /**
   * Apply or remove the native `name` attribute on child <details>.
   * When supported, this lets the browser handle exclusive mode natively.
   * @private
   */
  _applyNativeExclusive() {
    this.items.forEach((detail) => {
      if (this._useNativeExclusive) {
        detail.setAttribute('name', this._groupName);
      } else {
        // Remove name if switching to multiple mode or no native support
        if (detail.getAttribute('name') === this._groupName) {
          detail.removeAttribute('name');
        }
      }
    });
  }

  /**
   * Handle toggle event on child <details> elements
   * @private
   */
  _handleToggle(event) {
    const details = event.target;

    // Only handle <details> that are direct children or nested in .ren-accordion-item
    if (!this._isValidDetail(details)) {
      return;
    }

    // Set data-state for CSS styling
    details.setAttribute('data-state', details.open ? 'open' : 'closed');

    // JS fallback for exclusive mode (only when native isn't handling it)
    if (this._exclusive && !this._useNativeExclusive && details.open) {
      this._closeOtherDetails(details);
    }

    // Sync data-state on siblings closed by native <details name>
    if (this._useNativeExclusive && details.open) {
      this.items.forEach((d) => {
        if (d !== details) {
          d.setAttribute('data-state', d.open ? 'open' : 'closed');
        }
      });
    }

    // Dispatch custom event
    const index = this.items.indexOf(details);
    this.dispatchEvent(
      new CustomEvent('ren-accordion-change', {
        detail: {
          item: details,
          isOpen: details.open,
          index,
        },
        bubbles: true,
      })
    );
  }

  /**
   * Check if a details element is a valid child
   * @private
   */
  _isValidDetail(details) {
    if (details.tagName !== 'DETAILS') {
      return false;
    }

    // Direct child of accordion
    if (details.parentElement === this) {
      return true;
    }

    // Child of .ren-accordion-item within accordion
    const parent = details.parentElement;
    if (
      parent &&
      parent.classList &&
      parent.classList.contains('ren-accordion-item') &&
      parent.parentElement === this
    ) {
      return true;
    }

    return false;
  }

  /**
   * Close all other details except the specified one
   * @private
   */
  _closeOtherDetails(openDetails) {
    this.items.forEach((detail) => {
      if (detail !== openDetails && detail.open) {
        detail.open = false;
        detail.setAttribute('data-state', 'closed');
      }
    });
  }

  /**
   * Set which items should be open by default
   * @private
   */
  _setDefaultOpen(value) {
    const indices = value
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((i) => !isNaN(i));

    this.items.forEach((detail, index) => {
      detail.open = indices.includes(index);
      detail.setAttribute('data-state', detail.open ? 'open' : 'closed');
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.isConnected) return;

    if (name === 'type') {
      // Update exclusive mode
      this._exclusive = newValue !== 'multiple';
      this._useNativeExclusive = supportsDetailsName && this._exclusive;
      this._applyNativeExclusive();
    } else if (name === 'collapsible') {
      // Collapsible flag updated
      this._collapsible = this.hasAttribute('collapsible');
    } else if (name === 'default-value') {
      // Re-apply defaults
      if (newValue) {
        this._setDefaultOpen(newValue);
      }
    }
  }

  /* ═══════════════════════════════════════════ */
  /* PUBLIC API */
  /* ═══════════════════════════════════════════ */

  /**
   * Get all details elements
   */
  get items() {
    const items = [];

    // Direct <details> children
    this.querySelectorAll(':scope > details').forEach((d) => items.push(d));

    // <details> nested in .ren-accordion-item children
    this.querySelectorAll(':scope > .ren-accordion-item > details').forEach(
      (d) => items.push(d)
    );

    return items;
  }

  /**
   * Open a specific item by index
   */
  openItem(index) {
    const item = this.items[index];
    if (!item) return;

    // Exclusive mode: close others
    if (this._exclusive) {
      this._closeOtherDetails(item);
    }

    item.open = true;
  }

  /**
   * Close a specific item by index
   */
  closeItem(index) {
    const item = this.items[index];
    if (!item) return;

    // In exclusive mode without collapsible: prevent closing if only open item
    if (
      this._exclusive &&
      !this._collapsible &&
      this.items.filter((d) => d.open).length === 1 &&
      item.open
    ) {
      return; // Keep at least one open
    }

    item.open = false;
  }

  /**
   * Toggle a specific item by index
   */
  toggleItem(index) {
    const item = this.items[index];
    if (!item) return;

    if (item.open) {
      this.closeItem(index);
    } else {
      this.openItem(index);
    }
  }

  /**
   * Check if item is open
   */
  isOpen(index) {
    return this.items[index]?.open ?? false;
  }

  /**
   * Get all currently open indices
   */
  getOpenItems() {
    return this.items
      .map((item, index) => (item.open ? index : -1))
      .filter((i) => i !== -1);
  }
}

// Register the component
if (!customElements.get('ren-accordion')) {
  customElements.define('ren-accordion', RenAccordion);
}
