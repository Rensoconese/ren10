import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { validateV0Adapter } from './check-v0-adapter.mjs';

const repositoryRoot = path.resolve(import.meta.dirname, '..');
const version = JSON.parse(
  fs.readFileSync(path.join(repositoryRoot, 'package.json'), 'utf8'),
).version;

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ren10-v0-adapter-'));
  const skill = path.join(root, 'skills', 'rends');
  const starter = path.join(skill, 'assets', 'starter');

  writeJson(path.join(root, 'package.json'), {
    name: 'ren10',
    version,
  });
  writeJson(path.join(skill, 'sources.json'), {
    version: 1,
    package: { name: 'ren10', version },
    github: {
      org: 'Rensoconese',
      repo: 'ren10',
      ref: `v${version}`,
    },
    allowedRoots: [
      'ren-design.md',
      'tokens',
      'base',
      'components',
      'examples',
      'skills/rends',
    ],
    excludedRoots: ['_archive', 'rends-skill'],
  });
  writeJson(path.join(skill, 'v0.json'), {
    version: 1,
    referenceWorkspace: {
      sources: [{
        id: `github-repo:Rensoconese/ren10:v${version}`,
        type: 'github-repo',
        repo: { org: 'Rensoconese', name: 'ren10' },
        ref: `v${version}`,
        mountPath: `/vercel/share/v0-reference-workspace-sources/Rensoconese/ren10/v${version}`,
      }],
    },
    starter: { source: 'skill-directory', path: 'assets/starter' },
  });
  writeJson(path.join(starter, 'package.json'), {
    name: 'ren10-v0-starter',
    version,
    private: true,
    type: 'module',
    dependencies: { ren10: version },
  });
  fs.writeFileSync(path.join(starter, 'index.html'), [
    '<!doctype html>',
    '<html lang="en" data-theme="light">',
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ren10@0.10.0/index.css">',
    '<body>',
    '<a class="ren-link-skip" href="#main-content">Skip to main content</a>',
    '<ren-sidebar id="workspace-sidebar" role="complementary" aria-label="Workspace navigation" style="--ren-sidebar-active-color: var(--color-accent-strong)">',
    '<ren-form><button class="ren-btn ren-btn-primary" type="submit">Save</button></ren-form>',
    '</ren-sidebar>',
    '<button id="mobile-nav-toggle" type="button" aria-controls="workspace-sidebar" aria-expanded="false">Open navigation</button>',
    '<main id="main-content"></main>',
    '<button type="button" aria-pressed="false">Theme</button>',
    '<script type="module" src="./app.js"></script>',
    '</body>',
    '</html>',
  ].join('\n').replaceAll('0.10.0', version));
  fs.writeFileSync(path.join(starter, 'app.js'), [
    `import 'https://cdn.jsdelivr.net/npm/ren10@${version}/components/patterns/ren-sidebar/ren-sidebar.js';`,
    `import 'https://cdn.jsdelivr.net/npm/ren10@${version}/components/patterns/ren-form/ren-form.js';`,
    `import 'https://cdn.jsdelivr.net/npm/ren10@${version}/components/primitives/ren-field/ren-field.js';`,
    "const sidebar = document.querySelector('#workspace-sidebar');",
    "const mobileNavToggle = document.querySelector('#mobile-nav-toggle');",
    "mobileNavToggle.addEventListener('click', () => sidebar.toggleMenu());",
    "mobileNavToggle.setAttribute('aria-expanded', String(sidebar.isMobileOpen));",
    "window.addEventListener('resize', syncMobileNavigation);",
    "document.addEventListener('keydown', (event) => event.key === 'Escape' && syncMobileNavigation());",
    "document.querySelectorAll('.ren-sidebar-nav a').forEach((link) => link.addEventListener('click', syncMobileNavigation));",
    "document.documentElement.dataset.theme = 'light';",
  ].join('\n'));
  fs.writeFileSync(path.join(starter, 'README.md'), '# Ren10 v0 starter\n');

  return root;
}

function assertError(result, pattern) {
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), pattern);
}

