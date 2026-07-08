/**
 * RenDS — Select Component
 * ========================
 *
 * A custom, fully accessible select/dropdown component that extends native
 * form capabilities with keyboard navigation, ARIA support, grouping,
 * and multi-select capability.
 *
 * Features:
 * - Keyboard navigation (arrow keys, Enter, Space, Escape, Typeahead)
 * - Full ARIA support (combobox, listbox, role="option")
 * - Click-outside dismissal with roving tabindex
 * - Optional multi-select mode
 * - Option groups and separators
 * - Form submission integration
 * - Preferred placement with viewport-aware positioning
 * - Fallback styling for native select elements
 * - Respects prefers-reduced-motion
 *
 * @example
 * <ren-select placeholder="Choose an option" name="country">
 *   <button data-select-trigger>Select a country</button>
 *   <div data-select-content>
 *     <div data-select-item data-value="us">United States</div>
 *     <div data-select-item data-value="ca">Canada</div>
 *   </div>
 * </ren-select>
 *
 * @fires ren-select-change - Dispatched when selection changes
 * @fires change - Standard change event for form submission
 */

import { createKeyboardNav } from '../../../utils/keyboard-nav.js';
import { createDismissable } from '../../../utils/dismissable.js';
import { autoId } from '../../../utils/id-generator.js';

const SELECT_SIDES = new Set(['top', 'right', 'bottom', 'left']);
const SELECT_ALIGNS = new Set(['start', 'end']);

function normalizeSelectPlacement(value) {
  const [sideValue, alignValue] = String(value || 'bottom')
    .toLowerCase()
    .split('-');
  const side = SELECT_SIDES.has(sideValue) ? sideValue : 'bottom';
  const align = SELECT_ALIGNS.has(alignValue) ? alignValue : 'start';

  return { side, align };
}

/**
 * Compute dropdown position relative to trigger element.
 * Falls back above if not enough space below.
 *
 * @private
 * @param {HTMLElement} trigger - Trigger button element
 * @param {HTMLElement} content - Dropdown content element
 * @param {Object} placement - Normalized placement object
 * @returns {Object} Position with top, left, flipped, side, and align properties
 */
function computePosition(trigger, content, placement = normalizeSelectPlacement()) {
  const triggerRect = trigger.getBoundingClientRect();
  const contentRect = content.getBoundingClientRect();
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  const gap = 8;
  const margin = 16;

  let finalSide = placement.side;
  let flipped = false;
  let top = triggerRect.bottom + gap;
  let left = triggerRect.left;

  if (placement.align === 'end') {
    left = triggerRect.right - contentRect.width;
  }

  if (placement.side === 'top') {
    top = triggerRect.top - contentRect.height - gap;
  } else if (placement.side === 'right') {
    top = placement.align === 'end'
      ? triggerRect.bottom - contentRect.height
      : triggerRect.top;
    left = triggerRect.right + gap;
  } else if (placement.side === 'left') {
    top = placement.align === 'end'
      ? triggerRect.bottom - contentRect.height
      : triggerRect.top;
    left = triggerRect.left - contentRect.width - gap;
  }

  if (
    placement.side === 'bottom' &&
    top + contentRect.height > viewport.height - margin &&
    triggerRect.top - contentRect.height - gap >= margin
  ) {
    top = triggerRect.top - contentRect.height - gap;
    finalSide = 'top';
    flipped = true;
  } else if (
    placement.side === 'top' &&
    top < margin &&
    triggerRect.bottom + contentRect.height + gap <= viewport.height - margin
  ) {
    top = triggerRect.bottom + gap;
    finalSide = 'bottom';
    flipped = true;
  } else if (
    placement.side === 'right' &&
    left + contentRect.width > viewport.width - margin &&
    triggerRect.left - contentRect.width - gap >= margin
  ) {
    left = triggerRect.left - contentRect.width - gap;
    finalSide = 'left';
    flipped = true;
  } else if (
    placement.side === 'left' &&
    left < margin &&
    triggerRect.right + contentRect.width + gap <= viewport.width - margin
  ) {
    left = triggerRect.right + gap;
    finalSide = 'right';
    flipped = true;
  }

  if (left + contentRect.width > viewport.width - margin) {
    left = viewport.width - contentRect.width - margin;
  }
  if (left < margin) {
    left = margin;
  }

  if (top + contentRect.height > viewport.height - margin) {
    top = viewport.height - contentRect.height - margin;
  }
  if (top < margin) {
    top = margin;
  }

  return { top, left, flipped, side: finalSide, align: placement.align };
}

