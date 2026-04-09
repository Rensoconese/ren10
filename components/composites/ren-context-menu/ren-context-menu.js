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
 * @param {string} menuId - The popover element ID
 */
export function initContextMenu(menuId) {
  const menu = document.getElementById(menuId);
  if (!menu) return;

  // Find all triggers for this menu
  const triggers = document.querySelectorAll(`[data-context="${menuId}"]`);

  const show = (x, y) => {
    // Position menu at cursor
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    menu.showPopover();

    // Adjust if overflows viewport
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = `${x - rect.width}px`;
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = `${y - rect.height}px`;
    }

    // Focus first item
    const firstItem = menu.querySelector('.ren-menu-item:not(:disabled)');
    firstItem?.focus();
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      show(e.clientX, e.clientY);
    });
  });

  // Keyboard navigation inside menu
  menu.addEventListener('keydown', (e) => {
    const items = [...menu.querySelectorAll('.ren-menu-item:not(:disabled)')];
    const current = items.indexOf(document.activeElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(current + 1) % items.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(current - 1 + items.length) % items.length]?.focus();
    } else if (e.key === 'Escape') {
      menu.hidePopover();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      document.activeElement?.click();
      menu.hidePopover();
    }
  });

  // Close on item click
  menu.addEventListener('click', (e) => {
    if (e.target.closest('.ren-menu-item')) {
      menu.hidePopover();
    }
  });
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
