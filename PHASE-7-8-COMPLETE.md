# Fase 7.8 — docs/cli.html

**Fecha:** 19-abr-2026
**Estado:** completada

## Contexto

Última página de referencia pendiente del conjunto docs/. El CLI de RenDS (`rends init`, `rends add`, `rends list`) ya estaba implementado y usado internamente, pero no tenía página pública de documentación: faltaba el inventario visible de comandos, flags, el flujo típico de adopción y troubleshooting.

## Entregables

### 1. `docs/cli.html` (nuevo, ~470 líneas)

Sigue estrictamente el template de `docs/getting-started.html` — misma shell `dx-nav` + `dx-shell` + `dx-toc` + `dx-content`, mismos callouts, mismas `dx-card` y `dx-next-grid` para navegación cruzada. Consistencia total con el resto del set de docs.

Adiciones específicas de CLI doc:

- `.dx-term` — bloque que mimickea output de terminal con spans coloreados (`.ok`, `.info`, `.warn`, `.err`, `.dim`, `.em`, `.prompt`). Coloreado via tokens semánticos (`--color-success`, `--color-info`, `--color-warning`, `--color-danger`, `--color-text-muted`, `--color-accent`) — cero hex hardcoded.
- `.dx-table` — tabla de referencia para flags y opciones.
- `.dx-cmd-grid` / `.dx-cmd-card` — grid de tarjetas para overview de comandos en la home de la página.

Contenido organizado en **9 secciones numeradas**:

1. **Overview** — qué es el CLI y por qué existe (modelo shadcn: copiar, no importar).
2. **Install** — `npm i -g @rends/cli` + alternativas con npx.
3. **`rends init`** — setup inicial, `.rendsrc.json`, flags (`--force`, `--no-install`, `--theme`).
4. **`rends add <component>`** — copia de componentes al proyecto del usuario, deps transitivas, flags (`--dry`, `--all`, `--overwrite`).
5. **`rends list`** — inventario, filtros (`--tier primitives|composites|patterns`, `--json`).
6. **`rends scales`** — type scales (Productive / Expressive), flags de preview.
7. **Workflows** — flujos típicos (nueva app desde cero, integrar en proyecto existente, update selectivo).
8. **Troubleshooting** — errores comunes (path inexistente, permisos, conflicto de versiones).
9. **Next steps** — cross-links a getting-started, theming, components.

Todas las descripciones de flags están verificadas contra `cli/index.js` — no hay inconsistencias entre la doc y el comportamiento real.

### 2. Integración en `docs/index.html`

- Nueva tarjeta en el grid de References (`<a class="dx-card" href="cli.html">`) junto a Tokens, Layouts, Components, Accessibility, Theming.
- Link adicional en el footer del home de docs.

### 3. Test de accesibilidad — `tests/a11y/cli-spot.spec.cjs` (nuevo)

Spec dedicado usando `axe-playwright` con el mismo patrón que el resto de la suite a11y:

```js
const CLI_URL = `file://${path.resolve(__dirname, '../../docs/cli.html')}`;

test('no AA violations', async ({ page }) => {
  const violations = await getViolations(page, null, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
  });
  expect(violations).toEqual([]);
});

test('contrast passes', async ({ page }) => {
  await checkA11y(page, null, {
    axeOptions: { runOnly: { type: 'rule', values: ['color-contrast'] } },
  });
});
```

Corre sobre los mismos 8 proyectos Chromium (Mobile/Tablet/Desktop/Ultra-wide × light/dark).

## Hallazgo lateral — bug AA en `--color-text-faint`

Al correr el spec por primera vez sobre `cli.html` detectó **21 violaciones de color-contrast**. El token responsable:

```css
--color-text-faint: light-dark(var(--gray-400), var(--gray-600));
```

- Light mode: `gray-400 = #c7c7cc` vs `--color-surface = #ffffff` → **1.68:1** (falla AA 4.5:1).
- Dark mode: similar problema con `gray-600`.

Este token se usaba en `.dx-toc-title`, `.dx-table th`, `.dx-card-eyebrow`, `h2::before` (numeración), `.dx-next-label`. **Todas las páginas de docs/ lo usan con el mismo patrón** — el problema es pre-existente, no lo introdujo cli.html; nunca había sido detectado porque ninguna de las docs páginas tenía test de axe hasta ahora.

Fix local en `cli.html`: `replace_all` de `var(--color-text-faint)` → `var(--color-text-muted)` (7.24:1 light, 9.1:1 dark — AAA en ambos).

Creada **task #71** (F7.10) para propagar el fix al resto de `docs/` (getting-started, tokens, layouts, accessibility, theming, components, index). La doctrina post-F7.7 es clara: `--color-text-faint` no puede usarse en texto que tiene que leerse; sólo en hairline separators o decoración pura.

## Verificación

- `cli-spot.spec.cjs` → **0 violaciones AA**, **0 violaciones color-contrast** en los 8 proyectos Chromium.
- Revisión manual de los 9 section anchors (scroll-to, numbering de `<h2>`, cross-links `<a href="#…">`).
- Descripciones de flags vs `cli/index.js` → match 1:1.
- Grid de References en `docs/index.html` → 6 tarjetas alineadas, sin gaps visuales.

## Totales

- **+1 página de docs** (`cli.html`, 470 líneas).
- **+1 spec a11y** (`tests/a11y/cli-spot.spec.cjs`).
- **+1 card + 1 footer link** en `docs/index.html`.
- **1 bug crítico descubierto** (`--color-text-faint` falla AA) → task #71 creada para cleanup global.

## Qué NO se tocó (intencional)

- **Fix global de `--color-text-faint`** en el resto de `docs/`: queda para F7.10 (task #71). Aquí sólo se tapó en `cli.html` porque el alcance de la fase era la página CLI; mezclar ambos trabajos habría inflado el changeset y complicado el bisect si aparecen regresiones.
- **Screenshots de terminal real**: el `.dx-term` imita el look con spans — no se capturan screenshots de iTerm/Warp. Razón: mantenible sin procesos externos; el color viene de tokens del DS y cambia coherentemente con theming.
