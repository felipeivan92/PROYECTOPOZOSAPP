# Diseño de prueba de usuarios · Aqua Trace

## 1. Objetivo, hipótesis y alcance

### Pregunta

¿Las personas usuarias comprenden y logran completar el flujo principal de revisión y gestión de anomalías en Aqua Trace sin recibir instrucciones sobre qué botones utilizar o qué recorrido seguir?

### Hipótesis

Creemos que una persona con experiencia en monitoreo de datos podrá identificar una anomalía priorizada, revisar sus antecedentes y registrar correctamente la gestión del evento.

Lo sabremos cuando al menos 4 de 5 personas del perfil usuario completen cada una de las tareas principales sin ayuda y dentro de los tiempos definidos antes de realizar la prueba.

Además, al finalizar la sesión se aplicará el cuestionario SUS para conocer la percepción general de facilidad de uso. Como medida complementaria de satisfacción se utilizará el cuestionario SUS al finalizar la sesión.

### Alcance

La prueba busca comprobar si el flujo principal del prototipo se entiende y puede recorrerse correctamente.

Durante la prueba se observará si la persona logra:

1 identificar qué evento requiere atención
2 revisar la información y evidencia disponible
3 decidir qué corresponde hacer con el caso
4 registrar la gestión realizada
5 reconocer posteriormente qué ocurrió con el evento.

Esta prueba no permite comprobar que Aqua Trace funcione técnicamente, que las reglas de detección calculen correctamente las anomalías, que exista una conexión real con DGA o LI-COR ni que los tickets sean enviados efectivamente a otro sistema.

La prueba se realizará utilizando el prototipo navegable.

---

## 2. Tareas, métricas y umbral

### Tarea 1 · Identificar qué evento revisar primero

**HU asociada:** HU-02 · Visualizar anomalías priorizadas.

**Escenario:**  
Estás comenzando una revisión de monitoreo y existen varios eventos detectados. Necesitas identificar cuál requiere atención primero.

**Objetivo:**  
Identificar el evento que debería revisarse primero y acceder a sus antecedentes.

**Criterio de éxito observable:**  
La persona identifica un evento de prioridad alta y accede a sus antecedentes sin recibir ayuda del facilitador.

**No revelar:**  
No se indica qué opción seleccionar, dónde hacer clic ni qué pantalla debe abrir.

**Umbral:**  
Al menos 4 de 5 personas del perfil usuario completan la tarea sin ayuda en un máximo de 2 minutos.

---

### Tarea 2 · Revisar los antecedentes disponibles

**HU asociada:** HU-01 · Revisar y validar una anomalía.

**Escenario:**  
Durante la revisión de un evento necesitas comprobar los antecedentes disponibles antes de decidir qué corresponde hacer con el caso.

**Objetivo:**  
Revisar la evidencia disponible y tomar una decisión a partir de la información encontrada.

**Criterio de éxito observable:**  
La persona revisa los antecedentes disponibles e identifica correctamente si existe respaldo suficiente para continuar con la gestión. Si la información no es suficiente, reconoce que el caso debe mantenerse pendiente sin generar una gestión o ticket.

**No revelar:**  
No se indica si los antecedentes son suficientes o insuficientes, qué opción debe utilizar ni cuál es el recorrido esperado.

**Umbral:**  
Al menos 4 de 5 personas del perfil usuario completan la tarea sin ayuda en un máximo de 3 minutos.

---

### Tarea 3 · Registrar una gestión y comprobar su trazabilidad

**HU asociadas:** HU-03 · Registrar el resultado de la revisión y HU-04 · Verificar el cierre y la trazabilidad.

**Escenario:**  
Terminaste de revisar un evento y necesitas dejar registrada la decisión tomada para mantener la trazabilidad del caso.

**Objetivo:**  
Registrar el resultado de la revisión y comprobar posteriormente que la gestión quedó asociada al evento.

**Criterio de éxito observable:**  
La persona registra una acción, un resultado y un comentario coherentes con el caso y logra comprobar posteriormente que el evento y su gestión quedaron relacionados.

**No revelar:**  
No se indican los botones que debe utilizar, el orden de las pantallas ni el recorrido que debe seguir.

**Umbral:**  
Al menos 4 de 5 personas del perfil usuario completan la tarea sin ayuda en un máximo de 4 minutos.

---

### Métricas generales de la prueba

La prueba considerará tres tipos de métricas:

- **Eficacia:** se registrará si la persona logra completar o no cada tarea sin ayuda.
- **Eficiencia:** se registrará el tiempo utilizado, las ayudas solicitadas y los desvíos observados durante cada tarea.
- **Satisfacción:** se evaluará al finalizar la sesión mediante el cuestionario SUS.

