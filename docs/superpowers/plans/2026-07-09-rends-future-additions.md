# RenDS Future Additions — plan arquitectónico exhaustivo

> **Estado:** plan de arquitectura e implementación preparado para la revisión final de Task 17. No autoriza implementación, no modifica el catálogo actual y no sustituye el cierre/auditoría de Task 17.
>
> **Para agentes que lo ejecuten en el futuro:** usar `superpowers:writing-plans` para convertir cada fase aprobada en un plan TDD pequeño e independiente; después usar `superpowers:executing-plans` o `superpowers:subagent-driven-development`. No ejecutar este documento como una única rama masiva.

**Objetivo:** convertir los 53 contratos de RenDS en un sistema canónico, generado y verificable de extremo a extremo —fuente, CLI, documentación, navegador y tarball— antes de admitir nuevos componentes cuidadosamente seleccionados.

**Arquitectura recomendada:** un `manifest.json` colocado junto a cada componente será la única fuente estructurada de su API pública. Generadores deterministas derivarán los 53 contratos Markdown, el registro del CLI, el manifiesto agregado y el grafo de dependencias; validadores basados en parsers confrontarán esas promesas con CSS, JavaScript, HTML, exports, packlist y comportamiento Playwright. Los documentos narrativos seguirán siendo humanos, pero no volverán a definir a mano selectores, imports, atributos, eventos o tokens.

**Stack:** Node.js ESM (piso actual Node `>=20`), JSON Schema 2020-12, CSS/selector AST, JavaScript AST, parser HTML, Playwright, axe-core, npm tarballs, vanilla HTML/CSS/JS y Light DOM.

---

## 1. Restricciones globales y exclusiones

- Conservar vanilla HTML/CSS/JS, Light DOM, elementos nativos, tokens semánticos/de componente y WCAG 2.1 AA como baseline.
- `[data-contrast="aaa"]` sigue siendo opt-in y debe probarse como contrato computado, no como mera presencia de variables.
- Ningún generador escribe CSS/JS de producción. Los manifests describen el contrato; la implementación sigue siendo código revisado por humanos.
- Ningún artefacto generado puede ser editado manualmente. Cada generado debe llevar encabezado, versión de schema y digest de entrada.
- Toda salida debe ser determinista: mismo árbol + misma versión de herramientas = bytes idénticos.
- Los gates deterministas de contratos, generación, browser local, tarball y budgets no pueden depender de red, registry npm ni postinstall. Los controles que por naturaleza consultan estado externo (`npm audit` y pruebas remotas opcionales) viven en jobs de seguridad separados, con lockfile/cache y resultado explícito; nunca se presentan como gates offline.
- No agregar dependencias runtime al paquete para sostener tooling. Parsers/validadores son `devDependencies` directas y auditadas.
- Los puntos **5** y **18** de la lista de propuestas rechazada previamente quedan **fuera de alcance por decisión del usuario**. Operativamente, **5** significa no crear un segundo catálogo/explorer que duplique la GitHub Pages de Ren10, que ya concentra esas opciones y funcionalidades. **18** permanece como clave de decisión opaca y diferida: no se diseña ni implementa nada bajo ese punto hasta que el usuario lo reabra y vuelva a describirlo. Este documento no intenta reinterpretarlos, renombrarlos ni reincorporarlos.
- En particular, **no existe ni se propone un “ítem 18”** en este plan. Los futuros candidatos usan identificadores `FC-A`, `FC-B` y `FC-C` para evitar una reintroducción accidental.
- No agregar Storybook, adapters de frameworks ni plugins opcionales durante este programa. El sitio vanilla, los contratos y el CLI siguen siendo las superficies de catálogo.
- `ENHANCEMENT-PLAN.md` en `/Users/rensoconese/RenDS/ENHANCEMENT-PLAN.md` es contexto user-owned, no fuente normativa y no se modifica. `ROADMAP.md` y `STATUS.md` del worktree son históricos/stale: solo sirven para reconocer trabajo previo, no para declarar estado actual.

## 2. Baseline comprobado: qué ya existe y no debe duplicarse

| Capacidad existente | Evidencia actual | Decisión para el futuro |
|---|---|---|
| Catálogo 19 + 26 + 8 = 53 | `components/{primitives,composites,patterns}/**` y `components/components.md` | Mantener el número congelado hasta el gate 1.0. |
| Contrato colocado y `aiHints` en cada parte | 53 `component.md`/`pattern.md`; `AGENTS.md` exige la carga | Generarlos desde manifests; no crear una segunda familia de contratos. |
| Registro completo del CLI | `cli/registry.js` tiene 53 entradas | Reemplazarlo por `cli/generated/registry.js`; no sumar otro registro manual. |
| Manifest de comandos del CLI | `npx ren10 manifest --json` en `cli/index.js` | Extender la respuesta con schema/component graph; no crear un comando competidor. |
| Verificación de tokens CSS | `scripts/check-css-contracts.mjs` + test | Reusar sus conceptos y migrarlos al validador unificado; no borrar cobertura durante la transición. |
| Verificación pública básica | `scripts/check-public-contracts.mjs` + test | Fortalecer con AST/schema y paridad bidireccional. |
| Grafo JSON/SQLite consultable | `scripts/build-knowledge-graph.mjs`, `scripts/check-knowledge-graph.mjs`, `knowledge/` | Consumir el grafo canónico de componentes; el grafo de conocimiento no debe inferir nuevamente dependencias. |
| Snapshot de inventario | `scripts/generate-contract-snapshot.mjs`, `tests/snapshots/contracts.json` | Evolucionar a snapshot de API/digests, no solo nombres. |
| CLI copy smoke | `scripts/smoke-cli-copy.mjs` | Mantener durante migración y luego generar todos los casos desde closure. |
| Tarball-installed smoke | `scripts/smoke-installed-package.mjs` | Expandir a matriz de consumidores y navegadores. |
| Exports/packlist | `scripts/verify-package-exports.mjs`, `npm pack --dry-run`, knowledge check | Generar expectations desde manifest/package y validar desde el tarball real. |
| Bundles deterministas | `scripts/build-css-bundles.mjs`, `scripts/check-package-budgets.test.mjs` | Conservar byte determinism; agregar presupuesto incremental. |
| Budgets actuales | `scripts/check-package-budgets.mjs` | Mantener hard ceilings y sumar baseline/delta, requests y RSS. |
| Cobertura browser/a11y/visual | `tests/{components,a11y,visual}`, CI Chromium blocking + Firefox/WebKit advisory | Reorganizar en matriz contractual; preservar baselines visuales portables. |
| Nueve temas nombrados | `themes/appearance.css`: ocean, forest, sunset, rose, slate, purple, amber-editorial, cyber, minimal-mono | Probar los nueve más default, ambos schemes y AAA; no inventar otro set. |
| Generador de temas y AAA | `themes/theme-generator.js` y `.test.js` | Reusar el algoritmo y confrontar su CSS en navegador real. |
| Compatibilidad/migración/release inicial | `COMPATIBILITY.md`, `MIGRATION.md`, `CHANGELOG.md`, `SHIPPING.md`, `scripts/check-release.mjs` | Formalizar datos y políticas sin borrar la documentación humana. |
| Cross-browser programado | `.github/workflows/audit.yml` | Convertir Firefox/WebKit de advisory a blocking solo después de dos ciclos verdes documentados. |
| Anchor positioning/progressive fallbacks | `base/enhancements.css` y trabajo 0.9.2 | No reproponerlo como futuro; verificarlo mediante capabilities/compatibility manifests. |
| Form async/localización/persistencia/fuzz, RTL, snapshots, diagnostics | scripts/tests y `[Unreleased]` actuales | Tratar como baseline entregado; incorporar a matrices, no volver a implementarlo. |

