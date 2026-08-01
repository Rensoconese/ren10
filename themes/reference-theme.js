import { contrast, generateTheme, hexToRgb, onColor, rgbToHex } from './theme-generator.js';

const MODES = new Set(['light', 'dark']);
const LEVELS = new Set(['AA', 'AAA']);
const DENSITIES = new Set(['comfortable', 'compact', 'spacious']);
const SHAPES = new Set(['rounded', 'sharp', 'pill']);
const ELEVATIONS = new Set(['flat', 'subtle', 'layered']);
const MOTIONS = new Set(['quiet', 'standard', 'expressive']);
const HEX = /^#[0-9a-f]{6}$/i;

const ELEVATION_TOKENS = {
  flat: ['none', 'none', 'none'],
  subtle: ['0 1px 2px rgb(0 0 0 / 0.06)', '0 4px 12px rgb(0 0 0 / 0.08)', '0 12px 28px rgb(0 0 0 / 0.1)'],
  layered: ['0 2px 6px rgb(0 0 0 / 0.1)', '0 10px 24px rgb(0 0 0 / 0.14)', '0 24px 56px rgb(0 0 0 / 0.18)'],
};

const MOTION_TOKENS = {
  quiet: ['80ms', '120ms', '180ms'],
  standard: ['120ms', '200ms', '320ms'],
  expressive: ['160ms', '280ms', '480ms'],
};

export function generateThemeFromReference(input) {
  const spec = validateReferenceTheme(input);
  const level = spec.level ?? 'AA';
  const textMinimum = level === 'AAA' ? 7 : 4.5;
  const base = generateTheme(spec.colors.accent, { name: spec.name, level });
  const scheme = base[spec.mode];
  const background = spec.colors.background ?? scheme['--color-surface'];
  const surface = spec.colors.surface ?? background;
  const repairs = [];

  const text = accessibleColor(spec.colors.text ?? scheme._meta.surfaceText, [background, surface], textMinimum, 'text', repairs);
  const mutedFallback = mix(text, background, spec.mode === 'light' ? 0.28 : 0.38);
  const mutedText = accessibleColor(spec.colors.mutedText ?? mutedFallback, [background, surface], textMinimum, 'mutedText', repairs);
  const accent = accessibleAccent(base.scale, spec.mode, background, textMinimum, repairs, spec.colors.accent);
  const onAccent = onColor(accent);
  const border = mix(text, surface, spec.mode === 'light' ? 0.82 : 0.72);
  const elevation = ELEVATION_TOKENS[spec.elevation ?? 'subtle'];
  const motion = MOTION_TOKENS[spec.motion ?? 'standard'];
  const fontSans = safeFont(spec.typography?.fontSans ?? 'system-ui, sans-serif', 'typography.fontSans');
  const fontDisplay = safeFont(spec.typography?.fontDisplay ?? fontSans, 'typography.fontDisplay');

  const tokens = {
    '--color-bg': background,
    '--color-surface': surface,
    '--color-surface-raised': mix(surface, spec.mode === 'light' ? '#ffffff' : '#000000', 0.16),
    '--color-surface-sunken': mix(surface, spec.mode === 'light' ? '#000000' : '#ffffff', 0.05),
    '--color-text': text,
    '--color-text-muted': mutedText,
    '--color-border': border,
    '--color-accent': accent,
    '--color-accent-hover': mix(accent, spec.mode === 'light' ? '#000000' : '#ffffff', 0.12),
    '--color-accent-active': mix(accent, spec.mode === 'light' ? '#000000' : '#ffffff', 0.2),
    '--color-accent-strong': accent,
    '--color-accent-subtle': mix(accent, background, 0.86),
    '--color-on-accent': onAccent,
    '--color-focus-ring': accent,
    '--font-sans': fontSans,
    '--font-display': fontDisplay,
    '--shadow-sm': elevation[0],
    '--shadow-md': elevation[1],
    '--shadow-lg': elevation[2],
    '--duration-fast': motion[0],
    '--duration-base': motion[1],
    '--duration-slow': motion[2],
  };

  const checks = [
    pair('text/background', text, background, textMinimum),
    pair('text/surface', text, surface, textMinimum),
    pair('mutedText/background', mutedText, background, textMinimum),
    pair('onAccent/accent', onAccent, accent, textMinimum),
    pair('focus/background', accent, background, level === 'AAA' ? 4.5 : 3),
  ];

  return {
    schemaVersion: 1,
    name: spec.name,
    source: spec.source,
    attributes: {
      'data-theme': spec.name,
      'data-density': spec.density ?? 'comfortable',
      'data-shape': spec.shape ?? 'rounded',
    },
    tokens,
    css: renderCss(spec, tokens),
    report: { level, passes: checks.filter((check) => check.pass), warnings: checks.filter((check) => !check.pass), repairs },
  };
}

