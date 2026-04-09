import { createKeyboardNav } from '../../utils/keyboard-nav.js';
import { autoId } from '../../utils/id-generator.js';

export class RenCombobox extends HTMLElement {
  #input;
  #content;
  #clearBtn;
  #emptyState;
  #items = [];
  #filteredItems = [];
  #highlightedIndex = -1;
  #isOpen = false;
  #keyboardNav;
  #contentId;
  #inputId;
  #originalItems = [];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.#contentId = autoId('combobox-content');
    this.#inputId = autoId('combobox-input');

    this.#render();
    this.#setupElements();
    this.#setupEventListeners();
    this.#setupKeyboardNav();
  }

  #render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="./ren-combobox.css">

      <div class="ren-combobox">
        <input
          type="text"
          class="ren-combobox-input"
          id="${this.#inputId}"
          placeholder="${this.getAttribute('placeholder') || 'Search...'}"
          autocomplete="off"
          role="combobox"
          aria-expanded="false"
          aria-autocomplete="list"
          aria-controls="${this.#contentId}"
        >
        <button class="ren-combobox-clear" aria-label="Clear" hidden>×</button>

        <div
          id="${this.#contentId}"
          class="ren-combobox-content"
          role="listbox"
          popover="auto"
        >
          <div class="ren-combobox-empty" hidden>No results found</div>
          <slot></slot>
        </div>
      </div>

      <input type="hidden" name="${this.getAttribute('name') || ''}" class="ren-combobox-hidden-input">
    `;
  }

  #setupElements() {
    this.#input = this.shadowRoot.querySelector('.ren-combobox-input');
    this.#content = this.shadowRoot.querySelector('.ren-combobox-content');
    this.#clearBtn = this.shadowRoot.querySelector('.ren-combobox-clear');
    this.#emptyState = this.shadowRoot.querySelector('.ren-combobox-empty');

    this.#indexItems();
  }

  #indexItems() {
    // Get items from light DOM
    this.#originalItems = Array.from(this.querySelectorAll('[role="option"]'));
    this.#filteredItems = [...this.#originalItems];
    this.#items = this.#filteredItems;
  }

  #setupEventListeners() {
    this.#input.addEventListener('focus', () => this.open());
    this.#input.addEventListener('input', (e) => this.#onInput(e));
    this.#input.addEventListener('blur', (e) => this.#onBlur(e));

    this.#clearBtn.addEventListener('click', () => this.#clear());

    // Click on backdrop or outside
    this.addEventListener('click', (e) => {
      if (e.target === this.#content) {
        this.close();
      }
    });

    // Item selection
    this.addEventListener('click', (e) => {
      const item = e.target.closest('[role="option"]');
      if (item && !item.getAttribute('aria-disabled')) {
        this.#selectItem(item);
      }
    });

    // Watch for light DOM changes
    const observer = new MutationObserver(() => this.#indexItems());
    observer.observe(this, { childList: true, subtree: true });
  }

  #setupKeyboardNav() {
    this.#keyboardNav = createKeyboardNav({
      onArrowDown: () => {
        if (!this.#isOpen) {
          this.open();
        } else {
          this.#highlightedIndex = Math.min(
            this.#highlightedIndex + 1,
            this.#items.length - 1
          );
          this.#updateHighlight();
        }
      },
      onArrowUp: () => {
        if (this.#isOpen) {
          this.#highlightedIndex = Math.max(this.#highlightedIndex - 1, -1);
          this.#updateHighlight();
        }
      },
      onEnter: () => {
        if (this.#isOpen && this.#highlightedIndex >= 0) {
          this.#selectItem(this.#items[this.#highlightedIndex]);
        }
      },
      onEscape: () => {
        this.close();
      },
    });

    this.#input.addEventListener('keydown', (e) => {
      this.#keyboardNav.handle(e);
    });
  }

  #onInput(e) {
    const query = e.target.value;
    this.#filter(query);
    this.#updateClearButton();

    if (query && !this.#isOpen) {
      this.open();
    }
  }

  #onBlur(e) {
    // Delay to allow item click
    setTimeout(() => {
      if (!this.#content.matches(':popover-open')) {
        return;
      }

      const relatedTarget = e.relatedTarget;
      if (!this.contains(relatedTarget)) {
        this.close();
      }
    }, 50);
  }

  #filter(query) {
    const trimmed = query.toLowerCase().trim();

    if (!trimmed) {
      this.#filteredItems = [...this.#originalItems];
    } else {
      this.#filteredItems = this.#originalItems.filter((item) => {
        const text = item.textContent.toLowerCase();
        return text.includes(trimmed);
      });
    }

    this.#items = this.#filteredItems;
    this.#highlightedIndex = -1;
    this.#updateItems();
    this.#updateEmptyState();

    // Announce results count for accessibility
    const resultCount = this.#filteredItems.length;
    const announcement = this.shadowRoot.querySelector('[role="status"]') ||
      (() => {
        const el = document.createElement('div');
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        el.className = 'ren-sr-only';
        this.shadowRoot.appendChild(el);
        return el;
      })();

    if (resultCount === 0) {
      announcement.textContent = 'No results found';
    } else {
      announcement.textContent = `${resultCount} result${resultCount !== 1 ? 's' : ''} available`;
    }
  }

  #updateItems() {
    // Hide/show items
    this.#originalItems.forEach((item) => {
      const isVisible = this.#filteredItems.includes(item);
      item.style.display = isVisible ? '' : 'none';
    });
  }

  #updateEmptyState() {
    const hasResults = this.#filteredItems.length > 0;
    this.#emptyState.toggleAttribute('hidden', hasResults);
  }

  #updateHighlight() {
    this.#items.forEach((item, index) => {
      if (index === this.#highlightedIndex) {
        item.setAttribute('data-highlighted', '');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.removeAttribute('data-highlighted');
      }
    });
  }

  #selectItem(item) {
    const value = item.getAttribute('data-value') || item.textContent;
    this.#input.value = value;
    this.close();
    this.#updateClearButton();

    // Update hidden input
    const hiddenInput = this.shadowRoot.querySelector('.ren-combobox-hidden-input');
    hiddenInput.value = value;

    // Update aria-selected
    this.#originalItems.forEach((i) => {
      i.setAttribute('aria-selected', i === item ? 'true' : 'false');
    });

    // Dispatch event
    this.dispatchEvent(
      new CustomEvent('ren-combobox-select', {
        detail: { value, item },
        bubbles: true,
        composed: true,
      })
    );
  }

  #clear() {
    this.#input.value = '';
    this.#input.focus();
    this.#filter('');
    this.#updateClearButton();
    this.open();
  }

  #updateClearButton() {
    const hasValue = this.#input.value.trim().length > 0;
    this.#clearBtn.toggleAttribute('hidden', !hasValue);
  }

  // Public API
  open() {
    if (this.#isOpen) return;
    this.#isOpen = true;
    this.#content.showPopover();
    this.#input.setAttribute('aria-expanded', 'true');
  }

  close() {
    if (!this.#isOpen) return;
    this.#isOpen = false;
    this.#content.hidePopover();
    this.#input.setAttribute('aria-expanded', 'false');
    this.#highlightedIndex = -1;
    this.#updateHighlight();
  }

  get value() {
    return this.#input.value;
  }

  set value(val) {
    this.#input.value = val;
    this.#filter(val);
    this.#updateClearButton();
  }

  filter(query) {
    this.#filter(query);
  }
}

customElements.define('ren-combobox', RenCombobox);
