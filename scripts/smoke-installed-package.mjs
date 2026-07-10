import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ren10-installed-'));

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', stdio: 'pipe' });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed:\n${result.stdout}\n${result.stderr}`);
  }
  return result.stdout;
}

function relativeImports(file) {
  const source = fs.readFileSync(file, 'utf8');
  return Array.from(
    source.matchAll(/(?:from\s+|import\s*)['"](\.[^'"]+)['"]/g),
    (match) => match[1]
  );
}

function assertImportClosure(consumer, componentName) {
  const installedRoot = path.resolve(consumer, 'rends');
  const componentRoot = path.join(consumer, 'rends', 'components', componentName);
  const pending = fs.readdirSync(componentRoot)
    .filter((file) => file.endsWith('.js'))
    .map((file) => path.join(componentRoot, file));
  const visited = new Set();

  while (pending.length > 0) {
    const file = pending.pop();
    if (visited.has(file)) continue;
    visited.add(file);

    for (const specifier of relativeImports(file)) {
      const resolved = path.resolve(path.dirname(file), specifier);
      if (resolved !== installedRoot && !resolved.startsWith(`${installedRoot}${path.sep}`)) {
        throw new Error(`${componentName}: ${path.relative(consumer, file)} imports outside consumer rends/ via ${specifier}`);
      }
      if (!fs.existsSync(resolved)) {
        throw new Error(`${componentName}: ${path.relative(consumer, file)} imports missing ${specifier}`);
      }
      if (resolved.endsWith('.js')) pending.push(resolved);
    }
  }
}

function componentEntry(meta) {
  return meta.files.find((file) => file === `${meta.dir}.js`)
    || meta.files.find((file) => file.endsWith('.js'));
}

function assertRuntimeDependencyImports(consumer, registry, componentName) {
  const meta = registry[componentName];
  const entry = componentEntry(meta);
  if (!entry || meta.components.length === 0) return;

  const entryPath = path.join(consumer, 'rends', 'components', componentName, entry);
  const imports = new Set(relativeImports(entryPath));
  for (const dependency of meta.components) {
    const dependencyEntry = componentEntry(registry[dependency]);
    const expected = `../${dependency}/${dependencyEntry}`;
    if (!imports.has(expected)) {
      throw new Error(`${componentName}: entrypoint does not execute dependency ${expected}`);
    }
  }
}

function componentClosure(registry, componentName, result = new Set()) {
  if (result.has(componentName)) return result;
  result.add(componentName);
  for (const dependency of registry[componentName].components) {
    componentClosure(registry, dependency, result);
  }
  return result;
}

