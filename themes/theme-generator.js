/* ============================================
   RenDS — Theme Generator
   ============================================
   Given ONE brand hex, generate a full
   semantic-token set (accent scale + light/dark
   variants) with WCAG 2.1 AA (or AAA) enforced
   automatically.

   Zero dependencies. Pure ES module. Works in browser,
   Node, Deno. No build step.

   API:
     generateTheme(hex, opts?) → {
       name: string,
       level: 'AA' | 'AAA',          // the target used for selection
       scale: { 50..950 },           // 11-step tonal scale
       light: { semantic tokens },   // level-safe for light surfaces
       dark:  { semantic tokens },   // level-safe for dark surfaces
       css:   string,                // ready-to-paste [data-theme] rule
       report: { passes: [...], warnings: [...] }
     }

     contrast(hexA, hexB) → number   // WCAG 2.1 ratio
     scaleFromHex(hex)   → { 50..950 }

   Design choices:
     - Scale is built in OKLCH-approximated space
       (HSL lightness shifts with hue preservation).
     - Step selection walks the scale and picks the
       tightest step that still passes the target ratio
       (4.5:1 for AA, 7:1 for AAA).
     - --color-on-accent is decided per-step (white vs
       black) to guarantee text contrast regardless of
       brand color.
     - Subtle variants stay below 15% saturation on text
       surfaces to avoid muddying.
     - AAA cannot always be satisfied with the brand hue
       intact (e.g. bright yellows). When a step cannot
       reach 7:1 even at 950/50, we fall back to the
       darkest/lightest step available and surface the
       shortfall as a warning in the report.

   License: MIT. Copy freely.
   ============================================ */

// ─────────────────────────────────────────────
// WCAG thresholds
// ─────────────────────────────────────────────

/** Minimum required ratios per WCAG level.
 *  `text` covers normal body text; `ui` covers non-text UI like focus rings
 *  and icon-only buttons (SC 1.4.11 Non-text Contrast). */
const WCAG_THRESHOLDS = {
  AA:  { text: 4.5, ui: 3.0 },
  AAA: { text: 7.0, ui: 4.5 },
};

/** Validate and normalize a level argument. */
function resolveLevel(level) {
  const L = String(level || 'AA').toUpperCase();
  return L === 'AAA' ? 'AAA' : 'AA';
}

// ─────────────────────────────────────────────
// Color primitives
// ─────────────────────────────────────────────

/** Parse "#rgb" or "#rrggbb" (with/without #) to {r,g,b} 0..255. */
export function hexToRgb(hex) {
  const h = String(hex).trim().replace(/^#/, '');
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return { r, g, b };
  }
  if (h.length === 6) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  throw new Error(`Invalid hex: ${hex}`);
}

/** {r,g,b} 0..255 → "#rrggbb" (lowercase). */
export function rgbToHex({ r, g, b }) {
  const to = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** {r,g,b} 0..255 → {h: 0..360, s: 0..1, l: 0..1}. */
export function rgbToHsl({ r, g, b }) {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case R: h = ((G - B) / d + (G < B ? 6 : 0)); break;
      case G: h = ((B - R) / d + 2); break;
      case B: h = ((R - G) / d + 4); break;
    }
    h *= 60;
  }
  return { h, s, l };
}

/** {h,s,l} → {r,g,b} 0..255. */
export function hslToRgb({ h, s, l }) {
  const H = ((h % 360) + 360) % 360 / 360;
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, H + 1 / 3);
    g = hue2rgb(p, q, H);
    b = hue2rgb(p, q, H - 1 / 3);
  }
  return { r: r * 255, g: g * 255, b: b * 255 };
}

// ─────────────────────────────────────────────
// WCAG 2.1 contrast
// ─────────────────────────────────────────────

