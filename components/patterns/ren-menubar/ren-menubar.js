/**
 * RenDS Menubar Component
 * Horizontal menu bar with WAI-ARIA Menubar pattern support
 *
 * Features:
 * - Keyboard navigation (Arrow keys, Enter, Space, Escape, Home, End)
 * - Roving focus with "menubar glide" (hover opens adjacent menus when one is open)
 * - Typeahead character matching for quick item selection
 * - Checkbox and radio menu items with state management
 * - Submenu support with nested navigation
 * - Full accessibility compliance with ARIA roles and attributes
 *
 * Dismissal model:
 *   Click-outside and Escape run through the shared dismissable layer stack
 *   (`utils/dismissable.js`) instead of component-owned document listeners.
 *   Every open panel is its own layer: the top-level menu pushes one layer and
 *   each open submenu pushes another on top of it. Escape therefore pops a
 *   single level (submenu first, parent menu second) and never collapses
 *   sibling overlays that happen to be open elsewhere on the page.
 *
 * Usage:
 * <ren-menubar>
 *   <div class="ren-menubar" role="menubar">
 *     <button class="ren-menubar-trigger">File</button>
 *     <div class="ren-menubar-menu" role="menu" hidden>
 *       <button class="ren-menubar-item" role="menuitem">New</button>
 *       <div class="ren-menubar-item ren-menubar-submenu" role="menuitem">More
 *         <div class="ren-menubar-menu" role="menu" hidden>
 *           <button class="ren-menubar-item" role="menuitem">Nested</button>
 *         </div>
 *       </div>
 *     </div>
 *   </div>
 * </ren-menubar>
 *
 * Events:
 * - ren-menubar-select: Fired when a menu item is activated
 *   detail: { item: Element, value: string, checked?: boolean }
 *
 * Public Methods:
 * - closeAll(): Close all open menus and submenus
 * - openMenu(triggerIndex): Open menu at specified trigger index
 */

import { createDismissable } from '../../../utils/dismissable.js';

const ITEM_SELECTOR =
  '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]';
const MENU_SELECTOR = '.ren-menubar-menu';

export class RenMenubar extends HTMLElement {
  /** @type {AbortController|null} */
  #listeners = null;

  /** Dismissable layer for the open top-level menu. */
  #menuLayer = null;

  /** Open submenus, innermost last. Each entry owns its own layer. */
  #submenuStack = [];

  constructor() {
    super();
    this.triggers = [];
    this.menus = [];
    this.activeMenuIndex = -1;
    this.currentMenu = null;
    this.focusedItem = null;
    this.typeaheadBuffer = '';
    this.typeaheadTimeout = null;
  }

  /* ===================================================================
     LIFECYCLE HOOKS
     =================================================================== */

  connectedCallback() {
    this.initialize();
  }

  disconnectedCallback() {
    this.closeAll({ focusTrigger: false });
    this.#listeners?.abort();
    this.#listeners = null;

    if (this.typeaheadTimeout) {
      clearTimeout(this.typeaheadTimeout);
      this.typeaheadTimeout = null;
    }
    this.typeaheadBuffer = '';
  }

  /* ===================================================================
     INITIALIZATION
     =================================================================== */

