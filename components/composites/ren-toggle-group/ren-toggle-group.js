/* ═══ REN TOGGLE GROUP WEB COMPONENT ═══ */

export class RenToggleGroup extends HTMLElement {
  constructor() {
    super();
    this.type = 'single';
    this.selectedValue = null;
    this.items = [];
    this.handleItemClick = this.handleItemClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  connectedCallback() {
    /* ═══ READ ATTRIBUTES ═══ */
    this.type = this.getAttribute('type') || 'single';
    const initialValue = this.getAttribute('value');

    /* ═══ FIND ALL ITEMS ═══ */
    this.items = Array.from(
      this.querySelectorAll('.ren-toggle-group-item, [role="button"]')
    );

    if (this.items.length === 0) {
      console.warn('RenToggleGroup: No items found');
      return;
    }

    /* ═══ SET UP ARIA ATTRIBUTES ═══ */
    this.items.forEach((item, index) => {
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', index === 0 ? '0' : '-1');
      item.setAttribute('aria-pressed', 'false');

      /* ═══ ADD CLASSES ═══ */
      item.classList.add('ren-toggle-group-item');

      /* ═══ EVENT LISTENERS ═══ */
      item.addEventListener('click', this.handleItemClick);
      item.addEventListener('keydown', this.handleKeyDown);
    });

    /* ═══ SET INITIAL VALUE ═══ */
    if (initialValue) {
      this.setValue(initialValue);
    }

    /* ═══ ENSURE CONTAINER HAS CLASS ═══ */
    this.classList.add('ren-toggle-group');
  }

  disconnectedCallback() {
    this.items.forEach((item) => {
      item.removeEventListener('click', this.handleItemClick);
      item.removeEventListener('keydown', this.handleKeyDown);
    });
  }

  /* ═══ ITEM CLICK HANDLER ═══ */
  handleItemClick(event) {
    const item = event.currentTarget;
    const value = item.getAttribute('data-value') || item.textContent;

    if (this.type === 'single') {
      this.setValue(value);
    } else {
      /* ═══ MULTIPLE MODE: TOGGLE ═══ */
      const isPressed = item.getAttribute('aria-pressed') === 'true';
      item.setAttribute('aria-pressed', !isPressed);
      this.dispatchChangeEvent();
    }
  }

  /* ═══ KEYBOARD NAVIGATION ═══ */
  handleKeyDown(event) {
    const currentIndex = this.items.indexOf(event.currentTarget);
    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % this.items.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + this.items.length) % this.items.length;
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.click();
      return;
    }

    if (nextIndex !== currentIndex) {
      this.items[currentIndex].setAttribute('tabindex', '-1');
      const nextItem = this.items[nextIndex];
      nextItem.setAttribute('tabindex', '0');
      nextItem.focus();
    }
  }

  /* ═══ SET SINGLE VALUE ═══ */
  setValue(value) {
    if (this.type !== 'single') {
      console.warn('RenToggleGroup: setValue only works in single mode');
      return;
    }

    /* ═══ CLEAR PREVIOUS SELECTION ═══ */
    this.items.forEach((item) => {
      item.setAttribute('aria-pressed', 'false');
    });

    /* ═══ SET NEW SELECTION ═══ */
    const targetItem = this.items.find(
      (item) =>
        (item.getAttribute('data-value') || item.textContent) === value
    );

    if (targetItem) {
      targetItem.setAttribute('aria-pressed', 'true');
      this.selectedValue = value;
      this.dispatchChangeEvent();
    }
  }

  /* ═══ DISPATCH CHANGE EVENT ═══ */
  dispatchChangeEvent() {
    const selectedItems =
      this.type === 'single'
        ? [this.items.find((item) => item.getAttribute('aria-pressed') === 'true')]
        : this.items.filter((item) => item.getAttribute('aria-pressed') === 'true');

    const values = selectedItems
      .filter(Boolean)
      .map((item) => item.getAttribute('data-value') || item.textContent);

    this.dispatchEvent(
      new CustomEvent('ren-toggle-change', {
        detail: {
          value: this.type === 'single' ? values[0] : values,
          items: selectedItems.filter(Boolean),
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /* ═══ GETTERS AND SETTERS ═══ */
  get value() {
    if (this.type === 'single') {
      return this.selectedValue;
    } else {
      return this.items
        .filter((item) => item.getAttribute('aria-pressed') === 'true')
        .map((item) => item.getAttribute('data-value') || item.textContent);
    }
  }

  set value(val) {
    if (this.type === 'single') {
      this.setValue(val);
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    if (val) {
      this.setAttribute('disabled', '');
      this.items.forEach((item) => item.setAttribute('disabled', ''));
    } else {
      this.removeAttribute('disabled');
      this.items.forEach((item) => item.removeAttribute('disabled'));
    }
  }
}

/* ═══ REGISTER COMPONENT ═══ */
if (!customElements.get('ren-toggle-group')) {
  customElements.define('ren-toggle-group', RenToggleGroup);
}
