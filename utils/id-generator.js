/**
 * RenDS — ID Generator
 * =====================
 * Generates unique IDs for ARIA relationships
 * (aria-labelledby, aria-describedby, aria-controls, etc.)
 *
 * Components need unique IDs to wire up ARIA references
 * between related elements (e.g., a label and its input,
 * a tab and its panel, a button and its popover).
 *
 * Features:
 * - Guaranteed unique IDs within a page session
 * - Readable, prefixed IDs for debugging
 * - Auto-ID assignment to elements
 * - Batch ID generation for compound components
 *
 * Usage:
 *   import { uid, autoId, componentIds } from './id-generator.js';
 *
 *   // Simple unique ID
 *   const id = uid();          // "ren-1"
 *   const id2 = uid('dialog'); // "ren-dialog-2"
 *
 *   // Auto-assign to element (only if no ID exists)
 *   autoId(element);           // element.id = "ren-3"
 *   autoId(element, 'input');  // element.id = "ren-input-4"
 *
 *   // Compound component IDs
 *   const ids = componentIds('dialog');
 *   // { root: "ren-dialog-5", title: "ren-dialog-5-title",
 *   //   description: "ren-dialog-5-description", close: "ren-dialog-5-close" }
 */

let counter = 0;

/**
 * Generate a unique ID string.
 *
 * @param {string} prefix - Optional prefix for readability
 * @returns {string} Unique ID like "ren-dialog-1"
 */
export function uid(prefix = '') {
  counter++;
  return prefix ? `ren-${prefix}-${counter}` : `ren-${counter}`;
}

/**
 * Ensure an element has an ID. If it already has one, keep it.
 * If not, generate and assign one.
 *
 * @param {HTMLElement} element - Element to ensure has an ID
 * @param {string} prefix - Optional prefix for the generated ID
 * @returns {string} The element's ID (existing or newly generated)
 */
export function autoId(element, prefix = '') {
  if (!element) return '';

  if (!element.id) {
    element.id = uid(prefix);
  }

  return element.id;
}

/**
 * Generate a set of related IDs for a compound component.
 * All sub-IDs derive from a single root ID for consistency.
 *
 * @param {string} component - Component name (e.g., 'dialog', 'tabs', 'select')
 * @param {string[]} parts - Sub-parts to generate IDs for
 * @returns {Object} Map of part names to IDs
 *
 * @example
 *   componentIds('dialog', ['title', 'description', 'close'])
 *   // { root: "ren-dialog-1", title: "ren-dialog-1-title", ... }
 */
export function componentIds(component, parts = []) {
  const rootId = uid(component);
  const ids = { root: rootId };

  for (const part of parts) {
    ids[part] = `${rootId}-${part}`;
  }

  return ids;
}

/**
 * Wire up ARIA relationship between two elements.
 * Ensures both have IDs and sets the specified ARIA attribute.
 *
 * @param {HTMLElement} source - Element that references (e.g., input)
 * @param {HTMLElement} target - Element being referenced (e.g., label)
 * @param {string} attribute - ARIA attribute (e.g., 'aria-labelledby', 'aria-describedby')
 * @param {string} prefix - Optional prefix for generated IDs
 *
 * @example
 *   wireAria(input, label, 'aria-labelledby');
 *   // Ensures label has an ID, then sets input[aria-labelledby] = label.id
 */
export function wireAria(source, target, attribute, prefix = '') {
  if (!source || !target) return;

  const targetId = autoId(target, prefix);
  const existing = source.getAttribute(attribute);

  // Support multiple references (space-separated IDs)
  if (existing && !existing.split(' ').includes(targetId)) {
    source.setAttribute(attribute, `${existing} ${targetId}`);
  } else if (!existing) {
    source.setAttribute(attribute, targetId);
  }
}

/**
 * Wire aria-labelledby between an element and its label.
 */
export function wireLabel(element, label) {
  wireAria(element, label, 'aria-labelledby', 'label');
}

/**
 * Wire aria-describedby between an element and its description.
 */
export function wireDescription(element, description) {
  wireAria(element, description, 'aria-describedby', 'desc');
}

/**
 * Wire aria-controls between a trigger and its controlled element.
 */
export function wireControls(trigger, controlled) {
  wireAria(trigger, controlled, 'aria-controls', 'panel');
}

/**
 * Reset the counter (useful for testing).
 */
export function resetIdCounter() {
  counter = 0;
}
