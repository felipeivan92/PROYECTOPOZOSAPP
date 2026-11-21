# Prototipo navegable · Aqua Trace

**Enlace al prototipo navegable:**  
https://www.figma.com/proto/xj8Y7bch5eofbDyEB6uYeH/WF-AquaTrace-AO15112026?node-id=42-288&p=f&t=gDEEILfUkMw6wbEt-0&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=42%3A288&page-id=0%3A1

**Archivo editable en Figma:**  
https://www.figma.com/design/xj8Y7bch5eofbDyEB6uYeH/WF-AquaTrace-AO15112026?node-id=0-1&t=8Vxl3FmqEFioXLI8-0

El prototipo representa el flujo principal de revisión y gestión de anomalías detectadas en el monitoreo de pozos.

La navegación permite revisar eventos priorizados, consultar su evidencia, registrar una decisión y mantener la trazabilidad de la gestión.

## Sistema mínimo de diseño · A2

Para mantener consistencia entre las pantallas del flujo principal se utiliza el siguiente sistema mínimo:

- **Texto principal:** 24 px para títulos de pantalla.
- **Texto de contenido:** 16 px para información, etiquetas y controles.
- **Color de acción:** azul `#1D4ED8` para botones y acciones principales (relleno en la acción primaria y contorno en las secundarias).
- **Color de alerta:** rojo `#B91C1C` para advertencias y errores que requieren atención.
- **Unidad base de espaciado:** 8 px.

Colores de apoyo: texto principal `#1F2937`, texto secundario `#475569`, fondo de pantalla `#F8FAFC` y menú lateral `#0B2A4A`.

Los estados del sistema se presentan mediante texto además del apoyo visual del color, evitando que la interpretación dependa únicamente de este último.

## Pantallas principales

El flujo evaluado está compuesto por cuatro pantallas principales asociadas a las historias de usuario del proyecto.

### P1 · Eventos priorizados

**Historia:** HU-02

Permite visualizar los eventos detectados y ordenarlos según su prioridad.

La pantalla presenta información como:

- código y nombre del pozo;
- tipo de anomalía;
- prioridad;
- fecha y hora de detección;
- fecha límite de gestión;
- identificador del evento.

La acción principal permite seleccionar un evento y revisar su detalle.

### P2 · Detalle de la anomalía

**Historia:** HU-01

Permite revisar los antecedentes del evento antes de tomar una decisión.

Se muestran, entre otros antecedentes:

- identificador del evento;
- código del pozo;
- prioridad;
- estado;
- tipo de anomalía;
- criterio de detección;
- fecha de detección;
- evidencia disponible;
- valor observado;
- umbral correspondiente;
- comparación entre fuentes DGA y LI-COR.

El analista puede volver al listado o continuar hacia el registro de la gestión.

### P3 · Registrar gestión

**Historia:** HU-03

Permite registrar la decisión adoptada por el analista.

Los principales campos utilizados son:

- `id_evento`;
- `fecha_hora_limite_gestion`;
- `accion`;
- `resultado`;
- `comentario`.

Los campos `accion` y `resultado` representan opciones previamente definidas en la estructura de datos, mientras que `comentario` permite justificar la decisión adoptada.

La decisión sobre generar o no un ticket permanece en el analista.

### P4 · Confirmación y trazabilidad

**Historia:** HU-04

Permite comprobar que la decisión realizada quedó registrada y asociada al evento correspondiente.

Cuando existe un ticket, la pantalla presenta información como:

- código del ticket;
- fecha de creación;
- estado;
- motivo;
- acción realizada;
- resultado;
- comentario asociado.

Desde esta etapa el usuario puede volver al flujo de seguimiento.

## Mapa de navegación · A3

```mermaid
flowchart TD
    P1["P1 · Eventos priorizados"]
    P2["P2 · Detalle de la anomalía"]
    P3["P3 · Registrar gestión"]
    C["Confirmar generación de ticket"]
    P4["P4 · Confirmación y trazabilidad"]
    E["Evidencia insuficiente<br/>Estado: Pendiente<br/>Resultado: Respaldo insuficiente"]

    P1 -->|"Revisar evento"| P2
    P2 -->|"Continuar gestión"| P3
    P3 -->|"Generar ticket"| C
    C -->|"Sí, confirmar"| P4

    P2 -->|"Volver al listado"| P1
    P3 -->|"Volver a evidencia"| P2

    P2 -->|"Respaldo insuficiente"| E
    E -->|"Regresar"| P2

    C -->|"No"| P3
```