Mediciones observadas para fijar el primer baseline (2026-07-10, no targets eternos):

- tarball: `3,344,601` bytes;
- unpacked: `18,590,891` bytes;
- `dist/ren10.css`: `510,291` bytes; minificado: `289,881` bytes;
- `dist/ren10-components.css`: `322,795` bytes; minificado: `205,188` bytes;
- `dist/ren10-foundation.css`: `186,670` bytes; minificado: `84,648` bytes;
- `knowledge/`: aproximadamente `13 MiB`; `dist/`: aproximadamente `1.5 MiB`.

Estas cifras deben capturarse de nuevo en el commit RED inicial; no se deben copiar ciegamente si el árbol cambió.

## 3. Arquitectura objetivo y ownership

### 3.1 Flujo de datos

```text
component manifest.json (53) + theme/support/budget manifests
                         |
                         v
              schema + semantic validation
                         |
       +-----------------+-------------------+
       |                 |                   |
       v                 v                   v
contracts Markdown   CLI registry      aggregate manifest
(53 colocados)       + copy plans      + dependency graph
       |                 |                   |
       +-----------------+-------------------+
                         |
                         v
 CSS/JS/HTML AST parity + Playwright behavior + tarball consumer checks
                         |
                         v
          docs / knowledge graph / release evidence
```

El sentido de autoridad es siempre de arriba hacia abajo. CSS/JS no generan automáticamente la promesa pública: solo la validan. Una clase privada puede existir sin declararse; una clase declarada pública no puede faltar. Un evento interno puede existir sin ser público solo si no usa el namespace público `ren-*` o aparece con motivo y owner en `contracts/internal-api-allowlist.json`, validado por schema y excluido del aggregate público.

### 3.2 Archivos canónicos a crear

- `schemas/ren-component-manifest.schema.json` — schema versionado de cada parte.
- `schemas/ren-theme-contract.schema.json` — temas, schemes y pares de contraste.
- `schemas/ren-compatibility.schema.json` — engines, features y fallback policy.
- `schemas/ren-budget.schema.json` — units, hard ceiling, baseline, delta y owner.
- `schemas/ren-internal-api-allowlist.schema.json` — excepciones privadas/internas con owner, motivo y vencimiento.
- `components/primitives/*/manifest.json` — 19 manifests.
- `components/composites/*/manifest.json` — 26 manifests.
- `components/patterns/*/manifest.json` — 8 manifests.
- `themes/theme-contract.json` — default + los nueve temas nombrados.
- `compatibility/contract.json` — soporte machine-readable.
- `budgets/contract.json` — política, no mediciones generadas.
- `budgets/baseline.json` — mediciones reproducibles del release base.
- `contracts/internal-api-allowlist.json` — única fuente de excepciones privadas; vacío es válido.
- `migrations/index.json` y `migrations/0.9-to-1.0.json` — recetas machine-readable.

### 3.3 Artefactos generados

- `dist/manifest/components.json` — agregado público ordenado por `id`.
- `dist/manifest/dependency-graph.json` — nodos, edges, closure y reverse edges.
- `dist/manifest/themes.json` — proyección pública de temas/contraste.
- `cli/generated/registry.js` — compatibilidad interna con `getComponent()` y `getAllComponents()`.
- `components/**/component.md` y `components/**/pattern.md` — 53 contratos generados.
- `tests/contracts/generated/component-cases.json` — matriz de capacidades y casos, no resultados.
- `tests/snapshots/public-api.json` — digests y superficies por componente.
- `knowledge/ren10-graph.{json,sqlite}` — derivados que consumen el aggregate; continúan siendo artefactos de búsqueda.

Todos los generados incluyen `schemaVersion`, `generatorVersion`, `sourceDigest` y un warning `DO NOT EDIT` cuando el formato lo permita. No incluir timestamps: rompen determinismo.

### 3.4 Interfaz mínima del manifest

```ts
type ComponentManifest = {
  schemaVersion: 1;
  id: `ren-${string}`;
  name: string;
  tier: 'primitive' | 'composite' | 'pattern';
  status: 'stable' | 'experimental' | 'deprecated';
  since: string;
  description: string;
  narrative: {
    purpose: string;
    importNotes: string[];
    accessibilityRequirements: string[];
    relatedFilesNotes: string[];
  };
  source: {
    directory: string;
    css: string[];
    js: string[];
    contract: 'component.md' | 'pattern.md';
    docs: string;
  };
  dependencies: {
    components: Array<{ id: `ren-${string}`; kind: 'runtime' | 'style' | 'composition'; required: boolean }>;
    utilities: Array<{ path: `utils/${string}`; kind: 'runtime' | 'type' }>;
    foundations: Array<'tokens' | 'layouts' | 'primitive-zero' | 'enhancements' | 'appearance'>;
  };
  publicApi: {
    customElements: string[];
    selectors: string[];
    attributes: Array<{ name: string; values?: string[]; reflected: boolean }>;
    properties: Array<{ name: string; readonly: boolean; type: string }>;
    methods: Array<{ name: string; signature: string }>;
    events: Array<{
      name: `ren-${string}`;
      detail: Record<string, string>;
      bubbles: boolean;
      composed: boolean;
      cancelable: boolean;
    }>;
    tokens: Array<{ name: `--ren-${string}`; role: string; defaultSource: string; runtimeRead: boolean }>;
  };
  tokenPolicy: {
    allowedNamespaces: Array<'semantic' | 'component'>;
    allowedTokens: string[];
    forbiddenTokens: string[];
    documentedExemptions: Array<{ token: string; rationale: string }>;
  };
  markup: {
    canonical: string;
    assertions: Array<{
      selector: string;
      nativeElement?: string;
      requiredAttributes?: Record<string, string | true>;
      min?: number;
      max?: number;
    }>;
  };
  variants: Array<{ name: string; selectorOrAttribute: string }>;
  states: Array<{ name: string; selectorOrAttribute: string; owner: 'author' | 'runtime' | 'browser' }>;
  accessibility: {
    pattern: string;
    accessibleName: 'required' | 'native' | 'not-applicable';
    keyboardProfile: string;
    focusProfile: string;
    liveRegion?: string;
    touchTarget: '44px' | 'non-touch-compact' | 'not-interactive';
  };
  behavior: {
    openState: string | null;
    reconnect: 'required' | 'not-applicable';
    rtl: 'mirrored' | 'logical' | 'not-applicable';
    reducedMotion: 'collapse' | 'essential-loop' | 'none';
    formParticipation: string | null;
  };
  applicability: Record<string, { status: 'applicable' | 'not-applicable'; rationale: string }>;
  aiHints: {
    useWhen: string[];
    avoidWhen: string[];
    forbiddenPatterns: string[];
  };
  tests: {
    capabilities: string[];
    fixtures: string[];
    expectations: Array<{ id: string; assertion: string; evidence: string[] }>;
  };
  lifecycle: {
    deprecated?: { since: string; removeAfter: string; replacement: string; migrationId: string };
  };
};
```

