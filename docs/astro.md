# RenDS + Astro

`@ren10/astro` is the official build-time adapter for using all 53 RenDS
components in Astro 7. It does not change the RenDS runtime model: generated
pages contain native HTML and Light DOM custom elements, with CSS and vanilla
JavaScript supplied by the canonical component contracts.

## Install

Use Node.js 22.12 or newer and Astro 7. On 2026-09-30, a query to the
public npm registry returned E404 for `@ren10/astro`, while `ren10`
was available at 0.14.0. The adapter source and generated wrappers are included
in this repository, but a successful local build is not proof of publication.
Use the local tarball route below until public installation is verified.

### Local tarball install

Build and pack both packages from the same trusted checkout. These commands
assume the checkout is version 0.14.0; if using a different version, use the
filenames printed by `npm pack`. Packing is local and does not publish to npm.

```bash
git clone https://github.com/Rensoconese/ren10.git
cd ren10
npm ci
npm run astro:generate
npm run build:bundles
mkdir -p ../ren10-packages
npm pack --pack-destination ../ren10-packages
npm pack --workspace @ren10/astro --pack-destination ../ren10-packages
cd ..
```

Copy and install the starter using both local tarballs in the same command.
This replaces its registry dependency ranges with local file references, so
npm does not try to fetch `@ren10/astro` from the registry:

```bash
cp -R ren10/starters/astro my-astro-site
cd my-astro-site
npm install ../ren10-packages/ren10-0.14.0.tgz ../ren10-packages/ren10-astro-0.14.0.tgz
npm run build
npm run dev
```

For an existing Astro 7 project, run that same `npm install` command from its
root, adjusting the relative tarball paths, then add the integration below.
Keep the tarballs at the referenced paths for reproducible installs, or vendor
them into the project and update its dependencies. Do not install the GitHub
repository as `@ren10/astro`: the repository root package is `ren10`.

### Public registry status and owner action

To check availability without installing anything:

```bash
npm view @ren10/astro@0.14.0 version --registry=https://registry.npmjs.org
```

The source package already declares public access and provenance. Both
`.github/workflows/release.yml` and `publish-retry.yml` contain scoped publish
steps. An npm owner must inspect publication logs, confirm permission to
publish under `@ren10`, and complete an authorized public release. E404 alone
does not identify the cause; local tests cannot verify account permissions.
Once that owner has verified a clean public install, consumers can use:

```bash
npm install astro@^7 ren10@^0.14.0 @ren10/astro@^0.14.0
```

### Configure the integration

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import ren10 from '@ren10/astro';

export default defineConfig({ integrations: [ren10()] });
```

The default integration injects `ren10/foundation.css` and
`ren10/themes/appearance.css`. Options are `css: 'foundation'` (default),
`css: 'all'`, `css: 'none'`, and `appearance: false`.

## Components

Use direct subpath imports in production:

```astro
---
import Button from '@ren10/astro/components/Button';
import Card from '@ren10/astro/components/Card';
---

<Card>
  <div class="ren-card-body ren-stack">
    <h2>Account</h2>
    <Button variant="primary">Save</Button>
  </div>
</Card>
```

Every wrapper is generated from the registry and validated `aiHints`. It
preserves the canonical host, forwards attributes, merges classes, imports
component CSS, and emits browser behavior as processed vanilla client script.
It introduces neither Shadow DOM nor framework hydration.

`@ren10/astro/components` exports the full barrel for exploration. It may make
Astro evaluate the complete catalog, so direct component subpaths are the
production contract. Machine-readable discovery is available from
`@ren10/astro/catalog.json` and `npx ren10 manifest --json`.

## Starter

`starters/astro/` is a buildable baseline with a layout, semantic theme
boundary, direct component imports, and an `AGENTS.md` that routes coding
agents into RenDS contracts.

## Match a visual reference

A person or multimodal agent first records observable properties using the
versioned `visual-reference-theme.schema.json`. RenDS then maps them to tokens
and repairs contrast deterministically:

```bash
npx ren10 theme visual-reference.json --out src/styles/theme.css --json
```

The result includes semantic CSS, required theme/density/shape attributes, an
accessibility report, and every repaired reference value. Page markup stays on
RenDS layouts and components; visual adaptation remains in the theme file.

## Agent workflow

```bash
npx ren10 manifest --json
npx ren10 build "describe the UI" --json
npx ren10 component <name> --dense
npx ren10 docs astro --dense
npx ren10 detect src --profile codex
npm run build
```

Use each catalog entry's `import` and read its `contract` before composing it.

### Cascade parity for selective components

Each component stylesheet declares the shared layer order and wraps its rules
in `@layer components`. Direct Astro component imports therefore have the same
cascade behavior as `index.css` and the generated bundles. Import
`ren10/foundation.css` once; keep application theme/overrides outside a layer
(or in an explicitly later layer). Do not add a second `layer(components)`
around a component import. See `MIGRATION.md` for older selective imports.
