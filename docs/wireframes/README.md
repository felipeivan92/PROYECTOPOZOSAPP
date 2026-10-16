
# Wireframes · Flujo principal

Wireframes de baja fidelidad del flujo principal del proyecto.

**Archivo editable en Figma:**  
https://www.figma.com/design/3SF32ZeLEasQa4vD1vjJmT

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
- **Propósito:** registrar la decisión tomada y representar el escenario alternativo cuando falta respaldo.
- **Datos mostrados:** `id_evento`, `requiere_ticket`, `fecha_hora_limite_gestion`, `accion`, `resultado`, `comentario`.
- **Criterio visible:** si falta información suficiente, el caso queda Pendiente y no se permite generar gestión o ticket.
- **Navegación:** “Volver a evidencia” lleva a P2; las opciones de registro llevan a P4 cuando corresponde.

### P4 · Confirmación y trazabilidad
- **Historia:** HU-04
- **Propósito:** confirmar que la anomalía quedó gestionada y trazable.
- **Datos mostrados:** `codigo_ticket`, `fecha_hora_creacion`, `estado`, `motivo`, `accion`, `resultado`, `comentario`.
- **Criterio visible:** el analista ve la anomalía gestionada, el estado actualizado y el ticket o respaldo correspondiente.
- **Navegación:** “Ver eventos” lleva a P1; “Ver detalle” lleva a P2.

## Archivos a exportar desde Figma

Antes de cerrar la entrega, exportar las cuatro pantallas como PNG y guardarlas en esta carpeta con estos nombres:

- `P1_eventos_priorizados.png`
- `P2_detalle_anomalia.png`
- `P3_registrar_gestion.png`
- `P4_confirmacion_trazabilidad.png`
