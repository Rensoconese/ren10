/**
 * RenDS — Focus Trap
 * ==================
 * Traps keyboard focus within a container element.
 * Essential for modals, dialogs, and overlays.
 *
 * Based on patterns from Radix UI focus-scope and
 * React Aria's FocusScope.
 *
 * Features:
 * - Traps Tab / Shift+Tab within container
 * - Auto-focuses first focusable element (or specified)
 * - Restores focus to trigger element on deactivation
 * - Handles dynamic content (MutationObserver)
 * - Supports nested traps (stack-based)
 *
 * Usage:
 *   import { createFocusTrap } from './focus-trap.js';
 *
 *   const trap = createFocusTrap(dialogElement, {
 *     initialFocus: '#first-input',  // selector or element
 *     returnFocus: triggerButton,     // where to return focus
 *     escapeDeactivates: true,        // Escape key deactivates
 *     onDeactivate: () => closeDialog()
 *   });
 *
 *   trap.activate();
 *   // ... later
 *   trap.deactivate();
 */

// ─── Focusable Elements Selector ───
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled]):not([aria-hidden="true"])',
  'input:not([disabled]):not([type="hidden"]):not([aria-hidden="true"])',
  'select:not([disabled]):not([aria-hidden="true"])',
  'textarea:not([disabled]):not([aria-hidden="true"])',
  '[tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-hidden="true"])',
  '[contenteditable]:not([contenteditable="false"])',
  'details > summary:first-of-type',
  'audio[controls]',
  'video[controls]',
].join(', ');

// ─── Trap Stack (for nested traps) ───
const trapStack = [];

/**
 * Get all focusable elements within a container.
 * Filters out elements that are not visible.
 */
function getFocusableElements(container) {
  const elements = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
  return elements.filter((el) => {
    // Skip elements with display:none or visibility:hidden
    if (el.offsetParent === null && el.tagName !== 'BODY') return false;
    // Skip elements with aria-hidden on ancestors
    if (el.closest('[aria-hidden="true"]')) return false;
    return true;
  });
}

/**
 * Create a focus trap for a container element.
 *
 * @param {HTMLElement} container - The element to trap focus within
 * @param {Object} options
 * @param {string|HTMLElement|null} options.initialFocus - Element or selector to focus on activate
 * @param {HTMLElement|null} options.returnFocus - Element to focus on deactivate
 * @param {boolean} options.escapeDeactivates - Whether Escape key deactivates trap (default: false)
 * @param {Function|null} options.onDeactivate - Callback when trap is deactivated
 * @param {boolean} options.autoFocus - Whether to auto-focus first element (default: true)
 * @returns {Object} Trap controller with activate/deactivate methods
 */
export function createFocusTrap(container, options = {}) {
  const {
    initialFocus = null,
    returnFocus = null,
    escapeDeactivates = false,
    onDeactivate = null,
    autoFocus = true,
  } = options;

  let active = false;
  let previouslyFocused = null;
  let observer = null;

  // ─── Event Handlers ───

  function handleKeyDown(event) {
    if (!active) return;

    // Escape key
    if (event.key === 'Escape' && escapeDeactivates) {
      event.preventDefault();
      deactivate();
      onDeactivate?.();
      return;
    }

    // Tab key — trap focus
    if (event.key === 'Tab') {
      const focusable = getFocusableElements(container);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const firstFocusable = focusable[0];
      const lastFocusable = focusable[focusable.length - 1];
      const activeEl = document.activeElement;

      if (event.shiftKey) {
        // Shift+Tab: if on first element, go to last
        if (activeEl === firstFocusable || !container.contains(activeEl)) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab: if on last element, go to first
        if (activeEl === lastFocusable || !container.contains(activeEl)) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  }

  // Prevent focus from leaving the container
  function handleFocusIn(event) {
    if (!active) return;

    // If focus moved outside the container, bring it back
    if (!container.contains(event.target)) {
      const focusable = getFocusableElements(container);
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }
  }

  // ─── Activate ───

  function activate() {
    if (active) return;
    active = true;

    // Save currently focused element for later restoration
    previouslyFocused = returnFocus || document.activeElement;

    // Push to stack
    trapStack.push({ container, deactivate });

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('focusin', handleFocusIn, true);

    // Focus initial element
    if (autoFocus) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (!active) return;

        let target = null;

        if (initialFocus) {
          target =
            typeof initialFocus === 'string'
              ? container.querySelector(initialFocus)
              : initialFocus;
        }

        if (!target) {
          // Try to find first focusable element
          const focusable = getFocusableElements(container);
          target = focusable[0] || container;
        }

        // Make container focusable as fallback
        if (target === container && !container.hasAttribute('tabindex')) {
          container.setAttribute('tabindex', '-1');
          container._addedTabindex = true;
        }

        target.focus();
      });
    }

    // Watch for dynamic content changes
    observer = new MutationObserver(() => {
      // Content changed, verify focus is still inside
      if (active && !container.contains(document.activeElement)) {
        const focusable = getFocusableElements(container);
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'tabindex', 'aria-hidden'],
    });
  }

  // ─── Deactivate ───

  function deactivate() {
    if (!active) return;
    active = false;

    // Remove event listeners
    document.removeEventListener('keydown', handleKeyDown, true);
    document.removeEventListener('focusin', handleFocusIn, true);

    // Disconnect observer
    observer?.disconnect();
    observer = null;

    // Remove from stack
    const index = trapStack.findIndex((t) => t.container === container);
    if (index !== -1) trapStack.splice(index, 1);

    // Clean up tabindex if we added it
    if (container._addedTabindex) {
      container.removeAttribute('tabindex');
      delete container._addedTabindex;
    }

    // Restore focus
    if (previouslyFocused && previouslyFocused.focus) {
      // Use requestAnimationFrame to avoid focus race conditions
      requestAnimationFrame(() => {
        previouslyFocused.focus();
        previouslyFocused = null;
      });
    }
  }

  // ─── Public API ───

  return {
    activate,
    deactivate,

    /** Whether the trap is currently active */
    get isActive() {
      return active;
    },

    /** Update options dynamically */
    updateOptions(newOptions) {
      Object.assign(options, newOptions);
    },
  };
}

/**
 * Get the currently active focus trap (top of stack).
 * Useful for nested trap coordination.
 */
export function getActiveTrap() {
  return trapStack.length > 0 ? trapStack[trapStack.length - 1] : null;
}

/**
 * Utility: check if an element is focusable.
 */
export function isFocusable(element) {
  return element.matches(FOCUSABLE_SELECTOR) && element.offsetParent !== null;
}

/**
 * Utility: get first focusable element in container.
 */
export function getFirstFocusable(container) {
  const elements = getFocusableElements(container);
  return elements[0] || null;
}

/**
 * Utility: get last focusable element in container.
 */
export function getLastFocusable(container) {
  const elements = getFocusableElements(container);
  return elements[elements.length - 1] || null;
}

export { FOCUSABLE_SELECTOR, getFocusableElements };
