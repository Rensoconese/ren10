#!/usr/bin/env node

/**
 * RenDS CLI — Scaffold and manage design system components
 * Commands: init, add, list
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { REGISTRY, getComponentsByLayer, getComponent, getAllComponents } from './registry.js';
import { RATIOS, generateTypeScaleCSS, listRatios } from './type-scale.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RENDS_ROOT = path.resolve(__dirname, '..');

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
};

// Allowed values for --density / --shape (mirrors themes/appearance.css).
const DENSITY_VALUES = ['comfortable', 'compact', 'spacious'];
const SHAPE_VALUES   = ['rounded', 'sharp', 'pill'];

const args = process.argv.slice(2);
const command = args[0];

/**
 * Print error message and exit
 */
function error(message) {
  console.error(`${c.red}✗ Error${c.reset}: ${message}`);
  process.exit(1);
}

/**
 * Print success message
 */
function success(message) {
  console.log(`${c.green}✓${c.reset} ${message}`);
}

/**
 * Print info message
 */
function info(message) {
  console.log(`${c.cyan}ℹ${c.reset} ${message}`);
}

/**
 * Copy file from source to destination, creating dirs as needed
 */
function copyFile(src, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

/**
 * Copy component source into a consumer's flat rends/components/<name>/ folder.
 * Source components live under components/<layer>/<dir>/, so JS imports that
 * point at ../../../utils/ need one fewer ../ after copying.
 */
function copyComponentFile(src, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!src.endsWith('.js')) {
    fs.copyFileSync(src, dest);
    return;
  }

  const rewritten = fs
    .readFileSync(src, 'utf8')
    .replace(/from\s+(['"])\.\.\/\.\.\/\.\.\/utils\//g, 'from $1../../utils/');
  fs.writeFileSync(dest, rewritten);
}

/**
 * Copy directory recursively
 */
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src);
  entries.forEach((entry) => {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  });
}

/**
 * Command: ren10 init
 * Initialize a new RenDS project in current directory
 */
async function cmdInit() {
  const cwd = process.cwd();
  const rendsDir = path.join(cwd, 'rends');

  if (fs.existsSync(rendsDir)) {
    error('rends/ directory already exists');
  }

  // Parse --scale flag
  const scaleIdx = args.indexOf('--scale');
  const scaleKey = scaleIdx !== -1 ? args[scaleIdx + 1] : null;

  // Parse --base flag (base font size in px)
  const baseIdx = args.indexOf('--base');
  const basePx = baseIdx !== -1 ? parseFloat(args[baseIdx + 1]) : 16;

  // Parse --fluid flag
  const useFluid = args.includes('--fluid');

  // Parse --density and --shape flags (no default → omit attr when not set).
  const densityIdx = args.indexOf('--density');
  const densityKey = densityIdx !== -1 ? args[densityIdx + 1] : null;
  const shapeIdx   = args.indexOf('--shape');
  const shapeKey   = shapeIdx   !== -1 ? args[shapeIdx + 1]   : null;

  if (scaleKey && !RATIOS[scaleKey]) {
    const available = listRatios().map(r => `  ${c.cyan}${r.key.padEnd(18)}${c.reset}${r.name} (${r.value})`).join('\n');
    error(`Unknown scale ratio: "${scaleKey}"\n\nAvailable ratios:\n${available}`);
  }
  if (densityKey && !DENSITY_VALUES.includes(densityKey)) {
    error(`Unknown density: "${densityKey}". Must be one of: ${DENSITY_VALUES.join(', ')}.`);
  }
  if (shapeKey && !SHAPE_VALUES.includes(shapeKey)) {
    error(`Unknown shape: "${shapeKey}". Must be one of: ${SHAPE_VALUES.join(', ')}.`);
  }

  // Create directory structure
  fs.mkdirSync(rendsDir, { recursive: true });

  // Copy tokens
  const tokensDir = path.join(rendsDir, 'tokens');
  copyDir(path.join(RENDS_ROOT, 'tokens'), tokensDir);

  // If a scale was specified, regenerate typography.css with modular scale
  if (scaleKey) {
    const typographyCSS = generateTypeScaleCSS({
      base: basePx,
      ratio: scaleKey,
      fluid: useFluid,
    });
    fs.writeFileSync(path.join(tokensDir, 'primitives', 'typography.css'), typographyCSS);
    success(`Created rends/tokens/ with ${c.bold}${RATIOS[scaleKey].name}${c.reset} scale (${RATIOS[scaleKey].value})`);
  } else {
    success('Created rends/tokens/');
  }

  // Copy base
  const baseDir = path.join(rendsDir, 'base');
  copyDir(path.join(RENDS_ROOT, 'base'), baseDir);
  success('Created rends/base/');

  // Copy themes (preset themes + hex→tokens generator).
  // appearance.css is opt-in (not auto-imported in index.css below) so the
  // user pays nothing if they don't use [data-theme]. The generator is a
  // pure ES module the user can import at build time.
  const themesDir = path.join(rendsDir, 'themes');
  fs.mkdirSync(themesDir, { recursive: true });
  copyFile(
    path.join(RENDS_ROOT, 'themes', 'appearance.css'),
    path.join(themesDir, 'appearance.css')
  );
  copyFile(
    path.join(RENDS_ROOT, 'themes', 'theme-generator.js'),
    path.join(themesDir, 'theme-generator.js')
  );
  success('Created rends/themes/');

  // Create components directory
  const componentsDir = path.join(rendsDir, 'components');
  fs.mkdirSync(componentsDir, { recursive: true });
  success('Created rends/components/');

  // Create components/index.css.
  // The `/* @rends-imports */` marker is an explicit anchor used by
  // `npx ren10 add` to know where to splice new @import lines. Keep
  // it on its own line so the splice stays clean.
  const componentsIndexPath = path.join(componentsDir, 'index.css');
  const componentIndexContent = `/* ============================================
   RenDS — Components Layer
   ============================================
   Import component styles here as you add them.
   ============================================ */

/* @rends-imports */
`;
  fs.writeFileSync(componentsIndexPath, componentIndexContent);

  // Create root index.css
  const indexPath = path.join(rendsDir, 'index.css');
  const indexContent = `/* ============================================
   RenDS — Design System
   ============================================ */

@import './tokens/index.css';
@import './base/index.css';
@import './components/index.css';
`;
  fs.writeFileSync(indexPath, indexContent);
  success('Created rends/index.css');

  console.log(`\n${c.bold}Done!${c.reset} Add components with:\n`);
  console.log(`  ${c.cyan}npx ren10 add button${c.reset}`);
  console.log(`  ${c.cyan}npx ren10 add dialog${c.reset}`);
  console.log(`  ${c.cyan}npx ren10 add --all${c.reset}\n`);

  if (scaleKey) {
    console.log(`${c.dim}Type scale: ${RATIOS[scaleKey].name} (${RATIOS[scaleKey].value})${c.reset}`);
    console.log(`${c.dim}Base size:  ${basePx}px${c.reset}`);
    if (useFluid) console.log(`${c.dim}Fluid:      enabled${c.reset}`);
    console.log();
  }

  if (densityKey || shapeKey) {
    const attrParts = [];
    if (densityKey) attrParts.push(`data-density="${densityKey}"`);
    if (shapeKey)   attrParts.push(`data-shape="${shapeKey}"`);
    console.log(`${c.bold}Add these attributes to your ${c.cyan}<html>${c.reset}${c.bold} element:${c.reset}`);
    console.log(`  ${c.cyan}<html ${attrParts.join(' ')}>${c.reset}\n`);
    console.log(`${c.dim}themes/appearance.css already declares the matching CSS — no extra import needed.${c.reset}\n`);
  }
}

/**
 * Command: ren10 scales
 * List all available type scale ratios
 */
async function cmdScales() {
  const ratios = listRatios();
  console.log(`\n${c.bold}Available Type Scale Ratios${c.reset}\n`);
  console.log(`${c.dim}Use with: npx ren10 init --scale <ratio>${c.reset}\n`);

  ratios.forEach(r => {
    const marker = r.key === 'major-third' ? ` ${c.yellow}← default${c.reset}` : '';
    const recommended = ['minor-third', 'major-third', 'perfect-fourth'].includes(r.key) ? ` ${c.green}★${c.reset}` : '';
    console.log(`  ${c.cyan}${r.key.padEnd(18)}${c.reset}${r.name.padEnd(16)} ${c.dim}(${r.value})${c.reset}${recommended}${marker}`);
  });

  console.log(`\n${c.dim}★ = recommended for web${c.reset}\n`);
  console.log(`${c.bold}Examples:${c.reset}`);
  console.log(`  ${c.cyan}npx ren10 init --scale minor-third${c.reset}`);
  console.log(`  ${c.cyan}npx ren10 init --scale perfect-fourth --base 18${c.reset}`);
  console.log(`  ${c.cyan}npx ren10 init --scale major-third --fluid${c.reset}\n`);
}

/**
 * Command: ren10 add <component>
 * Add a component to the project
 */
/**
 * Add one component to rends/components/<name>/.
 * Returns the resolved meta so the caller can render usage examples,
 * or null if the component was skipped (unknown / already exists).
 *
 * @param {string} rendsDir   Absolute path to the consumer's rends/ folder.
 * @param {string} componentArg  Component name (will be lowercased).
 * @param {object} [opts]
 * @param {boolean} [opts.silent]  Suppress per-file ✓ / ℹ logs.
 *                                  Used by `add --all` to keep output tidy.
 */
function addOneComponent(rendsDir, componentArg, opts = {}) {
  const { silent = false } = opts;
  const componentName = componentArg.toLowerCase();
  const meta = getComponent(componentName);

  if (!meta) {
    if (!silent) {
      info(
        `Skipped "${componentName}" — unknown. Run "npx ren10 list" to see available components.`
      );
    }
    return null;
  }

  const componentDir = path.join(rendsDir, 'components', componentName);
  if (fs.existsSync(componentDir)) {
    if (!silent) {
      info(`Skipped "${componentName}" — already exists in rends/components/${componentName}`);
    }
    return null;
  }

  fs.mkdirSync(componentDir, { recursive: true });

  const srcComponentDir = path.join(RENDS_ROOT, 'components', meta.layer, meta.dir);
  if (!fs.existsSync(srcComponentDir)) {
    error(`Source component not found: ${srcComponentDir}`);
  }

  meta.files.forEach((file) => {
    const srcFile = path.join(srcComponentDir, file);
    const destFile = path.join(componentDir, file);
    if (!fs.existsSync(srcFile)) {
      error(`Registry file missing for "${componentName}": ${path.relative(RENDS_ROOT, srcFile)}`);
    }

    copyComponentFile(srcFile, destFile);
    if (!silent) success(`Copied ${componentName}/${file}`);
  });

  // Copy JS deps from utils/ if the component declares any.
  if (meta.deps && meta.deps.length > 0) {
    const utilsDir = path.join(rendsDir, 'utils');
    fs.mkdirSync(utilsDir, { recursive: true });

    const srcUtilsDir = path.join(RENDS_ROOT, 'utils');
    meta.deps.forEach((dep) => {
      const srcDep = path.join(srcUtilsDir, dep);
      const destDep = path.join(utilsDir, dep);
      if (fs.existsSync(srcDep) && !fs.existsSync(destDep)) {
        copyFile(srcDep, destDep);
        if (!silent) success(`Copied utils/${dep} (dependency)`);
      }
    });
  }

  // Append @import to components/index.css if not already there.
  // Strategy (in priority order):
  //   1. After the last existing @import line.
  //   2. Right after the `/* @rends-imports */` marker (init template).
  //   3. After the first `*/` (end of any header comment).
  //   4. Append at the end.
  const componentsIndexPath = path.join(rendsDir, 'components', 'index.css');
  let indexContent = fs.readFileSync(componentsIndexPath, 'utf8');
  const importLine = `@import './${componentName}/${meta.files[0]}';`;

  if (!indexContent.includes(importLine)) {
    const lines = indexContent.split('\n');

    const lastImportIdx = lines
      .map((l, i) => (l.trim().startsWith('@import') ? i : -1))
      .filter((i) => i >= 0)
      .pop();

    if (lastImportIdx !== undefined) {
      lines.splice(lastImportIdx + 1, 0, importLine);
    } else {
      const markerIdx = lines.findIndex((l) => l.trim() === '/* @rends-imports */');
      if (markerIdx >= 0) {
        lines.splice(markerIdx + 1, 0, importLine);
      } else {
        const closeCommentIdx = lines.findIndex((l) => l.includes('*/'));
        if (closeCommentIdx >= 0) {
          lines.splice(closeCommentIdx + 1, 0, '', importLine);
        } else {
          lines.push('', importLine);
        }
      }
    }
    fs.writeFileSync(componentsIndexPath, lines.join('\n'));
  }

  return meta;
}

async function cmdAdd() {
  const cwd = process.cwd();
  const rendsDir = path.join(cwd, 'rends');

  if (!fs.existsSync(rendsDir)) {
    error(
      'rends/ directory not found. Run "npx ren10 init" first'
    );
  }

  // Everything after `add` that isn't a flag. Supports
  //   npx ren10 add button
  //   npx ren10 add button dialog tooltip
  //   npx ren10 add --all
  const positional = args.slice(1).filter((a) => !a.startsWith('--'));

  if (args.includes('--all')) {
    return cmdAddAll();
  }

  if (positional.length === 0) {
    error('Please specify one or more component names, or use --all');
  }

  const added = [];
  for (const componentArg of positional) {
    const meta = addOneComponent(rendsDir, componentArg);
    if (meta) added.push(meta);
  }

  if (added.length === 0) {
    console.log(`\n${c.dim}No components added.${c.reset}\n`);
    return;
  }

  success(`Updated components/index.css`);

  // Render usage for each added component.
  console.log(`\n${c.bold}Usage:${c.reset}\n`);
  for (const meta of added) {
    console.log(`  ${c.dim}— ${meta.name} —${c.reset}`);
    console.log(meta.usage.split('\n').map((line) => `  ${line}`).join('\n'));
    console.log();
  }
}

/**
 * Command: ren10 add --all
 * Add all components at once
 */
async function cmdAddAll() {
  const cwd = process.cwd();
  const rendsDir = path.join(cwd, 'rends');

  if (!fs.existsSync(rendsDir)) {
    error('rends/ directory not found. Run "npx ren10 init" first');
  }

  const allComponents = getAllComponents();
  let added = 0;
  let skipped = 0;

  // Reuse the same per-component logic as `add <name>` so the splice
  // into components/index.css uses the `/* @rends-imports */` anchor
  // (or the appropriate fallback), instead of blindly concatenating
  // at end-of-file. Silent mode keeps the output to one summary line.
  for (const name of allComponents) {
    const meta = addOneComponent(rendsDir, name, { silent: true });
    if (meta) {
      added++;
    } else {
      skipped++;
    }
  }

  // Copy every utility file, not just the deps declared by the
  // components added in this pass. `add --all` is the "give me
  // everything" command, so the consumer expects the full utils/
  // folder to be present.
  const utilsDir = path.join(rendsDir, 'utils');
  fs.mkdirSync(utilsDir, { recursive: true });
  const srcUtilsDir = path.join(RENDS_ROOT, 'utils');
  if (fs.existsSync(srcUtilsDir)) {
    const utilFiles = fs.readdirSync(srcUtilsDir);
    utilFiles.forEach((file) => {
      const srcFile = path.join(srcUtilsDir, file);
      const destFile = path.join(utilsDir, file);
      if (fs.statSync(srcFile).isFile() && !fs.existsSync(destFile)) {
        copyFile(srcFile, destFile);
      }
    });
  }

  console.log();
  success(`Added ${added} components`);
  if (skipped > 0) {
    info(`Skipped ${skipped} components (already exist)`);
  }
  console.log();
}

/**
 * Command: ren10 list
 * List all available components
 */
async function cmdList() {
  const layers = getComponentsByLayer();

  console.log(`\n${c.bold}RenDS Components${c.reset} (${getAllComponents().length})\n`);

  const layerOrder = ['primitives', 'composites', 'patterns'];
  const layerLabels = {
    primitives: 'PRIMITIVES',
    composites: 'COMPOSITES',
    patterns: 'PATTERNS',
  };

  layerOrder.forEach((layer) => {
    const components = layers[layer] || [];
    if (components.length === 0) return;

    console.log(`${c.bold}${layerLabels[layer]}${c.reset}`);
    components.forEach((comp) => {
      console.log(`  ${c.cyan}${comp.key.padEnd(20)}${c.reset}${comp.description}`);
    });
    console.log();
  });
}

/**
 * Command: ren10 remove <component> [...more]
 * Remove a previously-added component from rends/components/<name>/ and
 * drop its @import line from rends/components/index.css.
 *
 * Refuses to delete a directory that doesn't match the registry shape
 * (e.g. user-customized component with extra files) unless --force is
 * passed. This protects local overrides.
 */
async function cmdRemove() {
  const cwd = process.cwd();
  const rendsDir = path.join(cwd, 'rends');

  if (!fs.existsSync(rendsDir)) {
    error('rends/ directory not found. Run "npx ren10 init" first.');
  }

  const force = args.includes('--force') || args.includes('-f');
  const positional = args.slice(1).filter((a) => !a.startsWith('-'));

  if (positional.length === 0) {
    error('Please specify one or more component names. Example: npx ren10 remove dialog');
  }

  const componentsIndexPath = path.join(rendsDir, 'components', 'index.css');
  let indexContent = fs.existsSync(componentsIndexPath)
    ? fs.readFileSync(componentsIndexPath, 'utf8')
    : null;

  let removed = 0;
  let skipped = 0;

  for (const componentArg of positional) {
    const name = componentArg.toLowerCase();
    const meta = getComponent(name);
    if (!meta) {
      info(`Skipped "${name}" — unknown. Run "npx ren10 list" to see available components.`);
      skipped++;
      continue;
    }

    const componentDir = path.join(rendsDir, 'components', name);
    if (!fs.existsSync(componentDir)) {
      info(`Skipped "${name}" — not installed in rends/components/${name}.`);
      skipped++;
      continue;
    }

    // Detect local edits / extra files. Compare directory listing to the
    // registry's expected file set. Extra files (or files modified vs the
    // package source) indicate the user has customized this component —
    // refuse to delete without --force.
    if (!force) {
      const localFiles = fs.readdirSync(componentDir);
      const expected = new Set(meta.files);
      const extras = localFiles.filter((f) => !expected.has(f));

      const srcDir = path.join(RENDS_ROOT, 'components', meta.layer, meta.dir);
      const modified = meta.files.filter((f) => {
        const local = path.join(componentDir, f);
        const upstream = path.join(srcDir, f);
        if (!fs.existsSync(local) || !fs.existsSync(upstream)) return false;
        try {
          return fs.readFileSync(local, 'utf8') !== fs.readFileSync(upstream, 'utf8');
        } catch {
          return false;
        }
      });

      if (extras.length > 0 || modified.length > 0) {
        const reasons = [];
        if (extras.length)   reasons.push(`extra file(s): ${extras.join(', ')}`);
        if (modified.length) reasons.push(`modified file(s): ${modified.join(', ')}`);
        info(`Skipped "${name}" — local overrides detected (${reasons.join('; ')}). Re-run with --force to remove anyway.`);
        skipped++;
        continue;
      }
    }

    // Delete the directory recursively (fs.rmSync available since Node 14).
    fs.rmSync(componentDir, { recursive: true, force: true });
    success(`Removed rends/components/${name}/`);
    removed++;

    // Drop the @import line for this component, if present.
    if (indexContent !== null) {
      const importMatch = new RegExp(`^\\s*@import\\s+['"]\\./${name}/[^'"]+['"]\\s*;\\s*$`, 'm');
      if (importMatch.test(indexContent)) {
        indexContent = indexContent.replace(importMatch, '').replace(/\n{3,}/g, '\n\n');
      }
    }
  }

  if (indexContent !== null) {
    fs.writeFileSync(componentsIndexPath, indexContent);
  }

  console.log();
  if (removed > 0) success(`Removed ${removed} component${removed === 1 ? '' : 's'}`);
  if (skipped > 0) info(`Skipped ${skipped} component${skipped === 1 ? '' : 's'}`);
  console.log();
}

/**
 * Command: ren10 upgrade [name] [...]
 * Compare each locally-installed component against the package source.
 * For each differing file, prompt the user (overwrite / skip / show diff
 * / abort). Without args, walks every installed component.
 *
 * Flags:
 *   --force         Overwrite without prompting (CI mode).
 *   --dry-run       Print what would change without writing.
 *
 * Identical files are silently skipped. The pager handles output of
 * potentially large diffs by chunking through readline.
 */
async function cmdUpgrade() {
  const cwd = process.cwd();
  const rendsDir = path.join(cwd, 'rends');

  if (!fs.existsSync(rendsDir)) {
    error('rends/ directory not found. Run "npx ren10 init" first.');
  }

  const force  = args.includes('--force') || args.includes('-f');
  const dryRun = args.includes('--dry-run');
  const positional = args.slice(1).filter((a) => !a.startsWith('-'));

  // Determine which components to consider. Without positional names,
  // upgrade everything we find installed.
  let targets;
  if (positional.length > 0) {
    targets = positional.map((a) => a.toLowerCase());
  } else {
    const componentsDir = path.join(rendsDir, 'components');
    if (!fs.existsSync(componentsDir)) {
      error('rends/components/ not found.');
    }
    targets = fs
      .readdirSync(componentsDir)
      .filter((f) => fs.statSync(path.join(componentsDir, f)).isDirectory());
  }

  if (targets.length === 0) {
    info('No installed components to upgrade.');
    return;
  }

  let upgraded = 0, unchanged = 0, skipped = 0;
  const prompt = await loadPromptModule();

  for (const name of targets) {
    const meta = getComponent(name);
    if (!meta) {
      info(`Skipped "${name}" — unknown.`);
      skipped++;
      continue;
    }

    const localDir = path.join(rendsDir, 'components', name);
    if (!fs.existsSync(localDir)) {
      info(`Skipped "${name}" — not installed.`);
      skipped++;
      continue;
    }

    const srcDir = path.join(RENDS_ROOT, 'components', meta.layer, meta.dir);

    const changes = meta.files
      .map((f) => {
        const local    = path.join(localDir, f);
        const upstream = path.join(srcDir, f);
        if (!fs.existsSync(upstream)) return null;
        const localContent    = fs.existsSync(local) ? fs.readFileSync(local, 'utf8') : null;
        const upstreamContent = fs.readFileSync(upstream, 'utf8');
        if (localContent === upstreamContent) return null;
        return { file: f, local, upstream, localContent, upstreamContent };
      })
      .filter(Boolean);

    if (changes.length === 0) {
      unchanged++;
      continue;
    }

    console.log(`\n${c.bold}${name}${c.reset} ${c.dim}— ${changes.length} file(s) differ${c.reset}`);
    for (const ch of changes) {
      console.log(`  ${c.yellow}~${c.reset} ${ch.file}`);
    }

    let action = 'y';
    if (!force) {
      action = await prompt(
        `Overwrite ${changes.length} file(s) in ${name}? [y]es / [n]o / [d]iff / [a]bort: `
      );
      action = (action || '').toLowerCase().charAt(0) || 'n';

      if (action === 'd') {
        // Show a quick diff for each changed file (first 40 lines).
        for (const ch of changes) {
          console.log(`\n${c.dim}── ${ch.file} ──${c.reset}`);
          printDiff(ch.localContent, ch.upstreamContent);
        }
        action = await prompt(`Overwrite anyway? [y]es / [n]o: `);
        action = (action || '').toLowerCase().charAt(0) || 'n';
      }

      if (action === 'a') {
        info('Aborted by user.');
        prompt.close();
        return;
      }
    }

    if (action === 'y') {
      if (dryRun) {
        success(`(dry-run) would overwrite ${changes.length} file(s) in ${name}/`);
      } else {
        for (const ch of changes) {
          fs.writeFileSync(ch.local, ch.upstreamContent);
        }
        success(`Upgraded ${name} (${changes.length} file(s))`);
      }
      upgraded++;
    } else {
      info(`Skipped ${name}.`);
      skipped++;
    }
  }

  prompt.close();

  console.log();
  if (upgraded > 0)  success(`Upgraded ${upgraded} component${upgraded === 1 ? '' : 's'}`);
  if (unchanged > 0) info(`${unchanged} component${unchanged === 1 ? '' : 's'} already up to date`);
  if (skipped > 0)   info(`Skipped ${skipped} component${skipped === 1 ? '' : 's'}`);
  console.log();
}

/**
 * Print a minimal unified diff for two text blobs.
 * Caps at 40 lines per file to keep terminal output bounded.
 */
function printDiff(localContent, upstreamContent) {
  const localLines    = localContent.split('\n');
  const upstreamLines = upstreamContent.split('\n');
  const max = Math.max(localLines.length, upstreamLines.length);
  let shown = 0;
  for (let i = 0; i < max && shown < 40; i++) {
    const a = localLines[i];
    const b = upstreamLines[i];
    if (a === b) continue;
    if (a !== undefined) { console.log(`${c.red}- ${a}${c.reset}`); shown++; }
    if (b !== undefined) { console.log(`${c.green}+ ${b}${c.reset}`); shown++; }
  }
  if (max > 40) console.log(`${c.dim}…(diff truncated at 40 lines)${c.reset}`);
}

/**
 * Build a thin readline prompt wrapper that returns a function callable as
 * `await prompt(message)` and exposes `.close()` to release the stdin handle.
 */
async function loadPromptModule() {
  const readline = await import('node:readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const fn = (q) => new Promise((resolve) => rl.question(q, (a) => resolve(a)));
  fn.close = () => rl.close();
  return fn;
}

/**
 * Main CLI router
 */
async function main() {
  try {
    switch (command) {
      case 'init':
        await cmdInit();
        break;
      case 'add':
        await cmdAdd();
        break;
      case 'remove':
      case 'rm':
        await cmdRemove();
        break;
      case 'upgrade':
      case 'update':
        await cmdUpgrade();
        break;
      case 'list':
        await cmdList();
        break;
      case 'scales':
        await cmdScales();
        break;
      case '--help':
      case '-h':
      case 'help':
        showHelp();
        break;
      case '--version':
      case '-v':
      case 'version':
        showVersion();
        break;
      default:
        if (!command) {
          showHelp();
        } else {
          error(`Unknown command: ${command}`);
        }
    }
  } catch (err) {
    error(err.message);
  }
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
${c.bold}RenDS CLI${c.reset} — Vanilla Design System

${c.bold}Usage:${c.reset}
  npx ren10 <command> [options]

${c.bold}Commands:${c.reset}
  init              Initialize a new RenDS project
  add <component>   Add one or more components to your project
  add --all         Add all components at once
  remove <name>     Delete a previously-added component (alias: rm)
  upgrade [name]    Refresh installed components from the package source
                    (alias: update; no arg = all installed components)
  list              List all available components
  scales            List available type scale ratios
  help, -h          Show this help message
  version, -v       Show version

${c.bold}Init Options:${c.reset}
  --scale <ratio>   Use a modular type scale (e.g., major-third, perfect-fourth)
  --base <px>       Base font size in px (default: 16)
  --fluid           Generate fluid clamp() values for responsive typography
  --density <v>     comfortable | compact | spacious
                    Tells you which data-density attr to add to <html>
  --shape <v>       rounded | sharp | pill
                    Tells you which data-shape attr to add to <html>

${c.bold}Remove / Upgrade Options:${c.reset}
  --force, -f       Bypass safety checks (override detection on remove,
                    skip prompts on upgrade)
  --dry-run         Show what upgrade would do without writing

${c.bold}Examples:${c.reset}
  npx ren10 init
  npx ren10 init --scale perfect-fourth
  npx ren10 init --scale minor-third --base 18 --fluid
  npx ren10 init --density compact --shape sharp
  npx ren10 add button
  npx ren10 add dialog
  npx ren10 add --all
  npx ren10 remove tooltip
  npx ren10 upgrade
  npx ren10 upgrade dialog --dry-run
  npx ren10 list
  npx ren10 scales

${c.bold}Docs:${c.reset}
  https://github.com/Rensoconese/ren10
`);
}

/**
 * Show version
 */
function showVersion() {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(RENDS_ROOT, 'package.json'), 'utf8')
    );
    console.log(`RenDS v${pkg.version}`);
  } catch {
    console.log('RenDS (version unknown)');
  }
}

// Run CLI
main();
