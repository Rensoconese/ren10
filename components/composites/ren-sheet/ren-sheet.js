import { createDismissable } from '../../utils/dismissable.js';
import { autoId } from '../../utils/id-generator.js';

export class RenSheet extends HTMLElement {
  #dialog;
  #titleId;
  #descriptionId;
  #dismissable;
  #startX = 0;
  #startY = 0;
  #isDragging = false;
  #inertElements = new WeakMap();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.#titleId = autoId('sheet-title');
    this.#descriptionId = autoId('sheet-description');

    this.#render();
    this.#setupDialog();
    this.#setupEventListeners();
    this.#setupDismissable();

    if (this.hasAttribute('open')) {
      this.show();
    }
  }

  #render() {
    const side = this.getAttribute('data-side') || 'right';
    const size = this.getAttribute('data-size') || 'md';

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="./ren-sheet.css">

      <dialog class="ren-sheet -${size}" data-side="${side}">
        <div class="ren-sheet-handle"></div>

        <div class="ren-sheet-header">
          <div>
            <h2 class="ren-sheet-title" id="${this.#titleId}">
              <slot name="title">Sheet</slot>
            </h2>
            <p class="ren-sheet-description" id="${this.#descriptionId}">
              <slot name="description"></slot>
            </p>
          </div>
          <button class="ren-sheet-close" aria-label="Close sheet">
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div class="ren-sheet-body">
          <slot></slot>
        </div>

        <div class="ren-sheet-footer">
          <slot name="footer"></slot>
        </div>
      </dialog>
    `;
  }

  #setupDialog() {
    this.#dialog = this.shadowRoot.querySelector('dialog');
    this.#dialog.setAttribute('role', 'dialog');
    this.#dialog.setAttribute('aria-labelledby', this.#titleId);
    this.#dialog.setAttribute('aria-describedby', this.#descriptionId);
  }

  #setupEventListeners() {
    const closeBtn = this.shadowRoot.querySelector('.ren-sheet-close');
    closeBtn.addEventListener('click', () => this.close());

    // Backdrop click
    this.shadowRoot.addEventListener('click', (e) => {
      if (e.target === this.#dialog) {
        this.close();
      }
    });

    // Wire up data-sheet-trigger and data-sheet-close in light DOM
    this.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-sheet-trigger]');
      const closeEl = e.target.closest('[data-sheet-close]');

      if (trigger) {
        this.show();
      }
      if (closeEl) {
        this.close();
      }
    });

    // Touch swipe to dismiss
    this.#dialog.addEventListener('touchstart', (e) => {
      this.#startX = e.touches[0].clientX;
      this.#startY = e.touches[0].clientY;
      this.#isDragging = true;
    });

    this.#dialog.addEventListener('touchmove', (e) => {
      if (!this.#isDragging) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - this.#startX;
      const deltaY = currentY - this.#startY;

      const side = this.getAttribute('data-side') || 'right';
      const threshold = 50;

      if (
        (side === 'right' && deltaX > threshold) ||
        (side === 'left' && deltaX < -threshold) ||
        (side === 'bottom' && deltaY > threshold) ||
        (side === 'top' && deltaY < -threshold)
      ) {
        this.close();
        this.#isDragging = false;
      }
    });

    this.#dialog.addEventListener('touchend', () => {
      this.#isDragging = false;
    });
  }

  #setupDismissable() {
    this.#dismissable = createDismissable({
      trigger: this,
      content: this.#dialog,
      onDismiss: () => this.close(),
    });
  }

  // Public API
  show() {
    if (this.#dialog.open) return;

    this.#dialog.showModal();
    this.#setInert(true);
    this.setAttribute('open', '');

    this.dispatchEvent(
      new CustomEvent('ren-open', {
        bubbles: true,
        composed: true,
      })
    );
  }

  close() {
    if (!this.#dialog.open) return;

    // Trigger close animation
    this.#setInert(false);
    this.#dialog.close();
    this.removeAttribute('open');

    this.dispatchEvent(
      new CustomEvent('ren-close', {
        bubbles: true,
        composed: true,
      })
    );
  }

  get open() {
    return this.#dialog.open;
  }

  /**
   * Toggle inert attribute on sibling elements
   * When active, makes background elements non-interactive
   * @private
   * @param {boolean} active
   */
  #setInert(active) {
    const children = document.body.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];

      // Skip the sheet itself and meta elements
      if (
        child === this ||
        child.tagName === 'SCRIPT' ||
        child.tagName === 'STYLE' ||
        child.tagName === 'LINK'
      ) {
        continue;
      }

      if (active) {
        // Save original inert state and set inert
        if (!this.#inertElements.has(child)) {
          this.#inertElements.set(child, child.inert);
        }
        child.inert = true;
      } else {
        // Restore original inert state
        const originalInert = this.#inertElements.get(child);
        if (originalInert !== undefined) {
          child.inert = originalInert;
          this.#inertElements.delete(child);
        }
      }
    }
  }
}

customElements.define('ren-sheet', RenSheet);
