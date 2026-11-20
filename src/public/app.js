import { decisiones } from './decisiones.js';

const ejemplos = {
  7001: {
    pozo: 'DEMO-01',
    estado: 'En revisión',
    evidencia: 'DGA: 0,72 L/s. LI-COR: 0,73 L/s. Límite: 0,60 L/s.',
    habilitado: true
  },
  7002: {
    pozo: 'DEMO-02',
    estado: 'Pendiente',
    evidencia: 'Falta la lectura del intervalo y el respaldo disponible es insuficiente.',
    habilitado: false
  }
};

const evento = document.querySelector('#evento');
const form = document.querySelector('#gestion');
const campos = document.querySelector('#campos');
const accion = document.querySelector('#accion');
const resultado = document.querySelector('#resultado');
const mensaje = document.querySelector('#mensaje');
const comentario = document.querySelector('#comentario');
const errorComentario = document.querySelector('#comentario-error');
let solicitud;

function mostrar(tipo, texto) {
  mensaje.dataset.tipo = tipo;
  mensaje.textContent = texto;
}

function mostrarErrorComentario(texto) {
  errorComentario.textContent = texto;
  errorComentario.hidden = !texto;
  if (texto) comentario.setAttribute('aria-invalid', 'true');
  else comentario.removeAttribute('aria-invalid');
}

function ajustarResultados() {
  resultado.replaceChildren(new Option('Selecciona un resultado', ''));
  for (const opcion of decisiones.get(accion.value) ?? []) {
    resultado.add(new Option(opcion, opcion));
  }
}

function mostrarEvento() {
  const ejemplo = ejemplos[evento.value];
  document.querySelector('#pozo').textContent = ejemplo.pozo;
  document.querySelector('#estado').textContent = ejemplo.estado;
  document.querySelector('#evidencia').textContent = ejemplo.evidencia;
  campos.disabled = !ejemplo.habilitado;
  if (ejemplo.habilitado) {
    mostrar('', '');
  } else {
    mostrar('error', 'Se requieren antecedentes adicionales para continuar.');
  }
}

evento.addEventListener('change', () => {
  form.reset();
  mostrarErrorComentario('');
  ajustarResultados();
  mostrarEvento();
});
accion.addEventListener('change', ajustarResultados);
comentario.addEventListener('input', () => mostrarErrorComentario(''));
mostrarEvento();

form.addEventListener('submit', async event => {
  event.preventDefault();
  const datos = { id_evento: Number(evento.value), ...Object.fromEntries(new FormData(form)) };
  const contenido = JSON.stringify(datos);
  if (solicitud?.contenido !== contenido) {
    solicitud = { contenido, folio: crypto.randomUUID() };
  }

  campos.disabled = true;
  evento.disabled = true;
  mostrarErrorComentario('');
  mostrar('', 'Guardando gestión…');
  try {
    const respuesta = await fetch('/api/gestion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...datos, folio: solicitud.folio }),
      signal: AbortSignal.timeout(22000)
    });
    const datosRespuesta = await respuesta.json();
    if (!respuesta.ok) {
      if (datosRespuesta.campo === 'comentario') {
        mostrar('', '');
        campos.disabled = false;
        mostrarErrorComentario(datosRespuesta.mensaje);
        comentario.focus();
      } else {
        mostrar('error', datosRespuesta.mensaje);
      }
      return;
    }
    const gestion = datosRespuesta.gestion;
    mostrar('exito', 'Gestión registrada en el evento ' + gestion.id_evento + '. Folio ' + gestion.folio + '.');
    form.reset();
    ajustarResultados();
    solicitud = undefined;
  } catch {
    mostrar('error', 'No pudimos confirmar el guardado. Tus datos siguen en el formulario. Intenta nuevamente.');
  } finally {
    campos.disabled = !ejemplos[evento.value].habilitado;
    evento.disabled = false;
  }
});
