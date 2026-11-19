/**
 * RenDS — <ren-combobox> Web Component
 * =====================================
 * Searchable, accessible combobox built on light DOM.
 *
 * Progressive enhancement: the markup ships with classes that work
 * standalone (.ren-combobox, .ren-combobox-input, .ren-combobox-list,
 * .ren-combobox-item). The Web Component layers ARIA wiring, keyboard
 * navigation, filtering, and a hidden form input on top.
 *
 * No Shadow DOM — light DOM only, like the rest of RenDS.
 *
 * Markup:
 *   <ren-combobox name="country" placeholder="Search a country…" value="ar">
 *     <div class="ren-combobox-item" data-value="ar">Argentina</div>
 *     <div class="ren-combobox-item" data-value="br">Brazil</div>
 *     <div class="ren-combobox-item" data-value="cl">Chile</div>
 *   </ren-combobox>
 *
 * Attributes:
 *   name        — form field name (a hidden input with this name carries the value)
 *   value       — initial selected data-value
 *   placeholder — input placeholder (default: "Search...")
 *   disabled    — locks the input
 *   async       — suppresses local filtering; consumer provides items via ren-search
 *
 * Public methods:
 *   .value          — getter / setter for the selected value
 *   .open()         — show the list
 *   .close()        — hide the list
 *   .setLoading(b)  — toggle the loading row
 *   .setItems(arr)  — replace items, each { value, label, description? }
 *
 * Events (all bubble):
 *   ren-change  — { value, item }   selection changed
 *   ren-search  — { query }         user typed (use for async loading)
 *   ren-open / ren-close            list visibility
 */

import { autoId } from '../../../utils/id-generator.js';
import { createDismissable } from '../../../utils/dismissable.js';
import { t } from '../../../utils/i18n.js';

const COMBOBOX_SIDES = new Set(['top', 'right', 'bottom', 'left']);

function normalizeComboboxSide(value) {
  const side = String(value || 'bottom').toLowerCase().split('-')[0];

  return COMBOBOX_SIDES.has(side) ? side : 'bottom';
}

// ─── Did the pointer really move? ───
// Screen coordinates stay put while the page or an ancestor frame scrolls, so
// they are the ones to compare. Some engines report the same screen position
// for every pointer event; until two events have disagreed on it, the viewport
// position is compared as well (it stays put while the page itself scrolls).
let screenPositionVaries = false;

function pointerPosition(event) {
  return { x: event.screenX, y: event.screenY, cx: event.clientX, cy: event.clientY };
}

function pointerMovedFrom(rest, event) {
  if (rest === null) return false;
  const screenMoved = rest.x !== event.screenX || rest.y !== event.screenY;
  if (screenMoved) screenPositionVaries = true;
  return screenMoved || (!screenPositionVaries && (rest.cx !== event.clientX || rest.cy !== event.clientY));
}

