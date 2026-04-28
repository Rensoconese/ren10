# RenDS — Status (qué falta para shippear)

**Fecha:** 27-abr-2026
**Versión en disco:** `0.8.1` · **Próximo cut:** `0.8.2` (Unreleased listo)
**Detalle por hito:** [`ROADMAP.md`](./ROADMAP.md)

Lo que separa "repo personal en disco" de "design system publicado". Seis ítems, ordenados por ROI / dependencia.

| # | Falta                                | Estado                                                                                                            | Bloquea a                              | Esfuerzo |
|---|--------------------------------------|-------------------------------------------------------------------------------------------------------------------|----------------------------------------|----------|
| 1 | Tags + commits + push a GitHub       | Repo sin commits. Tags `v0.7.0` / `v0.8.0` / `v0.8.1` no existen. Compare-links del CHANGELOG apuntan al vacío.    | #2, #3, #5                             | Bajo     |
| 2 | `npm publish`                        | Paquete `rends` no publicado. README promete `npx rends init` que hoy no funciona sin clonar.                      | Adopción externa                       | Bajo     |
| 3 | CI/CD                                | Sin `.github/workflows/`. Lint + a11y (224/224) + visual + components (102/102) son manuales.                      | Confiabilidad de #2                    | Medio    |
| 4 | Gobernanza del repo                  | `LICENSE` y `README` en `rends/` pero faltan en root. Sin `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, templates I/PR. | Repo público presentable               | Bajo     |
| 5 | Sitio de docs deployado              | `rends/docs/`, `rends/blocks/`, `rends/themes/preview.html`, `rends/create/index.html` solo locales.                | Visibilidad pública del DS             | Bajo     |
| 6 | Cerrar `[Unreleased]` como `0.8.2`   | Bloque Unreleased acumula loop motion tokens, `suggestAlternativeHues`, migración spinner/skeleton/icon (F7.27).   | #1 (querés tagear con CHANGELOG limpio) | Trivial  |

## Orden recomendado

```
#6 cut 0.8.2  →  #4 higiene  →  #3 CI  →  #1 commit + tags + push  →  #2 npm publish  →  #5 Pages
```

- **#6 primero** porque es 5 minutos y deja el CHANGELOG limpio antes del primer commit.
- **#4 antes de #3** porque CI corre contra archivos que querés que ya estén commiteados (templates, dependabot, CoC).
- **#3 antes de #1** sería ideal pero el YAML de CI necesita commitearse — en la práctica van casi en paralelo: escribís el YAML como parte del initial dump.
- **#2 después de #3** para que el primer publish haya pasado por pipeline.
- **#5 al final** porque GitHub Pages se activa una vez con un workflow que ya está en main.

## Cosas que se pueden hacer **desde este chat**
#4, #6, los YAML de #3, parcialmente #5 (escribir el `pages.yml`).

## Cosas que requieren **tu máquina**
#1 (`git`), #2 (`npm login` + `npm publish`), activación de GitHub Pages en la UI del repo, correr CI con browsers reales (Firefox/WebKit que F7.7 dejó marcados como "no se pudo en sandbox").

## Lo que NO está en esta lista (a propósito)

- **F8 (52 páginas por componente)** — mejora a un sistema que ya está completo. Va para `0.9.0`. Decidimos cuándo arrancar después de cerrar #1–#6.
- **Storybook** — opcional. El sitio vanilla puede ser suficiente.
- **Cross-browser testing real (Firefox/WebKit)** — F7.7 lo marcó como gap; queda cubierto naturalmente por #3 (matriz en CI).

---

*Para el detalle granular (sub-tareas por hito, criterios de done, comandos), ver [`ROADMAP.md`](./ROADMAP.md).*
