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
    this._restoreState();
    this._attachEventListeners();
    this._updateMobileState();
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

    // Expose toggle menu for mobile
    this._setupMobileToggle();
  }

  _setupMobileToggle() {
    // Allow external control via method
    this.toggleMenu = () => {
      if (this._isOpen) {
        this._closeMenu();
      } else {
        this._openMenu();
      }
    };
  }

  _removeEventListeners() {
    this._listenerController?.abort();
    this._listenerController = null;
  }

  _toggleCollapse() {
    if (this._isCollapsed) {
      this._expand();
    } else {
      this._collapse();
    }
  }

  _collapse() {
    this._isCollapsed = true;
    this.setAttribute('data-collapsed', '');
    this._writeCollapsedState(true);
    this._dispatchToggleEvent();
  }

  _expand() {
    this._isCollapsed = false;
    this.removeAttribute('data-collapsed');
    this._writeCollapsedState(false);
    this._dispatchToggleEvent();
  }

  _toggleMenu() {
    if (this._isOpen) {
      this._closeMenu();
    } else {
      this._openMenu();
    }
  }

  _openMenu() {
    if (!this._isMobile) return;
    this._isOpen = true;
    this.setAttribute('data-open', '');
  }

  _closeMenu() {
    if (!this._isMobile) return;
    this._isOpen = false;
    this.removeAttribute('data-open');
  }

  _updateMobileState() {
    const wasMobile = this._isMobile;
    this._isMobile = window.innerWidth < MOBILE_BREAKPOINT;

    // Close menu when transitioning to desktop
    if (wasMobile && !this._isMobile && this._isOpen) {
      this._closeMenu();
    }

    // Reset collapse on mobile
    if (this._isMobile && this._isCollapsed) {
      this._expand();
    }
  }

  _restoreState() {
    const isCollapsed = this._readCollapsedState();
    if (isCollapsed && !this._isMobile) {
      this._collapse();
    }
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