Como criterio previo a la prueba, se considerará satisfactorio que al menos 4 de 5 personas del perfil usuario completen cada tarea sin ayuda y dentro del tiempo definido.

Además, el resultado del cuestionario SUS se calculará en una escala de 0 a 100. Como criterio definido por el equipo para esta prueba, se considerará satisfactorio obtener un promedio igual o superior a 70 puntos.

### Cálculo del cuestionario SUS

El cuestionario SUS contiene 10 afirmaciones. Cada una se responde utilizando una escala de 1 a 5:

| Respuesta | Significado |
|---:|---|
| 1 | Totalmente en desacuerdo |
| 2 | En desacuerdo |
| 3 | Ni de acuerdo ni en desacuerdo |
| 4 | De acuerdo |
| 5 | Totalmente de acuerdo |

Para obtener el puntaje SUS, las respuestas no se suman directamente.

En las preguntas impares (1, 3, 5, 7 y 9), al valor respondido se le resta 1.

**Puntaje = respuesta - 1**

En las preguntas pares (2, 4, 6, 8 y 10), el valor respondido se resta de 5.

**Puntaje = 5 - respuesta**

De esta manera, cada pregunta aporta entre 0 y 4 puntos.

| Respuesta | Pregunta impar | Pregunta par |
|---:|---:|---:|
| 1 | 0 | 4 |
| 2 | 1 | 3 |
| 3 | 2 | 2 |
| 4 | 3 | 1 |
| 5 | 4 | 0 |

Una vez obtenidos los puntos de las 10 preguntas, se suman y el resultado se multiplica por 2,5.

**SUS = suma de los puntos x 2,5**

El resultado final queda expresado entre 0 y 100 puntos.

### Ejemplo de cálculo

Si una persona responde:

| Pregunta | Respuesta | Puntaje obtenido |
|---:|---:|---:|
| 1 | 4 | 3 |
| 2 | 2 | 3 |
| 3 | 4 | 3 |
| 4 | 2 | 3 |
| 5 | 4 | 3 |
| 6 | 2 | 3 |
| 7 | 4 | 3 |
| 8 | 2 | 3 |
| 9 | 4 | 3 |
| 10 | 2 | 3 |

La suma de los puntajes es:

**30 puntos**

Luego:

**30 x 2,5 = 75 puntos SUS**

En este ejemplo, el participante obtiene un resultado SUS de **75 puntos**.

### Criterio general de la prueba

La eficacia se medirá según la cantidad de tareas completadas sin ayuda.

La eficiencia se registrará mediante el tiempo utilizado en cada tarea, las ayudas solicitadas y los desvíos observados.

Una tarea se considerará validada cuando al menos 4 de 5 personas del perfil usuario logren completarla sin ayuda y dentro del tiempo definido previamente.

La satisfacción se evaluará mediante el cuestionario SUS al finalizar la sesión. El resultado SUS se registrará en una escala de 0 a 100 puntos utilizando el procedimiento explicado anteriormente.

## 3. Perfiles y reclutamiento

| Perfil | Usuario o stakeholder | N.º | Cómo se contactará | Por qué representa al perfil |
|---|---|---:|---|---|
| Analista o ingeniero de monitoreo de datos operacionales | Usuario | 5 | Mediante contactos profesionales del equipo con personas que realicen funciones de revisión y análisis de datos de monitoreo. Si no es posible acceder a la organización relacionada con el proyecto, se buscarán profesionales con funciones equivalentes. | Corresponde al perfil que utilizaría directamente Aqua Trace para revisar anomalías, analizar evidencia y registrar una gestión. |
| Supervisor o jefatura de monitoreo, aguas o procesos operacionales | Stakeholder | 5 | Mediante contactos profesionales del equipo y, cuando corresponda, previa autorización de la organización. | Representa a quien supervisa el proceso y puede aportar restricciones, criterios de adopción y necesidades de trazabilidad. |
| Personal operativo de terreno relacionado con pozos, instrumentación o monitoreo | Stakeholder / perfil excluido | 5 | Mediante contactos laborales o profesionales con personas que desarrollen funciones equivalentes de terreno. | Este perfil fue identificado anteriormente como quien queda fuera del uso directo de Aqua Trace. Su participación permite revisar si existe información de terreno que podría quedar fuera del flujo digital. |

### Criterios de reclutamiento

No se utilizarán únicamente compañeros del curso como participantes.

Las personas invitadas deberán tener experiencia real o reciente en actividades relacionadas con monitoreo, revisión de datos, supervisión operacional o trabajo de terreno asociado a procesos industriales.

