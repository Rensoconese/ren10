import { createAnchorLink, supportsAnchorPositioning } from '../../../utils/anchor.js';
import { computeOverlayPosition } from '../../../utils/positioning.js';

const PLACEMENTS = new Set(['top', 'right', 'bottom', 'left']);

function normalizePlacement(value, fallback = 'top') {
  return PLACEMENTS.has(value) ? value : fallback;
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
  #anchorLink = null;

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

      // Set up anchor relationship if CSS anchors are supported.
      // Unique per instance — a shared `anchor-name` resolves to the last
      // matching element in tree order, so every tooltip on the page would
      // render against the final trigger.
      this.#anchorLink?.release();
      this.#anchorLink = null;
      if (RenTooltip.supportsAnchor) {
        this.#anchorLink = createAnchorLink(this.#trigger, this, 'ren-tooltip');
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

    const { x, y, side } = computeOverlayPosition(this.#trigger, this, {
      side: placement,
      offset,
    });

    this.style.left = `${x}px`;
    this.style.top = `${y}px`;
    this.setAttribute('data-side', side);
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
    this.#anchorLink?.release();
    this.#anchorLink = null;
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
