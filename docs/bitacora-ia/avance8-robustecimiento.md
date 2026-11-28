# Bitácora de IA - Avance 8

## Robustecimiento funcional de Aqua Trace

**Responsable:** Omar Carvajal
**Equipo:** 7
**Rama de trabajo:** avance8/robustecimiento
**Fecha de la sesión:** 28 de noviembre de 2026
**Herramienta de IA:** Claude (Anthropic), con acceso de lectura al repositorio y a la pestaña de GitHub del responsable
**Estado:** En desarrollo.

## 1. Objetivo

Robustecer la operación sobre el objeto GESTION: crear, consultar, actualizar el estado y anular con baja lógica, con validaciones en tres capas y estados de interfaz. El alcance se limita a esa operación y no se amplía a toda la plataforma.

## 2. Instrucciones entregadas a la IA

### Instrucción 1: encargo inicial

**Contexto entregado:** documento de contexto con el proyecto, el repositorio, la distribución del equipo, la organización de ramas, el trabajo ya realizado por Felipe Hernández, las tablas de Supabase, la matriz de permisos propuesta, las reglas funcionales, los archivos bajo responsabilidad de cada integrante, las restricciones visuales y la verificación solicitada.

**Intención:** revisar en modo de solo lectura las ramas dev y avance8/seguridad, contrastar el código con el encargo, identificar el trabajo de Felipe y guiar la creación de la rama avance8/robustecimiento y de docs/robustecimiento.md, en particular la tabla de validaciones.

**Restricciones indicadas:**

- No modificar main, Supabase ni Vercel sin coordinación previa.
- No sobrescribir ni reemplazar el trabajo de Felipe.
- No crear otro sistema de autenticación ni otra base de datos remota.
- No solicitar contraseñas, tokens ni claves secretas.
- Detener la implementación definitiva del CRUD hasta coordinar la matriz de permisos, las reglas de validación y el contrato de integración.
- No inventar resultados, pruebas ejecutadas ni aprobaciones del equipo.

**Verificación solicitada:** revisar el resultado en GitHub después de cada commit y no registrar como aprobada ninguna prueba no ejecutada.

### Instrucciones siguientes

Las instrucciones siguientes fueron breves y dependían del contexto anterior. Se transcriben por su contenido:

| N.º | Instrucción del responsable | Intención |
| --- | --- | --- |
| 2 | Pedido de redactar el mensaje a Felipe para coordinar. | Obtener los puntos que había que acordar antes del CRUD. |
| 3 | Autorización para crear la rama y los archivos desde su sesión de GitHub. | Que la IA creara avance8/robustecimiento y docs/robustecimiento.md. |
| 4 | Consulta sobre si debía levantar un PR. | Saber cuándo corresponde integrar la rama en dev. |
| 5 | Pedido de redactar el mensaje para el grupo. | Informar el avance y solicitar decisiones. |
| 6 | Informó que el equipo estaba de acuerdo con lo propuesto y pidió avanzar. | Pasar de la revisión a la implementación. |
| 7 | Pidió el mensaje a Felipe para continuar. | Obtener las definiciones sobre persistencia, esquema, pantalla y CI. |
| 8 | Pegó la respuesta de Felipe: esquema versionado en avance8/seguridad/db/001_esquema_inicial.sql, implementar REST con pruebas simuladas, y no enviar id_usuario, fecha_hora, estado inicial ni campos de auditoría. | Implementar la capa REST respetando lo que asigna la base. |
| 9 | Preguntó qué le faltaba y si podía pasar la posta a Edgar o Pablo. | Determinar el estado real antes del traspaso. |
| 10 | Pidió avanzar con la documentación y dejar el mensaje para el grupo. | Completar esta bitácora y actualizar docs/robustecimiento.md. |
| 11 | Adjuntó la confirmación de Felipe Hernández para la integración, con ajustes a implementar: conteo de caracteres Unicode, rango de id_evento, resumen operativo, idempotencia con on_conflict y cambio del script de pruebas y del flujo de CI. | Aplicar los ajustes en el código, las pruebas y el CI. |
| 12 | Pegó el estado de Avance 8 que Felipe publicó al cierre del día: autenticación, autorización, RLS y panel privado listos, con 24 pruebas automáticas y 26 comprobaciones SQL aprobadas, según él informó. Le asignó a Omar conectar la API a Supabase, la interfaz CRUD, los estados de interfaz y las validaciones, y pidió no cambiar main ni usar la API antigua de Turso para registrar gestiones de prueba. | Integrar la rama de seguridad, conectar la API, construir la interfaz y actualizar la documentación. |

