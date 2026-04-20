# Fase 7.9 — Visual regression baselines

**Fecha:** 19-abr-2026
**Estado:** completada

## Contexto

Con F7.7 cerrando el hex audit y F7.8 cerrando la última página de docs, el DS entra en un estado donde los tokens semánticos + temas + componentes han convergido. Momento para fijar **baselines visuales** que sirvan de red de seguridad contra regresiones futuras (cualquier cambio a un token semántico es, por definición, un cambio visual en cascada — sin baselines no hay forma de detectar cuándo uno de esos cambios salió del rango esperado).

## Entregables

### 1. Migración de API — `toMatchSnapshot` → `toHaveScreenshot`

`visual.spec.cjs` usaba `expect(locator).toMatchSnapshot('file.png', { maxDiffPixels, threshold })`. En Playwright actual esto falla con `TypeError: file.slice is not a function`: la firma de `toMatchSnapshot` quedó restringida a string/Buffer y las opciones de screenshot pasaron a `toHaveScreenshot`.

Migración: **33 ocurrencias** reemplazadas con un one-liner de Node:

```bash
node -e "const f='tests/visual/visual.spec.cjs'; const c=require('fs').readFileSync(f,'utf8'); require('fs').writeFileSync(f, c.replace(/\.toMatchSnapshot\(/g,'.toHaveScreenshot('))"
```

`toHaveScreenshot` además acepta los mismos `maxDiffPixels` / `threshold` sin cambios → migración clean, cero cambios de intención.

### 2. Matriz de proyectos — 8 combinaciones Chromium

`playwright.config.cjs` ya tenía los 10 proyectos definidos; los 8 que se ejercitan en sandbox son:

| Proyecto           | Device          | Viewport        | Color scheme |
|--------------------|-----------------|-----------------|--------------|
| Mobile Light/Dark  | Pixel 5         | 393×851         | light / dark |
| Tablet Light/Dark  | iPad Pro        | 1024×1366       | light / dark |
| Desktop Light/Dark | Desktop Chrome  | 1280×1024       | light / dark |
| Ultra-wide L/D     | Desktop Chrome  | 1920×1080       | light / dark |

Firefox y Safari projects existen en el config pero **requieren OS host deps que el sandbox actual no tiene**. Se documentaron como out-of-scope en F7.7 y permanecen así — se cubrirán con CI (GitHub Actions / máquina local).

### 3. Generación de baselines

Comando usado:

```bash
HOME=/tmp npx playwright test \
  --config=tests/visual/playwright.config.cjs \
  --project="Mobile Light"  --project="Mobile Dark" \
  --project="Tablet Light"  --project="Tablet Dark" \
  --project="Desktop Light" --project="Desktop Dark" \
  --project="Ultra-wide Light" --project="Ultra-wide Dark" \
  --output=/tmp/pw-results \
  --update-snapshots=all \
  tests/visual/visual.spec.cjs
```

**Resultado: 336 passed en 4.3 minutos.**

248 PNG baselines escritos en `tests/visual/visual.spec.cjs-snapshots/` — 31 snapshots únicos × 8 proyectos. (Las 47 specs totales incluyen varias que no toman screenshot — asserts funcionales de semántica HTML, labels de formulario, direction RTL, etc.)

Archivos siguen el patrón `{spec-id}-{project}-linux.png`, por ejemplo:

```
composites-accordion-Desktop-Dark-linux.png
composites-accordion-Desktop-Light-linux.png
composites-accordion-Mobile-Dark-linux.png
...
```

### 4. Escollos resueltos durante la generación

- **`Executable doesn't exist at …/headless_shell`** — Chromium no estaba en el cache de `playwright` del sandbox. Instalado con `HOME=/tmp npx playwright install chromium`.
- **`EPERM` en `test-results/.last-run.json`** — sandbox no permitía escribir en el path por defecto relativo. Fix: `--output=/tmp/pw-results` + `HOME=/tmp` para redirigir artefactos a tmpfs.
- **Working dir path mismatch** — `tests/visual/playwright.config.cjs does not exist` si se invoca desde fuera de `rends/`. Los comandos deben correr con `cwd=rends/`.

## Verificación

- Re-run del conjunto completo sin `--update-snapshots`: **336/336 pass** (diff 0 vs las baselines recién escritas — sanity check de determinismo).
- Desktop Light corrió aislado previamente para validar la migración de API: **42/42 pass**.
- Inventario de archivos en `visual.spec.cjs-snapshots/`: 248 PNGs (31 snapshots únicos × 8 projects, 124 light + 124 dark).

## Totales

- **+248 baseline PNGs** (31 snapshots × 8 projects Chromium).
- **1 migración de API** (33 `toMatchSnapshot` → `toHaveScreenshot`).
- **0 cambios en intención de las specs** — sólo sintaxis de matcher actualizada.

## Qué NO se tocó (intencional)

- **Firefox + Safari baselines**: OS deps no disponibles en sandbox. Se generarán en CI cuando se configure GitHub Actions con un runner Ubuntu estándar.
- **Threshold tuning por componente**: todos usan el default `threshold: 0.2, maxDiffPixels: 100` que trae `toHaveScreenshot`. Si algún componente resulta ser flaky en CI (típicamente los que animan o tienen texto sub-pixel), se ajustará por-spec en F7.10 o después.
- **Integración en pre-commit / pre-push hook**: queda para cuando el repo tenga CI hookeado; actualmente los tests son manuales local.

## Política post-F7.9

Cualquier PR que toque tokens semánticos, componentes CSS, o blocks/docs HTML **debe** correr `npm run test:visual` antes del merge y actualizar baselines deliberadamente con `--update-snapshots` cuando el cambio visual es intencional. Los diffs sin justificación → bug.
