/**
 * RenNav Component - Responsive Navigation Bar
 * Modern web component with keyboard navigation and mobile support
 */

const MOBILE_BREAKPOINT = 768;
const KEYBOARD_CODES = { Escape: 'Escape' };

class RenNav extends HTMLElement {
  constructor() {
    super();
    this._toggleBtn = null;
    this._linksContainer = null;
    this._links = [];
    this._isOpen = false;
    this._dropdowns = new Map();
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
    // Toggle button click
    if (this._toggleBtn) {
      this._toggleBtn.addEventListener('click', () => this._toggleMenu());
    }

    // Close menu on link click
    this._links.forEach(link => {
      link.addEventListener('click', () => {
        if (this._isOpen) {
          this._closeMenu();
        }
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === KEYBOARD_CODES.Escape && this._isOpen) {
        this._closeMenu();
      }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      this._updateMobileState();
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (this._isOpen && !this.contains(e.target)) {
        this._closeMenu();
      }
    });
  }

  _initDropdowns() {
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
          });

          // Close dropdown on item click
          popover.querySelectorAll('a, button').forEach(item => {
            item.addEventListener('click', () => {
              this._closeDropdown(toggle, popover);
            });
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

  _closeMenu() {
    this._isOpen = false;
    this.removeAttribute('data-open');
    if (this._toggleBtn) {
      this._toggleBtn.setAttribute('aria-expanded', 'false');
    }
  }

  _updateMobileState() {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    if (!isMobile && this._isOpen) {
      this._closeMenu();
    }
  }

  _removeEventListeners() {
    if (this._toggleBtn) {
      this._toggleBtn.removeEventListener('click', () => this._toggleMenu());
    }

    this._links.forEach(link => {
      link.removeEventListener('click', () => {
        if (this._isOpen) {
          this._closeMenu();
        }
      });
    });
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
