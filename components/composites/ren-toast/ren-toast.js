/**
 * RenDS — Toast Notification System
 * ==================================
 * A flexible toast/notification component with animations,
 * positioning, variants, and programmatic API.
 *
 * Usage:
 *   import { toast } from 'rends/components/composites/ren-toast/ren-toast.js';
 *
 *   toast('File saved');
 *   toast({ title: 'Error', description: 'Failed to save', type: 'error' });
 */

import { announceAssertive, announcePolite } from '../../utils/live-region.js';

/* ═══ TOAST VIEWPORT CUSTOM ELEMENT ═══ */

/**
 * Container for all toasts on the page.
 * Manages the toast stack, animations, and timers.
 *
 * @example
 * <ren-toast-viewport position="top-right" max-toasts="5"></ren-toast-viewport>
 */
export class RenToastViewport extends HTMLElement {
  /**
   * Map of toast IDs to their timer IDs
   * @type {Map<string, number>}
   */
  #timers = new Map();

  /**
   * Whether timers are paused (on hover/touch)
   * @type {boolean}
   */
  #timersPaused = false;

  /**
   * Map of paused toast IDs to their remaining time
   * @type {Map<string, number>}
   */
  #pausedTimes = new Map();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // Load stylesheet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('./ren-toast.css', import.meta.url).href;
    this.shadowRoot.appendChild(link);

    // Create slot
    const slot = document.createElement('slot');
    this.shadowRoot.appendChild(slot);

    // Set default attributes
    if (!this.hasAttribute('position')) {
      this.setAttribute('position', 'top-right');
    }
    if (!this.hasAttribute('max-toasts')) {
      this.setAttribute('max-toasts', '5');
    }

    // Set ARIA attributes
    this.setAttribute('role', 'region');
    this.setAttribute('aria-label', 'Notifications');
    this.setAttribute('aria-live', 'polite');

    // Apply position class
    this.#updatePositionClass();

