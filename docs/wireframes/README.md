
# Wireframes · Flujo principal

Wireframes de baja fidelidad del flujo principal del proyecto.

**Archivo editable en Figma:**  
https://www.figma.com/design/SENgfuHMurDWgFsQ2ay3ZM/Avance-4---Wireframe-Proyecto-Pozos---Equipo-7--copia-?node-id=0-1&t=R4K1gY5ow6aYXwvW-1

## Pantallas

### P1 · Eventos priorizados
- **Historia:** HU-02
- **Propósito:** mostrar los pozos con anomalías y priorizar los casos críticos.
- **Datos mostrados:** `codigo_pozo`, `tipo_anomalia`, `prioridad`, `fecha_hora_deteccion`, `fecha_hora_limite_gestion`, `estado`.
- **Navegación:** “Revisar evento” lleva a P2.

### P2 · Detalle de la anomalía
- **Historia:** HU-01 — principal.
- **Propósito:** revisar la anomalía, su evidencia y comparar DGA con LI-COR.
- **Datos mostrados:** `id_evento`, `codigo_pozo`, `fecha_hora_deteccion`, `tipo_anomalia`, `criterio_deteccion`, `prioridad`, `estado`, `valor`, `unidad`, `origen_dato`, `referencia_origen`, `descripcion`, `referencia`.
- **Criterio visible:** el analista ve código de obra, fecha, valor, límite/criterio, tipo de anomalía, evidencia y comparación de fuentes.
- **Navegación:** “Continuar gestión” lleva a P3; “Volver al listado” vuelve a P1.

### P3 · Registrar gestión
- **Historia:** HU-03
- **Propósito**: registrar la decisión tomada y representar el escenario alternativo cuando falta respaldo.
- **Datos mostrados:** `id_evento`, `fecha_hora_limite_gestion`, `accion`, `resultado`, `comentario`.
- **Criterio visible:** si falta información suficiente, el caso queda Pendiente y no se permite generar gestión o ticket.
- **Navegación:** “Volver a evidencia” lleva a P2; las opciones de registro llevan a P4 cuando corresponde.

### P4 · Confirmación y trazabilidad
- **Historia:** HU-04
- **Propósito:** mostrar cómo quedó gestionado el caso, para que el analista pueda retomar su seguimiento sin reconstruir lo ocurrido en revisiones anteriores.
- **Datos mostrados:** `codigo_ticket`, `fecha_hora_creacion`, `estado`, `motivo`, `accion`, `resultado`, `comentario`.
- **Criterio visible:** eel analista puede identificar qué ocurrió con el evento, cuál es su estado actual y qué ticket o respaldo quedó asociado.
- **Navegación:** “Ver eventos” lleva a P1; “Ver detalle” lleva a P2.

## Wireframes disponibles

En esta carpeta se mantienen las cuatro pantallas utilizadas para representar el flujo principal del prototipo:

- `P1 · Eventos priorizados.png`
- `P2 · Detalle de la anomalía.png`
- `P3 · Registrar gestión.png`
- `P4 · Confirmación y trazabilidad.png`

Estas imágenes corresponden a los wireframes desarrollados para el Avance 4 y se conservan como parte del historial del proyecto. Los ajustes posteriores del flujo se encuentran reflejados en el prototipo navegable.
