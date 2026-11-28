
# Permisos · Aqua Trace

**Equipo:** 7  
**Avance:** 8  
**Responsable de seguridad:** Felipe Hernández  
**Última actualización:** 28 de noviembre de 2026  
**Estado:** Seguridad implementada en el código e integrada con el robustecimiento funcional. Pendiente de validación integral en Vercel y pruebas independientes de seguridad.

## 1. Alcance

La seguridad se aplica sobre el objeto GESTION, correspondiente al registro de decisiones sobre eventos de monitoreo de pozos, y sus tablas asociadas: perfil y evento.

El objetivo es garantizar que cada usuario pueda ejecutar únicamente las acciones autorizadas según su rol, conservando la trazabilidad de las decisiones registradas.

## 2. Matriz de roles y permisos

| Rol | Crear | Consultar | Actualizar | Dar de baja |
| --- | --- | --- | --- | --- |
| Analista (quien registra y resuelve) | Solo los propios. Registra decisiones sobre eventos de monitoreo. | Solo los propios. Consulta el detalle de sus gestiones. | Ninguno. Conserva la integridad de la decisión original. | Ninguno. No está autorizado para anular gestiones. |
| Supervisor (quien supervisa) | Ninguno. Su función es supervisar las decisiones registradas. | Todos. Revisa las gestiones de los analistas. | Todos. Puede cerrar las gestiones sin alterar la decisión original. | Todos. Puede anular gestiones justificadamente. |
| Administrador (quien administra) | Ninguno. No interviene en la operación. | Ninguno sobre GESTION. La administración de usuarios queda fuera del alcance. | Ninguno. No modifica decisiones operativas. | Ninguno. No interviene en la anulación de gestiones. |
| Usuario no autenticado | Ninguno. Requiere autenticación. | Ninguno. Protege la información interna. | Ninguno. Impide modificaciones no autorizadas. | Ninguno. Impide anulaciones no autorizadas. |

### Consideraciones

- El Analista reúne las funciones de registro y resolución de eventos.
- El Analista y el Supervisor pueden consultar un resumen operativo agregado sin acceder a detalles restringidos mediante dicho resumen.
- El Supervisor puede modificar únicamente el estado y el motivo de anulación.
- Los campos de auditoría son asignados automáticamente por la base de datos.
- La administración de usuarios queda fuera del alcance funcional del presente avance.
- Los usuarios inactivos no tienen acceso a las operaciones.
- No se permite la eliminación física de gestiones.
- La matriz fue aceptada por el equipo según lo informado en el documento de robustecimiento funcional.

### Estados permitidos

| Estado inicial | Estado final | Rol autorizado |
| --- | --- | --- |
| Sin registro | Registrada | Analista |
| Registrada | Cerrada | Supervisor |
| Registrada | Anulada | Supervisor |
| Cerrada | Anulada | Supervisor |

El estado Anulada es definitivo. Toda anulación debe incluir una justificación.

## 3. Arquitectura de seguridad

El sistema aplica el principio de denegación por defecto mediante tres niveles de protección:

1. Autenticación mediante Supabase Auth y cookies seguras.
2. Verificación de identidad, rol y pertenencia del registro en el servidor.
3. Políticas de seguridad a nivel de fila (RLS), restricciones y permisos mínimos en PostgreSQL.

### Componentes implementados

| Componente | Archivo | Función |
| --- | --- | --- |
| Conexión con Supabase | src/supabase.mjs | Comunicación con los servicios de autenticación y datos. |
| Autenticación | src/auth.mjs | Inicio, verificación y cierre de sesión. |
| Gestión de sesión | src/sesion.mjs | Administración de cookies y comprobación del origen de solicitudes. |
| Autorización | src/autorizacion.mjs | Verificación de identidad, perfil activo y rol operativo. |
| API de autenticación | api/auth.mjs | Control de solicitudes de autenticación. |
| Panel privado | api/panel.mjs | Entrega de la interfaz únicamente a usuarios autorizados. |
| API de gestión | api/gestion.mjs | Integración de las operaciones CRUD con la autorización compartida. |
| Operaciones REST | src/gestion-rest.mjs | Validación de datos, permisos y operaciones sobre GESTION. |
| Esquema inicial | db/001_esquema_inicial.sql | Definición de tablas y restricciones. |
| Políticas de seguridad | db/002_seguridad_y_validaciones.sql | RLS, permisos mínimos, auditoría y resumen operativo. |

