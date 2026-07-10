import fs from 'fs';
import path from 'path';

const toPosix = (value) => value.split(path.sep).join('/');

const slugify = (value) =>
  String(value || 'concept')
    .toLowerCase()
    .replace(/^--/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'concept';

const titleFor = (node) => node.name || node.id;

const typeFor = (node) => {
  if (node.type === 'component') return 'RenDS Component';
  if (node.type === 'contract') return 'RenDS Contract';
  if (node.type === 'css') return 'RenDS CSS';
  if (node.type === 'javascript') return 'RenDS JavaScript';
  if (node.type === 'docs_page') return 'RenDS Docs Page';
  if (node.type === 'example') return 'RenDS Example';
  if (node.type === 'selector') return 'RenDS Selector';
  if (node.type === 'token') return 'RenDS Token';
  if (node.type?.includes('contract')) return 'RenDS Contract';
  if (node.type?.startsWith('tooling')) return 'RenDS Tooling';
  return `RenDS ${String(node.type || 'Concept')}`;
};

export const okfDefaultOutDir = (root) => path.join(root, 'knowledge', 'okf');

export const conceptPathForNode = (node) => {
  if (node.type === 'component') {
    const kind = node.data?.kind === 'pattern' ? 'patterns' : `${node.data?.kind || 'component'}s`;
    return `components/${kind}/${slugify(node.name)}.md`;
  }
  if (node.type === 'token') return `tokens/${slugify(node.name || node.id)}.md`;
  if (node.type === 'selector') return `selectors/${slugify(node.name || node.id)}.md`;
  if (node.type === 'example') return `examples/${slugify(node.name || node.id)}.md`;
  if (node.type === 'docs_page') return `docs/${slugify(node.name || node.id)}.md`;
  if (node.type === 'css') return `css/${slugify(node.name || node.id)}.md`;
  if (node.type === 'javascript') return `javascript/${slugify(node.name || node.id)}.md`;
  if (node.type?.includes('contract') || node.id?.startsWith('foundation:')) return `foundation/${slugify(node.id)}.md`;
  if (node.id?.startsWith('tooling:')) return `tooling/${slugify(node.id)}.md`;
  return `concepts/${slugify(node.id)}.md`;
};

const plainYamlValue = (value) => {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  const text = String(value);
  if (/^[A-Za-z0-9_./:@-]+$/.test(text)) return text;
  return JSON.stringify(text);
};

const yaml = (data) => {
  const lines = ['---'];
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      if (value.length === 0) {
        lines.push('  []');
      } else {
        for (const item of value) lines.push(`  - ${plainYamlValue(item)}`);
      }
    } else {
      lines.push(`${key}: ${plainYamlValue(value)}`);
    }
  }
  lines.push('---');
  return `${lines.join('\n')}\n\n`;
};

const markdownLink = (label, relPath) => `[${label}](${relPath})`;

const relationshipsMarkdown = (node, relPath, edgesBySource, nodeById, pathById) => {
  const edges = edgesBySource.get(node.id) ?? [];
  if (edges.length === 0) return '_No outgoing relationships._\n';
  return edges
    .map((edge) => {
      const target = nodeById.get(edge.target);
      const targetPath = pathById.get(edge.target);
      const label = target ? titleFor(target) : edge.target;
      const relativeTarget = targetPath
        ? toPosix(path.relative(path.dirname(relPath), targetPath))
        : null;
      const linked = relativeTarget ? markdownLink(label, relativeTarget) : `\`${edge.target}\``;
      return `- \`${edge.type}\` -> ${linked}${edge.detail ? ` (${edge.detail})` : ''}`;
    })
    .join('\n') + '\n';
};

const bodyForNode = (node, relPath, edgesBySource, nodeById, pathById) => {
  const parts = [
    `# ${titleFor(node)}`,
    '',
    node.path ? `Source path: \`${node.path}\`` : `Graph node: \`${node.id}\``,
    '',
    '## Relationships',
    '',
    relationshipsMarkdown(node, relPath, edgesBySource, nodeById, pathById).trimEnd(),
  ];

  if (node.data && Object.keys(node.data).length > 0) {
    parts.push('', '## Structured Data', '', '```json', JSON.stringify(node.data, null, 2), '```');
  }

  if (node.body) {
    parts.push('', '## Source Content', '', node.body.trim().replace(/[ \t]+$/gm, ''));
  }

  return `${parts.join('\n')}\n`;
};

