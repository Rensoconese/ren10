/**
 * RenCommand Component - Command Palette / Spotlight search
 * Modern dialog-based command palette with keyboard navigation
 */

const KEYBOARD_CODES = {
  Escape: 'Escape',
  Enter: 'Enter',
  ArrowDown: 'ArrowDown',
  ArrowUp: 'ArrowUp'
};

class RenCommand extends HTMLElement {
  constructor() {
    super();
    this._dialog = null;
    this._input = null;
    this._list = null;
    this._items = [];
    this._groups = [];
    this._highlightedIndex = 0;
    this._shortcuts = new Map();
    this._focusTrap = null;
    this._lastQuery = '';
    this._shortcutKey = 'k';
    this._shortcutMeta = 'ctrl';
  }

  connectedCallback() {
    this._initDialog();
    this._initElements();
    this._attachEventListeners();
    this._setupGlobalShortcut();
  }

  disconnectedCallback() {
    this._removeEventListeners();
  }

  _initDialog() {
    this._dialog = this.querySelector('dialog') || this;
    if (this._dialog !== this && this._dialog.tagName !== 'DIALOG') {
      // Fallback: ensure we have a dialog
      this._dialog = this;
    }
  }

  _initElements() {
    this._input = this.querySelector('.ren-command-input');
    this._list = this.querySelector('.ren-command-list');
    this._items = Array.from(this.querySelectorAll('.ren-command-item'));
    this._groups = Array.from(this.querySelectorAll('.ren-command-group'));
  }

