/**
 * RenDS block library — shared parsing and catalog helpers.
 *
 * `templates/blocks/*.html` ships one standalone demo page per block. Each
 * page already carries everything an agent needs to reuse the block: a title,
 * a one-line description, the stylesheets and scripts it links, and exactly
 * one root element marked `.bb-detail-preview` that holds the block markup.
 *
 * This module derives a compact catalog from those files. The generator
 * (`scripts/build-block-catalog.mjs`) writes it to
 * `templates/blocks/catalog.json`, `--check` keeps it fresh in CI, and the CLI
 * (`npx ren10 blocks`) and knowledge graph read it. Markup is never copied into
 * the catalog: it is read back from the block file on demand, so the package
 * ships it once.
 */

import fs from 'fs';
import path from 'path';

export const BLOCKS_DIR = 'templates/blocks';
export const BLOCK_CATALOG_PATH = `${BLOCKS_DIR}/catalog.json`;
export const BLOCK_CATALOG_SCHEMA_VERSION = 1;

/**
 * Block families, in the order a marketing page is usually assembled.
 * `prefix` is the filename prefix; `aliases` are the words people use when
 * asking for that kind of section. They feed search and `build` routing.
 */
export const BLOCK_FAMILIES = [
  { key: 'nav', prefix: 'nav-', label: 'Navigation', aliases: ['nav', 'navbar', 'navigation', 'menu', 'header', 'topbar', 'megamenu'] },
  { key: 'hero', prefix: 'hero-', label: 'Hero', aliases: ['hero', 'landing', 'banner', 'header', 'splash', 'intro'] },
  { key: 'feature', prefix: 'feature-', label: 'Feature', aliases: ['feature', 'features', 'benefits', 'services', 'capabilities', 'product'] },
  { key: 'testimonial', prefix: 'testimonial-', label: 'Testimonial', aliases: ['testimonial', 'testimonials', 'reviews', 'quotes', 'social-proof', 'customers'] },
  { key: 'pricing', prefix: 'pricing-', label: 'Pricing', aliases: ['pricing', 'price', 'prices', 'plans', 'plan', 'billing', 'tiers', 'subscription'] },
  { key: 'faq', prefix: 'faq-', label: 'FAQ', aliases: ['faq', 'faqs', 'questions', 'answers', 'help'] },
  { key: 'cta', prefix: 'cta-', label: 'Call to action', aliases: ['cta', 'call-to-action', 'signup', 'newsletter', 'subscribe', 'conversion'] },
  { key: 'contact', prefix: 'contact-', label: 'Contact', aliases: ['contact', 'enquiry', 'inquiry', 'booking', 'appointment', 'location', 'support'] },
  { key: 'blog', prefix: 'blog-', label: 'Blog', aliases: ['blog', 'posts', 'articles', 'news', 'stories', 'journal'] },
  { key: 'article-header', prefix: 'article-header-', label: 'Article header', aliases: ['article', 'post', 'editorial', 'byline', 'reading'] },
  { key: 'footer', prefix: 'footer-', label: 'Footer', aliases: ['footer', 'sitemap', 'legal', 'copyright'] },
  { key: 'application-shell', prefix: 'application-shell-', label: 'Application shell', aliases: ['dashboard', 'app', 'admin', 'console', 'workspace', 'shell', 'sidebar', 'inbox'] },
];

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', middot: '·',
  mdash: '—', ndash: '–', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', times: '×', copy: '©',
};

const decodeEntities = (text) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
    if (entity[0] === '#') {
      const code = entity[1] === 'x' || entity[1] === 'X'
        ? Number.parseInt(entity.slice(2), 16)
        : Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return ENTITIES[entity.toLowerCase()] ?? match;
  });

