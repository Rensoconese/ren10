---
type: "RenDS Component"
title: ren-command
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:pattern:ren-command
sourcePath: components/patterns/ren-command
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - component
  - pattern
  - ren10
  - rends
---

# ren-command

Source path: `components/patterns/ren-command`

## Relationships

- `exposes_selector` -> [.ren-command](../../selectors/ren-command.md)
- `exposes_selector` -> [.ren-command-empty](../../selectors/ren-command-empty.md)
- `exposes_selector` -> [.ren-command-footer](../../selectors/ren-command-footer.md)
- `exposes_selector` -> [.ren-command-footer-hint](../../selectors/ren-command-footer-hint.md)
- `exposes_selector` -> [.ren-command-group](../../selectors/ren-command-group.md)
- `exposes_selector` -> [.ren-command-group-heading](../../selectors/ren-command-group-heading.md)
- `exposes_selector` -> [.ren-command-input](../../selectors/ren-command-input.md)
- `exposes_selector` -> [.ren-command-input-wrapper](../../selectors/ren-command-input-wrapper.md)
- `exposes_selector` -> [.ren-command-item](../../selectors/ren-command-item.md)
- `exposes_selector` -> [.ren-command-item-content](../../selectors/ren-command-item-content.md)
- `exposes_selector` -> [.ren-command-item-description](../../selectors/ren-command-item-description.md)
- `exposes_selector` -> [.ren-command-item-icon](../../selectors/ren-command-item-icon.md)
- `exposes_selector` -> [.ren-command-item-shortcut](../../selectors/ren-command-item-shortcut.md)
- `exposes_selector` -> [.ren-command-item-title](../../selectors/ren-command-item-title.md)
- `exposes_selector` -> [.ren-command-kbd](../../selectors/ren-command-kbd.md)
- `exposes_selector` -> [.ren-command-list](../../selectors/ren-command-list.md)
- `exposes_selector` -> [.ren-command-separator](../../selectors/ren-command-separator.md)
- `has_contract` -> [ren-command pattern.md](../../foundation/contract-pattern-ren-command.md)
- `has_css` -> [ren-command.css](../../css/ren-command-css.md)
- `has_docs_page` -> [ren-command docs](../../docs/ren-command-docs.md)
- `has_js` -> [ren-command.js](../../javascript/ren-command-js.md)
- `uses_token` -> [--duration-enter](../../tokens/duration-enter.md)
- `uses_token` -> [--duration-overlay](../../tokens/duration-overlay.md)
- `uses_token` -> [--duration-state](../../tokens/duration-state.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--ease-state-change](../../tokens/ease-state-change.md)
- `uses_token` -> [--ren-body-size](../../tokens/ren-body-size.md)
- `uses_token` -> [--ren-border](../../tokens/ren-border.md)
- `uses_token` -> [--ren-caption-size](../../tokens/ren-caption-size.md)
- `uses_token` -> [--ren-fill](../../tokens/ren-fill.md)
- `uses_token` -> [--ren-fill-hover](../../tokens/ren-fill-hover.md)
- `uses_token` -> [--ren-font-mono](../../tokens/ren-font-mono.md)
- `uses_token` -> [--ren-radius-xl](../../tokens/ren-radius-xl.md)
- `uses_token` -> [--ren-separator](../../tokens/ren-separator.md)
- `uses_token` -> [--ren-space-1](../../tokens/ren-space-1.md)
- `uses_token` -> [--ren-space-2](../../tokens/ren-space-2.md)
- `uses_token` -> [--ren-space-3](../../tokens/ren-space-3.md)
- `uses_token` -> [--ren-space-4](../../tokens/ren-space-4.md)
- `uses_token` -> [--ren-space-8](../../tokens/ren-space-8.md)
- `uses_token` -> [--ren-surface](../../tokens/ren-surface.md)
- `uses_token` -> [--ren-text](../../tokens/ren-text.md)
- `uses_token` -> [--ren-text-faint](../../tokens/ren-text-faint.md)
- `uses_token` -> [--ren-text-muted](../../tokens/ren-text-muted.md)
- `uses_token` -> [--ren-z-modal](../../tokens/ren-z-modal.md)

## Structured Data

