# Ren10 + Astro agent contract

This project uses RenDS through `@ren10/astro`. Treat the installed `ren10`
package as the source of truth.

Before editing UI, read in this order:

1. `node_modules/ren10/ren-design.md`
2. `node_modules/ren10/tokens/tokens.md` for visual decisions
3. `node_modules/ren10/base/layouts.md` before layout CSS
4. `node_modules/ren10/components/components.md`
5. The colocated `component.md` or `pattern.md` for every part used

Discover before generating:

```bash
npx ren10 manifest --json
npx ren10 build "describe the requested UI" --json
npx ren10 component button --dense
```

Astro rules:

- Import production components from direct subpaths such as
  `@ren10/astro/components/Button`, not from the full catalog barrel.
- Use RenDS layout classes instead of bespoke flex or grid CSS.
- Keep native HTML and Light DOM; do not add Shadow DOM or framework wrappers.
- Use semantic or component tokens. Put brand changes in
  `src/styles/theme.css`, not scattered through pages.
- Preserve accessible names, keyboard behavior, focus visibility, and reduced
  motion behavior.
- Run `npm run check:design` and `npm run build` before completion.
- For visual references, create a schema-v1 reference JSON and run
  `npx ren10 theme reference.json --out src/styles/theme.css --json`.
