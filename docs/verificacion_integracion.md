
# Verificación de integración · Aqua Trace

**Equipo:** 7
**Avance:** 8
**Responsable de ejecución:** Felipe Hernández
**Rama de aplicación:** avance8/robustecimiento
**Estado:** Pendiente de verificación real.

## 1. Objetivo

Comprobar que los componentes de seguridad y robustecimiento
funcional trabajen correctamente en conjunto, utilizando
la aplicación desplegada en Vercel y la base de datos
de Supabase.

Estas verificaciones permitirán entregar una versión
funcional a Edgar y Pablo para que puedan realizar sus
pruebas independientes.

## 2. Antecedentes

Omar integró la rama de seguridad con su desarrollo
funcional mediante el Pull Request número 23.

La aplicación incorpora autenticación, autorización,
operaciones CRUD, validaciones y políticas RLS.

Posteriormente, en la rama avance8/apoyo-seguridad,
se agregaron dos pruebas automatizadas para comprobar
el acceso permitido al panel de Analista y Supervisor.

La ejecución de GitHub Actions obtuvo los siguientes
resultados:

| Pruebas ejecutadas | Aprobadas | Fallidas |
| --- | --- | --- |
| 56 | 56 | 0 |

Ejecución de referencia:
https://github.com/felipeivan92/PROYECTOPOZOSAPP/actions/runs/46170121687

Estos resultados corresponden a pruebas de desarrollo.
Todavía se requiere comprobar el funcionamiento
con sesiones reales y Supabase.

## 3. Entorno de verificación

| Antecedente | Información |
| --- | --- |
| URL de Vercel Preview | Pendiente |
| Commit evaluado | Pendiente |
| Fecha de ejecución | Pendiente |
| Base de datos | Entorno de pruebas de Aqua Trace |
| Datos utilizados | Ficticios |
| Responsable | Felipe Hernández |

## 4. Verificaciones de integración

### VI-01. Resumen operativo en Supabase

Objetivo:

Comprobar que la función resumen_gestiones existe
y tiene los permisos correspondientes.

Procedimiento:

1. Ingresar al SQL Editor de Supabase.
2. Ejecutar la consulta db/prueba_06_resumen_operativo.sql.
3. Revisar la configuración y los permisos.
4. Guardar una captura del resultado.

Resultado esperado:

- La consulta devuelve una fila.
- SECURITY DEFINER habilitado.
- Función declarada STABLE.
- search_path vacío.
- Permiso de ejecución para authenticated.
- Sin permiso de ejecución para anon.

Resultado observado: Pendiente.

Evidencia: A8_14_verificacion_resumen_operativo.png.

### VI-02. Acceso sin autenticación

Objetivo:

Comprobar que el panel y la API no permiten el acceso
a usuarios sin sesión.

Procedimiento:

1. Abrir la versión integrada de Vercel Preview
   en una ventana de incógnito.
2. Ingresar directamente a la ruta principal.
3. Intentar acceder a /panel y /index.html.
4. Intentar acceder a /api/panel.
5. Consultar /api/gestion sin iniciar sesión.
6. Comprobar que el HTML privado no se encuentre
   disponible como archivo público.

Resultado esperado:

Las rutas protegidas redirigen al inicio de sesión
y la API de gestión rechaza las solicitudes
no autenticadas.

Resultado observado: Pendiente.

Evidencia: A8_15_acceso_sin_autenticacion.png.

### VI-03. Sesión real de Analista

Objetivo:

Verificar que el Analista pueda registrar y consultar
sus propias gestiones.

Procedimiento:

1. Iniciar sesión con la cuenta de Analista.
2. Seleccionar el evento ficticio 7001.
3. Seleccionar Validar evento como acción.
4. Seleccionar Ticket requerido como resultado.
5. Escribir el comentario:
   Prueba VI-03 de integración real.
6. Guardar la gestión.
7. Registrar el folio generado.
8. Comprobar que la gestión aparece en el listado.
9. Verificar el resumen operativo.
10. Comprobar que no dispone de acciones de cierre
    ni anulación.