  /**
   * Initialize the menubar:
   * - Cache triggers and menus
   * - Set up ARIA attributes
   * - Attach event listeners (all bound to a single AbortController so a
   *   disconnect/reconnect cycle never installs duplicates)
   */
  initialize() {
    const menubarEl = this.querySelector('[role="menubar"]');
    if (!menubarEl) return;

    this.#listeners?.abort();
    this.#listeners = new AbortController();
    const { signal } = this.#listeners;

    // Find all triggers and their associated menus.
    // Index alignment between `triggers` and `menus` is load bearing, so a
    // trigger without a panel keeps a null slot instead of shifting the rest.
    this.triggers = Array.from(menubarEl.querySelectorAll('.ren-menubar-trigger'));
    this.menus = this.triggers.map((trigger) => {
      const menu = trigger.nextElementSibling;
      if (menu && menu.classList.contains('ren-menubar-menu')) {
        return menu;
      }
      return null;
    });

    // Ensure triggers and menus have proper ARIA attributes
    this.triggers.forEach((trigger, index) => {
      trigger.setAttribute('aria-haspopup', 'true');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('role', 'button');
      trigger.addEventListener('click', () => this.toggleMenu(index), { signal });
      trigger.addEventListener('keydown', (e) => this.handleTriggerKeydown(e, index), { signal });
      trigger.addEventListener('mouseenter', () => this.handleTriggerMouseenter(index), { signal });
    });

    // Set up menu items at every depth (top-level panels and nested submenus).
    // Handlers resolve their own menu context from the DOM, so nesting never
    // depends on a stale index captured at init time.
    menubarEl.querySelectorAll(ITEM_SELECTOR).forEach((item) => {
      if (!item.hasAttribute('tabindex')) {
        item.setAttribute('tabindex', '-1');
      }
      item.addEventListener('click', (e) => this.handleItemClick(e, item), { signal });
      item.addEventListener('keydown', (e) => this.handleItemKeydown(e, item), { signal });
      item.addEventListener('mouseenter', () => this.handleItemMouseenter(item), { signal });
    });

    // Submenu parents advertise their popup and start collapsed.
    menubarEl.querySelectorAll('.ren-menubar-submenu').forEach((parentItem) => {
      const panel = this.#submenuPanel(parentItem);
      if (!panel) return;
      parentItem.setAttribute('aria-haspopup', 'menu');
      parentItem.setAttribute('aria-expanded', 'false');
      panel.setAttribute('hidden', '');
    });
  }

  /* ===================================================================
     DISMISSABLE LAYERS (click outside / Escape)
     =================================================================== */

  /**
   * Push the open top-level menu onto the shared layer stack.
   * @private
   */
  #activateMenuLayer(index) {
    const menu = this.menus[index];
    if (!menu) return;

