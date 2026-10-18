# Retroalimentación del Avance 3

A partir de la retroalimentación recibida por la profesora, el equipo identificó aspectos que debían precisarse antes de continuar con el desarrollo del MVP.

## 1. Evidencia y métricas

Se observó que los resultados esperados estaban expresados de manera general y no permitían comprobar cuantitativamente si la solución generaba una mejora.

Como respuesta, se definieron indicadores asociados al tiempo de revisión, la evidencia disponible, la trazabilidad entre anomalías y tickets y el tiempo transcurrido entre detección y revisión.

Antes de establecer una reducción porcentual o temporal se medirá una línea base del proceso actual para evitar utilizar valores no verificados.

## 2. Capas de la solución

Se precisaron tres capas dentro de la solución.

La capa dominante corresponde al conocimiento, ya que transforma los datos de monitoreo en información priorizada sobre anomalías.

La capa de automatización aplica las reglas necesarias para detectar y clasificar estas condiciones.

La capa de registro conserva la evidencia, las acciones realizadas y los tickets relacionados con cada evento para mantener su trazabilidad.

## 3. Definición de anomalía

Se definió una anomalía como una condición detectada mediante una regla verificable aplicada a los datos de monitoreo.

Entre las condiciones consideradas se encuentran registros faltantes, duplicados, lecturas en cero, valores que superan límites definidos, inconsistencias entre variables y cambios bruscos en las mediciones.

Cada evento conserva el criterio que provocó su detección.

## 4. Ingreso de datos

Para el MVP se definió que los datos podrán incorporarse mediante archivos exportados desde las fuentes actuales de monitoreo, principalmente en formatos CSV o Excel.

El origen y la referencia del dato quedan registrados para mantener su trazabilidad.

## 5. Tickets

Se precisó que un ticket corresponde al registro formal de una anomalía que requiere una acción o seguimiento después de la revisión del analista.

La validación humana se mantiene antes de continuar con la gestión.

## 6. Flujo de pantallas

La maqueta fue ampliada para representar el escenario principal mediante cuatro pantallas:

1. Eventos priorizados.
2. Detalle de la anomalía y su evidencia.
3. Registro de la gestión.
4. Confirmación y trazabilidad.

Las pantallas incluyen acciones de navegación que permiten representar el recorrido completo del analista.

## 7. Herramientas

Se identificó la necesidad de documentar las herramientas según la función que cumplen dentro del MVP, diferenciando incorporación de datos, procesamiento, almacenamiento, visualización y trazabilidad.

## 8. Roadmap

Se revisará la priorización del roadmap para mantener como funciones principales aquellas necesarias para cumplir la propuesta de trazabilidad.

Las funcionalidades de análisis de tendencias, recurrencia y apoyo preventivo permanecerán como desarrollos posteriores.
