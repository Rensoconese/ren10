/**
 * RenSidebar Component - Collapsible sidebar for app layouts
 * Supports desktop collapse and mobile overlay modes
 */

const MOBILE_BREAKPOINT = 768;
const STORAGE_KEY = 'ren-sidebar-collapsed';
const KEYBOARD_CODES = { Escape: 'Escape' };

class RenSidebar extends HTMLElement {
  constructor() {
    super();
    this._toggleBtn = null;
    this._isCollapsed = false;
    this._isOpen = false;
    this._isMobile = false;
    this._navItems = [];
    this._listenerController = null;
    this._storageKey = STORAGE_KEY;
  }

  connectedCallback() {
    this._initElements();
    // Mobile state must be known before restoring: _restoreState() consults
    // _isMobile to decide whether the stored preference applies.
    this._updateMobileState();
    this._restoreState();
    this._attachEventListeners();
  }

  disconnectedCallback() {
    this._removeEventListeners();
  }

  _initElements() {
    this._toggleBtn = this.querySelector('.ren-sidebar-toggle');
    this._navItems = Array.from(this.querySelectorAll('.ren-sidebar-item'));
    this._storageKey = this.getAttribute('storage-key') || STORAGE_KEY;
  }

  _attachEventListeners() {
    this._listenerController?.abort();
    this._listenerController = new AbortController();
    const { signal } = this._listenerController;

    // Toggle collapse button
    if (this._toggleBtn) {
      this._toggleBtn.addEventListener('click', () => this._toggleCollapse(), { signal });
    }

    // Nav item clicks
    this._navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.currentTarget.hasAttribute('href')) {
          this._setActiveItem(e.currentTarget);
        }
        if (this._isMobile && this._isOpen) {
          this._closeMenu();
        }
      }, { signal });
    });

    // Close on Escape (mobile)
    document.addEventListener('keydown', (e) => {
      if (e.key === KEYBOARD_CODES.Escape && this._isMobile && this._isOpen) {
        this._closeMenu();
      }
    }, { signal });

    // Handle window resize
    window.addEventListener('resize', () => {
      this._updateMobileState();
    }, { signal });

    // Close menu on outside click (mobile)
    document.addEventListener('click', (e) => {
      if (this._isMobile && this._isOpen && !this.contains(e.target)) {
        const overlay = this.nextElementSibling;
        if (overlay && overlay.classList.contains('ren-sidebar-overlay')) {
          if (overlay.contains(e.target)) {
            this._closeMenu();
          }
        }
      }
    }, { signal });
  }

  _removeEventListeners() {
    this._listenerController?.abort();
    this._listenerController = null;
  }

  /** User-initiated collapse toggle — the only path that persists a preference. */
  _toggleCollapse() {
    this._applyCollapsed(!this._isCollapsed, { persist: true });
  }

  /**
   * Applies the visual collapsed state. Persistence is opt-in so that
   * layout-driven transitions (mobile overlay, viewport resize) never
   * overwrite the user's stored desktop preference.
   */
  _applyCollapsed(isCollapsed, { persist = false } = {}) {
    const changed = this._isCollapsed !== isCollapsed;
    this._isCollapsed = isCollapsed;
    this.toggleAttribute('data-collapsed', isCollapsed);

    if (persist) {
      this._writeCollapsedState(isCollapsed);
    }

    if (changed) {
      this._dispatchToggleEvent();
    }
  }

  _openMenu() {
    if (!this._isMobile) return;
    this._isOpen = true;
    this.setAttribute('data-open', '');
  }

  _closeMenu() {
    this._isOpen = false;
    this.removeAttribute('data-open');
  }

  _updateMobileState() {
    const wasMobile = this._isMobile;
    this._isMobile = window.innerWidth < MOBILE_BREAKPOINT;

    if (this._isMobile) {
      // The mobile overlay always renders expanded. That is a layout
      // constraint, not a user choice, so it must not be persisted.
      this._applyCollapsed(false, { persist: false });
      return;
    }

    // Back on desktop: drop the overlay and re-apply the stored preference.
    if (this._isOpen) {
      this._closeMenu();
    }

    if (wasMobile) {
      this._applyCollapsed(this._readCollapsedState(), { persist: false });
    }
  }

  _restoreState() {
    // On mobile the stored preference is ignored but deliberately preserved.
    if (this._isMobile) return;
    this._applyCollapsed(this._readCollapsedState(), { persist: false });
  }

  _readCollapsedState() {
    try {
      return localStorage.getItem(this._storageKey) === 'true';
    } catch {
      return false;
    }
  }

  _writeCollapsedState(isCollapsed) {
    try {
      localStorage.setItem(this._storageKey, isCollapsed ? 'true' : 'false');
    } catch {
      // Storage can be blocked in private contexts; visual state still updates.
    }
  }

  _setActiveItem(item) {
    this._navItems.forEach(navItem => {
      navItem.classList.remove('active');
      navItem.removeAttribute('aria-current');
    });

    item.classList.add('active');
    item.setAttribute('aria-current', 'page');
  }

  _dispatchToggleEvent() {
    const event = new CustomEvent('ren-sidebar-toggle', {
      detail: { collapsed: this._isCollapsed },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  // Public API
  get isCollapsed() {
    return this._isCollapsed;
  }

  get isMobileOpen() {
    return this._isOpen;
  }

  toggleMenu() {
    if (this._isOpen) {
      this._closeMenu();
    } else {
      this._openMenu();
    }
  }

  setActiveItem(href) {
    const item = this._navItems.find((navItem) => navItem.getAttribute('href') === href);
    if (item && item.classList.contains('ren-sidebar-item')) {
      this._setActiveItem(item);
    }
  }

  openMobileMenu() {
    if (this._isMobile) {
      this._openMenu();
    }
  }

  closeMobileMenu() {
    if (this._isMobile) {
      this._closeMenu();
    }
  }
}

customElements.define('ren-sidebar', RenSidebar);