    this.#menuLayer?.deactivate();
    this.#menuLayer = createDismissable(menu, {
      // The panel is the layer container; triggers are never "outside" so a
      // pointerdown on them reaches the click handler and toggles normally.
      triggerElement: this.triggers[index],
      excludeElements: this.triggers,
      escapeKey: true,
      clickOutside: true,
      onDismiss: (reason) => {
        this.closeMenu(index, { focusTrigger: reason === 'escape' });
      },
    });
    this.#menuLayer.activate();
  }

  /**
   * Resolve the panel owned by a submenu parent item.
   * @private
   */
  #submenuPanel(parentItem) {
    return parentItem?.querySelector(MENU_SELECTOR) || null;
  }

  /**
   * True when the item owns a submenu panel.
   * @private
   */
  #isSubmenuParent(item) {
    return Boolean(
      item &&
        item.classList.contains('ren-menubar-submenu') &&
        this.#submenuPanel(item)
    );
  }

  /**
   * Index of the top-level menu that owns a node (walks out of submenus).
   * @private
   */
  #ownerMenuIndex(node) {
    let panel = node?.closest(MENU_SELECTOR) || null;
    while (panel) {
      const index = this.menus.indexOf(panel);
      if (index !== -1) return index;
      panel = panel.parentElement?.closest(MENU_SELECTOR) || null;
    }
    return this.activeMenuIndex;
  }

  /**
   * The item that fired an event, so a nested panel does not double-handle it
   * while the event bubbles through its parent item.
   * @private
   */
  #eventItem(event) {
    const target = event.target instanceof Element ? event.target : null;
    return target?.closest(ITEM_SELECTOR) || null;
  }

  /* ===================================================================
     MENU MANAGEMENT
     =================================================================== */

  /**
   * Toggle menu visibility for trigger at index
   */
  toggleMenu(index) {
    if (this.activeMenuIndex === index) {
      this.closeAll();
    } else {
      this.openMenu(index);
    }
  }

  /**
   * Open menu at specified trigger index and focus first item
   * @param {number} index - Index of the trigger to open
   * @public
   */
  openMenu(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this.triggers.length) {
      throw new RangeError(`Invalid trigger index: ${index}`);
    }

    // Close any other open menu without bouncing focus back to its trigger.
    if (this.activeMenuIndex !== -1 && this.activeMenuIndex !== index) {
      this.closeMenu(this.activeMenuIndex, { focusTrigger: false });
    }

    const trigger = this.triggers[index];
    const menu = this.menus[index];

    if (!menu) {
      // Trigger without a panel: keep roving focus consistent.
      trigger.focus();
      return;
    }

    // Re-entering the same menu collapses whatever submenu was open.
    this.#closeAllSubmenus();

    menu.removeAttribute('hidden');
    trigger.setAttribute('aria-expanded', 'true');
    this.activeMenuIndex = index;
    this.currentMenu = menu;
    this.#activateMenuLayer(index);

    const items = this.getMenuItems(menu);
    if (items.length > 0) {
      this.focusItem(items[0]);
    }
  }

  /**
   * Close menu at specified index
   * @param {number} index
   * @param {Object} [options]
   * @param {boolean} [options.focusTrigger] - Return focus to the trigger when
   *   focus currently lives inside the menubar (keyboard dismissal). Pointer
   *   dismissal passes false so an outside click keeps its own target focused.
   */
  closeMenu(index, { focusTrigger = true } = {}) {
    if (index < 0 || index >= this.triggers.length) return;

    const trigger = this.triggers[index];
    const menu = this.menus[index];
    const restoreFocus = focusTrigger && this.contains(document.activeElement);

    if (menu) {
      this.#closeAllSubmenus();
      menu.setAttribute('hidden', '');
      trigger.setAttribute('aria-expanded', 'false');
    }

    if (this.activeMenuIndex === index) {
      this.#menuLayer?.deactivate();
      this.#menuLayer = null;
      this.activeMenuIndex = -1;
      this.currentMenu = null;
      this.focusedItem?.classList.remove('is-focused');
      this.focusedItem = null;
      if (restoreFocus) trigger.focus();
    }
  }

  /**
   * Close all open menus and submenus
   * @param {Object} [options]
   * @param {boolean} [options.focusTrigger]
   * @public
   */
  closeAll({ focusTrigger = true } = {}) {
    this.#closeAllSubmenus();
    if (this.activeMenuIndex !== -1) {
      this.closeMenu(this.activeMenuIndex, { focusTrigger });
    }
  }

  /* ===================================================================
     SUBMENUS
     =================================================================== */

  /**
   * Open the submenu owned by `parentItem` and push its own dismissable layer.
   * @param {HTMLElement} parentItem
   * @param {Object} [options]
   * @param {boolean} [options.focusFirst] - Move focus into the submenu
   *   (keyboard opening). Hover opening leaves focus where it is.
   * @returns {HTMLElement|null} the submenu panel
   */
  openSubmenu(parentItem, { focusFirst = true } = {}) {
    const panel = this.#submenuPanel(parentItem);
    if (!panel) return null;

    const alreadyOpen = this.#submenuStack.some((entry) => entry.panel === panel);
    if (!alreadyOpen) {
      // Collapse sibling branches before opening this one.
      this.#closeSubmenusOutside(parentItem);

      panel.removeAttribute('hidden');
      parentItem.setAttribute('aria-expanded', 'true');

      const layer = createDismissable(panel, {
        triggerElement: parentItem,
        escapeKey: true,
        clickOutside: true,
        onDismiss: (reason, event) => {
          if (reason === 'escape') {
            // ARIA menubar: Escape closes only this submenu and returns focus
            // to the parent item; the parent menu stays open.
            this.closeSubmenu(panel, { focusParent: true });
            return;
          }
          // A pointer landing anywhere outside the whole menubar tears the
          // tree down; one that stays inside only pops this level.
          if (event && this.contains(event.target)) {
            this.closeSubmenu(panel, { focusParent: false });
          } else {
            this.closeAll({ focusTrigger: false });
          }
        },
      });
      layer.activate();
      this.#submenuStack.push({ panel, parentItem, layer });
    }

    if (focusFirst) {
      const items = this.getMenuItems(panel);
      if (items.length > 0) this.focusItem(items[0]);
    }

    return panel;
  }

  /**
   * Close a submenu panel and everything nested inside it.
   * @param {HTMLElement} panel
   * @param {Object} [options]
   * @param {boolean} [options.focusParent]
   */
  closeSubmenu(panel, { focusParent = false } = {}) {
    const index = this.#submenuStack.findIndex((entry) => entry.panel === panel);
    if (index === -1) return;

    const removed = this.#submenuStack.splice(index);
    for (let i = removed.length - 1; i >= 0; i -= 1) {
      const entry = removed[i];
      entry.layer.deactivate();
      entry.panel.setAttribute('hidden', '');
      entry.parentItem.setAttribute('aria-expanded', 'false');
    }

    if (focusParent) {
      this.focusItem(removed[0].parentItem);
    }
  }

  /**
   * Close every open submenu that does not contain (or own) `node`.
   * @private
   */
  #closeSubmenusOutside(node) {
    for (let i = this.#submenuStack.length - 1; i >= 0; i -= 1) {
      const entry = this.#submenuStack[i];
      if (entry.panel.contains(node) || entry.parentItem === node) break;
      this.closeSubmenu(entry.panel);
    }
  }

  /**
   * Close every open submenu, innermost first.
   * @private
   */
  #closeAllSubmenus() {
    while (this.#submenuStack.length > 0) {
      this.closeSubmenu(this.#submenuStack[this.#submenuStack.length - 1].panel);
    }
  }

  /* ===================================================================
     ITEM NAVIGATION & FOCUS
     =================================================================== */

  /**
   * Get focusable menu items owned directly by a panel.
   * Items living inside a nested submenu belong to that submenu, not here.
   */
  getMenuItems(menu) {
    if (!menu) return [];

    const items = Array.from(menu.querySelectorAll(ITEM_SELECTOR));
    return items.filter(
      (item) =>
        item.closest(MENU_SELECTOR) === menu && !item.hasAttribute('data-disabled')
    );
  }

  /**
   * Focus a specific menu item and update aria-selected state
   */
  focusItem(item) {
    if (!item) return;

    // Remove focus class from previously focused item
    if (this.focusedItem && this.focusedItem !== item) {
      this.focusedItem.classList.remove('is-focused');
    }

    this.focusedItem = item;
    item.classList.add('is-focused');
    item.focus();
  }

  /**
   * Get the next focusable item in menu (wraps around)
   */
  getNextItem(menu, currentItem, direction = 1) {
    const items = this.getMenuItems(menu);
    if (items.length === 0) return null;

    const currentIndex = items.indexOf(currentItem);
    const nextIndex = (currentIndex + direction + items.length) % items.length;
    return items[nextIndex];
  }

  /* ===================================================================
     EVENT HANDLERS: TRIGGERS
     =================================================================== */

  /**
   * Handle keyboard events on trigger buttons
   */
  handleTriggerKeydown(event, triggerIndex) {
    const { key } = event;

    // ArrowRight: move to next trigger
    if (key === 'ArrowRight') {
      event.preventDefault();
      const nextIndex = (triggerIndex + 1) % this.triggers.length;
      this.openMenu(nextIndex);
    }

    // ArrowLeft: move to previous trigger
    if (key === 'ArrowLeft') {
      event.preventDefault();
      const prevIndex = (triggerIndex - 1 + this.triggers.length) % this.triggers.length;
      this.openMenu(prevIndex);
    }

    // ArrowDown: open menu
    if (key === 'ArrowDown' || key === ' ' || key === 'Enter') {
      event.preventDefault();
      this.openMenu(triggerIndex);
    }

    // Home: first trigger
    if (key === 'Home') {
      event.preventDefault();
      this.openMenu(0);
    }

    // End: last trigger
    if (key === 'End') {
      event.preventDefault();
      this.openMenu(this.triggers.length - 1);
    }
  }

  /**
   * Handle mouse enter on trigger (roving focus "glide" behavior)
   * If a menu is already open, open the new menu instead
   */
  handleTriggerMouseenter(triggerIndex) {
    if (this.activeMenuIndex !== -1 && this.activeMenuIndex !== triggerIndex) {
      this.openMenu(triggerIndex);
    }
  }

  /* ===================================================================
     EVENT HANDLERS: MENU ITEMS
     =================================================================== */

  /**
   * Handle click on menu item
   * @param {MouseEvent} event
   * @param {HTMLElement} item - the item this listener is bound to
   */
  handleItemClick(event, item) {
    if (this.#eventItem(event) !== item) return;

    event.preventDefault();
    if (item.hasAttribute('data-disabled')) return;

    // A submenu parent is a gateway, not a command: it never emits select and
    // never closes on click (hover already opened it, so a toggle would read
    // as the panel flickering shut under the pointer).
    if (this.#isSubmenuParent(item)) {
      this.openSubmenu(item, { focusFirst: true });
      return;
    }

    this.activateItem(item);
  }

  /**
   * Handle keyboard events within menu
   * @param {KeyboardEvent} event
   * @param {HTMLElement} item - the item this listener is bound to
   */
  handleItemKeydown(event, item) {
    if (this.#eventItem(event) !== item) return;

    const { key } = event;
    const menu = item.closest(MENU_SELECTOR);
    if (!menu) return;

    const items = this.getMenuItems(menu);
    const ownerIndex = this.#ownerMenuIndex(item);
    const inSubmenu = this.menus.indexOf(menu) === -1;

    // ArrowDown: next item
    if (key === 'ArrowDown') {
      event.preventDefault();
      const nextItem = this.getNextItem(menu, item, 1);
      if (nextItem) this.focusItem(nextItem);
    }

    // ArrowUp: previous item
    if (key === 'ArrowUp') {
      event.preventDefault();
      const prevItem = this.getNextItem(menu, item, -1);
      if (prevItem) this.focusItem(prevItem);
    }

    // ArrowRight: open submenu, else move to the next menubar menu
    if (key === 'ArrowRight') {
      event.preventDefault();
      if (this.#isSubmenuParent(item)) {
        this.openSubmenu(item, { focusFirst: true });
      } else if (this.triggers.length > 0) {
        const nextIndex = (ownerIndex + 1) % this.triggers.length;
        this.openMenu(nextIndex);
      }
    }

    // ArrowLeft: close submenu (focus the parent item), else previous menu
    if (key === 'ArrowLeft') {
      event.preventDefault();
      if (inSubmenu) {
        this.closeSubmenu(menu, { focusParent: true });
      } else if (this.triggers.length > 0) {
        const prevIndex = (ownerIndex - 1 + this.triggers.length) % this.triggers.length;
        this.openMenu(prevIndex);
      }
    }

    // Enter or Space: open submenu or activate item
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      if (this.#isSubmenuParent(item)) {
        this.openSubmenu(item, { focusFirst: true });
      } else {
        this.activateItem(item);
      }
    }

    // Escape is owned by the shared dismissable layer stack: the capture-phase
    // handler in utils/dismissable.js pops exactly one layer (this submenu, or
    // the top-level menu) and stops propagation before it reaches this point.

    // Home: first item
    if (key === 'Home') {
      event.preventDefault();
      if (items.length > 0) this.focusItem(items[0]);
    }

    // End: last item
    if (key === 'End') {
      event.preventDefault();
      if (items.length > 0) this.focusItem(items[items.length - 1]);
    }

    // Typeahead: match item by first letter
    if (key.length === 1 && /^[a-z0-9]$/i.test(key)) {
      event.preventDefault();
      this.handleTypeahead(key, menu);
    }
  }

  /**
   * Handle mouse enter on item (focus, submenu glide, clear typeahead)
   * @param {HTMLElement} item
   */
  handleItemMouseenter(item) {
    // Leaving a branch collapses it so panels never overlap.
    this.#closeSubmenusOutside(item);

    if (item) {
      this.focusItem(item);
    }

    // Hover opens a submenu but keeps focus on the parent item.
    if (this.#isSubmenuParent(item)) {
      this.openSubmenu(item, { focusFirst: false });
    }

    // Clear typeahead buffer on mouse movement
    this.typeaheadBuffer = '';
    if (this.typeaheadTimeout) {
      clearTimeout(this.typeaheadTimeout);
    }
  }

  /* ===================================================================
     ITEM ACTIVATION & STATE MANAGEMENT
     =================================================================== */

  /**
   * Activate a menu item (handle checkbox/radio states and emit event)
   */
  activateItem(item) {
    if (item.hasAttribute('data-disabled')) return;

    const role = item.getAttribute('role');

    // Handle checkbox items
    if (role === 'menuitemcheckbox') {
      const isChecked = item.getAttribute('aria-checked') === 'true';
      item.setAttribute('aria-checked', !isChecked ? 'true' : 'false');
      this.emitSelectEvent(item, !isChecked);
    }
    // Handle radio items
    else if (role === 'menuitemradio') {
      const name = item.getAttribute('name');
      const menu = item.closest('[role="menu"]') || item.closest(MENU_SELECTOR);
      const radioGroup = menu
        ? menu.querySelectorAll(`[role="menuitemradio"][name="${name}"]`)
        : [];
      radioGroup.forEach((radio) => radio.setAttribute('aria-checked', 'false'));
      item.setAttribute('aria-checked', 'true');
      this.emitSelectEvent(item, true);
    }
    // Handle standard menu items
    else {
      this.emitSelectEvent(item);
    }

    // Close menu after activation (unless it's a checkbox/radio)
    if (role !== 'menuitemcheckbox' && role !== 'menuitemradio') {
      this.closeAll();
    }
  }

  /**
   * Emit ren-menubar-select event with item details
   */
  emitSelectEvent(item, checked = undefined) {
    const detail = {
      item,
      value: item.textContent?.trim() || item.getAttribute('value') || '',
    };

    if (checked !== undefined) {
      detail.checked = checked;
    }

    this.dispatchEvent(new CustomEvent('ren-menubar-select', {
      detail,
      bubbles: true,
      composed: true,
    }));
  }

  /* ===================================================================
     TYPEAHEAD SUPPORT
     =================================================================== */

  /**
   * Handle typeahead character matching
   * Type characters to jump to matching items
   */
  handleTypeahead(char, menu) {
    // Clear buffer after 500ms of inactivity
    if (this.typeaheadTimeout) {
      clearTimeout(this.typeaheadTimeout);
    }

    this.typeaheadBuffer += char.toLowerCase();

    // Find item matching buffer
    const items = this.getMenuItems(menu);
    if (items.length === 0) return;

    const currentIndex = items.indexOf(this.focusedItem);
    const startIndex = (currentIndex + 1) % items.length;

    let matchedItem = null;
    for (let i = 0; i < items.length; i++) {
      const index = (startIndex + i) % items.length;
      const item = items[index];
      const text = item.textContent?.trim().toLowerCase() || '';
      if (text.startsWith(this.typeaheadBuffer)) {
        matchedItem = item;
        break;
      }
    }

    if (matchedItem) {
      this.focusItem(matchedItem);
    }

    // Clear buffer after 500ms
    this.typeaheadTimeout = setTimeout(() => {
      this.typeaheadBuffer = '';
    }, 500);
  }
}

// Register custom element
if (!customElements.get('ren-menubar')) {
  customElements.define('ren-menubar', RenMenubar);
}
