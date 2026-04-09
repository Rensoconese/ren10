/**
 * RenDS — <ren-tabs> Web Component
 * ==================================
 * Accessible tabbed interface with keyboard navigation.
 * Implements ARIA tablist pattern with manual or automatic activation.
 *
 * Uses Light DOM — no Shadow DOM.
 * Works with semantic HTML or custom tab markup.
 *
 * Attributes:
 *   activation:    'manual' (default) | 'automatic'
 *                  - manual: arrow keys move focus, Enter/Space selects
 *                  - automatic: arrow keys immediately select tabs
 *   default-value: index or tab ID to select initially
 *   orientation:   'horizontal' (default) | 'vertical'
 *
 * Markup:
 *   <ren-tabs>
 *     <div role="tablist" class="ren-tab-list">
 *       <button role="tab" class="ren-tab">Tab 1</button>
 *       <button role="tab" class="ren-tab">Tab 2</button>
 *     </div>
 *     <div role="tabpanel" class="ren-tab-panel">
 *       Panel 1 content
 *     </div>
 *     <div role="tabpanel" class="ren-tab-panel">
 *       Panel 2 content
 *     </div>
 *   </ren-tabs>
 *
 * Events:
 *   ren-tab-change: Dispatched when a tab is selected
 *   - detail: { tab, panel, index, id }
 */

import { createKeyboardNav } from '../../utils/keyboard-nav.js';
import { autoId } from '../../utils/id-generator.js';

export class RenTabs extends HTMLElement {
  static get observedAttributes() {
    return ['activation', 'orientation', 'default-value'];
  }

  constructor() {
    super();
    this._nav = null;
    this._tabList = null;
    this._tabs = [];
    this._panels = [];
    this._selectedIndex = -1;
  }

  /**
   * Lifecycle: Element inserted into DOM
   */
  connectedCallback() {
    this._initialize();
  }

  /**
   * Lifecycle: Element removed from DOM
   */
  disconnectedCallback() {
    if (this._nav) {
      this._nav.detach();
      this._nav = null;
    }
  }

  /**
   * Lifecycle: Observed attribute changed
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'default-value' && this.isConnected) {
      this._selectTabByValue(newValue);
    }
  }

  /* ═══ INITIALIZATION ═══ */

  /**
   * Initialize the tabs component
   * @private
   */
  _initialize() {
    // Find tablist container
    this._tabList = this.querySelector('[role="tablist"]') || this.querySelector('.ren-tab-list');
    if (!this._tabList) {
      console.warn('RenTabs: No tablist found');
      return;
    }

    // Collect tabs and panels
    this._tabs = Array.from(this.querySelectorAll('[role="tab"], .ren-tab'));
    this._panels = Array.from(this.querySelectorAll('[role="tabpanel"], .ren-tab-panel'));

    if (this._tabs.length === 0) {
      console.warn('RenTabs: No tabs found');
      return;
    }

    // Ensure all elements have proper ARIA roles
    this._tabList.setAttribute('role', 'tablist');
    this._tabs.forEach((tab) => {
      if (!tab.hasAttribute('role')) {
        tab.setAttribute('role', 'tab');
      }
    });
    this._panels.forEach((panel) => {
      if (!panel.hasAttribute('role')) {
        panel.setAttribute('role', 'tabpanel');
      }
    });

    // Wire up ARIA relationships
    this._wireAria();

    // Set up keyboard navigation
    this._setupKeyboardNav();

    // Select initial tab
    const defaultValue = this.getAttribute('default-value');
    if (defaultValue !== null) {
      this._selectTabByValue(defaultValue);
    } else {
      // Select first tab by default
      this._selectTab(0);
    }

    // Listen for clicks on tabs
    this._tabList.addEventListener('click', this._handleTabClick.bind(this));
  }

  /**
   * Wire up ARIA attributes between tabs and panels
   * @private
   */
  _wireAria() {
    this._tabs.forEach((tab, index) => {
      // Ensure tab has an ID
      autoId(tab, `tab-${index}`);

      // Find corresponding panel
      const panel = this._panels[index];
      if (panel) {
        // Ensure panel has an ID
        autoId(panel, `tabpanel-${index}`);

        // Wire aria-controls: tab controls panel
        tab.setAttribute('aria-controls', panel.id);

        // Wire aria-labelledby: panel is labeled by tab
        panel.setAttribute('aria-labelledby', tab.id);
      }

      // Initialize aria-selected state
      tab.setAttribute('aria-selected', index === this._selectedIndex ? 'true' : 'false');
    });
  }

