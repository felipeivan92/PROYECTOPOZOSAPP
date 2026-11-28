import { decisiones } from './public/decisiones.js';

const formatoFolio = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const MAX_TEXTO = 300;

export const ESTADOS = ['Registrada', 'Cerrada', 'Anulada'];

// Transiciones permitidas. Anulada es definitiva.
export const TRANSICIONES = new Map([
  ['Registrada', ['Cerrada', 'Anulada']],
  ['Cerrada', ['Anulada']],
  ['Anulada', []]
]);

// Matriz de permisos acordada por el equipo (docs/permisos.md).
// Solo define la regla de rol. La pertenencia del registro (Analista: propias)
// la verifica el servidor al consultar y la base de datos mediante RLS.
const PERMISOS = new Map([
  ['Analista', ['crear', 'consultar']],
  ['Supervisor', ['consultar', 'actualizar', 'anular']],
  ['Administrador', []]
]);

export function autorizar(rol, operacion) {
  return PERMISOS.get(rol)?.includes(operacion) === true;
}

function textoValido(texto) {
  return texto.length >= 1 && texto.length <= MAX_TEXTO && !texto.includes('\u0000');
}

// Validación de la creación. Conserva los mensajes del Avance 7.
export function validarCreacion(datos) {
  const { folio, id_evento, accion, resultado } = datos ?? {};
  const comentario = typeof datos?.comentario === 'string' ? datos.comentario.trim() : '';
  if (typeof folio !== 'string' || !formatoFolio.test(folio) || !Number.isSafeInteger(id_evento) || id_evento < 1) {
    return { ok: false, status: 422, mensaje: 'El evento o el folio de la solicitud no es válido.' };
  }
  if (!decisiones.get(accion)?.includes(resultado)) {
    return { ok: false, status: 422, mensaje: 'Selecciona una acción y un resultado compatibles.' };
  }
  if (!comentario) {
    return { ok: false, status: 422, campo: 'comentario', mensaje: 'Escribe por qué tomaste esta decisión.' };
  }
  if (!textoValido(comentario)) {
    return { ok: false, status: 422, campo: 'comentario', mensaje: 'Usa un comentario válido de hasta 300 caracteres.' };
  }
  return { ok: true, valores: { folio, id_evento, accion, resultado, comentario } };
}

// Validación de un cambio de estado (actualización o anulación).
export function validarTransicion({ estadoActual, estadoNuevo, motivo } = {}) {
  if (!ESTADOS.includes(estadoNuevo) || !TRANSICIONES.get(estadoActual)?.includes(estadoNuevo)) {
    return { ok: false, status: 409, mensaje: 'La transición de estado no está permitida.' };
  }
  if (estadoNuevo !== 'Anulada') return { ok: true, valores: { estado: estadoNuevo } };

  const texto = typeof motivo === 'string' ? motivo.trim() : '';
  if (!texto) {
    return { ok: false, status: 422, campo: 'motivo_anulacion', mensaje: 'Escribe el motivo de la anulación.' };
  }
  if (!textoValido(texto)) {
    return { ok: false, status: 422, campo: 'motivo_anulacion', mensaje: 'Usa un motivo válido de hasta 300 caracteres.' };
  }
  return { ok: true, valores: { estado: estadoNuevo, motivo_anulacion: texto } };
}

const guardar = `
  INSERT INTO gestion (folio, id_evento, accion, resultado, comentario)
  SELECT ?, id_evento, ?, ?, ? FROM evento
  WHERE id_evento = ? AND respaldo_suficiente = 1
  ON CONFLICT (folio) DO NOTHING
  RETURNING folio, id_evento, accion, resultado, comentario, fecha_hora
`;

function responder(datos, status, headers = {}) {
  return Response.json(datos, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

export function crearApi(ejecutar) {
  return async function gestionar(request) {
    if (request.method !== 'POST') {
      return responder({ mensaje: 'Usa POST para registrar una gestión.' }, 405, { Allow: 'POST' });
    }
    const tipo = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
    if (tipo !== 'application/json') {
      return responder({ mensaje: 'El formato debe ser JSON.' }, 415);
    }

    let datos;
    try {
      datos = await request.json();
    } catch {
      return responder({ mensaje: 'No se pudo leer la solicitud.' }, 400);
    }

    const validacion = validarCreacion(datos);
    if (!validacion.ok) {
      const { ok, status, ...cuerpo } = validacion;
      return responder(cuerpo, status);
    }
    const { folio, id_evento, accion, resultado, comentario } = validacion.valores;

    try {
      const [creada] = await ejecutar(guardar, [folio, accion, resultado, comentario, id_evento]);
      if (creada) return responder({ mensaje: 'Gestión registrada.', gestion: creada }, 201);

      const [previa] = await ejecutar(
        'SELECT folio, id_evento, accion, resultado, comentario, fecha_hora FROM gestion WHERE folio = ?', [folio]
      );
      if (previa) {
        if (previa.id_evento === id_evento && previa.accion === accion &&
            previa.resultado === resultado && previa.comentario === comentario) {
          return responder({ mensaje: 'Gestión registrada.', gestion: previa }, 200);
        }
        return responder({ mensaje: 'Ese folio corresponde a otra solicitud.' }, 409);
      }

      const [evento] = await ejecutar('SELECT id_evento FROM evento WHERE id_evento = ?', [id_evento]);
      if (!evento) return responder({ mensaje: 'No se encontró el evento.' }, 404);
      return responder({ mensaje: 'Se requieren antecedentes adicionales para continuar.' }, 409);
    } catch {
      return responder({
        mensaje: 'No pudimos confirmar el guardado. Tus datos siguen en el formulario. Intenta nuevamente.'
      }, 503);
    }
  };
}