const textContent = (html) =>
  decodeEntities(String(html ?? '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

const toPosix = (value) => value.split(path.sep).join('/');

export const familyForBlockName = (name) =>
  [...BLOCK_FAMILIES]
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find((family) => name.startsWith(family.prefix)) ?? null;

/**
 * Return `{ start, end, tag, openTag }` for the element whose opening tag
 * contains `marker`, matching nested tags of the same name. Returns null when
 * the marker is missing or the element never closes.
 */
export const findElementByMarker = (html, marker) => {
  const markerIndex = html.indexOf(marker);
  if (markerIndex === -1) return null;
  const start = html.lastIndexOf('<', markerIndex);
  const tagMatch = /^<([a-z][a-z0-9-]*)/i.exec(html.slice(start));
  if (!tagMatch) return null;
  const tag = tagMatch[1].toLowerCase();
  const openEnd = html.indexOf('>', markerIndex);
  const re = new RegExp(`<(/?)${tag}(?=[\\s>/])[^>]*>`, 'gi');
  re.lastIndex = openEnd + 1;
  let depth = 1;
  let match;
  while ((match = re.exec(html))) {
    if (match[1]) depth -= 1;
    else if (!match[0].endsWith('/>')) depth += 1;
    if (depth === 0) {
      return { start, end: re.lastIndex, tag, openTag: html.slice(start, openEnd + 1) };
    }
  }
  return null;
};

const ROOT_MARKER = 'bb-detail-preview';

const PAGINATION_MARKER = 'bb-block-pagination';

/**
 * The block's markup region: the root element plus any companion elements the
 * page places after it (for example the `<ren-sheet>` a navbar opens), up to
 * the demo page's block pagination or the end of `<main>`.
 */
const blockRegion = (html) => {
  const element = findElementByMarker(html, ROOT_MARKER);
  if (!element) return null;
  const pagination = html.indexOf(PAGINATION_MARKER, element.end);
  let end = pagination === -1 ? html.indexOf('</main>', element.end) : html.lastIndexOf('<', pagination);
  if (end < element.end) end = element.end;
  return { ...element, end: element.end + html.slice(element.end, end).trimEnd().length };
};

/** Extract the reusable block markup from a block page. */
export const extractBlockMarkup = (html) => {
  const region = blockRegion(html);
  return region ? html.slice(region.start, region.end) : '';
};

/** Inline `<style>` and module/classic `<script>` bodies the block relies on. */
export const extractInlineAssets = (html) => {
  const styles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1].trim()).filter(Boolean);
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter((m) => !/\bsrc\s*=/.test(m[1]))
    .map((m) => m[2].trim())
    .filter(Boolean);
  return { styles, scripts };
};

