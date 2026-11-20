# Bitácora de IA del Avance 7

Equipo 7 · Aqua Trace

## Encargo de trabajo para la PoC

Encargo formulado para esta implementación. Incorporar también el texto original de la clase 6.1 si el equipo lo conserva.

- **Contexto.** Aqua Trace ayuda a analistas de monitoreo a revisar anomalías y conservar la trazabilidad de sus decisiones. La tarea 3 del Avance 6 pide comprobar que la gestión queda vinculada al evento. La profesora observó que el Figma necesitaba mensajes de error, mejores etiquetas y contraste medido.
- **Intención.** Implementar el registro de una sola gestión sobre un evento ficticio y mostrar un folio que permita cotejarla con la base.
- **Restricciones.** Validar en el servidor. Permitir el registro solo para eventos con respaldo suficiente. Preparar el despliegue en Vercel y usar una base externa en producción. Mantener las claves fuera del código y usar únicamente datos ficticios. La decisión sigue a cargo del analista.
- **Verificación.** Probar un registro válido, un comentario vacío y un evento sin respaldo. Confirmar en SQLite que únicamente persiste el caso válido. Repetir desde el despliegue y registrar el resultado en el README.

## Registro de uso

| Parte | Registro |
|---|---|
| Objetivo | Convertir el registro simulado del prototipo en una operación que guarde una gestión y la relacione con el evento. |
| Instrucción entregada | Se compartieron la pauta del Avance 7 y la retroalimentación de la profesora. El encargo de trabajo anterior describe cómo se usaron ambas fuentes para implementar y comprobar el registro de una gestión. |
| Respuesta obtenida | El asistente preparó código en JavaScript, el esquema SQLite, la función para Vercel, el diagrama, las instrucciones y pruebas para el flujo. |
| Qué se aceptó y qué se corrigió | La versión de trabajo conserva un solo guardado y la relación con el evento. La primera interfaz usaba «Acción» y «Resultado» y mostraba un único mensaje general. Se sustituyeron esas etiquetas por las indicadas por la profesora y se conectó el error de comentario con el campo. Se unificaron los valores de acción y resultado para el formulario y el backend. La validación sigue ejecutándose en el servidor. El equipo debe revisar esta implementación y registrar su aprobación o nuevas correcciones. |
| Cómo se verificó | Se ejecutó `npm test` y se enviaron solicitudes HTTP al servidor local. Se reabrió el archivo SQLite para comprobar que el folio correspondía al único registro válido. Se calculó el contraste para el botón principal y se comprobó el texto y código de respuesta del error de comentario. La comprobación en Vercel queda pendiente. |
