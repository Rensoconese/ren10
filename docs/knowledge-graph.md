# RenDS Knowledge Graph and Bundle

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
- Ship portable Markdown concepts for tools that work best with plain files,
  frontmatter, and links instead of a database API.
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
npx ren10 knowledge export --format okf --out knowledge/okf
npx ren10 knowledge check --format okf
npx ren10 knowledge visualize --out knowledge/okf/viz.html
```

Generated and packaged files live in `knowledge/`:

- `knowledge/ren10-graph.json`
- `knowledge/ren10-graph.sqlite`
- `knowledge/okf/index.md`
- `knowledge/okf/**/*.md`

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

`knowledge:check` is the package/release gate. It regenerates the graph and
bundle into temporary directories, compares them with the committed package
artifacts, validates graph/bundle parity, validates SQLite logically, and
checks that npm pack includes representative files from every format.

## RenDS Knowledge Bundle Contract

`knowledge/okf/` is the stable, portable **RenDS Knowledge Bundle** format. It
is OKF-style Markdown rather than a claim of compatibility with every external
OKF implementation. Version 0.9.4 establishes these guarantees:

- `index.md` describes the package version, graph counts, concept types, and
  component entry points.
- Every other Markdown file represents exactly one graph node.
- Every concept starts with YAML frontmatter and has a unique stable `id`.
- Links between concepts are relative, so the directory can be moved or read
  from an unpacked npm package.
- Concept paths are organized by domain (`components/`, `tokens/`,
  `selectors/`, `docs/`, `examples/`, `foundation/`, and source types).
- Regeneration is deterministic for the same source tree and package version.

Required concept frontmatter:

```yaml
---
type: RenDS Component
title: ren-button
description: RenDS Component generated from the RenDS knowledge graph.
id: component:primitive:ren-button
sourcePath: components/primitives/ren-button
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - primitive
  - ren10
  - rends
---
```

The contracts under `components/**/component.md`,
`components/**/pattern.md`, `ren-design.md`, `tokens/tokens.md`, and the other
foundation docs remain the source of truth. `ren10-graph.json` and SQLite are
fast indexes; `knowledge/okf/` is a portable projection. A mismatch is a build
failure, not a second specification to reconcile manually.

The CLI accepts an explicit output directory so consumers can create their own
bundle without modifying the installed package:

```bash
npx ren10 knowledge export --format okf --out ./knowledge/okf
npx ren10 knowledge check --format okf --path ./knowledge/okf
npx ren10 knowledge visualize --path ./knowledge/okf --out ./knowledge/okf/viz.html
```

The visualizer is a self-contained local HTML search/detail view generated on
demand. It is not required for bundle validity.

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
- Fresh deterministic OKF Markdown output and one-to-one graph node parity.
- Required frontmatter, unique concept IDs, and npm pack inclusion for the
  bundle index and representative component concepts.
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

MCP remains a later transport layer. It should expose the same stable contracts
and generated indexes without becoming a new source of truth.
