# @ren10/astro

Official Astro integration for RenDS. It keeps RenDS framework-free and emits
native HTML plus Light DOM custom elements.

```bash
npx astro add @ren10/astro
```

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import ren10 from '@ren10/astro';

export default defineConfig({
  integrations: [ren10()],
});
```

```astro
---
import Button from '@ren10/astro/components/Button';
import Card from '@ren10/astro/components/Card';
---

<Card>
  <Button variant="primary">Save</Button>
</Card>
```

The default integration imports `ren10/foundation.css` and the appearance
presets. Generated components import their own CSS and browser behavior.

The `@ren10/astro/components` barrel exports the complete catalog for discovery
and prototypes. Prefer subpath imports in production so Astro can bundle only
the CSS and client modules used by the page.

Agents and tooling can discover every adapter without evaluating the barrel:

```js
import catalog from '@ren10/astro/catalog.json' with { type: 'json' };
```

Full usage, starter, theming, and agent guidance lives in
`ren10/docs/astro.md`.
