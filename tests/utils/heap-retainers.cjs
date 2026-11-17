// @ts-check
/**
 * Why is this object still alive? Chromium only, over CDP.
 *
 * The retention test in tests/components/leaks.spec.cjs counts the element
 * instances that survive a garbage collection. A count does not say what holds
 * them, and the holder is not always the component: an engine can keep a
 * removed node reachable on its own. `describeSurvivors` turns a red run into
 * an answer: for each survivor, where it is (connected, focused, its parent)
 * and the shortest chain of references from a garbage-collection root to it,
 * read from a heap snapshot.
 *
 * It only runs when the test is already failing: a snapshot of the fixture
 * page is a few megabytes and a second or two.
 */

/**
 * @typedef {import('@playwright/test').CDPSession} CDPSession
 * @typedef {{meta: any, nodes: number[], edges: number[], strings: string[]}} Snapshot
 */

/**
 * Take a heap snapshot with the engine's own class names in it
 * (`blink::StyleEngine` instead of `InternalNode`).
 * @param {CDPSession} client
 * @returns {Promise<Snapshot>}
 */
async function takeHeapSnapshot(client) {
  const chunks = [];
  const collect = ({ chunk }) => chunks.push(chunk);
  client.on('HeapProfiler.addHeapSnapshotChunk', collect);
  try {
    await client.send('HeapProfiler.takeHeapSnapshot', { reportProgress: false, exposeInternals: true });
  } finally {
    client.off('HeapProfiler.addHeapSnapshotChunk', collect);
  }
  const parsed = JSON.parse(chunks.join(''));
  return { meta: parsed.snapshot.meta, nodes: parsed.nodes, edges: parsed.edges, strings: parsed.strings };
}

/**
 * Shortest chain of strong references from the snapshot's root to each of the
 * nodes with the given snapshot ids. Pure: no browser involved.
 *
 * Each hop reads "holder --edge--> held". Weak edges are skipped (they keep
 * nothing alive), and so is everything reached only through them.
 *
 * @param {Snapshot} snapshot
 * @param {number[]} ids heap snapshot object ids (HeapProfiler.getHeapObjectId)
 * @returns {Map<number, string[] | null>} id → hops from the root, or null when the
 *   object is not in the snapshot or not strongly reachable
 */
function retainerPaths(snapshot, ids) {
  const { meta, nodes, edges, strings } = snapshot;
  const nodeSize = meta.node_fields.length;
  const edgeSize = meta.edge_fields.length;
  const at = { type: meta.node_fields.indexOf('type'), name: meta.node_fields.indexOf('name'), id: meta.node_fields.indexOf('id'), edges: meta.node_fields.indexOf('edge_count') };
  const edgeAt = { type: meta.edge_fields.indexOf('type'), name: meta.edge_fields.indexOf('name_or_index'), to: meta.edge_fields.indexOf('to_node') };
  const nodeTypes = meta.node_types[at.type];
  const edgeTypes = meta.edge_types[edgeAt.type];
  const count = nodes.length / nodeSize;

  // Edges are stored in node order: where each node's edges start.
  const firstEdge = new Uint32Array(count + 1);
  for (let n = 0; n < count; n += 1) firstEdge[n + 1] = firstEdge[n] + nodes[n * nodeSize + at.edges];

  const wanted = new Map();
  for (let n = 0; n < count; n += 1) {
    const id = nodes[n * nodeSize + at.id];
    if (ids.includes(id)) wanted.set(n, id);
  }

  // Breadth-first from the root (node 0), so the first visit is a shortest path.
  const cameFrom = new Int32Array(count).fill(-1);
  const viaEdge = new Int32Array(count).fill(-1);
  const queue = new Uint32Array(count);
  let head = 0;
  let tail = 0;
  queue[tail++] = 0;
  cameFrom[0] = 0;
  let pending = wanted.size;
  while (head < tail && pending > 0) {
    const n = queue[head++];
    for (let e = firstEdge[n]; e < firstEdge[n + 1]; e += 1) {
      if (edgeTypes[edges[e * edgeSize + edgeAt.type]] === 'weak') continue;
      const to = edges[e * edgeSize + edgeAt.to] / nodeSize;
      if (cameFrom[to] !== -1) continue;
      cameFrom[to] = n;
      viaEdge[to] = e;
      if (wanted.has(to)) pending -= 1;
      queue[tail++] = to;
    }
  }

  const nodeLabel = (n) => {
    const name = strings[nodes[n * nodeSize + at.name]] || '(unnamed)';
    // Long enough for a templated engine type to still say what it is a table of.
    return `${name.length > 240 ? `${name.slice(0, 237)}...` : name} [${nodeTypes[nodes[n * nodeSize + at.type]]}]`;
  };
  const edgeLabel = (e) => {
    const type = edgeTypes[edges[e * edgeSize + edgeAt.type]];
    const name = edges[e * edgeSize + edgeAt.name];
    // Elements and hidden edges carry an index, the rest a string.
    return type === 'element' || type === 'hidden' ? `[${name}]` : `${strings[name]}${type === 'property' ? '' : ` (${type})`}`;
  };

  const paths = new Map(ids.map((id) => [id, null]));
  for (const [n, id] of wanted) {
    if (cameFrom[n] === -1) continue;
    const hops = [];
    for (let cursor = n; cursor !== 0; cursor = cameFrom[cursor]) {
      hops.unshift(`${nodeLabel(cameFrom[cursor])} --${edgeLabel(viaEdge[cursor])}--> ${nodeLabel(cursor)}`);
    }
    paths.set(id, hops);
  }
  return paths;
}