```json
{
  "kind": "pattern",
  "selectors": [
    ".ren-command",
    ".ren-command-empty",
    ".ren-command-footer",
    ".ren-command-footer-hint",
    ".ren-command-group",
    ".ren-command-group-heading",
    ".ren-command-input",
    ".ren-command-input-wrapper",
    ".ren-command-item",
    ".ren-command-item-content",
    ".ren-command-item-description",
    ".ren-command-item-icon",
    ".ren-command-item-shortcut",
    ".ren-command-item-title",
    ".ren-command-kbd",
    ".ren-command-list",
    ".ren-command-separator"
  ],
  "tokens": [
    "--duration-enter",
    "--duration-overlay",
    "--duration-state",
    "--ease-enter",
    "--ease-state-change",
    "--ren-body-size",
    "--ren-border",
    "--ren-caption-size",
    "--ren-fill",
    "--ren-fill-hover",
    "--ren-font-mono",
    "--ren-radius-xl",
    "--ren-separator",
    "--ren-space-1",
    "--ren-space-2",
    "--ren-space-3",
    "--ren-space-4",
    "--ren-space-8",
    "--ren-surface",
    "--ren-text",
    "--ren-text-faint",
    "--ren-text-muted",
    "--ren-z-modal"
  ],
  "hasScript": true,
  "hasDocsPage": true
}
```

## Source Content

# ren-command Pattern Contract

Command palette pattern for searchable application actions.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-command` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-command` pattern.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Command pattern behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this pattern.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "The product needs a Ctrl/Cmd+K command palette / Spotlight-style action launcher."
    - "Actions are searchable by title, description, or data-keywords, with keyboard up/down navigation and Enter to activate."
    - "Items are grouped (e.g. \"Navigation\", \"Settings\") via .ren-command-group with .ren-command-group-heading."
    - "You want a global keyboard shortcut (data-shortcut=\"ctrl+k\") that opens the palette from anywhere on the page."
    - "You need a modal overlay with backdrop + Escape-to-close dismissal driven by a real <dialog>."
  avoidWhen:
    - "The list is a navigation menu — use ren-nav or ren-menubar."
    - "The list is a static dropdown of options — use ren-menu / ren-select."
    - "The list is a filter for a data table — use ren-table-toolbar-search inside ren-table."
    - "There is no search input (just a static action list) — use ren-menu."

canonicalImports:
  css:
    - "rends/components/patterns/ren-command/ren-command.css"
  js:
    - "rends/components/patterns/ren-command/ren-command.js"
  notes:
    - "JS registers customElements.define('ren-command', ...) and owns the global shortcut listener, filtering, roving highlight, and ren-command-select event."
    - "The pattern is dialog-based; the underlying <dialog> must be present so showModal() / close() work."

requiredMarkup:
  - "Use a <ren-command> custom element wrapping a real <dialog class=\"ren-command\"> (the JS calls dialog.showModal())."
  - "Inside, include a .ren-command-input-wrapper with a <input class=\"ren-command-input\" type=\"text\"> and an optional .ren-command-kbd hint."
  - "Wrap action rows in <ul class=\"ren-command-list\"> (or container) of <button class=\"ren-command-item\"> rows; items may carry data-keywords, data-value, data-action."
  - "Group rows under <div class=\"ren-command-group\"><div class=\"ren-command-group-heading\">…</div>…</div>; the JS toggles [data-empty] on empty groups."
  - "Provide a .ren-command-empty fallback element; the JS shows it when the filter produces zero matches."
  - "Each .ren-command-item that has a shortcut puts the keys inside .ren-command-item-shortcut with <kbd> elements."

forbiddenPatterns:
  - "Implementing as a <div> with click handlers — must be <ren-command> + <dialog> so Escape, focus, and a11y come from the platform."
  - "Filtering items via display: none from external code — the component owns visibility via _filterItems()."
  - "Building roving focus / highlight manually — the [data-highlighted] attribute is set by the component on the active item."
  - "Binding a second Ctrl+K listener at the document level — use the data-shortcut attribute or registerAction() API."
  - "Submitting selection from a custom click handler that bypasses the ren-command-select event."

