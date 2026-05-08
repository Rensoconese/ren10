/**
 * RenDS — <ren-sheet> Web Component
 * ==================================
 * Edge-anchored modal panel. Light DOM only — wraps the consumer's children
 * in a native <dialog class="ren-sheet"> so we get focus trap, ::backdrop,
 * Esc handling, and inert-on-body for free.
 *
 * Markup:
 *   <ren-sheet side="right" id="filters">
 *     <header class="ren-sheet-header">
 *       <h2 class="ren-sheet-title">Filters</h2>
 *       <button class="ren-sheet-close" data-sheet-close aria-label="Close">×</button>
 *     </header>
 *     <div class="ren-sheet-body"> … </div>
 *     <footer class="ren-sheet-footer"> … </footer>
 *   </ren-sheet>
 *
 *   <button data-sheet-trigger="filters">Open</button>
 *
 * Attributes:
 *   side         — "right" | "left" | "top" | "bottom" (default "right")
 *   size         — "sm" | "md" | "lg" | "xl" | "full" (default "md")
 *   open         — reflects show()/close()
 *   dismissible  — if "false", only the close button dismisses
 *
 * Methods:
 *   .show()
 *   .close()
 *   .open  (getter)
 *
 * Events (bubble):
 *   ren-open
 *   ren-close
 *
 * Light-DOM hooks:
 *   [data-sheet-trigger="<id>"]  anywhere on the page  → opens the sheet
 *   [data-sheet-close]           inside the sheet      → closes the sheet
 */

import { autoId } from '../../../utils/id-generator.js';

export class RenSheet extends HTMLElement {
  static get observedAttributes() {
    return ['side', 'size', 'data-side', 'data-size', 'open', 'dismissible'];
  }

  #dialog;
  #titleId;
  #upgraded = false;
  #returnFocus = null;

  // Touch swipe
  #startX = 0;
  #startY = 0;
  #dragging = false;

  connectedCallback() {
    if (this.#upgraded) return;
    this.#upgraded = true;
    autoId(this, 'sheet');
    this.#enhance();
    this.#wire();

    // If consumer set open as initial attribute, show
    if (this.hasAttribute('open')) {
      // Defer to ensure dialog is connected
      queueMicrotask(() => this.show());
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (!this.#upgraded || !this.#dialog) return;
    if (name === 'side' || name === 'data-side') {
      this.#dialog.setAttribute('data-side', this.#getSide());
    } else if (name === 'size' || name === 'data-size') {
      this.#syncSize();
    } else if (name === 'open') {
      const should = this.hasAttribute('open');
      if (should && !this.#dialog.open) this.show();
      if (!should && this.#dialog.open) this.close();
    }
  }

  /* ─── Enhancement ─── */

  #enhance() {
    // Move existing children into a <dialog>
    const fragment = document.createDocumentFragment();
    while (this.firstChild) fragment.appendChild(this.firstChild);

    this.#dialog = document.createElement('dialog');
    this.#dialog.className = 'ren-sheet';
    this.#dialog.setAttribute('role', 'dialog');
    this.#dialog.setAttribute('data-side', this.#getSide());
    this.#syncSize();

    this.#dialog.appendChild(fragment);

    // Wire aria-labelledby to a heading inside the sheet, if any
    const heading =
      this.#dialog.querySelector('.ren-sheet-title') ||
      this.#dialog.querySelector('h1, h2, h3');
    if (heading) {
      this.#titleId = autoId(heading, 'sheet-title');
      this.#dialog.setAttribute('aria-labelledby', this.#titleId);
    }

    this.appendChild(this.#dialog);
  }

  #getSide() {
    return (
      this.getAttribute('side') ||
      this.getAttribute('data-side') ||
      'right'
    );
  }

  #getSize() {
    return (
      this.getAttribute('size') ||
      this.getAttribute('data-size') ||
      'md'
    );
  }

  #syncSize() {
    if (!this.#dialog) return;
    // Drop any prior -sm/-md/-lg/-xl/-full classes
    this.#dialog.classList.remove('-sm', '-md', '-lg', '-xl', '-full');
    this.#dialog.classList.add(`-${this.#getSize()}`);
  }

  /* ─── Wiring ─── */

  #wire() {
    // Backdrop click: native <dialog> dispatches click on the dialog itself
    // when the user clicks on the backdrop. e.target === dialog → it was the
    // backdrop, not content inside.
    this.#dialog.addEventListener('click', (e) => {
      if (!this.#isDismissible()) return;
      if (e.target === this.#dialog) this.close();
    });

    // Esc — handled natively, but we intercept to honor dismissible=false
    this.#dialog.addEventListener('cancel', (e) => {
      if (!this.#isDismissible()) e.preventDefault();
    });

    // [data-sheet-close] anywhere inside
    this.#dialog.addEventListener('click', (e) => {
      const closer = e.target.closest('[data-sheet-close]');
      if (closer && this.#dialog.contains(closer)) this.close();
    });

    // Swipe to dismiss
    this.#dialog.addEventListener('touchstart', (e) => {
      if (!this.#isDismissible()) return;
      this.#startX = e.touches[0].clientX;
      this.#startY = e.touches[0].clientY;
      this.#dragging = true;
    }, { passive: true });