test('rejects a starter with a required file missing', () => {
  const root = createFixture();
  try {
    fs.rmSync(path.join(root, 'skills/rends/assets/starter/app.js'));
    assertError(validateV0Adapter(root), /starter\/app\.js/i);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('rejects package, provenance, source-ref, dependency, and starter version drift', () => {
  const root = createFixture();
  try {
    const skill = path.join(root, 'skills', 'rends');
    const sources = JSON.parse(fs.readFileSync(path.join(skill, 'sources.json'), 'utf8'));
    sources.package.version = '9.9.9';
    sources.github.ref = 'main';
    writeJson(path.join(skill, 'sources.json'), sources);

    const starterPackage = JSON.parse(
      fs.readFileSync(path.join(skill, 'assets/starter/package.json'), 'utf8'),
    );
    starterPackage.version = '9.9.9';
    starterPackage.dependencies.ren10 = '^9.9.9';
    writeJson(path.join(skill, 'assets/starter/package.json'), starterPackage);

    assertError(validateV0Adapter(root), /version|ref|ren10 dependency/i);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('rejects framework dependencies and framework source strings', () => {
  const root = createFixture();
  try {
    const starter = path.join(root, 'skills/rends/assets/starter');
    const starterPackage = JSON.parse(fs.readFileSync(path.join(starter, 'package.json'), 'utf8'));
    starterPackage.dependencies.react = '19.0.0';
    writeJson(path.join(starter, 'package.json'), starterPackage);
    fs.appendFileSync(path.join(starter, 'index.html'), '\n<div class="tailwind">JSX</div>\n');

    assertError(validateV0Adapter(root), /react|tailwind|jsx|framework/i);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('rejects framework leakage in nested distributed starter files', () => {
  const root = createFixture();
  try {
    const nested = path.join(root, 'skills/rends/assets/starter/src/App.tsx');
    fs.mkdirSync(path.dirname(nested), { recursive: true });
    fs.writeFileSync(nested, "import React from 'react'; export const App = () => <main className=\"p-4\" />;\n");
    assertError(validateV0Adapter(root), /React|JSX\/TSX|starter\/src\/App\.tsx/i);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('rejects source roots that are absolute or escape the repository', () => {
  const root = createFixture();
  try {
    const file = path.join(root, 'skills/rends/sources.json');
    const sources = JSON.parse(fs.readFileSync(file, 'utf8'));
    sources.allowedRoots.push('../outside', '/tmp/external');
    writeJson(file, sources);

    assertError(validateV0Adapter(root), /allowedRoots|repository-relative/i);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('rejects archive and legacy workspace roots as sources', () => {
  const root = createFixture();
  try {
    const file = path.join(root, 'skills/rends/sources.json');
    const sources = JSON.parse(fs.readFileSync(file, 'utf8'));
    sources.allowedRoots.push('_archive', 'rends-skill');
    writeJson(file, sources);

    assertError(validateV0Adapter(root), /_archive|rends-skill|forbidden source/i);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('rejects a duplicate components bundle import', () => {
  const root = createFixture();
  try {
    const file = path.join(root, 'skills/rends/assets/starter/index.html');
    fs.appendFileSync(
      file,
      `\n<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ren10@${version}/components/index.css">\n`,
    );
    assertError(validateV0Adapter(root), /duplicate|components\/index\.css/i);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('rejects a starter without a first-focusable skip link to main content', () => {
  const root = createFixture();
  try {
    const file = path.join(root, 'skills/rends/assets/starter/index.html');
    const html = fs.readFileSync(file, 'utf8').replace(
      '<a class="ren-link-skip" href="#main-content">Skip to main content</a>',
      '',
    );
    fs.writeFileSync(file, html);
    assertError(validateV0Adapter(root), /skip link|main-content/i);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('rejects missing accessible external mobile navigation wiring', () => {
  const root = createFixture();
  try {
    const starter = path.join(root, 'skills/rends/assets/starter');
    fs.writeFileSync(
      path.join(starter, 'index.html'),
      fs.readFileSync(path.join(starter, 'index.html'), 'utf8')
        .replace('aria-controls="workspace-sidebar"', ''),
    );
    fs.writeFileSync(
      path.join(starter, 'app.js'),
      fs.readFileSync(path.join(starter, 'app.js'), 'utf8')
        .replace('sidebar.toggleMenu()', 'sidebar.openMobileMenu()'),
    );
    assertError(validateV0Adapter(root), /mobile navigation|aria-controls|toggleMenu/i);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('rejects a mobile navigation trigger without an accessible name', () => {
  const root = createFixture();
  try {
    const file = path.join(root, 'skills/rends/assets/starter/index.html');
    fs.writeFileSync(
      file,
      fs.readFileSync(file, 'utf8').replace('>Open navigation</button>', '></button>'),
    );
    assertError(validateV0Adapter(root), /accessible name/i);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('rejects missing sidebar landmark and dark contrast safeguards', () => {
  const root = createFixture();
  try {
    const file = path.join(root, 'skills/rends/assets/starter/index.html');
    const html = fs.readFileSync(file, 'utf8')
      .replace(' role="complementary"', '')
      .replace(' style="--ren-sidebar-active-color: var(--color-accent-strong)"', '')
      .replace('ren-btn ren-btn-primary', 'ren-btn');
    fs.writeFileSync(file, html);
    assertError(validateV0Adapter(root), /complementary|contrast|accent-strong|primary/i);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('accepts an isolated canonical adapter fixture', () => {
  const root = createFixture();
  try {
    const result = validateV0Adapter(root);
    assert.deepEqual(result.errors, []);
    assert.equal(result.ok, true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('accepts the checked-in v0 adapter and vanilla starter', () => {
  const result = validateV0Adapter(repositoryRoot);
  assert.deepEqual(result.errors, []);
  assert.equal(result.ok, true);
  assert.ok(result.checks.length >= 6);
});
