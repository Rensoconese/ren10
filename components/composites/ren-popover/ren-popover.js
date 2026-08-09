import { createAnchorLink, supportsAnchorPositioning } from '../../../utils/anchor.js';
import { computeOverlayPosition } from '../../../utils/positioning.js';
import { createDismissable } from '../../../utils/dismissable.js';
import { FOCUSABLE_SELECTOR } from '../../../utils/focus-trap.js';

let nextPopoverId = 0;
const PLACEMENTS = new Set(['top', 'right', 'bottom', 'left']);

function normalizePlacement(value, fallback = 'bottom') {
  return PLACEMENTS.has(value) ? value : fallback;
}

/**
 * Popover component with CSS Anchor Positioning and native Popover API
 *
 * Displays content relative to a trigger element with automatic viewport collision
 * handling via CSS anchor positioning. Falls back to JS positioning in unsupported browsers.
 *
 * @example
 * <button data-popover-trigger>Open Popover</button>
 * <ren-popover placement="bottom" offset="8">
 *   <div class="ren-popover-header">Title</div>
 *   <div class="ren-popover-body">Content</div>
 * </ren-popover>
 *
 * @fires ren-open - Fired when popover opens
 * @fires ren-close - Fired when popover closes
 */
export class RenPopover extends HTMLElement {
  static observedAttributes = ['placement'];
  static supportsAnchor = supportsAnchorPositioning();

