/* ═══ REN HOVER CARD WEB COMPONENT ═══ */

export class RenHoverCard extends HTMLElement {
  constructor() {
    super();
    this.card = null;
    this.trigger = null;
    this.showDelay = 200;
    this.hideDelay = 300;
    this.showTimeout = null;
    this.hideTimeout = null;
    this.isOpen = false;

    /* ═══ BIND METHODS ═══ */
    this.handleTriggerMouseEnter = this.handleTriggerMouseEnter.bind(this);
    this.handleTriggerMouseLeave = this.handleTriggerMouseLeave.bind(this);
    this.handleTriggerFocusIn = this.handleTriggerFocusIn.bind(this);
    this.handleTriggerFocusOut = this.handleTriggerFocusOut.bind(this);
    this.handleCardMouseEnter = this.handleCardMouseEnter.bind(this);
    this.handleCardMouseLeave = this.handleCardMouseLeave.bind(this);
  }

  connectedCallback() {
    /* ═══ FIND OR CREATE CARD ═══ */
    this.card = this.querySelector('[role="tooltip"]') || this.querySelector('.ren-hover-card');

    if (!this.card) {
      console.warn('RenHoverCard: No card element found');
      return;
    }

    /* ═══ ENSURE CARD HAS CLASS ═══ */
    this.card.classList.add('ren-hover-card');

    /* ═══ SET UP POPOVER ATTRIBUTE ═══ */
    if (!this.card.hasAttribute('popover')) {
      this.card.setAttribute('popover', 'manual');
    }

    /* ═══ FIND TRIGGER ═══ */
    const triggerSelector = this.getAttribute('data-hover-trigger');
    if (triggerSelector) {
      this.trigger = document.querySelector(triggerSelector);
    } else {
      this.trigger = this.previousElementSibling;
    }

    if (!this.trigger) {
      console.warn('RenHoverCard: No trigger element found');
      return;
    }

    /* ═══ SET UP TRIGGER ARIA ATTRIBUTES ═══ */
    this.trigger.classList.add('ren-hover-card-trigger');
    this.trigger.setAttribute('aria-haspopup', 'tooltip');
    this.trigger.setAttribute('aria-expanded', 'false');

    /* ═══ READ DELAY ATTRIBUTES ═══ */
    const showDelayAttr = this.getAttribute('show-delay');
    const hideDelayAttr = this.getAttribute('hide-delay');
    if (showDelayAttr) this.showDelay = parseInt(showDelayAttr, 10);
    if (hideDelayAttr) this.hideDelay = parseInt(hideDelayAttr, 10);

    /* ═══ SET ANCHOR NAME ON TRIGGER ═══ */
    if (!this.trigger.style.anchorName) {
      this.trigger.style.anchorName = '--ren-hover-card-anchor';
    }

    /* ═══ SET POSITION ANCHOR ON CARD ═══ */
    if (!this.card.style.positionAnchor) {
      this.card.style.positionAnchor = '--ren-hover-card-anchor';
    }

    /* ═══ ATTACH EVENT LISTENERS ═══ */
    this.trigger.addEventListener('mouseenter', this.handleTriggerMouseEnter);
    this.trigger.addEventListener('mouseleave', this.handleTriggerMouseLeave);
    this.trigger.addEventListener('focusin', this.handleTriggerFocusIn);
    this.trigger.addEventListener('focusout', this.handleTriggerFocusOut);

    this.card.addEventListener('mouseenter', this.handleCardMouseEnter);
    this.card.addEventListener('mouseleave', this.handleCardMouseLeave);
  }

  disconnectedCallback() {
    if (this.trigger) {
      this.trigger.removeEventListener('mouseenter', this.handleTriggerMouseEnter);
      this.trigger.removeEventListener('mouseleave', this.handleTriggerMouseLeave);
      this.trigger.removeEventListener('focusin', this.handleTriggerFocusIn);
      this.trigger.removeEventListener('focusout', this.handleTriggerFocusOut);
    }

    if (this.card) {
      this.card.removeEventListener('mouseenter', this.handleCardMouseEnter);
      this.card.removeEventListener('mouseleave', this.handleCardMouseLeave);
    }

    this.clearTimeouts();
  }

  /* ═══ TRIGGER MOUSE ENTER ═══ */
  handleTriggerMouseEnter() {
    this.clearTimeouts();
    this.showTimeout = setTimeout(() => this.show(), this.showDelay);
  }

  /* ═══ TRIGGER MOUSE LEAVE ═══ */
  handleTriggerMouseLeave() {
    this.clearShowTimeout();
    /* ═══ GRACE PERIOD: KEEP OPEN IF MOUSE MOVES TO CARD ═══ */
    this.hideTimeout = setTimeout(() => this.hide(), this.hideDelay);
  }

  /* ═══ TRIGGER FOCUS IN (KEYBOARD) ═══ */
  handleTriggerFocusIn() {
    this.clearTimeouts();
    this.show();
  }

  /* ═══ TRIGGER FOCUS OUT (KEYBOARD) ═══ */
  handleTriggerFocusOut() {
    this.clearTimeouts();
    this.hideTimeout = setTimeout(() => this.hide(), this.hideDelay);
  }

  /* ═══ CARD MOUSE ENTER (GRACE AREA) ═══ */
  handleCardMouseEnter() {
    this.clearHideTimeout();
  }

  /* ═══ CARD MOUSE LEAVE ═══ */
  handleCardMouseLeave() {
    this.hideTimeout = setTimeout(() => this.hide(), this.hideDelay);
  }

  /* ═══ SHOW CARD ═══ */
  show() {
    if (!this.card) return;

    this.clearTimeouts();
    this.card.showPopover();
    this.trigger.setAttribute('aria-expanded', 'true');
    this.isOpen = true;

    this.dispatchEvent(
      new CustomEvent('ren-hover-card-open', {
        bubbles: true,
        composed: true,
      })
    );
  }

  /* ═══ HIDE CARD ═══ */
  hide() {
    if (!this.card) return;

    this.clearTimeouts();

    try {
      this.card.hidePopover();
    } catch (e) {
      /* ═══ POPOVER API MAY NOT EXIST ═══ */
      this.card.style.display = 'none';
    }

    this.trigger.setAttribute('aria-expanded', 'false');
    this.isOpen = false;

    this.dispatchEvent(
      new CustomEvent('ren-hover-card-close', {
        bubbles: true,
        composed: true,
      })
    );
  }

  /* ═══ TOGGLE CARD ═══ */
  toggle() {
    if (this.isOpen) {
      this.hide();
    } else {
      this.show();
    }
  }

  /* ═══ CLEAR ALL TIMEOUTS ═══ */
  clearTimeouts() {
    this.clearShowTimeout();
    this.clearHideTimeout();
  }

  /* ═══ CLEAR SHOW TIMEOUT ═══ */
  clearShowTimeout() {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
  }

  /* ═══ CLEAR HIDE TIMEOUT ═══ */
  clearHideTimeout() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  /* ═══ GETTERS AND SETTERS ═══ */
  get open() {
    return this.isOpen;
  }

  set open(val) {
    if (val) {
      this.show();
    } else {
      this.hide();
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    if (val) {
      this.setAttribute('disabled', '');
      this.card?.classList.add('ren-hover-card-disabled');
    } else {
      this.removeAttribute('disabled');
      this.card?.classList.remove('ren-hover-card-disabled');
    }
  }
}

/* ═══ REGISTER COMPONENT ═══ */
if (!customElements.get('ren-hover-card')) {
  customElements.define('ren-hover-card', RenHoverCard);
}
