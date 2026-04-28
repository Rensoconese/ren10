# RenDS — Roadmap

**Repo:** [github.com/Rensoconese/ren10](https://github.com/Rensoconese/ren10)
**Versión actual en disco:** `0.8.1` (release packaging real: pendiente)
**Última fase trabajada:** F7.27 (23-abr-2026) — loop motion tokens centralizados (`--duration-loop*` / `--ease-loop*`), `suggestAlternativeHues` en theme generator, spinner/skeleton/icon migrados a tokens semánticos
**Fecha del roadmap:** 27-abr-2026 (refresh)
**Vista ejecutiva (1 pág):** [`STATUS.md`](./STATUS.md)

---

## Estado real (verificado contra el árbol del repo, no contra los PHASE docs)

Algunos PHASE docs declararon como "pendiente" trabajo que ya se cerró en releases posteriores. Antes de planificar, este es el estado verificado.

> **Nota (27-abr-2026):** los 6 ítems comúnmente identificados como "lo que falta para que ren10 sea producto" (tags+commits, npm publish, CI/CD, gobernanza del repo, deploy de docs, cierre de `Unreleased`) están todos cubiertos por los **Hitos 1–5** de este documento. F7.8 y F7.9 están cerrados desde v0.7.1 — la "deuda chica" residual son los items de Hito 1, no F7.8/F7.9.

| Área | Estado | Evidencia |
|---|---|---|
| 52 componentes (18 primitives + 26 composites + 8 patterns) | ✅ Done | `rends/components/**` |
| WCAG 2.1 AA — `tests/a11y` | ✅ Done | 224/224 pass en 8 proyectos Chromium |
| WCAG 2.1 AAA opt-in (theme generator) | ✅ Done | v0.8.1 |
| Token system 3-layer (primitives / semantic / component) | ✅ Done | `rends/tokens/**` |
| Motion tokens semánticos | ✅ Done | v0.8.0 + Unreleased |
| Hex literal audit (cero hardcode fuera de excepciones documentadas) | ✅ Done | F7.7 |
| CLI (`init`, `add`, `list`, `scales`, `help`) | ✅ Done | `rends/cli/**` |
| Theme generator hex→tokens + AAA + sugerencias de hue | ✅ Done | v0.8.0 + v0.8.1 + Unreleased |
| **F7.8** — `docs/cli.html` | ✅ Done en v0.7.1 | 394 líneas, 8 secciones, callouts, examples |
| **F7.9** — Visual regression baselines | ✅ Done en v0.7.1 | 248 PNGs en `visual.spec.cjs-snapshots/` (8 projects × light/dark) |
| Per-component test suite | ✅ Done | `tests/components/components.spec.cjs`, 102/102 pass |
| LICENSE (MIT) | ⚠️ Existe en `rends/LICENSE`, falta en repo root | — |
| README | ⚠️ Existe en `rends/README.md`, falta en repo root | — |
| CONTRIBUTING.md | ❌ No existe | — |
| CODE_OF_CONDUCT.md | ❌ No existe | — |
| `.github/` (CI, issue templates, PR template) | ❌ No existe | — |
| Cross-browser (Firefox/WebKit) en tests | ❌ Solo Chromium | F7.7 deja explícito que falta CI con browsers reales |
| **F8** — páginas por componente (52 páginas independientes) | ❌ Pendiente | Hoy todo vive en `docs/components.html` |
| Primer commit + tags `v0.7.0`/`v0.8.0`/`v0.8.1` | ❌ Pendiente | F7.6 declaró que "el repo no tiene commits aún" |
| Publicación a `npm` | ❌ Pendiente | README promete `npx rends init` pero el paquete no está publicado |
| Sitio de docs deployado (GitHub Pages / Vercel / Netlify) | ❌ Pendiente | Solo HTML estático local |
| `[Unreleased]` en CHANGELOG cerrado como `0.8.2` | ❌ Pendiente | Listo para cortarse |
| Badge "v0.7" en `docs/cli.html` desactualizado | ⚠️ Bug menor | Línea 109 |

---

## Roadmap por hito

### Hito 1 — Higiene de repo (sin código nuevo, alto ROI)
*Convierte una carpeta privada en un repo público presentable.*

- [ ] **1.1** `LICENSE` en repo root (mirror de `rends/LICENSE`).
- [ ] **1.2** `README.md` en repo root explicando el layout (`rends/` es el paquete, `_archive/` es histórico, `rends-skill/` es skill auxiliar) + linkeo al README del paquete.
- [ ] **1.3** `CONTRIBUTING.md` con flujo de PR, convenciones de commits, dónde correr lint/tests, cómo agregar un componente.
- [ ] **1.4** `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1).
- [ ] **1.5** `.github/ISSUE_TEMPLATE/bug_report.yml` + `feature_request.yml` + `config.yml` (deshabilitar blank issues).
- [ ] **1.6** `.github/PULL_REQUEST_TEMPLATE.md`.
- [ ] **1.7** `.github/dependabot.yml` para npm + actions.
- [ ] **1.8** Fix badge `v0.7` → `v0.8` en `rends/docs/cli.html` (línea 109).

### Hito 2 — CI/CD
*Hasta que esto no exista, "passing tests" depende de que Ren los corra a mano.*

- [ ] **2.1** `.github/workflows/ci.yml` — lint + a11y + components + visual en push/PR a `main`. Browsers: Chromium / Firefox / WebKit (matriz). Cache de `node_modules` + de Playwright browsers.
- [ ] **2.2** `.github/workflows/release.yml` — al pushear un tag `v*`, corre tests, hace `npm publish` (si pasa), crea GitHub Release con notas pulled del CHANGELOG.
- [ ] **2.3** `.github/workflows/pages.yml` — deploya `rends/docs/`, `rends/blocks/`, `rends/themes/preview.html` y `rends/create/index.html` a GitHub Pages en cada push a `main`.
- [ ] **2.4** Badge de CI en el README (pasa/falla, coverage opcional).
- [ ] **2.5** Resolver lo que F7.7 dejó marcado: Firefox/WebKit no se podían correr en el sandbox; con CI esto queda cubierto.

### Hito 3 — Cut 0.8.2 release
*Empaquetar lo que ya está merged en `[Unreleased]`.*

- [ ] **3.1** Mover bloque `[Unreleased]` del CHANGELOG a `[0.8.2] — 2026-04-26`.
- [ ] **3.2** Bumpear `rends/package.json` `0.8.1` → `0.8.2`.
- [ ] **3.3** Agregar compare-link `[0.8.2]: …/v0.8.1...v0.8.2`.
- [ ] **3.4** Actualizar `Current version: **0.8.1**` → `**0.8.2**` en `rends/README.md`.
- [ ] **3.5** Dejar `[Unreleased]` vacío con sus 6 secciones (Added/Changed/Fixed/Removed/Security/Accessibility milestones).

### Hito 4 — Primer commit + tags + push
*Requiere acceso a la máquina del usuario (no se puede hacer desde el sandbox).*

- [ ] **4.1** `git init` (si no está iniciado) + `.gitignore` cubriendo `node_modules/`, `playwright-report/`, `test-results/`, `_archive/rends-skill-workspace/`.
- [ ] **4.2** Primer commit con todo el estado actual.
- [ ] **4.3** Tags retroactivos: `v0.7.0`, `v0.7.1`, `v0.8.0`, `v0.8.1`, `v0.8.2` apuntando al mismo commit (o a commits separados si se divide el initial dump).
- [ ] **4.4** `git remote add origin git@github.com:Rensoconese/ren10.git` + `git push -u origin main --tags`.

### Hito 5 — Publicación
*El paso que convierte ren10 en un design system instalable.*

- [ ] **5.1** Asegurar que `package.json` tenga `"publishConfig": { "access": "public" }` y `"files"` bien acotado (ya está acotado).
- [ ] **5.2** `npm login` con la cuenta correspondiente.
- [ ] **5.3** Validar con `npm publish --dry-run` que el tarball contiene **solo** `index.css`, `tokens/`, `base/`, `components/`, `utils/`, `cli/` (no `tests/`, no `docs/`, no `node_modules/`, no `_archive/`).
- [ ] **5.4** `npm publish` → primera versión `0.8.2` (o `0.8.1` retroactivo si se prefiere alinear con el tag).
- [ ] **5.5** Verificar que `npx rends init` funciona contra el registry público en una carpeta limpia.
- [ ] **5.6** Activar GitHub Pages → `rends/docs/index.html` accesible públicamente.

### Hito 6 — F8: páginas por componente (deliverable largo)
*52 páginas, una por componente. Mejora descubribilidad y SEO.*

- [ ] **6.1** Diseñar la plantilla base de página de componente (header, sections: Overview / Anatomy / Variants / Props/Slots / Accessibility / Examples / Recipes / API). Una sola plantilla con datos de cada componente.
- [ ] **6.2** Decidir si se generan a mano o desde `cli/registry.js` (build script). Recomendado: build script — `cli/registry.js` ya tiene `name/layer/dir/files/usage`, falta `description` largo + `props`.
- [ ] **6.3** Extender `registry.js` con un campo `docs` por componente (sections markdown + ejemplos).
- [ ] **6.4** Generar las 18 páginas de primitives.
- [ ] **6.5** Generar las 26 páginas de composites.
- [ ] **6.6** Generar las 8 páginas de patterns.
- [ ] **6.7** Linkear desde `docs/components.html` (que pasa a ser índice) a cada página individual.
- [ ] **6.8** Update `tests/components/components.spec.cjs` para testear las páginas individuales además de la sección dentro del index.

### Hito 7 — Polish post-launch
*No bloquea launch pero suma.*

- [ ] **7.1** Storybook opcional (decisión: ¿vale el costo de dependencia? El sitio de docs vanilla puede ser suficiente).
- [ ] **7.2** Coverage badge / Lighthouse CI sobre el sitio deployado.
- [ ] **7.3** Migrar `_archive/RENDS-AUDIT-ROADMAP.docx` a markdown si todavía hay valor pendiente ahí.
- [ ] **7.4** Sitio público con changelog renderizado (parsea `CHANGELOG.md` → HTML).

---

## Orden recomendado y por qué

```
Hito 1 (higiene)  →  Hito 3 (cut 0.8.2)  →  Hito 2 (CI)  →  Hito 4 (commit+push)  →  Hito 5 (publish)  →  Hito 6 (F8)  →  Hito 7
```

- **Higiene primero** porque no requiere browser ni network y desbloquea el repo público.
- **Cut 0.8.2 antes que CI** porque el CI debe correr contra una versión definida; cortar primero evita re-ejecuciones.
- **CI antes que publish** porque querés que el primer `npm publish` haya pasado por el pipeline.
- **Publish antes que F8** porque F8 es un trabajo largo y bloquearlo detrás de no-lanzamiento es contraproducente. F8 mejora un sistema ya disponible.

---

## Qué se puede hacer **desde aquí mismo** (este chat)
Todo lo de Hitos **1, 2, 3, 7.3** — son archivos de texto en el repo.

## Qué requiere **tu máquina**
Hitos **4 (git/push), 5 (npm publish, Pages activation)**, **6 (F8: si bien parte se puede armar acá, los smoke tests requieren Playwright real)**, y **2.5 (correr CI con browsers reales — pero el YAML se escribe acá)**.

---

## Referencias

- Estado de v0.8.1: `rends/CHANGELOG.md` líneas 44–131.
- F7.27 (último PHASE doc, 23-abr-2026): `PHASE-7-27-COMPLETE.md` — loop motion tokens + `suggestAlternativeHues`.
- F7.26 (post-0.8.1 polish): `PHASE-7-26-COMPLETE.md`.
- F7.7 (hex audit final): `PHASE-7-7-COMPLETE.md`.
- F7.6 (release packaging — declaró "el repo no tiene commits aún"): `PHASE-7-6-COMPLETE.md`.
- Hex audit policy: `PHASE-7-7-COMPLETE.md` sección "Política post-F7.7".
- 248 baselines en `rends/tests/visual/visual.spec.cjs-snapshots/`.
- `[Unreleased]` en CHANGELOG: `rends/CHANGELOG.md` líneas 12–43 (listo para cortar como `[0.8.2]`).