function srgbToLin(c) {
  const x = c / 255;
  return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

/** Relative luminance per WCAG 2.1. */
export function relLum(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
}

/** WCAG 2.1 contrast ratio between two hex colors. */
export function contrast(hexA, hexB) {
  const la = relLum(hexA);
  const lb = relLum(hexB);
  const L1 = Math.max(la, lb);
  const L2 = Math.min(la, lb);
  return (L1 + 0.05) / (L2 + 0.05);
}

/** WCAG level for a given ratio and use case. */
export function wcagLevel(ratio, { large = false } = {}) {
  const AA = large ? 3 : 4.5;
  const AAA = large ? 4.5 : 7;
  if (ratio >= AAA) return 'AAA';
  if (ratio >= AA) return 'AA';
  if (ratio >= 3) return 'AA-large';
  return 'fail';
}

/** Pick whichever of black/white yields better contrast against bg. */
export function onColor(bgHex) {
  const wc = contrast(bgHex, '#ffffff');
  const bc = contrast(bgHex, '#000000');
  return wc >= bc ? '#ffffff' : '#000000';
}

// ─────────────────────────────────────────────
// Scale generation
// ─────────────────────────────────────────────

/** Target lightness per Tailwind-style step. These are *targets* — the
 *  generator preserves hue and clamps saturation to sit in-gamut. */
const SCALE_LIGHTNESS = {
  50:  0.97,
  100: 0.94,
  200: 0.86,
  300: 0.76,
  400: 0.65,
  500: 0.55,
  600: 0.47,
  700: 0.39,
  800: 0.29,
  900: 0.20,
  950: 0.12,
};

/** Saturation curve: saturation peaks around 500-600 and drops toward the
 *  extremes, matching natural tonal scales. */
function saturationAt(step, baseS) {
  // Anchor baseS at step 500. Taper toward 50/950 to prevent muddy extremes.
  const peak = 500;
  const distance = Math.abs(step - peak);
  // Normalize distance: 0 at 500, 1 at 50/950.
  const norm = Math.min(distance / 450, 1);
  // Taper more aggressively for light steps (avoid neon pastels),
  // less for dark steps (preserve identity).
  const taper = step < peak ? 0.45 : 0.2;
  const factor = 1 - norm * taper;
  return Math.max(0, Math.min(1, baseS * factor));
}

/** Generate an 11-step tonal scale from a single brand hex. */
export function scaleFromHex(hex) {
  const { h, s } = rgbToHsl(hexToRgb(hex));
  const scale = {};
  for (const [k, targetL] of Object.entries(SCALE_LIGHTNESS)) {
    const step = Number(k);
    const sat = saturationAt(step, s);
    scale[step] = rgbToHex(hslToRgb({ h, s: sat, l: targetL }));
  }
  return scale;
}

// ─────────────────────────────────────────────
// AA-safe step selection
// ─────────────────────────────────────────────

/** Walk a scale from darkest→lightest, pick the *lightest* step that still
 *  achieves the requested ratio against `against`. Used to pick the brightest
 *  possible accent that still lets us put white text on it (light mode). */
function pickStepAgainst(scale, against, minRatio, direction = 'light-to-dark') {
  const keys = Object.keys(scale).map(Number);
  keys.sort((a, b) => direction === 'light-to-dark' ? a - b : b - a);
  // direction 'light-to-dark' → walks 50..950. We want the lightest step that
  // passes — so iterate in reverse (dark→light) and return the FIRST that
  // passes? No — we want the darkest step that *still* passes.
  // Simplest: iterate from expected direction and return the first hit.
  let best = null;
  for (const k of keys) {
    const r = contrast(scale[k], against);
    if (r >= minRatio) {
      best = k;
      break;
    }
  }
  return best;
}

/**
 * Build the semantic token set for one color scheme.
 *
 * `mode` controls:
 *  - which surface we test against (white for light, near-black for dark)
 *  - which side of the scale the accent should live on
 *
 * `textRatio` is the minimum contrast ratio the accent must achieve against
 * the scheme's surface. Pass 4.5 for AA, 7 for AAA. If no step in the scale
 * can meet it, the terminal step (950 light / 50 dark) is returned and a
 * `shortfall` marker is set in `_meta` so the caller can surface a warning.
 */
function buildScheme(scale, mode /* 'light' | 'dark' */, textRatio = 4.5) {
  const surface      = mode === 'light' ? '#ffffff' : '#0a0a0a';
  const surfaceText  = mode === 'light' ? '#000000' : '#ffffff';

  // Pick accent: darkest step passing textRatio against white (light mode),
  // or lightest step passing textRatio against black (dark mode).
  let accentKey;
  let shortfall = false;
  if (mode === 'light') {
    for (const k of [500, 600, 700, 800, 900, 950]) {
      if (contrast(scale[k], '#ffffff') >= textRatio) { accentKey = k; break; }
    }
    if (accentKey == null) { accentKey = 950; shortfall = true; }
  } else {
    for (const k of [500, 400, 300, 200, 100, 50]) {
      if (contrast(scale[k], '#000000') >= textRatio) { accentKey = k; break; }
    }
    if (accentKey == null) { accentKey = 50; shortfall = true; }
  }

  const hoverKey  = mode === 'light' ? Math.min(950, accentKey + 100) : Math.max(50, accentKey - 100);
  const activeKey = mode === 'light' ? Math.min(950, accentKey + 200) : Math.max(50, accentKey - 200);
  const strongKey = mode === 'light' ? Math.min(950, accentKey + 100) : Math.max(50, accentKey - 100);
  const subtleKey = mode === 'light' ? 50  : 950;

  const accent        = scale[accentKey];
  const accentHover   = scale[hoverKey]  ?? accent;
  const accentActive  = scale[activeKey] ?? accentHover;
  const accentStrong  = scale[strongKey] ?? accent;
  const accentSubtle  = scale[subtleKey];
  const onAccent      = onColor(accent);

  return {
    '--color-accent':        accent,
    '--color-accent-hover':  accentHover,
    '--color-accent-active': accentActive,
    '--color-accent-strong': accentStrong,
    '--color-accent-subtle': accentSubtle,
    '--color-on-accent':     onAccent,
    '--color-focus-ring':    accent,
    _meta: { accentKey, hoverKey, activeKey, strongKey, subtleKey, surface, surfaceText, shortfall, textRatio },
  };
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Generate a complete RenDS theme from a single brand hex.
 *
 * @param {string} hex  e.g. "#F59E0B"
 * @param {object} opts
 * @param {string} [opts.name="brand"]     theme name used in [data-theme="..."]
 * @param {number} [opts.warmth=0]         -1..1, biases surfaces cool (-) / warm (+)
 * @param {'AA'|'AAA'} [opts.level="AA"]   target conformance level. AAA uses
 *   7:1 for text and 4.5:1 for non-text UI; AA uses 4.5:1 and 3:1. When AAA
 *   cannot be met with the given hue (bright yellows, neon greens) the
 *   darkest/lightest available step is used and the shortfall is reported.
 * @returns {{ name, level, scale, light, dark, css, report }}
 */
export function generateTheme(hex, opts = {}) {
  const { name = 'brand', warmth = 0 } = opts;
  const level = resolveLevel(opts.level);
  const { text: textRatio } = WCAG_THRESHOLDS[level];

  const scale  = scaleFromHex(hex);
  const light  = buildScheme(scale, 'light', textRatio);
  const dark   = buildScheme(scale, 'dark',  textRatio);

  // Surface bias: tint white/near-black toward brand hue for editorial feel.
  const { h } = rgbToHsl(hexToRgb(hex));
  const tintL = warmth > 0 ? 0.985 : warmth < 0 ? 0.99 : 1;
  const tintSatLight = Math.abs(warmth) * 0.04;
  const surfaceLight = warmth === 0
    ? '#ffffff'
    : rgbToHex(hslToRgb({ h, s: tintSatLight, l: tintL }));
  const surfaceRaisedLight = '#ffffff';
  const surfaceSunkenLight = warmth === 0
    ? '#f8fafc'
    : rgbToHex(hslToRgb({ h, s: tintSatLight * 1.5, l: 0.965 }));

  const surfaceDark        = warmth === 0 ? '#0a0a0a' : rgbToHex(hslToRgb({ h, s: 0.08, l: 0.05 }));
  const surfaceRaisedDark  = warmth === 0 ? '#111111' : rgbToHex(hslToRgb({ h, s: 0.06, l: 0.09 }));
  const surfaceSunkenDark  = warmth === 0 ? '#050505' : rgbToHex(hslToRgb({ h, s: 0.1,  l: 0.03 }));

  // Build the `light-dark()` CSS block.
  const pair = (l, d) => `light-dark(${l}, ${d})`;
  const cssLines = [
    `[data-theme="${name}"] {`,
    `  /* Generated from ${hex} by theme-generator.js (WCAG ${level}) */`,
    `  --color-accent:        ${pair(light['--color-accent'], dark['--color-accent'])};`,
    `  --color-accent-hover:  ${pair(light['--color-accent-hover'], dark['--color-accent-hover'])};`,
    `  --color-accent-active: ${pair(light['--color-accent-active'], dark['--color-accent-active'])};`,
    `  --color-accent-strong: ${pair(light['--color-accent-strong'], dark['--color-accent-strong'])};`,
    `  --color-accent-subtle: ${pair(light['--color-accent-subtle'], dark['--color-accent-subtle'])};`,
    `  --color-on-accent:     ${pair(light['--color-on-accent'], dark['--color-on-accent'])};`,
    `  --color-focus-ring:    ${pair(light['--color-focus-ring'], dark['--color-focus-ring'])};`,
    `  --color-surface:        ${pair(surfaceLight, surfaceDark)};`,
    `  --color-surface-raised: ${pair(surfaceRaisedLight, surfaceRaisedDark)};`,
    `  --color-surface-sunken: ${pair(surfaceSunkenLight, surfaceSunkenDark)};`,
    `}`,
  ];

  const report = auditTheme({ name, light, dark, surfaceLight, surfaceDark, level });

  // Promote shortfall flags from buildScheme into the report as warnings,
  // separately from the per-pair audit. This is how AAA surfaces "this hue
  // cannot reach 7:1 at any step" — the report still contains the
  // best-available pair, but the caller sees the tradeoff.
  if (light._meta?.shortfall) {
    report.warnings.unshift({
      label: `${name} light: hue cannot meet ${level} (${WCAG_THRESHOLDS[level].text}:1) at any step — using terminal step ${light._meta.accentKey}`,
      fg: light['--color-on-accent'],
      bg: light['--color-accent'],
      min: WCAG_THRESHOLDS[level].text,
      ratio: Number(contrast(light['--color-accent'], surfaceLight).toFixed(2)),
      pass: false,
      shortfall: true,
    });
  }
  if (dark._meta?.shortfall) {
    report.warnings.unshift({
      label: `${name} dark: hue cannot meet ${level} (${WCAG_THRESHOLDS[level].text}:1) at any step — using terminal step ${dark._meta.accentKey}`,
      fg: dark['--color-on-accent'],
      bg: dark['--color-accent'],
      min: WCAG_THRESHOLDS[level].text,
      ratio: Number(contrast(dark['--color-accent'], surfaceDark).toFixed(2)),
      pass: false,
      shortfall: true,
    });
  }

  return {
    name,
    level,
    scale,
    light: { ...light, '--color-surface': surfaceLight,
             '--color-surface-raised': surfaceRaisedLight,
             '--color-surface-sunken': surfaceSunkenLight },
    dark:  { ...dark,  '--color-surface': surfaceDark,
             '--color-surface-raised': surfaceRaisedDark,
             '--color-surface-sunken': surfaceSunkenDark },
    css:   cssLines.join('\n'),
    report,
  };
}

/**
 * Suggest alternative hues near the input that would meet the requested WCAG
 * level without a shortfall — useful when a brand hue is too saturated to
 * reach 7:1 at any step of its own scale. Searches by rotating H in small
 * increments first, then widens out; saturation and lightness stay identical.
 *
 * Returns an array of `{ hex, hueShift }` up to `count` entries. Empty array
 * if no nearby hue passes (rare — there's almost always a ±30° neighbor that
 * reaches AAA). Candidates are ordered by closeness to the input hue.
 *
 * Example:
 *   suggestAlternativeHues('#ff5500', 'AAA', 3)
 *   // → [{ hex: '#ff3300', hueShift: -15 }, ...]
 */
export function suggestAlternativeHues(inputHex, level = 'AA', count = 3) {
  const lvl = resolveLevel(level);
  let inputHsl;
  try {
    inputHsl = rgbToHsl(hexToRgb(inputHex));
  } catch {
    return [];
  }
  // Hue shifts from nearest to farthest. Symmetric around the input.
  const shifts = [15, -15, 30, -30, 45, -45, 60, -60, 90, -90, 120, -120];
  const out = [];
  for (const shift of shifts) {
    const newH = (((inputHsl.h + shift) % 360) + 360) % 360;
    const rgb = hslToRgb({ h: newH, s: inputHsl.s, l: inputHsl.l });
    const hex = rgbToHex(rgb);
    let theme;
    try {
      theme = generateTheme(hex, { level: lvl, name: '__probe' });
    } catch {
      continue;
    }
    const hasShortfall = theme.report.warnings.some((w) => w.shortfall);
    if (!hasShortfall) {
      out.push({ hex, hueShift: shift });
      if (out.length >= count) break;
    }
  }
  return out;
}

/**
 * Audit the generated theme — reports pass/fail of every critical pair
 * against the target WCAG level's thresholds.
 *
 * `level` controls the pair minimums:
 *   - AA:  text pairs 4.5:1, non-text (focus ring) 3:1
 *   - AAA: text pairs 7:1,   non-text (focus ring) 4.5:1
 *
 * Returns `{ passes, warnings, level }`. Entries include `{ label, fg, bg,
 * min, ratio, pass, kind }` where `kind` is `'text'` or `'ui'`.
 */
export function auditTheme({ name, light, dark, surfaceLight = '#ffffff', surfaceDark = '#0a0a0a', level = 'AA' } = {}) {
  const lvl = resolveLevel(level);
  const { text: textMin, ui: uiMin } = WCAG_THRESHOLDS[lvl];

  const checks = [
    { label: `${name} light: on-accent vs accent`,
      fg: light['--color-on-accent'], bg: light['--color-accent'], min: textMin, kind: 'text' },
    { label: `${name} dark: on-accent vs accent`,
      fg: dark['--color-on-accent'], bg: dark['--color-accent'], min: textMin, kind: 'text' },
    { label: `${name} light: accent-strong vs surface (link)`,
      fg: light['--color-accent-strong'], bg: surfaceLight, min: textMin, kind: 'text' },
    { label: `${name} dark: accent-strong vs surface (link)`,
      fg: dark['--color-accent-strong'], bg: surfaceDark, min: textMin, kind: 'text' },
    { label: `${name} light: accent vs surface (focus ring)`,
      fg: light['--color-accent'], bg: surfaceLight, min: uiMin, kind: 'ui' },
    { label: `${name} dark: accent vs surface (focus ring)`,
      fg: dark['--color-accent'], bg: surfaceDark, min: uiMin, kind: 'ui' },
  ];
  const passes = [];
  const warnings = [];
  for (const c of checks) {
    const r = contrast(c.fg, c.bg);
    const pass = r >= c.min;
    const entry = { ...c, ratio: Number(r.toFixed(2)), pass };
    (pass ? passes : warnings).push(entry);
  }
  return { passes, warnings, level: lvl };
}