  /**
   * Set up keyboard navigation using createKeyboardNav
   * @private
   */
  _setupKeyboardNav() {
    const activation = this.getAttribute('activation') || 'manual';
    const orientation = this.getAttribute('orientation') || 'horizontal';

    this._nav = createKeyboardNav(this._tabList, {
      selector: '[role="tab"]',
      orientation,
      loop: true,
      typeahead: false,
      focusOnHover: false,
      onActivate: (tab, index) => {
        // Arrow key navigation
        if (activation === 'automatic') {
          // Automatic: immediately select the tab
          this._selectTab(index);
        }
        // Manual: just move focus, don't select
        // (User must press Enter/Space to select)
      },
      onSelect: (tab, index) => {
        // Enter/Space pressed on focused tab
        this._selectTab(index);
      },
    });

    this._nav.attach();
  }

  /**
   * Handle direct click on a tab
   * @private
   */
  _handleTabClick(event) {
    const tab = event.target.closest('[role="tab"]');
    if (!tab) return;

    const index = this._tabs.indexOf(tab);
    if (index !== -1) {
      this._selectTab(index);
      // Ensure focus is on the clicked tab
      tab.focus();
    }
  }

  /* ═══ TAB SELECTION ═══ */

  /**
   * Select a tab by index
   * @param {number} index - Tab index
   * @private
   */
  _selectTab(index) {
    if (index < 0 || index >= this._tabs.length) {
      return;
    }

    // Deselect all tabs and hide all panels
    this._tabs.forEach((tab, i) => {
      const isSelected = i === index;
      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      tab.setAttribute('data-state', isSelected ? 'active' : 'inactive');
      if (this._panels[i]) {
        this._panels[i].toggleAttribute('hidden', !isSelected);
      }
    });

    this._selectedIndex = index;

    // Dispatch custom event
    const tab = this._tabs[index];
    const panel = this._panels[index];
    this.dispatchEvent(
      new CustomEvent('ren-tab-change', {
        detail: {
          tab,
          panel,
          index,
          id: tab.id,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Select a tab by ID or index value
   * @param {string|number} value - Tab ID or index string
   * @private
   */
  _selectTabByValue(value) {
    // Try parsing as index first
    const indexValue = parseInt(value, 10);
    if (!isNaN(indexValue) && indexValue >= 0 && indexValue < this._tabs.length) {
      this._selectTab(indexValue);
      return;
    }

    // Try finding by ID
    const tab = this._tabs.find((t) => t.id === value);
    if (tab) {
      const index = this._tabs.indexOf(tab);
      this._selectTab(index);
    }
  }

  /* ═══ PUBLIC API ═══ */

  /**
   * Get the currently selected tab index
   * @returns {number}
   */
  get selectedIndex() {
    return this._selectedIndex;
  }

  /**
   * Get the currently selected tab element
   * @returns {HTMLElement|null}
   */
  get selectedTab() {
    return this._selectedIndex >= 0 ? this._tabs[this._selectedIndex] : null;
  }

  /**
   * Get the currently selected panel element
   * @returns {HTMLElement|null}
   */
  get selectedPanel() {
    return this._selectedIndex >= 0 ? this._panels[this._selectedIndex] : null;
  }

  /**
   * Programmatically select a tab by index
   * @param {number} index
   */
  selectTabByIndex(index) {
    this._selectTab(index);
  }

  /**
   * Programmatically select a tab by ID
   * @param {string} id
   */
  selectTabById(id) {
    const index = this._tabs.findIndex((t) => t.id === id);
    if (index !== -1) {
      this._selectTab(index);
    }
  }

  /**
   * Get all tabs
   * @returns {HTMLElement[]}
   */
  get tabs() {
    return [...this._tabs];
  }

  /**
   * Get all panels
   * @returns {HTMLElement[]}
   */
  get panels() {
    return [...this._panels];
  }
}

// Register the component
if (!customElements.get('ren-tabs')) {
  customElements.define('ren-tabs', RenTabs);
}
