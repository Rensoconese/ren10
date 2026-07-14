#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REQUIRED_STARTER_FILES = ['package.json', 'index.html', 'app.js', 'README.md'];
const CANONICAL_ROOTS = new Set([
  'ren-design.md',
  'tokens',
  'base',
  'components',
  'examples',
  'skills/rends',
]);
const FORBIDDEN_SOURCE_ROOTS = ['_archive', 'rends-skill'];
const FORBIDDEN_DEPENDENCIES = [
  'react',
  'react-dom',
  'next',
  'vue',
  'nuxt',
  'svelte',
  '@sveltejs/kit',
  'tailwindcss',
  '@tailwindcss/vite',
  'shadcn',
];
const FORBIDDEN_SOURCE_PATTERNS = [
  [/\bReact\b|react-dom|from\s+['"]react['"]/i, 'React'],
  [/\bVue\b|from\s+['"]vue['"]/i, 'Vue'],
  [/\bSvelte\b|@sveltejs/i, 'Svelte'],
  [/\bJSX\b|\bTSX\b|\.jsx\b|\.tsx\b/i, 'JSX/TSX'],
  [/\bTailwind\b|tailwindcss|@tailwind/i, 'Tailwind'],
  [/\bshadcn(?:\/ui)?\b/i, 'shadcn/ui'],
];

function isRepositoryRelative(value) {
  if (typeof value !== 'string' || value.length === 0 || path.isAbsolute(value)) return false;
  const normalized = value.replaceAll('\\', '/');
  return normalized !== '..'
    && !normalized.startsWith('../')
    && !normalized.includes('/../')
    && normalized !== '.';
}

function listStarterFiles(directory, relative = '') {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const relativePath = path.posix.join(relative, entry.name);
    const absolutePath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      files.push({ relativePath, absolutePath, symbolicLink: true });
    } else if (entry.isDirectory()) {
      files.push(...listStarterFiles(absolutePath, relativePath));
    } else if (entry.isFile()) {
      files.push({ relativePath, absolutePath, symbolicLink: false });
    }
  }
  return files;
}

export function validateV0Adapter(root) {
  const repositoryRoot = path.resolve(root);
  const skillRoot = path.join(repositoryRoot, 'skills', 'rends');
  const errors = [];
  const checks = [];
  const fail = (message) => errors.push(message);
  const pass = (message) => checks.push(message);

  const readJson = (file, label) => {
    if (!fs.existsSync(file)) {
      fail(`Missing ${label}: ${path.relative(repositoryRoot, file)}.`);
      return null;
    }
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (error) {
      fail(`Invalid JSON in ${label}: ${error.message}`);
      return null;
    }
  };

  const packageJson = readJson(path.join(repositoryRoot, 'package.json'), 'package.json');
  const packageVersion = packageJson?.version;
  if (packageJson?.name !== 'ren10' || typeof packageVersion !== 'string') {
    fail('package.json must declare ren10 with a string version.');
  } else {
    pass(`package version: ren10@${packageVersion}`);
  }

  const adapter = readJson(path.join(skillRoot, 'v0.json'), 'skills/rends/v0.json');
  const sources = readJson(path.join(skillRoot, 'sources.json'), 'skills/rends/sources.json');
  const starterPath = adapter?.starter?.path;
  const safeStarterPath = isRepositoryRelative(starterPath)
    ? path.resolve(skillRoot, starterPath)
    : path.join(skillRoot, 'assets', 'starter');

  if (adapter) {
    if (adapter.version !== 1) fail('v0.json must use schema version 1.');
    if (adapter.starter?.source !== 'skill-directory') {
      fail('v0.json starter.source must be "skill-directory".');
    }
    if (starterPath !== 'assets/starter') {
      fail('v0.json starter.path must be "assets/starter".');
    }

    const referenceSources = adapter.referenceWorkspace?.sources;
    if (!Array.isArray(referenceSources) || referenceSources.length !== 1) {
      fail('v0.json must declare exactly one read-only GitHub reference source.');
    } else {
      const source = referenceSources[0];
      const expectedRef = packageVersion ? `v${packageVersion}` : null;
      const expectedId = expectedRef ? `github-repo:Rensoconese/ren10:${expectedRef}` : null;
      const expectedMount = expectedRef
        ? `/vercel/share/v0-reference-workspace-sources/Rensoconese/ren10/${expectedRef}`
        : null;
      if (source.type !== 'github-repo') fail('v0.json reference source type must be github-repo.');
      if (source.repo?.org !== 'Rensoconese' || source.repo?.name !== 'ren10') {
        fail('v0.json reference source must point to Rensoconese/ren10.');
      }
      if (expectedRef && source.ref !== expectedRef) {
        fail(`v0.json reference ref must match package version (${expectedRef}).`);
      }
      if (expectedId && source.id !== expectedId) {
        fail(`v0.json reference id must be ${expectedId}.`);
      }
      if (expectedMount && source.mountPath !== expectedMount) {
        fail(`v0.json reference mountPath must be ${expectedMount}.`);
      }
    }
    pass('v0 schema and GitHub reference inspected');
  }

  if (sources) {
    if (sources.version !== 1) fail('sources.json must use schema version 1.');
    if (sources.package?.name !== 'ren10') fail('sources.json package name must be ren10.');
    if (packageVersion && sources.package?.version !== packageVersion) {
      fail(`sources.json package version must match package.json (${packageVersion}).`);
    }
    if (sources.github?.org !== 'Rensoconese' || sources.github?.repo !== 'ren10') {
      fail('sources.json GitHub provenance must point to Rensoconese/ren10.');
    }
    if (packageVersion && sources.github?.ref !== `v${packageVersion}`) {
      fail(`sources.json GitHub ref must match package version (v${packageVersion}).`);
    }

    if (!Array.isArray(sources.allowedRoots) || sources.allowedRoots.length === 0) {
      fail('sources.json allowedRoots must be a non-empty array.');
    } else {
      for (const sourceRoot of sources.allowedRoots) {
        if (!isRepositoryRelative(sourceRoot)) {
          fail(`sources.json allowedRoots must be repository-relative: ${sourceRoot}.`);
          continue;
        }
        if (!CANONICAL_ROOTS.has(sourceRoot)) {
          fail(`Invalid canonical source root in allowedRoots: ${sourceRoot}.`);
        }
        if (FORBIDDEN_SOURCE_ROOTS.some((rootName) => (
          sourceRoot === rootName || sourceRoot.startsWith(`${rootName}/`)
        ))) {
          fail(`Forbidden source root: ${sourceRoot}.`);
        }
      }
    }

    if (!Array.isArray(sources.excludedRoots)) {
      fail('sources.json excludedRoots must be an array.');
    } else {
      for (const excluded of FORBIDDEN_SOURCE_ROOTS) {
        if (!sources.excludedRoots.includes(excluded)) {
          fail(`sources.json excludedRoots must include ${excluded}.`);
        }
      }
    }
    pass('source provenance and root policy inspected');
  }

  for (const file of REQUIRED_STARTER_FILES) {
    const absolute = path.join(safeStarterPath, file);
    if (!fs.existsSync(absolute)) {
      fail(`Missing required starter file: skills/rends/assets/starter/${file}.`);
    }
  }
  if (REQUIRED_STARTER_FILES.every((file) => fs.existsSync(path.join(safeStarterPath, file)))) {
    pass('required starter files present');
  }

  const starterPackage = readJson(path.join(safeStarterPath, 'package.json'), 'starter/package.json');
  if (starterPackage) {
    if (starterPackage.private !== true) fail('starter/package.json must be private.');
    if (starterPackage.type !== 'module') fail('starter/package.json must use type "module".');
    if (packageVersion && starterPackage.version !== packageVersion) {
      fail(`starter package version must match package.json (${packageVersion}).`);
    }
    if (packageVersion && starterPackage.dependencies?.ren10 !== packageVersion) {
      fail(`starter ren10 dependency must be pinned exactly to ${packageVersion}.`);
    }

    const dependencies = Object.assign(
      {},
      starterPackage.dependencies,
      starterPackage.devDependencies,
      starterPackage.peerDependencies,
      starterPackage.optionalDependencies,
    );
    for (const dependency of FORBIDDEN_DEPENDENCIES) {
      if (Object.hasOwn(dependencies, dependency)) {
        fail(`Forbidden framework dependency in starter: ${dependency}.`);
      }
    }
    pass('starter package policy inspected');
  }

  const distributedStarterFiles = fs.existsSync(safeStarterPath)
    ? listStarterFiles(safeStarterPath)
    : [];
  for (const file of distributedStarterFiles) {
    if (file.symbolicLink) fail(`Symbolic links are forbidden in starter/${file.relativePath}.`);
  }
  const starterContents = distributedStarterFiles
    .filter((file) => !file.symbolicLink)
    .map((file) => ({ file: file.relativePath, buffer: fs.readFileSync(file.absolutePath) }))
    .filter(({ buffer }) => !buffer.includes(0))
    .map(({ file, buffer }) => ({ file, text: buffer.toString('utf8') }));
  for (const { file, text } of starterContents) {
    for (const [pattern, label] of FORBIDDEN_SOURCE_PATTERNS) {
      if (pattern.test(text)) fail(`Forbidden ${label} source string in starter/${file}.`);
    }
    if (/attachShadow\s*\(/.test(text)) fail(`Shadow DOM is forbidden in starter/${file}.`);
  }
  if (starterContents.length > 0) pass('complete vanilla and Light DOM source tree inspected');

  const indexHtml = starterContents.find(({ file }) => file === 'index.html')?.text ?? '';
  const appJs = starterContents.find(({ file }) => file === 'app.js')?.text ?? '';
  if (packageVersion) {
    const cdnRoot = `https://cdn.jsdelivr.net/npm/ren10@${packageVersion}`;
    const canonicalCssImport = `${cdnRoot}/index.css`;
    if (!indexHtml.includes(canonicalCssImport)) {
      fail(`starter/index.html is missing canonical import: ${canonicalCssImport}.`);
    }
    if (/https:\/\/cdn\.jsdelivr\.net\/npm\/ren10@[^"'\s]+\/components\/index\.css/.test(indexHtml)) {
      fail('starter/index.html must not duplicate the component bundle with components/index.css.');
    }
    for (const importPath of [
      `${cdnRoot}/components/patterns/ren-sidebar/ren-sidebar.js`,
      `${cdnRoot}/components/patterns/ren-form/ren-form.js`,
      `${cdnRoot}/components/primitives/ren-field/ren-field.js`,
    ]) {
      if (!appJs.includes(importPath)) fail(`starter/app.js is missing canonical import: ${importPath}.`);
    }
  }
  if (!/data-theme=["'](?:light|dark)["']/.test(indexHtml)) {
    fail('starter/index.html must declare a light/dark data-theme.');
  }
  if (!/aria-pressed/.test(indexHtml) || !/dataset\.theme/.test(appJs)) {
    fail('starter must include an accessible light/dark theme control.');
  }
  if (!/<ren-sidebar\b/.test(indexHtml) || !/<ren-form\b/.test(indexHtml)) {
    fail('starter must compose a Ren10 dashboard sidebar and settings form.');
  }

  if (!/<body\b[^>]*>\s*<a\b(?=[^>]*\bclass=["'][^"']*\bren-link-skip\b[^"']*["'])(?=[^>]*\bhref=["']#main-content["'])[^>]*>/i.test(indexHtml)
    || !/<main\b[^>]*\bid=["']main-content["']/i.test(indexHtml)) {
    fail('starter must begin with a ren-link-skip skip link to #main-content.');
  }

  const sidebarMarkup = indexHtml.match(/<ren-sidebar\b[^>]*\bid=["']workspace-sidebar["'][^>]*>/i);
  const mobileTriggerMarkup = indexHtml.match(/<button\b[^>]*\bid=["']mobile-nav-toggle["'][^>]*>/i)?.[0] ?? '';
  const mobileTriggerElement = indexHtml.match(
    /<button\b(?=[^>]*\bid=["']mobile-nav-toggle["'])[^>]*>([\s\S]*?)<\/button>/i,
  );
  const sidebarCloseIndex = indexHtml.indexOf('</ren-sidebar>');
  const mobileTriggerIndex = indexHtml.indexOf('id="mobile-nav-toggle"');
  if (!sidebarMarkup
    || !mobileTriggerMarkup
    || !/\btype=["']button["']/i.test(mobileTriggerMarkup)
    || !/\baria-controls=["']workspace-sidebar["']/i.test(mobileTriggerMarkup)
    || !/\baria-expanded=["']false["']/i.test(mobileTriggerMarkup)
    || sidebarCloseIndex === -1
    || mobileTriggerIndex < sidebarCloseIndex) {
    fail('starter must provide an accessible external mobile navigation trigger controlling workspace-sidebar.');
  }
  if (!/\brole=["']complementary["']/i.test(sidebarMarkup?.[0] ?? '')
    || !/\baria-label=["'][^"']+["']/i.test(sidebarMarkup?.[0] ?? '')) {
    fail('starter workspace-sidebar must be a named complementary landmark.');
  }
  if (!/--ren-sidebar-active-color\s*:\s*var\(--color-accent-strong\)/.test(sidebarMarkup?.[0] ?? '')) {
    fail('starter workspace-sidebar must use the accent-strong active text contrast token.');
  }
  if (!/<button\b(?=[^>]*\btype=["']submit["'])(?=[^>]*\bclass=["'][^"']*\bren-btn-primary\b)[^>]*>/i.test(indexHtml)) {
    fail('starter submit button must use the contrast-safe Ren10 primary button style.');
  }
  const triggerText = mobileTriggerElement?.[1].replace(/<[^>]+>/g, '').trim() ?? '';
  if (!/\baria-label=["'][^"']+["']/i.test(mobileTriggerMarkup) && triggerText.length === 0) {
    fail('starter mobile navigation trigger must have an accessible name.');
  }

  const mobileWiring = [
    [/#workspace-sidebar/, 'workspace sidebar selector'],
    [/#mobile-nav-toggle/, 'mobile trigger selector'],
    [/\.toggleMenu\s*\(/, 'public toggleMenu() API'],
    [/\.isMobileOpen\b/, 'public isMobileOpen state'],
    [/aria-expanded/, 'aria-expanded synchronization'],
    [/addEventListener\s*\(\s*['"]resize['"]/, 'resize synchronization'],
    [/addEventListener\s*\(\s*['"]keydown['"][\s\S]*?Escape/, 'Escape synchronization'],
    [/\.ren-sidebar-nav a[\s\S]*?addEventListener\s*\(\s*['"]click['"]/, 'navigation synchronization'],
  ];
  for (const [pattern, label] of mobileWiring) {
    if (!pattern.test(appJs)) fail(`starter mobile navigation wiring is missing ${label}.`);
  }
  pass('canonical imports and starter composition inspected');

  return { ok: errors.length === 0, checks, errors };
}

const isDirectRun = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isDirectRun) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const result = validateV0Adapter(root);
  if (!result.ok) {
    for (const error of result.errors) console.error(`v0 adapter: ${error}`);
    process.exitCode = 1;
  } else {
    console.log(`Ren10 v0 adapter: OK (${result.checks.length} checks).`);
  }
}