## 3. Respuesta obtenida

### Revisión de solo lectura

La IA leyó las ramas main, dev y avance8/seguridad directamente en GitHub y entregó:

- Dev está dos commits por delante de main, y solo agrega docs/permisos.md.
- Avance8/seguridad está 18 commits por delante de dev, todos de Felipe, y agrega autenticación, sesión, pruebas, workflow y bitácora.
- La rama avance8/robustecimiento no existía.
- El archivo src/private/panel.html, que lee api/panel.mjs, no existía en ninguna rama.
- src/gestion.mjs ejecuta SQL contra Turso, mientras que src/supabase.mjs solo admite rutas REST, por lo que ambas capas no son compatibles entre sí.
- El esquema local (src/datos.sql) no tenía varias columnas de las tablas de Supabase.
- No existía una ruta de consulta, necesaria para la prueba de registro inexistente.
- El workflow de GitHub Actions solo se ejecuta en pushes a avance8/seguridad.

### Código y documentos producidos

| Commit | Archivo | Contenido |
| --- | --- | --- |
| `9441a59` | docs/robustecimiento.md | Borrador con alcance, CRUD, tabla de validaciones, estados y plan de pruebas. |
| `1468009` | src/gestion.mjs | Funciones validarCreacion, validarTransicion y autorizar, sin cambiar los mensajes del Avance 7. |
| `a472f97` | src/gestion.test.mjs | Seis pruebas nuevas, además de las dos existentes. |
| `3aa34cb` | src/gestion-rest.mjs | Capa REST para crear, consultar, actualizar y anular. |
| `12e823b` | src/gestion-rest.test.mjs | Trece pruebas con Supabase simulado. |
| `f94a956` | docs/robustecimiento.md | Actualización con el estado real y las pruebas automáticas ejecutadas. |
| `e3dd319` | src/gestion.mjs | Conteo de caracteres Unicode, rango de id_evento y permiso de resumen. |
| `593e37b` | src/gestion-rest.mjs | Idempotencia con on_conflict, verificación de que el folio pertenece al usuario y resumen operativo. |
| `1abd58f` | package.json | El script de pruebas ejecuta todas las suites. |
| `049b53a` | .github/workflows/pruebas-robustecimiento.yml | Flujo de Actions que ejecuta `npm test`. |
| `0a1c487` | src/gestion.test.mjs | Pruebas de límites Unicode, rango de id_evento y permiso de resumen. |
| `779a5c2` | src/gestion-rest.test.mjs | Pruebas de idempotencia, propiedad del folio, Unicode y resumen. |
| `37b3985` | Fusión del PR n.º 23 | Incorpora a esta rama el trabajo de avance8/seguridad, sin modificar esa rama. |
| `41a9040` y `1efba11` | src/gestion-rest.mjs y su prueba | La lista informa el rol del usuario. |
| `35b70b9` y `813c50d` | api/gestion.mjs y src/api-gestion.test.mjs | Conecta la API a Supabase con la autorización compartida, y prueba que sin sesión responde 401. |
| `2dd01ea`, `79e12b5` y `a16cf94` | src/public/estilo.css, src/private/panel.html y src/public/app.js | Interfaz del listado, cierre, anulación y estados de pantalla. |

## 4. Elementos aceptados y corregidos

### Decisiones aceptadas

