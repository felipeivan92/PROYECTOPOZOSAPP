# Análisis ético del prototipo · Aqua Trace

El presente análisis se aplica al prototipo Aqua Trace, diseñado para apoyar la revisión, priorización y trazabilidad de anomalías detectadas en el monitoreo de pozos.

La solución busca disminuir la revisión manual de grandes volúmenes de datos, pero mantiene la validación humana antes de registrar una gestión o generar un ticket.

## B1 · Mapa de impacto y exclusión

|  | Quien ejecuta: Analista de monitoreo | Quien decide o supervisa: Supervisor o jefatura | Quien queda excluido: Personal operativo de terreno sin acceso directo |
|---|---|---|---|
| **Deja de hacer** | Deja de revisar manualmente todos los registros para encontrar anomalías una por una. | Deja de depender únicamente de antecedentes dispersos para conocer el estado de los eventos y gestiones. | No deja de realizar una tarea dentro de la plataforma, porque actualmente no utiliza directamente este sistema. |
| **Su rol cambia** | Pasa a concentrarse en revisar las anomalías detectadas y priorizadas, validar la evidencia disponible y decidir la gestión correspondiente. | Pasa a supervisar los casos, revisar excepciones y comprobar que las decisiones queden respaldadas y trazables. | Su rol no cambia directamente dentro de la plataforma mientras no exista un mecanismo para incorporar sus observaciones de terreno. |
| **Riesgo** | Puede confiar demasiado en la priorización realizada por el sistema y disminuir la revisión crítica de los casos. | Puede tomar una decisión basada en información incompleta si no revisa los antecedentes disponibles. | Una condición detectada físicamente en terreno puede no quedar registrada en los datos y, por lo tanto, no aparecer en el sistema. |

### Medida para quien queda excluido

Cuando una condición relevante sea detectada por personal de terreno y no se encuentre representada en los datos digitales, se deberá mantener un canal operacional complementario para comunicarla al analista de monitoreo.

La observación podrá utilizarse como antecedente adicional durante la revisión del evento, evitando que la plataforma se transforme en la única fuente disponible para tomar decisiones.

## B4 · Sostenibilidad

El equipo considera las siguientes prácticas de uso eficiente de recursos:

1. **Consultas acotadas:** cada pantalla solicitará solamente los datos necesarios para cumplir su función, evitando procesar registros que el usuario no necesita visualizar.

2. **Optimización de archivos:** las imágenes y recursos utilizados en la documentación y en la futura aplicación serán comprimidos cuando sea posible para reducir almacenamiento y transferencia de datos.

3. **Entornos controlados:** los despliegues o ambientes de prueba que no estén siendo utilizados deberán desactivarse para evitar consumo innecesario de recursos.

## B4 · Matriz de riesgos

| Riesgo | Tratamiento | Medida propuesta | Responsable | Momento de revisión |
|---|---|---|---|---|
| Un límite o regla incorrecta genera una falsa anomalía o impide detectar una condición real. | Mitigar | Validar los umbrales y reglas utilizadas por el sistema contra la fuente autorizada antes de incorporarlos al análisis. | Responsable de datos del equipo. | Antes de las pruebas con usuarios y cuando se modifique una regla. |
| La evidencia disponible no es suficiente y se registra una gestión incorrecta. | Mitigar | Mantener el evento pendiente y evitar continuar con la gestión hasta contar con antecedentes suficientes. | Responsable funcional del flujo. | Durante las pruebas del prototipo. |
| La priorización relega eventos que también requieren atención. | Mitigar | Mantener visibles todos los eventos y utilizar la prioridad para ordenar, no para excluir. | Responsable de diseño y experiencia de usuario. | Durante las pruebas con usuarios. |
| Una persona no autorizada accede a información del monitoreo. | Mitigar | Incorporar autenticación y permisos según rol antes de utilizar información operacional real. | Responsable técnico del equipo. | Antes de implementar el MVP funcional. |
| Una situación detectada en terreno no aparece en los registros digitales. | Mitigar | Mantener un canal complementario para que las observaciones de terreno puedan llegar al analista. | Responsable funcional. | Durante las pruebas y posteriormente en una eventual operación piloto. |