try {
  const escapeConsumer = path.join(tmp, 'escape-consumer');
  const escapeComponent = path.join(escapeConsumer, 'rends', 'components', 'escape');
  fs.mkdirSync(escapeComponent, { recursive: true });
  fs.writeFileSync(path.join(escapeConsumer, 'outside.js'), 'export default true;\n');
  fs.writeFileSync(path.join(escapeComponent, 'entry.js'), "import '../../../outside.js';\n");
  let rejectedEscape = false;
  try {
    assertImportClosure(escapeConsumer, 'escape');
  } catch (error) {
    rejectedEscape = /outside consumer rends/.test(error.message);
  }
  if (!rejectedEscape) throw new Error('installed import closure accepted an escape outside consumer rends/');

  const packOutput = run('npm', ['pack', '--silent', '--pack-destination', tmp], root);
  const tgz = path.join(tmp, packOutput.trim().split(/\s+/).pop());
  const packageHost = path.join(tmp, 'package-host');
  fs.mkdirSync(packageHost);
  run('npm', ['init', '-y'], packageHost);
  run('npm', ['install', tgz], packageHost);

  const packageRoot = path.join(packageHost, 'node_modules', 'ren10');
  const cli = path.join(packageRoot, 'cli', 'index.js');
  const packagedDocs = path.join(packageRoot, 'AGENTS.md');
  const packagedDocsBefore = fs.existsSync(packagedDocs) ? fs.readFileSync(packagedDocs) : null;
  const { REGISTRY } = await import(pathToFileURL(path.join(packageRoot, 'cli', 'registry.js')));
  const names = Object.keys(REGISTRY);
  if (names.length !== 53) throw new Error(`expected 53 registry entries, found ${names.length}`);

  const metadataErrors = [];
  for (const [name, meta] of Object.entries(REGISTRY)) {
    if (!Array.isArray(meta.utils)) metadataErrors.push(`${name}: missing explicit utils array`);
    if (!Array.isArray(meta.components)) metadataErrors.push(`${name}: missing explicit components array`);
    if (!Array.isArray(meta.utils) || !Array.isArray(meta.components)) continue;

    for (const dependency of meta.components) {
      if (!REGISTRY[dependency]) metadataErrors.push(`${name}: unknown component dependency ${dependency}`);
    }
    for (const dependency of meta.utils) {
      if (!fs.existsSync(path.join(packageRoot, 'utils', dependency))) {
        metadataErrors.push(`${name}: unknown utility dependency ${dependency}`);
      }
    }

    const sourceDir = path.join(packageRoot, 'components', meta.layer, meta.dir);
    const importedUtils = new Set();
    for (const fileName of meta.files) {
      const sourceFile = path.join(sourceDir, fileName);
      if (!fs.existsSync(sourceFile)) {
        metadataErrors.push(`${name}: registry file missing ${fileName}`);
        continue;
      }
      if (!fileName.endsWith('.js')) continue;
      for (const specifier of relativeImports(sourceFile)) {
        if (specifier.startsWith('../../../utils/')) {
          const utility = path.basename(specifier);
          importedUtils.add(utility);
          if (!meta.utils.includes(utility)) metadataErrors.push(`${name}: undeclared utility import ${utility}`);
        } else if (specifier.startsWith('./')) {
          const sibling = path.basename(specifier);
          if (!meta.files.includes(sibling)) metadataErrors.push(`${name}: undeclared sibling import ${sibling}`);
        }
      }
    }
    const declaredUtils = [...meta.utils].sort();
    const exactUtils = [...importedUtils].sort();
    if (declaredUtils.join('\0') !== exactUtils.join('\0')) {
      metadataErrors.push(`${name}: utils must be exactly [${exactUtils.join(', ')}], found [${declaredUtils.join(', ')}]`);
    }
  }

  for (const picker of ['date-picker', 'date-range-picker']) {
    if (!REGISTRY[picker].components?.includes('calendar')) {
      metadataErrors.push(`${picker}: missing calendar component dependency`);
    }
  }
  if (metadataErrors.length > 0) {
    throw new Error(`registry dependency metadata is incomplete:\n- ${metadataErrors.join('\n- ')}`);
  }

  const template = path.join(tmp, 'template');
  fs.mkdirSync(template);
  run(process.execPath, [cli, 'init'], template);

  const resetConsumer = (name) => {
    const consumer = path.join(tmp, `case-${name}`);
    fs.rmSync(consumer, { recursive: true, force: true });
    fs.cpSync(template, consumer, { recursive: true });
    return consumer;
  };

  for (const name of names) {
    const consumer = resetConsumer(name);
    run(process.execPath, [cli, 'add', name], consumer);

    for (const installed of componentClosure(REGISTRY, name)) {
      const installedDir = path.join(consumer, 'rends', 'components', installed);
      if (!fs.existsSync(installedDir)) throw new Error(`${name}: missing component dependency ${installed}`);
      assertImportClosure(consumer, installed);
      assertRuntimeDependencyImports(consumer, REGISTRY, installed);
    }

    if (name === 'date-picker') {
      const entry = pathToFileURL(path.join(
        consumer,
        'rends',
        'components',
        name,
        componentEntry(REGISTRY[name])
      )).href;
      const runtime = [
        'globalThis.HTMLElement = class {};',
        'const definitions = new Map();',
        'globalThis.customElements = { get: (name) => definitions.get(name), define: (name, ctor) => definitions.set(name, ctor) };',
        `await import(${JSON.stringify(entry)});`,
        "if (!customElements.get('ren-date-picker') || !customElements.get('ren-calendar')) process.exit(1);",
      ].join('\n');
      run(process.execPath, ['--input-type=module', '--eval', runtime], consumer);
    }
    fs.rmSync(consumer, { recursive: true, force: true });
  }

  for (const [name, missing] of [
    ['dialog', path.join('rends', 'utils', 'focus-trap.js')],
    ['date-picker', path.join('rends', 'components', 'calendar')],
    ['form', path.join('rends', 'components', 'form', 'serialize.js')],
  ]) {
    const consumer = resetConsumer(`upgrade-${name}`);
    run(process.execPath, [cli, 'add', name], consumer);
    fs.rmSync(path.join(consumer, missing), { recursive: true, force: true });
    run(process.execPath, [cli, 'upgrade', name, '--force'], consumer);
    if (!fs.existsSync(path.join(consumer, missing))) {
      throw new Error(`upgrade ${name} did not restore ${missing}`);
    }
  }

  const docsConsumer = resetConsumer('agent-docs');
  run(process.execPath, [cli, 'agent-docs', '--agent', 'codex'], docsConsumer);
  const docsPath = path.join(docsConsumer, 'AGENTS.md');
  const firstDocs = fs.readFileSync(docsPath, 'utf8');
  if (!firstDocs.includes('<!-- RENDS:START -->')) throw new Error('agent docs were not written to consumer cwd');
  run(process.execPath, [cli, 'agent-docs', '--agent', 'codex'], docsConsumer);
  if (fs.readFileSync(docsPath, 'utf8') !== firstDocs) throw new Error('agent-docs second run was not byte-identical');
  const packagedDocsAfter = fs.existsSync(packagedDocs) ? fs.readFileSync(packagedDocs) : null;
  if (!Buffer.from(packagedDocsAfter || '').equals(Buffer.from(packagedDocsBefore || ''))) {
    throw new Error('package AGENTS.md changed while writing consumer docs');
  }

  console.log(`Installed package smoke: OK (${names.length} isolated components)`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
