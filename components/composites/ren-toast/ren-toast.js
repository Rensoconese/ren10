/**
 * RenDS — Toast Notification System
 * ==================================
 * Transient notifications anchored to a corner of the viewport.
 *
 * Light DOM only. The viewport is a plain element with class
 * `.ren-toast-viewport` (or the convenience custom element
 * `<ren-toast-viewport>`). Toasts are plain `.ren-toast` divs
 * appended to it.
 *
 * Public API (also available as `window.toast`):
 *   toast.success(title, options?)
 *   toast.info(title, options?)
 *   toast.warning(title, options?)
 *   toast.danger(title, options?)
 *   toast.show(options)            — { title, description, status, duration, action }
 *   toast.dismiss(id)
 *   toast.dismissAll()
 *   toast.promise(promise, { loading, success, error })
 *
 * Options:
 *   title        — required string
 *   description  — optional secondary line
 *   status       — "success" | "info" | "warning" | "danger" | "loading"
 *   duration     — auto-dismiss ms (0 = persistent, default 4000 / 8000 for danger)
 *   dismissible  — show close button (default true)
 *   action       — { label, onClick } inline button
 */

import { announceAssertive, announcePolite } from '../../../utils/live-region.js';

/* ─── Defaults ─── */

const DEFAULT_DURATIONS = {
  success: 4000,
  info: 4000,
  warning: 5000,
  danger: 8000,
  loading: 0, // persistent
};

const ICONS = {
  success: '✓',
  info: 'ℹ',
  warning: '⚠',
  danger: '✕',
  loading: '⟳',
};

const VALID_POSITIONS = new Set([
  'top-right',
  'top-left',
  'top-center',
  'bottom-right',
  'bottom-left',
  'bottom-center',
]);

/* ─── Custom element (convenience) ─── */

export class RenToastViewport extends HTMLElement {
  connectedCallback() {
    this._listenerController?.abort();
    this._listenerController = new AbortController();
    const { signal } = this._listenerController;

    this.classList.add('ren-toast-viewport');
    if (!this.hasAttribute('data-position')) {
      this.setAttribute('data-position', 'bottom-right');
    }
    if (!VALID_POSITIONS.has(this.getAttribute('data-position'))) {
      this.setAttribute('data-position', 'bottom-right');
    }
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Notifications');
    }
    if (!this.hasAttribute('role')) this.setAttribute('role', 'region');

    // Pause timers on hover or keyboard focus
    this.addEventListener('mouseenter', () => pauseTimersFor(this), { signal });
    this.addEventListener('mouseleave', () => resumeTimersFor(this), { signal });
    this.addEventListener('focusin', () => pauseTimersFor(this), { signal });
    this.addEventListener('focusout', (e) => {
      if (!this.contains(e.relatedTarget)) resumeTimersFor(this);
    }, { signal });
  }

  disconnectedCallback() {
    this._listenerController?.abort();
    this._listenerController = null;
  }
}

if (!customElements.get('ren-toast-viewport')) {
  customElements.define('ren-toast-viewport', RenToastViewport);
}

/* ─── Per-viewport timer book-keeping ─── */

const timerStore = new WeakMap(); // viewport → { timers: Map<id, {timerId, remaining, startedAt}>, paused: bool }

function getStore(viewport) {
  let store = timerStore.get(viewport);
  if (!store) {
    store = { timers: new Map(), paused: false };
    timerStore.set(viewport, store);
  }
  return store;
}

function pauseTimersFor(viewport) {
  const store = getStore(viewport);
  if (store.paused) return;
  store.paused = true;
  for (const [id, info] of store.timers.entries()) {
    if (info.timerId == null) continue;
    clearTimeout(info.timerId);
    info.timerId = null;
    if (info.startedAt && info.remaining) {
      info.remaining = Math.max(0, info.remaining - (Date.now() - info.startedAt));
    }
    // Pause progress bar (freeze its current width)
    const toastEl = viewport.querySelector(`[data-toast-id="${CSS.escape(id)}"]`);
    if (toastEl) {
      const progress = toastEl.querySelector('.ren-toast-progress');
      if (progress) {
        const width = getComputedStyle(progress).width;
        progress.style.transition = 'none';
        progress.style.width = width;
      }
    }
  }
}

