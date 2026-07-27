const PLACEMENTS = new Set(['top', 'right', 'bottom', 'left']);

function supportsAnchorPositioning() {
  return (
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('anchor-name', '--ren-anchor') &&
    CSS.supports('position-anchor', '--ren-anchor') &&
    CSS.supports('position-area', 'top span-all')
  );
}

function normalizePlacement(value, fallback = 'top') {
  return PLACEMENTS.has(value) ? value : fallback;
}

/**
 * Fallback position computation for browsers without CSS anchor positioning.
 * Used only when full CSS anchor positioning support is unavailable.
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
  static observedAttributes = ['placement'];
  static supportsAnchor = supportsAnchorPositioning();

  #trigger = null;
  #showTimeout = null;
  #hideTimeout = null;
  #touchTimer = null;
  #listenerController = null;

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'placement' && oldValue !== newValue) {
      this.#syncPlacement();
    }
  }

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

    this.#syncPlacement();
  }

  /**
   * Find the trigger element (parent that contains the tooltip)
   * @private
   */
  findTrigger() {
    this.#trigger = this.parentElement;

    if (this.#trigger) {
      // Wire aria-describedby relationship
      const describedBy = new Set(
        (this.#trigger.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean)
      );
      describedBy.add(this.id);
      this.#trigger.setAttribute('aria-describedby', [...describedBy].join(' '));

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

    this.#listenerController?.abort();
    this.#listenerController = new AbortController();
    const { signal } = this.#listenerController;

    // Mouse events
    this.#trigger.addEventListener('mouseenter', () => this.scheduleShow(), { signal });
    this.#trigger.addEventListener('mouseleave', () => this.scheduleHide(), { signal });

    // Focus events (use capture for better timing)
    this.#trigger.addEventListener('focus', () => this.scheduleShow(), { capture: true, signal });
    this.#trigger.addEventListener('blur', () => this.scheduleHide(), { capture: true, signal });

    // Touch events for long-press detection
    this.#trigger.addEventListener('touchstart', (e) => this.handleTouchStart(e), { signal });
    this.#trigger.addEventListener('touchend', (e) => this.handleTouchEnd(e), { signal });
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

    // Reduced-motion users should not wait through an animation-oriented
    // reveal delay; the tooltip remains available on focus/hover.
    if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.show();
      return;
    }

    const tokenDelay = getComputedStyle(this).getPropertyValue('--ren-tooltip-delay').trim();
    const attrDelay = this.getAttribute('show-delay');
    const parsedAttrDelay = attrDelay == null ? Number.NaN : parseInt(attrDelay, 10);
    const parsedTokenDelay = parseInt(tokenDelay, 10);
    const delay = Number.isFinite(parsedAttrDelay)
      ? parsedAttrDelay
      : Number.isFinite(parsedTokenDelay)
        ? parsedTokenDelay
        : 500;
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

    const placement = normalizePlacement(this.getAttribute('placement'), 'top');
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

  #syncPlacement() {
    const placement = normalizePlacement(this.getAttribute('placement'), 'top');
    this.setAttribute('data-side', placement);
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
      } catch {
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
      } catch {
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
    this.#listenerController?.abort();
    this.#listenerController = null;
    if (this.#trigger) {
      const describedBy = (this.#trigger.getAttribute('aria-describedby') || '')
        .split(/\s+/)
        .filter((token) => token && token !== this.id);
      if (describedBy.length > 0) {
        this.#trigger.setAttribute('aria-describedby', describedBy.join(' '));
      } else {
        this.#trigger.removeAttribute('aria-describedby');
      }
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