    // Pause timers on hover
    this.addEventListener('mouseenter', () => this.#pauseTimers());
    this.addEventListener('mouseleave', () => this.#resumeTimers());

    // Pause timers on touch
    this.addEventListener('touchstart', () => this.#pauseTimers());
    this.addEventListener('touchend', () => this.#resumeTimers());
  }

  /**
   * Update the CSS class for the current position
   * @private
   */
  #updatePositionClass() {
    const position = this.getAttribute('position') || 'top-right';
    this.classList.remove('ren-toast-viewport');
    this.classList.add('ren-toast-viewport');
    this.setAttribute('data-position', position);
  }

  /**
   * Pause all active timers and record remaining time
   * @private
   */
  #pauseTimers() {
    if (this.#timersPaused) return;
    this.#timersPaused = true;

    for (const [toastId, timerId] of this.#timers.entries()) {
      const toast = this.querySelector(`[data-toast-id="${toastId}"]`);
      if (toast && toast.dataset.duration && toast.dataset.duration !== '0') {
        // Calculate remaining time from progress bar
        const progress = toast.querySelector('.ren-toast-progress');
        if (progress) {
          const startTime = parseFloat(progress.dataset.startTime || Date.now());
          const duration = parseInt(toast.dataset.duration, 10);
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, duration - elapsed);
          this.#pausedTimes.set(toastId, { remaining, startTime });
        }
      }
      clearTimeout(timerId);
      this.#timers.delete(toastId);
    }
  }

  /**
   * Resume all paused timers
   * @private
   */
  #resumeTimers() {
    if (!this.#timersPaused) return;
    this.#timersPaused = false;

    for (const [toastId, { remaining }] of this.#pausedTimes.entries()) {
      if (remaining > 0) {
        const toast = this.querySelector(`[data-toast-id="${toastId}"]`);
        if (toast) {
          const timerId = setTimeout(() => this.#dismissToast(toastId), remaining);
          this.#timers.set(toastId, timerId);
        }
      }
    }
    this.#pausedTimes.clear();
  }

  /**
   * Create a new toast element
   * @param {Object} options
   * @param {string} options.id
   * @param {string} options.title
   * @param {string} options.description
   * @param {string} options.type - success, error, warning, info, loading
   * @param {number} options.duration
   * @param {boolean} options.dismissible
   * @param {Object} options.action
   * @private
   */
  #createToastElement(options) {
    const {
      id,
      title,
      description,
      type = 'info',
      duration = 5000,
      dismissible = true,
      action = null,
    } = options;

    const toast = document.createElement('div');
    toast.className = `ren-toast ren-toast-${type}`;
    toast.setAttribute('data-toast-id', id);
    if (duration > 0) {
      toast.setAttribute('data-duration', duration);
    }

    // Icon
    const icon = document.createElement('div');
    icon.className = 'ren-toast-icon';
    icon.innerHTML = this.#getIconForType(type);
    toast.appendChild(icon);

    // Content
    const content = document.createElement('div');
    content.className = 'ren-toast-content';

    if (title) {
      const titleEl = document.createElement('div');
      titleEl.className = 'ren-toast-title';
      titleEl.textContent = title;
      content.appendChild(titleEl);
    }

    if (description) {
      const desc = document.createElement('div');
      desc.className = 'ren-toast-description';
      desc.textContent = description;
      content.appendChild(desc);
    }

    if (action) {
      const actions = document.createElement('div');
      actions.className = 'ren-toast-actions';

      const actionBtn = document.createElement('button');
      actionBtn.textContent = action.label;
      actionBtn.className = 'ren-toast-action-btn';
      actionBtn.addEventListener('click', () => {
        action.onClick?.();
        this.#dismissToast(id);
      });
      actions.appendChild(actionBtn);

      content.appendChild(actions);
    }

    toast.appendChild(content);

    // Close button
    if (dismissible) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'ren-toast-close';
      closeBtn.setAttribute('aria-label', 'Close notification');
      closeBtn.innerHTML = '✕';
      closeBtn.addEventListener('click', () => this.#dismissToast(id));
      toast.appendChild(closeBtn);
    }

    // Progress bar for auto-dismiss
    if (duration > 0) {
      const progress = document.createElement('div');
      progress.className = 'ren-toast-progress';
      progress.dataset.startTime = Date.now();
      progress.style.width = '100%';
      progress.style.transitionDuration = `${duration}ms`;
      toast.appendChild(progress);

      // Animate progress bar
      requestAnimationFrame(() => {
        progress.style.width = '0%';
      });
    }

    return toast;
  }

  /**
   * Get icon HTML for a toast type
   * @param {string} type
   * @private
   */
  #getIconForType(type) {
    const icons = {
      success: '✓',
      error: '✕',
      danger: '✕',
      warning: '!',
      info: 'ℹ',
      loading: '⟳',
    };
    return icons[type] || icons.info;
  }

  /**
   * Dismiss a toast with animation
   * @param {string} toastId
   * @private
   */
  #dismissToast(toastId) {
    const toast = this.querySelector(`[data-toast-id="${toastId}"]`);
    if (!toast) return;

    // Clear timer
    const timerId = this.#timers.get(toastId);
    if (timerId) {
      clearTimeout(timerId);
      this.#timers.delete(toastId);
    }

    // Start exit animation
    toast.setAttribute('data-closing', '');