function resumeTimersFor(viewport) {
  const store = getStore(viewport);
  if (!store.paused) return;
  store.paused = false;
  for (const [id, info] of store.timers.entries()) {
    if (info.remaining > 0) {
      info.startedAt = Date.now();
      info.timerId = setTimeout(() => dismissToast(viewport, id), info.remaining);
      // Resume progress bar
      const toastEl = viewport.querySelector(`[data-toast-id="${CSS.escape(id)}"]`);
      if (toastEl) {
        const progress = toastEl.querySelector('.ren-toast-progress');
        if (progress) {
          // Force reflow then animate to 0
          progress.style.transition = `width ${info.remaining}ms linear`;
          requestAnimationFrame(() => {
            progress.style.width = '0%';
          });
        }
      }
    }
  }
}

/* ─── Viewport resolution ─── */

let _autoViewport = null;

function resolveViewport(preferredId) {
  if (preferredId) {
    const v = document.getElementById(preferredId);
    if (v) return v;
  }
  if (_autoViewport && document.body.contains(_autoViewport)) {
    return _autoViewport;
  }
  // Look for any existing viewport in the page
  const existing = document.querySelector('.ren-toast-viewport, ren-toast-viewport');
  if (existing) {
    _autoViewport = existing;
    return existing;
  }
  // Auto-create
  _autoViewport = document.createElement('ren-toast-viewport');
  _autoViewport.setAttribute('data-position', 'bottom-right');
  document.body.appendChild(_autoViewport);
  return _autoViewport;
}

/* ─── Toast construction ─── */