### Protección de rutas

Las rutas principales de acceso al panel se configuran en vercel.json y se dirigen al controlador api/panel.mjs.

El controlador comprueba la sesión, el perfil activo y el rol del usuario antes de entregar src/private/panel.html.

El formulario público original fue retirado para evitar accesos alternativos a la interfaz interna.

El ocultamiento o deshabilitación de botones en el navegador no constituye el mecanismo principal de seguridad. Los permisos se verifican nuevamente en el servidor y en la base de datos.

## 4. Políticas de acceso (RLS)

### Políticas versionadas

| Tabla | RLS | Política | Operación |
| --- | --- | --- | --- |
| perfil | Habilitado | perfil_consulta_propia | SELECT |
| evento | Habilitado | evento_consulta_operativa | SELECT |
| gestion | Habilitado | gestion_consulta_por_rol | SELECT |
| gestion | Habilitado | gestion_creacion_analista | INSERT |
| gestion | Habilitado | gestion_actualizacion_supervisor | UPDATE |

### Alcance de las políticas

- Cada usuario autenticado puede consultar únicamente su propio perfil activo.
- Los roles operativos Analista y Supervisor pueden consultar eventos.
- El Analista consulta y registra únicamente sus propias gestiones.
- El Supervisor consulta todas las gestiones y puede actualizar su estado.
- El Administrador no tiene acceso operativo a GESTION.
- Los usuarios anónimos no poseen permisos sobre las tablas.
- No se concede permiso de eliminación física.

### 4.1. Habilitación de RLS y denegación por defecto

```sql
ALTER TABLE public.perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestion ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
    public.perfil,
    public.evento,
    public.gestion
FROM PUBLIC, anon, authenticated;
```

### 4.2. Permisos mínimos por columna

```sql
GRANT SELECT ON public.perfil TO authenticated;
GRANT SELECT ON public.evento TO authenticated;
GRANT SELECT ON public.gestion TO authenticated;

GRANT INSERT (
    folio,
    id_evento,
    accion,
    resultado,
    comentario
)
ON public.gestion TO authenticated;

GRANT UPDATE (
    estado,
    motivo_anulacion
)
ON public.gestion TO authenticated;
```

Los permisos anteriores se encuentran sujetos a las políticas RLS.

La identidad, estado inicial, fecha y campos de auditoría no pueden ser asignados libremente por el usuario durante las operaciones de gestión.

### 4.3. Consulta del perfil propio

```sql
CREATE POLICY perfil_consulta_propia
ON public.perfil
FOR SELECT
TO authenticated
USING (
    id_usuario = (SELECT auth.uid())
    AND activo = TRUE
);
```

### 4.4. Consulta de eventos

```sql
CREATE POLICY evento_consulta_operativa
ON public.evento
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.perfil p
        WHERE p.id_usuario = (SELECT auth.uid())
        AND p.activo = TRUE
        AND p.rol IN ('Analista', 'Supervisor')
    )
);
```

### 4.5. Consulta de gestiones según rol

```sql
CREATE POLICY gestion_consulta_por_rol
ON public.gestion
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.perfil p
        WHERE p.id_usuario = (SELECT auth.uid())
        AND p.activo = TRUE
        AND (
            p.rol = 'Supervisor'
            OR (
                p.rol = 'Analista'
                AND gestion.id_usuario = p.id_usuario
            )
        )
    )
);
```

### 4.6. Registro de gestiones por el Analista

