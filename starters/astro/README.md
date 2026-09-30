# Ren10 Astro starter

Use a current Node.js 22 LTS release (22.19 or newer for the locked
dependencies) and Astro 7. Verify both package versions in the installation
guide before installing from npm. If the adapter version returns E404
(observed for 0.14.0 on 2026-09-30), use the local fallback.

Follow the [local tarball install guide](https://github.com/Rensoconese/ren10/blob/main/docs/astro.md#local-tarball-install)
to build matching core and adapter packages, copy this starter, and install
both tarballs together. After installation:

```bash
npm run build
npm run dev
```

When using local tarballs, keep them at the paths recorded in your project's
`package.json` and lockfile so later `npm install` / `npm ci` runs can find them.

The starter uses the official `@ren10/astro` integration, direct component
subpath imports, semantic theme overrides, and an `AGENTS.md` that teaches
coding agents how to discover and apply the complete RenDS contract.

To restyle the site from a visual reference, change the semantic values in
`src/styles/theme.css`; keep page composition on RenDS components and layouts.
