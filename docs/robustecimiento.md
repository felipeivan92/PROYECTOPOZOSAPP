# Robustecimiento funcional · Aqua Trace

**Equipo:** 7
**Avance:** 8, Parte A
**Responsable:** Omar Carvajal
**Rama de trabajo:** avance8/robustecimiento
**Estado del documento:** Borrador. Las reglas marcadas como *Propuesta* dependen de la aprobación grupal de la matriz de permisos y del contrato de la API. Nada de lo indicado como pendiente se ha ejecutado.

## 1. Alcance

El robustecimiento se aplica solo al objeto GESTION, es decir, al registro de decisiones sobre eventos de monitoreo de pozos. No amplía el alcance a otras partes de la plataforma.

Quedan fuera de este documento:

- La autenticación, las cookies de sesión y las políticas RLS (Felipe Hernández).
- La administración de usuarios.
- Las pruebas independientes de robustez y de seguridad (Edgar Romero y Pablo Urrutia).

Se mantienen los eventos ficticios 7001 (DEMO-01, respaldo suficiente) y 7002 (DEMO-02, respaldo insuficiente). El evento 7002 bloquea el registro de una gestión.

## 2. Operaciones CRUD sobre GESTION

| Operación | Descripción | Rol autorizado (propuesta) | Estado de implementación |
| --- | --- | --- | --- |
| Crear | Registra una gestión con estado Registrada y devuelve un folio UUID v4. | Analista, solo sobre sus propias gestiones. | Existe en el Avance 7 sobre Turso. Falta adaptarla a la sesión y a Supabase. |
| Consultar | Lista las gestiones con su estado o muestra el detalle de un folio. | Analista: propias. Supervisor: todas. | Pendiente. |
| Actualizar estado | Cambia el estado de Registrada a Cerrada y registra quién actualizó y cuándo. No altera la decisión original. | Supervisor. | Pendiente. |
| Anular | Baja lógica: cambia el estado a Anulada y guarda el motivo. | Supervisor. | Pendiente. |
| Eliminar | No existe. No se permite la eliminación física de registros. | Nadie. | No aplica. |

La identidad del usuario (`id_usuario`, `actualizado_por`) se obtiene de la sesión autenticada. El formulario nunca la envía.

## 3. Tabla de validaciones

La columna *Mensaje exacto* usa el texto vigente en `src/gestion.mjs` cuando la regla ya existe. Las filas marcadas como *Propuesta* aún no están implementadas y su texto puede cambiar al acordarlo con el equipo.

| Campo | Obligatorio | Tipo | Largo o rango | Mensaje exacto | Origen |
| --- | --- | --- | --- | --- | --- |
| id_evento | Sí | Entero | Entero seguro mayor o igual a 1. Debe existir en la tabla evento. | `El evento o el folio de la solicitud no es válido.` Si no existe: `No se encontró el evento.` | Vigente |
| respaldo_suficiente del evento | Sí, regla del evento | Booleano | Debe ser verdadero. El evento 7002 lo bloquea. | `Se requieren antecedentes adicionales para continuar.` | Vigente |
| folio | Sí | UUID v4 | 36 caracteres, formato 8-4-4-4-12 con versión 4. | `El evento o el folio de la solicitud no es válido.` Si el folio ya existe con otros datos: `Ese folio corresponde a otra solicitud.` | Vigente |
| accion | Sí | Texto de lista cerrada | Validar evento, Descartar evento o Registrar observación. | `Selecciona una acción y un resultado compatibles.` | Vigente |
| resultado | Sí | Texto de lista cerrada | Debe pertenecer a la acción: Validar evento admite Ticket requerido o Sin ticket. Descartar evento admite Evento descartado. Registrar observación admite Sin ticket. | `Selecciona una acción y un resultado compatibles.` | Vigente |
| comentario (vacío) | Sí | Texto | Mínimo 1 carácter después de quitar espacios. | `Escribe por qué tomaste esta decisión.` | Vigente |
| comentario (largo) | Sí | Texto | Máximo 300 caracteres. No admite el carácter nulo. | `Usa un comentario válido de hasta 300 caracteres.` | Vigente |
| id_usuario | Sí | UUID | Lo asigna el servidor desde la sesión. Se ignora si llega en el cuerpo. | `Debes iniciar sesión.` (mensaje de la capa de autenticación de Felipe) | Propuesta: ignorar el valor recibido |
| estado (actualización) | Sí | Texto de lista cerrada | Registrada, Cerrada o Anulada, solo con las transiciones de la sección 4. | `La transición de estado no está permitida.` | Propuesta |
| motivo_anulacion | Sí, solo al anular | Texto | Entre 1 y 300 caracteres después de quitar espacios. | `Escribe el motivo de la anulación.` | Propuesta |

