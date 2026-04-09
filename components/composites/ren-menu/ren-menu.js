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

import { createKeyboardNav } from '../../utils/keyboard-nav.js';
import { createDismissable } from '../../utils/dismissable.js';

export class RenMenu extends HTMLElement {
  #trigger = null;
  #isOpen = false;
  #keyboardNav = null;
  #dismissable = null;
  #animationFrame = null;

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
  }

  /**
   * Lifecycle: Element removed from DOM
   */
  disconnectedCallback() {
    this.cleanup();
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

    // Ensure all items have correct roles if not already set
    this.querySelectorAll('[role="menuitem"]').forEach((item) => {
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

    this.#trigger.addEventListener('click', (e) => this.handleTriggerClick(e));
    this.#trigger.addEventListener('keydown', (e) => this.handleTriggerKeydown(e));
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

  /* ═══ POSITIONING ═══ */

  /**
   * Position the menu relative to trigger element
   * @private
   */
  positionMenu() {
    if (!this.#trigger) return;

    const placement = this.getAttribute('placement') || 'bottom-start';
    const triggerRect = this.#trigger.getBoundingClientRect();
    const menuRect = this.getBoundingClientRect();

    // Calculate initial position based on placement
    let left = triggerRect.left;
    let top = triggerRect.bottom + 8;

    if (placement.includes('end')) {
      left = triggerRect.right - menuRect.width;
    }

    if (placement.includes('top')) {
      top = triggerRect.top - menuRect.height - 8;
    }

    // Viewport collision detection
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Clamp horizontal position
    if (left < 8) {
      left = 8;
    } else if (left + menuRect.width > viewport.width - 8) {
      left = viewport.width - menuRect.width - 8;
    }

    // Clamp vertical position (flip if needed)
    if (top < 8) {
      top = triggerRect.bottom + 8;
    } else if (top + menuRect.height > viewport.height - 8) {
      const topPlacement = triggerRect.top - menuRect.height - 8;
      if (topPlacement >= 8) {
        top = topPlacement;
      } else {
        // Constrain height if menu doesn't fit
        top = 8;
      }
    }

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
      selector: '[role="menuitem"]:not([aria-disabled="true"])',
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
    // Handle checkbox items
    if (item.classList.contains('ren-menu-checkbox-item')) {
      const isChecked = item.getAttribute('aria-checked') === 'true';
      item.setAttribute('aria-checked', !isChecked ? 'true' : 'false');
      this.dispatchSelectEvent(item);
      return;
    }

    // Handle radio items (exclusive selection within group)
    if (item.classList.contains('ren-menu-radio-item')) {
      const group = item.closest('.ren-menu-radio-group') || this;
      group
        .querySelectorAll('.ren-menu-radio-item')
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
      const firstItem = this.querySelector('[role="menuitem"]');
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

    setTimeout(() => {
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
    this.teardownKeyboardNav();
    this.teardownDismissable();

    if (this.#animationFrame) {
      cancelAnimationFrame(this.#animationFrame);
    }

    if (this.#trigger) {
      this.#trigger.removeEventListener('click', (e) => this.handleTriggerClick(e));
      this.#trigger.removeEventListener('keydown', (e) => this.handleTriggerKeydown(e));
    }
  }
}

/**
 * RenDS — <ren-context-menu> Web Component
 * ===========================================
 * Context menu component that extends ren-menu.
 * Opens on right-click (contextmenu event) at pointer coordinates.
 *
 * Attributes:
 *   Same as ren-menu
 *
 * Markup:
 *   <div data-context-menu-trigger id="target">Right-click me</div>
 *   <ren-context-menu trigger-id="target">
 *     <button class="ren-menu-item" role="menuitem">Copy</button>
 *     <button class="ren-menu-item" role="menuitem">Cut</button>
 *     <button class="ren-menu-item" role="menuitem">Paste</button>
 *   </ren-context-menu>
 *
 * Events:
 *   Same as ren-menu (ren-menu-select, ren-menu-open, ren-menu-close)
 *   Plus: ren-context-menu-open with { x, y, target }
 */
export class RenContextMenu extends RenMenu {
  #contextMenuX = 0;
  #contextMenuY = 0;

  /**
   * Lifecycle: Element inserted into DOM
   */
  connectedCallback() {
    super.connectedCallback();
    this.attachContextMenuListener();
  }

  /**
   * Attach contextmenu event listener to trigger
   * @private
   */
  attachContextMenuListener() {
    const trigger = this.getTrigger();
    if (!trigger) return;

    trigger.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
  }

  /**
   * Handle right-click to open context menu at pointer position
   * @private
   */
  handleContextMenu(e) {
    e.preventDefault();

    this.#contextMenuX = e.clientX;
    this.#contextMenuY = e.clientY;

    // Close any existing menu first
    if (this.isOpen()) {
      this.close();
    }

    // Open at pointer position
    this.open();

    // Apply pointer positioning instead of trigger-based positioning
    requestAnimationFrame(() => {
      const menuRect = this.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      let left = this.#contextMenuX;
      let top = this.#contextMenuY;

      // Clamp to viewport
      if (left + menuRect.width > viewport.width) {
        left = viewport.width - menuRect.width - 8;
      }
      if (top + menuRect.height > viewport.height) {
        top = viewport.height - menuRect.height - 8;
      }

      left = Math.max(8, left);
      top = Math.max(8, top);

      this.style.left = `${left}px`;
      this.style.top = `${top}px`;
    });

    this.dispatchEvent(
      new CustomEvent('ren-context-menu-open', {
        bubbles: true,
        detail: {
          x: this.#contextMenuX,
          y: this.#contextMenuY,
          target: e.target,
        },
      })
    );
  }
}

if (!customElements.get('ren-menu')) {
  customElements.define('ren-menu', RenMenu);
}

if (!customElements.get('ren-context-menu')) {
  customElements.define('ren-context-menu', RenContextMenu);
}
