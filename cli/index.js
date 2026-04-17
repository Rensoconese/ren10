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

  // Create components directory
  const componentsDir = path.join(rendsDir, 'components');
  fs.mkdirSync(componentsDir, { recursive: true });
  success('Created rends/components/');

  // Create components/index.css
  const componentsIndexPath = path.join(componentsDir, 'index.css');
  const componentIndexContent = `/* ============================================
   RenDS — Components Layer
   ============================================
   Import component styles here as you add them.
   ============================================ */

/* Example: @import './button/ren-button.css'; */
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
  console.log(`  ${c.cyan}npx rends add button${c.reset}`);
  console.log(`  ${c.cyan}npx rends add dialog${c.reset}`);
  console.log(`  ${c.cyan}npx rends add --all${c.reset}\n`);

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
  console.log(`${c.dim}Use with: npx rends init --scale <ratio>${c.reset}\n`);

  ratios.forEach(r => {
    const marker = r.key === 'major-third' ? ` ${c.yellow}← default${c.reset}` : '';
    const recommended = ['minor-third', 'major-third', 'perfect-fourth'].includes(r.key) ? ` ${c.green}★${c.reset}` : '';
    console.log(`  ${c.cyan}${r.key.padEnd(18)}${c.reset}${r.name.padEnd(16)} ${c.dim}(${r.value})${c.reset}${recommended}${marker}`);
  });

  console.log(`\n${c.dim}★ = recommended for web${c.reset}\n`);
  console.log(`${c.bold}Examples:${c.reset}`);
  console.log(`  ${c.cyan}npx rends init --scale minor-third${c.reset}`);
  console.log(`  ${c.cyan}npx rends init --scale perfect-fourth --base 18${c.reset}`);
  console.log(`  ${c.cyan}npx rends init --scale major-third --fluid${c.reset}\n`);
}

/**
 * Command: rends add <component>
 * Add a component to the project
 */
async function cmdAdd() {
  const cwd = process.cwd();
  const rendsDir = path.join(cwd, 'rends');

  if (!fs.existsSync(rendsDir)) {
    error(
      'rends/ directory not found. Run "npx rends init" first'
    );
  }

  const componentArg = args[1];
  if (!componentArg) {
    error('Please specify a component name or use --all');
  }

  if (componentArg === '--all') {
    return cmdAddAll();
  }

  const componentName = componentArg.toLowerCase();
  const meta = getComponent(componentName);

  if (!meta) {
    error(
      `Unknown component: ${componentName}. Run "npx rends list" to see available components.`
    );
  }

  // Create component directory
  const componentDir = path.join(rendsDir, 'components', componentName);
  if (fs.existsSync(componentDir)) {
    error(
      `Component "${componentName}" already exists in rends/components/${componentName}`
    );
  }

  fs.mkdirSync(componentDir, { recursive: true });

  // Copy component files
  const srcComponentDir = path.join(RENDS_ROOT, 'components', meta.layer, meta.dir);
  if (!fs.existsSync(srcComponentDir)) {
    error(`Source component not found: ${srcComponentDir}`);
  }

  meta.files.forEach((file) => {
    const srcFile = path.join(srcComponentDir, file);
    const destFile = path.join(componentDir, file);
    if (fs.existsSync(srcFile)) {
      copyFile(srcFile, destFile);
      success(`Copied ${file}`);
    }
  });

  // Copy dependencies
  const utilsDir = path.join(rendsDir, 'utils');
  fs.mkdirSync(utilsDir, { recursive: true });

  const srcUtilsDir = path.join(RENDS_ROOT, 'utils');
  meta.deps.forEach((dep) => {
    const srcDep = path.join(srcUtilsDir, dep);
    const destDep = path.join(utilsDir, dep);
    if (fs.existsSync(srcDep) && !fs.existsSync(destDep)) {
      copyFile(srcDep, destDep);
      success(`Copied ${dep} (dependency)`);
    } else if (fs.existsSync(destDep)) {
      info(`${dep} already exists`);
    }
  });

  // Update components/index.css
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
      // Find position after header comments
      const commentEndIdx = lines.findIndex((l) => !l.trim().startsWith('*') && !l.trim().startsWith('/*') && l.trim() !== '');
      if (commentEndIdx >= 0) {
        lines.splice(commentEndIdx, 0, '', importLine);
      } else {
        lines.push('', importLine);
      }
    }
    fs.writeFileSync(componentsIndexPath, lines.join('\n'));
  }
  success(`Updated components/index.css`);

  console.log(`\n${c.bold}Usage:${c.reset}\n`);
  console.log(meta.usage.split('\n').map((line) => `  ${line}`).join('\n'));
  console.log();
}

/**
 * Command: rends add --all
 * Add all components at once
 */
async function cmdAddAll() {
  const cwd = process.cwd();
  const rendsDir = path.join(cwd, 'rends');

  if (!fs.existsSync(rendsDir)) {
    error('rends/ directory not found. Run "npx rends init" first');
  }

  const allComponents = getAllComponents();
  let added = 0;
  let skipped = 0;

  allComponents.forEach((name) => {
    const meta = REGISTRY[name];
    const componentDir = path.join(rendsDir, 'components', name);

    if (fs.existsSync(componentDir)) {
      skipped++;
      return;
    }

    fs.mkdirSync(componentDir, { recursive: true });

    // Copy component files
    const srcComponentDir = path.join(
      RENDS_ROOT,
      'components',
      meta.layer,
      meta.dir
    );

    if (!fs.existsSync(srcComponentDir)) {
      return;
    }

    meta.files.forEach((file) => {
      const srcFile = path.join(srcComponentDir, file);
      const destFile = path.join(componentDir, file);
      if (fs.existsSync(srcFile)) {
        copyFile(srcFile, destFile);
      }
    });

    added++;
  });

  // Copy all utilities
  const utilsDir = path.join(rendsDir, 'utils');
  fs.mkdirSync(utilsDir, { recursive: true });
  const srcUtilsDir = path.join(RENDS_ROOT, 'utils');
  if (fs.existsSync(srcUtilsDir)) {
    const utilFiles = fs.readdirSync(srcUtilsDir);
    utilFiles.forEach((file) => {
      const srcFile = path.join(srcUtilsDir, file);
      const destFile = path.join(utilsDir, file);
      if (fs.statSync(srcFile).isFile()) {
        copyFile(srcFile, destFile);
      }
    });
  }

  // Update components/index.css with all imports
  const componentsIndexPath = path.join(rendsDir, 'components', 'index.css');
  let indexContent = fs.readFileSync(componentsIndexPath, 'utf8');

  allComponents.forEach((name) => {
    const meta = REGISTRY[name];
    const importLine = `@import './${name}/${meta.files[0]}';`;
    if (!indexContent.includes(importLine)) {
      indexContent += `\n${importLine}`;
    }
  });

  fs.writeFileSync(componentsIndexPath, indexContent);

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
  npx rends <command> [options]

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
  npx rends init
  npx rends init --scale perfect-fourth
  npx rends init --scale minor-third --base 18 --fluid
  npx rends add button
  npx rends add dialog
  npx rends add --all
  npx rends list
  npx rends scales

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