function generateId() {
  return `toast-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalize(input, statusOverride) {
  const opts = typeof input === 'string' ? { title: input } : { ...input };
  opts.statusExplicit = statusOverride != null || opts.status != null;
  if (statusOverride) opts.status = statusOverride;
  if (!opts.status) opts.status = 'info';
  opts.durationExplicit = opts.duration != null;
  if (opts.duration == null) opts.duration = DEFAULT_DURATIONS[opts.status] ?? 4000;
  if (opts.dismissible == null) opts.dismissible = true;
  return opts;
}

function buildToast(id, opts) {
  const { title, description, status, duration, dismissible, action } = opts;

  const toast = document.createElement('div');
  toast.className = `ren-toast ren-toast-${status}`;
  toast.setAttribute('data-toast-id', id);
  if (duration > 0) toast.setAttribute('data-duration', String(duration));
  toast.setAttribute('role', status === 'danger' ? 'alert' : 'status');
  toast.setAttribute('tabindex', '0'); // focusable for Esc/F6

  // Icon
  const icon = document.createElement('span');
  icon.className = 'ren-toast-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = ICONS[status] ?? ICONS.info;
  toast.appendChild(icon);

  // Body (title + description + action)
  const body = document.createElement('div');
  body.className = 'ren-toast-body';

  if (title) {
    const t = document.createElement('p');
    t.className = 'ren-toast-title';
    t.textContent = title;
    body.appendChild(t);
  }

  if (description) {
    const d = document.createElement('p');
    d.className = 'ren-toast-description';
    d.textContent = description;
    body.appendChild(d);
  }

  if (action && action.label) {
    const actions = document.createElement('div');
    actions.className = 'ren-toast-actions';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ren-toast-action ren-btn ren-btn-ghost ren-btn-sm';
    btn.textContent = action.label;
    btn.addEventListener('click', () => {
      try {
        action.onClick?.();
      } finally {
        // Find the host viewport at click time (toast may have moved? unlikely)
        const viewport = toast.closest('.ren-toast-viewport, ren-toast-viewport');
        if (viewport) dismissToast(viewport, id);
      }
    });
    actions.appendChild(btn);
    body.appendChild(actions);
  }

  toast.appendChild(body);

  // Close button
  if (dismissible) {
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'ren-toast-close';
    close.setAttribute('aria-label', 'Dismiss notification');
    close.textContent = '×';
    close.addEventListener('click', () => {
      const viewport = toast.closest('.ren-toast-viewport, ren-toast-viewport');
      if (viewport) dismissToast(viewport, id);
    });
    toast.appendChild(close);
  }

  // Progress bar (auto-dismiss countdown)
  if (duration > 0) {
    const progress = document.createElement('div');
    progress.className = 'ren-toast-progress';
    progress.style.width = '100%';
    progress.style.transition = `width ${duration}ms linear`;
    toast.appendChild(progress);
    requestAnimationFrame(() => {
      progress.style.width = '0%';
    });
  }

  // Esc dismisses when toast itself has focus
  toast.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const viewport = toast.closest('.ren-toast-viewport, ren-toast-viewport');
      if (viewport) dismissToast(viewport, id);
    }
  });

  return toast;
}

/* ─── Show / dismiss ─── */

function showOnViewport(viewport, opts) {
  const id = opts.id || generateId();

  // If a toast with this id exists, replace it
  const existing = viewport.querySelector(`[data-toast-id="${CSS.escape(id)}"]`);
  if (existing) {
    existing.remove();
    const store = getStore(viewport);
    const t = store.timers.get(id);
    if (t?.timerId) clearTimeout(t.timerId);
    store.timers.delete(id);
  }

  const toast = buildToast(id, opts);
  viewport.appendChild(toast);

  // Resolve the closest effective token scope, including overrides on the
  // generated toast itself. Explicit duration/status options remain
  // authoritative.
  if (!opts.durationExplicit && !opts.statusExplicit) {
    const tokenDuration = getComputedStyle(toast)
      .getPropertyValue('--ren-toast-duration')
      .trim();
    const parsedDuration = parseFloat(tokenDuration);
    if (Number.isFinite(parsedDuration) && parsedDuration >= 0) {
      opts.duration = parsedDuration;
      const progress = toast.querySelector('.ren-toast-progress');
      if (opts.duration > 0) {
        toast.setAttribute('data-duration', String(opts.duration));
        if (progress) progress.style.transition = `width ${opts.duration}ms linear`;
      } else if (progress) {
        progress.remove();
        toast.removeAttribute('data-duration');
      }
    }
  }

  if (!opts.durationExplicit && opts.duration > 0) toast.setAttribute('data-duration', String(opts.duration));

  // Schedule auto-dismiss
  if (opts.duration > 0) {
    const store = getStore(viewport);
    const startedAt = Date.now();
    const timerId = store.paused
      ? null
      : setTimeout(() => dismissToast(viewport, id), opts.duration);
    store.timers.set(id, { timerId, remaining: opts.duration, startedAt });
  }

  // Announce via live region (separate from the toast DOM so SRs don't double-up)
  const announcement = [opts.title, opts.description].filter(Boolean).join('. ');
  if (announcement) {
    if (opts.status === 'danger') announceAssertive(announcement);
    else announcePolite(announcement);
  }

  // Enforce optional max-toasts
  enforceMax(viewport);

  return id;
}

function enforceMax(viewport) {
  const max = parseInt(viewport.getAttribute('data-max'), 10);
  if (!max || isNaN(max)) return;
  const toasts = viewport.querySelectorAll('.ren-toast:not([data-closing])');
  if (toasts.length <= max) return;
  for (let i = 0; i < toasts.length - max; i++) {
    dismissToast(viewport, toasts[i].dataset.toastId);
  }
}

function dismissToast(viewport, id) {
  if (!viewport || !id) return;
  const toast = viewport.querySelector(`[data-toast-id="${CSS.escape(id)}"]`);
  if (!toast) return;

  const store = getStore(viewport);
  const t = store.timers.get(id);
  if (t?.timerId) clearTimeout(t.timerId);
  store.timers.delete(id);

  toast.setAttribute('data-closing', '');

  // Wait for the exit animation, then remove
  const dur = parseFloat(getComputedStyle(toast).animationDuration) * 1000 || 200;
  setTimeout(() => toast.remove(), dur);
}

/* ─── F6: focus viewport globally ─── */

function setupGlobalKeys() {
  if (window.__renToastF6Wired) return;
  window.__renToastF6Wired = true;
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F6') {
      const viewport = document.querySelector('ren-toast-viewport, .ren-toast-viewport');
      if (!viewport) return;
      const firstToast = viewport.querySelector('.ren-toast');
      if (firstToast) {
        e.preventDefault();
        firstToast.focus();
      }
    }
  });
}

setupGlobalKeys();

/* ─── Public API ─── */

function show(input) {
  const opts = normalize(input);
  const viewport = resolveViewport();
  return showOnViewport(viewport, opts);
}

function variantFn(status) {
  return function (title, options = {}) {
    const opts =
      typeof title === 'string'
        ? { ...options, title }
        : { ...title, ...options };
    return show(normalize(opts, status));
  };
}

export const toast = Object.assign(show, {
  show,
  success: variantFn('success'),
  info: variantFn('info'),
  warning: variantFn('warning'),
  danger: variantFn('danger'),
  // Common alias for users coming from other libs
  error: variantFn('danger'),
  loading: variantFn('loading'),

  dismiss(id) {
    const viewport = resolveViewport();
    dismissToast(viewport, id);
  },

  dismissAll() {
    const viewport = resolveViewport();
    viewport.querySelectorAll('.ren-toast:not([data-closing])').forEach((t) => {
      dismissToast(viewport, t.dataset.toastId);
    });
  },

  update(id, updates) {
    const viewport = resolveViewport();
    const toastEl = viewport.querySelector(`[data-toast-id="${CSS.escape(id)}"]`);
    if (!toastEl) return;
    if (updates.status) {
      toastEl.className = `ren-toast ren-toast-${updates.status}`;
      toastEl.setAttribute('data-toast-id', id);
      toastEl.setAttribute(
        'role',
        updates.status === 'danger' ? 'alert' : 'status'
      );
      const icon = toastEl.querySelector('.ren-toast-icon');
      if (icon) icon.textContent = ICONS[updates.status] ?? ICONS.info;
    }
    if (updates.title !== undefined) {
      const t = toastEl.querySelector('.ren-toast-title');
      if (t) t.textContent = updates.title;
    }
    if (updates.description !== undefined) {
      const d = toastEl.querySelector('.ren-toast-description');
      if (d) d.textContent = updates.description;
    }
  },

  promise(promise, options = {}) {
    const id = generateId();
    const loadingOpts = normalize(options.loading || 'Loading...', 'loading');
    loadingOpts.id = id;
    const viewport = resolveViewport();
    showOnViewport(viewport, loadingOpts);

    return promise
      .then((data) => {
        const successInput =
          typeof options.success === 'function'
            ? options.success(data)
            : options.success;
        const successOpts = normalize(successInput || 'Done', 'success');
        successOpts.id = id;
        showOnViewport(viewport, successOpts);
        return data;
      })
      .catch((err) => {
        const errorInput =
          typeof options.error === 'function' ? options.error(err) : options.error;
        const errorOpts = normalize(errorInput || 'Failed', 'danger');
        errorOpts.id = id;
        showOnViewport(viewport, errorOpts);
        throw err;
      });
  },
});

// Expose globally — the docs show `window.toast.success(...)` as the primary usage.
if (typeof window !== 'undefined') {
  window.toast = toast;
}
