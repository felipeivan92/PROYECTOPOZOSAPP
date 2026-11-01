# Bitácora inicial de uso de IA

Esta bitácora registra usos reales de un agente de IA realizados durante la preparación del proyecto. El objetivo no es aceptar automáticamente las respuestas, sino dejar evidencia de cómo fueron revisadas y ajustadas por el equipo.

## Uso 1 - Revisión de requisitos del Avance 3

**Objetivo:** Identificar los archivos, carpetas y condiciones que debía cumplir el repositorio de GitHub para el Avance 3.

**Instrucción entregada:** Se adjuntaron las instrucciones oficiales del Avance 3 y se solicitó revisar qué debía prepararse para la entrega.

**Respuesta obtenida:** La IA organizó los requisitos en una lista de verificación: repositorio con ramas `main` y `dev`, estructura mínima de carpetas, README principal, entregables de la Unidad 1, bitácora de IA, archivo de estructura de datos, `.gitignore` y `.env.example`.

**Qué se aceptó y qué se corrigió:** Se aceptó la estructura general porque coincidía con las instrucciones. Se mantuvo explícitamente que en esta etapa no se debe inventar una aplicación ejecutable ni implementar todavía la base de datos. Además, se verificó que el trabajo debe pasar desde `dev` a `main` mediante pull request y que deben existir commits de más de un integrante.

**Cómo se verificó:** Se comparó punto por punto la propuesta con el documento oficial del Avance 3 antes de preparar los archivos.

---

## Uso 2 - Diseño preliminar de la estructura de datos

**Objetivo:** Proponer las entidades principales de la base de datos a partir del caso de uso ya definido por el equipo.

**Instrucción entregada:** Se adjuntó el archivo del Avance 2 para que la propuesta de datos se construyera desde el caso de uso y no desde supuestos externos al proyecto.

**Respuesta obtenida:** La IA propuso como entidades principales `USUARIO`, `POZO`, `DATO_MONITOREO`, `EVENTO`, `EVIDENCIA`, `GESTION` y `TICKET`, además de relaciones entre ellas.

**Qué se aceptó y qué se corrigió:** Se aceptaron las entidades porque representan conceptos que aparecen en el caso de uso. Se decidió usar una sola entidad `EVENTO` con el campo `tipo_anomalia`, en vez de mantener `EVENTO` y `ANOMALIA` como tablas separadas, para evitar duplicar información. También se mantuvo `GESTION` separada de `EVENTO` para conservar un historial de acciones realizadas. El equipo aclaró además que las páginas 1 y 2 del archivo corresponden al Avance 1 y las páginas restantes al Avance 2.

**Cómo se verificó:** Se revisó que cada entidad tuviera relación directa con el flujo del caso de uso: consultar eventos, revisar el pozo y su evidencia, validar la condición, registrar la gestión y asociar un ticket cuando corresponda.

---

## Uso 3 - Preparación de archivos del repositorio

**Objetivo:** Dejar una primera versión ordenada de los archivos necesarios para subir el Avance 3 a GitHub.

**Instrucción entregada:** Se solicitó preparar los archivos necesarios usando como base las instrucciones del Avance 3 y los avances ya desarrollados por el Equipo 7.

**Respuesta obtenida:** Se generaron el README principal, el README de `src/`, la bitácora de IA, el archivo `estructura_datos.md`, `.gitignore` y `.env.example`.

**Qué se aceptó y qué se corrigió:** Se mantuvo una estructura mínima y fácil de explicar, evitando agregar archivos que no fueran necesarios. No se incorporaron claves reales ni credenciales. La estructura de datos quedó declarada como preliminar, ya que la implementación de la base de datos corresponde a una etapa posterior.

**Cómo se verificó:** Se contrastó la carpeta final con los requisitos indicados en las instrucciones del Avance 3 y se revisó que todas las subcarpetas tuvieran contenido versionable.

## Uso 4 - Incorporación de retroalimentación docente

### Objetivo
Analizar la retroalimentación recibida en el Avance 1 e identificar qué mejoras debían incorporarse al desarrollo actual del proyecto.

### Instrucción entregada
Se proporcionó la retroalimentación entregada por la profesora y se solicitó compararla con el README, el caso de uso y la estructura de datos ya desarrollada, con el objetivo de identificar qué aspectos debían precisarse o corregirse.

### Respuesta obtenida
Se propuso precisar quién experimenta directamente el problema, en qué momento ocurre y cuáles son sus consecuencias. También se recomendó incorporar evidencia del problema, definir roles más específicos, explicar cómo ingresan los datos al sistema y establecer de manera clara qué condiciones son consideradas anomalías.

### Qué se aceptó y qué se corrigió
El equipo aceptó incorporar estas mejoras en la documentación actual del proyecto. Se actualizaron el README y la estructura preliminar de datos, incorporando el origen de los datos, el criterio de detección de anomalías y una definición más precisa de los actores involucrados.

Se decidió mantener sin modificaciones los documentos correspondientes a avances ya evaluados, de manera de conservar el historial del proyecto y evidenciar su evolución.

### Cómo se verificó
Los cambios se compararon con la retroalimentación entregada por la profesora y con el caso de uso definido en el Avance 2. Además, se revisó que las modificaciones no alteraran el alcance previamente establecido y que mantuvieran coherencia con la solución propuesta.

