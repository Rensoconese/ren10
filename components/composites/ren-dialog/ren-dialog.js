import { createFocusTrap } from '../../utils/focus-trap.js';

/**
 * RenDialog - Modal/Dialog Web Component
 *
 * A minimal, modern dialog component built on the native <dialog> element.
 * Animations are handled entirely by CSS using @starting-style and transitions.
 *
 * Features:
 * - Native <dialog> element with `.ren-dialog` enhancement
 * - Auto-wiring of [data-dialog-trigger] and [data-dialog-close] buttons
 * - Progressive enhancement: [commandfor] and [command] attributes support
 * - Progressive enhancement: closedby attribute for modern browsers
 * - Focus trap management for accessibility
 * - Escape key support and click-outside dismissal via native dialog + simple click handler
 * - Size variants (sm, md, lg, xl, full)
 * - Mobile-responsive bottom sheet behavior
 * - Custom events: ren-open, ren-close
 *
 * @example
 * <ren-dialog size="md">
 *   <dialog>
 *     <div class="ren-dialog-header">
 *       <h2 class="ren-dialog-title">Confirm Action</h2>
 *       <button class="ren-dialog-close" data-dialog-close>&times;</button>
 *     </div>
 *     <div class="ren-dialog-body">Are you sure?</div>
 *     <div class="ren-dialog-footer">
 *       <button data-dialog-close>Cancel</button>
 *       <button>Confirm</button>
 *     </div>
 *   </dialog>
 * </ren-dialog>
 *
 * @example
 * <button data-dialog-trigger="my-dialog">Open</button>
 * <ren-dialog id="my-dialog">...</ren-dialog>
 *
 * @example
 * <button commandfor="my-dialog" command="show-modal">Open</button>
 * <ren-dialog id="my-dialog">...</ren-dialog>
 */
export class RenDialog extends HTMLElement {
  #dialogElement = null;
  #focusTrap = null;
  #abortController = new AbortController();
  #inertElements = new WeakMap();

  static observedAttributes = ['open', 'alert', 'size'];

  constructor() {
    super();
    this.#setupDialogElement();
  }

  connectedCallback() {
    this.#initializeDialogElement();
    this.#wireupTriggers();
  }

