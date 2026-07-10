---
type: "RenDS Component"
title: ren-hover-card
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:composite:ren-hover-card
sourcePath: components/composites/ren-hover-card
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - component
  - composite
  - ren10
  - rends
---

# ren-hover-card

Source path: `components/composites/ren-hover-card`

## Relationships

- `exposes_selector` -> [.ren-hover-card](../../selectors/ren-hover-card.md)
- `exposes_selector` -> [.ren-hover-card-body](../../selectors/ren-hover-card-body.md)
- `exposes_selector` -> [.ren-hover-card-footer](../../selectors/ren-hover-card-footer.md)
- `exposes_selector` -> [.ren-hover-card-header](../../selectors/ren-hover-card-header.md)
- `exposes_selector` -> [.ren-hover-card-lg](../../selectors/ren-hover-card-lg.md)
- `exposes_selector` -> [.ren-hover-card-sm](../../selectors/ren-hover-card-sm.md)
- `exposes_selector` -> [.ren-hover-card-trigger](../../selectors/ren-hover-card-trigger.md)
- `has_contract` -> [ren-hover-card component.md](../../foundation/contract-composite-ren-hover-card.md)
- `has_css` -> [ren-hover-card.css](../../css/ren-hover-card-css.md)
- `has_docs_page` -> [ren-hover-card docs](../../docs/ren-hover-card-docs.md)
- `has_js` -> [ren-hover-card.js](../../javascript/ren-hover-card-js.md)
- `uses_token` -> [--color-accent](../../tokens/color-accent.md)
- `uses_token` -> [--color-accent-strong](../../tokens/color-accent-strong.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-surface](../../tokens/color-surface.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-muted](../../tokens/color-text-muted.md)
- `uses_token` -> [--duration-enter](../../tokens/duration-enter.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--font-size-body](../../tokens/font-size-body.md)
- `uses_token` -> [--font-size-body-sm](../../tokens/font-size-body-sm.md)
- `uses_token` -> [--font-size-xs](../../tokens/font-size-xs.md)
- `uses_token` -> [--radius-lg](../../tokens/radius-lg.md)
- `uses_token` -> [--radius-md](../../tokens/radius-md.md)
- `uses_token` -> [--shadow-xl](../../tokens/shadow-xl.md)
- `uses_token` -> [--space-0-25](../../tokens/space-0-25.md)
- `uses_token` -> [--space-0-5](../../tokens/space-0-5.md)
- `uses_token` -> [--space-1](../../tokens/space-1.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-3](../../tokens/space-3.md)
- `uses_token` -> [--space-4](../../tokens/space-4.md)
- `uses_token` -> [--space-5](../../tokens/space-5.md)
- `uses_token` -> [--transition-tactile](../../tokens/transition-tactile.md)

## Structured Data

```json
{
  "kind": "composite",
  "selectors": [
    ".ren-hover-card",
    ".ren-hover-card-body",
    ".ren-hover-card-footer",
    ".ren-hover-card-header",
    ".ren-hover-card-lg",
    ".ren-hover-card-sm",
    ".ren-hover-card-trigger"
  ],
  "tokens": [
    "--color-accent",
    "--color-accent-strong",
    "--color-border",
    "--color-surface",
    "--color-text",
    "--color-text-muted",
    "--duration-enter",
    "--ease-enter",
    "--font-size-body",
    "--font-size-body-sm",
    "--font-size-xs",
    "--radius-lg",
    "--radius-md",
    "--shadow-xl",
    "--space-0-25",
    "--space-0-5",
    "--space-1",
    "--space-2",
    "--space-3",
    "--space-4",
    "--space-5",
    "--transition-tactile"
  ],
  "hasScript": true,
  "hasDocsPage": true
}
```

## Source Content

# ren-hover-card Component Contract

Non-blocking preview surface shown from hover/focus intent.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-hover-card` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-hover-card` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Hover Card composite behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this composite.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "Hover or keyboard-focus over a trigger should reveal a richer-than-tooltip preview (header + body + footer)."
    - "The preview is informational and non-essential — user can ignore it without losing access to the action."
    - "Show/hide should respect intent: 200ms show delay, 300ms hide grace area so the cursor can move into the card."
    - "Need anchor positioning via position-area + viewport flip via CSS position-try-fallbacks (no JS positioning)."
    - "Trigger keyboard accessibility via focusin/focusout, not just :hover."
  avoidWhen:
    - "The trigger is a primary action and the disclosure is required for the task — use ren-popover (click-driven) or ren-dialog."
    - "You only need a short text annotation — use ren-tooltip (smaller surface, role=\"tooltip\")."
    - "The disclosure must be operable on touch devices without a hover state — touch has no hover; use ren-popover."
    - "Content includes form inputs, focusable controls beyond simple links — ren-popover gives proper dialog semantics."