Reglas de diseño del schema:

- No guardar prosa duplicada que pueda derivarse: imports salen de `source` + `dependencies`; listas de tokens/selectores salen una sola vez de `publicApi`.
- `not-applicable` debe ser explícito y llevar `rationale` estructurado. Ningún componente puede omitir teclado, reconnect, RTL, motion o touch sin explicar por qué no aplican.
- `aiHints` es el único owner de `useWhen`/`avoidWhen`; `narrative` no los duplica. `narrative`, `accessibilityRequirements`, las listas allowed/forbidden de `tokenPolicy`, `importNotes` y `tests.expectations` preservan la información humana que no puede derivarse sin pérdida. El renderer puede normalizar formato, pero no resumir ni descartar esos campos.
- `composition` expresa una recomendación de markup; `runtime/style` entra en la closure instalable.
- Los utilities y los componentes son namespaces distintos. El `deps: ['id-generator.js']` actual no vuelve a mezclarse con `ren-calendar` o `ren-field`.
- `canonical` debe parsear como fragmento HTML. `assertions` es la fuente verificable de `aiHints.requiredMarkup`; no intentar validar prosa libre.
- El schema del manifest es API de tooling. Un cambio incompatible sube `schemaVersion` y mantiene lector de N-1 durante un release menor completo.

## 4. Fases priorizadas

Cada fase es una unidad revisable. El orden es obligatorio porque las fases posteriores consumen interfaces producidas por las anteriores.

### Fase 0 — Congelar baseline y diseñar schemas (P0)

**Resultado:** baseline reproducible, schemas aprobados y fixture único; cero cambios en contratos de usuario.

**Crear:**

- `schemas/ren-component-manifest.schema.json`
- `schemas/ren-theme-contract.schema.json`
- `schemas/ren-compatibility.schema.json`
- `schemas/ren-budget.schema.json`
- `schemas/ren-internal-api-allowlist.schema.json`
- `themes/theme-contract.json` — baseline inicial de default + nueve temas para que Fase 2 pueda generar su proyección sin depender de Fase 8.
- `contracts/internal-api-allowlist.json`
- `scripts/lib/manifests/load-manifests.mjs`
- `scripts/lib/manifests/validate-schema.mjs`
- `scripts/lib/manifests/types.d.ts`
- `scripts/lib/manifests/__fixtures__/valid-button.json`
- `scripts/lib/manifests/__fixtures__/invalid-manifests/*.json`
- `scripts/lib/manifests/validate-schema.test.mjs`

**Modificar:** `package.json`, `package-lock.json`, `CONTRIBUTING.md`.

**Interfaz producida:**

```js
loadComponentManifests(root): Promise<ComponentManifest[]>
validateManifest(value, sourcePath): { ok: true, value } | { ok: false, errors: ManifestDiagnostic[] }
```

**TDD RED:** escribir casos que fallen por `id`/directorio divergentes, tier inválido, selector sin punto, token fuera de `--ren-*`, evento fuera de `ren-*`, dependencia desconocida, `not-applicable` ausente, ruta que escapa del package y deprecation incompleta. Ejecutar `node --test scripts/lib/manifests/validate-schema.test.mjs`; esperar fallos porque loader/schema no existen.

**GREEN:** agregar validación estricta (`additionalProperties: false`) y diagnósticos con `code`, `path`, JSON Pointer y mensaje estable. Declarar parsers como `devDependencies` directas con versiones lockeadas; ningún cambio en `dependencies` runtime.

**Gate:** fixtures válidos pasan, cada inválido falla por el código esperado y `npm pack --dry-run` no cambia por parsers dev. En un job de seguridad con red separado, tanto `npm audit --omit=dev --audit-level=moderate` como `npm audit --audit-level=moderate` quedan en cero y son gates bloqueantes.

### Fase 1 — Migrar 53 manifests sin cambiar API (P0)

**Resultado:** los 53 manifests representan byte por byte el contrato público existente y pasan revisión humana.

**Crear:**

- `scripts/migrations/bootstrap-component-manifests.mjs` — herramienta one-shot, explícitamente no canónica.
- `scripts/migrations/bootstrap-component-manifests.test.mjs`
- `components/{primitives,composites,patterns}/*/manifest.json` — exactamente 53.
- `docs/audits/manifest-bootstrap-review.md` — ledger 53/53 con reviewer y discrepancias resueltas.

**Modificar:** ninguno de los CSS/JS públicos salvo que la auditoría descubra un bug y se abra una tarea RED/GREEN separada.

**TDD RED:** ejecutar bootstrap en fixtures que contienen headings alternativos (`Required Imports` vs `Required CSS / JS Imports`), aiHints YAML, markup multiline y `None detected`; exigir salida estable y diagnostics para ambigüedad. Luego ejecutar contra el repo y esperar 53 manifests incompletos o discrepancias.

**GREEN:** bootstrap propone datos desde contratos/registry/CSS/JS, pero nunca decide silenciosamente entre fuentes contradictorias. Cada conflicto se registra y se resuelve manualmente contra `ren-design.md`, el contrato colocado y el runtime. Capturar expresamente dependencias componentes hoy implícitas, al menos `ren-menu -> ren-context-menu`, `ren-date-picker -> ren-calendar`, `ren-date-range-picker -> ren-calendar` y `ren-form -> ren-field`; revisar composiciones como `ren-empty-state -> ren-button/ren-icon` sin convertirlas automáticamente en runtime deps.

**Gate:** 19/26/8, IDs/rutas únicos, todos con owner explícito para cada eje conductual, ningún cambio en `tests/snapshots/public-api.json` respecto de la API 0.9.3 aprobada, ledger 53/53 sin “pending”.

### Fase 2 — Generación determinista de contratos y artefactos (P0)

**Resultado:** los manifests se vuelven fuente única; los 53 Markdown y registros dejan de divergir.

**Crear:**

- `scripts/generate-contracts.mjs`
- `scripts/generate-manifest-artifacts.mjs`
- `scripts/check-generated-artifacts.mjs`
- `scripts/lib/manifests/render-contract.mjs`
- `scripts/lib/manifests/build-registry.mjs`
- `scripts/lib/manifests/stable-json.mjs`
- `scripts/generate-contracts.test.mjs`
- `scripts/check-generated-artifacts.test.mjs`
- `cli/generated/registry.js`
- `dist/manifest/components.json`
- `dist/manifest/themes.json`

**Modificar:** `cli/index.js`, `cli/registry.js` (shim temporal), `scripts/build-knowledge-graph.mjs`, `scripts/check-knowledge-graph.mjs`, `scripts/generate-contract-snapshot.mjs`, `package.json`, `AGENTS.md`, `skills/rends/SKILL.md`.

**Interfaz producida:**

```js
renderContract(manifest): string
buildAggregate(manifests): AggregateManifest
buildRegistryModule(manifests): string
checkGeneratedArtifacts({ root }): Promise<Diagnostic[]>
```

**TDD RED:** tests golden de button, dialog, form y un CSS-only component; alterar un generado en temp y exigir `GENERATED_DRIFT`; generar dos veces y comparar SHA-256. El primer `npm run contracts:check` debe fallar porque los Markdown manuales no son byte-equivalentes.

