/* ═══════════════════════════════════════════════════════════════
   REN OTP (ONE-TIME PASSWORD) INPUT WEB COMPONENT
   ═══════════════════════════════════════════════════════════════
   A light-DOM web component for collecting OTP/PIN codes.
   Auto-creates input slots, manages focus transitions,
   handles paste events, and validates completion.

   Attributes:
   - length: Number of code slots (default: 6)
   - type: "numeric" or "alphanumeric" (default: "numeric")
   - disabled: Disable all slots

   Data Attributes:
   - data-valid: Set to mark as success
   - data-invalid: Set to mark as error
   - data-filled: Set on individual slots when they have content

   Events:
   - ren-change: Dispatched on any slot change { value: partial }
   - ren-complete: Dispatched when all slots filled { value: complete }

   Methods:
   - getValue(): Return current combined code
   - reset(): Clear all slots
   - focus(): Focus first slot
   ═══════════════════════════════════════════════════════════════ */

export class RenOtp extends HTMLElement {
  constructor() {
    super();

    /* ═══ STATE ═══ */
    this.length = 6;
    this.type = 'numeric';
    this.slots = [];

    /* ═══ BIND METHODS ═══ */
    this.handleSlotInput = this.handleSlotInput.bind(this);
    this.handleSlotKeydown = this.handleSlotKeydown.bind(this);
    this.handleSlotPaste = this.handleSlotPaste.bind(this);
    this.handleSlotFocus = this.handleSlotFocus.bind(this);
  }

  connectedCallback() {
    /* ═══ READ ATTRIBUTES ═══ */
    const lengthAttr = this.getAttribute('length');
    const typeAttr = this.getAttribute('type');
    const disabledAttr = this.hasAttribute('disabled');

    if (lengthAttr !== null) this.length = parseInt(lengthAttr, 10);
    if (typeAttr !== null) this.type = typeAttr;

    /* ═══ CREATE SLOTS ═══ */
    this.createSlots(disabledAttr);
  }

