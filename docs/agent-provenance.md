# Agent Provenance

Agents that build Ren10 UI read a specific installed copy of the package. When
that copy is old, vendored, or shadowed by a user-installed skill, an agent can
faithfully apply a selector that the current contract no longer exposes. The
provenance checker makes the copy visible before any UI is generated.

## Run

```bash
node scripts/check-agent-provenance.mjs [path ...]
node scripts/check-agent-provenance.mjs --json .
node scripts/check-agent-provenance.mjs --skill /path/to/SKILL.md /path/to/project
```

Paths may be:

- a project directory (the checker resolves `node_modules/ren10`),
- a `ren10` package directory,
- a vendored foundation copy (a directory with `VERSION.md` but no
  `package.json`),
- a `skills/rends` directory, or
- a `SKILL.md` file.

With no path it inspects the current working directory. The command is
read-only: it never writes files, never edits a global skill, and never reads
credentials or environment variables. It always exits `0` when no error
diagnostics are found; warnings alone do not fail the check.

## What It Reports

For each target:

- **Installed version** — the `version` from the resolved `ren10`
  `package.json`.
- **Resolved path** — the real path after symlink resolution, so a linked or
  vendored copy is visible.
- **Contract hashes** — `sha256` digests for a selected set of public
  contracts (`ren-design.md`, `tokens/tokens.md`, `base/layouts.md`,
  `components/components.md`, and the `ren-tabs` component contract). The
  hashes identify the exact installed contract text.
- **Skill findings** — legacy selectors still taught by the supplied skill.

## Legacy Tab Selector

The tabs trigger row is `.ren-tab-list`. Older skills and archived notes
sometimes teach `.ren-tabs-list`, which the current contract does not expose.
The checker scans `SKILL.md` and `README.md` in the supplied skill and reports
an **error** for a line that presents the legacy selector as real guidance.

To avoid brittle false positives, a mention is downgraded to a **warning**
when a deprecation instruction explicitly refers to that selector, such as
"never use .ren-tabs-list" or ".ren-tabs-list is not valid". An unrelated
word such as "not" elsewhere in the sentence does not exempt stale guidance. This lets a skill
teach the difference without failing the check.

## Foundation-Only Copies

Some projects vendor only the foundation of the package. A `VERSION.md` file
in the copy marks it. Such a copy may have **no `package.json`** — for example
a host project that copies `foundation.css`, `tokens/`, and `base/` instead of
installing the npm package:

```text
ren10 0.13.0
foundation layer vendored by the host project
```

When no `ren10` `package.json` resolves, the checker looks for this marker at
the given path, in conventional vendor subdirectories (`ren10/`,
`vendor/ren10/`, `src/styles/ren10/`, `assets/ren10/`,
`public/ren10/`, `src/vendor/ren10/`), and in parent directories. A `VERSION.md` counts as a ren10
marker when Ren10/RenDS identity and actual package files agree. A generic
"foundation" or "vendored" note is not enough. The checker also recognizes a
RenDS-branded foundation stylesheet paired with token files. A full package
mentioning foundation does not bypass public-contract checks.

A foundation-only copy intentionally ships fewer contracts, so missing
composite contracts are reported as a warning instead of an error. The
checker reads the version or source commit from `VERSION.md`; when a `package.json` is also
present it compares the two and flags drift. A vendored copy with neither a readable version nor a source commit gets an actionable diagnostic instead of a bare failure.

## Fixing Findings

- If the installed version is wrong or missing, run
  `npm install ren10@<version>` in the project.
- If the installed contract is stale, reinstall the package.
- If a skill teaches `.ren-tabs-list`, update it to route to the installed
  contracts and CLI (`npx ren10 component tabs --dense`) instead of copying a
  selector from memory.
- If the project intentionally vendors a subset, add a `VERSION.md` marker so
  the partial copy is recognized.

## Package Script

```bash
npm run agent:provenance
```

runs the packaged checker from a Ren10 checkout. In a consumer project use
`node node_modules/ren10/scripts/check-agent-provenance.mjs .`. The script is
shipped in the package and requires only Node. Hashes also include layout and
card CSS so equal version strings do not hide differing implementations.
