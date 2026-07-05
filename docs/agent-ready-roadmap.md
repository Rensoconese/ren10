# RenDS Agent-Ready Roadmap

This roadmap translates the useful ideas from Meta Astryx into RenDS package
work. The goal is not to copy Astryx. RenDS has a different product shape: it
is a vanilla design system, so agents need contracts, retrieval, composition
guidance, and verification more than they need a full component authoring
framework.

## Principles

- Keep Markdown contracts as the authoring source of truth.
- Expose a typed, discoverable CLI so agents can query before generating UI.
- Prefer dense summaries for model context and full contracts for humans.
- Make every machine output valid JSON with an explicit `apiVersion` and
  response `type`.
- Ship the graph and agent docs in the npm package so installed consumers get
  the same guidance as repository contributors.
- Use doctor/check commands to catch drift before publishing.

## Phase 1: Agent Surface

Status: implemented in the CLI.

- `ren10 manifest --json` returns package metadata, command specs, response
  types, docs topics, and package paths.
- `ren10 component <name> --dense|--json` returns contract paths, imports,
  dependencies, usage, and `aiHints`.
- `ren10 docs <topic> --dense|--json` exposes the root design contract, token
  contract, layout primitives, Primitive Zero, component router, evals, graph
  docs, and this roadmap.
- `ren10 search "<query>" --json` searches the packaged graph and adds a
  follow-up command to each result.
- `ren10 build "<intent>" --json` returns a small composition kit: start
  commands, layout frame guidance, related components, docs, examples, and
  token docs.
- `ren10 doctor --json` reports package health and agent-readiness checks.
- `ren10 agent-docs` installs an idempotent generated block into common agent
  guidance files.
- `ren10 knowledge query --json` now emits real typed JSON instead of switching
  graph sources. Use `--source-json` only to force the JSON graph.

## Phase 2: Contract Normalization

Planned.

- Define a small schema for `aiHints` so every component can expose the same
  fields: canonical imports, required markup, forbidden patterns, accessibility
  rules, related components, and examples.
- Add validation that every documented selector, attribute, event, CSS file,
  JS file, and example referenced by a contract exists in the graph.
- Normalize component names, tags, directories, and docs pages into a single
  generated index consumed by the CLI and release checks.
- Keep generated data deterministic so diffs reveal real contract changes.

## Phase 3: Retrieval Quality

Planned.

- Rank graph results by component names, tags, selectors, contract headings,
  examples, and token names instead of raw text match alone.
- Add query recipes for common UI tasks such as dashboards, settings forms,
  authentication, dialogs, command palettes, data tables, and AI panels.
- Return evidence with every recommendation: contract path, example path, and
  the exact follow-up CLI command.
- Add compact graph snapshots for agents that cannot read SQLite.

## Phase 4: Evals and Drift Gates

Planned.

- Add CLI smoke tests for all typed JSON commands.
- Add eval prompts for multi-component workflows and multi-turn agent repair.
- Extend `knowledge:check` to catch selector drift, token drift, docs drift,
  example coverage gaps, and stale `aiHints`.
- Require `npm run agent:check` before release once the new gates stabilize.

## Phase 5: Distribution

Planned.

- Include the agent docs, graph, roadmap, and eval overview in the npm package.
- Document the recommended installed-package workflow:

  ```bash
  npx ren10 manifest --json
  npx ren10 build "settings form with sidebar" --json
  npx ren10 component form --dense
  npx ren10 doctor
  ```

- Keep repository `AGENTS.md`, `CLAUDE.md`, `.cursorrules`,
  `.windsurfrules`, and `rends-skill/SKILL.md` synchronized with the CLI
  loading order.

## Current Definition of Done

- New agent-facing commands return parseable JSON.
- `doctor` reports no failures.
- `npm run lint`, `npm run test:evals`, and `npm run knowledge:check` pass.
- Stale uppercase contract references are absent.
- Component contract counts remain 19 primitives, 26 composites, and 8
  patterns.