  /* ═══════════════════════════════════════════════════════════════
     SLOT CREATION & SETUP
     ═══════════════════════════════════════════════════════════════ */
  createSlots(disabled = false) {
    /* ═══ CLEAR EXISTING SLOTS ═══ */
    this.slots = [];
    const existingSlots = this.querySelectorAll('.ren-otp-slot');
    existingSlots.forEach((slot) => slot.remove());

    /* ═══ CREATE NEW SLOTS ═══ */
    for (let i = 0; i < this.length; i++) {
      const slot = document.createElement('input');
      slot.type = 'text';
      slot.className = 'ren-otp-slot';
      slot.setAttribute('inputmode', this.type === 'numeric' ? 'numeric' : 'text');
      slot.setAttribute('maxlength', '1');
      slot.setAttribute('placeholder', '•');
      slot.setAttribute('autocomplete', 'off');
      slot.setAttribute('data-index', i.toString());
      slot.setAttribute('aria-label', `Code digit ${i + 1} of ${this.length}`);

      if (disabled) {
        slot.disabled = true;
      }

      /* ═══ ATTACH EVENT LISTENERS ═══ */
      slot.addEventListener('input', this.handleSlotInput);
      slot.addEventListener('keydown', this.handleSlotKeydown);
      slot.addEventListener('paste', this.handleSlotPaste);
      slot.addEventListener('focus', this.handleSlotFocus);

      this.appendChild(slot);
      this.slots.push(slot);
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     EVENT HANDLERS
     ═══════════════════════════════════════════════════════════════ */

  handleSlotInput = (e) => {
    const slot = e.target;
    const index = parseInt(slot.getAttribute('data-index'), 10);
    let value = slot.value;

    /* ═══ VALIDATE INPUT ═══ */
    if (this.type === 'numeric') {
      value = value.replace(/[^0-9]/g, '');
    } else if (this.type === 'alphanumeric') {
      value = value.replace(/[^a-zA-Z0-9]/g, '');
    }

    /* ═══ ENFORCE MAX LENGTH ═══ */
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    slot.value = value;

    /* ═══ UPDATE FILLED STATE ═══ */
    if (value) {
      slot.setAttribute('data-filled', '');
    } else {
      slot.removeAttribute('data-filled');
    }

    /* ═══ AUTO-ADVANCE TO NEXT SLOT ═══ */
    if (value && index < this.slots.length - 1) {
      this.slots[index + 1].focus();
    }

    /* ═══ DISPATCH CHANGE EVENT ═══ */
    this.dispatchChangeEvent();

    /* ═══ CHECK COMPLETION ═══ */
    this.checkCompletion();
  };

  handleSlotKeydown = (e) => {
    const slot = e.target;
    const index = parseInt(slot.getAttribute('data-index'), 10);

    /* ═══ BACKSPACE: MOVE TO PREVIOUS SLOT ═══ */
    if (e.key === 'Backspace') {
      if (slot.value) {
        slot.value = '';
        slot.removeAttribute('data-filled');
        this.dispatchChangeEvent();
      } else if (index > 0) {
        e.preventDefault();
        const prevSlot = this.slots[index - 1];
        prevSlot.value = '';
        prevSlot.removeAttribute('data-filled');
        prevSlot.focus();
        this.dispatchChangeEvent();
      }
    }

    /* ═══ ARROW KEYS: NAVIGATE SLOTS ═══ */
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      this.slots[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < this.slots.length - 1) {
      e.preventDefault();
      this.slots[index + 1].focus();
    }

    /* ═══ HOME/END: FIRST/LAST SLOT ═══ */
    if (e.key === 'Home') {
      e.preventDefault();
      this.slots[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      this.slots[this.slots.length - 1].focus();
    }
  };

  handleSlotPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData?.getData('text') || '';

    if (!pastedData) return;

    /* ═══ VALIDATE PASTED DATA ═══ */
    let sanitized = pastedData;
    if (this.type === 'numeric') {
      sanitized = pastedData.replace(/[^0-9]/g, '');
    } else if (this.type === 'alphanumeric') {
      sanitized = pastedData.replace(/[^a-zA-Z0-9]/g, '');
    }

    /* ═══ DISTRIBUTE ACROSS SLOTS ═══ */
    const index = parseInt(e.target.getAttribute('data-index'), 10);
    for (let i = 0; i < sanitized.length && index + i < this.slots.length; i++) {
      const slot = this.slots[index + i];
      slot.value = sanitized[i];
      slot.setAttribute('data-filled', '');
    }

    /* ═══ FOCUS NEXT EMPTY OR LAST SLOT ═══ */
    const nextEmptyIndex = this.slots.findIndex(
      (s, i) => i >= index && s.value === ''
    );
    if (nextEmptyIndex !== -1) {
      this.slots[nextEmptyIndex].focus();
    } else {
      this.slots[this.slots.length - 1].focus();
    }

    /* ═══ DISPATCH CHANGE & CHECK COMPLETION ═══ */
    this.dispatchChangeEvent();
    this.checkCompletion();
  };

  handleSlotFocus = (e) => {
    /* ═══ SELECT ALL TEXT WHEN FOCUSED ═══ */
    e.target.select();
  };

  /* ═══════════════════════════════════════════════════════════════
     PUBLIC METHODS
     ═══════════════════════════════════════════════════════════════ */

  getValue() {
    return this.slots.map((slot) => slot.value).join('');
  }

  reset() {
    this.slots.forEach((slot) => {
      slot.value = '';
      slot.removeAttribute('data-filled');
    });

    this.removeAttribute('data-valid');
    this.removeAttribute('data-invalid');
    this.dispatchChangeEvent();

    if (this.slots.length > 0) {
      this.slots[0].focus();
    }
  }

  setValid(isValid) {
    if (isValid) {
      this.setAttribute('data-valid', '');
      this.removeAttribute('data-invalid');
    } else {
      this.setAttribute('data-invalid', '');
      this.removeAttribute('data-valid');
    }
  }

  clearValidation() {
    this.removeAttribute('data-valid');
    this.removeAttribute('data-invalid');
  }

  /* ═══════════════════════════════════════════════════════════════
     UTILITY METHODS
     ═══════════════════════════════════════════════════════════════ */

  checkCompletion() {
    const value = this.getValue();
    const isComplete = value.length === this.length;

    if (isComplete) {
      this.dispatchCompleteEvent(value);
    }
  }

  dispatchChangeEvent() {
    const value = this.getValue();

    this.dispatchEvent(
      new CustomEvent('ren-change', {
        bubbles: true,
        composed: true,
        detail: {
          value: value,
        },
      })
    );
  }

  dispatchCompleteEvent(value) {
    this.dispatchEvent(
      new CustomEvent('ren-complete', {
        bubbles: true,
        composed: true,
        detail: {
          value: value,
        },
      })
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     PROPERTIES
     ═══════════════════════════════════════════════════════════════ */

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    if (val) {
      this.setAttribute('disabled', '');
      this.slots.forEach((slot) => {
        slot.disabled = true;
      });
    } else {
      this.removeAttribute('disabled');
      this.slots.forEach((slot) => {
        slot.disabled = false;
      });
    }
  }

  /* ═══ OVERRIDE FOCUS METHOD ═══ */
  focus() {
    if (this.slots.length > 0) {
      this.slots[0].focus();
    }
  }
}

/* ═══ REGISTER COMPONENT ═══ */
if (!customElements.get('ren-otp')) {
  customElements.define('ren-otp', RenOtp);
}