    // Wait for animation to finish before removing
    const animationDuration = this.#getAnimationDuration(toast);
    setTimeout(() => {
      toast.remove();
      // Check if we should enforce max toasts
      this.#enforceMaxToasts();
    }, animationDuration);
  }

  /**
   * Get the duration of the toast animation
   * @param {HTMLElement} toast
   * @private
   */
  #getAnimationDuration(toast) {
    const computedStyle = getComputedStyle(toast);
    const animationDuration = computedStyle.animationDuration;
    return parseFloat(animationDuration) * 1000 || 300;
  }

  /**
   * Enforce max toasts limit
   * @private
   */
  #enforceMaxToasts() {
    const maxToasts = parseInt(this.getAttribute('max-toasts'), 10) || 5;
    const toasts = this.querySelectorAll('.ren-toast:not([data-closing])');
    if (toasts.length > maxToasts) {
      const excess = toasts.length - maxToasts;
      for (let i = 0; i < excess; i++) {
        this.#dismissToast(toasts[i].dataset.toastId);
      }
    }
  }

  /**
   * Add a toast to the viewport
   * @param {Object} options
   * @returns {string} Toast ID
   */
  addToast(options) {
    const id = options.id || generateToastId();

    // Remove existing toast with same ID
    const existing = this.querySelector(`[data-toast-id="${id}"]`);
    if (existing) {
      this.#dismissToast(id);
    }

    // Create and add toast
    const toast = this.#createToastElement({ ...options, id });
    this.appendChild(toast);

    // Set up auto-dismiss timer
    if (options.duration && options.duration > 0) {
      if (!this.#timersPaused) {
        const timerId = setTimeout(() => this.#dismissToast(id), options.duration);
        this.#timers.set(id, timerId);
      }
    }

    // Enforce max toasts
    this.#enforceMaxToasts();

    // Announce to screen readers
    const announcement = this.#buildAnnouncement(options);
    if (announcement) {
      const politeness = options.type === 'error' ? 'assertive' : 'polite';
      if (politeness === 'assertive') {
        announceAssertive(announcement);
      } else {
        announcePolite(announcement);
      }
    }

    return id;
  }

  /**
   * Build announcement text for screen readers
   * @param {Object} options
   * @private
   */
  #buildAnnouncement(options) {
    const { title, description, type } = options;
    const parts = [];

    if (title) parts.push(title);
    if (description) parts.push(description);

    if (parts.length === 0) return '';

    let announcement = parts.join('. ');
    if (type === 'error') {
      announcement = `Error: ${announcement}`;
    }
    return announcement;
  }

  /**
   * Update an existing toast
   * @param {string} toastId
   * @param {Object} updates
   */
  updateToast(toastId, updates) {
    const toast = this.querySelector(`[data-toast-id="${toastId}"]`);
    if (!toast) return;

    // Update type if changed
    if (updates.type && updates.type !== toast.dataset.type) {
      toast.className = `ren-toast ren-toast-${updates.type}`;
      toast.setAttribute('data-toast-id', toastId);

      const icon = toast.querySelector('.ren-toast-icon');
      if (icon) {
        icon.innerHTML = this.#getIconForType(updates.type);
      }
    }

    // Update title
    if (updates.title !== undefined) {
      const titleEl = toast.querySelector('.ren-toast-title');
      if (titleEl) {
        titleEl.textContent = updates.title;
      }
    }

    // Update description
    if (updates.description !== undefined) {
      const desc = toast.querySelector('.ren-toast-description');
      if (desc) {
        desc.textContent = updates.description;
      }
    }
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    const toasts = this.querySelectorAll('.ren-toast:not([data-closing])');
    for (const toast of toasts) {
      this.#dismissToast(toast.dataset.toastId);
    }
  }
}

/* ═══ GLOBAL TOAST API ═══ */

let globalViewport = null;

/**
 * Get or create the global toast viewport
 * @private
 */
function getViewport() {
  if (globalViewport && document.body.contains(globalViewport)) {
    return globalViewport;
  }

  globalViewport = document.querySelector('ren-toast-viewport');
  if (!globalViewport) {
    globalViewport = document.createElement('ren-toast-viewport');
    document.body.appendChild(globalViewport);
  }
  return globalViewport;
}

/**
 * Generate a unique toast ID
 * @private
 */
function generateToastId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Get default duration based on type
 * @param {string} type
 * @private
 */
function getDefaultDuration(type) {
  switch (type) {
    case 'success':
    case 'info':
      return 5000;
    case 'error':
    case 'danger':
      return 8000;
    case 'loading':
      return 0; // Persistent until dismissed
    default:
      return 5000;
  }
}

/**
 * Normalize toast options
 * @param {string|Object} input
 * @private
 */
function normalizeOptions(input) {
  if (typeof input === 'string') {
    return {
      title: input,
      type: 'info',
      duration: getDefaultDuration('info'),
      dismissible: true,
    };
  }

  const options = { ...input };
  if (!options.duration) {
    options.duration = getDefaultDuration(options.type || 'info');
  }
  if (options.dismissible === undefined) {
    options.dismissible = true;
  }
  return options;
}

