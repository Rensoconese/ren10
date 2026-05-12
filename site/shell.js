/**
 * RenDS Shell — Shared interactive UI for doc pages
 * Responsibilities:
 *   1. Hamburger drawer toggle (mobile ≤900px)
 *   2. Component/guide filter input in sidebar
 *   3. Keyboard controls (ESC clears filter, then closes drawer)
 *   4. Auto-close drawer when link is clicked
 *
 * This script is self-attaching: it queries for `.dx-nav`, `.dx-sidebar`,
 * and auto-creates the hamburger + filter input. Idempotent.
 */

(function() {
  // Guard: prevent double-initialization
  if (window.__rends_shell_initialized__) return;
  window.__rends_shell_initialized__ = true;

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShell);
  } else {
    initShell();
  }

  function initShell() {
    const nav = document.querySelector('.dx-nav');
    const sidebar = document.querySelector('.dx-sidebar');
    const navInner = nav?.querySelector('.dx-nav-inner');

    // Exit silently if required elements don't exist
    if (!nav || !sidebar || !navInner) return;

    // Create hamburger button (mobile only, visible ≤900px via CSS)
    const hamburger = createHamburger();
    navInner.insertBefore(hamburger, navInner.firstChild);

    // Create backdrop (for drawer overlay)
    const backdrop = createBackdrop();
    document.body.insertBefore(backdrop, document.body.firstChild);

    // Create filter input at top of sidebar
    const filterInput = createFilterInput();
    sidebar.insertBefore(filterInput, sidebar.firstChild);

    // Wire up drawer toggle
    let focusedBeforeOpen = null;
    hamburger.addEventListener('click', () => {
      const isOpen = sidebar.hasAttribute('data-open');
      if (!isOpen) {
        sidebar.setAttribute('data-open', '');
        backdrop.setAttribute('data-open', '');
        hamburger.setAttribute('aria-expanded', 'true');
        focusedBeforeOpen = document.activeElement;
        // Auto-focus the filter input on mobile
        const filterField = sidebar.querySelector('[data-shell-filter]');
        if (filterField) filterField.focus();
      } else {
        closeSidebar();
      }
    });

    // Close drawer on backdrop click
    backdrop.addEventListener('click', closeSidebar);

    // Close drawer when a sidebar link is clicked
    const sidebarLinks = sidebar.querySelectorAll('a');
    sidebarLinks.forEach(link => {
      link.addEventListener('click', closeSidebar);
    });

    // ESC clears the filter first, then closes the drawer if open
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const filterField = sidebar.querySelector('[data-shell-filter]');
      if (filterField && filterField.value) {
        filterField.value = '';
        filterField.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (sidebar.hasAttribute('data-open')) {
        closeSidebar();
      }
    });

    function closeSidebar() {
      sidebar.removeAttribute('data-open');
      backdrop.removeAttribute('data-open');
      hamburger.setAttribute('aria-expanded', 'false');
      if (focusedBeforeOpen && focusedBeforeOpen.focus) {
        focusedBeforeOpen.focus();
      }
    }
  }

  function createHamburger() {
    const btn = document.createElement('button');
    btn.className = 'dx-sidebar-toggle';
    btn.setAttribute('aria-label', 'Toggle navigation menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'sidebar');
    btn.innerHTML = '<span></span><span></span><span></span>';
    return btn;
  }

  function createBackdrop() {
    const backdrop = document.createElement('div');
    backdrop.className = 'dx-sidebar-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    return backdrop;
  }

  function createFilterInput() {
    const container = document.createElement('div');
    container.className = 'dx-sidebar-filter-container';

    const label = document.createElement('label');
    label.htmlFor = 'dx-sidebar-filter';
    label.className = 'dx-sidebar-filter-label';
    label.textContent = 'Filter components';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'dx-sidebar-filter';
    input.className = 'dx-sidebar-filter';
    input.placeholder = 'Search...';
    input.setAttribute('data-shell-filter', '');
    input.setAttribute('aria-label', 'Filter sidebar items');

    container.appendChild(label);
    container.appendChild(input);

    input.addEventListener('input', () => {
      filterSidebar(input.value.toLowerCase());
    });

    return container;
  }

  function filterSidebar(query) {
    const sidebar = document.querySelector('.dx-sidebar');
    if (!sidebar) return;

    // Find all h3 section headers
    const sections = sidebar.querySelectorAll('h3, .dx-sidebar-title');

    sections.forEach(section => {
      // Find the next ul/ol after this section header
      const list = section.nextElementSibling;
      if (!list || !list.matches('ul, ol')) return;

      const items = list.querySelectorAll('li');
      let hasVisibleItems = false;

      items.forEach(li => {
        const link = li.querySelector('a');
        const text = link ? link.textContent.toLowerCase() : '';
        const matches = query === '' || text.includes(query);
        li.style.display = matches ? '' : 'none';
        if (matches) hasVisibleItems = true;
      });

      section.style.display = hasVisibleItems ? '' : 'none';
    });
  }
})();
