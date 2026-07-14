/**
 * Reusable structural-visual quality assertions for Ren10 block tests.
 * Generic Playwright helpers only — no block-specific selectors.
 */

/**
 * @param {unknown} page
 */
function assertPage(page) {
  if (!page || typeof page.locator !== 'function' || typeof page.evaluate !== 'function') {
    throw new Error('page must be a Playwright Page');
  }
}

/**
 * @param {unknown} selectors
 */
function assertSelectors(selectors) {
  if (!Array.isArray(selectors) || selectors.length === 0) {
    throw new Error('selectors must be a non-empty array of CSS selectors');
  }
  for (const selector of selectors) {
    if (typeof selector !== 'string' || selector.length === 0) {
      throw new Error('each selector must be a non-empty string');
    }
  }
}

/**
 * @param {unknown} value
 * @param {string} name
 */
function assertNonEmptyString(value, name) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${name} must be a non-empty string`);
  }
}

/**
 * @param {{ display: string, visibility: string, width: number, height: number }} metric
 */
function isVisibleMetric(metric) {
  return metric.display !== 'none'
    && metric.visibility !== 'hidden'
    && metric.width > 0
    && metric.height > 0;
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string[]} selectors
 */
async function elementMetrics(page, selectors) {
  const metrics = [];
  for (const selector of selectors) {
    const values = await page.locator(selector).evaluateAll((elements, sourceSelector) => elements.map((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        selector: sourceSelector,
        display: style.display,
        visibility: style.visibility,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
      };
    }), selector);
    metrics.push(...values);
  }
  return metrics;
}

/**
 * Assert exactly one visible authored affordance among the given selectors.
 * @param {import('@playwright/test').Page} page
 * @param {string[]} selectors
 * @param {string} label
 */
async function expectSingleVisibleAffordance(page, selectors, label) {
  assertPage(page);
  assertSelectors(selectors);
  assertNonEmptyString(label, 'label');

  const elements = (await elementMetrics(page, selectors)).filter(isVisibleMetric);
  if (elements.length !== 1) {
    throw new Error(`${label}: expected 1 visible affordance, received ${elements.length}`);
  }
}

/**
 * Assert all visible elements share the same axis coordinate within tolerance.
 * @param {import('@playwright/test').Page} page
 * @param {string[]} selectors
 * @param {'top'|'centerY'|'left'|'centerX'} axis
 * @param {number} [tolerancePx=1]
 */
async function expectAligned(page, selectors, axis, tolerancePx = 1) {
  assertPage(page);
  assertSelectors(selectors);
  if (!['top', 'centerY', 'left', 'centerX'].includes(axis)) {
    throw new Error(`Unsupported alignment axis: ${axis}`);
  }
  if (typeof tolerancePx !== 'number' || Number.isNaN(tolerancePx) || tolerancePx < 0) {
    throw new Error('tolerancePx must be a non-negative number');
  }

  const elements = (await elementMetrics(page, selectors)).filter(isVisibleMetric);
  if (elements.length < 2) {
    throw new Error(`Alignment requires at least 2 visible elements; received ${elements.length}`);
  }
  const values = elements.map((metric) => metric[axis]);
  const delta = Math.max(...values) - Math.min(...values);
  if (delta > tolerancePx) {
    throw new Error(`${axis} alignment delta ${Math.round(delta * 100) / 100}px exceeds ${tolerancePx}px`);
  }
}

/**
 * Assert subject width / container width falls in [minimum, maximum].
 * @param {import('@playwright/test').Page} page
 * @param {string} subject
 * @param {string} container
 * @param {number} minimum
 * @param {number} maximum
 */
async function expectWidthRatio(page, subject, container, minimum, maximum) {
  assertPage(page);
  assertNonEmptyString(subject, 'subject');
  assertNonEmptyString(container, 'container');
  if (typeof minimum !== 'number' || typeof maximum !== 'number'
    || Number.isNaN(minimum) || Number.isNaN(maximum)) {
    throw new Error('minimum and maximum must be numbers');
  }
  if (minimum > maximum) {
    throw new Error('minimum must be <= maximum');
  }

  const measurement = await page.evaluate(({ subjectSelector, containerSelector }) => {
    const subjectElement = document.querySelector(subjectSelector);
    const containerElement = document.querySelector(containerSelector);
    if (!subjectElement || !containerElement) return null;
    return subjectElement.getBoundingClientRect().width / containerElement.getBoundingClientRect().width;
  }, { subjectSelector: subject, containerSelector: container });

  if (measurement === null) {
    throw new Error(`Width ratio elements missing: ${subject} / ${container}`);
  }
  if (measurement < minimum || measurement > maximum) {
    throw new Error(`Width ratio ${measurement.toFixed(3)} outside ${minimum}..${maximum} for ${subject}`);
  }
}

/**
 * Assert root has no meaningful horizontal overflow.
 * @param {import('@playwright/test').Page} page
 * @param {string} rootSelector
 */
async function expectNoOverflow(page, rootSelector) {
  assertPage(page);
  assertNonEmptyString(rootSelector, 'rootSelector');

  const locator = page.locator(rootSelector);
  const count = await locator.count();
  if (count === 0) {
    throw new Error(`Overflow root missing: ${rootSelector}`);
  }

  const result = await locator.first().evaluate((root) => ({
    scrollWidth: root.scrollWidth,
    clientWidth: root.clientWidth,
  }));
  if (result.scrollWidth > result.clientWidth + 1) {
    throw new Error(`Horizontal overflow: scrollWidth ${result.scrollWidth}, clientWidth ${result.clientWidth}`);
  }
}

/**
 * Inspect native element chrome (border/padding/margin + ::after / ::marker).
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 */
async function inspectNativeChrome(page, selector) {
  assertPage(page);
  assertNonEmptyString(selector, 'selector');

  const locator = page.locator(selector);
  const count = await locator.count();
  if (count === 0) {
    throw new Error(`Native chrome element missing: ${selector}`);
  }

  return locator.first().evaluate((element) => {
    const style = getComputedStyle(element);
    const after = getComputedStyle(element, '::after');
    const marker = getComputedStyle(element, '::marker');
    return {
      borderTopWidth: style.borderTopWidth,
      paddingTop: style.paddingTop,
      marginTop: style.marginTop,
      afterContent: after.content,
      afterDisplay: after.display,
      markerContent: marker.content,
      markerDisplay: marker.display,
    };
  });
}

module.exports = {
  expectAligned,
  expectNoOverflow,
  expectSingleVisibleAffordance,
  expectWidthRatio,
  inspectNativeChrome,
};