**GREEN:** preservar sin pérdida las secciones conocidas (`Purpose`, `Use When`, `Do Not Use When`, `aiHints`, imports/import notes, canonical markup, variants, states, tokens/token policy, accessibility requirements, related files, tests y rationale de cada NA). `dist/manifest/themes.json` se deriva del `themes/theme-contract.json` baseline creado en Fase 0. El shim `cli/registry.js` reexporta la interfaz generada durante un release y emite cero cambios de salida en `ren10 list`, `component`, `build`, `search` y `manifest --json`.

**Scripts nuevos:**

```json
{
  "contracts:build": "node scripts/generate-contracts.mjs --write && node scripts/generate-manifest-artifacts.mjs --write",
  "contracts:check": "node scripts/check-generated-artifacts.mjs",
  "test:contracts": "node --test scripts/**/*.test.mjs"
}
```

**Gate:** 53 Markdown regenerados y revisados, build doble con hashes iguales, `git diff --exit-code` después de `contracts:build`, CLI JSON contract sin breaking drift, knowledge graph consume aggregate y no re-extrae selectors/deps mediante regex.

### Fase 3 — Validadores semánticos bidireccionales (P0)

**Resultado:** toda promesa pública es real y toda API pública observable está documentada o clasificada.

**Crear:**

- `scripts/check-contract-system.mjs`
- `scripts/lib/contracts/diagnostics.mjs`
- `scripts/lib/contracts/parse-css.mjs`
- `scripts/lib/contracts/parse-js.mjs`
- `scripts/lib/contracts/parse-html.mjs`
- `scripts/lib/contracts/check-files.mjs`
- `scripts/lib/contracts/check-selectors.mjs`
- `scripts/lib/contracts/check-tokens.mjs`
- `scripts/lib/contracts/check-elements.mjs`
- `scripts/lib/contracts/check-attributes.mjs`
- `scripts/lib/contracts/check-events.mjs`
- `scripts/lib/contracts/check-imports.mjs`
- `scripts/lib/contracts/check-markup.mjs`
- `scripts/lib/contracts/check-docs-evals.mjs`
- `scripts/lib/contracts/*.test.mjs`
- `scripts/lib/contracts/__fixtures__/{css,js,html,manifests}/`

**Modificar:** `scripts/check-css-contracts.mjs`, `scripts/check-public-contracts.mjs` (wrappers temporales), `package.json`, `.github/workflows/ci.yml`.

**Validaciones obligatorias:**

1. Schema, conteos, rutas, lowercase y uniqueness.
2. Archivos declarados existen; archivos públicos no declarados fallan.
3. Selectores públicos del manifest existen en AST CSS; selectores privados pueden existir, pero un prefijo `ren-` no declarado requiere allowlist explícita con motivo.
4. Cada `--ren-*` público tiene declaración/default y al menos un consumo efectivo CSS o lectura runtime; cada `--ren-*` de código debe estar documentado o marcado interno. Mantener detección de unresolved references/fallbacks del checker actual.
5. Custom element declarado se registra exactamente una vez con la clase correcta; tags canónicos desconocidos fallan.
6. Atributos públicos observados/reflejados coinciden con `observedAttributes`, getters/setters y selectors CSS. Las limitaciones del análisis estático se cubren en browser, no con regex optimista.
7. Métodos/propiedades públicos existen en prototype runtime y respetan readonly/type smoke.
8. Eventos: paridad exacta de nombre, `detail` keys, `bubbles`, `composed`, `cancelable`; runtime `ren-*` no declarado falla y manifest sin emisión/dispatch observable falla cuando no es evento nativo/delegado.
9. Imports ESM se resuelven, quedan dentro del package, concuerdan con utility/component edges y no forman ciclos runtime inválidos.
10. Markup canónico parsea, satisface assertions, usa elementos nativos requeridos y no contiene frameworks, placeholders ni inline colors prohibidos.
11. Docs, examples, evals, CLI y knowledge solo referencian IDs/selectores/imports vigentes.
12. Exports y packlist incluyen todo archivo público declarado y ningún generated stale.

**TDD RED:** una fixture por diagnostic code y por dirección (manifest-promete/código-falta; código-expone/manifest-falta). Los tests deben demostrar que comments/strings, nested `var()`, selector lists, template literals, aliases de imports y `CustomEvent` con options no producen falsos positivos.

**GREEN:** parsers reales; diagnostics ordenados por path/line/code; salida humana y `--json`. Mantener wrappers viejos un release, delegando al sistema nuevo, para no romper scripts de consumidores.

**Gate:** `npm run contracts:check` devuelve cero; mutation suite inserta 25 fallos deliberados y cada uno es detectado; tiempo de checker por debajo de 5 s en CI warm y memoria RSS por debajo de su budget.

### Fase 4 — Grafo recursivo y CLI transaccional (P0)

**Resultado:** `add`, `remove`, `upgrade`, `build` y tarball usan una closure única y verificable.

**Crear:**

- `scripts/lib/dependency-graph/build-graph.mjs`
- `scripts/lib/dependency-graph/resolve-closure.mjs`
- `scripts/lib/dependency-graph/validate-graph.mjs`
- `scripts/lib/dependency-graph/*.test.mjs`
- `cli/install-plan.js`
- `cli/lockfile.js`
- `dist/manifest/dependency-graph.json`
- `docs/cli-lockfile.md`

**Modificar:** `cli/index.js`, `cli/registry.js` shim, `scripts/smoke-cli-copy.mjs`, `scripts/smoke-installed-package.mjs`, `scripts/build-knowledge-graph.mjs`, `package.json`, `README.md`, `docs/cli.html`.

**Modelo de nodos:** `component`, `utility`, `foundation`, `asset`. **Edges:** `runtime-import`, `style-import`, `foundation-requires`, `composition`. Solo las primeras tres entran en closure instalable; composition informa agentes/docs.

**Interfaz producida:**

```js
buildDependencyGraph(manifests, sourceAnalysis): DependencyGraph
resolveClosure(graph, requestedIds): { orderedNodes: NodeId[]; reasons: Record<NodeId, NodeId[]> }
createInstallPlan({ requested, targetRoot, lockfile }): InstallPlan
applyInstallPlan(plan): Promise<{ written: string[]; removed: string[]; lockfile: RenLock }>
```

`RenLock` guarda package version, manifest schema, target layout, requested roots, closure, hashes de archivos y local modifications. No guarda timestamps.

**TDD RED:** ciclos A→B→A; utility transitiva; component style dep; dep opcional; múltiples roots compartiendo dep; remove con reverse dependent; upgrade con override local; dry-run idéntico; rollback ante write failure; path traversal; imports del source layout reescritos al layout consumer. El primer test real debe demostrar que los deps component-to-component implícitos del registro actual no se copian recursivamente.

**GREEN:** topological sort determinista, cycle diagnostics con ruta completa, plan antes de escribir, staging temp + rename, lockfile y rollback. `remove` no elimina una dependencia compartida; ofrece removerla solo cuando reverse closure queda vacía. `upgrade` calcula closure nueva antes de tocar disco.

**Migración de layout:** mantener el layout flat actual como `targetLayout: "flat-v1"` durante toda la línea 0.x/compatibilidad 1.0. No cambiar rutas de consumidor en esta fase. Evaluar un layout jerárquico solo como cambio mayor separado, con migrator y redirects; no es condición de este programa.

**Gate:** cada uno de los 53 componentes se instala solo desde el tarball y su closure resuelve; instalación de los 53 juntos no duplica archivos; add/remove/upgrade son idempotentes; ninguna importación copiada queda rota; graph JSON coincide con imports AST y manifests.

