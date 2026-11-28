# Robustecimiento funcional · Aqua Trace

**Equipo:** 7
**Avance:** 8, Parte A
**Responsable:** Omar Carvajal
**Rama de trabajo:** avance8/robustecimiento
**Última actualización:** 28 de noviembre de 2026
**Estado del documento:** En desarrollo. La matriz de permisos y las rutas de la API fueron aceptadas por el equipo, según informó el responsable. Lo implementado se verificó solo con pruebas automáticas contra un Supabase simulado. Nada se ha probado todavía sobre la aplicación integrada.

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
| Crear | `POST /api/gestion` | Registra una gestión con estado Registrada y devuelve un folio UUID v4. | Analista, solo sobre sus propias gestiones. | Implementada en `src/gestion-rest.mjs` y probada con Supabase simulado. Falta conectar `api/gestion.mjs`, que sigue usando Turso. |
| Consultar | `GET /api/gestion` y `GET /api/gestion?folio=` | Lista las gestiones, con filtro opcional por estado, o muestra el detalle de un folio. | Analista: propias. Supervisor: todas. | Implementada y probada con Supabase simulado. Falta la interfaz. |
| Actualizar estado | `PATCH /api/gestion` | Cambia el estado de Registrada a Cerrada. No altera la decisión original. | Supervisor. | Implementada y probada con Supabase simulado. Falta la interfaz. |
| Anular | `PATCH /api/gestion` con estado Anulada | Baja lógica: cambia el estado a Anulada y guarda el motivo. | Supervisor. | Implementada y probada con Supabase simulado. Falta la interfaz. |
| Eliminar | `DELETE /api/gestion` | No existe. Responde 405. No se permite la eliminación física de registros. | Nadie. | Implementado como rechazo y probado. |

La identidad del usuario se obtiene de la sesión autenticada. El formulario nunca la envía.

La base de datos asigna `id_usuario`, `fecha_hora`, el estado inicial y los campos de auditoría (`fecha_actualizacion`, `actualizado_por`). La API no los envía en ninguna inserción ni actualización, de acuerdo con lo definido por Felipe Hernández.

## 3. Tabla de validaciones

La columna *Mensaje exacto* usa el texto presente en `src/gestion.mjs` y `src/gestion-rest.mjs`. Las filas marcadas como *Propuesta* aún no están implementadas.

| Campo | Obligatorio | Tipo | Largo o rango | Mensaje exacto | Origen |
| --- | --- | --- | --- | --- | --- |
| id_evento | Sí | Entero | Entero seguro mayor o igual a 1. Debe existir en la tabla evento. | `El evento o el folio de la solicitud no es válido.` Si no existe: `No se encontró el evento.` | Vigente |
| respaldo_suficiente del evento | Sí, regla del evento | Booleano | Debe ser verdadero. El evento 7002 lo bloquea. | `Se requieren antecedentes adicionales para continuar.` | Vigente |
| folio | Sí | UUID v4 | 36 caracteres, formato 8-4-4-4-12 con versión 4. | `El evento o el folio de la solicitud no es válido.` En consultas y actualizaciones: `El folio de la solicitud no es válido.` Si el folio ya existe con otros datos: `Ese folio corresponde a otra solicitud.` | Vigente |
| accion | Sí | Texto de lista cerrada | Validar evento, Descartar evento o Registrar observación. | `Selecciona una acción y un resultado compatibles.` | Vigente |
| resultado | Sí | Texto de lista cerrada | Debe pertenecer a la acción: Validar evento admite Ticket requerido o Sin ticket. Descartar evento admite Evento descartado. Registrar observación admite Sin ticket. | `Selecciona una acción y un resultado compatibles.` | Vigente |
| comentario (vacío) | Sí | Texto | Mínimo 1 carácter después de quitar espacios. | `Escribe por qué tomaste esta decisión.` | Vigente |
| comentario (largo) | Sí | Texto | Máximo 300 caracteres. No admite el carácter nulo. | `Usa un comentario válido de hasta 300 caracteres.` | Vigente |
| id_usuario | Sí | UUID | Lo asigna la base. La API no lo envía y descarta el valor recibido. | Sin sesión: `Debes iniciar sesión.` (capa de autenticación de Felipe Hernández) | Vigente en la API; la asignación en la base está pendiente de Felipe |
| estado (actualización) | Sí | Texto de lista cerrada | Registrada, Cerrada o Anulada, solo con las transiciones de la sección 4. En el filtro de consulta, un estado fuera de la lista se rechaza. | `La transición de estado no está permitida.` En el filtro: `El estado indicado no es válido.` | Vigente |
| motivo_anulacion (vacío) | Sí, solo al anular | Texto | Mínimo 1 carácter después de quitar espacios. | `Escribe el motivo de la anulación.` | Vigente |
| motivo_anulacion (largo) | Sí, solo al anular | Texto | Máximo 300 caracteres. No admite el carácter nulo. | `Usa un motivo válido de hasta 300 caracteres.` | Vigente |

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
| Formulario (navegador) | Campos obligatorios, lista cerrada de acción y resultado, `maxlength` de 300 en el comentario, bloqueo del formulario durante el envío. | Parcial. Hoy el formulario usa `novalidate` y la mayor parte de las reglas se comprueba en el servidor. |
| Servidor (`src/gestion.mjs` y `src/gestion-rest.mjs`) | Método, tipo de contenido, formato del folio, evento, combinación acción-resultado, comentario, respaldo suficiente, idempotencia por folio, rol, transiciones de estado y motivo de anulación. | Implementada y probada con Supabase simulado. |
| Base de datos (Felipe Hernández) | `db/001_esquema_inicial.sql` define las restricciones de estado, de acción y resultado, de largo del comentario y de anulación con motivo. | Restricciones versionadas en la rama avance8/seguridad. Las políticas RLS, los permisos por columna y la asignación de identidad siguen en desarrollo. |

