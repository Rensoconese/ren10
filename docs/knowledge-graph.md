# RenDS Knowledge Graph

Local, generated graph for querying RenDS contracts, component source, docs,
examples, selectors, and tokens.

This is both project tooling and a packaged aid for agents that install
`ren10` from npm.

## Why This Shape

- Keep the source of truth in the existing files: contracts, CSS, JS, docs, and
  examples.
- Generate the graph deterministically instead of hand-maintaining a second
  spec.
- Ship a prebuilt SQLite database plus FTS5 for search/querying when the
  `sqlite3` CLI is available.
- Ship a JSON fallback for agents that can read files but cannot open SQLite.
- Avoid `node:sqlite` for now because CI runs Node 20 and Node 22 still marks
  the built-in SQLite API as experimental.
- Avoid `better-sqlite3` for the first cut because it adds a native dependency.

## Commands

```bash
npm run knowledge:build
npm run knowledge:check
npm run knowledge:query -- "ren-toast status"
npm run knowledge:query -- "ren-toast status" --json
npm run agent:manifest
npm run agent:doctor
npm run agent:smoke
npm run agent:skill:check
npm run agent:skill:pack
npm run agent:check
npx ren10 manifest --json
npx ren10 search "dialog workflow" --json
npx ren10 build "dashboard with sidebar" --json
npx ren10 component button --dense
npx ren10 docs layouts --dense
npx ren10 doctor
npx ren10 knowledge
npx ren10 knowledge query "ren-toast status"
npx ren10 knowledge query "ren-toast status" --json
npx ren10 knowledge check
```

Generated and packaged files live in `knowledge/`:

- `knowledge/ren10-graph.json`
- `knowledge/ren10-graph.sqlite`

The generated files are included in the npm package, so an installed consumer
or agent can inspect `node_modules/ren10/knowledge/`.

Agent-facing JSON commands use a stable envelope:

```json
{
  "apiVersion": 1,
  "type": "search",
  "data": {}
}
```

Use `--json` for typed machine output. Use `--dense` when an agent needs a
compact Markdown summary that still points back to source contracts.

`knowledge:check` is the package/release gate. It regenerates the graph into a
temporary directory, compares the fresh JSON with the committed package JSON,
validates the packaged SQLite database logically, and checks that npm pack
includes the graph files.

## Current Schema

Nodes:

- `component`
- `contract`
- `css`
- `javascript`
- `docs_page`
- `example`
- `selector`
- `token`
- foundation contracts such as `design-contract`, `tokens-contract`, and
  `component-router`

Edges:

- `has_contract`
- `has_css`
- `has_js`
- `has_docs_page`
- `exposes_selector`
- `uses_token`
- `used_by_example`

## Current Check Layer

The check currently covers:

- Generated JSON freshness.
- SQLite integrity, row counts, node IDs, edge rows, and an FTS smoke query.
- Component coverage: 19 primitives, 26 composites, 8 patterns.
- Required contract, CSS, and docs edges for every component.
- Selector/token edge consistency.
- npm pack inclusion for `knowledge/README.md`, JSON, and SQLite.
- npm pack inclusion for the agent-ready roadmap, eval README, and versioned
  RenDS skill.
- Agent CLI JSON smoke coverage through `npm run agent:smoke`.

## Intended Next Layer

The next useful step is to make the graph checks more semantic, not only
structural:

- Contract/source drift: selector exists in CSS but not in the contract.
- Token drift: component uses a token not allowed by its contract.
- Docs drift: docs page references stale class names.
- Example coverage: public selectors or variants with no runnable example.
- Agent routing: given a prompt, return the relevant contract chain before
  generation starts.