### Fase 5 — Generación y validación contractual de los 53 (P0)

**Resultado:** cada parte tiene contrato, fixture y declaración explícita de capacidad/NA.

**Crear:**

- `tests/contracts/generated/component-cases.json`
- `tests/contracts/manifest-coverage.test.mjs`
- `tests/contracts/contract-generation.test.mjs`
- `tests/contracts/public-api-snapshot.test.mjs`
- `tests/snapshots/public-api.json`
- `docs/audits/component-contract-coverage.md`

**Modificar:** `scripts/generate-contract-snapshot.mjs`, `tests/snapshots/contracts.json`, `evals/checklist.md`, `evals/prompts.json`, `scripts/build-knowledge-graph.mjs`.

**Cobertura 53/53 requerida:** source files, canonical markup, imports, deps, selectors, states, tokens, custom element (o NA), attrs/properties/methods/events (o NA), native semantics, keyboard profile, focus profile, open state (o NA), reconnect (o NA), RTL, density, reduced motion, themes, docs, example/eval relevance y tarball availability.

**TDD RED:** borrar en temp una capability de cada tier y exigir matriz incompleta; alterar manifest sin regenerar Markdown/snapshot/graph y exigir drift; insertar API breaking sin migration ID y exigir error.

**GREEN:** `component-cases.json` se genera solo desde manifests y es estable. El ledger no afirma comportamiento: enlaza al test que lo prueba. Un `not-applicable` cuenta únicamente si tiene rationale estructurado o perfil que lo justifique.

**Gate:** coverage report 53/53 y 100% de campos; ningún placeholder; digest del contract, source API y test profile almacenado; eval/knowledge/CLI referencian aggregate canonical.

### Fase 6 — Matriz Playwright completa y sostenible (P0/P1)

**Resultado:** el contrato observable se ejecuta por perfil, engine y contexto sin una explosión cartesiana opaca.

**Crear:**

- `tests/matrix/playwright.config.cjs`
- `tests/matrix/component-contract.spec.cjs`
- `tests/matrix/keyboard.spec.cjs`
- `tests/matrix/open-state.spec.cjs`
- `tests/matrix/reconnect.spec.cjs`
- `tests/matrix/rtl.spec.cjs`
- `tests/matrix/density.spec.cjs`
- `tests/matrix/reduced-motion.spec.cjs`
- `tests/matrix/form-participation.spec.cjs`
- `tests/matrix/events.spec.cjs`
- `tests/matrix/theme-surface.spec.cjs`
- `tests/matrix/fixtures/runner.html`
- `tests/matrix/helpers/{load-case,assert-a11y,assert-events,assert-focus,assert-tokens}.cjs`
- `scripts/shard-playwright-matrix.mjs`

**Modificar:** `tests/utils/ren-test-utils.js`, `tests/components/playwright.config.cjs`, `tests/components/*.spec.cjs`, `tests/a11y/*.spec.cjs`, `.github/workflows/ci.yml`, `.github/workflows/audit.yml`, `.github/workflows/release.yml`, `package.json`.

**Ejes y política:**

| Eje | Valores | Aplicación |
|---|---|---|
| Component | 53 | Siempre; capacidad o NA explícito. |
| Engine | chromium, firefox, webkit | Los tres para contrato; visual queda Chromium/Linux salvo baseline aprobado. |
| Color scheme | light, dark | Todos mediante diseño pairwise en PR; full nightly. |
| Direction | ltr, rtl | Todos; asserts específicos solo donde `rtl != not-applicable`. |
| Density | compact, comfortable/default, spacious | Geometría/touch en todos; full nightly. |
| Motion | no-preference, reduce | Todos los que declaran motion; computed sweep global. |
| Lifecycle | first-connect, reconnect×1, reconnect×3 | Todo JS-bearing component. |
| Open state | closed, pointer-open, keyboard-open, Escape-close, outside-dismiss, programmatic | Solo perfiles que declaran openState. |
| Keyboard | profile-specific key map | Menus, listboxes, grids, dialogs, tabs, toolbar, forms, overlays y controles. |
| Theme | default + 9 named | Suite de tema separada, ver Fase 8. |
| Contrast | normal, AAA | Suite de tema separada; AAA no se mezcla con todos los behavior tests de PR. |

“Matriz completa” significa que cada celda aplicable está enumerada y tiene resultado, no que cada PR ejecute el producto cartesiano entero. Estrategia:

- **PR blocking:** 53×Chromium en canonical case; behavior profiles completos; set pairwise determinista que cubre cada valor de scheme/direction/density/motion al menos una vez por componente.
- **PR cross-browser blocking (después del rollout):** 53×Firefox/WebKit canonical + perfiles críticos de teclado/open/form.
- **Nightly full, sharded:** 53×3 engines×2 direction×2 scheme×3 density×2 motion = 3,816 context cases, filtrando asserts NA pero conservando render/axe/console checks. Lifecycle/open/keyboard corren por capability, no se multiplican innecesariamente por todos los contextos.
- **Release:** PR suite completa + theme/AAA + tarball en los tres engines; visual Chromium/Linux.

**Asserts comunes:** sin pageerror/console error, upgrade definido cuando aplica, markup comprensible antes de upgrade cuando el contrato promete progressive enhancement, axe AA, foco visible, target 44×44 salvo `non-touch-compact`, tokens resueltos, lógica RTL, motion colapsado, eventos exactos y teardown sin listeners/timers duplicados.

**TDD RED:** primero generar la matriz y exigir fallos por capability no cubierta; inyectar listener duplicado al reconnect fixture; evento con `bubbles` incorrecto; open state desincronizado; RTL físico; duración raw; target bajo 44. Cada regression debe fallar con component/context/capability en el título.

**GREEN:** runner construye canonical markup desde manifest, importa el aggregate y usa adaptadores por profile solo para acciones. Evitar un fixture HTML manual por componente cuando la diferencia es datos; conservar fixtures manuales actuales para bugs complejos y hacerlos referencia desde manifest.

**Gate:** 53/53 Chromium; Firefox/WebKit sin skips no justificados; cero flaky retry durante 20 corridas de los profiles críticos; reporte JSON muestra 100% de celdas aplicables; duración PR objetivo <15 min por sharding, nightly <45 min.

### Fase 7 — Tarball e instalación real (P0)

**Resultado:** se prueba lo que recibe el consumidor, no el checkout.

**Crear:**

- `tests/installed/pack-once.mjs`
- `tests/installed/consumer-matrix.test.mjs`
- `tests/installed/browser-consumer.spec.cjs`
- `tests/installed/fixtures/{esm-import,cli-single,cli-all,upgrade,agent-docs}/`
- `tests/installed/playwright.config.cjs`
- `scripts/check-tarball-contract.mjs`

**Modificar:** `scripts/smoke-installed-package.mjs`, `scripts/smoke-cli-copy.mjs`, `scripts/verify-package-exports.mjs`, `package.json`, `.github/workflows/ci.yml`, `.github/workflows/release.yml`.

**Entornos:** Node 20 (floor), Node 22 y Node 24; npm install desde path `.tgz` con `--ignore-scripts --no-audit --no-fund`; Chromium/Firefox/WebKit sirviendo el consumer temporal. Ningún test debe resolver `../` de vuelta al checkout.

