/**
 * Fallback position computation for browsers without CSS anchor positioning.
 * Used only when CSS.supports('anchor-name', '--x') returns false.
 *
 * @param {HTMLElement} trigger - The trigger element
 * @param {HTMLElement} tooltip - The tooltip element
 * @param {string} placement - Placement: 'top', 'right', 'bottom', 'left'
 * @param {number} offset - Offset in pixels between trigger and tooltip
 * @returns {Object} Position object with x, y, and finalPlacement properties
 */
function computePosition(trigger, tooltip, placement = 'top', offset = 8) {
  const triggerRect = trigger.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const viewport = { width: window.innerWidth, height: window.innerHeight };

  let x = 0;
  let y = 0;
  let finalPlacement = placement;

  const placements = {
    top: () => {
      x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      y = triggerRect.top - tooltipRect.height - offset;
      if (y < 0) {
        finalPlacement = 'bottom';
        return placements.bottom();
      }
      return { x, y };
    },
    bottom: () => {
      x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      y = triggerRect.bottom + offset;
      if (y + tooltipRect.height > viewport.height) {
        finalPlacement = 'top';
        return placements.top();
      }
      return { x, y };
    },
    left: () => {
      x = triggerRect.left - tooltipRect.width - offset;
      y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      if (x < 0) {
        finalPlacement = 'right';
        return placements.right();
      }
      return { x, y };
    },
    right: () => {
      x = triggerRect.right + offset;
      y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      if (x + tooltipRect.width > viewport.width) {
        finalPlacement = 'left';
        return placements.left();
      }
      return { x, y };
    },
  };

  const result = placements[placement]?.() || placements.top();

  // Clamp X position within viewport
  if (result.x < 0) result.x = 8;
  else if (result.x + tooltipRect.width > viewport.width)
    result.x = viewport.width - tooltipRect.width - 8;

  return { ...result, finalPlacement };
}

/**
 * Tooltip component with CSS Anchor Positioning and native Popover API
 *
 * Lightweight tooltip that displays helpful text on hover/focus with automatic
 * viewport collision handling via CSS anchor positioning.
 *
 * @example
 * <button>Hover me
 *   <ren-tooltip placement="top" show-delay="500">Helpful text</ren-tooltip>
 * </button>
 *
 * @fires ren-open - Fired when tooltip opens
 * @fires ren-close - Fired when tooltip closes
 */
export class RenTooltip extends HTMLElement {
  static supportsAnchor = CSS.supports?.('anchor-name', '--x') ?? false;

  #trigger = null;
  #showTimeout = null;
  #hideTimeout = null;
  #touchTimer = null;

  connectedCallback() {
    this.setupTooltip();
    this.findTrigger();
    this.attachTriggerListeners();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  /**
   * Setup tooltip element with required attributes and structure
   * @private
   */
  setupTooltip() {
    this.classList.add('ren-tooltip');

    // Add arrow if not present
    if (!this.querySelector('.ren-tooltip-arrow')) {
      const arrow = document.createElement('div');
      arrow.className = 'ren-tooltip-arrow';
      this.appendChild(arrow);
    }

    // Set accessibility attributes
    this.setAttribute('role', 'tooltip');
    this.id = this.id || `ren-tooltip-${Math.random().toString(36).substr(2, 9)}`;

    // Setup native Popover API with manual mode
    if ('popover' in HTMLElement.prototype) {
      this.setAttribute('popover', 'manual');
    }
  }

  /**
   * Find the trigger element (parent that contains the tooltip)
   * @private
   */
  findTrigger() {
    this.#trigger = this.parentElement;

    if (this.#trigger) {
      // Wire aria-describedby relationship
      if (!this.#trigger.hasAttribute('aria-describedby')) {
        this.#trigger.setAttribute('aria-describedby', this.id);
      }

      // Set up anchor relationship if CSS anchors are supported
      if (RenTooltip.supportsAnchor) {
        this.#trigger.style.anchorName = '--tooltip-anchor';
      } else {
        // Fallback: ensure trigger can be positioned relative to
        if (getComputedStyle(this.#trigger).position === 'static') {
          this.#trigger.style.position = 'relative';
        }
      }
    }
  }

  /**
   * Attach event listeners to trigger
   * @private
   */
  attachTriggerListeners() {
    if (!this.#trigger) return;

    // Mouse events
    this.#trigger.addEventListener('mouseenter', () => this.scheduleShow());
    this.#trigger.addEventListener('mouseleave', () => this.scheduleHide());

    // Focus events (use capture for better timing)
    this.#trigger.addEventListener('focus', () => this.scheduleShow(), true);
    this.#trigger.addEventListener('blur', () => this.scheduleHide(), true);

    // Touch events for long-press detection
    this.#trigger.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    this.#trigger.addEventListener('touchend', (e) => this.handleTouchEnd(e));
  }

  /**
   * Handle touch start (long press detection)
   * @private
   */
  handleTouchStart(e) {
    this.#touchTimer = setTimeout(() => {
      this.show();
    }, 500);
  }

  /**
   * Handle touch end
   * @private
   */
  handleTouchEnd(e) {
    if (this.#touchTimer) {
      clearTimeout(this.#touchTimer);
      this.#touchTimer = null;
    }

    if (this.isOpen()) {
      this.hide();
    }
  }

  /**
   * Schedule tooltip show with delay
   * @private
   */
  scheduleShow() {
    this.clearTimeouts();

    const delay = parseInt(this.getAttribute('show-delay')) || 500;
    this.#showTimeout = setTimeout(() => {
      this.show();
    }, delay);
  }

