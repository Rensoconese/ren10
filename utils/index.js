/**
 * RenDS — JS Utilities
 * =====================
 * Core vanilla JS utilities for accessible components.
 * Each module is standalone — import only what you need.
 *
 * Usage (tree-shakeable):
 *   import { createFocusTrap } from 'rends/utils/focus-trap.js';
 *   import { announce } from 'rends/utils/live-region.js';
 *
 * Or import everything:
 *   import * as RenUtils from 'rends/utils/index.js';
 */

// Focus management
export {
  createFocusTrap,
  getActiveTrap,
  isFocusable,
  getFirstFocusable,
  getLastFocusable,
  getFocusableElements,
  FOCUSABLE_SELECTOR,
} from './focus-trap.js';

// Keyboard navigation (roving tabindex)
export { createKeyboardNav } from './keyboard-nav.js';

// Dismissable layers (click outside + Escape)
export {
  createDismissable,
  hasActiveLayers,
  getActiveLayerCount,
  dismissAll,
} from './dismissable.js';

// Screen reader announcements
export {
  announce,
  announcePolite,
  announceAssertive,
  clearAnnouncements,
  destroyLiveRegions,
} from './live-region.js';

// ID generation & ARIA wiring
export {
  uid,
  autoId,
  componentIds,
  wireAria,
  wireLabel,
  wireDescription,
  wireControls,
  resetIdCounter,
} from './id-generator.js';
