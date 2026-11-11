/**
 * RenNav Component - Responsive Navigation Bar
 * Modern web component with keyboard navigation and mobile support
 */

const KEYBOARD_CODES = { Escape: 'Escape' };

class RenNav extends HTMLElement {
  constructor() {
    super();
    this._toggleBtn = null;
    this._linksContainer = null;
    this._links = [];
    this._isOpen = false;
    this._dropdowns = new Map();
    this._listenerController = null;
  }

  connectedCallback() {
    this._initElements();
    this._attachEventListeners();
    this._initDropdowns();
    this._updateMobileState();
  }

  disconnectedCallback() {
    this._removeEventListeners();
  }

  _initElements() {
    this._toggleBtn = this.querySelector('.ren-nav-toggle');
    this._linksContainer = this.querySelector('.ren-nav-links');
    this._links = Array.from(this.querySelectorAll('.ren-nav-link'));
  }

  _attachEventListeners() {
    this._listenerController?.abort();
    this._listenerController = new AbortController();
    const { signal } = this._listenerController;

    // Toggle button click
    if (this._toggleBtn) {
      this._toggleBtn.addEventListener('click', () => this._toggleMenu(), { signal });
    }

    // Close menu on link click
    this._links.forEach(link => {
      link.addEventListener('click', () => {
        if (this._isOpen) {
          this._closeMenu();
        }
      }, { signal });
    });

    // Close on Escape. Focus inside the panel would be stranded on a hidden
    // element (and fall back to <body>), so return it to the toggle.
    document.addEventListener('keydown', (e) => {
      if (e.key === KEYBOARD_CODES.Escape && this._isOpen) {
        this._closeMenu({ restoreFocus: true });
      }
    }, { signal });

    // Close when the layout leaves the mobile breakpoint
    window.addEventListener('resize', () => {
      this._updateMobileState();
    }, { signal });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (this._isOpen && !this.contains(e.target)) {
        this._closeMenu();
      }
    }, { signal });
  }

  _initDropdowns() {
    const signal = this._listenerController?.signal;
    const dropdownToggles = this.querySelectorAll('[data-dropdown]');
    dropdownToggles.forEach(toggle => {
      const popoverId = toggle.getAttribute('aria-controls');
      if (popoverId) {
        const popover = this.querySelector(`#${popoverId}`);
        if (popover) {
          this._dropdowns.set(toggle, popover);
          toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this._toggleDropdown(toggle, popover);
          }, { signal });

          // Close dropdown on item click
          popover.querySelectorAll('a, button').forEach(item => {
            item.addEventListener('click', () => {
              this._closeDropdown(toggle, popover);
            }, { signal });
          });
        }
      }
    });
  }

  _toggleDropdown(toggle, popover) {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      this._closeDropdown(toggle, popover);
    } else {
      // Close other dropdowns
      this._dropdowns.forEach((pop, tog) => {
        if (tog !== toggle) {
          this._closeDropdown(tog, pop);
        }
      });

      toggle.setAttribute('aria-expanded', 'true');
      popover.showPopover?.();
    }
  }

  _closeDropdown(toggle, popover) {
    toggle.setAttribute('aria-expanded', 'false');
    popover.hidePopover?.();
  }

  _toggleMenu() {
    if (this._isOpen) {
      this._closeMenu();
    } else {
      this._openMenu();
    }
  }

  _openMenu() {
    this._isOpen = true;
    this.setAttribute('data-open', '');
    if (this._toggleBtn) {
      this._toggleBtn.setAttribute('aria-expanded', 'true');
    }
  }

  // Link activation and outside clicks close without moving focus: navigation
  // or the clicked target owns focus there. Only Escape restores it.
  _closeMenu({ restoreFocus = false } = {}) {
    const active = document.activeElement;
    const focusWasInside = restoreFocus && active !== this._toggleBtn && this.contains(active);
    this._isOpen = false;
    this.removeAttribute('data-open');
    if (this._toggleBtn) {
      this._toggleBtn.setAttribute('aria-expanded', 'false');
    }
    if (focusWasInside && this._toggleBtn && active.getClientRects().length === 0) {
      this._toggleBtn.focus();
    }
  }

  // The CSS owns the breakpoint: the mobile layout is the one that renders the
  // toggle. Reading that back keeps JS and CSS in step at every width
  // (including exactly 48rem) and with page-level breakpoint overrides.
  _isMobileLayout() {
    return Boolean(this._toggleBtn) && getComputedStyle(this._toggleBtn).display !== 'none';
  }

  _updateMobileState() {
    if (!this._isOpen) return;
    const isMobile = this._isMobileLayout();
    if (!isMobile && this._isOpen) {
      this._closeMenu();
    }
  }

  _removeEventListeners() {
    this._listenerController?.abort();
    this._listenerController = null;
  }

  // Public API
  setActiveLink(href) {
    this._links.forEach(link => {
      if (link.getAttribute('href') === href) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('active');
      }
    });
  }

  get isOpen() {
    return this._isOpen;
  }
}

customElements.define('ren-nav', RenNav);