  /**
   * Schedule tooltip hide with delay
   * @private
   */
  scheduleHide() {
    this.clearTimeouts();

    const delay = parseInt(this.getAttribute('hide-delay')) || 0;
    this.#hideTimeout = setTimeout(() => {
      this.hide();
    }, delay);
  }

  /**
   * Clear all pending timeouts
   * @private
   */
  clearTimeouts() {
    if (this.#showTimeout) clearTimeout(this.#showTimeout);
    if (this.#hideTimeout) clearTimeout(this.#hideTimeout);
    if (this.#touchTimer) clearTimeout(this.#touchTimer);

    this.#showTimeout = null;
    this.#hideTimeout = null;
    this.#touchTimer = null;
  }

  /**
   * Position the tooltip relative to trigger (fallback for non-anchor browsers)
   * @private
   */
  positionTooltip() {
    if (!this.#trigger || RenTooltip.supportsAnchor) return;

    const placement = this.getAttribute('placement') || 'top';
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
   * Show the tooltip
   */
  show() {
    if (this.isOpen()) return;

    this.clearTimeouts();
    this.positionTooltip();
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

    this.dispatchEvent(new CustomEvent('ren-open', { bubbles: true }));
  }

  /**
   * Hide the tooltip
   */
  hide() {
    if (!this.isOpen()) return;

    this.clearTimeouts();
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

    this.dispatchEvent(new CustomEvent('ren-close', { bubbles: true }));
  }

  /**
   * Check if tooltip is currently open
   * @returns {boolean}
   */
  isOpen() {
    if ('popover' in HTMLElement.prototype) {
      return this.matches(':popover-open');
    }
    return this.classList.contains('ren-open');
  }

  /**
   * Cleanup event listeners and timeouts
   * @private
   */
  cleanup() {
    this.clearTimeouts();

    if (this.#trigger) {
      this.#trigger.removeEventListener('mouseenter', () => this.scheduleShow());
      this.#trigger.removeEventListener('mouseleave', () => this.scheduleHide());
      this.#trigger.removeEventListener('focus', () => this.scheduleShow());
      this.#trigger.removeEventListener('blur', () => this.scheduleHide());
      this.#trigger.removeEventListener('touchstart', (e) => this.handleTouchStart(e));
      this.#trigger.removeEventListener('touchend', (e) => this.handleTouchEnd(e));
    }
  }

  /**
   * Get the trigger element
   * @returns {HTMLElement|null}
   */
  getTrigger() {
    return this.#trigger;
  }
}

if (!customElements.get('ren-tooltip')) {
  customElements.define('ren-tooltip', RenTooltip);
}
