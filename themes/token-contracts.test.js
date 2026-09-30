import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import postcss from 'postcss';

import { auditTheme, contrast, generateTheme } from './theme-generator.js';

const css = (path) => postcss.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const primitives = css('../tokens/primitives/colors.css');
const semantics = css('../tokens/semantic/colors.css');
const components = css('../tokens/component/tokens.css');
const appearance = css('./appearance.css');
const buttons = css('../components/primitives/ren-button/ren-button.css');
const registrations = css('../tokens/registered-properties.css');

function declarations(sheet, matches) {
  const values = {};
  sheet.walkRules((rule) => {
    if (matches(rule)) rule.walkDecls((decl) => { values[decl.prop] = decl.value; });
  });
  return values;
}

const rootDeclarations = (sheet) => declarations(sheet, (rule) => rule.selector === ':root');
const presetNames = [];
appearance.walkRules((rule) => {
  const match = rule.selector.match(/^\[data-theme="([a-z-]+)"\]$/);
  if (match && !['light', 'dark'].includes(match[1])) presetNames.push(match[1]);
});

// These are source-level numerical checks for a theme on :root. Nested theme
// inheritance and actual computed styles belong to the browser regression suite.
function rootTokens(preset) {
  return {
    ...rootDeclarations(primitives),
    ...rootDeclarations(semantics),
    ...declarations(components, (rule) => rule.selector === ':where(:root, [data-theme])'),
    ...declarations(appearance, (rule) => rule.selector === `[data-theme="${preset}"]`),
  };
}

function resolve(value, tokens, mode, seen = new Set()) {
  const substituted = value.replace(/var\((--[\w-]+)\)/g, (_, name) => {
    assert.ok(!seen.has(name), `circular token ${name}`);
    assert.ok(tokens[name], `undefined token ${name}`);
    return resolve(tokens[name], tokens, mode, new Set([...seen, name]));
  });
  return substituted.replace(/light-dark\((#[\da-f]+),\s*(#[\da-f]+)\)/gi,
    (_, light, dark) => mode === 'light' ? light : dark).trim();
}

function buttonStyle(variant, state) {
  const values = {};
  for (const current of ['default', 'hover', 'active']) {
    if (current === 'active' && state !== 'active') break;
    if (current === 'hover' && state === 'default') break;
    const suffix = current === 'default' ? '' : `:${current}:not(:disabled):not([aria-disabled="true"])`;
    Object.assign(values, declarations(buttons, (rule) => rule.selectors.includes(`.ren-btn-${variant}${suffix}`)));
  }
  return values;
}

const surfaces = ['--color-surface', '--color-surface-raised', '--color-surface-sunken', '--color-surface-overlay'];
const controlBackgrounds = [...surfaces, '--color-input-bg', '--color-input-bg-hover', '--color-fill', '--color-fill-hover', '--color-fill-active'];

for (const preset of ['default', ...presetNames]) {
  for (const mode of ['light', 'dark']) {
    const tokens = rootTokens(preset);
    const color = (name) => resolve(tokens[name], tokens, mode);
    test(`${preset}/${mode}: interactive border reaches 3:1 on supported neutral backgrounds`, () => {
      const border = color('--color-border-interactive');
      for (const background of controlBackgrounds) {
        const ratio = contrast(border, color(background));
        assert.ok(ratio >= 3, `${border} against ${background} (${color(background)}): ${ratio.toFixed(3)}:1`);
      }
    });
    for (const variant of ['primary', 'danger', 'outline', 'secondary', 'ghost', 'link']) {
      for (const state of ['default', 'hover', 'active']) {
        test(`${preset}/${mode}: ${variant} ${state} text reaches 4.5:1`, () => {
          const style = buttonStyle(variant, state);
          const foreground = resolve(style.color, tokens, mode);
          const background = resolve(style['background-color'], tokens, mode);
          const backgrounds = background === 'transparent' ? surfaces.map(color) : [background];
          for (const adjacent of backgrounds) {
            const ratio = contrast(foreground, adjacent);
            assert.ok(ratio >= 4.5, `${foreground} on ${adjacent}: ${ratio.toFixed(3)}:1`);
          }
        });
      }
    }
  }
}

test('rem spacing and radius stay unregistered to preserve cross-engine scaling', () => {
  const ordinary = { ...rootDeclarations(css('../tokens/primitives/spacing.css')), ...rootDeclarations(css('../tokens/primitives/radius.css')) };
  const lengths = [];
  registrations.walkAtRules('property', (rule) => {
    const descriptors = {};
    rule.walkDecls((decl) => { descriptors[decl.prop] = decl.value; });
    if (!descriptors.syntax.includes('<length>')) return;
    lengths.push(rule.params);
    assert.match(descriptors['initial-value'], /^\d+(?:\.\d+)?px$/, `${rule.params}: initial-value must be computationally independent`);
    assert.match(ordinary[rule.params], /^\d+(?:\.\d+)?rem$/, `${rule.params}: ordinary assignment should scale with root font size`);
    assert.equal(parseFloat(descriptors['initial-value']), parseFloat(ordinary[rule.params]) * 16);
  });
  assert.deepEqual(lengths, []);
  for (const name of ['--radius-lg', '--radius-md', '--radius-sm', '--space-1', '--space-2', '--space-4']) {
    assert.match(ordinary[name], /^\d+(?:\.\d+)?rem$/);
  }
});

for (const mode of ['light', 'dark']) {
  for (const state of ['hover', 'active']) {
    test(`generated-theme audit detects ${mode} ${state} text contrast failures`, () => {
      const theme = generateTheme('#007aff', { name: 'audit-probe' });
      theme[mode][`--color-accent-${state}`] = theme[mode]['--color-on-accent'];
      const report = auditTheme(theme);
      assert.ok(report.warnings.some((warning) => warning.label.includes(`${mode}: on-accent vs accent-${state}`)),
        'interaction states must appear in the audit, not only the base accent');
    });
  }
}

for (const accent of ['#d95326', '#00ff00', '#59a6a6', '#6c59a6', '#4000ff', '#ac26d9', '#ff0040']) {
  for (const mode of ['light', 'dark']) {
    test(`${accent}/${mode}: generated accent ramp retains a readable fixed foreground`, () => {
      const scheme = generateTheme(accent)[mode];
      for (const state of ['', '-hover', '-active']) {
        const ratio = contrast(scheme['--color-on-accent'], scheme[`--color-accent${state}`]);
        assert.ok(ratio >= 4.5, `accent${state}: ${ratio.toFixed(3)}:1`);
      }
    });
  }
}