**Casos obligatorios:**

1. `import.meta.resolve` para todos los exports declarados.
2. Import CSS foundation/full/component desde `node_modules/ren10`.
3. Importar cada JS-bearing component y verificar `customElements.get(tag)`.
4. CLI `init`; `add` individual de cada uno de los 53; `add` de todos; closure/hashes/lockfile.
5. `upgrade --dry-run`, `upgrade --force`, local override, remove root, reverse dependency y rollback.
6. `manifest --json`, `component --dense`, `build --json`, `doctor`, `agent-docs`, knowledge JSON/SQLite fallback.
7. Packlist: manifests, contracts, dist, schemas públicos, migrations aplicables y ausencia de fixtures/dev parsers.
8. Browser: canonical render y behavior crítico desde rutas del tarball.

**TDD RED:** ejecutar el nuevo checker solo contra `.tgz`; esperar faltantes de aggregate/schema/exports y component closures. Probar deliberadamente un import que solo funciona desde checkout.

**GREEN:** pack una vez por job, cache local por hash, consumers aislados con HOME/npm cache temporales. `package.json.files` y `exports` se actualizan desde una lista revisada, no con wildcard accidental para tooling privado.

**Gate:** 53 installs individuales + all install pasan; 3 Nodes; 3 engines; `npm pack --dry-run --json` y tarball real tienen misma lista/digests; cero postinstall/network; cleanup elimina todos los temp dirs incluso al fallar.

### Fase 8 — Nueve temas, default y AAA (P0/P1)

**Resultado:** la promesa de theme swap y AAA se prueba en valores computados para todo el catálogo.

**Crear:**

- `tests/themes/theme-contract.test.mjs`
- `tests/themes/theme-matrix.spec.cjs`
- `tests/themes/contrast-pairs.spec.cjs`
- `tests/themes/component-token-resolution.spec.cjs`
- `tests/themes/playwright.config.cjs`
- `scripts/check-theme-contract.mjs`

**Modificar:** `themes/theme-contract.json` creado en Fase 0, `themes/theme-generator.test.js`, `themes/appearance.css`, `tests/components/foundation-contract.spec.cjs`, `.github/workflows/audit.yml`, `.github/workflows/release.yml`, `package.json`, `docs/theming.html`.

**Set exacto:** `default`, y los nueve named `ocean`, `forest`, `sunset`, `rose`, `slate`, `purple`, `amber-editorial`, `cyber`, `minimal-mono`; schemes `light|dark`; contrast `normal|aaa`.

**Contratos de contraste:**

- AA normal text ≥4.5:1; large text ≥3:1.
- AAA normal text ≥7:1; large text ≥4.5:1.
- Non-text UI/focus/borders significativos ≥3:1 (WCAG no define un nivel AAA mayor para este criterio; no inventarlo).
- Por contrato reforzado de RenDS, foreground/surface y on-accent dentro de `[data-contrast="aaa"]` deben computar ≥7:1 cuando el rol es texto normal.
- Los pares se declaran como token roles en `theme-contract.json`; no testear combinaciones arbitrarias que nunca aparecen juntas.

**Cobertura:** 10 themes×2 schemes×2 contrast modes para pares semánticos; 53 components para unresolved/custom-token computed sweep; canonical axe en cada named theme/scheme; representative visual snapshots de cada familia, sin exigir 2,120 PNGs. Las diferencias visuales se revisan por tema; la corrección contractual se prueba numéricamente.

**TDD RED:** theme faltante, token sin resolver, AAA antes del named theme en cascade, `on-accent` incompatible, generator output que difiere del navegador y focus ring <3:1. Demostrar que forest/sunset y dark-first cyber están cubiertos.

**GREEN:** parser de colores computed (rgb/rgba/color) desde browser, ratio WCAG reproducible, diagnostics con theme/scheme/pair/ratio/threshold. El test unitario del generator permanece rápido; el browser es autoridad final.

**Gate:** 9/9 named + default, ambos schemes, AAA; cero pares bajo threshold; 53/53 sin unresolved tokens; cambios de theme no alteran estructura/eventos; reporte versionado adjunto al release.

### Fase 9 — Budgets de package, CSS, requests y memoria (P1)

**Resultado:** crecimiento intencional, medible y explicable.

**Crear:**

- `budgets/contract.json`
- `budgets/baseline.json`
- `scripts/measure-budgets.mjs`
- `scripts/compare-budgets.mjs`
- `scripts/check-request-budgets.mjs`
- `scripts/check-cli-memory-budget.mjs`
- `scripts/measure-budgets.test.mjs`
- `tests/performance/request-budget.spec.cjs`
- `docs/performance-budgets.md`

**Modificar:** `scripts/check-package-budgets.mjs`, `scripts/check-package-budgets.test.mjs`, `scripts/check-performance-contract.mjs`, `package.json`, `.github/workflows/ci.yml`, `.github/workflows/release.yml`.

**Política inicial propuesta (confirmar con nueva medición RED):**

| Métrica | Baseline observado | Hard ceiling inicial | Delta PR sin waiver |
|---|---:|---:|---:|
| Tarball | 3,344,601 B | 4 MiB | max(+1%, +32 KiB) |
| Unpacked | 18,590,891 B | 19 MiB | max(+0.5%, +64 KiB) |
| Full CSS | 510,291 B | 550 KiB | +8 KiB |
| Full CSS min | 289,881 B | 320 KiB | +5 KiB |
| Components CSS min | 205,188 B | 225 KiB | +4 KiB |
| Foundation CSS min | 84,648 B | 100 KiB | +2 KiB |
| Knowledge aggregate | medir archivos, no `du` | mantener cap 12 MiB por archivo existente | cero duplicación de bodies |
| CLI `manifest/build/doctor` peak RSS | capturar en Fase 9 RED | baseline +15%, ceiling 128 MiB | +5% |

El checker existente usa 20 MiB unpacked, 8 MiB tarball, 900/500 KiB CSS y 12 MiB por knowledge file. Durante rollout se conservan como ceiling legacy y los nuevos límites empiezan en warning por un release; luego pasan a blocking si la nueva medición demuestra que son portables.

**Requests:**

- bundle full/foundation/components: 1 request CSS por entrypoint;
- install modular: `1 CSS + 1 JS` por root cuando existen, más closure única; sin duplicados;
- el límite absoluto por root se deriva del mayor closure aprobado y se guarda en baseline, no se hardcodea sin medir;
- 0 requests runtime a CDN/third parties en canonical fixtures;
- fonts/icons externas no forman parte de RenDS core.

**Memoria browser:** no fijar heap absoluto entre engines en la primera versión. Gatear invariantes estables: cero listeners/timers duplicados después de reconnect×3, cero detached roots retenidos por controllers conocidos y conteo DOM vuelve al baseline tras close/remove. Heap/RSS browser queda advisory hasta dos ciclos estables.

**TDD RED:** inflar un fixture bundle, duplicar knowledge body, agregar request repetida, dejar timer vivo y simular CLI sobre ceiling. Exigir diagnostics en bytes y porcentaje, con owner/waiver ID.

**GREEN:** medir después de build determinista y tarball real; baseline solo se actualiza con `--update --reason <issue>` y genera diff revisable. Waiver expira en versión/fecha y nunca permite superar hard ceiling.

**Gate:** hard ceilings + deltas verdes, request closure exacta, RSS verde en Node matrix, no waiver sin issue/expiry, reporte adjunto a PR/release.

