
# Bitácora de IA - Avance 8

## Seguridad y autenticación de Aqua Trace

**Responsable de seguridad:** Felipe Hernández
**Equipo:** 7
**Ramas de trabajo:**
- avance8/seguridad
- avance8/robustecimiento
- avance8/apoyo-seguridad

**Última actualización:** 28 de noviembre de 2026.
**Estado:** Desarrollo integrado. Verificación real pendiente.

## 1. Objetivo

Implementar mecanismos de autenticación, gestión de sesiones,
protección de rutas y autorización de usuarios sobre el objeto
GESTION de Aqua Trace.

Se busca que cada usuario pueda realizar únicamente las
operaciones correspondientes a su rol, manteniendo la
trazabilidad de las decisiones registradas.

## 2. Instrucciones entregadas a la IA

### 2.1. Desarrollo inicial de seguridad

Durante el desarrollo de Felipe se solicitó apoyo para:

- Configurar Supabase y sus mecanismos de seguridad.
- Separar el desarrollo de seguridad del robustecimiento
  funcional.
- Mantener intacta la entrega correspondiente al Avance 7.
- Conservar la paleta de colores corregida según las
  observaciones de la profesora.
- Incorporar pruebas automatizadas y verificar los commits.
- Identificar las actividades que requieren coordinación
  grupal.

### 2.2. Encargo de apoyo a seguridad

Durante la jornada del 28 de noviembre se solicitó apoyo
a la IA para identificar y desarrollar las actividades
que podían adelantarse desde GitHub sin disponer de los
accesos administrativos de Felipe.

El encargo se resume en los siguientes cuatro elementos:

**Contexto:**

La aplicación ya contaba con la integración del desarrollo
de seguridad de Felipe y el robustecimiento funcional
de Omar. Sin embargo, quedaban documentos, pruebas y
evidencias pendientes de completar.

**Intención:**

Adelantar las actividades que podían realizarse desde
GitHub, dejando preparadas las verificaciones que requieren
acceso a Supabase y Vercel.

**Restricciones:**

- No modificar directamente la rama main.
- No alterar el trabajo funcional realizado por Omar.
- No modificar la base de datos ni sus credenciales.
- Conservar el trabajo anterior de Felipe.
- No declarar aprobadas pruebas que no se hayan ejecutado.
- Utilizar una redacción clara y coherente con los
  documentos del equipo.

**Verificación:**

Revisar los archivos existentes, comprobar cada commit
en GitHub, ejecutar las pruebas automatizadas y respaldar
los resultados mediante evidencias.

## 3. Respuesta obtenida

### 3.1. Desarrollo de seguridad

La IA propuso una arquitectura de autenticación basada en
Supabase Auth, funciones de servidor en Vercel y cookies
seguras para administrar las sesiones.

Durante el desarrollo se incorporaron:

- Módulo de conexión con Supabase.
- Módulo de autenticación.
- Gestión de cookies de sesión.
- API de autenticación.
- Interfaz de inicio de sesión.
- Controlador de acceso al panel interno.
- Módulo de cierre de sesión.
- Módulo compartido de autorización.
- Políticas RLS y permisos por columna.
- Control de transiciones de estado y auditoría.
- Función de resumen operativo.
- Pruebas automatizadas mediante GitHub Actions.

### 3.2. Integración funcional

Omar integró la rama de seguridad con su desarrollo
mediante el Pull Request número 23.

La integración incorporó las operaciones CRUD, las
validaciones funcionales y la conexión de la API
con Supabase.

https://github.com/felipeivan92/PROYECTOPOZOSAPP/pull/23

### 3.3. Apoyo al desarrollo de seguridad

Se creó la rama avance8/apoyo-seguridad a partir de
avance8/robustecimiento para complementar el trabajo
sin intervenir directamente las ramas anteriores.

En esta rama se realizaron las siguientes actividades:

- Actualización del documento de permisos.
- Incorporación de las políticas RLS en lenguaje SQL
  dentro de la documentación.
- Preparación de la consulta de verificación del
  resumen operativo.
- Incorporación de dos pruebas de acceso autorizado
  al panel privado.
- Actualización de GitHub Actions.
- Preparación del procedimiento de verificación real.
- Incorporación de la captura de las pruebas aprobadas.
- Actualización del índice de evidencias.

## 4. Elementos aceptados y corregidos

### 4.1. Decisiones aceptadas

- Utilizar ramas independientes para organizar el trabajo.
- Mantener las credenciales fuera del repositorio.
- Utilizar la clave publicable de Supabase para no omitir RLS.
- Verificar la identidad y el perfil desde el servidor.
- Aplicar el principio de denegación por defecto.
- Mantener el azul de acción #1D4ED8 y el fondo #F0F5F7.
- Evitar modificaciones directas sobre main.
- Mantener separados los resultados de pruebas simuladas
  y las verificaciones reales.

### 4.2. Correcciones durante el desarrollo inicial

Durante la revisión del archivo auth.test.mjs se detectó
una línea de texto incorporada accidentalmente al copiar
el código. Se eliminó mediante un commit específico antes
de ejecutar las pruebas.

También se amplió el flujo de GitHub Actions para incorporar
las pruebas de protección del panel y posteriormente
las pruebas del módulo compartido de autorización.

### 4.3. Correcciones realizadas durante el apoyo

Al revisar la documentación se observó que algunas
actividades seguían figurando como pendientes, aunque
ya estaban implementadas en el código.