const tagsForNode = (node) => {
  const tags = new Set(['rends', 'ren10', slugify(node.type)]);
  if (node.type === 'component' && node.data?.kind) tags.add(node.data.kind);
  if (node.type === 'token') tags.add('token');
  if (node.type === 'selector') tags.add('selector');
  return [...tags].sort();
};

const ensureSafeOutDir = (root, outDir) => {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(outDir);
  const forbidden = new Set([resolvedRoot, path.dirname(resolvedRoot), path.join(resolvedRoot, 'knowledge')]);
  if (forbidden.has(resolved)) {
    throw new Error(`Refusing to overwrite unsafe OKF output directory: ${resolved}`);
  }
  if (!fs.existsSync(resolved)) return;
  if (!fs.statSync(resolved).isDirectory()) {
    throw new Error(`Refusing to overwrite non-directory OKF output path: ${resolved}`);
  }
  const entries = fs.readdirSync(resolved);
  if (entries.length === 0) return;
  const indexPath = path.join(resolved, 'index.md');
  const index = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : '';
  if (!index.startsWith('---\n') || !index.includes('type: "RenDS Knowledge Bundle"')) {
    throw new Error(`Refusing to overwrite non-RenDS OKF directory: ${resolved}`);
  }
};

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const listMarkdownFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) {
        visit(abs);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(abs);
      }
    }
  };
  visit(dir);
  return files.sort();
};

const parseFrontmatter = (content) => {
  if (!content.startsWith('---\n')) return null;
  const end = content.indexOf('\n---', 4);
  if (end === -1) return null;
  const raw = content.slice(4, end).trimEnd();
  const data = {};
  let currentList = null;
  for (const line of raw.split('\n')) {
    if (line.startsWith('  - ') && currentList) {
      data[currentList].push(line.slice(4).replace(/^"|"$/g, ''));
      continue;
    }
    const match = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (!match) continue;
    const [, key, value = ''] = match;
    if (value === '') {
      data[key] = [];
      currentList = key;
    } else {
      data[key] = value.replace(/^"|"$/g, '');
      currentList = null;
    }
  }
  return { data, body: content.slice(end + 5).trimStart() };
};

const buildIndex = ({ graph, packageVersion, concepts }) => {
  const byType = new Map();
  for (const concept of concepts) {
    const list = byType.get(concept.node.type) ?? [];
    list.push(concept);
    byType.set(concept.node.type, list);
  }

  const lines = [
    '# RenDS Knowledge Bundle',
    '',
    'Portable OKF-style bundle generated from RenDS source contracts and the packaged knowledge graph.',
    '',
    '## Counts',
    '',
    `- Nodes: ${graph.nodes.length}`,
    `- Edges: ${graph.edges.length}`,
    `- Package version: ${packageVersion}`,
    '',
    '## Concept Types',
    '',
  ];

  for (const [type, list] of [...byType.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`- ${type}: ${list.length}`);
  }

  lines.push('', '## Components', '');
  for (const concept of concepts.filter((item) => item.node.type === 'component')) {
    lines.push(`- ${markdownLink(titleFor(concept.node), concept.relPath)} (${concept.node.data?.kind || 'component'})`);
  }

  lines.push('', '## Future MCP Layer', '', 'MCP tools are intentionally left as a later phase on top of this stable bundle.');
  return `${yaml({
    type: 'RenDS Knowledge Bundle',
    title: 'RenDS Knowledge Bundle',
    description: 'Portable OKF-style knowledge bundle generated from RenDS source files.',
    packageName: 'ren10',
    packageVersion,
    graphNodes: graph.nodes.length,
    graphEdges: graph.edges.length,
    tags: ['rends', 'ren10', 'okf', 'knowledge-bundle'],
  })}${lines.join('\n')}\n`;
};

