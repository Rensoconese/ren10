# RenDS — Roadmap

**Repo:** [github.com/Rensoconese/ren10](https://github.com/Rensoconese/ren10)
**Versión actual en disco:** `0.8.2` (cortada en CHANGELOG; `[Unreleased]` poblado con post-0.8.2 listo para próximo cut)
**Última fase cerrada:** F8 (52 páginas de doc por componente + landing + shell unificado + command palette) — todo en `[Unreleased]`
**Fecha del roadmap:** 2026-05-11 (refresh tras auditoría)
**Vista ejecutiva (1 pág):** [`STATUS.md`](./STATUS.md)
**Auditoría exhaustiva:** [`AUDIT-2026-05-11.md`](./AUDIT-2026-05-11.md)

---

## Estado real (verificado contra el árbol del repo)

| Área | Estado | Evidencia |
|---|---|---|
| 53 componentes (19 primitives + 26 composites + 8 patterns) | ✅ Done | `rends/components/**` (ren-switch promovido en `[Unreleased]`) |
| WCAG 2.1 AA — `tests/a11y` | ✅ Done | 224/224 pass en 8 proyectos Chromium |
| WCAG 2.1 AAA opt-in (theme generator) | ✅ Done | v0.8.1 |
| Token system 3-layer (primitives / semantic / component) | ✅ Done | `rends/tokens/**` |
| Motion tokens semánticos + loop tokens | ✅ Done | v0.8.0 + v0.8.2 |
| Hex literal audit | ✅ Done | F7.7 |
| CLI (`init`, `add`, `list`, `scales`, `help`) | ✅ Done | `cli/registry.js` cubre los 53 componentes (verificado en F3) |
| Theme generator hex→tokens + AAA + sugerencias de hue | ✅ Done | v0.8.0 + v0.8.1 + v0.8.2 |
| F7.8 — `docs/cli.html` | ✅ Done en v0.7.1 | 394 líneas |
| F7.9 — Visual regression baselines | ✅ Done | 312 PNGs en `tests/visual/visual.spec.cjs-snapshots/` (restaurados en `78a9db1`) |
| Per-component test suite | ✅ Done | `tests/components/components.spec.cjs`, 102/102 pass |
| F8 — 52 páginas por componente | ✅ Done | `docs/components/*.html`, en `[Unreleased]` |
| Marketing landing | ✅ Done | `rends/index.html`, en `[Unreleased]` |
| Command palette (Cmd+K) | ✅ Done | `site/shell.js`, en `[Unreleased]` |
| LICENSE | ✅ | `rends/LICENSE` (MIT) |
| README | ✅ | `rends/README.md` |
| CONTRIBUTING.md | ✅ | `rends/CONTRIBUTING.md` |
| CODE_OF_CONDUCT.md | ✅ | `rends/CODE_OF_CONDUCT.md` |
| `.github/dependabot.yml` | ✅ | activo |
| `.github/PULL_REQUEST_TEMPLATE.md` | ✅ | activo |
| `.github/ISSUE_TEMPLATE/` | ✅ | activo |
| `.github/workflows/ci.yml` | ✅ | lint + a11y + components + visual, **solo Chromium** |
| `.github/workflows/release.yml` | ✅ | tag → tests → npm publish + GitHub Release |
| `.github/workflows/pages.yml` | ❌ Eliminado | commit `15d027f`. Si se quiere docs públicas, decidir hosting nuevo |
| Cross-browser (Firefox/WebKit) en CI | ❌ Deferred | docs antes prometían "matriz"; realidad es Chromium-only |
| Primer commit + push | ✅ | 18 commits en `main` + branches dependabot |
| Tags retroactivos | 🟡 | existen `v0.7.1`, `v0.8.1`. Faltan `v0.7.0`, `v0.8.0`, `v0.8.2` |
| Publicación a `npm` | ❓ | verificar con `npm view rends version`; README promete `npx rends init` |
| `[Unreleased]` en CHANGELOG | 🟡 Listo para cortar | acumula trabajo post-0.8.2 (landing, F8, shell, command palette, fixes) |
| `docs/components/` HTML naming | 🟡 | 5 archivos con nombre distinto al de la carpeta del componente (ver Hito 6) |
| `docs/components/ren-{switch,multi-step-form}.html` huérfanos | 🟡 | ver Hito 6 |

---

## Roadmap por hito (refresh post-auditoría)

### Hito 1 — Higiene de repo
*Estado: ✅ DONE (excepto las dudas sobre el outer workspace que no es git).*

- [x] **1.1** `LICENSE` en `rends/`
- [x] **1.2** `README.md` en `rends/`
- [x] **1.3** `CONTRIBUTING.md` en `rends/`
- [x] **1.4** `CODE_OF_CONDUCT.md` en `rends/`
- [x] **1.5** `.github/ISSUE_TEMPLATE/`
- [x] **1.6** `.github/PULL_REQUEST_TEMPLATE.md`
- [x] **1.7** `.github/dependabot.yml`
- [ ] **1.8** Fix badge `v0.7` → `v0.8` en `rends/docs/cli.html` (línea 109) — verificar si sigue presente

### Hito 2 — CI/CD
*Estado: ✅ DONE (Chromium-only por ahora).*

- [x] **2.1** `.github/workflows/ci.yml` — lint + a11y + components + visual. Browsers: **Chromium only** (Firefox/WebKit deferred a post-launch)
- [x] **2.2** `.github/workflows/release.yml` — tag `v*` → tests + verify tag/version match + `npm publish` (provenance) + GitHub Release con notas del CHANGELOG
- [ ] **2.3** ~~`.github/workflows/pages.yml`~~ — **eliminado** en commit `15d027f`. Si se quiere docs públicas, decidir hosting alternativo (Pages reactivado, Vercel, Netlify, Cloudflare Pages)
- [x] **2.4** Concurrency + cache para Playwright browsers
- [ ] **2.5** (opcional, post-launch) agregar Firefox/WebKit a la matriz con `continue-on-error: true` — F7.7 dejó documentado el gap

### Hito 3 — Cut 0.8.2
*Estado: ✅ DONE.*

- [x] **3.1** Bloque `[0.8.2]` ya está en CHANGELOG con fecha 2026-04-27
- [x] **3.2** `package.json` en `0.8.2`
- [x] **3.3** README en `Current version: 0.8.2`
- [x] **3.4** ren-design.md header en `v0.8.2`

### Hito 4 — Push al remoto y tags
*Estado: 🟡 PARCIAL.*

- [x] **4.1** `git init` + `.gitignore` + remoto configurado (`origin: github.com/Rensoconese/ren10.git`)
- [x] **4.2** 18 commits en `main`, branches dependabot abiertas
- [ ] **4.3** Tags retroactivos: `v0.7.0`, `v0.8.0`, `v0.8.2`. Existen `v0.7.1` y `v0.8.1`
- [ ] **4.4** Push del branch actual (`codex/fix-visual-ci-baselines`) cuando esté listo

### Hito 5 — Publicación a npm
*Estado: ❓ Verificar.*

- [x] **5.1** `package.json` tiene `"publishConfig": { "access": "public", "provenance": true }` y `"files"` acotado
- [ ] **5.2** Confirmar `npm login` activo en máquina local
- [ ] **5.3** `npm publish --dry-run` para validar tarball (solo `index.css`, `tokens/`, `base/`, `components/`, `utils/`, `cli/`, `ren-design.md`, `CHANGELOG.md`)
- [ ] **5.4** Decidir: publicar `0.8.2` ahora o esperar a `0.8.3` (cuando se corte `[Unreleased]`)
- [ ] **5.5** Verificar que `npx rends init` funciona contra el registry público en una carpeta limpia
- [ ] **5.6** Si se quiere docs públicas: decidir host (Pages re-añadiendo el workflow, Vercel, Netlify) y deploy

### Hito 6 — Limpieza de docs y coherencia naming
*Estado: 🟡 PENDIENTE — detectado en auditoría 2026-05-11.*

- [ ] **6.1** Cortar `[Unreleased]` como `0.8.3` (o `0.9.0` si los renames de docs cuentan como breaking para URLs públicas)
- [x] **6.2** Renombrar 5 HTMLs en `docs/components/` al nombre canónico de la carpeta:
  - `ren-ai-patterns.html` → `ren-ai.html`
  - `ren-data-table.html` → `ren-table.html`
  - `ren-form-validation.html` → `ren-form.html`
  - `ren-icons.html` → `ren-icon.html`
  - `ren-input-otp.html` → `ren-otp.html`
- [x] **6.3** Promover `ren-switch` a primitive independiente — DONE en `[Unreleased]`. Carpeta creada (`components/primitives/ren-switch/{ren-switch.css, component.md}`), CSS extraído de `ren-checkbox.css`, `ren-design.md` actualizado (19 primitives / 53 total), `cli/registry.js` actualizado, README actualizado, `components/index.css` importa el nuevo archivo.
- [ ] **6.4** Borrar `docs/components/ren-multi-step-form.html` y enlazar la sección "Multi-step" desde `ren-form.html` (`ren-form/pattern.md` ya documenta `data-steps`/`[data-active]`)
- [ ] **6.5** Actualizar `docs/components/_sidebar.html`, `docs/components.html`, command palette JS y todo enlace interno
- [x] **6.6** `cli/registry.js` completo — 53 entradas verificadas (los "10 faltantes" originalmente detectados eran un falso positivo del grep que no contaba keys con guión entre comillas tipo `'alert-dialog'`, `'date-range-picker'`, etc.). ren-switch agregado en F2; `components/index.css` arreglado para importar el `ren-date-range-picker.css` que sí faltaba.
- [ ] **6.7** Decidir destino de `docs/components-showcase.html` (230 KB) — borrar o mantener como "view all"
- [ ] **6.8** Borrar CSS huérfanos: `docs/constraint-driven-design.css`, `docs/content-guidelines.css`

### Hito 7 — Limpieza del outer workspace
*Estado: 🟡 PENDIENTE — el outer es Cowork workspace, no es el repo. Consolidamos para evitar confusión.*

- [ ] **7.1** Reducir `outer/README.md` a índice mínimo apuntando a `rends/`
- [ ] **7.2** Borrar `outer/SHIPPING.md` (versión vieja pre-launch; `rends/SHIPPING.md` es la actual)
- [ ] **7.3** Mover `outer/AGENTS.md.rtk-backup-20260506` a `outer/_archive/`
- [ ] **7.4** Mover 27 `outer/PHASE-*-COMPLETE.md` + 2 duplicados en `rends/` a `outer/_archive/phases/`
- [ ] **7.5** Decidir destino de `outer/inject_shell_script.py` (mover a `rends/scripts/` con README, o borrar)
- [ ] **7.6** Decidir destino de `outer/rends.skill` (ZIP) vs `outer/rends-skill/` (source) — clarificar cuál es fuente de verdad

### Hito 8 — Polish post-launch (nice-to-have)

- [ ] **8.1** Storybook opcional (decisión pendiente: ¿vale el costo? el sitio vanilla puede ser suficiente)
- [ ] **8.2** Coverage badge / Lighthouse CI sobre el sitio deployado
- [ ] **8.3** Sitio público con changelog renderizado (parsea `CHANGELOG.md` → HTML)
- [ ] **8.4** Re-evaluar matriz de browsers (Firefox/WebKit con `continue-on-error: true` o expansión completa)

---

## Orden recomendado

```
Hito 6 (limpieza docs)  →  Hito 7 (limpieza outer)  →  cortar 0.8.3  →
Hito 4.3 (tags retroactivos)  →  Hito 5 (publish)  →  Hito 8
```

- **Hito 6 primero** porque deja el sistema coherente antes de cortar la próxima versión.
- **Hito 7 paralelo** o secuencial — no bloquea publish del paquete.
- **Cortar 0.8.3** una vez todo lo de 6 está en `[Unreleased]` y ese bloque consolidado.
- **Tags retroactivos** para que los compare-links del CHANGELOG funcionen.
- **Publish** finalmente, después de que el pipeline haya pasado.

---

## Qué se puede hacer **desde este chat**
Hitos **1.8, 6.1–6.8, 7.1–7.6, 8.3** — son archivos en el repo.

## Qué requiere **tu máquina**
- **4.3, 4.4** — `git tag` + `git push --tags`
- **5.2, 5.3, 5.4, 5.5** — `npm login`, `npm publish`, smoke test
- **5.6** — activación de hosting si se elige Pages u otra plataforma
- **2.5, 8.4** — agregar/correr Firefox/WebKit en CI con browsers reales

---

## Referencias

- Inconsistencias detectadas y plan de fix: `AUDIT-2026-05-11.md`
- Estado de v0.8.2: `CHANGELOG.md` líneas 234-278
- F7.27 (último PHASE doc, 23-abr-2026): `PHASE-7-27-COMPLETE.md` en `outer/`
- F7.7 (hex audit): `outer/PHASE-7-7-COMPLETE.md`
- Hex audit policy: sección "Política post-F7.7" en F7.7
- 312 baselines: `rends/tests/visual/visual.spec.cjs-snapshots/`
- `[Unreleased]` listo para cortar: `CHANGELOG.md:12-232`