Resultado esperado:

La gestión se almacena correctamente, aparece con
estado Registrada y puede consultarse mediante su folio.

El resumen operativo debe actualizarse sin exponer
datos restringidos de otros usuarios.

Resultado observado: Pendiente.

Evidencias:

- A8_16_sesion_analista.png
- A8_17_registro_gestion_real.png
- A8_18_resumen_operativo.png

### VI-04. Sesión real de Supervisor

Objetivo:

Comprobar que el Supervisor pueda consultar y actualizar
las gestiones sin modificar la decisión original.

Procedimiento:

1. Cerrar la sesión de Analista.
2. Iniciar sesión como Supervisor.
3. Buscar la gestión creada durante VI-03.
4. Comprobar que el formulario de registro no permite
   crear nuevas gestiones con este rol.
5. Cerrar la gestión.
6. Verificar el cambio de estado a Cerrada.
7. Anular la misma gestión indicando un motivo ficticio.
8. Comprobar que permanece en el listado con estado
   Anulada y conserva su información original.

Resultado esperado:

El Supervisor puede consultar, cerrar y anular gestiones,
pero no puede registrar nuevas decisiones.

La anulación no elimina físicamente el registro.

Resultado observado: Pendiente.

Evidencias:

- A8_19_sesion_supervisor.png
- A8_20_cierre_gestion.png
- A8_21_anulacion_gestion.png

### VI-05. Cierre de sesión y persistencia

Objetivo:

Comprobar que las sesiones se cierren correctamente
y que las gestiones permanezcan almacenadas.

Procedimiento:

1. Cerrar la sesión de Supervisor.
2. Intentar ingresar nuevamente al panel sin autenticación.
3. Comprobar que la API rechaza el acceso sin sesión.
4. Iniciar nuevamente sesión con un rol autorizado.
5. Consultar el folio generado durante VI-03.
6. Verificar que conserva su estado Anulada.
7. Confirmar en Supabase la existencia del registro
   y sus campos de auditoría.
8. Cerrar nuevamente la sesión.

Resultado esperado:

El cierre de sesión impide acceder al panel y a la API
sin autenticarse nuevamente.

La gestión permanece almacenada con su folio,
estado, motivo de anulación y trazabilidad.

Resultado observado: Pendiente.

Evidencias:

- A8_22_cierre_sesion.png
- A8_23_persistencia_datos.png

## 5. Resumen de resultados

| ID | Verificación | Resultado |
| --- | --- | --- |
| VI-01 | Resumen operativo en Supabase | Pendiente |
| VI-02 | Acceso sin autenticación | Pendiente |
| VI-03 | Sesión real de Analista | Pendiente |
| VI-04 | Sesión real de Supervisor | Pendiente |
| VI-05 | Cierre de sesión y persistencia | Pendiente |

## 6. Registro de incidencias

| Verificación | Problema encontrado | Responsable de corrección | Estado |
| --- | --- | --- | --- |
| Pendiente | Pendiente de ejecución | Por definir | Pendiente |

Si se detecta un problema, deberá registrarse antes de
realizar una corrección y volver a ejecutar la prueba.

No se deben eliminar físicamente las gestiones
generadas durante las pruebas.

## 7. Liberación para pruebas independientes

Una vez completadas las cinco verificaciones,
Felipe deberá confirmar que la aplicación se encuentra
en condiciones de ser evaluada por Edgar y Pablo.

Las pruebas de integración no reemplazan las pruebas
independientes de robustecimiento y seguridad
exigidas en el Avance 8.

| Responsable | Actividad | Estado |
| --- | --- | --- |
| Felipe | Verificación real de integración | Pendiente |
| Edgar | Pruebas independientes funcionales | Pendiente |
| Pablo | Pruebas independientes de seguridad | Pendiente |

Fecha de liberación: Pendiente.

Confirmación de Felipe: Pendiente.

Las contraseñas, tokens y claves secretas no deberán
incorporarse a este documento ni a las evidencias.
