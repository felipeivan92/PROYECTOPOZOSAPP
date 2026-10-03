# Retroalimentación del Avance 1

A partir de la retroalimentación recibida por la profesora, el equipo identificó distintos aspectos que debían precisarse para continuar desarrollando la solución de manera más clara y consistente.

## 1. Definición del problema

Se precisó que quien experimenta directamente el problema es el ingeniero o analista de monitoreo de Unisource, responsable de revisar los datos provenientes de los pozos y gestionar las anomalías detectadas.

El problema ocurre principalmente durante la revisión periódica de los datos de monitoreo, cuando es necesario identificar oportunamente desviaciones, inconsistencias o eventos que requieren atención.

Como consecuencia, una detección tardía puede provocar que la gestión del evento comience fuera del plazo definido para el proceso, aumentando la necesidad de revisión, regularización y seguimiento posterior.

## 2. Evidencia del problema

Se incorporó como antecedente que el problema fue identificado a partir de la experiencia directa de un integrante del equipo que participa en el proceso de monitoreo de pozos.

Además, se consideró el volumen de información que debe revisarse. Cada pozo puede generar múltiples registros diarios por variable monitoreada, por lo que el trabajo aumenta a medida que se incorporan más pozos, variables y períodos de análisis.

## 3. Mecanismo de generación de beneficio

Se precisó que el beneficio no consiste solamente en visualizar la información de los pozos.

La solución busca utilizar la detección, clasificación y priorización de anomalías para mostrar al analista cuáles eventos requieren atención, qué condición produjo la alerta y qué antecedentes respaldan su revisión.

De esta forma, el usuario puede concentrarse en los eventos relevantes sin tener que revisar manualmente todos los registros disponibles.

## 4. Usuarios, beneficiarios y responsables

Se reemplazó la referencia general a Codelco por roles más específicos dentro del proceso.

El usuario directo corresponde al ingeniero o analista de monitoreo de Unisource, quien revisa los datos y gestiona las anomalías detectadas.

El receptor de la información corresponde al profesional responsable del control hídrico en el área de Aguas y Relaves de Codelco Chuquicamata.

El supervisor o jefatura responsable del servicio de monitoreo de Unisource participa en la validación de las acciones realizadas, mientras que el acceso y uso de la información debe mantenerse bajo las autorizaciones definidas por Codelco.

## 5. Datos y definición de anomalías

Para el MVP se definió que los datos podrán incorporarse mediante archivos exportados desde las fuentes de monitoreo, principalmente en formatos CSV o Excel.

Una anomalía corresponde a una condición detectada mediante reglas definidas y verificables sobre los datos.

Entre las condiciones consideradas se encuentran:

- registros faltantes;
- registros duplicados;
- lecturas en cero;
- superación de límites o umbrales definidos;
- inconsistencias entre variables relacionadas;
- cambios bruscos en los valores monitoreados.

La detección automática permite identificar y priorizar estas condiciones, pero la validación final y la decisión sobre su gestión permanecen en el responsable del proceso.

## 6. Incorporación de la retroalimentación

Las observaciones recibidas fueron incorporadas en el desarrollo actual del proyecto mediante ajustes en el README y en la estructura preliminar de datos.

Los documentos correspondientes a los avances ya evaluados se mantienen sin modificaciones, con el objetivo de conservar el historial del proyecto y evidenciar su evolución a partir de la retroalimentación recibida.
