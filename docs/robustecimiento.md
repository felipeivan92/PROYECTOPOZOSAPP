# Robustecimiento funcional · Aqua Trace

**Equipo:** 7
**Avance:** 8, Parte A
**Responsable:** Omar Carvajal
**Rama de trabajo:** avance8/robustecimiento
**Última actualización:** 28 de noviembre de 2026
**Estado del documento:** En desarrollo. La matriz de permisos y las rutas de la API fueron aceptadas por el equipo, según informó el responsable. La API y la interfaz están implementadas y conectadas a la capa de seguridad de Felipe Hernández. Lo implementado se verificó con pruebas automáticas contra un Supabase simulado y con un navegador automatizado contra un servidor local simulado. No se ha probado con Supabase real ni en Vercel, y las pruebas independientes sobre la versión integrada siguen pendientes.

## 1. Alcance

El robustecimiento se aplica solo al objeto GESTION, es decir, al registro de decisiones sobre eventos de monitoreo de pozos. No amplía el alcance a otras partes de la plataforma.

Quedan fuera de este documento:

- La autenticación, las cookies de sesión y las políticas RLS (Felipe Hernández).
- La administración de usuarios.
- Las pruebas independientes de robustez y de seguridad (Edgar Romero y Pablo Urrutia).

Se mantienen los eventos ficticios 7001 (DEMO-01, respaldo suficiente) y 7002 (DEMO-02, respaldo insuficiente). El evento 7002 bloquea el registro de una gestión.

## 2. Operaciones CRUD sobre GESTION

| Operación | Ruta | Descripción | Rol autorizado | Estado de implementación |
| --- | --- | --- | --- | --- |
| Crear | `POST /api/gestion` | Registra una gestión con estado Registrada y devuelve un folio UUID v4. | Analista, solo sobre sus propias gestiones. | Implementada en `src/gestion-rest.mjs`, conectada en `api/gestion.mjs` y con formulario en el panel. Probada con Supabase simulado. Sin probar con Supabase real. |
| Consultar | `GET /api/gestion` y `GET /api/gestion?folio=` | Lista las gestiones (hasta 100, de la más reciente a la más antigua), con filtro opcional por estado, o muestra el detalle de un folio. La lista informa también el rol del usuario. | Analista: propias. Supervisor: todas. | Implementada, con listado y filtro por estado en el panel. Probada con Supabase simulado. Sin probar con Supabase real. |
| Resumen operativo | `GET /api/gestion?resumen=1` | Entrega solo cantidades por evento, acción, resultado y estado, mediante la función `resumen_gestiones` de la base. No incluye folios, usuarios ni comentarios. | Analista y Supervisor. | Implementada y mostrada en el panel como una línea de totales. Requiere que la función esté creada en el Supabase real (db/002, a cargo de Felipe Hernández). Sin probar con Supabase real. |
| Actualizar estado | `PATCH /api/gestion` | Cambia el estado de Registrada a Cerrada. No altera la decisión original. | Supervisor. | Implementada, con el botón Cerrar en el panel. Probada con Supabase simulado. Sin probar con Supabase real. |
| Anular | `PATCH /api/gestion` con estado Anulada | Baja lógica: cambia el estado a Anulada y guarda el motivo. | Supervisor. | Implementada, con formulario de motivo en el panel. Probada con Supabase simulado. Sin probar con Supabase real. |
| Eliminar | `DELETE /api/gestion` | No existe. Responde 405. No se permite la eliminación física de registros. | Nadie. | Implementado como rechazo y probado. |

La identidad y el rol del usuario se obtienen de la sesión autenticada, mediante `identificar` de `src/autorizacion.mjs`. El formulario nunca los envía. Las operaciones POST y PATCH exigen además que el origen de la solicitud sea el propio sitio (`origenPermitido`).

La base de datos asigna `id_usuario`, `fecha_hora`, el estado inicial y los campos de auditoría (`fecha_actualizacion`, `actualizado_por`). La API no los envía en ninguna inserción ni actualización, de acuerdo con lo definido por Felipe Hernández.

## 3. Tabla de validaciones

La columna *Mensaje exacto* usa el texto presente en `src/gestion.mjs`, `src/gestion-rest.mjs` y `src/public/app.js`. El formulario del navegador muestra los mismos mensajes que el servidor.

