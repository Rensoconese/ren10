import assert from 'node:assert/strict';
import test from 'node:test';

import { generateThemeFromReference, validateReferenceTheme } from './reference-theme.js';

const reference = {
  schemaVersion: 1,
  name: 'editorial-reference',
  source: { kind: 'url', label: 'Editorial reference', uri: 'https://example.com' },
  mode: 'light',
  level: 'AA',
  colors: {
    accent: '#e4b11b',
    background: '#f6f1e8',
    surface: '#ffffff',
    text: '#d0c8bd',
    mutedText: '#b8afa3'
  },
  typography: { fontSans: 'Inter, system-ui, sans-serif', fontDisplay: 'Georgia, serif' },
  density: 'spacious',
  shape: 'sharp',
  elevation: 'flat',
  motion: 'quiet'
};

test('generates a reference-derived semantic theme and repairs inaccessible observations', () => {
  const theme = generateThemeFromReference(reference);
  assert.deepEqual(theme.attributes, {
    'data-theme': 'editorial-reference',
    'data-density': 'spacious',
    'data-shape': 'sharp',
  });
  assert.equal(theme.report.warnings.length, 0);
  assert.ok(theme.report.repairs.some((repair) => repair.token === 'text'));
  assert.ok(theme.report.repairs.some((repair) => repair.token === 'accent'));
  assert.match(theme.css, /--color-accent:/);
  assert.match(theme.css, /--font-display: Georgia, serif/);
  assert.doesNotMatch(theme.css, /\.ren-card|display:\s*(?:flex|grid)/);
});

test('rejects malformed and unsafe visual reference specifications', () => {
  assert.throws(() => validateReferenceTheme({}), /schemaVersion/);
  assert.throws(() => generateThemeFromReference({ ...reference, colors: { accent: 'red' } }), /six-digit hex/);
  assert.throws(() => generateThemeFromReference({ ...reference, typography: { fontSans: 'Inter; color: red' } }), /unsafe CSS/);
});
