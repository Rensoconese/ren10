/* ============================================
   RenDS — Toolbar Keyboard Navigation
   ============================================
   Implements WAI-ARIA Toolbar pattern:
   - Arrow Left/Right: move between items
   - Home: first item
   - End: last item
   - Tab: exits toolbar

   Usage:
     import { initToolbar } from './ren-toolbar.js';
     initToolbar(document.querySelector('.ren-toolbar'));

   Or auto-init all:
     import { initAllToolbars } from './ren-toolbar.js';
     initAllToolbars();
   ============================================ */

/**
 * @param {HTMLElement} toolbar
 */
export function initToolbar(toolbar) {
  if (!toolbar || toolbar.getAttribute('role') !== 'toolbar') return;

  const getItems = () =>
    [...toolbar.querySelectorAll('.ren-toolbar-item:not(:disabled):not([aria-disabled="true"])')];

  const isVertical = toolbar.classList.contains('ren-toolbar-vertical');
  const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
  const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';

  toolbar.addEventListener('keydown', (e) => {
    const items = getItems();
    const current = items.indexOf(document.activeElement);
    if (current === -1) return;

    let next = -1;

    if (e.key === nextKey) {
      next = (current + 1) % items.length;
    } else if (e.key === prevKey) {
      next = (current - 1 + items.length) % items.length;
    } else if (e.key === 'Home') {
      next = 0;
    } else if (e.key === 'End') {
      next = items.length - 1;
    }

    if (next !== -1) {
      e.preventDefault();
      items.forEach((item) => item.setAttribute('tabindex', '-1'));
      items[next].setAttribute('tabindex', '0');
      items[next].focus();
    }
  });
}

/**
 * Auto-init all toolbars in the document.
 */
export function initAllToolbars() {
  document.querySelectorAll('[role="toolbar"]').forEach(initToolbar);
}
