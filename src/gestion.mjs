import { decisiones } from './public/decisiones.js';

const formatoFolio = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

    const { folio, id_evento, accion, resultado } = datos ?? {};
    const comentario = typeof datos?.comentario === 'string' ? datos.comentario.trim() : '';
    if (typeof folio !== 'string' || !formatoFolio.test(folio) || !Number.isSafeInteger(id_evento) || id_evento < 1) {
      return responder({ mensaje: 'El evento o el folio de la solicitud no es válido.' }, 422);
    }
    if (!decisiones.get(accion)?.includes(resultado)) {
      return responder({ mensaje: 'Selecciona una acción y un resultado compatibles.' }, 422);
    }
    if (!comentario) {
      return responder({ campo: 'comentario', mensaje: 'Escribe por qué tomaste esta decisión.' }, 422);
    }
    if (comentario.length > 300 || comentario.includes('\u0000')) {
      return responder({ campo: 'comentario', mensaje: 'Usa un comentario válido de hasta 300 caracteres.' }, 422);
    }

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
