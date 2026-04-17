/**
 * RenDS — Type Scale Generator
 * Generates precise modular typography tokens from a base size and ratio.
 * Used by `rends init --scale <ratio>` and available as standalone utility.
 *
 * Ratios from musical intervals (same as holistic-rust Type Scale Node):
 *   Minor Second  (1.067)    Major Second  (1.125)
 *   Minor Third   (1.200)    Major Third   (1.250) ← default
 *   Perfect Fourth(1.333)    Aug. Fourth   (1.414)
 *   Perfect Fifth (1.500)    Minor Sixth   (1.600)
 *   Golden Ratio  (1.618)    Major Sixth   (1.667)
 *   Minor Seventh (1.778)    Major Seventh (1.875)
 *   Octave        (2.000)    Major Tenth   (2.500)
 *   Major Eleventh(2.667)    Major Twelfth (3.000)
 *   Double Octave (4.000)
 */

export const RATIOS = {
  'minor-second':  { name: 'Minor Second',  value: 1.067 },
  'major-second':  { name: 'Major Second',  value: 1.125 },
  'minor-third':   { name: 'Minor Third',   value: 1.200 },
  'major-third':   { name: 'Major Third',   value: 1.250 },
  'perfect-fourth':{ name: 'Perfect Fourth', value: 1.333 },
  'aug-fourth':    { name: 'Aug. Fourth',   value: 1.414 },
  'perfect-fifth': { name: 'Perfect Fifth', value: 1.500 },
  'minor-sixth':   { name: 'Minor Sixth',   value: 1.600 },
  'golden-ratio':  { name: 'Golden Ratio',  value: 1.618 },
  'major-sixth':   { name: 'Major Sixth',   value: 1.667 },
  'minor-seventh': { name: 'Minor Seventh', value: 1.778 },
  'major-seventh': { name: 'Major Seventh', value: 1.875 },
  'octave':        { name: 'Octave',        value: 2.000 },
  'major-tenth':   { name: 'Major Tenth',   value: 2.500 },
  'major-eleventh':{ name: 'Major Eleventh',value: 2.667 },
  'major-twelfth': { name: 'Major Twelfth', value: 3.000 },
  'double-octave': { name: 'Double Octave', value: 4.000 },
};

/**
 * Semantic step mapping — maps scale steps to RenDS --text-* tokens.
 * step -2 → --text-xs   (caption2, smallest)
 * step -1 → --text-sm   (caption, footnote)
 * step  0 → --text-base (body)
 * step  1 → --text-md   (headline, body-lg)
 * step  2 → --text-lg   (title-sm, lead)
 * step  3 → --text-xl   (title-md)
 * step  4 → --text-2xl  (title-lg)
 * step  5 → --text-3xl  (display-sm)
 * step  6 → --text-4xl  (display-md)
 * step  7 → --text-5xl  (display-lg)
 * step  8 → --text-6xl  (hero)
 * step  9 → --text-7xl  (hero-lg)
 * step 10 → --text-8xl  (display-hero)
 */
const STEP_TO_TOKEN = [
  { step: -2, token: '--text-xs',   label: 'caption2, smallest' },
  { step: -1, token: '--text-sm',   label: 'caption, footnote' },
  { step:  0, token: '--text-base', label: 'body' },
  { step:  1, token: '--text-md',   label: 'headline, body-lg' },
  { step:  2, token: '--text-lg',   label: 'title-sm, lead' },
  { step:  3, token: '--text-xl',   label: 'title-md' },
  { step:  4, token: '--text-2xl',  label: 'title-lg' },
  { step:  5, token: '--text-3xl',  label: 'display-sm' },
  { step:  6, token: '--text-4xl',  label: 'display-md' },
  { step:  7, token: '--text-5xl',  label: 'display-lg' },
  { step:  8, token: '--text-6xl',  label: 'hero' },
  { step:  9, token: '--text-7xl',  label: 'hero-lg' },
  { step: 10, token: '--text-8xl',  label: 'display-hero' },
];

/**
 * Compute a modular scale from base size and ratio.
 * @param {number} base - Base size in px (default: 16)
 * @param {number} ratio - Scale ratio (default: 1.25)
 * @param {number[]} stepRange - [min, max] step range (default: [-2, 10])
 * @returns {Array<{step: number, token: string, label: string, px: number, rem: string}>}
 */
export function computeScale(base = 16, ratio = 1.25, stepRange = [-2, 10]) {
  const result = [];
  for (let i = stepRange[0]; i <= stepRange[1]; i++) {
    const px = base * Math.pow(ratio, i);
    const rem = px / 16;
    const mapping = STEP_TO_TOKEN.find(s => s.step === i);
    result.push({
      step: i,
      token: mapping?.token || `--text-step-${i}`,
      label: mapping?.label || `step ${i}`,
      px: parseFloat(px.toFixed(2)),
      rem: parseFloat(rem.toFixed(4)),
    });
  }
  return result;
}

/**
 * Generate CSS custom properties for a type scale.
 * @param {object} options
 * @param {number} options.base - Base size in px
 * @param {string} options.ratio - Ratio key (e.g., 'major-third')
 * @param {boolean} options.fluid - Generate clamp() values
 * @param {number} options.fluidMinBase - Min base for fluid (px)
 * @param {string} options.fluidMinRatio - Min ratio key for fluid
 * @param {number} options.fluidMinVw - Min viewport width (px)
 * @param {number} options.fluidMaxVw - Max viewport width (px)
 * @returns {string} CSS content
 */
