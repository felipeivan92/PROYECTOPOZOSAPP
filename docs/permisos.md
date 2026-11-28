
# Permisos · Aqua Trace

**Equipo:** 7  
**Avance:** 8  
**Estado del documento:** Propuesta pendiente de validación grupal.

## 1. Alcance

La seguridad se aplica sobre el objeto GESTION, correspondiente al registro de decisiones sobre eventos de monitoreo de pozos, y sus tablas asociadas: perfil y evento.

El objetivo es garantizar que cada usuario pueda ejecutar únicamente las acciones autorizadas según su rol, conservando la trazabilidad de las decisiones registradas.

## 2. Matriz de roles y permisos

| Rol | Crear | Consultar | Actualizar | Dar de baja |
| --- | --- | --- | --- | --- |
| Analista (quien registra y resuelve) | Solo los propios. Registra decisiones sobre eventos de monitoreo. | Solo los propios. Consulta el detalle de sus gestiones. | Ninguno. Conserva la integridad de la decisión original. | Ninguno. No está autorizado para anular gestiones. |
| Supervisor (quien supervisa) | Ninguno. Su función es supervisar las decisiones registradas. | Todos. Revisa las gestiones de los analistas. | Todos. Puede cerrar las gestiones sin alterar la decisión original. | Todos. Puede anular gestiones justificadamente. |
| Administrador (quien administra) | Ninguno. No interviene en la operación. | Ninguno. Su función corresponde a la administración de usuarios. | Ninguno. No modifica decisiones operativas. | Ninguno. No interviene en la anulación de gestiones. |
| Usuario no autenticado | Ninguno. Requiere autenticación. | Ninguno. Protege la información interna. | Ninguno. Impide modificaciones no autorizadas. | Ninguno. Impide anulaciones no autorizadas. |

### Consideraciones

- El analista reúne las funciones de registro y resolución de eventos.
- El analista podrá consultar un resumen operativo de otras gestiones para mantener la continuidad entre turnos, sin acceder a sus detalles restringidos.
- El supervisor podrá modificar únicamente el estado y los campos asociados a la trazabilidad de la actualización.
- La administración de usuarios queda fuera del alcance funcional del presente avance.
- Los usuarios inactivos no tendrán acceso a las operaciones.
- No se permite la eliminación física de gestiones.

### Estados permitidos

| Estado inicial | Estado final | Rol autorizado |
| --- | --- | --- |
| Sin registro | Registrada | Analista |
| Registrada | Cerrada | Supervisor |
| Registrada | Anulada | Supervisor |
| Cerrada | Anulada | Supervisor |

El estado Anulada es definitivo. Toda anulación deberá incluir una justificación.

## 3. Políticas de acceso (RLS)

El sistema aplicará el principio de denegación por defecto.

Los controles de seguridad se implementarán en tres niveles:

1. Autenticación para acceder a las pantallas internas.
2. Verificación del rol y pertenencia del registro en el servidor.
3. Políticas de seguridad a nivel de fila (RLS) en Supabase.

### Estado inicial de la base de datos

| Tabla | RLS habilitado | Políticas de acceso |
| --- | --- | --- |
| perfil | Sí | Pendientes |
| evento | Sí | Pendientes |
| gestion | Sí | Pendientes |

Se verificó mediante una consulta SQL que las tres tablas tienen RLS habilitado.

Los permisos de acceso permanecen revocados hasta implementar las políticas correspondientes.

### Implementación SQL

Pendiente de aprobación de la matriz de permisos por el equipo.

En esta sección se incorporará el código SQL de las políticas efectivamente implementadas.

### Gestión de credenciales

- Las credenciales se gestionarán mediante variables de entorno.
- Las claves secretas no se expondrán en el navegador ni en el repositorio.
- Las cuentas y los datos utilizados para las pruebas serán ficticios.
- Las credenciales de evaluación se entregarán al profesor por correo electrónico.

## 4. Pruebas de rotura

| Prueba | Resultado | Minuto del video |
| --- | --- | --- |
| Acceder a una dirección interna sin iniciar sesión. | Pendiente de ejecución. | Pendiente |
| Solicitar el registro de otro usuario modificando su identificador en la URL. | Pendiente de ejecución. | Pendiente |
| Ejecutar una acción no permitida para el rol mediante una petición directa, sin utilizar la interfaz. | Pendiente de ejecución. | Pendiente |
| Revisar el repositorio y su historial en busca de credenciales expuestas. | Pendiente de ejecución. | Pendiente |

Las pruebas deberán ser realizadas por un integrante distinto de quien implementó la funcionalidad evaluada.

## 5. Responsabilidades propuestas

| Integrante | Responsabilidad |
| --- | --- |
| Felipe Hernández | Autenticación, autorización, políticas RLS e integración. |
| Omar Carvajal | Operaciones CRUD y validaciones funcionales. |
| Edgar Romero | Pruebas de robustez funcional. |
| Pablo Urrutia | Pruebas de seguridad. |

La distribución de responsabilidades y la matriz deberán ser validadas por el equipo antes de continuar con la implementación.
