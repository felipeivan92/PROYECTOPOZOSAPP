
import {
  iniciarSesion,
  verificarSesion,
  cerrarSesion
} from '../src/auth.mjs';

import {
  obtenerToken,
  crearCookieSesion,
  eliminarCookieSesion,
  origenPermitido
} from '../src/sesion.mjs';

function responder(datos, status = 200, headers = {}) {
  return Response.json(datos, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      ...headers
    }
  });
}

async function autenticar(request) {

  // Consultar la sesión actual.
  if (request.method === 'GET') {
    const token = obtenerToken(request);
    const resultado = await verificarSesion(token);

    if (!resultado.ok) {
      return responder(
        { mensaje: resultado.mensaje },
        resultado.status
      );
    }

    return responder({
      autenticado: true,
      usuario: resultado.usuario
    });
  }

  // Permitir únicamente GET y POST.
  if (request.method !== 'POST') {
    return responder(
      { mensaje: 'Método no permitido.' },
      405,
      { Allow: 'GET, POST' }
    );
  }

  // Protección contra solicitudes de otros orígenes.
  if (!origenPermitido(request)) {
    return responder(
      { mensaje: 'Origen de solicitud no autorizado.' },
      403
    );
  }

  const tipo = request.headers
    .get('content-type')
    ?.split(';')[0]
    .trim()
    .toLowerCase();

  if (tipo !== 'application/json') {
    return responder(
      { mensaje: 'El formato debe ser JSON.' },
      415
    );
  }

  let datos;

  try {
    datos = await request.json();
  } catch {
    return responder(
      { mensaje: 'Solicitud inválida.' },
      400
    );
  }

  // Inicio de sesión.
  if (datos?.accion === 'login') {
    const resultado = await iniciarSesion(
      datos.email,
      datos.password
    );

    if (!resultado.ok) {
      return responder(
        { mensaje: resultado.mensaje },
        resultado.status
      );
    }

    try {
      const cookie = crearCookieSesion(
        resultado.token,
        resultado.duracion
      );

      return responder(
        { mensaje: 'Sesión iniciada correctamente.' },
        200,
        { 'Set-Cookie': cookie }
      );

    } catch {
      return responder(
        { mensaje: 'No fue posible establecer la sesión.' },
        503
      );
    }
  }

  // Cierre de sesión.
  if (datos?.accion === 'logout') {
    const token = obtenerToken(request);
    const resultado = await cerrarSesion(token);

    return responder(
      {
        mensaje: resultado.ok
          ? 'Sesión cerrada correctamente.'
          : 'Sesión local cerrada. No se pudo confirmar el cierre en Supabase.'
      },
      resultado.ok ? 200 : resultado.status,
      { 'Set-Cookie': eliminarCookieSesion() }
    );
  }

  return responder(
    { mensaje: 'Acción no reconocida.' },
    400
  );
}

export default { fetch: autenticar };
