import assert from 'node:assert/strict';
import test from 'node:test';
import postcss from 'postcss';

import { generateThemeFromReference, validateReferenceTheme } from './reference-theme.js';
import { contrast } from './theme-generator.js';

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
  assert.match(theme.css, /--font-heading: Georgia, serif/);
  assert.doesNotMatch(theme.css, /\.ren-card|display:\s*(?:flex|grid)/);
});

test('rejects malformed and unsafe visual reference specifications', () => {
  assert.throws(() => validateReferenceTheme({}), /schemaVersion/);
  assert.throws(() => generateThemeFromReference({ ...reference, colors: { accent: 'red' } }), /six-digit hex/);
  assert.throws(() => generateThemeFromReference({ ...reference, typography: { fontSans: 'Inter; color: red' } }), /unsafe CSS/);
});

test('maps visual-reference choices to the existing body, card, heading and motion token contracts', () => {
  const theme = generateThemeFromReference(reference);
  assert.equal(theme.tokens['--color-surface'], reference.colors.background);
  assert.equal(theme.tokens['--color-surface-raised'], reference.colors.surface);
  assert.equal(theme.tokens['--color-surface-overlay'], reference.colors.surface);
  assert.equal(theme.tokens['--font-heading'], reference.typography.fontDisplay);
  assert.equal(theme.tokens['--duration-normal'], '120ms');
  for (const deadToken of ['--color-bg', '--font-display', '--duration-base']) {
    assert.ok(!(deadToken in theme.tokens), `${deadToken} has no RenDS consumer`);
  }
});

for (const mode of ['light', 'dark']) {
  test(`reference ${mode} theme keeps its fixed label readable in every accent state`, () => {
    for (const accent of ['#00ff00', '#4000ff', '#ff0040']) {
      const theme = generateThemeFromReference({ ...reference, mode, colors: { accent } });
      for (const state of ['', '-hover', '-active']) {
        assert.ok(contrast(theme.tokens['--color-on-accent'], theme.tokens[`--color-accent${state}`]) >= 4.5, `${accent} accent${state}`);
      }
      for (const state of ['hover', 'active']) {
        assert.ok(theme.report.passes.some((check) => check.label === `onAccent/accent-${state}`), 'interaction checks must be reported');
      }
    }
  });
}

test('reference accent-active remains readable as the inherited link-hover foreground', () => {
  for (const mode of ['light', 'dark']) {
    for (const accent of ['#00ff00', '#4000ff', '#ff0040']) {
      const theme = generateThemeFromReference({ ...reference, mode, colors: { accent } });
      assert.ok(contrast(theme.tokens['--color-accent-active'], theme.tokens['--color-surface']) >= 4.5, `${accent}/${mode}: link hover`);
    }
  }
});

for (const motion of ['quiet', 'standard', 'expressive']) {
  test(`${motion} reference motion respects reduced-motion at the generated theme scope`, () => {
    const theme = generateThemeFromReference({ ...reference, motion });
    const sheet = postcss.parse(theme.css);
    const durations = Object.keys(theme.tokens).filter((name) => name.startsWith('--duration-'));
    for (const preference of ['no-preference', 'reduce']) {
      const effective = {};
      sheet.walkRules((rule) => {
        assert.equal(rule.selector, `[data-theme='${theme.name}']`);
        const media = rule.parent.type === 'atrule' && rule.parent.name === 'media' ? rule.parent.params : null;
        if (media && media !== `(prefers-reduced-motion: ${preference})`) return;
        rule.walkDecls((decl) => { effective[decl.prop] = decl.value; });
      });
      for (const name of durations) {
        assert.equal(effective[name], preference === 'reduce' ? '0ms' : theme.tokens[name], `${name}/${preference}`);
      }
    }
  });
}
