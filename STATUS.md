# RenDS — Status (documento archivado)

> **Histórico. Ya no se mantiene.**
> El contenido de abajo quedó congelado el **2026-05-18** sobre la versión
> **0.9.0**. Se archivó el **2026-08-05**, cuando `package.json` ya estaba en
> 0.13.0 — cuatro minors de deriva. Nada de lo que sigue describe el estado
> actual del repo.

## Dónde está el estado real

| Pregunta | Fuente viva |
| --- | --- |
| ¿En qué versión está el paquete? | `package.json` → `version` |
| ¿Qué cambió, y en qué release? | [`CHANGELOG.md`](./CHANGELOG.md) — `[Unreleased]` más un bloque por versión |
| ¿Qué releases se cortaron? | `git tag -l` |
| ¿Qué viene después? | [`docs/agent-ready-roadmap.md`](./docs/agent-ready-roadmap.md) |
| ¿Cómo se publica una release? | [`SHIPPING.md`](./SHIPPING.md) |
| ¿Cuál es el contrato para agentes? | [`AGENTS.md`](./AGENTS.md) |

## Por qué se archivó en vez de actualizarse

- **Nada lo consume.** `AGENTS.md` —el contrato canónico según `CLAUDE.md`— no
  lo menciona ni una vez. `package.json` → `files` no lo publica en npm.
  `skills/rends/sources.json` lo lista en `excludedRoots`, así que tampoco
  entra al knowledge graph ni al adaptador v0.
- **Nada lo verifica.** El gate de deriva de versión
  (`scripts/release-policy.mjs` → `findPublicVersionSurfaces`) enumera
  explícitamente dónde la versión no puede quedar vieja: los badges HTML de
  `docs/`, `create/`, `templates/` y `site/`, más `AGENTS.md`, `CLAUDE.md`,
  `.cursorrules`, `.windsurfrules`, `ren-design.md` y `README.md`. `STATUS.md`
  no está en esa lista — por eso pudo declarar 0.9.0 durante cuatro minors sin
  que ningún check protestara.
- **Ya está cubierto.** Todo lo que este doc listaba como hecho vive en el
  `CHANGELOG`; lo que listaba como pendiente es release-ops (`SHIPPING.md`) o
  trabajo ya cerrado.
- **Es el segundo ciclo.** La auditoría [`AUDIT-2026-05-11.md`](./AUDIT-2026-05-11.md)
  §2.1 ya lo había marcado como "describe un mundo previo al lanzamiento" y
  ordenó reescribirlo (ítem A1). Se reescribió, y volvió a quedar obsoleto en
  menos de tres meses. Reescribirlo una tercera vez solo reinicia el ciclo.

## Correcciones: lo que este doc afirmaba → lo que era cierto al archivarlo

| Afirmación congelada | Estado al 2026-08-05 |
| --- | --- |
| "Versión en disco: `0.9.0`" | `package.json` en **0.13.0**. Entre medio se cortaron 0.9.1, 0.9.2, 0.9.3, 0.10.0, 0.11.0, 0.12.0 y 0.13.0 (`CHANGELOG.md`). |
| "Fecha: 2026-05-18" | El último commit que tocó el archivo es `3df0d34` (2026-07-05); el encabezado nunca se actualizó. |
| "`[Unreleased]`: hardening de empaquetado y robustez JS post-0.9.0" | `[Unreleased]` (`CHANGELOG.md:12-73`) acumula la remediación post-0.13.0: anchors por instancia en overlays, la recursión que dejaba `ren-menubar` inoperante, el `--ease-out` global de `base/grid.css`, i18n en 12 componentes, escala z-index, `base/grid.css` documentado y el gate visual fijado a un contenedor. |
| Pendiente #2: "faltan tags `v0.7.0`, `v0.8.0`, `v0.8.2`, `v0.8.3`" | `v0.8.3` existe. Siguen faltando `v0.7.0`, `v0.8.0` y `v0.8.2` — verificado sobre tags **locales**; sin red no se puede comparar contra el remoto. |
| Pendiente #3: "publicar 0.9.0 a npm" | Obsoleto: hay tags hasta `v0.13.0`, más `publish-v0.13.0-1` que dispara `.github/workflows/publish-retry.yml`. **Si el paquete está efectivamente publicado en el registry no es verificable desde el repo (sin red).** |
| Pendiente #5: "activar GitHub Pages" | `.github/workflows/pages.yml` sigue presente. **El toggle de Settings → Pages no es verificable desde el repo (sin red).** |
| Pendiente #10: "pushear `feat/cli-extend` y abrir PR de 0.9.0" | Obsoleto: el historial ya tiene los merges de PR #35 y #40, y la rama de trabajo actual es otra. |
| "312 PNGs de baselines visuales" | **345** PNGs en `tests/visual/visual.spec.cjs-snapshots/`, recapturados dentro del contenedor Playwright fijado (`169f391`). |
| "53 componentes (19 + 26 + 8)" | Sigue siendo cierto: 19 primitives + 26 composites + 8 patterns, verificado con los `find` de `AGENTS.md`. |
| "WCAG 2.1 AA — 368/368 pass" | **Sin verificar**: requiere correr `npm run test:a11y`; el conteo pudo cambiar. Nótese que el `ROADMAP.md` congelado decía 224/224 para la misma métrica. |
| "CI: Chromium gating + Firefox/WebKit advisory" | Sigue siendo cierto (`.github/workflows/ci.yml`, matriz `[chromium, firefox, webkit]` con `continue-on-error` en los no-Chromium). Además hay dos workflows nuevos: `audit.yml` y `publish-retry.yml`. |