### Fase 10 — Compatibilidad, migración y deprecación (P1)

**Resultado:** política ejecutable, no solo prosa.

**Crear:**

- `compatibility/contract.json`
- `migrations/index.json`
- `migrations/0.9-to-1.0.json`
- `scripts/check-compatibility.mjs`
- `scripts/check-migrations.mjs`
- `scripts/check-deprecations.mjs`
- `scripts/*.test.mjs` correspondientes
- `cli/migrate.js`
- `docs/deprecation-policy.md`

**Modificar:** `COMPATIBILITY.md`, `MIGRATION.md`, `CHANGELOG.md`, `SHIPPING.md`, `CONTRIBUTING.md`, `scripts/check-release.mjs`, `scripts/check-supply-chain.mjs`, `cli/index.js`, `package.json`, `.github/workflows/release.yml`.

**Política propuesta:**

- API pública incluye selectors documentados, custom elements, attrs, properties, methods, events/detail/options, tokens, import/export paths, CLI flags/JSON response, manifest schema y layout de copia.
- Semver: adición compatible = minor; fix contract-compatible = patch; removal/rename/semantic change = major. Antes de 1.0, RenDS igualmente documenta y migra breaking changes; no usa “0.x permite romper” como excepción.
- Deprecation requiere `since`, replacement, migration ID, changelog y test de alias.
- Ventana mínima: un release minor completo y 90 días; removal solo en major, salvo vulnerabilidad/estándar removido con rationale.
- Warnings runtime permanecen opt-in mediante diagnostics; nunca ensucian consola por defecto.
- Aliases de token/selectors conservan comportamiento y se validan hasta removal.
- Compatibility: Node floor + dos líneas LTS probadas; browser support ejecutable cubre las revisiones Chromium/Firefox/WebKit fijadas por el lock de Playwright. No se promete “current + previous stable” con una sola revisión por engine. Si esa ventana se aprueba después, requiere un job remoto/versionado adicional que ejecute ambas versiones y enlace resultados desde `compatibility/contract.json`. Features modernas declaran `required|progressive|unsupported` y un fallback test ID.
- Manifest reader soporta schema N y N-1. Writer solo emite N.

**CLI futura:** `npx ren10 migrate --from 0.9 --to 1.0 --dry-run`; produce plan, diff y backup path, pero no cambia local overrides sin `--force`. Recetas iniciales cubren contract filenames lowercase, token aliases, CLI lockfile y cualquier cambio aprobado de imports; no inventar codemods para APIs que no cambiaron.

**TDD RED:** deprecation sin replacement, removal temprano, breaking snapshot sin migration, feature progressive sin fallback test, Node/browser support sin job CI, migrator no idempotente y downgrade no soportado sin error claro.

**GREEN:** generar tablas humanas en `COMPATIBILITY.md`/`MIGRATION.md` desde datos más secciones narrativas preservadas. Release check compara API snapshot con último tag/tarball y clasifica semver esperado.

**Gate:** breaking diff obliga major + migration; toda deprecation tiene test/fecha; compatibility entries enlazan jobs; migrator dry-run/idempotence/rollback pasan desde tarball.

### Fase 11 — Rollout de la plataforma y gate 1.0 (P0)

**Orden recomendado:**

1. **0.10.0, dual-read:** manifests presentes; contratos/registry aún comparados con manuales; nuevos checks warning salvo schema/counts.
2. **0.11.0, generated-authoritative:** manifests fuente; contratos/registry/graphs generados; wrappers legacy siguen funcionando; matrices cross-browser advisory con burn-in.
3. **1.0.0-rc.1:** freeze de API; Firefox/WebKit contract jobs blocking; tarball/theme/budget/migration release gates completos.
4. **1.0.0:** retirar edición manual y bootstrap parser, conservar readers/wrappers prometidos; publicar API snapshot, compatibility report y migration guide.
5. **1.1+ únicamente:** evaluar `FC-A..C` uno por uno. Un candidato rechazado no pasa a implementación por estar listado aquí.

**Acceptance gate 1.0:**

- 53 manifests schema-valid y revisados; 53 contratos byte-generated; cero drift.
- Todos los validators bidireccionales en cero.
- Dependency graph closure y reverse closure correctos; CLI transaccional desde tarball.
- Matriz 53/53 Chromium/Firefox/WebKit sin skips no justificados; cross-browser blocking con dos ciclos verdes previos.
- Nueve themes + default, light/dark, normal/AAA verdes.
- Package/exports/packlist/installed consumers en Node 20/22/24 verdes.
- Budgets y requests verdes; memory invariants verdes.
- API diff clasificado; MIGRATION/COMPATIBILITY/CHANGELOG/SHIPPING actualizados.
- `npm run lint`, `npm run agent:check`, evals, knowledge, supply chain y release checks verdes.
- Auditoría fresh (no checklist heredado) encuentra cero P1/P2 y cero generated/manual divergence.

## 5. Componentes futuros cuidadosamente seleccionados

### 5.1 Gate de admisión común

Un futuro componente solo entra si se cumplen todos:

1. Evidencia de al menos dos casos de producto reales y repetidos; no solo paridad con otra librería.
2. No lo resuelven Primitive Zero, un layout, una receta o composición de componentes existentes.
3. Patrón WAI-ARIA/native definido y keyboard model implementable sin simular semántica innecesaria.
4. Manifest, contrato generado, docs, example, eval y todos los perfiles de matriz en el mismo PR.
5. Tarball closure, budget delta y fallback/progressive policy aprobados.
6. Cero API experimental dentro de un componente `stable`; si hay incertidumbre, incubar en `status: experimental` fuera del bundle full por un minor.
7. Un componente por release minor para atribuir regressions y adopción.

No se seleccionan split button (composición button+menu), stepper visual (ya vive en `ren-form`), code block (Primitive Zero), data grid (extendería demasiado `ren-table`) ni timeline (receta/layout hasta demostrar behavior propio).

### FC-A — `ren-tree` (primer candidato)

**Hueco real:** navegación/selección jerárquica no cubierta por menu, accordion o sidebar. **Semántica:** `role=tree/treeitem/group`, roving tabindex, Arrow Up/Down/Left/Right, Home/End, typeahead, multiselect opt-in; nodos expandibles usan buttons reales. **No incluir:** filesystem IO, drag/drop o virtualización en v1.

**Crear si el gate se aprueba:**

- `components/composites/ren-tree/{manifest.json,ren-tree.css,ren-tree.js,component.md}`
- `docs/components/ren-tree.html`
- `examples/tree-navigation.html`
- `tests/matrix/profiles/tree.cjs`

**Deps esperados:** utilities de keyboard/id solamente si el grafo demuestra imports; no depender de `ren-menu`. **Budget propuesto:** minified CSS ≤6 KiB, JS ≤12 KiB, closure total ≤20 KiB antes de gzip.

**RED/GREEN:** primero keyboard/focus/selection/reconnect/RTL/axe tests desde canonical manifest; luego runtime mínimo. **Gate:** 3 engines, 44px/touch policy, single/multi selection, disabled filtering, no duplicate events al reconnect.

### FC-B — `ren-time-picker` (segundo candidato)

