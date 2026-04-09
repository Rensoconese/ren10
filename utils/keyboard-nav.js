/**
 * RenDS — Keyboard Navigation
 * ============================
 * Arrow key navigation for lists, menus, tabs,
 * and other collections of interactive items.
 *
 * Implements "roving tabindex" pattern (WAI-ARIA APG):
 * - Only the active item has tabindex="0"
 * - All other items have tabindex="-1"
 * - Arrow keys move between items
 * - Home/End jump to first/last
 * - Typeahead search finds items by text
 *
 * Usage:
 *   import { createKeyboardNav } from './keyboard-nav.js';
 *
 *   const nav = createKeyboardNav(listElement, {
 *     selector: '[role="option"]',
 *     orientation: 'vertical',  // 'vertical' | 'horizontal' | 'both'
 *     loop: true,               // wrap around at ends
 *     typeahead: true,           // type to search
 *     onSelect: (item) => handleSelect(item),
 *     onActivate: (item) => handleActivate(item),
 *   });
 *
 *   nav.attach();
 *   // ... later
 *   nav.detach();
 */

/**
 * Create keyboard navigation for a collection of items.
 *
 * @param {HTMLElement} container - Parent element containing navigable items
 * @param {Object} options
 * @param {string} options.selector - CSS selector for navigable items
 * @param {'vertical'|'horizontal'|'both'} options.orientation - Arrow key direction
 * @param {boolean} options.loop - Wrap around at first/last item
 * @param {boolean} options.typeahead - Enable type-to-search
 * @param {number} options.typeaheadTimeout - Ms before clearing search buffer
 * @param {boolean} options.focusOnHover - Focus items on mouse hover
 * @param {Function|null} options.onActivate - Callback when active item changes (arrow keys)
 * @param {Function|null} options.onSelect - Callback when item is selected (Enter/Space)
 * @param {string} options.activeAttribute - Data attribute for active state
 * @returns {Object} Navigation controller
 */
