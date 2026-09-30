import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const readme = read('README.md');
const section = (heading) => {
  const start = readme.indexOf(`### ${heading}\n`);
  assert.notEqual(start, -1, `README must document ${heading}`);
  return readme.slice(start).split(/\n(?:### |---)/)[0];
};
const codeBlocks = (source, language) => [...source.matchAll(new RegExp('```' + language + '\\n([\\s\\S]*?)```', 'g'))].map((match) => match[1]);
const run = (command, args, cwd) => {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, `${command} ${args.join(' ')} failed:\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
};
const temporaryProject = (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ren10-installation-docs-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
};

// Check the actual CSS/JS dependency graph, not just the top-level filenames.
function assertImportsExist(file, seen = new Set()) {
  assert.ok(fs.existsSync(file), `Documented import is missing: ${file}`);
  if (seen.has(file)) return;
  seen.add(file);
  const source = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const imports = file.endsWith('.css')
    ? /@import\s+(?:url\()?['"](\.[^'"]+)['"]/g
    : /(?:from\s+|import\s*\(?\s*)['"](\.[^'"]+)['"]/g;
  for (const [, specifier] of source.matchAll(imports)) {
    assertImportsExist(path.resolve(path.dirname(file), specifier), seen);
  }
}

const quickStart = readme.split('## Quick Start\n')[1].split('\n### ')[0];
const quickStartHtml = codeBlocks(quickStart, 'html').join('\n');

function scaffoldQuickStart(directory) {
  const commands = codeBlocks(quickStart, 'bash')[0].split('\n').filter((line) => line.startsWith('npx ren10 '));
  assert.ok(commands.some((line) => line === 'npx ren10 init'));
  assert.ok(commands.some((line) => line === 'npx ren10 add button dialog tooltip'));
  for (const command of commands) {
    const args = command.slice('npx ren10 '.length).split(/\s+/);
    assert.ok(['init', 'add'].includes(args[0]), 'Only local CLI scaffold commands belong in this fixture');
    run(process.execPath, [path.join(root, 'cli/index.js'), ...args], directory);
  }
}

test('README Quick Start imports resolve in the actual CLI copy layout', (t) => {
  const directory = temporaryProject(t);
  scaffoldQuickStart(directory);
  const imports = [...quickStartHtml.matchAll(/(?:href|src)="(rends\/[^\"]+)"/g)];
  assert.ok(imports.length > 0, 'Quick Start must demonstrate loading the copied files');
  for (const [, specifier] of imports) assertImportsExist(path.join(directory, specifier));
  assert.ok(fs.existsSync(path.join(directory, 'rends/components/button/ren-button.css')));
});

test('README custom button example loads its optional enhancement module', () => {
  assert.match(quickStartHtml, /<button class="ren-btn"/);
  assert.match(quickStartHtml, /<ren-button\b/);
  assert.match(quickStartHtml, /<script type="module" src="rends\/components\/button\/ren-button\.js"><\/script>/);
});

test('README manual copy recipe copies real source files with a complete import graph', (t) => {
  const directory = temporaryProject(t);
  const recipe = codeBlocks(section('Manual install'), 'bash')[0];
  const copy = recipe.split('\n').find((line) => line.startsWith('cp '));
  assert.ok(copy, 'Manual install must include a copy command');
  const [, flag, ...arguments_] = copy.trim().split(/\s+/);
  assert.match(flag, /^-[rR]$/);
  const destination = arguments_.pop().replace(/^\.\//, '').replace(/\/$/, '');
  assert.equal(destination, 'my-project/rends');
  const target = path.join(directory, destination);
  fs.mkdirSync(target, { recursive: true });
  for (const source of arguments_) {
    assert.match(source, /^ren10\/[\w./-]+$/);
    const relative = source.slice('ren10/'.length);
    assert.ok(!relative.includes('..'), 'Manual copy sources must remain inside the source checkout');
    const sourceFile = path.join(root, relative);
    assert.ok(fs.existsSync(sourceFile), `Manual install references missing ${source}`);
    fs.cpSync(sourceFile, path.join(target, path.basename(relative)), { recursive: true });
  }
  assertImportsExist(path.join(target, 'index.css'));
  assertImportsExist(path.join(target, 'foundation.css'));
  assertImportsExist(path.join(target, 'components/primitives/ren-button/ren-button.js'));
  assertImportsExist(path.join(target, 'components/composites/ren-dialog/ren-dialog.js'));
  assertImportsExist(path.join(target, 'themes/appearance.css'));
});

test('README npm imports use exported package paths rather than copied CLI paths', () => {
  const install = section('npm install');
  const imports = [...codeBlocks(install, 'js').join('\n').matchAll(/import ['"](ren10[^'"]*)['"]/g)];
  assert.ok(imports.length >= 3, 'npm example must include foundation, button CSS, and optional button JS');
  for (const [, specifier] of imports) {
    const file = fileURLToPath(import.meta.resolve(specifier));
    assertImportsExist(file);
  }
});

test('the ready-made theme guide loads shipped appearance CSS and selects a real preset', () => {
  const guide = read('docs/theming.html').split('id="ready-made"')[1].split('<!-- Theme Builder -->')[0];
  const snippets = [...guide.matchAll(/<code>([\s\S]*?)<\/code>/g)].map((match) => match[1].replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&amp;', '&')).join('\n');
  const links = [...snippets.matchAll(/href="rends\/([^\"]+)"/g)];
  assert.ok(links.length > 0);
  for (const [, file] of links) assertImportsExist(path.join(root, file));
  assert.match(snippets, /href="rends\/themes\/appearance\.css"/);
  const theme = snippets.match(/<html data-theme="([^\"]+)"/);
  assert.ok(theme, 'Linking appearance.css must be paired with selecting a data-theme preset');
  assert.ok(read('themes/appearance.css').includes(`[data-theme="${theme[1]}"]`));
  assert.doesNotMatch(guide, /themes\/(?:amber-editorial|cyber|minimal-mono)\.css/);
});

test('Astro installation docs disclose registry status and route to a local tarball fallback', () => {
  const guide = read('docs/astro.md');
  assert.match(guide, /E404/);
  assert.match(guide, /npm pack --workspace @ren10\/astro/);
  assert.match(guide, /npm pack --pack-destination/);
  assert.match(guide, /ren10-astro-0\.14\.0\.tgz/);
  assert.match(guide, /ren10-0\.14\.0\.tgz/);
  assert.match(guide, /npm owner/i);
  for (const file of ['README.md', 'packages/astro/README.md', 'starters/astro/README.md']) {
    assert.match(read(file), /E404/, `${file} must not present registry installation as available`);
    assert.match(read(file), /docs\/astro\.md/, `${file} must link the fallback guide`);
  }
});

test('theme guide scopes component overrides directly and applies page themes at the root', () => {
  const guide = read('docs/theming.html');
  const multiTheme = guide.split('id="multi"')[1].split('<!-- Export -->')[0];
  assert.match(multiTheme, /document\.documentElement\.dataset\.theme = routeConfig\.theme/);
  assert.doesNotMatch(multiTheme, /Override at any ancestor/);
  const scoped = guide.split('Level 3')[1].split('<div class="dx-callout">')[0];
  assert.match(scoped, /--ren-btn-radius: var\(--radius-full\)/);
  assert.match(multiTheme, /browser verification/);
});
