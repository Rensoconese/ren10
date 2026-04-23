/**
 * RenDS — Data Table Organism
 * ============================
 *
 * A comprehensive, accessible data table web component that extends native
 * HTML tables with powerful features while maintaining semantic structure.
 *
 * Features:
 * - Click-to-sort columns with asc/desc/none cycling
 * - Multi-select with select-all checkbox and shift+click range selection
 * - Client-side pagination with configurable page size
 * - Keyboard navigation (arrow keys, Enter to sort, Space to select)
 * - Client-side filtering/search
 * - Column resizing via drag handle
 * - Pinned/sticky column support
 * - Multiple density variants (compact, comfortable, default)
 * - Loading state with shimmer effect
 * - Empty state messaging
 * - Full ARIA support for accessibility
 * - Light DOM (no Shadow DOM) for easy styling and integration
 *
 * @example
 * <ren-table data-page-size="10">
 *   <div class="ren-table-wrapper">
 *     <table class="ren-table">
 *       <thead class="ren-table-header">
 *         <tr>
 *           <th class="ren-th ren-table-select"><input type="checkbox"></th>
 *           <th class="ren-th ren-th-sortable" data-column="name">Name</th>
 *         </tr>
 *       </thead>
 *       <tbody class="ren-table-body">
 *         <tr class="ren-tr" data-row-id="1">
 *           <td class="ren-td ren-table-select"><input type="checkbox"></td>
 *           <td class="ren-td">John Doe</td>
 *         </tr>
 *       </tbody>
 *     </table>
 *   </div>
 *   <div class="ren-table-pagination"></div>
 * </ren-table>
 *
 * @fires ren-sort - Dispatched when column sort changes: { column, direction }
 * @fires ren-select - Dispatched when row selection changes: { selected }
 * @fires ren-page - Dispatched when page changes: { page, pageSize }
 * @fires ren-filter - Dispatched when filter changes: { columnIndex, value }
 */

export class RenTable extends HTMLElement {
  #table = null;
  #thead = null;
  #tbody = null;
  #headerCheckbox = null;
  #rowCheckboxes = [];
  #headerCells = [];
  #rows = [];
  #visibleRows = [];
  #sortColumn = null;
  #sortDirection = null;
  #selectedRows = new Set();
  #currentPage = 1;
  #pageSize = 10;
  #filterValues = new Map();
  #columnWidths = new Map();
  #resizingColumn = null;
  #resizeStartX = 0;
  #resizeStartWidth = 0;
  #lastSelectedRowIndex = -1;

  constructor() {
    super();
  }

  connectedCallback() {
    this._initializeComponent();
    this._attachEventListeners();
    this._setupPagination();
  }

  disconnectedCallback() {
    this._removeEventListeners();
  }

  /**
   * Initialize table references and attributes
   * @private
   */
  _initializeComponent() {
    const wrapper = this.querySelector('.ren-table-wrapper');
    this.#table = this.querySelector('.ren-table');
    this.#thead = this.querySelector('.ren-table-header');
    this.#tbody = this.querySelector('.ren-table-body');

    if (!this.#table || !this.#thead || !this.#tbody) {
      console.warn('RenTable: Missing required table structure');
      return;
    }

    // Get page size from attribute
    const pageSize = this.getAttribute('data-page-size');
    if (pageSize) {
      this.#pageSize = parseInt(pageSize, 10);
    }

    // Initialize header cells
    this.#headerCells = Array.from(this.#thead.querySelectorAll('.ren-th'));
    this.#headerCheckbox = this.#thead.querySelector('input[type="checkbox"]');

    // Initialize rows
    this._refreshRows();

    // Add ARIA roles
    this.#table.setAttribute('role', 'table');
    if (!this.#thead.hasAttribute('role')) {
      this.#thead.setAttribute('role', 'rowgroup');
    }
    if (!this.#tbody.hasAttribute('role')) {
      this.#tbody.setAttribute('role', 'rowgroup');
    }
  }

