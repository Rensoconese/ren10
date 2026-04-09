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
  }

  _attachEventListeners() {
    // Toggle collapse button
    if (this._toggleBtn) {
      this._toggleBtn.addEventListener('click', () => this._toggleCollapse());
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
      });
    });

    // Close on Escape (mobile)
    document.addEventListener('keydown', (e) => {
      if (e.key === KEYBOARD_CODES.Escape && this._isMobile && this._isOpen) {
        this._closeMenu();
      }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      this._updateMobileState();
    });

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
    });

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
    if (this._toggleBtn) {
      this._toggleBtn.removeEventListener('click', () => this._toggleCollapse());
    }

    this._navItems.forEach(item => {
      item.removeEventListener('click', () => {});
    });
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
    localStorage.setItem(STORAGE_KEY, 'true');
    this._dispatchToggleEvent();
  }

  _expand() {
    this._isCollapsed = false;
    this.removeAttribute('data-collapsed');
    localStorage.setItem(STORAGE_KEY, 'false');
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
    const isCollapsed = localStorage.getItem(STORAGE_KEY) === 'true';
    if (isCollapsed && !this._isMobile) {
      this._collapse();
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
    const item = this.querySelector(`[href="${href}"]`);
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
