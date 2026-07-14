/**
 * RenDS — <ren-menu> Web Component
 * ==================================
 * Dropdown menu component with keyboard navigation, accessibility, and theming.
 * Supports items, groups, separators, checkboxes, and radio items.
 *
 * Uses Light DOM — no Shadow DOM.
 * Native Popover API when available, falls back to class-based positioning.
 *
 * Attributes:
 *   placement:     'bottom-start' (default) | 'bottom-end' | 'top-start' | 'top-end'
 *                  | 'right-start' | 'right-end' | 'left-start' | 'left-end'
 *                  - Controls menu position relative to trigger
 *
 * Markup:
 *   <button data-menu-trigger id="menu-trigger">Menu</button>
 *   <ren-menu trigger-id="menu-trigger" placement="bottom-start">
 *     <button class="ren-menu-item" role="menuitem">Option 1</button>
 *     <button class="ren-menu-item" role="menuitem" data-value="opt2">Option 2</button>
 *     <div class="ren-menu-separator"></div>
 *     <button class="ren-menu-item ren-menu-item-danger" role="menuitem">Delete</button>
 *   </ren-menu>
 *
 * Features:
 *   - Arrow key navigation (vertical)
 *   - Home/End to first/last item
 *   - Enter/Space to select
 *   - Typeahead search
 *   - Click outside to close
 *   - Escape key to close
 *   - Focus management
 *   - Checkbox and radio item support
 *
 * Events:
 *   ren-menu-select:  Dispatched when an item is selected
 *   - detail: { item, value }
 *   ren-menu-open:    Dispatched when menu opens
 *   ren-menu-close:   Dispatched when menu closes
 */

import { createKeyboardNav } from '../../../utils/keyboard-nav.js';
import { createDismissable } from '../../../utils/dismissable.js';

const MENU_SIDES = new Set(['top', 'right', 'bottom', 'left']);
const MENU_ALIGNS = new Set(['start', 'end']);

function normalizeMenuPlacement(value) {
  const [sideValue, alignValue] = String(value || 'bottom-start')
    .toLowerCase()
    .split('-');
  const side = MENU_SIDES.has(sideValue) ? sideValue : 'bottom';
  const align = MENU_ALIGNS.has(alignValue) ? alignValue : 'start';

  return { side, align };
}

export class RenMenu extends HTMLElement {
  static observedAttributes = ['placement'];

  #trigger = null;
  #isOpen = false;
  #keyboardNav = null;
  #dismissable = null;
  #animationFrame = null;
  #boundItemClick = null;
  #boundTriggerClick = null;
  #boundTriggerKeydown = null;
  #returnFocus = true;
  #closeTimer = null;

  constructor() {
    super();
  }

  /**
   * Lifecycle: Element inserted into DOM
   */
  connectedCallback() {
    this.loadStyles();
    this.setupMenu();
    this.findTrigger();
    this.attachTriggerListeners();
    this.attachItemListeners();
  }