Mensajes generales de la solicitud, vigentes:

| Situación | Código | Mensaje exacto |
| --- | --- | --- |
| Método distinto de POST en el registro | 405 | `Usa POST para registrar una gestión.` |
| Contenido que no es JSON | 415 | `El formato debe ser JSON.` |
| Cuerpo ilegible | 400 | `No se pudo leer la solicitud.` |
| Falla de conexión o de base de datos | 503 | `No pudimos confirmar el guardado. Tus datos siguen en el formulario. Intenta nuevamente.` |

## 4. Transiciones de estado

| Estado inicial | Estado final | Rol autorizado (propuesta) | Condición |
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
| Servidor (`src/gestion.mjs`) | Método, tipo de contenido, formato del folio, evento, combinación acción-resultado, comentario, respaldo suficiente e idempotencia por folio. | Vigente para crear. Pendiente para consultar, actualizar y anular. |
| Base de datos (coordinada con Felipe) | Restricciones `CHECK` sobre estado y largo del comentario, clave primaria del folio, claves foráneas y políticas RLS. | Pendiente de coordinar. |

La capa de servidor no depende de la interfaz: una solicitud directa con datos inválidos recibe el mismo rechazo.

## 6. Estados de interfaz

| Estado | Cuándo aparece | Comportamiento esperado | Situación actual |
| --- | --- | --- | --- |
| Carga | Mientras se guarda o se consulta. | Mensaje de progreso, formulario bloqueado y botón sin respuesta a un segundo clic. | Existe al guardar: `Guardando gestión…`. Falta en la consulta. |
| Vacío | La consulta no devuelve gestiones. | Mensaje que explica que no hay registros. | Pendiente. |
| Error | Falla de validación, de conexión o del servidor. | Mensaje con el texto exacto de la sección 3 y los datos ingresados se conservan. | Existe al guardar. |
| Éxito | La operación termina bien. | Confirma la operación e indica el folio. | Existe al guardar. |

Los colores de los mensajes se mantienen: error #A1202E y éxito #15603E.

## 7. Pruebas de robustez

Ninguna de las cinco pruebas se ha ejecutado todavía. Esta tabla se completa con el resultado real. No se registra como aprobada una prueba que no se ejecutó.

| N.º | Prueba | Intento | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- | --- |
| 1 | Campo obligatorio vacío | Enviar el formulario con el comentario en blanco, y luego una solicitud directa sin comentario. | Respuesta 422 con `Escribe por qué tomaste esta decisión.` No se guarda ninguna gestión. | Pendiente de ejecución |
| 2 | Doble clic en el botón de envío | Presionar dos veces seguidas Guardar gestión, y repetir la misma solicitud con el mismo folio. | Se registra una sola gestión. El reintento devuelve la misma gestión. | Pendiente de ejecución |
| 3 | Texto de más de 300 caracteres | Enviar un comentario de 301 caracteres por el formulario y por solicitud directa. | Respuesta 422 con `Usa un comentario válido de hasta 300 caracteres.` No se guarda ninguna gestión. | Pendiente de ejecución |
| 4 | Interrupción de la conexión | Cortar la conexión mientras se envía y volver a enviar. | Mensaje de error. Los datos siguen en el formulario. El reintento no duplica el registro. | Pendiente de ejecución |
| 5 | Dirección de un registro inexistente | Consultar un folio válido que no existe y un folio con formato inválido. | Respuesta 404 con mensaje claro y sin detalles internos. | Pendiente de ejecución. Requiere definir la ruta de consulta en el contrato de la API. |

Comprobaciones adicionales pendientes: persistencia de los datos, transiciones inválidas, anulación sin eliminación física y compatibilidad con la sesión de Felipe.

## 8. Limitaciones pendientes

- La matriz de permisos aún no está aprobada por el equipo.
- El contrato de la API (métodos, rutas, respuestas, errores, identidad y persistencia) no está acordado.
- Existe una diferencia entre el esquema local del Avance 7 y las tablas de Supabase. Falta decidir cómo se guardarán los datos desde la API.
- Las operaciones de consulta, actualización y anulación no existen todavía.
- Las políticas RLS definitivas y la protección efectiva de las rutas existentes están pendientes (Felipe).
- Las pruebas automatizadas planificadas usan simulaciones o una base local aislada. No sustituyen las pruebas independientes sobre la versión integrada, a cargo de Edgar Romero.
- Todavía no se ha verificado el comportamiento con Supabase real ni en Vercel.