export class RenCombobox extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'placeholder', 'disabled', 'placement'];
  }

  #input;
  #list;
  #empty;
  #loading;
  #hidden;
  #liveRegion;
  #isOpen = false;
  #highlightedIndex = -1;
  #upgraded = false;
  #dismissLayer = null;
  /** Listeners that keep the open list on the side with room; null while closed. */
  #following = null;
  /**
   * Hover guard. While suspended the pointer has to really move before it may
   * change the highlighted option; see #pointerReallyMoved().
   */
  #hoverSuspended = true;
  #restingPoint = null;

  connectedCallback() {
    if (this.#upgraded) {
      // Re-connected: the list can still be open, so restore its layer.
      if (this.#isOpen) this.#dismissLayer?.activate();
      return;
    }
    this.#upgraded = true;
    this.#enhance();
    this.#wire();

    // Apply initial value if present
    const initial = this.getAttribute('value');
    if (initial) {
      this.#selectByValue(initial, { silent: true });
    }
  }

  disconnectedCallback() {
    this.#dismissLayer?.deactivate();
    this.#stopFollowing();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (!this.#upgraded) return;
    if (name === 'placeholder' && this.#input) {
      this.#input.placeholder = newVal || t('combobox.placeholder');
    } else if (name === 'disabled' && this.#input) {
      this.#input.disabled = this.hasAttribute('disabled');
    } else if (name === 'value' && newVal !== oldVal) {
      this.#selectByValue(newVal, { silent: true });
    } else if (name === 'placement' && newVal !== oldVal) {
      this.#syncPlacement();
    }
  }

  /* ─── Enhancement: take light-DOM children and wire structure ─── */

  #enhance() {
    this.classList.add('ren-combobox');

    // Items: anything the consumer wrote inside (items, groups, labels).
    // Move them into a list container.
    const fragment = document.createDocumentFragment();
    while (this.firstChild) {
      fragment.appendChild(this.firstChild);
    }

    // Input. type="search" already suppresses most autofill; `autocomplete`
    // must stay a valid token — an invented one ("ren-combobox-no-autofill")
    // failed axe's autocomplete-valid (WCAG 1.3.5, Identify Input Purpose).
    // The Chromium heuristic this guarded against keys off a semantic `name`,
    // and this generated input never has one.
    this.#input = document.createElement('input');
    this.#input.type = 'search';
    this.#input.className = 'ren-combobox-input';
    this.#input.setAttribute('autocomplete', 'off');
    this.#input.setAttribute('autocorrect', 'off');
    this.#input.setAttribute('autocapitalize', 'off');
    this.#input.setAttribute('data-1p-ignore', '');
    this.#input.setAttribute('data-lpignore', 'true');
    this.#input.spellcheck = false;
    // Localized strings are resolved during #enhance(), i.e. at connect time.
    // A setLocale() call after the element is upgraded does not relabel it.
    this.#input.placeholder = this.getAttribute('placeholder') || t('combobox.placeholder');
    if (this.hasAttribute('disabled')) this.#input.disabled = true;
    autoId(this.#input, 'combobox-input');

    // Move a host-level name onto the input. The host is a custom element
    // with no role, so aria-label there is ignored by assistive tech, and the
    // generated input would be left with its placeholder as its only name.
    // Same adoption ren-number-field and ren-select do.
    for (const attribute of ['aria-label', 'aria-labelledby']) {
      if (this.hasAttribute(attribute)) {
        this.#input.setAttribute(attribute, this.getAttribute(attribute));
        this.removeAttribute(attribute);
      }
    }

    // List
    this.#list = document.createElement('div');
    this.#list.className = 'ren-combobox-list';
    this.#list.hidden = true;
    autoId(this.#list, 'combobox-list');

    // Move user content into the list
    this.#list.appendChild(fragment);

    // Ensure an empty-state row exists
    this.#empty = this.#list.querySelector('.ren-combobox-empty');
    if (!this.#empty) {
      this.#empty = document.createElement('div');
      this.#empty.className = 'ren-combobox-empty';
      this.#empty.textContent = t('combobox.noResults');
      this.#empty.hidden = true;
      this.#list.appendChild(this.#empty);
    }

    // Loading row (hidden by default)
    this.#loading = this.#list.querySelector('.ren-combobox-loading');
    if (!this.#loading) {
      this.#loading = document.createElement('div');
      this.#loading.className = 'ren-combobox-loading';
      this.#loading.textContent = t('combobox.loading');
      this.#loading.hidden = true;
      this.#list.insertBefore(this.#loading, this.#list.firstChild);
    }

    // Hidden input for form submission
    this.#hidden = document.createElement('input');
    this.#hidden.type = 'hidden';
    if (this.hasAttribute('name')) this.#hidden.name = this.getAttribute('name');

    // Live region for screen-reader announcements
    this.#liveRegion = document.createElement('div');
    this.#liveRegion.className = 'ren-sr-only';
    this.#liveRegion.setAttribute('role', 'status');
    this.#liveRegion.setAttribute('aria-live', 'polite');

    // ARIA wiring
    this.#input.setAttribute('role', 'combobox');
    this.#input.setAttribute('aria-autocomplete', 'list');
    this.#input.setAttribute('aria-expanded', 'false');
    this.#input.setAttribute('aria-controls', this.#list.id);
    this.#list.setAttribute('role', 'listbox');

    this.#decorateItems();

    // Append in canonical order
    this.appendChild(this.#input);
    this.appendChild(this.#list);
    this.appendChild(this.#hidden);
    this.appendChild(this.#liveRegion);

    this.#syncPlacement();
  }

  #syncPlacement() {
    this.#setSide(normalizeComboboxSide(this.getAttribute('placement')));
    if (this.#isOpen) this.#placeList();
  }

  #setSide(side) {
    this.setAttribute('data-side', side);
    this.#list?.setAttribute('data-side', side);
  }

  /**
   * Open on the side `placement` asks for, or on the other one when the list
   * does not fit there and has more room on the other. The list is an inline
   * absolute box, so nothing else flips it: near the bottom of the viewport it
   * used to open below the fold.
   */
  #placeList() {
    // Layout APIs are missing in a DOM without layout (server, test stubs).
    if (!this.#list || this.#list.hidden || typeof this.getBoundingClientRect !== 'function') return;
    const preferred = normalizeComboboxSide(this.getAttribute('placement'));
    const other = preferred === 'top' ? 'bottom' : 'top';
    const box = this.getBoundingClientRect();
    const viewport = window.visualViewport?.height ?? window.innerHeight;
    const gap = 4; // --space-1 between input and list; only needs to be close
    const room = { top: box.top - gap, bottom: viewport - box.bottom - gap };
    const height = this.#list.offsetHeight;
    this.#setSide(height > room[preferred] && room[other] > room[preferred] ? other : preferred);
  }

  /** Keep the open list on the side with room while the page scrolls or resizes, or the list changes height. */
  #startFollowing() {
    this.#stopFollowing();
    if (typeof window === 'undefined' || typeof requestAnimationFrame !== 'function') return;
    const controller = new AbortController();
    const { signal } = controller;
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        this.#placeList();
      });
    };
    window.addEventListener('scroll', schedule, { capture: true, passive: true, signal });
    window.addEventListener('resize', schedule, { passive: true, signal });
    // Filtering changes the list's height; placing on the next frame, not
    // inside the observer callback, avoids a ResizeObserver loop.
    const resizing = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
    resizing?.observe(this.#list);
    this.#following = () => {
      controller.abort();
      resizing?.disconnect();
      cancelAnimationFrame(frame);
    };
  }

  #stopFollowing() {
    this.#following?.();
    this.#following = null;
  }

  #decorateItems() {
    const items = this.#getItems();
    items.forEach((item) => {
      if (!item.hasAttribute('role')) item.setAttribute('role', 'option');
      autoId(item, 'combobox-opt');
      if (!item.hasAttribute('aria-selected')) {
        item.setAttribute('aria-selected', 'false');
      }
      if (!item.hasAttribute('tabindex')) item.setAttribute('tabindex', '-1');
    });
  }

  #getItems() {
    return Array.from(this.#list.querySelectorAll('.ren-combobox-item'));
  }

  #getNavigableItems() {
    return this.#getItems().filter((i) => !i.hidden && i.getAttribute('aria-disabled') !== 'true');
  }

  /* ─── Event wiring ─── */

  #wire() {
    // Open on click (not focus): programmatic .focus() after selection
    // shouldn't reopen the list.
    this.#input.addEventListener('mousedown', () => this.open());
    this.#input.addEventListener('input', (e) => this.#onInput(e));
    this.#input.addEventListener('keydown', (e) => this.#onKeydown(e));

    // Item selection (delegated)
    this.#list.addEventListener('click', (e) => {
      const item = e.target.closest('.ren-combobox-item');
      if (item) {
        this.#selectItem(item);
      }
    });

    // Hover highlights an option only when the pointer really moved onto it.
    // pointermove, not mouseover: a list that opens or scrolls under a resting
    // pointer fires mouseover on whatever lands there.
    this.#list.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch' || !this.#pointerReallyMoved(e)) return;
      const item = e.target.closest('.ren-combobox-item');
      if (!item || item.hidden) return;
      const visible = this.#getNavigableItems();
      const idx = visible.indexOf(item);
      if (idx !== -1 && idx !== this.#highlightedIndex) this.#highlight(idx);
    });

    // Dismissal (outside pointerdown, Escape) runs through the shared layer
    // stack so a combobox nested in a dialog/popover dismisses innermost-first
    // instead of every overlay reacting to the same document-level event.
    // The host is the container: input, list, and generated rows all live in it,
    // which mirrors the previous `this.contains(e.target)` guard.
    this.#dismissLayer?.deactivate();
    this.#dismissLayer = createDismissable(this, {
      triggerElement: this.#input,
      excludeElements: [this.#list],
      onDismiss: () => this.close(),
    });
  }

  /**
   * The keyboard is driving (a key, typed text, or the list just opened), so
   * hover stays out of the way until the pointer really moves.
   */
  #suspendHover() {
    this.#hoverSuspended = true;
    this.#restingPoint = null;
  }

  /**
   * True once the pointer has moved since the keyboard last drove the list.
   *
   * Browsers re-target hover when content moves under a pointer that is not
   * moving, and some add a move event that repeats the last coordinates.
   * Following those would hand the highlight to wherever the pointer rests, so
   * a keyboard user would lose their place. The first position seen after a
   * suspension is only recorded; hover takes over again when a later
   * pointermove reports a different position; see pointerMovedFrom().
   */
  #pointerReallyMoved(event) {
    if (!this.#hoverSuspended) return true;

    const moved = pointerMovedFrom(this.#restingPoint, event);
    this.#restingPoint = pointerPosition(event);
    if (moved) this.#hoverSuspended = false;
    return moved;
  }

  #onInput(e) {
    this.#suspendHover();
    const query = e.target.value;

    if (this.hasAttribute('async')) {
      // Async mode: emit ren-search and let the consumer replace items
      this.dispatchEvent(
        new CustomEvent('ren-search', {
          detail: { query },
          bubbles: true,
        })
      );
    } else {
      this.#filter(query);
    }

    if (!this.#isOpen) this.open();
  }

  #onKeydown(e) {
    this.#suspendHover();
    const visible = this.#getNavigableItems();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!this.#isOpen) this.open();
        this.#highlight(Math.min(this.#highlightedIndex + 1, visible.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (this.#isOpen) {
          this.#highlight(Math.max(this.#highlightedIndex - 1, 0));
        }
        break;
      case 'Home':
        if (this.#isOpen) {
          e.preventDefault();
          this.#highlight(0);
        }
        break;
      case 'End':
        if (this.#isOpen) {
          e.preventDefault();
          this.#highlight(visible.length - 1);
        }
        break;
      case 'Enter':
        if (this.#isOpen && visible[this.#highlightedIndex]) {
          e.preventDefault();
          this.#selectItem(visible[this.#highlightedIndex]);
        }
        break;
      case 'Escape':
        // Open listbox: the dismissable layer handles this first (document
        // capture) and stops the event there, so a combobox nested in another
        // overlay dismisses only its own listbox. This branch is the fallback
        // for keydowns that never reach the layer.
        // Closed listbox: Escape clears the input (ARIA combobox pattern) —
        // no layer is active then, so the event still lands here.
        if (this.#isOpen) {
          e.preventDefault();
          this.close();
        } else if (this.#input.value) {
          this.#input.value = '';
          this.#filter('');
        }
        break;
    }
  }

  /* ─── Filtering ─── */

  #filter(query) {
    const needle = (query || '').toLowerCase().trim();
    const items = this.#getItems();

    items.forEach((item) => {
      const match = !needle || item.textContent.toLowerCase().includes(needle);
      item.hidden = !match;
    });

    // Hide groups whose items are all hidden
    this.querySelectorAll('.ren-combobox-group').forEach((group) => {
      const groupItems = group.querySelectorAll('.ren-combobox-item');
      const anyVisible = Array.from(groupItems).some((i) => !i.hidden);
      group.hidden = !anyVisible;
    });

    const anyVisible = items.some((i) => !i.hidden);
    this.#empty.hidden = anyVisible;
    this.#highlightedIndex = -1;

    // Clear ARIA active descendant
    this.#input.removeAttribute('aria-activedescendant');

    // Announce result count
    const count = items.filter((i) => !i.hidden).length;
    if (this.#liveRegion) {
      this.#liveRegion.textContent = count
        ? t('combobox.resultsAvailable', { count })
        : t('combobox.noResults');
    }
  }

  /* ─── Highlight management (aria-activedescendant pattern) ─── */

  #highlight(index) {
    const visible = this.#getNavigableItems();
    if (!visible.length) {
      this.#highlightedIndex = -1;
      this.#input.removeAttribute('aria-activedescendant');
      return;
    }

    this.#getItems().forEach((i) => i.removeAttribute('data-highlighted'));

    const clamped = Math.max(0, Math.min(index, visible.length - 1));
    const target = visible[clamped];
    target.setAttribute('data-highlighted', '');
    this.#input.setAttribute('aria-activedescendant', target.id);
    this.#highlightedIndex = clamped;

    // Best-effort scroll; not critical if unsupported.
    if (typeof target.scrollIntoView === 'function') {
      try {
        target.scrollIntoView({ block: 'nearest' });
      } catch {}
    }
  }

  /* ─── Selection ─── */

  #selectItem(item) {
    // Pointer, keyboard, and assistive activation share this guard.
    if (item.getAttribute('aria-disabled') === 'true') return;

    const value = item.getAttribute('data-value') || item.textContent.trim();
    const label = item.textContent.trim();

    this.#input.value = label;
    this.#hidden.value = value;
    this.setAttribute('value', value);

    this.#getItems().forEach((i) => {
      i.setAttribute('aria-selected', i === item ? 'true' : 'false');
    });

    this.close();
    this.#input.focus();

    this.dispatchEvent(
      new CustomEvent('ren-change', {
        detail: { value, item },
        bubbles: true,
      })
    );
  }

  #selectByValue(value, { silent = false } = {}) {
    const item = this.#getItems().find(
      (i) => i.getAttribute('data-value') === value
    );
    if (!item) return;

    if (silent) {
      this.#input.value = item.textContent.trim();
      this.#hidden.value = value;
      this.#getItems().forEach((i) => {
        i.setAttribute('aria-selected', i === item ? 'true' : 'false');
      });
    } else {
      this.#selectItem(item);
    }
  }

  /* ─── Public API ─── */

  open() {
    if (this.#isOpen) return;
    this.#isOpen = true;
    this.#suspendHover();
    this.#list.hidden = false;
    this.#placeList();
    this.#startFollowing();
    this.#input.setAttribute('aria-expanded', 'true');
    this.#dismissLayer?.activate();
    this.dispatchEvent(new CustomEvent('ren-open', { bubbles: true }));
  }

  close() {
    if (!this.#isOpen) return;
    this.#isOpen = false;
    this.#list.hidden = true;
    this.#stopFollowing();
    this.#setSide(normalizeComboboxSide(this.getAttribute('placement')));
    this.#input.setAttribute('aria-expanded', 'false');
    this.#input.removeAttribute('aria-activedescendant');
    this.#getItems().forEach((i) => i.removeAttribute('data-highlighted'));
    this.#highlightedIndex = -1;
    this.#dismissLayer?.deactivate();
    this.dispatchEvent(new CustomEvent('ren-close', { bubbles: true }));
  }

  setLoading(isLoading) {
    if (!this.#loading) return;
    this.#loading.hidden = !isLoading;
    if (isLoading) this.#empty.hidden = true;
  }

  setItems(items) {
    // Clear existing items (preserve groups, empty, loading)
    this.#getItems().forEach((i) => i.remove());

    const frag = document.createDocumentFragment();
    items.forEach(({ value, label, description, disabled }) => {
      const item = document.createElement('div');
      item.className = 'ren-combobox-item';
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', 'false');
      item.setAttribute('tabindex', '-1');
      autoId(item, 'combobox-opt');
      item.dataset.value = value;
      if (disabled) item.setAttribute('aria-disabled', 'true');

      if (description) {
        const main = document.createElement('div');
        main.className = 'ren-combobox-item-label';
        main.textContent = label;
        const desc = document.createElement('div');
        desc.className = 'ren-combobox-item-description';
        desc.textContent = description;
        item.append(main, desc);
      } else {
        item.textContent = label;
      }
      frag.appendChild(item);
    });

    this.#list.insertBefore(frag, this.#empty);
    this.#empty.hidden = items.length > 0;
    this.#highlightedIndex = -1;
  }

  get value() {
    return this.#hidden ? this.#hidden.value : '';
  }

  set value(val) {
    if (val == null || val === '') {
      if (this.#input) this.#input.value = '';
      if (this.#hidden) this.#hidden.value = '';
      this.#getItems().forEach((i) => i.setAttribute('aria-selected', 'false'));
      this.removeAttribute('value');
    } else {
      this.setAttribute('value', val);
    }
  }
}

if (!customElements.get('ren-combobox')) {
  customElements.define('ren-combobox', RenCombobox);
}