- Crear la rama desde dev, sin tocar main.
- No modificar api/gestion.mjs, src/public/index.html, vercel.json ni package.json, porque requieren coordinación con Felipe.
- Mantener los mensajes de validación del Avance 7 y agregar mensajes nuevos solo para las operaciones nuevas.
- Inyectar el acceso a Supabase y la identificación del usuario, con la misma firma que solicitarSupabase, para probar sin red y conectar después.
- No enviar id_usuario, fecha_hora, estado inicial ni campos de auditoría, porque los asigna la base.
- Usar un filtro por estado actual al actualizar, para no pisar un cambio simultáneo.
- No permitir DELETE: la baja es siempre lógica.
- La matriz de permisos y las rutas propuestas se consideraron aprobadas por el equipo, según informó el responsable. La IA no pudo verificar esa aprobación.
- Contar los límites de texto en caracteres Unicode, igual que `char_length` de PostgreSQL, y acotar id_evento al rango INTEGER (ajuste pedido por Felipe Hernández).
- Fusionar avance8/seguridad en esta rama mediante el PR n.º 23, con un commit de fusión y sin eliminar la rama de Felipe. La IA tomó esa decisión sin una consulta puntual, a partir de que el responsable pidió seguir con la integración. Queda pendiente que Omar y Felipe la confirmen.
- Conectar api/gestion.mjs a Supabase con identificar, origenPermitido y solicitarSupabase, lo que retira Turso de esa ruta.
- Informar el rol en la respuesta de la lista para que la interfaz muestre solo las acciones permitidas. El servidor y la base siguen validando cada operación.
- Usar un tope duro de 600 unidades en los campos de texto y validar los 300 caracteres reales con un script, porque maxlength cuenta unidades UTF-16.
- Verificar la interfaz con un navegador automatizado contra un servidor local con Supabase simulado, y no con credenciales reales.

### Correcciones realizadas durante el trabajo

- Un primer script de reindentación reemplazó un bloque equivocado de src/gestion.mjs y dejó un error de sintaxis. Se restauró el archivo desde Git y se reescribió completo antes de continuar.
- Un primer intento de agregar pruebas a src/gestion.test.mjs insertó el texto en el lugar equivocado del editor de GitHub. Se descartó el borrador sin guardar y se repitió.
- Un primer intento de actualizar docs/robustecimiento.md sumó el texto nuevo al antiguo en lugar de reemplazarlo. Se descartó sin guardar y se repitió.
- El acceso de escritura al repositorio desde el entorno de la IA no estuvo disponible. Los archivos se subieron desde la sesión de GitHub del responsable, y después se comprobó que el contenido publicado coincide con el probado mediante el hash SHA-256.
- Dos mensajes de la tabla de validaciones, `La transición de estado no está permitida.` y `Escribe el motivo de la anulación.`, fueron propuestos por la IA. Se implementaron como tales y, al no existir antes, no corresponden a texto del Avance 7. Se agregó también `Usa un motivo válido de hasta 300 caracteres.`
- Una prueba falló porque el simulador contaba unidades UTF-16 y no caracteres. Se corrigió el simulador para que cuente como PostgreSQL.
- Varios comandos del navegador fallaron en la extensión y un intento escribió el mensaje de commit en la barra de búsqueda de GitHub. No hubo cambios en el repositorio. Se repitió con la página ya cargada.
- El flujo de Actions falló en el commit intermedio `41a9040`: la API ya informaba el rol, pero la prueba correspondiente se subió en el commit siguiente. El commit siguiente lo corrigió.
- En la primera ejecución del navegador automatizado hubo cuatro comprobaciones fallidas por errores del guion de prueba, no de la interfaz: el campo recorta 301 emojis a 300 por su tope de 600 unidades, Playwright no trata un fieldset como deshabilitado, y Chrome registra como error de consola las respuestas 503 provocadas a propósito. Se corrigió el guion y se repitió completo. Una dirección con el nombre de usuario mal escrito en una navegación se corrigió sin efecto.

