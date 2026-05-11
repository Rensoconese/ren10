# RenDS — Status

**Fecha:** 2026-05-11
**Versión en disco:** `0.8.2` (cortada en CHANGELOG)
**`[Unreleased]` actual:** trabajo post-0.8.2 (landing, 52 páginas por componente, command palette, shell unificado, fixes de demos) — listo o casi listo para cortar como `0.8.3` / `0.9.0`
**Detalle por hito:** [`ROADMAP.md`](./ROADMAP.md)

Documento de una página con lo que separa el estado actual del repo de "publicado y mantenido". Refresqué este doc tras la auditoría 2026-05-11; el contenido anterior (que decía "repo sin commits, tags v0.7.0/v0.8.0/v0.8.1 no existen") era de antes del primer push.

---

## Lo que ya está hecho

| Hito | Estado | Evidencia |
|---|---|---|
| Higiene del repo (LICENSE, README, CONTRIBUTING, COC, .github/*) | ✅ | `rends/{LICENSE,README.md,CONTRIBUTING.md,CODE_OF_CONDUCT.md}`, `.github/{dependabot.yml,PULL_REQUEST_TEMPLATE.md,ISSUE_TEMPLATE/}` |
| CI (lint + a11y + components + visual) | ✅ Chromium | `.github/workflows/ci.yml`. Firefox/WebKit deferred. |
| Release pipeline (tag → npm publish) | ✅ | `.github/workflows/release.yml` (verifica tag vs package.json, publica con provenance, crea GitHub Release). |
| Pages workflow | ❌ Eliminado deliberadamente | Commit `15d027f`. Si se quiere docs públicas, decidir alojamiento (Pages, Vercel, Netlify). |
| Primer commit + push a origin | ✅ | 18 commits en `main`; branches dependabot abiertas |
| Tags retroactivos | 🟡 Parcial | Existen `v0.7.1`, `v0.8.1`. Falta `v0.7.0`, `v0.8.0`, `v0.8.2` |
| 52 componentes (18 + 26 + 8) | ✅ | `components/{primitives,composites,patterns}/**` |
| 52 páginas de doc por componente (Hito 6 / F8 viejo) | ✅ | `docs/components/*.html` (todas en `[Unreleased]`) |
| WCAG 2.1 AA (`tests/a11y`) | ✅ | 224/224 pass en Chromium |
| WCAG 2.1 AAA opt-in (theme generator) | ✅ | desde v0.8.1 |
| Token system 3-layer | ✅ | `tokens/{primitives,semantic,component}/**` |
| Motion tokens semánticos + loop tokens | ✅ | v0.8.0 + v0.8.2 (F7.27) |
| Hex literal audit | ✅ | F7.7 |
| CLI (`init`, `add`, `list`, `scales`, `help`) | ✅ | `cli/registry.js` cubre los 53 componentes (verificado programáticamente con `Object.keys(REGISTRY).length`) |
| Theme generator hex→tokens + AAA + sugerencias de hue | ✅ | v0.8.0 + v0.8.1 + v0.8.2 |
| Visual regression baselines | ✅ | 312 PNGs en `tests/visual/visual.spec.cjs-snapshots/` (restaurados en commit `78a9db1`) |

## Lo que falta

Ordenado por bloqueo / ROI:

| # | Pendiente | Esfuerzo | Bloquea a |
|---|---|---|---|
| 1 | Cortar `[Unreleased]` como `0.8.3` (o `0.9.0` si los rename de docs cuentan como breaking) | Trivial | Tags + publish |
| 2 | Tags retroactivos `v0.7.0`, `v0.8.0`, `v0.8.2` para que los compare-links del CHANGELOG funcionen | Bajo | — |
| 3 | Decidir si publicar 0.8.2 a npm (verificar con `npm view rends version`) o saltar a 0.8.3 | Trivial | Adopción externa |
| 5 | Decidir alojamiento del sitio de docs (Pages reactivado / Vercel / Netlify) | Medio | Visibilidad pública |
| 7 | Renombrar 5 HTMLs en `docs/components/` al nombre canónico (`ren-icons → ren-icon`, etc.) | Medio | Coherencia |
| 8 | Promover `ren-switch` a primitive independiente | Medio | Conteo 52 → 53 |
| 9 | Borrar `docs/components/ren-multi-step-form.html` y enlazar la sección desde `ren-form.html` | Bajo | Coherencia |

Para detalle granular de cada uno, ver [`ROADMAP.md`](./ROADMAP.md).
Para auditoría exhaustiva con file:line, ver [`AUDIT-2026-05-11.md`](./AUDIT-2026-05-11.md).

---

## Cosas que se pueden hacer **desde este chat**
Items #1, #4, #6, #7, #8, #9 y los textos asociados a #5.

## Cosas que requieren **tu máquina**
Items #2 (`git tag` + `git push --tags`), #3 (`npm login` + `npm publish`), activación de un host para #5.

---

*Para detalle granular (sub-tareas, comandos), ver [`ROADMAP.md`](./ROADMAP.md). Para inventario exhaustivo de inconsistencias detectadas al refresh de este doc, ver [`AUDIT-2026-05-11.md`](./AUDIT-2026-05-11.md).*