| Campo | Obligatorio | Tipo | Largo o rango | Mensaje exacto | Origen |
| --- | --- | --- | --- | --- | --- |
| id_evento | Sí | Entero | Entre 1 y 2147483647 (rango INTEGER de PostgreSQL). Debe existir en la tabla evento. | `El evento o el folio de la solicitud no es válido.` Si no existe: `No se encontró el evento.` | Vigente |
| respaldo_suficiente del evento | Sí, regla del evento | Booleano | Debe ser verdadero. El evento 7002 lo bloquea. | `Se requieren antecedentes adicionales para continuar.` | Vigente |
| folio | Sí | UUID v4 | 36 caracteres, formato 8-4-4-4-12 con versión 4. | `El evento o el folio de la solicitud no es válido.` En consultas y actualizaciones: `El folio de la solicitud no es válido.` Si el folio ya existe con otros datos: `Ese folio corresponde a otra solicitud.` | Vigente |
| accion | Sí | Texto de lista cerrada | Validar evento, Descartar evento o Registrar observación. | `Selecciona una acción y un resultado compatibles.` | Vigente |
| resultado | Sí | Texto de lista cerrada | Debe pertenecer a la acción: Validar evento admite Ticket requerido o Sin ticket. Descartar evento admite Evento descartado. Registrar observación admite Sin ticket. | `Selecciona una acción y un resultado compatibles.` | Vigente |
| comentario (vacío) | Sí | Texto | Mínimo 1 carácter después de quitar espacios. | `Escribe por qué tomaste esta decisión.` | Vigente |
| comentario (largo) | Sí | Texto | Máximo 300 caracteres Unicode, contados igual que `char_length` de PostgreSQL (un emoji cuenta como uno). No admite el carácter nulo. | `Usa un comentario válido de hasta 300 caracteres.` | Vigente |
| id_usuario | Sí | UUID | Lo asigna la base. La API no lo envía y descarta el valor recibido. | Sin sesión: `Debes iniciar sesión.` (capa de autenticación de Felipe Hernández) | Vigente en la API; la asignación en la base está pendiente de Felipe |
| estado (actualización) | Sí | Texto de lista cerrada | Registrada, Cerrada o Anulada, solo con las transiciones de la sección 4. En el filtro de consulta, un estado fuera de la lista se rechaza. | `La transición de estado no está permitida.` En el filtro: `El estado indicado no es válido.` | Vigente |
| motivo_anulacion (vacío) | Sí, solo al anular | Texto | Mínimo 1 carácter después de quitar espacios. | `Escribe el motivo de la anulación.` | Vigente |
| motivo_anulacion (largo) | Sí, solo al anular | Texto | Máximo 300 caracteres Unicode, con el mismo criterio. No admite el carácter nulo. | `Usa un motivo válido de hasta 300 caracteres.` | Vigente |

Mensajes generales de la API:

| Situación | Código | Mensaje exacto |
| --- | --- | --- |
| Método distinto de GET, POST o PATCH | 405 | `Método no permitido.` |
| Intento de eliminar | 405 | `No se permite eliminar gestiones. Usa la anulación.` |
| Contenido que no es JSON | 415 | `El formato debe ser JSON.` |
| Cuerpo ilegible | 400 | `No se pudo leer la solicitud.` |
| Origen no autorizado | 403 | `Origen de solicitud no autorizado.` |
| Rol sin permiso para la operación | 403 | `No tienes permisos para esta operación.` |
| Gestión inexistente o de otro usuario | 404 | `No se encontró la gestión.` |
| Otro cambio simultáneo sobre la gestión | 409 | `La gestión cambió mientras se procesaba. Actualiza la pantalla e intenta nuevamente.` |
| Falla de conexión al guardar | 503 | `No pudimos confirmar el guardado. Tus datos siguen en el formulario. Intenta nuevamente.` |
| Falla de conexión al consultar | 503 | `No pudimos cargar las gestiones. Intenta nuevamente.` |
| Falla de conexión al actualizar | 503 | `No pudimos confirmar el cambio. Intenta nuevamente.` |
| Falla de conexión al cargar el resumen | 503 | `No pudimos cargar el resumen. Intenta nuevamente.` |
| Sesión ausente, vencida o inválida | 401 | `Debes iniciar sesión.` o `Tu sesión no es válida o ha expirado.` |

## 4. Transiciones de estado

| Estado inicial | Estado final | Rol autorizado | Condición |
| --- | --- | --- | --- |
| Sin registro | Registrada | Analista | Evento con respaldo suficiente. |
| Registrada | Cerrada | Supervisor | Ninguna adicional. |
| Registrada | Anulada | Supervisor | Motivo de anulación obligatorio. |
| Cerrada | Anulada | Supervisor | Motivo de anulación obligatorio. |

Cualquier otra transición se rechaza. Anulada es un estado definitivo: no admite cambios posteriores. La anulación es una baja lógica y el registro permanece en la tabla.