export function createKeyboardNav(container, options = {}) {
  const {
    selector = '[role="option"], [role="menuitem"], [role="tab"], li',
    orientation = 'vertical',
    loop = true,
    typeahead = true,
    typeaheadTimeout = 500,
    focusOnHover = false,
    onActivate = null,
    onSelect = null,
    activeAttribute = 'data-highlighted',
  } = options;

  let attached = false;
  let activeIndex = -1;
  let typeaheadBuffer = '';
  let typeaheadTimer = null;

  // ─── Item Management ───

  function getItems() {
    return Array.from(container.querySelectorAll(selector)).filter(
      (el) => !el.hasAttribute('disabled') && !el.hasAttribute('aria-disabled')
    );
  }

  function getActiveItem() {
    const items = getItems();
    return activeIndex >= 0 && activeIndex < items.length
      ? items[activeIndex]
      : null;
  }

  // ─── Activation (roving tabindex) ───

  function activateItem(index, shouldFocus = true) {
    const items = getItems();
    if (items.length === 0) return;

    // Clamp index
    if (index < 0) index = loop ? items.length - 1 : 0;
    if (index >= items.length) index = loop ? 0 : items.length - 1;

    // Deactivate previous
    const prevItem = items[activeIndex];
    if (prevItem) {
      prevItem.setAttribute('tabindex', '-1');
      prevItem.removeAttribute(activeAttribute);
    }

    // Activate new
    activeIndex = index;
    const item = items[activeIndex];
    item.setAttribute('tabindex', '0');
    item.setAttribute(activeAttribute, '');

    if (shouldFocus) {
      item.focus();
    }

    onActivate?.(item, activeIndex);
  }

  function activateNext() {
    activateItem(activeIndex + 1);
  }

  function activatePrevious() {
    activateItem(activeIndex - 1);
  }

  function activateFirst() {
    activateItem(0);
  }

  function activateLast() {
    const items = getItems();
    activateItem(items.length - 1);
  }

  // ─── Typeahead Search ───

  function handleTypeahead(char) {
    if (!typeahead) return;

    clearTimeout(typeaheadTimer);
    typeaheadBuffer += char.toLowerCase();

    typeaheadTimer = setTimeout(() => {
      typeaheadBuffer = '';
    }, typeaheadTimeout);

    const items = getItems();
    // Search from current position, then wrap
    const startIndex = activeIndex + 1;

    for (let i = 0; i < items.length; i++) {
      const index = (startIndex + i) % items.length;
      const text = items[index].textContent?.trim().toLowerCase() || '';

      if (text.startsWith(typeaheadBuffer)) {
        activateItem(index);
        return;
      }
    }

    // If no match with accumulated buffer, try single char from beginning
    if (typeaheadBuffer.length > 1) {
      typeaheadBuffer = char.toLowerCase();
      for (let i = 0; i < items.length; i++) {
        const index = (startIndex + i) % items.length;
        const text = items[index].textContent?.trim().toLowerCase() || '';
        if (text.startsWith(typeaheadBuffer)) {
          activateItem(index);
          return;
        }
      }
    }
  }

  // ─── Event Handlers ───

  function handleKeyDown(event) {
    const items = getItems();
    if (items.length === 0) return;

    const isVertical = orientation === 'vertical' || orientation === 'both';
    const isHorizontal = orientation === 'horizontal' || orientation === 'both';

    let handled = false;

    switch (event.key) {
      case 'ArrowDown':
        if (isVertical) {
          activateNext();
          handled = true;
        }
        break;

      case 'ArrowUp':
        if (isVertical) {
          activatePrevious();
          handled = true;
        }
        break;

      case 'ArrowRight':
        if (isHorizontal) {
          activateNext();
          handled = true;
        }
        break;

      case 'ArrowLeft':
        if (isHorizontal) {
          activatePrevious();
          handled = true;
        }
        break;

      case 'Home':
        activateFirst();
        handled = true;
        break;

      case 'End':
        activateLast();
        handled = true;
        break;

      case 'Enter':
      case ' ':
        if (event.key === ' ' && typeahead) {
          // Space might be typeahead
          // Only select if no typeahead buffer
          if (typeaheadBuffer === '') {
            const item = getActiveItem();
            if (item) {
              onSelect?.(item, activeIndex);
              handled = true;
            }
          } else {
            handleTypeahead(' ');
            handled = true;
          }
        } else {
          const item = getActiveItem();
          if (item) {
            onSelect?.(item, activeIndex);
            handled = true;
          }
        }
        break;

      default:
        // Typeahead: single printable character
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          handleTypeahead(event.key);
          handled = true;
        }
        break;
    }

    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function handleMouseEnter(event) {
    if (!focusOnHover) return;

    const items = getItems();
    const index = items.indexOf(event.target.closest(selector));
    if (index !== -1) {
      activateItem(index, false); // Don't steal keyboard focus
    }
  }

  function handleFocusIn(event) {
    // When focus enters the container, activate the focused item
    const items = getItems();
    const index = items.indexOf(event.target.closest(selector));
    if (index !== -1 && index !== activeIndex) {
      activateItem(index, false);
    }
  }

  // ─── Initialize ───

  function initializeTabindex() {
    const items = getItems();

    // Set all to tabindex="-1" except the active one
    items.forEach((item, index) => {
      if (index === activeIndex || (activeIndex === -1 && index === 0)) {
        item.setAttribute('tabindex', '0');
        if (activeIndex === -1) activeIndex = 0;
      } else {
        item.setAttribute('tabindex', '-1');
      }
    });
  }

  // ─── Attach / Detach ───

  function attach() {
    if (attached) return;
    attached = true;

    initializeTabindex();

    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('focusin', handleFocusIn);

    if (focusOnHover) {
      const items = getItems();
      items.forEach((item) => {
        item.addEventListener('mouseenter', handleMouseEnter);
      });
    }
  }

  function detach() {
    if (!attached) return;
    attached = false;

    container.removeEventListener('keydown', handleKeyDown);
    container.removeEventListener('focusin', handleFocusIn);

    if (focusOnHover) {
      const items = getItems();
      items.forEach((item) => {
        item.removeEventListener('mouseenter', handleMouseEnter);
      });
    }

    clearTimeout(typeaheadTimer);
    typeaheadBuffer = '';
  }

  // ─── Public API ───

  return {
    attach,
    detach,

    /** Activate a specific item by index */
    activateItem,
    activateNext,
    activatePrevious,
    activateFirst,
    activateLast,

    /** Get currently active item */
    getActiveItem,

    /** Get all navigable items */
    getItems,

    /** Get current active index */
    get activeIndex() {
      return activeIndex;
    },

    /** Refresh items (after DOM changes) */
    refresh() {
      initializeTabindex();
    },

    /** Set active index programmatically */
    setActiveIndex(index) {
      activateItem(index, false);
    },

    get isAttached() {
      return attached;
    },
  };
}