### Camino principal

**P1 → P2 → P3 → Confirmación → P4**

El analista selecciona una anomalía priorizada, revisa su evidencia, registra la gestión, confirma la generación del ticket cuando corresponde y finalmente revisa la trazabilidad de la decisión.

### Camino alternativo 1 · Evidencia insuficiente

Este camino se deriva del criterio de aceptación de HU-01.

Cuando los antecedentes disponibles no permiten continuar con seguridad, el prototipo presenta:

**Estado: Pendiente**  
**Resultado: Respaldo insuficiente**

junto al mensaje:

**“Se requieren antecedentes adicionales para continuar.”**

El usuario puede regresar al flujo de revisión sin generar un ticket.

### Camino alternativo 2 · Cancelar generación de ticket

Al llegar a la confirmación de generación de ticket, el usuario puede seleccionar **“No”**.

Esta acción devuelve al usuario a la pantalla de registro de gestión, permitiendo revisar o modificar la decisión antes de continuar.

Este camino evita que una confirmación accidental genere una gestión no deseada.

## Estados de interfaz · A4

El prototipo considera que una interfaz de monitoreo debe comunicar claramente el estado de la información.

Los estados representados en el prototipo son:

| Estado | Dónde se ve en el prototipo | Mensaje que muestra |
|---|---|---|
| Con datos | P1 · Eventos priorizados | «2 eventos disponibles», con el detalle de cada evento. |
| Cargando | P1 · Consultando eventos | «Cargando eventos…» y «Consultando los datos del ejemplo. El listado aparecerá al terminar.» |
| Vacío | P1 · Sin resultados | «No hay eventos para estos filtros» y «No se encontraron eventos. Restablece los filtros para volver a los ejemplos.» |
| Error de formulario | P3 · Registrar gestión con el comentario vacío | Bajo el campo: «Escribe por qué decides generar o no el ticket.» |
| Respaldo insuficiente | Camino alternativo de P2 | «Estado: Pendiente · Resultado de la comprobación: Respaldo insuficiente». |

Un error de carga de los eventos («No fue posible cargar los eventos. Intenta nuevamente.») queda definido para la implementación, pero no se representa como pantalla en este prototipo.

Los estados de eventos como **Pendiente**, **En revisión**, **Gestionado** y **Cerrado** deben mostrarse siempre mediante texto y no únicamente mediante color.

## Registro de decisiones · A5

| Pantalla | Historia | Criterio que verifica | Simulado | Funcional |
|---|---|---|---|---|
| P1 · Eventos priorizados | HU-02 | El analista puede visualizar y seleccionar eventos priorizados para revisión. | Datos de eventos y filtros. | Navegación hacia el detalle del evento. |
| P2 · Detalle de la anomalía | HU-01 | El analista puede revisar anomalía, criterio de detección, evidencia y comparación de fuentes antes de decidir. | Datos DGA, LI-COR, evidencia y umbrales. | Navegación hacia gestión, retorno al listado y camino de evidencia insuficiente. |
| P3 · Registrar gestión | HU-03 | El analista puede registrar la acción, resultado y comentario asociados al evento. | Registro de la decisión y generación del ticket. | Retorno a evidencia y avance hacia confirmación. |
| P4 · Confirmación y trazabilidad | HU-04 | El analista puede verificar que la gestión quedó registrada y asociada al ticket cuando corresponde. | Código, estado y antecedentes del ticket. | Continuación del flujo y navegación hacia otras etapas. |

## Alcance del prototipo

Para la evaluación del Avance 5 se consideran como flujo principal las pantallas P1, P2, P3 y P4.

El archivo Figma contiene únicamente las pantallas del flujo principal (P1 a P4), la confirmación previa a generar el ticket, el camino alternativo «Respaldo insuficiente» y los estados de interfaz descritos arriba. Tras la retroalimentación del Avance 5 se eliminaron las pantallas que no provienen de una historia de usuario (inicio de sesión, recuperación de contraseña, inicio, perfil de usuario, seguimiento del ticket y cierre de sesión), por lo que el prototipo parte en P1 y el menú lateral solo incluye las cuatro pantallas del flujo.
