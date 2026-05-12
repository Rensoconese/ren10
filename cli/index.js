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
 * Command: rends init
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

  if (scaleKey && !RATIOS[scaleKey]) {
    const available = listRatios().map(r => `  ${c.cyan}${r.key.padEnd(18)}${c.reset}${r.name} (${r.value})`).join('\n');
    error(`Unknown scale ratio: "${scaleKey}"\n\nAvailable ratios:\n${available}`);
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
}

/**
 * Command: rends scales
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
 * Command: rends add <component>
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
    if (fs.existsSync(srcFile)) {
      copyFile(srcFile, destFile);
      if (!silent) success(`Copied ${componentName}/${file}`);
    }
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
 * Command: rends add --all
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
 * Command: rends list
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
  add <component>   Add a component to your project
  add --all         Add all components at once
  list              List all available components
  scales            List available type scale ratios
  help, -h          Show this help message
  version, -v       Show version

${c.bold}Init Options:${c.reset}
  --scale <ratio>   Use a modular type scale (e.g., major-third, perfect-fourth)
  --base <px>       Base font size in px (default: 16)
  --fluid           Generate fluid clamp() values for responsive typography

${c.bold}Examples:${c.reset}
  npx ren10 init
  npx ren10 init --scale perfect-fourth
  npx ren10 init --scale minor-third --base 18 --fluid
  npx ren10 add button
  npx ren10 add dialog
  npx ren10 add --all
  npx ren10 list
  npx ren10 scales

${c.bold}Docs:${c.reset}
  https://github.com/rends
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