```sql
CREATE POLICY gestion_creacion_analista
ON public.gestion
FOR INSERT
TO authenticated
WITH CHECK (
    id_usuario = (SELECT auth.uid())
    AND estado = 'Registrada'
    AND fecha_actualizacion IS NULL
    AND actualizado_por IS NULL
    AND motivo_anulacion IS NULL

    AND EXISTS (
        SELECT 1
        FROM public.perfil p
        WHERE p.id_usuario = (SELECT auth.uid())
        AND p.activo = TRUE
        AND p.rol = 'Analista'
    )

    AND EXISTS (
        SELECT 1
        FROM public.evento e
        WHERE e.id_evento = gestion.id_evento
        AND e.respaldo_suficiente = TRUE
    )
);
```

### 4.7. Actualización exclusiva del Supervisor

```sql
CREATE POLICY gestion_actualizacion_supervisor
ON public.gestion
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.perfil p
        WHERE p.id_usuario = (SELECT auth.uid())
        AND p.activo = TRUE
        AND p.rol = 'Supervisor'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.perfil p
        WHERE p.id_usuario = (SELECT auth.uid())
        AND p.activo = TRUE
        AND p.rol = 'Supervisor'
    )
);
```

### 4.8. Control de transiciones y auditoría

```sql
CREATE FUNCTION public.validar_transicion_gestion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN

    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado.'
            USING ERRCODE = '42501';
    END IF;

    IF (
        (
            OLD.estado = 'Registrada'
            AND NEW.estado IN ('Cerrada', 'Anulada')
        )
        OR (
            OLD.estado = 'Cerrada'
            AND NEW.estado = 'Anulada'
        )
    ) IS NOT TRUE THEN

        RAISE EXCEPTION
            'La transición de estado no está permitida.'
            USING ERRCODE = '23514';

    END IF;

    NEW.fecha_actualizacion := NOW();
    NEW.actualizado_por := auth.uid();

    RETURN NEW;

END;
$$;

CREATE TRIGGER gestion_control_transicion
BEFORE UPDATE ON public.gestion
FOR EACH ROW
EXECUTE FUNCTION public.validar_transicion_gestion();

REVOKE ALL
ON FUNCTION public.validar_transicion_gestion()
FROM PUBLIC, anon, authenticated;
```

### 4.9. Resumen operativo restringido

El resumen operativo permite consultar cantidades agrupadas por evento, acción, resultado y estado.

No devuelve folios, identidades ni comentarios.

```sql
CREATE FUNCTION public.resumen_gestiones()
RETURNS TABLE (
    id_evento INTEGER,
    accion TEXT,
    resultado TEXT,
    estado TEXT,
    cantidad BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$

    SELECT
        g.id_evento,
        g.accion,
        g.resultado,
        g.estado,
        COUNT(*)
    FROM public.gestion g
    WHERE EXISTS (
        SELECT 1
        FROM public.perfil p
        WHERE p.id_usuario = auth.uid()
        AND p.activo = TRUE
        AND p.rol IN ('Analista', 'Supervisor')
    )
    GROUP BY
        g.id_evento,
        g.accion,
        g.resultado,
        g.estado;

$$;

REVOKE ALL
ON FUNCTION public.resumen_gestiones()
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE
ON FUNCTION public.resumen_gestiones()
TO authenticated;
```

### Código fuente de las políticas

La implementación completa se encuentra en:

- [Esquema inicial](../db/001_esquema_inicial.sql)
- [Seguridad y validaciones](../db/002_seguridad_y_validaciones.sql)

Los bloques SQL anteriores documentan la implementación versionada. No deben ejecutarse nuevamente sobre una base de datos previamente configurada sin revisar su estado.

## 5. Gestión de credenciales

