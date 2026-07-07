# RenDS Skill

Versioned agent skill for RenDS / `ren10`.

This directory is the canonical source for the distributable skill artifact.
It intentionally stays small and points agents back to the `ren10` CLI and the
authoritative contract files in the package.

## Validate

```bash
npm run agent:skill:check
```

## Package

```bash
npm run agent:skill:pack
```

The pack command writes `dist/rends-skill-0.9.1.tgz` for the current package
version.
