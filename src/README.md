# Código de la prueba de concepto

- `public/` contiene el formulario, sus estilos y el código que ejecuta el navegador.
- `gestion.mjs` valida la solicitud en el servidor y guarda la decisión.
- `datos.sql` define la base y carga dos eventos ficticios.
- `local.mjs` permite ejecutar el flujo con Node.js y SQLite local.
- `gestion.test.mjs` reproduce el guardado, los rechazos y el reintento.

El punto de entrada de Vercel está en `../api/gestion.mjs`. Para iniciar la PoC, sigue el [README principal](../README.md).
