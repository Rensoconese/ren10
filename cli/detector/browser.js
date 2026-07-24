import { PROFILES, RULES, filterFindings } from './index.js';

async function detectUrl(url, options = {}) {
  const profileName = options.profile ?? 'generic';
  const profile = PROFILES[profileName];
  if (!profile) throw new Error(`Unknown detector profile "${profileName}".`);
  const playwright = await loadPlaywright();
  const browser = await playwright.chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: options.viewport ?? { width: 1440, height: 1000 } });
    await page.goto(url, { waitUntil: 'load' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const rawFindings = await page.evaluate(browserAudit);
    let findings = rawFindings.map((finding) => enrich(finding, url));
    if (profileName === 'generic') findings = findings.filter((finding) => !ruleFor(finding.rule)?.profile);
    findings = filterFindings(findings, options.config ?? {});
    if (profile.promoteWarnings) {
      findings = findings.map((finding) => finding.severity === 'warning'
        ? { ...finding, severity: 'error', promotedBy: 'strict' }
        : finding);
    }
    findings.sort((a, b) => a.rule.localeCompare(b.rule) || a.selector.localeCompare(b.selector));
    const summary = {
      pages: 1,
      errors: findings.filter((finding) => finding.severity === 'error').length,
      warnings: findings.filter((finding) => finding.severity === 'warning').length,
      total: findings.length,
    };
    return { schemaVersion: 1, profile: profileName, url, findings, summary, exitCode: summary.errors > 0 ? 1 : 0 };
  } finally {
    await browser.close();
  }
}

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    try {
      return await import('@playwright/test');
    } catch {
      throw new Error('URL detection requires Playwright. Install it with "npm install -D playwright" and run "npx playwright install chromium".');
    }
  }
}

function ruleFor(id) {
  return RULES.find((rule) => rule.id === id);
}

function enrich(finding, url) {
  const definition = ruleFor(finding.rule);
  return {
    ...finding,
    severity: definition?.severity ?? 'warning',
    category: definition?.category ?? 'quality',
    engine: 'browser',
    file: url,
    line: 1,
    suggestion: definition?.suggestion ?? 'Review the rendered element.',
  };
}

function browserAudit() {
  const findings = [];
  const root = document.documentElement;
  const viewportWidth = root.clientWidth;

  const visible = (element, style = getComputedStyle(element)) => {
    const rect = element.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
  };
  const selector = (element) => {
    if (element === document.documentElement) return 'html';
    if (element.id) return `#${CSS.escape(element.id)}`;
    const classes = [...element.classList].slice(0, 2).map((name) => `.${CSS.escape(name)}`).join('');
    return `${element.tagName.toLowerCase()}${classes}`;
  };
  const directText = (element) => [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
  const push = (rule, element, message, value) => findings.push({ rule, selector: selector(element), message, value });

  if (root.scrollWidth > viewportWidth + 1) {
    push('content-overflow', root, `Document width ${root.scrollWidth}px exceeds viewport width ${viewportWidth}px.`, `${root.scrollWidth}/${viewportWidth}`);
  }

  for (const element of document.querySelectorAll('body *')) {
    const style = getComputedStyle(element);
    if (!visible(element, style)) continue;
    const rect = element.getBoundingClientRect();
    const text = element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    const fontSize = Number.parseFloat(style.fontSize) || 16;
    const lineHeight = Number.parseFloat(style.lineHeight);

    if (directText(element) && text.length > 20 && (rect.left < 1 || rect.right > viewportWidth - 1)) {
      push('text-viewport-edge', element, 'Readable text touches or crosses a viewport edge.', `${Math.round(rect.left)}/${Math.round(rect.right)}`);
    }
    if (directText(element) && Number.isFinite(lineHeight) && rect.height > lineHeight * 1.4 && lineHeight / fontSize < 1.3) {
      push('tight-leading', element, `Rendered line-height ratio ${(lineHeight / fontSize).toFixed(2)} is below 1.3.`, (lineHeight / fontSize).toFixed(2));
    }
    if (directText(element) && text.length > 40 && rect.width / fontSize > 45) {
      push('long-line', element, `Rendered text measure is approximately ${(rect.width / fontSize).toFixed(1)}em.`, (rect.width / fontSize).toFixed(1));
    }
    const hasBoundary = ['Top', 'Right', 'Bottom', 'Left'].some((side) => Number.parseFloat(style[`border${side}Width`]) > 0);
    const minPadding = Math.min(...['Top', 'Right', 'Bottom', 'Left'].map((side) => Number.parseFloat(style[`padding${side}`]) || 0));
    if (directText(element) && hasBoundary && minPadding < 8) {
      push('cramped-padding', element, `Bordered text container has only ${minPadding}px minimum padding.`, `${minPadding}px`);
    }
    if (directText(element) && text.length > 0) {
      const foreground = parseRgb(style.color);
      const background = effectiveBackground(element);
      if (foreground && background) {
        const ratio = contrast(foreground, background);
        const large = fontSize >= 24 || (fontSize >= 18.66 && Number.parseInt(style.fontWeight, 10) >= 700);
        const minimum = large ? 3 : 4.5;
        if (ratio < minimum) push('low-contrast', element, `Text contrast ${ratio.toFixed(2)}:1 is below ${minimum}:1.`, ratio.toFixed(2));
      }
    }
  }

  for (const parent of document.querySelectorAll('body *')) {
    const children = [...parent.children].filter((child) => visible(child));
    if (children.length < 3 || children.length > 8) continue;
    const rects = children.map((child) => child.getBoundingClientRect());
    const verticallyOrdered = rects.every((rect, index) => index === 0 || rect.top >= rects[index - 1].bottom - 1);
    if (!verticallyOrdered) continue;
    const gaps = rects.slice(1).map((rect, index) => rect.top - rects[index].bottom);
    if (gaps.length < 2 || Math.min(...gaps) < 8 || Math.max(...gaps) - Math.min(...gaps) > 1) continue;
    push(
      'monotonous-spacing',
      parent,
      `All ${gaps.length} adjacent relationships use the same ${gaps[0].toFixed(1)}px gap.`,
      `${gaps[0].toFixed(1)}px`,
    );
  }

  return dedupe(findings);

  function parseRgb(raw) {
    const values = String(raw).match(/[0-9.]+/g)?.map(Number);
    if (!values || values.length < 3) return null;
    return values.slice(0, 3);
  }
  function effectiveBackground(element) {
    let current = element;
    while (current) {
      const values = String(getComputedStyle(current).backgroundColor).match(/[0-9.]+/g)?.map(Number);
      if (values && values.length >= 3 && (values[3] ?? 1) > 0.05) return values.slice(0, 3);
      current = current.parentElement;
    }
    return [255, 255, 255];
  }
  function luminance(rgb) {
    const values = rgb.map((value) => {
      const channel = value / 255;
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
  }
  function contrast(a, b) {
    const first = luminance(a);
    const second = luminance(b);
    return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
  }
  function dedupe(items) {
    const seen = new Set();
    return items.filter((item) => {
      const key = `${item.rule}\0${item.selector}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

export { detectUrl };
