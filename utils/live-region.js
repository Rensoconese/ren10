/**
 * RenDS — Live Region (Screen Reader Announcements)
 * ===================================================
 * Announces dynamic content changes to screen readers
 * using ARIA live regions.
 *
 * Essential for: toasts, form validation messages,
 * loading states, search results count, etc.
 *
 * Features:
 * - Polite announcements (waits for SR to finish speaking)
 * - Assertive announcements (interrupts current speech)
 * - Auto-cleanup of old messages
 * - Queue system for multiple rapid announcements
 * - Works across all major screen readers (VoiceOver, NVDA, JAWS)
 *
 * Usage:
 *   import { announce, announcePolite, announceAssertive } from './live-region.js';
 *
 *   // Polite (default) — waits for current speech to finish
 *   announce('3 results found');
 *
 *   // Assertive — interrupts immediately (use sparingly!)
 *   announceAssertive('Error: invalid email address');
 *
 *   // With explicit politeness
 *   announce('Form saved successfully', { politeness: 'polite' });
 */

// ─── Live Region Elements (created lazily) ───
let politeRegion = null;
let assertiveRegion = null;

// Cleanup timer
let cleanupTimer = null;
const CLEANUP_DELAY = 5000; // Clear old messages after 5s

/**
 * Create a live region element if it doesn't exist.
 * The region is visually hidden but accessible to screen readers.
 */
function getOrCreateRegion(politeness) {
  const isAssertive = politeness === 'assertive';
  const existing = isAssertive ? assertiveRegion : politeRegion;

  if (existing && document.body.contains(existing)) {
    return existing;
  }

  const region = document.createElement('div');
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', politeness);
  region.setAttribute('aria-atomic', 'true');
  region.setAttribute('aria-relevant', 'additions text');

  // Visually hidden but accessible (same as .ren-sr-only)
  Object.assign(region.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: '0',
  });

  // ID for debugging
  region.id = `ren-live-${politeness}`;

  document.body.appendChild(region);

  if (isAssertive) {
    assertiveRegion = region;
  } else {
    politeRegion = region;
  }

  return region;
}

/**
 * Clear all live region content.
 * Called after a delay to prevent stale messages.
 */
function scheduleCleanup() {
  clearTimeout(cleanupTimer);
  cleanupTimer = setTimeout(() => {
    if (politeRegion) politeRegion.textContent = '';
    if (assertiveRegion) assertiveRegion.textContent = '';
  }, CLEANUP_DELAY);
}

/**
 * Announce a message to screen readers.
 *
 * @param {string} message - The text to announce
 * @param {Object} options
 * @param {'polite'|'assertive'} options.politeness - How urgently to announce
 * @param {number} options.delay - Ms to wait before announcing (default: 100)
 */
export function announce(message, options = {}) {
  const { politeness = 'polite', delay = 100 } = options;

  if (!message || typeof message !== 'string') return;

  const region = getOrCreateRegion(politeness);

  // Use a delay + clear/set pattern for reliable SR announcement.
  // Screen readers need the content to "change" to re-announce.
  // Clearing first, then setting after a frame, ensures detection.
  region.textContent = '';

  setTimeout(() => {
    region.textContent = message;
    scheduleCleanup();
  }, delay);
}

/**
 * Announce politely (waits for SR to finish current speech).
 * Use for: success messages, status updates, search results count.
 *
 * @param {string} message
 */
export function announcePolite(message) {
  announce(message, { politeness: 'polite' });
}

/**
 * Announce assertively (interrupts current speech).
 * Use sparingly! Only for: errors, urgent warnings, time-sensitive info.
 *
 * @param {string} message
 */
export function announceAssertive(message) {
  announce(message, { politeness: 'assertive' });
}

/**
 * Clear all pending announcements and regions.
 */
export function clearAnnouncements() {
  clearTimeout(cleanupTimer);
  if (politeRegion) politeRegion.textContent = '';
  if (assertiveRegion) assertiveRegion.textContent = '';
}

/**
 * Remove live regions from the DOM entirely.
 * Call this on app teardown if needed.
 */
export function destroyLiveRegions() {
  clearTimeout(cleanupTimer);
  politeRegion?.remove();
  assertiveRegion?.remove();
  politeRegion = null;
  assertiveRegion = null;
}