## 5. Validaciones en tres capas

| Capa | Qué controla | Estado |
| --- | --- | --- |
| Formulario (navegador) | Acción y resultado obligatorios, comentario y motivo obligatorios, límite de 300 caracteres Unicode con contador visible (`0/300`), bloqueo del formulario durante el envío y un solo envío por doble clic. Los campos de texto tienen un tope duro de 600 unidades, porque `maxlength` cuenta unidades UTF-16 y no caracteres. | Implementada en `src/public/app.js` y `src/private/panel.html`. Verificada con un navegador automatizado contra un servidor local simulado. |
| Servidor (`src/gestion.mjs` y `src/gestion-rest.mjs`) | Método, tipo de contenido, origen, formato del folio, evento y su rango, combinación acción-resultado, comentario, respaldo suficiente, idempotencia por folio (`on_conflict=folio` y verificación de que el folio pertenece al usuario), rol, transiciones de estado y motivo de anulación. | Implementada y probada con Supabase simulado. |
| Base de datos (Felipe Hernández) | `db/001_esquema_inicial.sql` define las restricciones de estado, de acción y resultado, de largo del comentario y de anulación con motivo. | Restricciones versionadas en la rama avance8/seguridad. Las políticas RLS, los permisos por columna y la asignación de identidad siguen en desarrollo. |

La capa de servidor no depende de la interfaz: una solicitud directa con datos inválidos recibe el mismo rechazo.

## 6. Estados de interfaz

Los cuatro estados existen para el formulario de registro y para el listado de gestiones.

| Estado | Cuándo aparece | Comportamiento | Verificación |
| --- | --- | --- | --- |
| Carga | Al abrir el panel, al actualizar o filtrar, y al guardar. | Listado: `Cargando gestiones…` con el botón Actualizar bloqueado. Formulario: `Guardando gestión…` con los campos bloqueados. Cambio de estado: `Guardando cambio…` con los botones bloqueados. | Verificado en el navegador automatizado con respuestas retardadas. |
| Vacío | La consulta no devuelve gestiones. | `Aún no hay gestiones registradas.` Con un filtro: `No hay gestiones en estado X.` La tabla se oculta. | Verificado en el navegador automatizado. |
| Error | Falla de validación, de conexión o del servidor. | Mensaje con el texto exacto de la sección 3. Los datos del formulario y el motivo de anulación se conservan. En el listado se oculta la tabla y se indica usar Actualizar para reintentar. | Verificado en el navegador automatizado. |
| Éxito | La operación termina bien. | Formulario: confirma e indica el folio. Cambios de estado: `Gestión actualizada.` o `Gestión anulada.` y el listado se actualiza. | Verificado en el navegador automatizado. |

Si la sesión vence al cargar el listado, el panel redirige a `/login.html`. Si vence al guardar, se muestra el mensaje del servidor y los datos ingresados se conservan.

Los colores de los mensajes se mantienen: error #A1202E y éxito #15603E. Los textos de los registros se insertan con `textContent`, nunca como HTML.

## 7. Pruebas de robustez

Hay tres niveles de verificación:

- **Pruebas automáticas del servidor** (`npm test`), ejecutadas el 28 de noviembre de 2026 contra un Supabase simulado.
- **Pruebas de la interfaz en un navegador automatizado** (Chrome con Playwright), ejecutadas el 28 de noviembre de 2026 contra un servidor local que usa la API real y un Supabase simulado. El servidor y el guion no están en el repositorio.
- **Pruebas sobre la aplicación integrada** (Vercel y Supabase reales), que no se han ejecutado. Las debe realizar Edgar Romero sobre la versión integrada.

