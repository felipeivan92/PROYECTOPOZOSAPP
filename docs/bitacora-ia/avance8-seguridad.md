
# Bitácora de IA - Avance 8

## Seguridad y autenticación de Aqua Trace

**Responsable:** Felipe Hernández  
**Equipo:** 7  
**Rama de trabajo:** avance8/seguridad  
**Estado:** En desarrollo.

## 1. Objetivo

Implementar mecanismos de autenticación, gestión de sesiones,
protección de rutas y autorización de usuarios sobre el objeto
GESTION de Aqua Trace, manteniendo la trazabilidad de las
decisiones operativas.

## 2. Instrucciones entregadas a la IA

Durante el desarrollo se solicitó apoyo para:

- Configurar Supabase y sus mecanismos de seguridad.
- Separar el desarrollo de seguridad del robustecimiento funcional.
- Mantener intacta la entrega correspondiente al Avance 7.
- Conservar la paleta de colores corregida según las observaciones
  de la profesora.
- Incorporar pruebas automatizadas y verificar los commits.
- Identificar las actividades que requieren coordinación grupal.

El encargo estructurado definitivo para implementar las políticas
RLS se registrará después de aprobar la matriz de permisos.

## 3. Respuesta obtenida

La IA propuso una arquitectura de autenticación basada en
Supabase Auth, funciones de servidor en Vercel y cookies
seguras para administrar las sesiones.

Se desarrollaron los siguientes componentes:

- Módulo de conexión con Supabase.
- Módulo de autenticación.
- Gestión de cookies de sesión.
- API de autenticación.
- Interfaz de inicio de sesión.
- Controlador de acceso al panel interno.
- Módulo de cierre de sesión.
- Pruebas automatizadas mediante GitHub Actions.

## 4. Elementos aceptados y corregidos

### Decisiones aceptadas

- Utilizar una rama independiente de seguridad.
- Mantener las credenciales fuera del repositorio.
- Utilizar la clave publicable de Supabase para no omitir RLS.
- Verificar la identidad y el perfil desde el servidor.
- Aplicar el principio de denegación por defecto.
- Mantener el azul de acción #1D4ED8 y el fondo #F0F5F7.
- Evitar modificaciones directas sobre main.

### Correcciones realizadas

Durante la revisión del archivo auth.test.mjs se detectó
una línea de texto incorporada accidentalmente al copiar
el código. Se eliminó mediante un commit específico antes
de ejecutar las pruebas.

También se amplió el flujo de GitHub Actions para incorporar
las pruebas de protección del panel, además de las pruebas
iniciales de autenticación.

### Limitaciones identificadas

- Las pruebas utilizan respuestas simuladas de Supabase.
- La protección de las rutas desplegadas requiere integración.
- Las políticas RLS definitivas están pendientes.
- El módulo de cierre de sesión debe integrarse con la interfaz.
- GitHub Actions presenta una advertencia de obsolescencia
  asociada a las versiones utilizadas de checkout y setup-node.

## 5. Método de verificación

Se revisaron los archivos y commits directamente en GitHub,
comparando la rama de seguridad con dev.

Se ejecutaron pruebas automatizadas con Node.js 24 mediante
GitHub Actions.

| Grupo de pruebas | Ejecutadas | Aprobadas | Fallidas |
| --- | --- | --- | --- |
| Autenticación | 8 | 8 | 0 |
| Protección del panel | 7 | 7 | 0 |
| Total | 15 | 15 | 0 |

### Evidencias de ejecución

- Pruebas iniciales de autenticación:
  https://github.com/felipeivan92/PROYECTOPOZOSAPP/actions/runs/46104505197

- Pruebas integradas de seguridad:
  https://github.com/felipeivan92/PROYECTOPOZOSAPP/actions/runs/46105836119

- Verificación posterior al módulo de cierre de sesión:
  https://github.com/felipeivan92/PROYECTOPOZOSAPP/actions/runs/46106275275

## 6. Actividades pendientes

- Validación grupal de la matriz de permisos.
- Registro del encargo estructurado de implementación RLS.
- Implementación y verificación de políticas RLS.
- Integración con las operaciones CRUD.
- Pruebas reales de autenticación en Vercel.
- Pruebas independientes de seguridad.
- Incorporación de capturas y evidencia audiovisual.

Las pruebas automatizadas realizadas durante el desarrollo
no reemplazan las pruebas independientes exigidas por la pauta.
