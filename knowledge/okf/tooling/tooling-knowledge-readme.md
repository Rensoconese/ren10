---
type: "RenDS Tooling"
title: "Packaged knowledge graph readme"
description: "RenDS Tooling generated from the RenDS knowledge graph."
id: tooling:knowledge-readme
sourcePath: knowledge/README.md
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - ren10
  - rends
  - tooling-doc
---

# Packaged knowledge graph readme

Source path: `knowledge/README.md`

## Relationships

_No outgoing relationships._

## Source Content

# RenDS Knowledge

Packaged knowledge for agents and tools that need to understand RenDS from the
installed `ren10` npm package.

## Files

- `ren10-graph.sqlite` — primary SQLite database with FTS5 search.
- `ren10-graph.json` — fallback graph for agents that can read files but
  cannot open SQLite.
- `okf/**/*.md` — portable RenDS Knowledge Bundle with YAML frontmatter and
  relative links between concepts.

The colocated RenDS contracts (`component.md`, `pattern.md`, and the foundation
contracts) remain authoritative. JSON, SQLite, and the Markdown bundle are
deterministic indexes generated from repository source; do not edit them by
hand.

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
npx ren10 knowledge export --format okf --out knowledge/okf
npx ren10 knowledge check --format okf
npx ren10 knowledge visualize --out knowledge/okf/viz.html
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

See `docs/knowledge-graph.md` for the stable RenDS Knowledge Bundle contract,
frontmatter fields, validation guarantees, and future MCP boundary.
