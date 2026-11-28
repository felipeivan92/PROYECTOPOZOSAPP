import { decisiones } from './decisiones.js';

const MAX_TEXTO = 300;
const MENSAJE_ROL = 'Tu rol consulta y gestiona estados. Registrar una gestión corresponde al Analista.';

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

const $ = selector => document.querySelector(selector);
const evento = $('#evento');
const form = $('#gestion');
const campos = $('#campos');
const accion = $('#accion');
const resultado = $('#resultado');
const mensaje = $('#mensaje');
const comentario = $('#comentario');
const errorComentario = $('#comentario-error');
const contadorComentario = $('#comentario-contador');

const filtro = $('#filtro-estado');
const actualizar = $('#actualizar');
const resumen = $('#resumen');
const listaEstado = $('#lista-estado');
const listaAviso = $('#lista-aviso');
const tabla = $('#tabla');
const filas = $('#filas');
const columnaAcciones = $('#columna-acciones');
const anulacion = $('#anulacion');
const anulacionTitulo = $('#anulacion-titulo');
const motivo = $('#motivo');
const errorMotivo = $('#motivo-error');
const contadorMotivo = $('#motivo-contador');
const cancelarAnulacion = $('#cancelar-anulacion');

let solicitud;
let puedeCrear = true;
let rol = null;
let ocupado = false;
let cargaActual = 0;

// Cuenta caracteres Unicode, igual que el servidor y la base (char_length).
const contar = texto => Array.from(texto).length;

function mostrar(tipo, texto) {
  mensaje.dataset.tipo = tipo;
  mensaje.textContent = texto;
}

function mostrarCampo(campo, elemento, texto) {
  elemento.textContent = texto;
  elemento.hidden = !texto;
  if (texto) campo.setAttribute('aria-invalid', 'true');
  else campo.removeAttribute('aria-invalid');
}

function actualizarContador(campo, contador) {
  const largo = contar(campo.value);
  contador.textContent = largo + '/' + MAX_TEXTO;
  contador.dataset.exceso = largo > MAX_TEXTO ? 'si' : 'no';
}

// Mismos mensajes que el servidor (primera capa de validación).
function errorTexto(valor, vacio, largo) {
  const texto = valor.trim();
  if (!texto) return vacio;
  if (contar(texto) > MAX_TEXTO || texto.includes('\u0000')) return largo;
  return '';
}

const errorDeComentario = valor => errorTexto(valor,
  'Escribe por qué tomaste esta decisión.', 'Usa un comentario válido de hasta 300 caracteres.');
const errorDeMotivo = valor => errorTexto(valor,
  'Escribe el motivo de la anulación.', 'Usa un motivo válido de hasta 300 caracteres.');

function ajustarResultados() {
  resultado.replaceChildren(new Option('Selecciona un resultado', ''));
  for (const opcion of decisiones.get(accion.value) ?? []) {
    resultado.add(new Option(opcion, opcion));
  }
}

function formularioHabilitado() {
  return ejemplos[evento.value].habilitado && puedeCrear;
}

function mostrarEvento() {
  const ejemplo = ejemplos[evento.value];
  $('#pozo').textContent = ejemplo.pozo;
  $('#estado').textContent = ejemplo.estado;
  $('#evidencia').textContent = ejemplo.evidencia;
  campos.disabled = !formularioHabilitado();
  if (!puedeCrear) {
    mostrar('', MENSAJE_ROL);
  } else if (ejemplo.habilitado) {
    mostrar('', '');
  } else {
    mostrar('error', 'Se requieren antecedentes adicionales para continuar.');
  }
}

async function enviarJson(metodo, cuerpo) {
  const respuesta = await fetch('/api/gestion', {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
    signal: AbortSignal.timeout(22000)
  });
  return { respuesta, datos: await respuesta.json() };
}

// ---------- Registrar una gestión ----------