  #trigger = null;
  #triggerController = null;
  #anchorLink = null;
  #dismissLayer = null;

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'placement' && oldValue !== newValue) {
      this.#syncPlacement();
    }
  }

  connectedCallback() {
    this.setupPopover();
    this.findTrigger();
    this.attachTriggerListener();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  /**
   * Setup popover element with required attributes
   * @private
   */
  setupPopover() {
    this.classList.add('ren-popover');

    if (!this.id) {
      this.id = `ren-popover-${++nextPopoverId}`;
    }

    // Add arrow if not present
    if (!this.querySelector('.ren-popover-arrow')) {
      const arrow = document.createElement('div');
      arrow.className = 'ren-popover-arrow';
      this.appendChild(arrow);
    }

    // Setup native Popover API
    if ('popover' in HTMLElement.prototype) {
      this.setAttribute('popover', 'manual');
    }

    // Set accessibility attributes
    this.setAttribute('role', 'dialog');
    this.setAttribute('aria-modal', 'false');
    this.#syncPlacement();
  }

  /**
   * Find the trigger element
   * @private
   */
  findTrigger() {
    // Explicit trigger ID
    const triggerId = this.getAttribute('trigger-id');
    if (triggerId) {
      this.#trigger = document.getElementById(triggerId);
    }

    // Query selector for data-popover-trigger
    if (!this.#trigger) {
      this.#trigger = this.querySelector('[data-popover-trigger]');
    }

    // Fall back to previous sibling
    if (!this.#trigger) {
      this.#trigger = this.previousElementSibling;
    }
  }

  /**
   * Attach trigger listener and setup anchor relationship
   * @private
   */
  attachTriggerListener() {
    if (!this.#trigger) return;

    this.#triggerController?.abort();
    this.#triggerController = new AbortController();

    // Set up anchor relationship if CSS anchors are supported.
    // The name is unique per instance: a shared `anchor-name` resolves to the
    // last matching element in tree order, which would position every popover
    // on the page against the final trigger.
    this.#anchorLink?.release();
    this.#anchorLink = null;
    if (RenPopover.supportsAnchor) {
      this.#anchorLink = createAnchorLink(this.#trigger, this, 'ren-popover');
    } else {
      // Fallback: ensure trigger can be positioned relative to
      if (getComputedStyle(this.#trigger.parentElement).position === 'static') {
        this.#trigger.parentElement.style.position = 'relative';
      }
    }

    // Wire up popovertarget if not already set
    if (!this.#trigger.hasAttribute('popovertarget')) {
      this.#trigger.setAttribute('popovertarget', this.id);
    }
    this.#trigger.setAttribute('aria-haspopup', 'dialog');
    this.#trigger.setAttribute('aria-controls', this.id);
    this.#trigger.setAttribute('aria-expanded', this.isOpen() ? 'true' : 'false');

    // Click handler
    this.#trigger.addEventListener(
      'click',
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();
      },
      { signal: this.#triggerController.signal }
    );

    // Dismiss behavior (click outside, Escape) runs through the shared layer
    // stack so nested/sibling overlays dismiss innermost-first instead of all
    // reacting to the same document-level event.
    this.#dismissLayer?.deactivate();
    this.#dismissLayer = createDismissable(this, {
      triggerElement: this.#trigger,
      onDismiss: () => this.close(),
    });
  }

  /**
   * Position popover relative to trigger (fallback for non-anchor browsers)
   * @private
   */
  positionPopover() {
    if (!this.#trigger || RenPopover.supportsAnchor) return;

    const placement = normalizePlacement(this.getAttribute('placement'), 'bottom');
    const offset = parseInt(this.getAttribute('offset')) || 8;

    const { x, y, side } = computeOverlayPosition(this.#trigger, this, {
      side: placement,
      offset,
    });

    this.style.left = `${x}px`;
    this.style.top = `${y}px`;
    this.setAttribute('data-side', side);
  }

  #syncPlacement() {
    const placement = normalizePlacement(this.getAttribute('placement'), 'bottom');
    this.setAttribute('data-side', placement);
  }

  /**
   * Open the popover
   */
  open() {
    if (this.isOpen()) return;

    this.positionPopover();
    this.setAttribute('data-state', 'open');

    if ('popover' in HTMLElement.prototype) {
      try {
        this.showPopover();
      } catch {
        // Already open or other error
      }
    } else {
      this.classList.add('ren-open');
    }

    // Popover is explicitly non-modal (see component.md).
    // No aria-modal or focus trap — those are for ren-dialog / ren-sheet.
    this.setAttribute('aria-modal', 'false');
    this.#trigger?.setAttribute('aria-expanded', 'true');
    this.#dismissLayer?.activate();
    // Note: no focus trap for non-modal popover.
    requestAnimationFrame(() => this.#focusInitialElement());
    this.dispatchEvent(new CustomEvent('ren-open', { bubbles: true }));
  }

  /**
   * Close the popover
   */
  close() {
    if (!this.isOpen()) return;

    const activeElement = document.activeElement;
    const shouldRestoreFocus =
      this.#trigger &&
      activeElement instanceof HTMLElement &&
      this.contains(activeElement);

    this.setAttribute('data-state', 'closed');

    if ('popover' in HTMLElement.prototype) {
      try {
        this.hidePopover();
      } catch {
        // Already closed or other error
      }
    } else {
      this.classList.remove('ren-open');
    }

    this.setAttribute('aria-modal', 'false');
    this.#trigger?.setAttribute('aria-expanded', 'false');
    this.#dismissLayer?.deactivate();
    if (shouldRestoreFocus) {
      this.#trigger.focus({ preventScroll: true });
    }
    this.dispatchEvent(new CustomEvent('ren-close', { bubbles: true }));
  }

  /**
   * Toggle popover open/closed state
   */
  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Check if popover is currently open
   * @returns {boolean}
   */
  isOpen() {
    if ('popover' in HTMLElement.prototype) {
      return this.matches(':popover-open');
    }
    return this.classList.contains('ren-open');
  }

  /**
   * Cleanup event listeners
   * @private
   */
  cleanup() {
    this.#triggerController?.abort();
    this.#triggerController = null;
    this.#dismissLayer?.deactivate();
    this.#dismissLayer = null;
    this.#anchorLink?.release();
    this.#anchorLink = null;
  }

  #focusInitialElement() {
    const target = this.querySelector(FOCUSABLE_SELECTOR) || this;
    if (target === this && !this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '-1');
    }
    target.focus({ preventScroll: true });
  }

  /**
   * Get the trigger element
   * @returns {HTMLElement|null}
   */
  getTrigger() {
    return this.#trigger;
  }

  /**
   * Set the trigger element
   * @param {HTMLElement} trigger
   */
  setTrigger(trigger) {
    this.#trigger = trigger;
    this.attachTriggerListener();
  }
}

if (!customElements.get('ren-popover')) {
  customElements.define('ren-popover', RenPopover);
}