**Hueco real:** complementa date/date-range para horarios donde `<input type="time">` no alcanza por steps, rangos o UX consistente. **Progressive core:** input nativo `type=time` siempre usable; enhancement opcional para segmentos/listbox. **No incluir:** time zones, calendar, scheduling recurrence o locale parsing libre en v1.

**Crear si el gate se aprueba:**

- `components/composites/ren-time-picker/{manifest.json,ren-time-picker.css,ren-time-picker.js,component.md}`
- `docs/components/ren-time-picker.html`
- `examples/date-time-form.html`
- `tests/matrix/profiles/time-picker.cjs`

**Deps esperados:** `ren-field` como composition, no runtime; dismiss/id utility solo si existe popover real. **Budget:** minified CSS ≤5 KiB, JS ≤10 KiB, closure ≤18 KiB.

**RED/GREEN:** native form submit/reset/required/min/max/step primero; teclado, locale display y open state después. **Gate:** ISO-like submitted value estable, sin timezone shifts, no-JS usable, 3 engines y form-associated suite completa.

### FC-C — `ren-resizable-panels` (tercer candidato)

**Hueco real:** workspaces/editor shells con dos o más paneles y separador operable; no lo cubren layouts estáticos. **Semántica:** `role=separator`, `aria-orientation`, `aria-valuemin/max/now`, pointer capture, flechas/Home/End, min/max tokens, persistencia opt-in. **No incluir:** docking, floating windows, arbitrary nesting o drag-to-reorder en v1.

**Crear si el gate se aprueba:**

- `components/composites/ren-resizable-panels/{manifest.json,ren-resizable-panels.css,ren-resizable-panels.js,component.md}`
- `docs/components/ren-resizable-panels.html`
- `examples/resizable-workspace.html`
- `tests/matrix/profiles/resizable-panels.cjs`

**Deps esperados:** ninguna component dependency; utility de persistence solo si se extrae de forma general. **Budget:** minified CSS ≤5 KiB, JS ≤12 KiB, closure ≤18 KiB.

**RED/GREEN:** keyboard/ARIA/min-max/RTL/reconnect antes de pointer behavior; persistencia al final. **Gate:** resize lógico en RTL, zoom 200%, pointer cancel, disabled state, cleanup y no layout thrash por frame.

### 5.2 Orden y criterio de descarte

Orden de evaluación: `FC-A`, luego `FC-B`, luego `FC-C`. Cada candidato puede ser descartado o degradado a receta sin afectar la plataforma. No reservar números de catálogo ni actualizar 19/26/8 hasta que el componente específico pase su gate y tenga release aprobado.

Reiteración vinculante: los puntos previos **5** y **18** siguen excluidos; ninguno de `FC-A..C` es sustituto semántico de esos puntos, y no se abrirá un “ítem 18” por ahora.

## 6. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación / señal de stop |
|---|---|---|
| Manifest se convierte en un segundo contrato | Drift peor que hoy | En Fase 2 pasa a fuente única; manuales quedan generated. Dual-read tiene fecha de salida. |
| Parser bootstrap interpreta prosa incorrectamente | API falsa | One-shot con diagnostics, ledger 53/53 y revisión humana; nunca source of truth permanente. |
| Schema demasiado grande para mantener | Fricción y bypass | Perfiles reutilizables, campos NA explícitos y schema por responsabilidades; no guardar valores derivables. |
| AST no prueba semántica runtime | Falsa confianza | Static parity + prototype/event/computed Playwright + tarball real. |
| Full matrix explota costo/flakiness | CI lenta e ignorada | Pairwise PR, capability suites, full nightly sharded, titles/diagnostics deterministas, burn-in. |
| Firefox/WebKit bloquean por infraestructura | Releases detenidos | Dos ciclos advisory verdes, quarantine solo con issue/expiry; nunca skip silencioso. |
| Generated Markdown pierde prosa útil | Peor DX | Campos narrative controlados + golden review; docs largas siguen humanas y enlazan API generada. |
| Dependency closure cambia layout consumer | Breaking CLI | Mantener `flat-v1`; lockfile y planner; layout nuevo solo major separado. |
| Budgets fijados con medición no portable | Falsos fallos | Baseline por Node/OS definido, byte metrics exactas, warnings un release, hard ceiling separado. |
| AAA se interpreta incorrectamente para non-text | Promesa imposible | Umbrales WCAG por criterio; contrato reforzado solo para pares de texto declarados. |
| Knowledge graph duplica aggregate | Package vuelve a crecer | Referenciar nodes/digests y almacenar body una vez; budget de duplicación cero. |
| Nuevos componentes diluyen el cierre 1.0 | Scope creep | Gate 1.0 obligatorio, uno por minor, candidatos descartables y puntos 5/18 excluidos. |
| Deprecation warnings rompen tests/consumers | Ruido | Diagnostics opt-in, aliases silenciosos por default, release checker fuera del runtime. |

## 7. Interfaz final de comandos

Estos nombres son la interfaz objetivo vinculante. Cada plan por fase puede añadir comandos internos, pero no renombrar ni omitir estos sin actualizar este plan y su migración:

```bash
npm run contracts:build
npm run contracts:check
npm run check:dependency-graph
npm run test:contracts
npm run test:matrix:pr
npm run test:matrix:full
npm run test:themes
npm run test:installed
npm run check:budgets
npm run check:compatibility
npm run check:migrations
npm run check:deprecations
npm run check:supply-chain
npm run check:release
npm run lint
npm run agent:check
```

`npm test` debe seguir siendo portable y razonable localmente; la full nightly y visual Linux se exponen como scripts separados. Release llama explícitamente todos los gates requeridos y no depende de que un alias cambie silenciosamente.

## 8. Definition of Done del programa

- Una persona puede cambiar una API pública en un único manifest y recibe una lista determinista de CSS/JS/docs/tests/migrations que debe alinear.
- Un agente puede consultar el aggregate y obtener imports, closure, markup, tokens, a11y y test profiles sin parsear Markdown.
- Un consumidor instala cualquier componente desde el `.tgz`; todos sus imports/deps funcionan sin acceso al repo.
- Un release no puede publicar contract drift, generated drift, API breaking sin migration, theme/AAA regression ni budget overrun.
- Los 53 actuales tienen evidencia aplicable/NA para todas las dimensiones solicitadas.
- El catálogo no crece hasta cerrar el gate 1.0; después solo crece por el admission gate, sin reintroducir los puntos 5 o 18.

## 9. Defaults de ejecución y gates de decisión

Estos defaults permiten ejecutar el programa sin preguntas abiertas. Cambiarlos exige una decisión registrada antes de la fase indicada:

1. Los manifests y schemas se publican desde 0.10 bajo `ren10/manifest/*` como API experimental versionada por `schemaVersion`; la promesa estable comienza en 1.0.
2. `flat-v1` es el layout de copia estable de 1.0. Un layout jerárquico queda fuera de este programa y requiere un major con migrator.
3. Firefox/WebKit pasan de advisory a blocking en PR después de dos ciclos scheduled verdes consecutivos; desde `1.0.0-rc.1` bloquean release aunque aún no hayan bloqueado PR.
4. SQLite permanece en el tarball core durante este programa. Separarlo se evalúa como cambio de packaging posterior con compatibilidad y medición propias; no se cuela como optimización automática.
5. `FC-A..C` son shortlist, no autorización. Ninguno se implementa hasta que el maintainer apruebe nombre y dos casos de producto; el programa de plataforma puede terminar sin añadirlos.
