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

En esta etapa todavía no existe una versión ejecutable de la solución. El proyecto se encuentra en fase de diseño y estructuración inicial.

Cuando se implemente el primer prototipo funcional, esta sección se actualizará con los requisitos, dependencias y pasos necesarios para instalarlo y ejecutarlo.

## En qué estado está

El proyecto se encuentra en una etapa inicial de desarrollo. Actualmente se cuenta con:

- definición del desafío y propuesta de valor;
- alcance preliminar;
- identificación de usuarios y beneficiarios;
- caso de uso principal;
- maqueta digital preliminar;
- roadmap inicial;
- estructura preliminar de datos;
- repositorio organizado para continuar el desarrollo.

Aún no existe un MVP funcional ni una base de datos implementada.

## Quiénes la desarrollan

Equipo N° 7:

- Omar Carvajal Sepúlveda
- Felipe Hernández Álvarez
- Edgar Romero Sayritupac
- Pablo Urrutia Albornoz

## Avance 4 · Historias de usuario y wireframes

- [Historias de usuario](docs/historias.md)
- [Wireframes del flujo principal](docs/wireframes/)
- [Archivo editable en Figma](https://www.figma.com/design/3SF32ZeLEasQa4vD1vjJmT/Avance-4---Wireframe-Proyecto-Pozos---Equipo-7?node-id=0-1&t=b24mgRzqm4I21QIc-1)
  
## Documentación complementaria

- [Retroalimentación del Avance 3](docs/unidad1/retroalimentacion_avance3.md)
- [Herramientas de la solución](docs/herramientas.md)
- [Roadmap actualizado](docs/roadmap.md)
- [Bitácora de uso de IA](docs/bitacora-ia/bitacora_ia.md)