const resolveAsset = (ref) => {
  if (!ref || /^(?:[a-z]+:|\/\/|#|\$\{)/i.test(ref)) return null;
  return toPosix(path.posix.normalize(path.posix.join(BLOCKS_DIR, ref)));
};

const unique = (values) => [...new Set(values.filter(Boolean))];

const classSelectorPattern = (className) =>
  new RegExp(`(?<![\\w-])\\.${className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`, 'g');

/**
 * Build a lookup from `ren-*` class names to the component directory that
 * owns them. Ownership goes to the component stylesheet that mentions the
 * class most often, so `.ren-btn` maps to ren-button even though a few other
 * components restyle buttons inside themselves.
 */
export const buildSelectorOwners = (root) => {
  const componentCss = [];
  for (const layer of ['primitives', 'composites', 'patterns']) {
    const layerDir = path.join(root, 'components', layer);
    if (!fs.existsSync(layerDir)) continue;
    for (const dir of fs.readdirSync(layerDir).sort()) {
      const cssPath = path.join(layerDir, dir, `${dir}.css`);
      if (fs.existsSync(cssPath)) componentCss.push({ dir, css: fs.readFileSync(cssPath, 'utf8') });
    }
  }
  const readAll = (files) => files
    .map((rel) => path.join(root, rel))
    .filter((abs) => fs.existsSync(abs))
    .map((abs) => fs.readFileSync(abs, 'utf8'))
    .join('\n');
  const layoutCss = readAll(['base/layouts.css', 'base/grid.css']);
  // Global helpers such as `.ren-sr-only` belong to no component.
  const utilityCss = readAll(['base/utilities.css', 'base/classless.css', 'base/enhancements.css']);

  const cache = new Map();
  return (className) => {
    if (cache.has(className)) return cache.get(className);
    const pattern = classSelectorPattern(className);
    let owner = null;
    if ((layoutCss.match(pattern) ?? []).length > 0) {
      owner = { kind: 'layout', name: className };
    } else if ((utilityCss.match(pattern) ?? []).length > 0) {
      owner = { kind: 'utility', name: className };
    } else {
      let best = 0;
      for (const { dir, css } of componentCss) {
        const count = (css.match(pattern) ?? []).length;
        if (count > best) {
          best = count;
          owner = { kind: 'component', name: dir };
        }
      }
    }
    cache.set(className, owner);
    return owner;
  };
};

/**
 * Parse one block page into a catalog entry. `selectorOwner` comes from
 * buildSelectorOwners(); `componentDirs` is the set of shipped component dirs
 * used to recognise custom elements such as `<ren-accordion>`.
 */
export const parseBlockFile = (html, fileName, { selectorOwner, componentDirs }) => {
  const name = fileName.replace(/\.html$/, '');
  const family = familyForBlockName(name);
  const element = blockRegion(html);
  if (!family) throw new Error(`${fileName}: filename does not start with a known block family prefix.`);
  if (!element) throw new Error(`${fileName}: no element marked .${ROOT_MARKER} (the block root).`);
  if ((html.match(new RegExp(`class="[^"]*\\b${ROOT_MARKER}\\b`, 'g')) ?? []).length > 1) {
    throw new Error(`${fileName}: more than one .${ROOT_MARKER} root.`);
  }

  const head = html.slice(0, element.start);
  const markup = html.slice(element.start, element.end);
  const titleTag = textContent(/<title>([\s\S]*?)<\/title>/i.exec(html)?.[1])
    .replace(/\s+[—-]\s+(?:Ren10 Blocks|RenDS Templates)$/i, '');
  const h1 = textContent(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(head)?.[1]);
  const description = textContent(/<p\b[^>]*class="[^"]*\b(?:bb-detail-description|lede)\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i.exec(head)?.[1])
    || decodeEntities(/<meta\s+name="description"\s+content="([^"]*)"/i.exec(html)?.[1] ?? '').trim();
  const kicker = textContent(/<p\b[^>]*class="[^"]*\bdx-kicker\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i.exec(head)?.[1]);

  const styles = unique(
    [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/gi)].map((m) => resolveAsset(m[1])),
  );
  const inline = extractInlineAssets(html);
  // Module scripts linked by the page plus static imports inside inline
  // scripts (`import '../../components/composites/ren-sheet/ren-sheet.js'`).
  const scripts = unique([
    ...[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/gi)].map((m) => resolveAsset(m[1])),
    ...inline.scripts.flatMap((code) =>
      [...code.matchAll(/(?:^|[\s;])import\s+(?:[^'"]*?\sfrom\s+)?['"]([^'"]+)['"]/g)].map((m) => resolveAsset(m[1]))),
  ]);
  const media = unique(
    [...markup.matchAll(/\b(?:src|poster|srcset)="(media\/[^"\s,]+)/gi)].map((m) => resolveAsset(m[1])),
  ).sort();

  const components = new Set();
  const layouts = new Set();
  for (const tag of markup.matchAll(/<(ren-[a-z0-9-]+)/gi)) {
    if (componentDirs.has(tag[1].toLowerCase())) components.add(tag[1].toLowerCase());
  }
  for (const attr of markup.matchAll(/\bclass="([^"]*)"/gi)) {
    for (const className of attr[1].split(/\s+/)) {
      if (!className.startsWith('ren-')) continue;
      const owner = selectorOwner(className);
      if (owner?.kind === 'component') components.add(owner.name);
      else if (owner?.kind === 'layout') layouts.add(owner.name);
    }
  }
  for (const script of scripts) {
    const dir = /^components\/[a-z]+\/(ren-[a-z0-9-]+)\//.exec(script)?.[1];
    if (dir) components.add(dir);
  }

  return {
    name,
    family: family.key,
    title: h1 || titleTag || name,
    summary: description,
    ...(kicker ? { kicker } : {}),
    path: `${BLOCKS_DIR}/${fileName}`,
    root: element.openTag.match(/^<([a-z0-9-]+)/i)[1].toLowerCase(),
    styles,
    scripts,
    inlineStyle: inline.styles.length > 0,
    inlineScript: inline.scripts.length > 0,
    components: [...components].sort(),
    layouts: [...layouts].sort(),
    media,
  };
};

