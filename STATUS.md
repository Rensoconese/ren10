# RenDS — Status

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
