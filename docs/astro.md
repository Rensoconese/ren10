# RenDS + Astro

`@ren10/astro` is the official build-time adapter for using all 53 RenDS
components in Astro 7. It does not change the RenDS runtime model: generated
pages contain native HTML and Light DOM custom elements, with CSS and vanilla
JavaScript supplied by the canonical component contracts.

## Install

```bash
npm install astro ren10 @ren10/astro
```

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