/**
 * Runs in the page with `this` bound to the array of survivors.
 * @this {Element[]}
 */
function survivorFacts() {
  const describe = (node) => {
    if (!node) return 'none';
    if (node === document) return 'document';
    if (node.nodeType !== Node.ELEMENT_NODE) return node.nodeName;
    const classes = typeof node.className === 'string' && node.className.trim() ? `.${node.className.trim().split(/\s+/).join('.')}` : '';
    return `<${node.localName}${node.id ? `#${node.id}` : ''}${classes}>`;
  };
  const active = document.activeElement;
  return this.map((el) => {
    let top = el;
    while (top.parentNode) top = top.parentNode;
    return {
      element: describe(el),
      connected: el.isConnected,
      isActiveElement: el === active,
      containsActiveElement: el !== active && el.contains(active),
      parent: describe(el.parentNode),
      // The top of the detached tree it sits in: the element itself when it was removed on its own.
      root: top === el ? 'itself' : describe(top),
      children: el.childElementCount,
    };
  });
}

/**
 * Describe what keeps removed elements alive.
 *
 * The snapshot is taken before the survivors are looked up, so the handles
 * this function itself holds on them are not in it and cannot show up as the
 * retainer.
 *
 * @param {CDPSession} client
 * @param {{tag: string} | {label: string, expression: string}} target the instances of a
 *   custom element class, or an expression that evaluates to an array of elements
 * @param {{limit?: number}} [options] how many survivors to trace (they usually share one cause)
 * @returns {Promise<string>} a report for the failure message
 */
async function describeSurvivors(client, target, { limit = 2 } = {}) {
  const group = 'heap-retainers';
  const label = 'tag' in target ? `<${target.tag}>` : target.label;
  const lines = [];
  try {
    await client.send('HeapProfiler.collectGarbage');
    const snapshot = await takeHeapSnapshot(client);

    let elements;
    if ('tag' in target) {
      const prototype = await client.send('Runtime.evaluate', { expression: `customElements.get(${JSON.stringify(target.tag)}).prototype`, objectGroup: group });
      const { objects } = await client.send('Runtime.queryObjects', { prototypeObjectId: prototype.result.objectId, objectGroup: group });
      // Elements only: the query also returns the prototypes of subclasses.
      elements = await client.send('Runtime.callFunctionOn', {
        objectId: objects.objectId,
        functionDeclaration: `function () {
          return this.filter((object) => {
            try { return object.nodeType === Node.ELEMENT_NODE; } catch { return false; }
          });
        }`,
        objectGroup: group,
      });
    } else {
      elements = await client.send('Runtime.evaluate', { expression: target.expression, objectGroup: group });
    }
    const facts = await client.send('Runtime.callFunctionOn', {
      objectId: elements.result.objectId,
      functionDeclaration: survivorFacts.toString(),
      returnByValue: true,
    });
    const { result: properties } = await client.send('Runtime.getProperties', { objectId: elements.result.objectId, ownProperties: true });
    const handles = properties.filter((property) => /^\d+$/.test(property.name) && property.value?.objectId);

    lines.push(`${label}: ${handles.length} alive after garbage collection.`);
    const summary = new Map();
    for (const fact of facts.result.value) {
      const key = JSON.stringify(fact);
      summary.set(key, (summary.get(key) ?? 0) + 1);
    }
    for (const [key, times] of summary) lines.push(`  ${times} × ${key}`);

    const ids = [];
    for (const handle of handles.slice(0, limit)) {
      const { heapSnapshotObjectId } = await client.send('HeapProfiler.getHeapObjectId', { objectId: handle.value.objectId });
      ids.push(Number(heapSnapshotObjectId));
    }
    const paths = retainerPaths(snapshot, ids);
    ids.forEach((id, index) => {
      const hops = paths.get(id);
      lines.push(`  Shortest retaining path to survivor ${index + 1} of ${handles.length} (root first):`);
      if (!hops) lines.push('    not found in the snapshot: it was created after it, or only weak references reach it');
      else for (const hop of hops) lines.push(`    ${hop}`);
    });
    lines.push('  Read a path from the bottom: the first holder that is not part of the removed subtree is what to fix.');
    lines.push('  Script objects on the way (a Context, a closure, an Array, a listener) mean page code holds it.');
    lines.push('  Only engine nodes between the document and the survivor (StyleEngine, a blink:: table) mean the browser holds it.');
  } catch (error) {
    lines.push(`${label}: could not finish the heap diagnosis: ${error.message}`);
  } finally {
    await client.send('Runtime.releaseObjectGroup', { objectGroup: group }).catch(() => {});
  }
  return lines.join('\n');
}

module.exports = { takeHeapSnapshot, retainerPaths, describeSurvivors };