### Limitaciones identificadas

- Nada se verificó con Supabase real ni en Vercel. Todo se probó con un Supabase simulado.
- La prueba de doble envío del servidor se ejecuta sobre SQLite en forma secuencial, por lo que no demuestra concurrencia real. El doble clic sí se ejercitó en el navegador automatizado.
- La falla de conexión se simuló en un servidor local, no cortando una red real.
- El servidor local y el guion del navegador automatizado no están en el repositorio.
- No se ingresaron credenciales y el inicio de sesión real no se ejercitó.
- La función resumen_gestiones debe existir en la base real para que el resumen funcione.
- Las pruebas no sustituyen las pruebas independientes de Edgar Romero y Pablo Urrutia.

## 5. Método de verificación

### Verificaciones reproducibles

1. Clonar la rama avance8/robustecimiento.
2. Ejecutar `npm test` con Node 22 o superior.

### Resultados registrados

| Verificación | Resultado |
| --- | --- |
| Línea base antes de modificar el código (`npm test`) | 2 pruebas ejecutadas, 2 aprobadas. |
| Código sobre un clon limpio del commit `12e823b` (versión anterior) | 21 pruebas ejecutadas, 21 aprobadas. |
| Código final sobre un clon limpio del commit `a16cf94` (Node 22) | 54 pruebas ejecutadas, 54 aprobadas: 24 de seguridad, 28 de gestión y 2 del cableado de la API. |
| GitHub Actions, flujo Pruebas de robustecimiento, sobre `a16cf94` (Node 24) | Terminó con éxito. Falló una vez, en el commit intermedio `41a9040`. |
| Navegador automatizado (Chrome con Playwright) contra un servidor local con Supabase simulado | 58 comprobaciones ejecutadas, 58 aprobadas, después de corregir el guion. |
| Comprobación de las pruebas: se introdujeron a propósito tres errores en la versión anterior de los ajustes | Las pruebas los detectaron. Se restauró el código. |
| Comprobación de las pruebas: se introdujo a propósito el envío de id_usuario | 10 pruebas fallaron y 3 pasaron. Se restauró el código. |
| Comprobación de las pruebas: se quitó el control de cambios simultáneos | 1 prueba falló y 12 pasaron. Se restauró el código. |
| Contenido publicado en GitHub frente al archivo probado | Los hashes SHA-256 coinciden en los archivos de código del primer envío y en los siete archivos subidos en la etapa de interfaz (api/gestion.mjs, src/gestion-rest.mjs, src/gestion-rest.test.mjs, src/api-gestion.test.mjs, src/private/panel.html, src/public/app.js y src/public/estilo.css). |

Las ejecuciones de `npm test` se hicieron en el entorno de la IA y son reproducibles con los pasos anteriores. La del navegador automatizado no es reproducible desde el repositorio, porque el servidor y el guion no están en él.

### Pruebas de robustez de la pauta

Las cinco pruebas de robustez no se han ejecutado sobre la aplicación integrada, es decir, sobre Vercel con Supabase real. El detalle de las comprobaciones del servidor y del navegador automatizado figura en docs/robustecimiento.md, sección 7. No se registran como aprobadas las pruebas sobre la aplicación integrada.

### Revisión humana

Pendiente de registrar por el responsable: qué partes del código y de la documentación revisó y qué modificó. Esta bitácora no declara esa revisión.

## 6. Actividades pendientes

- Que Felipe Hernández verifique la vista previa desplegada en Vercel con Supabase real y sesiones de Analista y Supervisor, y confirme que la función resumen_gestiones está creada.
- Confirmar con Felipe y con el equipo la fusión del PR n.º 23 en esta rama.
- Abrir el PR hacia dev cuando lo anterior esté probado.
- Pruebas independientes sobre la versión integrada (Edgar Romero y Pablo Urrutia).
- Decidir si el servidor local y el guion del navegador automatizado se incorporan al repositorio.
- Registrar la revisión humana de Omar Carvajal.
