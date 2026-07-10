# RenDS P1/P2 — verificación final de Task 17

Fecha de cierre: 2026-07-10  
Rama: `codex/rends-p1-p2`  
Worktree: `/Users/rensoconese/RenDS/rends-future-additions`  
Baseline de la reauditoría: `fdc5706`  
Entorno local: macOS/Darwin arm64, Node 22.15.0, npm 10.9.2, Playwright 1.59.1

## Veredicto

**PASS.** Los escapes P1/P2 encontrados por la reauditoría fueron reproducidos con tests focales, corregidos, revisados de forma independiente y revalidados. El catálogo conserva exactamente 19 primitives, 26 composites y 8 patterns. Los 53 contratos tienen `aiHints`, canonical markup semántico y cobertura pública verificable.

La verificación no afirma haber comparado snapshots visuales Linux desde Darwin. Esa comparación permanece en el job Ubuntu/Chromium bloqueante; localmente se verificó que `npm test` es portable y no ejecuta snapshots dependientes de plataforma.

## Método

1. Relectura de contratos, runtime, CSS, CLI, package, workflows y tarball desde archivos actuales.
2. Smokes aislados de los 53 componentes, no una instalación agregada que oculte dependencias.
3. RED/GREEN para cada escape reproducible.
4. Revisión independiente por grupo; todo finding Important volvió a implementación y segunda verificación.
5. Matrices browser reales para lifecycle/touch y markup canónico sensible.
6. Regeneración de knowledge y bundles sólo después de integrar los cambios de fuente.
7. Verificación integral desde el estado final y comprobaciones equivalentes desde clones limpios para release/budgets.

## Escapes P1 y resolución

| ID | Escape reproducido | Resolución y evidencia |
|---|---|---|
| P1-1 | `ren-form` no deshabilitaba submit ni exponía correctamente el estado async; un validator rechazado podía trabar el guard. | `cf2b4c4` + `e944577`: estado real, botones restaurables, submit único y `finally` ante rechazo. Tests Task17 Light/Dark. |
| P1-2 | Calendario convertía `YYYY-MM-DD` por UTC y faltaba la utilidad local-date pública. | `cf2b4c4`: `utils/local-date.js`, exports y navegación civil sin shift en zona negativa. |
| P1-3 | `ren-select multiple` seguía escalar, trataba `aria-disabled="false"` como disabled y el primer fix anidó botones. | `cf2b4c4` + `e944577`: array, chips hermanos no anidados, repeated FormData y semántica disabled correcta. |
| P1-4 | Context menu tenía dos implementaciones incompatibles, reconnect duplicado y faltaban Home/End. | `d5ab2a4` + `e944577`: una implementación pública, cleanup estable y keyboard contract completo. |
| P1-5 | Dialog/sheet no reconciliaban cierres nativos; sheet abierto se desincronizaba al detach. | `d5ab2a4` + `e944577`: `close` nativo, returnValue, focus/lock cleanup y reconnect. |
| P1-6 | Number buttons enviaban forms, tooltip perdía `aria-describedby`, slider dual era escalar/invertible y keyboard filtraba `aria-disabled="false"`. | `d5ab2a4`, `e944577`, `c007147`, `058c0bf`: buttons seguros, token ARIA owned, tuple ordenada, thumbs coincidentes/verticales/disabled y navegación correcta. |
| P1-7 | `ren10 add` copiaba archivos sin closure de componentes; imports de sheet/form fallaban y date-picker no registraba calendar. | `9183276` + `c007147`: closure recursiva, ejecución de dependencies en add/upgrade/remove, confinement al consumer y smoke 53/53 aislado. |
| P1-8 | 46 canonical placeholders y checker basado en menciones dejaban pasar HTML/eventos falsos. | `6ac7402`, `4af7e19`, `0175006`: 53 canónicos, parser requiredMarkup/HTML/ARIA/hosts y manifest bidireccional de 51 pares / 38 nombres / 26 componentes. `ren-table` dinámico y canonical se prueban en tres engines. |

## Escapes P2 y resolución

| ID | Escape reproducido | Resolución y evidencia |
|---|---|---|
| P2-1 | El test 44×44 no medía controles; 182 targets coarse quedaron debajo y sidebar estaba oculto en el fixture. | `1c4a953` + `3006a4c`: coarse-only hit areas, 0×0 es error, sidebar visible y matriz touch real. |
| P2-2 | Budgets permisivos omitían requests/RSS y medían un dirty tree. | `002331a` + `65e5f26`: config versionada, baseline de árbol limpio, delta explícito, source/bundle requests y RSS con `process.resourceUsage`. |
| P2-3 | `npm test` ejecutaba snapshots Linux en Darwin. | `002331a`: `test:portable` es default; visual Linux queda en script/job separado y bloqueante. |
| P2-4 | No existía enforcement moderate y `js-yaml` era vulnerable. | `002331a` + `65e5f26`: `js-yaml` 4.3.0; audit runtime y full moderate bloqueantes. |
| P2-5 | Faltaba matriz 32 entrypoints y había listeners/timers/ARIA que pasaban por conteos superficiales. | `1c4a953` + `3006a4c`: 32 perfiles explícitos, acciones reales/NA justificado, carousel IDs/controls/live, toast reconnect, dropzone cleanup y nav/toolbar exact-once. |

## Findings de revisión y cierre

Las primeras implementaciones no se aprobaron automáticamente. Las revisiones independientes encontraron y cerraron, entre otros:

- form validator rejected, nested chip buttons, slider rail geometry y sheet detach;
- dependencia calendar copiada pero no ejecutada y paths que podían escapar del consumer;
- dual slider coincidente invertible, vertical incorrecto y mixed-disabled mutable;
- contratos que validaban sólo cinco eventos, hosts canónicos incorrectos y alert dialog no cerrable;
- helper dinámico de `ren-table` omitido por el scanner y canonical table no inicializable;
- carousel IDs duplicados tras prepend, toast pausado para siempre y dropzone drag state stale;
- version badges públicos desactualizados, semver prerelease débil, RSS no portable y budgets medidos desde dirty tree;
- bundles regenerados pero no commiteados, lo que separaba el artefacto verificado del publicado.

Cada uno terminó en un commit de corrección o artefacto generado, seguido por tests focales y una nueva auditoría conductual.

## Evidencia por tareas originales

| Tarea | Estado | Evidencia final |
|---|---|---|
| 1 — CSS contract validators | PASS | `check-css-contracts` y fixture; inventario unresolved/unconsumed/absent en cero. |
| 2 — Appearance primitives | PASS | Overrides root/scoped y token lint. |
| 3 — Appearance composites/patterns | PASS | Surfaces representativas y consumo público. |
| 4 — aliases/cascade layers | PASS | Cascade fixture, exports y checker. |
| 5 — themes/AAA/progressive | PASS | 94/94 theme generator; AAA scoped pairs ≥7:1. |
| 6 — forms | PASS | Async submit, validation, repeated values, reconnect y fuzz. |
| 7 — local dates | PASS | Utilidad pública y browser test sin shift. |
| 8 — selection/menu | PASS | Multiple select/context menu/keyboard. |
| 9 — overlays/lifecycle | PASS | Dialog/sheet/popover/focus cleanup. |
| 10 — interaction details | PASS | Number/tooltip/dual slider/disabled navigation. |
| 11 — CLI/package closure | PASS | 53 isolated installed consumers; runtime dependency execution. |
| 12 — public contracts | PASS | 53 canonical blocks; 51 event pairs / 38 names / 26 emitting components. |
| 13 — density/type/grid/motion | PASS | Foundation P2 suite y lint. |
| 14 — bundles/budgets | PASS | Deterministic bundles, package/request/RSS metrics and zero-growth policy. |
| 15 — tooling/security/release | PASS | Portable test, moderate audits, version parity, semantic workflow gates. |
| 16 — lifecycle/touch/ARIA | PASS | 32/32 profiles; 54/54 final behavioral matrix across three engines and schemes. |
| 17 — audit/future plan | PASS | Este documento y el plan exhaustivo aprobado en `docs/superpowers/plans/2026-07-09-rends-future-additions.md`. |

## Verificación integral final

| Comando / gate | Resultado |
|---|---|
| Contract counts | 19 / 26 / 8 |
| Stale uppercase contract references | 0 en fuentes vigentes |
| `npm run lint` | PASS; 0 errors, 29 warnings preexistentes |
| `npm run agent:check` | PASS; doctor 6/6, evals 9/9, knowledge fresh |
| `npm test` | PASS (portable) |
| A11y | 368 passed, 8 skipped |
| Components | 118 passed |
| Themes | 94 passed, 0 failed |
| Exports | 11 subpaths |
| `smoke:installed` | 53 isolated components |
| Task16 behavioral matrix | 54/54 Chromium/Firefox/WebKit, Light/Dark |
| Table canonical runtime | 6/6 Chromium/Firefox/WebKit, Light/Dark |
| Public contracts | 53 contracts; 51 pairs; 38 event names; 26 components |
| Runtime/full moderate audit | 0 vulnerabilities |
| Release/supply-chain policy | PASS |
| YAML/gate placement | PASS; publish depende de verify |
| Plan review R3 | APPROVED; no placeholders/contradictions pendientes |

## Artefactos y budgets

La baseline se captura desde el árbol final, después de commitear estos dos documentos y los bundles. `scripts/package-budgets.json` es la fuente de cifras exactas y conserva delta cero para bytes/requests; RSS mantiene headroom explícito y documentado para variación del proceso.

El checker mide como interfaces separadas:

- tarball y unpacked bytes;
- full/minified/foundation/components CSS;
- JSON/SQLite knowledge;
- request count de sources y bundles;
- RSS del CLI mediante Node, sin depender de `/usr/bin/time`.

## Visual policy

- Local: `npm test` no consume snapshots por plataforma.
- Autoritativo: Ubuntu + Chromium Desktop Light en CI/release.
- Firefox/WebKit: matriz funcional actual pasa; la política futura para volverlos blocking está en el plan de adiciones.
- No se generaron ni aprobaron snapshots Darwin como sustituto de Linux.

## Documento “qué agregaría”

El plan futuro fue revisado tres veces. Su versión aprobada incluye manifests canónicos, generación lossless de 53 contratos, validadores AST/parser, dependency graph recursivo, matrices Playwright, tarballs Node 20/22/24 y tres engines, default+nueve temas+AAA, budgets, compatibilidad/migración/deprecación, rollout 1.0 y shortlist `FC-A..C`.

Por decisión del usuario:

- el punto 5 no crea otro catálogo/explorer porque GitHub Pages de Ren10 ya cumple esa función;
- el punto 18 permanece diferido y no se reinterpreta;
- no se agregan Storybook, adapters de frameworks ni una segunda Pages.

## Conclusión

No quedan findings P1/P2 conocidos abiertos dentro del alcance. El siguiente trabajo autorizado, si se decide continuarlo, es ejecutar por fases el plan futuro; este cierre no implementa esos componentes candidatos.
