# Bitácora de IA del Avance 7

Equipo 7 · Aqua Trace

## Encargo de trabajo para la PoC

### Especificación de implementación a partir de esos mensajes

Las cuatro partes siguientes sintetizan el encargo aplicado en esta conversación. El equipo aún debe incorporar el texto original de la clase 6.1.

- **Contexto.** Aqua Trace ayuda a analistas de monitoreo a revisar anomalías y conservar la trazabilidad de sus decisiones. La tarea 3 del Avance 6 pide comprobar que la gestión queda vinculada al evento. La profesora observó que el Figma necesitaba mensajes de error, mejores etiquetas y contraste medido.
- **Intención.** Implementar el registro de una sola gestión sobre un evento ficticio y mostrar un folio que permita cotejarla con la base.
- **Restricciones.** Validar en el servidor. Permitir el registro solo para eventos con respaldo suficiente. Preparar el despliegue en Vercel y usar una base externa en producción. Mantener las claves fuera del código y usar únicamente datos ficticios. La decisión sigue a cargo del analista.
- **Verificación.** Probar un registro válido, un comentario vacío y un evento sin respaldo. Confirmar en SQLite que únicamente persiste el caso válido. Repetir desde el despliegue y registrar el resultado en el README.

## Código aportado por IA

Los enlaces permiten leer el código completo en la versión que se verificó para el PR #13. Los archivos se prepararon para el flujo de registro de una gestión ficticia.

| Archivo | Aporte de código |
|---|---|
| [`src/public/index.html`](https://github.com/felipeivan92/PROYECTOPOZOSAPP/blob/39045d2fd94decfaa8e227733b9d7437afb44371/src/public/index.html) | Formulario con evento, acción, resultado y comentario. Incluye el espacio para el mensaje junto al campo y la confirmación con folio. |
| [`src/public/estilo.css`](https://github.com/felipeivan92/PROYECTOPOZOSAPP/blob/39045d2fd94decfaa8e227733b9d7437afb44371/src/public/estilo.css) | Diseño del formulario, estilos de foco y error, y contraste del botón principal. |
| [`src/public/app.js`](https://github.com/felipeivan92/PROYECTOPOZOSAPP/blob/39045d2fd94decfaa8e227733b9d7437afb44371/src/public/app.js) | Selección del caso de demo, envío al backend, presentación del folio y errores, y conservación del folio para reintentar el mismo envío. |
| [`src/public/decisiones.js`](https://github.com/felipeivan92/PROYECTOPOZOSAPP/blob/39045d2fd94decfaa8e227733b9d7437afb44371/src/public/decisiones.js) | Lista compartida de acciones y resultados compatibles que también usa el servidor para validar. |
| [`src/gestion.mjs`](https://github.com/felipeivan92/PROYECTOPOZOSAPP/blob/39045d2fd94decfaa8e227733b9d7437afb44371/src/gestion.mjs) | Validación del evento, acción, resultado y comentario. Inserción con parámetros para eventos con respaldo suficiente y recuperación del registro en un reintento con el mismo folio. |
| [`src/datos.sql`](https://github.com/felipeivan92/PROYECTOPOZOSAPP/blob/39045d2fd94decfaa8e227733b9d7437afb44371/src/datos.sql) | Esquema de eventos y gestiones, vínculo entre tablas y datos ficticios para los eventos 7001 y 7002. |
| [`src/local.mjs`](https://github.com/felipeivan92/PROYECTOPOZOSAPP/blob/39045d2fd94decfaa8e227733b9d7437afb44371/src/local.mjs) | Servidor HTTP local y persistencia en un archivo SQLite. |
| [`api/gestion.mjs`](https://github.com/felipeivan92/PROYECTOPOZOSAPP/blob/39045d2fd94decfaa8e227733b9d7437afb44371/api/gestion.mjs) | Función de Vercel que ejecuta consultas contra Turso y reutiliza la validación del servidor. |
| [`src/gestion.test.mjs`](https://github.com/felipeivan92/PROYECTOPOZOSAPP/blob/39045d2fd94decfaa8e227733b9d7437afb44371/src/gestion.test.mjs) | Pruebas automatizadas del guardado, reintento, rechazos, persistencia y falla de conexión con la base. |
| [`package.json`](https://github.com/felipeivan92/PROYECTOPOZOSAPP/blob/39045d2fd94decfaa8e227733b9d7437afb44371/package.json), [`vercel.json`](https://github.com/felipeivan92/PROYECTOPOZOSAPP/blob/39045d2fd94decfaa8e227733b9d7437afb44371/vercel.json), [`.env.example`](https://github.com/felipeivan92/PROYECTOPOZOSAPP/blob/39045d2fd94decfaa8e227733b9d7437afb44371/.env.example) y [`.gitignore`](https://github.com/felipeivan92/PROYECTOPOZOSAPP/blob/39045d2fd94decfaa8e227733b9d7437afb44371/.gitignore) | Comandos de ejecución y prueba, configuración de Vercel, nombres de variables de entorno y exclusión del archivo de credenciales y de la base local. |

## Registro de uso

| Parte | Registro |
|---|---|
| Objetivo | Convertir el registro simulado del prototipo en una operación que guarde una gestión y la relacione con el evento. |
| Instrucción entregada | Los mensajes originales se reproducen arriba. La pauta y la retroalimentación acompañaron esos mensajes. |
| Respuesta obtenida | El asistente preparó código en JavaScript, el esquema SQLite, la función para Vercel, el diagrama, las instrucciones y pruebas para el flujo. |
| Qué se aceptó y qué se corrigió | La versión de trabajo conserva un solo guardado y la relación con el evento. La primera interfaz usaba «Acción» y «Resultado» y mostraba un único mensaje general. Se sustituyeron esas etiquetas por las indicadas por la profesora y se conectó el error de comentario con el campo. Se unificaron los valores de acción y resultado para el formulario y el backend. La validación sigue ejecutándose en el servidor. El equipo debe revisar esta implementación y registrar su aprobación o nuevas correcciones. |
| Cómo se verificó | Se ejecutó `npm test` y se enviaron solicitudes HTTP al servidor local. Se reabrió el archivo SQLite para comprobar que el folio correspondía al único registro válido. Se calculó el contraste para el botón principal y se comprobó el texto y código de respuesta del error de comentario. También se verificó localmente que el backend acepta 300 caracteres y rechaza 301. La comprobación en Vercel queda pendiente. |
