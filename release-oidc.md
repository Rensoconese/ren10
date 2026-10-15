# Próximo release: activar OIDC y retirar el token anterior

Estado al 15 de octubre de 2026: el código de migración quedó integrado en
[PR #51](https://github.com/Rensoconese/ren10/pull/51). **La confianza de npm
no está activada**. Este procedimiento se ejecutará con el próximo release
real autorizado; no requiere publicar una versión de prueba.

## 1. Preparar primero el candidato

- Completar los cambios y actualizar ambas versiones, changelog y contratos
  de versión siguiendo [SHIPPING.md](SHIPPING.md).
- Obtener CI completo aprobado para el candidato que se va a etiquetar:
  Linux x64, navegadores, accesibilidad, visuales, dependencias y presupuestos.
- Mantener el 2FA de la cuenta npm. Conservar temporalmente el secreto
  `NPM_TOKEN` y su token npm, sin mostrarlos ni copiarlos al chat.
- No crear todavía la etiqueta de release: primero registrar los publishers.

## 2. Registrar la confianza cerca del momento de publicar

Abrir Settings → Trusted publishing en **cada paquete**: `ren10` y
`@ren10/astro`. Crear una conexión GitHub Actions con estos valores exactos:

| Campo | Valor |
| --- | --- |
| Organización o usuario GitHub | `Rensoconese` |
| Repositorio | `ren10` |
| Workflow filename | `release.yml` |
| Environment name | Vacío: el job actual no declara un environment |
| Preparar versiones (`npm stage publish`) | Permitido |
| Publicación directa (`npm publish`) | Deshabilitada |
| Gestión de dist-tags (`npm dist-tag`) | Deshabilitada |

Guardar solo tras confirmar el permiso nuevo para ambos paquetes. Si actúa
un agente con Computer Use, pedir confirmación al momento de guardar la
confianza. Completar la llave de seguridad o el 2FA que solicite npm.

Una conexión nueva debe completar su primera publicación válida dentro de
**48 horas**. No registrarla con semanas de anticipación. Guardar el formulario
no prueba que funcione ni que haya quedado vinculada al repositorio.
Consultar el estado de validación en npm después del primer uso; no asumir
que una preparación pendiente, por sí sola, completó la validación inicial.

## 3. Ejecutar el release con OIDC

Crear la etiqueta correspondiente a la versión real de ambos paquetes y
al commit autorizado. El workflow `Release` debe incluir la migración de
PR #51; no mover ni reescribir etiquetas históricas.

Comprobar que `release.yml`:

- Usa runners alojados por GitHub y el job de publicación tiene
  `id-token: write`.
- Conserva Node 22 y el npm fijado por el workflow, sin tokens npm en el
  entorno de staging ni un fallback a `NPM_TOKEN`.
- Ejecuta todos los controles y luego
  `node scripts/check-publish-access.mjs --oidc` y
  `node scripts/stage-release.mjs --oidc`.
- Prepara **ambos paquetes** con la versión esperada y procedencia habilitada.

El control de contexto OIDC no demuestra permiso en npm: la prueba efectiva
es el staging exitoso de ambos paquetes por ese workflow, sin token persistente.
`npm whoami`, un dry-run o un secreto todavía existente no validan OIDC.
Si el token anterior ya expiró, no renovarlo para autenticar este flujo OIDC.

## 4. Aprobar ambos paquetes con presencia y 2FA

Abrir [Staged Packages de npm](https://www.npmjs.com/settings/rensoconese/staged-packages).
Revisar nombres, versiones, origen y hashes de los dos candidatos. Aprobar
`ren10` y `@ren10/astro`, completando el segundo factor en cada operación
que lo solicite. No habilitar bypass de 2FA ni publicación directa desde CI.

El workflow espera hasta 30 minutos por las versiones públicas. Si se supera
ese plazo, completar la aprobación y reanudar según el paso siguiente;
no relajar el control para obtener un resultado verde.

## 5. Verificar antes de retirar credenciales

Para **cada paquete**, conservar evidencia de:

- Versión pública exacta, etiqueta `latest` correcta y SHA512 idéntico al
  candidato preparado; las versiones públicas son inmutables.
- Procedencia SLSA que corresponda al paquete, digest, repositorio, commit,
  etiqueta, workflow y ejecución de release correctos.
- Primera conexión de trusted publisher validada en npm para ambos paquetes.
- Instalación limpia desde npm y build del starter Astro con los dos paquetes;
  comprobar también `ren10 doctor`, firmas y attestations.
- Workflow de release completo y GitHub Release correspondiente, sin omitir
  auditorías, pruebas ni la comprobación de publicación de ambos paquetes.

## 6. Retirar el token anterior y cerrar la migración

Solo después de verificar el primer release OIDC de ambos paquetes:

1. En Settings → Publishing access de **ambos paquetes**, seleccionar
   **Require two-factor authentication and disallow tokens** y guardar.
   OIDC seguirá funcionando; no desactivar el 2FA de la cuenta.
2. En GitHub, `Rensoconese/ren10` → Settings → Secrets and variables → Actions,
   eliminar únicamente el secreto de repositorio `NPM_TOKEN`.
3. En npm → Access Tokens, revocar el token usado en el release 0.14.1. El nombre preparado fue
   `ren10-github-actions-stage-20261013`; confirmar en npm su nombre real,
   permisos y fecha antes de revocarlo. No revocar otros
   tokens por similitud de nombre y no copiar su valor al informe.
4. Si la herramienta exige confirmación para eliminar el secreto o revocar
   el token, obtenerla justo antes de la acción, agrupando las dos retiradas.
5. Confirmar que `NPM_TOKEN` ya no aparece en GitHub, que el token concreto
   está revocado en npm y que las dos conexiones OIDC y la política de 2FA
   siguen vigentes. Registrar evidencia sin credenciales.

No hacer otra publicación artificial para probar la retirada: la primera
publicación ya debe haber utilizado OIDC sin acceso al token persistente.

## Recuperación sin rebajar controles

- **OIDC falla:** revisar valores exactos, `id-token: write`, versión npm,
  runner alojado por GitHub y estado/caducidad de la conexión. Detenerse;
  no habilitar publicación directa, bypass de 2FA ni fallback automático.
- **Publisher nuevo vencido:** recrear su conexión con la confirmación
  correspondiente y coordinar nuevamente la ventana de 48 horas.
- **Versión ya pendiente:** OIDC no puede listar ni descargar la cola privada.
  Revisar y aprobar el candidato original verificado en npm; no asumir
  identidad de contenido ni subir otra versión para esquivar el bloqueo.
- **Aprobación tardía:** con las versiones públicas, reejecutar Release en
  `main` indicando la etiqueta original en el campo `release_tag`. El flujo
  vuelve a verificar esa etiqueta y acepta solo los paquetes públicos exactos.
  No reutilizar una etiqueta anterior a la migración OIDC.
- **Hash o procedencia distintos:** detener la publicación y diagnosticar;
  no sobrescribir la versión ni mover la etiqueta para hacerla coincidir.

## Referencias

- [Publicación confiable de npm](https://docs.npmjs.com/trusted-publishers/)
- [Staged publishing y aprobación con 2FA](https://docs.npmjs.com/staged-publishing/)
- [Workflow de release](.github/workflows/release.yml)
- [Migración integrada: PR #51](https://github.com/Rensoconese/ren10/pull/51)
