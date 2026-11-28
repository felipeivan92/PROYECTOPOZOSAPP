
# Evidencias - Avance 8

**Proyecto:** Aqua Trace
**Equipo:** 7

En esta carpeta se reúnen las evidencias de las pruebas
realizadas durante el desarrollo del Avance 8.

El objetivo es respaldar el funcionamiento de la aplicación,
los controles de seguridad y las verificaciones realizadas
por los integrantes del equipo.

## 1. Seguridad y autenticación

Las siguientes capturas corresponden a las pruebas realizadas
durante el desarrollo de autenticación y seguridad de Felipe,
utilizando GitHub Actions y Node.js 24.

| Evidencia | Descripción |
| --- | --- |
| [A8_01](A8_01_resumen_pruebas_autenticacion.png) | Resumen de pruebas de autenticación. |
| [A8_02](A8_02_resultados_pruebas_autenticacion.png) | Resultados individuales de las ocho pruebas de autenticación. |
| [A8_03](A8_03_pruebas_proteccion_panel.png) | Resumen de pruebas integradas de seguridad. |
| [A8_04](A8_04_resultados_integrados_seguridad.png) | Resultados de las quince pruebas automatizadas. |

## 2. Apoyo a seguridad

Después de integrar el desarrollo de Felipe con el de Omar,
se incorporaron dos pruebas adicionales para comprobar
que el Analista y el Supervisor pueden acceder al panel
privado cuando cuentan con una sesión y un perfil autorizado.

| Evidencia | Descripción |
| --- | --- |
| [AS_01](AS_01_pruebas_acceso_autorizado.png) | Resultado de las dos nuevas pruebas de acceso autorizado y de las 56 pruebas automatizadas aprobadas. |

### Resultado de las pruebas

| Ejecutadas | Aprobadas | Fallidas |
| --- | --- | --- |
| 56 | 56 | 0 |

Ejecución de GitHub Actions:

https://github.com/felipeivan92/PROYECTOPOZOSAPP/actions/runs/46170121687

## 3. Evidencias pendientes

Queda pendiente incorporar las capturas de las
comprobaciones SQL realizadas por Felipe, junto con
las verificaciones de integración en Supabase y Vercel.

También se incorporarán las evidencias correspondientes
a las pruebas independientes de robustecimiento funcional
y seguridad, una vez que sean ejecutadas.

## 4. Documentos relacionados

- [Permisos y seguridad](../../permisos.md)
- [Robustecimiento funcional](../../robustecimiento.md)
- [Verificación de integración](../../verificacion_integracion.md)
- [Bitácora de IA de seguridad](../../bitacora-ia/avance8-seguridad.md)
- [Bitácora de IA de robustecimiento](../../bitacora-ia/avance8-robustecimiento.md)

## 5. Consideraciones

Las pruebas automatizadas utilizan entornos simulados
y no reemplazan las pruebas reales de integración ni
las pruebas independientes exigidas en el Avance 8.

Las evidencias deben corresponder a pruebas efectivamente
realizadas y no deben contener contraseñas, tokens
ni claves secretas.
