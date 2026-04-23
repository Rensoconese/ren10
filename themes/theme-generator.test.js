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

console.log(`\n─────────────────────────────────────────────`);
console.log(`${PASS} pass, ${FAIL} fail`);
process.exit(FAIL === 0 ? 0 : 1);