- Las variables de entorno se administran fuera del repositorio.
- La conexión utiliza la clave publicable de Supabase y la sesión del usuario.
- Las claves secretas y contraseñas no deben exponerse en el navegador ni en el repositorio.
- Las cookies de sesión utilizan los atributos HttpOnly, Secure y SameSite.
- La administración de las cuentas de prueba corresponde a Felipe Hernández.
- Los datos y las cuentas de evaluación son ficticios.
- Las credenciales de evaluación se entregarán al profesor mediante correo electrónico.
- La revisión independiente del repositorio y su historial en busca de secretos permanece pendiente.

## 6. Verificación técnica

### 6.1. Pruebas automatizadas de seguridad

| Grupo | Ejecutadas | Aprobadas | Fallidas |
| --- | --- | --- | --- |
| Autenticación | 8 | 8 | 0 |
| Protección del panel | 7 | 7 | 0 |
| Autorización compartida | 9 | 9 | 0 |
| Total | 24 | 24 | 0 |

Ejecución de referencia:

https://github.com/felipeivan92/PROYECTOPOZOSAPP/actions/runs/46114376018

### 6.2. Comprobaciones de base de datos

El responsable de seguridad reportó 26 comprobaciones SQL aprobadas durante el desarrollo.

Estas comprenden verificaciones de permisos, restricciones, pertenencia de registros, roles operativos, resumen agregado y acceso anónimo.

La incorporación de las consultas y evidencias correspondientes al repositorio permanece pendiente.

### 6.3. Integración funcional

La rama de seguridad fue integrada en avance8/robustecimiento mediante el Pull Request número 23.

https://github.com/felipeivan92/PROYECTOPOZOSAPP/pull/23

El responsable del robustecimiento informó 54 pruebas automatizadas aprobadas sobre la versión integrada.

Las pruebas automatizadas utilizan servicios simulados y no sustituyen la validación integral con sesiones reales ni las pruebas independientes.

### 6.4. Verificaciones reales pendientes

| Verificación | Estado |
| --- | --- |
| Existencia y permisos de resumen_gestiones en Supabase | Pendiente |
| Acceso sin autenticación en Vercel | Pendiente |
| Sesión real de Analista | Pendiente |
| Sesión real de Supervisor | Pendiente |
| Cierre de sesión y persistencia | Pendiente |

## 7. Pruebas independientes de rotura

**Responsable:** Pablo Urrutia.

| Prueba | Resultado | Minuto del video |
| --- | --- | --- |
| Acceder a una dirección interna sin iniciar sesión. | Pendiente de ejecución. | Pendiente |
| Solicitar el registro de otro usuario modificando su identificador en la URL. | Pendiente de ejecución. | Pendiente |
| Ejecutar una acción no permitida para el rol mediante una petición directa, sin utilizar la interfaz. | Pendiente de ejecución. | Pendiente |
| Revisar el repositorio y su historial en busca de credenciales expuestas. | Pendiente de ejecución. | Pendiente |

Cada prueba debe ser ejecutada por un integrante distinto de quien implementó la funcionalidad evaluada.

Los resultados deben corresponder a observaciones reales. Los fallos detectados deben documentarse, corregirse o declararse como pendientes.

## 8. Responsabilidades

| Integrante | Responsabilidad |
| --- | --- |
| Felipe Hernández | Autenticación, autorización, políticas RLS, administración de accesos y verificación real de integración. |
| Omar Carvajal | Operaciones CRUD, validaciones funcionales e integración del robustecimiento. |
| Edgar Romero | Pruebas independientes de robustez funcional. |
| Pablo Urrutia | Pruebas independientes de seguridad. |

Las modificaciones se realizan en ramas de trabajo independientes y se integran mediante Pull Requests sujetos a revisión.

## 9. Actividades pendientes

- Confirmar la configuración real de Supabase.
- Verificar el funcionamiento de ambos roles en Vercel.
- Comprobar el cierre de sesión y la persistencia.
- Incorporar las evidencias de seguridad pendientes.
- Completar la bitácora de IA.
- Ejecutar las cuatro pruebas independientes de seguridad.
- Incorporar el video de demostración y su enlace desde el README.
- Realizar la revisión grupal antes de integrar los cambios hacia dev y main.
