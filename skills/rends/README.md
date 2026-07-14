# RenDS Skill

Versioned agent skill for RenDS / `ren10`.

This directory is the canonical source for the distributable skill artifact.
It intentionally stays small and points agents back to the `ren10` CLI and the
authoritative contract files in the package.

## v0 adapter

`v0.json` configures the official v0 Design Systems 2.0 adapter. It points v0
at the canonical read-only source and starts new work from
`assets/starter/`, a framework-free application that already wires Ren10's
imports, theme behavior, layout primitives, and representative components.

`sources.json` records the source ref, allowed roots, explicit exclusions, and
package/skill version handshake. It prevents historical notes, `_archive/`,
legacy skill copies, screenshots, or Figma context from becoming accidental
API sources.

Validate the adapter and its starter before packaging:

```bash
npm run agent:v0:check
npm run test:agent-starter
```

When importing into v0, review both appearance and wiring before approving the
saved design system. A visual reference may influence composition, but only
the package contracts and CLI can authorize component APIs.

## Validate

```bash
npm run agent:skill:check
```

## Package

```bash
npm run agent:skill:pack
```

The pack command writes `dist/rends-skill-0.10.0.tgz` for the current package
version.