    this.#dialog.addEventListener('touchmove', (e) => {
      if (!this.#dragging) return;
      const dx = e.touches[0].clientX - this.#startX;
      const dy = e.touches[0].clientY - this.#startY;
      const side = this.#getSide();
      const threshold = 50;
      if (
        (side === 'right' && dx > threshold) ||
        (side === 'left' && dx < -threshold) ||
        (side === 'bottom' && dy > threshold) ||
        (side === 'top' && dy < -threshold)
      ) {
        this.#dragging = false;
        this.close();
      }
    }, { passive: true });

    this.#dialog.addEventListener('touchend', () => {
      this.#dragging = false;
    });
  }

  #isDismissible() {
    return this.getAttribute('dismissible') !== 'false';
  }

  /* ─── Public API ─── */

  show() {
    if (!this.#dialog || this.#dialog.open) return;
    this.#returnFocus = document.activeElement;
    this.#dialog.showModal();
    this.setAttribute('open', '');

    // Focus the first usable element inside, or the close button
    const focusable =
      this.#dialog.querySelector('[autofocus]') ||
      this.#dialog.querySelector(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
    if (focusable) {
      focusable.focus({ preventScroll: true });
    }

    this.dispatchEvent(new CustomEvent('ren-open', { bubbles: true }));
  }

  close() {
    if (!this.#dialog || !this.#dialog.open) return;
    this.#dialog.close();
    this.removeAttribute('open');

    // Restore focus to the element that opened the sheet
    if (this.#returnFocus && document.contains(this.#returnFocus)) {
      this.#returnFocus.focus({ preventScroll: true });
    }
    this.#returnFocus = null;

    this.dispatchEvent(new CustomEvent('ren-close', { bubbles: true }));
  }

  get open() {
    return !!(this.#dialog && this.#dialog.open);
  }
}

if (!customElements.get('ren-sheet')) {
  customElements.define('ren-sheet', RenSheet);
}

/* ─── Global trigger delegation ─── */
/**
 * <button data-sheet-trigger="some-id"> opens <ren-sheet id="some-id">.
 *
 * One global listener handles every trigger on the page so consumers don't
 * need any wiring of their own. Idempotent across module re-imports.
 */
if (typeof window !== 'undefined' && !window.__renSheetTriggerWired) {
  window.__renSheetTriggerWired = true;
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-sheet-trigger]');
    if (!trigger) return;
    const targetId = trigger.getAttribute('data-sheet-trigger');
    if (!targetId) return;
    const sheet = document.getElementById(targetId);
    if (sheet && typeof sheet.show === 'function') {
      e.preventDefault();
      sheet.show();
    }
  });
}