  /**
   * Attach all event listeners
   * @private
   */
  _attachEventListeners() {
    // Sorting
    this.#headerCells.forEach((cell, index) => {
      if (cell.classList.contains('ren-th-sortable')) {
        cell.addEventListener('click', () => this._handleSort(cell, index));
        cell.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this._handleSort(cell, index);
          }
        });
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('role', 'columnheader');
        cell.setAttribute('aria-sort', 'none');
      }
    });

    // Selection - header checkbox
    if (this.#headerCheckbox) {
      this.#headerCheckbox.addEventListener('change', () => this._handleSelectAll());
    }

    // Selection - row checkboxes
    this._attachRowCheckboxListeners();

    // Keyboard navigation
    this.#table.addEventListener('keydown', (e) => this._handleKeyboard(e));

    // Column resizing
    this._setupColumnResize();

    // Search input
    const searchInput = this.querySelector('[data-table-search]');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this._filterRows(e.target.value);
      });
    }

    // Pagination button clicks
    const paginationCtrls = this.querySelector('.ren-table-pagination-controls');
    if (paginationCtrls) {
      const prevBtn = paginationCtrls.querySelector('[data-page-prev]');
      const nextBtn = paginationCtrls.querySelector('[data-page-next]');

      if (prevBtn) prevBtn.addEventListener('click', () => this._previousPage());
      if (nextBtn) nextBtn.addEventListener('click', () => this._nextPage());
    }

    // Pagination page size selector
    const pageSizeSelect = this.querySelector('[data-page-size-select]');
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', (e) => {
        this.#pageSize = parseInt(e.target.value, 10);
        this.#currentPage = 1;
        this._renderTable();
      });
    }
  }

  /**
   * Remove event listeners
   * @private
   */
  _removeEventListeners() {
    // Cleanup event listeners if needed
    // Browser will automatically clean up listeners when element is removed
  }

  /**
   * Refresh the list of all rows
   * @private
   */
  _refreshRows() {
    this.#rows = Array.from(this.#tbody.querySelectorAll('.ren-tr'));
    this.#visibleRows = [...this.#rows];
    this._attachRowCheckboxListeners();
  }

  /**
   * Attach listeners to row checkboxes
   * @private
   */
  _attachRowCheckboxListeners() {
    const checkboxes = Array.from(this.#tbody.querySelectorAll('.ren-table-select input[type="checkbox"]'));
    checkboxes.forEach((checkbox, index) => {
      checkbox.addEventListener('change', (e) => {
        this._handleRowSelect(e, index);
      });
    });
    this.#rowCheckboxes = checkboxes;
  }

  /**
   * Handle column header click for sorting
   * @private
   */
  _handleSort(cell, index) {
    const columnName = cell.getAttribute('data-column');
    if (!columnName) return;

    // Cycle through sort states: none -> asc -> desc -> none
    let newDirection = null;
    if (this.#sortColumn !== columnName) {
      newDirection = 'asc';
    } else if (this.#sortDirection === 'asc') {
      newDirection = 'desc';
    } else if (this.#sortDirection === 'desc') {
      newDirection = null;
    } else {
      newDirection = 'asc';
    }

    this.#sortColumn = newDirection ? columnName : null;
    this.#sortDirection = newDirection;

    // Update visual indicators
    this.#headerCells.forEach((hc) => {
      if (hc.classList.contains('ren-th-sortable')) {
        hc.removeAttribute('data-sort');
        hc.setAttribute('aria-sort', 'none');
      }
    });

    if (newDirection) {
      cell.setAttribute('data-sort', newDirection);
      cell.setAttribute('aria-sort', newDirection === 'asc' ? 'ascending' : 'descending');
    }

    // Dispatch event
    this._dispatchEvent('ren-sort', {
      column: columnName,
      direction: newDirection,
    });

    // Re-render
    this.#currentPage = 1;
    this._renderTable();
  }

  /**
   * Handle select all checkbox
   * @private
   */
  _handleSelectAll() {
    const isChecked = this.#headerCheckbox.checked;

    this.#visibleRows.forEach((row) => {
      const rowId = row.getAttribute('data-row-id');
      const checkbox = row.querySelector('input[type="checkbox"]');

      if (isChecked) {
        this.#selectedRows.add(rowId);
        row.setAttribute('aria-selected', 'true');
        if (checkbox) checkbox.checked = true;
      } else {
        this.#selectedRows.delete(rowId);
        row.removeAttribute('aria-selected');
        if (checkbox) checkbox.checked = false;
      }
    });

    this._dispatchEvent('ren-select', {
      selected: Array.from(this.#selectedRows),
    });
  }

  /**
   * Handle individual row selection
   * @private
   */
  _handleRowSelect(event, rowIndex) {
    const row = this.#visibleRows[rowIndex];
    if (!row) return;

    const rowId = row.getAttribute('data-row-id');
    const isChecked = event.target.checked;
    const isShiftClick = event.shiftKey;

    if (isShiftClick && this.#lastSelectedRowIndex !== -1) {
      // Range selection
      const start = Math.min(this.#lastSelectedRowIndex, rowIndex);
      const end = Math.max(this.#lastSelectedRowIndex, rowIndex);

      for (let i = start; i <= end; i++) {
        const rangeRow = this.#visibleRows[i];
        const rangeRowId = rangeRow.getAttribute('data-row-id');
        const rangeCheckbox = rangeRow.querySelector('input[type="checkbox"]');

        if (isChecked) {
          this.#selectedRows.add(rangeRowId);
          rangeRow.setAttribute('aria-selected', 'true');
          if (rangeCheckbox) rangeCheckbox.checked = true;
        } else {
          this.#selectedRows.delete(rangeRowId);
          rangeRow.removeAttribute('aria-selected');
          if (rangeCheckbox) rangeCheckbox.checked = false;
        }
      }
    } else {
      // Single selection
      if (isChecked) {
        this.#selectedRows.add(rowId);
        row.setAttribute('aria-selected', 'true');
      } else {
        this.#selectedRows.delete(rowId);
        row.removeAttribute('aria-selected');
      }
    }

    this.#lastSelectedRowIndex = rowIndex;

    // Update select-all checkbox state
    this._updateSelectAllCheckbox();

    // Dispatch event
    this._dispatchEvent('ren-select', {
      selected: Array.from(this.#selectedRows),
    });
  }

  /**
   * Update select-all checkbox based on row selections
   * @private
   */
  _updateSelectAllCheckbox() {
    if (!this.#headerCheckbox) return;

    const visibleRowIds = this.#visibleRows
      .map((row) => row.getAttribute('data-row-id'))
      .filter(Boolean);
    const allVisibleSelected = visibleRowIds.every((id) =>
      this.#selectedRows.has(id)
    );
    const someSelected = visibleRowIds.some((id) =>
      this.#selectedRows.has(id)
    );

    this.#headerCheckbox.checked = allVisibleSelected;
    this.#headerCheckbox.indeterminate = someSelected && !allVisibleSelected;
  }

  /**
   * Handle keyboard navigation
   * @private
   */
  _handleKeyboard(event) {
    const { key, target } = event;

    // Space to toggle row selection
    if (key === ' ' && target.classList.contains('ren-tr')) {
      event.preventDefault();
      const checkbox = target.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    // Arrow keys for navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      event.preventDefault();
      this._navigateCells(target, key);
    }

    // Enter to sort (on header)
    if (key === 'Enter' && target.classList.contains('ren-th-sortable')) {
      event.preventDefault();
      target.click();
    }
  }

  /**
   * Navigate between cells with arrow keys
   * @private
   */
  _navigateCells(currentCell, direction) {
    let nextCell = currentCell;

    if (direction === 'ArrowUp') {
      const row = currentCell.closest('tr');
      const prevRow = row?.previousElementSibling;
      if (prevRow) {
        const cellIndex = Array.from(row.cells).indexOf(currentCell);
        nextCell = prevRow.cells[cellIndex];
      }
    } else if (direction === 'ArrowDown') {
      const row = currentCell.closest('tr');
      const nextRow = row?.nextElementSibling;
      if (nextRow) {
        const cellIndex = Array.from(row.cells).indexOf(currentCell);
        nextCell = nextRow.cells[cellIndex];
      }
    } else if (direction === 'ArrowLeft') {
      nextCell = currentCell.previousElementSibling || currentCell;
    } else if (direction === 'ArrowRight') {
      nextCell = currentCell.nextElementSibling || currentCell;
    }

    if (nextCell && nextCell !== currentCell) {
      nextCell.focus();
    }
  }

  /**
   * Setup column resizing
   * @private
   */
  _setupColumnResize() {
    this.#headerCells.forEach((cell) => {
      let resizeHandle = cell.querySelector('.ren-th-resize');

      if (!resizeHandle) {
        resizeHandle = document.createElement('div');
        resizeHandle.className = 'ren-th-resize';
        cell.appendChild(resizeHandle);
      }

      resizeHandle.addEventListener('mousedown', (e) => {
        this._startResize(e, cell);
      });
    });

    document.addEventListener('mousemove', (e) => this._handleResize(e));
    document.addEventListener('mouseup', () => this._endResize());
  }

  /**
   * Start column resize
   * @private
   */
  _startResize(event, cell) {
    this.#resizingColumn = cell;
    this.#resizeStartX = event.clientX;
    this.#resizeStartWidth = cell.offsetWidth;
    cell.style.cursor = 'col-resize';
  }

  /**
   * Handle column resize drag
   * @private
   */
  _handleResize(event) {
    if (!this.#resizingColumn) return;

    const delta = event.clientX - this.#resizeStartX;
    const newWidth = Math.max(80, this.#resizeStartWidth + delta);
    this.#resizingColumn.style.width = `${newWidth}px`;
  }

  /**
   * End column resize
   * @private
   */
  _endResize() {
    if (this.#resizingColumn) {
      this.#resizingColumn.style.cursor = '';
      this.#resizingColumn = null;
    }
  }

  /**
   * Filter rows by search value
   * @private
   */
  _filterRows(searchValue) {
    const lowerSearch = searchValue.toLowerCase();

    this.#visibleRows = this.#rows.filter((row) => {
      const cells = Array.from(row.querySelectorAll('.ren-td'));
      return cells.some((cell) =>
        cell.textContent.toLowerCase().includes(lowerSearch)
      );
    });

    this.#currentPage = 1;
    this._renderTable();

    this._dispatchEvent('ren-filter', {
      value: searchValue,
    });
  }

  /**
   * Sort visible rows
   * @private
   */
  _sortVisibleRows() {
    if (!this.#sortColumn || !this.#sortDirection) return;

    const columnIndex = this.#headerCells.findIndex(
      (cell) => cell.getAttribute('data-column') === this.#sortColumn
    );

    if (columnIndex === -1) return;

    this.#visibleRows.sort((a, b) => {
      const aValue = a.cells[columnIndex]?.textContent || '';
      const bValue = b.cells[columnIndex]?.textContent || '';

      // Try numeric comparison first
      const aNum = parseFloat(aValue);
      const bNum = parseFloat(bValue);

      let comparison = 0;
      if (!isNaN(aNum) && !isNaN(bNum)) {
        comparison = aNum - bNum;
      } else {
        comparison = aValue.localeCompare(bValue);
      }

      return this.#sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Setup pagination controls
   * @private
   */
  _setupPagination() {
    const paginationDiv = this.querySelector('.ren-table-pagination');
    if (!paginationDiv) return;

    // Only render pagination if there are rows
    if (this.#visibleRows.length === 0) {
      paginationDiv.innerHTML = '';
      return;
    }

    const totalPages = Math.ceil(this.#visibleRows.length / this.#pageSize);
    if (totalPages <= 1) {
      paginationDiv.innerHTML = '';
      return;
    }

    const startItem = (this.#currentPage - 1) * this.#pageSize + 1;
    const endItem = Math.min(this.#currentPage * this.#pageSize, this.#visibleRows.length);

    paginationDiv.innerHTML = `
      <div class="ren-table-pagination-info">
        <span>Showing <strong>${startItem}</strong> to <strong>${endItem}</strong> of <strong>${this.#visibleRows.length}</strong></span>
      </div>
      <div class="ren-table-pagination-controls">
        <button class="ren-table-pagination-button" data-page-prev aria-label="Previous page" ${this.#currentPage === 1 ? 'disabled' : ''}>
          ← Prev
        </button>
        <span style="padding: 0 var(--space-2); font-size: var(--caption-size); color: var(--color-text-muted);">
          Page ${this.#currentPage} of ${totalPages}
        </span>
        <button class="ren-table-pagination-button" data-page-next aria-label="Next page" ${this.#currentPage === totalPages ? 'disabled' : ''}>
          Next →
        </button>
      </div>
    `;

    // Reattach listeners
    const prevBtn = paginationDiv.querySelector('[data-page-prev]');
    const nextBtn = paginationDiv.querySelector('[data-page-next]');

    if (prevBtn) prevBtn.addEventListener('click', () => this._previousPage());
    if (nextBtn) nextBtn.addEventListener('click', () => this._nextPage());
  }

  /**
   * Go to previous page
   * @private
   */
  _previousPage() {
    if (this.#currentPage > 1) {
      this.#currentPage--;
      this._renderTable();
    }
  }

  /**
   * Go to next page
   * @private
   */
  _nextPage() {
    const totalPages = Math.ceil(this.#visibleRows.length / this.#pageSize);
    if (this.#currentPage < totalPages) {
      this.#currentPage++;
      this._renderTable();
    }
  }

  /**
   * Render the table with current page, sort, and filter
   * @private
   */
  _renderTable() {
    // Apply sorting
    this._sortVisibleRows();

    // Show/hide rows based on current page
    const startIndex = (this.#currentPage - 1) * this.#pageSize;
    const endIndex = startIndex + this.#pageSize;

    this.#rows.forEach((row, index) => {
      const isVisible = this.#visibleRows.includes(row) &&
        this.#visibleRows.indexOf(row) >= startIndex &&
        this.#visibleRows.indexOf(row) < endIndex;

      if (isVisible) {
        row.style.display = '';
        row.setAttribute('role', 'row');
      } else {
        row.style.display = 'none';
      }
    });

    // Update pagination
    this._setupPagination();

    // Show/hide empty state
    this._updateEmptyState();
  }

  /**
   * Update empty state display
   * @private
   */
  _updateEmptyState() {
    let emptyState = this.querySelector('.ren-table-empty');

    if (this.#visibleRows.length === 0) {
      if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.className = 'ren-table-empty';
        emptyState.innerHTML = `
          <div class="ren-table-empty-icon">📭</div>
          <div class="ren-table-empty-title">No results</div>
          <div class="ren-table-empty-description">No data matches your search or filters</div>
        `;
        const wrapper = this.querySelector('.ren-table-wrapper');
        if (wrapper) {
          wrapper.parentNode.insertBefore(emptyState, wrapper);
        }
      }
      if (this.#tbody) {
        this.#tbody.style.display = 'none';
      }
    } else {
      if (emptyState) {
        emptyState.remove();
      }
      if (this.#tbody) {
        this.#tbody.style.display = '';
      }
    }
  }

  /**
   * Dispatch custom event
   * @private
   */
  _dispatchEvent(eventName, detail) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Public API: Filter rows by column
   * @param {number} columnIndex - Index of column to filter
   * @param {string} value - Filter value
   */
  filter(columnIndex, value) {
    this.#filterValues.set(columnIndex, value);

    this.#visibleRows = this.#rows.filter((row) => {
      for (const [colIdx, filterVal] of this.#filterValues) {
        const cell = row.cells[colIdx];
        if (!cell || !cell.textContent.toLowerCase().includes(filterVal.toLowerCase())) {
          return false;
        }
      }
      return true;
    });

    this.#currentPage = 1;
    this._renderTable();
  }

  /**
   * Public API: Get selected row IDs
   * @returns {string[]} Array of selected row IDs
   */
  getSelectedRows() {
    return Array.from(this.#selectedRows);
  }

  /**
   * Public API: Set loading state
   * @param {boolean} isLoading - Whether table is loading
   */
  setLoading(isLoading) {
    if (isLoading) {
      this.setAttribute('data-loading', '');
      const wrapper = this.querySelector('.ren-table-wrapper');
      if (wrapper && !wrapper.querySelector('.ren-table-loading-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'ren-table-loading-overlay';
        wrapper.appendChild(overlay);
      }
    } else {
      this.removeAttribute('data-loading');
      const overlay = this.querySelector('.ren-table-loading-overlay');
      if (overlay) overlay.remove();
    }
  }

  /**
   * Public API: Set density variant
   * @param {'default' | 'compact' | 'comfortable'} density - Density variant
   */
  setDensity(density) {
    this.#table.classList.remove('ren-table-compact', 'ren-table-comfortable');
    if (density === 'compact' || density === 'comfortable') {
      this.#table.classList.add(`ren-table-${density}`);
    }
  }

  /**
   * Public API: Clear all selections
   */
  clearSelection() {
    this.#selectedRows.clear();
    this.#rowCheckboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
    if (this.#headerCheckbox) {
      this.#headerCheckbox.checked = false;
      this.#headerCheckbox.indeterminate = false;
    }
    this.#rows.forEach((row) => {
      row.removeAttribute('aria-selected');
    });
    this._dispatchEvent('ren-select', { selected: [] });
  }

  /**
   * Public API: Refresh table data
   */
  refresh() {
    this._refreshRows();
    this.#currentPage = 1;
    this._renderTable();
  }
}

customElements.define('ren-table', RenTable);