evento.addEventListener('change', () => {
  form.reset();
  mostrarCampo(comentario, errorComentario, '');
  actualizarContador(comentario, contadorComentario);
  ajustarResultados();
  mostrarEvento();
});
accion.addEventListener('change', ajustarResultados);
comentario.addEventListener('input', () => {
  mostrarCampo(comentario, errorComentario, '');
  actualizarContador(comentario, contadorComentario);
});
mostrarEvento();
actualizarContador(comentario, contadorComentario);

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!formularioHabilitado()) return;

  if (!accion.value || !resultado.value) {
    mostrar('error', 'Selecciona una acción y un resultado compatibles.');
    return;
  }
  const falloComentario = errorDeComentario(comentario.value);
  if (falloComentario) {
    mostrar('', '');
    mostrarCampo(comentario, errorComentario, falloComentario);
    comentario.focus();
    return;
  }

  const datos = { id_evento: Number(evento.value), ...Object.fromEntries(new FormData(form)) };
  const contenido = JSON.stringify(datos);
  // Mientras no haya confirmación, un reintento reutiliza el mismo folio.
  if (solicitud?.contenido !== contenido) {
    solicitud = { contenido, folio: crypto.randomUUID() };
  }

  campos.disabled = true;
  evento.disabled = true;
  mostrarCampo(comentario, errorComentario, '');
  mostrar('', 'Guardando gestión…');
  try {
    const { respuesta, datos: cuerpo } = await enviarJson('POST', { ...datos, folio: solicitud.folio });
    if (!respuesta.ok) {
      if (cuerpo.campo === 'comentario') {
        mostrar('', '');
        campos.disabled = false;
        mostrarCampo(comentario, errorComentario, cuerpo.mensaje);
        comentario.focus();
      } else {
        mostrar('error', cuerpo.mensaje);
      }
      return;
    }
    const gestion = cuerpo.gestion;
    mostrar('exito', 'Gestión registrada en el evento ' + gestion.id_evento + '. Folio ' + gestion.folio + '.');
    form.reset();
    actualizarContador(comentario, contadorComentario);
    ajustarResultados();
    solicitud = undefined;
    cargarLista();
  } catch {
    mostrar('error', 'No pudimos confirmar el guardado. Tus datos siguen en el formulario. Intenta nuevamente.');
  } finally {
    campos.disabled = !formularioHabilitado();
    evento.disabled = false;
  }
});

// ---------- Listado ----------

function fijarOcupado(valor) {
  ocupado = valor;
  for (const boton of document.querySelectorAll('#filas button, #anulacion button')) boton.disabled = valor;
}

function mostrarEstadoLista(tipo, texto) {
  listaEstado.dataset.tipo = tipo;
  listaEstado.textContent = texto;
}

function mostrarAviso(tipo, texto) {
  listaAviso.dataset.tipo = tipo;
  listaAviso.textContent = texto;
}

function aplicarRol(nuevoRol) {
  const cambio = nuevoRol !== rol;
  rol = nuevoRol;
  puedeCrear = rol === 'Analista';
  columnaAcciones.hidden = rol !== 'Supervisor';
  // Solo se reescribe el mensaje del formulario cuando cambia el rol.
  if (cambio) mostrarEvento();
}

const corto = folio => folio.slice(0, 8);

function celda(texto) {
  const td = document.createElement('td');
  td.textContent = texto;
  return td;
}

function boton(texto, etiqueta, alPulsar) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = texto;
  b.setAttribute('aria-label', etiqueta);
  b.addEventListener('click', alPulsar);
  return b;
}

function filaDe(gestion) {
  const tr = document.createElement('tr');
  const fecha = celda(new Date(gestion.fecha_hora).toLocaleString('es-CL'));
  const folio = celda(corto(gestion.folio));
  folio.title = gestion.folio;
  const estado = document.createElement('td');
  const insignia = document.createElement('span');
  insignia.className = 'estado';
  insignia.dataset.estado = gestion.estado;
  insignia.textContent = gestion.estado;
  estado.append(insignia);
  if (gestion.estado === 'Anulada' && gestion.motivo_anulacion) {
    const detalle = document.createElement('small');
    detalle.textContent = 'Motivo: ' + gestion.motivo_anulacion;
    estado.append(document.createElement('br'), detalle);
  }
  tr.append(folio, fecha, celda(String(gestion.id_evento)), celda(gestion.accion),
    celda(gestion.resultado), celda(gestion.comentario), estado);

  const acciones = document.createElement('td');
  acciones.hidden = rol !== 'Supervisor';
  if (gestion.estado === 'Registrada') {
    acciones.append(boton('Cerrar', 'Cerrar la gestión ' + corto(gestion.folio),
      () => cambiarEstado(gestion.folio, 'Cerrada')));
  }
  if (gestion.estado !== 'Anulada') {
    acciones.append(boton('Anular', 'Anular la gestión ' + corto(gestion.folio),
      () => abrirAnulacion(gestion.folio)));
  }
  tr.append(acciones);
  return tr;
}

