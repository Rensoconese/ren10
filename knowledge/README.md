# RenDS Knowledge Graph

Packaged graph for agents and tools that need to understand RenDS from the
installed `ren10` npm package.

## Files

- `ren10-graph.sqlite` — primary SQLite database with FTS5 search.
- `ren10-graph.json` — fallback graph for agents that can read files but
  cannot open SQLite.

## CLI

```bash
npx ren10 manifest --json
npx ren10 build "dashboard with sidebar" --json
npx ren10 search "ren-toast status" --json
npx ren10 component toast --dense
npx ren10 docs layouts --dense
npx ren10 doctor
npx ren10 knowledge
npx ren10 knowledge query "ren-toast status"
npx ren10 knowledge query "ren-toast status" --json
npx ren10 knowledge check
```

The query command prefers SQLite when the local `sqlite3` CLI is available and
falls back to the packaged JSON graph when it is not.

All agent-facing JSON responses use this envelope:

```json
{
  "apiVersion": 1,
  "type": "knowledge.query",
  "data": {}
}
```

Use `--json` for typed machine output. Use `--source-json` only when you need
to force the packaged JSON graph instead of SQLite.

## What It Contains

Nodes:

- components
- contracts
- CSS files
- JavaScript files
- docs pages
- examples
- selectors
- tokens
- foundation contracts

Edges:

- `has_contract`
- `has_css`
- `has_js`
- `has_docs_page`
- `exposes_selector`
- `uses_token`
- `used_by_example`

This graph is generated from the repository source. Do not edit the generated
SQLite or JSON files by hand.
