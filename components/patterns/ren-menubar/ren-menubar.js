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
 * Usage:
 * <ren-menubar>
 *   <div class="ren-menubar" role="menubar">
 *     <button class="ren-menubar-trigger">File</button>
 *     <div class="ren-menubar-menu" role="menu">
 *       <button class="ren-menubar-item" role="menuitem">New</button>
 *     </div>
 *   </div>
 * </ren-menubar>
 *
 * Events:
 * - ren-menubar-select: Fired when a menu item is activated
 *   detail: { item: Element, value: string, checked?: boolean }
 *
 * Public Methods:
 * - closeAll(): Close all open menus
 * - openMenu(triggerIndex): Open menu at specified trigger index
 */

export class RenMenubar extends HTMLElement {
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

  /* ===================================================================
     INITIALIZATION
     =================================================================== */

  /**
   * Initialize the menubar:
   * - Cache triggers and menus
   * - Set up ARIA attributes
   * - Attach event listeners
   */
  initialize() {
    const menubarEl = this.querySelector('[role="menubar"]');
    if (!menubarEl) return;

    // Find all triggers and their associated menus
    this.triggers = Array.from(menubarEl.querySelectorAll('.ren-menubar-trigger'));
    this.menus = this.triggers.map((trigger) => {
      // Menu is the next sibling after the trigger
      const menu = trigger.nextElementSibling;
      if (menu && menu.classList.contains('ren-menubar-menu')) {
        return menu;
      }
      return null;
    }).filter(Boolean);

    // Ensure triggers and menus have proper ARIA attributes
    this.triggers.forEach((trigger, index) => {
      trigger.setAttribute('aria-haspopup', 'true');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('role', 'button');
      trigger.addEventListener('click', () => this.toggleMenu(index));
      trigger.addEventListener('keydown', (e) => this.handleTriggerKeydown(e, index));
      trigger.addEventListener('mouseenter', () => this.handleTriggerMouseenter(index));
    });

    // Set up menu items
    this.menus.forEach((menu, menuIndex) => {
      if (menu) {
        const items = this.getMenuItems(menu);
        items.forEach((item, itemIndex) => {
          item.addEventListener('click', (e) => this.handleItemClick(e, menuIndex, itemIndex));
          item.addEventListener('keydown', (e) => this.handleItemKeydown(e, menuIndex, itemIndex));
          item.addEventListener('mouseenter', () => this.handleItemMouseenter(menuIndex, itemIndex));
        });
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.contains(e.target)) {
        this.closeAll();
      }
    });
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
   */
  openMenu(index) {
    if (index < 0 || index >= this.triggers.length) return;

    // Close any currently open menu
    if (this.activeMenuIndex !== -1) {
      this.closeMenu(this.activeMenuIndex);
    }

    this.activeMenuIndex = index;
    const trigger = this.triggers[index];
    const menu = this.menus[index];

    if (menu) {
      menu.removeAttribute('hidden');
      trigger.setAttribute('aria-expanded', 'true');
      this.currentMenu = menu;

      // Focus first focusable item in menu
      const items = this.getMenuItems(menu);
      if (items.length > 0) {
        this.focusItem(items[0]);
      }
    }
  }

  /**
   * Close menu at specified index
   */
  closeMenu(index) {
    if (index < 0 || index >= this.triggers.length) return;

    const trigger = this.triggers[index];
    const menu = this.menus[index];

    if (menu) {
      menu.setAttribute('hidden', '');
      trigger.setAttribute('aria-expanded', 'false');
    }

    if (this.activeMenuIndex === index) {
      this.activeMenuIndex = -1;
      this.currentMenu = null;
      this.focusedItem = null;
      trigger.focus();
    }
  }

  /**
   * Close all open menus and return focus to the last active trigger
   */
  closeAll() {
    if (this.activeMenuIndex !== -1) {
      this.closeMenu(this.activeMenuIndex);
    }
  }

  /* ===================================================================
     ITEM NAVIGATION & FOCUS
     =================================================================== */

  /**
   * Get focusable menu items (excluding separators and labels)
   */
  getMenuItems(menu) {
    const items = Array.from(menu.querySelectorAll(
      '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]'
    ));
    return items.filter(item => !item.hasAttribute('data-disabled'));
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
   */
  handleItemClick(event, menuIndex, itemIndex) {
    event.preventDefault();
    const menu = this.menus[menuIndex];
    const items = this.getMenuItems(menu);
    const item = items[itemIndex];

    if (!item || item.hasAttribute('data-disabled')) return;

    this.activateItem(item);
  }

  /**
   * Handle keyboard events within menu
   */
  handleItemKeydown(event, menuIndex, itemIndex) {
    const { key } = event;
    const menu = this.menus[menuIndex];
    const items = this.getMenuItems(menu);
    const item = items[itemIndex];

    if (!item) return;

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

    // ArrowRight: open submenu or move to next trigger
    if (key === 'ArrowRight') {
      event.preventDefault();
      const submenu = item.querySelector('.ren-menubar-menu');
      if (submenu && item.classList.contains('ren-menubar-submenu')) {
        submenu.removeAttribute('hidden');
        const subItems = this.getMenuItems(submenu);
        if (subItems.length > 0) this.focusItem(subItems[0]);
      } else {
        // Move to next trigger
        const nextIndex = (menuIndex + 1) % this.triggers.length;
        this.openMenu(nextIndex);
      }
    }

    // ArrowLeft: close submenu or go back to previous menu
    if (key === 'ArrowLeft') {
      event.preventDefault();
      const parentMenu = item.closest('.ren-menubar-menu');
      const parentTrigger = parentMenu?.previousElementSibling;
      if (parentTrigger && parentTrigger.classList.contains('ren-menubar-submenu')) {
        const submenu = parentTrigger.querySelector('.ren-menubar-menu');
        if (submenu) submenu.setAttribute('hidden', '');
        this.focusItem(parentTrigger);
      } else {
        const prevIndex = (menuIndex - 1 + this.triggers.length) % this.triggers.length;
        this.openMenu(prevIndex);
      }
    }

    // Enter or Space: activate item
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      this.activateItem(item);
    }

    // Escape: close menu
    if (key === 'Escape') {
      event.preventDefault();
      this.closeMenu(menuIndex);
    }

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
   * Handle mouse enter on item (focus and close typeahead)
   */
  handleItemMouseenter(menuIndex, itemIndex) {
    const menu = this.menus[menuIndex];
    const items = this.getMenuItems(menu);
    const item = items[itemIndex];

    if (item) {
      this.focusItem(item);
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
      const menu = item.closest('[role="menu"]');
      const radioGroup = menu.querySelectorAll(`[role="menuitemradio"][name="${name}"]`);
      radioGroup.forEach(radio => radio.setAttribute('aria-checked', 'false'));
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

  /* ===================================================================
     PUBLIC API
     =================================================================== */

  /**
   * Close all open menus
   * @public
   */
  closeAll() {
    if (this.activeMenuIndex !== -1) {
      this.closeMenu(this.activeMenuIndex);
    }
  }

  /**
   * Open menu at specified trigger index
   * @param {number} triggerIndex - Index of the trigger to open
   * @public
   */
  openMenu(triggerIndex) {
    if (triggerIndex < 0 || triggerIndex >= this.triggers.length) {
      throw new RangeError(`Invalid trigger index: ${triggerIndex}`);
    }
    this.openMenu(triggerIndex);
  }
}

// Register custom element
if (!customElements.get('ren-menubar')) {
  customElements.define('ren-menubar', RenMenubar);
}