canonicalImports:
  css:
    - "rends/components/composites/ren-hover-card/ren-hover-card.css"
  js:
    - "rends/components/composites/ren-hover-card/ren-hover-card.js"
  notes:
    - "JS is required: it adds anchor-name/position-anchor inline styles, wires mouseenter/leave + focusin/out, and toggles the native Popover API."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Place the trigger element immediately before <ren-hover-card>, OR set data-hover-trigger=\"<selector>\" on the host to point at a remote trigger."
  - "Inside <ren-hover-card> include a real element with class=\"ren-hover-card\" (the JS will add popover=\"manual\" and the .ren-hover-card class if missing)."
  - "Use .ren-hover-card-header / -body / -footer as the three layout slots; headers should contain a real <h3> or <h4> for the accessible heading."
  - "The trigger receives aria-haspopup=\"tooltip\" and aria-expanded automatically — do not override these in markup."
  - "Show/hide delays come from show-delay / hide-delay attributes (milliseconds) on the host; do not throttle via inline scripts."

forbiddenPatterns:
  - "Using ren-hover-card for click-driven disclosure — there is no click handler, only mouseenter/focusin."
  - "Putting interactive form inputs inside .ren-hover-card-body — the card closes on mouseleave/focusout, so focusing an input would dismiss it."
  - "Manually setting popover=\"auto\" on the inner card — the JS uses popover=\"manual\" so the open/close lifecycle stays in the component's hands."
  - "Overriding the ::before arrow with custom shapes — keep the inherited background/border so it auto-themes."
  - "Hardcoding width via inline styles or non-token values — use .ren-hover-card-sm / -lg or override --color-surface / --shadow-xl through semantic tokens."

tokenPolicy:
  allowed:
    - "Component-level positioning anchor token: --ren-hover-card-anchor (and the internal --ren-hover-card-anchor anchor-name)."
    - "Semantic tokens that style the card chrome and content: --color-surface, --color-border, --color-text, --color-text-muted, --color-accent, --color-accent-strong, --shadow-xl, --radius-lg, --radius-md."
    - "Layout / type / motion tokens: --space-* (0-25, 0-5, 1, 2, 3, 4, 5), --font-size-body, --font-size-body-sm, --font-size-xs, --duration-enter, --ease-enter, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer overrides."
    - "Hardcoded box-shadow / hex colors on the card surface — pipe through --shadow-xl and --color-surface / --color-border."
    - "Custom transition durations; reuse --duration-enter / --ease-enter to honour reduced-motion."

accessibility:
  required:
    - "Trigger must be a focusable element so focusin/focusout reveal the card via keyboard, not only hover."
    - "Trigger carries aria-haspopup=\"tooltip\" and aria-expanded that flips true/false in sync with show()/hide()."
    - "The card uses the native Popover API (popover=\"manual\") so it inerts other content correctly when shown."
    - "Reduced motion disables the entrance animation and hides the decorative arrow; do not override the @media (prefers-reduced-motion: reduce) rules."
    - "On viewports under 640px the card stretches to viewport width — do not lock min-width that breaks this responsive behavior."
    - "Hover cards must never be the only path to an action; provide a click-driven affordance (ren-popover / ren-link) for touch and AT users."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-hover-card/ren-hover-card.css">
<script type="module" src="rends/components/composites/ren-hover-card/ren-hover-card.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-hover-card">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-hover-card`
- `.ren-hover-card-body`
- `.ren-hover-card-disabled`
- `.ren-hover-card-footer`
- `.ren-hover-card-header`
- `.ren-hover-card-lg`
- `.ren-hover-card-loading`
- `.ren-hover-card-sm`
- `.ren-hover-card-trigger`

## States And Attributes

- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-hover-card-anchor`

If no `--ren-*` token is detected here, theme through semantic tokens from `tokens/tokens.md` and avoid selector overrides.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-hover-card/ren-hover-card.css`
- `components/composites/ren-hover-card/ren-hover-card.js`
- `docs/components/ren-hover-card.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/* ═══ REN HOVER CARD COMPONENT ═══ */

/* ═══ TRIGGER ELEMENT ═══ */
.ren-hover-card-trigger {
  anchor-name: --ren-hover-card-anchor;
}

