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
 * @param {boolean} options.focusOnHover - Activate items the pointer moves onto.
 *   Only real pointer movement counts: a list that opens or scrolls under a
 *   resting pointer never changes the active item.
 * @param {Function|null} options.onActivate - Callback when active item changes (arrow keys)
 * @param {Function|null} options.onSelect - Callback when item is selected (Enter/Space)
 * @param {string} options.activeAttribute - Data attribute for active state
 * @returns {Object} Navigation controller
 */

// ─── Did the pointer really move? ───
// Screen coordinates stay put while the page or an ancestor frame scrolls, so
// they are the ones to compare. Some engines report the same screen position
// for every pointer event; until two events have disagreed on it, the viewport
// position is compared as well (it stays put while the page itself scrolls).
let screenPositionVaries = false;

function pointerPosition(event) {
  return { x: event.screenX, y: event.screenY, cx: event.clientX, cy: event.clientY };
}

function pointerMovedFrom(rest, event) {
  if (rest === null) return false;
  const screenMoved = rest.x !== event.screenX || rest.y !== event.screenY;
  if (screenMoved) screenPositionVaries = true;
  return screenMoved || (!screenPositionVaries && (rest.cx !== event.clientX || rest.cy !== event.clientY));
}

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

  // Hover guard (focusOnHover). While suspended, the pointer has to really
  // move before it may change the active item; see handlePointerMove().
  let hoverSuspended = true;
  let restingPoint = null;

  // ─── Item Management ───

  function getItems() {
    return Array.from(container.querySelectorAll(selector)).filter(
      (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true'
    );
  }

  function getActiveItem() {
    const items = getItems();
    return activeIndex >= 0 && activeIndex < items.length
      ? items[activeIndex]
      : null;
  }

  // ─── Activation (roving tabindex) ───

  /**
   * Activate an item from the keyboard or from code. The keyboard is driving
   * from here on, so hover stays out of the way until the pointer really moves.
   */
  function activateItem(index, shouldFocus = true) {
    suspendHover();
    setActiveItem(index, shouldFocus);
  }

  function setActiveItem(index, shouldFocus) {
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
    // Any key means the keyboard is driving, including keys the browser
    // handles itself (PageDown scrolling the list under a resting pointer).
    suspendHover();

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
        if (event.key === ' ' && typeahead && typeaheadBuffer !== '') {
          // Space inside a typeahead search is part of the search string.
          handleTypeahead(' ');
          handled = true;
        } else if (onSelect) {
          const item = getActiveItem();
          if (item) {
            onSelect(item, activeIndex);
            handled = true;
          }
        }
        // With no onSelect the key belongs to the item itself: a native radio
        // checks on Space, a button clicks. Claiming it here used to swallow
        // Space on an unchecked radio.
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

  // ─── Pointer hover (focusOnHover) ───
  //
  // Browsers re-target hover when content moves under a pointer that is not
  // moving. A list that opens or scrolls beneath a resting pointer fires
  // pointerover / mouseenter on whatever lands there, and some engines add a
  // move event that repeats the last coordinates. Activating on those hands
  // the active item to wherever the pointer happens to rest, so a keyboard
  // user loses their place (and, in a scrolling list, can never get past the
  // item under the pointer).
  //
  // So only pointermove is listened to, and after every keyboard or
  // programmatic activation the pointer must prove that it moved: the first
  // position seen is only recorded, and hover takes over again once a later
  // pointermove reports a different position; see pointerMovedFrom().

  function suspendHover() {
    hoverSuspended = true;
    restingPoint = null;
  }

  function pointerReallyMoved(event) {
    if (!hoverSuspended) return true;

    const moved = pointerMovedFrom(restingPoint, event);
    restingPoint = pointerPosition(event);
    if (moved) hoverSuspended = false;
    return moved;
  }

  function handlePointerMove(event) {
    // A finger dragging over the list is scrolling it, not hovering.
    if (event.pointerType === 'touch') return;
    if (!pointerReallyMoved(event)) return;

    const target = event.target instanceof Element ? event.target.closest(selector) : null;
    const index = target ? getItems().indexOf(target) : -1;
    if (index !== -1 && index !== activeIndex) {
      setActiveItem(index, false); // Don't steal keyboard focus
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
    suspendHover();

    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('focusin', handleFocusIn);

    if (focusOnHover) {
      // Delegated, so items added after attach() are covered too.
      container.addEventListener('pointermove', handlePointerMove);
    }
  }

  function detach() {
    if (!attached) return;
    attached = false;

    container.removeEventListener('keydown', handleKeyDown);
    container.removeEventListener('focusin', handleFocusIn);

    if (focusOnHover) {
      container.removeEventListener('pointermove', handlePointerMove);
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