  /**
   * Lifecycle: Element removed from DOM
   */
  disconnectedCallback() {
    this.cleanup();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'placement' && oldValue !== newValue) {
      this.syncPlacement();
      if (this.#isOpen) {
        this.positionMenu();
      }
    }
  }

  /* ═══ INITIALIZATION ═══ */

  /**
   * Load component styles
   * @private
   */
  loadStyles() {
    if (!document.getElementById('ren-menu-styles')) {
      const style = document.createElement('style');
      style.id = 'ren-menu-styles';
      style.textContent = this.constructor.styles || '';
      document.head.appendChild(style);
    }
  }

  /**
   * Setup menu element with required attributes and structure
   * @private
   */
  setupMenu() {
    this.classList.add('ren-menu');

    // Set accessibility attributes
    this.setAttribute('role', 'menu');
    this.id = this.id || `ren-menu-${Math.random().toString(36).substr(2, 9)}`;

    // Check for native Popover API support
    if ('popover' in HTMLElement.prototype) {
      this.setAttribute('popover', 'manual');
    }

    this.syncPlacement();

    // Ensure all items have correct roles if not already set
    this.querySelectorAll(
      '.ren-menu-item, .ren-menu-checkbox-item, .ren-menu-radio-item, [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]'
    ).forEach((item) => {
      if (!item.hasAttribute('role')) {
        if (item.classList.contains('ren-menu-checkbox-item')) {
          item.setAttribute('role', 'menuitemcheckbox');
        } else if (item.classList.contains('ren-menu-radio-item')) {
          item.setAttribute('role', 'menuitemradio');
        } else {
          item.setAttribute('role', 'menuitem');
        }
      }

      if (!item.hasAttribute('tabindex')) {
        item.setAttribute('tabindex', '-1');
      }
    });
  }

  /**
   * Find the trigger element
   * Searches for: trigger-id attribute, data-menu-trigger, or previous sibling
   * @private
   */
  findTrigger() {
    const triggerId = this.getAttribute('trigger-id');
    if (triggerId) {
      this.#trigger = document.getElementById(triggerId);
    }

    if (!this.#trigger) {
      this.#trigger = document.querySelector('[data-menu-trigger]');
    }

    if (!this.#trigger) {
      this.#trigger = this.previousElementSibling;
    }

    if (this.#trigger) {
      this.#trigger.setAttribute('aria-haspopup', 'menu');
      this.#trigger.setAttribute('aria-controls', this.id);
    }
  }

  /**
   * Attach event listeners to trigger element
   * @private
   */
  attachTriggerListeners() {
    if (!this.#trigger) return;
    this.#boundTriggerClick = (e) => this.handleTriggerClick(e);
    this.#boundTriggerKeydown = (e) => this.handleTriggerKeydown(e);
    this.#trigger.addEventListener('click', this.#boundTriggerClick);
    this.#trigger.addEventListener('keydown', this.#boundTriggerKeydown);
  }

  /**
   * Attach delegated item listeners
   * @private
   */
  attachItemListeners() {
    this.#boundItemClick = this.#boundItemClick || ((e) => this.handleItemClick(e));
    this.removeEventListener('click', this.#boundItemClick);
    this.addEventListener('click', this.#boundItemClick);
  }

  /* ═══ TRIGGER HANDLING ═══ */

  /**
   * Handle trigger click to open menu
   * @private
   */
  handleTriggerClick(e) {
    e.preventDefault();
    if (this.#isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Handle trigger keydown (arrow down to open)
   * @private
   */
  handleTriggerKeydown(e) {
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !this.#isOpen) {
      e.preventDefault();
      this.open();
    }
  }

  /**
   * Handle item click selection
   * @private
   */
  handleItemClick(e) {
    const item = e.target.closest('[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]');

    if (!item || !this.contains(item) || item.getAttribute('aria-disabled') === 'true') {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    this.handleItemSelect(item);
  }

  /* ═══ POSITIONING ═══ */

  /**
   * Mirror preferred placement to public data attributes.
   */
  syncPlacement() {
    const { side, align } = normalizeMenuPlacement(this.getAttribute('placement'));

    this.setAttribute('data-side', side);
    this.setAttribute('data-align', align);
  }

  /**
   * Position the menu relative to trigger element
   * @private
   */
  positionMenu() {
    if (!this.#trigger) return;

    const placement = normalizeMenuPlacement(this.getAttribute('placement'));
    const triggerRect = this.#trigger.getBoundingClientRect();
    const menuRect = this.getBoundingClientRect();
    const gap = 8;
    const margin = 8;

    let finalSide = placement.side;
    let left = triggerRect.left;
    let top = triggerRect.bottom + gap;

    if (placement.align === 'end') {
      left = triggerRect.right - menuRect.width;
    }

    if (placement.side === 'top') {
      top = triggerRect.top - menuRect.height - gap;
    } else if (placement.side === 'right') {
      left = triggerRect.right + gap;
      top = placement.align === 'end'
        ? triggerRect.bottom - menuRect.height
        : triggerRect.top;
    } else if (placement.side === 'left') {
      left = triggerRect.left - menuRect.width - gap;
      top = placement.align === 'end'
        ? triggerRect.bottom - menuRect.height
        : triggerRect.top;
    }

    // Viewport collision detection
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    if (
      placement.side === 'bottom' &&
      top + menuRect.height > viewport.height - margin &&
      triggerRect.top - menuRect.height - gap >= margin
    ) {
      finalSide = 'top';
      top = triggerRect.top - menuRect.height - gap;
    } else if (
      placement.side === 'top' &&
      top < margin &&
      triggerRect.bottom + menuRect.height + gap <= viewport.height - margin
    ) {
      finalSide = 'bottom';
      top = triggerRect.bottom + gap;
    } else if (
      placement.side === 'right' &&
      left + menuRect.width > viewport.width - margin &&
      triggerRect.left - menuRect.width - gap >= margin
    ) {
      finalSide = 'left';
      left = triggerRect.left - menuRect.width - gap;
    } else if (
      placement.side === 'left' &&
      left < margin &&
      triggerRect.right + menuRect.width + gap <= viewport.width - margin
    ) {
      finalSide = 'right';
      left = triggerRect.right + gap;
    }

    // Clamp horizontal and vertical position to viewport.
    if (left < margin) {
      left = margin;
    } else if (left + menuRect.width > viewport.width - margin) {
      left = viewport.width - menuRect.width - margin;
    }

    if (top < margin) {
      top = margin;
    } else if (top + menuRect.height > viewport.height - margin) {
      top = viewport.height - menuRect.height - margin;
    }

    this.setAttribute('data-side', finalSide);
    this.setAttribute('data-align', placement.align);
    this.style.left = `${left}px`;
    this.style.top = `${top}px`;
  }

  /* ═══ KEYBOARD NAVIGATION ═══ */

  /**
   * Setup keyboard navigation for menu items
   * @private
   */
  setupKeyboardNav() {
    if (this.#keyboardNav) {
      this.#keyboardNav.detach();
    }

    this.#keyboardNav = createKeyboardNav(this, {
      selector: '[role="menuitem"]:not([aria-disabled="true"]), [role="menuitemcheckbox"]:not([aria-disabled="true"]), [role="menuitemradio"]:not([aria-disabled="true"])',
      orientation: 'vertical',
      loop: true,
      typeahead: true,
      focusOnHover: true,
      onActivate: (item) => {
        item.focus();
      },
      onSelect: (item) => {
        this.handleItemSelect(item);
      },
    });

    this.#keyboardNav.attach();
  }

  /**
   * Teardown keyboard navigation
   * @private
   */
  teardownKeyboardNav() {
    if (this.#keyboardNav) {
      this.#keyboardNav.detach();
      this.#keyboardNav = null;
    }
  }

  /* ═══ DISMISSABLE LAYER ═══ */

  /**
   * Setup dismissable layer (click-outside, Escape key)
   * @private
   */
  setupDismissable() {
    if (this.#dismissable) {
      this.#dismissable.deactivate();
    }

    this.#dismissable = createDismissable(this, {
      onDismiss: () => this.close(),
      triggerElement: this.#trigger,
      escapeKey: true,
      clickOutside: true,
    });

    this.#dismissable.activate();
  }

  /**
   * Teardown dismissable layer
   * @private
   */
  teardownDismissable() {
    if (this.#dismissable) {
      this.#dismissable.deactivate();
      this.#dismissable = null;
    }
  }

  /* ═══ ITEM SELECTION ═══ */

  /**
   * Handle menu item selection
   * @private
   */
  handleItemSelect(item) {
    const role = item.getAttribute('role');

    // Handle checkbox items
    if (item.classList.contains('ren-menu-checkbox-item') || role === 'menuitemcheckbox') {
      const isChecked = item.getAttribute('aria-checked') === 'true';
      item.setAttribute('aria-checked', !isChecked ? 'true' : 'false');
      this.dispatchSelectEvent(item);
      return;
    }

    // Handle radio items (exclusive selection within group)
    if (item.classList.contains('ren-menu-radio-item') || role === 'menuitemradio') {
      const group = item.closest('.ren-menu-radio-group') || this;
      group
        .querySelectorAll('.ren-menu-radio-item, [role="menuitemradio"]')
        .forEach((radioItem) => radioItem.setAttribute('aria-checked', 'false'));
      item.setAttribute('aria-checked', 'true');
      this.dispatchSelectEvent(item);
      this.close();
      return;
    }

    // Regular menu item: dispatch event and close
    this.dispatchSelectEvent(item);
    this.close();
  }

  /**
   * Dispatch ren-menu-select event
   * @private
   */
  dispatchSelectEvent(item) {
    const value = item.getAttribute('data-value') || item.textContent.trim();
    this.dispatchEvent(
      new CustomEvent('ren-menu-select', {
        bubbles: true,
        detail: { item, value },
      })
    );
  }

  /* ═══ PUBLIC API ═══ */

  /**
   * Open the menu
   */
  open() {
    if (this.#isOpen) return;

    this.#isOpen = true;
    this.#returnFocus = true;
    this.setAttribute('data-state', 'open');
    this.setupKeyboardNav();
    this.setupDismissable();

    this.positionMenu();

    if ('popover' in HTMLElement.prototype) {
      try {
        this.showPopover();
      } catch (e) {
        // Popover might already be open
      }
    } else {
      this.classList.add('ren-open');
    }

    // Reposition on next frame for accuracy
    this.#animationFrame = requestAnimationFrame(() => {
      this.positionMenu();

      // Focus first item
      const firstItem = this.querySelector('[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]');
      if (firstItem) {
        firstItem.focus();
      }
    });

    this.#trigger?.setAttribute('aria-expanded', 'true');
    this.dispatchEvent(new CustomEvent('ren-menu-open', { bubbles: true }));
  }

  /**
   * Close the menu
   */
  close() {
    if (!this.#isOpen) return;

    this.#isOpen = false;
    this.setAttribute('data-state', 'closed');
    this.teardownKeyboardNav();
    this.teardownDismissable();

    // Add closing animation class
    this.setAttribute('data-closing', '');

    // Wait for animation to finish before actually closing
    const animationDuration = getComputedStyle(this).animationDuration;
    const duration = parseFloat(animationDuration) * 1000;

    if (this.#closeTimer) clearTimeout(this.#closeTimer);
    this.#closeTimer = setTimeout(() => {
      this.removeAttribute('data-closing');

      if ('popover' in HTMLElement.prototype) {
        try {
          this.hidePopover();
        } catch (e) {
          // Popover might already be closed
        }
      } else {
        this.classList.remove('ren-open');
      }

      this.#trigger?.setAttribute('aria-expanded', 'false');
      if (this.#returnFocus && this.#trigger && document.contains(this.#trigger)) {
        this.#trigger.focus();
      }
      this.#closeTimer = null;
    }, Math.min(duration, 150)); // Cap at 150ms

    this.dispatchEvent(new CustomEvent('ren-menu-close', { bubbles: true }));
  }

  /**
   * Check if menu is currently open
   * @returns {boolean}
   */
  isOpen() {
    return this.#isOpen;
  }

  /**
   * Get the trigger element
   * @returns {HTMLElement|null}
   */
  getTrigger() {
    return this.#trigger;
  }

  /**
   * Cleanup event listeners and resources
   * @private
   */
  cleanup() {
    this.close();
    if (this.#closeTimer) clearTimeout(this.#closeTimer);
    this.teardownKeyboardNav();
    this.teardownDismissable();

    if (this.#animationFrame) {
      cancelAnimationFrame(this.#animationFrame);
    }

    if (this.#boundItemClick) {
      this.removeEventListener('click', this.#boundItemClick);
    }

    if (this.#trigger) {
      this.#trigger.removeEventListener('click', this.#boundTriggerClick);
      this.#trigger.removeEventListener('keydown', this.#boundTriggerKeydown);
    }
  }
}

if (!customElements.get('ren-menu')) {
  customElements.define('ren-menu', RenMenu);
}

// Compatibility export: context-menu behavior and registration are owned by
// the colocated context-menu module so importing either historical path cannot
// install a second implementation.
export { RenContextMenu } from '../ren-context-menu/ren-context-menu.js';
