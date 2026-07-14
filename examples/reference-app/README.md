# Ren10 reference workspace

This is the canonical consumer application for Ren10. It imports the package
source directly and demonstrates a cohesive app shell, persistent sidebar,
settings form, data table, modal dialog, explicit status feedback, empty-state
feedback, and immediate light/dark theme switching.

The application is vanilla HTML and JavaScript. All visual structure comes
from Ren10 layout primitives and contracted components; custom elements render
in Light DOM and native controls preserve browser semantics.

`visual-references.json` records the API-authority boundary and the reproducible
light, dark, and dialog-open capture scenarios. Ren10 package contracts and CLI
output remain authoritative for APIs. Figma may be used only as optional visual
input and never as API authority. Regenerate the PNG corpus with:

```sh
node scripts/capture-starter-visuals.mjs
```

## Run the focused checks

From the package root:

```sh
node --test scripts/check-starter-approval.test.mjs
npx playwright test --config tests/agent-starter/playwright.config.cjs
```

The approval metadata in `starter-validation.json` pins the package version,
the deterministic hash of this directory (excluding that metadata file), both
supported themes, the required scenarios, WCAG 2.1 AA plus axe enforcement,
and the explicit approval state.
