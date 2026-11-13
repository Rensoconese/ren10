import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');
const pkg = JSON.parse(read('package.json'));
const manifest = JSON.parse(read('custom-elements.json'));
const customData = JSON.parse(read('html-custom-data.json'));
const llms = read('llms.txt');
const declarations = manifest.modules.flatMap((module) => module.declarations);

/** Every tag registered by a shipped component script, found without parsing. */
function definedTags() {
  const tags = new Set();
  const visit = (dir) => {
    for (const entry of readdirSync(path.join(root, dir))) {
      const relative = `${dir}/${entry}`;
      if (statSync(path.join(root, relative)).isDirectory()) visit(relative);
      else if (entry.endsWith('.js') && !entry.includes('.test.')) {
        for (const match of read(relative).matchAll(/customElements\.define\(\s*'([a-z0-9-]+)'/g)) tags.add(match[1]);
      }
    }
  };
  visit('components');
  return [...tags].sort();
}

test('the committed discovery files are fresh', () => {
  const result = spawnSync(process.execPath, ['scripts/build-discovery-files.mjs', '--check'], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});

test('the package publishes the discovery files and points tools at the manifest', () => {
  assert.equal(pkg.customElements, 'custom-elements.json');
  for (const file of ['llms.txt', 'custom-elements.json', 'html-custom-data.json']) {
    assert.ok(pkg.files.includes(file), `${file} missing from package.json files`);
    assert.equal(pkg.exports[`./${file}`], `./${file}`);
  }
});

test('custom-elements.json and html-custom-data.json cover every defined ren-* tag', () => {
  const tags = definedTags();
  assert.deepEqual(declarations.map((declaration) => declaration.tagName).sort(), tags);
  assert.deepEqual(customData.tags.map((tag) => tag.name).sort(), tags);
  for (const module of manifest.modules) {
    assert.ok(existsSync(path.join(root, module.path)), module.path);
    for (const declaration of module.declarations) {
      assert.ok(module.exports.some((entry) => entry.kind === 'custom-element-definition' && entry.name === declaration.tagName));
    }
  }
});

test('element facts come from the component source and contract', () => {
  const dialog = declarations.find((declaration) => declaration.tagName === 'ren-dialog');
  assert.deepEqual(dialog.attributes.map((attribute) => attribute.name), ['alert', 'no-escape', 'open', 'size']);
  assert.deepEqual(dialog.events.map((event) => event.name), ['ren-close', 'ren-open']);
  assert.ok(dialog.members.some((member) => member.kind === 'method' && member.name === 'show'));
  assert.ok(dialog.cssProperties.some((property) => property.name === '--ren-dialog-backdrop'));
  assert.match(dialog.description, /components\/composites\/ren-dialog\/component\.md$/);

  // A subclass inherits its parent's API and points at its own contract.
  const alert = declarations.find((declaration) => declaration.tagName === 'ren-alert-dialog');
  assert.equal(alert.superclass.name, 'RenDialog');
  assert.deepEqual(alert.attributes, dialog.attributes);
  assert.match(alert.description, /ren-alert-dialog\/component\.md$/);

  // Helpers the contract does not document stay out of the public surface.
  const select = declarations.find((declaration) => declaration.tagName === 'ren-select');
  const members = select.members.map((member) => member.name);
  assert.ok(members.includes('selectValue') && members.includes('refresh'));
  assert.ok(!members.includes('setupARIA') && !members.includes('bindElements'));
  for (const declaration of declarations) {
    for (const attribute of declaration.attributes) assert.doesNotMatch(attribute.name, /^(aria-|role$|id$|class$)/);
  }
});

test('llms.txt links only to files that ship in the package', () => {
  assert.match(llms, /^# ren10\n\n> /);
  const links = [...llms.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1]);
  assert.ok(links.length > 60, `${links.length} links`);
  const shipped = spawnSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { cwd: root, encoding: 'utf8' });
  assert.equal(shipped.status, 0, shipped.stderr);
  const files = new Set(JSON.parse(shipped.stdout)[0].files.map((file) => file.path));
  for (const link of links) assert.ok(files.has(link), `llms.txt links to ${link}, which is not in the tarball`);
  assert.ok(llms.indexOf('ren-essentials.md') < llms.indexOf('ren-design.md'), 'essentials must come before the full contract');
});
