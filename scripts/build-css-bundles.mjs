#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build, transform } from 'esbuild';
import postcss from 'postcss';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Compile the actual entrypoint. The CSS parser preserves import order,
 * layer/supports/media conditions, repeated imports, URLs and string contents.
 * Missing imports are build errors, never silently omitted output. */
export async function bundleCss(entryPoint, { minify = false } = {}) {
  const result = await build({
    entryPoints: [entryPoint],
    bundle: true,
    write: false,
    minify: false,
    charset: 'utf8',
    legalComments: 'none',
    // Match the source contract: modern native CSS, including nesting.
    target: 'esnext',
    logLevel: 'silent',
  });
  if (result.warnings.length) {
    throw new Error(result.warnings.map((warning) => warning.text).join('\n'));
  }
  const css = postcss.parse(result.outputFiles[0].text);
  // Each standalone component declares the same global order. Once bundled,
  // subsequent identical root statements are redundant. Do not touch nested
  // layer orders or different declarations, which may change precedence.
  const orders = new Set();
  for (const node of [...css.nodes]) {
    if (node.type !== 'atrule' || node.name !== 'layer' || node.nodes) continue;
    const order = node.params.replace(/\s/g, '');
    if (orders.has(order)) node.remove();
    else orders.add(order);
  }
  // Consecutive blocks of one named layer already share cascade priority.
  // Keep child order and parent scope; never merge anonymous layers (each
  // creates a distinct priority), or move a block across intervening rules.
  const mergeNamedLayers = (parent) => {
    if (!parent.nodes) return;
    let previous;
    for (const node of [...parent.nodes]) {
      if (node.type === 'comment') continue;
      if (node.type === 'atrule' && node.name === 'layer' && node.nodes && node.params &&
          previous?.type === 'atrule' && previous.name === 'layer' && previous.nodes &&
          previous.params === node.params) {
        previous.append(...node.nodes);
        node.remove();
      } else previous = node;
    }
  };
  mergeNamedLayers(css);
  css.walk(mergeNamedLayers);
  // Adjacent identical declaration-only selectors have the same cascade.
  // Merge within each parent only; never cross another rule or an at-rule.
  css.walk((parent) => {
    if (!parent.nodes) return;
    let previous;
    for (const node of [...parent.nodes]) {
      if (node.type === 'comment') continue;
      if (node.type === 'rule' && node.nodes.every(child => child.type === 'decl') &&
          previous?.type === 'rule' && previous.selector === node.selector &&
          previous.nodes.every(child => child.type === 'decl')) {
        previous.append(...node.nodes);
        node.remove();
      } else previous = node;
    }
  });
  if (!minify) return css.toString().replace(/[ \t]+$/gm, '');
  return (await transform(css.toString(), {
    loader: 'css', minify: true, charset: 'utf8', legalComments: 'none', target: 'esnext',
  })).code;
}

export async function buildBundles(packageRoot = root) {
  const out = path.join(packageRoot, 'dist');
  await mkdir(out, { recursive: true });
  for (const [name, entry] of [
    ['ren10', 'index.css'],
    ['ren10-foundation', 'foundation.css'],
    ['ren10-components', 'components/index.css'],
  ]) {
    for (const minify of [false, true]) {
      const css = await bundleCss(path.join(packageRoot, entry), { minify });
      await writeFile(path.join(out, `${name}${minify ? '.min' : ''}.css`), css);
    }
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  await buildBundles();
  console.log('RenDS CSS bundles built with preserved cascade layers.');
}