tokenPolicy:
  allowed:
    - "Public component tokens listed in Public Token API: --ren-command-bg, --ren-command-border, --ren-command-item-height, --ren-command-item-radius, --ren-command-max-height, --ren-command-radius, --ren-command-shadow, --ren-command-width."
    - "Semantic surface / text tokens consumed by selectors: --ren-surface, --ren-border, --ren-text, --ren-text-muted, --ren-text-faint, --ren-fill, --ren-fill-hover, --ren-separator."
    - "Spacing / motion tokens: --ren-space-*, --ren-radius-*, --duration-enter, --duration-overlay, --duration-state, --ease-enter, --ease-state-change."
    - "Z-index token: --ren-z-modal."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer overrides."
    - "Hardcoded hex / named colors for surface, border, fill, or text."
    - "Custom z-index values that bypass --ren-z-modal (the palette must layer above content but below toasts)."

accessibility:
  required:
    - "Render as a real <dialog> so focus trap, Escape, and inert background come from the browser."
    - "The input is a real <input type=\"text\"> with an accessible name (label or aria-label like \"Search commands\")."
    - "The component injects a [role=\"status\"][aria-live=\"polite\"] region announcing result counts on every filter — do not remove it."
    - "Items must be real <button> elements (or role=\"option\" rows) so Enter / Space / click all work uniformly."
    - "Disabled items use aria-disabled=\"true\" AND pointer-events: none (the CSS handles the latter)."
    - "The shortcut hint inside .ren-command-kbd is decorative; do not rely on it as the only affordance — Escape and click-outside must both close."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/patterns/ren-command/ren-command.css">
<script type="module" src="rends/components/patterns/ren-command/ren-command.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-command">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-command`
- `.ren-command-empty`
- `.ren-command-footer`
- `.ren-command-footer-hint`
- `.ren-command-group`
- `.ren-command-group-heading`
- `.ren-command-input`
- `.ren-command-input-wrapper`
- `.ren-command-item`
- `.ren-command-item-content`
- `.ren-command-item-description`
- `.ren-command-item-icon`
- `.ren-command-item-shortcut`
- `.ren-command-item-title`
- `.ren-command-kbd`
- `.ren-command-list`
- `.ren-command-separator`

## States And Attributes

- `[aria-disabled]`
- `[aria-live]`
- `[data-empty]`
- `[data-highlighted]`
- `:active`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-command-bg`
- `--ren-command-border`
- `--ren-command-item-height`
- `--ren-command-item-radius`
- `--ren-command-max-height`
- `--ren-command-radius`
- `--ren-command-shadow`
- `--ren-command-width`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/patterns/ren-command/ren-command.css`
- `components/patterns/ren-command/ren-command.js`
- `docs/components/ren-command.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


.ren-command {
  position: fixed;
  top: 50%;
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);
  max-width: 32rem;
  width: 100%;
  max-height: 24rem;
  background-color: var(--ren-surface);
  border: 1px solid var(--ren-border);
  border-radius: var(--ren-radius-xl, 0.75rem);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: var(--ren-z-modal, 1000);
  margin: auto;
  animation: commandIn var(--duration-enter) var(--ease-enter);

  @starting-style {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.98);
  }

  @keyframes commandIn {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  @media (max-width: 32rem) {
    width: calc(100% - 2rem);
    max-height: 18rem;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  &::backdrop {
    background-color: rgb(0 0 0 / 0.5);
    backdrop-filter: blur(4px);
    animation: backdropIn var(--duration-overlay) var(--ease-enter);

    @starting-style {
      background-color: rgb(0 0 0 / 0);
      backdrop-filter: blur(0);
    }

    @keyframes backdropIn {
      from {
        background-color: rgb(0 0 0 / 0);
        backdrop-filter: blur(0);
      }
      to {
        background-color: rgb(0 0 0 / 0.5);
        backdrop-filter: blur(4px);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }
}

.ren-command-input-wrapper {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--ren-border);
  padding: var(--ren-space-2, 0.5rem) var(--ren-space-3, 0.75rem);
  gap: var(--ren-space-2, 0.5rem);
  flex-shrink: 0;

  & svg {
    width: 18px;
    height: 18px;
    color: var(--ren-text-muted);
    flex-shrink: 0;
  }
}

.ren-command-input {
  flex: 1;
  border: none;
  background-color: transparent;
  font-size: var(--ren-body-size, 0.875rem);
  color: var(--ren-text);
  outline: none;
  padding: 0;
  font-family: inherit;

  &::placeholder {
    color: var(--ren-text-muted);
  }

  &:autofill {
    box-shadow: inset 0 0 0 1000px var(--ren-surface);
    -webkit-text-fill-color: var(--ren-text);
  }
}

.ren-command-kbd {
  margin-inline-start: auto;
  display: flex;
  gap: var(--ren-space-1, 0.25rem);
  align-items: center;
  font-size: var(--ren-caption-size, 0.75rem);
  color: var(--ren-text-muted);
  font-family: var(--ren-font-mono, 'Monaco', 'Menlo', monospace);
  white-space: nowrap;

  & kbd {
    padding: 0.125rem 0.375rem;
    background-color: var(--ren-fill);
    border: 1px solid var(--ren-border);
    border-radius: 0.25rem;
    font-size: inherit;
  }

  @media (max-width: 32rem) {
    display: none;
  }
}

.ren-command-list {
  overflow-y: auto;
  max-height: 18rem;
  padding: var(--ren-space-1, 0.25rem);
  flex: 1;
  scrollbar-width: thin;
  scrollbar-color: var(--ren-border) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--ren-border);
    border-radius: 3px;

    &:hover {
      background-color: var(--ren-text-muted);
    }
  }
}

