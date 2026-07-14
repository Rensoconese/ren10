#!/usr/bin/env node
/* ============================================
   RenDS — Theme generator + new-themes AA suite
   ============================================
   Run: node themes/theme-generator.test.js
   Exits 1 if any expected pair fails AA.
   ============================================ */

import {
  generateTheme,
  contrast,
  relLum,
  scaleFromHex,
} from './theme-generator.js';

let FAIL = 0;
let PASS = 0;

function check(label, ratio, min) {
  const ok = ratio >= min;
  const mark = ok ? '✓' : '✗';
  const fmt = ratio.toFixed(2).padStart(6);
  console.log(`  ${mark} ${fmt}:1  ${label}  (min ${min})`);
  if (ok) PASS++;
  else FAIL++;
}

console.log('\n== Generator: AA audit on brand hexes ==');
for (const hex of ['#F59E0B', '#D946EF', '#737373', '#8B5CF6', '#22D3EE', '#E11D48']) {
  const t = generateTheme(hex, { name: 'probe', warmth: 0 });
  console.log(`\n  brand ${hex}:`);
  check('light on-accent vs accent',        contrast(t.light['--color-accent'], t.light['--color-on-accent']), 4.5);
  check('dark  on-accent vs accent',        contrast(t.dark['--color-accent'],  t.dark['--color-on-accent']),  4.5);
  check('light strong-accent vs surface',   contrast(t.light['--color-accent-strong'], t.light['--color-surface']), 4.5);
  check('dark  strong-accent vs surface',   contrast(t.dark['--color-accent-strong'],  t.dark['--color-surface']),  4.5);
  check('light focus-ring vs surface (3:1)',contrast(t.light['--color-accent'], t.light['--color-surface']), 3);
  check('dark  focus-ring vs surface (3:1)',contrast(t.dark['--color-accent'],  t.dark['--color-surface']),  3);
}

// ─────────────────────────────────────────────
// Hand-written themes in appearance.css
// ─────────────────────────────────────────────

console.log('\n\n== Curated themes: AA audit ==');

const THEMES = {
  ocean: { light: { accent: '#0066CC', 'accent-strong': '#0052A3', 'on-accent': '#FFFFFF', surface: '#F8FAFC' }, dark: { accent: '#4DA3FF', 'accent-strong': '#6BB3FF', 'on-accent': '#000000', surface: '#0A0F1A' } },
  forest: { light: { accent: '#16A34A', 'accent-strong': '#15803D', 'on-accent': '#000000', surface: '#FAFDF7' }, dark: { accent: '#4ADE80', 'accent-strong': '#86EFAC', 'on-accent': '#000000', surface: '#0A120A' } },
  sunset: { light: { accent: '#EA580C', 'accent-strong': '#C2410C', 'on-accent': '#000000', surface: '#FFFBF5' }, dark: { accent: '#FB923C', 'accent-strong': '#FDBA74', 'on-accent': '#000000', surface: '#120E0A' } },
  rose: { light: { accent: '#E11D48', 'accent-strong': '#BE123C', 'on-accent': '#FFFFFF', surface: '#FFFBFC' }, dark: { accent: '#FB7185', 'accent-strong': '#FDA4AF', 'on-accent': '#000000', surface: '#120A0C' } },
  slate: { light: { accent: '#334155', 'accent-strong': '#1E293B', 'on-accent': '#FFFFFF', surface: '#FFFFFF' }, dark: { accent: '#CBD5E1', 'accent-strong': '#E2E8F0', 'on-accent': '#0F172A', surface: '#0F172A' } },
  purple: { light: { accent: '#7C3AED', 'accent-strong': '#6D28D9', 'on-accent': '#FFFFFF', surface: '#FAFAFF' }, dark: { accent: '#A78BFA', 'accent-strong': '#C4B5FD', 'on-accent': '#000000', surface: '#0C0A14' } },
  'amber-editorial': {
    light: {
      accent:        '#85590F',
      'accent-strong': '#5A3D0C',
      'on-accent':   '#FFFFFF',
      surface:       '#FBF8F3',
    },
    dark: {
      accent:        '#F6A723',
      'accent-strong': '#F0B95C',
      'on-accent':   '#000000',
      surface:       '#0E0D0C',
    },
  },
  'cyber': {
    light: {
      accent:        '#BF18D8',
      'accent-strong':'#9C17B0',
      'on-accent':   '#FFFFFF',
      surface:       '#FAFAFB',
    },
    dark: {
      accent:        '#D42CED',
      'accent-strong':'#D862E9',
      'on-accent':   '#000000',
      surface:       '#0B0B10',
    },
  },
  'minimal-mono': {
    light: {
      accent:        '#171717',
      'accent-strong':'#171717',
      'on-accent':   '#FFFFFF',
      surface:       '#FFFFFF',
    },
    dark: {
      accent:        '#F5F5F5',
      'accent-strong':'#FAFAFA',
      'on-accent':   '#000000',
      surface:       '#0A0A0A',
    },
  },
};

for (const [name, t] of Object.entries(THEMES)) {
  console.log(`\n  ${name}:`);
  check('light on-accent vs accent',      contrast(t.light['on-accent'], t.light.accent),    4.5);
  check('dark  on-accent vs accent',      contrast(t.dark['on-accent'],  t.dark.accent),     4.5);
  check('light link (strong) vs surface', contrast(t.light['accent-strong'], t.light.surface), 4.5);
  check('dark  link (strong) vs surface', contrast(t.dark['accent-strong'],  t.dark.surface),  4.5);
  check('light focus vs surface (3:1)',   contrast(t.light.accent, t.light.surface), 3);
  check('dark  focus vs surface (3:1)',   contrast(t.dark.accent,  t.dark.surface),  3);
}

console.log('\n\n== AAA scoped pairs ==');
for (const scheme of ['light', 'dark']) {
  const aaa = scheme === 'light'
    ? { text: '#111111', surface: '#FFFFFF', accent: '#111111', onAccent: '#FFFFFF' }
    : { text: '#FFFFFF', surface: '#000000', accent: '#FFFFFF', onAccent: '#000000' };
  check(`${scheme} AAA text vs surface`, contrast(aaa.text, aaa.surface), 7);
  check(`${scheme} AAA on-accent vs accent`, contrast(aaa.onAccent, aaa.accent), 7);
}

console.log(`\n─────────────────────────────────────────────`);
console.log(`${PASS} pass, ${FAIL} fail`);
process.exit(FAIL === 0 ? 0 : 1);
