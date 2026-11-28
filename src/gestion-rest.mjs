import { ESTADOS, autorizar, validarCreacion, validarTransicion } from './gestion.mjs';

// Capa REST de GESTION sobre Supabase (PostgREST).
//
// Recibe dos dependencias para poder probarse sin red:
//   solicitar(ruta, { metodo, token, parametros, cuerpo, prefer })
//     Misma firma que solicitarSupabase (src/supabase.mjs, rama avance8/seguridad).
//   identificar(request)
//     Devuelve { ok: true, token, id_usuario, rol } con la sesión y el perfil activo,
//     o { ok: false, status, mensaje }.
//   origenPermitido(request) es opcional y se aplica a POST y PATCH.
//
// La base asigna id_usuario, fecha_hora, el estado inicial y los campos de auditoría.
// Esta capa nunca los envía.

const formatoFolio = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const COLUMNAS = 'folio,id_evento,id_usuario,accion,resultado,comentario,estado,fecha_hora,' +
  'fecha_actualizacion,actualizado_por,motivo_anulacion';
const PERMITIDOS = 'GET, POST, PATCH';
const LIMITE = '100';

function responder(datos, status, headers = {}) {
  return Response.json(datos, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

function falloSupabase(respuesta, mensaje503) {
  if (respuesta.status === 401) return responder({ mensaje: 'Tu sesión no es válida o ha expirado.' }, 401);
  if (respuesta.status === 403) return responder({ mensaje: 'No tienes permisos para esta operación.' }, 403);
  if (respuesta.status === 400 || respuesta.status === 422) {
    return responder({ mensaje: 'No se pudo procesar la gestión con los datos recibidos.' }, 422);
  }
  return responder({ mensaje: mensaje503 }, 503);
}

async function leerJson(request) {
  const tipo = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (tipo !== 'application/json') return { respuesta: responder({ mensaje: 'El formato debe ser JSON.' }, 415) };
  try {
    return { datos: await request.json() };
  } catch {
    return { respuesta: responder({ mensaje: 'No se pudo leer la solicitud.' }, 400) };
  }
}

export function crearApiRest({ solicitar, identificar, origenPermitido }) {
  async function rest(sesion, ruta, opciones = {}) {
    try {
      return await solicitar(ruta, { token: sesion.token, ...opciones });
    } catch {
      return { ok: false, status: 503, datos: null };
    }
  }

  const filas = respuesta => (Array.isArray(respuesta.datos) ? respuesta.datos : []);

  async function crear(request, sesion) {
    if (!autorizar(sesion.rol, 'crear')) return responder({ mensaje: 'No tienes permisos para esta operación.' }, 403);
    if (origenPermitido && !origenPermitido(request)) return responder({ mensaje: 'Origen de solicitud no autorizado.' }, 403);
    const { datos, respuesta } = await leerJson(request);
    if (respuesta) return respuesta;

    const validacion = validarCreacion(datos);
    if (!validacion.ok) {
      const { ok, status, ...cuerpo } = validacion;
      return responder(cuerpo, status);
    }
    const valores = validacion.valores;
    const falla = 'No pudimos confirmar el guardado. Tus datos siguen en el formulario. Intenta nuevamente.';

    const evento = await rest(sesion, '/rest/v1/evento', {
      parametros: { select: 'id_evento,respaldo_suficiente', id_evento: 'eq.' + valores.id_evento }
    });
    if (!evento.ok) return falloSupabase(evento, falla);
    const [datosEvento] = filas(evento);
    if (!datosEvento) return responder({ mensaje: 'No se encontró el evento.' }, 404);
    if (datosEvento.respaldo_suficiente !== true) {
      return responder({ mensaje: 'Se requieren antecedentes adicionales para continuar.' }, 409);
    }

    // Solo los cinco campos del formulario. El resto lo asigna la base.
    const insercion = await rest(sesion, '/rest/v1/gestion', {
      metodo: 'POST',
      parametros: { select: COLUMNAS, on_conflict: 'folio' },
      cuerpo: valores,
      prefer: 'return=representation,resolution=ignore-duplicates,missing=default'
    });
    if (!insercion.ok) return falloSupabase(insercion, falla);
    const [creada] = filas(insercion);
    if (creada) return responder({ mensaje: 'Gestión registrada.', gestion: creada }, 201);

    // El folio ya existía: reintento de la misma solicitud o folio ajeno.
    // Se filtra por el usuario autenticado como defensa adicional a RLS.
    const previa = await rest(sesion, '/rest/v1/gestion', {
      parametros: { select: COLUMNAS, folio: 'eq.' + valores.folio, id_usuario: 'eq.' + sesion.id_usuario }
    });
    if (!previa.ok) return falloSupabase(previa, falla);
    const [existente] = filas(previa);
    if (existente && existente.id_usuario === sesion.id_usuario && existente.id_evento === valores.id_evento && existente.accion === valores.accion &&
        existente.resultado === valores.resultado && existente.comentario === valores.comentario) {
      return responder({ mensaje: 'Gestión registrada.', gestion: existente }, 200);
    }
    return responder({ mensaje: 'Ese folio corresponde a otra solicitud.' }, 409);
  }

  // Resumen operativo: solo cantidades por evento, acción, resultado y estado.
  // La función SQL no devuelve folios, usuarios ni comentarios.
  async function resumir(sesion) {
    const resumen = await rest(sesion, '/rest/v1/rpc/resumen_gestiones');
    if (!resumen.ok) return falloSupabase(resumen, 'No pudimos cargar el resumen. Intenta nuevamente.');
    return responder({ resumen: filas(resumen) }, 200);
  }

  async function consultar(request, sesion) {
    const url = new URL(request.url);
    if (url.searchParams.has('resumen')) {
      if (!autorizar(sesion.rol, 'resumir')) return responder({ mensaje: 'No tienes permisos para esta operación.' }, 403);
      return resumir(sesion);
    }
    if (!autorizar(sesion.rol, 'consultar')) return responder({ mensaje: 'No tienes permisos para esta operación.' }, 403);
    const falla = 'No pudimos cargar las gestiones. Intenta nuevamente.';
    const parametros = { select: COLUMNAS };
    // El Analista consulta solo las propias. La base lo refuerza con RLS.
    if (sesion.rol === 'Analista') parametros.id_usuario = 'eq.' + sesion.id_usuario;

    if (url.searchParams.has('folio')) {
      const folio = url.searchParams.get('folio');
      if (!formatoFolio.test(folio)) return responder({ mensaje: 'El folio de la solicitud no es válido.' }, 422);
      const detalle = await rest(sesion, '/rest/v1/gestion', { parametros: { ...parametros, folio: 'eq.' + folio } });
      if (!detalle.ok) return falloSupabase(detalle, falla);
      const [gestion] = filas(detalle);
      if (!gestion) return responder({ mensaje: 'No se encontró la gestión.' }, 404);
      return responder({ gestion }, 200);
    }

    const estado = url.searchParams.get('estado');
    if (estado !== null) {
      if (!ESTADOS.includes(estado)) return responder({ mensaje: 'El estado indicado no es válido.' }, 422);
      parametros.estado = 'eq.' + estado;
    }
    const lista = await rest(sesion, '/rest/v1/gestion', {
      parametros: { ...parametros, order: 'fecha_hora.desc', limit: LIMITE }
    });
    if (!lista.ok) return falloSupabase(lista, falla);
    return responder({ gestiones: filas(lista) }, 200);
  }

  async function actualizar(request, sesion) {
    if (origenPermitido && !origenPermitido(request)) return responder({ mensaje: 'Origen de solicitud no autorizado.' }, 403);
    const { datos, respuesta } = await leerJson(request);
    if (respuesta) return respuesta;

    const { folio, estado: estadoNuevo, motivo_anulacion: motivo } = datos ?? {};
    const operacion = estadoNuevo === 'Anulada' ? 'anular' : 'actualizar';
    if (!autorizar(sesion.rol, operacion)) return responder({ mensaje: 'No tienes permisos para esta operación.' }, 403);
    if (typeof folio !== 'string' || !formatoFolio.test(folio)) {
      return responder({ mensaje: 'El folio de la solicitud no es válido.' }, 422);
    }
    const falla = 'No pudimos confirmar el cambio. Intenta nuevamente.';

    const actual = await rest(sesion, '/rest/v1/gestion', {
      parametros: { select: 'folio,estado', folio: 'eq.' + folio }
    });
    if (!actual.ok) return falloSupabase(actual, falla);
    const [fila] = filas(actual);
    if (!fila) return responder({ mensaje: 'No se encontró la gestión.' }, 404);

    const validacion = validarTransicion({ estadoActual: fila.estado, estadoNuevo, motivo });
    if (!validacion.ok) {
      const { ok, status, ...cuerpo } = validacion;
      return responder(cuerpo, status);
    }

    // Solo estado y motivo. La fecha y el autor de la actualización los asigna la base.
    // El filtro por estado actual evita pisar un cambio concurrente.
    const cambio = await rest(sesion, '/rest/v1/gestion', {
      metodo: 'PATCH',
      parametros: { select: COLUMNAS, folio: 'eq.' + folio, estado: 'eq.' + fila.estado },
      cuerpo: validacion.valores,
      prefer: 'return=representation'
    });
    if (!cambio.ok) return falloSupabase(cambio, falla);
    const [gestion] = filas(cambio);
    if (!gestion) {
      return responder({ mensaje: 'La gestión cambió mientras se procesaba. Actualiza la pantalla e intenta nuevamente.' }, 409);
    }
    return responder({ mensaje: estadoNuevo === 'Anulada' ? 'Gestión anulada.' : 'Gestión actualizada.', gestion }, 200);
  }

  return async function gestionar(request) {
    if (request.method === 'DELETE') {
      return responder({ mensaje: 'No se permite eliminar gestiones. Usa la anulación.' }, 405, { Allow: PERMITIDOS });
    }
    if (!['GET', 'POST', 'PATCH'].includes(request.method)) {
      return responder({ mensaje: 'Método no permitido.' }, 405, { Allow: PERMITIDOS });
    }

    let sesion;
    try {
      sesion = await identificar(request);
    } catch {
      return responder({ mensaje: 'No fue posible verificar la sesión.' }, 503);
    }
    if (!sesion?.ok) return responder({ mensaje: sesion?.mensaje ?? 'Debes iniciar sesión.' }, sesion?.status ?? 401);

    if (request.method === 'POST') return crear(request, sesion);
    if (request.method === 'PATCH') return actualizar(request, sesion);
    return consultar(request, sesion);
  };
}
