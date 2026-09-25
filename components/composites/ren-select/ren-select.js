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
 * @fires ren-select-open - Dispatched when the listbox opens
 * @fires ren-select-close - Dispatched when the listbox closes
 * @fires change - Standard change event for form submission
 */

import { createKeyboardNav } from '../../../utils/keyboard-nav.js';
import { t } from '../../../utils/i18n.js';
import { createDismissable } from '../../../utils/dismissable.js';
import { autoId } from '../../../utils/id-generator.js';
import { computeOverlayPosition } from '../../../utils/positioning.js';

const SELECT_SIDES = new Set(['top', 'right', 'bottom', 'left']);
const SELECT_ALIGNS = new Set(['start', 'end']);

/** Distance between the trigger and the dropdown. */
const SELECT_GAP = 8;
/** Viewport inset the dropdown keeps — it never sits flush against an edge. */
const SELECT_MARGIN = 16;

function normalizeSelectPlacement(value) {
  const [sideValue, alignValue] = String(value || 'bottom')
    .toLowerCase()
    .split('-');
  const side = SELECT_SIDES.has(sideValue) ? sideValue : 'bottom';
  const align = SELECT_ALIGNS.has(alignValue) ? alignValue : 'start';

  return { side, align };
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
  #hiddenInputs = [];
  #animationFrame = null;
  #listenerController = null;
  #scrollController = null;
  /**
   * Placeholder text the consumer authored inside the trigger, read once
   * before the component takes the trigger over. Null until first mount so a
   * disconnect/reconnect cycle never mistakes a rendered value for it.
   */
  #authoredPlaceholder = null;

  constructor() {
    super();
    this.positionContent = this.positionContent.bind(this);
  }

  /* ─────────────────────────────────────────────────────────────
     LIFECYCLE
     ───────────────────────────────────────────────────────────── */

  connectedCallback() {
    if (this.hasAttribute('multiple') && !Array.isArray(this.#selectedValue)) {
      this.#selectedValue = [];
    }
    this.loadStyles();
    this.setupComponent();
    this.bindElements();
    this.setupARIA();
    this.setupHiddenInput();
    this.attachListeners();
    // Render the trigger on mount. Without this the component only painted
    // itself after the first selection, so the canonical markup showed an
    // empty trigger — no placeholder, no chevron — until the user guessed
    // that the blank box opened a listbox.
    this.updateTriggerDisplay();
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

    // The consumer marks the parts with data-* attributes; the classes carry
    // the styling. Adding them here means [data-select-trigger] renders as a
    // trigger instead of an unstyled 24px-tall button.
    this.#trigger.classList.add('ren-select-trigger');
    this.#content.classList.add('ren-select-content');

    // Read the authored placeholder before updateTriggerDisplay() replaces the
    // trigger contents, so <button data-select-trigger>Choose a country</button>
    // keeps its wording even without a placeholder attribute.
    if (this.#authoredPlaceholder === null) {
      this.#authoredPlaceholder =
        this.#trigger.querySelector('.ren-select-placeholder')?.textContent?.trim() ||
        this.#trigger.textContent?.trim() ||
        '';
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
    autoId(this.#trigger, 'select-trigger');
    const contentId = autoId(this.#content, 'select-content');

    // Trigger setup
    this.#trigger.setAttribute('role', 'combobox');
    this.#trigger.setAttribute('aria-expanded', 'false');
    this.#trigger.setAttribute('aria-haspopup', 'listbox');
    this.#trigger.setAttribute('aria-controls', contentId);
    this.#trigger.type = 'button';

    this.applyTriggerLabel();

    // Content setup
    this.#content.setAttribute('role', 'listbox');
    this.#content.id = contentId;
    if (this.hasAttribute('multiple')) {
      this.#content.setAttribute('aria-multiselectable', 'true');
    }

    // Set aria-label on content based on trigger text or placeholder
    if (!this.#content.getAttribute('aria-label') && !this.#content.getAttribute('aria-labelledby')) {
      this.#content.setAttribute('aria-label', this.placeholderText);
    }

    // Wire up items
    this.updateItemsARIA();
  }

  /**
   * Give the trigger an accessible name.
   *
   * `role="combobox"` is name-from-author: the placeholder rendered inside the
   * button is read as the combobox *value*, never as its name. A trigger with
   * visible text therefore still failed WCAG 4.1.2 (axe `button-name`,
   * critical) on every mount, including the one in this contract. Resolution
   * order, most explicit first:
   *
   *   1. aria-labelledby / aria-label already on the trigger — the author wins.
   *   2. The same attributes on the host, moved down onto the trigger. A name
   *      on the role-less host is exposed to nobody, so it is relocated rather
   *      than copied.
   *   3. A <label for="{host id}"> or a wrapping <label>, referenced by id.
   *   4. The placeholder text — the same string the listbox is labelled with.
   *
   * @private
   */
  applyTriggerLabel() {
    const named = (element) =>
      Boolean(element.getAttribute('aria-labelledby')?.trim() || element.getAttribute('aria-label')?.trim());

    if (named(this.#trigger)) return;

    for (const attribute of ['aria-labelledby', 'aria-label']) {
      const value = this.getAttribute(attribute)?.trim();
      if (!value) continue;
      this.#trigger.setAttribute(attribute, value);
      this.removeAttribute(attribute);
      return;
    }

    const label =
      (this.id && this.ownerDocument.querySelector(`label[for="${CSS.escape(this.id)}"]`)) ||
      this.closest('label');
    if (label && !label.contains(this)) {
      this.#trigger.setAttribute('aria-labelledby', autoId(label, 'select-label'));
      return;
    }
    if (label) {
      // A wrapping <label> cannot be referenced: aria-labelledby reads the whole
      // subtree, so the select's own placeholder and options would end up inside
      // its name. Take the label's own text instead.
      const ownText = [...label.childNodes]
        .filter((node) => node !== this && !(node.nodeType === Node.ELEMENT_NODE && node.contains(this)))
        .map((node) => node.textContent?.trim() || '')
        .filter(Boolean)
        .join(' ');
      if (ownText) {
        this.#trigger.setAttribute('aria-label', ownText);
        return;
      }
    }

    this.#trigger.setAttribute('aria-label', this.placeholderText);
  }

  /**
   * Text shown when nothing is selected, and the fallback accessible name.
   *
   * @returns {string}
   */
  get placeholderText() {
    return (
      this.getAttribute('placeholder') ||
      this.#authoredPlaceholder ||
      t('select.placeholder')
    );
  }

  /**
   * Update items ARIA attributes
   * @private
   */
  updateItemsARIA() {
    this.#items.forEach((item, index) => {
      if (item.hasAttribute('disabled') || item.getAttribute('aria-disabled') === 'true') {
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
      const value = item.getAttribute('data-value');
      const isSelected = this.hasAttribute('multiple')
        ? this.#selectedValue.includes(value)
        : value === this.#selectedValue;
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

    this.syncHiddenInputs();
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
    if (item && !item.hasAttribute('disabled') && item.getAttribute('aria-disabled') !== 'true') {
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
      } catch {
        // Fallback to CSS class
      }
    }

    // Attach keyboard nav
    if (this.#keyboardNav) {
      this.#keyboardNav.attach();
      // Activate selected or first item
      const selectedIndex = this.#items.findIndex((item) => {
        const value = item.getAttribute('data-value');
        return this.hasAttribute('multiple')
          ? this.#selectedValue.includes(value)
          : value === this.#selectedValue;
      });
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
    announcement.textContent = t('select.optionsAvailable', { count: resultCount });
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
      } catch {
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
    // Unlike popover/tooltip the dropdown aligns to a trigger edge instead of
    // centring, keeps a margin from every viewport edge, and clamps on both
    // axes — a listbox pushed off-screen is unusable, not just clipped.
    const { x: left, y: top, side, align, flipped } = computeOverlayPosition(
      this.#trigger,
      this.#content,
      {
        side: placement.side,
        align: placement.align,
        offset: SELECT_GAP,
        overflowPadding: SELECT_MARGIN,
        clampPadding: SELECT_MARGIN,
        clampAxis: 'both',
      }
    );

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

    if (this.hasAttribute('multiple')) {
      const values = [...this.#selectedValue];
      const selectedIndex = values.indexOf(value);
      if (selectedIndex === -1) values.push(value);
      else values.splice(selectedIndex, 1);
      this.selectValue(values, true);
    } else {
      this.selectValue(value, true);
    }

    this.dispatchEvent(
      new CustomEvent('ren-select-change', {
        bubbles: true,
        detail: { value: this.value, label, item },
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
    if (this.hasAttribute('multiple')) {
      const values = Array.isArray(value) ? value : (value == null ? [] : [value]);
      this.#selectedValue = [...new Set(values.map(String))];
    } else {
      this.#selectedValue = value == null ? null : String(value);
    }

    // Find and update the corresponding item
    const selectedValues = this.hasAttribute('multiple') ? this.#selectedValue : [this.#selectedValue];
    const item = this.#items.find((el) => selectedValues.includes(el.getAttribute('data-value')));
    if (item) {
      this.#selectedItem = item;
    } else {
      this.#selectedItem = null;
    }

    // Update ARIA
    this.updateItemsARIA();

    // Update trigger display
    if (updateTrigger) {
      this.updateTriggerDisplay();
    }

    this.syncHiddenInputs();
  }

  syncHiddenInputs() {
    const name = this.getAttribute('name');
    this.querySelectorAll('input[type="hidden"][data-ren-select-input]').forEach((input) => input.remove());
    this.#hiddenInputs = [];
    if (!name) return;

    const values = this.hasAttribute('multiple')
      ? this.#selectedValue
      : [this.#selectedValue || ''];
    values.forEach((value) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      input.setAttribute('data-ren-select-input', '');
      this.appendChild(input);
      this.#hiddenInputs.push(input);
    });
  }

  /**
   * Update the trigger button text/icon display
   * @private
   */
  updateTriggerDisplay() {
    const placeholder = this.placeholderText;

    this.querySelector(':scope > .ren-select-chips[data-ren-select-chips]')?.remove();

    // Clear trigger content
    this.#trigger.innerHTML = '';

    if (this.hasAttribute('multiple') && this.#selectedValue.length > 0) {
      const chips = document.createElement('span');
      chips.className = 'ren-select-chips';
      chips.setAttribute('data-ren-select-chips', '');
      const selectedLabels = [];
      this.#selectedValue.forEach((value) => {
        const item = this.#items.find((option) => option.getAttribute('data-value') === value);
        if (!item) return;

        const chip = document.createElement('span');
        chip.className = 'ren-select-chip';
        const label = document.createElement('span');
        label.textContent = item.textContent?.trim() || value;
        selectedLabels.push(label.textContent);
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'ren-select-chip-remove';
        remove.dataset.value = value;
        remove.setAttribute('aria-label', t('select.removeOption', { label: label.textContent }));
        remove.textContent = '×';
        remove.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.selectValue(this.#selectedValue.filter((selected) => selected !== value), true);
          this.dispatchEvent(new CustomEvent('ren-select-change', {
            bubbles: true,
            detail: { value: this.value, label: label.textContent, item },
          }));
          this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        });
        chip.append(label, remove);
        chips.appendChild(chip);
      });
      this.insertBefore(chips, this.#trigger);

      const valueSpan = document.createElement('span');
      valueSpan.className = 'ren-select-value';
      valueSpan.textContent = selectedLabels.join(', ');
      this.#trigger.appendChild(valueSpan);
    } else if (!this.#selectedValue || !this.#selectedItem) {
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
   * @returns {string|string[]|null} Selected value, ordered values, or null
   */
  get value() {
    return Array.isArray(this.#selectedValue) ? [...this.#selectedValue] : this.#selectedValue;
  }

  /**
   * Set value programmatically
   * @param {string|string[]} value - Value or ordered values to select
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