/** Build the full catalog object from the package root. */
export const buildBlockCatalog = (root) => {
  const blocksDir = path.join(root, BLOCKS_DIR);
  const componentDirs = new Set();
  for (const layer of ['primitives', 'composites', 'patterns']) {
    const layerDir = path.join(root, 'components', layer);
    if (fs.existsSync(layerDir)) for (const dir of fs.readdirSync(layerDir)) componentDirs.add(dir);
  }
  const selectorOwner = buildSelectorOwners(root);
  const files = fs.readdirSync(blocksDir)
    .filter((file) => file.endsWith('.html') && file !== 'index.html')
    .sort();
  const blocks = files.map((file) =>
    parseBlockFile(fs.readFileSync(path.join(blocksDir, file), 'utf8'), file, { selectorOwner, componentDirs }),
  );
  const order = new Map(BLOCK_FAMILIES.map((family, index) => [family.key, index]));
  blocks.sort((a, b) => (order.get(a.family) - order.get(b.family)) || a.name.localeCompare(b.name));
  const families = Object.fromEntries(
    BLOCK_FAMILIES.map((family) => [family.key, {
      label: family.label,
      count: blocks.filter((block) => block.family === family.key).length,
      aliases: family.aliases,
    }]),
  );
  return {
    schemaVersion: BLOCK_CATALOG_SCHEMA_VERSION,
    generator: 'scripts/build-block-catalog.mjs',
    source: `${BLOCKS_DIR}/*.html`,
    usage: 'Copy the block root element from `path` (or `npx ren10 blocks <name>`), link `styles` in order, load `scripts` as modules, and copy any inline <style>/<script> the block page carries. Replace demo copy and media with real content.',
    count: blocks.length,
    families,
    blocks,
  };
};

/**
 * Serialize with one block per line: compact enough to ship, still readable in
 * a diff when a single block changes.
 */
export const serializeBlockCatalog = (catalog) => {
  const { blocks, ...headerFields } = catalog;
  const header = JSON.stringify(headerFields, null, 2).replace(/\n}$/, '');
  const lines = blocks.map((block) => `    ${JSON.stringify(block)}`);
  return `${header},\n  "blocks": [\n${lines.join(',\n')}\n  ]\n}\n`;
};

export const loadBlockCatalog = (root) =>
  JSON.parse(fs.readFileSync(path.join(root, BLOCK_CATALOG_PATH), 'utf8'));

/**
 * Read only the catalog header (count, families) without parsing the block
 * list. `manifest --json` runs on every agent start-up and is held to an RSS
 * budget; serializeBlockCatalog() always writes the header first.
 */
export const loadBlockCatalogSummary = (root) => {
  let fd;
  try {
    fd = fs.openSync(path.join(root, BLOCK_CATALOG_PATH), 'r');
    const buffer = Buffer.alloc(8192);
    const bytes = fs.readSync(fd, buffer, 0, buffer.length, 0);
    const text = buffer.subarray(0, bytes).toString('utf8');
    const end = text.indexOf(',\n  "blocks": [');
    return end === -1 ? null : JSON.parse(`${text.slice(0, end)}\n}`);
  } catch {
    return null;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
};

/**
 * Compact, searchable text for one block. This is what the knowledge graph
 * indexes instead of the block body, so 331 blocks cost a few dozen KB.
 */
export const blockSearchText = (block, catalog) => {
  const family = catalog?.families?.[block.family];
  return [
    `${block.title}.`,
    block.summary,
    block.kicker ? `(${block.kicker})` : null,
    `${family?.label ?? block.family} block: ${(family?.aliases ?? []).join(' ')}.`,
    block.components.length ? `Uses ${block.components.join(' ')}.` : null,
  ].filter(Boolean).join(' ');
};