Para recuperar la versión viva de este documento tal como estaba antes del
archivado: `git show 3df0d34:STATUS.md`.

---

# Contenido congelado (2026-05-18 · v0.9.0)

*Conservado como registro histórico. No editar y no leer como estado actual.*

**Fecha:** 2026-05-18
**Versión en disco:** `0.9.0`
**`[Unreleased]` actual:** hardening de empaquetado y robustez JS post-0.9.0.
**Detalle por hito:** [`ROADMAP.md`](./ROADMAP.md)

Documento de una página con lo que separa el estado actual del repo de "publicado y mantenido". Refresqué este doc tras la auditoría 2026-05-11; el contenido anterior (que decía "repo sin commits, tags v0.7.0/v0.8.0/v0.8.1 no existen") era de antes del primer push.

---

## Lo que ya está hecho

| Hito | Estado | Evidencia |
|---|---|---|
| Higiene del repo (LICENSE, README, CONTRIBUTING, COC, .github/*) | ✅ | `rends/{LICENSE,README.md,CONTRIBUTING.md,CODE_OF_CONDUCT.md}`, `.github/{dependabot.yml,PULL_REQUEST_TEMPLATE.md,ISSUE_TEMPLATE/}` |
| CI (lint + a11y + components + visual) | ✅ Chromium gating + Firefox/WebKit advisory | `.github/workflows/ci.yml`. |
| Release pipeline (tag → npm publish) | ✅ | `.github/workflows/release.yml` (verifica tag vs package.json, publica con provenance, crea GitHub Release). |
| Pages workflow | ✅ Reactivado | `.github/workflows/pages.yml`; requiere GitHub Pages → Source: GitHub Actions. |
| Primer commit + push a origin | ✅ | 18 commits en `main`; branches dependabot abiertas |
| Tags retroactivos | 🟡 Parcial | Existen `v0.7.1`, `v0.8.1`. Faltan `v0.7.0`, `v0.8.0`, `v0.8.2`, `v0.8.3` |
| 53 componentes (19 + 26 + 8) | ✅ | `components/{primitives,composites,patterns}/**` |
| 53 páginas de doc por componente (Hito 6 / F8 viejo) | ✅ | `docs/components/*.html` |
| WCAG 2.1 AA (`tests/a11y`) | ✅ | 368/368 pass en Chromium |
| WCAG 2.1 AAA opt-in (theme generator) | ✅ | desde v0.8.1 |
| Token system 3-layer | ✅ | `tokens/{primitives,semantic,component}/**` |
| Motion tokens semánticos + loop tokens | ✅ | v0.8.0 + v0.8.2 (F7.27) |
| Hex literal audit | ✅ | F7.7 |
| CLI (`init`, `add`, `list`, `scales`, `help`, `remove`, `upgrade`) | ✅ | `cli/registry.js` cubre los 53 componentes; `smoke:cli-copy` valida imports copiados. |
| Package exports | ✅ | `scripts/verify-package-exports.mjs` cubre subpaths públicos y está en `npm test`. |
| Theme generator hex→tokens + AAA + sugerencias de hue | ✅ | v0.8.0 + v0.8.1 + v0.8.2 |
| Visual regression baselines | ✅ | 312 PNGs en `tests/visual/visual.spec.cjs-snapshots/` (restaurados en commit `78a9db1`) |

## Lo que falta

Ordenado por bloqueo / ROI:

| # | Pendiente | Esfuerzo | Bloquea a |
|---|---|---|---|
| 2 | Tags retroactivos `v0.7.0`, `v0.8.0`, `v0.8.2`, `v0.8.3` para que los compare-links del CHANGELOG funcionen | Bajo | — |
| 3 | Publicar 0.9.0 a npm (`npm publish`; verificar con `npm view ren10 version`) | Trivial | Adopción externa |
| 5 | Activar GitHub Pages Source: GitHub Actions en Settings | Bajo | Visibilidad pública |
| 10 | Pushear `feat/cli-extend` y abrir PR de 0.9.0 | Bajo | Release 0.9.0 |

Para detalle granular de cada uno, ver [`ROADMAP.md`](./ROADMAP.md).
Para auditoría exhaustiva con file:line, ver [`AUDIT-2026-05-11.md`](./AUDIT-2026-05-11.md).

---

## Cosas que se pueden hacer **desde este chat**
Textos, docs, checks y empaquetado se pueden mantener desde este chat. Tags,
merge/release y npm publish requieren credenciales remotas activas.

## Cosas que requieren **tu máquina**
Items #2 (`git tag` + `git push --tags`), #3 (`npm login` + `npm publish`), activación de un host para #5.

---

*Para detalle granular (sub-tareas, comandos), ver [`ROADMAP.md`](./ROADMAP.md). Para inventario exhaustivo de inconsistencias detectadas al refresh de este doc, ver [`AUDIT-2026-05-11.md`](./AUDIT-2026-05-11.md).*