  _attachEventListeners() {
    // Input events
    if (this._input) {
      this._input.addEventListener('input', (e) => this._handleInput(e));
      this._input.addEventListener('keydown', (e) => this._handleKeydown(e));
    }

    // Item selection
    this._items.forEach((item, index) => {
      item.addEventListener('click', () => this._selectItem(index));
      item.addEventListener('mouseenter', () => this._setHighlighted(index));
      item.addEventListener('focus', () => this._setHighlighted(index));
    });

    // Dialog close
    if (this._dialog && this._dialog.tagName === 'DIALOG') {
      this._dialog.addEventListener('cancel', () => this._close());
    }

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === KEYBOARD_CODES.Escape && this._isOpen()) {
        this._close();
      }
    });
  }

  _removeEventListeners() {
    if (this._input) {
      this._input.removeEventListener('input', (e) => this._handleInput(e));
      this._input.removeEventListener('keydown', (e) => this._handleKeydown(e));
    }

    this._items.forEach((item) => {
      item.removeEventListener('click', () => {});
      item.removeEventListener('mouseenter', () => {});
      item.removeEventListener('focus', () => {});
    });
  }

  _setupGlobalShortcut() {
    const shortcut = this.getAttribute('data-shortcut') || 'ctrl+k';
    const [meta, key] = shortcut.toLowerCase().split('+');
    this._shortcutKey = key || 'k';
    this._shortcutMeta = meta || 'ctrl';

    document.addEventListener('keydown', (e) => {
      const isMetaKey = this._shortcutMeta === 'ctrl' ? e.ctrlKey : e.metaKey;
      if (isMetaKey && e.key.toLowerCase() === this._shortcutKey) {
        e.preventDefault();
        this._open();
      }
    });
  }

  _open() {
    if (this._dialog.tagName === 'DIALOG') {
      this._dialog.showModal?.();
    } else {
      this.style.display = 'block';
    }

    if (this._input) {
      this._input.focus();
      this._input.select();
    }

    this._highlightedIndex = 0;
    this._updateUI();
  }

  _close() {
    if (this._dialog.tagName === 'DIALOG') {
      this._dialog.close?.();
    } else {
      this.style.display = 'none';
    }

    this._input?.blur();
  }

  _isOpen() {
    if (this._dialog.tagName === 'DIALOG') {
      return this._dialog.open;
    }
    return this.style.display !== 'none';
  }

  _handleInput(e) {
    const query = e.target.value.toLowerCase().trim();
    this._lastQuery = query;
    this._filterItems(query);
    this._highlightedIndex = 0;
    this._updateUI();
  }

  _handleKeydown(e) {
    switch (e.key) {
      case KEYBOARD_CODES.ArrowDown:
        e.preventDefault();
        this._moveHighlight(1);
        break;
      case KEYBOARD_CODES.ArrowUp:
        e.preventDefault();
        this._moveHighlight(-1);
        break;
      case KEYBOARD_CODES.Enter:
        e.preventDefault();
        const visibleItem = this._getVisibleItems()[this._highlightedIndex];
        if (visibleItem) {
          this._selectItem(this._items.indexOf(visibleItem));
        }
        break;
      case KEYBOARD_CODES.Escape:
        e.preventDefault();
        this._close();
        break;
    }
  }

  _filterItems(query) {
    this._items.forEach(item => {
      if (!query) {
        item.style.display = '';
        return;
      }

      const title = item.querySelector('.ren-command-item-title')?.textContent || '';
      const description = item.querySelector('.ren-command-item-description')?.textContent || '';
      const keywords = item.getAttribute('data-keywords') || '';
      const searchableText = `${title} ${description} ${keywords}`.toLowerCase();

      const matches = query.split(' ').every(term => searchableText.includes(term));
      item.style.display = matches ? '' : 'none';
    });

    this._updateGroupVisibility();
    this._announceResults();
  }

  _updateGroupVisibility() {
    this._groups.forEach(group => {
      const visibleItems = Array.from(group.querySelectorAll('.ren-command-item'))
        .filter(item => item.style.display !== 'none');

      if (visibleItems.length === 0) {
        group.setAttribute('data-empty', '');
      } else {
        group.removeAttribute('data-empty');
      }
    });

    const hasVisibleItems = this._getVisibleItems().length > 0;
    const empty = this.querySelector('.ren-command-empty');
    if (empty) {
      empty.style.display = hasVisibleItems ? 'none' : 'block';
    }
  }

  _getVisibleItems() {
    return this._items.filter(item => item.style.display !== 'none');
  }

  /**
   * Announce number of search results to screen readers
   * @private
   */
  _announceResults() {
    const visibleItems = this._getVisibleItems();
    const resultCount = visibleItems.length;

    // Find or create announcement region
    let announcement = this.querySelector('[role="status"][aria-live="polite"]');
    if (!announcement) {
      announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.className = 'ren-sr-only';
      this.appendChild(announcement);
    }

    if (resultCount === 0) {
      announcement.textContent = 'No results found';
    } else {
      announcement.textContent = `${resultCount} result${resultCount !== 1 ? 's' : ''} available`;
    }
  }

  _moveHighlight(direction) {
    const visibleItems = this._getVisibleItems();
    if (visibleItems.length === 0) return;

    let newIndex = this._highlightedIndex + direction;
    if (newIndex < 0) newIndex = visibleItems.length - 1;
    if (newIndex >= visibleItems.length) newIndex = 0;

    this._highlightedIndex = newIndex;
    this._updateUI();

    const item = visibleItems[newIndex];
    item?.scrollIntoView({ block: 'nearest' });
  }

  _setHighlighted(itemIndex) {
    this._highlightedIndex = this._getVisibleItems().indexOf(this._items[itemIndex]);
    if (this._highlightedIndex === -1) this._highlightedIndex = 0;
    this._updateUI();
  }

  _updateUI() {
    const visibleItems = this._getVisibleItems();
    visibleItems.forEach((item, index) => {
      if (index === this._highlightedIndex) {
        item.setAttribute('data-highlighted', '');
        item.focus();
      } else {
        item.removeAttribute('data-highlighted');
      }
    });
  }

  _selectItem(itemIndex) {
    const item = this._items[itemIndex];
    if (!item || item.style.display === 'none') return;

    const value = item.getAttribute('data-value') || item.textContent;
    const action = item.getAttribute('data-action');

    const event = new CustomEvent('ren-command-select', {
      detail: { item, value, action },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);

    // Call registered action handler
    if (action && this._shortcuts.has(action)) {
      this._shortcuts.get(action)();
    }

    this._resetCommand();
    this._close();
  }

  _resetCommand() {
    if (this._input) {
      this._input.value = '';
      this._lastQuery = '';
    }
    this._filterItems('');
    this._highlightedIndex = 0;
    this._updateUI();
  }

  // Public API
  open() {
    this._open();
  }

  close() {
    this._close();
  }

  registerAction(id, handler) {
    if (typeof handler === 'function') {
      this._shortcuts.set(id, handler);
    }
  }

  unregisterAction(id) {
    this._shortcuts.delete(id);
  }

  setItems(items) {
    if (Array.isArray(items)) {
      this._items = items;
      this._initElements();
      this._updateUI();
    }
  }

  get query() {
    return this._lastQuery;
  }

  get isOpen() {
    return this._isOpen();
  }
}

customElements.define('ren-command', RenCommand);
