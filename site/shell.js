/**
 * RenDS Shell — Shared interactive UI for doc pages
 * Responsibilities:
 *   1. Hamburger drawer toggle (mobile ≤900px)
 *   2. Component/guide filter input in sidebar
 *   3. Cmd+K command palette with fuzzy search
 *   4. Keyboard controls (ESC to close/clear)
 *   5. Auto-close drawer when link is clicked
 *
 * This script is self-attaching: it queries for `.dx-nav`, `.dx-sidebar`,
 * and auto-creates the hamburger + filter input + command palette. Idempotent.
 */

(function() {
  // Guard: prevent double-initialization
  if (window.__rends_shell_initialized__) return;
  window.__rends_shell_initialized__ = true;

  // Command palette dataset: all doc pages organized by category
  const PALETTE_ITEMS = [
    // Guides
    { category: 'Guides', label: 'Getting Started', href: 'docs/getting-started.html' },
    { category: 'Guides', label: 'Theming', href: 'docs/theming.html' },
    { category: 'Guides', label: 'Accessibility', href: 'docs/accessibility.html' },
    { category: 'Guides', label: 'CLI', href: 'docs/cli.html' },
    // Foundations
    { category: 'Foundations', label: 'Primitive Zero', href: 'docs/primitive-zero.html' },
    { category: 'Foundations', label: 'Tokens', href: 'docs/tokens.html' },
    { category: 'Foundations', label: 'Layouts', href: 'docs/layouts.html' },
    // Primitives
    { category: 'Primitives', label: 'Button', href: 'docs/components/ren-button.html' },
    { category: 'Primitives', label: 'Card', href: 'docs/components/ren-card.html' },
    { category: 'Primitives', label: 'Badge', href: 'docs/components/ren-badge.html' },
    { category: 'Primitives', label: 'Tag', href: 'docs/components/ren-tag.html' },
    { category: 'Primitives', label: 'Link', href: 'docs/components/ren-link.html' },
    { category: 'Primitives', label: 'Banner', href: 'docs/components/ren-banner.html' },
    { category: 'Primitives', label: 'Breadcrumb', href: 'docs/components/ren-breadcrumb.html' },
    { category: 'Primitives', label: 'Pagination', href: 'docs/components/ren-pagination.html' },
    { category: 'Primitives', label: 'Separator', href: 'docs/components/ren-separator.html' },
    { category: 'Primitives', label: 'Avatar', href: 'docs/components/ren-avatar.html' },
    { category: 'Primitives', label: 'Spinner', href: 'docs/components/ren-spinner.html' },
    { category: 'Primitives', label: 'Skeleton', href: 'docs/components/ren-skeleton.html' },
    { category: 'Primitives', label: 'Keyboard Key', href: 'docs/components/ren-kbd.html' },
    { category: 'Primitives', label: 'Icons', href: 'docs/components/ren-icons.html' },
    { category: 'Primitives', label: 'Form Field', href: 'docs/components/ren-field.html' },
    { category: 'Primitives', label: 'Checkbox', href: 'docs/components/ren-checkbox.html' },
    { category: 'Primitives', label: 'Switch', href: 'docs/components/ren-switch.html' },
    { category: 'Primitives', label: 'Radio', href: 'docs/components/ren-radio.html' },
    { category: 'Primitives', label: 'Progress', href: 'docs/components/ren-progress.html' },
    // Composites
    { category: 'Composites', label: 'Tabs', href: 'docs/components/ren-tabs.html' },
    { category: 'Composites', label: 'Accordion', href: 'docs/components/ren-accordion.html' },
    { category: 'Composites', label: 'Dialog', href: 'docs/components/ren-dialog.html' },
    { category: 'Composites', label: 'Alert Dialog', href: 'docs/components/ren-alert-dialog.html' },
    { category: 'Composites', label: 'Toast', href: 'docs/components/ren-toast.html' },
    { category: 'Composites', label: 'Tooltip', href: 'docs/components/ren-tooltip.html' },
    { category: 'Composites', label: 'Popover', href: 'docs/components/ren-popover.html' },
    { category: 'Composites', label: 'Hover Card', href: 'docs/components/ren-hover-card.html' },
    { category: 'Composites', label: 'Sheet', href: 'docs/components/ren-sheet.html' },
    { category: 'Composites', label: 'Collapsible', href: 'docs/components/ren-collapsible.html' },
    { category: 'Composites', label: 'Toolbar', href: 'docs/components/ren-toolbar.html' },
    { category: 'Composites', label: 'Dropzone', href: 'docs/components/ren-dropzone.html' },
    { category: 'Composites', label: 'Combobox', href: 'docs/components/ren-combobox.html' },
    { category: 'Composites', label: 'Slider', href: 'docs/components/ren-slider.html' },
    { category: 'Composites', label: 'Toggle Group', href: 'docs/components/ren-toggle-group.html' },
    { category: 'Composites', label: 'Scroll Area', href: 'docs/components/ren-scroll-area.html' },
    { category: 'Composites', label: 'Select', href: 'docs/components/ren-select.html' },
    { category: 'Composites', label: 'Menu', href: 'docs/components/ren-menu.html' },
    { category: 'Composites', label: 'Menubar', href: 'docs/components/ren-menubar.html' },
    { category: 'Composites', label: 'Context Menu', href: 'docs/components/ren-context-menu.html' },
    { category: 'Composites', label: 'Command Palette', href: 'docs/components/ren-command.html' },
    { category: 'Composites', label: 'Number Field', href: 'docs/components/ren-number-field.html' },
    { category: 'Composites', label: 'Input OTP', href: 'docs/components/ren-input-otp.html' },
    { category: 'Composites', label: 'Color Picker', href: 'docs/components/ren-color-picker.html' },
    { category: 'Composites', label: 'Calendar', href: 'docs/components/ren-calendar.html' },
    { category: 'Composites', label: 'Date Picker', href: 'docs/components/ren-date-picker.html' },
    { category: 'Composites', label: 'Date Range Picker', href: 'docs/components/ren-date-range-picker.html' },
    { category: 'Composites', label: 'Carousel', href: 'docs/components/ren-carousel.html' },
    // Patterns
    { category: 'Patterns', label: 'Nav', href: 'docs/components/ren-nav.html' },
    { category: 'Patterns', label: 'Sidebar', href: 'docs/components/ren-sidebar.html' },
    { category: 'Patterns', label: 'Empty State', href: 'docs/components/ren-empty-state.html' },
    { category: 'Patterns', label: 'Data Table', href: 'docs/components/ren-data-table.html' },
    { category: 'Patterns', label: 'Form Validation', href: 'docs/components/ren-form-validation.html' },
    { category: 'Patterns', label: 'Multi-Step Form', href: 'docs/components/ren-multi-step-form.html' },
    { category: 'Patterns', label: 'AI Patterns', href: 'docs/components/ren-ai-patterns.html' },
  ];

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

    // Create command palette dialog (before adding keyboard listeners)
    const paletteDialog = createPaletteDialog();
    document.body.appendChild(paletteDialog);

    // Create hamburger button (mobile only, visible ≤900px via CSS)
    const hamburger = createHamburger();
    navInner.insertBefore(hamburger, navInner.firstChild);

    // Create backdrop (for drawer overlay)
    const backdrop = createBackdrop();
    document.body.insertBefore(backdrop, document.body.firstChild);

    // Create filter input at top of sidebar
    const filterInput = createFilterInput();
    sidebar.insertBefore(filterInput, sidebar.firstChild);

    // Create search button in nav actions
    const searchBtn = createSearchButton(paletteDialog);
    const navActions = navInner.querySelector('.dx-nav-actions');
    if (navActions) navActions.insertBefore(searchBtn, navActions.firstChild);

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

    // Cmd+K (Mac) or Ctrl+K (Windows/Linux) opens command palette
    // ESC closes drawer and clears filter / closes palette
    document.addEventListener('keydown', (e) => {
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
      const paletteOpen = paletteDialog.hasAttribute('data-open');

      if ((isMac && e.metaKey && e.key === 'k') || (!isMac && e.ctrlKey && e.key === 'k')) {
        e.preventDefault();
        // Don't trigger if typing in form input (but allow in palette's own input)
        const activeEl = document.activeElement;
        const isInForm = activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.contentEditable === 'true';
        const isPaletteInput = activeEl.hasAttribute('data-palette-input');
        if (isInForm && !isPaletteInput) return;

        // Toggle palette
        if (!paletteOpen) {
          openPalette();
        } else {
          closePalette();
        }
      }

      if (e.key === 'Escape') {
        if (paletteOpen) {
          closePalette();
        } else {
          const filterField = sidebar.querySelector('[data-shell-filter]');
          if (filterField && filterField.value) {
            // Clear the filter
            filterField.value = '';
            filterField.dispatchEvent(new Event('input', { bubbles: true }));
          } else if (sidebar.hasAttribute('data-open')) {
            // Close the drawer
            closeSidebar();
          }
        }
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

    // Wire up live filter
    input.addEventListener('input', (e) => {
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
      let list = section.nextElementSibling;
      if (!list || !list.matches('ul, ol')) return;

      // Get all li items in this list
      const items = list.querySelectorAll('li');
      let hasVisibleItems = false;

      items.forEach(li => {
        const link = li.querySelector('a');
        const text = link ? link.textContent.toLowerCase() : '';
        const matches = query === '' || text.includes(query);
        li.style.display = matches ? '' : 'none';
        if (matches) hasVisibleItems = true;
      });

      // Show/hide the section header based on whether it has visible items
      section.style.display = hasVisibleItems ? '' : 'none';
    });
  }

  function createSearchButton(paletteDialog) {
    const btn = document.createElement('button');
    btn.className = 'dx-search-btn';
    btn.setAttribute('aria-label', 'Search the docs');
    btn.title = 'Search the docs (Cmd+K)';

    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    const shortcutText = isMac ? '⌘K' : 'Ctrl K';

    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <span class="dx-search-btn-label">Search</span>
      <kbd>${shortcutText}</kbd>
    `;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openPalette();
    });

    return btn;
  }

  function createPaletteDialog() {
    const dialog = document.createElement('dialog');
    dialog.className = 'dx-palette';
    dialog.innerHTML = `
      <div class="dx-palette-overlay"></div>
      <div class="dx-palette-content">
        <input
          type="text"
          class="dx-palette-input"
          data-palette-input
          placeholder="Search components, guides, patterns..."
          aria-label="Search the docs"
          aria-controls="dx-palette-results"
        />
        <ul class="dx-palette-results" id="dx-palette-results" role="listbox"></ul>
        <div class="dx-palette-footer">
          <span>↑↓ navigate</span>
          <span>Enter open</span>
          <span>Esc close</span>
        </div>
      </div>
    `;

    const input = dialog.querySelector('.dx-palette-input');
    const resultsList = dialog.querySelector('.dx-palette-results');
    const overlay = dialog.querySelector('.dx-palette-overlay');

    let selectedIndex = 0;
    let filteredItems = [];

    // Close on overlay click
    overlay.addEventListener('click', closePalette);

    // Search and render
    input.addEventListener('input', () => {
      const query = input.value.toLowerCase().trim();
      filteredItems = searchItems(query);
      selectedIndex = 0;
      renderResults();
    });

    // Keyboard navigation
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % (filteredItems.length || 1);
        updateSelection();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1);
        updateSelection();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          navigateTo(filteredItems[selectedIndex]);
        }
      }
    });

    // Mouse interaction
    resultsList.addEventListener('mouseover', (e) => {
      const option = e.target.closest('[role="option"]');
      if (option) {
        selectedIndex = parseInt(option.getAttribute('data-index'), 10);
        updateSelection();
      }
    });

    resultsList.addEventListener('click', (e) => {
      const option = e.target.closest('[role="option"]');
      if (option) {
        const index = parseInt(option.getAttribute('data-index'), 10);
        navigateTo(filteredItems[index]);
      }
    });

    function searchItems(query) {
      if (!query) {
        // Return all items, grouped by category
        return PALETTE_ITEMS;
      }

      const queryParts = query.split(/\s+/);
      const scored = PALETTE_ITEMS.map(item => {
        const label = item.label.toLowerCase();

        // All query parts must appear
        const allMatch = queryParts.every(part => label.includes(part));
        if (!allMatch) return null;

        // Score: exact match > prefix match > substring match
        let score = 0;
        if (label === query) score = 1000;
        else if (label.startsWith(query)) score = 500;
        else {
          // Substring match; bonus for earlier position
          const idx = label.indexOf(queryParts[0]);
          score = 100 - idx;
        }

        return { ...item, score };
      }).filter(Boolean);

      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, 25);
    }

    function renderResults() {
      resultsList.innerHTML = '';

      if (!filteredItems.length) {
        const empty = document.createElement('li');
        empty.className = 'dx-palette-empty';
        empty.textContent = 'No results found';
        resultsList.appendChild(empty);
        return;
      }

      const query = input.value.toLowerCase().trim();
      let currentCategory = null;

      filteredItems.forEach((item, idx) => {
        // Add category header if it changed and query is empty
        if (query === '' && item.category !== currentCategory) {
          currentCategory = item.category;
          const header = document.createElement('li');
          header.className = 'dx-palette-category';
          header.textContent = item.category;
          header.setAttribute('aria-hidden', 'true');
          resultsList.appendChild(header);
        }

        const li = document.createElement('li');
        li.className = 'dx-palette-item';
        li.setAttribute('role', 'option');
        li.setAttribute('data-index', idx);
        li.setAttribute('aria-selected', idx === selectedIndex);

        // Highlight matched query parts
        let label = item.label;
        if (query) {
          const parts = query.split(/\s+/);
          parts.forEach(part => {
            const re = new RegExp(`(${part})`, 'gi');
            label = label.replace(re, '<mark>$1</mark>');
          });
        }

        li.innerHTML = `
          <span class="dx-palette-label">${label}</span>
          <span class="dx-palette-category-badge">${item.category}</span>
        `;

        resultsList.appendChild(li);
      });
    }

    function updateSelection() {
      const options = resultsList.querySelectorAll('[role="option"]');
      options.forEach((opt, idx) => {
        opt.setAttribute('aria-selected', idx === selectedIndex);
      });

      // Update aria-activedescendant on input
      if (options[selectedIndex]) {
        const optId = `dx-palette-option-${selectedIndex}`;
        options[selectedIndex].id = optId;
        input.setAttribute('aria-activedescendant', optId);
      } else {
        input.removeAttribute('aria-activedescendant');
      }

      // Scroll into view
      options[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }

    function navigateTo(item) {
      closePalette();
      const href = resolveHref(item.href);
      window.location.href = href;
    }

    return dialog;
  }

  function resolveHref(href) {
    // Determine current depth and resolve relative path
    const pathname = window.location.pathname;

    // If already at /docs/* level, href is ready
    if (pathname.includes('/docs/')) {
      return href;
    }

    // If at root or other location, prepend docs/
    return href;
  }

  function openPalette() {
    paletteDialog.setAttribute('data-open', '');
    paletteDialog.showModal();
    const input = paletteDialog.querySelector('.dx-palette-input');
    input.focus();
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    focusedBeforePalette = document.activeElement;
  }

  function closePalette() {
    paletteDialog.removeAttribute('data-open');
    paletteDialog.close();
    if (focusedBeforePalette && focusedBeforePalette.focus) {
      focusedBeforePalette.focus();
    }
  }

  let paletteDialog;
  let focusedBeforePalette = null;
})();
