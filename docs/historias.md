
# Historias de usuario · Sistema de apoyo al monitoreo y trazabilidad de pozos

**Conversación:** Analista de monitoreo, **9 de octubre de 2026**. Nos indicó que una de las tareas que más tiempo toma es revisar y comparar los resultados del análisis para validar si un dato es correcto, especialmente al contrastar información de DGA y LI-COR. También señaló que los problemas aparecen al descargar y revisar los datos diarios y al validar una anomalía antes de generar una gestión. Entre las anomalías más frecuentes mencionó datos faltantes, duplicados, sobreflujo de caudal en L/s y m³, y cambios bruscos en las mediciones.

**Flujo principal:** Identificar una anomalía priorizada, revisar y comparar su evidencia, validar si corresponde una gestión y dejar trazabilidad del resultado.

**Historia principal:** HU-01

## HU-01 · Revisar y validar una anomalía — PRINCIPAL

Como **analista de monitoreo**, quiero **revisar y comparar una anomalía detectada junto con su evidencia de DGA y LI-COR**, para **validar si corresponde generar una gestión, ticket u observación**.

- **Escenario principal.** Dado que el analista ha seleccionado una anomalía priorizada y dispone de información de respaldo, cuando abre el detalle del evento, entonces ve en pantalla el código de obra, fecha, valor medido, límite o criterio de detección, tipo de anomalía, evidencia y la comparación entre DGA y LI-COR.
- **Escenario alternativo.** Dado que la anomalía tiene información incompleta o no cuenta con respaldo suficiente, cuando el analista intenta continuar con la gestión, entonces ve el caso como **Pendiente** y la opción de generar una gestión o ticket no está disponible.

## HU-02 · Visualizar anomalías priorizadas

Como **analista de monitoreo**, quiero **visualizar los pozos con anomalías priorizadas**, para **revisar primero los casos críticos sin recorrer manualmente todos los registros**.

## HU-03 · Registrar el resultado de la revisión

Como **analista de monitoreo**, quiero **registrar el resultado de la revisión y la decisión tomada sobre la anomalía**, para **dejar trazabilidad de la gestión y del respaldo utilizado**.

## HU-04 · Verificar el cierre y la trazabilidad

Como **analista de monitoreo**, quiero **ver la anomalía gestionada con su estado actualizado y el ticket o respaldo asociado**, para **comprobar que el caso quedó correctamente trazable**.

## Wireframes

Ver `docs/wireframes/`.

Archivo Figma:
https://www.figma.com/design/3SF32ZeLEasQa4vD1vjJmT

