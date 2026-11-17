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

import { createKeyboardNav } from '../../../utils/keyboard-nav.js';
import { autoId } from '../../../utils/id-generator.js';
import { renWarn } from '../../../utils/debug.js';

// What a keyboard user can Tab to. A panel that starts with one of these is
// reachable already; any other panel becomes a tab stop itself.
const TABBABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

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
    this._listenerController = null;
    this._syncingTabStop = false;
    this._ownPanelTabStops = new WeakSet();
    this._handleFocusOut = this._handleFocusOut.bind(this);
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
    this._tabList?.removeEventListener('focusout', this._handleFocusOut);
    if (this._nav) {
      this._nav.detach();
      this._nav = null;
    }
    // connectedCallback wires the click listener again: without this, every
    // reconnect stacked one more, and one click fired ren-tab-change twice.
    this._listenerController?.abort();
    this._listenerController = null;
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
      renWarn('RenTabs', 'No tablist found');
      return;
    }

    // Collect tabs and panels
    this._tabs = Array.from(this.querySelectorAll('[role="tab"], .ren-tab'));
    this._panels = Array.from(this.querySelectorAll('[role="tabpanel"], .ren-tab-panel'));

    if (this._tabs.length === 0) {
      renWarn('RenTabs', 'No tabs found');
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

    // The name belongs on the tablist. <ren-tabs> has no role, so aria-label
    // or aria-labelledby written on it is ignored by assistive tech: move it
    // to the element that carries role="tablist".
    for (const attribute of ['aria-label', 'aria-labelledby']) {
      if (!this.hasAttribute(attribute)) continue;
      if (!this._tabList.hasAttribute('aria-label') && !this._tabList.hasAttribute('aria-labelledby')) {
        this._tabList.setAttribute(attribute, this.getAttribute(attribute));
      }
      this.removeAttribute(attribute);
    }

    // Initialize an inactive state even when no tab can be selected.
    this._selectedIndex = -1;
    this._wireAria();

    // Set up keyboard navigation
    this._setupKeyboardNav();

    // Select initial tab
    const defaultValue = this.getAttribute('default-value');
    if (defaultValue !== null) {
      this._selectTabByValue(defaultValue);
    }
    if (this._selectedIndex === -1) {
      // Navigation excludes disabled tabs; select the same first enabled tab.
      this._selectTab(this._tabs.indexOf(this._nav.getItems()[0]));
    }

    // Listen for clicks on tabs
    this._listenerController?.abort();
    this._listenerController = new AbortController();
    const { signal } = this._listenerController;
    this._tabList.addEventListener('click', this._handleTabClick.bind(this), { signal });

    // In manual activation the arrow keys move focus without selecting. When
    // focus then leaves the tab list, the tab stop goes back to the selected
    // tab, so Tab re-enters on the active tab (APG Tabs).
    this._tabList.addEventListener('focusout', this._handleFocusOut, { signal });
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

      // Hide inactive panels independently of whether selection succeeds.
      const isSelected = index === this._selectedIndex;
      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      tab.setAttribute('data-state', isSelected ? 'active' : 'inactive');
      if (panel) panel.toggleAttribute('hidden', !isSelected);
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
      onActivate: (tab) => {
        // Moving the tab stop back onto the selected tab is not navigation.
        if (this._syncingTabStop) return;
        // Arrow key navigation
        if (activation === 'automatic') {
          // Automatic: immediately select the tab
          this._selectTab(this._tabs.indexOf(tab));
        }
        // Manual: just move focus, don't select
        // (User must press Enter/Space to select)
      },
      onSelect: (tab) => {
        // Navigation indices belong to the enabled subset, not all panels.
        this._selectTab(this._tabs.indexOf(tab));
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
    if (this._selectTab(index)) {
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
    const tab = this._tabs[index];
    if (!tab || tab.hasAttribute('disabled') || tab.getAttribute('aria-disabled') === 'true') {
      return false;
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
    this._syncTabStop();
    this._syncPanelTabStop();

    // Dispatch custom event
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
    return true;
  }

  /**
   * Keep the tab list's single tab stop on the selected tab.
   * @private
   */
  _syncTabStop() {
    const selected = this._tabs[this._selectedIndex];
    if (!this._nav || !selected) return;
    const index = this._nav.getItems().indexOf(selected);
    if (index === -1 || index === this._nav.activeIndex) return;
    this._syncingTabStop = true;
    this._nav.setActiveIndex(index);
    this._syncingTabStop = false;
  }

  /**
   * Make the visible panel reachable with Tab. APG: the panel is the next tab
   * stop after the tab list unless its first meaningful content is focusable.
   * An author-written tabindex is never touched.
   * @private
   */
  _syncPanelTabStop() {
    this._panels.forEach((panel, index) => {
      const owned = this._ownPanelTabStops.has(panel);
      if (panel.hasAttribute('tabindex') && !owned) return;
      if (index === this._selectedIndex && !this._startsWithFocusable(panel)) {
        panel.setAttribute('tabindex', '0');
        this._ownPanelTabStops.add(panel);
      } else if (owned) {
        panel.removeAttribute('tabindex');
        this._ownPanelTabStops.delete(panel);
      }
    });
  }

  /**
   * Whether the first thing with content in a panel is focusable.
   * @private
   */
  _startsWithFocusable(panel) {
    const walker = document.createTreeWalker(panel, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent.trim()) return false;
      } else if (node.matches(TABBABLE)) {
        return true;
      } else if (node.matches('img, svg, picture, video, canvas, iframe')) {
        return false;
      }
    }
    return false;
  }

  /**
   * Focus left the tab list: the selected tab is the way back in.
   * @private
   */
  _handleFocusOut(event) {
    if (this._tabList.contains(event.relatedTarget)) return;
    this._syncTabStop();
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
