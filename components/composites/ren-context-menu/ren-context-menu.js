/* ============================================
   RenDS — Context Menu Controller
   ============================================
   Handles right-click trigger, positioning,
   and keyboard navigation.

   Usage:
     import { initContextMenu } from './ren-context-menu.js';
     initContextMenu('my-ctx-menu');

   Or auto-init all:
     import { initAllContextMenus } from './ren-context-menu.js';
     initAllContextMenus();
   ============================================ */

/**
 * @param {string|HTMLElement} menuOrId - The popover element or its ID
 */
export function initContextMenu(menuOrId) {
  const menu = typeof menuOrId === 'string'
    ? document.getElementById(menuOrId)
    : menuOrId;
  if (!menu) return;

  if (menu.dataset.renContextMenuInitialized === 'true') return;
  menu.dataset.renContextMenuInitialized = 'true';
  const controller = new AbortController();
  menu.__renContextController = controller;
  let returnTrigger = null;

  menu.setAttribute('popover', 'manual');
  menu.setAttribute('role', 'menu');
  menu.classList.add('ren-context-menu');

  // Find all triggers for this menu
  const triggers = [...document.querySelectorAll(`[data-context="${menu.id}"]`)];
  const triggerId = menu.getAttribute('trigger-id');
  const explicitTrigger = triggerId ? document.getElementById(triggerId) : null;
  if (explicitTrigger && !triggers.includes(explicitTrigger)) triggers.push(explicitTrigger);
  const itemSelector = [
    '.ren-menu-item:not(:disabled):not([aria-disabled="true"])',
    '[role="menuitem"]:not(:disabled):not([aria-disabled="true"])',
  ].join(', ');

  const isOpen = () => menu.matches(':popover-open') || menu.classList.contains('ren-open');

  const close = () => {
    if (!isOpen()) return;

    if ('hidePopover' in menu && menu.matches(':popover-open')) {
      try {
        menu.hidePopover();
      } catch {
        // Popover may have already been closed by the browser.
      }
    } else {
      menu.classList.remove('ren-open');
    }

    menu.setAttribute('data-state', 'closed');
    if (returnTrigger && document.contains(returnTrigger)) returnTrigger.focus();
  };

  const show = (x, y, target) => {
    if (isOpen()) {
      close();
    }

    // Position menu at cursor
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    if ('showPopover' in menu) {
      try {
        menu.showPopover();
      } catch {
        // Popover may already be open during rapid repeated contextmenu events.
      }
    } else {
      menu.classList.add('ren-open');
    }

    menu.setAttribute('data-state', 'open');

    // Adjust if overflows viewport
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = `${Math.max(8, x - rect.width)}px`;
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = `${Math.max(8, y - rect.height)}px`;
    }

    // Focus first item
    const firstItem = menu.querySelector(itemSelector);
    firstItem?.focus();

    menu.dispatchEvent(new CustomEvent('ren-context-menu-open', {
      bubbles: true,
      composed: true,
      detail: { x, y, target },
    }));
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      returnTrigger = trigger;
      show(e.clientX, e.clientY, e.target);
    }, { signal: controller.signal });

    trigger.addEventListener('keydown', (e) => {
      if (e.key !== 'ContextMenu' && !(e.key === 'F10' && e.shiftKey)) return;

      e.preventDefault();
      const rect = trigger.getBoundingClientRect();
      returnTrigger = trigger;
      show(rect.left + 8, rect.bottom + 8, e.target);
    }, { signal: controller.signal });
  });

  // Keyboard navigation inside menu
  menu.addEventListener('keydown', (e) => {
    const items = [...menu.querySelectorAll(itemSelector)];
    if (items.length === 0) return;

    const current = items.indexOf(document.activeElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(current + 1) % items.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(current - 1 + items.length) % items.length]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      items.at(-1)?.focus();
    } else if (e.key === 'Escape') {
      close();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      document.activeElement?.click();
      close();
    }
  }, { signal: controller.signal });

  // Close on item click
  menu.addEventListener('click', (e) => {
    if (e.target.closest('.ren-menu-item')) {
      close();
    }
  }, { signal: controller.signal });

  const isMenuOrTrigger = (target) =>
    target instanceof Node &&
    (menu.contains(target) || triggers.some((trigger) => trigger.contains(target)));

  document.addEventListener(
    'pointerdown',
    (e) => {
      if (isOpen() && !isMenuOrTrigger(e.target)) {
        close();
      }
    },
    { capture: true, signal: controller.signal }
  );

  document.addEventListener(
    'contextmenu',
    (e) => {
      if (isOpen() && !isMenuOrTrigger(e.target)) {
        close();
      }
    },
    { capture: true, signal: controller.signal }
  );
}

export function destroyContextMenu(menuOrId) {
  const menu = typeof menuOrId === 'string'
    ? document.getElementById(menuOrId)
    : menuOrId;
  if (!menu) return;
  menu.__renContextController?.abort();
  delete menu.__renContextController;
  delete menu.dataset.renContextMenuInitialized;
}

/**
 * Auto-init all context menus.
 */
export function initAllContextMenus() {
  const menuIds = new Set();
  document.querySelectorAll('[data-context]').forEach((el) => {
    menuIds.add(el.dataset.context);
  });
  menuIds.forEach(initContextMenu);
}

/**
 * Registry-friendly custom element facade over the same controller used by
 * initContextMenu(). There is one behavior owner and one reconnect-safe
 * AbortController regardless of which public entry point consumers use.
 */
export class RenContextMenu extends HTMLElement {
  connectedCallback() {
    if (!this.id) this.id = `ren-context-menu-${Math.random().toString(36).slice(2, 11)}`;
    initContextMenu(this);
  }

  disconnectedCallback() {
    destroyContextMenu(this);
  }
}

if (!customElements.get('ren-context-menu')) {
  customElements.define('ren-context-menu', RenContextMenu);
}