Si no es posible acceder a personas de la organización relacionada con el proyecto, se podrán invitar profesionales que realicen la misma función o una función equivalente en otra organización.

Los nombres, teléfonos, correos y otros datos personales utilizados durante el reclutamiento no se incorporarán al repositorio. Los participantes serán identificados únicamente mediante códigos.

Las tareas de usabilidad se aplicarán principalmente al perfil usuario. Los stakeholders serán consultados principalmente por restricciones del proceso, condiciones de adopción y situaciones que el flujo pueda no representar correctamente.

---

## 5. Plan de levantamiento de feedback

### Sesiones planificadas

Se planifican 15 instancias en total:

- 5 sesiones con analistas o ingenieros de monitoreo;
- 5 consultas con supervisores o jefaturas;
- 5 consultas con personal operativo de terreno o personas con funciones equivalentes.

Cada instancia tendrá una duración máxima de 20 minutos.

### Roles durante las sesiones

En cada sesión existirán tres funciones:

**Facilitador:** será la única persona del equipo que hablará directamente con el participante. Leerá las instrucciones y evitará explicar cómo utilizar la interfaz.

**Registrador:** observará la sesión y anotará tiempos, ayudas solicitadas, desvíos, dificultades y comentarios relevantes sin intervenir.

**Responsable de evidencia:** verificará que la grabación y la planilla de registro sean guardadas correctamente y que el acceso quede restringido.

Los integrantes del equipo se irán rotando entre estas funciones.

| Sesión | Perfil | Facilita | Registra | Resguarda evidencia |
|---|---|---|---|---|
| U01 | Usuario | Integrante A | Integrante B | Integrante C |
| U02 | Usuario | Integrante B | Integrante C | Integrante D |
| U03 | Usuario | Integrante C | Integrante D | Integrante A |
| U04 | Usuario | Integrante D | Integrante A | Integrante B |
| U05 | Usuario | Integrante A | Integrante C | Integrante D |
| S01 | Supervisor | Integrante B | Integrante D | Integrante A |
| S02 | Supervisor | Integrante C | Integrante A | Integrante B |
| S03 | Supervisor | Integrante D | Integrante B | Integrante C |
| S04 | Supervisor | Integrante A | Integrante B | Integrante D |
| S05 | Supervisor | Integrante B | Integrante C | Integrante A |
| T01 | Terreno | Integrante C | Integrante D | Integrante B |
| T02 | Terreno | Integrante D | Integrante A | Integrante C |
| T03 | Terreno | Integrante A | Integrante C | Integrante B |
| T04 | Terreno | Integrante B | Integrante D | Integrante C |
| T05 | Terreno | Integrante C | Integrante A | Integrante D |

### Registro de la sesión

Cuando exista consentimiento, se grabará:

- la pantalla utilizada durante la prueba;
- la voz de la persona participante.

No se grabará el rostro.

La grabación se utilizará solamente para revisar posteriormente el recorrido realizado, las dificultades observadas y los momentos en que la persona necesitó ayuda.

### Resguardo de la evidencia

Las grabaciones y antecedentes identificables se almacenarán en una carpeta del curso en Google Drive con acceso restringido.

Las grabaciones no se subirán ni se enlazarán públicamente desde GitHub.

Se conservarán hasta 30 días después de finalizar la etapa de validación y posteriormente serán eliminadas.

Los participantes se identificarán mediante códigos como `U01`, `S01` o `T01`.

### Planilla de registro

| Participante | Tarea | Tiempo | Puntaje | Observado | Interpretado | Severidad |
|---|---|---|---:|---|---|---|
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |

El puntaje se asignará al terminar cada tarea utilizando la escala definida anteriormente.

En **Observado** se anotará lo que la persona efectivamente hizo o dijo.

En **Interpretado** se registrará posteriormente la conclusión del equipo sobre lo observado.

La severidad se utilizará para clasificar el problema como **Bloquea**, **Entorpece** o **Estético**.

En **Observado** se registrará lo que la persona efectivamente hizo o dijo.

En **Interpretado** se anotará posteriormente la interpretación del equipo, evitando mezclar una observación directa con una conclusión.

### Regla de decisión

**Bloquea:** la persona no logra completar la tarea sin ayuda. El problema deberá corregirse antes de continuar con la siguiente versión.

**Entorpece:** la persona logra completar la tarea, pero presenta dudas, errores o desvíos. Se priorizará según la cantidad de participantes que presenten la misma dificultad.

**Estético:** la persona completa la tarea y la dificultad corresponde únicamente a una incomodidad visual o de presentación. Se registra y puede esperar para una iteración posterior.