export function validateReferenceTheme(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('reference theme must be an object');
  if (input.schemaVersion !== 1) throw new TypeError('schemaVersion must be 1');
  if (!/^[a-z][a-z0-9-]*$/.test(input.name ?? '')) throw new TypeError('name must be a lowercase theme slug');
  if (!input.source || !['image', 'url', 'description'].includes(input.source.kind) || !String(input.source.label ?? '').trim()) {
    throw new TypeError('source.kind and source.label are required');
  }
  if (!MODES.has(input.mode)) throw new TypeError('mode must be light or dark');
  if (input.level !== undefined && !LEVELS.has(input.level)) throw new TypeError('level must be AA or AAA');
  if (!input.colors || !HEX.test(input.colors.accent ?? '')) throw new TypeError('colors.accent must be a six-digit hex color');
  for (const [key, value] of Object.entries(input.colors)) {
    if (!['accent', 'background', 'surface', 'text', 'mutedText'].includes(key)) throw new TypeError(`unknown colors field: ${key}`);
    if (!HEX.test(value)) throw new TypeError(`colors.${key} must be a six-digit hex color`);
  }
  enumValue(input.density, DENSITIES, 'density');
  enumValue(input.shape, SHAPES, 'shape');
  enumValue(input.elevation, ELEVATIONS, 'elevation');
  enumValue(input.motion, MOTIONS, 'motion');
  return structuredClone(input);
}

function accessibleColor(requested, backgrounds, minimum, label, repairs) {
  if (backgrounds.every((background) => contrast(requested, background) >= minimum)) return requested.toLowerCase();
  const candidates = ['#000000', '#ffffff'];
  const replacement = candidates.sort((a, b) => minimumContrast(b, backgrounds) - minimumContrast(a, backgrounds))[0];
  repairs.push({ token: label, requested, replacement, reason: `contrast below ${minimum}:1` });
  return replacement;
}

function accessibleAccent(scale, mode, background, minimum, repairs, requested) {
  const steps = mode === 'light' ? [500, 600, 700, 800, 900, 950] : [500, 400, 300, 200, 100, 50];
  const replacement = steps.map((step) => scale[step]).find((color) => contrast(color, background) >= minimum) ?? onColor(background);
  if (replacement.toLowerCase() !== requested.toLowerCase()) {
    repairs.push({ token: 'accent', requested, replacement, reason: `contrast below ${minimum}:1 on reference background` });
  }
  return replacement;
}

function minimumContrast(color, backgrounds) {
  return Math.min(...backgrounds.map((background) => contrast(color, background)));
}

function mix(foreground, background, backgroundWeight) {
  const a = hexToRgb(foreground);
  const b = hexToRgb(background);
  return rgbToHex({
    r: a.r * (1 - backgroundWeight) + b.r * backgroundWeight,
    g: a.g * (1 - backgroundWeight) + b.g * backgroundWeight,
    b: a.b * (1 - backgroundWeight) + b.b * backgroundWeight,
  });
}

function pair(label, foreground, background, minimum) {
  const ratio = Number(contrast(foreground, background).toFixed(2));
  return { label, foreground, background, minimum, ratio, pass: ratio >= minimum };
}

function renderCss(spec, tokens) {
  const source = String(spec.source.label).replace(/[\r\n*]/g, ' ').trim();
  return [`/* RenDS visual reference: ${source} */`, `[data-theme='${spec.name}'] {`, `  color-scheme: ${spec.mode};`, ...Object.entries(tokens).map(([name, value]) => `  ${name}: ${value};`), `}`].join('\n');
}

function safeFont(value, label) {
  const font = String(value).trim();
  if (!font || /[;{}\r\n]/.test(font)) throw new TypeError(`${label} contains unsafe CSS characters`);
  return font;
}

function enumValue(value, allowed, label) {
  if (value !== undefined && !allowed.has(value)) throw new TypeError(`${label} has an unsupported value`);
}