## Uso 5 - Incorporación de retroalimentación del Avance 3

### Objetivo
Analizar la retroalimentación recibida en el Avance 3 e identificar qué mejoras debían incorporarse al desarrollo actual del MVP.

### Instrucción entregada
Se proporcionó la retroalimentación de la profesora y se solicitó contrastarla con el contenido actual del repositorio, incluyendo README, estructura de datos, documentación del proyecto y flujo de pantallas.

### Respuesta obtenida
Se identificaron aspectos que debían precisarse, entre ellos la definición de indicadores medibles, la separación de las capas de conocimiento, automatización y registro, la documentación de las herramientas utilizadas y la priorización de funciones dentro del roadmap.

También se verificó qué observaciones ya habían sido incorporadas en avances posteriores, evitando modificar elementos que ya estaban correctamente resueltos.

### Qué se aceptó y qué se corrigió
El equipo decidió mantener las mejoras ya implementadas y agregar únicamente los elementos pendientes.

Se incorporaron indicadores para evaluar el MVP, se precisaron las capas de la solución, se documentaron las herramientas según su función y se reorganizó el roadmap de acuerdo con la importancia de cada funcionalidad.

### Cómo se verificó
Cada modificación fue contrastada con la retroalimentación docente y con los archivos actualmente versionados en GitHub, verificando que los cambios mantuvieran coherencia con el caso de uso y el alcance definido para el proyecto.


## Uso 6 - Revisión final del modelo y trazabilidad

### Objetivo

Hacer una última revisión del modelo de datos después de aplicar las observaciones de la profesora, la idea era comprobar que los ejemplos fueran coherentes entre sí y que se pudiera seguir un caso completo desde la medición de un pozo hasta la generación de un ticket.

### Prompt utilizado

Revisa nuestro proyecto PROYECTOPOZOSAPP después de las correcciones realizadas a partir de la retroalimentación de la profesora.

Queremos comprobar que el modelo de datos y los ejemplos sean coherentes de principio a fin, recorre un caso desde el pozo y su medición, pasando por el límite utilizado para detectar la anomalía, el evento, la evidencia y la gestión, hasta llegar al ticket.

Revisa especialmente las tablas POZO, UMBRAL, DATO_MONITOREO, EVENTO, EVIDENCIA, GESTION y TICKET.

Comprueba que:

- los límites utilizados para detectar anomalías estén realmente almacenados;
- una evidencia pueda registrarse aunque el problema sea un dato faltante;
- la decisión de generar un ticket ocurra después de la revisión del analista;
- los estados del evento sean coherentes con las gestiones y tickets existentes;
- los valores usados en los ejemplos coincidan con las listas definidas;
- los dos casos de ejemplo cuenten la misma historia en todas las tablas;
- desde un ticket sea posible reconstruir qué pozo, anomalía, evidencia y gestión le dieron origen.

No cambies automáticamente el modelo, mas bien indica primero las inconsistencias que encuentres y explica de forma simple por qué deberían corregirse. No inventes datos que no estén respaldados por los archivos del proyecto.

### Qué nos respondió la IA

La revisión mostró que los dos ejemplos ya se podían seguir prácticamente de principio a fin.

En el primer caso se pudo relacionar el pozo 101 con su límite de caudal de 0,60 L/s, una medición de 0,72 L/s, el evento de sobreflujo, la evidencia utilizada, la gestión realizada y el ticket generado.

En el segundo caso se revisó un dato faltante. Como la lectura de las 10:00 no existe, la evidencia puede registrar directamente esa ausencia sin tener que apuntar a un dato que no existe.

También aparecieron algunos detalles menores que todavía no coincidían entre sí, principalmente nombres utilizados en los ejemplos, una relación del modelo y una referencia antigua a `requiere_ticket` en la documentación de los wireframes.

### Qué aceptamos o corregimos

No aplicamos todo automáticamente. Primero revisamos si las observaciones tenían sentido con el modelo que ya habíamos definido.

Se corrigió el nombre Sobreflujo de caudal para utilizar el mismo término en todo el modelo.

También se ajustó la relación entre DATO_MONITOREO y EVIDENCIA, ya que en un caso de dato faltante puede existir una evidencia aunque no exista un registro de monitoreo asociado.

Además, se eliminó de la documentación de los wireframes una referencia antigua a `requiere_ticket`, porque después de las correcciones la decisión de generar un ticket queda asociada a la revisión y gestión realizada por el analista.

### Cómo lo comprobamos

Para revisar que las tablas realmente estuvieran relacionadas, seguimos manualmente los dos ejemplos.

Primer caso:

POZO 101 → UMBRAL 3001 → DATO_MONITOREO 5001 → EVENTO 7001 → EVIDENCIA 8001 → GESTION 8501 → TICKET 9001

Segundo caso:

POZO 102 → lectura esperada de las 10:00 ausente → EVENTO 7002 → EVIDENCIA 8002 sin id_dato → GESTION 8502 → TICKET 9002

Con este recorrido pudimos comprobar que desde el ticket se puede volver al evento que lo originó y desde ahí identificar el pozo, la evidencia y la gestión realizada.
