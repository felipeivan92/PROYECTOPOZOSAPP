# Bitácora de uso de IA — PozosApp

**Equipo 7 · Ingeniería Digital en Acción, Vespertino · USACH**  
**Profesora:** Andrea Arredondo Navarrete.  
**Revisión documental:** 1 de noviembre de 2026, hora de Chile.

## Alcance y criterio de registro

PozosApp es una propuesta de apoyo al monitoreo y trazabilidad de pozos de Codelco Chuquicamata. El [README principal](../../README.md) declara que aún no existe un MVP funcional ni una base de datos implementada. Los ejemplos del [modelo preliminar](../datos/estructura_datos.md) son ilustrativos, no datos operacionales.

La IA participó en las propuestas y en la redacción de esta bitácora. Una respuesta generada no constituye por sí sola una verificación. Se distinguen antecedentes declarados en la bitácora anterior, cambios comprobados en GitHub y asuntos pendientes de validación humana.

**Los prompts originales y las respuestas completas de los usos 1 a 5 no están disponibles entre las fuentes consultadas.** Sus instrucciones se conservan como resúmenes históricos, no como citas textuales ni transcripciones reconstruidas. Tampoco se asignan fechas de conversación o revisiones personales sin respaldo. El historial anterior puede consultarse en la [versión previa de la bitácora](https://github.com/felipeivan92/PROYECTOPOZOSAPP/blob/22560c66c008aa8e9871d96f68a611542215bf51/docs/bitacora-ia/bitacora_ia.md).

## Uso 1 — Revisión de requisitos del Avance 3

- **Objetivo:** identificar archivos, carpetas y condiciones de la entrega.
- **Instrucción, resumen histórico:** revisar las instrucciones oficiales del Avance 3 y ordenar lo necesario para preparar el repositorio.
- **Propuesta de IA, según el registro anterior:** lista con ramas `main` y `dev`, README, entregables de Unidad 1, bitácora, estructura de datos, `.gitignore` y `.env.example`.
- **Decisión humana declarada:** conservar una estructura mínima, el paso de `dev` a `main` mediante PR y la participación de más de un integrante; no inventar una aplicación ejecutable ni implementar anticipadamente la base de datos.
- **Verificación y límite:** la bitácora anterior afirmaba una comparación con las instrucciones oficiales, pero no adjuntaba una matriz ni el documento que permitiera repetirla. Esa comprobación histórica no puede darse por acreditada solo por esa frase. Sí se comprobó ahora la existencia de ambas ramas y del [PR #3](https://github.com/felipeivan92/PROYECTOPOZOSAPP/pull/3), de `dev` a `main`, fusionado el 2 de octubre de 2026 en Chile.
- **Resultado:** entrega documental versionada. La estructura del repositorio acredita archivos y flujo de integración, no el cumplimiento exhaustivo de una rúbrica no consultada directamente.

## Uso 2 — Diseño preliminar de datos

- **Objetivo:** representar los conceptos del caso de uso mediante entidades y relaciones.
- **Instrucción, resumen histórico:** proponer la estructura a partir del Avance 2, sin agregar supuestos ajenos al caso.
- **Propuesta de IA, según el registro anterior:** `USUARIO`, `POZO`, `DATO_MONITOREO`, `EVENTO`, `EVIDENCIA`, `GESTION` y `TICKET`.
- **Decisión humana declarada:** usar `EVENTO.tipo_anomalia` en lugar de separar `EVENTO` y `ANOMALIA`; mantener `GESTION` separada para conservar el historial de acciones. El registro también aclaraba que el documento utilizado entonces reunía Avance 1 en páginas 1–2 y Avance 2 en las restantes. Esto se conserva como antecedente del archivo de trabajo de esa interacción, no como descripción de los PDF separados actuales.
- **Verificación actual:** el modelo permite seguir las relaciones pozo–dato, evento–evidencia, evento–gestión, usuario–gestión y evento–ticket. Esa correspondencia es verificable en el diagrama y el diccionario; no demuestra que todas las reglas del caso de uso estén resueltas.
- **Resultado:** modelo documental preliminar. La detección posterior de claves duplicadas y los pendientes de esta bitácora muestran que aceptar las entidades no bastaba para validar sus ejemplos y restricciones.

### Corrección humana comprobada: claves duplicadas de TICKET

El [commit `ad07121c`](https://github.com/felipeivan92/PROYECTOPOZOSAPP/commit/ad07121c066bc8f480b5ffccd6814f5602ee46dd) incorporó origen y referencia de datos, criterio de detección y plazo de gestión. Su diff también agregó ejemplos de tickets sin retirar los anteriores: quedaron **dos filas con `id_ticket = 9001` y dos con `id_ticket = 9002`**.

El [commit `36a2e595`](https://github.com/felipeivan92/PROYECTOPOZOSAPP/commit/36a2e595ed3f115c7b1de15df3536d61ace3d3d2), realizado por `felipeivan92` el 2 de octubre de 2026 en Chile, eliminó estas filas:

| id_ticket | id_evento | codigo_ticket eliminado | Estado |
|---|---|---|---|
| 9001 | 7001 | TK-2026-001 | Abierto |
| 9002 | 7002 | TK-2026-002 | Abierto |

Se conservaron `TICKET-EJ-001` y `TICKET-EJ-002`, ambos con estado `Generado`. El resultado comprobado es un ejemplo por clave primaria. No fue una limpieza de una base implementada.

**Origen de la atribución:** la retroalimentación docente aportada por Omar atribuye a Felipe la detección. El autor del commit y su diff respaldan la modificación; no permiten reconstruir la conversación ni el momento exacto de detección. No existe evidencia consultada que permita atribuir a la IA esa detección. Este caso muestra una corrección humana concreta que faltaba en la bitácora.

## Uso 3 — Preparación de archivos

- **Objetivo:** ordenar la primera entrega en GitHub.
- **Instrucción, resumen histórico:** preparar los archivos utilizando las instrucciones del Avance 3 y los avances del Equipo 7.
- **Propuesta de IA, según el registro anterior:** README principal, README de `src/`, bitácora, modelo preliminar, `.gitignore` y `.env.example`.
- **Decisión humana declarada:** conservar solo lo necesario, excluir credenciales reales y declarar el carácter preliminar de los datos.
- **Verificación:** el [PR #3](https://github.com/felipeivan92/PROYECTOPOZOSAPP/pull/3) permite inspeccionar los cambios de entrega y sus intervenciones. Registra un comentario de conformidad de `purrutiaa` y una revisión `APPROVED` de `omarcarvajal95`; esta última aparece después de la hora de fusión, por lo que no se presenta como aprobación previa al merge.
- **Resultado y límite:** entrega documental integrada. La declaración histórica de exclusión de credenciales se conserva, pero esta revisión no constituye una auditoría de seguridad ni acredita una revisión completa de secretos.

## Uso 4 — Precisiones asociadas al Avance 1

- **Objetivo:** precisar problema, actores, ingreso de datos y definición de anomalías.
- **Instrucción, resumen histórico:** contrastar la retroalimentación del Avance 1 con README, caso de uso y modelo.
- **Propuesta de IA, según el registro anterior:** identificar quién experimenta el problema, cuándo ocurre, sus consecuencias, la evidencia disponible y reglas de detección.
- **Decisión humana declarada:** precisar roles y datos; conservar los avances ya evaluados como antecedentes históricos.
- **Verificación actual:** el [registro del Avance 1](../unidad1/retroalimentacion_avance1.md) distingue analista de Unisource, receptor de Codelco y supervisor, y describe ingreso CSV/Excel y anomalías. El README conserva la validación humana. El diff de `ad07121c` demuestra la incorporación de `origen_dato`, `referencia_origen`, `criterio_deteccion` y `fecha_hora_limite_gestion`.
- **Resultado y límite:** precisiones documentadas. Los archivos del propio equipo permiten contrastar consistencia interna; no reemplazan el correo docente original ni validan por sí solos el proceso operacional. No se atribuyen estas modificaciones a la evaluación formal del 30 de octubre.

## Uso 5 — Mejoras documentales del 18 de octubre

- **Objetivo histórico:** precisar indicadores, capas de la solución, herramientas y prioridades.
- **Instrucción, resumen histórico:** contrastar la retroalimentación disponible entonces con README, datos, documentación y pantallas.
- **Propuesta de IA, según el registro anterior:** indicadores medibles, separación entre conocimiento, automatización y registro, documentación de herramientas y priorización del roadmap.
- **Decisión humana declarada:** conservar mejoras existentes y agregar lo pendiente, manteniendo el alcance.
- **Verificación:** el [PR #5](https://github.com/felipeivan92/PROYECTOPOZOSAPP/pull/5), titulado «Incorpora retroalimentación del Avance 3», fue fusionado el **18 de octubre de 2026**. El README actual contiene indicadores de tiempo de revisión, evidencia, trazabilidad y demora entre detección y revisión. La meta de trazabilidad del 100 % es una meta de diseño; no un resultado medido.
- **Resultado:** mejoras documentales integradas, con [herramientas](../herramientas.md), [roadmap](../roadmap.md) y [registro denominado retroalimentación del Avance 3](../unidad1/retroalimentacion_avance3.md).

**Aclaración cronológica:** se conserva el título histórico del PR y del archivo. Su existencia el 18 de octubre no demuestra que respondieran al correo formal recibido el 30 de octubre. La relación entre esa documentación previa y la evaluación posterior requiere aclaración del equipo. La versión anterior de esta bitácora no distinguía ambas fechas.

### Estado comprobado del PR #8

El [PR #8](https://github.com/felipeivan92/PROYECTOPOZOSAPP/pull/8), abierto para actualizar Figma, sigue **abierto, como borrador y sin fusionar**, de `dev` hacia `main`, al revisar el 1 de noviembre. Aunque registra una aprobación histórica de Felipe, eso no equivale a una fusión.

Su diff actual incluye tres archivos y ya no se limita al enlace Figma: también contiene cambios en el modelo y en el README de Unidad 1. El enlace actualizado está en el README de wireframes de `dev`; el README principal conserva otro enlace. El equipo debe validar cuál es el definitivo y su acceso. Esta tarea no altera ese PR.

## Evaluación formal del Avance 3 y pendientes del modelo

Según los antecedentes proporcionados por Omar del correo **«Ingeniería Digital en Acción Vespertino: Avance 3, equipo 7 - Nota 5,9»**, del **30 de octubre de 2026**, la evaluación fue **5,9 (19,5/23 puntos)** y la bitácora obtuvo **1,5/3 puntos**. Se señaló la falta de prompts originales, evidencia de pensamiento crítico, registro de la corrección de Felipe y verificaciones reproducibles.

El correo original no se recuperó en la búsqueda realizada en la sesión disponible; estos datos se identifican como antecedentes aportados por el solicitante, pendientes de contraste directo con el correo. No se presenta el archivo de retroalimentación del 18 de octubre como copia de ese mensaje.

La siguiente revisión distingue el problema observado en la evaluación y lo que existe ahora. **No se modifica el modelo en esta tarea.**

| Observación | Estado comprobado y pendiente |
|---|---|
| Ausencia de UMBRAL | En `main` sigue ausente. En `dev` ya existe entidad, relación, diccionario y ejemplos, incorporados en el [commit 45e8b9de](https://github.com/felipeivan92/PROYECTOPOZOSAPP/commit/45e8b9de1585e4d4a76266641a0cc39240ccba78) del 1 de noviembre. Pendiente revisión humana e integración; su presencia documental no implica una tabla implementada. |
| EVIDENCIA.id_dato obligatorio para lecturas faltantes | Sigue obligatorio en `main`; en `dev` figura opcional desde el [commit 22560c66](https://github.com/felipeivan92/PROYECTOPOZOSAPP/commit/22560c66c008aa8e9871d96f68a611542215bf51) del 1 de noviembre. Pendiente validar cardinalidad, ejemplos e integración. |
| EVENTO.requiere_ticket obligatorio antes de decidir | Continúa como sí/no obligatorio. Pendiente representar una decisión aún no tomada y acordar cuándo se completa. No se adopta aquí una solución de diseño. |
| Estados de EVENTO frente a GESTION y TICKET | Los eventos 7001 y 7002 aparecen «En revisión» y «Pendiente», mientras las gestiones dicen «Ticket requerido» y existen tickets «Generado». Pendiente acordar reglas de transición y un ejemplo temporal coherente. |
| Listas sin catálogo y denominaciones inconsistentes | Pendiente definir valores permitidos para variables, prioridades, estados, acciones, resultados y orígenes, y uniformar nombres. Los ejemplos aislados no constituyen catálogos completos. |
| Coherencia de la evidencia de 7002 | En `dev`, DATO_MONITOREO 5002 registra cero y EVENTO 7002 indica «Lectura en cero», pero EVIDENCIA 8002 ahora describe ausencia de lectura. Pendiente separar ambos escenarios o corregir el ejemplo mediante otra revisión del modelo. |

Estos pendientes deben resolverse con criterios del caso de uso y revisión del equipo. No se inventan umbrales operacionales, decisiones del analista ni pruebas de ejecución.

## Uso 6 — Revisión actual de la bitácora con IA

**Fecha:** 1 de noviembre de 2026.  
**Herramienta:** ChatGPT en modo Work, con conector GitHub para consulta y Chrome conectado para las operaciones que requieran la sesión del usuario.

**Objetivo:** corregir únicamente esta bitácora, conservar el historial verificable y preparar una rama desde `dev` con PR para revisión.

**Instrucción disponible:** la solicitud actual de Omar está disponible en esta conversación. Extractos textuales:

> No inventes instrucciones textuales, fechas, conversaciones ni revisiones realizadas por integrantes.

> Agrega el registro de la revisión actual, identificando esta solicitud como una nueva interacción de IA y dejando pendiente la aprobación humana que todavía no haya ocurrido.

**Resumen del resto de la solicitud (no transcripción):** revisar ramas, PR, README, datos, Unidad 1 y commits; documentar los duplicados de TICKET, la evaluación y los pendientes; editar solo este archivo; crear rama, commit y PR hacia `dev`; verificar el guardado y no fusionar.

**Propuesta elaborada por la IA:** esta versión diferencia resúmenes de prompts, decisiones declaradas, evidencia del historial y validaciones pendientes. Reemplaza afirmaciones generales de verificación por fuentes concretas y límites de lo que permiten concluir.

**Decisiones humanas disponibles:** Omar autorizó el alcance, la rama y el PR. La aceptación del contenido por otro integrante **todavía está pendiente**. No se registra aprobación del equipo por anticipado.

**Verificación realizada en esta interacción:** lectura de la bitácora vigente, README, modelo de `dev`, sección de EVIDENCIA de `main`, documentos Markdown de Unidad 1, listado de sus PDF, estados de ramas y PR, diffs de los commits citados y PR #3, #5 y #8. La existencia de los PDF Avance 1 y 2 fue comprobada, pero no se realizó una nueva revisión de su contenido completo. No se utilizó una propuesta adjunta de bitácora como evidencia de hechos históricos.

**Fuentes independientes de la respuesta de IA:** diffs y metadatos de GitHub para cambios y fechas; antecedentes de evaluación aportados por Omar, con la limitación de acceso al correo indicada arriba. Los documentos del equipo se usan para consistencia interna, sin presentarlos como validación externa de la operación.

**Resultado documental:** versión propuesta para guardado en `docs/correccion-bitacora-ia`, mediante un commit que solo modifica `docs/bitacora-ia/bitacora_ia.md`, y PR hacia `dev`. El enlace y SHA resultantes quedarán en GitHub y en la entrega de esta interacción; este texto no anticipa una fusión ni una aprobación.

## Validación humana requerida antes de aprobar

- Contrastar con el correo original la nota, puntaje, fecha, observaciones y atribución a Felipe.
- Aclarar por qué los documentos del 18 de octubre se denominan retroalimentación del Avance 3; no cambiar las fechas del historial.
- Recuperar, si existen, prompts y respuestas originales de los usos 1–5. Incorporarlos como evidencia, sin reconstruirlos de memoria como citas.
- Revisar los pendientes del modelo en una tarea separada y validar el enlace Figma definitivo.
- Un integrante distinto del autor del PR debe revisar el diff, comprobar que solo cambió esta bitácora y registrar una revisión formal **Approve** si está conforme. Un comentario informal no sustituye esa revisión.

La asistencia de IA queda declarada. La responsabilidad de validar y aprobar esta documentación corresponde al Equipo 7.
