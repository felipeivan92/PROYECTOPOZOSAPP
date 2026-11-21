# Sistema de apoyo al monitoreo y trazabilidad de pozos - Equipo 7

## Qué es la solución

La propuesta consiste en una plataforma de apoyo para la revisión de datos de monitoreo de pozos de Codelco Chuquicamata. Su propósito es facilitar la detección oportuna de anomalías, centralizar la información necesaria para revisar cada evento y mantener la trazabilidad de las acciones y tickets asociados.

La solución busca disminuir la revisión manual de grandes volúmenes de datos y presentar al analista información priorizada para apoyar su trabajo. Los datos originales no se modifican automáticamente y la validación humana se mantiene antes de gestionar o enviar un ticket.
### Problema observado

El problema se presenta durante la revisión periódica de los datos de monitoreo de pozos y la preparación de antecedentes asociados a la DGA. El ingeniero o analista de monitoreo de Unisource debe revisar registros provenientes de múltiples pozos, identificar anomalías y relacionarlas con su evidencia y gestión correspondiente.

Cuando una anomalía no se detecta oportunamente, su gestión puede iniciarse fuera del plazo operacional definido para el proceso, generando revisiones posteriores, regularizaciones y mayor dificultad para mantener la trazabilidad de lo ocurrido.

El problema fue identificado a partir de la experiencia directa de un integrante del equipo en el proceso de monitoreo. Al trabajar con información horaria, cada pozo puede generar 24 registros diarios por variable, a los que se suman otras variables, pozos y antecedentes necesarios para revisar cada evento.

### Datos y detección de anomalías

Para el MVP, los datos serán incorporados mediante archivos exportados desde las fuentes de monitoreo, principalmente en formatos CSV o Excel. En esta etapa no se considera necesaria una conexión directa en tiempo real con los sistemas de origen.

Una anomalía corresponde a una condición detectada mediante reglas definidas y verificables sobre los datos. Entre ellas se consideran registros faltantes, valores duplicados, lecturas en cero, superación de umbrales, inconsistencias entre caudal y totalizador y cambios bruscos en las variables monitoreadas.

El sistema identifica y prioriza estas condiciones para facilitar su revisión, pero la validación final y la decisión sobre su gestión permanecen en el responsable del proceso.

### Cómo se evaluará el resultado

Para comprobar si la solución mejora el proceso actual se utilizarán indicadores medibles:

- tiempo requerido para revisar las anomalías de un período;
- porcentaje de anomalías que mantienen evidencia asociada;
- porcentaje de tickets vinculados al evento que los originó;
- tiempo transcurrido entre la detección de una anomalía y su revisión.

Antes de comparar el MVP con el proceso actual se medirá una línea base del tiempo que requiere hoy la revisión manual.

Como meta de diseño, el MVP deberá mantener trazabilidad entre el 100 % de los tickets registrados y la anomalía, pozo, evidencia y gestión que les dieron origen.

### Capas de la solución

La capa dominante es el conocimiento, ya que transforma los datos de monitoreo en anomalías priorizadas que pueden ser revisadas por el analista.

La solución incorpora además una capa de automatización, encargada de aplicar reglas para detectar y clasificar condiciones anómalas sin revisar manualmente todos los registros.

Finalmente, existe una capa de registro que conserva la evidencia, las acciones realizadas, el estado de cada evento y los tickets asociados, permitiendo mantener la trazabilidad de la gestión.

### Qué es un ticket

Un ticket es el registro formal utilizado para gestionar una anomalía que, después de ser revisada por el analista, requiere una acción o seguimiento.

El ticket queda relacionado con el pozo, la fecha del evento, el tipo de anomalía, la evidencia disponible, la gestión realizada y su estado.

El sistema no toma automáticamente la decisión final de generar un ticket. El analista revisa la evidencia y valida previamente si corresponde continuar con la gestión.


## Para quién es

El usuario directo es el ingeniero o analista de monitoreo de Unisource Ingeniería, responsable de revisar los datos de los pozos, analizar las anomalías detectadas y registrar su gestión y trazabilidad.

El receptor de la información es el profesional responsable del control hídrico en el área de Aguas y Relaves de Codelco Chuquicamata, quien utiliza los antecedentes consolidados para apoyar el seguimiento del recurso hídrico y el cumplimiento asociado a la DGA.

El supervisor o jefatura responsable del servicio de monitoreo de Unisource valida las acciones operacionales realizadas sobre los eventos. El acceso y uso de los datos debe mantenerse bajo las autorizaciones definidas por Codelco como responsable de la información monitoreada.



## Cómo se instala y se ejecuta

La PoC permite registrar una gestión sobre un evento de ejemplo, con acción, resultado y comentario, y obtener un folio vinculado al evento. El backend valida la solicitud y permite guardar únicamente cuando el evento tiene respaldo suficiente.

