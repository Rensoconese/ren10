/**
 * RenDS — Dismissable Layer
 * ==========================
 * Handles "click outside" and "Escape key" dismissal
 * for overlays, popovers, dropdowns, and modals.
 *
 * Inspired by Radix UI's DismissableLayer.
 *
 * Features:
 * - Click outside to dismiss
 * - Escape key to dismiss
 * - Stack-based: nested layers dismiss in order (innermost first)
 * - Pointer down outside detection (not just click)
 * - Ignores clicks on trigger elements
 * - Supports multiple active layers simultaneously
 *
 * Usage:
 *   import { createDismissable } from './dismissable.js';
 *
 *   const layer = createDismissable(popoverElement, {
 *     onDismiss: () => closePopover(),
 *     triggerElement: buttonElement,
 *     escapeKey: true,
 *     clickOutside: true,
 *     excludeElements: [otherPopover],
 *   });
 *
 *   layer.activate();
 *   // ... later
 *   layer.deactivate();
 */

// ─── Layer Stack ───
// Tracks all active dismissable layers.
// Top of stack = most recently opened = dismissed first.
const layerStack = [];

// Global listeners (attached once, shared by all layers)
let globalListenersAttached = false;

function attachGlobalListeners() {
  if (globalListenersAttached) return;
  globalListenersAttached = true;

  // Use pointerdown for more reliable outside detection
  // (fires before focus changes, works with touch)
  document.addEventListener('pointerdown', handleGlobalPointerDown, true);
  document.addEventListener('keydown', handleGlobalKeyDown, true);
}

function detachGlobalListeners() {
  if (layerStack.length > 0) return; // Still layers active
  globalListenersAttached = false;

  document.removeEventListener('pointerdown', handleGlobalPointerDown, true);
  document.removeEventListener('keydown', handleGlobalKeyDown, true);
}

function handleGlobalPointerDown(event) {
  // Work from top of stack (most recent layer)
  // Only the topmost layer that doesn't contain the click gets dismissed
  for (let i = layerStack.length - 1; i >= 0; i--) {
    const layer = layerStack[i];

    if (!layer.options.clickOutside) continue;

    // Check if click is inside this layer
    if (layer.container.contains(event.target)) {
      break; // Click is inside — stop checking
    }

    // Check if click is on trigger element
    if (layer.options.triggerElement?.contains(event.target)) {
      break; // Click on trigger — stop checking
    }

    // Check if click is on excluded elements
    const isExcluded = layer.options.excludeElements?.some((el) =>
      el.contains(event.target)
    );
    if (isExcluded) break;

    // Click is outside — dismiss this layer
    layer.options.onDismiss?.('click-outside', event);
    break; // Only dismiss one layer at a time
  }
}

function handleGlobalKeyDown(event) {
  if (event.key !== 'Escape') return;

  // Dismiss the topmost layer that handles Escape
  for (let i = layerStack.length - 1; i >= 0; i--) {
    const layer = layerStack[i];

    if (!layer.options.escapeKey) continue;

    event.preventDefault();
    event.stopPropagation();
    layer.options.onDismiss?.('escape', event);
    break; // Only dismiss topmost
  }
}

/**
 * Create a dismissable layer for a container element.
 *
 * @param {HTMLElement} container - The element to watch for outside interactions
 * @param {Object} options
 * @param {Function} options.onDismiss - Callback(reason, event) when layer should be dismissed
 * @param {HTMLElement|null} options.triggerElement - Trigger element to exclude from "outside"
 * @param {boolean} options.escapeKey - Dismiss on Escape key (default: true)
 * @param {boolean} options.clickOutside - Dismiss on click outside (default: true)
 * @param {HTMLElement[]} options.excludeElements - Additional elements to exclude from outside
 * @returns {Object} Layer controller
 */
export function createDismissable(container, options = {}) {
  const config = {
    onDismiss: null,
    triggerElement: null,
    escapeKey: true,
    clickOutside: true,
    excludeElements: [],
    ...options,
  };

  let active = false;

  const layerEntry = {
    container,
    options: config,
  };

  function activate() {
    if (active) return;
    active = true;

    layerStack.push(layerEntry);
    attachGlobalListeners();
  }

  function deactivate() {
    if (!active) return;
    active = false;

    const index = layerStack.indexOf(layerEntry);
    if (index !== -1) layerStack.splice(index, 1);

    detachGlobalListeners();
  }

  return {
    activate,
    deactivate,

    get isActive() {
      return active;
    },

    /** Update options dynamically */
    updateOptions(newOptions) {
      Object.assign(config, newOptions);
    },
  };
}

/**
 * Utility: check if there are any active dismissable layers.
 */
export function hasActiveLayers() {
  return layerStack.length > 0;
}

/**
 * Utility: get the number of active layers.
 */
export function getActiveLayerCount() {
  return layerStack.length;
}

/**
 * Utility: dismiss all active layers.
 */
export function dismissAll(reason = 'programmatic') {
  // Dismiss from top to bottom
  const layers = [...layerStack].reverse();
  for (const layer of layers) {
    layer.options.onDismiss?.(reason);
  }
}