Se actualizó el documento de permisos utilizando las
políticas SQL versionadas por Felipe.

También se observó que las pruebas del panel comprobaban
el rechazo de accesos indebidos, pero no verificaban
el ingreso correcto de los usuarios autorizados.

Se incorporaron dos pruebas adicionales, una para el
Analista y otra para el Supervisor.

Finalmente, se actualizó GitHub Actions para ejecutar
las pruebas en la rama de apoyo.

## 5. Método de verificación

Los archivos y commits fueron revisados directamente
en GitHub.

Las pruebas automatizadas se ejecutaron mediante
GitHub Actions utilizando Node.js 24.

### 5.1. Resultados iniciales de seguridad

| Grupo de pruebas | Ejecutadas | Aprobadas | Fallidas |
| --- | --- | --- | --- |
| Autenticación | 8 | 8 | 0 |
| Protección del panel | 7 | 7 | 0 |
| Total inicial | 15 | 15 | 0 |

### 5.2. Ampliación de las pruebas de seguridad

| Grupo de pruebas | Ejecutadas | Aprobadas | Fallidas |
| --- | --- | --- | --- |
| Autenticación | 8 | 8 | 0 |
| Protección del panel | 7 | 7 | 0 |
| Autorización compartida | 9 | 9 | 0 |
| Total | 24 | 24 | 0 |

### 5.3. Resultados de la versión integrada

| Etapa | Ejecutadas | Aprobadas | Fallidas |
| --- | --- | --- | --- |
| Integración inicial de Omar | 54 | 54 | 0 |
| Integración con pruebas adicionales | 56 | 56 | 0 |

Las 54 pruebas iniciales fueron informadas por Omar.
Las 56 pruebas posteriores fueron comprobadas mediante
GitHub Actions y respaldadas con una captura.

Estos resultados corresponden a etapas sucesivas
del desarrollo y no deben sumarse entre sí.

### 5.4. Evidencias de ejecución

Pruebas iniciales de autenticación:

https://github.com/felipeivan92/PROYECTOPOZOSAPP/actions/runs/46104505197

Pruebas integradas de seguridad:

https://github.com/felipeivan92/PROYECTOPOZOSAPP/actions/runs/46105836119

Verificación posterior al módulo de cierre de sesión:

https://github.com/felipeivan92/PROYECTOPOZOSAPP/actions/runs/46106275275

Pruebas del módulo compartido de autorización:

https://github.com/felipeivan92/PROYECTOPOZOSAPP/actions/runs/46114376018

Pruebas de la versión integrada:

https://github.com/felipeivan92/PROYECTOPOZOSAPP/actions/runs/46155172397

Pruebas de la rama de apoyo:

https://github.com/felipeivan92/PROYECTOPOZOSAPP/actions/runs/46170121687

### 5.5. Capturas de verificación

| Evidencia | Descripción |
| --- | --- |
| [A8_01](../evidencias/avance8/A8_01_resumen_pruebas_autenticacion.png) | Resumen de las pruebas de autenticación. |
| [A8_02](../evidencias/avance8/A8_02_resultados_pruebas_autenticacion.png) | Resultados de las ocho pruebas de autenticación. |
| [A8_03](../evidencias/avance8/A8_03_pruebas_proteccion_panel.png) | Resumen de las pruebas de protección del panel. |
| [A8_04](../evidencias/avance8/A8_04_resultados_integrados_seguridad.png) | Resultados de las quince pruebas iniciales. |
| [AS_01](../evidencias/avance8/AS_01_pruebas_acceso_autorizado.png) | Resultados de las 56 pruebas automatizadas, incluyendo el acceso permitido de ambos roles. |

Las comprobaciones SQL realizadas anteriormente por Felipe
se incorporarán con sus respectivas evidencias una vez
que estén disponibles en el repositorio.

## 6. Limitaciones actuales

- Las pruebas automatizadas no comprueban el funcionamiento
  completo de Supabase real.
- Las sesiones reales de Analista y Supervisor deben
  verificarse en Vercel.
- La persistencia y los campos de auditoría deben
  comprobarse en la base de datos.
- GitHub Actions ha presentado una advertencia relacionada
  con las versiones de checkout y setup-node utilizadas.
- Las pruebas independientes de Edgar y Pablo siguen
  pendientes de ejecución.
- Falta incorporar el registro específico del encargo
  original de implementación RLS realizado por Felipe.

## 7. Actividades pendientes

### Felipe Hernández

- Verificar resumen_gestiones en Supabase.
- Comprobar el acceso sin autenticación.
- Verificar las sesiones reales de ambos roles.
- Comprobar el cierre de sesión y la persistencia.
- Incorporar las consultas SQL originales y sus capturas.
- Completar el registro del encargo original de IA para RLS.
- Confirmar que la aplicación puede entregarse al equipo.

### Edgar Romero

- Ejecutar y documentar las pruebas independientes
  de robustecimiento funcional.

### Pablo Urrutia

- Ejecutar y documentar las pruebas independientes
  de seguridad.

### Equipo

- Revisar los resultados.
- Corregir o documentar los fallos encontrados.
- Preparar las evidencias finales y el video.
- Integrar los cambios mediante Pull Requests.

Las pruebas automatizadas realizadas durante el desarrollo
no reemplazan las verificaciones reales ni las pruebas
independientes exigidas por la pauta.