/* ═══ BASE CARD ═══ */
.ren-hover-card {
  position-anchor: --ren-hover-card-anchor;
  position: absolute;
  position-area: bottom span-all;
  inset: auto;
  margin-block-start: var(--space-2);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  padding: var(--space-4);
  max-width: 20rem;
  min-width: 15rem;
  z-index: 1000;

  /* ═══ POPOVER API ═══
     Semantic tokens keep hover-card in sync with tooltip + popover. */
  &:popover-open {
    animation: ren-hover-card-in var(--duration-enter) var(--ease-enter) both;
  }

  /* ═══ ARROW STYLING ═══ */
  &::before {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    background: inherit;
    border: inherit;
    border-inline-end: none;
    border-bottom: none;
    transform: rotate(45deg);
    z-index: -1;
    top: -4px;
    left: 50%;
    margin-inline-start: -4px;
  }

  /* ═══ FALLBACK POSITIONING ═══ */
  @supports not ((anchor-name: --ren-anchor) and
    (position-anchor: --ren-anchor) and
    (position-area: bottom span-all)) {
    position: fixed;
    top: auto;
    left: auto;
  }

  /* ═══ VIEWPORT EDGE HANDLING ═══ */
  @supports (position-try-fallbacks: flip-block) {
    position-try-fallbacks: flip-block;
  }
}

/* ═══ ANIMATION ═══ */
@starting-style {
  .ren-hover-card:popover-open {
    opacity: 0;
    translate: 0 -4px;
  }
}

@keyframes ren-hover-card-in {
  from {
    opacity: 0;
    translate: 0 -4px;
  }

  to {
    opacity: 1;
    translate: 0 0;
  }
}

/* ═══ SECTIONS ═══ */
.ren-hover-card-header {
  margin-bottom: var(--space-3);

  & h3,
  & h4 {
    margin: 0 0 var(--space-0-5) 0;
    font-size: var(--font-size-body);
    font-weight: 600;
    color: var(--color-text);
  }

  & p {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }
}

.ren-hover-card-body {
  margin-bottom: var(--space-3);
  font-size: var(--font-size-body-sm);
  color: var(--color-text);
  line-height: 1.5;

  & :last-child {
    margin-bottom: 0;
  }
}

.ren-hover-card-footer {
  display: flex;
  gap: var(--space-2);
  align-items: center;

  & button,
  & a {
    font-size: var(--font-size-body-sm);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-md);
    border: none;
    cursor: pointer;
    transition: var(--transition-tactile);

    &:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }
  }
}

/* ═══ REDUCED MOTION ═══ */
@media (prefers-reduced-motion: reduce) {
  .ren-hover-card {
    &:popover-open {
      animation: none;
      opacity: 1;
      translate: 0 0;
    }

    &::before {
      display: none;
    }
  }
}

/* ═══ DARK MODE SUPPORT (OPTIONAL) ═══ */
@media (prefers-color-scheme: dark) {
  .ren-hover-card {
    /* ═══ USES CSS VARIABLES - AUTO ADAPTS ═══ */
  }
}

/* ═══ MOBILE RESPONSIVENESS ═══
   Hover cards keep a media query here because they're
   positioned absolutely relative to the viewport, and
   the constraint is viewport space, not container width. */
@media (max-width: 640px) {
  .ren-hover-card {
    max-width: calc(100vw - var(--space-4));
    min-width: auto;
    width: calc(100vw - var(--space-4));
  }
}

/* ═══ LOADING STATE ═══ */
.ren-hover-card.ren-hover-card-loading {
  pointer-events: none;

  & .ren-hover-card-body {
    opacity: 0.6;
  }
}

/* ═══ DISABLED STATE ═══ */
.ren-hover-card.ren-hover-card-disabled {
  display: none;
}

/* ═══ CUSTOM VARIANTS ═══ */
.ren-hover-card {
  &.ren-hover-card-sm {
    padding: var(--space-2);
    max-width: 15rem;
    min-width: 12rem;

    & .ren-hover-card-header {
      margin-bottom: var(--space-2);

      & h3,
      & h4 {
        font-size: var(--font-size-body-sm);
        margin-bottom: var(--space-0-25);
      }
    }

    & .ren-hover-card-body {
      margin-bottom: var(--space-2);
      font-size: var(--font-size-xs);
    }
  }

  &.ren-hover-card-lg {
    padding: var(--space-5);
    max-width: 25rem;
    min-width: 18rem;

    & .ren-hover-card-header {
      margin-bottom: var(--space-4);

      & h3,
      & h4 {
        font-size: var(--font-size-body);
      }
    }

    & .ren-hover-card-body {
      margin-bottom: var(--space-4);
      font-size: var(--font-size-body);
    }
  }
}

/* ═══ INNER LINKS STYLING ═══ */
.ren-hover-card a {
  color: var(--color-accent);
  text-decoration: underline;
  transition: var(--transition-tactile);

  &:hover {
    color: var(--color-accent-strong);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
}


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