La capa de servidor no depende de la interfaz: una solicitud directa con datos inválidos recibe el mismo rechazo.

## 6. Estados de interfaz

| Estado | Cuándo aparece | Comportamiento esperado | Situación actual |
| --- | --- | --- | --- |
| Carga | Mientras se guarda o se consulta. | Mensaje de progreso, formulario bloqueado y botón sin respuesta a un segundo clic. | Existe al guardar: `Guardando gestión…`. Falta en la consulta. |
| Vacío | La consulta no devuelve gestiones. | Mensaje que explica que no hay registros. | La API devuelve una lista vacía. Falta la pantalla. |
| Error | Falla de validación, de conexión o del servidor. | Mensaje con el texto exacto de la sección 3 y los datos ingresados se conservan. | Existe al guardar. |
| Éxito | La operación termina bien. | Confirma la operación e indica el folio. | Existe al guardar. |

Los colores de los mensajes se mantienen: error #A1202E y éxito #15603E.

## 7. Pruebas de robustez

Hay dos niveles de verificación:

- **Pruebas automáticas del servidor**, ejecutadas el 28 de noviembre de 2026 contra un Supabase simulado.
- **Pruebas sobre la aplicación integrada**, que no se han ejecutado. Las debe realizar Edgar Romero sobre la versión integrada.

| N.º | Prueba | Intento | Resultado esperado | Verificación automática del servidor | Resultado en la aplicación integrada |
| --- | --- | --- | --- | --- | --- |
| 1 | Campo obligatorio vacío | Enviar el formulario con el comentario en blanco, y luego una solicitud directa sin comentario. | Respuesta 422 con `Escribe por qué tomaste esta decisión.` No se guarda ninguna gestión. | Ejecutada. Aprobada: responde 422 y no guarda. | Pendiente de ejecución |
| 2 | Doble clic en el botón de envío | Presionar dos veces seguidas Guardar gestión, y repetir la misma solicitud con el mismo folio. | Se registra una sola gestión. El reintento devuelve la misma gestión. | Ejecutada. Aprobada: queda una sola gestión. No prueba el clic en el botón. | Pendiente de ejecución |
| 3 | Texto de más de 300 caracteres | Enviar un comentario de 301 caracteres por el formulario y por solicitud directa. | Respuesta 422 con `Usa un comentario válido de hasta 300 caracteres.` No se guarda ninguna gestión. | Ejecutada. Aprobada: responde 422 y no guarda. | Pendiente de ejecución |
| 4 | Interrupción de la conexión | Cortar la conexión mientras se envía y volver a enviar. | Mensaje de error. Los datos siguen en el formulario. El reintento no duplica el registro. | Ejecutada parcialmente. Aprobada: el servidor responde 503 y el reintento con el mismo folio guarda una sola gestión. La conservación de los datos en el formulario no está verificada. | Pendiente de ejecución |
| 5 | Dirección de un registro inexistente | Consultar un folio válido que no existe y un folio con formato inválido. | Respuesta 404 con mensaje claro y sin detalles internos. | Ejecutada. Aprobada: 404 para un folio inexistente o de otro usuario, y 422 para un folio con formato inválido. | Pendiente de ejecución |

Otras comprobaciones automáticas ejecutadas y aprobadas: transiciones de estado válidas e inválidas, anulación sin eliminación física, motivo de anulación obligatorio, cambio simultáneo, permisos por rol, ausencia de `DELETE` y que la API no envía los campos que asigna la base.

Pendientes sobre la aplicación integrada: persistencia real de los datos, validaciones que no puedan omitirse evitando la interfaz, compatibilidad con la sesión de Felipe y comportamiento con las políticas RLS definitivas.

### Cómo repetir las pruebas automáticas

1. Clonar la rama avance8/robustecimiento.
2. Ejecutar `node --test src/*.test.mjs` con Node 22 o superior.

El 28 de noviembre de 2026, sobre un clon limpio del commit `12e823b`, se ejecutaron 21 pruebas y las 21 resultaron aprobadas. El comando `npm test` ejecuta solo `src/gestion.test.mjs`, porque `package.json` se coordina con Felipe Hernández.

## 8. Limitaciones pendientes

- La capa REST solo se probó contra un Supabase simulado. No se verificó contra Supabase real ni en Vercel, y las políticas RLS definitivas dependen de Felipe Hernández.
- `api/gestion.mjs` sigue usando Turso y no usa la capa REST. Conectarlo se coordina con Felipe Hernández.
- La pantalla de gestión no tiene aún las operaciones de consulta, actualización y anulación, ni el estado vacío. Depende del traslado a `src/private/panel.html`, que prepara Felipe Hernández.
- La validación del formulario en el navegador es parcial.
- El resumen operativo que el Analista podría ver de otras gestiones no está implementado. Depende de lo que definan las políticas RLS.
- La integración continua solo ejecuta las pruebas de la rama avance8/seguridad.
- Las pruebas independientes sobre la versión integrada, a cargo de Edgar Romero y Pablo Urrutia, no se han realizado.