function pintar(gestiones) {
  filas.replaceChildren(...gestiones.map(filaDe));
  if (gestiones.length === 0) {
    tabla.hidden = true;
    mostrarEstadoLista('vacio', filtro.value
      ? 'No hay gestiones en estado ' + filtro.value + '.'
      : 'Aún no hay gestiones registradas.');
  } else {
    tabla.hidden = false;
    mostrarEstadoLista('', '');
  }
}

async function cargarResumen() {
  try {
    const respuesta = await fetch('/api/gestion?resumen=1', { cache: 'no-store', signal: AbortSignal.timeout(22000) });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.mensaje);
    const total = { Registrada: 0, Cerrada: 0, Anulada: 0 };
    for (const fila of datos.resumen) total[fila.estado] += fila.cantidad;
    resumen.textContent = 'Resumen: ' + (total.Registrada + total.Cerrada + total.Anulada) +
      ' gestiones (Registradas ' + total.Registrada + ', cerradas ' + total.Cerrada + ', anuladas ' + total.Anulada + ').';
  } catch {
    resumen.textContent = 'No pudimos cargar el resumen. Intenta nuevamente.';
  }
}

async function cargarLista() {
  const numero = ++cargaActual;
  actualizar.disabled = true;
  tabla.hidden = true;
  mostrarEstadoLista('carga', 'Cargando gestiones…');
  try {
    const consulta = filtro.value ? '?estado=' + encodeURIComponent(filtro.value) : '';
    const respuesta = await fetch('/api/gestion' + consulta, { cache: 'no-store', signal: AbortSignal.timeout(22000) });
    if (numero !== cargaActual) return;
    if (respuesta.status === 401) {
      location.assign('/login.html');
      return;
    }
    const datos = await respuesta.json();
    if (numero !== cargaActual) return;
    if (!respuesta.ok) {
      mostrarEstadoLista('error', datos.mensaje + ' Usa Actualizar para reintentar.');
      return;
    }
    aplicarRol(datos.rol);
    pintar(datos.gestiones);
    cargarResumen();
  } catch {
    if (numero !== cargaActual) return;
    mostrarEstadoLista('error', 'No pudimos cargar las gestiones. Intenta nuevamente. Usa Actualizar para reintentar.');
  } finally {
    if (numero === cargaActual) actualizar.disabled = false;
  }
}

filtro.addEventListener('change', cargarLista);
actualizar.addEventListener('click', cargarLista);

// ---------- Cambiar estado y anular ----------

async function cambiarEstado(folio, estado, motivoTexto) {
  if (ocupado) return false;
  fijarOcupado(true);
  mostrarAviso('', 'Guardando cambio…');
  try {
    const cuerpo = { folio, estado };
    if (estado === 'Anulada') cuerpo.motivo_anulacion = motivoTexto;
    const { respuesta, datos } = await enviarJson('PATCH', cuerpo);
    if (!respuesta.ok) {
      if (datos.campo === 'motivo_anulacion') {
        mostrarAviso('', '');
        mostrarCampo(motivo, errorMotivo, datos.mensaje);
        motivo.focus();
      } else {
        mostrarAviso('error', datos.mensaje);
        if (respuesta.status === 409) cargarLista();
      }
      return false;
    }
    cerrarAnulacion();
    mostrarAviso('exito', datos.mensaje);
    cargarLista();
    return true;
  } catch {
    mostrarAviso('error', 'No pudimos confirmar el cambio. Intenta nuevamente.');
    return false;
  } finally {
    fijarOcupado(false);
  }
}

function abrirAnulacion(folio) {
  anulacion.dataset.folio = folio;
  anulacionTitulo.textContent = 'Anular la gestión ' + corto(folio);
  motivo.value = '';
  mostrarCampo(motivo, errorMotivo, '');
  actualizarContador(motivo, contadorMotivo);
  mostrarAviso('', '');
  anulacion.hidden = false;
  motivo.focus();
}

function cerrarAnulacion() {
  anulacion.hidden = true;
  anulacion.dataset.folio = '';
  motivo.value = '';
  mostrarCampo(motivo, errorMotivo, '');
}

motivo.addEventListener('input', () => {
  mostrarCampo(motivo, errorMotivo, '');
  actualizarContador(motivo, contadorMotivo);
});
cancelarAnulacion.addEventListener('click', cerrarAnulacion);
anulacion.addEventListener('submit', async event => {
  event.preventDefault();
  if (ocupado) return;
  const falla = errorDeMotivo(motivo.value);
  if (falla) {
    mostrarCampo(motivo, errorMotivo, falla);
    motivo.focus();
    return;
  }
  await cambiarEstado(anulacion.dataset.folio, 'Anulada', motivo.value.trim());
});

cargarLista();