export const buildOkfConcepts = (graph, packageVersion) => {
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  const edgesBySource = new Map();
  for (const edge of graph.edges) {
    const list = edgesBySource.get(edge.source) ?? [];
    list.push(edge);
    edgesBySource.set(edge.source, list);
  }

  const pathById = new Map();
  for (const node of graph.nodes) {
    pathById.set(node.id, conceptPathForNode(node));
  }

  return graph.nodes
    .map((node) => {
      const relPath = pathById.get(node.id);
      const frontmatter = {
        type: typeFor(node),
        title: titleFor(node),
        description: `${typeFor(node)} generated from the RenDS knowledge graph.`,
        id: node.id,
        sourcePath: node.path ?? '',
        packageName: 'ren10',
        packageVersion,
        generatedFrom: 'knowledge/ren10-graph.json',
        stability: 'generated',
        tags: tagsForNode(node),
      };
      return {
        node,
        relPath,
        content: `${yaml(frontmatter)}${bodyForNode(node, relPath, edgesBySource, nodeById, pathById)}`,
      };
    })
    .sort((a, b) => a.relPath.localeCompare(b.relPath));
};

export const writeOkfBundle = ({ root, graphPath, outDir, packageJsonPath }) => {
  ensureSafeOutDir(root, outDir);
  const graph = readJson(graphPath);
  const packageJson = readJson(packageJsonPath);
  const packageVersion = packageJson.version ?? '0.0.0';
  const concepts = buildOkfConcepts(graph, packageVersion);

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.md'), buildIndex({ graph, packageVersion, concepts }));

  for (const concept of concepts) {
    const absPath = path.join(outDir, concept.relPath);
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    fs.writeFileSync(absPath, concept.content);
  }

  return {
    format: 'okf',
    outDir,
    indexPath: path.join(outDir, 'index.md'),
    concepts: concepts.length,
    nodes: graph.nodes.length,
    edges: graph.edges.length,
    packageVersion,
  };
};

export const checkOkfBundle = ({ root, graphPath, bundleDir }) => {
  const messages = [];
  const graph = fs.existsSync(graphPath) ? readJson(graphPath) : null;
  const files = listMarkdownFiles(bundleDir);
  const conceptFiles = files.filter((file) => path.basename(file) !== 'index.md' && path.basename(file) !== 'log.md');
  const ids = new Set();

  if (!fs.existsSync(path.join(bundleDir, 'index.md'))) messages.push('Missing OKF index.md.');
  for (const file of conceptFiles) {
    const parsed = parseFrontmatter(fs.readFileSync(file, 'utf8'));
    const relPath = toPosix(path.relative(root, file));
    if (!parsed) {
      messages.push(`${relPath} is missing YAML frontmatter.`);
      continue;
    }
    if (!parsed.data.type) messages.push(`${relPath} is missing required frontmatter field: type.`);
    if (!parsed.data.id) messages.push(`${relPath} is missing required frontmatter field: id.`);
    if (parsed.data.id) {
      if (ids.has(parsed.data.id)) messages.push(`Duplicate OKF concept id: ${parsed.data.id}`);
      ids.add(parsed.data.id);
    }
  }

  if (graph) {
    const expectedIds = new Set(graph.nodes.map((node) => node.id));
    if (conceptFiles.length !== graph.nodes.length) {
      messages.push(`Expected ${graph.nodes.length} OKF concepts, found ${conceptFiles.length}.`);
    }
    for (const id of expectedIds) {
      if (!ids.has(id)) messages.push(`Missing OKF concept for graph node: ${id}`);
    }
    for (const id of ids) {
      if (!expectedIds.has(id)) messages.push(`OKF concept does not exist in graph: ${id}`);
    }
  }

  return {
    ok: messages.length === 0,
    format: 'okf',
    path: bundleDir,
    concepts: conceptFiles.length,
    expectedConcepts: graph?.nodes.length ?? null,
    messages,
  };
};

