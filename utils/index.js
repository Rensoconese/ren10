/**
 * RenDS — JS Utilities
 * =====================
 * Core vanilla JS utilities for accessible components.
 * Each module is standalone — import only what you need.
 *
 * Usage (tree-shakeable):
 *   import { createFocusTrap } from 'ren10/utils/focus-trap.js';
 *   import { announce } from 'ren10/utils/live-region.js';
 *
 * Or import everything:
 *   import * as RenUtils from 'ren10/utils/index.js';
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
// Diagnostics (opt-in traces) + integration warnings (on by default)
export {
  configureRenDebug,
  renDebug,
  renWarn,
  isRenDebugEnabled,
  areRenWarningsEnabled,
} from './debug.js';

// CSS anchor positioning (support detection + per-instance anchor wiring)
export { createAnchorLink, supportsAnchorPositioning } from './anchor.js';

// Overlay positioning fallback (flip + clamp for non-anchor browsers)
export { computeOverlayPosition } from './positioning.js';

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

// Motion coordination (enter/exit + stagger + reduced-motion)
export {
  prefersReducedMotion,
  onReducedMotionChange,
  waitForMotion,
  setMotionState,
  motionMount,
  motionUnmount,
  applyStagger,
} from './motion.js';

// Civil-date parsing and formatting (timezone-safe YYYY-MM-DD values)
export { parseLocalDate, formatLocalDate, clampLocalDate } from './local-date.js';