/**
 * Show a toast notification
 *
 * @param {string|Object} input - Message string or options object
 * @param {string} input.title - Toast title
 * @param {string} input.description - Toast description
 * @param {'success'|'error'|'warning'|'info'|'loading'} input.type - Toast type
 * @param {number} input.duration - Auto-dismiss duration (ms), 0 = persistent
 * @param {boolean} input.dismissible - Show close button (default: true)
 * @param {Object} input.action - Action button { label, onClick }
 * @returns {string} Toast ID for later updates/dismissal
 *
 * @example
 * toast('File saved');
 * toast({ title: 'Error', description: 'Failed', type: 'error' });
 * const id = toast('Uploading...');
 * toast.update(id, { title: 'Done!' });
 */
export function toast(input) {
  const viewport = getViewport();
  const options = normalizeOptions(input);
  return viewport.addToast(options);
}

/**
 * Update an existing toast
 *
 * @param {string} toastId - ID returned from toast()
 * @param {Object} updates - Properties to update
 * @param {string} updates.title
 * @param {string} updates.description
 * @param {string} updates.type
 *
 * @example
 * const id = toast('Loading...');
 * setTimeout(() => {
 *   toast.update(id, { title: 'Done!', type: 'success' });
 * }, 2000);
 */
toast.update = function (toastId, updates) {
  const viewport = getViewport();
  viewport.updateToast(toastId, updates);
};

/**
 * Dismiss a specific toast
 *
 * @param {string} toastId - ID returned from toast()
 *
 * @example
 * const id = toast('Loading...');
 * button.addEventListener('click', () => toast.dismiss(id));
 */
toast.dismiss = function (toastId) {
  const viewport = getViewport();
  const toastEl = viewport.querySelector(`[data-toast-id="${toastId}"]`);
  if (toastEl) {
    // Trigger the dismiss through the dismissAll method by filtering
    toastEl.setAttribute('data-closing', '');
    const animationDuration = getComputedStyle(toastEl).animationDuration;
    const duration = parseFloat(animationDuration) * 1000 || 300;
    setTimeout(() => {
      if (toastEl.parentNode) {
        toastEl.remove();
      }
    }, duration);
  }
};

/**
 * Dismiss all toasts
 *
 * @example
 * toast.dismissAll();
 */
toast.dismissAll = function () {
  const viewport = getViewport();
  viewport.dismissAll();
};

/**
 * Show a promise-based toast that updates based on promise state
 *
 * @param {Promise} promise - Promise to track
 * @param {Object} options
 * @param {string|Object} options.loading - Loading state content
 * @param {string|Object} options.success - Success state content
 * @param {string|Object} options.error - Error state content
 * @returns {Promise} Original promise (re-thrown on error)
 *
 * @example
 * toast.promise(fetch('/api/data'), {
 *   loading: 'Loading data...',
 *   success: 'Data loaded!',
 *   error: (err) => `Failed: ${err.message}`
 * });
 */
toast.promise = function (promise, options) {
  const viewport = getViewport();

  // Show loading toast
  const loadingOpts = normalizeOptions(options.loading || 'Loading...');
  loadingOpts.type = 'loading';
  loadingOpts.duration = 0; // Persistent
  const id = viewport.addToast(loadingOpts);

  // Handle promise resolution
  return promise
    .then((data) => {
      const successOpts = normalizeOptions(
        typeof options.success === 'function' ? options.success(data) : options.success
      );
      successOpts.type = 'success';
      if (!successOpts.duration) {
        successOpts.duration = getDefaultDuration('success');
      }
      viewport.updateToast(id, successOpts);
      return data;
    })
    .catch((error) => {
      const errorOpts = normalizeOptions(
        typeof options.error === 'function' ? options.error(error) : options.error
      );
      errorOpts.type = 'error';
      if (!errorOpts.duration) {
        errorOpts.duration = getDefaultDuration('error');
      }
      viewport.updateToast(id, errorOpts);
      throw error;
    });
};

/* ═══ REGISTER CUSTOM ELEMENT ═══ */
customElements.define('ren-toast-viewport', RenToastViewport);