export function generateTypeScaleCSS(options = {}) {
  const {
    base = 16,
    ratio = 'major-third',
    fluid = false,
    fluidMinBase = 14,
    fluidMinRatio = 'minor-third',
    fluidMinVw = 320,
    fluidMaxVw = 1440,
  } = options;

  const ratioValue = RATIOS[ratio]?.value || parseFloat(ratio) || 1.25;
  const ratioInfo = RATIOS[ratio] || { name: ratio, value: ratioValue };
  const scale = computeScale(base, ratioValue);

  const lines = [];
  lines.push(`/* ============================================`);
  lines.push(`   RenDS — Primitive Typography Tokens`);
  lines.push(`   ============================================`);
  lines.push(`   Generated with modular scale:`);
  lines.push(`     Base:  ${base}px (${base / 16}rem)`);
  lines.push(`     Ratio: ${ratioInfo.name} (${ratioValue})`);
  lines.push(`   ============================================ */`);
  lines.push('');
  lines.push(':root {');
  lines.push('  /* ─── Font Families ─── */');
  lines.push(`  --font-sans:`);
  lines.push(`    -apple-system,`);
  lines.push(`    BlinkMacSystemFont,`);
  lines.push(`    'Segoe UI',`);
  lines.push(`    Roboto,`);
  lines.push(`    Oxygen,`);
  lines.push(`    Ubuntu,`);
  lines.push(`    Cantarell,`);
  lines.push(`    'Helvetica Neue',`);
  lines.push(`    Arial,`);
  lines.push(`    sans-serif,`);
  lines.push(`    'Apple Color Emoji',`);
  lines.push(`    'Segoe UI Emoji';`);
  lines.push('');
  lines.push(`  --font-mono:`);
  lines.push(`    'SF Mono',`);
  lines.push(`    ui-monospace,`);
  lines.push(`    'Cascadia Code',`);
  lines.push(`    'Source Code Pro',`);
  lines.push(`    Menlo,`);
  lines.push(`    Monaco,`);
  lines.push(`    Consolas,`);
  lines.push(`    'Courier New',`);
  lines.push(`    monospace;`);
  lines.push('');
  lines.push(`  /* ─── Font Sizes (${ratioInfo.name} scale: ${ratioValue}) ─── */`);

  if (fluid) {
    const minRatioValue = RATIOS[fluidMinRatio]?.value || parseFloat(fluidMinRatio) || 1.2;
    const minScale = computeScale(fluidMinBase, minRatioValue);

    scale.forEach((step, i) => {
      const minStep = minScale[i];
      if (!minStep) return;
      const minRem = minStep.rem;
      const maxRem = step.rem;
      const slope = (maxRem - minRem) / ((fluidMaxVw - fluidMinVw) / 16);
      const slopeVw = parseFloat((slope * 100).toFixed(4));
      const intercept = parseFloat((minRem - slope * (fluidMinVw / 16)).toFixed(4));
      const clampVal = `clamp(${minRem.toFixed(4)}rem, ${intercept}rem + ${slopeVw}vw, ${maxRem.toFixed(4)}rem)`;
      lines.push(`  ${step.token.padEnd(14)} ${clampVal}; /* ${step.px}px — ${step.label} */`);
    });
  } else {
    scale.forEach(step => {
      lines.push(`  ${step.token.padEnd(14)} ${step.rem}rem;${' '.repeat(Math.max(1, 8 - step.rem.toString().length))}/* ${step.px}px — ${step.label} */`);
    });
  }

  lines.push('');
  lines.push('  /* ─── Font Weights ─── */');
  lines.push('  --weight-thin:      100;');
  lines.push('  --weight-light:     300;');
  lines.push('  --weight-regular:   400;');
  lines.push('  --weight-medium:    500;');
  lines.push('  --weight-semibold:  600;');
  lines.push('  --weight-bold:      700;');
  lines.push('  --weight-extrabold: 800;');
  lines.push('  --weight-black:     900;');
  lines.push('');
  lines.push('  /* ─── Line Heights ─── */');
  lines.push('  --leading-none:    1;');
  lines.push('  --leading-tight:   1.2;   /* headlines, display */');
  lines.push('  --leading-snug:    1.375; /* titles */');
  lines.push('  --leading-normal:  1.5;   /* body text — default */');
  lines.push('  --leading-relaxed: 1.625; /* long-form reading */');
  lines.push('  --leading-loose:   1.75;  /* accessibility, large text */');
  lines.push('  --leading-double:  2;     /* very loose */');
  lines.push('');
  lines.push('  /* ─── Letter Spacing (Tracking) ─── */');
  lines.push('  --tracking-tighter: -0.05em;');
  lines.push('  --tracking-tight:   -0.025em;');
  lines.push('  --tracking-normal:  0;');
  lines.push('  --tracking-wide:    0.025em;');
  lines.push('  --tracking-wider:   0.05em;');
  lines.push('  --tracking-widest:  0.1em;');
  lines.push('');
  lines.push(`  /* ─── Scale Metadata ─── */`);
  lines.push(`  --type-ratio: ${ratioValue};`);
  lines.push('}');

  return lines.join('\n');
}

/**
 * List available ratios for CLI help.
 */
export function listRatios() {
  return Object.entries(RATIOS).map(([key, { name, value }]) => ({
    key,
    name,
    value,
  }));
}