  disconnectedCallback() {
    this.#abortController.abort();
    this.#teardownFocusTrap();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'open':
        newValue !== null ? this.show() : this.close();
        break;
      case 'size':
        this.#updateSizeClass();
        break;
    }
  }

  /* ═══ PUBLIC API ═══ */

  /**
   * Show the dialog with modal behavior
   * @public
   */
  show() {
    if (!this.#dialogElement?.open) {
      this.#dialogElement.showModal();
      this.#setInert(true);
      this.setAttribute('open', '');
      this.setAttribute('data-state', 'open');
      this.#setupFocusTrap();
      this.#updateMobileSheet();
      this.dispatchEvent(new CustomEvent('ren-open', { bubbles: true, composed: true }));
    }
  }

  /**
   * Alias for show()
   * @public
   */
  open() {
    this.show();
  }

  /**
   * Close the dialog
   * CSS transitions handle the exit animation automatically
   *
   * @public
   * @param {string} [returnValue]
   */
  close(returnValue = '') {
    if (this.#dialogElement?.open) {
      this.#setInert(false);
      this.#dialogElement.close(returnValue);
      this.removeAttribute('open');
      this.setAttribute('data-state', 'closed');
      this.#teardownFocusTrap();
      this.dispatchEvent(
        new CustomEvent('ren-close', {
          bubbles: true,
          composed: true,
          detail: { returnValue },
        })
      );
    }
  }

  /**
   * Check if dialog is open
   * @public
   * @returns {boolean}
   */
  get isOpen() {
    return this.#dialogElement?.open ?? false;
  }

  /**
   * Get the underlying dialog element
   * @public
   * @returns {HTMLDialogElement | null}
   */
  get dialog() {
    return this.#dialogElement;
  }

  /* ═══ PRIVATE: INITIALIZATION ═══ */

  /**
   * Find or create the dialog element
   * @private
   */
  #setupDialogElement() {
    this.#dialogElement = this.querySelector('dialog');
    if (!this.#dialogElement) {
      this.#dialogElement = document.createElement('dialog');
      this.appendChild(this.#dialogElement);
    }
  }

  /**
   * Initialize dialog with classes and event listeners
   * @private
   */
  #initializeDialogElement() {
    if (!this.#dialogElement) this.#setupDialogElement();

    this.#dialogElement.classList.add('ren-dialog');
    this.#updateSizeClass();

    if (this.hasAttribute('alert')) {
      this.#dialogElement.classList.add('ren-alert-dialog');
      this.#dialogElement.setAttribute('role', 'alertdialog');
    }

    // Add aria-label fallback if no title found
    if (!this.#dialogElement.getAttribute('aria-label')) {
      const title = this.#dialogElement.querySelector('.ren-dialog-title, [role="heading"]');
      if (title) {
        this.#dialogElement.setAttribute('aria-label', title.textContent?.trim() || 'Dialog');
      } else {
        this.#dialogElement.setAttribute('aria-label', 'Dialog');
      }
    }

    // Handle Escape key (native dialog behavior)
    this.#dialogElement.addEventListener(
      'cancel',
      (e) => {
        const noEscape = this.hasAttribute('no-escape');
        if (!noEscape) {
          e.preventDefault();
          this.close();
        }
      },
      { signal: this.#abortController.signal }
    );

    // Handle click-outside dismissal
    // Clicking on the dialog itself when event.target === dialog means backdrop was clicked
    this.#dialogElement.addEventListener(
      'click',
      (e) => {
        if (e.target === this.#dialogElement && !this.hasAttribute('alert')) {
          this.close();
        }
      },
      { signal: this.#abortController.signal }
    );

    // Wire up close buttons
    this.#wireupCloseButtons();

    // Progressive enhancement: set closedby attribute for modern browsers
    if ('closedBy' in HTMLDialogElement.prototype) {
      if (this.hasAttribute('alert')) {
        this.#dialogElement.closedBy = 'closerequest';
      } else if (this.hasAttribute('no-escape')) {
        this.#dialogElement.closedBy = 'none';
      } else {
        this.#dialogElement.closedBy = 'any';
      }
    }
  }

  /**
   * Wire up trigger buttons that open this dialog
   * Supports both [data-dialog-trigger] and native commandfor/command attributes
   * @private
   */
  #wireupTriggers() {
    const id = this.id;
    if (!id) return;

    const triggers = document.querySelectorAll(`[data-dialog-trigger="${id}"]`);
    triggers.forEach((trigger) => {
      trigger.addEventListener(
        'click',
        (e) => {
          e.preventDefault();
          this.show();
        },
        { signal: this.#abortController.signal }
      );
    });

    // Progressive enhancement: support command/commandfor in browsers that don't yet support it natively
    if (!('commandForElement' in HTMLButtonElement.prototype)) {
      const commandTriggers = document.querySelectorAll(`[commandfor="${id}"]`);
      commandTriggers.forEach((trigger) => {
        const command = trigger.getAttribute('command');
        if (command === 'show-modal' || command === 'show') {
          trigger.addEventListener(
            'click',
            (e) => {
              e.preventDefault();
              this.show();
            },
            { signal: this.#abortController.signal }
          );
        } else if (command === 'close') {
          trigger.addEventListener(
            'click',
            (e) => {
              e.preventDefault();
              this.close();
            },
            { signal: this.#abortController.signal }
          );
        }
      });
    }
  }

  /**
   * Wire up close buttons within the dialog
   * @private
   */
  #wireupCloseButtons() {
    const closeButtons = this.#dialogElement?.querySelectorAll('[data-dialog-close]');
    closeButtons?.forEach((button) => {
      button.addEventListener(
        'click',
        (e) => {
          e.preventDefault();
          this.close();
        },
        { signal: this.#abortController.signal }
      );
    });
  }

  /* ═══ PRIVATE: FOCUS MANAGEMENT ═══ */

  /**
   * Setup focus trap for keyboard navigation
   * @private
   */
  #setupFocusTrap() {
    if (this.#focusTrap) return;
    this.#focusTrap = createFocusTrap(this.#dialogElement, {
      initialFocus: this.#dialogElement.querySelector('[autofocus]'),
      returnFocusOnDeactivate: true,
    });
    this.#focusTrap.activate();
  }

  /**
   * Teardown focus trap
   * @private
   */
  #teardownFocusTrap() {
    if (this.#focusTrap) {
      this.#focusTrap.deactivate();
      this.#focusTrap = null;
    }
  }

  /* ═══ PRIVATE: UTILITIES ═══ */

  /**
   * Update size variant class
   * @private
   */
  #updateSizeClass() {
    if (!this.#dialogElement) return;
    this.#dialogElement.classList.remove(
      'ren-dialog-sm',
      'ren-dialog-md',
      'ren-dialog-lg',
      'ren-dialog-xl',
      'ren-dialog-full'
    );
    const size = this.getAttribute('size') || 'md';
    this.#dialogElement.classList.add(`ren-dialog-${size}`);
  }

  /**
   * Apply mobile bottom sheet styling on small screens
   * @private
   */
  #updateMobileSheet() {
    if (!this.#dialogElement) return;
    if (window.innerWidth <= 640) {
      this.#dialogElement.setAttribute('data-mobile-sheet', '');
    } else {
      this.#dialogElement.removeAttribute('data-mobile-sheet');
    }
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

      // Skip the dialog itself and meta elements
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

/**
 * RenAlertDialog - Alert Dialog Variant
 *
 * An alert dialog that prevents click-outside dismissal by default.
 * Escape key and other behavior can be controlled via attributes.
 *
 * @example
 * <ren-alert-dialog>
 *   <dialog>...</dialog>
 * </ren-alert-dialog>
 */
export class RenAlertDialog extends RenDialog {
  constructor() {
    super();
    this.setAttribute('alert', '');
  }
}

/* ═══ REGISTER CUSTOM ELEMENTS ═══ */
if (!customElements.get('ren-dialog')) {
  customElements.define('ren-dialog', RenDialog);
}
if (!customElements.get('ren-alert-dialog')) {
  customElements.define('ren-alert-dialog', RenAlertDialog);
}