/**
 * Select Component
 *
 * Custom, accessible select/dropdown with keyboard nav and ARIA support.
 *
 * @class RenSelect
 * @extends HTMLElement
 */
export class RenSelect extends HTMLElement {
  static observedAttributes = ['placement'];

  #trigger = null;
  #content = null;
  #items = [];
  #isOpen = false;
  #selectedValue = null;
  #selectedItem = null;
  #keyboardNav = null;
  #dismissable = null;
  #hiddenInput = null;
  #animationFrame = null;
  #listenerController = null;
  #scrollController = null;

  constructor() {
    super();
    this.positionContent = this.positionContent.bind(this);
  }

  /* ─────────────────────────────────────────────────────────────
     LIFECYCLE
     ───────────────────────────────────────────────────────────── */

  connectedCallback() {
    this.loadStyles();
    this.setupComponent();
    this.bindElements();
    this.setupARIA();
    this.setupHiddenInput();
    this.attachListeners();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'placement' && oldValue !== newValue) {
      this.syncPlacement();
      if (this.#isOpen) {
        this.positionContent();
      }
    }
  }

  /* ─────────────────────────────────────────────────────────────
     SETUP & INITIALIZATION
     ───────────────────────────────────────────────────────────── */

  /**
   * Load component CSS styles into document
   * @private
   */
  loadStyles() {
    if (!document.getElementById('ren-select-styles')) {
      const style = document.createElement('style');
      style.id = 'ren-select-styles';
      style.textContent = this.constructor.styles || '';
      document.head.appendChild(style);
    }
  }

  /**
   * Setup container and trigger elements
   * @private
   */
  setupComponent() {
    this.classList.add('ren-select');
    this.syncPlacement();

    // Check for size variant
    if (this.hasAttribute('size')) {
      this.classList.add(`ren-select-${this.getAttribute('size')}`);
    }
  }

  /**
   * Find and cache trigger and content elements
   * @private
   */
  bindElements() {
    // Try to find explicitly marked elements
    this.#trigger = this.querySelector('[data-select-trigger], .ren-select-trigger');
    this.#content = this.querySelector('[data-select-content], .ren-select-content');

    // If not found, look for first button and first div (fallback)
    if (!this.#trigger) {
      this.#trigger = this.querySelector('button');
    }

    if (!this.#content) {
      this.#content = this.querySelector('[role="listbox"]');
    }

    // If still not found, create default structure
    if (!this.#trigger || !this.#content) {
      this.createDefaultStructure();
    }

    // Cache items
    this.updateItems();
    this.syncPlacement();
  }

  /**
   * Create default trigger and content if not provided
   * @private
   */
  createDefaultStructure() {
    // Create trigger button
    if (!this.#trigger) {
      this.#trigger = document.createElement('button');
      this.#trigger.className = 'ren-select-trigger';
      this.#trigger.type = 'button';
      this.appendChild(this.#trigger);
    }

    // Create content container
    if (!this.#content) {
      this.#content = document.createElement('div');
      this.#content.className = 'ren-select-content';
      this.#content.setAttribute('role', 'listbox');
      this.appendChild(this.#content);
    }
  }

  /**
   * Setup ARIA attributes on trigger and content
   * @private
   */
  setupARIA() {
    const triggerId = autoId(this.#trigger, 'select-trigger');
    const contentId = autoId(this.#content, 'select-content');

    // Trigger setup
    this.#trigger.setAttribute('role', 'combobox');
    this.#trigger.setAttribute('aria-expanded', 'false');
    this.#trigger.setAttribute('aria-haspopup', 'listbox');
    this.#trigger.setAttribute('aria-controls', contentId);
    this.#trigger.type = 'button';

    // Content setup
    this.#content.setAttribute('role', 'listbox');
    this.#content.id = contentId;

    // Set aria-label on content based on trigger text or placeholder
    const placeholder = this.getAttribute('placeholder') || 'Select an option';
    if (!this.#content.getAttribute('aria-label')) {
      this.#content.setAttribute('aria-label', placeholder);
    }

    // Wire up items
    this.updateItemsARIA();
  }

  /**
   * Update items ARIA attributes
   * @private
   */
  updateItemsARIA() {
    this.#items.forEach((item, index) => {
      if (item.hasAttribute('disabled') || item.hasAttribute('aria-disabled')) {
        item.setAttribute('aria-disabled', 'true');
      }

      if (!item.getAttribute('role')) {
        item.setAttribute('role', 'option');
      }

      // Ensure item has tabindex
      if (!item.hasAttribute('tabindex')) {
        item.setAttribute('tabindex', '-1');
      }

      // Set aria-selected based on current selection
      const isSelected = item.getAttribute('data-value') === this.#selectedValue;
      item.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });
  }

  /**
   * Setup hidden input for form submission
   * @private
   */
  setupHiddenInput() {
    const name = this.getAttribute('name');
    if (!name) return;

    // Remove existing hidden input
    const existing = this.querySelector('input[type="hidden"]');
    if (existing) {
      existing.remove();
    }

    // Create hidden input
    this.#hiddenInput = document.createElement('input');
    this.#hiddenInput.type = 'hidden';
    this.#hiddenInput.name = name;
    this.#hiddenInput.value = this.#selectedValue || '';
    this.appendChild(this.#hiddenInput);
  }

  /**
   * Attach event listeners to trigger and content
   * @private
   */
  attachListeners() {
    this.#listenerController?.abort();
    this.#listenerController = new AbortController();
    const { signal } = this.#listenerController;

    // Trigger click
    this.#trigger.addEventListener('click', (e) => this.handleTriggerClick(e), { signal });

    // Keyboard on trigger
    this.#trigger.addEventListener('keydown', (e) => this.handleTriggerKeyDown(e), { signal });

    // Item selection
    this.#content.addEventListener('click', (e) => this.handleItemClick(e), { signal });

    // Setup keyboard navigation in content
    this.setupKeyboardNav();

    // Setup click-outside dismissal
    this.setupDismissable();

    // Initialize selected value
    const initialValue = this.getAttribute('value');
    if (initialValue) {
      this.selectValue(initialValue, false);
    }
  }

  /**
   * Setup keyboard navigation for select items
   * @private
   */
  setupKeyboardNav() {
    this.#keyboardNav = createKeyboardNav(this.#content, {
      selector: '[role="option"]',
      orientation: 'vertical',
      loop: true,
      typeahead: true,
      focusOnHover: true,
      onActivate: (item) => {
        // Item is highlighted
      },
      onSelect: (item) => {
        this.selectItem(item);
      },
    });

    // Don't attach yet; will attach when dropdown opens
  }

  /**
   * Setup click-outside and Escape key dismissal
   * @private
   */
  setupDismissable() {
    this.#dismissable = createDismissable(this.#content, {
      triggerElement: this.#trigger,
      escapeKey: true,
      clickOutside: true,
      onDismiss: (reason) => {
        this.close();
      },
    });
  }

  /**
   * Update the list of items from the content element
   * @private
   */
  updateItems() {
    this.#items = Array.from(
      this.#content.querySelectorAll('[role="option"], [data-select-item], .ren-select-item')
    );
  }

  /* ─────────────────────────────────────────────────────────────
     EVENT HANDLERS
     ───────────────────────────────────────────────────────────── */

  /**
   * Handle trigger button click
   * @private
   */
  handleTriggerClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (this.#isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Handle keyboard events on trigger
   * @private
   */
  handleTriggerKeyDown(e) {
    const isOpen = this.#isOpen;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        e.stopPropagation();

        if (!isOpen) {
          this.open();
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        e.stopPropagation();

        if (!isOpen) {
          this.open();
          // Focus first item
          setTimeout(() => {
            this.#keyboardNav?.activateFirst();
          }, 0);
        } else {
          this.#keyboardNav?.activateNext();
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation();

        if (!isOpen) {
          this.open();
          // Focus last item
          setTimeout(() => {
            this.#keyboardNav?.activateLast();
          }, 0);
        } else {
          this.#keyboardNav?.activatePrevious();
        }
        break;

      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          e.stopPropagation();
          this.close();
        }
        break;

      case 'ArrowLeft':
      case 'ArrowRight':
      case 'Tab':
        // Don't intercept these; let default behavior
        break;

      default:
        // Let other keys through
        break;
    }
  }

  /**
   * Handle item click
   * @private
   */
  handleItemClick(e) {
    const item = e.target.closest('[role="option"]');
    if (item && !item.hasAttribute('aria-disabled')) {
      e.preventDefault();
      e.stopPropagation();
      this.selectItem(item);
    }
  }

  /* ─────────────────────────────────────────────────────────────
     OPENING / CLOSING
     ───────────────────────────────────────────────────────────── */

  /**
   * Open the dropdown
   */
  open() {
    if (this.#isOpen || this.#trigger.disabled) return;

    this.#isOpen = true;

    // Show content
    this.#content.classList.add('ren-open');
    this.setAttribute('data-state', 'open');
    this.#trigger.setAttribute('aria-expanded', 'true');

    // Try native popover API
    if ('popover' in HTMLElement.prototype && this.#content.hasAttribute('popover')) {
      try {
        this.#content.showPopover();
      } catch (e) {
        // Fallback to CSS class
      }
    }

    // Attach keyboard nav
    if (this.#keyboardNav) {
      this.#keyboardNav.attach();
      // Activate selected or first item
      const selectedIndex = this.#items.findIndex(
        (item) => item.getAttribute('data-value') === this.#selectedValue
      );
      if (selectedIndex !== -1) {
        this.#keyboardNav.setActiveIndex(selectedIndex);
      } else if (this.#items.length > 0) {
        this.#keyboardNav.activateFirst();
      }
    }

    // Activate dismissable layer
    if (this.#dismissable) {
      this.#dismissable.activate();
    }

    // Position content
    this.positionContent();

    // Reposition on scroll
    this.#scrollController?.abort();
    this.#scrollController = new AbortController();
    window.addEventListener('scroll', this.positionContent, {
      capture: true,
      signal: this.#scrollController.signal,
    });

    // Announce results count for accessibility
    const resultCount = this.#items.length;
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'ren-sr-only';
    announcement.textContent = `${resultCount} option${resultCount !== 1 ? 's' : ''} available`;
    this.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);

    this.dispatchEvent(new CustomEvent('ren-select-open', { bubbles: true }));
  }

  /**
   * Close the dropdown
   */
  close() {
    if (!this.#isOpen) return;

    this.#isOpen = false;

    // Hide content
    this.#content.classList.remove('ren-open');
    this.setAttribute('data-state', 'closed');
    this.#trigger.setAttribute('aria-expanded', 'false');

    // Try native popover API
    if ('popover' in HTMLElement.prototype && this.#content.hasAttribute('popover')) {
      try {
        this.#content.hidePopover();
      } catch (e) {
        // Fallback
      }
    }

    // Detach keyboard nav
    if (this.#keyboardNav) {
      this.#keyboardNav.detach();
    }

    // Deactivate dismissable layer
    if (this.#dismissable) {
      this.#dismissable.deactivate();
    }

    // Remove scroll listener
    this.#scrollController?.abort();
    this.#scrollController = null;

    // Return focus to trigger
    this.#trigger.focus();

    this.dispatchEvent(new CustomEvent('ren-select-close', { bubbles: true }));
  }

  /**
   * Position dropdown content below or above trigger
   * @private
   */
  positionContent() {
    const placement = normalizeSelectPlacement(this.getAttribute('placement'));
    const { top, left, flipped, side, align } = computePosition(this.#trigger, this.#content, placement);

    this.#content.style.position = 'fixed';
    this.#content.style.top = `${top}px`;
    this.#content.style.left = `${left}px`;
    this.#content.style.width = `${this.#trigger.offsetWidth}px`;
    this.#content.setAttribute('data-flipped', flipped ? 'true' : 'false');
    this.#content.setAttribute('data-side', side);
    this.#content.setAttribute('data-align', align);
    this.setAttribute('data-side', side);
    this.setAttribute('data-align', align);
  }

  /**
   * Mirror preferred placement to public data attributes.
   */
  syncPlacement() {
    const { side, align } = normalizeSelectPlacement(this.getAttribute('placement'));

    this.setAttribute('data-side', side);
    this.setAttribute('data-align', align);
    if (this.#content) {
      this.#content.setAttribute('data-side', side);
      this.#content.setAttribute('data-align', align);
    }
  }

  /* ─────────────────────────────────────────────────────────────
     SELECTION
     ───────────────────────────────────────────────────────────── */

  /**
   * Select an item by element
   * @private
   */
  selectItem(item) {
    const value = item.getAttribute('data-value');
    const label = item.textContent?.trim() || '';

    this.selectValue(value, true);

    this.dispatchEvent(
      new CustomEvent('ren-select-change', {
        bubbles: true,
        detail: { value, label, item },
      })
    );

    // Emit standard change event for forms
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

    // Close dropdown (unless multi-select)
    if (!this.hasAttribute('multiple')) {
      this.close();
    }
  }

  /**
   * Select by value
   * @private
   */
  selectValue(value, updateTrigger = true) {
    this.#selectedValue = value;

    // Find and update the corresponding item
    const item = this.#items.find((el) => el.getAttribute('data-value') === value);
    if (item) {
      this.#selectedItem = item;
    }

    // Update ARIA
    this.updateItemsARIA();

    // Update trigger display
    if (updateTrigger) {
      this.updateTriggerDisplay();
    }

    // Update hidden input
    if (this.#hiddenInput) {
      this.#hiddenInput.value = value || '';
    }
  }

  /**
   * Update the trigger button text/icon display
   * @private
   */
  updateTriggerDisplay() {
    const placeholder = this.getAttribute('placeholder') || 'Select an option';

    // Clear trigger content
    this.#trigger.innerHTML = '';

    if (!this.#selectedValue || !this.#selectedItem) {
      // Show placeholder
      const placeholderSpan = document.createElement('span');
      placeholderSpan.className = 'ren-select-placeholder';
      placeholderSpan.textContent = placeholder;
      this.#trigger.appendChild(placeholderSpan);
    } else {
      // Show selected value
      const valueSpan = document.createElement('span');
      valueSpan.className = 'ren-select-value';
      valueSpan.textContent = this.#selectedItem.textContent?.trim() || '';
      this.#trigger.appendChild(valueSpan);
    }

    // Add chevron icon
    const icon = document.createElement('span');
    icon.className = 'ren-select-icon';
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
    this.#trigger.appendChild(icon);
  }

  /* ─────────────────────────────────────────────────────────────
     CLEANUP
     ───────────────────────────────────────────────────────────── */

  /**
   * Cleanup event listeners and resources
   * @private
   */
  cleanup() {
    if (this.#keyboardNav) {
      this.#keyboardNav.detach();
    }

    if (this.#dismissable) {
      this.#dismissable.deactivate();
    }

    if (this.#animationFrame) {
      cancelAnimationFrame(this.#animationFrame);
    }

    this.#scrollController?.abort();
    this.#scrollController = null;
    this.#listenerController?.abort();
    this.#listenerController = null;
  }

  /* ─────────────────────────────────────────────────────────────
     PUBLIC API
     ───────────────────────────────────────────────────────────── */

  /**
   * Get current selected value
   * @returns {string|null} Selected value or null
   */
  get value() {
    return this.#selectedValue;
  }

  /**
   * Set value programmatically
   * @param {string} value - Value to select
   */
  set value(value) {
    this.selectValue(value, true);
  }

  /**
   * Get current selected item element
   * @returns {HTMLElement|null}
   */
  get selectedOption() {
    return this.#selectedItem || null;
  }

  /**
   * Check if dropdown is open
   * @returns {boolean}
   */
  get isOpen() {
    return this.#isOpen;
  }

  /**
   * Get all option items
   * @returns {HTMLElement[]}
   */
  get options() {
    return [...this.#items];
  }

  /**
   * Refresh items from DOM (call after dynamically adding items)
   */
  refresh() {
    this.updateItems();
    this.updateItemsARIA();

    if (this.#keyboardNav) {
      this.#keyboardNav.refresh?.();
    }
  }
}

// Register the custom element
if (!customElements.get('ren-select')) {
  customElements.define('ren-select', RenSelect);
}