1. Clona este repositorio y abre una terminal en su raíz.
2. Instala Node.js 24. El proyecto usa sus módulos incorporados.
3. Ejecuta `npm run dev` y abre <http://127.0.0.1:3000>. La app crea `aqua-local.sqlite` con dos eventos ficticios. Este modo funciona sin credenciales.
4. Para verificar los casos de backend y persistencia, ejecuta `npm test`.

**Caso exitoso.** Selecciona el evento 7001, elige «Validar evento» y «Sin ticket», escribe «Se revisó la lectura de ejemplo» y presiona «Guardar gestión». La pantalla indica el evento y el folio del registro.

**Caso de error.** Elige el evento 7002. La pantalla muestra «Pendiente» y «Se requieren antecedentes adicionales para continuar». El guardado queda deshabilitado. Los pasos para repetir el rechazo enviando una petición directa al backend y comprobar el almacenamiento están en [la evidencia de arquitectura](docs/arquitectura.md#evidencia).

### Publicación de la PoC

- **Dirección pública en Vercel:** pendiente de incorporar después del despliegue de producción desde `main`.
- **Video de 1 a 2 minutos:** pendiente de incorporar después de probar la dirección de producción. El enlace debe permitir el acceso a la profesora.

Pasos para publicar:

1. Crea una base exclusiva para la demo en [Turso](https://docs.turso.tech/) y ejecuta las sentencias de [src/datos.sql](src/datos.sql) en su consola SQL. El script se puede volver a ejecutar y conserva los registros ya creados.
2. Importa el repositorio en Vercel. Selecciona la raíz del repositorio, el preset `Other`, Node.js 24 y `main` como rama de producción. El archivo `vercel.json` indica dónde están los archivos públicos.
3. En las variables de entorno de Vercel, para **Production**, configura `TURSO_DATABASE_URL` (URL de la base de demo) y `TURSO_AUTH_TOKEN` (token servidor de esa base con permisos de escritura). `.env.example` enumera las variables. El código del navegador no las usa.
4. Una vez integrado el PR de `dev` a `main`, abre el dominio de producción en incógnito. Si pide cuenta de Vercel, revisa la protección de ese despliegue. Prueba en producción el éxito y el error, contrasta el folio con la base y agrega este enlace y el del video al README.

Para el video, muestra la URL abierta en incógnito, guarda una gestión del evento 7001 y muestra su folio. Luego intenta guardar con el comentario vacío para mostrar el error debajo del campo. Puedes cerrar mostrando el bloqueo del evento 7002. Graba la pantalla y explica el recorrido con tu voz.

## En qué estado está

El proyecto se encuentra en una etapa inicial de desarrollo. Actualmente se cuenta con:

- definición del desafío y propuesta de valor;
- alcance preliminar;
- identificación de usuarios y beneficiarios;
- caso de uso principal;
- maqueta digital preliminar;
- roadmap inicial;
- estructura preliminar de datos;
- prototipo navegable de fidelidad media del flujo principal;
- repositorio organizado para continuar el desarrollo.

La PoC del Avance 7 implementa un registro de gestión con una base de demostración. El alcance restante del MVP continúa en diseño.

## Quiénes la desarrollan

Equipo N° 7:

- Omar Carvajal Sepúlveda
- Felipe Hernández Álvarez
- Edgar Romero Sayritupac
- Pablo Urrutia Albornoz

## Avance 4 · Historias de usuario y wireframes

- [Historias de usuario](docs/historias.md)
- [Wireframes del flujo principal](docs/wireframes/)
- [Archivo editable en Figma](https://www.figma.com/design/xj8Y7bch5eofbDyEB6uYeH/WF-15_11_F?node-id=42-288&t=DO14ON8HD4QOk3zK-1)

## Avance 5 · Prototipo navegable y análisis ético

- [Prototipo navegable en Figma](https://www.figma.com/proto/xj8Y7bch5eofbDyEB6uYeH/WF-AquaTrace-AO15112026?node-id=42-288&p=f&t=gDEEILfUkMw6wbEt-0&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=42%3A288&page-id=0%3A1)
- [Documentación del prototipo](docs/prototipo.md)
- [Análisis ético del prototipo](docs/etica.md)
  
## Documentación complementaria

- [Retroalimentación del Avance 3](docs/unidad1/retroalimentacion_avance3.md)
- [Herramientas de la solución](docs/herramientas.md)
- [Roadmap actualizado](docs/roadmap.md)

## Avance 6 · Diseño de prueba de usuarios

- [Diseño de prueba de usuarios](docs/prueba-usuarios.md)
- [Pauta de validación](docs/pauta-validacion.md)

## Avance 7 · Arquitectura y prueba de concepto

- [Diagrama de componentes, camino delgado y casos de prueba](docs/arquitectura.md)
