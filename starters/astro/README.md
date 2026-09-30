# Ren10 Astro starter

Requires Node.js 22.12 or newer and Astro 7. As of 2026-09-30, public npm
returns E404 for `@ren10/astro`, so running `npm install` alone against this
starter's registry dependency ranges is not supported yet.

Follow the [local tarball install guide](https://github.com/Rensoconese/ren10/blob/main/docs/astro.md#local-tarball-install)
to build matching core and adapter packages, copy this starter, and install
both tarballs together. After installation:

```bash
npm run build
npm run dev
```

Keep the tarballs at the paths recorded in your project's `package.json` and
lockfile so later `npm install` / `npm ci` runs can find them. The guide also
explains how to verify public registry availability when publication is fixed.

The starter uses the official `@ren10/astro` integration, direct component
subpath imports, semantic theme overrides, and an `AGENTS.md` that teaches
coding agents how to discover and apply the complete RenDS contract.

To restyle the site from a visual reference, change the semantic values in
`src/styles/theme.css`; keep page composition on RenDS components and layouts.
