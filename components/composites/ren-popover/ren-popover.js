/**
 * Fallback position computation for browsers without CSS anchor positioning.
 * Used only when CSS.supports('anchor-name', '--x') returns false.
 *
 * @param {HTMLElement} trigger - The trigger element
 * @param {HTMLElement} popover - The popover element
 * @param {string} placement - Placement: 'top', 'right', 'bottom', 'left'
 * @param {number} offset - Offset in pixels between trigger and popover
 * @returns {Object} Position object with x, y, and finalPlacement properties
 */
function computePosition(trigger, popover, placement = 'bottom', offset = 8) {
  const triggerRect = trigger.getBoundingClientRect();
  const popoverRect = popover.getBoundingClientRect();
  const viewport = { width: window.innerWidth, height: window.innerHeight };

  let x = 0;
  let y = 0;
  let finalPlacement = placement;

  const placements = {
    top: () => {
      x = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
      y = triggerRect.top - popoverRect.height - offset;
      if (y < 0) {
        finalPlacement = 'bottom';
        return placements.bottom();
      }
      return { x, y };
    },
    bottom: () => {
      x = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
      y = triggerRect.bottom + offset;
      if (y + popoverRect.height > viewport.height) {
        finalPlacement = 'top';
        return placements.top();
      }
      return { x, y };
    },
    left: () => {
      x = triggerRect.left - popoverRect.width - offset;
      y = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
      if (x < 0) {
        finalPlacement = 'right';
        return placements.right();
      }
      return { x, y };
    },
    right: () => {
      x = triggerRect.right + offset;
      y = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
      if (x + popoverRect.width > viewport.width) {
        finalPlacement = 'left';
        return placements.left();
      }
      return { x, y };
    },
  };

  const result = placements[placement]?.() || placements.bottom();

  // Clamp X position within viewport
  if (result.x < 0) result.x = 8;
  else if (result.x + popoverRect.width > viewport.width)
    result.x = viewport.width - popoverRect.width - 8;

  return { ...result, finalPlacement };
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
  static supportsAnchor = CSS.supports?.('anchor-name', '--x') ?? false;

  #trigger = null;
  #dismissController = null;

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

    // Set up anchor relationship if CSS anchors are supported
    if (RenPopover.supportsAnchor) {
      this.#trigger.style.anchorName = '--popover-anchor';
    } else {
      // Fallback: ensure trigger can be positioned relative to
      if (getComputedStyle(this.#trigger.parentElement).position === 'static') {
        this.#trigger.parentElement.style.position = 'relative';
      }
    }

    // Wire up popovertarget if not already set
    if (!this.#trigger.hasAttribute('popovertarget')) {
      this.#trigger.setAttribute('popovertarget', '');
    }

    // Click handler
    this.#trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // Setup dismiss behavior (click outside, Escape key)
    this.#dismissController?.abort();
    this.#dismissController = new AbortController();

    document.addEventListener(
      'click',
      (e) => {
        if (
          this.isOpen() &&
          e.target !== this &&
          !this.contains(e.target) &&
          e.target !== this.#trigger &&
          !this.#trigger?.contains(e.target)
        ) {
          this.close();
        }
      },
      { signal: this.#dismissController.signal }
    );

    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape' && this.isOpen()) {
          this.close();
        }
      },
      { signal: this.#dismissController.signal }
    );
  }

  /**
   * Position popover relative to trigger (fallback for non-anchor browsers)
   * @private
   */
  positionPopover() {
    if (!this.#trigger || RenPopover.supportsAnchor) return;

    const placement = this.getAttribute('placement') || 'bottom';
    const offset = parseInt(this.getAttribute('offset')) || 8;

    const { x, y, finalPlacement } = computePosition(
      this.#trigger,
      this,
      placement,
      offset
    );

    this.style.left = `${x}px`;
    this.style.top = `${y}px`;
    this.setAttribute('data-side', finalPlacement);
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
      } catch (e) {
        // Already open or other error
      }
    } else {
      this.classList.add('ren-open');
    }

    this.setAttribute('aria-modal', 'true');
    this.dispatchEvent(new CustomEvent('ren-open', { bubbles: true }));
  }

  /**
   * Close the popover
   */
  close() {
    if (!this.isOpen()) return;

    this.setAttribute('data-state', 'closed');

    if ('popover' in HTMLElement.prototype) {
      try {
        this.hidePopover();
      } catch (e) {
        // Already closed or other error
      }
    } else {
      this.classList.remove('ren-open');
    }

    this.setAttribute('aria-modal', 'false');
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
    if (this.#dismissController) {
      this.#dismissController.abort();
    }
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