| N.º | Prueba | Intento | Resultado esperado | Verificación automática del servidor | Resultado en la aplicación integrada |
| --- | --- | --- | --- | --- | --- |
| 1 | Campo obligatorio vacío | Enviar el formulario con el comentario en blanco, y luego una solicitud directa sin comentario. | Respuesta 422 con `Escribe por qué tomaste esta decisión.` No se guarda ninguna gestión. | Ejecutada. Aprobada: responde 422 y no guarda. En el navegador, el formulario muestra el error y no envía la solicitud. | Pendiente de ejecución |
| 2 | Doble clic en el botón de envío | Presionar dos veces seguidas Guardar gestión, y repetir la misma solicitud con el mismo folio. | Se registra una sola gestión. El reintento devuelve la misma gestión. | Ejecutada. Aprobada: queda una sola gestión. En el navegador automatizado, un doble clic en Guardar gestión envió una sola solicitud y dejó una sola gestión. | Pendiente de ejecución |
| 3 | Texto de más de 300 caracteres | Enviar un comentario de 301 caracteres por el formulario y por solicitud directa. | Respuesta 422 con `Usa un comentario válido de hasta 300 caracteres.` No se guarda ninguna gestión. | Ejecutada. Aprobada: responde 422 y no guarda. En el navegador, 301 caracteres muestran el error con contador `301/300` y no se envían; 300 emojis cuentan como 300 y se aceptan. | Pendiente de ejecución |
| 4 | Interrupción de la conexión | Cortar la conexión mientras se envía y volver a enviar. | Mensaje de error. Los datos siguen en el formulario. El reintento no duplica el registro. | Ejecutada. Aprobada: el servidor responde 503 y el reintento con el mismo folio guarda una sola gestión. En el navegador automatizado, tras la falla se conservaron la acción, el resultado y el comentario, y el reintento desde el formulario guardó una sola gestión. La falla se simuló en el servidor local, no cortando una red real. | Pendiente de ejecución |
| 5 | Dirección de un registro inexistente | Consultar un folio válido que no existe y un folio con formato inválido. | Respuesta 404 con mensaje claro y sin detalles internos. | Ejecutada. Aprobada: 404 para un folio inexistente o de otro usuario, y 422 para un folio con formato inválido. | Pendiente de ejecución |

Otras comprobaciones automáticas ejecutadas y aprobadas: transiciones de estado válidas e inválidas, anulación sin eliminación física, motivo de anulación obligatorio, cambio simultáneo, permisos por rol, ausencia de `DELETE`, que la API no envía los campos que asigna la base, conteo Unicode, rango de `id_evento`, resumen operativo por rol, que un folio de otro usuario no se devuelve como reintento exitoso aunque RLS filtrara mal, y que `api/gestion.mjs` responde 401 sin sesión.

En el navegador automatizado se ejecutaron 58 comprobaciones y las 58 resultaron aprobadas: estados de carga, vacío, error y éxito del listado; rol Analista (sin acciones, sin columna Acciones) y rol Supervisor (formulario de registro bloqueado, botones Cerrar y Anular); cierre; anulación con motivo obligatorio, con conservación del motivo si falla la conexión; registro conservado tras anular; ausencia de un botón Eliminar; redirección al login sin sesión; ausencia de errores de la aplicación en la consola.

Pendientes sobre la aplicación integrada: persistencia real de los datos, validaciones que no puedan omitirse evitando la interfaz, compatibilidad con la sesión de Felipe y comportamiento con las políticas RLS definitivas.

### Cómo repetir las pruebas automáticas

1. Clonar la rama avance8/robustecimiento.
2. Ejecutar `npm test` con Node 22 o superior. El comando ejecuta `node --test src/*.test.mjs`.

El 28 de noviembre de 2026, sobre un clon limpio del commit `a16cf94` y con Node 22, se ejecutaron 54 pruebas (24 de autenticación y autorización de Felipe Hernández, 28 de gestión y 2 del cableado de `api/gestion.mjs`) y las 54 resultaron aprobadas. El flujo de GitHub Actions *Pruebas de robustecimiento* (Node 24) terminó con éxito sobre ese commit.

El flujo falló una vez, en el commit intermedio `41a9040`: la API ya informaba el rol, pero la prueba correspondiente se subió en el commit siguiente, porque los archivos se suben de a uno. El commit siguiente lo corrigió.

## 8. Limitaciones pendientes

- Nada se ha verificado con Supabase real ni en Vercel. La API y la interfaz se probaron con un Supabase simulado. Felipe Hernández debe verificar la versión desplegada, con sesiones reales de Analista y Supervisor. El resumen operativo requiere que la función `resumen_gestiones` de db/002 esté creada en la base real.
- No se ingresaron credenciales en ninguna prueba. El inicio de sesión real no fue ejercitado por quien escribió este documento.
- El servidor local y el guion del navegador automatizado no están en el repositorio. Quien quiera repetir esa verificación necesita pedirlos o recrearlos.
- Hasta que llega la primera respuesta del listado, el panel no conoce el rol, por lo que el formulario de registro aparece habilitado un instante para un Supervisor. El servidor y la base rechazan igualmente la operación.
- El listado muestra como máximo las 100 gestiones más recientes y no tiene paginación.
- El panel usa solo los eventos ficticios 7001 y 7002.
- Las pruebas independientes sobre la versión integrada, a cargo de Edgar Romero y Pablo Urrutia, no se han realizado. Tampoco la revisión humana de este avance por parte de Omar Carvajal.