export const visualizeOkfBundle = ({ bundleDir, outPath }) => {
  const files = listMarkdownFiles(bundleDir);
  const concepts = [];
  for (const file of files) {
    if (path.basename(file) === 'index.md') continue;
    const relPath = toPosix(path.relative(bundleDir, file));
    const content = fs.readFileSync(file, 'utf8');
    const parsed = parseFrontmatter(content);
    if (!parsed) continue;
    concepts.push({ path: relPath, frontmatter: parsed.data, body: parsed.body });
  }
  concepts.sort((a, b) => String(a.frontmatter.id).localeCompare(String(b.frontmatter.id)));

  const payload = JSON.stringify(concepts).replaceAll('</script', '<\\/script');
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>RenDS Knowledge Bundle</title>
  <style>
    body { margin: 0; font: 14px/1.5 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #111827; background: #f9fafb; }
    header { padding: 20px 24px; background: #111827; color: #fff; }
    main { display: grid; grid-template-columns: minmax(260px, 360px) 1fr; min-height: calc(100vh - 86px); }
    aside { border-right: 1px solid #d1d5db; background: #fff; overflow: auto; }
    input { box-sizing: border-box; width: calc(100% - 24px); margin: 12px; padding: 10px 12px; border: 1px solid #9ca3af; border-radius: 6px; }
    button { width: 100%; padding: 10px 12px; border: 0; border-top: 1px solid #e5e7eb; background: #fff; text-align: left; cursor: pointer; }
    button:hover, button[aria-current="true"] { background: #eef2ff; }
    article { padding: 24px; overflow: auto; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; background: #fff; border: 1px solid #e5e7eb; padding: 16px; border-radius: 6px; }
    dl { display: grid; grid-template-columns: max-content 1fr; gap: 6px 12px; }
    dt { font-weight: 700; }
    @media (max-width: 760px) { main { grid-template-columns: 1fr; } aside { max-height: 40vh; border-right: 0; border-bottom: 1px solid #d1d5db; } }
  </style>
</head>
<body>
  <header>
    <h1>RenDS Knowledge Bundle</h1>
    <p>${concepts.length} concepts generated from OKF-style markdown files.</p>
  </header>
  <main>
    <aside>
      <input id="search" type="search" placeholder="Search concepts" aria-label="Search concepts">
      <div id="list"></div>
    </aside>
    <article id="detail"></article>
  </main>
  <script type="application/json" id="bundle-data">${payload}</script>
  <script>
    const concepts = JSON.parse(document.getElementById('bundle-data').textContent);
    const list = document.getElementById('list');
    const detail = document.getElementById('detail');
    const search = document.getElementById('search');
    let selected = concepts[0]?.frontmatter?.id;
    const escapeHtml = (value) => String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
    const renderDetail = () => {
      const concept = concepts.find((item) => item.frontmatter.id === selected) || concepts[0];
      if (!concept) {
        detail.innerHTML = '<p>No concepts found.</p>';
        return;
      }
      detail.innerHTML = '<h2>' + escapeHtml(concept.frontmatter.title || concept.frontmatter.id) + '</h2>' +
        '<dl>' +
        Object.entries(concept.frontmatter).map(([key, value]) => '<dt>' + escapeHtml(key) + '</dt><dd>' + escapeHtml(Array.isArray(value) ? value.join(', ') : value) + '</dd>').join('') +
        '</dl><h3>Body</h3><pre>' + escapeHtml(concept.body) + '</pre>';
    };
    const renderList = () => {
      const q = search.value.trim().toLowerCase();
      const visible = concepts.filter((item) => {
        const haystack = [item.frontmatter.id, item.frontmatter.title, item.frontmatter.type, item.frontmatter.tags].join(' ').toLowerCase();
        return !q || haystack.includes(q);
      });
      list.innerHTML = visible.map((item) => '<button type="button" data-id="' + escapeHtml(item.frontmatter.id) + '" aria-current="' + (item.frontmatter.id === selected) + '"><strong>' + escapeHtml(item.frontmatter.title) + '</strong><br><small>' + escapeHtml(item.frontmatter.id) + '</small></button>').join('');
      for (const button of list.querySelectorAll('button')) {
        button.addEventListener('click', () => { selected = button.dataset.id; renderList(); renderDetail(); });
      }
    };
    search.addEventListener('input', renderList);
    renderList();
    renderDetail();
  </script>
</body>
</html>
`;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  return { format: 'okf', outPath, concepts: concepts.length };
};