.ren-command-group {
  margin-bottom: var(--ren-space-2, 0.5rem);
  overflow: hidden;

  &[data-empty] {
    display: none;
  }
}

.ren-command-group-heading {
  padding: var(--ren-space-1, 0.25rem) var(--ren-space-3, 0.75rem);
  font-size: var(--ren-caption-size, 0.75rem);
  font-weight: 600;
  color: var(--ren-text-faint);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  user-select: none;
}

.ren-command-item {
  display: flex;
  align-items: center;
  gap: var(--ren-space-3, 0.75rem);
  padding: var(--ren-space-2, 0.5rem) var(--ren-space-3, 0.75rem);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color var(--duration-state) var(--ease-state-change);
  user-select: none;
  background-color: transparent;
  border: none;
  width: 100%;
  text-align: start;
  font-family: inherit;

  &:hover {
    background-color: var(--ren-fill);
  }

  &:active {
    background-color: var(--ren-fill-hover);
  }

  &[data-highlighted] {
    background-color: var(--ren-fill);
  }

  &[aria-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  &:focus-visible {
    outline: none;
    background-color: var(--ren-fill);
  }
}

.ren-command-item-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ren-text-muted);

  & svg {
    width: 100%;
    height: 100%;
  }
}

.ren-command-item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.ren-command-item-title {
  font-size: var(--ren-body-size, 0.875rem);
  color: var(--ren-text);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ren-command-item-description {
  font-size: var(--ren-caption-size, 0.75rem);
  color: var(--ren-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ren-command-item-shortcut {
  margin-inline-start: auto;
  display: flex;
  gap: var(--ren-space-1, 0.25rem);
  font-family: var(--ren-font-mono, 'Monaco', 'Menlo', monospace);
  font-size: var(--ren-caption-size, 0.75rem);
  color: var(--ren-text-muted);
  white-space: nowrap;
  flex-shrink: 0;

  @media (max-width: 40rem) {
    display: none;
  }
}

.ren-command-separator {
  height: 1px;
  background-color: var(--ren-separator);
  margin: var(--ren-space-1, 0.25rem) 0;
}

.ren-command-empty {
  padding: var(--ren-space-8, 2rem);
  text-align: center;
  color: var(--ren-text-muted);
  font-size: var(--ren-body-size, 0.875rem);
}

.ren-command-footer {
  border-top: 1px solid var(--ren-border);
  padding: var(--ren-space-2, 0.5rem);
  display: flex;
  gap: var(--ren-space-4, 1rem);
  font-size: var(--ren-caption-size, 0.75rem);
  color: var(--ren-text-muted);
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 32rem) {
    padding: var(--ren-space-1, 0.25rem) var(--ren-space-2, 0.5rem);
    gap: var(--ren-space-2, 0.5rem);
  }
}

.ren-command-footer-hint {
  display: flex;
  gap: var(--ren-space-1, 0.25rem);
  align-items: center;

  & kbd {
    padding: 0.125rem 0.375rem;
    background-color: var(--ren-fill);
    border: 1px solid var(--ren-border);
    border-radius: 0.25rem;
    font-size: inherit;
    font-family: var(--ren-font-mono, 'Monaco', 'Menlo', monospace);
  }
}


/**
 * RenCommand Component - Command Palette / Spotlight search
 * Modern dialog-based command palette with keyboard navigation
 */

const KEYBOARD_CODES = {
  Escape: 'Escape',
  Enter: 'Enter',
  ArrowDown: 'ArrowDown',
  ArrowUp: 'ArrowUp'
};

class RenCommand extends HTMLElement {
  constructor() {
    super();
    this._dialog = null;
    this._input = null;
    this._list = null;
    this._items = [];
    this._groups = [];
    this._highlightedIndex = 0;
    this._shortcuts = new Map();
    this._focusTrap = null;
    this._lastQuery = '';
    this._shortcutKey = 'k';
    this._shortcutMeta = 'ctrl';
    this._listenerController = null;
  }

  connectedCallback() {
    this._initDialog();
    this._initElements();
    this._attachEventListeners();
    this._setupGlobalShortcut();
  }

  disconnectedCallback() {
    this._removeEventListeners();
  }

  _initDialog() {
    this._dialog = this.querySelector('dialog') || this;
    if (this._dialog !== this && this._dialog.tagName !== 'DIALOG') {
      // Fallback: ensure we have a dialog
      this._dialog = this;
    }
  }

  _initElements() {
    this._input = this.querySelector('.ren-command-input');
    this._list = this.querySelector('.ren-command-list');
    this._items = Array.from(this.querySelectorAll('.ren-command-item'));
    this._groups = Array.from(this.querySelectorAll('.ren-command-group'));
  }

  _attachEventListeners() {
    this._listenerController?.abort();
    this._listenerController = new AbortController();
    const { signal } = this._listenerController;

    // Input events
    if (this._input) {
      this._input.addEventListener('input', (e) => this._handleInput(e), { signal });
      this._input.addEventListener('keydown', (e) => this._handleKeydown(e), { signal });
    }

    // Item selection
    this._items.forEach((item, index) => {
      item.addEventListener('click', () => this._selectItem(index), { signal });
      item.addEventListener('mouseenter', () => this._setHighlighted(index), { signal });
      item.addEventListener('focus', () => this._setHighlighted(index), { signal });
    });

    // Dialog close
    if (this._dialog && this._dialog.tagName === 'DIALOG') {
      this._dialog.addEventListener('cancel', () => this._close(), { signal });
    }

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === KEYBOARD_CODES.Escape && this._isOpen()) {
        this._close();
      }
    }, { signal });
  }

  _removeEventListeners() {
    this._listenerController?.abort();
    this._listenerController = null;
  }

  _setupGlobalShortcut() {
    const shortcut = this.getAttribute('data-shortcut') || 'ctrl+k';
    const [meta, key] = shortcut.toLowerCase().split('+');
    this._shortcutKey = key || 'k';
    this._shortcutMeta = meta || 'ctrl';

    document.addEventListener('keydown', (e) => {
      const isMetaKey = this._shortcutMeta === 'ctrl' ? e.ctrlKey : e.metaKey;
      if (isMetaKey && e.key.toLowerCase() === this._shortcutKey) {
        e.preventDefault();
        this._open();
      }
    }, { signal: this._listenerController?.signal });
  }

  _open() {
    if (this._dialog.tagName === 'DIALOG') {
      this._dialog.showModal?.();
    } else {
      this.style.display = 'block';
    }

    if (this._input) {
      this._input.focus();
      this._input.select();
    }

    this._highlightedIndex = 0;
    this._updateUI();
  }

  _close() {
    if (this._dialog.tagName === 'DIALOG') {
      this._dialog.close?.();
    } else {
      this.style.display = 'none';
    }

    this._input?.blur();
  }

  _isOpen() {
    if (this._dialog.tagName === 'DIALOG') {
      return this._dialog.open;
    }
    return this.style.display !== 'none';
  }

  _handleInput(e) {
    const query = e.target.value.toLowerCase().trim();
    this._lastQuery = query;
    this._filterItems(query);
    this._highlightedIndex = 0;
    this._updateUI();
  }

  _handleKeydown(e) {
    switch (e.key) {
      case KEYBOARD_CODES.ArrowDown:
        e.preventDefault();
        this._moveHighlight(1);
        break;
      case KEYBOARD_CODES.ArrowUp:
        e.preventDefault();
        this._moveHighlight(-1);
        break;
      case KEYBOARD_CODES.Enter:
        e.preventDefault();
        const visibleItem = this._getVisibleItems()[this._highlightedIndex];
        if (visibleItem) {
          this._selectItem(this._items.indexOf(visibleItem));
        }
        break;
      case KEYBOARD_CODES.Escape:
        e.preventDefault();
        this._close();
        break;
    }
  }

  _filterItems(query) {
    this._items.forEach(item => {
      if (!query) {
        item.style.display = '';
        return;
      }

      const title = item.querySelector('.ren-command-item-title')?.textContent || '';
      const description = item.querySelector('.ren-command-item-description')?.textContent || '';
      const keywords = item.getAttribute('data-keywords') || '';
      const searchableText = `${title} ${description} ${keywords}`.toLowerCase();

      const matches = query.split(' ').every(term => searchableText.includes(term));
      item.style.display = matches ? '' : 'none';
    });

    this._updateGroupVisibility();
    this._announceResults();
  }

  _updateGroupVisibility() {
    this._groups.forEach(group => {
      const visibleItems = Array.from(group.querySelectorAll('.ren-command-item'))
        .filter(item => item.style.display !== 'none');

      if (visibleItems.length === 0) {
        group.setAttribute('data-empty', '');
      } else {
        group.removeAttribute('data-empty');
      }
    });

    const hasVisibleItems = this._getVisibleItems().length > 0;
    const empty = this.querySelector('.ren-command-empty');
    if (empty) {
      empty.style.display = hasVisibleItems ? 'none' : 'block';
    }
  }

  _getVisibleItems() {
    return this._items.filter(item => item.style.display !== 'none');
  }

  /**
   * Announce number of search results to screen readers
   * @private
   */
  _announceResults() {
    const visibleItems = this._getVisibleItems();
    const resultCount = visibleItems.length;

    // Find or create announcement region
    let announcement = this.querySelector('[role="status"][aria-live="polite"]');
    if (!announcement) {
      announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.className = 'ren-sr-only';
      this.appendChild(announcement);
    }

    if (resultCount === 0) {
      announcement.textContent = 'No results found';
    } else {
      announcement.textContent = `${resultCount} result${resultCount !== 1 ? 's' : ''} available`;
    }
  }

  _moveHighlight(direction) {
    const visibleItems = this._getVisibleItems();
    if (visibleItems.length === 0) return;

    let newIndex = this._highlightedIndex + direction;
    if (newIndex < 0) newIndex = visibleItems.length - 1;
    if (newIndex >= visibleItems.length) newIndex = 0;

    this._highlightedIndex = newIndex;
    this._updateUI({ focus: true });

    const item = visibleItems[newIndex];
    item?.scrollIntoView({ block: 'nearest' });
  }

  _setHighlighted(itemIndex) {
    this._highlightedIndex = this._getVisibleItems().indexOf(this._items[itemIndex]);
    if (this._highlightedIndex === -1) this._highlightedIndex = 0;
    this._updateUI();
  }

  _updateUI({ focus = false } = {}) {
    const visibleItems = this._getVisibleItems();
    visibleItems.forEach((item, index) => {
      if (index === this._highlightedIndex) {
        item.setAttribute('data-highlighted', '');
        if (focus) {
          item.focus();
        }
      } else {
        item.removeAttribute('data-highlighted');
      }
    });
  }

  _selectItem(itemIndex) {
    const item = this._items[itemIndex];
    if (!item || item.style.display === 'none') return;

    const value = item.getAttribute('data-value') || item.textContent;
    const action = item.getAttribute('data-action');

    const event = new CustomEvent('ren-command-select', {
      detail: { item, value, action },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);

    // Call registered action handler
    if (action && this._shortcuts.has(action)) {
      this._shortcuts.get(action)();
    }

    this._resetCommand();
    this._close();
  }

  _resetCommand() {
    if (this._input) {
      this._input.value = '';
      this._lastQuery = '';
    }
    this._filterItems('');
    this._highlightedIndex = 0;
    this._updateUI();
  }

  // Public API
  open() {
    this._open();
  }

  close() {
    this._close();
  }

  registerAction(id, handler) {
    if (typeof handler === 'function') {
      this._shortcuts.set(id, handler);
    }
  }

  unregisterAction(id) {
    this._shortcuts.delete(id);
  }

  setItems(items) {
    if (Array.isArray(items)) {
      this._items = items;
      this._initElements();
      this._updateUI();
    }
  }

  get query() {
    return this._lastQuery;
  }

  get isOpen() {
    return this._isOpen();
  }
}

customElements.define('ren-command', RenCommand);
